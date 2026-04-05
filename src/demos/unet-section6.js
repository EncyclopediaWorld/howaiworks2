import { $, createCanvas, addHint, addControls, TAU } from '../lib/shared.js'

// ===== demo-unet =====
export function mountUnet(containerId = 'demo-unet') {
  const __id = containerId || 'demo-unet';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Draw on the input image (left). Watch the U-Net encoder compress it stage by stage, then the decoder expand it back — skip connections carry fine detail directly across. Output = segmentation mask.');

  const G = 16; // pixel grid 16×16
  const CSIZE = 14; // cell size for input grid
  const GX = 10, GY = 28;
  let drawing = false, brushClass = 1;
  let inputGrid = Array.from({length:G}, () => new Uint8Array(G)); // 0=bg, 1=fg

  // U-Net depth: 4 encoder stages, bottleneck, 4 decoder stages
  // Feature map sizes: 16→8→4→2→1→2→4→8→16
  const STAGES = [16,8,4,2,1,2,4,8,16];
  const STAGE_NAMES = ['Input','Enc-1','Enc-2','Enc-3','Bottl.','Dec-3','Dec-2','Dec-1','Output'];
  const ENC_IDX = [0,1,2,3,4]; // encoder stages
  const DEC_IDX = [5,6,7,8];   // decoder stages

  // Compute fake feature maps from the input
  function computeFeatures() {
    // Encoder: downsample by averaging 2×2 blocks
    let maps = [inputGrid.map(r => Array.from(r))];
    let cur = maps[0];
    for (let stage = 0; stage < 3; stage++) {
      const newSize = cur.length >> 1;
      const down = Array.from({length: newSize}, (_, r) =>
        Array.from({length: newSize}, (__, c) =>
          (cur[r*2][c*2] + (cur[r*2][c*2+1]||0) + (cur[r*2+1]?.[c*2]||0) + (cur[r*2+1]?.[c*2+1]||0)) / 4
        )
      );
      maps.push(down); cur = down;
    }
    // Bottleneck: 1×1
    const bVal = cur.flat().reduce((a,b)=>a+b,0) / (cur.length*cur.length||1);
    maps.push([[bVal]]); 

    // Decoder: upsample (nearest neighbor) + skip connection blend
    let dec = maps[4];
    for (let stage = 0; stage < 4; stage++) {
      const skipIdx = 3 - stage;
      const skip = maps[skipIdx];
      const newSize = dec.length * 2;
      const up = Array.from({length: newSize}, (_, r) =>
        Array.from({length: newSize}, (__, c) =>
          (dec[r>>1]?.[c>>1]||0) * 0.6 + ((skip[r]?.[c])||0) * 0.4
        )
      );
      maps.push(up); dec = up;
    }
    return maps;
  }

  // Convert feature map to canvas color intensity
  function drawFeatureMap(fmap, ax, ay, cellW) {
    const size = fmap.length;
    for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
      const v = clamp01(fmap[r][c]);
      // Encode → greenish, Decode → blueish
      ctx.fillStyle = `rgba(52,211,153,${v*0.85+0.05})`;
      ctx.beginPath();
      ctx.roundRect(ax + c*cellW + 1, ay + r*cellW + 1, cellW-2, cellW-2, 1);
      ctx.fill();
    }
  }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);
    const feats = computeFeatures();

    // ── Input grid ───────────────────────────────────────────────────────
    ctx.fillStyle = 'rgba(6,6,12,0.7)';
    ctx.beginPath(); ctx.roundRect(GX-2, GY-18, G*CSIZE+4, G*CSIZE+22, 6); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '500 8px Fira Code';
    ctx.fillText('Draw Input (16×16)', GX, GY-6);
    for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) {
      const v = inputGrid[r][c];
      ctx.fillStyle = v ? '#38bdf8cc' : 'rgba(255,255,255,0.04)';
      ctx.beginPath(); ctx.roundRect(GX+c*CSIZE+1, GY+r*CSIZE+1, CSIZE-2, CSIZE-2, 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.roundRect(GX+c*CSIZE, GY+r*CSIZE, CSIZE, CSIZE, 2); ctx.stroke();
    }

    // ── U-Net architecture ───────────────────────────────────────────────
    // Layout: stages left→right, each block height proportional to feature map size
    const AX0 = GX + G*CSIZE + 22;
    const totalMapW = 750 - AX0 - 8;
    const stageW = totalMapW / STAGES.length; // ~41px each
    const maxMapH = 180;

    // Draw stage blocks
    feats.forEach((fmap, si) => {
      const size = fmap.length;
      const mapCellW = Math.floor(Math.min(stageW - 8, maxMapH / size));
      const mapW = size * mapCellW;
      const mapH = size * mapCellW;
      const ax = AX0 + si * stageW + Math.floor((stageW - mapW) / 2);
      const cy = GY + Math.floor((maxMapH - mapH) / 2) + 8;

      // Stage background
      const isBottle = si === 4;
      const isDec = si >= 5;
      ctx.fillStyle = isBottle ? 'rgba(255,209,102,0.08)' : isDec ? 'rgba(167,139,250,0.06)' : 'rgba(56,189,248,0.06)';
      ctx.beginPath(); ctx.roundRect(AX0+si*stageW+2, GY-6, stageW-4, maxMapH+20, 5); ctx.fill();

      drawFeatureMap(fmap, ax, cy, mapCellW);

      // Stage border
      ctx.strokeStyle = isBottle ? '#ffd16688' : isDec ? '#a78bfa66' : '#38bdf866';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(ax-1, cy-1, mapW+2, mapH+2, 3); ctx.stroke();

      // Stage label
      ctx.fillStyle = isBottle ? '#ffd166' : isDec ? '#a78bfa' : '#38bdf8';
      ctx.font = '500 7px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText(STAGE_NAMES[si], AX0+si*stageW+stageW/2, GY-8);
      ctx.fillStyle = '#4a475a';
      ctx.fillText(size+'×'+size, AX0+si*stageW+stageW/2, GY+maxMapH+16);
      ctx.textAlign = 'left';

      // Arrow between stages
      if (si < STAGES.length - 1) {
        const ax2 = AX0+si*stageW+stageW-2;
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax2, GY+maxMapH/2+8); ctx.lineTo(ax2+6, GY+maxMapH/2+8); ctx.stroke();
      }
    });

    // Skip connection arcs: encoder stage i ↔ decoder stage (7-i)
    for (let i = 1; i <= 3; i++) {
      const encSi = i, decSi = 8 - i;
      const ex = AX0 + encSi*stageW + stageW/2;
      const dx = AX0 + decSi*stageW + stageW/2;
      const arcY = GY - 12 - i*7;
      ctx.strokeStyle = `rgba(255,209,102,${0.2+i*0.12})`; ctx.lineWidth = 1.5; ctx.setLineDash([4,3]);
      ctx.beginPath(); ctx.moveTo(ex, GY-6); ctx.quadraticCurveTo((ex+dx)/2, arcY, dx, GY-6); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffd166'; ctx.font = '400 8px Fira Code'; ctx.textAlign='center';
      ctx.fillText('skip', (ex+dx)/2, arcY-2);
      ctx.textAlign='left';
    }

    // ── Info overlay ─────────────────────────────────────────────────────
    const IX = AX0, IY = GY+maxMapH+24, IH = 46;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, 750-IX-8, IH, 7); ctx.fill();
    ctx.fillStyle = '#ffd166'; ctx.font = '700 10px Fira Code';
    ctx.fillText('U-Net', IX+8, IY+14);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('Encoder: 16→8→4→2→1  (conv+pool)   |   Skip connections carry detail across   |   Decoder: 1→2→4→8→16  (upsample+conv+skip)', IX+68, IY+14);
    ctx.fillStyle = '#38bdf8'; ctx.font = '400 8px Fira Code';
    ctx.fillText('Blue = encoder features', IX+8, IY+28);
    ctx.fillStyle = '#a78bfa';
    ctx.fillText('Purple = decoder features', IX+130, IY+28);
    ctx.fillStyle = '#ffd166';
    ctx.fillText('Yellow arcs = skip connections (fine detail bypass)', IX+278, IY+28);

    // Foreground pixel count
    const fgCount = inputGrid.flat().reduce((a,b)=>a+b,0);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('Input: '+fgCount+'/'+G*G+' pixels drawn', GX, GY+G*CSIZE+12);
  }

  // ── Mouse handlers ────────────────────────────────────────────────────────
  c.onmousedown = e => {
    drawing = true;
    brushClass = e.button === 2 ? 0 : 1;
    const r = c.getBoundingClientRect();
    const mx = (e.clientX-r.left)*750/r.width, my = (e.clientY-r.top)*340/r.height;
    const gc = Math.floor((mx-GX)/CSIZE), gr = Math.floor((my-GY)/CSIZE);
    if (gr>=0&&gr<G&&gc>=0&&gc<G) { inputGrid[gr][gc]=brushClass; draw(); }
  };
  c.onmousemove = e => {
    if (!drawing) return;
    const r = c.getBoundingClientRect();
    const mx = (e.clientX-r.left)*750/r.width, my = (e.clientY-r.top)*340/r.height;
    const gc = Math.floor((mx-GX)/CSIZE), gr = Math.floor((my-GY)/CSIZE);
    if (gr>=0&&gr<G&&gc>=0&&gc<G) { inputGrid[gr][gc]=brushClass; draw(); }
  };
  c.onmouseup = () => { drawing = false; };
  c.onmouseleave = () => { drawing = false; };
  c.oncontextmenu = e => e.preventDefault();

  const ctrl = addControls(el);
  const presets = [
    {label:'□ Square', fn:()=>{ inputGrid=Array.from({length:G},(_,r)=>new Uint8Array(G).map((_,c)=>(r>=4&&r<=11&&c>=4&&c<=11&&(r<=4||r>=11||c<=4||c>=11))?1:0)); }},
    {label:'+ Cross',  fn:()=>{ inputGrid=Array.from({length:G},(_,r)=>new Uint8Array(G).map((_,c)=>(r>=6&&r<=9)||(c>=6&&c<=9)?1:0)); }},
    {label:'↻ Clear',  fn:()=>{ inputGrid=Array.from({length:G},()=>new Uint8Array(G)); }},
  ];
  presets.forEach(({label,fn})=>{
    const b=document.createElement('button');b.className='btn';b.textContent=label;
    b.onclick=()=>{fn();draw();}; ctrl.appendChild(b);
  });
  draw();
  return ()=>{try{if(c){c.onmousedown=null;c.onmousemove=null;c.onmouseup=null;c.onmouseleave=null;c.oncontextmenu=null;}if(el)el.innerHTML='';}catch(e){}};
}
