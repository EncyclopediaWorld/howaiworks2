import { $, createCanvas, addHint, addControls, clamp } from '../lib/shared.js'

// ===== demo-qlearning =====
export function mountQLearning(containerId = 'demo-qlearning') {
  const __id = containerId || 'demo-qlearning';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Watch the agent (yellow dot) explore the grid. Q-values update as it learns — green = good paths, red = dead ends. Click any cell to move the goal there.');

  // ── Grid world ──────────────────────────────────────────────────────────
  const ROWS = 5, COLS = 7;
  const CELL = 46;
  const OX   = 18, OY = 28; // grid origin

  // 0=free, 1=wall, 2=goal
  let grid = [
    [0,0,0,0,0,0,0],
    [0,1,1,0,1,0,0],
    [0,0,0,0,1,0,0],
    [0,1,0,1,1,0,0],
    [0,0,0,0,0,0,2],
  ];

  const ACTIONS = [[-1,0],[1,0],[0,-1],[0,1]]; // up,down,left,right
  const ACT_NAMES = ['↑','↓','←','→'];

  // Q-table: [row][col][action]
  let Q = Array.from({length: ROWS}, () =>
    Array.from({length: COLS}, () => new Float32Array(4))
  );
  let agR = 0, agC = 0;
  let episode = 0, steps = 0, totalSteps = 0;
  let epsilon = 1.0;
  const alpha = 0.3, gamma = 0.9;
  let path  = [{r:0,c:0}];
  let tmr   = null;
  let episodeReward = 0;
  let rewardHistory = [];

  function findGoal() {
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c] === 2) return {r,c};
    return {r:4, c:6};
  }
  function isWall(r,c) { return r<0||r>=ROWS||c<0||c>=COLS||grid[r][c]===1; }
  function isGoal(r,c) { return grid[r][c]===2; }
  function reward(r,c)  { return isGoal(r,c) ? 10 : -0.1; }

  function resetEpisode() {
    agR = 0; agC = 0; steps = 0; episodeReward = 0;
    path = [{r:0,c:0}];
  }

  function qStep() {
    // ε-greedy
    let action;
    if (Math.random() < epsilon) {
      action = Math.floor(Math.random() * 4);
    } else {
      const qrow = Q[agR][agC];
      action = qrow.indexOf(Math.max(...qrow));
    }
    const [dr, dc] = ACTIONS[action];
    const nr = agR + dr, nc = agC + dc;
    const nextR = isWall(nr, nc) ? agR : nr;
    const nextC = isWall(nr, nc) ? agC : nc;
    const r = reward(nextR, nextC) + (isWall(nr,nc) ? -0.5 : 0);

    // Q-update: Q(s,a) ← Q(s,a) + α [r + γ max_a' Q(s',a') − Q(s,a)]
    const maxNext = isGoal(nextR, nextC) ? 0 : Math.max(...Q[nextR][nextC]);
    Q[agR][agC][action] += alpha * (r + gamma * maxNext - Q[agR][agC][action]);

    agR = nextR; agC = nextC;
    path.push({r: agR, c: agC});
    if (path.length > 30) path.shift();
    steps++; totalSteps++;
    episodeReward += r;

    if (isGoal(agR, agC) || steps > 80) {
      episode++;
      rewardHistory.push(episodeReward);
      if (rewardHistory.length > 50) rewardHistory.shift();
      epsilon = Math.max(0.05, epsilon * 0.97);
      resetEpisode();
    }
  }

  // ── Drawing ──────────────────────────────────────────────────────────────
  function maxQ(r,c) { return Math.max(...Q[r][c]); }
  function globalMaxQ() {
    let m = 0;
    for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) if (!isWall(r,c)) m = Math.max(m, maxQ(r,c));
    return m || 1;
  }
  function bestAction(r,c) { return Q[r][c].indexOf(Math.max(...Q[r][c])); }

  function draw() {
    ctx.clearRect(0, 0, 750, 340);
    const gMax = globalMaxQ();

    // Draw cells
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const x = OX + c * CELL, y = OY + r * CELL;
      if (grid[r][c] === 1) {
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath(); ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 4); ctx.fill();
        ctx.fillStyle = '#3a3a58'; ctx.font = '14px sans-serif'; ctx.textAlign='center';
        ctx.fillText('█', x+CELL/2, y+CELL/2+5); ctx.textAlign='left';
        continue;
      }
      if (grid[r][c] === 2) {
        ctx.save(); ctx.shadowColor='#34d399'; ctx.shadowBlur=16;
        ctx.fillStyle = '#34d399' + '44';
        ctx.beginPath(); ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 4); ctx.fill();
        ctx.strokeStyle = '#34d399'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 4); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = '#34d399'; ctx.font = '18px sans-serif'; ctx.textAlign='center';
        ctx.fillText('🏆', x+CELL/2, y+CELL/2+6); ctx.textAlign='left';
        continue;
      }
      // Color by max Q-value
      const qv = maxQ(r, c);
      const frac = qv / gMax;
      // green = high value, red-ish = low
      const rr = Math.round(lerp(80, 52, frac));
      const gg = Math.round(lerp(160, 211, frac));
      const bb = Math.round(lerp(80, 153, frac));
      ctx.fillStyle = `rgba(${rr},${gg},${bb},${0.08 + frac*0.22})`;
      ctx.beginPath(); ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 4); ctx.fill();

      // Q-value display
      ctx.fillStyle = `rgba(${rr},${gg},${bb},0.9)`;
      ctx.font = '700 8px Fira Code'; ctx.textAlign = 'center';
      ctx.fillText(qv.toFixed(2), x+CELL/2, y+CELL-4);

      // Best action arrow
      if (qv > 0.05) {
        const ba = bestAction(r, c);
        const arrows = ['↑','↓','←','→'];
        ctx.font = '14px sans-serif';
        ctx.fillText(arrows[ba], x+CELL/2, y+CELL/2+5);
      }
      ctx.textAlign = 'left';

      // Grid border
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x+1, y+1, CELL-2, CELL-2, 4); ctx.stroke();
    }

    // Path trail
    ctx.save();
    path.forEach((p, i) => {
      const x = OX + p.c*CELL + CELL/2, y = OY + p.r*CELL + CELL/2;
      const alpha2 = (i+1) / path.length * 0.5;
      ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,209,102,${alpha2})`; ctx.fill();
    });
    ctx.restore();

    // Agent
    const ax = OX + agC*CELL + CELL/2, ay = OY + agR*CELL + CELL/2;
    ctx.save(); ctx.shadowColor='#ffd166'; ctx.shadowBlur=20;
    ctx.beginPath(); ctx.arc(ax, ay, 10, 0, Math.PI*2);
    ctx.fillStyle = '#ffd166'; ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#06060c'; ctx.font = '700 10px Fira Code'; ctx.textAlign='center';
    ctx.fillText('A', ax, ay+4); ctx.textAlign='left';

    // ── Info overlay ───────────────────────────────────────────────────
    const IX = OX + COLS*CELL + 16, IY = OY, IW = 750 - IX - 6;
    ctx.fillStyle = 'rgba(6,6,12,0.93)';
    ctx.beginPath(); ctx.roundRect(IX, IY, IW, 142, 8); ctx.fill();

    ctx.fillStyle = '#ffd166'; ctx.font = '700 11px Fira Code';
    ctx.fillText('Q-Learning', IX+8, IY+16);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('Q(s,a)←Q(s,a)+α[r+γ maxQ(s\')−Q(s,a)]', IX+8, IY+28);

    ctx.fillStyle = '#38bdf8'; ctx.font = '600 10px Fira Code';
    ctx.fillText('Episode: ' + episode, IX+8, IY+44);
    ctx.fillStyle = '#34d399';
    ctx.fillText('Steps: ' + totalSteps, IX+8, IY+57);
    ctx.fillStyle = '#fb923c';
    ctx.fillText('ε = ' + epsilon.toFixed(3), IX+8, IY+70);
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('(exploration rate)', IX+8, IY+82);

    // ε bar
    ctx.fillStyle='rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.roundRect(IX+8, IY+86, IW-16, 9, 3); ctx.fill();
    ctx.fillStyle='#fb923c';
    ctx.beginPath(); ctx.roundRect(IX+8, IY+86, (IW-16)*epsilon, 9, 3); ctx.fill();

    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 8px Fira Code';
    ctx.fillText('α=' + alpha + '  γ=' + gamma, IX+8, IY+108);

    // reward history chart
    if (rewardHistory.length > 1) {
      ctx.fillStyle = 'rgba(6,6,12,0.93)';
      ctx.beginPath(); ctx.roundRect(IX, IY+148, IW, 80, 8); ctx.fill();
      ctx.fillStyle='#7d7a8c'; ctx.font='500 8px Fira Code';
      ctx.fillText('Episode reward history', IX+8, IY+162);
      const mn = Math.min(...rewardHistory), mx2 = Math.max(...rewardHistory, 1);
      const range = mx2 - mn || 1;
      ctx.strokeStyle='#34d399'; ctx.lineWidth=1.5;
      ctx.beginPath();
      rewardHistory.forEach((rv, i) => {
        const hx = IX+8 + i*(IW-16)/50;
        const hy = IY+220 - ((rv-mn)/range)*48;
        i===0 ? ctx.moveTo(hx,hy) : ctx.lineTo(hx,hy);
      });
      ctx.stroke();
      ctx.fillStyle='#34d399'; ctx.font='400 8px Fira Code';
      ctx.fillText('reward ↑', IX+8, IY+228);
    }
  }

  function lerp(a,b,t){return a+(b-a)*t;}

  // ── Canvas interactions ──────────────────────────────────────────────────
  c.onclick = e => {
    const rect = c.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * 750 / rect.width;
    const my = (e.clientY - rect.top) * 340 / rect.height;
    const gc = Math.floor((mx - OX) / CELL), gr = Math.floor((my - OY) / CELL);
    if (gr>=0&&gr<ROWS&&gc>=0&&gc<COLS&&grid[gr][gc]!==1) {
      // Move goal there
      for (let r=0;r<ROWS;r++) for (let c2=0;c2<COLS;c2++) if (grid[r][c2]===2) grid[r][c2]=0;
      grid[gr][gc] = 2;
      // Reset Q table
      Q = Array.from({length:ROWS},()=>Array.from({length:COLS},()=>new Float32Array(4)));
      epsilon=1.0; episode=0; steps=0; totalSteps=0; rewardHistory=[];
      resetEpisode(); draw();
    }
  };

  const ctrl = addControls(el);

  const stepBtn = document.createElement('button'); stepBtn.className='btn';
  stepBtn.textContent='▶ Step';
  stepBtn.onclick=()=>{qStep();draw();};
  ctrl.appendChild(stepBtn);

  let autoTmr=null;
  const autoBtn=document.createElement('button'); autoBtn.className='btn';
  autoBtn.textContent='⏩ Auto';
  autoBtn.onclick=()=>{
    if(autoTmr){clearInterval(autoTmr);autoTmr=null;autoBtn.classList.remove('active');}
    else{autoTmr=setInterval(()=>{for(let i=0;i<5;i++)qStep();draw();},60);autoBtn.classList.add('active');}
  };
  ctrl.appendChild(autoBtn);

  const fastBtn=document.createElement('button'); fastBtn.className='btn';
  fastBtn.textContent='⚡ Train 500';
  fastBtn.onclick=()=>{for(let i=0;i<500;i++)qStep();draw();};
  ctrl.appendChild(fastBtn);

  const rstBtn=document.createElement('button'); rstBtn.className='btn';
  rstBtn.textContent='↻ Reset';
  rstBtn.onclick=()=>{
    Q=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>new Float32Array(4)));
    epsilon=1.0;episode=0;steps=0;totalSteps=0;rewardHistory=[];
    if(autoTmr){clearInterval(autoTmr);autoTmr=null;autoBtn.classList.remove('active');}
    resetEpisode();draw();
  };
  ctrl.appendChild(rstBtn);

  draw();

  return () => {
    try {
      if(c) c.onclick=null;
      if(typeof autoTmr!=='undefined'&&autoTmr)clearInterval(autoTmr);
      if(el)el.innerHTML='';
    } catch(e){}
  };
}
