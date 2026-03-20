import { createCanvas, addHint, addControls } from '/src/lib/shared.js'

let cleanup = null

export function mountNeocognitron(containerId = 'demo-neo') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 380)
  addHint(el, 'Draw on the 16×16 grid (left). Watch features detected layer by layer — just like the visual cortex!')
  const G = 16
  let grid = Array(G).fill(0).map(() => Array(G).fill(0)), drawing = false, erasing = false
  const filters = [
    { name: '━ Horiz', k: [[1,1,1],[0,0,0],[-1,-1,-1]], c: '#ff6b6b' },
    { name: '┃ Vert', k: [[1,0,-1],[1,0,-1],[1,0,-1]], c: '#38bdf8' },
    { name: '╲ Diag', k: [[1,0,-1],[0,1,0],[-1,0,1]], c: '#ffd166' },
    { name: '╱ Diag', k: [[-1,0,1],[0,1,0],[1,0,-1]], c: '#a78bfa' }
  ]
  function conv2d(g, k) {
    let kh = k.length, kw = k[0].length, h = g.length - kh + 1, w = g[0].length - kw + 1, out = []
    for (let r = 0; r < h; r++) { out[r] = []
      for (let c2 = 0; c2 < w; c2++) {
        let s = 0
        for (let kr = 0; kr < kh; kr++) for (let kc = 0; kc < kw; kc++) s += g[r + kr][c2 + kc] * k[kr][kc]
        out[r][c2] = Math.max(0, s)
      }
    }
    return out
  }
  function pool2x2(g) {
    let out = []
    for (let r = 0; r < g.length - 1; r += 2) {
      out[r >> 1] = []
      for (let c2 = 0; c2 < g[0].length - 1; c2 += 2) out[r >> 1][c2 >> 1] = Math.max(g[r][c2], g[r][c2 + 1], g[r + 1][c2], g[r + 1][c2 + 1])
    }
    return out
  }
  function draw() {
    ctx.clearRect(0, 0, 750, 380)
    let cs = 18, ox = 12, oy = 36
    ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code'; ctx.fillText('✏️ Draw (' + G + '×' + G + ')', ox, oy - 10)
    for (let r = 0; r < G; r++) for (let c2 = 0; c2 < G; c2++) {
      ctx.fillStyle = grid[r][c2] ? '#e4e2df' : '#111120'
      ctx.fillRect(ox + c2 * cs, oy + r * cs, cs - 1, cs - 1)
    }
    let fmaps = filters.map(f => conv2d(grid, f.k))
    let sx = 315, fmH = fmaps[0].length, fcs = Math.min(10, 160 / fmH)
    ctx.fillStyle = '#4ecdc4'; ctx.font = '700 11px Fira Code'; ctx.fillText('S-Cells (detect edges)', sx, oy - 10)
    let cols = [[255,107,107],[56,189,248],[255,209,102],[167,139,250]]
    fmaps.forEach((fm, fi) => {
      let fy = oy + fi * 82
      ctx.fillStyle = filters[fi].c; ctx.font = '600 9px Fira Code'; ctx.fillText(filters[fi].name, sx, fy + 10)
      let mx = 0; fm.forEach(row => row.forEach(v => { if (v > mx) mx = v }))
      mx = mx || 1
      for (let r = 0; r < fm.length; r++) for (let c2 = 0; c2 < fm[0].length; c2++) {
        let v = fm[r][c2] / mx
        ctx.fillStyle = `rgba(${cols[fi].join(',')},${v * .85})`
        ctx.fillRect(sx + 60 + c2 * fcs, fy, fcs - 1, fcs - 1)
      }
      let total = 0; fm.forEach(row => row.forEach(v => { total += v }))
      ctx.fillStyle = filters[fi].c + '88'; ctx.font = '400 8px Fira Code'; ctx.fillText('Σ=' + total.toFixed(0), sx + 60 + fm[0].length * fcs + 4, fy + 10)
    })
    let cx2 = 540
    ctx.fillStyle = '#fb923c'; ctx.font = '700 11px Fira Code'; ctx.fillText('C-Cells (pool)', cx2, oy - 10)
    let pooled = fmaps.map(fm => pool2x2(fm))
    let pcs = Math.min(18, 140 / (pooled[0] ? pooled[0][0].length : 1))
    pooled.forEach((pm, fi) => { if (!pm.length || !pm[0].length) return
      let fy = oy + fi * 82
      ctx.fillStyle = filters[fi].c; ctx.font = '600 9px Fira Code'; ctx.fillText(filters[fi].name, cx2, fy + 10)
      let mx = 0; pm.forEach(row => row.forEach(v => { if (v > mx) mx = v }))
      mx = mx || 1
      for (let r = 0; r < pm.length; r++) for (let c2 = 0; c2 < pm[0].length; c2++) {
        let v = pm[r][c2] / mx
        ctx.fillStyle = `rgba(${cols[fi].join(',')},${v * .9})`
        ctx.fillRect(cx2 + 60 + c2 * pcs, fy, pcs - 1, pcs - 1)
      }
    })
    let rx = 540, ry = oy + 335
    ctx.fillStyle = 'rgba(6,6,12,.9)'; ctx.beginPath(); ctx.roundRect(rx - 2, ry - 12, 210, 44, 8); ctx.fill()
    ctx.fillStyle = '#34d399'; ctx.font = '700 10px Fira Code'; ctx.fillText('Recognition', rx + 4, ry)
    let scores = pooled.map(pm => { let s = 0; pm.forEach(row => row.forEach(v => { s += v })); return s })
    let total = scores.reduce((a, b) => a + b, 0) || 1
    let maxI = scores.indexOf(Math.max(...scores))
    scores.forEach((s, i) => {
      let pct = s / total
      ctx.fillStyle = i === maxI && pct > .15 ? filters[i].c : '#4a475a'; ctx.font = '500 8px Fira Code'
      ctx.fillText(filters[i].name.slice(2) + ' ' + (pct * 100).toFixed(0) + '%', rx + 4 + i * 50, ry + 18)
    })
    ctx.fillStyle = '#4a475a'; ctx.font = '24px sans-serif'; ctx.fillText('→', ox + G * cs + 8, oy + G * cs / 2); ctx.fillText('→', sx + 215, oy + G * cs / 2)
    ctx.fillStyle = 'rgba(6,6,12,.85)'; ctx.beginPath(); ctx.roundRect(10, oy + G * cs + 8, 730, 30, 6); ctx.fill()
    ctx.fillStyle = '#a78bfa'; ctx.font = '500 9px Fira Code';
    ctx.fillText('Neocognitron: Input → S-cells (convolution: detect local features) → C-cells (max-pool: translation invariance) → Recognition', 18, oy + G * cs + 28)
  }
  function gridXY(e) {
    let r = c.getBoundingClientRect()
    let mx = (e.clientX - r.left) * 750 / r.width - 12, my = (e.clientY - r.top) * 380 / r.height - 36
    return [Math.floor(mx / 18), Math.floor(my / 18)]
  }
  c.onmousedown = e => { let [gx, gy] = gridXY(e)
    if (gx >= 0 && gx < G && gy >= 0 && gy < G) { drawing = true; erasing = grid[gy][gx] === 1; grid[gy][gx] = erasing ? 0 : 1; draw() } }
  c.onmousemove = e => { if (!drawing) return; let [gx, gy] = gridXY(e)
    if (gx >= 0 && gx < G && gy >= 0 && gy < G) { grid[gy][gx] = erasing ? 0 : 1; draw() } }
  c.onmouseup = () => drawing = false
  c.onmouseleave = () => drawing = false
  const ctrl = addControls(el)
  ;[
    { n: '━ H-line', g: () => { grid = Array(G).fill(0).map(() => Array(G).fill(0)); for (let c2 = 2; c2 < 14; c2++) { grid[7][c2] = 1; grid[8][c2] = 1 } } },
    { n: '┃ V-line', g: () => { grid = Array(G).fill(0).map(() => Array(G).fill(0)); for (let r = 2; r < 14; r++) { grid[r][7] = 1; grid[r][8] = 1 } } },
    { n: '╲ Diag', g: () => { grid = Array(G).fill(0).map(() => Array(G).fill(0)); for (let i = 1; i < 15; i++) { grid[i][i] = 1; if (i < 15) grid[i][i - 1] = 1 } } },
    { n: '□ Box', g: () => { grid = Array(G).fill(0).map(() => Array(G).fill(0)); for (let i = 3; i < 13; i++) { grid[3][i] = 1; grid[12][i] = 1; grid[i][3] = 1; grid[i][12] = 1 } } },
    { n: 'T Shape', g: () => { grid = Array(G).fill(0).map(() => Array(G).fill(0)); for (let c2 = 3; c2 < 13; c2++) { grid[3][c2] = 1; grid[4][c2] = 1 } for (let r = 3; r < 13; r++) { grid[r][7] = 1; grid[r][8] = 1 } } }
  ].forEach(p => { let b = document.createElement('button'); b.className = 'btn'; b.textContent = p.n; b.onclick = () => { p.g(); draw() }; ctrl.appendChild(b) })
  const rst = document.createElement('button'); rst.className = 'btn'; rst.textContent = '↻ Clear'; rst.onclick = () => { grid = Array(G).fill(0).map(() => Array(G).fill(0)); draw() }
  ctrl.appendChild(rst)
  draw()
  cleanup = () => { try { el.innerHTML = '' } catch (e) { } }
  return cleanup
}

export function unmountNeocognitron() { if (cleanup) cleanup() }

export default { mountNeocognitron, unmountNeocognitron }
