import { $, createCanvas, addHint, addControls, clamp } from '../lib/shared.js'

export function mountSae(containerId = 'demo-sae') {
  const __id = containerId || 'demo-sae';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 342);
addHint(el,'Pick a shape, then drag the Sparsity slider. Watch neurons turn OFF and features vanish from the reconstruction!');

const G=6, NH=8, NN=G*G;
// Each hidden neuron is a spatial feature detector for a specific region of the 6x6 grid.
// This means reconstruction ACTUALLY WORKS and sparsity visibly removes features.
const featureNames=['Top row','Bottom row','Left col','Right col','Center +','Diag \\\\','Mid row','Mid col'];
const featureMasks=[ // each is a 36-element weight mask
  [1,1,1,1,1,1, .2,0,0,0,0,.2, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0],  // top row
  [0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, 0,0,0,0,0,0, .2,0,0,0,0,.2, 1,1,1,1,1,1],  // bottom row
  [1,.2,0,0,0,0, 1,.2,0,0,0,0, 1,.2,0,0,0,0, 1,.2,0,0,0,0, 1,.2,0,0,0,0, 1,.2,0,0,0,0],  // left col
  [0,0,0,0,.2,1, 0,0,0,0,.2,1, 0,0,0,0,.2,1, 0,0,0,0,.2,1, 0,0,0,0,.2,1, 0,0,0,0,.2,1],  // right col
  [0,0,.3,0,0,0, 0,0,.3,0,0,0, .3,.3,1,.3,.3,0, 0,0,.3,0,0,0, 0,0,.3,0,0,0, 0,0,.3,0,0,0], // center cross
  [1,0,0,0,0,0, 0,1,0,0,0,0, 0,0,1,0,0,0, 0,0,0,1,0,0, 0,0,0,0,1,0, 0,0,0,0,0,1],      // main diagonal
  [0,0,0,0,0,0, 0,0,0,0,0,0, .3,.3,.3,.3,.3,0, .3,.3,.3,.3,.3,0, 0,0,0,0,0,0, 0,0,0,0,0,0], // mid rows
  [0,0,.3,0,0,0, 0,0,.3,0,0,0, 0,0,.5,0,0,0, 0,0,.5,0,0,0, 0,0,.3,0,0,0, 0,0,.3,0,0,0]  // mid col
];
const featureColors=['#ff6b6b','#38bdf8','#ffd166','#4ecdc4','#a78bfa','#f472b6','#34d399','#fb923c'];

const patterns=[
  {name:'X',grid:[1,0,0,0,1,0, 0,1,0,1,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,1,0,1,0,0, 1,0,0,0,1,0]},
  {name:'O',grid:[0,1,1,1,0,0, 1,0,0,0,1,0, 1,0,0,0,1,0, 1,0,0,0,1,0, 1,0,0,0,1,0, 0,1,1,1,0,0]},
  {name:'T',grid:[1,1,1,1,1,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0]},
  {name:'L',grid:[1,0,0,0,0,0, 1,0,0,0,0,0, 1,0,0,0,0,0, 1,0,0,0,0,0, 1,0,0,0,0,0, 1,1,1,1,1,0]},
  {name:'H',grid:[1,0,0,0,1,0, 1,0,0,0,1,0, 1,1,1,1,1,0, 1,0,0,0,1,0, 1,0,0,0,1,0, 1,0,0,0,1,0]},
  {name:'/',grid:[0,0,0,0,0,1, 0,0,0,0,1,0, 0,0,0,1,0,0, 0,0,1,0,0,0, 0,1,0,0,0,0, 1,0,0,0,0,0]}
];
let selected=0, sparsity=0.0;

// Encode: dot product with each feature mask
function encode(input){
  const h=new Float32Array(NH);
  for(let j=0;j<NH;j++){let s=0;for(let i=0;i<NN;i++) s+=input[i]*featureMasks[j][i];
    h[j]=s/featureMasks[j].reduce((a,v)=>a+v,0.01);} // normalize by mask energy
  return h;
}
// Sparsity: keep top-k by activation
function applySparse(h){
  const k=Math.max(1,Math.round(NH*(1-sparsity)));
  const idx=[...h].map((v,i)=>({v,i})).sort((a,b)=>b.v-a.v);
  const out=new Float32Array(NH),act=new Set();
  for(let i=0;i<k;i++){out[idx[i].i]=h[idx[i].i];act.add(idx[i].i);}
  return{sparse:out,act};
}
// Decode: weighted sum of feature masks
function decode(sp){
  const out=new Float32Array(NN);
  for(let j=0;j<NH;j++){if(sp[j]<0.01)continue;
    for(let i=0;i<NN;i++) out[i]+=sp[j]*featureMasks[j][i];}
  // Normalize to 0-1
  let mx=0;for(let i=0;i<NN;i++) if(out[i]>mx) mx=out[i];
  if(mx>0.01) for(let i=0;i<NN;i++) out[i]/=mx;
  return out;
}

function drawGrid(ox,oy,sz,data,color,binary){
  ctx.fillStyle='#08081a';ctx.beginPath();ctx.roundRect(ox-2,oy-2,G*sz+4,G*sz+4,4);ctx.fill();
  for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){
    const v=data[r*G+ci];
    if(binary) ctx.fillStyle=v>0.4?color:'#111125';
    else ctx.fillStyle=color.slice(0,7)+(Math.round(clamp(v,0.04,1)*230).toString(16).padStart(2,'0'));
    ctx.fillRect(ox+ci*sz,oy+r*sz,sz-1,sz-1);
  }
}

function draw(){
  ctx.clearRect(0,0,750,342);
  const p=patterns[selected];
  const rawH=encode(p.grid),{sparse,act}=applySparse(rawH),decoded=decode(sparse);
  const activeCount=act.size;

  // === TOP: Pattern selector buttons ===
  patterns.forEach((pp,i)=>{
    const bw=80,bh=56,cols=6,x=14+i*(bw+6),y=4;
    ctx.fillStyle=i===selected?'rgba(167,139,250,.12)':'#0c0c16';
    ctx.beginPath();ctx.roundRect(x,y,bw,bh,6);ctx.fill();
    ctx.strokeStyle=i===selected?'#a78bfa':'#1e1e32';ctx.lineWidth=i===selected?2:1;
    ctx.beginPath();ctx.roundRect(x,y,bw,bh,6);ctx.stroke();
    // Mini preview grid
    const ms=6;
    for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){
      ctx.fillStyle=pp.grid[r*G+ci]>0.4?(i===selected?'#a78bfa':'#4a475a'):'transparent';
      ctx.fillRect(x+12+ci*ms,y+4+r*ms,ms-1,ms-1);
    }
    ctx.fillStyle=i===selected?'#e4e2df':'#4a475a';ctx.font='600 10px Fira Code';
    ctx.textAlign='center';ctx.fillText('"'+pp.name+'"',x+bw/2,y+bh-6);ctx.textAlign='left';
  });

  // === MAIN FLOW: Input → Bottleneck → Output (row at y=70) ===
  const flowY=70, cellSz=20;

  // --- INPUT ---
  const inX=16;
  ctx.fillStyle='#38bdf8';ctx.font='700 11px Fira Code';ctx.fillText('Input (6\u00d76)',inX,flowY+10);
  drawGrid(inX,flowY+16,cellSz,p.grid,'#38bdf8',true);

  // --- ARROW 1 ---
  ctx.fillStyle='#4a475a';ctx.font='bold 20px sans-serif';ctx.fillText('\u2192',inX+G*cellSz+8,flowY+G*cellSz/2+20);
  ctx.fillStyle='#7d7a8c';ctx.font='500 9px Fira Code';ctx.fillText('Encode',inX+G*cellSz+4,flowY+10);

  // --- BOTTLENECK (centered, with feature mini-grids) ---
  const bnX=185, bnW=350, neuronW=bnW/NH-2;
  ctx.fillStyle='#a78bfa';ctx.font='700 11px Fira Code';
  ctx.fillText('Sparse Bottleneck  ('+activeCount+'/'+NH+' active)',bnX,flowY+10);

  for(let j=0;j<NH;j++){
    const nx=bnX+j*(neuronW+2), ny=flowY+16;
    const isAct=act.has(j), val=sparse[j], rawVal=rawH[j];
    const col=featureColors[j];

    // Neuron card
    ctx.fillStyle=isAct?'rgba(20,20,40,.95)':'rgba(12,12,20,.95)';
    ctx.beginPath();ctx.roundRect(nx,ny,neuronW,G*cellSz+38,5);ctx.fill();
    ctx.strokeStyle=isAct?col+'88':'#222';ctx.lineWidth=isAct?1.5:0.5;
    ctx.beginPath();ctx.roundRect(nx,ny,neuronW,G*cellSz+38,5);ctx.stroke();

    // Feature detector mini-grid (what this neuron looks for)
    const ms=Math.floor((neuronW-4)/G);
    for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){
      const w=featureMasks[j][r*G+ci];
      if(w>0.05){
        const a=isAct?clamp(w,0.2,1):clamp(w*0.2,0.05,0.3);
        ctx.fillStyle=col+(Math.round(a*220).toString(16).padStart(2,'0'));
      } else ctx.fillStyle='#0a0a18';
      ctx.fillRect(nx+2+ci*ms,ny+2+r*ms,ms-1,ms-1);
    }

    // Activation bar
    const barY=ny+G*ms+5, barH=8;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(nx+2,barY,neuronW-4,barH,2);ctx.fill();
    if(isAct){
      ctx.fillStyle=col+'aa';ctx.beginPath();ctx.roundRect(nx+2,barY,Math.max((neuronW-4)*val,3),barH,2);ctx.fill();
    }

    // Label
    ctx.fillStyle=isAct?'#e4e2df':'#444';ctx.font=(isAct?'600':'400')+' 7px Fira Code';
    ctx.textAlign='center';ctx.fillText(isAct?featureNames[j]:'OFF',nx+neuronW/2,barY+barH+10);
    // Active/suppressed marker
    if(!isAct){
      ctx.strokeStyle='#ff6b6b66';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(nx+4,ny+4);ctx.lineTo(nx+neuronW-4,ny+G*ms-2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(nx+neuronW-4,ny+4);ctx.lineTo(nx+4,ny+G*ms-2);ctx.stroke();
    }
    ctx.textAlign='left';
  }

  // --- ARROW 2 ---
  const arrX2=bnX+bnW+6;
  ctx.fillStyle='#4a475a';ctx.font='bold 20px sans-serif';ctx.fillText('\u2192',arrX2,flowY+G*cellSz/2+20);
  ctx.fillStyle='#7d7a8c';ctx.font='500 9px Fira Code';ctx.fillText('Decode',arrX2-2,flowY+10);

  // --- OUTPUT ---
  const outX=arrX2+28;
  ctx.fillStyle='#4ecdc4';ctx.font='700 11px Fira Code';ctx.fillText('Reconstr.',outX,flowY+10);
  drawGrid(outX,flowY+16,cellSz,decoded,'#4ecdc4',false);

  // --- ERROR OVERLAY under output ---
  let totalErr=0;
  for(let i=0;i<NN;i++) totalErr+=(p.grid[i]-decoded[i])*(p.grid[i]-decoded[i]);
  const mse=totalErr/NN;
  const quality=clamp(1-mse*3,0,1);

  // Quality badge next to output grid
  const qY=flowY+16+G*cellSz+6;
  ctx.fillStyle='#7d7a8c';ctx.font='500 9px Fira Code';ctx.fillText('Quality',outX,qY+10);
  ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(outX+46,qY+2,G*cellSz-46,12,3);ctx.fill();
  const qg=ctx.createLinearGradient(outX+46,0,outX+G*cellSz,0);
  qg.addColorStop(0,'#ff6b6b');qg.addColorStop(.5,'#ffd166');qg.addColorStop(1,'#34d399');
  ctx.fillStyle=qg;ctx.beginPath();ctx.roundRect(outX+46,qY+2,(G*cellSz-46)*quality,12,3);ctx.fill();
  ctx.fillStyle='#e4e2df';ctx.font='bold 8px Fira Code';
  ctx.fillText((quality*100).toFixed(0)+'%',outX+G*cellSz+4,qY+12);

  // === BOTTOM: Explanation ===
  const exY=flowY+G*cellSz+48;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(12,exY,726,100,8);ctx.fill();

  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';
  ctx.fillText('How It Works:',22,exY+16);
  ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
  ctx.fillText('Each bottleneck neuron is a "feature detector" \u2014 it looks for a specific pattern (shown in its mini-grid above).',22,exY+32);
  ctx.fillText('The encoder measures how much each feature is present in the input. The decoder rebuilds using only active features.',22,exY+48);
  ctx.fillStyle='#a78bfa';ctx.font='600 9px Fira Code';
  ctx.fillText('Sparsity constraint forces most neurons OFF \u2192 only the most important features survive!',22,exY+64);
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
  ctx.fillText('Try it: slide Sparsity right \u2192 watch features disappear one by one \u2192 reconstruction degrades gracefully.',22,exY+80);
  ctx.fillText('Active: '+activeCount+'/'+NH+' | MSE: '+mse.toFixed(4)+' | Compression: 36 pixels \u2192 '+activeCount+' features ('+(activeCount/NN*100).toFixed(0)+'%)',22,exY+96);
}

c.onclick=e=>{const r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*342/r.height;
  patterns.forEach((pp,i)=>{const bw=80,x=14+i*(bw+6),y=4;if(mx>=x&&mx<=x+bw&&my>=y&&my<=y+56){selected=i;draw();}});};
const ctrl=addControls(el);
const slbl=document.createElement('label');slbl.textContent='Sparsity';slbl.style.cssText='color:#a78bfa;font:600 10px Fira Code;margin-right:4px';
const slider=document.createElement('input');slider.type='range';slider.min='0';slider.max='88';slider.value='0';slider.style.cssText='width:120px;vertical-align:middle';
const sval=document.createElement('span');sval.className='btn';sval.style.cssText='min-width:70px;text-align:center;font-size:10px';
sval.textContent=NH+'/'+NH+' active';
slider.oninput=e=>{sparsity=e.target.value/100;const k=Math.max(1,Math.round(NH*(1-sparsity)));sval.textContent=k+'/'+NH+' active';draw();};
ctrl.appendChild(slbl);ctrl.appendChild(slider);ctrl.appendChild(sval);
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';
rst.onclick=()=>{selected=0;sparsity=0;slider.value='0';sval.textContent=NH+'/'+NH+' active';draw();};ctrl.appendChild(rst);
draw();
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
