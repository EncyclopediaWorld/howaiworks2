import { $, createCanvas, addHint, addControls, rand, TAU, dist } from '../lib/shared.js'

// ===== demo-lr =====
export function mountLinearRegression(containerId = 'demo-lr') {
  const __id = containerId || 'demo-lr';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Click to add points, right-click to remove nearest. Best-fit line updates in real-time.');
let pts=[{x:100,y:230},{x:180,y:195},{x:260,y:175},{x:350,y:140},{x:430,y:110},{x:550,y:80},{x:620,y:60}];
function fit(){if(pts.length<2)return{w:0,b:150};let sx=0,sy=0,sxy=0,sxx=0,n=pts.length;
pts.forEach(p=>{sx+=p.x;sy+=p.y;sxy+=p.x*p.y;sxx+=p.x*p.x});let w=(n*sxy-sx*sy)/(n*sxx-sx*sx||1);return{w,b:(sy-w*sx)/n}}
function draw(){ctx.clearRect(0,0,750,300);
// Grid
for(let i=0;i<750;i+=75){ctx.strokeStyle='#1a1a2a';ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,300);ctx.stroke()}
for(let i=0;i<300;i+=75){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(750,i);ctx.stroke()}
let{w,b}=fit();
if(pts.length>=2){
// Best-fit line
ctx.save();ctx.shadowColor='#ff6b6b';ctx.shadowBlur=10;ctx.strokeStyle='#ff6b6b';ctx.lineWidth=2.5;
ctx.beginPath();ctx.moveTo(0,b);ctx.lineTo(750,w*750+b);ctx.stroke();ctx.restore();
// Residual lines
let mse=pts.reduce((a,p)=>a+(p.y-(w*p.x+b))**2,0)/pts.length;
pts.forEach(p=>{ctx.strokeStyle='rgba(255,107,107,.3)';ctx.lineWidth=1;ctx.setLineDash([3,3]);
ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x,w*p.x+b);ctx.stroke();ctx.setLineDash([])});
// Info panel
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(8,8,220,50,8);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='600 11px Fira Code';ctx.fillText('y = '+w.toFixed(3)+'x + '+b.toFixed(1),18,28);
ctx.fillStyle='#ffd166';ctx.font='500 10px Fira Code';ctx.fillText('MSE = '+mse.toFixed(1)+' | '+pts.length+' points',18,46)}
// Points
pts.forEach(p=>{ctx.save();ctx.shadowColor='#4ecdc4';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(p.x,p.y,6,0,TAU);ctx.fillStyle='#4ecdc4';ctx.fill();ctx.restore()})}
c.onclick=e=>{let r=c.getBoundingClientRect();pts.push({x:(e.clientX-r.left)*750/r.width,y:(e.clientY-r.top)*300/r.height});draw()};
c.oncontextmenu=e=>{e.preventDefault();let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*300/r.height;
pts=pts.filter(p=>dist(p.x,p.y,mx,my)>15);draw()};
const ctrl=addControls(el);
const rb=document.createElement('button');rb.className='btn';rb.textContent='🎲 Random';rb.onclick=()=>{pts=[];for(let i=0;i<10;i++)pts.push({x:rand(40,700),y:rand(20,280)});draw()};
const clr=document.createElement('button');clr.className='btn';clr.textContent='↻ Reset';clr.onclick=()=>{pts=[{x:100,y:230},{x:180,y:195},{x:260,y:175},{x:350,y:140},{x:430,y:110},{x:550,y:80},{x:620,y:60}];draw()};
ctrl.appendChild(rb);ctrl.appendChild(clr);draw()
  return () => {
    try {
      if (typeof c !== 'undefined' && c) {
        c.onclick = null;
        c.oncontextmenu = null;
      }
      if (typeof tmr !== 'undefined' && tmr) clearInterval(tmr);
      if (typeof animId !== 'undefined' && animId) cancelAnimationFrame(animId);
      if (typeof el !== 'undefined' && el) el.innerHTML = '';
    } catch (e) {}
  };
}
