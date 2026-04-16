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

// roundRect polyfill for browsers that don't support it natively
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    this.beginPath();
    this.moveTo(x+r, y);
    this.lineTo(x+w-r, y);
    this.quadraticCurveTo(x+w, y, x+w, y+r);
    this.lineTo(x+w, y+h-r);
    this.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    this.lineTo(x+r, y+h);
    this.quadraticCurveTo(x, y+h, x, y+h-r);
    this.lineTo(x, y+r);
    this.quadraticCurveTo(x, y, x+r, y);
    this.closePath();
  };
}

// Auto-resize: report content height to parent whenever DOM changes
function _reportHeight() {
  window.parent.postMessage({ type: 'iframeHeight', height: document.body.scrollHeight }, '*');
}
new MutationObserver(_reportHeight).observe(document.body, { childList: true, subtree: true });
_reportHeight();
`

const buildHtml = (code) => `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{margin:0;padding:0;box-sizing:border-box;}html,body{background:#06060c;overflow-x:hidden;overflow-y:hidden;}canvas{display:block;max-width:100%;}</style>
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
    console.log("AI 生成的代码：", code)
    ref.current.srcdoc = buildHtml(code)
  }, [code])

  useEffect(() => {
    function onMessage(e) {
      if (e.data?.type === 'iframeHeight' && ref.current) {
        ref.current.style.height = e.data.height + 'px'
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

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
