import { $, createCanvas, addHint, addControls, rand, clamp, sigmoid, TAU } from '../lib/shared.js'

export function mountAlex(containerId = 'demo-alex') {
  const __id = containerId || 'demo-alex';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Click "Feed Image" to watch a photo flow through the layers. See spatial size shrink and feature channels multiply!');
// Simulated 8x8 "image" input with recognizable pattern (a simple face-like pattern)
const inputImg=[];
for(let r=0;r<8;r++) for(let ci=0;ci<8;ci++){
  let v=0;
  // Eyes
  if((r===2||r===3)&&(ci===1||ci===2))v=0.9;
  if((r===2||r===3)&&(ci===5||ci===6))v=0.9;
  // Nose
  if((r===4)&&(ci===3||ci===4))v=0.6;
  // Mouth
  if(r===6&&ci>=2&&ci<=5)v=0.8;
  if(r===5&&(ci===2||ci===5))v=0.5;
  // Background
  if(v===0)v=rand(0.05,0.2);
  inputImg.push(v);
}
// Simulated feature maps for each layer (generated from input)
function makeFeatureMaps(input,nMaps,size,layerIdx){
  const maps=[];
  for(let m=0;m<nMaps;m++){
    const fm=[];
    for(let r=0;r<size;r++) for(let ci=0;ci<size;ci++){
      let v=0;
      // Each filter detects different things
      if(layerIdx===0){// Conv1: edge detectors
        let ir=Math.floor(r/size*8),ic=Math.floor(ci/size*8);
        if(m%3===0) v=Math.abs((input[ir*8+Math.min(ic+1,7)]||0)-(input[ir*8+ic]||0))*3;// horizontal edge
        else if(m%3===1) v=Math.abs((input[Math.min(ir+1,7)*8+ic]||0)-(input[ir*8+ic]||0))*3;// vertical edge
        else v=(input[ir*8+ic]||0)*Math.sin(m*0.5+r*ci)*0.5+0.5;
      } else {
        v=Math.sin((m+1)*(r+1)*0.4)*0.3+Math.cos((m+1)*(ci+1)*0.5)*0.3+0.4;
        v+=rand(-0.1,0.1);
      }
      fm.push(clamp(v,0,1));
    }
    maps.push(fm);
  }
  return maps;
}
const layers=[
  {name:'Input',size:8,maps:1,c:'#38bdf8',desc:'8\u00d78 grayscale image'},
  {name:'Conv1+ReLU',size:6,maps:4,c:'#ff6b6b',desc:'Edge detection (4 filters)'},
  {name:'MaxPool',size:3,maps:4,c:'#ffd166',desc:'Shrink 2\u00d7, keep strongest'},
  {name:'Conv2+ReLU',size:3,maps:6,c:'#4ecdc4',desc:'Texture patterns (6 filters)'},
  {name:'Flatten+FC',size:1,maps:8,c:'#a78bfa',desc:'8 neurons, fully connected'},
  {name:'Output',size:1,maps:3,c:'#34d399',desc:'3 classes: face/cat/car'}
];
const fmaps=[];
fmaps.push([inputImg]);
fmaps.push(makeFeatureMaps(inputImg,4,6,0));
// MaxPool: take every other pixel
let pooled=fmaps[1].map(fm=>{let p=[];for(let r=0;r<3;r++)for(let ci=0;ci<3;ci++){
  let vals=[fm[r*2*6+ci*2],fm[r*2*6+ci*2+1],fm[(r*2+1)*6+ci*2],fm[(r*2+1)*6+ci*2+1]];
  p.push(Math.max(...vals));}return p;});
fmaps.push(pooled);
fmaps.push(makeFeatureMaps(inputImg,6,3,1));
// FC: single values
fmaps.push(Array.from({length:8},(_,i)=>[sigmoid(Math.sin(i*1.5)*2)]));
// Output: probabilities
fmaps.push([[0.82],[0.12],[0.06]]);
const outLabels=['Face','Cat','Car'];

let activeLayer=-1,animT=0,animId=null;
function startFeed(){activeLayer=-1;animT=0;if(animId)cancelAnimationFrame(animId);
  (function tick(){animT+=0.012;activeLayer=Math.floor(animT*layers.length/1.0);
    if(activeLayer>=layers.length)activeLayer=layers.length-1;
    draw();if(animT<1.2)animId=requestAnimationFrame(tick);else animId=null;})();}

function draw(){ctx.clearRect(0,0,750,340);
  const colW=120,startX=10;
  layers.forEach((L,li)=>{
    const x=startX+li*colW,y=10;
    const isActive=li<=activeLayer;
    const isHighlight=li===activeLayer;
    // Column header
    ctx.fillStyle=isActive?L.c:'#4a475a';ctx.font=(isHighlight?'700':'500')+' 9px Fira Code';
    ctx.textAlign='center';ctx.fillText(L.name,x+colW/2,y+10);
    ctx.textAlign='left';
    // Feature maps grid
    const maps=fmaps[li];
    const nMaps=maps.length;
    const cols=li===0?1:Math.min(nMaps,Math.ceil(Math.sqrt(nMaps)));
    const rows=Math.ceil(nMaps/cols);
    const mapSize=L.size;
    const maxCellArea=(colW-12)*(190)/Math.max(nMaps,1);
    const cellPx=Math.min(Math.floor(Math.sqrt(maxCellArea)/mapSize),li===0?16:li<=2?14:li<=3?16:22);
    const totalMapW=cols*(mapSize*cellPx+4);
    const mStartX=x+(colW-totalMapW)/2;
    maps.forEach((fm,mi)=>{
      const mr=Math.floor(mi/cols),mc=mi%cols;
      const mx=mStartX+mc*(mapSize*cellPx+4);
      const my=y+18+mr*(mapSize*cellPx+4);
      // Background
      ctx.fillStyle='#08081a';ctx.fillRect(mx-1,my-1,mapSize*cellPx+2,mapSize*cellPx+2);
      if(isActive){
        for(let r=0;r<mapSize;r++) for(let ci=0;ci<mapSize;ci++){
          let v=fm[r*mapSize+ci];
          if(li===layers.length-1){// Output: color by class
            const colors=['#34d399','#ffd166','#ff6b6b'];
            ctx.fillStyle=colors[mi]+(Math.round(clamp(v,0.05,1)*230).toString(16).padStart(2,'0'));
          } else {
            ctx.fillStyle=L.c+(Math.round(clamp(v,0.05,1)*220).toString(16).padStart(2,'0'));
          }
          ctx.fillRect(mx+ci*cellPx,my+r*cellPx,cellPx-1,cellPx-1);
        }
      } else {
        ctx.fillStyle='#111125';ctx.fillRect(mx,my,mapSize*cellPx,mapSize*cellPx);
      }
    });
    // Output labels
    if(li===layers.length-1&&isActive){
      maps.forEach((fm,mi)=>{
        const mr=Math.floor(mi/cols),mc=mi%cols;
        const mx=mStartX+mc*(mapSize*cellPx+4);
        const my=y+18+mr*(mapSize*cellPx+4);
        ctx.fillStyle='#e4e2df';ctx.font='600 8px Fira Code';
        ctx.fillText(outLabels[mi]+': '+(fm[0]*100).toFixed(0)+'%',mx+cellPx+4,my+cellPx/2+3);
      });
    }
    // Description
    ctx.fillStyle=isActive?'#7d7a8c':'#333';ctx.font='400 7px Fira Code';ctx.textAlign='center';
    const descY=y+18+rows*(maps[0].length>1?L.size*(cellPx)+4:L.size*cellPx+4)+6;
    ctx.fillText(L.desc,x+colW/2,Math.min(descY,220));
    // Size annotation
    if(isActive&&li<layers.length-1){
      ctx.fillStyle=L.c;ctx.font='500 7px Fira Code';
      ctx.fillText(L.size+'\u00d7'+L.size+'\u00d7'+nMaps,x+colW/2,Math.min(descY+12,232));}
    ctx.textAlign='left';
    // Arrow between layers
    if(li<layers.length-1){
      ctx.fillStyle=isActive?'#4a475a':'#222';ctx.font='14px sans-serif';
      ctx.fillText('\u2192',x+colW-8,y+100);
      // Animated dot
      if(isHighlight&&animT>0){
        ctx.save();ctx.shadowColor=L.c;ctx.shadowBlur=8;
        let dotPhase=(animT*layers.length-li)%1;
        ctx.beginPath();ctx.arc(x+colW-8+12*dotPhase,y+99,3,0,TAU);ctx.fillStyle=L.c;ctx.fill();ctx.restore();
      }
    }
  });
  // Operation labels between columns
  const ops=['\u2b1b Conv\n3\u00d73 filters','MaxPool\n2\u00d72 stride','Conv\n3\u00d73','Flatten\n+ FC','Softmax'];
  ops.forEach((op,i)=>{
    const x=startX+(i+1)*colW-8;
    ctx.fillStyle=(i<activeLayer)?'#7d7a8c':'#333';ctx.font='400 6px Fira Code';ctx.textAlign='center';
    op.split('\n').forEach((line,li)=>ctx.fillText(line,x,244+li*10));
    ctx.textAlign='left';
  });
  // Bottom explanation
  ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,270,720,62,8);ctx.fill();
  ctx.fillStyle='#ff6b6b';ctx.font='600 10px Fira Code';
  ctx.fillText('AlexNet (2012): Won ImageNet with 15.3% top-5 error (prev best: 26%)',25,288);
  ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
  ctx.fillText('Each conv layer applies filters to detect features. Spatial size shrinks (8\u21926\u21923\u21921) while channels grow (1\u21924\u21926\u21928).',25,304);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
  ctx.fillText('Key: ReLU activation (fast), Dropout (regularize), GPU training (speed), MaxPool (compress spatial info, keep strongest signals)',25,320);
}
const ctrl=addControls(el);
const fb=document.createElement('button');fb.className='btn';fb.textContent='\u25b6 Feed Image';fb.onclick=startFeed;
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';
rst.onclick=()=>{activeLayer=-1;if(animId){cancelAnimationFrame(animId);animId=null;}draw();};
ctrl.appendChild(fb);ctrl.appendChild(rst);draw()
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
