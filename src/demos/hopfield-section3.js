import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

// ===== demo-hopfield =====
export function mountHopfield(containerId = 'demo-hopfield') {
  const __id = containerId || 'demo-hopfield';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Load a pattern → Add Noise (30%) → Recall — watch the network recover stored memories! Click any cell to flip it manually.');

  const ROWS = 6, COLS = 8, N = ROWS * COLS; // 48 neurons

  // Three stored patterns encoded as ±1
  // Pattern ①: Plus cross   (vertical bar at cols 3–4, horizontal bar at rows 2–3)
  // Pattern ②: Square frame (border all +1, interior all −1)
  // Pattern ③: X shape      (two diagonals)
  const P = [
    [-1,-1,-1,+1,+1,-1,-1,-1, -1,-1,-1,+1,+1,-1,-1,-1,
     +1,+1,+1,+1,+1,+1,+1,+1, +1,+1,+1,+1,+1,+1,+1,+1,
     -1,-1,-1,+1,+1,-1,-1,-1, -1,-1,-1,+1,+1,-1,-1,-1],
    [+1,+1,+1,+1,+1,+1,+1,+1, +1,-1,-1,-1,-1,-1,-1,+1,
     +1,-1,-1,-1,-1,-1,-1,+1, +1,-1,-1,-1,-1,-1,-1,+1,
     +1,-1,-1,-1,-1,-1,-1,+1, +1,+1,+1,+1,+1,+1,+1,+1],
    [+1,+1,-1,-1,-1,-1,+1,+1, -1,+1,+1,-1,-1,+1,+1,-1,
     -1,-1,+1,+1,+1,+1,-1,-1, -1,-1,+1,+1,+1,+1,-1,-1,
     -1,+1,+1,-1,-1,+1,+1,-1, +1,+1,-1,-1,-1,-1,+1,+1]
  ];

  const PNAMES = ['① Plus (+)', '② Frame (□)', '③ Cross (×)'];
  const PCOLS  = ['#ffd166',    '#34d399',      '#f472b6'];

  // Hebbian learning: W_ij = (1/N) Σ_k ξ_k[i] ξ_k[j],  W_ii = 0
  const W = Array.from({length: N}, () => new Float32Array(N));
  for (let k = 0; k < 3; k++)
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        if (i !== j) W[i][j] += P[k][i] * P[k][j] / N;

  let state = [...P[0]], iter = 0, recalling = false, converged = false, tmr = null;

  function energy() {
    let e = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) e -= 0.5 * W[i][j] * state[i] * state[j];
    return e;
  }
  function overlap(k) { let s = 0; for (let i = 0; i < N; i++) s += state[i] * P[k][i]; return s / N; }
  function addNoise(p) { state = state.map(s => Math.random() < p ? -s : s); iter = 0; converged = false; }

  // Asynchronous update in random order — energy is guaranteed non-increasing
  function recallStep() {
    const ord = Array.from({length: N}, (_, i) => i).sort(() => Math.random() - 0.5);
    let ch = 0;
    for (const i of ord) {
      let h = 0; for (let j = 0; j < N; j++) h += W[i][j] * state[j];
      const ns = h >= 0 ? 1 : -1;
      if (ns !== state[i]) { state[i] = ns; ch++; }
    }
    iter++; return ch;
  }

  // ── Layout ──────────────────────────────────────────────────────────────
  const LX = 4, LW = 166;          // left panel  (x=4, w=166)
  const LP = LX + LW;              // divider x = 170
  const mCS = 10;                  // mini cell size: 8×10=80 wide, 6×10=60 tall
  const mGX = LX + Math.floor((LW - COLS * mCS) / 2); // mini grid centered in panel ≈ 47
  const CS  = 36;                  // main cell size: 8×36=288 wide, 6×36=216 tall
  const GX  = LP + 25;             // main grid start x = 195
  const GY  = Math.floor((340 - ROWS * CS) / 2); // vertical center = 62
  // info overlay
  const IX  = GX + COLS * CS + 18; // x right of main grid (=195+288+18=501)
  const IW  = 750 - IX - 6;        // width = 243

  function drawCells(pat, ax, ay, cs, tint) {
    for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
      const v = pat[r * COLS + cc];
      ctx.fillStyle = v > 0 ? (tint || 'rgba(228,226,223,0.88)') : 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.roundRect(ax + cc * cs + 1, ay + r * cs + 1, cs - 2, cs - 2, cs > 20 ? 5 : 2);
      ctx.fill();
    }
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);

    // ── Left panel ───────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(6,6,12,0.72)';
    ctx.beginPath(); ctx.roundRect(LX, 4, LW, 332, 8); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 8px Fira Code';
    ctx.fillText('STORED MEMORIES', LX + 6, 16);

    const ovs  = [overlap(0), overlap(1), overlap(2)];
    const best = ovs.reduce((b, _, i) => Math.abs(ovs[i]) > Math.abs(ovs[b]) ? i : b, 0);

    for (let k = 0; k < 3; k++) {
      const ty = 22 + k * 102;
      if (k === best) {
        ctx.fillStyle = 'rgba(255,209,102,0.05)';
        ctx.beginPath(); ctx.roundRect(LX + 2, ty + 1, LW - 4, 98, 5); ctx.fill();
      }
      ctx.fillStyle = PCOLS[k]; ctx.font = '600 9px Fira Code';
      ctx.fillText(PNAMES[k], LX + 5, ty + 12);
      drawCells(P[k], mGX, ty + 14, mCS, PCOLS[k]);

      // overlap bar
      const bx = LX + 4, bw = LW - 8, by = ty + 14 + ROWS * mCS + 4;
      const ov = ovs[k];
      ctx.fillStyle = 'rgba(255,255,255,0.07)';
      ctx.beginPath(); ctx.roundRect(bx, by, bw, 7, 3); ctx.fill();
      ctx.fillStyle = ov > 0.5 ? PCOLS[k] : ov > 0 ? '#7d7a8c' : '#ff6b6b';
      ctx.beginPath(); ctx.roundRect(bx, by, Math.abs(ov) * bw, 7, 3); ctx.fill();
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
      ctx.fillText('m=' + ov.toFixed(2), bx, by + 17);
      if (k === best) { ctx.fillStyle = PCOLS[k]; ctx.fillText('◀ match', bx + 45, by + 17); }
    }

    // divider
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(LP + 1, 8); ctx.lineTo(LP + 1, 332); ctx.stroke();

    // ── Main grid label ──────────────────────────────────────────────────
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 8px Fira Code';
    ctx.fillText('CURRENT STATE  · click cells to flip', GX, GY - 10);

    // Draw main grid cells
    drawCells(state, GX, GY, CS);

    // ±1 value labels inside each cell
    ctx.font = '700 9px Fira Code'; ctx.textAlign = 'center';
    for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) {
      const v = state[r * COLS + cc];
      ctx.fillStyle = v > 0 ? 'rgba(6,6,12,0.45)' : 'rgba(255,255,255,0.18)';
      ctx.fillText(v > 0 ? '+1' : '−1', GX + cc * CS + CS / 2, GY + r * CS + CS / 2 + 4);
    }
    ctx.textAlign = 'left';

    // ── Info overlay (dark semi-transparent panel) ───────────────────────
    const E = energy();
    const IY = 8;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, 112, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code';
    ctx.fillText('Hopfield Network', IX + 10, IY + 17);

    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
    ctx.fillText('E = −½ ΣᵢΣⱼ Wᵢⱼ sᵢ sⱼ', IX + 10, IY + 31);
    ctx.fillText('sᵢ ← sign(Σⱼ Wᵢⱼ sⱼ)  [async]', IX + 10, IY + 44);

    ctx.fillStyle = '#38bdf8'; ctx.font = '600 10px Fira Code';
    ctx.fillText('Energy:  ' + E.toFixed(3), IX + 10, IY + 60);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Iterations: ' + iter, IX + 10, IY + 74);
    ctx.fillStyle = PCOLS[best];
    ctx.fillText('≈ ' + PNAMES[best] + '   m=' + ovs[best].toFixed(3), IX + 10, IY + 88);

    // status badge
    if (converged) {
      ctx.fillStyle = 'rgba(52,211,153,0.18)';
      ctx.beginPath(); ctx.roundRect(IX + IW - 90, IY + 4, 82, 16, 5); ctx.fill();
      ctx.fillStyle = '#34d399'; ctx.font = '700 8px Fira Code';
      ctx.fillText('CONVERGED ✓', IX + IW - 86, IY + 15);
    } else if (recalling) {
      ctx.fillStyle = 'rgba(255,107,107,0.18)';
      ctx.beginPath(); ctx.roundRect(IX + IW - 88, IY + 4, 80, 16, 5); ctx.fill();
      ctx.fillStyle = '#ff6b6b'; ctx.font = '700 8px Fira Code';
      ctx.fillText('RECALLING…', IX + IW - 84, IY + 15);
    }

    // energy bar (shows how far from min energy)
    const rawMinE = -0.5 * N * 3; // rough lower bound
    const frac = Math.max(0, Math.min(1, (E - rawMinE) / (0 - rawMinE)));
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(IX + 10, IY + 95, IW - 20, 10, 4); ctx.fill();
    const gr = ctx.createLinearGradient(IX + 10, 0, IX + 10 + (IW - 20), 0);
    gr.addColorStop(0, '#38bdf8'); gr.addColorStop(1, '#34d399');
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.roundRect(IX + 10, IY + 95, (IW - 20) * (1 - frac), 10, 4); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 7px Fira Code';
    ctx.fillText('energy', IX + 12, IY + 103);
    ctx.fillText('↓ low', IX + IW - 40, IY + 103);
  }

  // Click main grid to flip a neuron
  c.onclick = e => {
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * 750 / r.width;
    const my = (e.clientY - r.top)  * 340 / r.height;
    const cc = Math.floor((mx - GX) / CS), cr = Math.floor((my - GY) / CS);
    if (cc >= 0 && cc < COLS && cr >= 0 && cr < ROWS) {
      state[cr * COLS + cc] *= -1; iter = 0; converged = false; draw();
    }
  };

  const ctrl = addControls(el);

  // Load pattern buttons (colored borders)
  P.forEach((_, k) => {
    const b = document.createElement('button'); b.className = 'btn';
    b.textContent = 'Load P' + (k + 1); b.style.borderColor = PCOLS[k];
    b.onclick = () => {
      state = [...P[k]]; iter = 0; converged = false;
      if (tmr) { clearInterval(tmr); tmr = null; rb.classList.remove('active'); recalling = false; }
      draw();
    };
    ctrl.appendChild(b);
  });

  const nb = document.createElement('button'); nb.className = 'btn';
  nb.textContent = '⚡ Add Noise 30%';
  nb.onclick = () => { addNoise(0.30); draw(); };
  ctrl.appendChild(nb);

  // Recall — runs async update steps until convergence
  const rb = document.createElement('button'); rb.className = 'btn';
  rb.textContent = '▶ Recall';
  rb.onclick = () => {
    if (tmr) {
      clearInterval(tmr); tmr = null; rb.classList.remove('active'); recalling = false; draw(); return;
    }
    recalling = true; converged = false; rb.classList.add('active');
    tmr = setInterval(() => {
      const ch = recallStep(); draw();
      if (ch === 0) {
        clearInterval(tmr); tmr = null; rb.classList.remove('active');
        recalling = false; converged = true; draw();
      }
    }, 180);
  };
  ctrl.appendChild(rb);

  const rst = document.createElement('button'); rst.className = 'btn';
  rst.textContent = '↻ Reset';
  rst.onclick = () => {
    state = [...P[0]]; iter = 0; converged = false;
    if (tmr) { clearInterval(tmr); tmr = null; rb.classList.remove('active'); recalling = false; }
    draw();
  };
  ctrl.appendChild(rst);

  draw();

  return () => {
    try {
      if (c) c.onclick = null;
      if (typeof tmr !== 'undefined' && tmr) clearInterval(tmr);
      if (typeof animId !== 'undefined' && animId) cancelAnimationFrame(animId);
      if (el) el.innerHTML = '';
    } catch (e) {}
  };
}
