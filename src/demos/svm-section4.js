import { $, createCanvas, addHint, addControls, rand, randInt, TAU } from '../lib/shared.js'

export function mountSvm(containerId = 'demo-svm') {
  const __id = containerId || 'demo-svm';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Left-click = Red, Right-click = Blue. Watch SVM find the maximum-margin boundary. Support vectors are circled.');
let pts=[];function init(){pts=[];for(let i=0;i<10;i++){pts.push({x:rand(40,300),y:rand(40,280),c:0});pts.push({x:rand(450,710),y:rand(40,280),c:1})}}
init();
function solveSVM(){if(pts.length<4)return null;
let bestW=null,bestB=0,bestMargin=0;
for(let trial=0;trial<200;trial++){let i=randInt(0,pts.length),j=randInt(0,pts.length);
if(pts[i].c===pts[j].c)continue;
let mx=(pts[i].x+pts[j].x)/2,my=(pts[i].y+pts[j].y)/2;
let nx=pts[j].x-pts[i].x,ny=pts[j].y-pts[i].y;
let len=Math.hypot(nx,ny);if(len<1)continue;nx/=len;ny/=len;
let b2=-(nx*mx+ny*my);
let minDist=Infinity,valid=true;
pts.forEach(p=>{let d=(nx*p.x+ny*p.y+b2)*(p.c?1:-1);if(d<0)valid=false;minDist=Math.min(minDist,Math.abs(d))});
if(valid&&minDist>bestMargin){bestMargin=minDist;bestW={x:nx,y:ny};bestB=b2}}
return bestW?{w:bestW,b:bestB,margin:bestMargin}:null}
function draw(){ctx.clearRect(0,0,750,320);
let sol=solveSVM();
if(sol){let{w,b,margin}=sol;
for(let py=0;py<320;py+=12)for(let px=0;px<750;px+=12){
let d=w.x*px+w.y*py+b;
ctx.fillStyle=d>=0?'rgba(56,189,248,0.05)':'rgba(255,107,107,0.05)';ctx.fillRect(px,py,12,12)}
ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=10;ctx.strokeStyle='#ffd166';ctx.lineWidth=2.5;ctx.beginPath();
if(Math.abs(w.y)>1e-6){ctx.moveTo(0,(-b)/w.y);ctx.lineTo(750,(-b-w.x*750)/w.y)}
else{let xv=-b/w.x;ctx.moveTo(xv,0);ctx.lineTo(xv,320)}
ctx.stroke();ctx.restore();
ctx.strokeStyle='rgba(255,209,102,.2)';ctx.lineWidth=1;ctx.setLineDash([5,5]);
if(Math.abs(w.y)>1e-6){
ctx.beginPath();ctx.moveTo(0,(-b+margin)/w.y);ctx.lineTo(750,(-b-w.x*750+margin)/w.y);ctx.stroke();
ctx.beginPath();ctx.moveTo(0,(-b-margin)/w.y);ctx.lineTo(750,(-b-w.x*750-margin)/w.y);ctx.stroke()}
ctx.setLineDash([]);
let svs=pts.filter(p=>{let d=Math.abs(w.x*p.x+w.y*p.y+b);return d<margin*1.2});
svs.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,12,0,TAU);ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.stroke()});
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(8,8,220,42,8);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 11px Fira Code';ctx.fillText('Margin: '+margin.toFixed(1)+'px',18,28);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('Support vectors: '+svs.length+' (circled)',18,44)}
pts.forEach(p=>{ctx.save();ctx.shadowColor=p.c?'#38bdf8':'#ff6b6b';ctx.shadowBlur=5;
ctx.beginPath();ctx.arc(p.x,p.y,6,0,TAU);ctx.fillStyle=p.c?'#38bdf8':'#ff6b6b';ctx.fill();ctx.restore()});
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,284,720,30,6);ctx.fill();
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('SVM maximizes the gap (margin) between classes. Only the closest points (support vectors) matter!',25,303)}
c.onclick=e=>{let r=c.getBoundingClientRect();pts.push({x:(e.clientX-r.left)*750/r.width,y:(e.clientY-r.top)*320/r.height,c:0});draw()};
c.oncontextmenu=e=>{e.preventDefault();let r=c.getBoundingClientRect();pts.push({x:(e.clientX-r.left)*750/r.width,y:(e.clientY-r.top)*320/r.height,c:1});draw()};
const ctrl=addControls(el);
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';rst.onclick=()=>{init();draw()};
ctrl.appendChild(rst);draw()
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
