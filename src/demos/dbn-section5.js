import { $, createCanvas, addHint, addControls, rand, sigmoid, TAU } from '../lib/shared.js'

export function mountDbn(containerId = 'demo-dbn') {
  const __id = containerId || 'demo-dbn';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 360);
addHint(el,'Press "Train Layer" to pretrain each RBM layer bottom-up. Watch features become progressively more abstract!');
const layers=[
{name:'Input',n:8,neurons:[],desc:'Raw pixels'},
{name:'Layer 1 (RBM-1)',n:6,neurons:[],trained:false,desc:'Edges & strokes'},
{name:'Layer 2 (RBM-2)',n:4,neurons:[],trained:false,desc:'Shapes & parts'},
{name:'Layer 3 (RBM-3)',n:3,neurons:[],trained:false,desc:'Objects & concepts'}];
let currentLayer=0,trainAnim=0;
layers.forEach(l=>{l.neurons=Array(l.n).fill(0).map(()=>rand(0,.3))});
function trainCurrentLayer(){if(currentLayer>=layers.length-1)return;
currentLayer++;let L=layers[currentLayer];L.trained=true;
let below=layers[currentLayer-1].neurons;
L.neurons=L.neurons.map((v,i)=>{let sum=below.reduce((a,b,j)=>a+b*Math.sin((i+1)*(j+1)),0)/below.length;
return sigmoid(sum*3+rand(-.2,.2))});
layers[currentLayer-1].neurons=layers[currentLayer-1].neurons.map((v,i)=>sigmoid(v*2+Math.sin(currentLayer*i)*0.3));
trainAnim=20;draw()}
function draw(){ctx.clearRect(0,0,750,360);
let lw=175,startX=20;
layers.forEach((L,li)=>{let x=startX+li*lw,y=28;
let isTraining=li===currentLayer&&trainAnim>0;
let isTrained=L.trained||li===0;
ctx.fillStyle=isTrained?'rgba(167,139,250,.06)':'rgba(20,20,35,.5)';
ctx.beginPath();ctx.roundRect(x,y,lw-15,250,10);ctx.fill();
ctx.strokeStyle=isTraining?'#ffd166':isTrained?'#a78bfa44':'#1e1e32';
ctx.lineWidth=isTraining?2:1;ctx.beginPath();ctx.roundRect(x,y,lw-15,250,10);ctx.stroke();
ctx.fillStyle=isTrained?'#a78bfa':'#4a475a';ctx.font='600 9px Fira Code';ctx.fillText(L.name,x+8,y+18);
ctx.fillStyle=isTrained?'#7d7a8c':'#333';ctx.font='400 8px Fira Code';ctx.fillText(L.desc,x+8,y+32);
L.neurons.forEach((v,ni)=>{let ny=y+50+ni*28,nr=11;
ctx.save();if(v>.5){ctx.shadowColor='#a78bfa';ctx.shadowBlur=v*14}
ctx.beginPath();ctx.arc(x+lw/2-7,ny,nr,0,TAU);
ctx.fillStyle=isTrained?`rgba(167,139,250,${Math.max(v,.05)})`:`rgba(60,60,80,${Math.max(v,.05)})`;ctx.fill();
ctx.strokeStyle=isTrained?'#a78bfa66':'#333';ctx.lineWidth=1;ctx.stroke();ctx.restore();
ctx.fillStyle=v>.5?'#e4e2df':'#4a475a';ctx.font='500 8px Fira Code';ctx.textAlign='center';
ctx.fillText(v.toFixed(2),x+lw/2-7,ny+3);ctx.textAlign='left'});
if(li<layers.length-1){ctx.fillStyle=isTrained?'#a78bfa44':'#1e1e32';ctx.font='16px sans-serif';ctx.fillText('→',x+lw-12,155)}
if(isTraining){ctx.fillStyle='#ffd166';ctx.font='600 8px Fira Code';ctx.fillText('⚡ Training RBM...',x+8,y+245)}
else if(li>0&&L.trained){ctx.fillStyle='#34d399';ctx.font='600 8px Fira Code';ctx.fillText('✓ Pretrained',x+8,y+245)}});
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,290,720,62,10);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='600 10px Fira Code';
ctx.fillText('Greedy Layer-wise Pretraining (Hinton 2006):',25,308);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
ctx.fillText('Step '+currentLayer+'/3: '+(currentLayer===0?'Start from raw input. Press "Train Layer" to pretrain Layer 1.':
currentLayer===1?'Layer 1 learned edge features. Now train Layer 2 on Layer 1\'s output.':
currentLayer===2?'Layer 2 learned shapes. Train Layer 3 (most abstract).':
'All layers pretrained! Each learns progressively more abstract features.'),25,326);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
ctx.fillText('Key: train one RBM layer at a time (bottom-up). This was the first way to successfully train deep networks!',25,345);
if(trainAnim>0){trainAnim--;requestAnimationFrame(draw)}}
layers[0].neurons=layers[0].neurons.map(()=>rand(.2,.95));
const ctrl=addControls(el);
const tb=document.createElement('button');tb.className='btn';tb.textContent='⚡ Train Next Layer';tb.onclick=trainCurrentLayer;
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{currentLayer=0;layers.forEach((l,i)=>{l.trained=false;l.neurons=Array(l.n).fill(0).map(()=>rand(0,.3))});layers[0].neurons=layers[0].neurons.map(()=>rand(.2,.95));draw()};
ctrl.appendChild(tb);ctrl.appendChild(rst);draw()
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
