import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

// ===== demo-perceptron =====
export function mountPerceptron(containerId = 'demo-perceptron') {
  const __id = containerId || 'demo-perceptron';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Left-click = Red (class 0), Right-click = Blue (class 1). Train to learn the boundary. Yellow ring = misclassified.');
let pts=[],w1=0,w2=0,b=0,lr=0.2,epoch=0,errs=0,errHist=[];
// Normalize pixel coords to [0,1] for stable training
function nx(px){return px/750} function ny(py){return py/340}
function seed(){pts=[];for(let i=0;i<8;i++){pts.push({x:rand(60,320),y:rand(40,300),c:0});pts.push({x:rand(430,700),y:rand(40,300),c:1})}
w1=0;w2=0;b=0;epoch=0;errs=0;errHist=[]}
seed();
function predict(px,py){return(w1*nx(px)+w2*ny(py)+b)>=0?1:0}
function rawVal(px,py){return w1*nx(px)+w2*ny(py)+b}
function trainEpoch(){errs=0;epoch++;let sh=[...pts].sort(()=>Math.random()-.5);
sh.forEach(p=>{let pred=predict(p.x,p.y),err=p.c-pred;
if(err!==0){errs++;w1+=lr*err*nx(p.x);w2+=lr*err*ny(p.y);b+=lr*err}});
errHist.push(errs);if(errHist.length>100)errHist.shift()}
function draw(){ctx.clearRect(0,0,750,340);
// Decision regions - colored background
for(let py=0;py<340;py+=8)for(let px=0;px<750;px+=8){
let v=rawVal(px,py);
ctx.fillStyle=v>=0?'rgba(56,189,248,0.06)':'rgba(255,107,107,0.06)';
ctx.fillRect(px,py,8,8)}
// Decision boundary line
if(epoch>0&&(Math.abs(w1)>1e-8||Math.abs(w2)>1e-8)){
ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=12;ctx.strokeStyle='#ffd166';ctx.lineWidth=2.5;ctx.beginPath();
// line: w1*(x/750) + w2*(y/340) + b = 0  =>  y = -(w1*x/750 + b)*340/w2
if(Math.abs(w2)>1e-8){
let y0=-(w1*nx(0)+b)/w2*340,y1=-(w1*nx(750)+b)/w2*340;
ctx.moveTo(0,y0);ctx.lineTo(750,y1)}else{let xv=-b/w1*750;ctx.moveTo(xv,0);ctx.lineTo(xv,340)}
ctx.stroke();ctx.restore()}
// Points with glow
pts.forEach(p=>{let pred=predict(p.x,p.y),wrong=pred!==p.c;
ctx.save();if(!wrong){ctx.shadowColor=p.c?'#38bdf8':'#ff6b6b';ctx.shadowBlur=8}
ctx.beginPath();ctx.arc(p.x,p.y,wrong?9:7,0,TAU);ctx.fillStyle=p.c?'#38bdf8':'#ff6b6b';ctx.fill();
if(wrong){ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.stroke()}
ctx.restore()});
// Info panel
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(8,8,240,60,8);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='700 12px Fira Code';ctx.fillText('Epoch '+epoch,18,28);
ctx.fillStyle=errs>0?'#ff6b6b':'#34d399';ctx.font='600 12px Fira Code';
ctx.fillText(errs>0?'Errors: '+errs+'/'+pts.length:'✅ Converged!',100,28);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('w₁='+w1.toFixed(3)+' w₂='+w2.toFixed(3)+' b='+b.toFixed(3),18,48);
ctx.fillText('lr='+lr,18,62);
// Error history mini-chart
if(errHist.length>1){let cx2=560,cy2=8;
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(cx2,cy2,182,65,8);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='500 9px Fira Code';ctx.fillText('Errors over epochs:',cx2+8,cy2+16);
let mx=Math.max(...errHist,1);ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.5;ctx.beginPath();
errHist.forEach((e,i)=>{let x=cx2+8+i*(164/100),y=cy2+60-(e/mx)*38;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
if(errs===0){ctx.fillStyle='#34d399';ctx.font='700 9px Fira Code';ctx.fillText('→ 0',cx2+155,cy2+58)}}
// Algorithm rule
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(8,300,500,34,6);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='500 9px Fira Code';
ctx.fillText('Perceptron Rule: if ŷ ≠ y → w += lr·(y−ŷ)·x, b += lr·(y−ŷ)',18,321);
ctx.fillStyle='#7d7a8c';ctx.fillText('Guaranteed to converge for linearly separable data!',18,335)}
c.onclick=e=>{let r=c.getBoundingClientRect();pts.push({x:(e.clientX-r.left)*750/r.width,y:(e.clientY-r.top)*340/r.height,c:0});draw()};
c.oncontextmenu=e=>{e.preventDefault();let r=c.getBoundingClientRect();pts.push({x:(e.clientX-r.left)*750/r.width,y:(e.clientY-r.top)*340/r.height,c:1});draw()};
const ctrl=addControls(el);
const tb=document.createElement('button');tb.className='btn';tb.textContent='▶ Train ×10';tb.onclick=()=>{for(let i=0;i<10;i++)trainEpoch();draw()};
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='⏩ Auto Train';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}else{tmr=setInterval(()=>{trainEpoch();draw();if(errs===0){clearInterval(tmr);tmr=null;ab.classList.remove('active')}},60);ab.classList.add('active')}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{seed();if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
ctrl.appendChild(tb);ctrl.appendChild(ab);ctrl.appendChild(rst);draw()
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
