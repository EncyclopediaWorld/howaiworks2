import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

// ===== demo-pca =====
export function mountPca(containerId = 'demo-pca') {
  const __id = containerId || 'demo-pca';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Click ↻ Regenerate for a new dataset. Drag either arrowhead to rotate PC1. Watch the projected variance on the axis below — PCA finds the direction of maximum variance.');

  const N = 60;
  let pts = [];    // [{x,y}]
  let angle = 0;  // angle of PC1 direction
  let dragging = false;

  const CX = 280, CY = 170, SCALE = 130; // scatter centre

  function genData() {
    // correlated 2D data from two latent axes
    angle = Math.PI / 4 + rand(-0.2, 0.2);
    pts = [];
    for (let i = 0; i < N; i++) {
      const t = rand(-1.8, 1.8);
      // main axis + small noise perpendicular
      const px = t * Math.cos(angle) + rand(-0.18, 0.18);
      const py = t * Math.sin(angle) + rand(-0.18, 0.18);
      pts.push({ x: CX + px * SCALE, y: CY + py * SCALE });
    }
  }

  function mean(arr) { return arr.reduce((s, v) => s + v, 0) / arr.length; }

  function computePCA() {
    const xs = pts.map(p => p.x - CX), ys = pts.map(p => p.y - CY);
    const mx = mean(xs), my = mean(ys);
    const cx2 = xs.map(x => x - mx), cy = ys.map(y => y - my);
    const covXX = mean(cx2.map((x, i) => x * cx2[i]));
    const covXY = mean(cx2.map((x, i) => x * cy[i]));
    const covYY = mean(cy.map((y, i) => y * cy[i]));
    // 2×2 symmetric → analytic eigenvalues
    const trace = covXX + covYY;
    const det   = covXX * covYY - covXY * covXY;
    const disc  = Math.sqrt(Math.max(0, (trace/2)**2 - det));
    const l1 = trace/2 + disc;
    const l2 = trace/2 - disc;
    // eigenvector for l1
    let ev1x, ev1y;
    if (Math.abs(covXY) > 1e-8) {
      ev1x = l1 - covYY; ev1y = covXY;
    } else {
      ev1x = covXX > covYY ? 1 : 0;
      ev1y = covXX > covYY ? 0 : 1;
    }
    const len = Math.hypot(ev1x, ev1y) || 1;
    return { l1, l2, ex: ev1x/len, ey: ev1y/len, varTotal: l1 + l2 };
  }

  function project(px, py, ex, ey) {
    return (px - CX) * ex + (py - CY) * ey;
  }

  // Arrow head tip position
  function arrowTip() {
    return {
      x: CX + Math.cos(angle) * SCALE,
      y: CY + Math.sin(angle) * SCALE,
    };
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);
    const pca = computePCA();

    const ex = Math.cos(angle), ey = Math.sin(angle);
    const projections = pts.map(p => project(p.x, p.y, ex, ey));
    const varProj  = mean(projections.map(v => v*v));
    const explFrac = pca.varTotal > 1e-8 ? pca.l1 / pca.varTotal : 1;

    // ── Scatter plot ─────────────────────────────────────────────────────
    // BG
    ctx.fillStyle = 'rgba(6,6,12,0.6)';
    ctx.beginPath(); ctx.roundRect(CX - SCALE - 40, 8, (SCALE+40)*2, (SCALE+40)*2, 10); ctx.fill();

    // Crosshair
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(CX - SCALE - 30, CY); ctx.lineTo(CX + SCALE + 30, CY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX, CY - SCALE - 30); ctx.lineTo(CX, CY + SCALE + 30); ctx.stroke();

    // User-dragged PC1 axis
    ctx.save(); ctx.shadowColor = '#ffd166'; ctx.shadowBlur = 10;
    ctx.strokeStyle = '#ffd16688'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(CX - ex * (SCALE + 30), CY - ey * (SCALE + 30));
    ctx.lineTo(CX + ex * (SCALE + 30), CY + ey * (SCALE + 30));
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();

    // True PC1 (computing)
    ctx.save(); ctx.shadowColor = '#38bdf8'; ctx.shadowBlur = 6;
    ctx.strokeStyle = '#38bdf866'; ctx.lineWidth = 1.5; ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.moveTo(CX - pca.ex * (SCALE + 30), CY - pca.ey * (SCALE + 30));
    ctx.lineTo(CX + pca.ex * (SCALE + 30), CY + pca.ey * (SCALE + 30));
    ctx.stroke(); ctx.setLineDash([]); ctx.restore();

    // Projection lines + projected dots
    pts.forEach((p, i) => {
      const scalar = projections[i];
      const projX = CX + scalar * ex, projY = CY + scalar * ey;
      ctx.strokeStyle = 'rgba(255,209,102,0.15)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(projX, projY); ctx.stroke();
      // projected dot
      ctx.beginPath(); ctx.arc(projX, projY, 3, 0, TAU);
      ctx.fillStyle = '#ffd16688'; ctx.fill();
    });

    // Data points
    pts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, TAU);
      ctx.fillStyle = '#38bdf8cc'; ctx.fill();
    });

    // Arrowhead for user PC1
    const tip = arrowTip();
    ctx.save(); ctx.shadowColor='#ffd166'; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(tip.x, tip.y, 8, 0, TAU);
    ctx.fillStyle='#ffd166'; ctx.fill();
    ctx.restore();
    ctx.fillStyle='#06060c'; ctx.font='700 9px Fira Code'; ctx.textAlign='center';
    ctx.fillText('PC1', tip.x, tip.y+4); ctx.textAlign='left';

    // PC2 arrowhead (perpendicular)
    const pc2x = CX - ey * SCALE, pc2y = CY + ex * SCALE;
    ctx.beginPath(); ctx.arc(pc2x, pc2y, 6, 0, TAU);
    ctx.fillStyle='#f472b688'; ctx.fill();
    ctx.fillStyle='#f472b6'; ctx.font='600 8px Fira Code'; ctx.textAlign='center';
    ctx.fillText('PC2', pc2x, pc2y-9); ctx.textAlign='left';

    // ── Variance bar (right side) ─────────────────────────────────────────
    const RX = 580, RY = 20;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(RX, RY, 164, 210, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code';
    ctx.fillText('PCA', RX+8, RY+16);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('max Var(Wᵀx) s.t. ‖W‖=1', RX+8, RY+28);

    ctx.fillStyle = '#38bdf8'; ctx.font = '600 9px Fira Code';
    ctx.fillText('PC1 angle: ' + (angle * 180/Math.PI).toFixed(1) + '°', RX+8, RY+44);
    ctx.fillText('True PC1:  ' + (Math.atan2(pca.ey, pca.ex)*180/Math.PI).toFixed(1) + '°', RX+8, RY+57);

    // Variance captured
    ctx.fillStyle = '#34d399'; ctx.font = '700 13px Fira Code';
    ctx.fillText('Proj var: ' + varProj.toFixed(0), RX+8, RY+76);

    // Explained variance of true PC1
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('True PC1 var: ' + pca.l1.toFixed(0), RX+8, RY+90);
    ctx.fillText('PC2 var:   ' + Math.max(0, pca.l2).toFixed(0), RX+8, RY+102);

    // Explained ratio bar
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 9px Fira Code';
    ctx.fillText('Explained variance:', RX+8, RY+118);
    const bw = 148;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(RX+8, RY+122, bw, 14, 4); ctx.fill();
    ctx.fillStyle = '#34d399';
    ctx.beginPath(); ctx.roundRect(RX+8, RY+122, bw * explFrac, 14, 4); ctx.fill();
    ctx.fillStyle = '#e4e2df'; ctx.font = '600 8px Fira Code';
    ctx.fillText((explFrac*100).toFixed(1) + '% by PC1', RX+12, RY+133);
    ctx.fillStyle = '#f472b6';
    ctx.beginPath(); ctx.roundRect(RX+8 + bw*explFrac, RY+122, bw*(1-explFrac), 14, 4); ctx.fill();

    // Eigenvalues
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('λ₁=' + pca.l1.toFixed(0) + '  λ₂=' + Math.max(0,pca.l2).toFixed(0), RX+8, RY+152);
    ctx.fillText('Cov eigendecomposition', RX+8, RY+164);

    // Legend
    ctx.fillStyle = '#ffd166'; ctx.font = '500 8px Fira Code';
    ctx.fillText('— user PC1 (drag tip)', RX+8, RY+180);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('-- true PC1 (computed)', RX+8, RY+192);
    ctx.fillStyle = '#f472b6';
    ctx.fillText('-- PC2 (perpendicular)', RX+8, RY+204);

    // Angle error
    const diffAngle = Math.abs(angle - Math.atan2(pca.ey, pca.ex));
    const err = Math.min(diffAngle, Math.PI - diffAngle) * 180 / Math.PI;
    ctx.fillStyle = err < 5 ? '#34d399' : err < 20 ? '#ffd166' : '#ff6b6b';
    ctx.font = '600 9px Fira Code';
    ctx.fillText('Err: ' + err.toFixed(1) + '°', RX+8, RY+220);
  }

  // ── Drag arrowhead ───────────────────────────────────────────────────────
  c.onmousedown = e => {
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left)*750/r.width, my = (e.clientY - r.top)*340/r.height;
    const tip = arrowTip();
    if (Math.hypot(mx - tip.x, my - tip.y) < 20) dragging = true;
  };
  c.onmousemove = e => {
    if (!dragging) return;
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left)*750/r.width, my = (e.clientY - r.top)*340/r.height;
    angle = Math.atan2(my - CY, mx - CX);
    draw();
  };
  c.onmouseup   = () => { dragging = false; };
  c.onmouseleave = () => { dragging = false; };

  const ctrl = addControls(el);

  const regenBtn = document.createElement('button'); regenBtn.className='btn';
  regenBtn.textContent='↻ New Dataset';
  regenBtn.onclick=()=>{ genData(); angle = Math.PI/4 + rand(-0.4, 0.4); draw(); };
  ctrl.appendChild(regenBtn);

  const alignBtn = document.createElement('button'); alignBtn.className='btn';
  alignBtn.textContent='⟹ Align to True PC1';
  alignBtn.onclick=()=>{
    const pca = computePCA();
    angle = Math.atan2(pca.ey, pca.ex);
    draw();
  };
  ctrl.appendChild(alignBtn);

  genData();
  draw();

  return () => {
    try {
      if (c) { c.onmousedown=null; c.onmousemove=null; c.onmouseup=null; c.onmouseleave=null; }
      if (el) el.innerHTML='';
    } catch(e){}
  };
}
