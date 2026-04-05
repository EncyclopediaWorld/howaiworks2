import { $, createCanvas, addHint, addControls, rand } from '../lib/shared.js'

// ===== demo-vggnet =====
export function mountVggnet(containerId = 'demo-vggnet') {
  const __id = containerId || 'demo-vggnet';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Choose how many 3×3 conv layers to stack. The yellow highlighted receptive field grows: 3→5→7. Hover cells to trace which inputs feed that neuron.');

  const GRID = 9, CS = 28;  // 9×9 grid, cell size 28
  const GX   = 22, GY = 46; // grid origin

  let nLayers  = 2;  // 1, 2 or 3
  let hoverR   = -1, hoverC = -1;

  // Which cells in the input are within the receptive field of centre neuron?
  function rfSize(L) { return 1 + 2 * L; } // L layers of 3×3 → (1+2L)×(1+2L) RF

  function rfCover(centerR, centerC, L) {
    const half = L;
    const cells = [];
    for (let r = centerR - half; r <= centerR + half; r++)
      for (let cc = centerC - half; cc <= centerC + half; cc++)
        if (r >= 0 && r < GRID && cc >= 0 && cc < GRID) cells.push([r, cc]);
    return cells;
  }

  // Draw a grid with receptive field highlight
  function drawGrid(gx, gy, label, rfCells) {
    const rfSet = new Set(rfCells.map(([r, cc]) => r + ',' + cc));

    for (let r = 0; r < GRID; r++) for (let cc = 0; cc < GRID; cc++) {
      const x = gx + cc * CS, y = gy + r * CS;
      const key = r + ',' + cc;
      const inRF = rfSet.has(key);
      const isCentre = r === Math.floor(GRID / 2) && cc === Math.floor(GRID / 2);

      ctx.fillStyle = isCentre ? '#ffd16633'
        : inRF ? 'rgba(255,209,102,0.12)'
        : 'rgba(255,255,255,0.03)';
      ctx.beginPath(); ctx.roundRect(x + 1, y + 1, CS - 2, CS - 2, 3); ctx.fill();

      ctx.strokeStyle = isCentre ? '#ffd166'
        : inRF ? '#ffd16666'
        : 'rgba(255,255,255,0.06)';
      ctx.lineWidth = isCentre ? 2 : 1;
      ctx.beginPath(); ctx.roundRect(x + 1, y + 1, CS - 2, CS - 2, 3); ctx.stroke();
    }

    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 9px Fira Code'; ctx.textAlign = 'center';
    ctx.fillText(label, gx + GRID * CS / 2, gy - 6);
    ctx.textAlign = 'left';
  }

  // Animated layer stack on the right
  function drawStack() {
    const SX = 330, SY = 50, SW = 300, rowH = 62;
    ctx.fillStyle = 'rgba(6,6,12,0.6)';
    ctx.beginPath(); ctx.roundRect(SX, SY - 30, SW, rowH * nLayers + 78, 8); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 9px Fira Code';
    ctx.fillText('VGGNet: stacked 3×3 conv layers', SX + 8, SY - 14);

    const layerCols = ['#38bdf8', '#f472b6', '#fb923c'];
    const rf = [3, 5, 7];

    for (let l = 0; l < nLayers; l++) {
      const ly = SY + l * rowH;
      ctx.fillStyle = layerCols[l] + '18';
      ctx.beginPath(); ctx.roundRect(SX + 8, ly, SW - 16, rowH - 8, 6); ctx.fill();
      ctx.strokeStyle = layerCols[l] + '66'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(SX + 8, ly, SW - 16, rowH - 8, 6); ctx.stroke();

      ctx.fillStyle = layerCols[l]; ctx.font = '700 10px Fira Code';
      ctx.fillText('Conv Layer ' + (l + 1) + '  · 3×3, stride 1, pad 1', SX + 18, ly + 16);
      ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
      ctx.fillText('Output neuron sees ' + rf[l] + '×' + rf[l] + ' of input', SX + 18, ly + 30);

      // Params comparison mini bar
      const params3 = (l + 1) * 9;   // stacked 3×3 (normalized)
      const paramsEq = rf[l] * rf[l]; // equivalent single kernel
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.beginPath(); ctx.roundRect(SX + 18, ly + 36, 100, 8, 3); ctx.fill();
      ctx.fillStyle = layerCols[l];
      ctx.beginPath(); ctx.roundRect(SX + 18, ly + 36, params3 * 2.5, 8, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.roundRect(SX + 18, ly + 36, paramsEq * 2.5, 8, 3); ctx.stroke();
      ctx.fillStyle = '#e4e2df'; ctx.font = '400 7px Fira Code';
      ctx.fillText('params: ' + params3 + 'C² (3×3×' + (l + 1) + ') vs ' + paramsEq + 'C² equiv.', SX + 18, ly + 56);
    }

    // Summary
    const sumY = SY + nLayers * rowH + 10;
    ctx.fillStyle = '#34d399'; ctx.font = '700 10px Fira Code';
    ctx.fillText(nLayers + ' × 3×3 = same RF as 1 × ' + rf[nLayers - 1] + '×' + rf[nLayers - 1], SX + 8, sumY);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    const stackP = nLayers * 9, equivP = rf[nLayers - 1] ** 2;
    ctx.fillText('Params: ' + stackP + 'C² vs ' + equivP + 'C²  ·  +' + nLayers + 'x nonlinearity', SX + 8, sumY + 14);
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);

    const centR = Math.floor(GRID / 2), centC = Math.floor(GRID / 2);
    const L = nLayers;
    const rfCells = rfCover(centR, centC, L);

    // Input grid (left)
    ctx.fillStyle = 'rgba(6,6,12,0.6)';
    ctx.beginPath(); ctx.roundRect(GX - 4, GY - 28, GRID * CS + 8, GRID * CS + 36, 8); ctx.fill();
    drawGrid(GX, GY, 'Input (9×9)', rfCells);

    // Receptive field label
    const rfS = rfSize(L);
    ctx.fillStyle = '#ffd166'; ctx.font = '600 9px Fira Code';
    ctx.fillText('RF: ' + rfS + '×' + rfS, GX + 4, GY + GRID * CS + 16);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('(center output ← highlighted input)', GX + 4, GY + GRID * CS + 28);

    // Stack diagram
    drawStack();

    // Info overlay (top right)
    const IX = 630, IY = 8, IW = 114, IH = 130;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, IH, 8); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code';
    ctx.fillText('VGGNet', IX + 8, IY + 16);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('Simonyan & Zisserman', IX + 8, IY + 28);
    ctx.fillText('ICLR 2015', IX + 8, IY + 39);
    ctx.fillText('Only 3×3 kernels', IX + 8, IY + 54);
    ctx.fillText('16–19 layers deep', IX + 8, IY + 65);
    ctx.fillStyle = '#38bdf8'; ctx.font = '600 9px Fira Code';
    ctx.fillText('Layers stacked: ' + nLayers, IX + 8, IY + 82);
    ctx.fillText('RF: ' + rfSize(nLayers) + '×' + rfSize(nLayers), IX + 8, IY + 94);
    ctx.fillStyle = '#34d399'; ctx.font = '700 10px Fira Code';
    const ratio = (nLayers * 9 / rfSize(nLayers) ** 2 * 100).toFixed(0);
    ctx.fillText('Param ratio: ' + ratio + '%', IX + 8, IY + 110);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 7px Fira Code';
    ctx.fillText('(vs equiv. single kernel)', IX + 8, IY + 122);
  }

  // Mouse hover (not needed since cells are static, but we support it)
  c.onmousemove = e => {
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * 750 / r.width;
    const my = (e.clientY - r.top)  * 340 / r.height;
    hoverC = Math.floor((mx - GX) / CS);
    hoverR = Math.floor((my - GY) / CS);
    draw();
  };
  c.onmouseleave = () => { hoverR = -1; hoverC = -1; draw(); };

  const ctrl = addControls(el);

  [1, 2, 3].forEach(n => {
    const b = document.createElement('button'); b.className = 'btn';
    b.textContent = n + ' Layer' + (n > 1 ? 's' : '');
    if (n === nLayers) b.classList.add('active');
    b.onclick = () => {
      nLayers = n;
      ctrl.querySelectorAll('.btn').forEach(btn => {
        if (btn.textContent === n + ' Layer' + (n > 1 ? 's' : '')) btn.classList.add('active');
        else if (['1 Layer', '2 Layers', '3 Layers'].includes(btn.textContent)) btn.classList.remove('active');
      });
      draw();
    };
    ctrl.appendChild(b);
  });

  draw();
  return () => {
    try {
      if (c) { c.onmousemove = null; c.onmouseleave = null; }
      if (el) el.innerHTML = '';
    } catch (e) {}
  };
}
