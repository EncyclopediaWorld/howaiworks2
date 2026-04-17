# Shared Runtime Spec — AI Demo Canvas

This document describes every global, utility, and convention available inside AI-generated demo iframes.
Agent 1 reads this to design demos. Agent 2 reads this to write code.

---

## 1. Canvas & Coordinate System

```
Logical drawing space: W = 750, H = 340  (always use these constants for coordinates)
Visual size: responsive — canvas fills its container width, height scales proportionally
HiDPI: canvas backing store is scaled by devicePixelRatio automatically — drawing code is unaffected
```

- All `ctx` drawing calls use the **logical coordinate space** (0–750 × 0–340).
- The browser handles visual scaling automatically; never use screen pixels directly.
- Pre-created globals: `canvas`, `ctx`, `W`, `H` — do not re-create them.
- Canvas background is pre-filled with `#06060c`. Clear with `ctx.clearRect(0, 0, W, H)` at the start of every draw call.

---

## 2. Color Palette

All demos share this dark-mode palette. Use colors semantically — don't pick arbitrarily.

| Hex | Semantic use |
|-----|--------------|
| `#06060c` | canvas background, deep fill |
| `rgba(6,6,12,0.9)` | info panel backgrounds |
| `#e4e2df` | primary labels, node text |
| `#7d7a8c` | secondary labels, descriptions |
| `#4a475a` | inactive/disabled elements |
| `#ff6b6b` | errors, negative values, class 0, loss |
| `#4ecdc4` | primary accent, highlights, class 1 |
| `#ffd166` | key labels, agent marker, panel titles |
| `#a78bfa` | secondary features, gates, purple accent |
| `#f472b6` | generator, style features, pink accent |
| `#38bdf8` | data points, input layer, queries |
| `#fb923c` | attention weights, exploration rate |
| `#34d399` | goal, positive outcome, convergence |
| `#1e1e32` | subtle borders |
| `#1a1a2e` | walls, inactive nodes, dark cell fills |

For transparent fills append hex alpha: `'#4ecdc422'` (low opacity), `'#ff6b6b55'` (medium).

---

## 3. Typography

Font is always **`Fira Code`** (monospace). Never use other fonts.

| Size | Weight | Use |
|------|--------|-----|
| `7px` | 400 | tiny grid cell values, axis tick labels |
| `8px` | 400 | secondary descriptions inside panels |
| `9px` | 400–500 | standard body text, hints, formulas |
| `10px` | 500–600 | regular labels, field names |
| `11–12px` | 700 | panel titles, section headers |
| `14px` | 700 | large node text, prominent values |

Always reset `ctx.textAlign = 'left'` after using `'center'` or `'right'`.

---

## 4. Available Globals

```js
W, H          // logical canvas dimensions (750, 340)
canvas        // the HTMLCanvasElement
ctx           // CanvasRenderingContext2D (already HiDPI-scaled)
TAU           // Math.PI * 2

// Math helpers
lerp(a, b, t)            // linear interpolate
clamp(v, lo, hi)         // clamp to range
sigmoid(x)               // 1 / (1 + e^-x)
rand(a, b)               // random float in [a, b)
randInt(a, b)            // random integer in [a, b)
dist(x1, y1, x2, y2)     // Euclidean distance
```

---

## 5. Helper Functions

### `getPos(e)` — pointer/touch → logical coordinates
```js
canvas.onmousemove = e => {
  const { x, y } = getPos(e);
  // x ∈ [0, W], y ∈ [0, H]
};
canvas.ontouchstart = e => { e.preventDefault(); const { x, y } = getPos(e); };
```
Always use `getPos` for any pointer interaction. Never manually compute `e.clientX - rect.left`.

---

### `trackPointer()` — live pointer state for animation loops
```js
const ptr = trackPointer();

function loop() {
  if (ptr.down) { /* drag behavior */ }
  if (ptr.x > 0) { /* hover behavior */ }
  draw();
  requestAnimationFrame(loop);
}
```
Returns `{ x, y, down }` — values update automatically via pointer events.
Use this when you need to read pointer state inside `requestAnimationFrame` loops.
Use `getPos(e)` for event-driven interactions (onclick, onmousemove handlers).

---

### `shimPointerToMouse(canvas)` — touch → mouse event translation
```js
shimPointerToMouse(canvas);
// Now canvas.onclick / onmousemove / onmousedown work on touch devices too
```
Call this once at setup if your interaction code uses mouse events (`onclick`, `onmousemove`, etc.).
Not needed if you use pointer events or `trackPointer()`.

---

### `addControls()` — creates the controls bar below the canvas
```js
addControls(); // call once before any addBtn() calls
```
Creates a `.demo-controls` flex container appended to the body.
Must be called before `addBtn()` to ensure buttons appear inside the styled bar.
Returns the div element if you need to append custom DOM.

---

### `addBtn(label, onClick)` — styled button in the controls bar
```js
addControls();
addBtn('▶ Train', () => { trainStep(); draw(); });

// Toggle active state (e.g. Auto button):
const autoBtn = addBtn('⏩ Auto', () => {
  running = !running;
  autoBtn.classList.toggle('active');
});
```
Returns the button element. Appends to controls bar if `addControls()` was called, otherwise to body.
Use `.classList.toggle('active')` for toggle buttons — `.btn.active` turns the button teal.

---

### `addHint(text)` — one-time hint line below the controls bar
```js
addHint('Left-click to add red points, right-click to add blue points.');
```
Call once at setup. Creates a `.demo-hint` styled line.

---

## 6. CSS Classes Available

Because the iframe has the shared stylesheet injected, you can use these classes directly:

| Class | Use |
|-------|-----|
| `.btn` | styled button (dark bg, monospace, hover teal) |
| `.btn.active` | active/toggled button (teal bg) |
| `.demo-controls` | flex controls bar (created by `addControls()`) |
| `.demo-hint` | small dim hint text |

For sliders, create `input[type=range]` — it's pre-styled with the teal thumb:
```js
const slider = document.createElement('input');
slider.type = 'range'; slider.min = '1'; slider.max = '10'; slider.value = '3';
slider.oninput = e => { k = +e.target.value; draw(); };
(_controls || document.body).appendChild(slider);
```

---

## 7. Info Panel Convention

Info panels are drawn **directly on the canvas** using `ctx.roundRect` — never use DOM overlays.

```js
// Background
ctx.fillStyle = 'rgba(6,6,12,0.9)';
ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill();

// Title
ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code';
ctx.fillText('Panel Title', x+10, y+18);

// Body text
ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
ctx.fillText('description here', x+10, y+34);
```

**Layout zones** (typical placement):
- **Top-left** `(8, 8, ~240, ~65)` — live stats (epoch, loss, current values)
- **Top-right** `(~520, 8, ~224, ~160)` — explanation panel, formula, legend
- **Bottom bar** `(15, ~290, 720, ~42)` — algorithm rule, key insight, formula summary

---

## 8. Progress Bar Convention

```js
const BX = 10, BY = 130, BW = 200, BH = 12;
// Track
ctx.fillStyle = 'rgba(255,255,255,0.06)';
ctx.beginPath(); ctx.roundRect(BX, BY, BW, BH, 4); ctx.fill();
// Fill
ctx.fillStyle = '#4ecdc4';
ctx.beginPath(); ctx.roundRect(BX, BY, BW * fraction, BH, 4); ctx.fill();
// Label
ctx.fillStyle = '#e4e2df'; ctx.font = '600 8px Fira Code';
ctx.fillText((fraction * 100).toFixed(0) + '%', BX + 4, BY + BH - 2);
```

For gradient bars (negative → positive):
```js
const grad = ctx.createLinearGradient(BX, 0, BX+BW, 0);
grad.addColorStop(0, '#ff6b6b');
grad.addColorStop(0.5, '#ffd166');
grad.addColorStop(1, '#34d399');
ctx.fillStyle = grad;
```

---

## 9. Button Patterns

### Step + Auto + Reset (most common)
```js
addControls();
addBtn('▶ Step', () => { step(); draw(); });

let tmr = null;
const autoBtn = addBtn('⏩ Auto', () => {
  if (tmr) { clearInterval(tmr); tmr = null; autoBtn.classList.remove('active'); }
  else { tmr = setInterval(() => { step(); draw(); }, 60); autoBtn.classList.add('active'); }
});

addBtn('↻ Reset', () => {
  if (tmr) { clearInterval(tmr); tmr = null; autoBtn.classList.remove('active'); }
  // reset state...
  draw();
});
```
Interval speed guide: `60ms` (fast training), `120ms` (medium), `250–500ms` (slow/visible steps).

### Fast-train button
```js
addBtn('⚡ Train 500', () => { for (let i = 0; i < 500; i++) step(); draw(); });
```

---

## 10. Mouse Interaction Patterns

### Hover (live prediction / highlight)
```js
let mx = -1, my = -1;
canvas.onmousemove = e => { const p = getPos(e); mx = p.x; my = p.y; draw(); };
canvas.onmouseleave = () => { mx = -1; my = -1; draw(); };
// In draw(): if (mx > 0) { /* draw hover state */ }
```

### Click to add data points
```js
shimPointerToMouse(canvas); // enable touch support
canvas.onclick = e => {
  const { x, y } = getPos(e);
  points.push({ x, y, cls: 0 });
  draw();
};
canvas.oncontextmenu = e => {
  e.preventDefault();
  const { x, y } = getPos(e);
  points.push({ x, y, cls: 1 });
  draw();
};
```

### Click to select / switch state
```js
shimPointerToMouse(canvas);
canvas.onclick = e => {
  const { x, y } = getPos(e);
  items.forEach((item, i) => {
    if (x >= item.x && x <= item.x+item.w && y >= item.y && y <= item.y+item.h) {
      selected = i; draw();
    }
  });
};
```

### Drag
```js
let dragging = false;
canvas.onmousedown = e => { const p = getPos(e); if (nearHandle(p)) dragging = true; };
canvas.onmousemove = e => { if (!dragging) return; updateHandle(getPos(e)); draw(); };
canvas.onmouseup   = () => { dragging = false; };
canvas.onmouseleave = () => { dragging = false; };
```

---

## 11. Animation Loop Pattern

For continuous animations (particles, live simulations):
```js
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
```

For step-driven demos (training), prefer `setInterval` over `requestAnimationFrame` — predictable step rates.

---

## 12. Canvas Drawing Quick Reference

```js
// Glow effect
ctx.save();
ctx.shadowColor = '#4ecdc4'; ctx.shadowBlur = 12;
// ...draw...
ctx.restore();

// Dashed line
ctx.setLineDash([5, 4]);
// ...stroke...
ctx.setLineDash([]);

// Rounded rectangle (polyfill included)
ctx.beginPath(); ctx.roundRect(x, y, w, h, radius); ctx.fill();

// Arc / circle
ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill();

// Mini line chart (loss / reward history)
ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 1.5; ctx.beginPath();
history.forEach((v, i) => {
  const px = chartX + i * (chartW / history.length);
  const py = chartY + chartH - (v / maxVal) * chartH;
  i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
});
ctx.stroke();
```