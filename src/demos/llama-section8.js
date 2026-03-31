import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountLlama(containerId = 'demo-llama') {
  const __id = containerId || 'demo-llama';
const el = $(__id);
if (!el) return () => {};
el.innerHTML = '';
const [c, ctx] = createCanvas(el, 750, 320);
addHint(el,'Hover models to compare. LLaMA proves: more data on smaller models beats brute-force scaling!');
const models=[
  {name:'GPT-3',org:'OpenAI',params:175,tokens:300,perf:68,c:'#fb923c',open:false},
  {name:'Chinchilla',org:'DeepMind',params:70,tokens:1400,perf:71,c:'#a78bfa',open:false},
  {name:'LLaMA-7B',org:'Meta',params:7,tokens:1000,perf:63,c:'#34d399',open:true},
  {name:'LLaMA-13B',org:'Meta',params:13,tokens:1000,perf:68,c:'#34d399',open:true},
  {name:'LLaMA-65B',org:'Meta',params:65,tokens:1400,perf:74,c:'#34d399',open:true}];
let hov=-1;
function draw(){ctx.clearRect(0,0,750,320);
  // Visual comparison: bars
  const bx=15,by=8,bw=440,bh=195;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(bx,by,bw,bh,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Model Comparison: Size vs Data vs Performance',bx+10,by+18);
  models.forEach((m,i)=>{let y=by+30+i*32;let isH=i===hov;
    // Model name
    ctx.fillStyle=isH?m.c:'#e4e2df';ctx.font=(isH?'700':'500')+' 9px Fira Code';ctx.fillText(m.name,bx+10,y+10);
    // Params bar
    let pw=m.params/175*130;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(bx+100,y,130,14,2);ctx.fill();
    ctx.fillStyle=m.c+(isH?'cc':'88');ctx.beginPath();ctx.roundRect(bx+100,y,pw,14,2);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='400 7px Fira Code';ctx.fillText(m.params+'B',bx+100+pw+4,y+10);
    // Tokens bar
    let tw=m.tokens/1400*130;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(bx+250,y,130,14,2);ctx.fill();
    ctx.fillStyle='#38bdf8'+(isH?'cc':'88');ctx.beginPath();ctx.roundRect(bx+250,y,tw,14,2);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='400 7px Fira Code';ctx.fillText(m.tokens+'B',bx+250+tw+4,y+10);
    // Open/closed
    ctx.fillStyle=m.open?'#34d399':'#ff6b6b';ctx.font='400 7px Fira Code';ctx.fillText(m.open?'\ud83d\udd13':'\ud83d\udd12',bx+420,y+10);});
  // Column headers
  ctx.fillStyle='#fb923c';ctx.font='600 7px Fira Code';ctx.fillText('Params \u2193',bx+130,by+28);
  ctx.fillStyle='#38bdf8';ctx.fillText('Training Tokens \u2193',bx+270,by+28);
  // Key insight: LLaMA-13B = GPT-3
  ctx.strokeStyle='#ffd16666';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(bx+100+13/175*130,by+30+3*32+7);ctx.lineTo(bx+100+175/175*130,by+30+0*32+7);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#ffd166';ctx.font='500 7px Fira Code';ctx.fillText('Same perf!',bx+180,by+30+2*32);
  // Performance chart (right)
  const rx=470,ry=by;
  ctx.fillStyle='rgba(6,6,12,.9)';ctx.beginPath();ctx.roundRect(rx,ry,268,bh,10);ctx.fill();
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Benchmark Score:',rx+10,ry+18);
  models.forEach((m,i)=>{let y=ry+28+i*32;let isH=i===hov;
    ctx.fillStyle='#111120';ctx.beginPath();ctx.roundRect(rx+10,y,220,18,3);ctx.fill();
    let perfW=220*(m.perf-55)/25;
    ctx.fillStyle=m.c+(isH?'ee':'aa');ctx.beginPath();ctx.roundRect(rx+10,y,perfW,18,3);ctx.fill();
    ctx.fillStyle='#e4e2df';ctx.font='600 8px Fira Code';ctx.fillText(m.name+': '+m.perf,rx+14,y+13);});
  // Bottom
  const ey=by+bh+10;
  ctx.fillStyle='rgba(6,6,12,.88)';ctx.beginPath();ctx.roundRect(15,ey,720,105,10);ctx.fill();
  ctx.fillStyle='#34d399';ctx.font='700 12px Fira Code';ctx.fillText('LLaMA: The Open-Source AI Revolution',25,ey+18);
  ctx.fillStyle='#ffd166';ctx.font='700 10px Fira Code';ctx.fillText('Chinchilla Scaling Law: optimal = SMALLER model + MORE data',25,ey+38);
  ctx.fillStyle='#e4e2df';ctx.font='400 9px Fira Code';
  ctx.fillText('LLaMA-13B (13B params, 1T tokens) \u2248 GPT-3 (175B params, 300B tokens). 13\u00d7 smaller, 3\u00d7 more data!',25,ey+58);
  ctx.fillText('Being open-source sparked: Alpaca, Vicuna, Mistral, Mixtral \u2014 the entire open LLM ecosystem.',25,ey+74);
  ctx.fillStyle='#7d7a8c';ctx.font='400 8px Fira Code';
  ctx.fillText('Key innovations: RMSNorm, SwiGLU, RoPE (rotary position embeddings). Trained on publicly available data only.',25,ey+92);}
c.onmousemove=e=>{let r=c.getBoundingClientRect(),mx=(e.clientX-r.left)*750/r.width,my=(e.clientY-r.top)*320/r.height;
  hov=-1;models.forEach((m,i)=>{let y=38+i*32;if(my>=y&&my<=y+20&&mx>15&&mx<455)hov=i;
    let y2=36+i*32;if(my>=y2&&my<=y2+20&&mx>470&&mx<740)hov=i;});draw();};
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
