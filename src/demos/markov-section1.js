import { $, createCanvas, addHint, addControls, TAU, dist } from '../lib/shared.js'

// ===== demo-markov =====
export function mountMarkov(containerId = 'demo-markov') {
  const __id = containerId || 'demo-markov';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Click states to start. Watch the particle bounce between states — frequency bars converge to the steady-state distribution!');
const states=[{name:'Sunny',emoji:'☀️',x:160,y:90,c:'#ffd166'},{name:'Cloudy',emoji:'☁️',x:590,y:90,c:'#94a3b8'},{name:'Rainy',emoji:'🌧️',x:375,y:250,c:'#38bdf8'}];
const trans=[[.6,.3,.1],[.2,.4,.4],[.3,.3,.4]];
let cur=0,history=[0],visits=[1,0,0],animT=0,animFrom=-1,animTo=-1,animating=false;
function draw(){ctx.clearRect(0,0,750,340);
// Draw transition arrows
trans.forEach((row,i)=>row.forEach((p,j)=>{if(p<.05)return;
let si=states[i],sj=states[j];
if(i===j){let ax=si.x,ay=si.y-48;
ctx.strokeStyle=i===cur?si.c:si.c+'44';ctx.lineWidth=1+p*4;
ctx.beginPath();ctx.arc(ax,ay,20,0.3*Math.PI,0.7*Math.PI);ctx.stroke();
ctx.fillStyle=i===cur?si.c:'#4a475a';ctx.font='700 10px Fira Code';ctx.textAlign='center';ctx.fillText((p*100|0)+'%',ax,ay-24);ctx.textAlign='left';
}else{let dx=sj.x-si.x,dy=sj.y-si.y,len=Math.hypot(dx,dy);
let nx=dx/len,ny=dy/len,ox=-ny*14,oy=nx*14;
let sx=si.x+nx*44+ox,sy=si.y+ny*44+oy,ex=sj.x-nx*44+ox,ey=sj.y-ny*44+oy;
let isActive=i===cur||animFrom===i&&animTo===j;
ctx.strokeStyle=isActive?si.c+'aa':si.c+'22';ctx.lineWidth=isActive?2+p*4:1+p*2;
ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
let aLen=10;ctx.fillStyle=isActive?si.c+'cc':si.c+'44';ctx.beginPath();ctx.moveTo(ex,ey);
ctx.lineTo(ex-aLen*nx+aLen*.4*ny,ey-aLen*ny-aLen*.4*nx);ctx.lineTo(ex-aLen*nx-aLen*.4*ny,ey-aLen*ny+aLen*.4*nx);ctx.fill();
ctx.fillStyle=isActive?'#e4e2df':'#4a475a';ctx.font=(isActive?'700':'500')+' 10px Fira Code';ctx.textAlign='center';
ctx.fillText((p*100|0)+'%',(sx+ex)/2+ox*.6,(sy+ey)/2+oy*.6);ctx.textAlign='left'}}));
// Animated particle
if(animating&&animFrom>=0&&animTo>=0){let si=states[animFrom],sj=states[animTo];
let px=si.x+(sj.x-si.x)*animT,py=si.y+(sj.y-si.y)*animT;
ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=20;ctx.beginPath();ctx.arc(px,py,8,0,TAU);
ctx.fillStyle='#ffd166';ctx.fill();ctx.restore()}
// Draw state circles
states.forEach((s,i)=>{let isCur=i===cur&&!animating;
ctx.save();if(isCur){ctx.shadowColor=s.c;ctx.shadowBlur=25}
ctx.beginPath();ctx.arc(s.x,s.y,isCur?42:36,0,TAU);
ctx.fillStyle=isCur?s.c+'22':'#0a0a14';ctx.fill();
ctx.strokeStyle=isCur?s.c:s.c+'55';ctx.lineWidth=isCur?3:1.5;ctx.stroke();ctx.restore();
ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText(s.emoji,s.x,s.y-2);
ctx.fillStyle=isCur?'#fff':s.c;ctx.font=(isCur?'700':'500')+' 11px Fira Code';
ctx.fillText(s.name,s.x,s.y+22);ctx.textAlign='left'});
// Visit frequency panel
let fx=15,fy=295;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(fx,fy-8,470,48,8);ctx.fill();
let totalV=visits.reduce((a,b)=>a+b,0)||1;
ctx.fillStyle='#7d7a8c';ctx.font='500 9px Fira Code';ctx.fillText('Visit frequency ('+totalV+' steps):',fx+8,fy+6);
states.forEach((s,i)=>{let x=fx+8+i*155,y=fy+14,pct=visits[i]/totalV;
ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(x,y,120,16,3);ctx.fill();
ctx.fillStyle=s.c;ctx.beginPath();ctx.roundRect(x,y,120*pct,16,3);ctx.fill();
ctx.fillStyle='#e4e2df';ctx.font='600 8px Fira Code';ctx.fillText(s.name+' '+(pct*100).toFixed(1)+'%',x+4,y+12)});
// History trail
let hx=500,hy=fy-8;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(hx,hy,240,48,8);ctx.fill();
ctx.fillStyle='#4a475a';ctx.font='400 8px Fira Code';ctx.fillText('Recent path:',hx+8,hy+12);
let visH=history.slice(-12);
visH.forEach((h,i)=>{let x=hx+8+i*19,y=hy+20;
ctx.fillStyle=states[h].c;ctx.font='12px sans-serif';ctx.fillText(states[h].emoji,x,y+10)})}
function step(){let prev2=cur,probs=trans[cur],r=Math.random(),cum=0;
for(let i=0;i<probs.length;i++){cum+=probs[i];if(r<=cum){cur=i;break}}
history.push(cur);visits[cur]++;
// Animate transition
animFrom=prev2;animTo=cur;animating=true;animT=0;
let anim=()=>{animT+=.08;if(animT>=1){animating=false;animFrom=-1;animTo=-1;draw();return}draw();requestAnimationFrame(anim)};anim()}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*340/r.height;
states.forEach((s,i)=>{if(dist(mx,my,s.x,s.y)<44){cur=i;history=[i];visits=[0,0,0];visits[i]=1;draw()}})};
const ctrl=addControls(el);
const sb=document.createElement('button');sb.className='btn';sb.textContent='▶ Step';sb.onclick=step;
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='⏩ Auto';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}else{tmr=setInterval(step,500);ab.classList.add('active')}};
const fb=document.createElement('button');fb.className='btn';fb.textContent='⏩ ×100';fb.onclick=()=>{for(let i=0;i<100;i++){let probs=trans[cur],r=Math.random(),cum=0;for(let j=0;j<probs.length;j++){cum+=probs[j];if(r<=cum){cur=j;break}}history.push(cur);visits[cur]++}draw()};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{cur=0;history=[0];visits=[1,0,0];if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
ctrl.appendChild(sb);ctrl.appendChild(ab);ctrl.appendChild(fb);ctrl.appendChild(rst);draw()
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
