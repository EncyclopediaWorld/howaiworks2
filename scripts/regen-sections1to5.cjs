const fs = require('fs');
const path = require('path');

const root = process.cwd();

const plans = [
  {
    section: 1,
    html: 'content/sections/section1.html',
    outputs: [
      { file: 'src/demos/linearRegression.js', mount: 'mountLinearRegression' },
      { file: 'src/demos/bayes.js', mount: 'mountBayes' },
      { file: 'src/demos/markov.js', mount: 'mountMarkov' },
      { file: 'src/demos/perceptron.js', mount: 'mountPerceptron' },
      { file: 'src/demos/adaline.js', mount: 'mountAdaline' }
    ]
  },
  {
    section: 2,
    html: 'content/sections/section2.html',
    outputs: [
      { file: 'src/demos/knn.js', mount: 'mountKnn' },
      { file: 'src/demos/naiveBayes.js', mount: 'mountNaiveBayes' },
      { file: 'src/demos/chainRule.js', mount: 'mountChainRule' }
    ]
  },
  {
    section: 3,
    html: 'content/sections/section3.html',
    outputs: [
      { file: 'src/demos/neocognitron.js', mount: 'mountNeocognitron' },
      { file: 'src/demos/rnn.js', mount: 'mountRnn' },
      { file: 'src/demos/boltzmann.js', mount: 'mountBoltzmann' },
      { file: 'src/demos/backpropagation.js', mount: 'mountBackpropagation' },
      { file: 'src/demos/decisionTree.js', mount: 'mountDecisionTree' }
    ]
  },
  {
    section: 4,
    html: 'content/sections/section4.html',
    outputs: [
      { file: 'src/demos/section4Demos.js', mount: 'mountCnn', group: true },
      { file: 'src/demos/section4Demos.js', mount: 'mountLstm', group: true },
      { file: 'src/demos/section4Demos.js', mount: 'mountSvm', group: true },
      { file: 'src/demos/section4Demos.js', mount: 'mountGmm', group: true },
      { file: 'src/demos/section4Demos.js', mount: 'mountRf', group: true },
      { file: 'src/demos/section4Demos.js', mount: 'mountAda', group: true }
    ]
  },
  {
    section: 5,
    html: 'content/sections/section5.html',
    outputs: [
      { file: 'src/demos/section5Demos.js', mount: 'mountDbn', group: true },
      { file: 'src/demos/section5Demos.js', mount: 'mountSae', group: true },
      { file: 'src/demos/section5Demos.js', mount: 'mountDae', group: true },
      { file: 'src/demos/section5Demos.js', mount: 'mountGbdt', group: true },
      { file: 'src/demos/section5Demos.js', mount: 'mountNnlm', group: true }
    ]
  }
];

const sharedCandidates = ['$', 'lerp', 'createCanvas', 'addHint', 'addControls', 'rand', 'randInt', 'clamp', 'sigmoid', 'TAU', 'dist'];

function getBlocks(htmlText) {
  const starts = [];
  const startRe = /\(function\(\)\{\s*const\s+el\s*=\s*\$\('([^']+)'\)/g;
  let m;
  while ((m = startRe.exec(htmlText)) !== null) {
    starts.push({ id: m[1], index: m.index });
  }

  const out = [];
  for (let i = 0; i < starts.length; i++) {
    const start = starts[i].index;
    const end = i + 1 < starts.length ? starts[i + 1].index : htmlText.length;
    const chunk = htmlText.slice(start, end);
    const iifeStart = chunk.indexOf('(function(){');
    const iifeEnd = chunk.lastIndexOf('})();');
    if (iifeStart < 0 || iifeEnd < 0 || iifeEnd <= iifeStart) continue;
    const body = chunk.slice(iifeStart + '(function(){'.length, iifeEnd).trim();
    out.push({ name: starts[i].id, body });
  }
  return out;
}

function normalizeBody(body) {
  body = body.replace(
    /const\s+el\s*=\s*\$\('\s*([^']+)\s*'\)\s*,\s*\[\s*c\s*,\s*ctx\s*\]\s*=\s*createCanvas\(\s*el\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*;/,
    "const el = $(__id);\nif (!el) return () => {};\nel.innerHTML = '';\nconst [c, ctx] = createCanvas(el, $2, $3);"
  );
  body = body.replace(/\$\('\s*[^']+\s*'\)/, '$(__id)');
  return body;
}

const grouped = new Map();

for (const plan of plans) {
  const html = fs.readFileSync(path.join(root, plan.html), 'utf8');
  const blocks = getBlocks(html);
  if (blocks.length !== plan.outputs.length) {
    throw new Error(`section${plan.section}: expected ${plan.outputs.length} blocks, got ${blocks.length}`);
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const target = plan.outputs[i];
    const idMatch = b.body.match(/\$\('([^']+)'\)/);
    const defaultId = idMatch ? idMatch[1] : `demo-${plan.section}-${i + 1}`;
    const body = normalizeBody(b.body);

    const fn = `// ===== ${b.name} =====\nexport function ${target.mount}(containerId = '${defaultId}') {\n  const __id = containerId || '${defaultId}';\n${body}\n  return () => {\n    try {\n      if (typeof c !== 'undefined' && c) {\n        c.onclick = null;\n        c.oncontextmenu = null;\n      }\n      if (typeof tmr !== 'undefined' && tmr) clearInterval(tmr);\n      if (typeof animId !== 'undefined' && animId) cancelAnimationFrame(animId);\n      if (typeof el !== 'undefined' && el) el.innerHTML = '';\n    } catch (e) {}\n  };\n}\n`;

    if (target.group) {
      const k = target.file;
      if (!grouped.has(k)) grouped.set(k, []);
      grouped.get(k).push(body);
      grouped.get(k).push(`@@FN@@${fn}`);
    } else {
      const used = sharedCandidates.filter(s => {
        const p = s === '$' ? /\$(?=\()/ : new RegExp(`\\b${s.replace(/[$]/g, '\\$&')}\\b`);
        return p.test(body);
      });
      const content = `import { ${used.join(', ')} } from '../lib/shared.js'\n\n${fn}`;
      fs.writeFileSync(path.join(root, target.file), content, 'utf8');
      console.log(`wrote ${target.file}`);
    }
  }
}

for (const [file, arr] of grouped.entries()) {
  const fns = arr.filter(v => v.startsWith('@@FN@@')).map(v => v.slice(6));
  const combinedBodies = fns.join('\n');
  const used = sharedCandidates.filter(s => {
    const p = s === '$' ? /\$(?=\()/ : new RegExp(`\\b${s.replace(/[$]/g, '\\$&')}\\b`);
    return p.test(combinedBodies);
  });
  const content = `import { ${used.join(', ')} } from '../lib/shared.js'\n\n${fns.join('\n')}`;
  fs.writeFileSync(path.join(root, file), content, 'utf8');
  console.log(`wrote ${file}`);
}
