import { getProvider, getApiKey } from './apiKey.js'
import { getDemoSource, getRandomDemoSources } from './demoSources.js'

// ── LLM Dispatchers ───────────────────────────────────────────────────────────

async function callOpenAI(messages, maxTokens, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.5, max_tokens: maxTokens }),
  })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error?.message || `OpenAI ${res.status}`) }
  return (await res.json()).choices[0].message.content.trim()
}

async function callAnthropic(messages, maxTokens, apiKey) {
  const system = messages.find(m => m.role === 'system')?.content || ''
  const msgs   = messages.filter(m => m.role !== 'system')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({ model: 'claude-3-5-haiku-20241022', max_tokens: maxTokens, system, messages: msgs }),
  })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error?.message || `Anthropic ${res.status}`) }
  return (await res.json()).content[0].text.trim()
}

async function callGemini(messages, maxTokens, apiKey) {
  const systemText = messages.find(m => m.role === 'system')?.content || ''
  const contents   = messages
    .filter(m => m.role !== 'system')
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
  const body = {
    contents,
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.5 },
    ...(systemText ? { system_instruction: { parts: [{ text: systemText }] } } : {}),
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error?.message || `Gemini ${res.status}`) }
  return (await res.json()).candidates[0].content.parts[0].text.trim()
}

async function callLLM(messages, maxTokens = 300) {
  const provider = getProvider()
  const apiKey   = getApiKey(provider)
  if (!apiKey) throw new Error('NO_API_KEY')
  if (provider === 'openai')    return callOpenAI(messages, maxTokens, apiKey)
  if (provider === 'anthropic') return callAnthropic(messages, maxTokens, apiKey)
  if (provider === 'gemini')    return callGemini(messages, maxTokens, apiKey)
  throw new Error(`Unknown provider: ${provider}`)
}

// ── stripDemoCode ─────────────────────────────────────────────────────────────
// Removes ESM boilerplate from fixed demo files so agents only see pure logic.

export function stripDemoCode(raw) {
  // Remove all import lines
  let code = raw.replace(/^import\s+.*$/gm, '')
  // Extract body inside "export function mountXxx(...) { ... }"
  const match = code.match(/export\s+function\s+\w+[^{]*\{([\s\S]*)\}$/)
  if (match) code = match[1]
  // Remove trailing cleanup: "return () => { ... }"
  code = code.replace(/\s*return\s*\(\s*\)\s*=>\s*\{[\s\S]*?\}\s*;?\s*$/, '')
  return code.trim()
}

// ── Agent 1: Intent Analyzer ──────────────────────────────────────────────────
// Reads the user's question + the stripped corresponding demo code.
// Outputs a single sentence describing what the new demo should highlight.

async function analyzeIntent(demoName, strippedDemoCode, userQuestion) {
  return callLLM([
    {
      role: 'system',
      content: `You are an AI education expert. You will be given an interactive canvas demo's source code and a user's question about it.
Identify in ONE concise English sentence what the new demo should emphasize or do to best address the user's question.
If the user asks for a new/different version, say what variation would be most instructive.`,
    },
    {
      role: 'user',
      content: `Demo name: "${demoName}"

Demo source code:
\`\`\`js
${strippedDemoCode}
\`\`\`

User question: ${userQuestion}`,
    },
  ], 150)
}

// ── Agent 2: Code Generator ───────────────────────────────────────────────────
// Reads intent from Agent 1 + 4 stripped reference demos.
// Generates self-contained canvas JS for the iframe sandbox.

async function generateCode(demoName, intent, strippedReferenceCodes) {
  const refBlock = strippedReferenceCodes
    .map((code, i) => `// Reference demo ${i + 1}:\n${code}`)
    .join('\n\n')

  return callLLM([
    {
      role: 'system',
      content: `You are an expert JavaScript canvas programmer creating educational AI visualizations.

ENVIRONMENT — already declared in scope, do NOT redeclare:
  canvas (750×300), ctx, W=750, H=300
  lerp(a,b,t)  clamp(v,lo,hi)  sigmoid(x)  rand(a,b)  randInt(a,b)  dist(x1,y1,x2,y2)  TAU
  addBtn(label, onClick)   ← appends a styled button below the canvas
  showHint(text)           ← displays a static one-time hint below the canvas (do NOT call inside event listeners or animation loops)

CRITICAL — do NOT do any of the following (already handled by setup):
  • Do NOT set canvas.width or canvas.height — resetting them clears the canvas and breaks rendering
  • Do NOT call document.getElementById or create a new canvas element
  • Do NOT redeclare canvas, ctx, W, or H with const/let/var
  • All drawn points, lines, and shapes MUST stay within canvas bounds (0 ≤ x ≤ W, 0 ≤ y ≤ H) — use clamp(value, 0, W) or clamp(value, 0, H) to enforce this

VISUAL STYLE (match the reference demos exactly):
  • Background: clear each frame with ctx.fillStyle='#06060c'; ctx.fillRect(0,0,W,H)
  • Palette: #ff6b6b  #4ecdc4  #ffd166  #a78bfa  #f472b6  #38bdf8
  • Labels: ctx.fillStyle='#e4e2df'; ctx.font='600 11px Courier New'
  • Glow: ctx.shadowBlur=8; ctx.shadowColor=<color>  then reset ctx.shadowBlur=0

REQUIRED ELEMENTS (every demo must have all three):
  1. At least one button via addBtn() — e.g. Reset, Randomize
  2. Mouse interaction on the canvas (mousemove or click)
  3. A semi-transparent info panel showing relevant math/stats — use ctx.fillStyle with rgba and ctx.roundRect

OUTPUT: Return ONLY runnable JavaScript. No markdown fences. No import/export. No wrapping function. Code runs directly.`,
    },
    {
      role: 'user',
      content: `Concept: "${demoName}"
Goal: ${intent}

Study these reference demos carefully for code style and quality, then write a new demo:

${refBlock}

Now generate the new demo code:`,
    },
  ], 2200)
}

// ── Agent 3: Explanation Writer ───────────────────────────────────────────────
// Reads user question + demo text/formula only (runs in parallel with Agent 2).
// Replies in the same language as the user's question.

async function generateExplanation(demoName, demoText, demoFormula, userQuestion) {
  return callLLM([
    {
      role: 'system',
      content: `You are a friendly AI tutor. Answer the user's question about the given concept clearly and concisely (2-4 sentences).
Reply in the SAME language the user used. Do not use markdown. Do not mention code.`,
    },
    {
      role: 'user',
      content: `Concept: "${demoName}"
Description: ${demoText}${demoFormula ? `\nFormula: ${demoFormula}` : ''}

User question: ${userQuestion}`,
    },
  ], 200)
}

// ── stripMarkdownFences ───────────────────────────────────────────────────────
// LLMs sometimes wrap output in ```js ... ``` despite instructions.
// Strip any markdown code fences before injecting into the iframe.

function stripMarkdownFences(code) {
  return code
    .replace(/^```(?:javascript|js)?\s*\n?/i, '')
    .replace(/\n?```\s*$/,  '')
    .trim()
}

// ── Agent 4: Safety Reviewer ──────────────────────────────────────────────────
// Strips dangerous browser APIs before the code runs in the iframe sandbox.

async function reviewSafety(code) {
  return callLLM([
    {
      role: 'system',
      content: `Security reviewer. Remove any calls to: fetch, XMLHttpRequest, WebSocket, eval, Function(), document.cookie, localStorage, sessionStorage, window.location, window.open, import(), require(), Worker, SharedArrayBuffer, Atomics. Make NO other changes. Return ONLY the cleaned code — zero explanation.`,
    },
    {
      role: 'user',
      content: code,
    },
  ], 2400)
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function runAgentPipeline(
  { demoName, demoText, demoFormula, demoFile, userQuestion },
  onStage
) {
  // Load and strip the corresponding demo + 3 random reference demos
  const correspondingRaw = getDemoSource(demoFile)
  const randomRaws       = getRandomDemoSources(demoFile)

  const strippedMain = correspondingRaw ? stripDemoCode(correspondingRaw) : ''
  const strippedRefs = [
    ...(correspondingRaw ? [strippedMain] : []),
    ...randomRaws.map(stripDemoCode),
  ]

  // Agent 1 — analyze intent
  onStage?.('analyzing')
  const intent = await analyzeIntent(demoName, strippedMain, userQuestion)

  // Agent 2 + Agent 3 — run in parallel
  onStage?.('generating')
  const [rawCode, explanation] = await Promise.all([
    generateCode(demoName, intent, strippedRefs),
    generateExplanation(demoName, demoText, demoFormula, userQuestion),
  ])

  // Safety review on generated code
  onStage?.('reviewing')
  const safeCode = await reviewSafety(stripMarkdownFences(rawCode))

  return { explanation, code: stripMarkdownFences(safeCode) }
}
