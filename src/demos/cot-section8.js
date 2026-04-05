import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

// ===== demo-cot =====
export function mountCot(containerId = 'demo-cot') {
  const __id = containerId || 'demo-cot';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Chain-of-Thought (CoT) prompting forces the model to show its reasoning steps — dramatically improving on multi-step math and logic. Compare Direct Answer (often wrong) vs CoT (step-by-step, correct). OpenAI o1 extends this with a hidden "thinking" token budget.');

  const PROBLEMS = [
    {
      question: 'A farmer has 17 sheep. All but 9 run away. How many are left?',
      direct: {text:'8',correct:false},
      cot: [
        '"...let me think..." → "All but 9" = 9 remain',
        '17 sheep total, 9 stay.',
        'Answer: 9 ✓'
      ],
      answer:'9',
      difficulty:'Easy'
    },
    {
      question: 'Roger has 5 tennis balls. He buys 2 more cans of 3 balls each. How many balls does he have now?',
      direct: {text:'10',correct:false},
      cot: [
        'Start: 5 balls',
        '2 cans × 3 balls/can = 6 new balls',
        '5 + 6 = 11 ✓'
      ],
      answer:'11',
      difficulty:'Easy'
    },
    {
      question: 'If a bat and a ball cost $1.10, and the bat costs $1 more than the ball, how much is the ball?',
      direct: {text:'$0.10',correct:false},
      cot: [
        'Let ball = x, bat = x + 1.00',
        '(x + 1.00) + x = 1.10',
        '2x = 0.10  →  x = $0.05 ✓'
      ],
      answer:'$0.05',
      difficulty:'Medium (CRT classic)'
    },
    {
      question: 'A car travels 60 mph for 2.5 hrs, then 40 mph for 1.5 hrs. Total distance?',
      direct: {text:'150 miles',correct:false},
      cot: [
        'Segment 1: 60 × 2.5 = 150 miles',
        'Segment 2: 40 × 1.5 = 60 miles',
        'Total: 150 + 60 = 210 miles ✓'
      ],
      answer:'210 miles',
      difficulty:'Medium'
    },
  ];

  let problemIdx=0;
  let cotStep=-1; // -1: idle, 0..N: showing steps
  let showDirect=false;
  let showFinal=false;
  let animTmr=null;

  function startCot() {
    if(animTmr) clearTimeout(animTmr);
    cotStep=0; showDirect=true; showFinal=false;
    draw();
    function nextStep() {
      cotStep++;
      draw();
      if(cotStep < PROBLEMS[problemIdx].cot.length-1) {
        animTmr=setTimeout(nextStep, 900);
      } else {
        animTmr=setTimeout(()=>{showFinal=true;draw();}, 700);
      }
    }
    animTmr=setTimeout(nextStep, 600);
  }

  function draw() {
    ctx.clearRect(0,0,750,340);
    const prob=PROBLEMS[problemIdx];

    // ── Question ──────────────────────────────────────────────────────────
    ctx.fillStyle='rgba(6,6,12,0.9)'; ctx.beginPath(); ctx.roundRect(12,8,726,44,6); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 11px Fira Code';
    ctx.fillText('Problem ('+prob.difficulty+'):', 18, 24);
    ctx.fillStyle='rgba(255,255,255,0.85)'; ctx.font='500 10px Fira Code';
    ctx.fillText(prob.question, 18, 40);

    // ── Two columns: Direct vs CoT ────────────────────────────────────────
    const COL_W=342, COL_H=220, COL_Y=60;

    // === Direct Answer (left) ===
    ctx.fillStyle='rgba(255,107,107,0.08)'; ctx.beginPath(); ctx.roundRect(12,COL_Y,COL_W,COL_H,8); ctx.fill();
    ctx.strokeStyle='rgba(255,107,107,0.3)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.roundRect(12,COL_Y,COL_W,COL_H,8); ctx.stroke();
    ctx.fillStyle='#ff6b6b'; ctx.font='700 10px Fira Code';
    ctx.fillText('⚡ Direct Answer (GPT-3 baseline)',18,COL_Y+16);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='400 8px Fira Code';
    ctx.fillText('Prompt: "Answer directly in one word/number."', 18, COL_Y+30);
    if(showDirect){
      ctx.fillStyle='rgba(255,107,107,0.15)'; ctx.beginPath(); ctx.roundRect(18,COL_Y+36,COL_W-12,60,6); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='600 9px Fira Code';
      ctx.fillText('Model output:', 22, COL_Y+50);
      ctx.fillStyle='#ff6b6b'; ctx.font='700 18px Fira Code'; ctx.textAlign='center';
      ctx.fillText(prob.direct.text, 12+COL_W/2, COL_Y+82); ctx.textAlign='left';
      // Wrong X
      ctx.fillStyle='#ff6b6b'; ctx.font='700 28px sans-serif'; ctx.textAlign='center';
      ctx.fillText('✗', 12+COL_W/2, COL_Y+110); ctx.textAlign='left';
      ctx.fillStyle='rgba(255,107,107,0.8)'; ctx.font='600 9px Fira Code'; ctx.textAlign='center';
      ctx.fillText('Incorrect!  (Correct: '+prob.answer+')',12+COL_W/2,COL_Y+128); ctx.textAlign='left';
    } else {
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='400 8px Fira Code';
      ctx.fillText('(Click "▶ Run CoT" to compare)',22,COL_Y+60);
    }

    // Why direct fails
    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='400 7px Fira Code';
    ctx.fillText('No intermediate reasoning → System 1 "fast" heuristic',18,COL_Y+145);
    ctx.fillText('Pattern-matches surface features without decomposition',18,COL_Y+155);
    ctx.fillText('Accuracy on GSM8K: ~18% (GPT-3 direct)',18,COL_Y+165);

    // === CoT Answer (right) ===
    ctx.fillStyle='rgba(52,211,153,0.08)'; ctx.beginPath(); ctx.roundRect(396,COL_Y,COL_W,COL_H,8); ctx.fill();
    ctx.strokeStyle='rgba(52,211,153,0.3)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.roundRect(396,COL_Y,COL_W,COL_H,8); ctx.stroke();
    ctx.fillStyle='#34d399'; ctx.font='700 10px Fira Code';
    ctx.fillText('🧠 Chain-of-Thought (Wei et al. 2022)',402,COL_Y+16);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.font='400 8px Fira Code';
    ctx.fillText('Prompt: "Let\'s think step by step..."', 402, COL_Y+30);

    if(cotStep>=0){
      const stepsToShow=Math.min(cotStep+1, prob.cot.length);
      for(let s=0;s<stepsToShow;s++){
        const sy=COL_Y+40+s*28;
        const alpha=s===cotStep?1.0:0.7;
        ctx.fillStyle=`rgba(52,211,153,${alpha*0.15})`; ctx.beginPath(); ctx.roundRect(402,sy,COL_W-12,22,4); ctx.fill();
        ctx.fillStyle=`rgba(52,211,153,${alpha})`; ctx.font='600 8px Fira Code';
        ctx.fillText('Step '+(s+1)+':', 406, sy+10);
        ctx.fillStyle=`rgba(255,255,255,${alpha*0.9})`; ctx.font='500 8px Fira Code';
        const maxW=COL_W-70;
        ctx.fillText(prob.cot[s].substring(0,52), 446, sy+10);
        if(prob.cot[s].length>52) ctx.fillText(prob.cot[s].substring(52,90), 446, sy+20);
      }
      if(showFinal){
        ctx.fillStyle='rgba(52,211,153,0.2)'; ctx.beginPath(); ctx.roundRect(402,COL_Y+130,COL_W-12,46,6); ctx.fill();
        ctx.fillStyle='#34d399'; ctx.font='700 16px Fira Code'; ctx.textAlign='center';
        ctx.fillText('✓ '+prob.answer, 396+COL_W/2, COL_Y+155); ctx.textAlign='left';
        ctx.fillStyle='rgba(52,211,153,0.8)'; ctx.font='600 8px Fira Code'; ctx.textAlign='center';
        ctx.fillText('Correct!', 396+COL_W/2, COL_Y+170); ctx.textAlign='left';
      }
    } else {
      ctx.fillStyle='rgba(255,255,255,0.2)'; ctx.font='400 8px Fira Code';
      ctx.fillText('(Click "▶ Run CoT" to start reasoning)',402,COL_Y+60);
    }

    ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='400 7px Fira Code';
    ctx.fillText('Explicit decomposition → verifiable intermediate steps',402,COL_Y+145);
    ctx.fillText('Accuracy on GSM8K: ~57% (CoT) → 96% (o1, 2024)',402,COL_Y+155);
    ctx.fillText('o1/R1: hidden "thinking tokens" budget (up to 32K)',402,COL_Y+165);

    // Thinking tokens badge
    ctx.fillStyle='rgba(251,146,60,0.12)'; ctx.beginPath(); ctx.roundRect(396,COL_Y+172,COL_W,26,6); ctx.fill();
    ctx.fillStyle='#fb923c'; ctx.font='600 8px Fira Code';
    ctx.fillText('o1/DeepSeek-R1: CoT at inference time → long hidden <think>...</think> traces',400,COL_Y+188);

    // ── Info footer ───────────────────────────────────────────────────────
    const FY=292, FH=44;
    ctx.fillStyle='rgba(6,6,12,0.93)'; ctx.beginPath(); ctx.roundRect(12,FY,726,FH,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 10px Fira Code'; ctx.fillText('Chain-of-Thought Prompting (Wei et al., Google Brain 2022) → OpenAI o1 (2024)',18,FY+13);
    ctx.fillStyle='rgba(255,255,255,0.45)'; ctx.font='400 8px Fira Code';
    ctx.fillText('Simply adding "Let\'s think step by step" to the prompt unlocks emergent reasoning abilities in models with ≥100B parameters.',18,FY+26);
    ctx.fillText('OpenAI o1 extends this: model generates a hidden chain of thought at test time, then produces a final answer — trading compute for accuracy.',18,FY+37);
  }

  const ctrl=addControls(el);
  const runBtn=document.createElement('button');runBtn.className='btn';runBtn.textContent='▶ Run CoT';
  runBtn.onclick=()=>{startCot();};ctrl.appendChild(runBtn);
  PROBLEMS.forEach((p,i)=>{
    const pb=document.createElement('button');pb.className='btn'+(i===0?' active':'');
    pb.textContent='Q'+(i+1);pb.title=p.question;
    pb.onclick=()=>{
      problemIdx=i;cotStep=-1;showDirect=false;showFinal=false;
      if(animTmr){clearTimeout(animTmr);animTmr=null;}
      document.querySelectorAll('#'+__id+' .btn[data-q]').forEach(b=>b.classList.remove('active'));
      pb.classList.add('active'); draw();
    };pb.setAttribute('data-q',i);ctrl.appendChild(pb);
  });
  const resetBtn=document.createElement('button');resetBtn.className='btn';resetBtn.textContent='↻ Reset';
  resetBtn.onclick=()=>{cotStep=-1;showDirect=false;showFinal=false;if(animTmr){clearTimeout(animTmr);animTmr=null;}draw();};ctrl.appendChild(resetBtn);

  draw();
  return ()=>{try{if(animTmr)clearTimeout(animTmr);if(el)el.innerHTML='';}catch(e){}};
}
