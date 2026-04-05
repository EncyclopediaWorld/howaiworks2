import { $, createCanvas, addHint, addControls, clamp } from '../lib/shared.js'

// ===== demo-gemini =====
export function mountGemini(containerId = 'demo-gemini') {
  const __id = containerId || 'demo-gemini';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Gemini is natively multimodal — trained from scratch on text, images, audio, and video simultaneously. Unlike GPT-4\'s "late fusion" approach, all modalities share the same token space. Toggle each input modality and watch tokens flow into the shared Transformer.');

  const MODALITIES=[
    {name:'Text', color:'#38bdf8', icon:'T', tokens:['The','cat','sat','"Hello"','words','tokens','LLM','text'], active:true},
    {name:'Image', color:'#f472b6', icon:'🖼', tokens:['patch₁','patch₂','patch₃','patch₄','[IMG]','pixel','vision','img'], active:true},
    {name:'Audio', color:'#34d399', icon:'♪', tokens:['mel₁','mel₂','spectr','frame','hz','audio','speech','wav'], active:true},
    {name:'Video', color:'#ffd166', icon:'▶', tokens:['frame₁','frame₂','motion','scene','fps','clip','vid','temporal'], active:true},
  ];

  const SHARED_BUS_TOKENS = [];
  let animT=0;
  let rafId=null;
  let running=true;

  // Token particles streaming from each modality into unified space
  class TokenParticle {
    constructor(modIdx) {
      this.modIdx = modIdx;
      const mod = MODALITIES[modIdx];
      const srcX = getModX(modIdx);
      const srcY = getModY(modIdx);
      this.x = srcX;
      this.y = srcY;
      this.tx = 375 + (Math.random()-0.5)*60; // target: shared space
      this.ty = 140 + (Math.random()-0.5)*40;
      this.color = mod.color;
      this.label = mod.tokens[Math.floor(Math.random()*mod.tokens.length)];
      this.progress = 0;
      this.speed = 0.005 + Math.random()*0.008;
      this.alive = true;
    }
    update() {
      this.progress = Math.min(1, this.progress + this.speed);
      this.x = this.x*(1-this.speed*10) + this.tx*this.speed*10;
      this.y = this.y*(1-this.speed*10) + this.ty*this.speed*10;
      if(this.progress>0.97) this.alive=false;
    }
  }

  let particles = [];
  let frameCount=0;

  function getModX(i) { return [60, 160, 590, 690][i]; }
  function getModY(i) { return [60, 280, 60, 280][i]; }

  function spawnParticles() {
    MODALITIES.forEach((mod,i)=>{
      if(mod.active && Math.random()<0.15) particles.push(new TokenParticle(i));
    });
  }

  // Retained tokens in shared space
  const sharedTokens = [];
  function addSharedToken(p) {
    sharedTokens.push({x:p.tx, y:p.ty, color:p.color, label:p.label, life:1.0});
    if(sharedTokens.length>30) sharedTokens.shift();
  }

  function drawTransformerBlock(x, y, w, h, label) {
    ctx.fillStyle='rgba(56,189,248,0.06)'; ctx.beginPath(); ctx.roundRect(x,y,w,h,6); ctx.fill();
    ctx.strokeStyle='rgba(56,189,248,0.3)'; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(x,y,w,h,6); ctx.stroke();
    ctx.fillStyle='rgba(56,189,248,0.5)'; ctx.font='500 8px Fira Code'; ctx.textAlign='center';
    ctx.fillText(label, x+w/2, y+h/2+3); ctx.textAlign='left';
  }

  function draw() {
    ctx.clearRect(0,0,750,340);

    // ── Background: shared transformer in center ──────────────────────────
    const CX=310, CY=90, CW=190, CH=160;
    ctx.fillStyle='rgba(6,6,12,0.85)'; ctx.beginPath(); ctx.roundRect(CX-10,CY-10,CW+20,CH+20,10); ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.08)'; ctx.lineWidth=1; ctx.beginPath(); ctx.roundRect(CX-10,CY-10,CW+20,CH+20,10); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='700 10px Fira Code'; ctx.textAlign='center';
    ctx.fillText('Unified Token Space', CX+CW/2, CY-14); ctx.textAlign='left';

    // Transformer stacked blocks
    const blockH=28;
    ['Attention','FFN','Attention','FFN'].forEach((lbl,i)=>{
      drawTransformerBlock(CX, CY+i*blockH, CW, blockH-2, lbl);
    });
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='500 8px Fira Code'; ctx.textAlign='center';
    ctx.fillText('(Gemini Transformer stack)', CX+CW/2, CY+4*blockH+14); ctx.textAlign='left';

    // ── Modality input nodes ──────────────────────────────────────────────
    MODALITIES.forEach((mod,i)=>{
      const mx=getModX(i), my=getModY(i);
      const R=28;
      ctx.save();
      ctx.shadowColor=mod.active?mod.color:'rgba(0,0,0,0)'; ctx.shadowBlur=mod.active?16:0;
      ctx.fillStyle=mod.active?mod.color+'22':'rgba(30,30,40,0.8)';
      ctx.beginPath(); ctx.arc(mx,my,R,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=mod.active?mod.color:'rgba(255,255,255,0.1)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(mx,my,R,0,Math.PI*2); ctx.stroke();
      ctx.restore();
      ctx.fillStyle=mod.active?mod.color:'rgba(255,255,255,0.2)'; ctx.font='700 11px Fira Code'; ctx.textAlign='center';
      ctx.fillText(mod.icon, mx, my-2);
      ctx.font='600 9px Fira Code';
      ctx.fillText(mod.name, mx, my+12); ctx.textAlign='left';
      // Wire from modality to shared space
      if(mod.active){
        const tx=CX+(i<2?0:CW), ty=CY+50+Math.random()*60;
        ctx.strokeStyle=mod.color+'40'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
        ctx.beginPath(); ctx.moveTo(mx,my); ctx.quadraticCurveTo((mx+tx)/2,(my+ty)/2,tx,ty); ctx.stroke();
        ctx.setLineDash([]);
      }
    });

    // ── Token particles ───────────────────────────────────────────────────
    particles.forEach(p => {
      const alpha = Math.sin(p.progress*Math.PI)*0.8+0.2;
      ctx.fillStyle=p.color+Math.floor(alpha*210).toString(16).padStart(2,'0');
      ctx.font='500 8px Fira Code'; ctx.textAlign='center';
      ctx.fillText(p.label, p.x, p.y); ctx.textAlign='left';
    });

    // ── Shared tokens at rest in unified space ────────────────────────────
    sharedTokens.forEach((st,i) => {
      ctx.fillStyle=st.color+Math.floor(st.life*160).toString(16).padStart(2,'0');
      ctx.font='500 7px Fira Code'; ctx.textAlign='center';
      ctx.fillText(st.label, st.x, st.y); ctx.textAlign='left';
      st.life = Math.max(0, st.life-0.004);
    });

    // ── Output side ───────────────────────────────────────────────────────
    ctx.fillStyle='rgba(6,6,12,0.85)'; ctx.beginPath(); ctx.roundRect(522,90,120,160,8); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='600 9px Fira Code'; ctx.textAlign='center';
    ctx.fillText('Outputs', 582, 104); ctx.textAlign='left';
    const outputs=[{c:'#38bdf8',t:'Text response'},{c:'#f472b6',t:'Image caption'},{c:'#34d399',t:'Audio detail'},{c:'#ffd166',t:'Video summary'},{c:'#a78bfa',t:'Cross-modal QA'}];
    outputs.forEach((o,i)=>{
      ctx.fillStyle=o.c; ctx.font='500 8px Fira Code';
      ctx.fillText('→ '+o.t, 524, 118+i*20);
    });

    // Connection: transformer → output
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(CX+CW, CY+CH/2); ctx.lineTo(522, 90+80); ctx.stroke();

    // ── Info panel ────────────────────────────────────────────────────────
    const IX=12, IY=248, IW=730, IH=85;
    ctx.fillStyle='rgba(6,6,12,0.93)'; ctx.beginPath(); ctx.roundRect(IX,IY,IW,IH,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 11px Fira Code'; ctx.fillText('Gemini (Google DeepMind, 2023)',IX+8,IY+14);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    const infoLine2='Native multimodal: all modalities tokenized in shared embedding space from the start of training.';
    const infoLine3='Unlike GPT-4V (ViT adapter bolted on), Gemini trains a single model on text+image+audio+video simultaneously.';
    ctx.fillText(infoLine2,IX+8,IY+26);
    ctx.fillText(infoLine3,IX+8,IY+37);
    ctx.fillStyle='#38bdf8'; ctx.font='600 8px Fira Code'; ctx.fillText('Active modalities: '+MODALITIES.filter(m=>m.active).map(m=>m.name).join(' + '),IX+8,IY+52);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='400 7px Fira Code';
    ctx.fillText('Sizes: Gemini Ultra (>500B), Pro (>50B), Nano (<5B)   |   Basis for Gemini 1.5 / 2.0 (2024) with 1M+ token context and Project Astra',IX+8,IY+64);
    const labels=[
      ['#38bdf8','Text'],['#f472b6','Image'],['#34d399','Audio'],['#ffd166','Video']
    ];
    labels.forEach(([col,lbl],i)=>{
      const active=MODALITIES[i].active;
      ctx.fillStyle=active?col:'rgba(255,255,255,0.15)'; ctx.font=(active?'700':'400')+' 8px Fira Code';
      ctx.fillText('■ '+lbl, IX+8+i*80, IY+78);
    });
  }

  function animate() {
    frameCount++;
    if(frameCount%4===0) spawnParticles();
    particles.forEach(p=>{
      p.update();
      if(!p.alive && Math.random()<0.3) addSharedToken(p);
    });
    particles = particles.filter(p=>p.alive);
    draw();
    if(running) rafId=requestAnimationFrame(animate);
  }

  const ctrl=addControls(el);
  MODALITIES.forEach((mod,i)=>{
    const btn=document.createElement('button');btn.className='btn active';btn.textContent=mod.icon+' '+mod.name;
    btn.style.color=mod.color;
    btn.onclick=()=>{mod.active=!mod.active;btn.classList.toggle('active',mod.active);};
    ctrl.appendChild(btn);
  });
  const pauseBtn=document.createElement('button');pauseBtn.className='btn active';pauseBtn.textContent='⏸ Pause';
  pauseBtn.onclick=()=>{running=!running;pauseBtn.textContent=running?'⏸ Pause':'▶ Run';if(running)animate();};ctrl.appendChild(pauseBtn);

  animate();
  return ()=>{try{running=false;if(rafId)cancelAnimationFrame(rafId);if(el)el.innerHTML='';}catch(e){}};
}
