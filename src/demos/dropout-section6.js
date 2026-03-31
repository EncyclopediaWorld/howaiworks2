import { $, createCanvas, addHint, addControls, TAU } from '../lib/shared.js'

export function mountDrop(containerId = 'demo-drop') {
  const __id = containerId || 'demo-drop';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Toggle Training vs Inference. Drag the slider to change drop rate. "Resample" shows different masks.');
let mode='train',dropRate=.5;
const layers=[[0,1,2,3],[0,1,2,3,4,5],[0,1,2,3,4,5],[0,1,2,3]];
let masks=layers.map(l=>l.map(()=>Math.random()>dropRate?1:0));
function resample(){masks=layers.map(l=>l.map(()=>Math.random()>dropRate?1:0));draw();}
function draw(){ctx.clearRect(0,0,750,300);
let lx=[120,280,440,600],ly=140,labels=['Input','Hidden 1','Hidden 2','Output'],colors=['#38bdf8','#a78bfa','#fb923c','#34d399'];
for(let l=0;l<3;l++){layers[l].forEach((fi,fIdx)=>{layers[l+1].forEach((ti,tIdx)=>{
let fA=mode==='test'||masks[l][fIdx],tA=mode==='test'||masks[l+1][tIdx];
let fy=ly-layers[l].length*20+fIdx*40,ty=ly-layers[l+1].length*20+tIdx*40;
ctx.strokeStyle=fA&&tA?'rgba(255,255,255,.08)':'rgba(255,255,255,.015)';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(lx[l],fy);ctx.lineTo(lx[l+1],ty);ctx.stroke()})});}
layers.forEach((layer,li)=>{layer.forEach((n,ni)=>{
let y=ly-layer.length*20+ni*40,active=mode==='test'||masks[li][ni];
ctx.save();if(active){ctx.shadowColor=colors[li];ctx.shadowBlur=10;}
ctx.beginPath();ctx.arc(lx[li],y,14,0,TAU);
ctx.fillStyle=active?colors[li]+'33':'#0c0c16';ctx.fill();
ctx.strokeStyle=active?colors[li]:'#333';ctx.lineWidth=active?2:1;ctx.stroke();ctx.restore();
if(!active){ctx.strokeStyle='#ff6b6b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(lx[li]-8,y-8);ctx.lineTo(lx[li]+8,y+8);ctx.stroke();
ctx.beginPath();ctx.moveTo(lx[li]+8,y-8);ctx.lineTo(lx[li]-8,y+8);ctx.stroke();}
ctx.fillStyle=active?'#e4e2df':'#4a475a';ctx.font='bold 8px Fira Code';ctx.textAlign='center';
ctx.fillText(active?(mode==='test'?'×'+(1-dropRate).toFixed(1):'ON'):'OFF',lx[li],y+3);ctx.textAlign='left';})});
layers.forEach((l,i)=>{ctx.fillStyle=colors[i];ctx.font='500 9px Fira Code';ctx.textAlign='center';ctx.fillText(labels[i],lx[i],ly+l.length*20+20);ctx.textAlign='left';});
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(8,8,250,55,8);ctx.fill();
ctx.fillStyle=mode==='train'?'#ff6b6b':'#34d399';ctx.font='700 14px Fira Code';
ctx.fillText(mode==='train'?'\ud83c\udfb2 TRAINING':'\u2705 INFERENCE',18,30);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText(mode==='train'?'Drop rate: '+(dropRate*100).toFixed(0)+'% \u2014 neurons randomly killed':'All active, weights \u00d7 '+(1-dropRate).toFixed(1)+' (keep prob)',18,50);
let active=masks.flat().filter(v=>v).length,total=masks.flat().length;
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,255,720,38,8);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='500 9px Fira Code';
ctx.fillText(mode==='train'?'Active: '+active+'/'+total+'. Each sample sees a DIFFERENT sub-network \u2192 ensemble effect!':
'Test: all neurons ON, outputs \u00d7 keep prob ('+(1-dropRate).toFixed(1)+') to match training scale.',25,278);}
const ctrl=addControls(el);
const mt=document.createElement('button');mt.className='btn active';mt.textContent='\ud83c\udfb2 Train';
const mi=document.createElement('button');mi.className='btn';mi.textContent='\u2705 Inference';
mt.onclick=()=>{mode='train';mt.classList.add('active');mi.classList.remove('active');resample();};
mi.onclick=()=>{mode='test';mi.classList.add('active');mt.classList.remove('active');draw();};
const rs=document.createElement('button');rs.className='btn';rs.textContent='\ud83c\udfb2 Resample';rs.onclick=resample;
// Dropout rate slider
const dlbl=document.createElement('label');dlbl.textContent='Rate';dlbl.style.cssText='color:#ff6b6b;font:500 10px Fira Code;margin-left:8px';
const dslider=document.createElement('input');dslider.type='range';dslider.min='10';dslider.max='90';dslider.value='50';dslider.style.cssText='width:80px;vertical-align:middle';
const dval=document.createElement('span');dval.className='btn';dval.style.cssText='min-width:38px;text-align:center;font-size:10px';dval.textContent='50%';
dslider.oninput=e=>{dropRate=e.target.value/100;dval.textContent=(dropRate*100).toFixed(0)+'%';resample();};
ctrl.appendChild(mt);ctrl.appendChild(mi);ctrl.appendChild(rs);ctrl.appendChild(dlbl);ctrl.appendChild(dslider);ctrl.appendChild(dval);draw()
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
