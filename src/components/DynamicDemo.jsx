import { useEffect, useRef } from 'react'

// Utilities injected into every generated demo's iframe scope.
const SHARED = `
const lerp=(a,b,t)=>a+(b-a)*t;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const sigmoid=x=>1/(1+Math.exp(-x));
const rand=(a,b)=>a+Math.random()*(b-a);
const randInt=(a,b)=>Math.floor(rand(a,b));
const dist=(x1,y1,x2,y2)=>Math.hypot(x2-x1,y2-y1);
const TAU=Math.PI*2;
const W=750, H=300;
const canvas=document.getElementById('c');
canvas.width=W; canvas.height=H;
canvas.style.width=W+'px'; canvas.style.height=H+'px';
const ctx=canvas.getContext('2d');
ctx.fillStyle='#06060c';ctx.fillRect(0,0,W,H);

// addBtn(label, onClick) — appends a styled button below the canvas
function addBtn(label, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.style.cssText = 'margin:6px 4px 0;padding:4px 14px;background:#1a1a2e;color:#e4e2df;border:1px solid #333;border-radius:6px;font:600 11px Courier New;cursor:pointer;';
  b.onmouseover = () => b.style.borderColor = '#4ecdc4';
  b.onmouseout  = () => b.style.borderColor = '#333';
  b.onclick = onClick;
  document.body.appendChild(b);
}

// showHint(text) — displays a small hint line below the canvas
function showHint(text) {
  const d = document.createElement('div');
  d.textContent = text;
  d.style.cssText = 'margin:6px 4px 0;color:#888;font:400 10px Courier New;';
  document.body.appendChild(d);
}
`

const buildHtml = (code) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#06060c;}canvas{display:block;}</style>
</head><body>
<canvas id="c"></canvas>
<script>
${SHARED}
try {
${code}
} catch(e) {
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#06060c';ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ff6b6b';ctx.font='600 12px Courier New';
  ctx.fillText('Demo error: '+e.message, 16, 32);
}
</script></body></html>`

export default function DynamicDemo({ code }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current || !code) return
    const blob = new Blob([buildHtml(code)], { type: 'text/html' })
    const url  = URL.createObjectURL(blob)
    ref.current.src = url
    return () => URL.revokeObjectURL(url)
  }, [code])

  if (!code) return null

  return (
    <iframe
      ref={ref}
      sandbox="allow-scripts"
      title="AI-generated explanation demo"
      className="dynamic-demo-frame"
    />
  )
}
