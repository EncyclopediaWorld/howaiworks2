import { $, createCanvas, addHint, addControls, clamp } from '../lib/shared.js'

// ===== demo-dqn =====
export function mountDqn(containerId = 'demo-dqn') {
  const __id = containerId || 'demo-dqn';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Watch DQN replace the Q-table with a neural network. Experience Replay stores transitions; the network learns from random mini-batches — breaking correlation. Click ⚡ Train to watch the loss and Q-values converge.');

  const ROWS = 4, COLS = 6, CELL = 44, OX = 12, OY = 22;
  let grid = [
    [0,0,0,0,0,0],
    [0,1,1,0,1,0],
    [0,0,0,0,1,0],
    [0,1,0,0,0,2],
  ];
  const ACTIONS = [[-1,0],[1,0],[0,-1],[0,1]];

  // Tiny 2-layer Q-network weights (state=8 floats → hidden=8 → output=4)
  // state: [r/R, c/C, goalR/R, goalC/C, wallN, wallS, wallW, wallE]
  let W1 = Array.from({length:8}, () => Array.from({length:8}, () => (Math.random()-0.5)*0.5));
  let b1 = new Float32Array(8);
  let W2 = Array.from({length:8}, () => new Float32Array(4).map(() => (Math.random()-0.5)*0.5));
  let b2 = new Float32Array(4);

  const relu = x => Math.max(0, x);
  function forward(s) {
    const h = b1.map((bi, i) => relu(bi + W1[i].reduce((sum, w, j) => sum + w*s[j], 0)));
    return b2.map((bi, i) => bi + W2[i].reduce((sum, w, j) => sum + w*h[j], 0));
  }
  function stateVec(r, c, gr, gc) {
    const isWall = (nr, nc) => nr<0||nr>=ROWS||nc<0||nc>=COLS||grid[nr][nc]===1 ? 1 : 0;
    return [r/ROWS, c/COLS, gr/ROWS, gc/COLS,
            isWall(r-1,c), isWall(r+1,c), isWall(r,c-1), isWall(r,c+1)];
  }
  function findGoal() { for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(grid[r][c]===2) return {r,c}; return {r:3,c:5}; }

  // Replay buffer
  const BUFFER_SIZE = 200, BATCH = 16;
  let replay = [];
  let agR=0, agC=0, epsilon=1.0, totalSteps=0, episode=0, loss=0;
  let lossHistory=[], rewardHistory=[];
  let path=[{r:0,c:0}], episodeReward=0;
  const alpha=0.05, gamma=0.9;

  function isWall(r,c){return r<0||r>=ROWS||c<0||c>=COLS||grid[r][c]===1;}
  function isGoal(r,c){return grid[r][c]===2;}

  function trainStep() {
    const goal = findGoal();
    const s = stateVec(agR, agC, goal.r, goal.c);
    const qVals = forward(s);
    let action;
    if (Math.random() < epsilon) action = Math.floor(Math.random()*4);
    else action = qVals.indexOf(Math.max(...qVals));

    const [dr,dc] = ACTIONS[action];
    const nr = agR+dr, nc = agC+dc;
    const nextR = isWall(nr,nc) ? agR : nr;
    const nextC = isWall(nr,nc) ? agC : nc;
    const r = isGoal(nextR,nextC) ? 10 : isWall(nr,nc) ? -1 : -0.1;

    replay.push({s, a:action, r, ns:stateVec(nextR,nextC,goal.r,goal.c), done:isGoal(nextR,nextC)});
    if (replay.length > BUFFER_SIZE) replay.shift();

    agR = nextR; agC = nextC;
    path.push({r:agR,c:agC}); if(path.length>20) path.shift();
    totalSteps++; episodeReward += r;

    if (isGoal(agR,agC) || totalSteps % 60 === 0) {
      episode++; rewardHistory.push(episodeReward);
      if(rewardHistory.length>40) rewardHistory.shift();
      epsilon = Math.max(0.05, epsilon*0.98);
      agR=0; agC=0; episodeReward=0; path=[{r:0,c:0}];
    }

    // Mini-batch SGD update
    if (replay.length >= BATCH) {
      const batch = Array.from({length:BATCH}, () => replay[Math.floor(Math.random()*replay.length)]);
      let totalLoss = 0;
      batch.forEach(({s:bs, a:ba, r:br, ns, done}) => {
        const qNext = done ? 0 : Math.max(...forward(ns));
        const target = br + gamma * qNext;
        const qPred = forward(bs);
        const err = target - qPred[ba];
        totalLoss += err*err;
        // Simplified gradient update on output layer
        b2[ba] += alpha * err * 0.1;
        for (let j=0;j<8;j++) W2[j][ba] += alpha * err * relu(b1[j] + W1[j].reduce((s2,w,k)=>s2+w*bs[k],0)) * 0.05;
      });
      loss = totalLoss / BATCH;
      lossHistory.push(loss); if(lossHistory.length>60) lossHistory.shift();
    }
  }

  function draw() {
    ctx.clearRect(0,0,750,340);
    const goal = findGoal();

    // ── Grid ─────────────────────────────────────────────────────────────
    for(let r=0;r<ROWS;r++) for(let c2=0;c2<COLS;c2++) {
      const x=OX+c2*CELL, y=OY+r*CELL;
      if(grid[r][c2]===1){ctx.fillStyle='#1a1a2e';ctx.beginPath();ctx.roundRect(x+1,y+1,CELL-2,CELL-2,4);ctx.fill();continue;}
      if(grid[r][c2]===2){
        ctx.save();ctx.shadowColor='#34d399';ctx.shadowBlur=14;
        ctx.fillStyle='#34d39933';ctx.beginPath();ctx.roundRect(x+1,y+1,CELL-2,CELL-2,4);ctx.fill();
        ctx.strokeStyle='#34d399';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(x+1,y+1,CELL-2,CELL-2,4);ctx.stroke();
        ctx.restore();ctx.font='18px sans-serif';ctx.textAlign='center';ctx.fillText('🏆',x+CELL/2,y+CELL/2+6);ctx.textAlign='left';continue;
      }
      const sv = stateVec(r,c2,goal.r,goal.c);
      const qv = forward(sv);
      const maxQ = Math.max(...qv);
      const col = maxQ > 2 ? '#34d399' : maxQ > 0 ? '#ffd166' : '#ff6b6b';
      ctx.fillStyle = col+'18';ctx.beginPath();ctx.roundRect(x+1,y+1,CELL-2,CELL-2,4);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x+1,y+1,CELL-2,CELL-2,4);ctx.stroke();
      const arrows=['↑','↓','←','→'];
      if(maxQ>0.1){
        const bestA=qv.indexOf(maxQ);
        ctx.fillStyle=col+'cc';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText(arrows[bestA],x+CELL/2,y+CELL/2+5);ctx.textAlign='left';
      }
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='400 7px Fira Code';ctx.textAlign='center';
      ctx.fillText(maxQ.toFixed(1),x+CELL/2,y+CELL-3);ctx.textAlign='left';
    }

    // Path trail
    path.forEach((p,i)=>{
      const x=OX+p.c*CELL+CELL/2, y=OY+p.r*CELL+CELL/2;
      ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,209,102,${(i+1)/path.length*0.5})`;ctx.fill();
    });
    // Agent
    const ax=OX+agC*CELL+CELL/2, ay=OY+agR*CELL+CELL/2;
    ctx.save();ctx.shadowColor='#ffd166';ctx.shadowBlur=18;
    ctx.beginPath();ctx.arc(ax,ay,10,0,Math.PI*2);ctx.fillStyle='#ffd166';ctx.fill();ctx.restore();
    ctx.fillStyle='#06060c';ctx.font='700 9px Fira Code';ctx.textAlign='center';ctx.fillText('A',ax,ay+4);ctx.textAlign='left';

    // ── Neural network viz ───────────────────────────────────────────────
    const NX=295, NY=8;
    ctx.fillStyle='rgba(6,6,12,0.92)';ctx.beginPath();ctx.roundRect(NX,NY,210,200,8);ctx.fill();
    ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Q-Network',NX+8,NY+14);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('State → NN → Q(s,a)',NX+8,NY+25);

    const layers=[['State',8,'#38bdf8'],['Hidden',8,'#a78bfa'],['Q-vals',4,'#ffd166']];
    const LX=[NX+16,NX+88,NX+162];
    layers.forEach(([lbl,n,col],li)=>{
      ctx.fillStyle=col;ctx.font='500 8px Fira Code';ctx.textAlign='center';ctx.fillText(lbl,LX[li]+20,NY+38);ctx.textAlign='left';
      for(let ni=0;ni<n;ni++){
        const ny2=NY+48+ni*17;
        ctx.beginPath();ctx.arc(LX[li]+20,ny2,6,0,Math.PI*2);
        ctx.fillStyle=col+'44';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=1;ctx.stroke();
        if(li===2){const qv=forward(stateVec(agR,agC,goal.r,goal.c));
          const v=qv[ni],mn=Math.min(...qv),mx=Math.max(...qv);
          const frac=mx>mn?(v-mn)/(mx-mn):0.5;
          ctx.fillStyle=`rgba(255,209,102,${0.3+frac*0.7})`;ctx.beginPath();ctx.arc(LX[li]+20,ny2,6,0,Math.PI*2);ctx.fill();
          const arrows2=['↑','↓','←','→'];
          ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText(arrows2[ni]+' '+v.toFixed(1),LX[li]+30,ny2+3);
        }
        if(li<2){ctx.strokeStyle=col+'22';ctx.lineWidth=0.5;
          for(let ni2=0;ni2<layers[li+1][1];ni2++){ctx.beginPath();ctx.moveTo(LX[li]+26,ny2);ctx.lineTo(LX[li+1]+14,NY+48+ni2*17);ctx.stroke();}}
      }
    });

    // ── Replay buffer viz ────────────────────────────────────────────────
    ctx.fillStyle='rgba(6,6,12,0.92)';ctx.beginPath();ctx.roundRect(NX,NY+208,210,34,8);ctx.fill();
    ctx.fillStyle='#fb923c';ctx.font='600 9px Fira Code';ctx.fillText('Replay Buffer',NX+8,NY+222);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText(replay.length+'/'+BUFFER_SIZE+' transitions',NX+8,NY+234);
    ctx.fillStyle='rgba(255,255,255,0.06)';ctx.beginPath();ctx.roundRect(NX+120,NY+213,80,20,3);ctx.fill();
    ctx.fillStyle='#fb923c';ctx.beginPath();ctx.roundRect(NX+120,NY+213,80*replay.length/BUFFER_SIZE,20,3);ctx.fill();

    // ── Info overlay ─────────────────────────────────────────────────────
    const IX=520, IY=NY, IW=224;
    ctx.fillStyle='rgba(6,6,12,0.93)';ctx.beginPath();ctx.roundRect(IX,IY,IW,154,8);ctx.fill();
    ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('DQN',IX+8,IY+16);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    ctx.fillText('Q(s,a;θ)←r+γ max Q(s\',a\';θ⁻)',IX+8,IY+28);
    ctx.fillStyle='#38bdf8';ctx.font='600 10px Fira Code';ctx.fillText('Episode: '+episode,IX+8,IY+44);
    ctx.fillStyle='#34d399';ctx.fillText('Steps: '+totalSteps,IX+8,IY+57);
    ctx.fillStyle='#fb923c';ctx.fillText('ε = '+epsilon.toFixed(3),IX+8,IY+70);
    ctx.fillStyle='rgba(255,255,255,0.06)';ctx.beginPath();ctx.roundRect(IX+8,IY+74,(IW-16),9,3);ctx.fill();
    ctx.fillStyle='#fb923c';ctx.beginPath();ctx.roundRect(IX+8,IY+74,(IW-16)*epsilon,9,3);ctx.fill();
    ctx.fillStyle=loss<1?'#34d399':loss<5?'#ffd166':'#ff6b6b';ctx.font='600 10px Fira Code';
    ctx.fillText('Loss: '+loss.toFixed(3),IX+8,IY+97);
    if(lossHistory.length>2){
      ctx.fillStyle='rgba(255,255,255,0.04)';ctx.beginPath();ctx.roundRect(IX+8,IY+102,IW-16,44,4);ctx.fill();
      const mn=0,mx2=Math.max(...lossHistory,1);
      ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.5;ctx.beginPath();
      lossHistory.forEach((v,i)=>{const hx=IX+8+i*(IW-16)/60,hy=IY+144-(v/mx2)*38;i===0?ctx.moveTo(hx,hy):ctx.lineTo(hx,hy);});ctx.stroke();
      ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('loss↓',IX+12,IY+112);
    }

    // Reward chart
    if(rewardHistory.length>2){
      ctx.fillStyle='rgba(6,6,12,0.93)';ctx.beginPath();ctx.roundRect(IX,IY+160,IW,72,8);ctx.fill();
      ctx.fillStyle='#34d399';ctx.font='500 8px Fira Code';ctx.fillText('Episode reward',IX+8,IY+174);
      const mn=Math.min(...rewardHistory),mx2=Math.max(...rewardHistory,1),range=mx2-mn||1;
      ctx.strokeStyle='#34d399';ctx.lineWidth=1.5;ctx.beginPath();
      rewardHistory.forEach((v,i)=>{const hx=IX+8+i*(IW-16)/40,hy=IY+224-((v-mn)/range)*40;i===0?ctx.moveTo(hx,hy):ctx.lineTo(hx,hy);});ctx.stroke();
    }
  }

  const ctrl=addControls(el);
  const stepBtn=document.createElement('button');stepBtn.className='btn';stepBtn.textContent='▶ Step';stepBtn.onclick=()=>{trainStep();draw();};ctrl.appendChild(stepBtn);
  let autoTmr=null;
  const autoBtn=document.createElement('button');autoBtn.className='btn';autoBtn.textContent='⏩ Auto';
  autoBtn.onclick=()=>{if(autoTmr){clearInterval(autoTmr);autoTmr=null;autoBtn.classList.remove('active');}else{autoTmr=setInterval(()=>{for(let i=0;i<4;i++)trainStep();draw();},60);autoBtn.classList.add('active');}};ctrl.appendChild(autoBtn);
  const fastBtn=document.createElement('button');fastBtn.className='btn';fastBtn.textContent='⚡ Train 500';fastBtn.onclick=()=>{for(let i=0;i<500;i++)trainStep();draw();};ctrl.appendChild(fastBtn);
  const rstBtn=document.createElement('button');rstBtn.className='btn';rstBtn.textContent='↻ Reset';
  rstBtn.onclick=()=>{W1=Array.from({length:8},()=>Array.from({length:8},()=>(Math.random()-0.5)*0.5));b1=new Float32Array(8);W2=Array.from({length:8},()=>new Float32Array(4).map(()=>(Math.random()-0.5)*0.5));b2=new Float32Array(4);replay=[];epsilon=1.0;totalSteps=0;episode=0;loss=0;lossHistory=[];rewardHistory=[];agR=0;agC=0;episodeReward=0;path=[{r:0,c:0}];if(autoTmr){clearInterval(autoTmr);autoTmr=null;autoBtn.classList.remove('active');}draw();};ctrl.appendChild(rstBtn);
  draw();
  return ()=>{try{if(c)c.onclick=null;if(typeof autoTmr!=='undefined'&&autoTmr)clearInterval(autoTmr);if(el)el.innerHTML='';}catch(e){}};
}
