import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountGpt2(containerId = 'demo-gpt2') {
  const __id = containerId || 'demo-gpt2';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Select a task — GPT-2 performs it zero-shot (no task-specific training!) through prompting alone.');
const tasks=[
{name:'Translation',prompt:'Translate English to French:\n"Hello, how are you?" =',output:'"Bonjour, comment allez-vous?"',conf:.85},
{name:'Summarize',prompt:'Article: The economy grew 3%...\nTL;DR:',output:'Economy showed strong growth.',conf:.72},
{name:'QA',prompt:'Q: Capital of France?\nA:',output:'Paris is the capital of France.',conf:.92},
{name:'Code',prompt:'# Reverse a string\ndef reverse(',output:'s): return s[::-1]',conf:.78}];
let selT=0;
function draw(){ctx.clearRect(0,0,750,300);let t=tasks[selT];
tasks.forEach((tk,i)=>{let x=15+i*183,y=8;
ctx.fillStyle=i===selT?'rgba(251,146,60,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,176,26,5);ctx.fill();
ctx.strokeStyle=i===selT?'#fb923c':'#1e1e32';ctx.lineWidth=i===selT?2:1;ctx.beginPath();ctx.roundRect(x,y,176,26,5);ctx.stroke();
ctx.fillStyle=i===selT?'#e4e2df':'#4a475a';ctx.font='500 10px Fira Code';ctx.fillText(tk.name,x+8,y+17)});
let py=42;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,py,350,85,10);ctx.fill();
ctx.fillStyle='#38bdf8';ctx.font='600 10px Fira Code';ctx.fillText('Input Prompt:',25,py+18);
ctx.fillStyle='#e4e2df';ctx.font='400 10px Fira Code';t.prompt.split('\n').forEach((l,i)=>ctx.fillText(l,25,py+38+i*16));
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(385,py,355,85,10);ctx.fill();
ctx.fillStyle='#34d399';ctx.font='600 10px Fira Code';ctx.fillText('GPT-2 Output (zero-shot!):',395,py+18);
ctx.fillStyle='#ffd166';ctx.font='500 11px Fira Code';ctx.fillText(t.output,395,py+42);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('Confidence: '+(t.conf*100)+'%',395,py+68);
ctx.fillStyle='#111120';ctx.fillRect(395,py+72,200,8);ctx.fillStyle='#34d399';ctx.fillRect(395,py+72,200*t.conf,8);
let sy=142;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,sy,720,70,10);ctx.fill();
ctx.fillStyle='#fb923c';ctx.font='700 12px Fira Code';ctx.fillText('GPT-2: Scale unlocks emergent abilities',25,sy+18);
let models=[{n:'GPT-1',p:'117M',b:.08},{n:'GPT-2 S',p:'124M',b:.09},{n:'GPT-2 M',p:'345M',b:.24},{n:'GPT-2 L',p:'774M',b:.52},{n:'GPT-2 XL',p:'1.5B',b:1}];
models.forEach((m,i)=>{let x=25+i*140;
ctx.fillStyle='#111120';ctx.fillRect(x,sy+30,120,14);ctx.fillStyle='#fb923c';ctx.fillRect(x,sy+30,120*m.b,14);
ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText(m.n+' ('+m.p+')',x,sy+58)});
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,225,720,68,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('Zero-shot = no task-specific training! Just prompt engineering.',25,243);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('GPT-2 showed: scale alone produces emergent multi-task abilities via prompting.',25,263);
ctx.fillText('This "prompting" paradigm becomes the foundation of ChatGPT, Claude, and all modern AI assistants.',25,278);
ctx.fillText('OpenAI initially called it "too dangerous to release" — the first AI safety debate.',25,293)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*300/r.height;
tasks.forEach((t,i)=>{let x=15+i*183;if(mx>=x&&mx<=x+176&&my>=8&&my<=34){selT=i;draw()}})};
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
