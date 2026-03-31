import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { sectionContent } from '../data/sectionContent'
import { initParticles } from '../lib/shared'

export default function Home() {
  const sections = Object.values(sectionContent)

  // Calculate statistics dynamically
  const totalModels = sections.reduce((sum, section) => sum + section.models.length, 0)
  const allYears = sections.flatMap(section => section.models.map(m => parseInt(m.year)))
  const minYear = Math.min(...allYears)
  const maxYear = Math.max(...allYears)
  const yearSpan = maxYear - minYear
  const totalEras = sections.length

  useEffect(() => {
    initParticles('particles')
  }, [])

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
          <p className="sub">A hands-on journey through {totalModels} landmark models that shaped artificial intelligence — from Gauss to GPT. Every model has an interactive demo you can touch. See <a href="https://github.com/EncyclopediaWorld/howaiworks" target="_blank" rel="noopener noreferrer" style={{ color:'var(--a2)', borderBottom:'1px dashed var(--a2)' }}>GitHub Repository</a>.</p>
          <div className="author-line"><a href="https://yushundong.github.io" target="_blank" rel="noopener noreferrer">Dr. Yushun Dong · Florida State University</a></div>
          <div className="stat-row">
            <div className="stat"><div className="num">{totalModels}</div><div className="lbl">Models</div></div>
            <div className="stat"><div className="num">{yearSpan}</div><div className="lbl">Years</div></div>
            <div className="stat"><div className="num">{totalEras}</div><div className="lbl">Eras</div></div>
          </div>
          <div className="scroll-cue" style={{ marginTop:'2.5rem' }}>↓ scroll to explore</div>
        </div>
      </section>

      <nav className="toc">
        <h2>Choose an Era</h2>
        <div className="toc-grid">
          {sections.map(section => (
            <Link key={section.id} to={`/section/${section.id}`} className={`toc-card c${section.id}`} style={{ textDecoration:'none', color:'inherit' }}>
              <div className="era-num">{section.era}</div>
              <h3>{section.title}</h3>
              <div className="era-desc">{sectionTitleDesc(section.id)}</div>
              <div className="model-tags">
                {sectionTagList(section.id).map(tag => <span key={tag}>{tag}</span>)}
              </div>
              <div className="count">{sectionCount(section.id)} models · {sectionCount(section.id)} interactive demos</div>
              <div className="enter-arrow" style={{ color:`var(--a${section.id})` }}>Enter →</div>
            </Link>
          ))}
        </div>
      </nav>

      <footer>
        Built with care to explain AI · Every demo is interactive — click, drag, and play!
        <br />
        <span style={{ fontSize: '.55rem', color: '#4a475a', marginTop: '.4rem', display: 'inline-block' }}>
          Code licensed under <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer" style={{ color: '#4a475a', borderBottom: '1px dashed #4a475a' }}>Apache 2.0</a> · Written content under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer" style={{ color: '#4a475a', borderBottom: '1px dashed #4a475a' }}>CC BY 4.0</a> · See LICENSE, CONTENT_LICENSE, and BRAND_GUIDELINES for full details.
        </span>
      </footer>
    </>
  )
}

function sectionTitleDesc(id){
  const d = {
    1: 'From least squares to the perceptron — mathematics lays the foundation for machine intelligence',
    2: 'Simple but powerful methods quietly accumulate during the AI winter',
    3: 'Backpropagation spreads widely; neural nets and decision trees advance side by side',
    4: 'SVM, LSTM, Random Forest — classic methods flourish',
    5: 'Layer-wise pretraining and word embeddings — the calm before the storm',
    6: 'AlexNet ignites a revolution; GANs arrive on the scene',
    7: '"Attention Is All You Need" changes everything',
    8: 'Emergent abilities, RLHF — AI enters everyday life'
  }
  return d[id] || ''
}

function sectionTagList(id){
  const d = {
    1: ['Linear Regression', 'Bayes', 'Markov', 'Perceptron', 'Adaline'],
    2: ['k-NN', 'Naive Bayes', 'Chain Rule'],
    3: ['Neocognitron', 'RNN', 'Boltzmann', 'Backpropagation', 'Decision Tree'],
    4: ['CNN', 'LSTM', 'SVM', 'GMM', 'Random Forest', 'AdaBoost'],
    5: ['DBN', 'Sparse AE', 'Denoising AE', 'GBDT', 'NNLM'],
    6: ['AlexNet', 'Dropout', 'Word2Vec', 'VAE', 'GAN', 'Seq2Seq', 'ResNet', 'BatchNorm'],
    7: ['XGBoost', 'WaveNet', 'Transformer ⭐', 'ELMo', 'GPT-1', 'BERT', 'StyleGAN', 'GPT-2', 'T5'],
    8: ['GPT-3', 'ViT', 'CLIP', 'Diffusion', 'ChatGPT', 'LLaMA', 'GPT-4', 'Claude', 'Sora']
  }
  return d[id] || []
}

function sectionCount(id){
  return sectionContent[id]?.models?.length || 0
}
