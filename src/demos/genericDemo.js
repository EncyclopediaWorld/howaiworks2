import { createCanvas, addHint, addControls } from '../lib/shared.js'

export function mountGeneric(containerId = 'demo-generic', title = 'Generic Demo', description = 'This is a generic demo placeholder.') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}
  el.innerHTML = ''
  const [c, ctx] = createCanvas(el, 750, 300)
  addHint(el, description)
  const ctrl = addControls(el)
  const state = { value: 0 }

  function draw() {
    ctx.clearRect(0, 0, 750, 300)
    ctx.fillStyle = '#111'
    ctx.fillRect(0, 0, 750, 300)

    ctx.fillStyle = '#ffd166'
    ctx.font = '700 18px Fira Code'
    ctx.fillText(title, 20, 40)

    ctx.fillStyle = '#e4e2df'
    ctx.font = '500 14px Fira Code'
    ctx.fillText('Value: ' + state.value.toFixed(2), 20, 80)

    ctx.fillStyle = '#38bdf8'
    ctx.beginPath()
    ctx.arc(375, 170, 80, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#072a46'
    ctx.beginPath()
    ctx.arc(375, 170, 80 * (state.value * 0.9 + 0.1), 0, Math.PI * 2)
    ctx.fill()
  }

  const slider = document.createElement('input')
  slider.type = 'range'
  slider.min = 0
  slider.max = 1
  slider.step = 0.01
  slider.value = state.value
  slider.oninput = (e) => {
    state.value = Number(e.target.value)
    draw()
  }

  const label = document.createElement('span')
  label.className = 'btn'
  label.style.minWidth = '40px'
  label.style.textAlign = 'center'
  label.textContent = state.value.toFixed(2)

  slider.addEventListener('input', () => {
    label.textContent = state.value.toFixed(2)
  })

  ctrl.appendChild(slider)
  ctrl.appendChild(label)

  draw()

  const cleanup = () => { try { el.innerHTML = '' } catch (e) {} }
  return cleanup
}

