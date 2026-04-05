import { $, createCanvas, addHint, addControls, clamp, TAU } from '../lib/shared.js'

// ===== demo-rbm =====
export function mountRbm(containerId = 'demo-rbm') {
  const __id = containerId || 'demo-rbm';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Click visible (bottom) units to set a pattern. Press Forward → Reconstruct to see the RBM complete the pattern. Train CDk to update weights.');

  const NV = 8, NH = 5;
  const sigmoid = x => 1 / (1 + Math.exp(-x));

  // Weight matrix W[v][h], biases
  let W  = Array.from({ length: NV }, () => Array.from({ length: NH }, () => (Math.random() - 0.5) * 0.2));
  let bv = new Float32Array(NV);
  let bh = new Float32Array(NH);

  // Pre-store 3 patterns via 5 rounds of CD-1 to initialize weights
  const PATTERNS = [
    [1,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,1,1],
    [1,0,1,0,1,0,1,0],
  ];
  // Quick pseudo-Hebbian init
  PATTERNS.forEach(p => {
    for (let k = 0; k < 3; k++) {
      const hProb = Array.from({ length: NH }, (_, j) =>
        sigmoid(bh[j] + p.reduce((s, v, i) => s + v * W[i][j], 0)));
      const h = hProb.map(p2 => p2 > 0.5 ? 1 : 0);
      const vRecon = Array.from({ length: NV }, (_, i) =>
        sigmoid(bv[i] + h.reduce((s, hj, j) => s + hj * W[i][j], 0)));
      const h2Prob = Array.from({ length: NH }, (_, j) =>
        sigmoid(bh[j] + vRecon.reduce((s, vi, i) => s + vi * W[i][j], 0)));
      for (let i = 0; i < NV; i++) for (let j = 0; j < NH; j++)
        W[i][j] += 0.08 * (h[j] * p[i] - h2Prob[j] * vRecon[i]);
    }
  });

  let vis  = [...PATTERNS[0]];   // current visible state (0/1)
  let hidd = new Float32Array(NH);  // hidden (0/1, sampled)
  let hProb = new Float32Array(NH); // hidden probs
  let vRecon = new Float32Array(NV); // reconstruction probs
  let cdSteps = 0;
  let phase = 'idle'; // 'idle' | 'forwarded' | 'reconstructed'

  // Geometry: bottom row = visible, top row = hidden
  const VY = 248, HY = 92;
  const nodeR = 22;
  function vx(i) { return 50 + i * 82; }
  function hx(j) { return 91 + j * 130; }

  function energy() {
    let e = 0;
    for (let i = 0; i < NV; i++) e -= bv[i] * vis[i];
    for (let j = 0; j < NH; j++) e -= bh[j] * hidd[j];
    for (let i = 0; i < NV; i++) for (let j = 0; j < NH; j++)
      e -= W[i][j] * vis[i] * hidd[j];
    return e;
  }

  function doForward() {
    for (let j = 0; j < NH; j++) {
      hProb[j] = sigmoid(bh[j] + vis.reduce((s, v, i) => s + v * W[i][j], 0));
      hidd[j]  = Math.random() < hProb[j] ? 1 : 0;
    }
    phase = 'forwarded';
  }

  function doReconstruct() {
    for (let i = 0; i < NV; i++)
      vRecon[i] = sigmoid(bv[i] + Array.from(hidd).reduce((s, h, j) => s + h * W[i][j], 0));
    vis = Array.from(vRecon).map(p => Math.random() < p ? 1 : 0);
    phase = 'reconstructed';
  }

  function cdStep() {
    // positive phase
    const h0Prob = Array.from({ length: NH }, (_, j) =>
      sigmoid(bh[j] + vis.reduce((s, v, i) => s + v * W[i][j], 0)));
    const h0 = h0Prob.map(p => Math.random() < p ? 1 : 0);
    // negative phase
    const v1Prob = Array.from({ length: NV }, (_, i) =>
      sigmoid(bv[i] + h0.reduce((s, h, j) => s + h * W[i][j], 0)));
    const h1Prob = Array.from({ length: NH }, (_, j) =>
      sigmoid(bh[j] + v1Prob.reduce((s, v, i) => s + v * W[i][j], 0)));
    // update
    const lr = 0.05;
    for (let i = 0; i < NV; i++) for (let j = 0; j < NH; j++)
      W[i][j] = clamp(W[i][j] + lr * (h0[j] * vis[i] - h1Prob[j] * v1Prob[i]), -3, 3);
    for (let i = 0; i < NV; i++) bv[i] = clamp(bv[i] + lr * (vis[i] - v1Prob[i]), -3, 3);
    for (let j = 0; j < NH; j++) bh[j] = clamp(bh[j] + lr * (h0[j] - h1Prob[j]), -3, 3);
    cdSteps++;
    // also update visible + hidden states
    Array.from(v1Prob).forEach((p, i) => { vis[i] = Math.random() < p ? 1 : 0; });
    h0Prob.forEach((p, j) => { hidd[j] = Math.random() < p ? 1 : 0; hProb[j] = p; });
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);

    // ── Connections ───────────────────────────────────────────────────
    for (let i = 0; i < NV; i++) for (let j = 0; j < NH; j++) {
      const w = W[i][j];
      const bright = Math.abs(w) / 2;
      ctx.strokeStyle = w > 0
        ? `rgba(52,211,153,${0.05 + bright * 0.35})`
        : `rgba(255,107,107,${0.05 + bright * 0.35})`;
      ctx.lineWidth = 0.8 + Math.abs(w) * 0.6;
      ctx.beginPath(); ctx.moveTo(vx(i), VY - nodeR); ctx.lineTo(hx(j), HY + nodeR); ctx.stroke();
    }

    // ── Hidden units ──────────────────────────────────────────────────
    for (let j = 0; j < NH; j++) {
      const p = hProb[j], s = hidd[j];
      ctx.save(); if (s) { ctx.shadowColor = '#a78bfa'; ctx.shadowBlur = 12; }
      ctx.beginPath(); ctx.arc(hx(j), HY, nodeR, 0, TAU);
      ctx.fillStyle = s ? `rgba(167,139,250,${0.15 + p * 0.3})` : '#0a0a14'; ctx.fill();
      ctx.strokeStyle = s ? '#a78bfa' : '#2a2a48'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = s ? '#a78bfa' : '#4a475a';
      ctx.font = '600 9px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText(p.toFixed(2), hx(j), HY + 4);
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
      ctx.fillText('h' + (j + 1), hx(j), HY - 30);
      ctx.textAlign = 'left';
    }

    // ── Visible units ─────────────────────────────────────────────────
    for (let i = 0; i < NV; i++) {
      const s = vis[i];
      ctx.save(); if (s) { ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 12; }
      ctx.beginPath(); ctx.arc(vx(i), VY, nodeR, 0, TAU);
      ctx.fillStyle = s ? 'rgba(56,189,248,0.22)' : '#0a0a14'; ctx.fill();
      ctx.strokeStyle = s ? '#38bdf8' : '#2a2a48'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = s ? '#38bdf8' : '#4a475a';
      ctx.font = '700 14px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText(s, vx(i), VY + 5);
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
      ctx.fillText('v' + (i + 1), vx(i), VY + 35);
      ctx.textAlign = 'left';
    }

    // Labels
    ctx.fillStyle = '#a78bfa'; ctx.font = '500 9px Fira Code';
    ctx.fillText('HIDDEN (h)', 8, HY + 4);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('VISIBLE (v)', 8, VY + 4);

    // Phase annotation
    if (phase === 'forwarded') {
      ctx.fillStyle = 'rgba(167,139,250,0.7)'; ctx.font = '600 9px Fira Code';
      ctx.textAlign = 'center'; ctx.fillText('↑ forward pass complete ↑', 375, (VY + HY) / 2 + 4); ctx.textAlign = 'left';
    } else if (phase === 'reconstructed') {
      ctx.fillStyle = 'rgba(56,189,248,0.7)'; ctx.font = '600 9px Fira Code';
      ctx.textAlign = 'center'; ctx.fillText('↓ reconstruction sampled ↓', 375, (VY + HY) / 2 + 4); ctx.textAlign = 'left';
    }

    // ── Info overlay ──────────────────────────────────────────────────
    const IX = 686, IY = 8, IW = 58, IH = 230;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, IH, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 8px Fira Code';
    ctx.fillText('RBM', IX + 6, IY + 14);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 7px Fira Code';
    ctx.fillText('P(h|v)=σ(c+Wᵀv)', IX + 6, IY + 27);
    ctx.fillText('P(v|h)=σ(b+Wh)', IX + 6, IY + 38);
    ctx.fillStyle = '#38bdf8'; ctx.font = '600 9px Fira Code';
    ctx.fillText('E =', IX + 6, IY + 55);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 7px Fira Code';
    ctx.fillText('−bᵀv−cᵀh', IX + 6, IY + 66);
    ctx.fillText('−vᵀWh', IX + 6, IY + 77);
    ctx.fillStyle = '#f472b6'; ctx.font = '600 10px Fira Code';
    ctx.fillText(energy().toFixed(2), IX + 6, IY + 94);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 7px Fira Code';
    ctx.fillText('CD steps:', IX + 6, IY + 110);
    ctx.fillStyle = '#34d399'; ctx.font = '600 9px Fira Code';
    ctx.fillText(cdSteps, IX + 6, IY + 122);
    ctx.fillStyle = '#34d399'; ctx.fillRect(IX + 6, IY + 128, IW - 12, 2);
    ctx.fillStyle = '#a78bfa'; ctx.fillRect(IX + 6, IY + 132, IW - 12, 2);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 7px Fira Code';
    ctx.fillText('green=+w', IX + 6, IY + 148);
    ctx.fillText('red=−w', IX + 6, IY + 159);
    ctx.fillText('thick=strong', IX + 6, IY + 170);
    ctx.fillText('Hinton 2006', IX + 6, IY + 188);
    ctx.fillText('CD-k training', IX + 6, IY + 199);
    ctx.fillText('Contrastive', IX + 6, IY + 213);
    ctx.fillText('Divergence', IX + 6, IY + 224);
  }

  // click visible unit to toggle
  c.onclick = e => {
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * 750 / r.width;
    const my = (e.clientY - r.top)  * 340 / r.height;
    for (let i = 0; i < NV; i++) {
      if (Math.hypot(mx - vx(i), my - VY) < nodeR + 4) { vis[i] ^= 1; phase = 'idle'; draw(); break; }
    }
  };

  const ctrl = addControls(el);

  PATTERNS.forEach((p, k) => {
    const b = document.createElement('button'); b.className = 'btn';
    b.textContent = 'Pattern ' + (k + 1);
    b.onclick = () => { vis = [...p]; hidd.fill(0); hProb.fill(0); phase = 'idle'; draw(); };
    ctrl.appendChild(b);
  });

  const fwdBtn = document.createElement('button'); fwdBtn.className = 'btn';
  fwdBtn.textContent = '↑ Forward';
  fwdBtn.onclick = () => { doForward(); draw(); };
  ctrl.appendChild(fwdBtn);

  const recBtn = document.createElement('button'); recBtn.className = 'btn';
  recBtn.textContent = '↓ Reconstruct';
  recBtn.onclick = () => { if (phase === 'forwarded') doReconstruct(); else { doForward(); doReconstruct(); } draw(); };
  ctrl.appendChild(recBtn);

  const cdBtn = document.createElement('button'); cdBtn.className = 'btn';
  cdBtn.textContent = '⚙ CD Train ×10';
  cdBtn.onclick = () => { for (let i = 0; i < 10; i++) cdStep(); draw(); };
  ctrl.appendChild(cdBtn);

  const rst = document.createElement('button'); rst.className = 'btn'; rst.textContent = '↻ Reset';
  rst.onclick = () => {
    W = Array.from({ length: NV }, () => Array.from({ length: NH }, () => (Math.random() - 0.5) * 0.2));
    bv.fill(0); bh.fill(0); hidd.fill(0); hProb.fill(0);
    vis = [...PATTERNS[0]]; cdSteps = 0; phase = 'idle'; draw();
  };
  ctrl.appendChild(rst);

  draw();
  return () => {
    try { if (c) c.onclick = null; if (el) el.innerHTML = ''; } catch (e) {}
  };
}
