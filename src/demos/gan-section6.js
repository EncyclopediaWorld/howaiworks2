import { $, createCanvas, addHint, addControls, rand, clamp, TAU } from '../lib/shared.js'

export function mountGan(containerId = 'demo-gan') {
  const __id = containerId || 'demo-gan';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Watch the Generator (pink) learn to match the Real distribution (green). They converge as G fools D!');
let round=0,gMean=80,gStd=100,history=[];
const realMean=350,realStd=50,plotRange=600;
function gauss(x,mu,sig){return Math.exp(-0.5*((x-mu)/sig)**2);}
function step(){round++;
  gMean+=(realMean-gMean)*(0.04+rand(0,0.02));
  gStd+=(realStd-gStd)*(0.035+rand(0,0.015));
  gStd=Math.max(gStd,15);
  let overlap=1-Math.abs(gMean-realMean)/300-Math.abs(gStd-realStd)/150;
  overlap=clamp(overlap,0,1);
  history.push({r:round,gM:gMean,gS:gStd,ov:overlap});
  if(history.length>60)history.shift();draw();}
function draw(){ctx.clearRect(0,0,750,320);
  const pX=15,pY=12,pW=490,pH=175,base=pY+pH-8;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(pX,pY,pW,pH,8);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Generator learns to match Real distribution',pX+8,pY+14);
  // Draw filled distributions with high peaks
  // Real
  ctx.beginPath();ctx.moveTo(pX+8,base);
  for(let px=0;px<pW-16;px++){let x=px/(pW-16)*plotRange;let v=gauss(x,realMean,realStd)*(pH-30);
    ctx.lineTo(pX+8+px,base-v);}
  ctx.lineTo(pX+pW-8,base);ctx.closePath();
  ctx.fillStyle='rgba(52,211,153,0.18)';ctx.fill();
  ctx.strokeStyle='#34d399';ctx.lineWidth=2.5;
  ctx.beginPath();for(let px=0;px<pW-16;px++){let x=px/(pW-16)*plotRange;let v=gauss(x,realMean,realStd)*(pH-30);
    px===0?ctx.moveTo(pX+8+px,base-v):ctx.lineTo(pX+8+px,base-v);}ctx.stroke();
  // Generator
  ctx.beginPath();ctx.moveTo(pX+8,base);
  for(let px=0;px<pW-16;px++){let x=px/(pW-16)*plotRange;let v=gauss(x,gMean,gStd)*(pH-30);
    ctx.lineTo(pX+8+px,base-v);}
  ctx.lineTo(pX+pW-8,base);ctx.closePath();
  ctx.fillStyle='rgba(244,114,182,0.15)';ctx.fill();
  ctx.strokeStyle='#f472b6';ctx.lineWidth=2.5;
  ctx.beginPath();for(let px=0;px<pW-16;px++){let x=px/(pW-16)*plotRange;let v=gauss(x,gMean,gStd)*(pH-30);
    px===0?ctx.moveTo(pX+8+px,base-v):ctx.lineTo(pX+8+px,base-v);}ctx.stroke();
  // Sample dots along baseline
  for(let i=0;i<25;i++){
    let rx=realMean+rand(-1,1)*realStd*1.8;
    ctx.beginPath();ctx.arc(pX+8+rx/(plotRange)*(pW-16),base+6+rand(-2,2),3,0,TAU);ctx.fillStyle='#34d399';ctx.fill();
    let gx=gMean+rand(-1,1)*gStd*1.8;
    ctx.beginPath();ctx.arc(pX+8+gx/(plotRange)*(pW-16),base+14+rand(-2,2),3,0,TAU);ctx.fillStyle='#f472b6';ctx.fill();}
  // Legend inside plot
  ctx.fillStyle='#34d399';ctx.font='600 10px Fira Code';ctx.fillText('\u25cf Real P(x)',pX+pW-148,pY+14);
  ctx.fillStyle='#f472b6';ctx.fillText('\u25cf G(z) generated',pX+pW-148,pY+28);
  // Right panel
  const rx=520,ry=pY;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(rx,ry,220,pH,8);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 12px Fira Code';ctx.fillText('Round '+round,rx+10,ry+20);
  ctx.fillStyle='#f472b6';ctx.font='600 10px Fira Code';ctx.fillText('\ud83c\udfa8 Generator',rx+10,ry+42);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('Goal: fool Discriminator',rx+10,ry+56);
  ctx.fillText('\u03bc='+gMean.toFixed(0)+' \u03c3='+gStd.toFixed(0)+' (target: \u03bc='+realMean+' \u03c3='+realStd+')',rx+10,ry+70);
  ctx.fillStyle='#38bdf8';ctx.font='600 10px Fira Code';ctx.fillText('\ud83d\udd0d Discriminator',rx+10,ry+92);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('Goal: tell real from fake',rx+10,ry+106);
  let dAcc=round>0?clamp(1-history[history.length-1].ov*0.7,0.3,0.95):0.95;
  ctx.fillText('Accuracy: '+(dAcc*100).toFixed(0)+'%',rx+10,ry+120);
  let conv=round>0?history[history.length-1].ov:0;
  ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(rx+10,ry+130,200,16,3);ctx.fill();
  let cGr=ctx.createLinearGradient(rx+10,0,rx+210,0);cGr.addColorStop(0,'#ff6b6b');cGr.addColorStop(0.5,'#ffd166');cGr.addColorStop(1,'#34d399');
  ctx.fillStyle=cGr;ctx.beginPath();ctx.roundRect(rx+10,ry+130,200*conv,16,3);ctx.fill();
  ctx.fillStyle='#e4e2df';ctx.font='bold 9px Fira Code';ctx.fillText('Convergence: '+(conv*100).toFixed(0)+'%',rx+14,ry+143);
  // Bottom history
  const by=pY+pH+10;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(15,by,720,118,8);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('Training History:',25,by+14);
  if(history.length>1){ctx.strokeStyle='#34d399';ctx.lineWidth=2;ctx.beginPath();
    history.forEach((h,i)=>{let hx=25+i*(690/60),hy=by+90-h.ov*65;i===0?ctx.moveTo(hx,hy):ctx.lineTo(hx,hy);});ctx.stroke();
    ctx.fillStyle='#34d399';ctx.font='400 7px Fira Code';ctx.fillText('overlap \u2191',690,by+14);}
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
  ctx.fillText('G and D compete: G improves fakes \u2192 D must adapt \u2192 G improves more \u2192 converges when D can\'t tell them apart!',25,by+110);}
const ctrl=addControls(el);
const sb=document.createElement('button');sb.className='btn';sb.textContent='\u25b6 Train';sb.onclick=step;
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='\u23e9 Auto';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active');}else{tmr=setInterval(step,120);ab.classList.add('active');}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';
rst.onclick=()=>{round=0;gMean=80;gStd=100;history=[];if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active');}draw();};
ctrl.appendChild(sb);ctrl.appendChild(ab);ctrl.appendChild(rst);draw()
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
