import { $, createCanvas, addHint, addControls, rand, randInt, TAU, dist } from '../lib/shared.js'

// ===== demo-boltz =====
export function mountBoltzmann(containerId = 'demo-boltz') {
  const __id = containerId || 'demo-boltz';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Click neurons to toggle on/off. Watch the energy change. Press Sample to let the network find low-energy states!');
const N=8;let states2=Array(N).fill(0).map(()=>Math.random()>.5?1:0);
let W=Array(N).fill(0).map(()=>Array(N).fill(0));
for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){W[i][j]=rand(-.8,.8);W[j][i]=W[i][j]}
let temp=2.0,energyHist=[];
function energy(){let E=0;for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)E-=W[i][j]*states2[i]*states2[j];return E}
function gibbsStep(){let i=randInt(0,N);let dE=0;
for(let j=0;j<N;j++)if(j!==i)dE+=W[i][j]*states2[j];
let p=1/(1+Math.exp(-2*dE/temp));states2[i]=Math.random()<p?1:0;
energyHist.push(energy());if(energyHist.length>100)energyHist.shift()}
function draw(){ctx.clearRect(0,0,750,320);let E=energy();
let cx2=180,cy2=148,rad=100;
// Connections
for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){let ai=i/N*TAU-Math.PI/2,aj=j/N*TAU-Math.PI/2;
let x1=cx2+Math.cos(ai)*rad,y1=cy2+Math.sin(ai)*rad,x2=cx2+Math.cos(aj)*rad,y2=cy2+Math.sin(aj)*rad;
let w=W[i][j],active=states2[i]&&states2[j];
ctx.strokeStyle=active?(w>0?'rgba(78,205,196,.6)':'rgba(255,107,107,.6)'):(w>0?'rgba(78,205,196,.08)':'rgba(255,107,107,.08)');
ctx.lineWidth=Math.abs(w)*2.5+(active?1.5:0);ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
// Neurons
for(let i=0;i<N;i++){let a=i/N*TAU-Math.PI/2,x=cx2+Math.cos(a)*rad,y=cy2+Math.sin(a)*rad;
ctx.save();if(states2[i]){ctx.shadowColor='#ffd166';ctx.shadowBlur=16}
ctx.beginPath();ctx.arc(x,y,18,0,TAU);ctx.fillStyle=states2[i]?'#ffd166':'#1e1e32';ctx.fill();
ctx.strokeStyle=states2[i]?'#ffd166':'#4a475a';ctx.lineWidth=2;ctx.stroke();ctx.restore();
ctx.fillStyle=states2[i]?'#000':'#7d7a8c';ctx.font='bold 10px Fira Code';ctx.textAlign='center';
ctx.fillText(states2[i]?'ON':'off',x,y+4);ctx.textAlign='left'}
// Energy panel
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(310,12,420,85,10);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='900 26px Fraunces';ctx.fillText('E = '+E.toFixed(2),325,48);
ctx.fillStyle='#7d7a8c';ctx.font='500 9px Fira Code';ctx.fillText('Energy = −Σ wᵢⱼ sᵢ sⱼ',325,66);
ctx.fillText('Lower energy = more probable state',325,82);
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('T = '+temp.toFixed(1),600,48);
ctx.fillText(temp>3?'(exploring)':temp<1?'(frozen)':'(cooling)',600,64);
// Energy history
let chy=110,chh=80,chw=400;
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(310,chy,chw+20,chh+35,10);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('Energy over time:',320,chy+14);
if(energyHist.length>1){let mx2=Math.max(...energyHist),mn=Math.min(...energyHist);if(mx2===mn)mx2=mn+1;
ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.5;ctx.beginPath();
energyHist.forEach((e,i)=>{let x=325+i*(chw-10)/100,y=chy+22+(1-(e-mn)/(mx2-mn))*(chh-10);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()}
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
ctx.fillText('Green = positive weight (agree)',310,chy+chh+24);ctx.fillText('Red = negative weight (disagree)',310,chy+chh+35);
// Bottom
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,280,720,32,6);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='500 9px Fira Code';
ctx.fillText('P(state) ∝ exp(−E/T). Low T = freezes into low-energy states. High T = random exploration.',25,300)}
c.onclick=e=>{let r2=c.getBoundingClientRect(),mx2=(e.clientX-r2.left)*750/r2.width,my=(e.clientY-r2.top)*320/r2.height;
for(let i=0;i<N;i++){let a=i/N*TAU-Math.PI/2,x=180+Math.cos(a)*100,y=148+Math.sin(a)*100;
if(dist(mx2,my,x,y)<22){states2[i]=1-states2[i];energyHist.push(energy());draw();return}}};
const ctrl=addControls(el);
ctrl.innerHTML='<label>Temp</label><input type="range" min="1" max="50" value="20" id="bt"><span id="btv" class="btn" style="min-width:30px;text-align:center">2.0</span>';
$('bt').oninput=e=>{temp=e.target.value/10;$('btv').textContent=temp.toFixed(1);draw()};
const sb=document.createElement('button');sb.className='btn';sb.textContent='▶ Sample ×10';sb.onclick=()=>{for(let i=0;i<10;i++)gibbsStep();draw()};
let tmr=null;const ab=document.createElement('button');ab.className='btn';ab.textContent='⏩ Auto Sample';
ab.onclick=()=>{if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}else{tmr=setInterval(()=>{gibbsStep();draw()},50);ab.classList.add('active')}};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';
rst.onclick=()=>{states2=Array(N).fill(0).map(()=>Math.random()>.5?1:0);energyHist=[];temp=2;$('bt').value=20;$('btv').textContent='2.0';if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')}draw()};
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
