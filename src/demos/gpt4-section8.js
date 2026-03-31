import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountGpt4(containerId = 'demo-gpt4') {
  const __id = containerId || 'demo-gpt4';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 340);
addHint(el,'Toggle text vs multimodal. See how GPT-4 routes inputs through specialized experts (MoE)!');
let mode='multi';
function draw(){ctx.clearRect(0,0,750,340);
  // Mode toggle
  ['text','multi'].forEach((m,i)=>{let x=15+i*200,y=6;
    ctx.fillStyle=mode===m?'rgba(52,211,153,.12)':'#0c0c16';ctx.beginPath();ctx.roundRect(x,y,190,26,5);ctx.fill();
    ctx.strokeStyle=mode===m?'#34d399':'#1e1e32';ctx.lineWidth=mode===m?2:1;ctx.beginPath();ctx.roundRect(x,y,190,26,5);ctx.stroke();
    ctx.fillStyle=mode===m?'#e4e2df':'#4a475a';ctx.font='600 10px Fira Code';ctx.fillText(m==='text'?'\ud83d\udcdd Text Only':'\ud83d\uddbc\ufe0f Multimodal (Text+Image)',x+8,y+18);});
  // Input section
  const iy=40;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(15,iy,230,100,8);ctx.fill();
  ctx.fillStyle=mode==='multi'?'#a78bfa':'#38bdf8';ctx.font='700 10px Fira Code';ctx.fillText('Input:',25,iy+18);
  if(mode==='multi'){
    // Image placeholder
    ctx.fillStyle='rgba(167,139,250,.1)';ctx.beginPath();ctx.roundRect(25,iy+24,90,60,4);ctx.fill();
    ctx.strokeStyle='#a78bfa66';ctx.beginPath();ctx.roundRect(25,iy+24,90,60,4);ctx.stroke();
    // Mini chart inside
    ctx.strokeStyle='#a78bfa';ctx.lineWidth=1.5;ctx.beginPath();
    [25,40,35,55,70,65,80].forEach((v,i)=>{let x=30+i*11,y=iy+80-v*0.5;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();
    ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('Q3 Revenue Chart',30,iy+78);
    ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';ctx.fillText('"What trend\ndo you see?"',125,iy+50);
  } else {
    ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';ctx.fillText('"Explain quantum\ncomputing simply"',25,iy+44);}
  // MoE routing (center)
  const mx2=260,my2=iy;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(mx2,my2,240,100,8);ctx.fill();
  ctx.fillStyle='#fb923c';ctx.font='700 10px Fira Code';ctx.fillText('Mixture of Experts (MoE):',mx2+10,my2+18);
  // Expert boxes
  const experts=[{name:'Lang Expert',active:true,c:'#38bdf8'},{name:'Math Expert',active:mode==='text',c:'#ffd166'},
    {name:'Vision Expert',active:mode==='multi',c:'#a78bfa'},{name:'Code Expert',active:false,c:'#4ecdc4'},
    {name:'Logic Expert',active:true,c:'#34d399'},{name:'Unused',active:false,c:'#7d7a8c'}];
  experts.forEach((e,i)=>{let x=mx2+10+(i%3)*76,y=my2+26+(Math.floor(i/3))*34;
    ctx.fillStyle=e.active?e.c+'33':'#111120';ctx.beginPath();ctx.roundRect(x,y,72,28,4);ctx.fill();
    ctx.strokeStyle=e.active?e.c:e.c+'22';ctx.lineWidth=e.active?2:1;ctx.beginPath();ctx.roundRect(x,y,72,28,4);ctx.stroke();
    ctx.fillStyle=e.active?e.c:'#333';ctx.font='400 7px Fira Code';ctx.textAlign='center';ctx.fillText(e.name,x+36,y+13);
    ctx.fillText(e.active?'\u2705 active':'\ud83d\udca4 idle',x+36,y+23);ctx.textAlign='left';});
  ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('Router activates only 2-3 of ~16 experts per token!',mx2+10,my2+96);
  // Arrow
  ctx.fillStyle='#4a475a';ctx.font='18px sans-serif';ctx.fillText('\u2192',mx2+244,my2+50);
  // Output
  const ox=515,oy=iy;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(ox,oy,222,100,8);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 10px Fira Code';ctx.fillText('Output:',ox+10,oy+18);
  ctx.fillStyle='#ffd166';ctx.font='400 9px Fira Code';
  if(mode==='multi'){ctx.fillText('Revenue grew 23% YoY,',ox+10,oy+40);ctx.fillText('accelerating from Q2\'s 15%.',ox+10,oy+56);ctx.fillText('Strong upward trend.',ox+10,oy+72);}
  else{ctx.fillText('Imagine two coins that',ox+10,oy+40);ctx.fillText('always land opposite \u2014',ox+10,oy+56);ctx.fillText('that\'s entanglement!',ox+10,oy+72);}
  ctx.fillStyle='#34d399';ctx.font='600 8px Fira Code';ctx.fillText('Confidence: '+(mode==='multi'?96:92)+'%',ox+10,oy+90);
  // Benchmarks
  const by=iy+110;
  ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,by,720,80,10);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 11px Fira Code';ctx.fillText('GPT-4 Benchmark Performance (vs humans):',25,by+18);
  const benchmarks=[{n:'Bar Exam',s:90,c:'#34d399'},{n:'SAT Math',s:93,c:'#38bdf8'},{n:'AP Bio',s:85,c:'#ffd166'},{n:'Coding',s:67,c:'#a78bfa'}];
  benchmarks.forEach((b,i)=>{let x=25+i*175,y=by+28;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(x,y,155,20,3);ctx.fill();
    ctx.fillStyle=b.c;ctx.beginPath();ctx.roundRect(x,y,155*b.s/100,20,3);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='500 8px Fira Code';ctx.fillText(b.n+': '+b.s+'th %ile',x+5,y+14);
    // Human average marker
    ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(x+155*0.5,y);ctx.lineTo(x+155*0.5,y+20);ctx.stroke();});
  ctx.fillStyle='#7d7a8c';ctx.font='400 7px Fira Code';ctx.fillText('White line = human median. GPT-4 beats most humans on these exams.',25,by+66);
  // Bottom explanation
  const ey=by+88;
  ctx.fillStyle='rgba(6,6,12,.85)';ctx.beginPath();ctx.roundRect(15,ey,720,78,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Key Innovations:',25,ey+16);
  ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
  ctx.fillText('\u2022 Multimodal: accepts text + images via ViT encoder. First LLM to "see" and reason about images.',25,ey+34);
  ctx.fillText('\u2022 MoE: ~1.8T total params but only ~280B active per token. 16 experts, router picks 2. Efficient at scale.',25,ey+50);
  ctx.fillText('\u2022 RLHF + red-teaming: extensive safety training. 6-month safety testing before release.',25,ey+66);}
c.onclick=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*340/r.height;
  if(my>=6&&my<=32){if(mx>=15&&mx<=205)mode='text';if(mx>=215&&mx<=405)mode='multi';draw();}};
const ctrl=addControls(el);draw()
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
