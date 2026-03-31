import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountElmo(containerId = 'demo-elmo') {
  const __id = containerId || 'demo-elmo';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Click a context to see how the SAME word gets DIFFERENT embeddings based on context!');
const examples=[
{word:'bank',ctx1:'river bank with trees',ctx2:'bank account balance',dim1:[.8,.2,.7,.1],dim2:[.1,.9,.2,.8],desc:'Place vs Finance'},
{word:'bat',ctx1:'baseball bat swing',ctx2:'bat flew at night',dim1:[.7,.3,.8,.2],dim2:[.2,.7,.3,.9],desc:'Equipment vs Animal'},
{word:'light',ctx1:'light weight feather',ctx2:'bright light shining',dim1:[.3,.8,.2,.6],dim2:[.8,.2,.7,.3],desc:'Not heavy vs Illumination'},
{word:'spring',ctx1:'spring water fresh',ctx2:'spring season flowers',dim1:[.6,.3,.8,.4],dim2:[.3,.7,.4,.8],desc:'Water vs Season'}];
let sel=0;
function draw(){ctx.clearRect(0,0,750,300);let ex=examples[sel];
examples.forEach((e,i)=>{let x=15+i*183,y=8;
ctx.fillStyle=i===sel?'rgba(251,146,60,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,176,26,5);ctx.fill();
ctx.strokeStyle=i===sel?'#fb923c':'#1e1e32';ctx.lineWidth=i===sel?2:1;ctx.beginPath();ctx.roundRect(x,y,176,26,5);ctx.stroke();
ctx.fillStyle=i===sel?'#e4e2df':'#4a475a';ctx.font='500 10px Fira Code';ctx.fillText('"'+e.word+'"',x+8,y+17)});
let py=48,ph=100;
[{ctx2:ex.ctx1,dims:ex.dim1,label:'Context A',c:'#ff6b6b',x:15},
{ctx2:ex.ctx2,dims:ex.dim2,label:'Context B',c:'#38bdf8',x:385}].forEach(p=>{
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(p.x,py,355,ph,10);ctx.fill();
ctx.fillStyle=p.c;ctx.font='600 11px Fira Code';ctx.fillText(p.label+': "'+p.ctx2+'"',p.x+10,py+20);
ctx.fillStyle='#ffd166';ctx.font='700 13px Fira Code';ctx.fillText('"'+ex.word+'"',p.x+10,py+42);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('ELMo embedding:',p.x+10,py+60);
['Syntax','Semantic','Topic','Context'].forEach((l,i)=>{let y=py+65+i*8;
ctx.fillStyle=p.c+'33';ctx.fillRect(p.x+80,y,200*p.dims[i],6);
ctx.fillStyle='#4a475a';ctx.font='400 6px Fira Code';ctx.fillText(l,p.x+10,y+5)})});
let sy=158;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,sy,720,55,10);ctx.fill();
let sim=ex.dim1.reduce((a,v,i)=>a+v*ex.dim2[i],0)/(Math.hypot(...ex.dim1)*Math.hypot(...ex.dim2));
ctx.fillStyle='#ffd166';ctx.font='700 12px Fira Code';ctx.fillText('Same word "'+ex.word+'" → cosine sim: '+sim.toFixed(3),25,sy+20);
ctx.fillStyle=sim<.5?'#34d399':'#ff6b6b';ctx.font='600 10px Fira Code';
ctx.fillText(sim<.5?'✓ Very different meanings!':'✗ Similar',25,sy+40);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('| '+ex.desc,250,sy+40);
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,223,720,68,10);ctx.fill();
ctx.fillStyle='#fb923c';ctx.font='700 11px Fira Code';ctx.fillText('ELMo vs Word2Vec:',25,242);
ctx.fillStyle='#ff6b6b';ctx.font='500 9px Fira Code';ctx.fillText('Word2Vec: "'+ex.word+'" always = same vector regardless of context ✗',25,260);
ctx.fillStyle='#34d399';ctx.fillText('ELMo: "'+ex.word+'" = different vector per context via bidirectional LSTM ✓',25,278)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*300/r.height;
examples.forEach((ex,i)=>{let x=15+i*183;if(mx>=x&&mx<=x+176&&my>=8&&my<=34){sel=i;draw()}})};
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
