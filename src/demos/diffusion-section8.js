import { $, createCanvas, addHint, addControls, clamp } from '../lib/shared.js'

export function mountDiff(containerId = 'demo-diff') {
  const __id = containerId || 'demo-diff';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Press "Denoise" or "Auto" to watch pure noise become a recognizable image step by step!');
const S=12,G=14; // 14x14 grid, 12 denoise steps
// Target image: a simple smiley face pattern
let target=[];
for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){
  let cx2=r-G/2+0.5,cy2=ci-G/2+0.5,d=Math.sqrt(cx2*cx2+cy2*cy2);
  let v=0;
  if(d<6)v=0.3; // face circle
  if(d<5.5&&d>4.5)v=0.7; // face outline
  // Eyes
  if(Math.abs(cx2+2)<1.2&&Math.abs(cy2-2)<1.2)v=0.9;
  if(Math.abs(cx2+2)<1.2&&Math.abs(cy2+2)<1.2)v=0.9;
  // Mouth (arc)
  if(cx2>0&&cx2<2.5&&Math.abs(d-3.5)<0.8&&cy2>-3&&cy2<3)v=0.85;
  target.push(clamp(v,0,1));}
let curS=S; // current noise step (S=full noise, 0=clean)
// Use seeded random for consistent noise
let noiseCache=[];for(let s=0;s<=S;s++){let n=[];for(let i=0;i<G*G;i++)n.push(Math.random());noiseCache.push(n);}
function getGrid(step){return target.map((v,i)=>{let t=step/S;return v*(1-t)+noiseCache[step][i]*t;});}
function draw(){ctx.clearRect(0,0,750,340);
  // Timeline of denoising steps
  const nShow=7,sw=90,sh=90,sy=8;
  ctx.fillStyle='#34d399';ctx.font='700 10px Fira Code';ctx.fillText('Denoising Process: noise \u2192 image',15,sy+6);
  for(let s=0;s<nShow;s++){let step=s===0?S:s===nShow-1?0:Math.round(S*(1-s/(nShow-1)));
    if(s===nShow-1)step=Math.min(curS,0); else if(s>0&&step<curS)step=curS;
    let grid=getGrid(step);
    let x=15+s*(sw+10),y=sy+14;
    let cellPx=Math.floor((sw-4)/G);
    ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(x,y,sw,sw,6);ctx.fill();
    for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){
      let v=grid[r*G+ci];
      ctx.fillStyle='rgba(52,211,153,'+(clamp(v,0.02,1)).toFixed(2)+')';
      ctx.fillRect(x+2+ci*cellPx,y+2+r*cellPx,cellPx-1,cellPx-1);}
    ctx.strokeStyle=step===curS?'#ffd166':'#333';ctx.lineWidth=step===curS?2:1;ctx.beginPath();ctx.roundRect(x,y,sw,sw,6);ctx.stroke();
    ctx.fillStyle=step>S*.7?'#ff6b6b':step>S*.3?'#ffd166':'#34d399';ctx.font='600 8px Fira Code';ctx.textAlign='center';
    ctx.fillText('t='+step,x+sw/2,y+sw+12);ctx.fillText(step===S?'Pure noise':step===0?'Clean image!':'Denoising...',x+sw/2,y+sw+23);
    ctx.textAlign='left';
    if(s<nShow-1){ctx.fillStyle='#4a475a';ctx.font='16px sans-serif';ctx.fillText('\u2192',x+sw+1,y+sw/2);}}
  // Current large view
  const bx=15,by=sy+sw+38,bsz=130;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(bx,by,bsz+10,bsz+30,8);ctx.fill();
  let curGrid=getGrid(curS);
  let bCellPx=Math.floor(bsz/G);
  for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){
    let v=curGrid[r*G+ci];
    ctx.fillStyle='rgba(52,211,153,'+(clamp(v,0.02,1)).toFixed(2)+')';
    ctx.fillRect(bx+5+ci*bCellPx,by+5+r*bCellPx,bCellPx-1,bCellPx-1);}
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Step '+curS+'/'+S,bx+5,by+bsz+20);
  // Progress bar
  ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(bx+5,by+bsz+24,bsz,10,3);ctx.fill();
  let prog=1-curS/S;
  let pGrad=ctx.createLinearGradient(bx+5,0,bx+5+bsz,0);pGrad.addColorStop(0,'#ff6b6b');pGrad.addColorStop(0.5,'#ffd166');pGrad.addColorStop(1,'#34d399');
  ctx.fillStyle=pGrad;ctx.beginPath();ctx.roundRect(bx+5,by+bsz+24,bsz*prog,10,3);ctx.fill();
  // Explanation panel
  const ex=bx+bsz+20,ey=by;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(ex,ey,575,bsz+30,10);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 12px Fira Code';ctx.fillText('How Diffusion Models Work:',ex+10,ey+20);
  // Forward process visual
  ctx.fillStyle='#ff6b6b';ctx.font='600 10px Fira Code';ctx.fillText('\u25b6 Forward (training): gradually ADD noise',ex+10,ey+42);
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('x\u2080 (clean image) \u2192 x\u2081 \u2192 x\u2082 \u2192 ... \u2192 x_T (pure Gaussian noise)',ex+10,ey+58);
  // Reverse process
  ctx.fillStyle='#34d399';ctx.font='600 10px Fira Code';ctx.fillText('\u25c0 Reverse (generation): neural net REMOVES noise step by step',ex+10,ey+80);
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('x_T (noise) \u2192 ... \u2192 x\u2081 \u2192 x\u2080 (image!) \u2014 model predicts noise at each step',ex+10,ey+96);
  // Text guidance
  ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('\ud83d\udcdd Text guidance (Stable Diffusion): CLIP encodes prompt, guides denoising via cross-attention',ex+10,ey+118);
  ctx.fillStyle='#a78bfa';ctx.font='400 9px Fira Code';
  ctx.fillText('This is how Stable Diffusion, DALL-E 3, Midjourney all work! Each step refines the image.',ex+10,ey+138);
  ctx.fillText('Quality comes from MANY small denoising steps (typically 20-50 steps).',ex+10,ey+154);}
const ctrl=addControls(el);
const db=document.createElement('button');db.className='btn';db.textContent='\u25b6 Denoise';db.onclick=()=>{if(curS>0){curS--;draw();}};
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='\u23e9 Auto';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active');}else{tmr=setInterval(()=>{if(curS>0){curS--;draw();}else{clearInterval(tmr);tmr=null;ab.classList.remove('active');}},250);ab.classList.add('active');}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Full Noise';
rst.onclick=()=>{curS=S;if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active');}draw();};
ctrl.appendChild(db);ctrl.appendChild(ab);ctrl.appendChild(rst);draw()
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
