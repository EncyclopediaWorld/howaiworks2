import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

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
