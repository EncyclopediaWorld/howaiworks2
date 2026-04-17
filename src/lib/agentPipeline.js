import knnCode         from '../demos/knn-section2.js?raw'
import backpropCode    from '../demos/backpropagation-section3.js?raw'
import transformerCode from '../demos/transformer-section7.js?raw'
import pcaCode         from '../demos/pca-section4.js?raw'
import { SPEC as sharedSpec } from './sharedSpec.js'
import { SHARED } from './sharedCode.js'

// ─── LLM providers ────────────────────────────────────────────────────────────

const MODELS = {
  openai:    'gpt-4o-mini',
  anthropic: 'claude-haiku-4-5-20251001',
  gemini:    'gemini-2.0-flash',
}

export async function callLLM(provider, apiKey, messages) {
  if (provider === 'openai')    return _openai(apiKey, messages)
  if (provider === 'anthropic') return _anthropic(apiKey, messages)
  if (provider === 'gemini')    return _gemini(apiKey, messages)
  throw new Error(`Unknown provider: ${provider}`)
}

async function _openai(apiKey, messages) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODELS.openai, messages }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`)
  return (await res.json()).choices[0].message.content
}

async function _anthropic(apiKey, messages) {
  const system   = messages.find(m => m.role === 'system')?.content
  const filtered = messages.filter(m => m.role !== 'system')
  const body     = { model: MODELS.anthropic, max_tokens: 8192, messages: filtered }
  if (system) body.system = system
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`)
  return (await res.json()).content[0].text
}

async function _gemini(apiKey, messages) {
  const system   = messages.find(m => m.role === 'system')?.content
  const filtered = messages.filter(m => m.role !== 'system')
  const contents = filtered.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const body = { contents }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  )
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`)
  return (await res.json()).candidates[0].content.parts[0].text
}

// ─── Agent 1B — Demo design spec ──────────────────────────────────────────────

const AGENT1B_SYSTEM = `\
You are a demo designer for "How AI Works" — an interactive AI education website.

Your job: given a user's question about an AI concept, design an interactive canvas demo that answers it visually.

Output ONLY a single valid JSON object. Do NOT wrap it in markdown fences. No explanation, no extra text.

Here is the JSON schema you MUST follow (do NOT output this block):

\`\`\`json
{
  "concept":  string,   // core idea to visualize — one clear sentence
  "hint":     string,   // exact text passed to addHint() — actionable ("Click…", "Watch…", "Drag…")

  "visual": {
    "main":   string,   // what to draw on canvas and how to divide the space spatially
    "panels": [         // 0–3 info panels drawn ON the canvas (not DOM)
      {
        "zone":    "top-left" | "top-right" | "bottom-bar",
        "content": string   // what data or text to show in this panel
      }
    ]
  },

  "colorMap": {         // semantic name → hex from the palette below
    "<element>": "<hex>"
  },

  "interactions": {
    "animation": "none" | "rAF" | "interval-60" | "interval-120" | "interval-250",
    "shimTouch": boolean,
    "mouse":   array,   // zero or more of: "hover" | "click-add" | "context-menu" | "click-select" | "drag"
    "buttons": [
      {
        "label":    string,
        "type":     "step" | "auto" | "reset" | "fast",
        "interval": number,   // only for type "auto" — milliseconds
        "count":    number    // only for type "fast" — iterations per click
      }
    ],
    "sliders": [
      {
        "label":   string,
        "varName": string,   // JS variable name updated by this slider
        "min":     number,
        "max":     number,
        "default": number
      }
    ]
  }
}
\`\`\`

═══ STRICT RULES ═══

- Every demo MUST have at least a "reset" button
- If animation is "interval-*", add an "auto" button with matching interval
- "click-add" and "context-menu" always appear together (left-click = class 0, right-click = class 1)
- shimTouch must be true if mouse array is non-empty
- Only include panel zones that genuinely add value — do not force all three
- buttons.type and mouse values must be exactly from the enums above — no custom strings
- colorMap values must be hex codes from this palette only:
  #ff6b6b #4ecdc4 #ffd166 #a78bfa #f472b6 #38bdf8 #fb923c #34d399
  #e4e2df #7d7a8c #4a475a #1a1a2e #06060c
- colorMap keys must be camelCase identifiers only — no hyphens, no spaces (e.g. "panelBg" not "panel-bg")

═══ DESIGN PRINCIPLES ═══

- The demo must directly answer the user's question with a visual intuition
- Study the current demo source carefully — reuse its visual elements (color choices, panel layout, data structures) and interaction patterns where appropriate so the new demo feels like a natural extension
- Prefer interactive over static: give the user something to manipulate or explore
- Canvas logical size is 750×340 — plan your spatial layout explicitly in visual.main
- Info panels are drawn on canvas with ctx.roundRect, never as DOM elements
- The hint text should tell the user exactly what to do, not describe the algorithm

═══ SHARED RUNTIME SPEC ═══

${sharedSpec}

═══ REFERENCE DEMOS ═══

The following four demos show the full range of interaction patterns available.
Study them to understand what's possible and how interactions are implemented.

--- knn-section2.js (hover + click-add + context-menu + slider) ---
${knnCode}

--- backpropagation-section3.js (step + auto-train + reset) ---
${backpropCode}

--- transformer-section7.js (click-select) ---
${transformerCode}

--- pca-section4.js (drag) ---
${pcaCode}
`

async function agent1B(provider, apiKey, question, currentDemoCode) {
  const raw = await callLLM(provider, apiKey, [
    { role: 'system', content: AGENT1B_SYSTEM },
    { role: 'user',   content: `CURRENT DEMO SOURCE:\n${currentDemoCode}\n\nUSER QUESTION:\n${question}` },
  ])
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Agent 1B did not return JSON')
  return JSON.parse(match[0])
}

// ─── Agent 1A — Text explanation ──────────────────────────────────────────────

const AGENT1A_SYSTEM = `\
You are an AI tutor for "How AI Works" — an interactive education website.

Given a user's question about an AI concept demo, write a clear and direct explanation that answers it.

Rules:
- 2–4 sentences maximum
- Plain text only — no markdown, no bullet points, no headers
- Focus on intuition, not formulas
- Match the language of the user's question (if they write in Chinese, respond in Chinese)
- If the user's input is a vague instruction rather than a specific question (e.g. "give me a new one", "show me something different", "再来一个"), write a clear explanation of the core concept shown in the current demo instead of asking for clarification
`

async function agent1A(provider, apiKey, question, currentDemoCode) {
  return callLLM(provider, apiKey, [
    { role: 'system', content: AGENT1A_SYSTEM },
    { role: 'user',   content: `DEMO CONTEXT:\n${currentDemoCode}\n\nUSER QUESTION:\n${question}` },
  ])
}

// ─── Agent 2 — Code generation ────────────────────────────────────────────────

function buildAgent2System(currentDemoCode) { return `\
You are a canvas demo programmer for "How AI Works" — an interactive AI education website.

Your job: given a JSON design spec, write the JavaScript code for an interactive canvas demo.

Output ONLY valid JavaScript code. No HTML, no imports, no exports, no markdown fences, no explanation.

The code runs inside an iframe. The following runtime code is already executed before yours:

\`\`\`js
${SHARED}
\`\`\`

All globals defined above (canvas, ctx, W, H, getPos, addControls, addBtn, addHint,
trackPointer, shimPointerToMouse, lerp, clamp, sigmoid, rand, randInt, dist, TAU) are
available directly. CSS classes .btn, .btn.active, .demo-controls, .demo-hint,
and input[type=range] are pre-styled.

═══ SHARED RUNTIME SPEC ═══

${sharedSpec}

═══ HOW TO MAP THE JSON SPEC TO CODE ═══

1. STATE & INIT
   - Declare all state variables at the top
   - Write a reset() function that reinitialises everything to its starting values

2. DRAW FUNCTION
   - Always start with: ctx.clearRect(0, 0, W, H)
   - Draw the main visualization described in spec.visual.main
   - Draw info panels described in spec.visual.panels using ctx.roundRect on canvas
   - Use spec.colorMap for element colors — keys are element names, values are hex colors

3. ANIMATION — map spec.interactions.animation:
   "none"         → no loop, redraw only on events
   "rAF"          → requestAnimationFrame(function loop() { update(); draw(); requestAnimationFrame(loop); })
   "interval-60"  → driven by the Auto button's setInterval(..., 60)
   "interval-120" → driven by the Auto button's setInterval(..., 120)
   "interval-250" → driven by the Auto button's setInterval(..., 250)

4. CONTROLS — always call addControls() first, then buttons in spec order:
   type "step"  → addBtn(label, () => { step(); draw(); })
   type "auto"  → (see toggle pattern below)
   type "reset" → addBtn(label, () => { if(autoTmr){clearInterval(autoTmr);autoTmr=null;autoBtn.classList.remove('active')} reset(); draw(); })
   type "fast"  → addBtn(label, () => { for(let i=0;i<count;i++) step(); draw(); })

   Auto toggle pattern:
   let autoTmr = null;
   const autoBtn = addBtn(label, () => {
     if (autoTmr) { clearInterval(autoTmr); autoTmr = null; autoBtn.classList.remove('active'); }
     else { autoTmr = setInterval(() => { step(); draw(); }, interval); autoBtn.classList.add('active'); }
   });

5. SLIDERS — for each entry in spec.interactions.sliders:
   const lbl = document.createElement('label'); lbl.textContent = label;
   const sl = document.createElement('input'); sl.type='range';
   sl.min=min; sl.max=max; sl.value=default;
   sl.oninput = e => { varName = +e.target.value; draw(); };
   const ctrl = document.querySelector('.demo-controls');
   ctrl.appendChild(lbl); ctrl.appendChild(sl);

6. MOUSE EVENTS — map spec.interactions.mouse values:
   "hover"          → canvas.onmousemove / canvas.onmouseleave using getPos(e)
   "click-add"      → canvas.onclick using getPos(e) — adds class-0 point
   "context-menu"   → canvas.oncontextmenu using getPos(e) — adds class-1 point
   "click-select"   → canvas.onclick using getPos(e) — hit-test canvas elements
   "drag"           → canvas.onmousedown / onmousemove / onmouseup / onmouseleave

   If spec.interactions.shimTouch is true → call shimPointerToMouse(canvas) before setting mouse handlers

7. HINT — call addHint(spec.hint) last, after all controls

═══ CODE QUALITY RULES ═══

- Translate spec.colorMap into a const object at the top of your code: e.g. const COLORS = { background: '#06060c', node: '#4ecdc4' } — never reference "colorMap" as a variable
- Write clean, readable code — meaningful variable names, logical structure
- All canvas text must use "Fira Code" font and colors from the palette in sharedSpec
- Info panels drawn on canvas: rgba(6,6,12,0.9) background, roundRect with radius 8
- Never use DOM elements for info overlays — everything visual goes on the canvas
- All mouse coordinate calculations must use getPos(e) — never manually compute clientX offsets
- The demo must be self-contained: no fetch, no external scripts, no localStorage
- Do NOT mention the JSON spec or its field names in comments or code — just implement it
- Do NOT create placeholder functions or unused variables — only implement what the spec requires
- Do NOT use console.log or any debugging output
- Your output must always end with the initialization sequence:
  reset();
  draw();
  Do NOT wrap these calls in any condition. Do NOT wait for DOMContentLoaded. Do NOT put them inside requestAnimationFrame. Just call them directly at the end of the file.

═══ REFERENCE DEMOS ═══

Study these four complete demos to match code style, variable naming, draw function structure, and state organisation.

--- knn-section2.js ---
${knnCode}

--- backpropagation-section3.js ---
${backpropCode}

--- transformer-section7.js ---
${transformerCode}

--- pca-section4.js ---
${pcaCode}

--- current-demo.js (style reference — match its visual style and code patterns) ---
${currentDemoCode}
` }

async function agent2(provider, apiKey, spec, currentDemoCode) {
  const raw = await callLLM(provider, apiKey, [
    { role: 'system', content: buildAgent2System(currentDemoCode) },
    { role: 'user',   content: `DESIGN SPEC:\n${JSON.stringify(spec, null, 2)}` },
  ])
  return raw.replace(/^```(?:javascript|js)?\s*/i, '').replace(/\s*```$/, '').trim()
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

export async function runPipeline(provider, apiKey, question, currentDemoCode, onStage) {
  onStage('Analyzing…')
  const [explanation, spec] = await Promise.all([
    agent1A(provider, apiKey, question, currentDemoCode),
    agent1B(provider, apiKey, question, currentDemoCode),
  ])

  onStage('Generating code…')
  const code = await agent2(provider, apiKey, spec, currentDemoCode)

  return { explanation, code }
}