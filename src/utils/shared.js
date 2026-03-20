// Minimal ES module port of shared utilities (selected helpers).
export const $ = (id) => document.getElementById(id)
export const rand = (a,b) => a + Math.random()*(b-a)
export const dist = (x1,y1,x2,y2) => Math.hypot(x2-x1, y2-y1)
export const TAU = Math.PI*2

export function getDPR(){
  return Math.max(1, Math.min(3, window.devicePixelRatio || 1));
}

export function addHint(el, t){
  const d = document.createElement('div');
  d.className = 'demo-hint';
  d.textContent = t;
  el.appendChild(d);
}

export function addControls(el){
  const d = document.createElement('div');
  d.className = 'demo-controls';
  el.appendChild(d);
  return d;
}

// initParticles is left as a small wrapper to the original implementation if needed.
export function initParticles(id){
  // original implementation lives in root/shared.js; the legacy pages will still load it from there.
  const c = document.getElementById(id);
  if(!c) return;
  // do nothing here – the original pages load the working shared.js already in repo
}
