import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

export function mountGbdt(containerId = 'demo-gbdt') {
  const __id = containerId || 'demo-gbdt';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Each tree fits the RESIDUALS (red gaps) of the current prediction. Watch the green line approach the blue targets!');
let data=[];for(let i=0;i<30;i++){let x=20+i*23;data.push({x,y:150+Math.sin(i*.3)*80+rand(-15,15)})}
let trees=[],predictions=data.map(()=>150),lr4=0.3;
function addTree(){let residuals=data.map((d,i)=>d.y-predictions[i]);
let bestScore=Infinity,bestVal=null;
for(let s=40;s<710;s+=15){let left=residuals.filter((_,i)=>data[i].x<=s);
let right=residuals.filter((_,i)=>data[i].x>s);
if(left.length<2||right.length<2)continue;
let lm=left.reduce((a,b)=>a+b,0)/left.length;let rm=right.reduce((a,b)=>a+b,0)/right.length;
let score=left.reduce((a,v)=>a+(v-lm)**2,0)+right.reduce((a,v)=>a+(v-rm)**2,0);
if(score<bestScore){bestScore=score;bestVal={split:s,lm,rm}}}
if(!bestVal)return;trees.push(bestVal);
predictions=predictions.map((p,i)=>p+lr4*(data[i].x<=bestVal.split?bestVal.lm:bestVal.rm));draw()}
function draw(){ctx.clearRect(0,0,750,340);
for(let y=0;y<300;y+=50){ctx.strokeStyle='#1a1a2a';ctx.beginPath();ctx.moveTo(20,y);ctx.lineTo(730,y);ctx.stroke()}
// Target points
data.forEach(d=>{ctx.save();ctx.shadowColor='#38bdf8';ctx.shadowBlur=4;
ctx.beginPath();ctx.arc(d.x,d.y,4,0,TAU);ctx.fillStyle='#38bdf8';ctx.fill();ctx.restore()});
// Prediction line
if(trees.length>0){ctx.save();ctx.shadowColor='#34d399';ctx.shadowBlur=5;
ctx.strokeStyle='#34d399';ctx.lineWidth=2.5;ctx.beginPath();
data.forEach((d,i)=>{i?ctx.lineTo(d.x,predictions[i]):ctx.moveTo(d.x,predictions[i])});ctx.stroke();ctx.restore();
// Residuals
data.forEach((d,i)=>{let r=d.y-predictions[i];if(Math.abs(r)>3){
ctx.strokeStyle='rgba(255,107,107,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(d.x,predictions[i]);ctx.lineTo(d.x,d.y);ctx.stroke()}})}
else{ctx.strokeStyle='#34d39966';ctx.lineWidth=2;ctx.setLineDash([4,4]);
ctx.beginPath();ctx.moveTo(20,150);ctx.lineTo(730,150);ctx.stroke();ctx.setLineDash([])}
// Tree splits
trees.forEach((t,i)=>{ctx.strokeStyle=`rgba(255,209,102,${.08+.04*Math.min(i,8)})`;ctx.lineWidth=1;ctx.setLineDash([3,3]);
ctx.beginPath();ctx.moveTo(t.split,0);ctx.lineTo(t.split,300);ctx.stroke();ctx.setLineDash([])});
// Info
let mse=data.reduce((a,d,i)=>a+(d.y-predictions[i])**2,0)/data.length;
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(8,8,260,48,8);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 11px Fira Code';ctx.fillText('Trees: '+trees.length+' | MSE: '+mse.toFixed(1),18,28);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('lr='+lr4+' | Blue=target Green=prediction',18,46);
// Bottom
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,300,720,35,8);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='500 9px Fira Code';
ctx.fillText('Each tree fits residuals (red gaps). New prediction = old + lr × tree(x). Residuals shrink each round!',25,320);
ctx.fillStyle='#7d7a8c';ctx.fillText('Unlike Random Forest (parallel), GBDT builds trees sequentially.',25,334)}
const ctrl=addControls(el);
const ab2=document.createElement('button');ab2.className='btn';ab2.textContent='🌳 +1 Tree';ab2.onclick=addTree;
const a5=document.createElement('button');a5.className='btn';a5.textContent='🌲 +5 Trees';a5.onclick=()=>{for(let i=0;i<5;i++)addTree()};
let tmr=null;const auto=document.createElement('button');auto.className='btn';auto.textContent='⏩ Auto';
auto.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;auto.classList.remove('active')}else{tmr=setInterval(()=>{addTree();if(trees.length>30){clearInterval(tmr);tmr=null;auto.classList.remove('active')}},200);auto.classList.add('active')}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{trees=[];predictions=data.map(()=>150);if(tmr){clearInterval(tmr);tmr=null;auto.classList.remove('active')}draw()};
ctrl.appendChild(ab2);ctrl.appendChild(a5);ctrl.appendChild(auto);ctrl.appendChild(rst);draw()
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
