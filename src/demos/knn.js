import { createCanvas, addHint, addControls, rand, TAU } from '/src/lib/shared.js'

let cleanup = null

export function mountKnn(containerId = 'demo-knn') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 340)
  addHint(el, 'Left-click = Red class, Right-click = Blue class. Move mouse to see live k-NN prediction with neighbor lines.')
  let pts = []
  for (let i = 0; i < 12; i++) {
    pts.push({ x: rand(40, 320), y: rand(40, 300), c: 0 })
    pts.push({ x: rand(430, 710), y: rand(40, 300), c: 1 })
  }
  let k = 3, mx = -1, my = -1
  function draw() {
    ctx.clearRect(0, 0, 750, 340)
    // Decision regions
    let img = ctx.createImageData(75, 34)
    for (let y = 0; y < 34; y++) for (let x = 0; x < 75; x++) {
      let rx = x * 10, ry = y * 10, idx = (y * 75 + x) * 4
      let dists = pts.map(p => ({ d: Math.hypot(rx - p.x, ry - p.y), c: p.c })).sort((a, b) => a.d - b.d)
      let votes = [0, 0]
      for (let j = 0; j < Math.min(k, dists.length); j++) votes[dists[j].c]++
      if (votes[1] > votes[0]) {
        img.data[idx] = 56; img.data[idx + 1] = 189; img.data[idx + 2] = 248; img.data[idx + 3] = 20
      } else {
        img.data[idx] = 255; img.data[idx + 1] = 100; img.data[idx + 2] = 100; img.data[idx + 3] = 20
      }
    }
    let tc = document.createElement('canvas')
    tc.width = 75; tc.height = 34; tc.getContext('2d').putImageData(img, 0, 0)
    ctx.drawImage(tc, 0, 0, 750, 340)
    // Points
    pts.forEach(p => {
      ctx.save(); ctx.shadowColor = p.c ? '#38bdf8' : '#ff6b6b'; ctx.shadowBlur = 5
      ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, TAU)
      ctx.fillStyle = p.c ? '#38bdf8' : '#ff6b6b'; ctx.fill(); ctx.restore()
    })
    // Mouse hover prediction
    if (mx > 0 && my > 0) {
      let dists = pts.map((p, i) => ({ d: Math.hypot(mx - p.x, my - p.y), c: p.c, i })).sort((a, b) => a.d - b.d)
      let votes = [0, 0]
      for (let j = 0; j < Math.min(k, dists.length); j++) {
        votes[dists[j].c]++
        let p = pts[dists[j].i]
        ctx.strokeStyle = p.c ? '#38bdf866' : '#ff6b6b66'; ctx.lineWidth = 2; ctx.setLineDash([4, 4])
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.setLineDash([])
        ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, TAU); ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 2; ctx.stroke()
        let mdx = (mx + p.x) / 2, mdy = (my + p.y) / 2
        ctx.fillStyle = 'rgba(6,6,12,.75)'; ctx.beginPath(); ctx.roundRect(mdx - 20, mdy - 8, 40, 15, 3); ctx.fill()
        ctx.fillStyle = '#ffd166'; ctx.font = '500 8px Fira Code'; ctx.textAlign = 'center'; ctx.fillText(dists[j].d.toFixed(0) + 'px', mdx, mdy + 3); ctx.textAlign = 'left'
      }
      let pred = votes[1] > votes[0] ? 1 : 0
      ctx.save(); ctx.shadowColor = pred ? '#38bdf8' : '#ff6b6b'; ctx.shadowBlur = 16
      ctx.beginPath(); ctx.arc(mx, my, 10, 0, TAU); ctx.fillStyle = pred ? '#38bdf8' : '#ff6b6b'; ctx.fill(); ctx.restore()
      ctx.fillStyle = '#fff'; ctx.font = 'bold 10px Fira Code'; ctx.textAlign = 'center'; ctx.fillText('?', mx, my + 4); ctx.textAlign = 'left'
      // Panel
      ctx.fillStyle = 'rgba(6,6,12,.9)'; ctx.beginPath(); ctx.roundRect(8, 8, 210, 55, 8); ctx.fill()
      ctx.fillStyle = '#ffd166'; ctx.font = '600 12px Fira Code'; ctx.fillText('k=' + k + ' Nearest Neighbors', 18, 28)
      ctx.fillStyle = pred ? '#38bdf8' : '#ff6b6b'; ctx.font = '600 11px Fira Code';
      ctx.fillText('Predict: ' + (pred ? 'BLUE' : 'RED'), 18, 46)
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code'; ctx.fillText('Votes: R=' + votes[0] + ' B=' + votes[1], 140, 46)
    } else {
      ctx.fillStyle = 'rgba(6,6,12,.8)'; ctx.beginPath(); ctx.roundRect(8, 8, 240, 28, 6); ctx.fill()
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code'; ctx.fillText('Move mouse over canvas to classify a point', 18, 27)
    }
  }
  c.onmousemove = e => { let r = c.getBoundingClientRect(); mx = (e.clientX - r.left) * 750 / r.width; my = (e.clientY - r.top) * 340 / r.height; draw() }
  c.onmouseleave = () => { mx = -1; my = -1; draw() }
  c.onclick = e => { let r = c.getBoundingClientRect(); pts.push({ x: (e.clientX - r.left) * 750 / r.width, y: (e.clientY - r.top) * 340 / r.height, c: 0 }); draw() }
  c.oncontextmenu = e => { e.preventDefault(); let r = c.getBoundingClientRect(); pts.push({ x: (e.clientX - r.left) * 750 / r.width, y: (e.clientY - r.top) * 340 / r.height, c: 1 }); draw() }
  const ctrl = addControls(el)
  ctrl.innerHTML = '<label>k =</label><input type="range" min="1" max="15" value="3" id="kv"><span id="kvv" class="btn" style="min-width:28px;text-align:center">3</span>'
  document.getElementById('kv').oninput = e => { k = +e.target.value; document.getElementById('kvv').textContent = k; draw() }
  const rst = document.createElement('button'); rst.className = 'btn'; rst.textContent = '↻ Reset'
  rst.onclick = () => { pts = [];
    for (let i = 0; i < 12; i++) { pts.push({ x: rand(40, 320), y: rand(40, 300), c: 0 }); pts.push({ x: rand(430, 710), y: rand(40, 300), c: 1 }) }
    draw()
  }
  ctrl.appendChild(rst)
  draw()
  cleanup = () => { try { el.innerHTML = '' } catch (e) { } }
  return cleanup
}

export function unmountKnn() { if (cleanup) cleanup() }

export default { mountKnn, unmountKnn }
