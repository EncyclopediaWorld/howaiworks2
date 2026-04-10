import { getProvider, getApiKey } from './apiKey.js'

// ── OpenAI (GPT-4o mini) ─────────────────────────────────────────────
async function callOpenAI(messages, maxTokens, apiKey) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.5, max_tokens: maxTokens }),
  })
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b?.error?.message || `OpenAI ${res.status}`) }
  return (await res.json()).choices[0].message.content.trim()
}

// ── Anthropic (claude-3.5-haiku) ─────────────────────────────────────────
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

// ── Gemini (gemini-2.0-flash) ───────────────────────────────────────────
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

// ── Dispatcher ────────────────────────────────────────────────────────────────
async function callLLM(messages, maxTokens = 300) {
  const provider = getProvider()
  const apiKey   = getApiKey(provider)
  if (!apiKey) throw new Error('NO_API_KEY')
  if (provider === 'openai')    return callOpenAI(messages, maxTokens, apiKey)
  if (provider === 'anthropic') return callAnthropic(messages, maxTokens, apiKey)
  if (provider === 'gemini')    return callGemini(messages, maxTokens, apiKey)
  throw new Error(`Unknown provider: ${provider}`)
}

// ── Agent 1: Intent Analyzer ──────────────────────────────────────────────────
// Reads the user's question in context of the demo and extracts the core confusion.
async function analyzeIntent(demoName, demoText, demoFormula, userQuestion) {
  return callLLM([
    {
      role: 'system',
      content: `You are an AI education expert. Given an interactive demo and a user's question, identify the user's core confusion in ONE concise sentence. Reply in the same language as the user's question.`,
    },
    {
      role: 'user',
      content: `Demo: "${demoName}"\nDescription: ${demoText}${demoFormula ? `\nFormula: ${demoFormula}` : ''}\nUser question: ${userQuestion}`,
    },
  ], 120)
}

// ── Agent 2: Pedagogy Planner ─────────────────────────────────────────────────
// Decides what canvas animation would best clarify the identified confusion.
async function planVisualization(demoName, confusion) {
  return callLLM([
    {
      role: 'system',
      content: `You are an expert at designing visual explanations for machine learning. In 2-3 sentences describe a specific canvas animation that clarifies this confusion. Be concrete — what exactly to draw, what to animate, what labels to show. Reply in English.`,
    },
    {
      role: 'user',
      content: `Demo: "${demoName}"\nUser confusion: ${confusion}`,
    },
  ], 200)
}

// ── Agent 3: Code Generator ───────────────────────────────────────────────────
// Generates self-contained canvas JS following the site's visual style.
async function generateCode(demoName, confusion, plan) {
  return callLLM([
    {
      role: 'system',
      content: `You are an expert JavaScript canvas programmer creating educational AI visualizations.

ENVIRONMENT — already in scope, do NOT redeclare:
  canvas  → HTMLCanvasElement (W×H filled during setup)
  ctx     → CanvasRenderingContext2D
  W, H    → canvas dimensions (e.g. 700 × 320)
  Helpers → lerp(a,b,t)  clamp(v,lo,hi)  sigmoid(x)  rand(a,b)  randInt(a,b)  dist(x1,y1,x2,y2)  TAU

VISUAL STYLE:
  • Background is already #06060c — clear it each frame with ctx.fillStyle='#06060c'; ctx.fillRect(0,0,W,H)
  • Palette: #ff6b6b  #4ecdc4  #ffd166  #a78bfa  #f472b6  #38bdf8
  • Labels: ctx.fillStyle='#e4e2df'; ctx.font='600 11px Courier New'
  • Use glow: ctx.shadowBlur=8; ctx.shadowColor=<color>  (reset after: ctx.shadowBlur=0)

REQUIREMENTS:
  • Use requestAnimationFrame for animation
  • Add at least one interactive element (mousemove or click on canvas)
  • Draw descriptive on-canvas labels that explain what is shown
  • Keep under 90 lines, clean and readable

OUTPUT: Return ONLY runnable JavaScript. No markdown fences. No wrapping function. Code runs directly.`,
    },
    {
      role: 'user',
      content: `Concept: "${demoName}"\nUser confusion: ${confusion}\nVisualization plan: ${plan}\n\nGenerate the code:`,
    },
  ], 1800)
}

// ── Agent 4: Safety Reviewer ──────────────────────────────────────────────────
// Strips any dangerous browser APIs before the code runs in the iframe sandbox.
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
  ], 2000)
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function runAgentPipeline(
  { demoName, demoText, demoFormula, userQuestion },
  onStage  // callback(stageName) called before each agent
) {
  onStage?.('analyzing')
  const confusion = await analyzeIntent(demoName, demoText, demoFormula, userQuestion)

  onStage?.('planning')
  const plan = await planVisualization(demoName, confusion)

  onStage?.('generating')
  const rawCode = await generateCode(demoName, confusion, plan)

  onStage?.('reviewing')
  const safeCode = await reviewSafety(rawCode)

  return { confusion, plan, code: safeCode }
}
