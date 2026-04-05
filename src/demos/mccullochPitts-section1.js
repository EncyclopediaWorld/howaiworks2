import { $, createCanvas, addHint, addControls, TAU } from '../lib/shared.js'

// ===== demo-mccullochpitts =====
export function mountMcCullochPitts(containerId = 'demo-mccullochpitts') {
  const __id = containerId || 'demo-mccullochpitts';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Click input nodes to toggle 0/1. Right-click a connection to flip its weight sign (+1 excitatory ↔ −1 inhibitory). Try the preset logic gates!');

  let inputs  = [1, 1, 0];
  let weights = [1, 1, 1]; // +1 excitatory / −1 inhibitory
  let theta   = 2;

  const INS  = [{ x: 150, y: 80 }, { x: 150, y: 170 }, { x: 150, y: 260 }];
  const SUM  = { x: 400, y: 170 };
  const OUT  = { x: 590, y: 170 };

  function net() { return inputs.reduce((s, v, i) => s + weights[i] * v, 0); }
  function out()  { return net() >= theta ? 1 : 0; }

  // midpoint of each connection (for right-click hit test)
  function connMid(i) {
    return {
      x: (INS[i].x + 20 + SUM.x - 20) / 2,
      y: (INS[i].y + SUM.y) / 2,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);
    const s = net(), o = out();

    // ── Connections input → Σ ─────────────────────────────────────────
    inputs.forEach((inp, i) => {
      const w = weights[i], lit = inp === 1;
      ctx.strokeStyle = w < 0
        ? (lit ? '#ff6b6b' : '#ff6b6b33')
        : (lit ? '#ffd166' : '#ffd16622');
      ctx.lineWidth   = lit ? 2.5 : 1.2;
      ctx.setLineDash(w < 0 ? [5, 4] : []);
      ctx.beginPath();
      ctx.moveTo(INS[i].x + 20, INS[i].y);
      ctx.lineTo(SUM.x - 20, SUM.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // weight label
      const m = connMid(i);
      ctx.fillStyle = w < 0 ? '#ff6b6baa' : '#ffd166aa';
      ctx.font = '600 10px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText((w > 0 ? '+' : '') + w, m.x, m.y - 7);
      ctx.textAlign = 'left';
    });

    // ── Σ → output ────────────────────────────────────────────────────
    ctx.strokeStyle = o ? '#34d399' : '#ff6b6b66';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(SUM.x + 20, SUM.y);
    ctx.lineTo(OUT.x - 44, OUT.y);
    ctx.stroke();

    // mini step-function icon on the arrow
    const sx = SUM.x + 65, sy = SUM.y;
    ctx.strokeStyle = o ? '#34d399aa' : '#ff6b6b88'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx - 12, sy + 7); ctx.lineTo(sx - 12, sy - 7);
    ctx.lineTo(sx,      sy - 7); ctx.lineTo(sx,      sy + 7);
    ctx.lineTo(sx + 12, sy + 7);
    ctx.stroke();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code'; ctx.textAlign = 'center';
    ctx.fillText('step()', sx, sy + 19); ctx.textAlign = 'left';

    // ── Input nodes ───────────────────────────────────────────────────
    inputs.forEach((inp, i) => {
      ctx.save();
      if (inp) { ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 16; }
      ctx.beginPath(); ctx.arc(INS[i].x, INS[i].y, 20, 0, TAU);
      ctx.fillStyle = inp ? '#ffd16622' : '#0c0c18'; ctx.fill();
      ctx.strokeStyle = inp ? '#ffd166' : '#2a2a48'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      ctx.fillStyle = inp ? '#ffd166' : '#4a475a';
      ctx.font = '700 16px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText(inp, INS[i].x, INS[i].y + 6);
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
      ctx.fillText('x' + (i + 1), INS[i].x - 36, INS[i].y + 4);
      ctx.textAlign = 'left';
    });

    // ── Summation node ────────────────────────────────────────────────
    ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(SUM.x, SUM.y, 22, 0, TAU);
    ctx.fillStyle = '#0c0c18'; ctx.fill();
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#38bdf8'; ctx.font = '700 16px Fira Code'; ctx.textAlign = 'center';
    ctx.fillText('Σ', SUM.x, SUM.y + 6);
    ctx.fillStyle = '#ffd166'; ctx.font = '700 12px Fira Code';
    ctx.fillText(s.toFixed(0), SUM.x, SUM.y - 30);
    ctx.textAlign = 'left';

    // ── Output neuron ─────────────────────────────────────────────────
    ctx.save();
    if (o) { ctx.shadowColor = '#34d399'; ctx.shadowBlur = 30; }
    ctx.beginPath(); ctx.arc(OUT.x, OUT.y, 44, 0, TAU);
    ctx.fillStyle = o ? '#34d39918' : '#ff6b6b08'; ctx.fill();
    ctx.strokeStyle = o ? '#34d399' : '#ff6b6b'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = o ? '#34d399' : '#ff6b6b';
    ctx.font = '700 30px Fira Code'; ctx.textAlign = 'center';
    ctx.fillText(o, OUT.x, OUT.y + 10);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
    ctx.fillText('y', OUT.x, OUT.y + 28);
    ctx.textAlign = 'left';

    // ── Info overlay ──────────────────────────────────────────────────
    const IX = 8, IY = 8, IW = 172, IH = 164;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, IH, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code';
    ctx.fillText('McCulloch-Pitts Neuron', IX + 8, IY + 16);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('y = 1  if  Σᵢ wᵢxᵢ ≥ θ,  else 0', IX + 8, IY + 29);

    ctx.fillStyle = '#38bdf8'; ctx.font = '600 10px Fira Code';
    ctx.fillText('Σwᵢxᵢ = ' + s.toFixed(0), IX + 8, IY + 46);
    ctx.fillText('θ      = ' + theta, IX + 8, IY + 59);

    // sum vs theta bar
    const BAR_W = IW - 16, maxAbs = 4;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.roundRect(IX + 8, IY + 64, BAR_W, 10, 3); ctx.fill();
    const frac = Math.max(0, Math.min(1, (s + maxAbs) / (2 * maxAbs)));
    ctx.fillStyle = o ? '#34d399' : '#ff6b6b';
    ctx.beginPath(); ctx.roundRect(IX + 8, IY + 64, BAR_W * frac, 10, 3); ctx.fill();
    const tFrac = (theta + maxAbs) / (2 * maxAbs);
    ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(IX + 8 + BAR_W * tFrac, IY + 62);
    ctx.lineTo(IX + 8 + BAR_W * tFrac, IY + 76);
    ctx.stroke();
    ctx.fillStyle = '#ffd166'; ctx.font = '500 7px Fira Code'; ctx.textAlign = 'center';
    ctx.fillText('θ', IX + 8 + BAR_W * tFrac, IY + 84); ctx.textAlign = 'left';

    ctx.fillStyle = o ? '#34d399' : '#ff6b6b';
    ctx.font = '700 12px Fira Code';
    ctx.fillText(o ? '● FIRED ✓' : '○ SILENT ✗', IX + 8, IY + 101);

    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('━ excitatory  (+1)', IX + 8, IY + 116);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText('- - inhibitory (−1)', IX + 8, IY + 128);
    ctx.fillStyle = '#7d7a8c';
    ctx.fillText('1943 · McCulloch & Pitts', IX + 8, IY + 143);
    ctx.fillText('First mathematical neuron', IX + 8, IY + 155);
  }

  // Click to toggle inputs
  c.onclick = e => {
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * 750 / r.width;
    const my = (e.clientY - r.top)  * 340 / r.height;
    let hit = false;
    INS.forEach((n, i) => { if (Math.hypot(mx - n.x, my - n.y) < 24) { inputs[i] ^= 1; hit = true; } });
    if (hit) draw();
  };

  // Right-click connection to flip weight
  c.oncontextmenu = e => {
    e.preventDefault();
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * 750 / r.width;
    const my = (e.clientY - r.top)  * 340 / r.height;
    INS.forEach((_, i) => {
      const m = connMid(i);
      if (Math.hypot(mx - m.x, my - m.y) < 22) { weights[i] *= -1; draw(); }
    });
  };

  const ctrl = addControls(el);

  [
    { label: 'AND',          w: [1, 1, 0],  th: 2, ins: [1, 1, 0] },
    { label: 'OR',           w: [1, 1, 0],  th: 1, ins: [1, 0, 0] },
    { label: 'NOT x₁',       w: [-1, 0, 0], th: 0, ins: [0, 0, 0] },
    { label: 'x₁ AND NOT x₂', w:[1,-1, 0],  th: 1, ins: [1, 1, 0] },
  ].forEach(p => {
    const b = document.createElement('button'); b.className = 'btn';
    b.textContent = p.label;
    b.onclick = () => { weights = [...p.w]; theta = p.th; inputs = [...p.ins]; tSlider.value = theta; tVal.textContent = theta; draw(); };
    ctrl.appendChild(b);
  });

  const lbl = document.createElement('span');
  lbl.style.cssText = 'font:9px Fira Code,monospace;color:#7d7a8c;margin:0 4px';
  lbl.textContent = 'θ:'; ctrl.appendChild(lbl);

  const tSlider = document.createElement('input');
  tSlider.type = 'range'; tSlider.min = '-2'; tSlider.max = '4'; tSlider.step = '1'; tSlider.value = '2';
  tSlider.style.cssText = 'width:70px;accent-color:#ffd166';
  const tVal = document.createElement('span');
  tVal.className = 'btn'; tVal.textContent = '2'; tVal.style.minWidth = '22px';
  tSlider.oninput = () => { theta = +tSlider.value; tVal.textContent = theta; draw(); };
  ctrl.appendChild(tSlider); ctrl.appendChild(tVal);

  const rst = document.createElement('button'); rst.className = 'btn'; rst.textContent = '↻ Reset';
  rst.onclick = () => { inputs = [1,1,0]; weights = [1,1,1]; theta = 2; tSlider.value='2'; tVal.textContent='2'; draw(); };
  ctrl.appendChild(rst);

  draw();
  return () => {
    try {
      if (c) { c.onclick = null; c.oncontextmenu = null; }
      if (el) el.innerHTML = '';
    } catch (e) {}
  };
}
