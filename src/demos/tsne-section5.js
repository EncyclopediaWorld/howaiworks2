import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

// ===== demo-tsne =====
export function mountTsne(containerId = 'demo-tsne') {
  const __id = containerId || 'demo-tsne';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Left = original 3D data (2D projection shown). Right = t-SNE 2D embedding evolving. Press Auto and watch clusters emerge from the random initialization!');

  const K = 4, N_PER = 14, N = K * N_PER;
  const COLS = ['#ffd166', '#38bdf8', '#f472b6', '#34d399'];

  // ── Original 3D cluster centres ──────────────────────────────────────
  const CENTERS = [[2, 2, 0], [-2, 2, 0], [-2,-2, 0], [2,-2, 0]];

  let pts = [];   // N × 3 high-dim coords
  let Y   = [];   // N × 2 low-dim embedding (current)
  let vel = [];   // momentum
  let iter = 0;
  let P    = [];  // precomputed symmetric P_ij [N][N]
  let tmr  = null;

  function init() {
    pts = []; Y = []; vel = [];
    for (let k = 0; k < K; k++) {
      for (let n = 0; n < N_PER; n++) {
        pts.push([
          CENTERS[k][0] + rand(-0.8, 0.8),
          CENTERS[k][1] + rand(-0.8, 0.8),
          CENTERS[k][2] + rand(-0.5, 0.5),
        ]);
        // start embedding: random near origin with slight cluster hint
        Y.push([CENTERS[k][0] * 0.05 + rand(-0.5, 0.5), CENTERS[k][1] * 0.05 + rand(-0.5, 0.5)]);
        vel.push([0, 0]);
      }
    }
    P = computeP();
    iter = 0;
  }

  function dist2(a, b) { return a.reduce((s, v, i) => s + (v - b[i]) ** 2, 0); }

  function computeP() {
    const sigma2 = 2.0;
    // Conditional P_j|i
    const Pc = Array.from({ length: N }, () => new Float64Array(N));
    for (let i = 0; i < N; i++) {
      let sum = 0;
      for (let j = 0; j < N; j++) if (i !== j) {
        Pc[i][j] = Math.exp(-dist2(pts[i], pts[j]) / (2 * sigma2));
        sum += Pc[i][j];
      }
      if (sum > 0) for (let j = 0; j < N; j++) Pc[i][j] /= sum;
    }
    // Symmetrize
    const Ps = Array.from({ length: N }, () => new Float64Array(N));
    const nn = N * 2;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++)
      Ps[i][j] = Math.max((Pc[i][j] + Pc[j][i]) / nn, 1e-12);
    return Ps;
  }

  function tsneStep() {
    // Compute Q_ij  (t-distribution, df=1)
    const Q = Array.from({ length: N }, () => new Float64Array(N));
    let sumQ = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) {
      Q[i][j] = 1 / (1 + (Y[i][0]-Y[j][0])**2 + (Y[i][1]-Y[j][1])**2);
      sumQ += Q[i][j];
    }
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) Q[i][j] = Math.max(Q[i][j] / sumQ, 1e-12);

    // Early exaggeration: multiply P by 4 for first 100 iters
    const exagg = iter < 100 ? 4 : 1;
    const lr = 80, mu = 0.7;

    for (let i = 0; i < N; i++) {
      let g0 = 0, g1 = 0;
      for (let j = 0; j < N; j++) if (i !== j) {
        const factor = 4 * (exagg * P[i][j] - Q[i][j]) / (1 + (Y[i][0]-Y[j][0])**2 + (Y[i][1]-Y[j][1])**2);
        g0 += factor * (Y[i][0] - Y[j][0]);
        g1 += factor * (Y[i][1] - Y[j][1]);
      }
      vel[i][0] = mu * vel[i][0] - lr * g0;
      vel[i][1] = mu * vel[i][1] - lr * g1;
      Y[i][0] += vel[i][0];
      Y[i][1] += vel[i][1];
    }
    iter++;
  }

  function klDiv() {
    const Q = Array.from({ length: N }, () => new Float64Array(N));
    let sumQ = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) {
      Q[i][j] = 1 / (1 + (Y[i][0]-Y[j][0])**2 + (Y[i][1]-Y[j][1])**2);
      sumQ += Q[i][j];
    }
    let kl = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) {
      const q = Math.max(Q[i][j] / sumQ, 1e-12);
      if (P[i][j] > 1e-12) kl += P[i][j] * Math.log(P[i][j] / q);
    }
    return kl;
  }

  // Project 3D pts to 2D for display (simple oblique projection)
  function project3(p) {
    return [p[0] + p[2] * 0.4, p[1] + p[2] * 0.25];
  }

  // ── Fit coords into a viewport rectangle ─────────────────────────────
  function fitToRect(coords, rx, ry, rw, rh) {
    let mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
    coords.forEach(([x, y]) => { mnx = Math.min(mnx, x); mny = Math.min(mny, y); mxx = Math.max(mxx, x); mxy = Math.max(mxy, y); });
    const sx = (mxx - mnx) || 1, sy = (mxy - mny) || 1;
    const scale = Math.min(rw / sx, rh / sy) * 0.82;
    const cx = rx + rw / 2, cy = ry + rh / 2;
    return coords.map(([x, y]) => [cx + (x - (mnx + mxx) / 2) * scale, cy + (y - (mny + mxy) / 2) * scale]);
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);

    const mid = 370;
    const PAD = 20;

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(mid, PAD); ctx.lineTo(mid, 320); ctx.stroke();

    // ── LEFT: original space ──────────────────────────────────────────
    ctx.fillStyle = 'rgba(6,6,12,0.5)';
    ctx.beginPath(); ctx.roundRect(4, PAD, mid - 8, 300, 8); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 9px Fira Code';
    ctx.fillText('Original 3D space (projection)', 12, PAD + 14);

    const proj2D = pts.map(p => project3(p));
    const leftFit = fitToRect(proj2D, 4, PAD, mid - 8, 296);

    leftFit.forEach((pos, i) => {
      const k = Math.floor(i / N_PER);
      ctx.beginPath(); ctx.arc(pos[0], pos[1], 4, 0, TAU);
      ctx.fillStyle = COLS[k] + 'cc'; ctx.fill();
    });

    // Cluster labels
    for (let k = 0; k < K; k++) {
      const cPts = leftFit.slice(k * N_PER, (k + 1) * N_PER);
      const cx = cPts.reduce((s, p) => s + p[0], 0) / N_PER;
      const cy = cPts.reduce((s, p) => s + p[1], 0) / N_PER;
      ctx.fillStyle = COLS[k]; ctx.font = '700 10px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText('C' + (k + 1), cx, cy - 10); ctx.textAlign = 'left';
    }

    // ── RIGHT: t-SNE embedding ────────────────────────────────────────
    ctx.fillStyle = 'rgba(6,6,12,0.5)';
    ctx.beginPath(); ctx.roundRect(mid + 4, PAD, 750 - mid - 8, 300, 8); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 9px Fira Code';
    ctx.fillText('t-SNE 2D embedding', mid + 12, PAD + 14);

    const rightFit = fitToRect(Y, mid + 4, PAD, 750 - mid - 8, 296);

    rightFit.forEach((pos, i) => {
      const k = Math.floor(i / N_PER);
      ctx.save(); if (iter > 30) { ctx.shadowColor = COLS[k]; ctx.shadowBlur = 4; }
      ctx.beginPath(); ctx.arc(pos[0], pos[1], 5, 0, TAU);
      ctx.fillStyle = COLS[k] + 'cc'; ctx.fill();
      ctx.restore();
    });

    // ── Info overlay ──────────────────────────────────────────────────
    const IX = mid + 8, IY = PAD + 20, IW = 168, IH = 115;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, IH, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code';
    ctx.fillText('t-SNE', IX + 8, IY + 15);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('P_ij: Gaussian (hi-dim)', IX + 8, IY + 28);
    ctx.fillText('Q_ij: Student-t (lo-dim)', IX + 8, IY + 39);
    ctx.fillText('minimise KL(P ‖ Q)', IX + 8, IY + 50);

    ctx.fillStyle = '#38bdf8'; ctx.font = '600 10px Fira Code';
    ctx.fillText('Iter: ' + iter, IX + 8, IY + 66);
    const kl = klDiv();
    ctx.fillStyle = '#f472b6';
    ctx.fillText('KL: ' + kl.toFixed(3), IX + 8, IY + 79);

    // KL bar (decreasing)
    const klMax = 3.0;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.roundRect(IX + 8, IY + 84, IW - 16, 8, 3); ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.roundRect(IX + 8, IY + 84, (IW - 16) * Math.min(kl / klMax, 1), 8, 3); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 7px Fira Code';
    ctx.fillText(iter < 100 ? 'exaggeration phase' : 'convergence phase', IX + 8, IY + 105);
  }

  const ctrl = addControls(el);

  const stepBtn = document.createElement('button'); stepBtn.className = 'btn';
  stepBtn.textContent = '▶ Step ×5';
  stepBtn.onclick = () => { for (let i = 0; i < 5; i++) tsneStep(); draw(); };
  ctrl.appendChild(stepBtn);

  const autoBtn = document.createElement('button'); autoBtn.className = 'btn';
  autoBtn.textContent = '⏩ Auto';
  autoBtn.onclick = () => {
    if (tmr) { clearInterval(tmr); tmr = null; autoBtn.classList.remove('active'); }
    else { tmr = setInterval(() => { for (let i = 0; i < 8; i++) tsneStep(); draw(); }, 60); autoBtn.classList.add('active'); }
  };
  ctrl.appendChild(autoBtn);

  const fastBtn = document.createElement('button'); fastBtn.className = 'btn';
  fastBtn.textContent = '⚡ Run 200';
  fastBtn.onclick = () => { for (let i = 0; i < 200; i++) tsneStep(); draw(); };
  ctrl.appendChild(fastBtn);

  const rstBtn = document.createElement('button'); rstBtn.className = 'btn';
  rstBtn.textContent = '↻ Reset';
  rstBtn.onclick = () => {
    if (tmr) { clearInterval(tmr); tmr = null; autoBtn.classList.remove('active'); }
    init(); draw();
  };
  ctrl.appendChild(rstBtn);

  init();
  draw();

  return () => {
    try {
      if (typeof tmr !== 'undefined' && tmr) clearInterval(tmr);
      if (el) el.innerHTML = '';
    } catch (e) {}
  };
}
