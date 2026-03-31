import { $, createCanvas, addHint, addControls, clamp, TAU } from '../lib/shared.js'

export function mountVae(containerId = 'demo-vae') {
  const __id = containerId || 'demo-vae';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Click a category dot OR hover the latent space. Watch encoder produce \u03bc,\u03c3 and decoder generate from z!');
const G=6,NN=G*G;
const categories=[
  {name:'X',c:'#ff6b6b',z:[-.7,.7],grid:[1,0,0,0,1,0, 0,1,0,1,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,1,0,1,0,0, 1,0,0,0,1,0]},
  {name:'O',c:'#38bdf8',z:[.7,.7],grid:[0,1,1,1,0,0, 1,0,0,0,1,0, 1,0,0,0,1,0, 1,0,0,0,1,0, 1,0,0,0,1,0, 0,1,1,1,0,0]},
  {name:'T',c:'#ffd166',z:[-.7,-.7],grid:[1,1,1,1,1,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,0,1,0,0,0]},
  {name:'+',c:'#a78bfa',z:[.7,-.7],grid:[0,0,1,0,0,0, 0,0,1,0,0,0, 1,1,1,1,1,0, 0,0,1,0,0,0, 0,0,1,0,0,0, 0,0,0,0,0,0]}
];
let curZ=[0,0],hoverActive=false;
function decodeZ(z1,z2){const out=new Float32Array(NN);let wS=0;
  categories.forEach(cat=>{let d=Math.sqrt((z1-cat.z[0])**2+(z2-cat.z[1])**2)+0.01;let w=1/(d*d*d);wS+=w;
    for(let i=0;i<NN;i++) out[i]+=cat.grid[i]*w;});
  for(let i=0;i<NN;i++) out[i]=clamp(out[i]/wS+Math.sin(z1*3+i)*0.05,0,1);return out;}
function draw(){ctx.clearRect(0,0,750,340);
  const z1=curZ[0],z2=curZ[1];
  // 1. ENCODER
  ctx.fillStyle='#38bdf8';ctx.font='700 10px Fira Code';ctx.fillText('1. Encoder',12,16);
  let closest=categories[0],minD=99;
  categories.forEach(c2=>{let d=Math.sqrt((z1-c2.z[0])**2+(z2-c2.z[1])**2);if(d<minD){minD=d;closest=c2;}});
  ctx.fillStyle='#08081a';ctx.beginPath();ctx.roundRect(12,22,54,54,4);ctx.fill();
  for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){let v=closest.grid[r*G+ci]*(1-minD*0.3);
    ctx.fillStyle=v>0.3?closest.c:'#111125';ctx.fillRect(14+ci*8,24+r*8,7,7);}
  ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('input x',12,88);
  ctx.fillStyle='#4a475a';ctx.font='16px sans-serif';ctx.fillText('\u2192',70,52);
  // mu,sigma
  ctx.fillStyle='rgba(56,189,248,.08)';ctx.beginPath();ctx.roundRect(88,22,52,28,4);ctx.fill();
  ctx.strokeStyle='#38bdf866';ctx.beginPath();ctx.roundRect(88,22,52,28,4);ctx.stroke();
  ctx.fillStyle='#38bdf8';ctx.font='600 8px Fira Code';ctx.fillText('\u03bc=('+z1.toFixed(1)+','+z2.toFixed(1)+')',91,40);
  ctx.fillStyle='rgba(56,189,248,.08)';ctx.beginPath();ctx.roundRect(88,54,52,28,4);ctx.fill();
  ctx.strokeStyle='#38bdf866';ctx.beginPath();ctx.roundRect(88,54,52,28,4);ctx.stroke();
  ctx.fillStyle='#38bdf8';ctx.font='600 8px Fira Code';ctx.fillText('\u03c3\u00b2=(0.3,0.3)',91,72);

  // 2. LATENT SPACE
  const lx=148,ly=6,lw=210,lh=175;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(lx,ly,lw,lh,8);ctx.fill();
  ctx.fillStyle='#a78bfa';ctx.font='700 9px Fira Code';ctx.fillText('2. Latent Space (z\u2081,z\u2082)',lx+6,ly+14);
  for(let i=-1;i<=1;i++){let gx2=lx+lw/2+i*(lw/4),gy2=ly+lh/2+i*(lh/4);
    ctx.strokeStyle='#1e1e32';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(gx2,ly+20);ctx.lineTo(gx2,ly+lh-4);ctx.stroke();
    ctx.beginPath();ctx.moveTo(lx+4,gy2);ctx.lineTo(lx+lw-4,gy2);ctx.stroke();}
  categories.forEach(cat=>{let cx2=lx+lw/2+cat.z[0]/1.2*(lw/2-12),cy2=ly+lh/2-cat.z[1]/1.2*(lh/2-18);
    let gr=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,35);gr.addColorStop(0,cat.c+'33');gr.addColorStop(1,cat.c+'00');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx2,cy2,35,0,TAU);ctx.fill();
    ctx.fillStyle=cat.c;ctx.font='600 9px Fira Code';ctx.textAlign='center';ctx.fillText(cat.name,cx2,cy2+4);ctx.textAlign='left';
    const ms=3;for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){
      if(cat.grid[r*G+ci]>0.5){ctx.fillStyle=cat.c+'55';ctx.fillRect(cx2-9+ci*ms,cy2+8+r*ms,ms-1,ms-1);}}});
  let zx=lx+lw/2+z1/1.2*(lw/2-12),zy=ly+lh/2-z2/1.2*(lh/2-18);
  ctx.save();ctx.shadowColor='#fff';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(zx,zy,5,0,TAU);ctx.fillStyle='#fff';ctx.fill();ctx.restore();
  ctx.fillStyle='#e4e2df';ctx.font='500 7px Fira Code';ctx.fillText('z=('+z1.toFixed(1)+','+z2.toFixed(1)+')',zx+7,zy-4);

  // Arrow
  ctx.fillStyle='#4a475a';ctx.font='16px sans-serif';ctx.fillText('\u2192',lx+lw+3,ly+lh/2);

  // 3. DECODER + OUTPUT (fits within 750)
  const dx=374;
  ctx.fillStyle='#4ecdc4';ctx.font='700 9px Fira Code';ctx.fillText('3. Decode',dx,16);
  ctx.fillStyle='rgba(78,205,196,.06)';ctx.beginPath();ctx.roundRect(dx,22,50,54,4);ctx.fill();
  ctx.strokeStyle='#4ecdc466';ctx.beginPath();ctx.roundRect(dx,22,50,54,4);ctx.stroke();
  ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('z\u2192x\u0302',dx+8,50);ctx.fillText('net',dx+14,64);
  ctx.fillStyle='#4a475a';ctx.font='16px sans-serif';ctx.fillText('\u2192',dx+55,52);
  // Output grid
  const outX=dx+72,outSz=14;
  ctx.fillStyle='#4ecdc4';ctx.font='700 9px Fira Code';ctx.fillText('Output x\u0302',outX,16);
  const decoded=decodeZ(z1,z2);
  ctx.fillStyle='#08081a';ctx.beginPath();ctx.roundRect(outX-2,20,G*outSz+4,G*outSz+4,4);ctx.fill();
  for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){let v=decoded[r*G+ci];
    ctx.fillStyle='rgba(78,205,196,'+clamp(v,0.04,1).toFixed(2)+')';ctx.fillRect(outX+ci*outSz,22+r*outSz,outSz-1,outSz-1);}

  // Large comparison: Input vs Output
  const cmpX=outX+G*outSz+14;
  ctx.fillStyle='#ffd166';ctx.font='600 8px Fira Code';ctx.fillText('Compare:',cmpX,16);
  ctx.fillStyle='#38bdf8';ctx.font='400 7px Fira Code';ctx.fillText('In',cmpX,28);
  for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){let v2=closest.grid[r*G+ci]*(1-minD*0.3);
    ctx.fillStyle=v2>0.3?'#38bdf8':'#0e0e20';ctx.fillRect(cmpX+14+ci*7,20+r*7,6,6);}
  ctx.fillStyle='#4ecdc4';ctx.font='400 7px Fira Code';ctx.fillText('Out',cmpX+62,28);
  for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){let v2=decoded[r*G+ci];
    ctx.fillStyle='rgba(78,205,196,'+clamp(v2,0.04,1).toFixed(2)+')';ctx.fillRect(cmpX+62+14+ci*7,20+r*7,6,6);}

  // 4. Interpolation strip
  const stripY=ly+lh+12;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(12,stripY,726,68,8);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Key insight: smooth latent space = smooth interpolation!',22,stripY+14);
  const nSteps=12;
  for(let s=0;s<nSteps;s++){let t=s/(nSteps-1);
    let iz1=categories[0].z[0]*(1-t)+categories[1].z[0]*t,iz2=categories[0].z[1]*(1-t)+categories[1].z[1]*t;
    let interp=decodeZ(iz1,iz2);let sx=22+s*42,sy=stripY+22;
    for(let r=0;r<G;r++) for(let ci=0;ci<G;ci++){let v=interp[r*G+ci];
      let col=t<0.5?categories[0].c:categories[1].c;
      ctx.fillStyle=col+(Math.round(clamp(v,0.04,1)*220).toString(16).padStart(2,'0'));
      ctx.fillRect(sx+ci*5,sy+r*5,4,4);}}
  ctx.fillStyle='#ff6b6b';ctx.font='600 8px Fira Code';ctx.fillText('X',22,stripY+60);
  ctx.fillStyle='#7d7a8c';ctx.fillText('\u2190 interpolate in latent space \u2192',200,stripY+60);
  ctx.fillStyle='#38bdf8';ctx.fillText('O',520,stripY+60);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('KL loss \u2192 smooth space',555,stripY+42);
  ctx.fillText('Nearby z = similar x\u0302',555,stripY+58);

  // Bottom
  const exY=stripY+76;
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(12,exY,726,46,8);ctx.fill();
  ctx.fillStyle='#a78bfa';ctx.font='600 9px Fira Code';ctx.fillText('Loss = Reconstruction (x\u0302\u2248x) + KL Divergence (keep latent smooth & Gaussian)',22,exY+16);
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
  ctx.fillText('Reparameterization trick: z=\u03bc+\u03c3\u00b7\u03b5 (\u03b5~N(0,1)) makes sampling differentiable \u2192 can backprop through sampling!',22,exY+34);
}
c.onmousemove=e=>{let r=c.getBoundingClientRect();let mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*340/r.height;
  if(mx>=148&&mx<=358&&my>=6&&my<=181){curZ[0]=((mx-148-105)/105*1.2);curZ[1]=-((my-6-87.5)/87.5*1.2);
    curZ[0]=clamp(curZ[0],-1.2,1.2);curZ[1]=clamp(curZ[1],-1.2,1.2);hoverActive=true;draw();}
  else if(hoverActive){hoverActive=false;}};
c.onclick=e=>{let r=c.getBoundingClientRect();let mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*340/r.height;
  categories.forEach(cat=>{let cx2=148+210/2+cat.z[0]/1.2*(210/2-12),cy2=6+175/2-cat.z[1]/1.2*(175/2-18);
    if(Math.abs(mx-cx2)<25&&Math.abs(my-cy2)<25){curZ=[cat.z[0],cat.z[1]];draw();}});};
const ctrl=addControls(el);
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';
rst.onclick=()=>{curZ=[0,0];draw();};ctrl.appendChild(rst);draw()
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
