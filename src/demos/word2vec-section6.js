import { $, createCanvas, addHint, addControls, TAU } from '../lib/shared.js'

export function mountW2v(containerId = 'demo-w2v') {
  const __id = containerId || 'demo-w2v';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Click analogies to see semantic arithmetic in vector space.');
const words={king:[.9,.8],queen:[.9,-.8],man:[.3,.7],woman:[.3,-.7],prince:[.7,.5],princess:[.7,-.5],
dog:[-.6,.3],cat:[-.5,-.3],puppy:[-.4,.4],kitten:[-.3,-.2],
paris:[-.8,.6],france:[-.7,.8],berlin:[-.8,-.4],germany:[-.7,-.6],tokyo:[-.9,0],japan:[-.8,.1]};
const analogies=[
{a:'king',b:'man',c:'woman',result:'queen',desc:'Royalty: gender relationship'},
{a:'paris',b:'france',c:'germany',result:'berlin',desc:'Capital: country relationship'},
{a:'puppy',b:'dog',c:'cat',result:'kitten',desc:'Young: species relationship'},
{a:'prince',b:'man',c:'woman',result:'princess',desc:'Royal gender relationship'}];
let selAn=0;
function draw(){ctx.clearRect(0,0,750,320);let an=analogies[selAn];
analogies.forEach((a,i)=>{let x=15+i*183,y=8;
ctx.fillStyle=i===selAn?'rgba(244,114,182,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,176,28,5);ctx.fill();
ctx.strokeStyle=i===selAn?'#f472b6':'#1e1e32';ctx.lineWidth=i===selAn?2:1;ctx.beginPath();ctx.roundRect(x,y,176,28,5);ctx.stroke();
ctx.fillStyle=i===selAn?'#e4e2df':'#4a475a';ctx.font='500 9px Fira Code';ctx.fillText(a.a+' \u2212 '+a.b+' + '+a.c+' = ?',x+8,y+18);});
let cx2=220,cy2=180,scale=120;
ctx.strokeStyle='#1a1a2a';ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(cx2-180,cy2);ctx.lineTo(cx2+180,cy2);ctx.stroke();
ctx.beginPath();ctx.moveTo(cx2,cy2-130);ctx.lineTo(cx2,cy2+130);ctx.stroke();
Object.entries(words).forEach(([w,v])=>{let x=cx2+v[0]*scale,y=cy2-v[1]*scale;
let isA=w===an.a,isB=w===an.b,isC=w===an.c,isR=w===an.result,hl=isA||isB||isC||isR;
ctx.beginPath();ctx.arc(x,y,hl?7:3,0,TAU);
ctx.fillStyle=isA?'#ff6b6b':isB?'#38bdf8':isC?'#ffd166':isR?'#34d399':'#4a475a';ctx.fill();
if(hl){ctx.fillStyle=isA?'#ff6b6b':isB?'#38bdf8':isC?'#ffd166':'#34d399';
ctx.font='600 10px Fira Code';ctx.textAlign='center';ctx.fillText(w,x,y-12);ctx.textAlign='left';}
else{ctx.fillStyle='#4a475a';ctx.font='400 7px Fira Code';ctx.textAlign='center';ctx.fillText(w,x,y-6);ctx.textAlign='left';}});
let va=words[an.a],vb=words[an.b],vc=words[an.c],vr=words[an.result];
if(va&&vb&&vc&&vr){ctx.strokeStyle='#ff6b6b88';ctx.lineWidth=2;ctx.setLineDash([5,3]);
ctx.beginPath();ctx.moveTo(cx2+va[0]*scale,cy2-va[1]*scale);ctx.lineTo(cx2+vb[0]*scale,cy2-vb[1]*scale);ctx.stroke();
ctx.strokeStyle='#34d39988';ctx.beginPath();ctx.moveTo(cx2+vc[0]*scale,cy2-vc[1]*scale);ctx.lineTo(cx2+vr[0]*scale,cy2-vr[1]*scale);ctx.stroke();ctx.setLineDash([]);}
let rx=440,ry=45;
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(rx,ry,300,205,10);ctx.fill();
ctx.fillStyle='#f472b6';ctx.font='700 12px Fira Code';ctx.fillText('Word Vector Arithmetic',rx+10,ry+22);
ctx.fillStyle='#ff6b6b';ctx.font='600 11px Fira Code';ctx.fillText(an.a,rx+10,ry+48);
ctx.fillStyle='#7d7a8c';ctx.fillText(' \u2212 ',rx+60,ry+48);ctx.fillStyle='#38bdf8';ctx.fillText(an.b,rx+80,ry+48);
ctx.fillStyle='#7d7a8c';ctx.fillText(' + ',rx+130,ry+48);ctx.fillStyle='#ffd166';ctx.fillText(an.c,rx+155,ry+48);
ctx.fillStyle='#7d7a8c';ctx.fillText(' = ',rx+210,ry+48);ctx.fillStyle='#34d399';ctx.font='700 11px Fira Code';ctx.fillText(an.result+' \u2713',rx+230,ry+48);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';ctx.fillText(an.desc,rx+10,ry+72);
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('How Word2Vec learns:',rx+10,ry+100);
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
ctx.fillText('Skip-gram: predict context from word',rx+10,ry+118);
ctx.fillText('"The [cat] sat on" \u2192 predict neighbors',rx+10,ry+134);
ctx.fillText('Similar contexts \u2192 similar vectors',rx+10,ry+150);
ctx.fillText('Relationships become vector directions',rx+10,ry+166);
ctx.fillText('automatically \u2014 no supervision needed!',rx+10,ry+182);
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,282,720,30,8);ctx.fill();
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('Each word = dense vector (50-300 dims). Similar meaning = close in space. Relationships = consistent directions.',25,301);}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*320/r.height;
analogies.forEach((a,i)=>{let x=15+i*183;if(mx>=x&&mx<=x+176&&my>=8&&my<=36){selAn=i;draw();}});};
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
