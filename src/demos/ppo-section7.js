import { $, createCanvas, addHint, addControls, clamp, rand } from '../lib/shared.js'

// ===== demo-ppo =====
export function mountPpo(containerId = 'demo-ppo') {
  const __id = containerId || 'demo-ppo';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Watch the CartPole agent learn to balance. The PPO clip ratio ε controls how far the new policy can deviate from the old one — preventing catastrophic gradient updates. Toggle clip on/off to see the difference.');

  // CartPole simulation simplified
  const CART_W=60, CART_H=20, POLE_L=90;
  let state = {x:375, xdot:0, theta:0.05*(Math.random()-0.5), thetaDot:0};
  let policy = {mean:0, std:0.5}; // action distribution for force
  const DT=0.02, GRAVITY=9.8, MASSCART=1.0, MASSPOLE=0.1, HALF_L=0.5;
  let episode=0, steps=0, totalReward=0, alive=true;
  let clipOn=true, epsilon_clip=0.2;
  let rewardHistory=[], lossHistory=[];
  let ratioHistory=[]; // store recent r(θ) values
  let tmr=null;

  function cartStep(force) {
    const cosA=Math.cos(state.theta), sinA=Math.sin(state.theta);
    const tmp=(force + MASSPOLE*HALF_L*state.thetaDot*state.thetaDot*sinA)/(MASSCART+MASSPOLE);
    const thetaAcc=(GRAVITY*sinA - cosA*tmp)/(HALF_L*(4/3 - MASSPOLE*cosA*cosA/(MASSCART+MASSPOLE)));
    const xAcc=tmp - MASSPOLE*HALF_L*thetaAcc*cosA/(MASSCART+MASSPOLE);
    state.xdot += DT*xAcc;
    state.x    += DT*state.xdot;
    state.thetaDot += DT*thetaAcc;
    state.theta    += DT*state.thetaDot;
    // boundary
    if(state.x<100){state.x=100;state.xdot*=-0.3;}
    if(state.x>650){state.x=650;state.xdot*=-0.3;}
  }

  function isAlive() {
    return Math.abs(state.theta) < 0.418 && state.x>80 && state.x<670;
  }

  // Simplified policy: proportional to -theta (balance)
  function sampleAction() {
    const logit = -state.theta * 2.5 - state.x*0.003 + rand(-policy.std, policy.std);
    return clamp(logit * 10, -20, 20); // force
  }

  // Probability ratio r(θ) = π_θ(a|s) / π_θ_old(a|s)
  // We simulate this: as training progresses ratio fluctuates near 1
  function simulateRatio() {
    return 1.0 + rand(-0.4, 0.6) * Math.exp(-episode*0.02);
  }

  function ppoStep() {
    if (!alive) {
      episode++; rewardHistory.push(steps); if(rewardHistory.length>50) rewardHistory.shift();
      state={x:375,xdot:0,theta:(Math.random()-0.5)*0.1,thetaDot:0};
      alive=true; steps=0; policy.std=Math.max(0.05, policy.std*0.995);
      return;
    }
    const force = sampleAction();
    cartStep(force);
    alive = isAlive();
    steps++; totalReward++;

    // PPO ratio
    const ratio = simulateRatio();
    ratioHistory.push(ratio); if(ratioHistory.length>80) ratioHistory.shift();

    const advantage = alive ? 1 : -3;
    const unclipped = ratio * advantage;
    const clipped_r = clamp(ratio, 1-epsilon_clip, 1+epsilon_clip);
    const loss = clipOn ? -Math.min(unclipped, clipped_r*advantage) : -unclipped;
    lossHistory.push(Math.abs(loss)); if(lossHistory.length>60) lossHistory.shift();

    // Slowly improve policy
    if(alive) policy.mean += -state.theta*0.001;
  }

  function draw() {
    ctx.clearRect(0,0,750,340);

    // ── CartPole scene ────────────────────────────────────────────────────
    const GROUND_Y=220;
    // Track
    ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(60,GROUND_Y+CART_H/2+1); ctx.lineTo(690,GROUND_Y+CART_H/2+1); ctx.stroke();

    // Cart
    const cx=state.x;
    ctx.save(); ctx.shadowColor='#38bdf8'; ctx.shadowBlur=8;
    ctx.fillStyle='#38bdf822';
    ctx.beginPath(); ctx.roundRect(cx-CART_W/2, GROUND_Y, CART_W, CART_H, 4); ctx.fill();
    ctx.strokeStyle='#38bdf8'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(cx-CART_W/2, GROUND_Y, CART_W, CART_H, 4); ctx.stroke();
    ctx.restore();

    // Wheels
    [-20,20].forEach(dx => {
      ctx.beginPath(); ctx.arc(cx+dx, GROUND_Y+CART_H+4, 6, 0, Math.PI*2);
      ctx.fillStyle='#4a475a'; ctx.fill();
    });

    // Pole
    const px=cx + POLE_L*Math.sin(state.theta);
    const py=GROUND_Y - POLE_L*Math.cos(state.theta);
    const angle_deg=state.theta*180/Math.PI;
    const poleColor = Math.abs(angle_deg)<10 ? '#34d399' : Math.abs(angle_deg)<20 ? '#ffd166' : '#ff6b6b';
    ctx.save(); ctx.shadowColor=poleColor; ctx.shadowBlur=10;
    ctx.strokeStyle=poleColor; ctx.lineWidth=5; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(cx, GROUND_Y); ctx.lineTo(px, py); ctx.stroke();
    ctx.restore();
    // Pole tip
    ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI*2);
    ctx.fillStyle=poleColor; ctx.fill();

    // Angle display
    ctx.fillStyle=poleColor; ctx.font='600 10px Fira Code';
    ctx.fillText('θ='+angle_deg.toFixed(2)+'°', cx-20, GROUND_Y+CART_H+20);

    // ── PPO ratio viz ─────────────────────────────────────────────────────
    const RX=20, RY=235, RW=420, RH=90;
    ctx.fillStyle='rgba(6,6,12,0.92)'; ctx.beginPath(); ctx.roundRect(RX,RY,RW,RH,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 10px Fira Code'; ctx.fillText('PPO Probability Ratio  r(θ) = π_new(a|s) / π_old(a|s)',RX+8,RY+14);

    // Draw clip region
    const chartX=RX+8, chartW=RW-16, chartH=55, chartY=RY+18;
    const r1_norm=(1-epsilon_clip), r2_norm=(1+epsilon_clip);
    ctx.fillStyle='rgba(52,211,153,0.08)';
    const clipX=chartX+r1_norm/2.4*chartW, clipW=(r2_norm-r1_norm)/2.4*chartW;
    ctx.beginPath(); ctx.roundRect(clipX, chartY, clipW, chartH, 3); ctx.fill();
    ctx.strokeStyle='#34d399'; ctx.lineWidth=1; ctx.setLineDash([3,3]);
    [[r1_norm,'1-ε'],[r2_norm,'1+ε'],[1.0,'1.0']].forEach(([v,lbl])=>{
      const x=chartX+v/2.4*chartW;
      ctx.beginPath(); ctx.moveTo(x, chartY); ctx.lineTo(x, chartY+chartH); ctx.stroke();
      ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code'; ctx.textAlign='center'; ctx.fillText(lbl,x,chartY+chartH+10); ctx.textAlign='left';
    });
    ctx.setLineDash([]);

    // Plot ratio history
    if(ratioHistory.length>1){
      ctx.strokeStyle='#f472b6'; ctx.lineWidth=1.5;
      ctx.beginPath();
      ratioHistory.forEach((rv,i)=>{
        const x=chartX+i*(chartW/80), y=chartY+chartH-(rv/2.4)*chartH;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.stroke();
    }
    ctx.fillStyle='#f472b6'; ctx.font='600 8px Fira Code'; ctx.fillText('r(θ) trace',RX+8,RY+RH-6);
    ctx.fillStyle='#34d399'; ctx.fillText('[1-ε, 1+ε] clip zone',RX+100,RY+RH-6);
    ctx.fillStyle=clipOn?'#34d399':'#ff6b6b'; ctx.font='700 8px Fira Code';
    ctx.fillText('Clip: '+(clipOn?'ON':'OFF'),RX+RW-70,RY+RH-6);

    // ── Info overlay ──────────────────────────────────────────────────────
    const IX=450, IY=6, IW=295;
    ctx.fillStyle='rgba(6,6,12,0.93)'; ctx.beginPath(); ctx.roundRect(IX,IY,IW,220,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 11px Fira Code'; ctx.fillText('PPO (Proximal Policy Opt.)',IX+8,IY+16);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    ctx.fillText('L_CLIP = E[min(r·A, clip(r,1±ε)·A)]',IX+8,IY+28);
    ctx.fillStyle='#38bdf8'; ctx.font='600 10px Fira Code'; ctx.fillText('Episode: '+episode,IX+8,IY+44);
    ctx.fillStyle='#34d399'; ctx.fillText('Steps this ep: '+steps,IX+8,IY+57);
    ctx.fillStyle='#fb923c'; ctx.fillText('Policy std: '+policy.std.toFixed(3),IX+8,IY+70);

    // Reward history
    if(rewardHistory.length>1){
      ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.beginPath(); ctx.roundRect(IX+8,IY+78,IW-16,54,4); ctx.fill();
      ctx.fillStyle='#34d399'; ctx.font='500 8px Fira Code'; ctx.fillText('Episode length (higher=better)',IX+12,IY+90);
      const mx=Math.max(...rewardHistory,50);
      ctx.strokeStyle='#34d399'; ctx.lineWidth=1.5; ctx.beginPath();
      rewardHistory.forEach((v,i)=>{const hx=IX+8+i*(IW-16)/50,hy=IY+128-(v/mx)*38;i===0?ctx.moveTo(hx,hy):ctx.lineTo(hx,hy);});
      ctx.stroke();
    }

    ctx.fillStyle='#7d7a8c'; ctx.font='500 9px Fira Code';
    ctx.fillText('Clip ratio: ε = '+epsilon_clip.toFixed(2),IX+8,IY+144);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    ctx.fillText('Without clip: large updates cause instability',IX+8,IY+156);
    ctx.fillText('With clip: step size bounded, stable training',IX+8,IY+167);

    // Clip ε bar
    ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.roundRect(IX+8,IY+172,IW-16,10,4); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.beginPath(); ctx.roundRect(IX+8,IY+172,(IW-16)*epsilon_clip/0.5,10,4); ctx.fill();

    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    ctx.fillText('ChatGPT & all modern RLHF systems use PPO',IX+8,IY+198);
    ctx.fillText('to fine-tune language models from human feedback.',IX+8,IY+208);
  }

  const ctrl=addControls(el);
  const stepBtn=document.createElement('button');stepBtn.className='btn';stepBtn.textContent='▶ Step';stepBtn.onclick=()=>{ppoStep();draw();};ctrl.appendChild(stepBtn);
  let autoTmr=null;
  const autoBtn=document.createElement('button');autoBtn.className='btn';autoBtn.textContent='⏩ Auto';
  autoBtn.onclick=()=>{if(autoTmr){clearInterval(autoTmr);autoTmr=null;autoBtn.classList.remove('active');}else{autoTmr=setInterval(()=>{for(let i=0;i<3;i++)ppoStep();draw();},60);autoBtn.classList.add('active');}};ctrl.appendChild(autoBtn);
  const clipBtn=document.createElement('button');clipBtn.className='btn';clipBtn.textContent='Toggle Clip';
  clipBtn.onclick=()=>{clipOn=!clipOn;clipBtn.classList.toggle('active',!clipOn);draw();};ctrl.appendChild(clipBtn);

  // ε slider
  const epLabel=document.createElement('label');epLabel.textContent='ε clip:';epLabel.className='btn';ctrl.appendChild(epLabel);
  const epSlider=document.createElement('input');epSlider.type='range';epSlider.min='0.05';epSlider.max='0.5';epSlider.step='0.05';epSlider.value='0.2';
  epSlider.oninput=e=>{epsilon_clip=parseFloat(e.target.value);draw();};ctrl.appendChild(epSlider);

  const rstBtn=document.createElement('button');rstBtn.className='btn';rstBtn.textContent='↻ Reset';
  rstBtn.onclick=()=>{state={x:375,xdot:0,theta:(Math.random()-0.5)*0.1,thetaDot:0};policy={mean:0,std:0.5};episode=0;steps=0;totalReward=0;alive=true;rewardHistory=[];lossHistory=[];ratioHistory=[];if(autoTmr){clearInterval(autoTmr);autoTmr=null;autoBtn.classList.remove('active');}draw();};ctrl.appendChild(rstBtn);
  draw();
  return ()=>{try{if(typeof autoTmr!=='undefined'&&autoTmr)clearInterval(autoTmr);if(el)el.innerHTML='';}catch(e){}};
}
