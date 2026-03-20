import { createCanvas, addHint } from '/src/lib/shared.js'

let cleanup = null

export function mountAdaline(containerId = 'demo-adaline') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 520)
  addHint(el, "Left-click = Red (class −1), Right-click = Blue (class +1). Watch the smooth gradient descent — compare with Perceptron's discrete jumps above!")
  let pts = [], w1 = 0, w2 = 0, b = 0, lr = 0.15, ep = 0, losses = [], wHist = []
  function nx(px) { return px / 750 }
  function ny(py) { return py / 380 }
  function rawZ(px, py) { return w1 * nx(px) + w2 * ny(py) + b }
  function predict(px, py) { return rawZ(px, py) >= 0 ? 1 : -1 }
  function seed() {
    pts = []
    for (let i = 0; i < 10; i++) { pts.push({ x: rand(40, 310), y: rand(30, 340), c: -1 }); pts.push({ x: rand(440, 710), y: rand(30, 340), c: 1 }) }
    w1 = 0; w2 = 0; b = 0; ep = 0; losses = []; wHist = [{ w1: 0, w2: 0 }]
  }
  seed()
  function trainEpoch() {
    let dw1 = 0, dw2 = 0, db = 0, n = pts.length, totalLoss = 0
    pts.forEach(p => {
      let z = w1 * nx(p.x) + w2 * ny(p.y) + b; let err = p.c - z
      dw1 += err * nx(p.x); dw2 += err * ny(p.y); db += err; totalLoss += err * err
    })
    w1 += lr * 2 * dw1 / n; w2 += lr * 2 * dw2 / n; b += lr * 2 * db / n
    ep++; losses.push(totalLoss / n); wHist.push({ w1, w2 })
    if (losses.length > 100) { losses.shift(); wHist.shift() }
  }
  function draw() {
    ctx.clearRect(0, 0, 750, 520)
    for (let py = 0; py < 380; py += 8) for (let px = 0; px < 750; px += 8) {
      let v = rawZ(px, py)
      ctx.fillStyle = v >= 0 ? 'rgba(56,189,248,0.06)' : 'rgba(255,107,107,0.06)'
      ctx.fillRect(px, py, 8, 8)
    }
    if (Math.abs(w2) > 1e-8) {
      ctx.save(); ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 12; ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2.5; ctx.beginPath()
      let y0 = -(w1 * nx(0) + b) / w2 * 380, y1 = -(w1 * nx(750) + b) / w2 * 380
      ctx.moveTo(0, y0); ctx.lineTo(750, y1)
      ctx.stroke(); ctx.restore()
    }
    pts.forEach(p => {
      let pred = predict(p.x, p.y), wrong = pred !== p.c
      ctx.save(); if (!wrong) { ctx.shadowColor = p.c === 1 ? '#38bdf8' : '#ff6b6b'; ctx.shadowBlur = 8 }
      ctx.beginPath(); ctx.arc(p.x, p.y, wrong ? 9 : 7, 0, Math.PI * 2); ctx.fillStyle = p.c === 1 ? '#38bdf8' : '#ff6b6b'; ctx.fill()
      if (wrong) { ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.stroke() }
      ctx.restore()
    })
    ctx.fillStyle = 'rgba(6,6,12,.9)'; ctx.beginPath(); ctx.roundRect(8, 8, 240, 60, 8); ctx.fill()
    ctx.fillStyle = '#ffd166'; ctx.font = '700 12px Fira Code'; ctx.fillText('Epoch ' + ep, 18, 28)
    ctx.fillStyle = '#34d399'; ctx.font = '600 12px Fira Code'; ctx.fillText('Loss: ' + (losses[losses.length - 1] || 0).toFixed(2), 100, 28)
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
    ctx.fillText('w₁=' + w1.toFixed(3) + ' w₂=' + w2.toFixed(3) + ' b=' + b.toFixed(3), 18, 48)
    ctx.fillText('lr=' + lr, 18, 62)
    if (losses.length > 1) {
      let cx2 = 560, cy2 = 8
      ctx.fillStyle = 'rgba(6,6,12,.9)'; ctx.beginPath(); ctx.roundRect(cx2, cy2, 182, 65, 8); ctx.fill()
      ctx.fillStyle = '#ff6b6b'; ctx.font = '500 9px Fira Code'; ctx.fillText('Loss over epochs:', cx2 + 8, cy2 + 16)
      let mx = Math.max(...losses, 1); ctx.strokeStyle = '#ff6b6b'; ctx.lineWidth = 1.5; ctx.beginPath()
      losses.forEach((e, i) => { let x = cx2 + 8 + i * (164 / 100), y = cy2 + 60 - (e / mx) * 38; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y) }); ctx.stroke()
      ctx.fillStyle = '#34d399'; ctx.font = '700 9px Fira Code'; ctx.fillText('→ ' + (losses[losses.length - 1] || 0).toFixed(2), cx2 + 155, cy2 + 58)
    }
    ctx.fillStyle = 'rgba(6,6,12,.85)'; ctx.beginPath(); ctx.roundRect(8, 480, 500, 34, 6); ctx.fill()
    ctx.fillStyle = '#ffd166'; ctx.font = '500 9px Fira Code';
    ctx.fillText('Adaline: Δw = η(target − z)·x (gradient descent)', 18, 501)
    ctx.fillStyle = '#7d7a8c'; ctx.fillText('Smooth convergence, unlike Perceptron!', 18, 515)
  }
  c.onclick = e => { let r = c.getBoundingClientRect(); pts.push({ x: (e.clientX - r.left) * 750 / r.width, y: (e.clientY - r.top) * 380 / r.height, c: -1 }); draw() }
  c.oncontextmenu = e => { e.preventDefault(); let r = c.getBoundingClientRect(); pts.push({ x: (e.clientX - r.left) * 750 / r.width, y: (e.clientY - r.top) * 380 / r.height, c: 1 }); draw() }
  const ctrl = document.createElement('div'); ctrl.className = 'demo-controls'; el.appendChild(ctrl)
  const tb = document.createElement('button'); tb.className = 'btn'; tb.textContent = '▶ Train ×10'; tb.onclick = () => { for (let i = 0; i < 10; i++) trainEpoch(); draw() }
  let tmr = null; const ab = document.createElement('button'); ab.className = 'btn'; ab.textContent = '⏩ Auto Train'; ab.onclick = () => { if (tmr) { clearInterval(tmr); tmr = null; ab.classList.remove('active') } else { tmr = setInterval(() => { trainEpoch(); draw() }, 60); ab.classList.add('active') } }
  const rst = document.createElement('button'); rst.className = 'btn'; rst.textContent = '↻ Reset'; rst.onclick = () => { seed(); if (tmr) { clearInterval(tmr); tmr = null; ab.classList.remove('active') } draw() }
  ctrl.appendChild(tb); ctrl.appendChild(ab); ctrl.appendChild(rst); draw()
  cleanup = () => { try { c.onclick = null; c.oncontextmenu = null; if (tmr) clearInterval(tmr); el.innerHTML = '' } catch (e) { } }
  return cleanup
}

export function unmountAdaline() { if (cleanup) cleanup() }

export default { mountAdaline, unmountAdaline }
