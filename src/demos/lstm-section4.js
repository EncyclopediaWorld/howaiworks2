import { $, createCanvas, addHint, addControls, sigmoid } from '../lib/shared.js'

export function mountLstm(containerId = 'demo-lstm') {
  const __id = containerId || 'demo-lstm';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Feed words into the LSTM. Watch the 3 gates control what to forget, store, and output.');
const words=['I','love','this','amazing','movie','!','It','was','terrible','though'];
let pos=-1,cellState=0,hidden=0,gateHistory=[];
function feedWord(){if(pos>=words.length-1)return;pos++;
let w=words[pos];let sentiment=({'love':.8,'amazing':.9,'movie':.1,'terrible':-.9,'!':.3,'I':0,'this':.05,'It':0,'was':0,'though':-.2})[w]||0;
let forgetG=sigmoid(hidden*1.5+sentiment*0.5-0.3);
let inputG=sigmoid(sentiment*2+hidden*0.3);
let candidate=Math.tanh(sentiment*1.5+hidden*0.2);
let outputG=sigmoid(hidden*0.5+cellState*0.3+sentiment);
cellState=forgetG*cellState+inputG*candidate;
hidden=outputG*Math.tanh(cellState);
gateHistory.push({w,f:forgetG,i:inputG,o:outputG,c:cellState,h:hidden});draw()}
function drawGate(x,y,w2,h,value,label,color){
ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(x,y,w2,h,4);ctx.fill();
ctx.fillStyle=color+'66';ctx.beginPath();ctx.roundRect(x,y+h*(1-value),w2,h*value,4);ctx.fill();
ctx.strokeStyle=color;ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x,y,w2,h,4);ctx.stroke();
ctx.fillStyle='#e4e2df';ctx.font='600 9px Fira Code';ctx.textAlign='center';
ctx.fillText((value*100|0)+'%',x+w2/2,y+h/2+3);
ctx.fillStyle=color;ctx.font='600 8px Fira Code';ctx.fillText(label,x+w2/2,y-6);ctx.textAlign='left'}
function draw(){ctx.clearRect(0,0,750,340);
let wx=15,wy=12,ww=70;
words.forEach((w,i)=>{let x=wx+i*ww;let fed=i<=pos;
ctx.fillStyle=fed?(i===pos?'rgba(255,209,102,.15)':'rgba(78,205,196,.05)'):'#0c0c16';
ctx.beginPath();ctx.roundRect(x,wy,ww-4,26,5);ctx.fill();
ctx.strokeStyle=fed?(i===pos?'#ffd166':'#4ecdc433'):'#1e1e32';ctx.lineWidth=i===pos?2:1;
ctx.beginPath();ctx.roundRect(x,wy,ww-4,26,5);ctx.stroke();
ctx.fillStyle=fed?'#e4e2df':'#4a475a';ctx.font=(i===pos?'600':'400')+' 10px Fira Code';ctx.textAlign='center';
ctx.fillText(w,x+ww/2-2,wy+17);ctx.textAlign='left'});
let cx2=80,cy2=55,cw=280,ch=120;
ctx.fillStyle='rgba(78,205,196,.04)';ctx.beginPath();ctx.roundRect(cx2,cy2,cw,ch,12);ctx.fill();
ctx.strokeStyle='#4ecdc4';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(cx2,cy2,cw,ch,12);ctx.stroke();
ctx.fillStyle='#4ecdc4';ctx.font='700 12px Fira Code';ctx.fillText('LSTM Cell',cx2+90,cy2+20);
let gw=58,gh=60,gy=cy2+35;
let fg=gateHistory.length?gateHistory[gateHistory.length-1].f:0.5;
let ig=gateHistory.length?gateHistory[gateHistory.length-1].i:0.5;
let og=gateHistory.length?gateHistory[gateHistory.length-1].o:0.5;
drawGate(cx2+18,gy,gw,gh,fg,'Forget','#ff6b6b');
drawGate(cx2+88,gy,gw,gh,ig,'Input','#38bdf8');
drawGate(cx2+158,gy,gw,gh,og,'Output','#a78bfa');
let csNorm=(Math.tanh(cellState)+1)/2;
ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(cx2+228,gy,38,gh,4);ctx.fill();
ctx.fillStyle='#ffd16666';ctx.beginPath();ctx.roundRect(cx2+228,gy+gh*(1-csNorm),38,gh*csNorm,4);ctx.fill();
ctx.strokeStyle='#ffd166';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(cx2+228,gy,38,gh,4);ctx.stroke();
ctx.fillStyle='#ffd166';ctx.font='600 8px Fira Code';ctx.textAlign='center';ctx.fillText('Cell',cx2+247,gy-6);
ctx.fillText(cellState.toFixed(2),cx2+247,gy+gh/2+3);ctx.textAlign='left';
let rx=385,ry=55;
ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(rx,ry,355,120,10);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='600 10px Fira Code';ctx.fillText('Forget Gate: "Should I keep old memory?"',rx+10,ry+18);
ctx.fillStyle='#38bdf8';ctx.fillText('Input Gate: "How much new info to store?"',rx+10,ry+38);
ctx.fillStyle='#a78bfa';ctx.fillText('Output Gate: "What to reveal as output?"',rx+10,ry+58);
ctx.fillStyle='#ffd166';ctx.fillText('Cell State: long-term memory highway',rx+10,ry+78);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('Key insight: cell state flows through with minimal change',rx+10,ry+98);
ctx.fillText('\u2192 gradients can flow far back in time (no vanishing!)',rx+10,ry+112);
let hy2=188;
ctx.fillStyle='#ffd166';ctx.font='600 10px Fira Code';ctx.fillText('Gate values over time:',15,hy2);
if(gateHistory.length>0){let bw=Math.min(70,700/gateHistory.length);
gateHistory.forEach((g,gi)=>{let x=15+gi*bw;let bh=35;
ctx.fillStyle='#ff6b6b55';ctx.fillRect(x,hy2+8,bw/3-1,bh*g.f);
ctx.fillStyle='#38bdf855';ctx.fillRect(x+bw/3,hy2+8,bw/3-1,bh*g.i);
ctx.fillStyle='#a78bfa55';ctx.fillRect(x+2*bw/3,hy2+8,bw/3-1,bh*g.o);
ctx.fillStyle=gi===pos?'#ffd166':'#7d7a8c';ctx.font='500 8px Fira Code';ctx.textAlign='center';
ctx.fillText(g.w,x+bw/2,hy2+bh+22);ctx.textAlign='left'})}
let sy=240;
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,sy,720,35,6);ctx.fill();
ctx.fillStyle='#7d7a8c';ctx.font='500 9px Fira Code';ctx.fillText('Hidden output (sentiment): ',25,sy+14);
let sentBar=400,sentVal=(hidden+1)/2;
ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(200,sy+5,sentBar,18,4);ctx.fill();
let grd=ctx.createLinearGradient(200,0,200+sentBar,0);grd.addColorStop(0,'#ff6b6b');grd.addColorStop(.5,'#7d7a8c');grd.addColorStop(1,'#34d399');
ctx.fillStyle=grd;ctx.beginPath();ctx.roundRect(200,sy+5,sentBar,18,4);ctx.fill();
ctx.fillStyle='#fff';ctx.fillRect(200+sentBar*sentVal-1.5,sy+2,3,24);
ctx.fillStyle='#e4e2df';ctx.font='600 9px Fira Code';ctx.fillText('Negative',620,sy+12);ctx.fillText('Positive',620,sy+26);
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,284,720,50,8);ctx.fill();
ctx.fillStyle='#4ecdc4';ctx.font='600 10px Fira Code';ctx.fillText('Why LSTM beats vanilla RNN:',25,302);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
ctx.fillText('RNN: gradients shrink exponentially over long sequences \u2192 forgets early words',25,318);
ctx.fillText('LSTM: cell state highway + gates \u2192 can remember "love" even after many words!',25,332)}
const ctrl=addControls(el);
const fb2=document.createElement('button');fb2.className='btn';fb2.textContent='\u25b6 Feed Word';fb2.onclick=feedWord;
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='\u23e9 Auto';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}else{tmr=setInterval(()=>{feedWord();if(pos>=words.length-1){clearInterval(tmr);tmr=null;ab.classList.remove('active')}},500);ab.classList.add('active')}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';
rst.onclick=()=>{pos=-1;cellState=0;hidden=0;gateHistory=[];if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
ctrl.appendChild(fb2);ctrl.appendChild(ab);ctrl.appendChild(rst);draw()
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
