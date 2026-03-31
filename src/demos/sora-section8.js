import { $, createCanvas, addHint, addControls, rand, clamp } from '../lib/shared.js'

export function mountSora(containerId = 'demo-sora') {
  const __id = containerId || 'demo-sora';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Press Play to watch temporal diffusion: text prompt → spacetime patches → denoised video frames!');
let frame=0,playing=false,totalF=12,denoise=1;
const prompt='"A cat walking through a sunlit garden, cinematic"';
function genFrame(f,noise){let grid=[];for(let r=0;r<6;r++)for(let c2=0;c2<8;c2++){
let base=(Math.sin(r*.5+f*.3)*Math.cos(c2*.4+f*.2)+1)/2,motion=Math.sin(f*.5+c2*.3)*.15;
grid.push(clamp((base+motion)*(1-noise)+rand(0,1)*noise,0,1))}return grid}
function draw(){ctx.clearRect(0,0,750,320);
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,8,720,28,6);ctx.fill();
ctx.fillStyle='#f472b6';ctx.font='600 10px Fira Code';ctx.fillText('Prompt: '+prompt,25,26);
let fx=15,fy=48,fw=55,fh=42;
for(let f=0;f<totalF;f++){let x=fx+f*60,y=fy,grid=genFrame(f,f>=frame?denoise:0);
ctx.fillStyle='rgba(6,6,12,.7)';ctx.fillRect(x,y,fw,fh);
for(let r=0;r<6;r++)for(let c2=0;c2<8;c2++){ctx.fillStyle=`rgba(52,211,153,${grid[r*8+c2]})`;ctx.fillRect(x+c2*7,y+r*7,6,6)}
ctx.strokeStyle=f===frame?'#ffd166':'#1e1e32';ctx.lineWidth=f===frame?2:1;ctx.strokeRect(x,y,fw,fh);
ctx.fillStyle=f<frame?'#34d399':f===frame?'#ffd166':'#4a475a';ctx.font='400 6px Fira Code';ctx.textAlign='center';ctx.fillText('f'+f,x+fw/2,y+fh+10);ctx.textAlign='left'}
let ay=115;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,ay,720,90,10);ctx.fill();
ctx.fillStyle='#f472b6';ctx.font='700 12px Fira Code';ctx.fillText('Sora: Diffusion Transformer on Spacetime Patches',25,ay+18);
[{n:'Text\nEncoder',c:'#38bdf8',x:15},{n:'Spacetime\nPatchify',c:'#a78bfa',x:145},{n:'DiT\n(Diffusion\nTransformer)',c:'#f472b6',x:290},
{n:'Temporal\nAttention',c:'#fb923c',x:440},{n:'Video\nFrames',c:'#34d399',x:580}].forEach((b,i)=>{let x=b.x+10,y=ay+30;
ctx.fillStyle=b.c+'22';ctx.beginPath();ctx.roundRect(x,y,115,48,6);ctx.fill();
ctx.strokeStyle=b.c;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x,y,115,48,6);ctx.stroke();
ctx.fillStyle=b.c;ctx.font='500 8px Fira Code';ctx.textAlign='center';b.n.split('\n').forEach((l,li)=>ctx.fillText(l,x+57,y+14+li*12));ctx.textAlign='left';
if(i<4){ctx.fillStyle='#4a475a';ctx.font='12px sans-serif';ctx.fillText('→',x+118,y+27)}});
let ky=215;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,ky,720,95,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('How Sora works:',25,ky+18);
[{t:'Spacetime Patches:',d:'Video → 3D patches (space×time), like ViT but with temporal dimension.',c:'#a78bfa'},
{t:'Diffusion Transformer:',d:'DiT denoises from noise → video. Text guides via cross-attention.',c:'#f472b6'},
{t:'Temporal Consistency:',d:'Attention across frames: objects persist, physics real, motion smooth.',c:'#fb923c'}].forEach((inn,i)=>{
ctx.fillStyle=inn.c;ctx.font='600 9px Fira Code';ctx.fillText(inn.t,25,ky+38+i*22);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText(inn.d,175,ky+38+i*22)})}
const ctrl=addControls(el);let tmr=null;
const pb=document.createElement('button');pb.className='btn';pb.textContent='▶ Play';
pb.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;pb.classList.remove('active');pb.textContent='▶ Play'}
else{frame=0;denoise=1;pb.classList.add('active');pb.textContent='⏸ Pause';
tmr=setInterval(()=>{frame++;denoise=Math.max(0,1-frame/totalF);if(frame>=totalF){clearInterval(tmr);tmr=null;pb.classList.remove('active');pb.textContent='▶ Play'}draw()},250)}};
const db=document.createElement('button');db.className='btn';db.textContent='▶ Denoise';db.onclick=()=>{denoise=Math.max(0,denoise-.15);draw()};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{frame=0;denoise=1;if(tmr){clearInterval(tmr);tmr=null;pb.classList.remove('active');pb.textContent='▶ Play'}draw()};
ctrl.appendChild(pb);ctrl.appendChild(db);ctrl.appendChild(rst);draw()
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
