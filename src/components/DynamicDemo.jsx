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
const canvas=document.getElementById('c');
const W=canvas.width=window.innerWidth||700;
const H=canvas.height=window.innerHeight||320;
const ctx=canvas.getContext('2d');
ctx.fillStyle='#06060c';ctx.fillRect(0,0,W,H);
`

const buildSrcdoc = (code) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#06060c;overflow:hidden;}canvas{display:block;}</style>
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
    ref.current.srcdoc = buildSrcdoc(code)
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
