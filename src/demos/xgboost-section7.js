import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

export function mountXgb(containerId = 'demo-xgb') {
  const __id = containerId || 'demo-xgb';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Compare GBDT vs XGBoost. XGBoost adds regularization to prevent overfitting!');
let data=[];for(let i=0;i<25;i++){let x=i/24*680+35;data.push({x,y:150+Math.sin(i/24*5)*70+rand(-20,20)})}
let treesP=[],treesX=[],predsP=data.map(()=>150),predsX=data.map(()=>150);
function fitStump(resid,shrink){let best={split:350,lm:0,rm:0},bestS=Infinity;
for(let s=50;s<680;s+=25){let L=[],R=[];resid.forEach((r,i)=>{if(data[i].x<=s)L.push(r);else R.push(r)});
if(!L.length||!R.length)continue;let lm=L.reduce((a,b)=>a+b,0)/L.length*shrink,rm=R.reduce((a,b)=>a+b,0)/R.length*shrink;
let sc=L.reduce((a,v)=>a+(v-lm)**2,0)+R.reduce((a,v)=>a+(v-rm)**2,0);
if(sc<bestS){bestS=sc;best={split:s,lm,rm}}}return best}
function addBoth(){let rP=data.map((d,i)=>d.y-predsP[i]),rX=data.map((d,i)=>d.y-predsX[i]);
let bP=fitStump(rP,1.0),bX=fitStump(rX,0.7);treesP.push(bP);treesX.push(bX);
predsP=predsP.map((p,i)=>p+0.3*(data[i].x<=bP.split?bP.lm:bP.rm));
predsX=predsX.map((p,i)=>p+0.3*(data[i].x<=bX.split?bX.lm*0.7:bX.rm*0.7));draw()}
function mse(preds){return data.reduce((a,d,i)=>a+(d.y-preds[i])**2,0)/data.length}
function draw(){ctx.clearRect(0,0,750,300);
let mid=375;ctx.strokeStyle='#1e1e32';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(mid,0);ctx.lineTo(mid,250);ctx.stroke();
ctx.fillStyle='#ff6b6b';ctx.font='600 10px Fira Code';ctx.fillText('Plain GBDT',15,15);
ctx.fillStyle='#34d399';ctx.fillText('XGBoost (+regularization)',mid+15,15);
data.forEach(d=>{ctx.beginPath();ctx.arc(d.x,d.y,3,0,TAU);ctx.fillStyle='#38bdf8';ctx.fill()});
if(treesP.length){ctx.save();ctx.beginPath();ctx.rect(0,0,mid,300);ctx.clip();
ctx.strokeStyle='#ff6b6b';ctx.lineWidth=2;ctx.beginPath();data.forEach((d,i)=>{i?ctx.lineTo(d.x,predsP[i]):ctx.moveTo(d.x,predsP[i])});ctx.stroke();ctx.restore()}
if(treesX.length){ctx.save();ctx.beginPath();ctx.rect(mid,0,mid,300);ctx.clip();
ctx.strokeStyle='#34d399';ctx.lineWidth=2;ctx.beginPath();data.forEach((d,i)=>{i?ctx.lineTo(d.x,predsX[i]):ctx.moveTo(d.x,predsX[i])});ctx.stroke();ctx.restore()}
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,255,720,38,8);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='500 9px Fira Code';ctx.fillText('GBDT: '+treesP.length+' trees, MSE='+mse(predsP).toFixed(1),25,272);
ctx.fillStyle='#34d399';ctx.fillText('XGBoost: '+treesX.length+' trees, MSE='+mse(predsX).toFixed(1)+' (regularized → less overfitting)',25,288)}
const ctrl=addControls(el);
const ab=document.createElement('button');ab.className='btn';ab.textContent='🌳 +1 Tree';ab.onclick=addBoth;
const a5=document.createElement('button');a5.className='btn';a5.textContent='🌲 +10';a5.onclick=()=>{for(let i=0;i<10;i++)addBoth()};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{treesP=[];treesX=[];predsP=data.map(()=>150);predsX=data.map(()=>150);draw()};
ctrl.appendChild(ab);ctrl.appendChild(a5);ctrl.appendChild(rst);draw()
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
