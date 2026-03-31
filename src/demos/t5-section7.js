import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountT5(containerId = 'demo-t5') {
  const __id = containerId || 'demo-t5';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Click tasks. T5 treats EVERYTHING as text-in → text-out. One model, one format!');
const tasks=[
{name:'Translate',input:'translate English to German: That is good',output:'Das ist gut',prefix:'translate'},
{name:'Summarize',input:'summarize: State authorities reported 47 cases of a new virus. The WHO is monitoring.',output:'47 virus cases; WHO monitoring.',prefix:'summarize'},
{name:'Classify',input:'sst2 sentence: This movie is absolutely wonderful',output:'positive',prefix:'classify'},
{name:'QA',input:'question: Who painted the Mona Lisa? context: Leonardo da Vinci painted it in the 16th century.',output:'Leonardo da Vinci',prefix:'qa'},
{name:'Grammar',input:'cola sentence: The boy the girl saw run.',output:'unacceptable',prefix:'grammar'}];
let selT=0;
function draw(){ctx.clearRect(0,0,750,300);let t=tasks[selT];
tasks.forEach((tk,i)=>{let x=15+i*145,y=8;
ctx.fillStyle=i===selT?'rgba(251,146,60,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,138,26,5);ctx.fill();
ctx.strokeStyle=i===selT?'#fb923c':'#1e1e32';ctx.lineWidth=i===selT?2:1;ctx.beginPath();ctx.roundRect(x,y,138,26,5);ctx.stroke();
ctx.fillStyle=i===selT?'#e4e2df':'#4a475a';ctx.font='500 9px Fira Code';ctx.fillText(tk.name,x+8,y+17)});
let iy=45;ctx.fillStyle='rgba(56,189,248,.05)';ctx.beginPath();ctx.roundRect(15,iy,340,78,10);ctx.fill();
ctx.strokeStyle='#38bdf8';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(15,iy,340,78,10);ctx.stroke();
ctx.fillStyle='#38bdf8';ctx.font='600 10px Fira Code';ctx.fillText('Input:',25,iy+18);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
let words=t.input.split(' '),line='',ly2=iy+36;
words.forEach(w=>{if((line+w).length>42){ctx.fillText(line,25,ly2);ly2+=14;line=''}line+=w+' '});if(line)ctx.fillText(line,25,ly2);
ctx.fillStyle='#fb923c';ctx.font='bold 24px sans-serif';ctx.fillText('→',365,iy+42);
ctx.fillStyle='rgba(251,146,60,.06)';ctx.beginPath();ctx.roundRect(395,iy,75,78,10);ctx.fill();
ctx.strokeStyle='#fb923c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(395,iy,75,78,10);ctx.stroke();
ctx.fillStyle='#fb923c';ctx.font='700 16px Fira Code';ctx.textAlign='center';ctx.fillText('T5',432,iy+45);ctx.textAlign='left';
ctx.fillStyle='#34d399';ctx.font='bold 24px sans-serif';ctx.fillText('→',480,iy+42);
ctx.fillStyle='rgba(52,211,153,.05)';ctx.beginPath();ctx.roundRect(510,iy,225,78,10);ctx.fill();
ctx.strokeStyle='#34d399';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(510,iy,225,78,10);ctx.stroke();
ctx.fillStyle='#34d399';ctx.font='600 10px Fira Code';ctx.fillText('Output:',520,iy+18);
ctx.fillStyle='#ffd166';ctx.font='600 12px Fira Code';ctx.fillText(t.output,520,iy+45);
let ky=136;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,ky,720,75,10);ctx.fill();
ctx.fillStyle='#fb923c';ctx.font='700 12px Fira Code';ctx.fillText('T5: "Text-to-Text Transfer Transformer"',25,ky+20);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
ctx.fillText('Every NLP task framed as "text in → text out". Task PREFIX tells what to do.',25,ky+40);
ctx.fillText('ONE model, ONE training procedure, ONE architecture → handles everything!',25,ky+56);
ctx.fillText('This unification insight merges with GPT\'s prompting to create the modern instruction-following paradigm.',25,ky+70);
let ty2=222;ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,ty2,720,70,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('Same model handles all:',25,ty2+16);
['Translation','Summarization','Classification','QA','Grammar','Generation','Similarity','Paraphrase'].forEach((t2,i)=>{
let x=25+(i%4)*178,y=ty2+28+Math.floor(i/4)*18;
ctx.fillStyle=tasks[selT]?.name===t2?'#fb923c':'#4a475a';ctx.font='400 8px Fira Code';ctx.fillText('• '+t2,x,y)})}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*300/r.height;
tasks.forEach((t,i)=>{let x=15+i*145;if(mx>=x&&mx<=x+138&&my>=8&&my<=34){selT=i;draw()}})};
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
