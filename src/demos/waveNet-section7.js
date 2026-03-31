import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

export function mountWave(containerId = 'demo-wave') {
  const __id = containerId || 'demo-wave';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Watch dilated convolutions capture increasingly long-range patterns. Each layer doubles the receptive field!');
let samples=[];for(let i=0;i<64;i++)samples.push(Math.sin(i/64*TAU*3)*.5+Math.sin(i/64*TAU*7)*.3+rand(-.1,.1));
let generating=false,genPos=0;
function draw(){ctx.clearRect(0,0,750,300);
let wx=30,wy=28,ww=690,wh=55;
ctx.fillStyle='rgba(6,6,12,.8)';ctx.beginPath();ctx.roundRect(wx,wy,ww,wh,6);ctx.fill();
ctx.strokeStyle='#fb923c';ctx.lineWidth=1.5;ctx.beginPath();
samples.forEach((s,i)=>{let x=wx+i/63*ww,y=wy+wh/2-s*wh/2;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
if(generating&&genPos<64){ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=8;ctx.fillStyle='#ffd166';ctx.beginPath();ctx.arc(wx+genPos/63*ww,wy+wh/2-samples[genPos]*wh/2,5,0,TAU);ctx.fill();ctx.restore()}
ctx.fillStyle='#fb923c';ctx.font='600 9px Fira Code';ctx.fillText('Audio Waveform (64 samples)',wx,wy-5);
let layers=[{d:1,name:'Layer 1 (d=1)'},{d:2,name:'Layer 2 (d=2)'},{d:4,name:'Layer 3 (d=4)'},{d:8,name:'Layer 4 (d=8)'}];
let ly=100,lh=35,nW=9;
layers.forEach((L,li)=>{let y=ly+li*(lh+8);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText(L.name,5,y+20);
for(let i=0;i<32;i++){let x=100+i*19;
ctx.fillStyle='#fb923c'+(li===0?'33':li===1?'44':li===2?'66':'88');ctx.fillRect(x,y,nW,lh-2);
if(li>0&&i-L.d>=0){ctx.strokeStyle='#fb923c33';ctx.lineWidth=1;ctx.beginPath();
ctx.moveTo(x+nW/2,y+lh-2);ctx.lineTo(100+i*19+nW/2,y-8);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+nW/2,y+lh-2);ctx.lineTo(100+(i-L.d)*19+nW/2,y-8);ctx.stroke()}}
let rf=Math.pow(2,li+1)-1;ctx.fillStyle='#ffd166';ctx.font='500 7px Fira Code';ctx.fillText('RF='+rf,690,y+20)});
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,258,720,35,8);ctx.fill();
ctx.fillStyle='#fb923c';ctx.font='600 9px Fira Code';ctx.fillText('Dilated Causal Convolution: dilation doubles → exponentially growing receptive field!',25,276);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('"Causal" = only sees PAST samples. Generates one sample at a time, like GPT generates one token at a time.',25,290)}
const ctrl=addControls(el);let tmr=null;
const gb=document.createElement('button');gb.className='btn';gb.textContent='🎙 Generate';
gb.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;gb.classList.remove('active');generating=false}
else{generating=true;genPos=0;gb.classList.add('active');
tmr=setInterval(()=>{if(genPos<63){genPos++;samples[genPos]=Math.sin(genPos/64*TAU*3)*.5+Math.sin(genPos/64*TAU*7)*.3+rand(-.15,.15);draw()}
else{clearInterval(tmr);tmr=null;gb.classList.remove('active');generating=false}},50)}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{samples=[];for(let i=0;i<64;i++)samples.push(Math.sin(i/64*TAU*3)*.5+Math.sin(i/64*TAU*7)*.3+rand(-.1,.1));generating=false;genPos=0;if(tmr){clearInterval(tmr);tmr=null;gb.classList.remove('active')}draw()};
ctrl.appendChild(gb);ctrl.appendChild(rst);draw()
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
