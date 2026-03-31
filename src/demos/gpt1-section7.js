import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountGpt1(containerId = 'demo-gpt1') {
  const __id = containerId || 'demo-gpt1';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Watch GPT generate left-to-right. Each word predicted from ALL previous words via self-attention.');
const seqs=[
{prompt:['The','cat'],gen:['sat','on','the','warm','mat','.'],probs:[.45,.6,.7,.3,.5,.8]},
{prompt:['Once','upon'],gen:['a','time','there','was','a','king'],probs:[.7,.8,.4,.5,.6,.3]},
{prompt:['The','weather'],gen:['is','beautiful','today','in','the','city'],probs:[.6,.35,.45,.5,.7,.25]}];
let selS=0,genPos=-1;
function draw(){ctx.clearRect(0,0,750,300);let seq=seqs[selS],all=[...seq.prompt,...seq.gen];
seqs.forEach((s,i)=>{let x=15+i*245,y=8;
ctx.fillStyle=i===selS?'rgba(251,146,60,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,235,26,5);ctx.fill();
ctx.strokeStyle=i===selS?'#fb923c':'#1e1e32';ctx.lineWidth=i===selS?2:1;ctx.beginPath();ctx.roundRect(x,y,235,26,5);ctx.stroke();
ctx.fillStyle=i===selS?'#e4e2df':'#4a475a';ctx.font='500 9px Fira Code';ctx.fillText('"'+s.prompt.join(' ')+' ..."',x+8,y+17)});
let tx=25,ty=48,tw=85;
all.forEach((w,i)=>{let x=tx+(i%8)*tw,y=ty+Math.floor(i/8)*55;let isP=i<seq.prompt.length;
let isGen=!isP&&i-seq.prompt.length<=genPos;let isCur=!isP&&i-seq.prompt.length===genPos;
ctx.fillStyle=isCur?'rgba(255,209,102,.2)':isGen?'rgba(251,146,60,.1)':isP?'rgba(56,189,248,.08)':'#0a0a14';
ctx.beginPath();ctx.roundRect(x,y,tw-5,40,6);ctx.fill();
ctx.strokeStyle=isCur?'#ffd166':isGen?'#fb923c44':isP?'#38bdf8':'#1e1e32';ctx.lineWidth=isCur?2:1;
ctx.beginPath();ctx.roundRect(x,y,tw-5,40,6);ctx.stroke();
ctx.fillStyle=isGen||isP?'#e4e2df':'#333';ctx.font=(isCur?'700':'500')+' 11px Fira Code';ctx.textAlign='center';
ctx.fillText(isGen||isP?w:'?',x+tw/2-3,y+18);
if(isGen){let prob=seq.probs[i-seq.prompt.length];ctx.fillStyle='#fb923c44';ctx.fillRect(x+5,y+28,prob*(tw-15),6);
ctx.fillStyle='#fb923c';ctx.font='400 7px Fira Code';ctx.fillText((prob*100|0)+'%',x+tw/2-3,y+36)}
if(isP){ctx.fillStyle='#38bdf8';ctx.font='400 7px Fira Code';ctx.fillText('prompt',x+tw/2-3,y+36)}
ctx.textAlign='left';
if(isCur){for(let j=0;j<i;j++){let jx=tx+(j%8)*tw+tw/2-3,jy=ty+Math.floor(j/8)*55+40;
ctx.strokeStyle='rgba(255,209,102,.15)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+tw/2-3,y);ctx.lineTo(jx,jy);ctx.stroke()}}});
let ay=168;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,ay,720,55,10);ctx.fill();
ctx.fillStyle='#fb923c';ctx.font='700 11px Fira Code';ctx.fillText('GPT-1: Transformer Decoder (left-to-right)',25,ay+18);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('Each token attends ONLY to previous tokens (causal mask). Pretrained on BookCorpus (117M params).',25,ay+38);
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,235,720,58,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('GPT approach: Predict the NEXT word (autoregressive)',25,253);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('Step 1: Pretrain on "predict next word" (unsupervised) → Step 2: Fine-tune on task (classification, QA, etc.)',25,273);
ctx.fillText('This pretrain+finetune paradigm becomes the foundation of all modern language AI.',25,288)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*300/r.height;
seqs.forEach((s,i)=>{let x=15+i*245;if(mx>=x&&mx<=x+235&&my>=8&&my<=34){selS=i;genPos=-1;draw()}})};
const ctrl=addControls(el);
const gb=document.createElement('button');gb.className='btn';gb.textContent='▶ Next';gb.onclick=()=>{if(genPos<seqs[selS].gen.length-1){genPos++;draw()}};
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='⏩ Auto';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}else{tmr=setInterval(()=>{if(genPos<seqs[selS].gen.length-1){genPos++;draw()}else{clearInterval(tmr);tmr=null;ab.classList.remove('active')}},400);ab.classList.add('active')}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{genPos=-1;if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
ctrl.appendChild(gb);ctrl.appendChild(ab);ctrl.appendChild(rst);draw()
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
