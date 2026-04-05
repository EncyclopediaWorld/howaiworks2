import { $, createCanvas, addHint, addControls, rand, clamp } from '../lib/shared.js'

// ===== demo-stable-diffusion =====
export function mountStableDiffusion(containerId = 'demo-stable-diffusion') {
  const __id = containerId || 'demo-stable-diffusion';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Stable Diffusion works in a compressed latent space — 8× smaller than pixels — guided by a text prompt. Each denoising step refines the latent (right panel) toward the target concept. Try different prompts and watch the semantic guidance change the denoising direction.');

  const PROMPTS=['a cat sitting on a mat','a mountain at sunset','a red car on a road','a robot reading a book','abstract blue swirls'];
  let promptIdx=0;
  const LATENT_H=24, LATENT_W=32; // latent grid (compressed representation)
  let latentNoise, latentClean, latentCurrent;
  let noisyPixels, cleanPixels;
  const TOTAL_STEPS=50;
  let currentStep=0;
  let running=false;
  let rafId=null;

  // Palette per prompt (simulates semantic guidance)
  const palettes=[
    [[80,120,60],[140,100,80],[220,200,180]], // cat on mat
    [[255,140,40],[200,80,40],[70,90,150]],   // mountain sunset
    [[200,50,30],[140,60,40],[80,100,80]],    // red car
    [[40,80,160],[180,180,200],[80,60,40]],   // robot
    [[20,60,200],[40,120,220],[200,200,255]]  // abstract blue
  ];

  function sampleNoise(rows, cols) {
    return Array.from({length:rows}, () => Array.from({length:cols}, () => ({r:rand(0,1),g:rand(0,1),b:rand(0,1)})));
  }

  function buildClean(rows, cols, pIdx) {
    const pal = palettes[pIdx];
    return Array.from({length:rows}, (_, i) => Array.from({length:cols}, (_, j) => {
      const px = j/cols, py = i/rows;
      // Simple spatial blend for each prompt category
      const t = px*0.5 + py*0.5;
      const pidx2 = Math.floor(t*pal.length);
      const pt = (t*pal.length)%1;
      const c1 = pal[Math.min(pidx2, pal.length-1)];
      const c2 = pal[Math.min(pidx2+1, pal.length-1)];
      // Add some spatial structure
      const wv = Math.sin(j/4+i/3)*0.15+0.5;
      return {
        r:(c1[0]*(1-pt)+c2[0]*pt)/255*0.7+wv*0.3,
        g:(c1[1]*(1-pt)+c2[1]*pt)/255*0.7+wv*0.3,
        b:(c1[2]*(1-pt)+c2[2]*pt)/255*0.7+wv*0.3
      };
    }));
  }

  function init() {
    latentNoise = sampleNoise(LATENT_H, LATENT_W);
    latentClean = buildClean(LATENT_H, LATENT_W, promptIdx);
    latentCurrent = latentNoise.map(row => row.map(cell => ({...cell})));
    currentStep=0;
  }

  function denoiseStep() {
    const t = currentStep/TOTAL_STEPS; // 0→1 = noisy→clean
    const alphaBar = 1 - t; // simplified: linear in this demo
    for(let i=0;i<LATENT_H;i++){
      for(let j=0;j<LATENT_W;j++){
        const noise = latentNoise[i][j];
        const clean = latentClean[i][j];
        // x_t = sqrt(αbar)*x0 + sqrt(1-αbar)*ε
        const abar = (1-t)*(1-t); // cosine-like decay
        const residual = 1-abar;
        latentCurrent[i][j] = {
          r: abar*clean.r + residual*noise.r*(1-t*0.5),
          g: abar*clean.g + residual*noise.g*(1-t*0.5),
          b: abar*clean.b + residual*noise.b*(1-t*0.5)
        };
      }
    }
    currentStep++;
    if(currentStep>TOTAL_STEPS){ currentStep=TOTAL_STEPS; running=false; }
  }

  function drawLatent(lx, ly, lw, lh, data, label) {
    const cw=lw/LATENT_W, ch=lh/LATENT_H;
    for(let i=0;i<LATENT_H;i++){
      for(let j=0;j<LATENT_W;j++){
        const d=data[i][j];
        const r=Math.floor(clamp(d.r*255,0,255)), g=Math.floor(clamp(d.g*255,0,255)), b=Math.floor(clamp(d.b*255,0,255));
        ctx.fillStyle=`rgb(${r},${g},${b})`;
        ctx.fillRect(lx+j*cw, ly+i*ch, cw, ch);
      }
    }
    ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=1;
    ctx.strokeRect(lx, ly, lw, lh);
    ctx.fillStyle='rgba(6,6,12,0.7)'; ctx.beginPath(); ctx.roundRect(lx+2, ly+lh-16, lw-4, 14, 3); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='500 8px Fira Code'; ctx.textAlign='center';
    ctx.fillText(label, lx+lw/2, ly+lh-5); ctx.textAlign='left';
  }

  function draw() {
    ctx.clearRect(0,0,750,340);

    // ── Header ───────────────────────────────────────────────────────────
    const t=currentStep/TOTAL_STEPS;
    ctx.fillStyle='rgba(6,6,12,0.8)'; ctx.beginPath(); ctx.roundRect(8,6,580,28,6); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 11px Fira Code';
    ctx.fillText('Stable Diffusion — Latent Denoising',12,24);

    // Prompt
    ctx.fillStyle='rgba(6,6,12,0.9)'; ctx.beginPath(); ctx.roundRect(8,36,430,22,6); ctx.fill();
    ctx.fillStyle='#38bdf8'; ctx.font='600 9px Fira Code';
    ctx.fillText('Prompt: "'+PROMPTS[promptIdx]+'"',14,50);

    // ── Latent panels ─────────────────────────────────────────────────────
    const panelW=192, panelH=144;
    // Noise (input)
    drawLatent(12, 64, panelW, panelH, latentNoise, 'Pure Noise  z_T');
    // Current denoising
    drawLatent(217, 64, panelW, panelH, latentCurrent, `Denoised  z_${Math.max(0,TOTAL_STEPS-currentStep)} (step ${currentStep})`);
    // Target clean
    drawLatent(422, 64, panelW, panelH, latentClean, 'Target latent  z_0');

    // Arrow: noise → current
    ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(12+panelW+4, 64+panelH/2); ctx.lineTo(217-4, 64+panelH/2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='600 9px Fira Code'; ctx.textAlign='center';
    ctx.fillText('U-Net\nDenoiser', (12+panelW+217)/2, 64+panelH/2-4); ctx.textAlign='left';
    // Arrow: current → target
    ctx.strokeStyle='rgba(52,211,153,0.3)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(217+panelW+4, 64+panelH/2); ctx.lineTo(422-4, 64+panelH/2); ctx.stroke();

    // ── Noise schedule bar ────────────────────────────────────────────────
    const SX=12, SY=220, SW=600, SH=14;
    ctx.fillStyle='rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.roundRect(SX,SY,SW,SH,4); ctx.fill();
    // Gradient fill
    const grad=ctx.createLinearGradient(SX,0,SX+SW,0);
    grad.addColorStop(0,'rgba(248,113,113,0.9)'); grad.addColorStop(0.5,'rgba(251,146,60,0.8)'); grad.addColorStop(1,'rgba(52,211,153,0.9)');
    ctx.fillStyle=grad; ctx.beginPath(); ctx.roundRect(SX,SY,SW*t,SH,4); ctx.fill();
    // current step tick
    ctx.strokeStyle='#fff'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(SX+SW*t,SY-2); ctx.lineTo(SX+SW*t,SY+SH+2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='500 8px Fira Code'; ctx.textAlign='center';
    ctx.fillText('Denoising step'+' '+currentStep+'/'+TOTAL_STEPS,SX+SW/2,SY+SH+12); ctx.textAlign='left';
    ctx.fillStyle='#ff7b7b'; ctx.font='500 7px Fira Code'; ctx.fillText('T (noisy)',SX,SY-3);
    ctx.fillStyle='#34d399'; ctx.textAlign='right'; ctx.fillText('0 (clean)',SX+SW,SY-3); ctx.textAlign='left';

    // ── Info overlay ──────────────────────────────────────────────────────
    const IX=622, IY=6, IW=124, IH=330;
    ctx.fillStyle='rgba(6,6,12,0.93)'; ctx.beginPath(); ctx.roundRect(IX,IY,IW,IH,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 9px Fira Code'; ctx.fillText('Stable Diffusion',IX+6,IY+14);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 7px Fira Code'; ctx.fillText('Latent Diffusion\n2022',IX+6,IY+25);
    ctx.fillStyle='#38bdf8'; ctx.font='500 7px Fira Code';
    ctx.fillText('Latent space: 64×',IX+6,IY+38);
    ctx.fillText('smaller than pixels',IX+6,IY+48);
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.fillText('q(z_t|z_0) =',IX+6,IY+62);
    ctx.fillText(' N(√ᾱ·z₀, (1-ᾱ)I)',IX+6,IY+72);
    ctx.fillText('',IX+6,IY+82);
    ctx.fillText('U-Net predicts',IX+6,IY+88);
    ctx.fillText('noise ε_θ(z_t,t)',IX+6,IY+98);
    ctx.fillText('conditioned on',IX+6,IY+108);
    ctx.fillText('CLIP text embed',IX+6,IY+118);
    ctx.fillStyle='#34d399'; ctx.font='600 7px Fira Code';
    ctx.fillText('CFG guidance:',IX+6,IY+132);
    ctx.fillText('ε = ε_uncond +',IX+6,IY+142);
    ctx.fillText('  γ(ε_cond−',IX+6,IY+152);
    ctx.fillText('   ε_uncond)',IX+6,IY+162);
    ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='400 7px Fira Code';
    ctx.fillText('γ=cfg scale (7.5)',IX+6,IY+174);
    ctx.fillText('ᾱ_t: noise sched',IX+6,IY+187);
    ctx.fillStyle='#fb923c'; ctx.font='500 7px Fira Code';
    ctx.fillText('≈800M params',IX+6,IY+202);
    ctx.fillText('LAION-5B trained',IX+6,IY+212);
    ctx.fillText('Open weights 2022',IX+6,IY+222);
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='400 7px Fira Code';
    ctx.fillText('VAE encodes to',IX+6,IY+238);
    ctx.fillText('latent z_0, then',IX+6,IY+248);
    ctx.fillText('decodes back to',IX+6,IY+258);
    ctx.fillText('pixel space',IX+6,IY+268);
    const pct=t*100;
    const qual = t>0.9?'#34d399':t>0.5?'#ffd166':'#ff7b7b';
    ctx.fillStyle=qual; ctx.font='600 8px Fira Code';
    ctx.fillText(pct.toFixed(0)+'% clean',IX+6,IY+284);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='400 7px Fira Code';
    ctx.fillText('DDPM/DDIM/LMS',IX+6,IY+298);
    ctx.fillText('samplers differ in',IX+6,IY+308);
    ctx.fillText('speed vs quality',IX+6,IY+318);
  }

  function animate() {
    denoiseStep();
    draw();
    if(running) rafId=requestAnimationFrame(animate);
  }

  const ctrl=addControls(el);
  const runBtn=document.createElement('button');runBtn.className='btn';runBtn.textContent='▶ Denoise';
  runBtn.onclick=()=>{running=!running;runBtn.textContent=running?'⏸ Pause':'▶ Denoise';runBtn.classList.toggle('active',running);if(running)animate();};ctrl.appendChild(runBtn);
  const resetBtn=document.createElement('button');resetBtn.className='btn';resetBtn.textContent='↻ Reset';
  resetBtn.onclick=()=>{running=false;runBtn.textContent='▶ Denoise';runBtn.classList.remove('active');if(rafId)cancelAnimationFrame(rafId);init();draw();};ctrl.appendChild(resetBtn);
  PROMPTS.forEach((p,i)=>{
    const pb=document.createElement('button');pb.className='btn'+(i===0?' active':'');
    pb.textContent=p.split(' ').slice(1,3).join(' ');
    pb.onclick=()=>{promptIdx=i;init();draw();document.querySelectorAll('#'+__id+' .btn').forEach(b=>b.classList.remove('active'));pb.classList.add('active');};
    ctrl.appendChild(pb);
  });

  init(); draw();
  return ()=>{try{running=false;if(rafId)cancelAnimationFrame(rafId);if(el)el.innerHTML='';}catch(e){}};
}
