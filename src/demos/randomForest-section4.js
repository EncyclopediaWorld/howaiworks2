import { $, createCanvas, addHint, addControls, rand, randInt, TAU } from '../lib/shared.js'

export function mountRf(containerId = 'demo-rf') {
  const __id = containerId || 'demo-rf';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 380);
addHint(el,'Grow trees one by one. Each tree shows its own colored decision regions. The "Forest" panel shows the majority vote.');

const DW=300,DH=220;
let pts=[];
function seedPts(){
  pts=[];
  for(let i=0;i<22;i++) pts.push({x:rand(15,DW*.48),y:rand(15,DH-15),c:0});
  for(let i=0;i<22;i++) pts.push({x:rand(DW*.52,DW-15),y:rand(15,DH-15),c:1});
  for(let i=0;i<6;i++){pts.push({x:rand(DW*.35,DW*.65),y:rand(15,DH*.4),c:0});
    pts.push({x:rand(DW*.35,DW*.65),y:rand(DH*.6,DH-15),c:1});}
}
seedPts();

function buildTree(sub,depth){
  if(depth<=0||sub.length<4){const c0=sub.filter(p=>p.c===0).length;return{leaf:true,cls:c0>=sub.length-c0?0:1}}
  const bag=[];for(let i=0;i<sub.length;i++)bag.push(sub[randInt(0,sub.length)]);
  let bestGini=2,bestAxis='x',bestVal=DW/2;
  for(const axis of['x','y']){const vals=bag.map(p=>p[axis]).sort((a,b)=>a-b);
    for(let q=.15;q<=.85;q+=.1){const v=vals[Math.floor(vals.length*q)];
      const left=bag.filter(p=>p[axis]<=v),right=bag.filter(p=>p[axis]>v);
      if(left.length<2||right.length<2)continue;
      const gini=s=>{const n=s.length,p0=s.filter(p=>p.c===0).length/n;return 1-p0*p0-(1-p0)*(1-p0)};
      const g=(left.length*gini(left)+right.length*gini(right))/bag.length;
      if(g<bestGini){bestGini=g;bestAxis=axis;bestVal=v;}}}
  const lp=sub.filter(p=>p[bestAxis]<=bestVal),rp=sub.filter(p=>p[bestAxis]>bestVal);
  if(lp.length<2||rp.length<2){const c0=sub.filter(p=>p.c===0).length;return{leaf:true,cls:c0>=sub.length-c0?0:1}}
  return{leaf:false,axis:bestAxis,val:bestVal,left:buildTree(lp,depth-1),right:buildTree(rp,depth-1)};
}
function treePredict(t,x,y){if(t.leaf)return t.cls;return(t.axis==='x'?x:y)<=t.val?treePredict(t.left,x,y):treePredict(t.right,x,y)}
function treeSplits(t,list){if(!list)list=[];if(!t.leaf){list.push({axis:t.axis,val:t.val});treeSplits(t.left,list);treeSplits(t.right,list)}return list}

let trees=[];
const TC=['#ffd166','#38bdf8','#a78bfa','#ff6b6b','#4ecdc4','#f472b6'];

function drawRegions(tree,ox,oy,pw,ph,alpha){
  const step=4;
  for(let py2=0;py2<ph;py2+=step)for(let px2=0;px2<pw;px2+=step){
    const cls=treePredict(tree,px2/pw*DW,py2/ph*DH);
    ctx.fillStyle=cls===0?`rgba(255,107,107,${alpha})`:`rgba(56,189,248,${alpha})`;
    ctx.fillRect(ox+px2,oy+py2,step,step);}
}
function drawDots(ox,oy,pw,ph,sz){
  pts.forEach(p=>{ctx.beginPath();ctx.arc(ox+p.x/DW*pw,oy+p.y/DH*ph,sz,0,TAU);
    ctx.fillStyle=p.c===0?'#ff6b6b':'#38bdf8';ctx.fill()});
}

function draw(){
  ctx.clearRect(0,0,750,380);
  const n=trees.length, maxShow=Math.min(n,5);
  const CW=750, CH=380;
  const pad=6, topY=4;

  if(n===0){
    // Full-width data panel
    const pw=CW-20, ph=280;
    ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(10,topY,pw,ph,8);ctx.fill();
    ctx.strokeStyle='#ffd16644';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(10,topY,pw,ph,8);ctx.stroke();
    ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('Data Points \u2014 Two classes with overlap',20,topY+18);
    ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('Click "+1 Tree" to grow decision trees. Each tree will learn a different partition of this data.',20,topY+33);
    drawDots(20,topY+40,pw-20,ph-50,5);
    // Legend
    ctx.beginPath();ctx.arc(CW-150,topY+18,5,0,TAU);ctx.fillStyle='#ff6b6b';ctx.fill();
    ctx.fillStyle='#ff6b6b';ctx.font='500 9px Fira Code';ctx.fillText('Class A',CW-140,topY+22);
    ctx.beginPath();ctx.arc(CW-80,topY+18,5,0,TAU);ctx.fillStyle='#38bdf8';ctx.fill();
    ctx.fillStyle='#38bdf8';ctx.font='500 9px Fira Code';ctx.fillText('Class B',CW-70,topY+22);
    // Bottom explanation
    const ey=topY+ph+8;
    ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(10,ey,CW-20,76,8);ctx.fill();
    ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
    ctx.fillText('Each tree sees a random bootstrap sample (bagging) and considers random feature subsets at each split.',20,ey+18);
    ctx.fillText('Individual trees are noisy and overfit, but the majority vote averages out errors \u2192 strong ensemble!',20,ey+34);
    ctx.fillText('This is "Bootstrap AGGregatING" \u2014 parallelizable and robust. Add more trees to see accuracy improve.',20,ey+50);
    ctx.fillText('\ud83d\udca1 Compare: Random Forest (parallel + diversity) vs. AdaBoost below (sequential + focus on mistakes)',20,ey+66);
    return;
  }

  // === Layout with trees: individual panels (top row) + forest panel (right, taller) ===
  // Tree panels: fit maxShow panels on the left, forest panel on the right
  const forestW=Math.max(260, CW*0.38);
  const treesAreaW=CW-forestW-pad*2-10;
  const pw=Math.floor((treesAreaW-pad*(maxShow-1))/maxShow);
  const ph=220;  // taller panels

  // Individual tree panels
  for(let i=0;i<maxShow;i++){
    const ti=n<=5?i:n-5+i;
    const ox=8+i*(pw+pad), col=TC[ti%TC.length];
    ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(ox,topY,pw,ph,8);ctx.fill();
    ctx.strokeStyle=col+'55';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(ox,topY,pw,ph,8);ctx.stroke();
    ctx.fillStyle=col;ctx.font='700 9px Fira Code';ctx.fillText('Tree '+(ti+1),ox+6,topY+14);
    const inner=4;
    drawRegions(trees[ti],ox+inner,topY+20,pw-inner*2,ph-28,.22);
    const splits=treeSplits(trees[ti]);
    splits.forEach(s=>{ctx.strokeStyle=col+'77';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.beginPath();
      if(s.axis==='x'){const sx=ox+inner+s.val/DW*(pw-inner*2);ctx.moveTo(sx,topY+20);ctx.lineTo(sx,topY+ph-8)}
      else{const sy=topY+20+s.val/DH*(ph-28);ctx.moveTo(ox+inner,sy);ctx.lineTo(ox+pw-inner,sy)}
      ctx.stroke();ctx.setLineDash([])});
    drawDots(ox+inner,topY+20,pw-inner*2,ph-28,2.5);
    const acc=pts.filter(p=>treePredict(trees[ti],p.x,p.y)===p.c).length;
    ctx.fillStyle=col;ctx.font='600 8px Fira Code';ctx.fillText('Acc: '+(acc/pts.length*100).toFixed(0)+'%',ox+6,topY+ph-6);
  }
  if(n>5){ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('(last 5 of '+n+')',8,topY+ph+12)}

  // === Forest panel (right side, full height) ===
  const fx=CW-forestW-4, fy=topY, fh=ph;
  ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(fx,fy,forestW,fh,8);ctx.fill();
  ctx.strokeStyle='#34d39955';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(fx,fy,forestW,fh,8);ctx.stroke();
  ctx.fillStyle='#34d399';ctx.font='700 11px Fira Code';ctx.fillText('\ud83c\udf32 Forest Majority Vote ('+n+' trees)',fx+8,fy+16);
  // Regions
  const fi=6, fpw=forestW-fi*2, fph=fh-50;
  const step2=4;
  for(let py2=0;py2<fph;py2+=step2)for(let px2=0;px2<fpw;px2+=step2){
    let v0=0,v1=0;trees.forEach(t=>treePredict(t,px2/fpw*DW,py2/fph*DH)===0?v0++:v1++);
    const cls=v0>v1?0:1, conf=Math.max(v0,v1)/n, a=.06+conf*.2;
    ctx.fillStyle=cls===0?`rgba(255,107,107,${a})`:`rgba(56,189,248,${a})`;
    ctx.fillRect(fx+fi+px2,fy+24+py2,step2,step2);}
  drawDots(fx+fi,fy+24,fpw,fph,3.5);
  // Accuracy badge
  const fAcc=pts.filter(p=>{let v0=0,v1=0;trees.forEach(t=>treePredict(t,p.x,p.y)===0?v0++:v1++);return(v0>v1?0:1)===p.c}).length;
  const fA=fAcc/pts.length;
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(fx+fi,fy+fph+28,fpw,18,4);ctx.fill();
  ctx.fillStyle='#34d39988';ctx.beginPath();ctx.roundRect(fx+fi,fy+fph+28,fpw*fA,18,4);ctx.fill();
  ctx.fillStyle='#e4e2df';ctx.font='bold 10px Fira Code';ctx.fillText('Forest Accuracy: '+(fA*100).toFixed(0)+'%',fx+fi+6,fy+fph+41);

  // === Bottom: accuracy comparison + explanation ===
  const by=topY+ph+8+(n>5?14:0);
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(8,by,CW-16,CH-by-6,8);ctx.fill();

  // Accuracy bars
  let bestTA=0;trees.forEach(t=>{const a=pts.filter(p=>treePredict(t,p.x,p.y)===p.c).length/pts.length;if(a>bestTA)bestTA=a});
  const bx2=16, bw2=280, bh2=16;
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Accuracy:',bx2,by+16);
  ctx.fillStyle='#ff6b6b';ctx.font='500 9px Fira Code';ctx.fillText('Best single tree:',bx2,by+34);
  ctx.fillStyle='#1a1a2e';ctx.beginPath();ctx.roundRect(bx2+110,by+24,bw2,bh2,3);ctx.fill();
  ctx.fillStyle='#ff6b6b88';ctx.beginPath();ctx.roundRect(bx2+110,by+24,bw2*bestTA,bh2,3);ctx.fill();
  ctx.fillStyle='#e4e2df';ctx.font='600 9px Fira Code';ctx.fillText((bestTA*100).toFixed(0)+'%',bx2+115+bw2*bestTA,by+37);

  ctx.fillStyle='#34d399';ctx.font='500 9px Fira Code';ctx.fillText('Forest ('+n+' trees):',bx2,by+56);
  ctx.fillStyle='#1a1a2e';ctx.beginPath();ctx.roundRect(bx2+110,by+46,bw2,bh2,3);ctx.fill();
  ctx.fillStyle='#34d39988';ctx.beginPath();ctx.roundRect(bx2+110,by+46,bw2*fA,bh2,3);ctx.fill();
  ctx.fillStyle='#e4e2df';ctx.font='600 9px Fira Code';ctx.fillText((fA*100).toFixed(0)+'%',bx2+115+bw2*fA,by+59);

  // Explanation on the right side of accuracy bars
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
  ctx.fillText('Each tree sees a random bootstrap sample + random features.',bx2+420,by+16);
  ctx.fillText('Individual trees overfit, but voting averages out errors.',bx2+420,by+32);
  ctx.fillText('More trees = smoother boundary = better generalization!',bx2+420,by+48);
  ctx.fillStyle='#4ecdc4';ctx.font='500 9px Fira Code';
  ctx.fillText('\ud83d\udca1 This is "Bootstrap AGGregatING" (bagging).',bx2+420,by+64);
}

const ctrl=addControls(el);
[{n:'\ud83c\udf33 +1 Tree',f:1},{n:'\ud83c\udf32 +5 Trees',f:5},{n:'\ud83c\udf3f +20 Trees',f:20}].forEach(o=>{
  const b=document.createElement('button');b.className='btn';b.textContent=o.n;
  b.onclick=()=>{for(let i=0;i<o.f;i++)trees.push(buildTree(pts,3));draw()};ctrl.appendChild(b)});
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';
rst.onclick=()=>{trees=[];seedPts();draw()};ctrl.appendChild(rst);draw();
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
