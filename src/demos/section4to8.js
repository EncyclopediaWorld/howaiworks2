import { createCanvas, addHint, addControls, TAU } from '/src/lib/shared.js'

function createRealDemo(containerId, title, description, drawFn, stepFn = null) {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 320)
  addHint(el, description)
  const ctrl = addControls(el)
  const state = { phase: 0, metric: 0 }
  let tmr = null

  function draw() { ctx.clearRect(0, 0, 750, 320); ctx.fillStyle = '#111'; ctx.fillRect(0,0,750,320)
    ctx.fillStyle = '#ffd166'; ctx.font = '700 15px Fira Code'; ctx.fillText(title, 20, 28)
    ctx.fillStyle = '#e4e2df'; ctx.font = '500 11px Fira Code'; ctx.fillText(description, 20, 50)
    if (stepFn) stepFn(ctx, state)
    ctx.fillStyle = '#38bdf8'; ctx.font = '700 18px Fira Code'; ctx.fillText('Score: ' + state.metric.toFixed(3), 20, 290)
    ctx.beginPath(); ctx.arc(650, 200, 60, 0, TAU); ctx.fillStyle = 'rgba(56,189,248,0.18)'; ctx.fill(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#38bdf8'; ctx.font = '500 16px Fira Code'; ctx.fillText((state.metric*100).toFixed(1) + '%', 620, 210)
  }

  function step() {
    state.phase += 1
    if (state.phase > 100) state.phase = 0
    state.metric = Math.tanh((Math.sin(state.phase*0.1) + 1.25) / 1.5)
    draw()
  }

  const btnStep = document.createElement('button'); btnStep.className='btn'; btnStep.innerHTML='⏱ 迭代'; btnStep.onclick=step
  const btnAuto = document.createElement('button'); btnAuto.className='btn'; btnAuto.textContent='▶ 自动'
  btnAuto.onclick=()=>{
    if(tmr){ clearInterval(tmr); tmr=null; btnAuto.textContent='▶ 自动' } else { tmr=setInterval(step, 260); btnAuto.textContent='■ 停止' }
  }
  ctrl.appendChild(btnStep); ctrl.appendChild(btnAuto)

  draw();

  return () => { if (tmr) clearInterval(tmr); try { el.innerHTML='' } catch (e) {} }
}

function svmStep(ctx, state) {
  const x = 100 + state.phase*5 % 500
  const y = 200 + Math.sin(state.phase*0.2)*50
  ctx.strokeStyle = '#7dd3fc'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(50, 120); ctx.lineTo(700, 250); ctx.stroke();
  ctx.fillStyle = '#34d399'; ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(700-x*0.6, 180 + Math.cos(state.phase*0.23)*40, 8, 0, TAU); ctx.fill();
}

function gmmStep(ctx, state) {
  const means = [[180, 160],[360,220],[560,140]]
  means.forEach((m,i)=>{
    const r = 24+Math.sin((state.phase+i*10)*0.2)*10
    ctx.strokeStyle = ['#a78bfa','#f472b6','#34d399'][i]; ctx.lineWidth=2
    ctx.beginPath(); ctx.ellipse(m[0],m[1],r,r*0.6,0,0,TAU); ctx.stroke()
  })
  ctx.fillStyle='#fde047'; ctx.font='600 12px Fira Code'; ctx.fillText('EM convergence step '+state.phase, 20, 120)
}

const actualDemos = {
  mountCnn: (id)=>createRealDemo(id,'CNN / LeNet','卷积核+池化特征提取', (ctx,state)=>{
    for(let r=0;r<7;r++){ const dy=80+r*22; for(let c=0;c<10;c++){ const alpha=0.4 + Math.sin((state.phase+c+r)*0.2)*0.3; ctx.fillStyle=`rgba(56,189,248,${alpha})`; ctx.fillRect(18+c*70,dy,62,18) }}
    ctx.fillStyle='#a5b4fc'; ctx.font='500 10px Fira Code'; ctx.fillText('Filter maps -> feature map pooling', 20, 240)
  }),
  mountLstm: (id)=>createRealDemo(id,'LSTM','门控记忆状态动态', (ctx,state)=>{
    state.metric = 0.8 + 0.2*Math.sin(state.phase*0.07)
    ctx.fillStyle='#f4f5f7'; ctx.fillRect(40,120,660,70);
    const gates = ['输入门','遗忘门','输出门'];
    gates.forEach((g,i)=>{ const v=60+Math.sin(state.phase*0.08+i)*25; ctx.fillStyle='#38bdf8'; ctx.fillRect(80+i*200,130,v,40); ctx.fillStyle='#111'; ctx.fillText(`${g}  ${Math.round(v)}%`, 80+i*200, 160) })
  }),
  mountSvm: (id)=>createRealDemo(id,'SVM','支持向量与间隔最大化', svmStep),
  mountGmm: (id)=>createRealDemo(id,'GMM+EM','多高斯聚类与期望最大化', gmmStep),
  mountRf: (id)=>createRealDemo(id,'随机森林','多个决策树投票聚合',(ctx,state)=>{
    const trees=10; for(let i=0;i<trees;i++){ ctx.strokeStyle=`rgba(120,110,255,${0.1+0.8*i/trees})`; ctx.beginPath(); ctx.moveTo(70+i*60,280); ctx.lineTo(70+i*60,160-i*4); ctx.stroke() }
    ctx.fillStyle='#fff'; ctx.font='500 12px Fira Code'; ctx.fillText('Forest vote: '+(Math.round((Math.sin(state.phase*0.12)+1)/2*100))+'%', 20, 130)
  }),
  mountAda: (id)=>createRealDemo(id,'AdaBoost','迭代样本加权训练弱分类器',(ctx,state)=>{
    const w=60+Math.sin(state.phase*0.2)*20; ctx.fillStyle='#fb7185'; ctx.fillRect(20,200,Math.abs(w),20); ctx.fillStyle='#38bdf8'; ctx.fillRect(20,230,Math.abs(100-w),20);
    ctx.fillStyle='#e2e8f0'; ctx.font='500 12px Fira Code'; ctx.fillText('Classifier weight: '+(Math.round(w))+'%',20,170)
  }),

  mountDbn: (id)=>createRealDemo(id,'DBN','堆栈 RBM 逐层预训练', (ctx,state)=>{
    ctx.fillStyle='#ffffff22'; ctx.fillRect(40,130,670,160)
    ctx.fillStyle='#34d399'; ctx.font='600 14px Fira Code'; ctx.fillText('层 ' + ((state.phase/12|0)%5+1)+'  pre-train', 40, 200)
    ctx.strokeStyle='#34d399'; for(let i=0;i<5;i++){ ctx.strokeRect(50+i*120,150,80,70) }
  }),
  mountSae: (id)=>createRealDemo(id,'Sparse AE','稀疏性约束编码', (ctx,state)=>{
    const sparsity=0.2+Math.abs(Math.sin(state.phase*0.14))*0.75
    ctx.fillStyle='#111'; ctx.fillRect(40,140,650,130); ctx.fillStyle='#38bdf8'; ctx.fillRect(40,140,sparsity*650,20)
    ctx.fillStyle='#e0e7ff'; ctx.fillText('Sparsity:'+sparsity.toFixed(2), 40, 180)
  }),
  mountDae: (id)=>createRealDemo(id,'Denoising AE','加噪声输入，重构清晰', (ctx,state)=>{
    const noise=Math.abs(Math.sin(state.phase*0.15))*0.5
    ctx.fillStyle='#111'; ctx.fillRect(50,140,650,130)
    const intact = 1-noise
    ctx.fillStyle='#34d399'; ctx.fillRect(60,160,intact*620,18); ctx.fillStyle='#f43f5e'; ctx.fillRect(60+intact*620,160,noise*620,18)
    ctx.fillStyle='#e2e8f0'; ctx.fillText('Noise level:'+noise.toFixed(2), 40, 190)
  }),
  mountGbdt: (id)=>createRealDemo(id,'GBDT','逐步残差拟合决策树', (ctx,state)=>{
    const trees=1+((state.phase/15|0)%20)
    ctx.fillStyle='#111'; ctx.fillRect(48,145,652,120)
    ctx.fillStyle='#facc15'; ctx.font='600 14px Fira Code'; ctx.fillText('Trees: '+trees, 40, 190)
    ctx.fillStyle='#a5b4fc'; ctx.fillRect(60,220,(trees/20)*620,14)
  }),
  mountNnlm: (id)=>createRealDemo(id,'NNLM','词嵌入+softmax预测下一个词', (ctx,state)=>{
    const words=['I','love','deep','learning','!']; const idx=state.phase%words.length
    ctx.fillStyle='#fff'; ctx.font='700 30px Fira Code'; ctx.fillText(words[idx], 540, 60)
    ctx.fillStyle='#a3e635'; ctx.font='500 12px Fira Code'; ctx.fillText('预测概率 max=0.9', 20, 95)
  }),

  mountAlex: (id)=>createRealDemo(id,'AlexNet','多层卷积+ReLU特征图', (ctx,state)=>{
    const cnt=1+((state.phase/10|0)%8)
    ctx.fillStyle='#fff'; ctx.font='600 14px Fira Code'; ctx.fillText('Conv layer '+cnt+' active', 20, 110)
    for(let i=0;i<cnt;i++){ ctx.fillStyle=`rgba(56,189,248,${0.2+i*0.08})`; ctx.fillRect(40+i*80,140,60,60)}
  }),
  mountDrop: (id)=>createRealDemo(id,'Dropout','随机神经元失活', (ctx,state)=>{
    const rate=(Math.abs(Math.sin(state.phase*0.13))*0.65+0.05)
    ctx.fillStyle='#e11d48'; ctx.fillRect(50,180,rate*640,25);
    ctx.fillStyle='#fff'; ctx.font='500 12px Fira Code'; ctx.fillText('Dropout rate: '+rate.toFixed(2), 20, 160)
  }),
  mountW2v: (id)=>createRealDemo(id,'Word2Vec','词向量i->c+skipgram', (ctx,state)=>{
    const input=['king','queen','man','woman']; const t=(state.phase/10|0)%4
    ctx.fillStyle='#fbbf24'; ctx.font='700 28px Fira Code'; ctx.fillText(input[t], 30, 220)
    ctx.fillStyle='#38bdf8'; ctx.font='500 10px Fira Code'; ctx.fillText('cos sim with woman: '+(0.5 + Math.sin(state.phase*0.1)*0.4).toFixed(2), 20, 260)
  }),
  mountVae: (id)=>createRealDemo(id,'VAE','潜在空间采样重构', (ctx,state)=>{
    const x=375+Math.sin(state.phase*0.2)*90, y=170+Math.cos(state.phase*0.2)*60
    ctx.fillStyle='#34d399'; ctx.beginPath(); ctx.arc(x,y,32,0,TAU); ctx.fill()
    ctx.fillStyle='#f0f9ff'; ctx.font='500 12px Fira Code'; ctx.fillText('z调度', 330, 80)
  }),
  mountGan: (id)=>createRealDemo(id,'GAN','生成器vs判别器对抗', (ctx,state)=>{
    const d=0.6+0.4*Math.sin(state.phase*0.15)
    ctx.fillStyle='#34d399'; ctx.fillRect(60,220,d*300,28); ctx.fillStyle='#f43f5e'; ctx.fillRect(60,260,(1-d)*300,28)
    ctx.fillStyle='#fff'; ctx.fillText('D loss: '+(1-d).toFixed(2)+' G loss:'+(d*0.8).toFixed(2), 20, 160)
  }),
  mountAttn: (id)=>createRealDemo(id,'Attention','Query-Key-Value 软max权重', (ctx,state)=>{
    const x0=80,y0=160
    for(let i=0;i<6;i++){ const w=0.2+0.7*Math.abs(Math.sin((state.phase*0.1+i)*0.6)); ctx.fillStyle=`rgba(56,189,248,${w})`; ctx.fillRect(x0+i*90,y0,60,60); ctx.fillStyle='#fff'; ctx.fillText(w.toFixed(2),x0+i*90+10,y0+35) }
  }),
  mountResnet: (id)=>createRealDemo(id,'ResNet','残差连接使梯度过渡', (ctx,state)=>{
    const blocks=3+((state.phase/20|0)%5)
    for(let i=0;i<blocks;i++){ ctx.strokeStyle='#a5b4fc'; ctx.strokeRect(50+i*110,150,85,50); if(i>0){ ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(50+(i-1)*110+85,175); ctx.lineTo(50+i*110,175); ctx.stroke() }}
    ctx.fillStyle='#fff'; ctx.fillText('Residual blocks: '+blocks, 20, 120)
  }),
  mountBn: (id)=>createRealDemo(id,'BatchNorm','归一化稳定训练', (ctx,state)=>{
    const m = 0.5 + 0.5*Math.cos(state.phase*0.14)
    ctx.fillStyle='#22c55e'; ctx.fillRect(60,220,m*660,20); ctx.fillStyle='#e4e2df'; ctx.fillText('variance: '+(0.2+0.7*m).toFixed(2), 20, 190)
  }),
  mountTransformer: (id)=>createRealDemo(id,'Transformer','多头自注意力机制', (ctx,state)=>{
    for(let i=0;i<4;i++){ const x=80+i*150; ctx.strokeStyle='#38bdf8'; ctx.strokeRect(x,140,90,70); for(let j=0;j<4;j++){ const a=Math.abs(Math.sin((state.phase+i+j)*0.3)); ctx.fillStyle=`rgba(255,221,71,${a})`; ctx.fillRect(x+10+j*18,150,14,14)} }
    ctx.fillStyle='#fff'; ctx.fillText('头数: 8', 20, 120)
  }),
  mountElmo: (id)=>createRealDemo(id,'ELMo','上下文词向量组合', (ctx,state)=>{
    const words=['I','am','happy','today']; const t=state.phase%4
    ctx.fillStyle='#fdba74'; ctx.font='600 22px Fira Code'; ctx.fillText(words[t], 300, 190)
    ctx.fillStyle='#e0e7ff'; ctx.fillText('上下文增强向量', 20, 250)
  }),
  mountBert: (id)=>createRealDemo(id,'BERT','双向编码器细化表示', (ctx,state)=>{
    const m = (Math.sin(state.phase*0.14)+1)/2;
    ctx.fillStyle='#38bdf8'; ctx.fillRect(60,160,m*660,24)
    ctx.fillStyle='#fff'; ctx.fillText('Masked LM 性能 '+(85 + m*10).toFixed(1)+'%', 20, 130)
  }),
  mountStylegan: (id)=>createRealDemo(id,'StyleGAN','生成潜变量图像', (ctx,state)=>{
    const v = 0.4 + 0.55*Math.abs(Math.sin(state.phase*0.17)); ctx.fillStyle='rgba(168,85,247,'+v+')'; ctx.fillRect(260,110,220,190); ctx.fillStyle='#fff'; ctx.fillText('FID: '+(25-(v*15)).toFixed(1), 20, 120)
  }),
  mountXgboost: (id)=>createRealDemo(id,'XGBoost','正则化梯度提升树', (ctx,state)=>{
    const t = (Math.sin(state.phase*0.12)+1)/2
    ctx.fillStyle='#22c55e'; ctx.fillRect(60,200,t*620,20); ctx.fillStyle='#fff'; ctx.fillText('Validation gain: '+(30 + t*40).toFixed(2)+'%', 20, 170)
  }),
  mountTransformer: (id)=>createRealDemo(id,'Transformer','多头自注意力机制', (ctx,state)=>{
    for(let i=0;i<4;i++){ const x=80+i*150; ctx.strokeStyle='#38bdf8'; ctx.strokeRect(x,140,90,70); for(let j=0;j<4;j++){ const a=Math.abs(Math.sin((state.phase+i+j)*0.3)); ctx.fillStyle=`rgba(255,221,71,${a})`; ctx.fillRect(x+10+j*18,150,14,14)} }
    ctx.fillStyle='#fff'; ctx.fillText('Heads: 8', 20, 120)
  }),
  mountGpt2: (id)=>createRealDemo(id,'GPT-2','大型自回归语言模型', (ctx,state)=>{
    const mer = Math.floor((state.phase%8)+1)
    ctx.fillStyle='#38bdf8'; ctx.font='500 16px Fira Code'; ctx.fillText('Text generated length: '+(20+mer*10), 30, 70)
    ctx.fillStyle='#fff'; ctx.fillText('Transformer blocks: '+(12+mer), 30, 110)
  }),
  mountT5: (id)=>createRealDemo(id,'T5','Text-to-text transformer', (ctx,state)=>{
    const m=(Math.sin(state.phase*0.1)+1)/2
    ctx.fillStyle='#a78bfa'; ctx.fillRect(50,180,m*660,22); ctx.fillStyle='#fff'; ctx.fillText('Task adaptation score: '+(60+m*30).toFixed(1)+'%', 20, 150)
  }),
  mountGpt3: (id)=>createRealDemo(id,'GPT-3','大规模自回归语言模型', (ctx,state)=>{
    const s=(Math.sin(state.phase*0.08)+1)/2
    ctx.fillStyle='#22d3ee'; ctx.fillRect(60,220,s*640,18); ctx.fillStyle='#fff'; ctx.fillText('few-shot accuracy: '+(55+s*25).toFixed(1)+'%', 20, 180)
  }),
  mountChatgpt: (id)=>createRealDemo(id,'ChatGPT','对话型 RLHF 模型', (ctx,state)=>{
    const u=(Math.sin(state.phase*0.1)+1)/2
    ctx.fillStyle='#fb7185'; ctx.fillRect(50,200,u*680,16); ctx.fillStyle='#fff'; ctx.fillText('response clarity: '+(65+u*20).toFixed(1)+'%', 20, 170)
  }),
  mountVit: (id)=>createRealDemo(id,'ViT','图像补丁 Transformer', (ctx,state)=>{
    for(let i=0;i<4;i++){ for(let j=0;j<4;j++){ ctx.strokeStyle='#38bdf8'; ctx.strokeRect(90+j*56,120+i*56,50,50); }}
    ctx.fillStyle='#fff'; ctx.fillText('Patch attention updates', 20, 100)
  }),
  mountDiffusion: (id)=>createRealDemo(id,'Diffusion','逆扩散逐步去噪生成', (ctx,state)=>{
    const p = (state.phase%50)/50
    ctx.fillStyle='#38bdf8'; ctx.fillRect(60,170,p*640,22); ctx.fillStyle='#fff'; ctx.fillText('step '+((state.phase%50)+1)+'/50',20,150)
  }),
  mountRl: (id)=>createRealDemo(id,'深度强化学习','策略价值迭代', (ctx,state)=>{
    const rewards = 60 + 30*Math.sin(state.phase*0.1);
    ctx.fillStyle='#22c55e'; ctx.fillRect(60,210,(rewards/100)*620,20); ctx.fillStyle='#fff'; ctx.fillText('累计奖励: '+rewards.toFixed(1), 20, 180)
  })
}

const unmounts = {}

Object.keys(actualDemos).forEach(fn => {
  unmounts['un' + fn.slice(5)] = id => () => { /*no state*/ }
})

export default Object.assign(actualDemos, unmounts)
