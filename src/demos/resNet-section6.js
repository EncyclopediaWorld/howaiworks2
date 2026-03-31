import { $, createCanvas, addHint, addControls, clamp, TAU } from '../lib/shared.js'

export function mountResnet(containerId = 'demo-resnet') {
  const __id = containerId || 'demo-resnet';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 300);
addHint(el,'Toggle skip connections on/off. Watch gradient dots flow (or vanish!) through the network.');
let skipOn=true,depth=8,animT=0,animId=null;
function startGradAnim(){animT=0;if(animId)cancelAnimationFrame(animId);
  (function tick(){animT+=0.008;draw();if(animT<2)animId=requestAnimationFrame(tick);else{animId=null;draw();}})();}
function draw(){ctx.clearRect(0,0,750,300);
let bx=50,by=45,bw=75,bh=45,gap=5;
for(let i=0;i<depth;i++){let x=bx+i*(bw+gap),y=by;
let grad=skipOn?1-i*0.05:Math.max(1-i*0.25,0.02);
ctx.fillStyle='rgba(167,139,250,'+(grad*.15).toFixed(2)+')';ctx.beginPath();ctx.roundRect(x,y,bw,bh,6);ctx.fill();
ctx.strokeStyle='rgba(167,139,250,'+(grad*.8+.2).toFixed(2)+')';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,bw,bh,6);ctx.stroke();
ctx.fillStyle='rgba(228,226,223,'+grad.toFixed(2)+')';ctx.font='600 9px Fira Code';ctx.textAlign='center';ctx.fillText('Block '+(i+1),x+bw/2,y+18);
ctx.fillStyle='rgba(125,122,140,'+grad.toFixed(2)+')';ctx.font='400 7px Fira Code';ctx.fillText('F(x)',x+bw/2,y+32);
// Gradient bar
ctx.fillStyle='#111120';ctx.fillRect(x+5,y+bh+5,bw-10,8);
ctx.fillStyle=grad>.3?'#34d399':'#ff6b6b';ctx.fillRect(x+5,y+bh+5,(bw-10)*grad,8);
ctx.fillStyle='#7d7a8c';ctx.font='400 6px Fira Code';ctx.fillText('grad: '+(grad*100|0)+'%',x+bw/2,y+bh+20);ctx.textAlign='left';
// Skip connections
if(skipOn&&i%2===0&&i+2<=depth){let sx=x+bw/2,ex=Math.min(x+(bw+gap)*2+bw/2,bx+(depth-1)*(bw+gap)+bw/2);
ctx.strokeStyle='#ffd16688';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.beginPath();
ctx.moveTo(sx,y);ctx.quadraticCurveTo((sx+ex)/2,y-28,ex,y);ctx.stroke();ctx.setLineDash([]);
ctx.fillStyle='#ffd166';ctx.font='bold 12px Fira Code';ctx.textAlign='center';ctx.fillText('+',ex,y-5);ctx.textAlign='left';}
if(i<depth-1){ctx.fillStyle='#4a475a';ctx.font='10px sans-serif';ctx.fillText('\u2192',x+bw+1,y+bh/2+4);}}
// Animated gradient dots flowing backward (right to left)
if(animT>0){
  let nDots=skipOn?18:10;
  for(let d=0;d<nDots;d++){
    // Each dot has a phase offset
    let phase=(animT-d*0.06)%1.0;
    if(phase<0||phase>1)continue;
    let totalW=depth*(bw+gap);
    // Gradient flows RIGHT TO LEFT (backprop)
    let dotX=bx+totalW-(phase*totalW);
    // Which block is this dot in?
    let blockIdx=Math.floor((bx+totalW-dotX)/(bw+gap));
    blockIdx=clamp(blockIdx,0,depth-1);
    let grad=skipOn?1-blockIdx*0.05:Math.max(1-blockIdx*0.25,0.02);
    let alpha=grad*0.9;
    if(alpha<0.05)continue;
    // Main path dot
    let dotY=by+bh/2;
    ctx.save();ctx.shadowColor=skipOn?'#34d399':'#ff6b6b';ctx.shadowBlur=8;
    ctx.beginPath();ctx.arc(dotX,dotY,3+grad*2,0,TAU);
    ctx.fillStyle=skipOn?'rgba(52,211,153,'+alpha.toFixed(2)+')':'rgba(255,107,107,'+alpha.toFixed(2)+')';
    ctx.fill();ctx.restore();
    // Skip path dots (some dots travel along skip arcs)
    if(skipOn&&d%3===0){
      let skipPhase=((animT-d*0.06)*0.7)%1;
      if(skipPhase>0&&skipPhase<1){
        let si=Math.floor(d/3)%4*2; // skip from block si to si+2
        if(si+2<=depth){
          let sx2=bx+si*(bw+gap)+bw/2,ex2=Math.min(bx+(si+2)*(bw+gap)+bw/2,bx+(depth-1)*(bw+gap)+bw/2);
          let t=skipPhase;
          let spx=(1-t)*ex2+t*sx2; // right to left
          let spy=by-28+28*4*(t-0.5)*(t-0.5); // arc
          ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=6;
          ctx.beginPath();ctx.arc(spx,spy,3,0,TAU);ctx.fillStyle='rgba(255,209,102,'+(.7).toFixed(2)+')';ctx.fill();ctx.restore();
        }
      }
    }
  }
}
// Info box
let fy=132;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,fy,720,55,10);ctx.fill();
ctx.fillStyle=skipOn?'#ffd166':'#ff6b6b';ctx.font='700 12px Fira Code';
ctx.fillText(skipOn?'output = F(x) + x  \u2190 skip connection':'output = F(x)  \u2190 no skip (plain)',25,fy+20);
ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
ctx.fillText(skipOn?'Gradient flows through BOTH F(x) path AND identity shortcut. Even if F(x) vanishes, +x path survives!':
'Gradient must pass through ALL layers sequentially. After many layers \u2192 vanishing gradient problem.',25,fy+38);
ctx.fillStyle='#7d7a8c';ctx.fillText(skipOn?'ResNet-152 won ImageNet 2015. Skip connections allow 100+ layers!':'Without skips, networks >20 layers become untrainable.',25,fy+52);
// Gradient comparison
ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,200,720,92,10);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='600 10px Fira Code';ctx.fillText('Gradient strength at each layer (backprop):',25,218);
['Layer 1','Layer 4','Layer 8'].forEach((l,li)=>{let y2=228+li*20;
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText(l,25,y2+10);
ctx.fillStyle='#111120';ctx.fillRect(100,y2,200,14);ctx.fillRect(410,y2,200,14);
let gs=[1,.8,.6],gn=[1,.25,.02];
ctx.fillStyle='#34d399';ctx.beginPath();ctx.roundRect(100,y2,200*gs[li],14,2);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.beginPath();ctx.roundRect(410,y2,200*gn[li],14,2);ctx.fill();});
ctx.fillStyle='#34d399';ctx.font='600 8px Fira Code';ctx.fillText('With Skip (ResNet)',100,226);
ctx.fillStyle='#ff6b6b';ctx.fillText('Without Skip (Plain)',410,226);}
const ctrl=addControls(el);
const tog=document.createElement('button');tog.className='btn active';tog.textContent='\u2705 Skip ON';
tog.onclick=()=>{skipOn=!skipOn;tog.textContent=skipOn?'\u2705 Skip ON':'\u274c Skip OFF';tog.classList.toggle('active');startGradAnim();};
const ga=document.createElement('button');ga.className='btn';ga.textContent='\u26a1 Flow Gradient';ga.onclick=startGradAnim;
ctrl.appendChild(tog);ctrl.appendChild(ga);draw()
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
