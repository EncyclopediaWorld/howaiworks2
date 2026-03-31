import { $, createCanvas, addHint, addControls, TAU } from '../lib/shared.js'

// ===== demo-rnn =====
export function mountRnn(containerId = 'demo-rnn') {
  const __id = containerId || 'demo-rnn';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 380);
addHint(el,'Feed words one by one. The hidden state (green bar) accumulates meaning — watch how each word changes the sentiment!');
const sentences=[
{words:['The','movie','was','absolutely','terrible','and','boring'],sentiments:[0,.1,.1,.3,-.8,-.7,-.9],label:'Negative review'},
{words:['I','love','this','amazing','wonderful','beautiful','day'],sentiments:[0,.4,.4,.7,.85,.9,.95],label:'Positive review'},
{words:['The','food','was','okay','but','service','sucked'],sentiments:[0,.05,.05,.1,.0,-.1,-.7],label:'Mixed → Negative'}];
let si=0,pos=-1,hVal=0,history=[];
function cur(){return sentences[si]}
function feedWord(){if(pos>=cur().words.length-1)return;pos++;
hVal=hVal*.6+cur().sentiments[pos]*.4; // tanh-like blending
history.push({word:cur().words[pos],h:hVal,s:cur().sentiments[pos]});draw()}
function draw(){ctx.clearRect(0,0,750,380);
let sent=cur();
// Title
ctx.fillStyle='#ffd166';ctx.font='700 12px Fira Code';ctx.fillText('RNN: Sentiment Analysis — "'+sent.label+'"',15,20);
// ===== UNROLLED RNN CELLS =====
let cellW=88,cellH=50,cellY=50,startX=20;
sent.words.forEach((w,i)=>{let x=startX+i*cellW+i*8,fed=i<=pos,isCur=i===pos;
// Cell box
ctx.fillStyle=fed?(isCur?'rgba(78,205,196,.12)':'rgba(78,205,196,.04)'):'#0a0a14';
ctx.beginPath();ctx.roundRect(x,cellY,cellW,cellH,8);ctx.fill();
ctx.strokeStyle=fed?(isCur?'#4ecdc4':'#4ecdc444'):'#1e1e32';ctx.lineWidth=isCur?2.5:1;
ctx.beginPath();ctx.roundRect(x,cellY,cellW,cellH,8);ctx.stroke();
// tanh label inside
ctx.fillStyle=fed?'#4ecdc4':'#333';ctx.font='600 9px Fira Code';ctx.textAlign='center';
ctx.fillText('tanh',x+cellW/2,cellY+18);
ctx.fillStyle=fed?'#e4e2df':'#333';ctx.font='400 8px Fira Code';
ctx.fillText('h=f(h,x)',x+cellW/2,cellY+34);
// Input word below
ctx.fillStyle=fed?(isCur?'#38bdf8':'#38bdf888'):'#333';ctx.font=(isCur?'700':'400')+' 10px Fira Code';
ctx.fillText(w,x+cellW/2,cellY+cellH+18);
// Input arrow up
if(fed){ctx.strokeStyle=isCur?'#38bdf8':'#38bdf844';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(x+cellW/2,cellY+cellH+6);ctx.lineTo(x+cellW/2,cellY+cellH);ctx.stroke();
ctx.fillStyle=ctx.strokeStyle;ctx.beginPath();ctx.moveTo(x+cellW/2-4,cellY+cellH);ctx.lineTo(x+cellW/2+4,cellY+cellH);ctx.lineTo(x+cellW/2,cellY+cellH-5);ctx.fill()}
// Recurrent arrow to next
if(i<sent.words.length-1){let nx=x+cellW+8;
ctx.strokeStyle=fed?'#ffd16688':'#1e1e32';ctx.lineWidth=fed?2:1;
ctx.beginPath();ctx.moveTo(x+cellW,cellY+cellH/2);ctx.lineTo(nx,cellY+cellH/2);ctx.stroke();
if(fed){ctx.fillStyle='#ffd166';ctx.font='500 7px Fira Code';ctx.fillText('hₜ',x+cellW+4,cellY+cellH/2-5)}}
ctx.textAlign='left'});
// ===== HIDDEN STATE VISUALIZATION =====
let hy=140;
ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('Hidden State h (memory) over time:',15,hy);
// Bar chart of hidden state after each word
if(history.length>0){let barW=Math.min(85,660/history.length);
history.forEach((h,i)=>{let x=20+i*(barW+6),y=hy+8;
let barH=Math.abs(h.h)*70,isPos=h.h>=0;
// Bar
let barY=isPos?y+75-barH:y+75;
ctx.fillStyle=isPos?'rgba(52,211,153,.6)':'rgba(255,107,107,.6)';
ctx.beginPath();ctx.roundRect(x,barY,barW,barH||2,3);ctx.fill();
// Zero line
ctx.strokeStyle='#333';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y+75);ctx.lineTo(x+barW,y+75);ctx.stroke();
// Value
ctx.fillStyle=isPos?'#34d399':'#ff6b6b';ctx.font='600 9px Fira Code';ctx.textAlign='center';
ctx.fillText(h.h.toFixed(2),x+barW/2,isPos?barY-4:barY+barH+12);
// Word label
ctx.fillStyle=i===pos?'#ffd166':'#7d7a8c';ctx.font=(i===pos?'600':'400')+' 8px Fira Code';
ctx.fillText(h.word,x+barW/2,y+100);ctx.textAlign='left'});
// Sentiment arrow
let lastH=history[history.length-1].h;
let arrowX=25+history.length*(Math.min(85,660/history.length)+6);
if(arrowX<700){
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(arrowX,hy+40,90,50,8);ctx.fill();
ctx.fillStyle=lastH>0.2?'#34d399':lastH<-0.2?'#ff6b6b':'#ffd166';
ctx.font='22px sans-serif';ctx.textAlign='center';
ctx.fillText(lastH>0.2?'😊':lastH<-0.2?'😠':'😐',arrowX+45,hy+62);
ctx.font='600 9px Fira Code';
ctx.fillText(lastH>0.2?'Positive':lastH<-0.2?'Negative':'Neutral',arrowX+45,hy+82);
ctx.textAlign='left'}}
// ===== RNN ARCHITECTURE DIAGRAM =====
let dy=hy+120;
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(12,dy,726,80,10);ctx.fill();
ctx.fillStyle='#4ecdc4';ctx.font='700 11px Fira Code';ctx.fillText('How RNN Works:',22,dy+18);
// Diagram
let dx=22,dcy=dy+50;
// Input
ctx.beginPath();ctx.arc(dx+25,dcy,14,0,TAU);ctx.fillStyle='#38bdf822';ctx.fill();ctx.strokeStyle='#38bdf8';ctx.lineWidth=1.5;ctx.stroke();
ctx.fillStyle='#38bdf8';ctx.font='600 9px Fira Code';ctx.textAlign='center';ctx.fillText('xₜ',dx+25,dcy+4);
// Arrow
ctx.strokeStyle='#4a475a';ctx.beginPath();ctx.moveTo(dx+40,dcy);ctx.lineTo(dx+70,dcy);ctx.stroke();
// RNN cell
ctx.beginPath();ctx.roundRect(dx+70,dcy-18,80,36,6);ctx.fillStyle='#4ecdc422';ctx.fill();ctx.strokeStyle='#4ecdc4';ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle='#4ecdc4';ctx.fillText('RNN Cell',dx+110,dcy+4);
// Recurrent loop
ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(dx+150,dcy-18);ctx.quadraticCurveTo(dx+170,dcy-40,dx+110,dcy-40);ctx.quadraticCurveTo(dx+50,dcy-40,dx+70,dcy-18);ctx.stroke();
ctx.fillStyle='#ffd166';ctx.font='500 8px Fira Code';ctx.fillText('hₜ₋₁',dx+105,dcy-44);
// Output arrow
ctx.strokeStyle='#4a475a';ctx.beginPath();ctx.moveTo(dx+150,dcy);ctx.lineTo(dx+180,dcy);ctx.stroke();
ctx.beginPath();ctx.arc(dx+195,dcy,14,0,TAU);ctx.fillStyle='#ff6b6b22';ctx.fill();ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.5;ctx.stroke();
ctx.fillStyle='#ff6b6b';ctx.fillText('hₜ',dx+195,dcy+4);ctx.textAlign='left';
// Key formula
ctx.fillStyle='#e4e2df';ctx.font='500 10px Fira Code';ctx.fillText('hₜ = tanh( W_h · hₜ₋₁ + W_x · xₜ + b )',dx+240,dcy-4);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('Each step blends the current input with memory of ALL previous inputs',dx+240,dcy+14);
ctx.fillStyle='#ffd166';ctx.fillText('→ This is why RNN can understand sequences! But long-range memory fades (→ LSTM fixes this)',dx+240,dcy+28)}
const ctrl=addControls(el);
const fb=document.createElement('button');fb.className='btn';fb.textContent='▶ Feed Next Word';fb.onclick=feedWord;
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='⏩ Auto Feed';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}else{tmr=setInterval(()=>{feedWord();if(pos>=cur().words.length-1){clearInterval(tmr);tmr=null;ab.classList.remove('active')}},600);ab.classList.add('active')}};
const nb=document.createElement('button');nb.className='btn';nb.textContent='📝 Next Sentence';nb.onclick=()=>{si=(si+1)%sentences.length;pos=-1;hVal=0;history=[];if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{pos=-1;hVal=0;history=[];if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
ctrl.appendChild(fb);ctrl.appendChild(ab);ctrl.appendChild(nb);ctrl.appendChild(rst);draw()
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
