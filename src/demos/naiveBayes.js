import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

// ===== demo-nb =====
export function mountNaiveBayes(containerId = 'demo-nb') {
  const __id = containerId || 'demo-nb';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Click words to toggle them in the email. See how each word shifts the spam probability via Bayes\' rule.');
const words=[{w:'free',spam:.85,ham:.05},{w:'money',spam:.7,ham:.08},{w:'hello',spam:.15,ham:.6},{w:'meeting',spam:.05,ham:.55},
{w:'winner',spam:.8,ham:.02},{w:'project',spam:.08,ham:.5},{w:'click',spam:.75,ham:.06},{w:'dear',spam:.2,ham:.4}];
let selected=new Set([0,4,6]);
function calc(){let lS=Math.log(.3),lH=Math.log(.7);
words.forEach((w,i)=>{if(selected.has(i)){lS+=Math.log(w.spam);lH+=Math.log(w.ham)}else{lS+=Math.log(1-w.spam);lH+=Math.log(1-w.ham)}});
let mx2=Math.max(lS,lH),eS=Math.exp(lS-mx2),eH=Math.exp(lH-mx2);return eS/(eS+eH)}
function draw(){ctx.clearRect(0,0,750,320);let prob=calc();
// Word buttons
ctx.fillStyle='#ffd166';ctx.font='600 11px Fira Code';ctx.fillText('Toggle words in the email:',15,18);
words.forEach((w,i)=>{let col=i%4,row=Math.floor(i/4);let x=15+col*183,y=28+row*52;
let on=selected.has(i);
ctx.fillStyle=on?(w.spam>.5?'rgba(255,107,107,.1)':'rgba(78,205,196,.1)'):'rgba(20,20,35,.5)';
ctx.beginPath();ctx.roundRect(x,y,176,44,8);ctx.fill();
ctx.strokeStyle=on?(w.spam>.5?'#ff6b6b':'#4ecdc4'):'#1e1e32';ctx.lineWidth=on?1.5:1;
ctx.beginPath();ctx.roundRect(x,y,176,44,8);ctx.stroke();
ctx.fillStyle=on?'#e4e2df':'#4a475a';ctx.font='600 13px Fira Code';ctx.fillText('"'+w.w+'"',x+8,y+20);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
ctx.fillText('P(w|spam)='+(w.spam*100|0)+'%',x+8,y+36);ctx.fillText('P(w|ham)='+(w.ham*100|0)+'%',x+98,y+36);
if(on){ctx.fillStyle=w.spam>w.ham?'#ff6b6b':'#4ecdc4';ctx.font='600 9px Fira Code';ctx.fillText(w.spam>w.ham?'↑SPAM':'↑HAM',x+140,y+20)}});
// Result panel
let ry=140;ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(15,ry,720,80,12);ctx.fill();
ctx.strokeStyle=prob>.5?'#ff6b6b44':'#34d39944';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(15,ry,720,80,12);ctx.stroke();
ctx.fillStyle=prob>.5?'#ff6b6b':'#34d399';ctx.font='800 20px Fira Code';
ctx.fillText(prob>.5?'🚫 SPAM  '+(prob*100).toFixed(1)+'%':'✅ HAM  '+((1-prob)*100).toFixed(1)+'%',30,ry+28);
// Gauge
ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(30,ry+40,500,18,5);ctx.fill();
let grd=ctx.createLinearGradient(30,0,530,0);grd.addColorStop(0,'#34d399');grd.addColorStop(.5,'#ffd166');grd.addColorStop(1,'#ff6b6b');
ctx.fillStyle=grd;ctx.beginPath();ctx.roundRect(30,ry+40,500,18,5);ctx.fill();
// Indicator
let ix=30+500*prob;
ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(ix,ry+38);ctx.lineTo(ix-5,ry+32);ctx.lineTo(ix+5,ry+32);ctx.fill();
ctx.fillRect(ix-1.5,ry+38,3,22);
ctx.fillStyle='#7d7a8c';ctx.font='500 8px Fira Code';ctx.fillText('HAM',35,ry+72);ctx.fillText('SPAM',500,ry+72);
// Explanation
let ey=230;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,ey,720,82,10);ctx.fill();
ctx.fillStyle='#fb923c';ctx.font='600 10px Fira Code';ctx.fillText('How Naive Bayes calculates:',25,ey+18);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
let sWords=[...selected].map(i=>'"'+words[i].w+'"');
ctx.fillText('Active words: '+sWords.join(', '),25,ey+36);
ctx.fillText('P(spam|words) ∝ P(spam) × ∏ P(wordᵢ|spam) = 0.3 × '+[...selected].map(i=>(words[i].spam).toFixed(2)).join('×'),25,ey+54);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('"Naive" = assumes word probabilities are independent. Wrong but works! Simplicity beats complexity.',25,ey+72)}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx2=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*320/r.height;
words.forEach((w,i)=>{let col=i%4,row=Math.floor(i/4);let x=15+col*183,y=28+row*52;
if(mx2>=x&&mx2<=x+176&&my>=y&&my<=y+44){if(selected.has(i))selected.delete(i);else selected.add(i);draw()}})};
const ctrl=addControls(el);const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{selected=new Set([0,4,6]);draw()};ctrl.appendChild(rst);draw()
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
