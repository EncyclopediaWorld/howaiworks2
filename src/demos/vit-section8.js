import { $, createCanvas, addHint, addControls, rand } from '../lib/shared.js'

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
