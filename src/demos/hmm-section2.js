import { $, createCanvas, addHint, addControls, TAU } from '../lib/shared.js'

// ===== demo-hmm =====
export function mountHmm(containerId = 'demo-hmm') {
  const __id = containerId || 'demo-hmm';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Click ▶ Step to emit one observation. Watch Viterbi decode the most likely hidden state sequence. Click a hidden state manually to force a step from there.');

  // ── Model: 2 hidden states (Bull / Bear market), 3 observations (Rise/Flat/Drop) ──
  const STATES   = ['Bull 🐂', 'Bear 🐻'];
  const SCOLS    = ['#34d399', '#ff6b6b'];
  const OBS      = ['Rise ↑', 'Flat →', 'Drop ↓'];
  const OCOLS    = ['#34d399', '#94a3b8', '#ff6b6b'];

  //          from Bull   from Bear
  const A = [[0.70, 0.30], [0.40, 0.60]]; // transition[i][j] = P(j|i)
  //          Rise  Flat  Drop
  const B = [[0.60, 0.30, 0.10],  // Bull emission
             [0.10, 0.30, 0.60]]; // Bear emission
  const PI = [0.60, 0.40];         // initial

  let curState  = 0;   // true hidden state (sim)
  let obsSeq    = [];  // observed sequence
  let hidSeq    = [];  // true hidden (revealed after)
  let viterbi   = [];  // Viterbi decoded
  let step      = 0;
  let showTrue  = false;

  function sampleFrom(dist) {
    let r = Math.random(), cum = 0;
    for (let i = 0; i < dist.length; i++) { cum += dist[i]; if (r < cum) return i; }
    return dist.length - 1;
  }

  function doStep() {
    if (step === 0) curState = sampleFrom(PI);
    else            curState = sampleFrom(A[curState]);
    const obs = sampleFrom(B[curState]);
    obsSeq.push(obs);
    hidSeq.push(curState);
    step++;
    viterbi = runViterbi(obsSeq);
  }

  // Viterbi algorithm
  function runViterbi(os) {
    const T = os.length, S = STATES.length;
    const dp     = Array.from({length: T}, () => new Float64Array(S));
    const backpt = Array.from({length: T}, () => new Int8Array(S));
    for (let s = 0; s < S; s++) dp[0][s] = PI[s] * B[s][os[0]];
    for (let t = 1; t < T; t++) {
      for (let s = 0; s < S; s++) {
        let best = -1, bestS = 0;
        for (let p = 0; p < S; p++) {
          const v = dp[t-1][p] * A[p][s];
          if (v > best) { best = v; bestS = p; }
        }
        dp[t][s] = best * B[s][os[t]];
        backpt[t][s] = bestS;
      }
    }
    // traceback
    const path = new Int8Array(T);
    path[T-1] = dp[T-1][0] > dp[T-1][1] ? 0 : 1;
    for (let t = T-2; t >= 0; t--) path[t] = backpt[t+1][path[t+1]];
    return Array.from(path);
  }

  // ── Layout constants ─────────────────────────────────────────────────────
  const SEQ_X0   = 30;
  const ROW_HID  = 60;   // y centre of hidden state row
  const ROW_OBS  = 140;  // y centre of observation row
  const ROW_VIT  = 220;  // y centre of Viterbi row
  const CELL_W   = 56;
  const MAX_SHOW = 12;   // max cells to render

  function draw() {
    ctx.clearRect(0, 0, 750, 340);

    // ── Left model diagram ──────────────────────────────────────────────
    const PM = { x: 560, y: 60, r: 36 };
    const PB = { x: 700, y: 60, r: 36 };

    // Panel background
    ctx.fillStyle = 'rgba(6,6,12,0.88)';
    ctx.beginPath(); ctx.roundRect(540, 8, 204, 210, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 10px Fira Code';
    ctx.textAlign = 'center';
    ctx.fillText('HMM Structure', 642, 24);

    // Transition arrows
    [[PM, PB, A[0][1], SCOLS[0]], [PB, PM, A[1][0], SCOLS[1]]].forEach(([f, t, p, col]) => {
      const dx = t.x - f.x, dy = t.y - f.y, len = Math.hypot(dx, dy);
      const nx = dx / len, ny = dy / len, ox = -ny * 12, oy = nx * 12;
      const sx = f.x + nx * f.r + ox, sy = f.y + ny * f.r + oy;
      const ex = t.x - nx * t.r + ox, ey = t.y - ny * t.r + oy;
      ctx.strokeStyle = col + 'aa'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
      ctx.fillStyle = col + 'aa';
      ctx.beginPath(); ctx.moveTo(ex, ey);
      const al = 9;
      ctx.lineTo(ex - al*nx + al*0.4*ny, ey - al*ny - al*0.4*nx);
      ctx.lineTo(ex - al*nx - al*0.4*ny, ey - al*ny + al*0.4*nx);
      ctx.fill();
      ctx.fillStyle = '#e4e2df'; ctx.font = '600 9px Fira Code';
      ctx.fillText((p*100|0)+'%', (sx+ex)/2+ox*0.3, (sy+ey)/2+oy*0.3);
    });
    // Self-transitions
    [[PM, A[0][0], SCOLS[0]], [PB, A[1][1], SCOLS[1]]].forEach(([p, prob, col]) => {
      ctx.strokeStyle = col + '88'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y - p.r - 14, 14, 0.4*Math.PI, 0.6*Math.PI, true); ctx.stroke();
      ctx.fillStyle = '#e4e2df'; ctx.font = '500 8px Fira Code';
      ctx.fillText((prob*100|0)+'%', p.x, p.y - p.r - 30);
    });
    // Nodes
    [PM, PB].forEach((p, i) => {
      ctx.save(); ctx.shadowColor = SCOLS[i]; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU);
      ctx.fillStyle = SCOLS[i] + '22'; ctx.fill();
      ctx.strokeStyle = SCOLS[i]; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = SCOLS[i]; ctx.font = '600 9px Fira Code';
      ctx.fillText(STATES[i], p.x, p.y + 4);
    });
    ctx.textAlign = 'left';

    // Emission probs
    const EY = 120;
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 8px Fira Code';
    ctx.fillText('Emission B(obs|state):', 548, EY);
    STATES.forEach((s, i) => {
      ctx.fillStyle = SCOLS[i]; ctx.font = '600 8px Fira Code';
      ctx.fillText(s + ':', 548, EY + 14 + i * 44);
      OBS.forEach((o, j) => {
        const bw = 60 * B[i][j];
        ctx.fillStyle = OCOLS[j] + '33';
        ctx.beginPath(); ctx.roundRect(548, EY + 18 + i*44 + j*12, bw, 10, 2); ctx.fill();
        ctx.fillStyle = '#e4e2df'; ctx.font = '400 8px Fira Code';
        ctx.fillText(o + ' ' + (B[i][j]*100|0)+'%', 550, EY + 27 + i*44 + j*12);
      });
    });

    // ── Sequence area (left part) ────────────────────────────────────────
    if (step === 0) {
      ctx.fillStyle = '#4a475a'; ctx.font = '400 11px Fira Code';
      ctx.fillText('Press ▶ Step to start emitting observations…', SEQ_X0, 170);
      // Labels even when empty
      ['Hidden Zₜ', 'Observed Xₜ', 'Viterbi Ẑₜ'].forEach((lbl, i) => {
        const y = [ROW_HID, ROW_OBS, ROW_VIT][i];
        ctx.fillStyle = '#4a475a'; ctx.font = '500 9px Fira Code';
        ctx.fillText(lbl, SEQ_X0, y + 5);
      });
      return;
    }

    const start = Math.max(0, step - MAX_SHOW);
    const show  = Math.min(step, MAX_SHOW);

    // Row labels
    [['Hidden Zₜ', ROW_HID, '#7d7a8c'],
     ['Observed Xₜ', ROW_OBS, '#7d7a8c'],
     ['Viterbi Ẑₜ', ROW_VIT, '#ffd166']].forEach(([lbl, y, col]) => {
      ctx.fillStyle = col; ctx.font = '500 9px Fira Code';
      ctx.fillText(lbl, SEQ_X0, y - 30);
    });

    for (let di = 0; di < show; di++) {
      const ti  = start + di;
      const cx  = SEQ_X0 + di * CELL_W + 24;

      // Time label
      ctx.fillStyle = '#4a475a'; ctx.font = '400 8px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText('t=' + (ti + 1), cx, ROW_HID - 18);

      // Hidden state cell (revealed only if showTrue)
      const hs = hidSeq[ti];
      const hCol = showTrue ? SCOLS[hs] : '#2a2a48';
      ctx.fillStyle = hCol + (showTrue ? '33' : '');
      ctx.beginPath(); ctx.roundRect(cx - 22, ROW_HID - 14, 44, 28, 5); ctx.fill();
      ctx.strokeStyle = showTrue ? SCOLS[hs] : '#3a3a58';
      ctx.lineWidth = 1.5; ctx.beginPath(); ctx.roundRect(cx - 22, ROW_HID - 14, 44, 28, 5); ctx.stroke();
      ctx.fillStyle = showTrue ? SCOLS[hs] : '#4a475a';
      ctx.font = '600 8px Fira Code';
      ctx.fillText(showTrue ? STATES[hs].split(' ')[1] : '?', cx, ROW_HID + 5);

      // Emission arrow
      ctx.strokeStyle = OCOLS[obsSeq[ti]] + '66'; ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cx, ROW_HID + 14); ctx.lineTo(cx, ROW_OBS - 14); ctx.stroke();
      ctx.setLineDash([]);

      // Observation cell
      const oc = obsSeq[ti];
      ctx.fillStyle = OCOLS[oc] + '33';
      ctx.beginPath(); ctx.roundRect(cx - 22, ROW_OBS - 14, 44, 28, 5); ctx.fill();
      ctx.strokeStyle = OCOLS[oc]; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(cx - 22, ROW_OBS - 14, 44, 28, 5); ctx.stroke();
      ctx.fillStyle = OCOLS[oc]; ctx.font = '700 9px Fira Code';
      ctx.fillText(OBS[oc].slice(-1), cx - 4, ROW_OBS + 5);

      // Viterbi path cell
      const vs = viterbi[ti];
      const correct = vs === hs;
      ctx.fillStyle = SCOLS[vs] + '22';
      ctx.beginPath(); ctx.roundRect(cx - 22, ROW_VIT - 14, 44, 28, 5); ctx.fill();
      ctx.strokeStyle = showTrue ? (correct ? '#34d399' : '#ff6b6b') : SCOLS[vs];
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(cx - 22, ROW_VIT - 14, 44, 28, 5); ctx.stroke();
      ctx.fillStyle = SCOLS[vs]; ctx.font = '600 8px Fira Code';
      ctx.fillText(STATES[vs].split(' ')[1], cx, ROW_VIT + 5);

      // Transition arrows between Viterbi cells
      if (di > 0) {
        const px = SEQ_X0 + (di - 1) * CELL_W + 24;
        ctx.strokeStyle = SCOLS[vs] + '66'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px + 22, ROW_VIT); ctx.lineTo(cx - 22, ROW_VIT); ctx.stroke();
      }

      ctx.textAlign = 'left';
    }

    // ── Info overlay ─────────────────────────────────────────────────────
    const IX = 540, IY = 242, IW = 204, IH = 90;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, IH, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 10px Fira Code';
    ctx.fillText('Viterbi: argmax P(Z|X)', IX + 8, IY + 14);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('δₜ(s) = max_{z} P(z₁…zₜ₋₁, xₜ | s) · A[prev→s] · B[s, xₜ]', IX + 8, IY + 27);
    ctx.fillText('Steps so far: ' + step, IX + 8, IY + 42);

    if (showTrue) {
      const correct = viterbi.filter((v, i) => v === hidSeq[i]).length;
      ctx.fillStyle = '#34d399'; ctx.font = '600 9px Fira Code';
      ctx.fillText('Accuracy: ' + correct + '/' + step + ' = ' + (correct/step*100).toFixed(0) + '%', IX + 8, IY + 56);
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
      ctx.fillText('Green border = correct, red = wrong', IX + 8, IY + 70);
    } else {
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
      ctx.fillText('Click "Reveal Truth" to see accuracy', IX + 8, IY + 56);
    }
  }

  // ── Controls ─────────────────────────────────────────────────────────────
  const ctrl = addControls(el);

  const stepBtn = document.createElement('button'); stepBtn.className = 'btn';
  stepBtn.textContent = '▶ Step';
  stepBtn.onclick = () => { doStep(); draw(); };
  ctrl.appendChild(stepBtn);

  let tmr = null;
  const autoBtn = document.createElement('button'); autoBtn.className = 'btn';
  autoBtn.textContent = '⏩ Auto';
  autoBtn.onclick = () => {
    if (tmr) { clearInterval(tmr); tmr = null; autoBtn.classList.remove('active'); }
    else { tmr = setInterval(() => { doStep(); draw(); }, 700); autoBtn.classList.add('active'); }
  };
  ctrl.appendChild(autoBtn);

  const revealBtn = document.createElement('button'); revealBtn.className = 'btn';
  revealBtn.textContent = '👁 Reveal Truth';
  revealBtn.onclick = () => { showTrue = !showTrue; revealBtn.classList.toggle('active', showTrue); draw(); };
  ctrl.appendChild(revealBtn);

  const rstBtn = document.createElement('button'); rstBtn.className = 'btn';
  rstBtn.textContent = '↻ Reset';
  rstBtn.onclick = () => {
    obsSeq = []; hidSeq = []; viterbi = []; step = 0; showTrue = false; curState = 0;
    if (tmr) { clearInterval(tmr); tmr = null; autoBtn.classList.remove('active'); }
    revealBtn.classList.remove('active');
    draw();
  };
  ctrl.appendChild(rstBtn);

  draw();

  return () => {
    try {
      if (typeof tmr !== 'undefined' && tmr) clearInterval(tmr);
      if (el) el.innerHTML = '';
    } catch (e) {}
  };
}
