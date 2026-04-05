import { $, createCanvas, addHint, addControls, rand, clamp, TAU } from '../lib/shared.js'

// ===== demo-alphago =====
export function mountAlphaGo(containerId = 'demo-alphago') {
  const __id = containerId || 'demo-alphago';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Click any empty intersection to place a stone. AlphaGo\'s Policy Network shows move probabilities as a heat-map. Press ▶ MCTS to simulate AlphaGo\'s tree search and pick the best move.');

  const BOARD = 7; // 7×7 simplified board
  const CELL = 36, OX = 26, OY = 26;
  let board = Array.from({length:BOARD}, () => new Int8Array(BOARD)); // 0=empty, 1=black, -1=white
  let turn = 1; // 1=Black, -1=White(AI)
  let mctsResult = null; // {r,c,visits,value}[]
  let policyMap = null;  // [BOARD][BOARD] float
  let mctsRunning = false;

  function posXY(r, c) { return [OX + c*CELL, OY + r*CELL]; }

  // Fake policy network: prefer center + liberties
  function computePolicy() {
    const pm = Array.from({length:BOARD}, ()=>new Float32Array(BOARD));
    let sum = 0;
    for (let r=0;r<BOARD;r++) for (let c=0;c<BOARD;c++) {
      if (board[r][c] !== 0) { pm[r][c]=0; continue; }
      // Heuristic: center bias + adjacent to existing stones
      const dr=r-(BOARD-1)/2, dc=c-(BOARD-1)/2;
      let score = Math.exp(-0.15*(dr*dr+dc*dc));
      for(const [dr2,dc2] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr=r+dr2, nc=c+dc2;
        if(nr>=0&&nr<BOARD&&nc>=0&&nc<COLS&&board[nr]?.[nc]!==0) score*=1.5;
      }
      pm[r][c]=score; sum+=score;
    }
    if(sum>0) for(let r=0;r<BOARD;r++) for(let c=0;c<BOARD;c++) pm[r][c]/=sum;
    return pm;
  }
  const COLS = BOARD;

  // Simplified MCTS: simulate N=40 random rollouts per candidate move
  function runMCTS() {
    mctsRunning = true; draw();
    const moves=[];
    for(let r=0;r<BOARD;r++) for(let c=0;c<BOARD;c++) if(board[r][c]===0) moves.push({r,c});
    if(!moves.length){mctsRunning=false;draw();return;}
    const SIMS = 20;
    const results = moves.map(mv => {
      let wins=0;
      for(let sim=0;sim<SIMS;sim++){
        // Random playout
        let val = rand(-0.5,0.5);
        // value boost: center + adjacent
        const dr=mv.r-(BOARD-1)/2, dc=mv.c-(BOARD-1)/2;
        val += 0.3*Math.exp(-0.2*(dr*dr+dc*dc));
        // edge penalty
        if(mv.r===0||mv.r===BOARD-1||mv.c===0||mv.c===BOARD-1) val-=0.1;
        if(val>0) wins++;
      }
      return { r:mv.r, c:mv.c, visits:SIMS, value:wins/SIMS, score:wins/SIMS };
    });
    results.sort((a,b)=>b.score-a.score);
    mctsResult = results;
    policyMap = computePolicy();
    mctsRunning = false;
    draw();
  }

  function aiMove() {
    if (!mctsResult || mctsResult.length === 0) return;
    const best = mctsResult[0];
    if (board[best.r][best.c] === 0) {
      board[best.r][best.c] = -1;
      turn = 1; mctsResult = null; policyMap = computePolicy(); draw();
    }
  }

  function draw() {
    ctx.clearRect(0,0,750,340);

    // Board background
    ctx.fillStyle = '#1a1208';
    ctx.beginPath(); ctx.roundRect(OX-CELL/2, OY-CELL/2, BOARD*CELL, BOARD*CELL, 6); ctx.fill();

    // Grid lines
    ctx.strokeStyle = '#5a4a30'; ctx.lineWidth = 1;
    for(let i=0;i<BOARD;i++){
      ctx.beginPath();ctx.moveTo(OX,OY+i*CELL);ctx.lineTo(OX+(BOARD-1)*CELL,OY+i*CELL);ctx.stroke();
      ctx.beginPath();ctx.moveTo(OX+i*CELL,OY);ctx.lineTo(OX+i*CELL,OY+(BOARD-1)*CELL);ctx.stroke();
    }
    // Star points
    [[1,1],[1,BOARD-2],[BOARD-2,1],[BOARD-2,BOARD-2],[Math.floor(BOARD/2),Math.floor(BOARD/2)]].forEach(([r,c])=>{
      ctx.beginPath();ctx.arc(OX+c*CELL,OY+r*CELL,3,0,TAU);ctx.fillStyle='#5a4a30';ctx.fill();
    });

    // Policy heat-map overlay
    if (policyMap) {
      const maxP = Math.max(...policyMap.flat());
      for(let r=0;r<BOARD;r++) for(let c=0;c<BOARD;c++) {
        if(board[r][c]!==0) continue;
        const v = policyMap[r][c]/maxP;
        ctx.fillStyle = `rgba(255,209,102,${v*0.55})`;
        ctx.beginPath(); ctx.roundRect(OX+c*CELL-CELL/2+1,OY+r*CELL-CELL/2+1,CELL-2,CELL-2,3); ctx.fill();
      }
    }

    // MCTS visit circles
    if (mctsResult) {
      const maxV = Math.max(...mctsResult.map(m=>m.score));
      mctsResult.slice(0,8).forEach(m => {
        const [x,y]=posXY(m.r,m.c);
        const frac = m.score/maxV;
        ctx.beginPath();ctx.arc(x,y,CELL/2-4,0,TAU);
        ctx.strokeStyle=`rgba(167,139,250,${0.4+frac*0.5})`;ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle=`rgba(167,139,250,${frac*0.3})`;ctx.fill();
        ctx.fillStyle='#a78bfa';ctx.font='600 8px Fira Code';ctx.textAlign='center';
        ctx.fillText((m.value*100|0)+'%',x,y+3);ctx.textAlign='left';
      });
      // Best move highlighted
      const best=mctsResult[0];
      const [bx,by]=posXY(best.r,best.c);
      ctx.save();ctx.shadowColor='#34d399';ctx.shadowBlur=20;
      ctx.beginPath();ctx.arc(bx,by,CELL/2-2,0,TAU);ctx.strokeStyle='#34d399';ctx.lineWidth=3;ctx.stroke();ctx.restore();
    }

    // Stones
    for(let r=0;r<BOARD;r++) for(let c=0;c<BOARD;c++) {
      if(!board[r][c]) continue;
      const [x,y]=posXY(r,c);
      ctx.save();ctx.shadowColor=board[r][c]===1?'#e4e2df':'#000';ctx.shadowBlur=8;
      ctx.beginPath();ctx.arc(x,y,CELL/2-3,0,TAU);
      ctx.fillStyle=board[r][c]===1?'#e4e2df':'#111';ctx.fill();ctx.restore();
    }

    // ── Info overlay ──────────────────────────────────────────────────────
    const IX=OX+BOARD*CELL+14, IY=4, IW=750-IX-4;
    ctx.fillStyle='rgba(6,6,12,0.93)';ctx.beginPath();ctx.roundRect(IX,IY,IW,200,8);ctx.fill();
    ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('AlphaGo',IX+8,IY+16);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    ctx.fillText('Policy Net + Value Net + MCTS',IX+8,IY+28);
    ctx.fillText('Best move = argmax(visits × value)',IX+8,IY+40);

    ctx.fillStyle='#ffd166';ctx.font='500 9px Fira Code';
    ctx.fillText('Heat-map = Policy Network',IX+8,IY+56);
    ctx.fillText('(probability of good moves)',IX+8,IY+67);
    ctx.fillStyle='#a78bfa';
    ctx.fillText('Circles = MCTS simulations',IX+8,IY+82);
    ctx.fillText('(rollout win rate %)',IX+8,IY+93);
    ctx.fillStyle='#34d399';
    ctx.fillText('Green border = best move',IX+8,IY+108);

    ctx.fillStyle=turn===1?'#e4e2df':'#888';ctx.font='600 10px Fira Code';
    ctx.fillText('Turn: '+(turn===1?'Black ●':'White ○'),IX+8,IY+124);
    if(mctsRunning){ctx.fillStyle='#fb923c';ctx.fillText('MCTS running…',IX+8,IY+138);}

    // Three-component legend
    const comps=[['🧠 Policy Net','p(a|s): move probs','#ffd166'],['🎯 Value Net','v(s): position eval','#38bdf8'],['🌳 MCTS','simulation rollouts','#a78bfa']];
    comps.forEach(([t,d,col],i)=>{
      ctx.fillStyle=col;ctx.font='600 9px Fira Code';ctx.fillText(t,IX+8,IY+158+i*16);
      ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText(d,IX+8,IY+169+i*16);
    });

    ctx.fillStyle='rgba(6,6,12,0.93)';ctx.beginPath();ctx.roundRect(IX,IY+206,IW,50,8);ctx.fill();
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    ctx.fillText('AlphaGo combined deep CNNs trained on',IX+8,IY+220);
    ctx.fillText('human games with RL self-play.  First AI',IX+8,IY+231);
    ctx.fillText('to beat the world Go champion (2016).',IX+8,IY+242);
    ctx.fillText('MCTS visits: '+(mctsResult?mctsResult.reduce((s,m)=>s+m.visits,0):0),IX+8,IY+254);
  }

  c.onclick = e => {
    const r2=c.getBoundingClientRect();
    const mx=(e.clientX-r2.left)*750/r2.width, my=(e.clientY-r2.top)*340/r2.height;
    const gc=Math.round((mx-OX)/CELL), gr=Math.round((my-OY)/CELL);
    if(gr>=0&&gr<BOARD&&gc>=0&&gc<COLS&&board[gr][gc]===0) {
      board[gr][gc]=turn; turn=-turn;
      policyMap=computePolicy(); mctsResult=null; draw();
    }
  };

  const ctrl=addControls(el);
  const mctsBtn=document.createElement('button');mctsBtn.className='btn';mctsBtn.textContent='▶ MCTS Search';
  mctsBtn.onclick=()=>{ policyMap=computePolicy(); runMCTS(); };ctrl.appendChild(mctsBtn);
  const aiBtn=document.createElement('button');aiBtn.className='btn';aiBtn.textContent='🤖 AI Move';
  aiBtn.onclick=()=>{ if(!mctsResult){policyMap=computePolicy();runMCTS();} setTimeout(aiMove,100); };ctrl.appendChild(aiBtn);
  const rstBtn=document.createElement('button');rstBtn.className='btn';rstBtn.textContent='↻ Reset';
  rstBtn.onclick=()=>{ board=Array.from({length:BOARD},()=>new Int8Array(BOARD));turn=1;mctsResult=null;policyMap=null;draw(); };ctrl.appendChild(rstBtn);
  draw();
  return ()=>{try{if(c)c.onclick=null;if(el)el.innerHTML='';}catch(e){}};
}
