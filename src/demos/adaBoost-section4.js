import { $, createCanvas, addHint, addControls, rand, TAU } from '../lib/shared.js'

export function mountAda(containerId = 'demo-ada') {
  const __id = containerId || 'demo-ada';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 480);
addHint(el,'Click "+1 Round" to add a weak learner. Watch: (1) bigger circles = higher weight, (2) each stump targets hardest mistakes, (3) ensemble accuracy climbs.');

const DW2=280,DH2=200;
let pts=[],stumps=[],round=0;

function seedPts(){
  pts=[];stumps=[];round=0;
  for(let i=0;i<14;i++){pts.push({x:rand(15,DW2*.45),y:rand(15,DH2-15),c:0,w:1});
    pts.push({x:rand(DW2*.55,DW2-15),y:rand(15,DH2-15),c:1,w:1})}
  for(let i=0;i<5;i++){pts.push({x:rand(DW2*.3,DW2*.7),y:rand(15,DH2*.45),c:0,w:1});
    pts.push({x:rand(DW2*.3,DW2*.7),y:rand(DH2*.55,DH2-15),c:1,w:1})}
  const n=pts.length;pts.forEach(p=>p.w=1/n);
}
seedPts();

function addStump(){
  round++;
  const totalW=pts.reduce((a,p)=>a+p.w,0);
  let bestErr=Infinity,bestStump=null;
  for(const axis of['x','y']){
    const vals=pts.map(p=>p[axis]).sort((a,b)=>a-b);
    for(let q=.08;q<=.92;q+=.04){const v=vals[Math.floor(vals.length*q)];
      for(const flip of[0,1]){let err=0;
        pts.forEach(p=>{if((p[axis]<=v?flip:1-flip)!==p.c)err+=p.w});err/=totalW;
        if(err<bestErr){bestErr=err;bestStump={axis,value:v,flip,err}}}}}
  if(!bestStump||bestErr>=.5)return;
  const alpha=.5*Math.log((1-bestErr)/(bestErr+1e-10));
  bestStump.alpha=alpha;bestStump.round=round;stumps.push(bestStump);
  pts.forEach(p=>{const pred=p[bestStump.axis]<=bestStump.value?bestStump.flip:1-bestStump.flip;
    p.w*=Math.exp(alpha*(pred!==p.c?1:-1))});
  const wSum=pts.reduce((a,p)=>a+p.w,0);pts.forEach(p=>p.w/=wSum);
  draw();
}

function ensemblePredict(p){
  if(!stumps.length)return -1;
  let score=0;stumps.forEach(s=>{const pred=p[s.axis]<=s.value?s.flip:1-s.flip;score+=s.alpha*(pred?1:-1)});
  return score>=0?1:0;
}

function drawPts(ox,oy,pw,ph,weighted){
  const maxW=Math.max(...pts.map(p=>p.w),.001);
  pts.forEach(p=>{const px2=ox+p.x/DW2*pw,py2=oy+p.y/DH2*ph;
    const r=weighted?3+p.w/maxW*9:4;
    const wrong=stumps.length>0&&ensemblePredict(p)!==p.c;
    ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(px2,py2,r,0,TAU);
    ctx.fillStyle=p.c===0?'#ff6b6b':'#38bdf8';ctx.fill();ctx.globalAlpha=1;
    if(wrong){ctx.strokeStyle='#ffd166';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px2,py2,r+2,0,TAU);ctx.stroke()}
  });
}

function draw(){
  ctx.clearRect(0,0,750,480);
  const ns=stumps.length;

  // LEFT: Weighted Data
  const lx=10,ly=8,lw=290,lh=230;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(lx,ly,lw,lh,8);ctx.fill();
  ctx.strokeStyle='#ffd16644';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(lx,ly,lw,lh,8);ctx.stroke();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';
  ctx.fillText(ns===0?'Data (equal weights)':'Round '+round+': Weighted Data',lx+8,ly+15);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
  ctx.fillText(ns===0?'All points start with equal weight 1/N':'Bigger = higher weight (harder examples)',lx+8,ly+27);
  // Current stump line
  if(ns>0){const s=stumps[ns-1];
    ctx.strokeStyle='#ffd166aa';ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();
    if(s.axis==='x'){const sx=lx+8+s.value/DW2*(lw-16);ctx.moveTo(sx,ly+32);ctx.lineTo(sx,ly+lh-4)}
    else{const sy=ly+32+s.value/DH2*(lh-36);ctx.moveTo(lx+4,sy);ctx.lineTo(lx+lw-4,sy)}
    ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#ffd166';ctx.font='600 8px Fira Code';
    ctx.fillText('Stump '+ns+': '+s.axis+'\u2264'+s.value.toFixed(0)+' (\u03b1='+(s.alpha).toFixed(2)+')',lx+8,ly+lh-6)}
  drawPts(lx+8,ly+32,lw-16,lh-36,true);

  // RIGHT: Combined Ensemble
  const rx=310,ry=8,rw=290,rh=230;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,8);ctx.fill();
  ctx.strokeStyle='#34d39944';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(rx,ry,rw,rh,8);ctx.stroke();
  ctx.fillStyle='#34d399';ctx.font='700 10px Fira Code';
  ctx.fillText(ns===0?'Ensemble (no stumps yet)':'Ensemble: '+ns+' Stumps Combined',rx+8,ry+15);
  if(ns>0){
    const step=6;
    for(let py2=0;py2<rh-36;py2+=step)for(let px2=0;px2<rw-16;px2+=step){
      let score=0;stumps.forEach(s=>{const val2=s.axis==='x'?px2/(rw-16)*DW2:py2/(rh-36)*DH2;
        const pr=val2<=s.value?s.flip:1-s.flip;score+=s.alpha*(pr?1:-1)});
      const cls=score>=0?1:0,conf=Math.min(Math.abs(score)/2,1),a=.06+conf*.16;
      ctx.fillStyle=cls===0?`rgba(255,107,107,${a})`:`rgba(56,189,248,${a})`;
      ctx.fillRect(rx+8+px2,ry+32+py2,step,step);}
    const acc=pts.filter(p=>ensemblePredict(p)===p.c).length;
    ctx.fillStyle='#34d399';ctx.font='bold 11px Fira Code';
    ctx.fillText('Acc: '+(acc/pts.length*100).toFixed(0)+'%',rx+rw-80,ry+15)}
  drawPts(rx+8,ry+32,rw-16,rh-36,false);

  // FAR RIGHT: Stump Timeline
  const tx=612,ty=8,tw=130,th=230;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(tx,ty,tw,th,8);ctx.fill();
  ctx.strokeStyle='#a78bfa44';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(tx,ty,tw,th,8);ctx.stroke();
  ctx.fillStyle='#a78bfa';ctx.font='700 9px Fira Code';ctx.fillText('Stump Timeline',tx+8,ty+15);
  const ms=Math.min(ns,10);
  for(let i=0;i<ms;i++){
    const si=ns<=10?i:ns-10+i,s=stumps[si],sy2=ty+24+i*19,cur=si===ns-1;
    ctx.fillStyle=cur?'#ffd166':'#4a475a';ctx.beginPath();ctx.arc(tx+14,sy2+6,4,0,TAU);ctx.fill();
    if(i<ms-1){ctx.strokeStyle='#2a2a3e';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx+14,sy2+10);ctx.lineTo(tx+14,sy2+19);ctx.stroke()}
    ctx.fillStyle=cur?'#e4e2df':'#7d7a8c';ctx.font=(cur?'600':'400')+' 8px Fira Code';
    ctx.fillText(s.axis+'\u2264'+s.value.toFixed(0),tx+24,sy2+5);
    const bw3=48,aw=Math.min(s.alpha/2,1)*bw3;
    ctx.fillStyle='#1a1a2e';ctx.beginPath();ctx.roundRect(tx+24,sy2+8,bw3,5,2);ctx.fill();
    ctx.fillStyle=cur?'#ffd166aa':'#a78bfa66';ctx.beginPath();ctx.roundRect(tx+24,sy2+8,aw,5,2);ctx.fill();
    ctx.fillStyle='#7d7a8c';ctx.font='400 6px Fira Code';ctx.fillText('\u03b1='+s.alpha.toFixed(2),tx+76,sy2+13);
  }
  if(ns===0){ctx.fillStyle='#4a475a';ctx.font='400 8px Fira Code';ctx.fillText('No stumps yet.',tx+8,ty+40);ctx.fillText('Click +1 Round',tx+8,ty+54)}

  // BOTTOM: How It Works
  const by=250;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(10,by,730,100,8);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('How AdaBoost Works \u2014 5 Simple Steps:',20,by+18);
  const steps=[
    {ic:'\u2696\ufe0f',t:'Equal Weights',d:'Every point starts at w=1/N',c:'#7d7a8c'},
    {ic:'\ud83e\udeb5',t:'Train Stump',d:'Find best single split line',c:'#ffd166'},
    {ic:'\ud83d\udcca',t:'Score Stump',d:'\u03b1 = \u00bdln((1-err)/err)',c:'#a78bfa'},
    {ic:'\u2b06\ufe0f',t:'Re-weight',d:'Wrong pts get bigger weights',c:'#ff6b6b'},
    {ic:'\ud83d\udd01',t:'Repeat!',d:'Next stump targets mistakes',c:'#34d399'}
  ];
  const sw=140;
  steps.forEach((s,i)=>{const sx=15+i*sw;
    ctx.fillStyle='rgba(20,20,35,.9)';ctx.beginPath();ctx.roundRect(sx,by+28,sw-8,62,6);ctx.fill();
    ctx.strokeStyle=s.c+'44';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(sx,by+28,sw-8,62,6);ctx.stroke();
    ctx.fillStyle=s.c;ctx.font='700 10px Fira Code';ctx.fillText(s.ic+' '+s.t,sx+6,by+44);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    const words2=s.d.split(' ');let line='',ly2=by+58;
    words2.forEach(w2=>{if((line+' '+w2).length>20){ctx.fillText(line,sx+6,ly2);ly2+=10;line=w2}else line=line?line+' '+w2:w2});
    if(line)ctx.fillText(line,sx+6,ly2);
    if(i<4){ctx.fillStyle='#4a475a';ctx.font='14px sans-serif';ctx.fillText('\u2192',sx+sw-12,by+56)}
  });

  // Key Insight
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(10,by+108,730,112,8);ctx.fill();
  ctx.fillStyle='#4ecdc4';ctx.font='600 10px Fira Code';ctx.fillText('Key Insight: Weak + Weak + Weak = Strong!',20,by+126);
  ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
  ctx.fillText('Each stump alone is barely better than random (a "weak learner" \u2014 just one split!).',20,by+144);
  ctx.fillText('But by focusing each new stump on the mistakes of previous ones, the ensemble becomes a "strong learner".',20,by+160);
  ctx.fillText('Final prediction = weighted vote: H(x) = sign(\u03a3 \u03b1\u209chc(x)). More accurate stumps get higher voting power \u03b1.',20,by+176);
  ctx.fillText('Boosting = sequential, focus on mistakes.  Bagging (Random Forest) = parallel, focus on diversity.',20,by+192);

  // Weak -> Strong visual
  if(ns>0){const mX=20,mY=by+206;
    ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('Weak:',mX,mY);
    for(let i=0;i<Math.min(ns,8);i++){
      ctx.fillStyle='#ffd16644';ctx.beginPath();ctx.roundRect(mX+48+i*22,mY-10,18,14,3);ctx.fill();
      ctx.fillStyle='#ffd166';ctx.font='600 7px Fira Code';ctx.fillText('h'+(i+1),mX+51+i*22,mY)}
    if(ns>8){ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('+'+(ns-8),mX+48+8*22+2,mY)}
    ctx.fillStyle='#4a475a';ctx.font='14px sans-serif';ctx.fillText('\u2192',mX+48+Math.min(ns,8)*22+(ns>8?22:4),mY);
    ctx.fillStyle='#34d399';ctx.font='700 10px Fira Code';ctx.fillText('Strong!',mX+48+Math.min(ns,8)*22+(ns>8?40:22),mY)}
}

const ctrl=addControls(el);
const ab1=document.createElement('button');ab1.className='btn';ab1.textContent='\u25b6 +1 Round';ab1.onclick=addStump;
const ab5=document.createElement('button');ab5.className='btn';ab5.textContent='\u23e9 +5 Rounds';ab5.onclick=()=>{for(let i=0;i<5;i++)addStump()};
let autoTmr=null;
const abAuto=document.createElement('button');abAuto.className='btn';abAuto.textContent='\u25b6\ufe0f Auto';
abAuto.onclick=()=>{if(autoTmr){clearInterval(autoTmr);autoTmr=null;abAuto.classList.remove('active')}
  else{autoTmr=setInterval(()=>{addStump();if(round>=20){clearInterval(autoTmr);autoTmr=null;abAuto.classList.remove('active')}},400);abAuto.classList.add('active')}};
const abRst=document.createElement('button');abRst.className='btn';abRst.textContent='\u21bb Reset';
abRst.onclick=()=>{if(autoTmr){clearInterval(autoTmr);autoTmr=null;abAuto.classList.remove('active')}seedPts();draw()};
ctrl.appendChild(ab1);ctrl.appendChild(ab5);ctrl.appendChild(abAuto);ctrl.appendChild(abRst);draw();
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
