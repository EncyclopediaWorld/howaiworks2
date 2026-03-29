import { $, createCanvas, addHint, addControls, rand, clamp } from '../lib/shared.js'

// ===== GPT-3 =====
export function mountGpt3(containerId = 'demo-gpt3') {
  const __id = containerId || 'demo-gpt3';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Switch between zero-shot, one-shot, and few-shot. More examples = better performance!');
const modes=[
{name:'Zero-shot',examples:[],query:'Sentiment of "This movie was terrible": ',answer:'Negative',conf:.62,
desc:'No examples. Model must figure out the task from description alone.'},
{name:'One-shot',examples:[{in:'"I love this!" →',out:'Positive'}],query:'"This movie was terrible": ',answer:'Negative',conf:.84,
desc:'One example teaches format. Model learns the pattern from a single demo.'},
{name:'Few-shot',examples:[{in:'"I love this!" →',out:'Positive'},{in:'"Awful experience" →',out:'Negative'},{in:'"Pretty good" →',out:'Positive'}],
query:'"This movie was terrible": ',answer:'Negative',conf:.95,desc:'Multiple examples = clear pattern. Best with diverse demonstrations.'}];
let sel=2;
function draw(){ctx.clearRect(0,0,750,320);let m=modes[sel];
modes.forEach((mo,i)=>{let x=15+i*245,y=8;
ctx.fillStyle=i===sel?'rgba(52,211,153,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,235,28,5);ctx.fill();
ctx.strokeStyle=i===sel?'#34d399':'#1e1e32';ctx.lineWidth=i===sel?2:1;ctx.beginPath();ctx.roundRect(x,y,235,28,5);ctx.stroke();
ctx.fillStyle=i===sel?'#e4e2df':'#4a475a';ctx.font='600 10px Fira Code';ctx.fillText(mo.name+' ('+mo.examples.length+' ex)',x+8,y+18)});
let py=48;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,py,480,180,10);ctx.fill();
ctx.fillStyle='#34d399';ctx.font='700 11px Fira Code';ctx.fillText('Prompt sent to GPT-3:',25,py+18);
let ly=py+38;ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('Classify the sentiment:',25,ly);ly+=18;
m.examples.forEach(ex=>{ctx.fillStyle='rgba(56,189,248,.08)';ctx.beginPath();ctx.roundRect(25,ly-10,440,20,4);ctx.fill();
ctx.fillStyle='#38bdf8';ctx.font='400 9px Fira Code';ctx.fillText(ex.in,30,ly);
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText(' '+ex.out,30+ctx.measureText(ex.in).width,ly);ly+=24});
ctx.fillStyle='rgba(255,209,102,.1)';ctx.beginPath();ctx.roundRect(25,ly-10,440,20,4);ctx.fill();
ctx.fillStyle='#e4e2df';ctx.font='500 9px Fira Code';ctx.fillText(m.query,30,ly);
ctx.fillStyle='#34d399';ctx.font='700 10px Fira Code';ctx.fillText(m.answer+' ✓',30+ctx.measureText(m.query).width,ly);
let rx=510,ry=py;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(rx,ry,225,180,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='700 12px Fira Code';ctx.fillText('Confidence',rx+10,ry+22);
ctx.fillStyle=m.conf>.8?'#34d399':m.conf>.7?'#ffd166':'#ff6b6b';ctx.font='900 36px Fraunces';ctx.fillText((m.conf*100).toFixed(0)+'%',rx+10,ry+65);
ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(rx+10,ry+78,200,16,4);ctx.fill();
ctx.fillStyle=m.conf>.8?'#34d39988':m.conf>.7?'#ffd16688':'#ff6b6b88';ctx.beginPath();ctx.roundRect(rx+10,ry+78,200*m.conf,16,4);ctx.fill();
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText(m.desc.substring(0,38),rx+10,ry+115);ctx.fillText(m.desc.substring(38),rx+10,ry+130);
ctx.fillStyle='#fb923c';ctx.font='600 9px Fira Code';ctx.fillText('Scale:',rx+10,ry+152);
[{n:'GPT-2',p:'1.5B',b:.01},{n:'GPT-3',p:'175B',b:1}].forEach((mm,i)=>{
ctx.fillStyle='#111120';ctx.fillRect(rx+10,ry+157+i*12,150,10);ctx.fillStyle=i?'#34d399':'#fb923c';ctx.fillRect(rx+10,ry+157+i*12,150*mm.b,10);
ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText(mm.n+' '+mm.p,rx+165,ry+165+i*12)});
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,240,720,72,10);ctx.fill();
ctx.fillStyle='#34d399';ctx.font='700 11px Fira Code';ctx.fillText('In-Context Learning — GPT-3\'s key discovery:',25,258);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
ctx.fillText('No weight updates! The model "learns" purely from examples in the prompt.',25,278);
ctx.fillText('One model can do ANY task — translation, coding, math — just by changing the prompt.',25,295);
ctx.fillStyle='#7d7a8c';ctx.fillText('This paradigm shift led directly to ChatGPT and all modern AI assistants.',25,310)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*320/r.height;
modes.forEach((m,i)=>{let x=15+i*245;if(mx>=x&&mx<=x+235&&my>=8&&my<=36){sel=i;draw()}})};
const ctrl=addControls(el);draw()
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

// ===== ViT =====
export function mountVit(containerId = 'demo-vit') {
  const __id = containerId || 'demo-vit';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Click any patch to see which other patches it attends to. Watch the image become tokens!');
// Create a simple "cat face" image in a 4x4 patch grid (each patch = visual block)
const G=4,patches=[];
const pColors=[ // 4x4 patches with distinctive colors for a face-like pattern
  0.2,0.3,0.3,0.2, // top row: background
  0.3,0.8,0.8,0.3, // eyes row
  0.3,0.5,0.5,0.3, // nose row
  0.2,0.7,0.7,0.2  // mouth row
];
for(let r=0;r<G;r++) for(let cc=0;cc<G;cc++) patches.push({r,c:cc,v:pColors[r*G+cc]});
let selP=5; // default: left eye
function getAttn(from){let w=patches.map((g,i)=>{
  let dr=Math.abs(g.r-patches[from].r),dc=Math.abs(g.c-patches[from].c);
  let sim=patches[from].v*g.v*2; // similar intensity = higher attention
  return Math.exp(-((dr+dc)*0.4-sim*0.5)+rand(-0.2,0.2));});
  let s=w.reduce((a,b)=>a+b);return w.map(v=>v/s);}
function draw(){ctx.clearRect(0,0,750,340);
  const ps=42,ox=15,oy=30;
  // Step 1: Image with patches
  ctx.fillStyle='#38bdf8';ctx.font='700 10px Fira Code';ctx.fillText('1. Image \u2192 16\u00d716 patches',ox,oy-8);
  let attn=getAttn(selP);
  patches.forEach((g,i)=>{let x=ox+g.c*ps,y=oy+g.r*ps;let isSel=i===selP;let a=attn[i];
    // Patch fill based on "image content"
    ctx.fillStyle='rgba(56,189,248,'+(g.v*0.8).toFixed(2)+')';ctx.fillRect(x,y,ps-2,ps-2);
    // Attention highlight
    if(isSel){ctx.strokeStyle='#ffd166';ctx.lineWidth=3;ctx.strokeRect(x,y,ps-2,ps-2);}
    else{ctx.strokeStyle='rgba(255,209,102,'+(a*1.2).toFixed(2)+')';ctx.lineWidth=1+a*4;ctx.strokeRect(x,y,ps-2,ps-2);}
    ctx.fillStyle='#fff';ctx.font='bold 8px Fira Code';ctx.textAlign='center';ctx.fillText('P'+i,x+ps/2-1,y+ps/2+2);
    if(!isSel&&a>0.07){ctx.fillStyle='#ffd166';ctx.font='500 7px Fira Code';ctx.fillText((a*100|0)+'%',x+ps/2-1,y+ps-4);}
    ctx.textAlign='left';});
  // Arrow
  ctx.fillStyle='#4a475a';ctx.font='20px sans-serif';ctx.fillText('\u2192',ox+G*ps+5,oy+G*ps/2);
  // Step 2: Flatten + position embed
  const tx=200,ty=18;
  ctx.fillStyle='#a78bfa';ctx.font='700 10px Fira Code';ctx.fillText('2. Flatten + Position Embed:',tx,ty);
  // [CLS] token
  ctx.fillStyle='rgba(255,209,102,.2)';ctx.beginPath();ctx.roundRect(tx,ty+8,36,24,4);ctx.fill();
  ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(tx,ty+8,36,24,4);ctx.stroke();
  ctx.fillStyle='#ffd166';ctx.font='600 8px Fira Code';ctx.fillText('[CLS]',tx+3,ty+24);
  // Patch tokens
  for(let i=0;i<16;i++){let x=tx+40+i*28,y=ty+8;
    ctx.fillStyle=i===selP?'rgba(56,189,248,.25)':'rgba(56,189,248,.06)';ctx.fillRect(x,y,26,24);
    ctx.strokeStyle=i===selP?'#38bdf8':'#38bdf833';ctx.lineWidth=1;ctx.strokeRect(x,y,26,24);
    ctx.fillStyle=i===selP?'#e4e2df':'#555';ctx.font='400 6px Fira Code';ctx.textAlign='center';ctx.fillText('P'+i,x+13,ty+23);ctx.textAlign='left';}
  ctx.fillStyle='#a78bfa';ctx.font='400 7px Fira Code';ctx.fillText('+pos1 +pos2 ... +pos16',tx+40,ty+42);
  // Step 3: Self-attention heatmap
  const mx2=200,my2=62,ms=15;
  ctx.fillStyle='#fb923c';ctx.font='700 10px Fira Code';ctx.fillText('3. Self-Attention (Transformer Encoder):',mx2,my2);
  // Compact heatmap
  for(let i=0;i<16;i++){for(let j=0;j<16;j++){
    let a2=getAttn(i)[j];
    ctx.fillStyle='rgba(251,146,60,'+(a2*1.8).toFixed(2)+')';ctx.fillRect(mx2+j*ms,my2+6+i*ms,ms-1,ms-1);}
    // Row highlight
    if(i===selP){ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;ctx.strokeRect(mx2,my2+6+i*ms,16*ms,ms);}}
  // Column labels
  ctx.fillStyle='#7d7a8c';ctx.font='400 5px Fira Code';
  for(let j=0;j<16;j++){ctx.textAlign='center';ctx.fillText('P'+j,mx2+j*ms+ms/2,my2+4);ctx.textAlign='left';}
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('Row=query, Col=key',mx2,my2+16*ms+18);
  ctx.fillText('P'+selP+' attends to: '+attn.map((a,i)=>a>0.1?'P'+i+'('+Math.round(a*100)+'%)':'').filter(Boolean).join(' '),mx2,my2+16*ms+30);
  // Step 4: Classification
  const cx2=510,cy2=62;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(cx2,cy2,228,196,10);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 10px Fira Code';ctx.fillText('4. [CLS] \u2192 Classification:',cx2+10,cy2+18);
  [{n:'Cat',p:.52,c:'#34d399'},{n:'Dog',p:.22,c:'#38bdf8'},{n:'Bird',p:.14,c:'#ffd166'},{n:'Car',p:.08,c:'#a78bfa'},{n:'Other',p:.04,c:'#7d7a8c'}].forEach((cl,i)=>{
    let y=cy2+28+i*30;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(cx2+10,y,180,22,3);ctx.fill();
    ctx.fillStyle=cl.c+(Math.round(cl.p*200+55).toString(16).padStart(2,'0'));
    ctx.beginPath();ctx.roundRect(cx2+10,y,180*cl.p,22,3);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='500 9px Fira Code';ctx.fillText(cl.n+' '+(cl.p*100)+'%',cx2+15,y+15);});
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
  ctx.fillText('[CLS] aggregates info from',cx2+10,cy2+185);ctx.fillText('ALL patches via attention.',cx2+10,cy2+196);
  // Bottom explanation
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,300,720,34,8);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('ViT: "An Image is Worth 16\u00d716 Words" \u2014 same Transformer for text AND images!',25,316);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('No convolutions needed. Outperforms CNNs with large pretraining \u2192 CLIP, GPT-4V, etc.',440,316);}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx3=(e.clientX-r.left)*750/r.width,my3=(e.clientY-r.top)*340/r.height;
  if(mx3>=15&&mx3<=15+4*42&&my3>=30&&my3<=30+4*42){let col=Math.floor((mx3-15)/42),row=Math.floor((my3-30)/42);
    if(col>=0&&col<4&&row>=0&&row<4){selP=row*4+col;draw();}}};
const ctrl=addControls(el);draw()
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

// ===== CLIP =====
export function mountClip(containerId = 'demo-clip') {
  const __id = containerId || 'demo-clip';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Click any image to see how CLIP matches it with text descriptions. Green = match, red = mismatch!');
const images=[
  {name:'Cat',emoji:'\ud83d\udc31',embed:[.9,.1,.15,.1]},
  {name:'Dog',emoji:'\ud83d\udc36',embed:[.15,.9,.1,.15]},
  {name:'Car',emoji:'\ud83d\ude97',embed:[.15,.1,.85,.15]},
  {name:'Flower',emoji:'\ud83c\udf3b',embed:[.1,.15,.15,.9]}];
const texts=[
  {name:'a photo of a cat',embed:[.85,.1,.1,.05]},
  {name:'a cute puppy dog',embed:[.1,.88,.08,.1]},
  {name:'a red sports car',embed:[.08,.05,.9,.08]},
  {name:'beautiful flowers',embed:[.05,.12,.1,.92]}];
function cosSim(a,b){let d=a.reduce((s,v,i)=>s+v*b[i],0);return d/(Math.hypot(...a)*Math.hypot(...b));}
let selImg=0;
function draw(){ctx.clearRect(0,0,750,320);
  // Images column (left)
  const ix=15,iy=10;
  ctx.fillStyle='#38bdf8';ctx.font='700 10px Fira Code';ctx.fillText('Image Encoder (ViT):',ix,iy+10);
  images.forEach((img,i)=>{let y=iy+20+i*50;let isSel=i===selImg;
    ctx.fillStyle=isSel?'rgba(56,189,248,.15)':'rgba(6,6,12,.8)';ctx.beginPath();ctx.roundRect(ix,y,120,42,6);ctx.fill();
    ctx.strokeStyle=isSel?'#38bdf8':'#1e1e32';ctx.lineWidth=isSel?2.5:1;ctx.beginPath();ctx.roundRect(ix,y,120,42,6);ctx.stroke();
    ctx.font='24px sans-serif';ctx.fillText(img.emoji,ix+8,y+32);
    ctx.fillStyle=isSel?'#e4e2df':'#7d7a8c';ctx.font='500 10px Fira Code';ctx.fillText(img.name,ix+42,y+26);});
  // Texts column (right)
  const rx=580,ry=iy;
  ctx.fillStyle='#4ecdc4';ctx.font='700 10px Fira Code';ctx.fillText('Text Encoder:',rx,ry+10);
  texts.forEach((txt,i)=>{let y=ry+20+i*50;
    let sim=cosSim(images[selImg].embed,txt.embed);
    ctx.fillStyle=sim>0.6?'rgba(52,211,153,.12)':'rgba(6,6,12,.8)';ctx.beginPath();ctx.roundRect(rx,y,160,42,6);ctx.fill();
    ctx.strokeStyle=sim>0.6?'#34d399':'#1e1e32';ctx.lineWidth=sim>0.6?2:1;ctx.beginPath();ctx.roundRect(rx,y,160,42,6);ctx.stroke();
    ctx.fillStyle=sim>0.6?'#e4e2df':'#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('"'+txt.name+'"',rx+8,y+26);});
  // Similarity matrix (center)
  const mx2=155,my2=12,ms=42;
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Contrastive Similarity Matrix:',mx2+40,my2+8);
  // Column headers
  texts.forEach((t,j)=>{ctx.fillStyle='#4ecdc4';ctx.font='400 7px Fira Code';ctx.textAlign='center';
    ctx.fillText(t.name.split(' ').pop(),mx2+j*ms+ms/2+55,my2+18);ctx.textAlign='left';});
  images.forEach((img,i)=>{
    ctx.fillStyle='#38bdf8';ctx.font='400 8px Fira Code';ctx.fillText(img.emoji,mx2+35,my2+28+i*ms+ms/2+3);
    texts.forEach((txt,j)=>{let x=mx2+j*ms+50,y=my2+22+i*ms;
      let sim=cosSim(img.embed,txt.embed);
      let isMatch=i===j;
      // Color: green diagonal, red off-diagonal
      if(isMatch) ctx.fillStyle='rgba(52,211,153,'+(sim*0.9).toFixed(2)+')';
      else ctx.fillStyle='rgba(255,107,107,'+(sim*0.4).toFixed(2)+')';
      ctx.fillRect(x,y,ms-3,ms-3);
      ctx.fillStyle=sim>0.5?'#fff':'#888';ctx.font='bold 9px Fira Code';ctx.textAlign='center';
      ctx.fillText((sim*100|0)+'%',x+ms/2-2,y+ms/2+2);ctx.textAlign='left';
      // Highlight selected row
      if(i===selImg){ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.strokeRect(x,y,ms-3,ms-3);}});});
  // Connection lines from selected image to texts
  texts.forEach((txt,i)=>{let sim=cosSim(images[selImg].embed,txt.embed);
    ctx.strokeStyle=sim>0.6?'rgba(52,211,153,'+(sim*0.6).toFixed(2)+')':'rgba(255,107,107,.08)';
    ctx.lineWidth=sim>0.6?sim*4:1;ctx.setLineDash(sim>0.6?[]:[4,4]);
    ctx.beginPath();ctx.moveTo(135,iy+41+selImg*50);ctx.lineTo(580,iy+41+i*50);ctx.stroke();ctx.setLineDash([]);});
  // Training explanation
  const ey=iy+222;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,ey,720,86,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('CLIP Training: Contrastive Learning on 400M Image-Text Pairs',25,ey+16);
  ctx.fillStyle='#34d399';ctx.font='600 9px Fira Code';ctx.fillText('\u2705 Maximize diagonal (matching pairs): cat\u2194"photo of cat"',25,ey+36);
  ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('\u274c Minimize off-diagonal (mismatches): cat\u2194"sports car"',25,ey+52);
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
  ctx.fillText('Zero-shot classification: encode image + all class descriptions \u2192 pick highest similarity. No labeled training data!',25,ey+72);}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*320/r.height;
  images.forEach((img,i)=>{if(mx>=15&&mx<=135&&my>=30+i*50&&my<=72+i*50){selImg=i;draw();}});};
const ctrl=addControls(el);draw()
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

// ===== DIFFUSION =====
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

// ===== CHATGPT / RLHF =====
export function mountRlhf(containerId = 'demo-rlhf') {
  const __id = containerId || 'demo-rlhf';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Step through the 3-phase RLHF training pipeline. This is exactly how ChatGPT was built!');
let step=0;
const steps=[
{name:'1. Supervised Fine-Tuning (SFT)',color:'#38bdf8',
  prompt:'Explain quantum computing simply.',
  bad:'Quantum computing utilizes qubits which exist in superposition states allowing for parallel computation...',
  good:'Imagine a coin spinning in the air \u2014 it\'s both heads AND tails until it lands. Quantum bits work like that!',
  note:'Human trainers write ideal responses. Model learns their style.'},
{name:'2. Reward Model Training',color:'#ffd166',
  prompt:'What\'s the best programming language?',
  responses:['Python is the best language.','It depends on your goals:\n\u2022 Web: JavaScript\n\u2022 Data: Python\n\u2022 Speed: Rust','JavaScript because I said so.','Use Assembly for everything.'],
  ranks:[2,1,3,4],
  note:'Humans rank multiple outputs. Reward model learns: nuanced > dogmatic > wrong.'},
{name:'3. PPO Optimization',color:'#34d399',
  prompt:'How do I stay motivated?',
  before:{text:'Just don\'t be lazy.',score:2.1},
  after:{text:'Here are 3 evidence-based strategies:\n1. Set small daily goals\n2. Track your progress visually\n3. Reward yourself for milestones',score:8.7},
  note:'PPO optimizes the LLM to maximize the reward model\'s score.'}];
function draw(){ctx.clearRect(0,0,750,340);
  // Step tabs
  steps.forEach((s,i)=>{let x=15+i*245,y=6;
    ctx.fillStyle=i===step?s.color+'22':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,235,26,5);ctx.fill();
    ctx.strokeStyle=i<=step?s.color:'#1e1e32';ctx.lineWidth=i===step?2:1;ctx.beginPath();ctx.roundRect(x,y,235,26,5);ctx.stroke();
    ctx.fillStyle=i<=step?'#e4e2df':'#4a475a';ctx.font=(i===step?'600':'400')+' 8px Fira Code';
    ctx.fillText((i<step?'\u2713 ':'')+s.name,x+6,y+17);});
  let s=steps[step];
  // Main content area
  if(step===0){
    // SFT: show prompt and bad vs good response
    ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,42,720,145,10);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 10px Fira Code';ctx.fillText('Prompt: "'+s.prompt+'"',25,62);
    // Before
    ctx.fillStyle='rgba(255,107,107,.06)';ctx.beginPath();ctx.roundRect(25,72,340,105,6);ctx.fill();
    ctx.strokeStyle='#ff6b6b44';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(25,72,340,105,6);ctx.stroke();
    ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('\u274c Base LLM (robotic):',35,88);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    let words=s.bad.split(' '),line='',ly=104;
    words.forEach(w=>{if((line+w).length>46){ctx.fillText(line,35,ly);ly+=12;line='';}line+=w+' ';});if(line)ctx.fillText(line,35,ly);
    // After SFT
    ctx.fillStyle='rgba(52,211,153,.06)';ctx.beginPath();ctx.roundRect(375,72,350,105,6);ctx.fill();
    ctx.strokeStyle='#34d39944';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(375,72,350,105,6);ctx.stroke();
    ctx.fillStyle='#34d399';ctx.font='600 9px Fira Code';ctx.fillText('\u2705 After SFT (natural):',385,88);
    ctx.fillStyle='#e4e2df';ctx.font='400 8px Fira Code';
    words=s.good.split(' ');line='';ly=104;
    words.forEach(w=>{if((line+w).length>48){ctx.fillText(line,385,ly);ly+=12;line='';}line+=w+' ';});if(line)ctx.fillText(line,385,ly);
  } else if(step===1){
    // Reward model: show ranking
    ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,42,720,155,10);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 10px Fira Code';ctx.fillText('Prompt: "'+s.prompt+'"  \u2192  Model generates 4 responses:',25,62);
    s.responses.forEach((r,i)=>{let y=72+i*32,rank=s.ranks[i];
      let isTop=rank===1;
      ctx.fillStyle=isTop?'rgba(52,211,153,.1)':rank===2?'rgba(255,209,102,.05)':'rgba(255,107,107,.05)';
      ctx.beginPath();ctx.roundRect(25,y,530,28,4);ctx.fill();
      ctx.strokeStyle=isTop?'#34d399':rank===2?'#ffd16644':'#ff6b6b33';ctx.lineWidth=isTop?2:1;
      ctx.beginPath();ctx.roundRect(25,y,530,28,4);ctx.stroke();
      ctx.fillStyle=isTop?'#34d399':rank===2?'#ffd166':rank===3?'#fb923c':'#ff6b6b';
      ctx.font='700 9px Fira Code';ctx.fillText('#'+rank,30,y+18);
      ctx.fillStyle=isTop?'#e4e2df':'#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText(r.split('\n')[0],58,y+18);
      // Star rating
      ctx.fillStyle='#ffd166';ctx.font='500 8px Fira Code';ctx.fillText('\u2605'.repeat(5-rank),570,y+18);});
    ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('Human ranking \u2192 Reward model learns: helpful+nuanced > confident+wrong',25,72+4*32+14);
  } else {
    // PPO: before vs after
    ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,42,720,155,10);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 10px Fira Code';ctx.fillText('Prompt: "'+s.prompt+'"',25,62);
    // Before PPO
    ctx.fillStyle='rgba(255,107,107,.06)';ctx.beginPath();ctx.roundRect(25,72,340,115,6);ctx.fill();
    ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('\u274c Before PPO:',35,88);
    ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('"'+s.before.text+'"',35,106);
    ctx.fillStyle='#ff6b6b';ctx.font='700 18px Fira Code';ctx.fillText('Score: '+s.before.score.toFixed(1)+'/10',35,145);
    ctx.fillStyle='#111120';ctx.fillRect(35,152,280,12);ctx.fillStyle='#ff6b6b';ctx.fillRect(35,152,280*s.before.score/10,12);
    // After PPO
    ctx.fillStyle='rgba(52,211,153,.06)';ctx.beginPath();ctx.roundRect(375,72,350,115,6);ctx.fill();
    ctx.fillStyle='#34d399';ctx.font='600 9px Fira Code';ctx.fillText('\u2705 After PPO:',385,88);
    ctx.fillStyle='#e4e2df';ctx.font='400 8px Fira Code';
    s.after.text.split('\n').forEach((l,i)=>ctx.fillText(l,385,106+i*14));
    ctx.fillStyle='#34d399';ctx.font='700 18px Fira Code';ctx.fillText('Score: '+s.after.score.toFixed(1)+'/10',385,166);
    ctx.fillStyle='#111120';ctx.fillRect(385,173,280,12);ctx.fillStyle='#34d399';ctx.fillRect(385,173,280*s.after.score/10,12);
  }
  // Note
  const ny=205;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,ny,720,38,8);ctx.fill();
  ctx.fillStyle=s.color;ctx.font='600 10px Fira Code';ctx.fillText(s.note,25,ny+24);
  // Bottom summary
  const by=250;
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,by,720,82,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('The RLHF Pipeline (all 3 steps):',25,by+16);
  ctx.fillStyle='#38bdf8';ctx.font='600 9px Fira Code';ctx.fillText('1. SFT: Imitate human demos',25,by+36);
  ctx.fillStyle='#ffd166';ctx.fillText('2. Reward: Learn human preferences',260,by+36);
  ctx.fillStyle='#34d399';ctx.fillText('3. PPO: Optimize to maximize reward',520,by+36);
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
  ctx.fillText('RLHF = Reinforcement Learning from Human Feedback. ChatGPT: 100M users in 2 months.',25,by+56);
  ctx.fillText('This 3-step recipe is now the industry standard for aligning LLMs (Claude, Gemini, LLaMA-Chat...).',25,by+72);}
const ctrl=addControls(el);
const nb=document.createElement('button');nb.className='btn';nb.textContent='\u25b6 Next';nb.onclick=()=>{step=Math.min(step+1,2);draw();};
const pb=document.createElement('button');pb.className='btn';pb.textContent='\u25c0 Prev';pb.onclick=()=>{step=Math.max(step-1,0);draw();};
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';rst.onclick=()=>{step=0;draw();};
ctrl.appendChild(pb);ctrl.appendChild(nb);ctrl.appendChild(rst);draw()
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

// ===== LLAMA =====
export function mountLlama(containerId = 'demo-llama') {
  const __id = containerId || 'demo-llama';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Hover models to compare. LLaMA proves: more data on smaller models beats brute-force scaling!');
const models=[
  {name:'GPT-3',org:'OpenAI',params:175,tokens:300,perf:68,c:'#fb923c',open:false},
  {name:'Chinchilla',org:'DeepMind',params:70,tokens:1400,perf:71,c:'#a78bfa',open:false},
  {name:'LLaMA-7B',org:'Meta',params:7,tokens:1000,perf:63,c:'#34d399',open:true},
  {name:'LLaMA-13B',org:'Meta',params:13,tokens:1000,perf:68,c:'#34d399',open:true},
  {name:'LLaMA-65B',org:'Meta',params:65,tokens:1400,perf:74,c:'#34d399',open:true}];
let hov=-1;
function draw(){ctx.clearRect(0,0,750,320);
  // Visual comparison: bars
  const bx=15,by=8,bw=440,bh=195;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Model Comparison: Size vs Data vs Performance',bx+10,by+18);
  models.forEach((m,i)=>{let y=by+30+i*32;let isH=i===hov;
    // Model name
    ctx.fillStyle=isH?m.c:'#e4e2df';ctx.font=(isH?'700':'500')+' 9px Fira Code';ctx.fillText(m.name,bx+10,y+10);
    // Params bar
    let pw=m.params/175*130;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(bx+100,y,130,14,2);ctx.fill();
    ctx.fillStyle=m.c+(isH?'cc':'88');ctx.beginPath();ctx.roundRect(bx+100,y,pw,14,2);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='400 7px Fira Code';ctx.fillText(m.params+'B',bx+100+pw+4,y+10);
    // Tokens bar
    let tw=m.tokens/1400*130;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(bx+250,y,130,14,2);ctx.fill();
    ctx.fillStyle='#38bdf8'+(isH?'cc':'88');ctx.beginPath();ctx.roundRect(bx+250,y,tw,14,2);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='400 7px Fira Code';ctx.fillText(m.tokens+'B',bx+250+tw+4,y+10);
    // Open/closed
    ctx.fillStyle=m.open?'#34d399':'#ff6b6b';ctx.font='400 7px Fira Code';ctx.fillText(m.open?'\ud83d\udd13':'\ud83d\udd12',bx+420,y+10);});
  // Column headers
  ctx.fillStyle='#fb923c';ctx.font='600 7px Fira Code';ctx.fillText('Params \u2193',bx+130,by+28);
  ctx.fillStyle='#38bdf8';ctx.fillText('Training Tokens \u2193',bx+270,by+28);
  // Key insight: LLaMA-13B = GPT-3
  ctx.strokeStyle='#ffd16666';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(bx+100+13/175*130,by+30+3*32+7);ctx.lineTo(bx+100+175/175*130,by+30+0*32+7);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#ffd166';ctx.font='500 7px Fira Code';ctx.fillText('Same perf!',bx+180,by+30+2*32);
  // Performance chart (right)
  const rx=470,ry=by;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(rx,ry,268,bh,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Benchmark Score:',rx+10,ry+18);
  models.forEach((m,i)=>{let y=ry+28+i*32;let isH=i===hov;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(rx+10,y,220,18,3);ctx.fill();
    let perfW=220*(m.perf-55)/25;
    ctx.fillStyle=m.c+(isH?'ee':'aa');ctx.beginPath();ctx.roundRect(rx+10,y,perfW,18,3);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 8px Fira Code';ctx.fillText(m.name+': '+m.perf,rx+14,y+13);});
  // Bottom
  const ey=by+bh+10;
  ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,ey,720,105,10);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 12px Fira Code';ctx.fillText('LLaMA: The Open-Source AI Revolution',25,ey+18);
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Chinchilla Scaling Law: optimal = SMALLER model + MORE data',25,ey+38);
  ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
  ctx.fillText('LLaMA-13B (13B params, 1T tokens) \u2248 GPT-3 (175B params, 300B tokens). 13\u00d7 smaller, 3\u00d7 more data!',25,ey+58);
  ctx.fillText('Being open-source sparked: Alpaca, Vicuna, Mistral, Mixtral \u2014 the entire open LLM ecosystem.',25,ey+74);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
  ctx.fillText('Key innovations: RMSNorm, SwiGLU, RoPE (rotary position embeddings). Trained on publicly available data only.',25,ey+92);}
c.onmousemove=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*320/r.height;
  hov=-1;models.forEach((m,i)=>{let y=38+i*32;if(my>=y&&my<=y+20&&mx>15&&mx<455)hov=i;
    let y2=36+i*32;if(my>=y2&&my<=y2+20&&mx>470&&mx<740)hov=i;});draw();};
const ctrl=addControls(el);draw()
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

// ===== GPT-4 =====
export function mountGpt4(containerId = 'demo-gpt4') {
  const __id = containerId || 'demo-gpt4';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Toggle text vs multimodal. See how GPT-4 routes inputs through specialized experts (MoE)!');
let mode='multi';
function draw(){ctx.clearRect(0,0,750,340);
  // Mode toggle
  ['text','multi'].forEach((m,i)=>{let x=15+i*200,y=6;
    ctx.fillStyle=mode===m?'rgba(52,211,153,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,190,26,5);ctx.fill();
    ctx.strokeStyle=mode===m?'#34d399':'#1e1e32';ctx.lineWidth=mode===m?2:1;ctx.beginPath();ctx.roundRect(x,y,190,26,5);ctx.stroke();
    ctx.fillStyle=mode===m?'#e4e2df':'#4a475a';ctx.font='600 10px Fira Code';ctx.fillText(m==='text'?'\ud83d\udcdd Text Only':'\ud83d\uddbc\ufe0f Multimodal (Text+Image)',x+8,y+18);});
  // Input section
  const iy=40;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,iy,230,100,8);ctx.fill();
  ctx.fillStyle=mode==='multi'?'#a78bfa':'#38bdf8';ctx.font='700 10px Fira Code';ctx.fillText('Input:',25,iy+18);
  if(mode==='multi'){
    // Image placeholder
    ctx.fillStyle='rgba(167,139,250,.1)';ctx.beginPath();ctx.roundRect(25,iy+24,90,60,4);ctx.fill();
    ctx.strokeStyle='#a78bfa66';ctx.beginPath();ctx.roundRect(25,iy+24,90,60,4);ctx.stroke();
    // Mini chart inside
    ctx.strokeStyle='#a78bfa';ctx.lineWidth=1.5;ctx.beginPath();
    [25,40,35,55,70,65,80].forEach((v,i)=>{let x=30+i*11,y=iy+80-v*0.5;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
    ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('Q3 Revenue Chart',30,iy+78);
    ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';ctx.fillText('"What trend\ndo you see?"',125,iy+50);
  } else {
    ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';ctx.fillText('"Explain quantum\ncomputing simply"',25,iy+44);}
  // MoE routing (center)
  const mx2=260,my2=iy;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(mx2,my2,240,100,8);ctx.fill();
  ctx.fillStyle='#fb923c';ctx.font='700 10px Fira Code';ctx.fillText('Mixture of Experts (MoE):',mx2+10,my2+18);
  // Expert boxes
  const experts=[{name:'Lang Expert',active:true,c:'#38bdf8'},{name:'Math Expert',active:mode==='text',c:'#ffd166'},
    {name:'Vision Expert',active:mode==='multi',c:'#a78bfa'},{name:'Code Expert',active:false,c:'#4ecdc4'},
    {name:'Logic Expert',active:true,c:'#34d399'},{name:'Unused',active:false,c:'#7d7a8c'}];
  experts.forEach((e,i)=>{let x=mx2+10+(i%3)*76,y=my2+26+(Math.floor(i/3))*34;
    ctx.fillStyle=e.active?e.c+'33':'#111120';ctx.beginPath();ctx.roundRect(x,y,72,28,4);ctx.fill();
    ctx.strokeStyle=e.active?e.c:e.c+'22';ctx.lineWidth=e.active?2:1;ctx.beginPath();ctx.roundRect(x,y,72,28,4);ctx.stroke();
    ctx.fillStyle=e.active?e.c:'#333';ctx.font='400 7px Fira Code';ctx.textAlign='center';ctx.fillText(e.name,x+36,y+13);
    ctx.fillText(e.active?'\u2705 active':'\ud83d\udca4 idle',x+36,y+23);ctx.textAlign='left';});
  ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('Router activates only 2-3 of ~16 experts per token!',mx2+10,my2+96);
  // Arrow
  ctx.fillStyle='#4a475a';ctx.font='18px sans-serif';ctx.fillText('\u2192',mx2+244,my2+50);
  // Output
  const ox=515,oy=iy;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(ox,oy,222,100,8);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 10px Fira Code';ctx.fillText('Output:',ox+10,oy+18);
  ctx.fillStyle='#ffd166';ctx.font='400 9px Fira Code';
  if(mode==='multi'){ctx.fillText('Revenue grew 23% YoY,',ox+10,oy+40);ctx.fillText('accelerating from Q2\'s 15%.',ox+10,oy+56);ctx.fillText('Strong upward trend.',ox+10,oy+72);}
  else{ctx.fillText('Imagine two coins that',ox+10,oy+40);ctx.fillText('always land opposite \u2014',ox+10,oy+56);ctx.fillText('that\'s entanglement!',ox+10,oy+72);}
  ctx.fillStyle='#34d399';ctx.font='600 8px Fira Code';ctx.fillText('Confidence: '+(mode==='multi'?96:92)+'%',ox+10,oy+90);
  // Benchmarks
  const by=iy+110;
  ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,by,720,80,10);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 11px Fira Code';ctx.fillText('GPT-4 Benchmark Performance (vs humans):',25,by+18);
  const benchmarks=[{n:'Bar Exam',s:90,c:'#34d399'},{n:'SAT Math',s:93,c:'#38bdf8'},{n:'AP Bio',s:85,c:'#ffd166'},{n:'Coding',s:67,c:'#a78bfa'}];
  benchmarks.forEach((b,i)=>{let x=25+i*175,y=by+28;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(x,y,155,20,3);ctx.fill();
    ctx.fillStyle=b.c;ctx.beginPath();ctx.roundRect(x,y,155*b.s/100,20,3);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='500 8px Fira Code';ctx.fillText(b.n+': '+b.s+'th %ile',x+5,y+14);
    // Human average marker
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+155*0.5,y);ctx.lineTo(x+155*0.5,y+20);ctx.stroke();});
  ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('White line = human median. GPT-4 beats most humans on these exams.',25,by+66);
  // Bottom explanation
  const ey=by+88;
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,ey,720,78,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Key Innovations:',25,ey+16);
  ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
  ctx.fillText('\u2022 Multimodal: accepts text + images via ViT encoder. First LLM to "see" and reason about images.',25,ey+34);
  ctx.fillText('\u2022 MoE: ~1.8T total params but only ~280B active per token. 16 experts, router picks 2. Efficient at scale.',25,ey+50);
  ctx.fillText('\u2022 RLHF + red-teaming: extensive safety training. 6-month safety testing before release.',25,ey+66);}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*340/r.height;
  if(my>=6&&my<=32){if(mx>=15&&mx<=205)mode='text';if(mx>=215&&mx<=405)mode='multi';draw();}};
const ctrl=addControls(el);draw()
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

// ===== CLAUDE =====
export function mountClaude(containerId = 'demo-claude') {
  const __id = containerId || 'demo-claude';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Step through Constitutional AI: generate → critique against principles → revise. Scalable alignment!');
let step=0;
const pipe=[
{name:'1. Generate',color:'#38bdf8',content:'Prompt: "How do I pick a lock?"\n\nInitial response: "Here\'s how to\npick a lock: First, get a tension\nwrench and a pick..."',
note:'The base model generates a potentially harmful response without filtering.'},
{name:'2. Critique',color:'#ff6b6b',content:'AI Self-Critique (against constitution):\n\n✗ Violates: "Don\'t help with illegal acts"\n✗ Violates: "Consider broader impacts"\n✓ Follows: "Be helpful"  (but wrong kind)',
note:'AI checks its OWN response against written principles. No human rater needed!'},
{name:'3. Revise',color:'#34d399',content:'Revised: "I can\'t help with lock\npicking for unauthorized access.\nIf locked out, I recommend calling\na locksmith. Here\'s how to find one..."',
note:'AI generates a better response. This trains the reward model (RLAIF = RL from AI Feedback).'}];
function draw(){ctx.clearRect(0,0,750,320);
pipe.forEach((p,i)=>{let x=15+i*245,y=8;
ctx.fillStyle=i===step?p.color+'22':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,235,28,5);ctx.fill();
ctx.strokeStyle=i<=step?p.color:'#1e1e32';ctx.lineWidth=i===step?2:1;ctx.beginPath();ctx.roundRect(x,y,235,28,5);ctx.stroke();
ctx.fillStyle=i<=step?'#e4e2df':'#4a475a';ctx.font=(i===step?'600':'400')+' 8px Fira Code';ctx.fillText((i<step?'✓ ':'')+p.name,x+8,y+18)});
let p=pipe[step],cy2=48;
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,cy2,480,130,10);ctx.fill();
ctx.fillStyle=p.color;ctx.font='700 12px Fira Code';ctx.fillText(p.name,25,cy2+22);
ctx.fillStyle='#e4e2df';ctx.font='400 10px Fira Code';p.content.split('\n').forEach((l,i)=>{
ctx.fillStyle=l.includes('✗')?'#ff6b6b':l.includes('✓')?'#34d399':'#e4e2df';ctx.fillText(l,25,cy2+45+i*16)});
ctx.fillStyle='rgba(6,6,12,.8)';ctx.beginPath();ctx.roundRect(510,cy2,225,130,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('What\'s happening:',520,cy2+18);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
let words=p.note.split(' '),line='',ly=cy2+38;
words.forEach(w=>{if((line+w).length>30){ctx.fillText(line,520,ly);ly+=14;line=''}line+=w+' '});if(line)ctx.fillText(line,520,ly);
let py2=190;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,py2,720,60,10);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='700 11px Fira Code';ctx.fillText('The "Constitution" — Core Principles:',25,py2+18);
['Be helpful, harmless, honest','Don\'t help with illegal acts','Respect user autonomy',
'Be transparent about limits','Avoid deception','Consider broader impacts'].forEach((pr,i)=>{
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('• '+pr,25+(i%3)*240,py2+34+Math.floor(i/3)*14)});
let vy=260;ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,vy,720,52,10);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('ChatGPT (RLHF): Human raters score → reward model → PPO',25,vy+16);
ctx.fillStyle='#34d399';ctx.fillText('Claude (CAI): AI self-critiques against constitution → RLAIF → scalable, consistent',25,vy+34);
ctx.fillStyle='#ffd166';ctx.font='400 8px Fira Code';ctx.fillText('Key: principles written once, AI applies them to millions of examples. Scales without proportional human labor.',25,vy+48)}
const ctrl=addControls(el);
const nb=document.createElement('button');nb.className='btn';nb.textContent='▶ Next';nb.onclick=()=>{step=Math.min(step+1,2);draw()};
const pb=document.createElement('button');pb.className='btn';pb.textContent='◀ Prev';pb.onclick=()=>{step=Math.max(step-1,0);draw()};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';rst.onclick=()=>{step=0;draw()};
ctrl.appendChild(pb);ctrl.appendChild(nb);ctrl.appendChild(rst);draw()
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

// ===== SORA =====
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
