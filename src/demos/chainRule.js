import { createCanvas, addHint, addControls, TAU } from '/src/lib/shared.js'

let cleanup = null

export function mountChainRule(containerId = 'demo-chain') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 400)
  addHint(el, 'Adjust x with the slider, then click "Forward Pass" and "Backward Pass" to see gradients flow step by step!')
  let x = 2.0, phase = 'idle', fwdStep = -1, bwdStep = -1
  function compute(x) {
    let v_x = x, v_sq = x * x, v_sin = Math.sin(x), v_add = v_sq + v_sin, v_L = v_add * v_add
    let dL = 1, d_add = 2 * v_add, d_sq = d_add, d_sin = d_add
    let dx = d_sq * 2 * x + d_sin * Math.cos(x)
    return { v_x, v_sq, v_sin, v_add, v_L, dL, d_add, d_sq, d_sin, dx, local_sq: 2 * x, local_sin: Math.cos(x) }
  }
  const nodes = [
    { id: 'x', label: 'x', fx: 80, fy: 170, c: '#ffd166' },
    { id: 'sq', label: 'x²', fx: 250, fy: 90, c: '#38bdf8' },
    { id: 'sin', label: 'sin(x)', fx: 250, fy: 250, c: '#a78bfa' },
    { id: 'add', label: 'x²+sin(x)', fx: 460, fy: 170, c: '#4ecdc4' },
    { id: 'L', label: 'L = (...)²', fx: 650, fy: 170, c: '#ff6b6b' }
  ]
  const edges = [
    { from: 0, to: 1, getLocal: v => v.local_sq }, { from: 0, to: 2, getLocal: v => v.local_sin },
    { from: 1, to: 3, getLocal: () => 1 }, { from: 2, to: 3, getLocal: () => 1 },
    { from: 3, to: 4, getLocal: v => 2 * v.v_add }
  ]
  const fwdOrder = [[0], [1, 2], [3], [4]], bwdOrder = [[4], [3], [1, 2], [0]]
  function doForward() {
    phase = 'fwd'; fwdStep = 0; bwdStep = -1
    let iv = setInterval(() => { fwdStep++; draw(); if (fwdStep >= fwdOrder.length) { clearInterval(iv); phase = 'fwd-done' } }, 500)
  }
  function doBackward() {
    if (phase !== 'fwd-done') return; phase = 'bwd'; bwdStep = 0
    let iv = setInterval(() => { bwdStep++; draw(); if (bwdStep >= bwdOrder.length) { clearInterval(iv); phase = 'bwd-done' } }, 500)
  }
  function draw() {
    ctx.clearRect(0, 0, 750, 400)
    let v = compute(x)
    let vals = [v.v_x, v.v_sq, v.v_sin, v.v_add, v.v_L]
    let grads = [v.dx, v.d_sq, v.d_sin, v.d_add, v.dL]
    let fwdLit = new Set(), bwdLit = new Set()
    if (phase === 'fwd' || phase === 'fwd-done' || phase === 'bwd' || phase === 'bwd-done') {
      for (let i = 0; i <= Math.min(fwdStep, fwdOrder.length - 1); i++) fwdOrder[i].forEach(n => fwdLit.add(n))
      if (phase !== 'fwd') fwdOrder.flat().forEach(n => fwdLit.add(n))
    }
    if (phase === 'bwd' || phase === 'bwd-done') {
      for (let i = 0; i <= Math.min(bwdStep, bwdOrder.length - 1); i++) bwdOrder[i].forEach(n => bwdLit.add(n))
      if (phase === 'bwd-done') bwdOrder.flat().forEach(n => bwdLit.add(n))
    }
    // Edges
    edges.forEach(e => {
      let f = nodes[e.from], t = nodes[e.to]
      let dx2 = t.fx - f.fx, dy = t.fy - f.fy, len = Math.hypot(dx2, dy)
      let sx = f.fx + 28 * dx2 / len, sy = f.fy + 28 * dy / len, ex = t.fx - 28 * dx2 / len, ey = t.fy - 28 * dy / len
      // Forward line
      ctx.strokeStyle = fwdLit.has(e.to) ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.06)'
      ctx.lineWidth = fwdLit.has(e.to) ? 2.5 : 1; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()
      if (fwdLit.has(e.to)) {
        let ang = Math.atan2(dy, dx2)
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.moveTo(ex, ey)
        ctx.lineTo(ex - 9 * Math.cos(ang - .3), ey - 9 * Math.sin(ang - .3))
        ctx.lineTo(ex - 9 * Math.cos(ang + .3), ey - 9 * Math.sin(ang + .3)); ctx.fill()
      }
      // Local derivative label
      let lmx = (sx + ex) / 2, lmy = (sy + ey) / 2 - 12
      ctx.fillStyle = '#555'; ctx.font = '400 8px Fira Code'; ctx.textAlign = 'center'
      ctx.fillText('local: ' + e.getLocal(v).toFixed(2), lmx, lmy)
      // Backward line
      if (bwdLit.has(e.from)) {
        ctx.strokeStyle = 'rgba(255,107,107,.5)'; ctx.lineWidth = 2.5; ctx.setLineDash([5, 4])
        ctx.beginPath(); ctx.moveTo(ex, ey + 5); ctx.lineTo(sx, sy + 5); ctx.stroke(); ctx.setLineDash([])
        ctx.fillStyle = '#ff6b6b'; ctx.font = '500 8px Fira Code'
        ctx.fillText('← ' + (grads[e.to] * e.getLocal(v)).toFixed(2), lmx, lmy + 26)
      }
      ctx.textAlign = 'left'
    })
    // Nodes
    nodes.forEach((n, i) => {
      let isFwd = fwdLit.has(i), isBwd = bwdLit.has(i)
      ctx.save(); if (isBwd) { ctx.shadowColor = '#ff6b6b'; ctx.shadowBlur = 16 }
      else if (isFwd) { ctx.shadowColor = n.c; ctx.shadowBlur = 14 }
      ctx.beginPath(); ctx.arc(n.fx, n.fy, 28, 0, TAU)
      ctx.fillStyle = isFwd ? n.c + '33' : '#111120'; ctx.fill()
      ctx.strokeStyle = isFwd ? n.c : n.c + '44'; ctx.lineWidth = isFwd ? 2.5 : 1; ctx.stroke(); ctx.restore()
      ctx.fillStyle = isFwd ? '#e4e2df' : '#4a475a'; ctx.font = '600 10px Fira Code'; ctx.textAlign = 'center'
      ctx.fillText(n.label, n.fx, n.fy - 3)
      if (isFwd) { ctx.fillStyle = n.c; ctx.font = '500 9px Fira Code'; ctx.fillText(vals[i].toFixed(3), n.fx, n.fy + 14) }
      if (isBwd) { ctx.fillStyle = '#ff6b6b'; ctx.font = '600 9px Fira Code'; ctx.fillText('∂L/∂=' + grads[i].toFixed(2), n.fx, n.fy + 44) }
      ctx.textAlign = 'left'
    })
    // Bottom explanation
    ctx.fillStyle = 'rgba(6,6,12,.88)'; ctx.beginPath(); ctx.roundRect(15, 340, 720, 52, 10); ctx.fill()
    if (phase === 'idle') {
      ctx.fillStyle = '#7d7a8c'; ctx.font = '500 10px Fira Code'
      ctx.fillText('Press "Forward Pass" to compute values left→right, then "Backward Pass" for gradients right→left.', 25, 360)
      ctx.fillText('This IS how all neural networks learn! Chain rule = multiply local derivatives along each path.', 25, 380)
    } else if (phase === 'fwd' || phase === 'fwd-done') {
      ctx.fillStyle = '#4ecdc4'; ctx.font = '600 11px Fira Code'
      ctx.fillText('▶ FORWARD: Computing f(x) = (x² + sin(x))² with x = ' + x.toFixed(1) + ' → L = ' + v.v_L.toFixed(3), 25, 360)
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code'
      ctx.fillText('Each node computes its output from inputs, flowing left to right. Now press "Backward Pass"!', 25, 380)
    } else {
      ctx.fillStyle = '#ff6b6b'; ctx.font = '600 11px Fira Code'
      ctx.fillText('◀ BACKWARD: ∂L/∂x via chain rule = ' + v.dx.toFixed(3) + ' — this is how neural nets learn!', 25, 360)
      ctx.fillStyle = '#ffd166'; ctx.font = '500 10px Fira Code'
      ctx.fillText('Each node multiplies incoming gradient by its local derivative. Gradients flow backward!', 25, 380)
    }
  }
  c.oninput = null
  const ctrl = addControls(el)
  ctrl.innerHTML = '<label>x =</label><input type="range" min="-30" max="30" value="20" id="xsl"><span id="xslv" class="btn" style="min-width:36px;text-align:center">2.0</span>'
  document.getElementById('xsl').oninput = e => { x = e.target.value / 10; document.getElementById('xslv').textContent = x.toFixed(1); phase = 'idle'; fwdStep = -1; bwdStep = -1; draw() }
  const fb = document.createElement('button'); fb.className = 'btn'; fb.textContent = '▶ Forward Pass'; fb.onclick = doForward
  const bb = document.createElement('button'); bb.className = 'btn'; bb.textContent = '◀ Backward Pass'; bb.onclick = doBackward
  const rst = document.createElement('button'); rst.className = 'btn'; rst.textContent = '↻ Reset'
  rst.onclick = () => { x = 2; document.getElementById('xsl').value = 20; document.getElementById('xslv').textContent = '2.0'; phase = 'idle'; fwdStep = -1; bwdStep = -1; draw() }
  ctrl.appendChild(fb); ctrl.appendChild(bb); ctrl.appendChild(rst)
  draw()
  cleanup = () => { try { el.innerHTML = '' } catch (e) { } }
  return cleanup
}

export function unmountChainRule() { if (cleanup) cleanup() }

export default { mountChainRule, unmountChainRule }
