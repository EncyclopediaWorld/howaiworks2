import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountClaude(containerId = 'demo-claude') {
  const __id = containerId || 'demo-claude';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Step through Constitutional AI: generate → critique against principles → revise. Scalable alignment!');
let step=0;
const pipe=[
{name:'1. Generate',color:'#38bdf8',content:'Prompt: "How do I pick a lock?"\n\nInitial response: "Here\'s how to\npick a lock: First, get a tension\nwrench and a pick..."',
note:'The base model generates a potentially harmful response without filtering.'},
{name:'2. Critique',color:'#ff6b6b',content:'AI Self-Critique (against constitution):\n\n✗ Violates: "Don\'t help with illegal acts"\n✗ Violates: "Consider broader impacts"\n✓ Follows: "Be helpful"  (but wrong kind)',
note:'AI checks its OWN response against written principles. No human rater needed!'},
{name:'3. Revise',color:'#34d399',content:'Revised: "I can\'t help with lock\npicking for unauthorized access.\nIf locked out, I recommend calling\na locksmith. Here\'s how to find one..."',
note:'AI generates a better response. This trains the reward model (RLAIF = RL from AI Feedback).'}];
function draw(){ctx.clearRect(0,0,750,320);
pipe.forEach((p,i)=>{let x=15+i*245,y=8;
ctx.fillStyle=i===step?p.color+'22':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,235,28,5);ctx.fill();
ctx.strokeStyle=i<=step?p.color:'#1e1e32';ctx.lineWidth=i===step?2:1;ctx.beginPath();ctx.roundRect(x,y,235,28,5);ctx.stroke();
ctx.fillStyle=i<=step?'#e4e2df':'#4a475a';ctx.font=(i===step?'600':'400')+' 8px Fira Code';ctx.fillText((i<step?'✓ ':'')+p.name,x+8,y+18)});
let p=pipe[step],cy2=48;
ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,cy2,480,130,10);ctx.fill();
ctx.fillStyle=p.color;ctx.font='700 12px Fira Code';ctx.fillText(p.name,25,cy2+22);
ctx.fillStyle='#e4e2df';ctx.font='400 10px Fira Code';p.content.split('\n').forEach((l,i)=>{
ctx.fillStyle=l.includes('✗')?'#ff6b6b':l.includes('✓')?'#34d399':'#e4e2df';ctx.fillText(l,25,cy2+45+i*16)});
ctx.fillStyle='rgba(6,6,12,.8)';ctx.beginPath();ctx.roundRect(510,cy2,225,130,10);ctx.fill();
ctx.fillStyle='#ffd166';ctx.font='600 9px Fira Code';ctx.fillText('What\'s happening:',520,cy2+18);
ctx.fillStyle='#7d7a8c';ctx.font='400 9px Fira Code';
let words=p.note.split(' '),line='',ly=cy2+38;
words.forEach(w=>{if((line+w).length>30){ctx.fillText(line,520,ly);ly+=14;line=''}line+=w+' '});if(line)ctx.fillText(line,520,ly);
let py2=190;ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,py2,720,60,10);ctx.fill();
ctx.fillStyle='#a78bfa';ctx.font='700 11px Fira Code';ctx.fillText('The "Constitution" — Core Principles:',25,py2+18);
['Be helpful, harmless, honest','Don\'t help with illegal acts','Respect user autonomy',
'Be transparent about limits','Avoid deception','Consider broader impacts'].forEach((pr,i)=>{
ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';ctx.fillText('• '+pr,25+(i%3)*240,py2+34+Math.floor(i/3)*14)});
let vy=260;ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,vy,720,52,10);ctx.fill();
ctx.fillStyle='#ff6b6b';ctx.font='600 9px Fira Code';ctx.fillText('ChatGPT (RLHF): Human raters score → reward model → PPO',25,vy+16);
ctx.fillStyle='#34d399';ctx.fillText('Claude (CAI): AI self-critiques against constitution → RLAIF → scalable, consistent',25,vy+34);
ctx.fillStyle='#ffd166';ctx.font='400 8px Fira Code';ctx.fillText('Key: principles written once, AI applies them to millions of examples. Scales without proportional human labor.',25,vy+48)}
const ctrl=addControls(el);
const nb=document.createElement('button');nb.className='btn';nb.textContent='▶ Next';nb.onclick=()=>{step=Math.min(step+1,2);draw()};
const pb=document.createElement('button');pb.className='btn';pb.textContent='◀ Prev';pb.onclick=()=>{step=Math.max(step-1,0);draw()};
const rst=document.createElement('button');rst.className='btn';rst.textContent='↻ Reset';rst.onclick=()=>{step=0;draw()};
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
