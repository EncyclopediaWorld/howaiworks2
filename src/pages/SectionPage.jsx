import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { sectionContent } from '../data/sectionContent'

const demoModules = import.meta.glob('/src/demos/**/*.js')

export default function SectionPage() {
  const { idx } = useParams()
  const sectionId = Number(idx || 1)
  const section = sectionContent[sectionId]

  useEffect(() => {
    if (!section) return

    let unmounts = []

    section.models.forEach(model => {
      const modulePath = model.module || '/src/demos/genericDemo.js'
      const mountName = model.mount || 'mountGeneric'
      const load = demoModules[modulePath] || demoModules['/src/demos/genericDemo.js']
      if (!load) return

      load()
        .then(mod => {
          const mountFn =
            (mod && typeof mod[mountName] === 'function' && mod[mountName]) ||
            (mod && mod.default && typeof mod.default[mountName] === 'function' && mod.default[mountName])

          if (typeof mountFn === 'function') {
            const u = mountName === 'mountGeneric'
              ? mountFn(model.id, model.name, model.text)
              : mountFn(model.id)
            if (typeof u === 'function') unmounts.push(u)
          }
        })
        .catch(err => { console.error('[demo load error]', err) })
    })

    return () => {
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
      <div className="progress-bar" style={{ width: '100%', background: section.progress || `linear-gradient(90deg, ${section.color}, var(--a6))` }}></div>
      <button className="back-top show" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>↑</button>

      <nav className="topnav">
        <Link to="/" className="logo">How AI Works</Link>
        <div className="nav-links">
          <Link to="/section/1" className={sectionId === 1 ? 'active' : ''}>I</Link>
          <Link to="/section/2" className={sectionId === 2 ? 'active' : ''}>II</Link>
          <Link to="/section/3" className={sectionId === 3 ? 'active' : ''}>III</Link>
          <Link to="/section/4" className={sectionId === 4 ? 'active' : ''}>IV</Link>
          <Link to="/section/5" className={sectionId === 5 ? 'active' : ''}>V</Link>
          <Link to="/section/6" className={sectionId === 6 ? 'active' : ''}>VI</Link>
          <Link to="/section/7" className={sectionId === 7 ? 'active' : ''}>VII</Link>
          <Link to="/section/8" className={sectionId === 8 ? 'active' : ''}>VIII</Link>
        </div>
      </nav>

      <section className="section-hero">
        <div className="era-label" style={{ color: section.color }}>{section.era}</div>
        <h1>{section.title}</h1>
        <p>{section.desc}</p>
        <div className="nav-arrows">
          {sectionId > 1 && <Link to={`/section/${sectionId - 1}`}>← Section {roman(sectionId - 1)}</Link>}
          {sectionId === 1 && <Link to="/">← Home</Link>}
          {sectionId < Object.keys(sectionContent).length && <Link to={`/section/${sectionId + 1}`}>Section {roman(sectionId + 1)} →</Link>}
          {sectionId === Object.keys(sectionContent).length && <Link to="/">Home →</Link>}
        </div>
      </section>

      <main className="models-container">
        {section.models.map(model => (
          <div key={model.id} className="model-card" id={model.anchorId || `model-${model.id.replace('demo-', '')}`}>
            <div className="mc-head">
              <span className="mc-year" style={{ color: section.color }}>{model.year}</span>
              <div className="mc-info">
                <h3>
                  {model.name}{' '}
                  <a href={model.paper} target="_blank" rel="noreferrer" className="paper-link">Paper</a>
                </h3>
                <p dangerouslySetInnerHTML={{ __html: model.text }}></p>
                {model.lineage && <div className="model-lineage" dangerouslySetInnerHTML={{ __html: model.lineage }}></div>}
              </div>
            </div>
            {model.formula && <div className="mc-formula" style={{ color: section.color }} dangerouslySetInnerHTML={{ __html: model.formula }}></div>}
            <div className="mc-demo" id={model.id}></div>
          </div>
        ))}
      </main>

      <footer>
        {sectionId === 1 && <Link to="/">← Home</Link>}
        {sectionId > 1 && <Link to={`/section/${sectionId - 1}`}>← Section {roman(sectionId - 1)}</Link>}
        {sectionId < Object.keys(sectionContent).length && <><span> · </span><Link to={`/section/${sectionId + 1}`}>Section {roman(sectionId + 1)} →</Link></>}
        {sectionId === Object.keys(sectionContent).length && <><span> · </span><span style={{ color: 'var(--a8)' }}>Home · All 50 Models Complete! 🎉</span></>}
      </footer>
    </>
  )
}

function roman(num) {
  const map = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII' }
  return map[num] || String(num)
}

