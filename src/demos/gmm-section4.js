import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

export function mountGmm(containerId = 'demo-gmm') {
  const __id = containerId || 'demo-gmm';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Click "Step EM" to run one E+M iteration. Watch clusters converge from random initialization.');
let pts=[],K=3,means=[],sigmas=[],pis=[];
function init(){pts=[];
let centers=[{x:180,y:100},{x:400,y:220},{x:600,y:100}];
centers.forEach(c2=>{for(let i=0;i<30;i++)pts.push({x:c2.x+rand(-70,70),y:c2.y+rand(-60,60),resp:Array(K).fill(1/K)})});
means=centers.map(()=>({x:rand(100,650),y:rand(50,270)}));sigmas=Array(K).fill(50);pis=Array(K).fill(1/K)}
init();
let colors=['#ff6b6b','#38bdf8','#ffd166'],emStep=0;
function gaussian(x,y,mx,my,s){let d=((x-mx)**2+(y-my)**2)/(2*s*s);return Math.exp(-d)/(TAU*s*s)}
function eStep(){pts.forEach(p=>{let total=0;let r=means.map((m,k)=>{let v=pis[k]*gaussian(p.x,p.y,m.x,m.y,sigmas[k]);total+=v;return v});
p.resp=r.map(v=>v/(total||1e-10))})}
function mStep(){for(let k=0;k<K;k++){let N2=pts.reduce((a,p)=>a+p.resp[k],0);if(N2<1e-6)continue;
means[k].x=pts.reduce((a,p)=>a+p.resp[k]*p.x,0)/N2;
means[k].y=pts.reduce((a,p)=>a+p.resp[k]*p.y,0)/N2;
sigmas[k]=Math.sqrt(pts.reduce((a,p)=>a+p.resp[k]*((p.x-means[k].x)**2+(p.y-means[k].y)**2),0)/(2*N2));
sigmas[k]=Math.max(sigmas[k],10);pis[k]=N2/pts.length}}
function draw(){ctx.clearRect(0,0,750,320);
means.forEach((m,k)=>{let s=sigmas[k];for(let r=3;r>=1;r--){
ctx.beginPath();ctx.arc(m.x,m.y,s*r*.7,0,TAU);ctx.strokeStyle=colors[k]+'33';ctx.lineWidth=1;ctx.stroke()}});
pts.forEach(p=>{let maxK=0,maxR=0;p.resp.forEach((r,k)=>{if(r>maxR){maxR=r;maxK=k}});
ctx.beginPath();ctx.arc(p.x,p.y,4,0,TAU);ctx.fillStyle=colors[maxK]+(Math.round(Math.max(maxR,.3)*200).toString(16).padStart(2,'0'));ctx.fill()});
means.forEach((m,k)=>{ctx.save();ctx.shadowColor=colors[k];ctx.shadowBlur=12;
ctx.beginPath();ctx.arc(m.x,m.y,8,0,TAU);ctx.fillStyle=colors[k];ctx.fill();ctx.restore();
ctx.fillStyle='#000';ctx.font='bold 9px Fira Code';ctx.textAlign='center';ctx.fillText('\u03bc'+(k+1),m.x,m.y+3);ctx.textAlign='left'});
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(8,8,200,28,6);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 11px Fira Code';ctx.fillText('EM Iteration: '+emStep,18,28);
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,280,720,35,8);ctx.fill();
ctx.fillStyle='#4ecdc4';ctx.font='500 9px Fira Code';
ctx.fillText('E-step: compute P(cluster k | point) using current means/variances',25,295);
ctx.fillText('M-step: update means/variances using soft assignments \u2192 iterate until convergence!',25,310)}
const ctrl=addControls(el);
const sb=document.createElement('button');sb.className='btn';sb.textContent='\u25b6 Step EM';sb.onclick=()=>{eStep();mStep();emStep++;draw()};
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='\u23e9 Auto';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}else{tmr=setInterval(()=>{eStep();mStep();emStep++;draw()},200);ab.classList.add('active')}};
const rst2=document.createElement('button');rst2.className='btn';rst2.textContent='\u21bb Reset';
rst2.onclick=()=>{init();emStep=0;if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
ctrl.appendChild(sb);ctrl.appendChild(ab);ctrl.appendChild(rst2);draw()
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
