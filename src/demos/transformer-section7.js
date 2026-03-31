import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountTransformer(containerId = 'demo-transformer') {
  const __id = containerId || 'demo-transformer';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Click any word to see its self-attention pattern — which words does it attend to?');
const tokens=['The','cat','sat','on','the','warm','mat'];
const attnW=[[.05,.15,.1,.05,.4,.05,.2],[.1,.1,.3,.1,.05,.15,.2],[.05,.2,.1,.25,.05,.1,.25],
[.1,.05,.3,.1,.1,.15,.2],[.3,.1,.05,.1,.1,.1,.25],[.05,.1,.1,.2,.05,.2,.3],[.05,.15,.2,.1,.25,.1,.15]];
let selT=1;
function draw(){ctx.clearRect(0,0,750,340);
let tx=30,ty=22,tw=95;
tokens.forEach((t,i)=>{let x=tx+i*tw;let isSel=i===selT;let attn=attnW[selT][i];
ctx.fillStyle=isSel?'rgba(251,146,60,.2)':`rgba(251,146,60,${attn*.3})`;ctx.beginPath();ctx.roundRect(x,ty,tw-6,36,6);ctx.fill();
ctx.strokeStyle=isSel?'#fb923c':`rgba(251,146,60,${.2+attn*.8})`;ctx.lineWidth=isSel?2.5:1+attn*3;
ctx.beginPath();ctx.roundRect(x,ty,tw-6,36,6);ctx.stroke();
ctx.fillStyle=isSel?'#fb923c':'#e4e2df';ctx.font=(isSel?'700':'500')+' 12px Fira Code';ctx.textAlign='center';
ctx.fillText(t,x+tw/2-3,ty+22);
if(!isSel){ctx.fillStyle='#ffd166';ctx.font='500 8px Fira Code';ctx.fillText((attn*100|0)+'%',x+tw/2-3,ty+50)}
ctx.textAlign='left'});
// Heatmap
let mx2=30,my2=78,ms=40;
ctx.fillStyle='#fb923c';ctx.font='600 10px Fira Code';ctx.fillText('Self-Attention Matrix (click row):',mx2,my2-5);
tokens.forEach((t,i)=>{
ctx.fillStyle=i===selT?'#fb923c':'#7d7a8c';ctx.font='400 8px Fira Code';ctx.textAlign='right';ctx.fillText(t,mx2-5,my2+i*ms+ms/2+3);ctx.textAlign='left';
tokens.forEach((t2,j)=>{let v=attnW[i][j];
ctx.fillStyle=`rgba(251,146,60,${v})`;ctx.fillRect(mx2+j*ms,my2+i*ms,ms-2,ms-2);
ctx.fillStyle=v>.2?'#fff':'#555';ctx.font='400 7px Fira Code';ctx.textAlign='center';
ctx.fillText((v*100|0)+'%',mx2+j*ms+ms/2-1,my2+i*ms+ms/2+2);ctx.textAlign='left'})});
tokens.forEach((t,j)=>{ctx.save();ctx.translate(mx2+j*ms+ms/2,my2-2);ctx.rotate(-0.5);
ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText(t,0,0);ctx.restore()});
// QKV panel
let rx=340,ry=78;
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(rx,ry,400,200,10);ctx.fill();
ctx.fillStyle='#fb923c';ctx.font='700 12px Fira Code';ctx.fillText('How Self-Attention Works:',rx+10,ry+22);
ctx.fillStyle='#ff6b6b';ctx.font='600 10px Fira Code';ctx.fillText('Q (Query)',rx+10,ry+48);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('"What am I looking for?"',rx+85,ry+48);
ctx.fillStyle='#38bdf8';ctx.font='600 10px Fira Code';ctx.fillText('K (Key)',rx+10,ry+70);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('"What do I contain?"',rx+85,ry+70);
ctx.fillStyle='#4ecdc4';ctx.font='600 10px Fira Code';ctx.fillText('V (Value)',rx+10,ry+92);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('"Here\'s my information"',rx+85,ry+92);
ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('Score = Q·K/√d → softmax → weighted V',rx+10,ry+120);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';ctx.fillText('"'+tokens[selT]+'" attends most to:',rx+10,ry+150);
let sorted=[...attnW[selT].entries()].sort((a,b)=>b[1]-a[1]);
sorted.slice(0,3).forEach((s,i)=>{ctx.fillStyle=['#ff6b6b','#ffd166','#4ecdc4'][i];ctx.font='500 10px Fira Code';
ctx.fillText((i+1)+'. "'+tokens[s[0]]+'" ('+(s[1]*100|0)+'%)',rx+10,ry+170+i*16)});
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(340,290,400,42,8);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='600 9px Fira Code';ctx.fillText('Multi-Head: 8-16 attention heads in parallel!',350,308);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('Each head learns different patterns: syntax, coreference, semantics...',350,324)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx3=(e.clientX-r.left)*750/r.width,my3=(e.clientY-r.top)*340/r.height;
if(my3>=22&&my3<=58){let idx=Math.floor((mx3-30)/95);if(idx>=0&&idx<tokens.length){selT=idx;draw()}}
if(my3>=78&&my3<=78+7*40){let row=Math.floor((my3-78)/40);if(row>=0&&row<7){selT=row;draw()}}};
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
