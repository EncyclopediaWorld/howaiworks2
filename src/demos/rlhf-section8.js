import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountRlhf(containerId = 'demo-rlhf') {
  const __id = containerId || 'demo-rlhf';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Step through the 3-phase RLHF training pipeline. This is exactly how ChatGPT was built!');
let step=0;
const steps=[
{name:'1. Supervised Fine-Tuning (SFT)',color:'#38bdf8',
  prompt:'Explain quantum computing simply.',
  bad:'Quantum computing utilizes qubits which exist in superposition states allowing for parallel computation...',
  good:'Imagine a coin spinning in the air \u2014 it\'s both heads AND tails until it lands. Quantum bits work like that!',
  note:'Human trainers write ideal responses. Model learns their style.'},
{name:'2. Reward Model Training',color:'#ffd166',
  prompt:'What\'s the best programming language?',
  responses:['Python is the best language.','It depends on your goals:\n\u2022 Web: JavaScript\n\u2022 Data: Python\n\u2022 Speed: Rust','JavaScript because I said so.','Use Assembly for everything.'],
  ranks:[2,1,3,4],
  note:'Humans rank multiple outputs. Reward model learns: nuanced > dogmatic > wrong.'},
{name:'3. PPO Optimization',color:'#34d399',
  prompt:'How do I stay motivated?',
  before:{text:'Just don\'t be lazy.',score:2.1},
  after:{text:'Here are 3 evidence-based strategies:\n1. Set small daily goals\n2. Track your progress visually\n3. Reward yourself for milestones',score:8.7},
  note:'PPO optimizes the LLM to maximize the reward model\'s score.'}];
function draw(){ctx.clearRect(0,0,750,340);
  // Step tabs
  steps.forEach((s,i)=>{let x=15+i*245,y=6;
    ctx.fillStyle=i===step?s.color+'22':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,235,26,5);ctx.fill();
    ctx.strokeStyle=i<=step?s.color:'#1e1e32';ctx.lineWidth=i===step?2:1;ctx.beginPath();ctx.roundRect(x,y,235,26,5);ctx.stroke();
    ctx.fillStyle=i<=step?'#e4e2df':'#4a475a';ctx.font=(i===step?'600':'400')+' 8px Fira Code';
    ctx.fillText((i<step?'\u2713 ':'')+s.name,x+6,y+17);});
  let s=steps[step];
  // Main content area
  if(step===0){
    // SFT: show prompt and bad vs good response
    ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,42,720,145,10);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 10px Fira Code';ctx.fillText('Prompt: "'+s.prompt+'"',25,62);
    // Before
    ctx.fillStyle='rgba(255,107,107,.06)';ctx.beginPath();ctx.roundRect(25,72,340,105,6);ctx.fill();
    ctx.strokeStyle='#ff6b6b44';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(25,72,340,105,6);ctx.stroke();
    ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('\u274c Base LLM (robotic):',35,88);
    ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
    let words=s.bad.split(' '),line='',ly=104;
    words.forEach(w=>{if((line+w).length>46){ctx.fillText(line,35,ly);ly+=12;line='';}line+=w+' ';});if(line)ctx.fillText(line,35,ly);
    // After SFT
    ctx.fillStyle='rgba(52,211,153,.06)';ctx.beginPath();ctx.roundRect(375,72,350,105,6);ctx.fill();
    ctx.strokeStyle='#34d39944';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(375,72,350,105,6);ctx.stroke();
    ctx.fillStyle='#34d399';ctx.font='600 9px Fira Code';ctx.fillText('\u2705 After SFT (natural):',385,88);
    ctx.fillStyle='#e4e2df';ctx.font='400 8px Fira Code';
    words=s.good.split(' ');line='';ly=104;
    words.forEach(w=>{if((line+w).length>48){ctx.fillText(line,385,ly);ly+=12;line='';}line+=w+' ';});if(line)ctx.fillText(line,385,ly);
  } else if(step===1){
    // Reward model: show ranking
    ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,42,720,155,10);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 10px Fira Code';ctx.fillText('Prompt: "'+s.prompt+'"  \u2192  Model generates 4 responses:',25,62);
    s.responses.forEach((r,i)=>{let y=72+i*32,rank=s.ranks[i];
      let isTop=rank===1;
      ctx.fillStyle=isTop?'rgba(52,211,153,.1)':rank===2?'rgba(255,209,102,.05)':'rgba(255,107,107,.05)';
      ctx.beginPath();ctx.roundRect(25,y,530,28,4);ctx.fill();
      ctx.strokeStyle=isTop?'#34d399':rank===2?'#ffd16644':'#ff6b6b33';ctx.lineWidth=isTop?2:1;
      ctx.beginPath();ctx.roundRect(25,y,530,28,4);ctx.stroke();
      ctx.fillStyle=isTop?'#34d399':rank===2?'#ffd166':rank===3?'#fb923c':'#ff6b6b';
      ctx.font='700 9px Fira Code';ctx.fillText('#'+rank,30,y+18);
      ctx.fillStyle=isTop?'#e4e2df':'#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText(r.split('\n')[0],58,y+18);
      // Star rating
      ctx.fillStyle='#ffd166';ctx.font='500 8px Fira Code';ctx.fillText('\u2605'.repeat(5-rank),570,y+18);});
    ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('Human ranking \u2192 Reward model learns: helpful+nuanced > confident+wrong',25,72+4*32+14);
  } else {
    // PPO: before vs after
    ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,42,720,155,10);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 10px Fira Code';ctx.fillText('Prompt: "'+s.prompt+'"',25,62);
    // Before PPO
    ctx.fillStyle='rgba(255,107,107,.06)';ctx.beginPath();ctx.roundRect(25,72,340,115,6);ctx.fill();
    ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('\u274c Before PPO:',35,88);
    ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';ctx.fillText('"'+s.before.text+'"',35,106);
    ctx.fillStyle='#ff6b6b';ctx.font='700 18px Fira Code';ctx.fillText('Score: '+s.before.score.toFixed(1)+'/10',35,145);
    ctx.fillStyle='#111120';ctx.fillRect(35,152,280,12);ctx.fillStyle='#ff6b6b';ctx.fillRect(35,152,280*s.before.score/10,12);
    // After PPO
    ctx.fillStyle='rgba(52,211,153,.06)';ctx.beginPath();ctx.roundRect(375,72,350,115,6);ctx.fill();
    ctx.fillStyle='#34d399';ctx.font='600 9px Fira Code';ctx.fillText('\u2705 After PPO:',385,88);
    ctx.fillStyle='#e4e2df';ctx.font='400 8px Fira Code';
    s.after.text.split('\n').forEach((l,i)=>ctx.fillText(l,385,106+i*14));
    ctx.fillStyle='#34d399';ctx.font='700 18px Fira Code';ctx.fillText('Score: '+s.after.score.toFixed(1)+'/10',385,166);
    ctx.fillStyle='#111120';ctx.fillRect(385,173,280,12);ctx.fillStyle='#34d399';ctx.fillRect(385,173,280*s.after.score/10,12);
  }
  // Note
  const ny=205;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,ny,720,38,8);ctx.fill();
  ctx.fillStyle=s.color;ctx.font='600 10px Fira Code';ctx.fillText(s.note,25,ny+24);
  // Bottom summary
  const by=250;
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,by,720,82,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 11px Fira Code';ctx.fillText('The RLHF Pipeline (all 3 steps):',25,by+16);
  ctx.fillStyle='#38bdf8';ctx.font='600 9px Fira Code';ctx.fillText('1. SFT: Imitate human demos',25,by+36);
  ctx.fillStyle='#ffd166';ctx.fillText('2. Reward: Learn human preferences',260,by+36);
  ctx.fillStyle='#34d399';ctx.fillText('3. PPO: Optimize to maximize reward',520,by+36);
  ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
  ctx.fillText('RLHF = Reinforcement Learning from Human Feedback. ChatGPT: 100M users in 2 months.',25,by+56);
  ctx.fillText('This 3-step recipe is now the industry standard for aligning LLMs (Claude, Gemini, LLaMA-Chat...).',25,by+72);}
const ctrl=addControls(el);
const nb=document.createElement('button');nb.className='btn';nb.textContent='\u25b6 Next';nb.onclick=()=>{step=Math.min(step+1,2);draw();};
const pb=document.createElement('button');pb.className='btn';pb.textContent='\u25c0 Prev';pb.onclick=()=>{step=Math.max(step-1,0);draw();};
const rst=document.createElement('button');rst.className='btn';rst.textContent='\u21bb Reset';rst.onclick=()=>{step=0;draw();};
ctrl.appendChild(pb);ctrl.appendChild(nb);ctrl.appendChild(rst);draw()
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
