import { useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { sectionContent } from '../data/sectionContent'
import DemoChat from '../components/DemoChat.jsx'

const demoModules = import.meta.glob('/src/demos/**/*.js')
const TOTAL_SECTIONS = Object.keys(sectionContent).length
const ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' }

function renderDemoLoadError(containerId) {
  const host = document.getElementById(containerId)
  if (!host) return
  host.innerHTML = ''
  const msg = document.createElement('div')
  msg.className = 'btn'
  msg.style.margin = '12px'
  msg.style.display = 'inline-block'
  msg.textContent = 'Demo failed to load. Please refresh this page.'
  host.appendChild(msg)
}

function recoverFromChunkLoadError(err) {
  const message = String(err?.message || err || '')
  const isChunkLoadError = /Failed to fetch dynamically imported module|Importing a module script failed|ChunkLoadError|dynamically imported module/i.test(message)
  if (!isChunkLoadError) return false

  try {
    const key = 'howaiworks2-chunk-reload-once'
    if (window.sessionStorage.getItem(key)) return false
    window.sessionStorage.setItem(key, '1')
    const next = new URL(window.location.href)
    next.searchParams.set('_r', String(Date.now()))
    window.location.replace(next.toString())
    return true
  } catch {
    return false
  }
}

// Retry until the target element is in the DOM, then scroll to it.
// The 600ms delay lets demo canvases finish mounting before we measure layout.
function scrollToHash(hash, attempts = 0) {
  if (!hash) return
  if (!document.getElementById(hash)) {
    if (attempts < 15) setTimeout(() => scrollToHash(hash, attempts + 1), 80)
    return
  }
  setTimeout(() => {
    document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 600)
}

// Intercept clicks on raw <a href="/section/..."> links rendered via
// dangerouslySetInnerHTML and route them through React Router.
function useInternalLinkHandler(containerRef) {
  const navigate = useNavigate()
  const handler = useCallback((e) => {
    const anchor = e.target.closest('a[href]')
    const href = anchor?.getAttribute('href')
    if (href?.startsWith('/section/')) {
      e.preventDefault()
      navigate(href)
    }
  }, [navigate])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('click', handler)
    return () => el.removeEventListener('click', handler)
  }, [containerRef, handler])
}

export default function SectionPage() {
  const { idx } = useParams()
  const sectionId = Number(idx || 1)
  const section = sectionContent[sectionId]
  const mainRef = useRef(null)
  const location = useLocation()

  useInternalLinkHandler(mainRef)

  // Scroll to anchor when the URL hash changes or a new section is loaded
  useEffect(() => {
    const hash = location.hash?.slice(1)
    if (hash) {
      scrollToHash(hash)
      return
    }

    // For normal section visits (no anchor), always start at the page top.
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [sectionId, location.hash])

  // Mount / unmount interactive demo canvases for the current section
  useEffect(() => {
    if (!section) return
    const unmounts = []
    const rafIds = []
    let disposed = false

    const mountWhenReady = (model, mountName, mountFn, attempt = 0) => {
      if (disposed) return
      const host = document.getElementById(model.id)
      if (host?.isConnected && host.clientWidth > 0) {
        const u = mountName === 'mountGeneric'
          ? mountFn(model.id, model.name, model.text)
          : mountFn(model.id)
        if (typeof u === 'function') unmounts.push(u)
      } else if (attempt < 10) {
        const rafId = window.requestAnimationFrame(() => mountWhenReady(model, mountName, mountFn, attempt + 1))
        rafIds.push(rafId)
      }
    }

    section.models.forEach(model => {
      const modulePath = model.module || '/src/demos/genericDemo.js'
      const mountName = model.mount || 'mountGeneric'
      const load = demoModules[modulePath] ?? demoModules['/src/demos/genericDemo.js']
      if (!load) return
      load()
        .then(mod => {
          if (disposed) return
          const mountFn =
            (typeof mod[mountName] === 'function' && mod[mountName]) ||
            (typeof mod.default?.[mountName] === 'function' && mod.default[mountName])
          if (mountFn) mountWhenReady(model, mountName, mountFn)
        })
        .catch(err => {
          console.error('[demo load error]', err)
          if (!recoverFromChunkLoadError(err)) {
            renderDemoLoadError(model.id)
          }
        })
    })

    return () => {
      disposed = true
      rafIds.forEach(id => window.cancelAnimationFrame(id))
      unmounts.reverse().forEach(fn => { try { fn() } catch { /* cleanup */ } })
    }
  }, [section, sectionId])

  if (!section) {
    return (
      <div className="section-page" style={{ padding: '84px 16px 32px' }}>
        <h2>未找到 section</h2>
        <p>请返回 <Link to="/">首页</Link>。</p>
      </div>
    )
  }

  return (
    <>
      <div className="progress-bar" style={{ width: '100%', background: section.progress || `linear-gradient(90deg, ${section.color}, var(--a6))` }} />
      <button className="back-top show" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      <nav className="topnav">
        <Link to="/" className="logo">How AI Works</Link>
        <div className="nav-links">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <Link key={n} to={`/section/${n}`} className={sectionId === n ? 'active' : ''}>{ROMAN[n]}</Link>
          ))}
        </div>
      </nav>

      <section className="section-hero">
        <div className="era-label" style={{ color: section.color }}>{section.era}</div>
        <h1>{section.title}</h1>
        <p>{section.desc}</p>
        <div className="nav-arrows">
          {sectionId === 1
            ? <Link to="/">← Home</Link>
            : <Link to={`/section/${sectionId - 1}`}>← Section {ROMAN[sectionId - 1]}</Link>}
          {sectionId < TOTAL_SECTIONS
            ? <Link to={`/section/${sectionId + 1}`}>Section {ROMAN[sectionId + 1]} →</Link>
            : <Link to="/">Home →</Link>}
        </div>
      </section>

      <main className="models-container" ref={mainRef}>
        {section.models.map(model => (
          <div key={model.id} className="model-card" id={model.anchorId || `model-${model.id.replace('demo-', '')}`}>
            <div className="mc-head">
              <span className="mc-year" style={{ color: section.color }}>{model.year}</span>
              <div className="mc-info">
                <h3>
                  {model.name}{' '}
                  <a href={model.paper} target="_blank" rel="noreferrer" className="paper-link">Paper</a>
                </h3>
                <p dangerouslySetInnerHTML={{ __html: model.text }} />
                {model.lineage && <div className="model-lineage" dangerouslySetInnerHTML={{ __html: model.lineage }} />}
              </div>
            </div>
            {model.formula && <div className="mc-formula" style={{ color: section.color }} dangerouslySetInnerHTML={{ __html: model.formula }} />}
            <div className="mc-demo" id={model.id} />
            <DemoChat model={model} />
          </div>
        ))}
      </main>

      <footer>
        {sectionId === 1
          ? <Link to="/">← Home</Link>
          : <Link to={`/section/${sectionId - 1}`}>← Section {ROMAN[sectionId - 1]}</Link>}
        {sectionId < TOTAL_SECTIONS
          ? <><span> · </span><Link to={`/section/${sectionId + 1}`}>Section {ROMAN[sectionId + 1]} →</Link></>
          : <><span> · </span><span style={{ color: 'var(--a8)' }}>Home · All 50 Models Complete! 🎉</span></>}
      </footer>
    </>
  )
}

