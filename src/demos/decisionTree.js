import { createCanvas, addHint, addControls, rand, TAU } from '/src/lib/shared.js'

let cleanup = null

export function mountDecisionTree(containerId = 'demo-tree') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 380)
  addHint(el, 'Click "Grow" to add one split at a time. Watch the tree recursively partition the space with optimal Gini splits!')
  let pts = []
  function seedPts(){
    pts=[]
    for(let i=0;i<15;i++){pts.push({x:rand(30,320),y:rand(30,180),c:0})}
    for(let i=0;i<15;i++){pts.push({x:rand(400,720),y:rand(30,180),c:1})}
    for(let i=0;i<8;i++){pts.push({x:rand(30,320),y:rand(200,360),c:1})}
    for(let i=0;i<8;i++){pts.push({x:rand(400,720),y:rand(200,360),c:0})}
  }
  seedPts();
  let root=null,nodeCount=0,growQueue=[]
  function gini(points){if(!points.length)return 0;let n=points.length;let c0=points.filter(p=>p.c===0).length;return 1-(c0/n)**2-((n-c0)/n)**2}
  function bestSplit(points){if(points.length<4)return null
    let best=null,bestG=gini(points)
    ;['x','y'].forEach(axis=>{let vals=points.map(p=>p[axis]).sort((a,b)=>a-b)
      for(let i=1;i<vals.length;i++){if(vals[i]===vals[i-1])continue
        let mid=(vals[i-1]+vals[i])/2;
        let left=points.filter(p=>p[axis]<=mid),right=points.filter(p=>p[axis]>mid)
        if(left.length<2||right.length<2) continue;
        let g=(left.length*gini(left)+right.length*gini(right))/points.length;
        if(g<bestG-0.001){bestG=g;best={axis,value:mid,gini:bestG}}
      }
    })
    return best
  }
  function makeLeaf(points,rect){let c0=points.filter(p=>p.c===0).length;
    return {leaf:true,label:c0>=points.length-c0?0:1,count0:c0,count1:points.length-c0,rect,points}
  }
  function initTree(){root=makeLeaf(pts,{x0:0,y0:0,x1:750,y1:370});growQueue=[root];nodeCount=0}
  initTree()
  function growOnce(){if(!growQueue.length)return
    growQueue.sort((a,b)=>gini(b.points)-gini(a.points));
    let leaf=growQueue.shift();
    let split=bestSplit(leaf.points);
    if(!split) return;
    leaf.leaf=false;leaf.axis=split.axis;leaf.value=split.value;leaf.gini=split.gini;
    let lPts=leaf.points.filter(p=>p[leaf.axis]<=leaf.value);
    let rPts=leaf.points.filter(p=>p[leaf.axis]>leaf.value);
    let lRect,rRect;
    if(leaf.axis==='x'){lRect={...leaf.rect,x1:leaf.value};rRect={...leaf.rect,x0:leaf.value}}
    else{lRect={...leaf.rect,y1:leaf.value};rRect={...leaf.rect,y0:leaf.value}}
    leaf.left=makeLeaf(lPts,lRect); leaf.right=makeLeaf(rPts,rRect);
    nodeCount++;
    if(gini(lPts)>0.05 && lPts.length>=4) growQueue.push(leaf.left);
    if(gini(rPts)>0.05 && rPts.length>=4) growQueue.push(leaf.right);
    draw()
  }
  function predict(p,node){if(!node)return 0; if(node.leaf) return node.label; return p[node.axis]<=node.value?predict(p,node.left):predict(p,node.right)}
  function draw(){
    ctx.clearRect(0,0,750,380)
    function drawRegions(node){if(!node)return; if(node.leaf){let r=node.rect; ctx.fillStyle=node.label===0?'rgba(255,107,107,.08)':'rgba(56,189,248,.08)'; ctx.fillRect(r.x0,r.y0,r.x1-r.x0,r.y1-r.y0); return} drawRegions(node.left); drawRegions(node.right)}
    drawRegions(root)
    function drawSplits(node,depth){if(!node||node.leaf)return;
      let r=node.rect; let colors=['#ffd166','#4ecdc4','#fb923c','#a78bfa','#ff6b6b','#38bdf8']; let col=colors[depth%colors.length];
      ctx.strokeStyle=col; ctx.lineWidth=2.5-depth*0.3; ctx.setLineDash([6,3]); ctx.beginPath();
      if(node.axis==='x'){ctx.moveTo(node.value,r.y0);ctx.lineTo(node.value,r.y1)} else {ctx.moveTo(r.x0,node.value);ctx.lineTo(r.x1,node.value)}
      ctx.stroke(); ctx.setLineDash([]);
      let lx=node.axis==='x'?node.value+3:r.x0+3; let ly=node.axis==='y'?node.value-4:r.y0+14;
      ctx.fillStyle='rgba(6,6,12,.8)'; ctx.beginPath(); ctx.roundRect(lx,ly-10,70,14,3); ctx.fill();
      ctx.fillStyle=col; ctx.font='600 8px Fira Code'; ctx.fillText(node.axis+'≤'+node.value.toFixed(0),lx+3,ly);
      drawSplits(node.left,depth+1); drawSplits(node.right,depth+1)
    }
    drawSplits(root,0)
    pts.forEach(p=>{let pred=predict(p,root),correct=pred===p.c; ctx.save(); if(correct){ctx.shadowColor=p.c?'#38bdf8':'#ff6b6b'; ctx.shadowBlur=5}
      ctx.beginPath(); ctx.arc(p.x,p.y,correct?5:7,0,TAU); ctx.fillStyle=p.c?'#38bdf8':'#ff6b6b'; ctx.fill();
      if(!correct){ctx.strokeStyle='#ffd166'; ctx.lineWidth=2.5; ctx.stroke()} ctx.restore()})
    function collectTree(node,x,y,w){if(!node)return[]; let r=[{node,x,y}]; if(!node.leaf){let childW=w/2; r=r.concat(collectTree(node.left,x-childW/2,y+36,childW)).concat(collectTree(node.right,x+childW/2,y+36,childW))} return r}
    let px=15,py=280; ctx.fillStyle='rgba(6,6,12,.92)'; ctx.beginPath(); ctx.roundRect(px,py,720,95,10); ctx.fill();
    let treeNodes=collectTree(root,180,py+16,280)
    treeNodes.forEach(tn=>{if(!tn.node.leaf){let childW=140/Math.pow(2,tn.depth||0); ctx.strokeStyle='#4a475a'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(tn.x,tn.y+10); ctx.lineTo(tn.x-childW/2,tn.y+36); ctx.stroke(); ctx.beginPath(); ctx.moveTo(tn.x,tn.y+10); ctx.lineTo(tn.x+childW/2,tn.y+36); ctx.stroke()}})
    treeNodes.forEach(tn=>{let n=tn.node; if(n.leaf){ctx.beginPath(); ctx.arc(tn.x,tn.y,8,0,TAU); ctx.fillStyle=n.label===0?'#ff6b6b33':'#38bdf833'; ctx.fill(); ctx.strokeStyle=n.label===0?'#ff6b6b':'#38bdf8'; ctx.lineWidth=1.5; ctx.stroke(); ctx.fillStyle=n.label===0?'#ff6b6b':'#38bdf8'; ctx.font='600 7px Fira Code'; ctx.textAlign='center'; ctx.fillText(n.count0+'/'+n.count1,tn.x,tn.y+3); ctx.textAlign='left'} else {ctx.beginPath(); ctx.roundRect(tn.x-18,tn.y-7,36,14,3); ctx.fillStyle='#ffd16622'; ctx.fill(); ctx.strokeStyle='#ffd166'; ctx.lineWidth=1; ctx.stroke(); ctx.fillStyle='#ffd166'; ctx.font='500 7px Fira Code'; ctx.textAlign='center'; ctx.fillText(n.axis+'≤'+n.value.toFixed(0),tn.x,tn.y+3); ctx.textAlign='left'}})
    let correct=pts.filter(p=>predict(p,root)===p.c).length; let acc=(correct/pts.length*100).toFixed(1)
    ctx.fillStyle='#ffd166'; ctx.font='700 11px Fira Code'; ctx.fillText('Decision Tree',400,py+16)
    ctx.fillStyle='#7d7a8c'; ctx.font='400 9px Fira Code'; ctx.fillText('Splits: '+nodeCount,400,py+34)
    ctx.fillStyle=acc>90?'#34d399':acc>70?'#ffd166':'#ff6b6b'; ctx.font='700 12px Fira Code'; ctx.fillText('Accuracy: '+acc+'%',400,py+54)
    ctx.fillStyle='#e4e2df'; ctx.font='400 9px Fira Code'; ctx.fillText(correct+'/'+pts.length+' correct',530,py+54)
    ctx.fillStyle='#7d7a8c'; ctx.fillText('Remaining impure leaves: '+growQueue.length,400,py+72)
    ctx.fillStyle='#a78bfa'; ctx.font='500 9px Fira Code'; ctx.fillText('Split criterion: Gini impurity = 1 − Σpᵢ²',400,py+88)
  }
  const ctrl = addControls(el)
  const gb = document.createElement('button'); gb.className='btn'; gb.textContent='🌳 Grow (+1 split)'; gb.onclick = growOnce
  const g5 = document.createElement('button'); g5.className='btn'; g5.textContent='🌳×5'; g5.onclick = ()=>{for(let i=0;i<5;i++) growOnce(); draw()}
  let tmr=null; const ab=document.createElement('button'); ab.className='btn'; ab.textContent='⏩ Auto Grow'
  ab.onclick = ()=>{ if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')} else {tmr=setInterval(()=>{ if(!growQueue.length){clearInterval(tmr);tmr=null;ab.classList.remove('active');return} growOnce()},400);ab.classList.add('active')} }
  const rst = document.createElement('button'); rst.className='btn'; rst.textContent='↻ Reset';
  rst.onclick = ()=>{ seedPts(); initTree(); if(tmr){clearInterval(tmr);tmr=null;ab.classList.remove('active')} draw() }
  ctrl.appendChild(gb); ctrl.appendChild(g5); ctrl.appendChild(ab); ctrl.appendChild(rst)
  draw()
  cleanup=()=>{try{el.innerHTML=''}catch(e){}}
  return cleanup
}
export function unmountDecisionTree(){ if(cleanup) cleanup() }
export default { mountDecisionTree, unmountDecisionTree }
