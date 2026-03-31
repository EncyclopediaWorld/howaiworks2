import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountBert(containerId = 'demo-bert') {
  const __id = containerId || 'demo-bert';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Click a word to [MASK] it. BERT predicts from BOTH left AND right context — unlike GPT!');
const sent=['The','quick','brown','fox','jumps','over','the','lazy','dog'];
const preds={0:['The','A','This'],1:['quick','fast','slow'],2:['brown','red','big'],3:['fox','cat','dog'],
4:['jumps','runs','leaps'],5:['over','under','past'],6:['the','a','his'],7:['lazy','old','sleepy'],8:['dog','cat','fox']};
const probs={0:[.6,.25,.1],1:[.5,.3,.1],2:[.55,.2,.15],3:[.45,.25,.2],4:[.5,.25,.15],5:[.6,.2,.1],6:[.7,.15,.1],7:[.4,.35,.15],8:[.5,.25,.15]};
let masked=new Set([3]);
function draw(){ctx.clearRect(0,0,750,300);
let tx=20,ty=28,tw=78;
sent.forEach((w,i)=>{let x=tx+i*tw;let isM=masked.has(i);
ctx.fillStyle=isM?'rgba(255,209,102,.15)':'rgba(56,189,248,.05)';ctx.beginPath();ctx.roundRect(x,ty,tw-4,40,6);ctx.fill();
ctx.strokeStyle=isM?'#ffd166':'#38bdf844';ctx.lineWidth=isM?2:1;ctx.beginPath();ctx.roundRect(x,ty,tw-4,40,6);ctx.stroke();
ctx.fillStyle=isM?'#ffd166':'#e4e2df';ctx.font='600 11px Fira Code';ctx.textAlign='center';ctx.fillText(isM?'[MASK]':w,x+tw/2-2,ty+24);ctx.textAlign='left';
if(isM){for(let j=0;j<sent.length;j++){if(j===i)continue;let jx=tx+j*tw+tw/2-2;
ctx.strokeStyle=j<i?'rgba(56,189,248,.2)':'rgba(78,205,196,.2)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+tw/2-2,ty+40);ctx.lineTo(jx,ty+40);ctx.stroke()}}});
let py=82;masked.forEach(mi=>{let x=tx+mi*tw;
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(x-30,py,140,70,8);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('Predictions:',x-25,py+14);
preds[mi].forEach((p,pi)=>{let y=py+20+pi*16;
ctx.fillStyle='#111120';ctx.fillRect(x-25,y,100,12);ctx.fillStyle='#ffd166'+(Math.round(probs[mi][pi]*200+55).toString(16).padStart(2,'0'));
ctx.fillRect(x-25,y,100*probs[mi][pi],12);ctx.fillStyle='#e4e2df';ctx.font='400 8px Fira Code';ctx.fillText(p+' '+(probs[mi][pi]*100|0)+'%',x-22,y+9)})});
let cy2=165;ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,cy2,720,128,10);ctx.fill();
ctx.fillStyle='#38bdf8';ctx.font='700 12px Fira Code';ctx.fillText('BERT: Bidirectional',25,cy2+20);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('[CLS] The quick brown [MASK] jumps over the lazy dog [SEP]',25,cy2+40);
ctx.fillStyle='#38bdf8';ctx.font='400 9px Fira Code';ctx.fillText('←←← reads left AND right ←→ predicts "fox"',25,cy2+58);
ctx.fillStyle='#fb923c';ctx.font='700 12px Fira Code';ctx.fillText('GPT: Unidirectional',400,cy2+20);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('The quick brown ___ ...',400,cy2+40);
ctx.fillStyle='#fb923c';ctx.font='400 9px Fira Code';ctx.fillText('←←← only left context → less info',400,cy2+58);
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('BERT = understanding. GPT = generation. Both use Transformer.',25,cy2+82);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('BERT: 340M params, pretrained on Wikipedia+BookCorpus. Dominated GLUE, SQuAD in 2018-2019.',25,cy2+100);
ctx.fillText('Training: 15% tokens masked → predict from context. Also next sentence prediction (NSP).',25,cy2+115)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*300/r.height;
if(my>=28&&my<=68){let idx=Math.floor((mx-20)/78);if(idx>=0&&idx<sent.length){masked.clear();masked.add(idx);draw()}}};
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
