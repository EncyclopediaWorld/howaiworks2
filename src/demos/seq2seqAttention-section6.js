import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountAttn(containerId = 'demo-attn') {
  const __id = containerId || 'demo-attn';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Click any French word below to see which English words it attends to. Brighter/thicker lines = higher attention.');
const src=['The','cat','sat','on','the','mat'];
const tgt=['Le','chat','\u00e9tait','assis','sur','le','tapis'];
const attnM=[[.8,.05,.02,.02,.08,.03],[.05,.75,.05,.03,.02,.1],[.02,.1,.6,.15,.03,.1],
[.03,.05,.15,.65,.05,.07],[.05,.02,.03,.1,.7,.1],[.7,.03,.02,.02,.15,.08],[.02,.08,.05,.05,.1,.7]];
let selT=1;
function draw(){ctx.clearRect(0,0,750,300);
let srcX=50,srcY=28,tgtY=195,bw=98,tBw=95;
ctx.fillStyle='#38bdf8';ctx.font='600 10px Fira Code';ctx.fillText('Source (English):',15,srcY-5);
src.forEach((w,i)=>{let x=srcX+i*108;let attn=attnM[selT][i];
ctx.fillStyle='rgba(56,189,248,'+(0.05+attn*0.4).toFixed(2)+')';ctx.beginPath();ctx.roundRect(x,srcY,bw,32,6);ctx.fill();
ctx.strokeStyle='rgba(56,189,248,'+(0.2+attn*0.8).toFixed(2)+')';ctx.lineWidth=1+attn*3;ctx.beginPath();ctx.roundRect(x,srcY,bw,32,6);ctx.stroke();
ctx.fillStyle='#e4e2df';ctx.font='500 11px Fira Code';ctx.textAlign='center';ctx.fillText(w,x+bw/2,srcY+20);
ctx.fillStyle='#ffd166';ctx.font='500 8px Fira Code';ctx.fillText((attn*100|0)+'%',x+bw/2,srcY+44);ctx.textAlign='left';});
// Attention connections (draw BEFORE target boxes)
src.forEach((w,i)=>{let attn=attnM[selT][i];if(attn<.02)return;
  let sx=srcX+i*108+bw/2,sy=srcY+32;
  let tx=15+selT*102+tBw/2,ty=tgtY;
  ctx.strokeStyle='rgba(255,209,102,'+attn.toFixed(2)+')';ctx.lineWidth=attn*8;
  ctx.beginPath();ctx.moveTo(sx,sy+12);ctx.quadraticCurveTo((sx+tx)/2,sy+60,tx,ty);ctx.stroke();});
ctx.fillStyle='#4ecdc4';ctx.font='600 10px Fira Code';ctx.fillText('Target (French) \u2014 click a word:',15,tgtY-8);
tgt.forEach((w,i)=>{let x=15+i*102;let isSel=i===selT;
ctx.fillStyle=isSel?'rgba(78,205,196,.18)':'rgba(78,205,196,.04)';ctx.beginPath();ctx.roundRect(x,tgtY,tBw,32,6);ctx.fill();
ctx.strokeStyle=isSel?'#4ecdc4':'#4ecdc433';ctx.lineWidth=isSel?2.5:1;ctx.beginPath();ctx.roundRect(x,tgtY,tBw,32,6);ctx.stroke();
ctx.fillStyle=isSel?'#e4e2df':'#7d7a8c';ctx.font=(isSel?'700':'400')+' 11px Fira Code';ctx.textAlign='center';ctx.fillText(w,x+tBw/2,tgtY+20);ctx.textAlign='left';});
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,246,720,48,8);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('Attention: "'+tgt[selT]+'" focuses on: '+src.map((w,i)=>attnM[selT][i]>.1?w+' ('+Math.round(attnM[selT][i]*100)+'%)':'').filter(Boolean).join(', '),25,264);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('Without attention: entire input crammed into ONE vector. With attention: decoder looks back at relevant words each step!',25,284);}
c.onclick=e=>{let r=c.getBoundingClientRect(),my=(e.clientY-r.top)*300/r.height,mx=(e.clientX-r.left)*750/r.width;
if(my>=195-10&&my<=195+42){tgt.forEach((w,i)=>{let x=15+i*102;if(mx>=x&&mx<=x+95){selT=i;draw();}});}};
const ctrl=addControls(el);
// Add clickable target word buttons for easier interaction
tgt.forEach((w,i)=>{const b=document.createElement('button');b.className='btn';b.textContent=w;b.style.cssText='font-size:10px;padding:2px 8px';
  b.onclick=()=>{selT=i;draw();};ctrl.appendChild(b);});
draw()
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
