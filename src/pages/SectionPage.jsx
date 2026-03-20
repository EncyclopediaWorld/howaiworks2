import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { sectionContent } from '../data/sectionContent'

export default function SectionPage() {
  const { idx } = useParams()
  const sectionId = Number(idx || 1)
  const section = sectionContent[sectionId]

  useEffect(() => {
    if (!section) return
    let unmounts = []

    section.models.forEach(model => {
      if (model.module && model.mount) {
        import(model.module)
          .then(mod => {
            if (mod && typeof mod[model.mount] === 'function') {
              const u = mod[model.mount](model.id)
              if (typeof u === 'function') unmounts.push(u)
            }
          })
          .catch(() => {})
      } else {
        import('/src/demos/genericDemo.js')
          .then(mod => {
            if (mod && typeof mod.mountGeneric === 'function') {
              const u = mod.mountGeneric(model.id, model.name, model.text)
              if (typeof u === 'function') unmounts.push(u)
            }
          })
          .catch(() => {})
      }
    })

    return () => {
      unmounts.reverse().forEach(fn => { try { fn() } catch (e) {} })
    }
  }, [section])

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
      <nav className="topnav">
        <div className="logo">How AI Works</div>
        <div className="nav-links">
          <Link to="/">首页</Link>
          <Link to={`/section/${sectionId}`} className="active">Section {sectionId}</Link>
        </div>
      </nav>

      <section className="section-hero">
        <div className="era-label">{section.era}</div>
        <h1>{section.title}</h1>
        <p>{section.desc}</p>
        <div className="nav-arrows">
          {sectionId > 1 && <Link to={`/section/${sectionId - 1}`}>← 上一节</Link>}
          <Link to="/">🏠 首页</Link>
          {sectionId < Object.keys(sectionContent).length && <Link to={`/section/${sectionId + 1}`}>下一节 →</Link>}
        </div>
      </section>

      <main className="models-container">
        {section.models.map(model => (
          <div key={model.id} className="model-card">
            <div className="mc-head">
              <div className="mc-info">
                <h3>{model.name}</h3>
                <span>{model.year}</span>
                <p>{model.text}</p>
                <p className="model-formula">公式: {model.formula}</p>
                <p className="model-lineage">传承: {model.lineage}</p>
                <p className="model-paper">论文: <a href={model.paper} target="_blank" rel="noreferrer">查看</a></p>
              </div>
              <span className="mc-year">Section {section.id}</span>
            </div>
            <div className="mc-demo" id={model.id}></div>
          </div>
        ))}
      </main>

      <footer>
        <p>© 2026 How AI Works • 使用 React + Vite 与原始样式保持一致</p>
      </footer>
    </>
  )
}

