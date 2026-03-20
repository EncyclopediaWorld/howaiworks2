import { createCanvas, addHint, addControls, rand, TAU } from '/src/lib/shared.js'

let cleanup = null

export function mountBackpropagation(containerId = 'demo-bp') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 340)
  addHint(el, 'Watch a 2-layer neural net learn XOR (the problem Perceptrons can\'t solve!). See gradients flow backward.')
  const data = [{x:[0,0],y:0},{x:[0,1],y:1},{x:[1,0],y:1},{x:[1,1],y:0}]
  let w1 = Array(3).fill(0).map(()=>[rand(-.5,.5),rand(-.5,.5)])
  let b1 = Array(3).fill(0).map(()=>rand(-.3,.3))
  let w2 = [rand(-.5,.5),rand(-.5,.5),rand(-.5,.5)]
  let b2 = rand(-.3,.3)
  let lr3 = 0.8, epoch = 0, losses = [], lastGrads = []
  function forward(x){
    let h = w1.map((w,i)=>Math.max(0, w[0]*x[0]+w[1]*x[1]+b1[i]))
    let o = w2[0]*h[0]+w2[1]*h[1]+w2[2]*h[2]+b2
    o = 1/(1+Math.exp(-o))
    return {h,o}
  }
  function trainStep(){
    let totalLoss = 0; let grads = w2.map(()=>0)
    data.forEach(d=>{
      let {h,o} = forward(d.x); let err = o - d.y; totalLoss += err*err
      let dOut = err * o * (1-o)
      w2.forEach((w,i)=>{ let dw = dOut*h[i]; w2[i] -= lr3*dw; grads[i] += Math.abs(dw) })
      b2 -= lr3*dOut
      w1.forEach((w,i)=>{
        let dh = dOut*w2[i]*(h[i]>0?1:0)
        w[0] -= lr3*dh*d.x[0]; w[1] -= lr3*dh*d.x[1]; b1[i] -= lr3*dh
      })
    })
    epoch++; losses.push(totalLoss/4); if(losses.length>300) losses.shift(); lastGrads = grads
  }
  function draw(){
    ctx.clearRect(0,0,750,340)
    let nx=[85,305,540], ny=168
    let inY=[ny-50,ny+50], hidY=[ny-70,ny,ny+70]
    let np=[[],[]]; inY.forEach(y=>np[0].push({x:nx[0],y})); hidY.forEach(y=>np[1].push({x:nx[1],y})); np[2]=[{x:nx[2],y:ny}]
    for(let l=0;l<2;l++){
      let from=np[l], to=np[l+1]
      from.forEach((f,fi)=>to.forEach((t,ti)=>{
        let wv=l===0?w1[ti][fi]:w2[fi]; let absW=Math.abs(wv)
        ctx.strokeStyle = wv>0?`rgba(78,205,196,${Math.min(absW*1.5,.8)})`:`rgba(255,107,107,${Math.min(absW*1.5,.8)})`
        ctx.lineWidth = 1 + absW*3; ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(t.x,t.y); ctx.stroke()
      }))
    }
    if(lastGrads.length){ np[1].forEach((h,i)=>{ let t=np[2][0]; let g = Math.min(lastGrads[i]*20,1)
      ctx.strokeStyle = `rgba(255,209,102,${g})`; ctx.lineWidth=2; ctx.setLineDash([4,4])
      ctx.beginPath(); ctx.moveTo(t.x-20,t.y+(i-1)*5); ctx.lineTo(h.x+20,h.y); ctx.stroke(); ctx.setLineDash([])
    })}
    let labels=[['x₁','x₂'],['h₁','h₂','h₃'],['ŷ']]
    ;[np[0],np[1],np[2]].forEach((layer,li)=>layer.forEach((n,ni)=>{
      ctx.save(); ctx.shadowColor=li===2?'#ff6b6b':'#4ecdc4'; ctx.shadowBlur=8
      ctx.beginPath(); ctx.arc(n.x,n.y,20,0,TAU)
      ctx.fillStyle=li===0?'#38bdf822':li===1?'#4ecdc422':'#ff6b6b22'; ctx.fill()
      ctx.strokeStyle=li===0?'#38bdf8':li===1?'#4ecdc4':'#ff6b6b'; ctx.lineWidth=2; ctx.stroke(); ctx.restore()
      ctx.fillStyle='#e4e2df'; ctx.font='600 10px Fira Code'; ctx.textAlign='center'; ctx.fillText(labels[li][ni],n.x,n.y+4); ctx.textAlign='left'
    }))
    ctx.fillStyle='#38bdf8'; ctx.font='500 9px Fira Code'; ctx.textAlign='center';
    ctx.fillText('Input',nx[0],ny+100); ctx.fillStyle='#4ecdc4'; ctx.fillText('Hidden (ReLU)',nx[1],ny+100);
    ctx.fillStyle='#ff6b6b'; ctx.fillText('Output (σ)',nx[2],ny+100); ctx.textAlign='left';
    let tx=15, ty=12
    ctx.fillStyle='rgba(6,6,12,.88)'; ctx.beginPath(); ctx.roundRect(tx,ty,205,100,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='600 11px Fira Code'; ctx.fillText('XOR Truth vs Prediction:',tx+8,ty+18);
    data.forEach((d,i)=>{ let {o}=forward(d.x); let correct=Math.abs(o-d.y)<.3
      ctx.fillStyle=correct?'#34d399':'#ff6b6b'; ctx.font='500 9px Fira Code';
      ctx.fillText(d.x[0]+','+d.x[1]+' → target:'+d.y+' pred:'+o.toFixed(2)+(correct?' ✓':' ✗'),tx+8,ty+36+i*16)
    })
    let lx=590,lw=150,lh=80
    ctx.fillStyle='rgba(6,6,12,.88)'; ctx.beginPath(); ctx.roundRect(lx,ty,lw,lh+15,8); ctx.fill();
    ctx.fillStyle='#ff6b6b'; ctx.font='600 10px Fira Code'; ctx.fillText('Loss',lx+8,ty+16);
    ctx.fillStyle='#7d7a8c'; ctx.font='400 9px Fira Code'; ctx.fillText('Epoch '+epoch,lx+50,ty+16);
    if(losses.length>1){let mx2=Math.max(...losses),mn=Math.min(...losses); if(mx2===mn) mx2=mn+1;
      ctx.strokeStyle='#ff6b6b'; ctx.lineWidth=1.5; ctx.beginPath();
      losses.forEach((l,i)=>{ let x2=lx+5+i*(lw-10)/300, y=ty+25+(1-(l-mn)/(mx2-mn))*(lh-15); i?ctx.lineTo(x2,y):ctx.moveTo(x2,y)}); ctx.stroke()
    }
    ctx.fillStyle='rgba(6,6,12,.85)'; ctx.beginPath(); ctx.roundRect(15,288,720,45,8); ctx.fill();
    ctx.fillStyle='#ffd166'; ctx.font='600 10px Fira Code'; ctx.fillText('▶ Forward: input → hidden → output → loss',25,306);
    ctx.fillStyle='#ff6b6b'; ctx.fillText('◀ Backward: loss → ∂L/∂w₂ → ∂L/∂h → ∂L/∂w₁ (yellow dashes = gradient flow)',25,324)
  }
  const ctrl=addControls(el)
  const tb=document.createElement('button'); tb.className='btn'; tb.textContent='▶ Train ×10'; tb.onclick=()=>{ for(let i=0; i<10; i++) trainStep(); draw() }
  let tmr=null; const ab=document.createElement('button'); ab.className='btn'; ab.textContent='⏩ Auto Train'
  ab.onclick=()=>{ if(tmr){ clearInterval(tmr); tmr=null; ab.classList.remove('active') } else { tmr=setInterval(()=>{ trainStep(); draw() }, 40); ab.classList.add('active') } }
  const rst=document.createElement('button'); rst.className='btn'; rst.textContent='↻ Reset';
  rst.onclick=()=>{ w1=Array(3).fill(0).map(()=>[rand(-.5,.5),rand(-.5,.5)]); b1=Array(3).fill(0).map(()=>rand(-.3,.3));
    w2=[rand(-.5,.5),rand(-.5,.5),rand(-.5,.5)]; b2=rand(-.3,.3); epoch=0; losses=[]; lastGrads=[];
    if(tmr){ clearInterval(tmr); tmr=null; ab.classList.remove('active') } draw()
  }
  ctrl.appendChild(tb); ctrl.appendChild(ab); ctrl.appendChild(rst)
  draw()
  cleanup = () => { try{ el.innerHTML = '' } catch(e){ } }
  return cleanup
}
export function unmountBackpropagation(){ if(cleanup) cleanup() }
export default { mountBackpropagation, unmountBackpropagation }
