import { $, createCanvas, addHint, addControls, rand } from '../lib/shared.js'

// ===== demo-inception =====
export function mountInception(containerId = 'demo-inception') {
  const __id = containerId || 'demo-inception';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Draw on the 8×8 input grid (click/drag). Watch all four Inception branches respond in parallel — each captures features at a different scale!');

  const GS = 8, CS = 30; // 8×8 grid, cell size
  const GX = 14, GY = 34;

  // Input activation grid (0..1)
  let grid = Array.from({ length: GS }, () => new Float32Array(GS));
  let painting = false;

  function conv(kernel, ksize) {
    const half = Math.floor(ksize / 2);
    const out   = Array.from({ length: GS }, () => new Float32Array(GS));
    for (let r = 0; r < GS; r++) for (let cc = 0; cc < GS; cc++) {
      let s = 0, w = 0;
      for (let dr = -half; dr <= half; dr++) for (let dc = -half; dc <= half; dc++) {
        const nr = r + dr, nc = cc + dc;
        if (nr >= 0 && nr < GS && nc >= 0 && nc < GS) {
          const ki = (dr + half) * ksize + (dc + half);
          s += grid[nr][nc] * kernel[ki]; w += Math.abs(kernel[ki]);
        }
      }
      out[r][cc] = w > 0 ? Math.min(1, Math.abs(s / w)) : 0;
    }
    return out;
  }

  // Branch 1: 1×1 conv — just passes through (local intensity)
  const K1 = [1];
  // Branch 2: 3×3 gaussian — local blur / pattern detector
  const K3 = [0.0625, 0.125, 0.0625, 0.125, 0.25, 0.125, 0.0625, 0.125, 0.0625];
  // Branch 3: 5×5 gaussian — broader feature detector
  const K5 = [
    0.004, 0.016, 0.024, 0.016, 0.004,
    0.016, 0.064, 0.096, 0.064, 0.016,
    0.024, 0.096, 0.144, 0.096, 0.024,
    0.016, 0.064, 0.096, 0.064, 0.016,
    0.004, 0.016, 0.024, 0.016, 0.004,
  ];
  // Branch 4: 3×3 max-pool then 1×1 (simulated as sharpening)
  const KPOOL = [0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11, 0.11]; // uniform = average

  const BRANCHES = [
    { name: '1×1 conv    (32 ch)', k: K1,    sz: 1, col: '#38bdf8',  params: '32 · 1  = 32' },
    { name: '3×3 conv    (32 ch)', k: K3,    sz: 3, col: '#f472b6',  params: '32 · 9  = 288' },
    { name: '5×5 conv    (16 ch)', k: K5,    sz: 5, col: '#ffd166',  params: '16 · 25 = 400' },
    { name: '3×3 pool    (16 ch)', k: KPOOL, sz: 3, col: '#34d399',  params: '16 · 1  = 16' },
  ];

  const MCS = 18; // mini cell size in branch output maps
  const BX0 = GX + GS * CS + 36; // x start of branches column

  function drawHeatmap(map, ox, oy, cs, col) {
    for (let r = 0; r < GS; r++) for (let cc = 0; cc < GS; cc++) {
      const v = map[r][cc];
      ctx.fillStyle = v > 0.01 ? col + Math.round(v * 200 + 30).toString(16).padStart(2, '0') : 'rgba(255,255,255,0.03)';
      ctx.beginPath(); ctx.roundRect(ox + cc * cs + 1, oy + r * cs + 1, cs - 2, cs - 2, 2); ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);

    // ── Input grid ─────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(6,6,12,0.7)';
    ctx.beginPath(); ctx.roundRect(GX - 4, GY - 22, GS * CS + 8, GS * CS + 30, 8); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 9px Fira Code';
    ctx.fillText('Input  8×8', GX, GY - 8);

    for (let r = 0; r < GS; r++) for (let cc = 0; cc < GS; cc++) {
      const v = grid[r][cc];
      ctx.fillStyle = v > 0 ? `rgba(228,226,223,${0.05 + v * 0.85})` : 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.roundRect(GX + cc * CS + 1, GY + r * CS + 1, CS - 2, CS - 2, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.roundRect(GX + cc * CS, GY + r * CS, CS, CS, 3); ctx.stroke();
    }

    // Arrow from input to branches
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(GX + GS * CS + 8, GY + GS * CS / 2);
    ctx.lineTo(BX0 - 8, GY + GS * CS / 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath(); ctx.moveTo(BX0 - 6, GY + GS * CS / 2);
    ctx.lineTo(BX0 - 14, GY + GS * CS / 2 - 5);
    ctx.lineTo(BX0 - 14, GY + GS * CS / 2 + 5); ctx.fill();

    // ── Four parallel branches ─────────────────────────────────────────
    const ROW_H = 75;
    BRANCHES.forEach((br, bi) => {
      const by    = GY + bi * ROW_H;
      const mapX  = BX0;
      const map   = conv(br.k, br.sz);

      // Background lane
      ctx.fillStyle = br.col + '0c';
      ctx.beginPath(); ctx.roundRect(mapX - 4, by - 2, MCS * GS + 160 + 8, ROW_H - 4, 5); ctx.fill();
      ctx.strokeStyle = br.col + '33'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(mapX - 4, by - 2, MCS * GS + 160 + 8, ROW_H - 4, 5); ctx.stroke();

      // Branch label
      ctx.fillStyle = br.col; ctx.font = '600 9px Fira Code';
      ctx.fillText(br.name, mapX, by + 11);
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
      ctx.fillText('params ~ ' + br.params, mapX, by + 23);

      // Heatmap
      drawHeatmap(map, mapX, by + 28, MCS, br.col.slice(0, 7));

      // Average activation bar
      const avgAct = map.reduce((s, row) => s + row.reduce((a, v) => a + v, 0), 0) / (GS * GS);
      const bw = 130;
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.roundRect(mapX + MCS * GS + 10, by + 28, bw, 10, 3); ctx.fill();
      ctx.fillStyle = br.col + 'aa';
      ctx.beginPath(); ctx.roundRect(mapX + MCS * GS + 10, by + 28, bw * avgAct, 10, 3); ctx.fill();
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
      ctx.fillText('avg act: ' + avgAct.toFixed(3), mapX + MCS * GS + 10, by + 52);
    });

    // Concatenate arrow + label
    const concatX = BX0 + MCS * GS + 10, concatY = GY + BRANCHES.length * ROW_H + 4;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(concatX, concatY, 280, 28, 6); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.font = '700 10px Fira Code';
    ctx.fillText('Concat → (32+32+16+16)=96 channels total', concatX + 6, concatY + 12);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('Multi-scale features captured in one pass!', concatX + 6, concatY + 24);

    // ── Info overlay ──────────────────────────────────────────────────
    const IX = 656, IY = 8, IW = 88, IH = 138;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, IH, 8); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.font = '700 10px Fira Code';
    ctx.fillText('Inception', IX + 6, IY + 14);
    ctx.fillText('(GoogLeNet)', IX + 6, IY + 25);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('Szegedy et al.', IX + 6, IY + 38);
    ctx.fillText('CVPR 2014', IX + 6, IY + 49);
    ctx.fillText('4 branches in', IX + 6, IY + 65);
    ctx.fillText('parallel per', IX + 6, IY + 76);
    ctx.fillText('Inception block.', IX + 6, IY + 87);
    ctx.fillText('1×1 reduces dim.', IX + 6, IY + 101);
    ctx.fillStyle = '#38bdf8'; ctx.font = '600 9px Fira Code';
    ctx.fillText('Total params', IX + 6, IY + 117);
    ctx.fillStyle = '#34d399';
    ctx.fillText('~ 736 / layer!', IX + 6, IY + 129);
  }

  // Draw on grid
  function setCell(mx, my, val) {
    const cc = Math.floor((mx - GX) / CS), r = Math.floor((my - GY) / CS);
    if (r >= 0 && r < GS && cc >= 0 && cc < GS) { grid[r][cc] = val; draw(); }
  }
  c.onmousedown = e => {
    painting = true;
    const r = c.getBoundingClientRect();
    setCell((e.clientX - r.left) * 750 / r.width, (e.clientY - r.top) * 340 / r.height, e.button === 2 ? 0 : 1);
  };
  c.onmousemove = e => {
    if (!painting) return;
    const r = c.getBoundingClientRect();
    setCell((e.clientX - r.left) * 750 / r.width, (e.clientY - r.top) * 340 / r.height, 1);
  };
  c.onmouseup = c.onmouseleave = () => { painting = false; };
  c.oncontextmenu = e => e.preventDefault();

  const ctrl = addControls(el);

  const presets = [
    { label: '✚ Cross',   fn: () => { grid = Array.from({length:GS},(_,r)=>Float32Array.from({length:GS},(_,cc)=>r===3||r===4||cc===3||cc===4?1:0)); }},
    { label: '◻ Square',  fn: () => { grid = Array.from({length:GS},(_,r)=>Float32Array.from({length:GS},(_,cc)=>r===0||r===7||cc===0||cc===7?1:0)); }},
    { label: '⊘ Random',  fn: () => { grid = Array.from({length:GS},()=>Float32Array.from({length:GS},()=>Math.random()>0.65?1:0)); }},
  ];
  presets.forEach(p => {
    const b = document.createElement('button'); b.className = 'btn';
    b.textContent = p.label; b.onclick = () => { p.fn(); draw(); };
    ctrl.appendChild(b);
  });

  const clrBtn = document.createElement('button'); clrBtn.className = 'btn';
  clrBtn.textContent = '✕ Clear';
  clrBtn.onclick = () => { grid = Array.from({length:GS},()=>new Float32Array(GS)); draw(); };
  ctrl.appendChild(clrBtn);

  // seed with cross pattern
  presets[0].fn();
  draw();

  return () => {
    try {
      if (c) { c.onmousedown = null; c.onmousemove = null; c.onmouseup = null; c.onmouseleave = null; c.oncontextmenu = null; }
      if (el) el.innerHTML = '';
    } catch (e) {}
  };
}
