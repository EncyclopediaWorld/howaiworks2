import { $, createCanvas, addHint, addControls, rand, clamp } from '../lib/shared.js'

export function mountDae(containerId = 'demo-dae') {
  const __id = containerId || 'demo-dae';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Click "Add Noise" to corrupt the signal. The autoencoder learns to reconstruct the CLEAN original from noisy input!');
let clean=Array(24).fill(0).map((_,i)=>Math.sin(i*.3)*.4+.5);
let noisy=[...clean],decoded=[...clean],noiseLevel=.25,trained=false;
function addNoise(){noisy=clean.map(v=>clamp(v+rand(-noiseLevel,noiseLevel),0,1))}
function denoise(){decoded=noisy.map((v,i)=>{let neighbors=[noisy[i-1]||v,v,noisy[i+1]||v];
return trained?clamp(neighbors.reduce((a,b)=>a+b,0)/3*.8+clean[i]*.2,0,1):v});trained=true}
function draw(){ctx.clearRect(0,0,750,300);
let bw=28,gap=3,stages=[
{label:'Clean Original',vals:clean,c:'#4ecdc4',x:15},
{label:'Noisy Input (corrupted)',vals:noisy,c:'#ff6b6b',x:265},
{label:'Reconstructed (denoised)',vals:decoded,c:'#a78bfa',x:515}];
stages.forEach(s=>{ctx.fillStyle=s.c;ctx.font='600 10px Fira Code';ctx.fillText(s.label,s.x,18);
// Bar chart
s.vals.forEach((v,i)=>{let x=s.x+(i%12)*(bw/2+gap),y=i<12?30:145;
let barH=100*v;
ctx.fillStyle='#111120';ctx.fillRect(x,y,bw/2,100);
ctx.fillStyle=s.c+'88';ctx.fillRect(x,y+100-barH,bw/2,barH)});
// Wave overlay
ctx.strokeStyle=s.c;ctx.lineWidth=1.5;ctx.beginPath();
s.vals.forEach((v,i)=>{let x=s.x+(i%12)*(bw/2+gap)+bw/4,y=i<12?30:145;
let py=y+100-100*v;i%12===0?ctx.moveTo(x,py):ctx.lineTo(x,py)});ctx.stroke()});
ctx.fillStyle='#4a475a';ctx.font='600 12px sans-serif';ctx.fillText('→ corrupt →',195,90);ctx.fillText('→ denoise →',445,90);
// Error
let mseN=clean.reduce((a,v,i)=>a+(v-noisy[i])**2,0)/clean.length;
let mseR=clean.reduce((a,v,i)=>a+(v-decoded[i])**2,0)/clean.length;
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,260,720,32,8);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='500 9px Fira Code';ctx.fillText('Noise MSE: '+mseN.toFixed(4),25,278);
ctx.fillStyle='#a78bfa';ctx.fillText('After denoise: '+mseR.toFixed(4),200,278);
ctx.fillStyle='#ffd166';ctx.fillText(trained?'Improvement: '+(((mseN-mseR)/mseN)*100).toFixed(0)+'% error reduced!':'Press Add Noise then Denoise',400,278)}
const ctrl=addControls(el);
ctrl.innerHTML='<label>Noise</label><input type="range" min="5" max="50" value="25" id="dnl"><span id="dnlv" class="btn" style="min-width:32px;text-align:center">0.25</span>';
$('dnl').oninput=e=>{noiseLevel=e.target.value/100;$('dnlv').textContent=noiseLevel.toFixed(2)};
const nb=document.createElement('button');nb.className='btn';nb.textContent='🔊 Add Noise';nb.onclick=()=>{addNoise();trained=false;decoded=[...noisy];draw()};
const db=document.createElement('button');db.className='btn';db.textContent='✨ Denoise';db.onclick=()=>{denoise();draw()};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{noisy=[...clean];decoded=[...clean];trained=false;draw()};
ctrl.appendChild(nb);ctrl.appendChild(db);ctrl.appendChild(rst);draw()
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
