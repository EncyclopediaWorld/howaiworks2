import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

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
