import { $, createCanvas, addHint, addControls, rand, clamp, TAU } from '../lib/shared.js'

// ===== demo-adaline =====
export function mountAdaline(containerId = 'demo-adaline') {
  const __id = containerId || 'demo-adaline';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 520);
addHint(el,'Left-click = Red (class −1), Right-click = Blue (class +1). Watch the smooth gradient descent — compare with Perceptron\'s discrete jumps above!');
let pts=[],w1=0,w2=0,b=0,lr=0.15,ep=0,losses=[],wHist=[];
// Normalize coordinates for stable training
function nx(px){return px/750}
function ny(py){return py/380}
function rawZ(px,py){return w1*nx(px)+w2*ny(py)+b}
function predict(px,py){return rawZ(px,py)>=0?1:-1}
function seed(){pts=[];
for(let i=0;i<10;i++){pts.push({x:rand(40,310),y:rand(30,340),c:-1});pts.push({x:rand(440,710),y:rand(30,340),c:1})}
w1=0;w2=0;b=0;ep=0;losses=[];wHist=[{w1:0,w2:0}]}
seed();
function trainEpoch(){
let dw1=0,dw2=0,db=0,n=pts.length,totalLoss=0;
// Batch gradient (entire dataset, smoother for visualization)
pts.forEach(p=>{let z=w1*nx(p.x)+w2*ny(p.y)+b;let err=p.c-z;
dw1+=err*nx(p.x);dw2+=err*ny(p.y);db+=err;totalLoss+=err*err});
w1+=lr*2*dw1/n;w2+=lr*2*dw2/n;b+=lr*2*db/n;
ep++;let mse=totalLoss/n;losses.push(mse);
if(losses.length>300)losses.shift();
wHist.push({w1,w2});if(wHist.length>300)wHist.shift()}
// Precomputed heatmap for performance
let heatCache=null,heatW1=null,heatW2=null,heatB=null;
function drawHeatmap(){
// Only recompute when weights change
if(heatW1===w1&&heatW2===w2&&heatB===b&&heatCache)return heatCache;
let step=10,imgData=ctx.createImageData(750,380);
for(let py=0;py<380;py+=step)for(let px=0;px<750;px+=step){
let z=rawZ(px,py);
// Sigmoid-like mapping for smooth color
let sig=1/(1+Math.exp(-z*3));
let r,g,bl,a;
if(sig>=0.5){// Blue side (class +1)
let t=(sig-0.5)*2;r=Math.round(20+36*t);g=Math.round(20+150*t);bl=Math.round(30+218*t);a=Math.round(8+55*t)}
else{// Red side (class -1)
let t=(0.5-sig)*2;r=Math.round(20+235*t);g=Math.round(20+87*t);bl=Math.round(30+77*t);a=Math.round(8+55*t)}
for(let dy=0;dy<step&&py+dy<380;dy++)for(let dx=0;dx<step&&px+dx<750;dx++){
let idx=((py+dy)*750+(px+dx))*4;imgData.data[idx]=r;imgData.data[idx+1]=g;imgData.data[idx+2]=bl;imgData.data[idx+3]=a}}
heatW1=w1;heatW2=w2;heatB=b;heatCache=imgData;return imgData}
function draw(){ctx.clearRect(0,0,750,520);
// === MAIN PLOT (top 380px) ===
// Grid
for(let i=0;i<750;i+=75){ctx.strokeStyle='#1a1a2a';ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,380);ctx.stroke()}
for(let i=0;i<380;i+=75){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(750,i);ctx.stroke()}
// Smooth gradient heatmap (only after training starts)
if(ep>0){let img=drawHeatmap();ctx.putImageData(img,0,0)}
// Decision boundary
if(ep>0&&(Math.abs(w1)>1e-8||Math.abs(w2)>1e-8)){
// Draw confidence contours at z=-2,-1,0,+1,+2
[-2,-1,0,1,2].forEach((zv,ci)=>{
let isMain=zv===0;
ctx.save();
if(isMain){ctx.shadowColor='#ffd166';ctx.shadowBlur=18;ctx.strokeStyle='#ffd166';ctx.lineWidth=3}
else{ctx.strokeStyle=zv>0?'rgba(56,189,248,'+(0.15+ci*0.05)+')':'rgba(255,107,107,'+(0.15+(4-ci)*0.05)+')';ctx.lineWidth=1;ctx.setLineDash([4,4])}
ctx.beginPath();
if(Math.abs(w2)>1e-8){let y0=-(w1*nx(0)+b-zv)/w2*380;let y1=-(w1*nx(750)+b-zv)/w2*380;ctx.moveTo(0,y0);ctx.lineTo(750,y1)}
else{let xv=(-b+zv)/w1*750;ctx.moveTo(xv,0);ctx.lineTo(xv,380)}
ctx.stroke();ctx.setLineDash([]);ctx.restore();
// Labels on confidence contours
if(!isMain&&Math.abs(w2)>1e-8){let lx=zv>0?650:80;let ly=-(w1*nx(lx)+b-zv)/w2*380;
if(ly>15&&ly<370){ctx.fillStyle=zv>0?'rgba(56,189,248,0.5)':'rgba(255,107,107,0.5)';ctx.font='500 8px Fira Code';ctx.fillText('z='+zv,lx,ly-5)}}})}
// Gradient arrows on each point (showing error direction)
if(ep>0){pts.forEach(p=>{let z=rawZ(p.x,p.y);let err=p.c-z;
if(Math.abs(err)<0.05)return;// skip if error tiny
let arrowLen=clamp(Math.abs(err)*25,5,40);
// Arrow direction = gradient direction (toward reducing error)
let gx=err*nx(p.x),gy=err*ny(p.y);
let gLen=Math.hypot(gx,gy);if(gLen<1e-6)return;
gx=gx/gLen*arrowLen;gy=gy/gLen*arrowLen;
// Map gradient to screen direction
let ax=gx*300,ay=gy*300;let aLen=Math.hypot(ax,ay);
if(aLen>40){ax=ax/aLen*40;ay=ay/aLen*40}
if(aLen<3)return;
ctx.save();ctx.globalAlpha=clamp(Math.abs(err)*0.6,0.15,0.7);
ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+ax,p.y+ay);ctx.stroke();
// Arrowhead
let angle=Math.atan2(ay,ax);let hs=5;
ctx.fillStyle='#ffd166';ctx.beginPath();
ctx.moveTo(p.x+ax,p.y+ay);
ctx.lineTo(p.x+ax-hs*Math.cos(angle-0.5),p.y+ay-hs*Math.sin(angle-0.5));
ctx.lineTo(p.x+ax-hs*Math.cos(angle+0.5),p.y+ay-hs*Math.sin(angle+0.5));
ctx.fill();ctx.restore()})}
// Points with glow + error ring
pts.forEach(p=>{let pred=predict(p.x,p.y);let wrong=(p.c===-1&&pred!==p.c)||(p.c===1&&pred!==p.c);
let z=rawZ(p.x,p.y);let errMag=Math.abs(p.c-z);
ctx.save();
// Error aura — bigger = more error (continuous visualization!)
if(ep>0&&errMag>0.1){
let auraR=clamp(errMag*12,8,35);
ctx.beginPath();ctx.arc(p.x,p.y,auraR,0,TAU);
ctx.fillStyle=wrong?'rgba(255,209,102,'+clamp(errMag*0.12,0.03,0.2)+')':'rgba(52,211,153,0.03)';ctx.fill()}
// Point
if(!wrong){ctx.shadowColor=p.c===1?'#38bdf8':'#ff6b6b';ctx.shadowBlur=10}
ctx.beginPath();ctx.arc(p.x,p.y,wrong?9:7,0,TAU);ctx.fillStyle=p.c===1?'#38bdf8':'#ff6b6b';ctx.fill();
if(wrong){ctx.strokeStyle='#ffd166';ctx.lineWidth=2.5;ctx.stroke();
// Pulsing ring for misclassified
ctx.beginPath();ctx.arc(p.x,p.y,12+Math.sin(Date.now()/200)*3,0,TAU);
ctx.strokeStyle='rgba(255,209,102,0.3)';ctx.lineWidth=1;ctx.stroke()}
ctx.restore()});
// === INFO PANEL (top-left) ===
ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(8,8,260,75,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='700 13px Fira Code';ctx.fillText('Adaline — Epoch '+ep,18,28);
let errs=pts.filter(p=>predict(p.x,p.y)!==(p.c>=0?1:-1)).length;
ctx.fillStyle=errs>0?'#ff6b6b':'#34d399';ctx.font='600 11px Fira Code';
ctx.fillText(errs>0?'Errors: '+errs+'/'+pts.length:'✅ All correct!',18,48);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
ctx.fillText('w₁='+w1.toFixed(3)+' w₂='+w2.toFixed(3)+' b='+b.toFixed(3),18,64);
ctx.fillText('lr='+lr.toFixed(2)+'  |  '+pts.length+' points',18,78);
// === BOTTOM PANELS (380px – 520px) ===
let panelY=388;
// --- Loss Curve Panel (left) ---
ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(8,panelY,240,125,10);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='700 11px Fira Code';ctx.fillText('Loss (MSE) — Smooth Descent',18,panelY+18);
if(losses.length>1){let mx=Math.max(...losses),mn=Math.min(...losses);if(mx===mn)mx=mn+1;
let gx=18,gy=panelY+28,gw=220,gh=60;
// Gradient fill under curve
let grad=ctx.createLinearGradient(gx,gy,gx,gy+gh);grad.addColorStop(0,'rgba(255,107,107,0.25)');grad.addColorStop(1,'rgba(255,107,107,0)');
ctx.beginPath();losses.forEach((l,i)=>{let x=gx+i*gw/300,y=gy+(1-(l-mn)/(mx-mn))*gh;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
let lastX=gx+(losses.length-1)*gw/300;ctx.lineTo(lastX,gy+gh);ctx.lineTo(gx,gy+gh);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
// Line
ctx.strokeStyle='#ff6b6b';ctx.lineWidth=2;ctx.beginPath();
losses.forEach((l,i)=>{let x=gx+i*gw/300,y=gy+(1-(l-mn)/(mx-mn))*gh;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
// Glow dot at end
let lastY=gy+(1-(losses[losses.length-1]-mn)/(mx-mn))*gh;
ctx.save();ctx.shadowColor='#ff6b6b';ctx.shadowBlur=10;
ctx.beginPath();ctx.arc(lastX,lastY,4,0,TAU);ctx.fillStyle='#ff6b6b';ctx.fill();ctx.restore()}
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
if(losses.length)ctx.fillText('Current MSE: '+losses[losses.length-1].toFixed(4),18,panelY+105);
ctx.fillStyle='#34d399';ctx.font='400 8px Fira Code';
ctx.fillText('↑ Smooth curve = continuous gradient!',18,panelY+118);
// --- Weight Trajectory Panel (center) ---
let wx=258,ww=160;
ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(wx,panelY,ww,125,10);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='700 10px Fira Code';ctx.fillText('Weight Space',wx+10,panelY+16);
if(wHist.length>1){
let allW1=wHist.map(h=>h.w1),allW2=wHist.map(h=>h.w2);
let minW1=Math.min(...allW1)-.5,maxW1=Math.max(...allW1)+.5;
let minW2=Math.min(...allW2)-.5,maxW2=Math.max(...allW2)+.5;
if(maxW1-minW1<1){minW1-=0.5;maxW1+=0.5}if(maxW2-minW2<1){minW2-=0.5;maxW2+=0.5}
let mapX=v=>wx+12+(v-minW1)/(maxW1-minW1)*(ww-24);
let mapY=v=>panelY+25+(v-minW2)/(maxW2-minW2)*80;
// Trail with fading
ctx.lineWidth=1.5;ctx.beginPath();
wHist.forEach((h,i)=>{let x=mapX(h.w1),y=mapY(h.w2);
if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)});
ctx.strokeStyle='rgba(167,139,250,0.5)';ctx.stroke();
// Dots with gradient from start to end
wHist.forEach((h,i)=>{if(i%Math.max(1,Math.floor(wHist.length/30))!==0&&i!==wHist.length-1)return;
let x=mapX(h.w1),y=mapY(h.w2);let t=i/(wHist.length-1);
ctx.beginPath();ctx.arc(x,y,i===wHist.length-1?4:2,0,TAU);
ctx.fillStyle=i===wHist.length-1?'#ffd166':'rgba(167,139,250,'+(0.2+t*0.8)+')';ctx.fill()});
// Current point glow
let last=wHist[wHist.length-1];
ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=12;ctx.beginPath();
ctx.arc(mapX(last.w1),mapY(last.w2),5,0,TAU);ctx.fillStyle='#ffd166';ctx.fill();ctx.restore()}
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
ctx.fillText('w₁ →',wx+10,panelY+118);ctx.fillText('w₂ ↓',wx+ww-30,panelY+118);
ctx.fillStyle='#a78bfa66';ctx.fillText('Trajectory = gradient path',wx+50,panelY+118);
// --- Architecture + Key Difference Panel (right) ---
let rx=428,rw=314;
ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(rx,panelY,rw,125,10);ctx.fill();
// Adaline neuron diagram (compact)
ctx.fillStyle='#a78bfa';ctx.font='700 10px Fira Code';ctx.fillText('Adaline Architecture',rx+10,panelY+16);
// Inputs
[{l:'x₁',y:panelY+38},{l:'x₂',y:panelY+62},{l:'1',y:panelY+86}].forEach(n=>{
ctx.beginPath();ctx.arc(rx+28,n.y,10,0,TAU);ctx.fillStyle='#38bdf822';ctx.fill();
ctx.strokeStyle='#38bdf8';ctx.lineWidth=1;ctx.stroke();
ctx.fillStyle='#38bdf8';ctx.font='600 9px Fira Code';ctx.textAlign='center';ctx.fillText(n.l,rx+28,n.y+3);ctx.textAlign='left'});
// Arrows to sum
ctx.strokeStyle='#4a475a';ctx.lineWidth=1;
[panelY+38,panelY+62,panelY+86].forEach(y=>{ctx.beginPath();ctx.moveTo(rx+38,y);ctx.lineTo(rx+80,panelY+58);ctx.stroke()});
ctx.fillStyle='#ffd166';ctx.font='500 7px Fira Code';ctx.fillText('w₁',rx+48,panelY+38);ctx.fillText('w₂',rx+48,panelY+62);ctx.fillText('b',rx+48,panelY+82);
// Sum node
ctx.beginPath();ctx.arc(rx+92,panelY+58,14,0,TAU);ctx.fillStyle='#ffd16622';ctx.fill();
ctx.strokeStyle='#ffd166';ctx.lineWidth=1.5;ctx.stroke();
ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.textAlign='center';ctx.fillText('Σ',rx+92,panelY+62);ctx.textAlign='left';
// Raw output z
ctx.strokeStyle='#34d399';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(rx+106,panelY+58);ctx.lineTo(rx+135,panelY+58);ctx.stroke();
ctx.fillStyle='#34d399';ctx.font='700 9px Fira Code';ctx.fillText('z',rx+138,panelY+62);
// Error computed HERE (before activation)
ctx.save();ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
ctx.beginPath();ctx.moveTo(rx+145,panelY+58);ctx.lineTo(rx+145,panelY+36);ctx.lineTo(rx+190,panelY+36);ctx.stroke();ctx.setLineDash([]);ctx.restore();
ctx.fillStyle='#ff6b6b';ctx.font='700 8px Fira Code';ctx.fillText('error = t − z',rx+150,panelY+30);
ctx.fillStyle='#ff6b6b';ctx.font='400 7px Fira Code';ctx.fillText('← computed HERE!',rx+150,panelY+42);
// Activation → output
ctx.strokeStyle='#4a475a';ctx.beginPath();ctx.moveTo(rx+150,panelY+58);ctx.lineTo(rx+190,panelY+58);ctx.stroke();
// Step function box
ctx.fillStyle='#ffffff11';ctx.beginPath();ctx.roundRect(rx+190,panelY+48,40,20,4);ctx.fill();
ctx.strokeStyle='#7d7a8c';ctx.beginPath();ctx.roundRect(rx+190,panelY+48,40,20,4);ctx.stroke();
ctx.fillStyle='#7d7a8c';ctx.font='600 8px Fira Code';ctx.textAlign='center';ctx.fillText('sign()',rx+210,panelY+62);ctx.textAlign='left';
ctx.strokeStyle='#4a475a';ctx.beginPath();ctx.moveTo(rx+230,panelY+58);ctx.lineTo(rx+260,panelY+58);ctx.stroke();
ctx.fillStyle='#e4e2df';ctx.font='700 9px Fira Code';ctx.fillText('ŷ',rx+264,panelY+62);
// Feedback arrow
ctx.save();ctx.strokeStyle='#ff6b6b88';ctx.lineWidth=1;ctx.setLineDash([3,3]);
ctx.beginPath();ctx.moveTo(rx+170,panelY+36);ctx.lineTo(rx+60,panelY+36);ctx.lineTo(rx+60,panelY+58);
ctx.stroke();ctx.setLineDash([]);ctx.restore();
ctx.fillStyle='#ff6b6b88';ctx.font='400 7px Fira Code';ctx.fillText('Δw = η·err·x',rx+80,panelY+30);
// Key difference box
ctx.fillStyle='rgba(255,209,102,.06)';ctx.beginPath();ctx.roundRect(rx+8,panelY+90,rw-16,28,6);ctx.fill();
ctx.strokeStyle='#ffd16633';ctx.beginPath();ctx.roundRect(rx+8,panelY+90,rw-16,28,6);ctx.stroke();
ctx.fillStyle='#ffd166';ctx.font='700 8px Fira Code';ctx.fillText('KEY:',rx+14,panelY+104);
ctx.fillStyle='#e4e2df';ctx.font='400 8px Fira Code';ctx.fillText('Error on z (continuous) → smooth gradient → stable convergence',rx+46,panelY+104);
ctx.fillStyle='#7d7a8c';ctx.fillText('vs Perceptron: error on ŷ (binary) → no gradient → jumpy updates',rx+46,panelY+116)}
let animating=false;
function drawLoop(){draw();if(animating)requestAnimationFrame(drawLoop)}
const ctrl=addControls(el);
// Learning rate slider
let lrLabel=document.createElement('label');lrLabel.textContent='η';ctrl.appendChild(lrLabel);
let lrSlider=document.createElement('input');lrSlider.type='range';lrSlider.min='1';lrSlider.max='50';lrSlider.value='15';
lrSlider.oninput=e=>{lr=+e.target.value/100;lrVal.textContent=lr.toFixed(2)};ctrl.appendChild(lrSlider);
let lrVal=document.createElement('span');lrVal.className='btn';lrVal.style.cssText='min-width:40px;text-align:center';lrVal.textContent='0.15';ctrl.appendChild(lrVal);
const tb=document.createElement('button');tb.className='btn';tb.textContent='▶ Train ×10';tb.onclick=()=>{for(let i=0;i<10;i++)trainEpoch();heatCache=null;draw()};
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='⏩ Auto Train';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active');animating=false}else{animating=true;tmr=setInterval(()=>{for(let i=0;i<3;i++)trainEpoch();heatCache=null;draw();
let errs2=pts.filter(p=>predict(p.x,p.y)!==(p.c>=0?1:-1)).length;
if(errs2===0&&losses.length>20&&losses[losses.length-1]<0.05){clearInterval(tmr);tmr=null;ab.classList.remove('active');animating=false}},50);ab.classList.add('active')}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{seed();heatCache=null;if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}animating=false;draw()};
ctrl.appendChild(tb);ctrl.appendChild(ab);ctrl.appendChild(rst);draw()
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
