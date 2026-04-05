import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

// ===== demo-yolo =====
export function mountYolo(containerId = 'demo-yolo') {
  const __id = containerId || 'demo-yolo';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Click ▶ Detect or hover over the scene. YOLO divides the image into a 7×7 grid — each cell predicts bounding boxes AND class probabilities in a single forward pass. No region proposals needed!');

  // Simulated scene objects
  const CLASSES = ['Cat 🐱', 'Dog 🐶', 'Car 🚗', 'Person 🚶', 'Bird 🐦'];
  const CLASS_COLS = ['#ffd166','#38bdf8','#f472b6','#34d399','#fb923c'];

  function makeScene() {
    return [
      { cx: 120, cy: 100, w: 90, h: 85, cls: 0, conf: 0.92 },
      { cx: 310, cy: 200, w: 120, h: 100, cls: 1, conf: 0.87 },
      { cx: 520, cy: 130, w: 140, h: 70, cls: 2, conf: 0.95 },
      { cx: 430, cy: 260, w: 55, h: 110, cls: 3, conf: 0.78 },
    ];
  }
  let objects = makeScene();
  let detected = false, mouseX = -1, mouseY = -1;

  const SCENE_W = 700, SCENE_H = 290, SCENE_X = 22, SCENE_Y = 22;
  const GRID = 7;
  const CELL_W = SCENE_W / GRID, CELL_H = SCENE_H / GRID;

  // Which object (if any) a cell centre falls inside
  function getCell(gc, gr) {
    const cx = SCENE_X + (gc + 0.5) * CELL_W;
    const cy = SCENE_Y + (gr + 0.5) * CELL_H;
    for (const obj of objects) {
      const ox = SCENE_X + obj.cx - obj.w/2, oy = SCENE_Y + obj.cy - obj.h/2;
      if (cx>=ox && cx<=ox+obj.w && cy>=oy && cy<=oy+obj.h) return obj;
    }
    return null;
  }

  function nms(objs) {
    // Simplified NMS: keep all (4 objects, no overlap for demo)
    return objs;
  }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);

    // Scene background
    ctx.fillStyle = 'rgba(10,10,22,0.5)';
    ctx.beginPath(); ctx.roundRect(SCENE_X-2, SCENE_Y-2, SCENE_W+4, SCENE_H+4, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(SCENE_X-2, SCENE_Y-2, SCENE_W+4, SCENE_H+4, 6); ctx.stroke();

    // YOLO grid
    for (let gr = 0; gr < GRID; gr++) for (let gc = 0; gc < GRID; gc++) {
      const x = SCENE_X + gc*CELL_W, y = SCENE_Y + gr*CELL_H;
      const obj = getCell(gc, gr);

      if (detected && obj) {
        ctx.fillStyle = CLASS_COLS[obj.cls] + '18';
        ctx.fillRect(x+1, y+1, CELL_W-2, CELL_H-2);
      }
      ctx.strokeStyle = detected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, CELL_W, CELL_H);

      // Cell label when detected
      if (detected && obj) {
        ctx.fillStyle = CLASS_COLS[obj.cls] + 'cc';
        ctx.font = '600 7px Fira Code'; ctx.textAlign='center';
        ctx.fillText(CLASSES[obj.cls].split(' ')[1], x+CELL_W/2, y+CELL_H/2+3);
        ctx.textAlign='left';
      }
    }

    // Grid overlay label
    ctx.fillStyle = 'rgba(6,6,12,0.75)';
    ctx.beginPath(); ctx.roundRect(SCENE_X, SCENE_Y, 86, 14, 3); ctx.fill();
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('7×7 YOLO grid', SCENE_X+4, SCENE_Y+10);

    // Detected bounding boxes + confidence
    if (detected) {
      nms(objects).forEach(obj => {
        const bx = SCENE_X + obj.cx - obj.w/2, by = SCENE_Y + obj.cy - obj.h/2;
        const col = CLASS_COLS[obj.cls];
        ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=10;
        ctx.strokeStyle=col; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.roundRect(bx, by, obj.w, obj.h, 4); ctx.stroke();
        ctx.restore();
        // Label chip
        const lblW = 70, lblH = 16;
        ctx.fillStyle = col + 'dd';
        ctx.beginPath(); ctx.roundRect(bx, by-lblH, lblW, lblH, [4,4,0,0]); ctx.fill();
        ctx.fillStyle = '#06060c'; ctx.font = '700 9px Fira Code';
        ctx.fillText(CLASSES[obj.cls] + ' ' + (obj.conf*100|0)+'%', bx+4, by-4);
        // Center dot
        ctx.beginPath(); ctx.arc(SCENE_X+obj.cx, SCENE_Y+obj.cy, 3, 0, TAU);
        ctx.fillStyle=col; ctx.fill();
      });
    }

    // Hover cell highlight
    if (mouseX >= SCENE_X && mouseX <= SCENE_X+SCENE_W && mouseY >= SCENE_Y && mouseY <= SCENE_Y+SCENE_H) {
      const gc = Math.floor((mouseX-SCENE_X)/CELL_W), gr = Math.floor((mouseY-SCENE_Y)/CELL_H);
      ctx.strokeStyle='#ffd166'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(SCENE_X+gc*CELL_W, SCENE_Y+gr*CELL_H, CELL_W, CELL_H, 2); ctx.stroke();

      // Cell info tooltip
      const obj = getCell(gc, gr);
      const tx = Math.min(mouseX+8, SCENE_X+SCENE_W-140), ty = Math.max(mouseY-40, SCENE_Y+2);
      ctx.fillStyle='rgba(6,6,12,0.95)'; ctx.beginPath(); ctx.roundRect(tx, ty, 136, 40, 5); ctx.fill();
      ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';
      ctx.fillText('Cell ('+gc+','+gr+')',tx+6,ty+13);
      if (obj) {
        ctx.fillStyle=CLASS_COLS[obj.cls];ctx.font='600 9px Fira Code';
        ctx.fillText('→ '+CLASSES[obj.cls],tx+6,ty+27);
        ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
        ctx.fillText('conf='+obj.conf.toFixed(2),tx+80,ty+27);
      } else {
        ctx.fillStyle='#4a475a';ctx.font='400 8px Fira Code';ctx.fillText('background',tx+6,ty+27);
      }
    }

    // ── Info overlay ──────────────────────────────────────────────────────
    const IX=SCENE_X+SCENE_W+14-670, IY=2; // needs to go on right… let's put at bottom
    // Actually with 700px scene there's no room on right. Put info at bottom of scene as a lower bar.
    const BX=SCENE_X, BY=SCENE_Y+SCENE_H+4, BH=22;
    ctx.fillStyle='rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(BX, BY, SCENE_W, BH, 5); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 9px Fira Code';
    ctx.fillText('YOLO: You Only Look Once', BX+6, BY+14);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    ctx.fillText('Single CNN forward pass → 7×7×(B×5+C) tensor → boxes + class scores simultaneously   NMS→final boxes', BX+200, BY+14);
  }

  c.onmousemove = e => {
    const r=c.getBoundingClientRect();
    mouseX=(e.clientX-r.left)*750/r.width; mouseY=(e.clientY-r.top)*340/r.height; draw();
  };
  c.onmouseleave = () => { mouseX=-1; mouseY=-1; draw(); };

  const ctrl=addControls(el);
  const detBtn=document.createElement('button');detBtn.className='btn';detBtn.textContent='▶ Detect';
  detBtn.onclick=()=>{ detected=true; detBtn.classList.add('active'); draw(); };ctrl.appendChild(detBtn);
  const addBtn=document.createElement('button');addBtn.className='btn';addBtn.textContent='+ Add Object';
  addBtn.onclick=()=>{
    const cls=Math.floor(Math.random()*CLASSES.length);
    objects.push({cx:rand(80,580),cy:rand(60,240),w:rand(50,130),h:rand(45,110),cls,conf:rand(0.7,0.98)});
    draw();
  };ctrl.appendChild(addBtn);
  const rstBtn=document.createElement('button');rstBtn.className='btn';rstBtn.textContent='↻ Reset';
  rstBtn.onclick=()=>{ objects=makeScene(); detected=false; detBtn.classList.remove('active'); draw(); };ctrl.appendChild(rstBtn);
  draw();
  return ()=>{try{if(c){c.onmousemove=null;c.onmouseleave=null;c.onclick=null;}if(el)el.innerHTML='';}catch(e){}};
}
