import { $, createCanvas, addHint, addControls, clamp } from '../lib/shared.js'

// ===== demo-shannon =====
export function mountShannon(containerId = 'demo-shannon') {
  const __id = containerId || 'demo-shannon';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Drag the probability bars to change the distribution. Watch entropy rise toward maximum (uniform) and fall toward zero (certain).');

  // 6 symbols: A B C D E F
  const SYMS  = ['A', 'B', 'C', 'D', 'E', 'F'];
  const COLS  = ['#ffd166', '#38bdf8', '#f472b6', '#34d399', '#fb923c', '#a78bfa'];
  const N     = SYMS.length;
  let probs   = [0.40, 0.25, 0.15, 0.10, 0.06, 0.04]; // sums to 1
  let dragging = -1;

  function entropy(ps) {
    return -ps.reduce((s, p) => s + (p > 1e-10 ? p * Math.log2(p) : 0), 0);
  }
  const maxH = Math.log2(N); // uniform distribution → log2(6) ≈ 2.585

  // --- renormalize keeping dragged bar fixed, scale rest proportionally
  function setProb(idx, val) {
    val = clamp(val, 0.01, 0.98);
    const rest = 1 - val;
    const oldRest = 1 - probs[idx];
    if (oldRest < 1e-6) {
      // distribute rest equally
      probs = probs.map((_, i) => i === idx ? val : rest / (N - 1));
    } else {
      probs = probs.map((p, i) => i === idx ? val : p * (rest / oldRest));
    }
    // final clamp to ensure sum = 1
    const s = probs.reduce((a, b) => a + b, 0);
    probs = probs.map(p => p / s);
  }

  // Bar geometry
  const BAR_X  = 32;
  const BAR_W  = 90;
  const BAR_GAP = 14;
  const BAR_BH  = 180; // max bar height in px
  const BAR_BOT = 268; // y of bottom of bars

  function barTop(i) { return BAR_BOT - probs[i] * BAR_BH; }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);
    const H = entropy(probs);

    // ── Bars ────────────────────────────────────────────────────────────
    const codeLen = probs.map(p => p > 1e-10 ? -Math.log2(p) : 0);

    for (let i = 0; i < N; i++) {
      const bx = BAR_X + i * (BAR_W + BAR_GAP);
      const bt = barTop(i);
      const bh = BAR_BOT - bt;

      // Shadow glow
      ctx.save();
      ctx.shadowColor = COLS[i];
      ctx.shadowBlur = 12;
      ctx.fillStyle = COLS[i] + 'cc';
      ctx.beginPath();
      ctx.roundRect(bx, bt, BAR_W, bh, [6, 6, 0, 0]);
      ctx.fill();
      ctx.restore();

      // Subtle fill
      ctx.fillStyle = COLS[i] + '33';
      ctx.beginPath();
      ctx.roundRect(bx, bt, BAR_W, bh, [6, 6, 0, 0]);
      ctx.fill();

      // Symbol label on bar
      ctx.fillStyle = COLS[i];
      ctx.font = '700 18px Fira Code';
      ctx.textAlign = 'center';
      ctx.fillText(SYMS[i], bx + BAR_W / 2, BAR_BOT + 18);

      // Probability above bar
      ctx.fillStyle = '#e4e2df';
      ctx.font = '600 10px Fira Code';
      ctx.fillText((probs[i] * 100).toFixed(1) + '%', bx + BAR_W / 2, bt - 6);

      // code length below label
      ctx.fillStyle = '#7d7a8c';
      ctx.font = '400 9px Fira Code';
      ctx.fillText('−log₂p=' + codeLen[i].toFixed(2) + ' bits', bx + BAR_W / 2, BAR_BOT + 30);
      ctx.textAlign = 'left';
    }

    // Baseline
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(BAR_X - 8, BAR_BOT);
    ctx.lineTo(BAR_X + N * (BAR_W + BAR_GAP), BAR_BOT);
    ctx.stroke();

    // ── Info overlay ────────────────────────────────────────────────────
    const IX = 620, IY = 8, IW = 124, IH = 200;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, IH, 8); ctx.fill();

    ctx.fillStyle = '#ffd166';
    ctx.font = '700 11px Fira Code';
    ctx.fillText('Shannon Entropy', IX + 8, IY + 16);

    ctx.fillStyle = '#7d7a8c';
    ctx.font = '400 8px Fira Code';
    ctx.fillText('H = −Σ p log₂ p', IX + 8, IY + 30);
    ctx.fillText('bits per symbol', IX + 8, IY + 41);

    // Big H value
    ctx.fillStyle = '#38bdf8';
    ctx.font = '700 22px Fira Code';
    ctx.fillText(H.toFixed(3), IX + 8, IY + 70);
    ctx.fillStyle = '#7d7a8c';
    ctx.font = '400 9px Fira Code';
    ctx.fillText('bits / symbol', IX + 8, IY + 82);

    // H bar
    const barW2 = IW - 16;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(IX + 8, IY + 90, barW2, 12, 4); ctx.fill();
    const frac = H / maxH;
    const grad = ctx.createLinearGradient(IX + 8, 0, IX + 8 + barW2, 0);
    grad.addColorStop(0, '#38bdf8');
    grad.addColorStop(1, '#34d399');
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.roundRect(IX + 8, IY + 90, barW2 * frac, 12, 4); ctx.fill();

    ctx.fillStyle = '#7d7a8c';
    ctx.font = '400 8px Fira Code';
    ctx.fillText('H / H_max = ' + (frac * 100).toFixed(1) + '%', IX + 8, IY + 115);

    // Labels
    ctx.fillStyle = '#ff6b6b';
    ctx.font = '500 9px Fira Code';
    ctx.fillText(H < 0.4 ? '← Near certain' : H > maxH * 0.9 ? '← Near uniform' : '', IX + 8, IY + 128);

    ctx.fillStyle = '#7d7a8c';
    ctx.font = '400 8px Fira Code';
    ctx.fillText('max H (uniform):', IX + 8, IY + 142);
    ctx.fillStyle = '#34d399';
    ctx.fillText(maxH.toFixed(3) + ' bits', IX + 8, IY + 153);

    ctx.fillStyle = '#7d7a8c';
    ctx.fillText('Avg code length:', IX + 8, IY + 167);
    const avgCode = probs.reduce((s, p, i) => s + p * codeLen[i], 0);
    ctx.fillStyle = '#fb923c';
    ctx.fillText(avgCode.toFixed(3) + ' bits', IX + 8, IY + 178);

    ctx.fillStyle = '#7d7a8c';
    ctx.font = '400 7px Fira Code';
    ctx.fillText('H ≤ avg code length', IX + 8, IY + 192);

    // ── Entropy curve hint ───────────────────────────────────────────────
    ctx.fillStyle = 'rgba(6,6,12,0.82)';
    ctx.beginPath(); ctx.roundRect(BAR_X, 4, 300, 24, 5); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
    ctx.fillText('Drag bars ↕  ·  Uniform distribution = maximum entropy', BAR_X + 8, 19);
  }

  // ── Mouse interaction ────────────────────────────────────────────────────
  function getBarIdx(mx) {
    for (let i = 0; i < N; i++) {
      const bx = BAR_X + i * (BAR_W + BAR_GAP);
      if (mx >= bx && mx <= bx + BAR_W) return i;
    }
    return -1;
  }
  function probFromY(my) { return clamp((BAR_BOT - my) / BAR_BH, 0.01, 0.98); }

  c.onmousedown = e => {
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * 750 / r.width;
    const my = (e.clientY - r.top)  * 340 / r.height;
    dragging = getBarIdx(mx);
    if (dragging >= 0) { setProb(dragging, probFromY(my)); draw(); }
  };
  c.onmousemove = e => {
    if (dragging < 0) return;
    const r = c.getBoundingClientRect();
    const my = (e.clientY - r.top) * 340 / r.height;
    setProb(dragging, probFromY(my)); draw();
  };
  c.onmouseup = () => { dragging = -1; };
  c.onmouseleave = () => { dragging = -1; };

  const ctrl = addControls(el);

  const uniformBtn = document.createElement('button'); uniformBtn.className = 'btn';
  uniformBtn.textContent = '⟺ Uniform (max H)';
  uniformBtn.onclick = () => { probs = Array(N).fill(1 / N); draw(); };
  ctrl.appendChild(uniformBtn);

  const skewBtn = document.createElement('button'); skewBtn.className = 'btn';
  skewBtn.textContent = '↓ Skewed (low H)';
  skewBtn.onclick = () => { probs = [0.70, 0.12, 0.08, 0.05, 0.03, 0.02]; draw(); };
  ctrl.appendChild(skewBtn);

  const rstBtn = document.createElement('button'); rstBtn.className = 'btn';
  rstBtn.textContent = '↻ Reset';
  rstBtn.onclick = () => { probs = [0.40, 0.25, 0.15, 0.10, 0.06, 0.04]; draw(); };
  ctrl.appendChild(rstBtn);

  draw();

  return () => {
    try {
      if (c) { c.onmousedown = null; c.onmousemove = null; c.onmouseup = null; c.onmouseleave = null; }
      if (el) el.innerHTML = '';
    } catch (e) {}
  };
}
