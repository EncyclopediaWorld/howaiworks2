import { $, createCanvas, addHint, addControls } from '../lib/shared.js'

// ===== demo-transformerXL =====
export function mountTransformerXl(containerId = 'demo-transformer-xl') {
  const __id = containerId || 'demo-transformer-xl';
  const el = $(__id);
  if (!el) return () => {};
  el.innerHTML = '';
  const [c, ctx] = createCanvas(el, 750, 340);
  addHint(el, 'Transformer-XL introduces segment-level recurrence: hidden states from the previous segment are cached and reused (green), allowing the model to attend across segment boundaries. Toggle between Standard and XL modes to compare context lengths.');

  const TOKENS=['The','quick','brown','fox','jumps','over','the','lazy','dog','and','then','ran','away','fast','back','to','its','home','which','was','far'];
  const SEG_LEN=6; // fixed context window size
  let xlMode=true;
  let activeToken=0;
  let attentionWeights=[];
  let animTmr=null;
  let segment=0; // current segment index (0 or 1)

  function makeWeights(tIdx, isXL) {
    // Token tIdx attends to earlier tokens
    const w=[];
    const maxBack = isXL ? tIdx : Math.min(tIdx, SEG_LEN-1);
    const total_seg_pos = tIdx % SEG_LEN; // position within segment
    let availFrom, availTo;
    if(!isXL) {
      // Only attends within current segment
      availFrom=Math.floor(tIdx/SEG_LEN)*SEG_LEN;
      availTo=tIdx;
    } else {
      // Can attend to previous segment too
      availFrom=Math.max(0, Math.floor(tIdx/SEG_LEN)*SEG_LEN - SEG_LEN);
      availTo=tIdx;
    }
    for(let i=availFrom; i<=availTo; i++){
      const decay=Math.exp(-(tIdx-i)*0.25);
      const noise=0.8+Math.random()*0.4;
      w.push({src:i, dst:tIdx, weight:decay*noise});
    }
    // Normalize
    const sum=w.reduce((a,x)=>a+x.weight,0);
    w.forEach(x=>x.weight/=sum);
    return w;
  }

  function draw() {
    ctx.clearRect(0,0,750,340);

    // Compute which tokens exist and what range the attention covers
    const numTokens=TOKENS.length;
    const curSeg=Math.floor(activeToken/SEG_LEN);
    const prevSegStart=Math.max(0,(curSeg-1)*SEG_LEN);
    const curSegStart=curSeg*SEG_LEN;

    // ── Token tiles ───────────────────────────────────────────────────────
    const TW=30, TH=28, TX0=12, TY=50, GAP=2;
    const tokensToShow=Math.min(numTokens, 21);

    TOKENS.slice(0,tokensToShow).forEach((tok,i) => {
      const x=TX0+i*(TW+GAP), y=TY;
      const inPrev = i>=prevSegStart && i<curSegStart;
      const inCur = i>=curSegStart && i<curSegStart+SEG_LEN;
      const isActive = i===activeToken;
      const isAttended = attentionWeights.some(w=>w.src===i);

      let bg='rgba(255,255,255,0.04)';
      let border='rgba(255,255,255,0.1)';
      if(isActive){bg='rgba(251,146,60,0.25)';border='#fb923c';}
      else if(isAttended && xlMode && inPrev){bg='rgba(52,211,153,0.2)';border='#34d399';}
      else if(isAttended && inCur){bg='rgba(56,189,248,0.2)';border='#38bdf8';}
      else if(inCur){bg='rgba(56,189,248,0.06)';border='rgba(56,189,248,0.3)';}
      else if(inPrev && xlMode){bg='rgba(52,211,153,0.06)';border='rgba(52,211,153,0.2)';}

      ctx.fillStyle=bg; ctx.beginPath(); ctx.roundRect(x,y,TW,TH,3); ctx.fill();
      ctx.strokeStyle=border; ctx.lineWidth=1.2; ctx.beginPath(); ctx.roundRect(x,y,TW,TH,3); ctx.stroke();
      ctx.fillStyle=isActive?'#fb923c':'rgba(255,255,255,0.8)';
      ctx.font='500 8px Fira Code'; ctx.textAlign='center';
      ctx.fillText(tok.substring(0,4), x+TW/2, y+TH/2+3);
      ctx.textAlign='left';

      // Token index
      ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.font='400 6px Fira Code'; ctx.textAlign='center';
      ctx.fillText(i, x+TW/2, y+TH+8); ctx.textAlign='left';
    });

    // Segment bracket labels
    if(curSeg>0){
      const bx=TX0+prevSegStart*(TW+GAP), bw=SEG_LEN*(TW+GAP)-GAP;
      ctx.strokeStyle=xlMode?'rgba(52,211,153,0.5)':'rgba(255,255,255,0.1)';
      ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
      ctx.strokeRect(bx,TY-3,bw,TH+6); ctx.setLineDash([]);
      if(xlMode){
        ctx.fillStyle='#34d399'; ctx.font='600 8px Fira Code';
        ctx.fillText('Cached Segment (memory)',bx,TY-8);
      }
    }
    const cbx=TX0+curSegStart*(TW+GAP), cbw=SEG_LEN*(TW+GAP)-GAP;
    ctx.strokeStyle='rgba(56,189,248,0.5)'; ctx.lineWidth=1.5; ctx.setLineDash([3,3]);
    ctx.strokeRect(cbx,TY-3,cbw,TH+6); ctx.setLineDash([]);
    ctx.fillStyle='#38bdf8'; ctx.font='600 8px Fira Code';
    ctx.fillText('Current Segment',cbx,TY-8);

    // ── Attention arcs ────────────────────────────────────────────────────
    const ARC_Y=TY+TH;
    attentionWeights.forEach(({src,dst,weight}) => {
      if(src>dst) return;
      const x1=TX0+src*(TW+GAP)+TW/2, x2=TX0+dst*(TW+GAP)+TW/2;
      const my=ARC_Y + 60 + (dst-src)*6;
      const inPrev = src<curSegStart;
      ctx.strokeStyle=inPrev&&xlMode ? `rgba(52,211,153,${weight*0.8})` : `rgba(56,189,248,${weight*0.8})`;
      ctx.lineWidth=1+weight*2;
      ctx.beginPath(); ctx.moveTo(x1,ARC_Y); ctx.quadraticCurveTo((x1+x2)/2,my,x2,ARC_Y); ctx.stroke();
      // weight label on arc peak
      if(weight>0.15){
        ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='400 7px Fira Code'; ctx.textAlign='center';
        ctx.fillText(weight.toFixed(2),(x1+x2)/2,(x1+x2)/2*0+my-4); ctx.textAlign='left';
      }
    });

    // ── Info overlay ──────────────────────────────────────────────────────
    const IX=450, IY=6, IW=295, IH=230;
    ctx.fillStyle='rgba(6,6,12,0.93)'; ctx.beginPath(); ctx.roundRect(IX,IY,IW,IH,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='700 11px Fira Code'; ctx.fillText('Transformer-XL (2019)',IX+8,IY+16);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    ctx.fillText('Segment recurrence + relative pos. encoding',IX+8,IY+28);

    ctx.fillStyle='#38bdf8'; ctx.font='600 9px Fira Code';
    ctx.fillText(`Mode: ${xlMode?'Transformer-XL':'Standard Transformer'}`,IX+8,IY+44);
    ctx.fillStyle='#7d7a8c'; ctx.font='500 8px Fira Code';
    ctx.fillText('Context window: '+(xlMode?SEG_LEN+'+cached':'only '+SEG_LEN+' tokens'),IX+8,IY+56);
    ctx.fillText('Active token idx: '+activeToken+' ("'+TOKENS[activeToken]+'") ',IX+8,IY+68);
    ctx.fillText('#attended tokens: '+attentionWeights.length,IX+8,IY+80);

    // Legend
    const legends=[['#fb923c','Active / query token'],['#38bdf8','Current segment'],['#34d399','Cached prev segment (XL)'],['#7d7a8c','Beyond context (no attn)']];
    ctx.font='500 8px Fira Code';
    legends.forEach(([col,lbl],i) => {
      ctx.fillStyle=col; ctx.beginPath(); ctx.arc(IX+16, IY+100+i*14, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.fillText(lbl, IX+26, IY+104+i*14);
    });

    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='400 8px Fira Code';
    ctx.fillText('Vanilla Transformer: O(n²) per segment only',IX+8,IY+160);
    ctx.fillText('Transformer-XL: cache prev hidden states,',IX+8,IY+172);
    ctx.fillText('  attend across segments without recomputation',IX+8,IY+184);
    ctx.fillText('Relative pos. enc: distance not absolute index',IX+8,IY+196);

    ctx.fillStyle='#7d7a8c'; ctx.font='400 8px Fira Code';
    ctx.fillText('Basis for XLNet and long-context LLMs (2019→)',IX+8,IY+212);

    // Context span indicator
    ctx.fillStyle='#34d399'; ctx.font='700 9px Fira Code';
    ctx.fillText('Context span: '+(xlMode?attentionWeights.length+' tokens (cross-segment)':attentionWeights.length+' tokens'),IX+8,IY+224);
  }

  function updateAttention() {
    attentionWeights = makeWeights(activeToken, xlMode);
    draw();
  }

  const ctrl = addControls(el);
  const prevBtn=document.createElement('button');prevBtn.className='btn';prevBtn.textContent='◀ Prev Token';
  prevBtn.onclick=()=>{activeToken=Math.max(0,activeToken-1);updateAttention();};ctrl.appendChild(prevBtn);
  const nextBtn=document.createElement('button');nextBtn.className='btn';nextBtn.textContent='Next Token ▶';
  nextBtn.onclick=()=>{activeToken=Math.min(TOKENS.length-1,activeToken+1);updateAttention();};ctrl.appendChild(nextBtn);
  const modeBtn=document.createElement('button');modeBtn.className='btn active';modeBtn.textContent='Mode: XL';
  modeBtn.onclick=()=>{xlMode=!xlMode;modeBtn.textContent='Mode: '+(xlMode?'XL':'Standard');modeBtn.classList.toggle('active',xlMode);updateAttention();};ctrl.appendChild(modeBtn);
  let autoA=null;
  const autoBtn=document.createElement('button');autoBtn.className='btn';autoBtn.textContent='⏩ Auto-step';
  autoBtn.onclick=()=>{if(autoA){clearInterval(autoA);autoA=null;autoBtn.classList.remove('active');}else{autoA=setInterval(()=>{activeToken=(activeToken+1)%TOKENS.length;updateAttention();},700);autoBtn.classList.add('active');}};ctrl.appendChild(autoBtn);

  activeToken=SEG_LEN; // Start at first token of second segment to show cross-segment attention
  updateAttention();

  return ()=>{try{if(autoA)clearInterval(autoA);if(el)el.innerHTML='';}catch(e){}};
}
