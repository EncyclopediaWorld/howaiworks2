import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sectionsDir = path.join(root, 'content', 'sections')

const decode = (s = '') =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&larr;/g, '←')
    .replace(/&rarr;/g, '→')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeFormula = (s = '') =>
  s
    .replace(/ b minimize\b/g, ' b&nbsp;minimize')
    .replace(/ P\(B\) posterior\b/g, ' P(B)&nbsp;posterior')
    .replace(/\) memoryless property\b/g, ')&nbsp;memoryless property')
    .replace(/\) update:\s*/g, ')&nbsp;update: ')
    .replace(/ b Δw\s*=\s*/g, ' b&nbsp;Δw = ')
    .replace(/\|\|w\|\| subject to\b/g, '||w||&nbsp;subject to')
    .replace(/\) M:\s*/g, ')&nbsp;M: ')
    .replace(/\) where\b/g, ')&nbsp;where')

const fixLineageLinks = (s = '') =>
  s.replace(/section(\d+)\.html(#[^"']*)?/g, (_m, sid, hash = '') => `/section/${sid}${hash}`)

const mapDemo = {
  'demo-lr': { module: '/src/demos/linearRegression.js', mount: 'mountLinearRegression' },
  'demo-bayes': { module: '/src/demos/bayes.js', mount: 'mountBayes' },
  'demo-markov': { module: '/src/demos/markov.js', mount: 'mountMarkov' },
  'demo-perceptron': { module: '/src/demos/perceptron.js', mount: 'mountPerceptron' },
  'demo-adaline': { module: '/src/demos/adaline.js', mount: 'mountAdaline' },
  'demo-knn': { module: '/src/demos/knn.js', mount: 'mountKnn' },
  'demo-nb': { module: '/src/demos/naiveBayes.js', mount: 'mountNaiveBayes' },
  'demo-chain': { module: '/src/demos/chainRule.js', mount: 'mountChainRule' },
  'demo-neo': { module: '/src/demos/neocognitron.js', mount: 'mountNeocognitron' },
  'demo-rnn': { module: '/src/demos/rnn.js', mount: 'mountRnn' },
  'demo-boltz': { module: '/src/demos/boltzmann.js', mount: 'mountBoltzmann' },
  'demo-bp': { module: '/src/demos/backpropagation.js', mount: 'mountBackpropagation' },
  'demo-tree': { module: '/src/demos/decisionTree.js', mount: 'mountDecisionTree' },
  'demo-cnn': { module: '/src/demos/section4Demos.js', mount: 'mountCnn' },
  'demo-lstm': { module: '/src/demos/section4Demos.js', mount: 'mountLstm' },
  'demo-svm': { module: '/src/demos/section4Demos.js', mount: 'mountSvm' },
  'demo-gmm': { module: '/src/demos/section4Demos.js', mount: 'mountGmm' },
  'demo-rf': { module: '/src/demos/section4Demos.js', mount: 'mountRf' },
  'demo-ada': { module: '/src/demos/section4Demos.js', mount: 'mountAda' },
  'demo-dbn': { module: '/src/demos/section5Demos.js', mount: 'mountDbn' },
  'demo-sae': { module: '/src/demos/section5Demos.js', mount: 'mountSae' },
  'demo-dae': { module: '/src/demos/section5Demos.js', mount: 'mountDae' },
  'demo-gbdt': { module: '/src/demos/section5Demos.js', mount: 'mountGbdt' },
  'demo-nnlm': { module: '/src/demos/section5Demos.js', mount: 'mountNnlm' },
  'demo-alex': { module: '/src/demos/section6Demos.js', mount: 'mountAlex' },
  'demo-drop': { module: '/src/demos/section6Demos.js', mount: 'mountDrop' },
  'demo-w2v': { module: '/src/demos/section6Demos.js', mount: 'mountW2v' },
  'demo-vae': { module: '/src/demos/section6Demos.js', mount: 'mountVae' },
  'demo-gan': { module: '/src/demos/section6Demos.js', mount: 'mountGan' },
  'demo-attn': { module: '/src/demos/section6Demos.js', mount: 'mountAttn' },
  'demo-resnet': { module: '/src/demos/section6Demos.js', mount: 'mountResnet' },
  'demo-bn': { module: '/src/demos/section6Demos.js', mount: 'mountBn' },
  'demo-xgb': { module: '/src/demos/section7Demos.js', mount: 'mountXgb' },
  'demo-wave': { module: '/src/demos/section7Demos.js', mount: 'mountWave' },
  'demo-transformer': { module: '/src/demos/section7Demos.js', mount: 'mountTransformer' },
  'demo-elmo': { module: '/src/demos/section7Demos.js', mount: 'mountElmo' },
  'demo-gpt1': { module: '/src/demos/section7Demos.js', mount: 'mountGpt1' },
  'demo-bert': { module: '/src/demos/section7Demos.js', mount: 'mountBert' },
  'demo-style': { module: '/src/demos/section7Demos.js', mount: 'mountStyle' },
  'demo-gpt2': { module: '/src/demos/section7Demos.js', mount: 'mountGpt2' },
  'demo-t5': { module: '/src/demos/section7Demos.js', mount: 'mountT5' },
  'demo-gpt3': { module: '/src/demos/section8Demos.js', mount: 'mountGpt3' },
  'demo-vit': { module: '/src/demos/section8Demos.js', mount: 'mountVit' },
  'demo-clip': { module: '/src/demos/section8Demos.js', mount: 'mountClip' },
  'demo-diff': { module: '/src/demos/section8Demos.js', mount: 'mountDiff' },
  'demo-rlhf': { module: '/src/demos/section8Demos.js', mount: 'mountRlhf' },
  'demo-llama': { module: '/src/demos/section8Demos.js', mount: 'mountLlama' },
  'demo-gpt4': { module: '/src/demos/section8Demos.js', mount: 'mountGpt4' },
  'demo-claude': { module: '/src/demos/section8Demos.js', mount: 'mountClaude' },
  'demo-sora': { module: '/src/demos/section8Demos.js', mount: 'mountSora' }
}

const output = {}
for (let i = 1; i <= 8; i++) {
  const fp = path.join(sectionsDir, `section${i}.html`)
  const html = fs.readFileSync(fp, 'utf8')

  const era = decode((html.match(/era-label[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '')
  const color = decode((html.match(/era-label"\s+style="color:(var\(--a\d+\))"/) || [])[1] || '')
  const progress = decode((html.match(/progress-bar"\s+style="background:([^"]+)"/) || [])[1] || '')
  const hero = html.match(/<h1>([\s\S]*?)<\/h1><p>([\s\S]*?)<\/p>/)
  const title = decode(hero?.[1] || '')
  const desc = decode(hero?.[2] || '')

  const models = []
  const cardRe = /<div class="model-card" id="([^"]+)">([\s\S]*?)<div class="mc-demo" id="([^"]+)"><\/div><\/div>/g
  let m
  while ((m = cardRe.exec(html)) !== null) {
    const anchorId = m[1]
    const block = m[2]
    const id = m[3]

    const year = decode((block.match(/mc-year[^>]*>([\s\S]*?)<\/span>/) || [])[1] || '')
    const h3 = (block.match(/<h3>([\s\S]*?)<\/h3>/) || [])[1] || ''
    const paper = decode((h3.match(/<a href="([^"]+)"/) || [])[1] || '')
    const nameRaw = h3.replace(/<a[\s\S]*?<\/a>/, '')
    const name = decode(nameRaw.replace(/<[^>]+>/g, ''))
    const text = decode((block.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || '')
    const lineageRaw = (block.match(/<div class="model-lineage">([\s\S]*?)<\/div>/) || [])[1] || ''
    const lineage = decode(fixLineageLinks(lineageRaw))
    const formula = normalizeFormula(
      decode((block.match(/<div class="mc-formula"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '')
    )

    const mapped = mapDemo[id] || { module: '/src/demos/genericDemo.js', mount: 'mountGeneric' }
    models.push({ id, anchorId, year, name, paper, text, lineage, formula, ...mapped })
  }

  output[i] = {
    id: i,
    era,
    color,
    progress,
    title,
    desc,
    prev: i === 1 ? { label: 'Home', to: '/' } : { label: `Section ${i - 1}`, to: `/section/${i - 1}` },
    next: i === 8 ? null : { label: `Section ${i + 1}`, to: `/section/${i + 1}` },
    models
  }
}

const content = `export const sectionContent = ${JSON.stringify(output, null, 2)}\n`
fs.writeFileSync(path.join(root, 'src', 'data', 'sectionContent.js'), content)
console.log('Generated src/data/sectionContent.js with strict HTML-parsed content.')
