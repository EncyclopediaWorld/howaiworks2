import { $, createCanvas, addHint, addControls, rand, clamp } from '../lib/shared.js'

// ===== demo-alphafold =====
export function mountAlphaFold(containerId = 'demo-alpha-fold') {
  const __id = containerId || 'demo-alpha-fold';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'AlphaFold 2 predicts protein 3D structure from amino acid sequence. Watch the chain fold from a random coil into its native conformation. The pair distance matrix (right) shows predicted inter-residue distances — the core signal learned by the Evoformer.');

  const N = 16; // amino acid residues
  const AA_NAMES = ['Ala','Cys','Asp','Glu','Phe','Gly','His','Ile','Lys','Leu','Met','Asn','Pro','Gln','Arg','Ser'];
  const AA_COLORS = ['#f472b6','#34d399','#ffd166','#38bdf8','#fb923c','#a78bfa','#60a5fa','#4ade80','#facc15','#f87171','#e879f9','#2dd4bf','#818cf8','#fb7185','#86efac','#67e8f9'];

  /* ── Target structure (pre-defined "correct" fold) ── */
  const TARGET = Array.from({length:N}, (_,i) => ({
    x: 130 + 80*Math.cos(i/N*Math.PI*2.5 + 0.3),
    y: 170 + 55*Math.sin(i/N*Math.PI*2.5 + 0.3)
  }));

  /* ── Particle state ── */
  let pos = TARGET.map((_,i) => ({
    x: 100 + rand(0,200),
    y: 50 + rand(0,200)
  }));
  let vel = pos.map(() => ({x:0, y:0}));
  let foldProgress = 0; // 0..1
  let running = false;
  let rafId = null;
  let step = 0;

  function resetRandom() {
    pos = TARGET.map(() => ({x:100+rand(0,220), y:40+rand(0,220)}));
    vel = pos.map(()=>({x:0,y:0}));
    foldProgress=0; step=0;
  }

  /* ── Target distance matrix ── */
  const targetDist = Array.from({length:N}, (_,i) =>
    Array.from({length:N}, (_,j) => {
      const dx=TARGET[i].x-TARGET[j].x, dy=TARGET[i].y-TARGET[j].y;
      return Math.sqrt(dx*dx+dy*dy);
    })
  );

  /* ── Spring simulation toward target ── */
  function physicsStep() {
    const k = 0.015 + foldProgress*0.03;
    const damp = 0.88;
    for(let i=0;i<N;i++){
      // Spring toward target weighted by foldProgress
      const tx=TARGET[i].x, ty=TARGET[i].y;
      vel[i].x += k*(tx-pos[i].x);
      vel[i].y += k*(ty-pos[i].y);
      // chain bond springs
      if(i>0){
        const dx=pos[i].x-pos[i-1].x, dy=pos[i].y-pos[i-1].y;
        const d=Math.sqrt(dx*dx+dy*dy)||1;
        const desired=22;
        const f=(d-desired)*0.08;
        vel[i].x -= f*(dx/d); vel[i].y -= f*(dy/d);
        vel[i-1].x += f*(dx/d); vel[i-1].y += f*(dy/d);
      }
      vel[i].x *= damp; vel[i].y *= damp;
      pos[i].x += vel[i].x; pos[i].y += vel[i].y;
      pos[i].x = clamp(pos[i].x, 20, 420); pos[i].y = clamp(pos[i].y, 20, 310);
    }
    foldProgress = Math.min(1, foldProgress+0.003);
  }

  function computeRMSD() {
    const s=pos.reduce((acc,p,i)=>{const dx=p.x-TARGET[i].x, dy=p.y-TARGET[i].y; return acc+dx*dx+dy*dy;},0);
    return Math.sqrt(s/N);
  }

  /* ── Draw current distance matrix ── */
  function drawMatrix() {
    const MX=445, MY=20, CELL=14;
    ctx.fillStyle='rgba(6,6,12,0.92)'; ctx.beginPath(); ctx.roundRect(MX-4,MY-4,N*CELL+8,N*CELL+8,6); ctx.fill();
    for(let i=0;i<N;i++){
      for(let j=0;j<N;j++){
        const tdij=targetDist[i][j];
        const dx=pos[i].x-pos[j].x, dy=pos[i].y-pos[j].y;
        const cdij=Math.sqrt(dx*dx+dy*dy);
        // Color: green=close to target, red=far
        const err=Math.abs(cdij-tdij)/Math.max(tdij,1);
        const g=Math.floor(clamp(255*(1-err*1.2),0,255));
        const r=Math.floor(clamp(255*err*1.5,0,255));
        ctx.fillStyle=`rgb(${r},${g},60)`;
        ctx.fillRect(MX+j*CELL,MY+i*CELL,CELL-1,CELL-1);
      }
    }
    ctx.fillStyle='#ffd166'; ctx.font='600 9px Fira Code'; ctx.textAlign='center';
    ctx.fillText('Pair Distance Map (current)',MX+N*CELL/2,MY+N*CELL+16); ctx.textAlign='left';
    // Heatmap scale
    ctx.fillStyle='#34d399'; ctx.font='500 7px Fira Code';
    ctx.fillText('■ correct dist   ',MX,MY+N*CELL+28);
    ctx.fillStyle='#ff6b6b';
    ctx.fillText('■ wrong dist',MX+80,MY+N*CELL+28);
  }

  function draw() {
    ctx.clearRect(0,0,750,340);

    // ── Chain / structure ────────────────────────────────────────────────
    // Bonds
    for(let i=1;i<N;i++){
      const p1=pos[i-1], p2=pos[i];
      ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2.5; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(p1.x,p1.y); ctx.lineTo(p2.x,p2.y); ctx.stroke();
    }
    // SS bonds (residues 3-8 and 9-14 paired in target structure)
    [[3,13],[5,11],[7,9]].forEach(([a,b])=>{
      const alpha=foldProgress*0.6;
      if(alpha>0.1){
        ctx.strokeStyle=`rgba(250,204,21,${alpha})`; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(pos[a].x,pos[a].y); ctx.lineTo(pos[b].x,pos[b].y); ctx.stroke();
        ctx.setLineDash([]);
      }
    });
    // Residue nodes
    pos.forEach((p,i)=>{
      const r=8;
      ctx.save(); ctx.shadowColor=AA_COLORS[i]; ctx.shadowBlur=foldProgress>0.5?10:4;
      ctx.fillStyle=AA_COLORS[i]+'33'; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=AA_COLORS[i]; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.stroke();
      ctx.restore();
      if(N<=20){
        ctx.fillStyle='rgba(255,255,255,0.75)'; ctx.font='500 6px Fira Code'; ctx.textAlign='center';
        ctx.fillText(AA_NAMES[i].substring(0,3),p.x,p.y+3); ctx.textAlign='left';
      }
    });

    // ── Fold progress gauge ──────────────────────────────────────────────
    const rmsd=computeRMSD();
    const quality=Math.max(0,1-rmsd/120);
    const GX=20, GY=286, GW=420, GH=16;
    ctx.fillStyle='rgba(6,6,12,0.8)'; ctx.beginPath(); ctx.roundRect(GX,GY,GW,GH,6); ctx.fill();
    const barColor=quality>0.8?'#34d399':quality>0.5?'#ffd166':'#ff6b6b';
    ctx.fillStyle=barColor; ctx.beginPath(); ctx.roundRect(GX,GY,GW*quality,GH,6); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='600 9px Fira Code';
    ctx.fillText('TM-score proxy: '+quality.toFixed(3)+'  RMSD: '+rmsd.toFixed(1)+' Å',GX+6,GY+11);

    drawMatrix();

    // ── Info overlay ─────────────────────────────────────────────────────
    const IX=450, IY=226, IW=295, IH=110;
    ctx.fillStyle='rgba(6,6,12,0.93)'; ctx.beginPath(); ctx.roundRect(IX,IY,IW,IH,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 11px Fira Code'; ctx.fillText('AlphaFold 2 (2020-21)',IX+8,IY+16);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    ctx.fillText('Evoformer: MSA + pair repr. → IPA structure module',IX+8,IY+28);
    ctx.fillStyle='#38bdf8'; ctx.font='500 8px Fira Code';
    ctx.fillText('Fold progress: '+(foldProgress*100).toFixed(0)+'%',IX+8,IY+42);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('Input: AA sequence → embed → Evoformer (48×)',IX+8,IY+55);
    ctx.fillText('→ 3D backbone via IPA (Invariant Point Attn)',IX+8,IY+67);
    ctx.fillText('Nobel Prize in Chemistry 2024 (Hassabis, Jumper)',IX+8,IY+79);
    ctx.fillText('Solved 200M protein structures in <1 year',IX+8,IY+91);
    ctx.fillStyle=barColor; ctx.font='700 9px Fira Code';
    ctx.fillText('Quality: '+(quality>0.9?'Excellent':quality>0.7?'Good':quality>0.4?'OK':'Unfolded'),IX+8,IY+103);
  }

  function animate() {
    physicsStep();
    draw();
    if(running) rafId=requestAnimationFrame(animate);
  }

  const ctrl=addControls(el);
  const foldBtn=document.createElement('button');foldBtn.className='btn';foldBtn.textContent='▶ Fold';
  foldBtn.onclick=()=>{running=!running;foldBtn.textContent=running?'⏸ Pause':'▶ Fold';foldBtn.classList.toggle('active',running);if(running) animate();};ctrl.appendChild(foldBtn);
  const resetBtn=document.createElement('button');resetBtn.className='btn';resetBtn.textContent='↻ Unfold';
  resetBtn.onclick=()=>{running=false;foldBtn.textContent='▶ Fold';foldBtn.classList.remove('active');if(rafId)cancelAnimationFrame(rafId);resetRandom();draw();};ctrl.appendChild(resetBtn);

  resetRandom(); draw();
  return ()=>{try{running=false;if(rafId)cancelAnimationFrame(rafId);if(el)el.innerHTML='';}catch(e){}};
}
