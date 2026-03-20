import { createCanvas, addHint } from '/src/lib/shared.js'

let cleanup = null

export function mountBayes(containerId = 'demo-bayes') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 400)
  addHint(el, 'Drag sliders to change disease prevalence and test accuracy. Watch the funnel: most positive tests are false alarms!')
  let prev = 3, sens = 92, fpr = 7
  function draw() {
    ctx.clearRect(0, 0, 750, 400)
    let pop = 1000, sick = Math.round(pop * prev / 100), healthy = pop - sick
    let tp = Math.round(sick * sens / 100), fn = sick - tp, fp = Math.round(healthy * fpr / 100), tn = healthy - fp
    let totalPos = tp + fp, post = totalPos > 0 ? tp / totalPos * 100 : 0
    ctx.fillStyle = 'rgba(6,6,12,.9)'; ctx.beginPath(); ctx.roundRect(10, 8, 355, 240, 10); ctx.fill()
    ctx.fillStyle = '#ffd166'; ctx.font = '700 12px Fira Code'; ctx.fillText('Population: ' + pop + ' people', 22, 28)
    let bx = 22, by = 42, bw = 330, bh = 28
    let sickW = bw * (sick / pop), healthW = bw - sickW
    ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.roundRect(bx, by, sickW, bh, 4); ctx.fill()
    ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.roundRect(bx + sickW, by, healthW, bh, 4); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '600 10px Fira Code'; ctx.textAlign = 'center'
    if (sickW > 40) ctx.fillText(sick + ' sick', bx + sickW / 2, by + 18)
    ctx.fillText(healthy + ' healthy', bx + sickW + healthW / 2, by + 18); ctx.textAlign = 'left'
    let fy = 80; ctx.fillStyle = '#ffd166'; ctx.font = '600 10px Fira Code'; ctx.fillText('↓ Test them all ↓', bx + 120, fy)
    let by2 = 95, bxL = 22, brW = 155
    ctx.fillStyle = 'rgba(255,107,107,.12)'; ctx.beginPath(); ctx.roundRect(bxL, by2, brW, 80, 8); ctx.fill()
    ctx.strokeStyle = '#ff6b6b55'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bxL, by2, brW, 80, 8); ctx.stroke()
    ctx.fillStyle = '#ff6b6b'; ctx.font = '600 10px Fira Code'; ctx.fillText(sick + ' Sick People', bxL + 10, by2 + 18)
    ctx.fillStyle = '#34d399'; ctx.font = '500 9px Fira Code'; ctx.fillText('Test+ (true pos): ' + tp, bxL + 10, by2 + 38)
    ctx.fillStyle = '#a78bfa'; ctx.fillText('Test− (missed): ' + fn, bxL + 10, by2 + 56)
    ctx.fillStyle = '#111120'; ctx.fillRect(bxL + 10, by2 + 65, brW - 20, 6); ctx.fillStyle = '#34d399'; ctx.fillRect(bxL + 10, by2 + 65, (brW - 20) * sens / 100, 6)
    let bxR = 197
    ctx.fillStyle = 'rgba(56,189,248,.08)'; ctx.beginPath(); ctx.roundRect(bxR, by2, brW, 80, 8); ctx.fill()
    ctx.strokeStyle = '#38bdf855'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(bxR, by2, brW, 80, 8); ctx.stroke()
    ctx.fillStyle = '#38bdf8'; ctx.font = '600 10px Fira Code'; ctx.fillText(healthy + ' Healthy People', bxR + 10, by2 + 18)
    ctx.fillStyle = '#fb923c'; ctx.font = '500 9px Fira Code'; ctx.fillText('Test+ (false alarm): ' + fp, bxR + 10, by2 + 38)
    ctx.fillStyle = '#4a475a'; ctx.fillText('Test− (correct): ' + tn, bxR + 10, by2 + 56)
    ctx.fillStyle = '#111120'; ctx.fillRect(bxR + 10, by2 + 65, brW - 20, 6); ctx.fillStyle = '#fb923c'; ctx.fillRect(bxR + 10, by2 + 65, (brW - 20) * fpr / 100, 6)
    let my = 190; ctx.fillStyle = '#ffd166'; ctx.font = '600 10px Fira Code'; ctx.textAlign = 'center'
    ctx.fillText('↓ All positive tests: ' + tp + ' + ' + fp + ' = ' + totalPos + ' ↓', 185, my); ctx.textAlign = 'left'
    let ry = 200; ctx.fillStyle = 'rgba(255,209,102,.08)'; ctx.beginPath(); ctx.roundRect(22, ry, 330, 42, 8); ctx.fill()
    ctx.strokeStyle = '#ffd16644'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(22, ry, 330, 42, 8); ctx.stroke()
    ctx.fillStyle = '#34d399'; ctx.font = '700 11px Fira Code';
    let tpBar = tp / totalPos * 310, fpBar = fp / totalPos * 310
    ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.roundRect(32, ry + 10, tpBar, 22, 4); ctx.fill()
    ctx.fillStyle = '#fb923c'; ctx.beginPath(); ctx.roundRect(32 + tpBar, ry + 10, fpBar, 22, 4); ctx.fill()
    ctx.fillStyle = '#fff'; ctx.font = '700 9px Fira Code'; ctx.textAlign = 'center'
    if (tpBar > 35) ctx.fillText(tp + ' real', 32 + tpBar / 2, ry + 25)
    if (fpBar > 40) ctx.fillText(fp + ' false', 32 + tpBar + fpBar / 2, ry + 25)
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(6,6,12,.92)'; ctx.beginPath(); ctx.roundRect(380, 8, 360, 240, 12); ctx.fill()
    ctx.fillStyle = '#ffd166'; ctx.font = '700 14px Fira Code'; ctx.fillText('⊕ You tested POSITIVE', 395, 34)
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 10px Fira Code'; ctx.fillText('What is the probability you are actually sick?', 395, 54)
    let pctColor = post > 50 ? '#ff6b6b' : post > 20 ? '#ffd166' : '#34d399'
    ctx.fillStyle = pctColor; ctx.font = '900 64px Fraunces'; ctx.fillText(post.toFixed(1) + '%', 400, 130)
    ctx.fillStyle = '#111120'; ctx.beginPath(); ctx.roundRect(400, 148, 320, 20, 5); ctx.fill()
    ctx.fillStyle = pctColor; ctx.beginPath(); ctx.roundRect(400, 148, Math.max(320 * post / 100, 4), 20, 5); ctx.fill()
    ctx.fillStyle = '#e4e2df'; ctx.font = '500 11px Fira Code';
    ctx.fillText(post < 15 ? '😌 Relax! You\'re almost certainly fine.' : post < 35 ? '🤔 Unlikely sick, but maybe retest.' : post < 65 ? '⚠️ Coin-flip. Further testing needed.' : post < 85 ? '😟 Likely sick. See a doctor.' : '🚨 Very likely sick. Seek treatment.', 400, 188)
    ctx.fillStyle = '#a78bfa'; ctx.font = '500 10px Fira Code'; ctx.fillText('P(sick|+) = P(+|sick)·P(sick) / P(+)', 400, 215)
    ctx.fillStyle = '#7d7a8c'; ctx.font = '400 9px Fira Code';
    ctx.fillText('= ' + sens + '%×' + prev + '% / ' + ((tp + fp) / pop * 100).toFixed(1) + '% = ' + post.toFixed(1) + '%', 400, 235)
    ctx.fillStyle = 'rgba(6,6,12,.88)'; ctx.beginPath(); ctx.roundRect(10, 258, 730, 65, 10); ctx.fill()
    ctx.fillStyle = '#ff6b6b'; ctx.font = '700 11px Fira Code'; ctx.fillText('🔑 The Base Rate Fallacy', 22, 278)
    ctx.fillStyle = '#e4e2df'; ctx.font = '400 10px Fira Code';
    ctx.fillText('With ' + prev + '% prevalence: ' + healthy + ' healthy people produce ' + fp + ' false alarms, while only ' + sick + ' sick produce ' + tp + ' true positives.', 22, 298)
    ctx.fillStyle = '#ffd166'; ctx.font = '500 10px Fira Code';
    ctx.fillText('Bayes\' insight: the prior probability (base rate) matters enormously — a rare disease means most positives are wrong!', 22, 316)
    let dx = 12, dy = 332, ds = 4.5, dcols = 100
    for (let i = 0; i < pop; i++) {
      let x = dx + (i % dcols) * ds * 1.55, y = dy + Math.floor(i / dcols) * ds * 1.55
      let isSick = i < sick, testPos = isSick ? i < tp : i >= sick && i < sick + fp
      ctx.fillStyle = isSick && testPos ? '#ff6b6b' : isSick ? '#a78bfa' : testPos ? '#fb923c' : '#181828'
      ctx.beginPath(); ctx.arc(x + ds / 2, y + ds / 2, ds / 2, 0, Math.PI * 2); ctx.fill()
    }
    ctx.fillStyle = '#4a475a'; ctx.font = '400 8px Fira Code'; ctx.fillText('Each dot = 1 of ' + pop + ' people   🔴 true+  🟠 false+  🟣 missed  ⚫ true−', 12, 396)
  }
  const ctrl = document.createElement('div'); ctrl.className = 'demo-controls'; el.appendChild(ctrl)
  ctrl.innerHTML = '<label>Prevalence</label><input type="range" min="1" max="50" value="3" id="bp"><span id="bpv" class="btn" style="min-width:36px;text-align:center">3%</span>' +
    '<label>Sensitivity</label><input type="range" min="50" max="99" value="92" id="bs"><span id="bsv" class="btn" style="min-width:36px;text-align:center">92%</span>' +
    '<label>False +</label><input type="range" min="1" max="30" value="7" id="bf"><span id="bfv" class="btn" style="min-width:36px;text-align:center">7%</span>'
  document.getElementById('bp').oninput = e => { prev = +e.target.value; document.getElementById('bpv').textContent = prev + '%'; draw() }
  document.getElementById('bs').oninput = e => { sens = +e.target.value; document.getElementById('bsv').textContent = sens + '%'; draw() }
  document.getElementById('bf').oninput = e => { fpr = +e.target.value; document.getElementById('bfv').textContent = fpr + '%'; draw() }
  draw()
  cleanup = () => { try { el.innerHTML = '' } catch (e) { } }
  return cleanup
}

export function unmountBayes() { if (cleanup) cleanup() }

export default { mountBayes, unmountBayes }
