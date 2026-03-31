import { $, createCanvas, addHint, addControls, TAU } from '../lib/shared.js'

export function mountNnlm(containerId = 'demo-nnlm') {
  const __id = containerId || 'demo-nnlm';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Click a context (2 words). The neural network predicts the next word using learned word embeddings.');
const vocab=['the','cat','sat','on','mat','dog','ran','in','park','a','big','small','red','blue','house'];
const contexts=[
{words:['the','cat'],top:[{w:'sat',p:.45},{w:'ran',p:.3},{w:'is',p:.15}]},
{words:['cat','sat'],top:[{w:'on',p:.55},{w:'in',p:.25},{w:'down',p:.12}]},
{words:['sat','on'],top:[{w:'the',p:.5},{w:'a',p:.3},{w:'my',p:.12}]},
{words:['the','dog'],top:[{w:'ran',p:.4},{w:'sat',p:.25},{w:'is',p:.2}]},
{words:['dog','ran'],top:[{w:'in',p:.45},{w:'to',p:.3},{w:'fast',p:.15}]},
{words:['big','red'],top:[{w:'house',p:.4},{w:'car',p:.3},{w:'dog',p:.15}]},
{words:['a','small'],top:[{w:'cat',p:.35},{w:'dog',p:.3},{w:'house',p:.2}]},
{words:['in','the'],top:[{w:'park',p:.4},{w:'house',p:.3},{w:'mat',p:.15}]}];
let selected=0;
const embeddings={};
vocab.forEach((w,i)=>{embeddings[w]=[Math.sin(i*1.2)*80+200,Math.cos(i*.8)*60+120,Math.sin(i*2.1)*40]});
function draw(){ctx.clearRect(0,0,750,320);let ctx2=contexts[selected];
// Context buttons
ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('Select context (2 previous words):',15,16);
contexts.forEach((cc,i)=>{let x=15+(i%4)*183,y=24+Math.floor(i/4)*32;
ctx.fillStyle=i===selected?'rgba(167,139,250,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,176,26,5);ctx.fill();
ctx.strokeStyle=i===selected?'#a78bfa':'#1e1e32';ctx.lineWidth=i===selected?2:1;
ctx.beginPath();ctx.roundRect(x,y,176,26,5);ctx.stroke();
ctx.fillStyle=i===selected?'#e4e2df':'#4a475a';ctx.font='500 10px Fira Code';
ctx.fillText('"'+cc.words[0]+' '+cc.words[1]+' ___"',x+8,y+17)});
let ay=95;
// Word embeddings
ctx.fillStyle='#38bdf8';ctx.font='600 10px Fira Code';ctx.fillText('1. Embeddings',15,ay);
ctx2.words.forEach((w,i)=>{let x=15,y=ay+8+i*42;
ctx.fillStyle='rgba(56,189,248,.08)';ctx.beginPath();ctx.roundRect(x,y,125,36,6);ctx.fill();
ctx.strokeStyle='#38bdf8';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x,y,125,36,6);ctx.stroke();
ctx.fillStyle='#38bdf8';ctx.font='600 11px Fira Code';ctx.fillText('"'+w+'"',x+8,y+16);
let emb=embeddings[w]||[0,0,0];ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
ctx.fillText('['+emb.map(v=>v.toFixed(0)).join(', ')+']',x+8,y+30)});
// Hidden layer
let hx=185;ctx.fillStyle='#a78bfa';ctx.font='600 10px Fira Code';ctx.fillText('2. Hidden',hx,ay);
ctx.fillStyle='rgba(167,139,250,.05)';ctx.beginPath();ctx.roundRect(hx,ay+8,95,76,8);ctx.fill();
ctx.strokeStyle='#a78bfa';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(hx,ay+8,95,76,8);ctx.stroke();
ctx.fillStyle='#a78bfa';ctx.font='400 9px Fira Code';ctx.fillText('tanh(W×',hx+8,ay+35);ctx.fillText('[e₁;e₂]+b)',hx+8,ay+50);
for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(hx+75,ay+20+i*16,5,0,TAU);ctx.fillStyle='#a78bfa44';ctx.fill();ctx.strokeStyle='#a78bfa';ctx.stroke()}
// Softmax + predictions
let sx=320;ctx.fillStyle='#4ecdc4';ctx.font='600 10px Fira Code';ctx.fillText('3. Softmax → P(next)',sx,ay);
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(sx,ay+8,180,76,8);ctx.fill();
ctx2.top.forEach((t,i)=>{let y=ay+18+i*22;
ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(sx+8,y,140,17,3);ctx.fill();
ctx.fillStyle='#4ecdc4'+(Math.round(t.p*200+55).toString(16).padStart(2,'0'));
ctx.beginPath();ctx.roundRect(sx+8,y,140*t.p,17,3);ctx.fill();
ctx.fillStyle='#e4e2df';ctx.font='600 9px Fira Code';ctx.fillText('"'+t.w+'" '+(t.p*100|0)+'%',sx+12,y+12)});
// Arrows
ctx.fillStyle='#4a475a';ctx.font='14px sans-serif';ctx.fillText('→',152,ay+50);ctx.fillText('→',292,ay+50);
// Embedding space
let ex=530,ey=ay;
ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('Word Embedding Space:',ex,ey);
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(ex,ey+8,205,158,8);ctx.fill();
vocab.slice(0,12).forEach((w,i)=>{let emb=embeddings[w];let px=ex+12+(emb[0]-120)*0.8,py=ey+20+(emb[1]-60)*1.1;
let isCtx=ctx2.words.includes(w);let isPred=ctx2.top.some(t=>t.w===w);
ctx.beginPath();ctx.arc(px,py,isCtx?7:isPred?5:3,0,TAU);
ctx.fillStyle=isCtx?'#38bdf8':isPred?'#4ecdc4':'#4a475a';ctx.fill();
if(isCtx||isPred){ctx.fillStyle=isCtx?'#38bdf8':'#4ecdc4';ctx.font='500 7px Fira Code';ctx.textAlign='center';ctx.fillText(w,px,py-10);ctx.textAlign='left'}});
// Bottom
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,270,720,42,8);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('NNLM (Bengio 2003) — The ancestor of GPT:',25,288);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('Each word → dense vector. Feed context embeddings through a neural net → predict next word probability.',25,305)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*320/r.height;
contexts.forEach((cc,i)=>{let x=15+(i%4)*183,y=24+Math.floor(i/4)*32;
if(mx>=x&&mx<=x+176&&my>=y&&my<=y+26){selected=i;draw()}})};
const ctrl=addControls(el);const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{selected=0;draw()};ctrl.appendChild(rst);draw()
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
