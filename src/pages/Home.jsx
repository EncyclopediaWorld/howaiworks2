import React from 'react'
import { Link } from 'react-router-dom'
import { sectionContent } from '../data/sectionContent'

export default function Home() {
  const sections = Object.values(sectionContent)

  return (
    <>
      <section className="hero">
        <canvas id="particles"></canvas>
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'.6rem', marginBottom:'1.2rem' }}>
            <div className="ew-logo" style={{ marginBottom:0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="42" height="42" fill="none">
                <circle cx="24" cy="24" r="22.5" stroke="#6b6b7a" strokeWidth="1" opacity=".35" />
                <circle cx="24" cy="24" r="19" stroke="#8a8a9a" strokeWidth=".6" opacity=".2" />
                <path d="M12 14 h8 M12 14 v20 M12 24 h6 M12 34 h8" stroke="#9a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M25 14 l3 20 4-13 4 13 3-20" stroke="#b0b0be" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="24" cy="6" r="1.2" fill="#8a8a9a" opacity=".4" />
              </svg>
              <span className="ew-text">Encyclopedia World</span>
            </div>
            <div className="badge" style={{ marginBottom:0 }}><span></span>Interactive · 1805 → 2025</div>
          </div>
          <h1>How AI Works</h1>
          <p className="sub">A hands-on journey through 50 landmark models that shaped artificial intelligence — from Gauss to GPT. Every model has an interactive demo you can touch. See <a href="https://github.com/EncyclopediaWorld/howaiworks" target="_blank" rel="noopener" style={{ color:'var(--a2)', borderBottom:'1px dashed var(--a2)' }}>GitHub Repository</a>.</p>
          <div className="author-line"><a href="https://yushundong.github.io" target="_blank" rel="noopener">Dr. Yushun Dong · Florida State University</a></div>
          <div className="stat-row">
            <div className="stat"><div className="num">50</div><div className="lbl">Models</div></div>
            <div className="stat"><div className="num">220</div><div className="lbl">Years</div></div>
            <div className="stat"><div className="num">8</div><div className="lbl">Eras</div></div>
          </div>
          <div className="scroll-cue" style={{ marginTop:'2.5rem' }}>↓ scroll to explore</div>
        </div>
      </section>

      <nav className="toc">
        <h2>Choose an Era</h2>
        <div className="toc-grid">
          {sections.map(section => (
            <Link key={section.id} to={`/section/${section.id}`} className={`toc-card c${section.id}`} style={{ textDecoration:'none', color:'inherit' }}>
              <div className="era-num">Section {section.id} · {section.title}</div>
              <h3>{section.title}</h3>
              <div className="era-desc">{sectionTitleDesc(section.id)}</div>
              <div className="model-tags">
                {section.demos.map(demo => <span key={demo.id}>{demo.label}</span>)}
              </div>
              <div className="count">{section.demos.length} models · {section.demos.length} interactive demos</div>
              <div className="enter-arrow" style={{ color:`var(--a${section.id})` }}>Enter →</div>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}

function sectionTitleDesc(id){
  const d = {
    1: 'From least squares to the perceptron — mathematics lays the foundation for machine intelligence',
    2: 'Simple but powerful methods quietly accumulate during the AI winter',
    3: 'Backpropagation spreads widely; neural nets and decision trees advance side by side',
    4: 'Deep learning begins with convolution and ensemble methods',
    5: 'Autoencoders, boosting, and generative modeling',
    6: 'Modern deep networks and regularization techniques',
    7: 'Transformer revolution and language models',
    8: 'Foundation models, diffusion and agent frameworks'
  }
  return d[id] || ''
}
