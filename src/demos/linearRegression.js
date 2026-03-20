import { createCanvas, addHint } from '/src/lib/shared.js'

let cleanup = null

export function mountLinearRegression(containerId = 'demo-lr'){
  const el = document.getElementById(containerId)
  if(!el) return () => {}
  // clear any existing content (legacy canvas)
  el.innerHTML = ''

  const [c, ctx] = createCanvas(el, 750, 300)
  addHint(el, 'Click to add points, right-click to remove nearest. Best-fit line updates in real-time.')

  let pts = [{x:100,y:230},{x:180,y:195},{x:260,y:175},{x:350,y:140},{x:430,y:110},{x:550,y:80},{x:620,y:60}]

  function fit(){
    if(pts.length<2) return {w:0,b:150}
    let sx=0,sy=0,sxy=0,sxx=0,n=pts.length
    pts.forEach(p=>{sx+=p.x;sy+=p.y;sxy+=p.x*p.y;sxx+=p.x*p.x})
    let denom = (n*sxx - sx*sx) || 1
    let w = (n*sxy - sx*sy) / denom
    let b = (sy - w*sx)/n
    return {w,b}
  }

  function draw(){
    ctx.clearRect(0,0,750,300)
    // grid
    ctx.strokeStyle = '#1a1a2a'
    for(let i=0;i<750;i+=75){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i,300); ctx.stroke() }
    for(let i=0;i<300;i+=75){ ctx.beginPath(); ctx.moveTo(0,i); ctx.lineTo(750,i); ctx.stroke() }

    const {w,b} = fit()
    if(pts.length>=2){
      ctx.save(); ctx.shadowColor='#ff6b6b'; ctx.shadowBlur=10; ctx.strokeStyle='#ff6b6b'; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.moveTo(0,b); ctx.lineTo(750,w*750+b); ctx.stroke(); ctx.restore();
      // residuals
      pts.forEach(p=>{ ctx.strokeStyle='rgba(255,107,107,.3)'; ctx.lineWidth=1; ctx.setLineDash([3,3]); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x,w*p.x+b); ctx.stroke(); ctx.setLineDash([]) })
      let mse = pts.reduce((a,p)=>a+(p.y-(w*p.x+b))**2,0)/pts.length
      ctx.fillStyle='rgba(6,6,12,.88)'; ctx.beginPath(); ctx.roundRect(8,8,220,50,8); ctx.fill();
      ctx.fillStyle='#ff6b6b'; ctx.font='600 11px Fira Code'; ctx.fillText('y = '+w.toFixed(3)+'x + '+b.toFixed(1),18,28);
      ctx.fillStyle='#ffd166'; ctx.font='500 10px Fira Code'; ctx.fillText('MSE = '+mse.toFixed(1)+' | '+pts.length+' points',18,46)
    }
    // points
    pts.forEach(p=>{ ctx.save(); ctx.shadowColor='#4ecdc4'; ctx.shadowBlur=8; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fillStyle='#4ecdc4'; ctx.fill(); ctx.restore() })
  }

  function handleClick(e){
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) * 750 / r.width
    const y = (e.clientY - r.top) * 300 / r.height
    pts.push({x,y}); draw()
  }
  function handleContext(e){
    e.preventDefault();
    const r = c.getBoundingClientRect();
    const mx = (e.clientX - r.left) * 750 / r.width
    const my = (e.clientY - r.top) * 300 / r.height
    pts = pts.filter(p => Math.hypot(p.x-mx,p.y-my) > 15); draw()
  }

  c.addEventListener('click', handleClick)
  c.addEventListener('contextmenu', handleContext)

  // controls
  const ctrl = document.createElement('div'); ctrl.className='demo-controls'; el.appendChild(ctrl)
  const randBtn = document.createElement('button'); randBtn.className='btn'; randBtn.textContent='🎲 Random'; randBtn.onclick = ()=>{ pts=[]; for(let i=0;i<10;i++) pts.push({x:Math.random()*700+40,y:Math.random()*260+20}); draw() }
  const clrBtn = document.createElement('button'); clrBtn.className='btn'; clrBtn.textContent='↻ Reset'; clrBtn.onclick = ()=>{ pts=[{x:100,y:230},{x:180,y:195},{x:260,y:175},{x:350,y:140},{x:430,y:110},{x:550,y:80},{x:620,y:60}]; draw() }
  ctrl.appendChild(randBtn); ctrl.appendChild(clrBtn)

  draw()

  cleanup = () => {
    try{ c.removeEventListener('click', handleClick); c.removeEventListener('contextmenu', handleContext); el.innerHTML = '' }catch(e){}
  }

  return cleanup
}

export function unmountLinearRegression(){ if(cleanup) cleanup(); }

export default { mountLinearRegression, unmountLinearRegression }
