import { $, createCanvas, addHint, addControls, rand, clamp } from '../lib/shared.js'

export function mountBn(containerId = 'demo-bn') {
  const __id = containerId || 'demo-bn';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 310);
addHint(el,'Toggle BatchNorm on/off. Watch layer distributions go from tidy to chaotic! All layers share the SAME axis scale.');
let bnOn=true;
// FIXED raw activations so toggling BN shows the same data differently
let rawActs=[];
function generateRaw(){rawActs=[];for(let l=0;l<5;l++){let a=[];
  for(let i=0;i<200;i++){
    // Deeper layers have MUCH wider, shifted distributions
    let base=Math.sin(i*.3+l*2)*0.8;
    let noise=rand(-1,1)*(0.4+l*0.55); // spread grows with depth
    let shift=l*0.8; // mean drifts with depth
    a.push(base+noise+shift);
  }rawActs.push(a);}}
generateRaw();

function getActs(layer,bn){
  let acts=[...rawActs[layer]];
  if(bn){let mean=acts.reduce((a,b)=>a+b)/acts.length;
    let std=Math.sqrt(acts.reduce((a,b)=>a+(b-mean)**2,0)/acts.length)||1;
    acts=acts.map(v=>(v-mean)/std*0.5);} // normalize to tight range
  return acts;}

function draw(){ctx.clearRect(0,0,750,310);
  let nLayers=5,lw=140,lh=128,ox=8;
  // GLOBAL fixed range so all histograms share the same x-axis
  const globalMin=-5,globalMax=7; // fixed axis
  const globalRange=globalMax-globalMin;
  const nBins=28;

  for(let l=0;l<nLayers;l++){let x=ox+l*(lw+5),y=10;
    let acts=getActs(l,bnOn);
    // Bin into fixed global range
    let bins=Array(nBins).fill(0);
    acts.forEach(v=>{let bi=Math.floor((v-globalMin)/globalRange*nBins);
      if(bi>=0&&bi<nBins)bins[bi]++;});
    // Use a GLOBAL max bin count for consistent bar heights across layers
    let maxBin=Math.max(...bins,1);
    // Panel
    ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(x,y,lw,lh,6);ctx.fill();
    // Color based on how well-behaved
    let mean=acts.reduce((a,b)=>a+b)/acts.length;
    let std=Math.sqrt(acts.reduce((a,v)=>a+(v-mean)**2,0)/acts.length);
    let isGood=std<1.5;
    ctx.strokeStyle=isGood?'#34d39966':'#ff6b6b66';ctx.lineWidth=2;
    ctx.beginPath();ctx.roundRect(x,y,lw,lh,6);ctx.stroke();
    // Histogram bars
    let bw2=(lw-8)/nBins;
    bins.forEach((b,bi)=>{if(b===0)return;
      let bx2=x+4+bi*bw2, bh2=(b/maxBin)*(lh-30);
      let intensity=clamp(b/maxBin,0.2,1);
      if(isGood){
        ctx.fillStyle='rgba(52,211,153,'+intensity.toFixed(2)+')';
      } else {
        ctx.fillStyle='rgba(255,107,107,'+intensity.toFixed(2)+')';
      }
      ctx.fillRect(bx2,y+lh-4-bh2,bw2-0.5,bh2);});
    // Mean line
    let meanX=x+4+(mean-globalMin)/globalRange*(lw-8);
    if(meanX>x+4&&meanX<x+lw-4){
      ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.moveTo(meanX,y+14);ctx.lineTo(meanX,y+lh-4);ctx.stroke();ctx.setLineDash([]);}
    // +/- 1 std shading
    let stdL=x+4+((mean-std)-globalMin)/globalRange*(lw-8);
    let stdR=x+4+((mean+std)-globalMin)/globalRange*(lw-8);
    stdL=clamp(stdL,x+4,x+lw-4);stdR=clamp(stdR,x+4,x+lw-4);
    ctx.fillStyle='rgba(255,209,102,0.06)';ctx.fillRect(stdL,y+14,stdR-stdL,lh-18);
    // Labels
    ctx.fillStyle=isGood?'#34d399':'#ff6b6b';ctx.font='700 10px Fira Code';ctx.textAlign='center';
    ctx.fillText('Layer '+(l+1),x+lw/2,y+13);
    ctx.fillStyle='#e4e2df';ctx.font='500 8px Fira Code';
    ctx.fillText('\u03bc='+mean.toFixed(1)+' \u03c3='+std.toFixed(1),x+lw/2,y+lh+12);
    if(!bnOn&&l>=3){ctx.fillStyle='#ff6b6b';ctx.font='bold 9px Fira Code';ctx.fillText('\u26a0 EXPLODING!',x+lw/2,y+lh+24);}
    if(bnOn){ctx.fillStyle='#34d39988';ctx.font='400 7px Fira Code';ctx.fillText('normalized',x+lw/2,y+lh+24);}
    ctx.textAlign='left';}
  // Info
  let iy=170;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(8,iy,734,130,10);ctx.fill();
  ctx.fillStyle=bnOn?'#34d399':'#ff6b6b';ctx.font='700 14px Fira Code';
  ctx.fillText(bnOn?'\u2705 BatchNorm ON':'\u274c BatchNorm OFF',20,iy+22);
  if(bnOn){
    ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
    ctx.fillText('All 5 layers: tight, centered distributions. Every layer sees well-behaved inputs (\u03bc\u22480, \u03c3\u22480.5).',20,iy+42);
    ctx.fillText('Result: stable gradients, fast convergence, can use higher learning rates safely.',20,iy+58);
    ctx.fillStyle='#ffd166';ctx.font='500 9px Fira Code';
    ctx.fillText('x\u0302 = (x\u2212\u03bc_batch)/\u221a(\u03c3\u00b2+\u03b5)  then  y = \u03b3\u00b7x\u0302 + \u03b2  (\u03b3,\u03b2 learnable per layer)',20,iy+78);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    ctx.fillText('Yellow dashed = mean, shaded = \u00b11\u03c3. All histograms are tall & narrow = concentrated around 0.',20,iy+96);
  } else {
    ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
    ctx.fillText('Without BN: deeper layers drift (mean shifts) and explode (std grows). Compare Layer 1 vs Layer 5!',20,iy+42);
    ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';
    ctx.fillText('Layer 1: \u03c3\u22481 (narrow, centered)    vs    Layer 5: \u03c3\u22483+ (wide, shifted) \u2192 UNSTABLE training!',20,iy+58);
    ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
    ctx.fillText('This is "internal covariate shift": each layer sees wildly different input distributions every update.',20,iy+78);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    ctx.fillText('Histograms use the SAME x-axis range \u2192 you can see Layer 5 spread much wider than Layer 1.',20,iy+96);
  }
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
  ctx.fillText('Used in nearly every modern deep network. Adapted as LayerNorm (across features) in Transformers.',20,iy+116);}
const ctrl=addControls(el);
const tog=document.createElement('button');tog.className='btn active';tog.textContent='\u2705 BN ON';
tog.onclick=()=>{bnOn=!bnOn;tog.textContent=bnOn?'\u2705 BN ON':'\u274c BN OFF';tog.classList.toggle('active');draw();};
const rs2=document.createElement('button');rs2.className='btn';rs2.textContent='\ud83c\udfb2 Resample';rs2.onclick=()=>{generateRaw();draw();};
ctrl.appendChild(tog);ctrl.appendChild(rs2);draw()
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
