// Runtime code injected into every AI-generated demo iframe.
// SHARED_CSS  → injected inside <style> in the srcdoc
// SHARED      → injected inside <script> in the srcdoc

export const SHARED_CSS = `
:root {
  --bg: #06060c; --bg2: #0c0c16; --bg3: #111120;
  --border: #1e1e32;
  --text: #e4e2df; --text2: #7d7a8c; --text3: #4a475a;
  --a2: #4ecdc4;
  --mono: 'Fira Code', 'Consolas', monospace;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #0c0c16; color: var(--text); font-family: var(--mono); overflow: hidden; }
canvas { display: block; width: 100%; max-width: 750px; aspect-ratio: 750 / 340; cursor: crosshair; touch-action: none; }
.demo-controls {
  padding: .65rem 1rem; display: flex; gap: .5rem; flex-wrap: wrap;
  align-items: center; border-top: 1px solid var(--border); background: var(--bg3);
}
.demo-hint {
  font-size: .65rem; color: var(--text3);
  padding: .4rem 1rem; font-family: var(--mono); letter-spacing: .02em;
}
.btn {
  font-family: var(--mono); font-size: .65rem; font-weight: 500;
  padding: .35rem .75rem; border: 1px solid var(--border);
  background: var(--bg); color: var(--text); border-radius: 6px;
  cursor: pointer; transition: all .2s var(--ease); letter-spacing: .02em; white-space: nowrap;
}
.btn:hover { border-color: var(--a2); color: var(--a2); background: rgba(78,205,196,.04); }
.btn.active { background: var(--a2); color: var(--bg); border-color: var(--a2); }
label { font-family: var(--mono); font-size: .62rem; color: var(--text3); }
input[type=range] {
  -webkit-appearance: none; background: var(--border);
  height: 3px; border-radius: 2px; outline: none; flex: 1; max-width: 140px;
}
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none; width: 14px; height: 14px;
  background: var(--a2); border-radius: 50%; cursor: pointer;
  box-shadow: 0 0 8px rgba(78,205,196,.3);
}
`

export const SHARED = `
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const sigmoid=x=>1/(1+Math.exp(-x));
const rand=(a,b)=>a+Math.random()*(b-a);
const randInt=(a,b)=>Math.floor(rand(a,b));
const dist=(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1);
const TAU=Math.PI*2;
const W=750, H=340;

// HiDPI canvas setup — logical size W×H, crisp on Retina screens
const _dpr=Math.max(1,Math.min(3,window.devicePixelRatio||1));
const canvas=document.getElementById('c');
canvas.width=Math.floor(W*_dpr); canvas.height=Math.floor(H*_dpr);
const ctx=canvas.getContext('2d');
ctx.scale(_dpr,_dpr);
ctx.fillStyle='#06060c'; ctx.fillRect(0,0,W,H);

// getPos(e) — maps any pointer/touch event to logical canvas coordinates
function getPos(e){
  const r=canvas.getBoundingClientRect();
  const sx=W/r.width, sy=H/r.height;
  const src=e.touches?e.touches[0]:e;
  return {x:(src.clientX-r.left)*sx, y:(src.clientY-r.top)*sy};
}

// trackPointer() — returns a live {x, y, down} state object for use in animation loops
function trackPointer(){
  const s={x:-1,y:-1,down:false};
  const upd=e=>{const p=getPos(e);s.x=p.x;s.y=p.y;};
  canvas.addEventListener('pointermove',upd,{passive:true});
  canvas.addEventListener('pointerdown',e=>{upd(e);s.down=true;},{passive:true});
  canvas.addEventListener('pointerup',()=>s.down=false,{passive:true});
  canvas.addEventListener('pointercancel',()=>s.down=false,{passive:true});
  canvas.addEventListener('pointerleave',()=>{s.x=-1;s.y=-1;s.down=false;},{passive:true});
  return s;
}

// shimPointerToMouse(canvas) — translates touch/pointer events to mouse events
// Call this if your code uses onclick / onmousemove / onmousedown instead of pointer events
function shimPointerToMouse(c){
  if(c.__shimmed)return; c.__shimmed=true;
  const fire=(type,pe)=>c.dispatchEvent(new MouseEvent(type,{
    bubbles:true,cancelable:true,clientX:pe.clientX,clientY:pe.clientY,
    button:0,buttons:type==='mouseup'?0:1
  }));
  let start=null;
  c.addEventListener('pointerdown',pe=>{
    if(pe.pointerType==='mouse')return;
    try{c.setPointerCapture(pe.pointerId);}catch{}
    start={x:pe.clientX,y:pe.clientY};
    fire('mousemove',pe); fire('mousedown',pe); pe.preventDefault();
  },{passive:false});
  c.addEventListener('pointermove',pe=>{
    if(pe.pointerType==='mouse')return;
    fire('mousemove',pe); pe.preventDefault();
  },{passive:false});
  c.addEventListener('pointerup',pe=>{
    if(pe.pointerType==='mouse')return;
    fire('mouseup',pe);
    if(start&&Math.hypot(pe.clientX-start.x,pe.clientY-start.y)<=8)
      c.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:pe.clientX,clientY:pe.clientY}));
    start=null; pe.preventDefault();
  },{passive:false});
  c.addEventListener('pointercancel',()=>{start=null;},{passive:true});
}

// addControls() — creates the .demo-controls bar below the canvas, returns it
let _controls=null;
function addControls(){
  if(_controls) return _controls;
  _controls=document.createElement('div');
  _controls.className='demo-controls';
  document.body.appendChild(_controls);
  return _controls;
}

// addBtn(label, onClick) — creates a .btn and appends it to controls bar (or body)
// Returns the element so you can toggle .active class
function addBtn(label,onClick){
  if(!_controls) addControls();
  const b=document.createElement('button');
  b.className='btn'; b.textContent=label; b.onclick=onClick;
  _controls.appendChild(b);
  return b;
}

// addHint(text) — displays a .demo-hint line above controls
function addHint(text){
  const d=document.createElement('div');
  d.className='demo-hint'; d.textContent=text;
  _controls ? document.body.insertBefore(d,_controls) : document.body.appendChild(d);
}

// roundRect polyfill
if(!CanvasRenderingContext2D.prototype.roundRect){
  CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h,r){
    this.beginPath();
    this.moveTo(x+r,y);this.lineTo(x+w-r,y);this.quadraticCurveTo(x+w,y,x+w,y+r);
    this.lineTo(x+w,y+h-r);this.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    this.lineTo(x+r,y+h);this.quadraticCurveTo(x,y+h,x,y+h-r);
    this.lineTo(x,y+r);this.quadraticCurveTo(x,y,x+r,y);
    this.closePath();
  };
}

// Auto-resize: report content height to parent after layout settles
function _reportHeight(){
  requestAnimationFrame(()=>{let h=0;for(const el of document.body.children)h+=el.getBoundingClientRect().height;if(h>0)window.parent.postMessage({type:'iframeHeight',height:h},'*');});
}
new MutationObserver(_reportHeight).observe(document.body,{childList:true,subtree:true});
window.addEventListener('load',_reportHeight);
_reportHeight();
setTimeout(_reportHeight,200);
`