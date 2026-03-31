import { $, createCanvas, addHint, addControls, TAU, dist } from '../lib/shared.js'

export function mountCnn(containerId = 'demo-cnn') {
  const __id = containerId || 'demo-cnn';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Draw a digit (0-9) on the 28\u00d728 canvas. Watch convolution filters detect edges, pooling shrinks maps, then see classification scores.');

const G=28, CS=7;
let grid=Array.from({length:G},()=>new Float32Array(G));
let drawing=false, lastPt=null;
let scanRow=-1, animId=null;

const filters=[
  {n:'Horiz. Edge',k:[[1,1,1],[0,0,0],[-1,-1,-1]],c:'#ff6b6b'},
  {n:'Vert. Edge', k:[[1,0,-1],[1,0,-1],[1,0,-1]], c:'#38bdf8'},
  {n:'Diagonal',   k:[[0,-1,1],[1,0,-1],[-1,1,0]], c:'#a78bfa'}
];

function conv2d(src,k){
  const kh=k.length,kw=k[0].length,oh=src.length-kh+1,ow=src[0].length-kw+1;
  const out=Array.from({length:oh},()=>new Float32Array(ow));
  for(let r=0;r<oh;r++) for(let c2=0;c2<ow;c2++){
    let s=0; for(let kr=0;kr<kh;kr++) for(let kc=0;kc<kw;kc++) s+=src[r+kr][c2+kc]*k[kr][kc];
    out[r][c2]=Math.max(0,s);
  } return out;
}
function maxPool(src,s){
  const oh=Math.floor(src.length/s),ow=Math.floor((src[0]||[]).length/s);
  const out=Array.from({length:oh},()=>new Float32Array(ow));
  for(let r=0;r<oh;r++) for(let c2=0;c2<ow;c2++){
    let mx=0; for(let pr=0;pr<s;pr++) for(let pc=0;pc<s;pc++)
      mx=Math.max(mx,(src[r*s+pr]||[])[c2*s+pc]||0);
    out[r][c2]=mx;
  } return out;
}
function energy(fm){ let s=0; for(const row of fm) for(const v of row) s+=v; return s; }

/* --- Feature extraction: 4x7 block densities + horizontal crossings --- */
const BX=4, BY=7;  // 4 columns x 7 rows of blocks
function extractFeatures(g){
  const feat=[];
  // Block densities (28 features)
  const bw=G/BX, bh=G/BY;
  for(let br=0;br<BY;br++) for(let bc=0;bc<BX;bc++){
    let s=0,cnt=0;
    for(let r=Math.floor(br*bh);r<Math.floor((br+1)*bh);r++)
      for(let c2=Math.floor(bc*bw);c2<Math.floor((bc+1)*bw);c2++){ s+=g[r][c2]; cnt++; }
    feat.push(s/(cnt||1));
  }
  // Horizontal crossing count at 7 heights (7 features)
  for(let ri=0;ri<7;ri++){
    const r=Math.floor((ri+.5)/7*G);
    let crossings=0, prev=0;
    for(let c2=0;c2<G;c2++){const cur=g[r][c2]>.3?1:0;if(cur!==prev&&c2>0)crossings++;prev=cur;}
    feat.push(crossings/6); // normalize
  }
  // Vertical crossing count at 4 widths (4 features)
  for(let ci=0;ci<4;ci++){
    const c2=Math.floor((ci+.5)/4*G);
    let crossings=0, prev=0;
    for(let r=0;r<G;r++){const cur=g[r][c2]>.3?1:0;if(cur!==prev&&r>0)crossings++;prev=cur;}
    feat.push(crossings/6);
  }
  // Global features: density, symmetry, top/bottom ratio (3 features)
  let filled=0,topH=0,botH=0,leftH=0,rightH=0;
  for(let r=0;r<G;r++) for(let c2=0;c2<G;c2++){
    const v=g[r][c2]; filled+=v;
    if(r<G/2)topH+=v;else botH+=v;
    if(c2<G/2)leftH+=v;else rightH+=v;
  }
  feat.push(filled/(G*G));
  feat.push(1-Math.abs(leftH-rightH)/(leftH+rightH+.01));
  feat.push(topH/(topH+botH+.01));
  return feat;
}

function featDist(a,b){
  let s=0; for(let i=0;i<a.length;i++) s+=(a[i]-b[i])**2; return Math.sqrt(s);
}

/* --- Template-based classification (nearest neighbor) --- */
let templates=[]; // [{digit, feat}]

function buildTemplates(){
  templates=[];
  // We generate each digit preset into a temp grid, extract features, store as template
  const presetDefs=[
    {d:0,f:()=>{tmpClear();tmpCircle(14,14,8,10)}},
    {d:1,f:()=>{tmpClear();tmpLine(12,5,14,5);tmpLine(14,4,14,24);tmpLine(10,24,18,24)}},
    {d:2,f:()=>{tmpClear();for(let a=Math.PI;a>=-0.1;a-=.08)tmpStamp(Math.round(14+7*Math.cos(a)),Math.round(9+6*Math.sin(a)));tmpLine(21,9,8,23);tmpLine(8,23,22,23)}},
    {d:3,f:()=>{tmpClear();for(let a=-Math.PI*.6;a<Math.PI*.6;a+=.08){tmpStamp(Math.round(13+7*Math.cos(a)),Math.round(8+6*Math.sin(a)));tmpStamp(Math.round(13+7*Math.cos(a)),Math.round(19+6*Math.sin(a)));}}},
    {d:4,f:()=>{tmpClear();tmpLine(6,4,6,15);tmpLine(6,15,20,15);tmpLine(16,4,16,24)}},
    {d:5,f:()=>{tmpClear();tmpLine(19,4,8,4);tmpLine(8,4,8,13);tmpLine(8,13,17,13);for(let a=-Math.PI*.5;a<Math.PI*.7;a+=.08)tmpStamp(Math.round(15+6*Math.cos(a)),Math.round(19+5*Math.sin(a)))}},
    {d:6,f:()=>{tmpClear();for(let a=Math.PI*.3;a<Math.PI*2.1;a+=.06)tmpStamp(Math.round(14+8*Math.cos(a)),Math.round(12+10*Math.sin(a)));tmpCircle(14,18,6,5)}},
    {d:7,f:()=>{tmpClear();tmpLine(6,5,21,5);tmpLine(21,5,12,24)}},
    {d:8,f:()=>{tmpClear();tmpCircle(14,9,6,5);tmpCircle(14,19,7,6)}},
    {d:9,f:()=>{tmpClear();tmpCircle(14,10,7,6);tmpLine(21,10,14,24)}}
  ];
  presetDefs.forEach(p=>{ p.f(); templates.push({digit:p.d, feat:extractFeatures(tmpGrid)}); });
}

// Temp grid for template generation (avoid polluting main grid)
let tmpGrid=Array.from({length:G},()=>new Float32Array(G));
function tmpClear(){ for(let r=0;r<G;r++) tmpGrid[r].fill(0); }
function tmpStamp(gx,gy){
  for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
    const nx=gx+dx,ny=gy+dy;
    if(nx>=0&&nx<G&&ny>=0&&ny<G){
      const d=Math.abs(dx)+Math.abs(dy);
      tmpGrid[ny][nx]=Math.min(1,tmpGrid[ny][nx]+(d===0?1:d===1?.45:.15));
    }
  }
}
function tmpCircle(cx2,cy2,rx,ry){ for(let a=0;a<TAU;a+=.06) tmpStamp(Math.round(cx2+rx*Math.cos(a)),Math.round(cy2+ry*Math.sin(a))); }
function tmpLine(x0,y0,x1,y1){ const dx=x1-x0,dy=y1-y0,steps=Math.max(Math.abs(dx),Math.abs(dy),1)*2;for(let i=0;i<=steps;i++){const t=i/steps;tmpStamp(Math.round(x0+dx*t),Math.round(y0+dy*t));} }

function classify(){
  const fmaps=filters.map(f=>conv2d(grid,f.k));
  const pmaps=fmaps.map(fm=>maxPool(fm,2));
  const total=fmaps.map(energy).reduce((a,b)=>a+b,0);
  if(total<3) return {scores:new Float32Array(10),best:-1,fmaps,pmaps};

  const feat=extractFeatures(grid);
  // Compute distance to each template, convert to similarity scores
  const dists=new Float32Array(10).fill(Infinity);
  templates.forEach(t=>{
    const d=featDist(feat,t.feat);
    if(d<dists[t.digit]) dists[t.digit]=d;
  });

  // Convert distances to softmax probabilities (smaller dist = higher prob)
  const scores=new Float32Array(10);
  let minD=Infinity; for(let i=0;i<10;i++) if(dists[i]<minD) minD=dists[i];
  let sum=0;
  for(let i=0;i<10;i++){
    // Use negative distance as logit, with temperature scaling
    const logit=dists[i]<Infinity ? -(dists[i]-minD)*5 : -50;
    scores[i]=Math.exp(logit); sum+=scores[i];
  }
  for(let i=0;i<10;i++) scores[i]/=sum;
  let best=0; for(let i=1;i<10;i++) if(scores[i]>scores[best]) best=i;
  return {scores,best,fmaps,pmaps};
}

const OX=12,OY=28;
function cellAt(e){
  const r=c.getBoundingClientRect();
  return {gx:Math.floor(((e.clientX-r.left)*750/r.width-OX)/CS),
          gy:Math.floor(((e.clientY-r.top)*340/r.height-OY)/CS)};
}
function stamp(gx,gy){
  for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){
    const nx=gx+dx,ny=gy+dy;
    if(nx>=0&&nx<G&&ny>=0&&ny<G){
      const d=Math.abs(dx)+Math.abs(dy);
      grid[ny][nx]=Math.min(1,grid[ny][nx]+(d===0?1:d===1?.45:.15));
    }
  }
}
function linePaint(x0,y0,x1,y1){
  const dx=x1-x0,dy=y1-y0,steps=Math.max(Math.abs(dx),Math.abs(dy),1)*2;
  for(let i=0;i<=steps;i++){const t=i/steps;stamp(Math.round(x0+dx*t),Math.round(y0+dy*t));}
}
c.onmousedown=e=>{drawing=true;const p=cellAt(e);lastPt=p;stamp(p.gx,p.gy);render()};
c.onmousemove=e=>{if(!drawing)return;const p=cellAt(e);if(lastPt)linePaint(lastPt.gx,lastPt.gy,p.gx,p.gy);else stamp(p.gx,p.gy);lastPt=p;render()};
c.onmouseup=c.onmouseleave=()=>{drawing=false;lastPt=null};
c.ontouchstart=e=>{e.preventDefault();drawing=true;const p=cellAt(e.touches[0]);lastPt=p;stamp(p.gx,p.gy);render()};
c.ontouchmove=e=>{e.preventDefault();if(!drawing)return;const p=cellAt(e.touches[0]);if(lastPt)linePaint(lastPt.gx,lastPt.gy,p.gx,p.gy);else stamp(p.gx,p.gy);lastPt=p;render()};
c.ontouchend=()=>{drawing=false;lastPt=null};

function startScan(){
  if(animId) cancelAnimationFrame(animId);
  scanRow=0;
  (function tick(){scanRow+=.6;render();if(scanRow<G)animId=requestAnimationFrame(tick);else{scanRow=-1;animId=null;render();}})();
}

function render(){
  ctx.clearRect(0,0,750,340);
  const res=classify();

  // 1. Input Canvas
  ctx.fillStyle='#4ecdc4';ctx.font='700 11px Fira Code';ctx.fillText('1. Input  28\u00d728',OX,OY-8);
  ctx.fillStyle='#08081a';ctx.beginPath();ctx.roundRect(OX-1,OY-1,G*CS+2,G*CS+2,4);ctx.fill();
  for(let r=0;r<G;r++) for(let c2=0;c2<G;c2++){
    if(grid[r][c2]>.01){
      ctx.fillStyle=`rgba(230,228,222,${Math.min(grid[r][c2],1)})`;
      ctx.fillRect(OX+c2*CS,OY+r*CS,CS-.4,CS-.4);
    }
  }
  if(scanRow>=0&&scanRow<G){
    ctx.fillStyle='rgba(78,205,196,.18)';ctx.fillRect(OX,OY+Math.floor(scanRow)*CS,G*CS,CS*3);
    ctx.strokeStyle='#4ecdc4';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(OX,OY+scanRow*CS);ctx.lineTo(OX+G*CS,OY+scanRow*CS);ctx.stroke();
  }
  ctx.strokeStyle='#1e1e34';ctx.lineWidth=.5;ctx.beginPath();ctx.roundRect(OX-1,OY-1,G*CS+2,G*CS+2,4);ctx.stroke();

  // Arrow
  ctx.fillStyle='#4a475a';ctx.font='18px sans-serif';ctx.fillText('\u2192',OX+G*CS+6,OY+G*CS/2);

  // 2. Conv Feature Maps
  const fmX=222,fmY=OY;
  ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('2. Convolution (3\u00d73)',fmX,fmY-8);
  const fmaps=res.fmaps||filters.map(f=>conv2d(grid,f.k));
  fmaps.forEach((fm,fi)=>{
    const fy=fmY+fi*70,fcs=2.6,col=filters[fi].c;
    ctx.fillStyle=col;ctx.font='600 8px Fira Code';ctx.fillText(filters[fi].n,fmX,fy+10);
    const kx=fmX,ky=fy+14,ks=7;
    filters[fi].k.forEach((row,kr)=>row.forEach((v,kc)=>{
      ctx.fillStyle=v>0?col+'aa':v<0?'#ff6b6b88':'#181830';
      ctx.fillRect(kx+kc*ks,ky+kr*ks,ks-1,ks-1);
    }));
    ctx.fillStyle='#4a475a';ctx.font='11px sans-serif';ctx.fillText('\u2192',kx+24,ky+11);
    const mx2=kx+38;let peak=0;
    for(const row of fm) for(const v of row) if(v>peak) peak=v;
    if(peak<.01) peak=1;
    for(let r=0;r<fm.length;r++) for(let c2=0;c2<fm[r].length;c2++){
      const a=fm[r][c2]/peak;
      if(a>.04){ctx.fillStyle=col+(Math.round(Math.min(a,1)*230).toString(16).padStart(2,'0'));
        ctx.fillRect(mx2+c2*fcs,ky+r*fcs,fcs,fcs);}
    }
  });

  // Arrow
  ctx.fillStyle='#4a475a';ctx.font='18px sans-serif';ctx.fillText('\u2192',370,fmY+90);

  // 3. Pooled Maps
  const pX=392,pY=OY;
  ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('3. Max Pool 2\u00d72',pX,pY-8);
  const pmaps=res.pmaps||fmaps.map(fm=>maxPool(fm,2));
  pmaps.forEach((pm,fi)=>{
    const fy=pY+fi*70,pcs=4.5,col=filters[fi].c;
    ctx.fillStyle=col;ctx.font='600 8px Fira Code';ctx.fillText(filters[fi].n,pX,fy+10);
    const ky=fy+14;let peak=0;
    for(const row of pm) for(const v of row) if(v>peak) peak=v;
    if(peak<.01) peak=1;
    for(let r=0;r<pm.length;r++) for(let c2=0;c2<pm[r].length;c2++){
      const a=pm[r][c2]/peak;
      if(a>.04){ctx.fillStyle=col+(Math.round(Math.min(a,1)*230).toString(16).padStart(2,'0'));
        ctx.fillRect(pX+c2*pcs,ky+r*pcs,pcs,pcs);}
    }
  });

  // Arrow
  ctx.fillStyle='#4a475a';ctx.font='18px sans-serif';ctx.fillText('\u2192',510,pY+90);

  // 4. Classification
  const cX=535,cY=OY,hasInk=grid.some(row=>row.some(v=>v>.05));
  ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('4. Dense \u2192 Softmax',cX,cY-8);

  if(hasInk&&res.best>=0){
    ctx.fillStyle='rgba(6,6,12,.92)';ctx.beginPath();ctx.roundRect(cX,cY+2,58,58,10);ctx.fill();
    ctx.save();ctx.shadowColor='#4ecdc4';ctx.shadowBlur=18;
    ctx.fillStyle='#4ecdc4';ctx.font='bold 42px Fira Code';ctx.textAlign='center';
    ctx.fillText(String(res.best),cX+29,cY+48);ctx.textAlign='left';ctx.restore();
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    ctx.fillText((res.scores[res.best]*100).toFixed(1)+'%',cX+8,cY+70);
  }
  const bX=cX+68,bY=cY+2,bW=138,bH=14;
  for(let d=0;d<10;d++){
    const y=bY+d*(bH+3.5),isTop=hasInk&&d===res.best;
    ctx.fillStyle=isTop?'#4ecdc4':'#7d7a8c';ctx.font=(isTop?'700':'400')+' 9px Fira Code';
    ctx.fillText(String(d),bX-12,y+10);
    ctx.fillStyle='#0e0e1e';ctx.beginPath();ctx.roundRect(bX,y,bW,bH,3);ctx.fill();
    if(hasInk){
      const w=res.scores[d]*bW;
      ctx.fillStyle=isTop?'#4ecdc4bb':'#4a475a88';
      ctx.beginPath();ctx.roundRect(bX,y,Math.max(w,2),bH,3);ctx.fill();
      if(w>18){ctx.fillStyle='#e4e2df';ctx.font='500 7px Fira Code';ctx.fillText((res.scores[d]*100).toFixed(0)+'%',bX+4,y+10);}
    }
  }

  // Bottom
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(12,258,726,72,8);ctx.fill();
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
  ctx.fillText('LeNet: Input(28\u00d728) \u2192 Conv(5\u00d75,6) \u2192 Pool \u2192 Conv(5\u00d75,16) \u2192 Pool \u2192 FC(120) \u2192 FC(84) \u2192 10 digits',22,276);
  ctx.fillText('Key: the same filter slides across the entire image \u2192 detects features regardless of position (translation invariance).',22,292);
  ctx.fillText('Real LeNet learns filters via backprop. Here we use hand-crafted edge detectors to illustrate the concept.',22,308);
  ctx.fillText('Try drawing different digits \u2014 notice how different filters activate for curves vs. straight lines!',22,324);
}

function clearGrid(){ for(let r=0;r<G;r++) grid[r].fill(0); }
function drawCircle(cx2,cy2,rx,ry){ for(let a=0;a<TAU;a+=.06) stamp(Math.round(cx2+rx*Math.cos(a)),Math.round(cy2+ry*Math.sin(a))); }
function drawLine2(x0,y0,x1,y1){ const dx=x1-x0,dy=y1-y0,steps=Math.max(Math.abs(dx),Math.abs(dy),1)*2;for(let i=0;i<=steps;i++){const t=i/steps;stamp(Math.round(x0+dx*t),Math.round(y0+dy*t));} }

const presets=[
  {n:'0',f:()=>{clearGrid();drawCircle(14,14,8,10)}},
  {n:'1',f:()=>{clearGrid();drawLine2(12,5,14,5);drawLine2(14,4,14,24);drawLine2(10,24,18,24)}},
  {n:'2',f:()=>{clearGrid();for(let a=Math.PI;a>=-0.1;a-=.08)stamp(Math.round(14+7*Math.cos(a)),Math.round(9+6*Math.sin(a)));drawLine2(21,9,8,23);drawLine2(8,23,22,23)}},
  {n:'3',f:()=>{clearGrid();for(let a=-Math.PI*.6;a<Math.PI*.6;a+=.08){stamp(Math.round(13+7*Math.cos(a)),Math.round(8+6*Math.sin(a)));stamp(Math.round(13+7*Math.cos(a)),Math.round(19+6*Math.sin(a)));}}},
  {n:'4',f:()=>{clearGrid();drawLine2(6,4,6,15);drawLine2(6,15,20,15);drawLine2(16,4,16,24)}},
  {n:'5',f:()=>{clearGrid();drawLine2(19,4,8,4);drawLine2(8,4,8,13);drawLine2(8,13,17,13);for(let a=-Math.PI*.5;a<Math.PI*.7;a+=.08) stamp(Math.round(15+6*Math.cos(a)),Math.round(19+5*Math.sin(a)))}},
  {n:'6',f:()=>{clearGrid();for(let a=Math.PI*.3;a<Math.PI*2.1;a+=.06) stamp(Math.round(14+8*Math.cos(a)),Math.round(12+10*Math.sin(a)));drawCircle(14,18,6,5)}},
  {n:'7',f:()=>{clearGrid();drawLine2(6,5,21,5);drawLine2(21,5,12,24)}},
  {n:'8',f:()=>{clearGrid();drawCircle(14,9,6,5);drawCircle(14,19,7,6)}},
  {n:'9',f:()=>{clearGrid();drawCircle(14,10,7,6);drawLine2(21,10,14,24)}}
];
const ctrl=addControls(el);
presets.forEach(p=>{const b=document.createElement('button');b.className='btn';b.textContent=p.n;b.onclick=()=>{p.f();startScan()};ctrl.appendChild(b);});
const clrBtn=document.createElement('button');clrBtn.className='btn';clrBtn.textContent='\u21bb Clear';
clrBtn.onclick=()=>{clearGrid();scanRow=-1;if(animId){cancelAnimationFrame(animId);animId=null;}render()};
ctrl.appendChild(clrBtn);
buildTemplates();
render();
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
