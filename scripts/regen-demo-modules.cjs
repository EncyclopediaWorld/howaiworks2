const fs = require('fs');
const path = require('path');

const root = process.cwd();
const configs = [
  { section: 6, html: 'content/sections/section6.html', out: 'src/demos/section6Demos.js', mounts: ['mountAlex','mountDrop','mountW2v','mountVae','mountGan','mountAttn','mountResnet','mountBn'] },
  { section: 7, html: 'content/sections/section7.html', out: 'src/demos/section7Demos.js', mounts: ['mountXgb','mountWave','mountTransformer','mountElmo','mountGpt1','mountBert','mountStyle','mountGpt2','mountT5'] },
  { section: 8, html: 'content/sections/section8.html', out: 'src/demos/section8Demos.js', mounts: ['mountGpt3','mountVit','mountClip','mountDiff','mountRlhf','mountLlama','mountGpt4','mountClaude','mountSora'] }
];

const sharedCandidates = ['$', 'lerp', 'createCanvas', 'addHint', 'addControls', 'rand', 'randInt', 'clamp', 'sigmoid', 'TAU', 'dist'];

function getBlocks(htmlText) {
  const headers = [];
  const re = /\/\/\s*=====\s*(.+?)\s*=====/g;
  let m;
  while ((m = re.exec(htmlText)) !== null) {
    const name = m[1].trim();
    if (/HiDPI|Retina|Patch/i.test(name)) continue;
    headers.push({ name, index: m.index });
  }

  const out = [];
  for (let i = 0; i < headers.length; i++) {
    const start = headers[i].index;
    const end = i + 1 < headers.length ? headers[i + 1].index : htmlText.length;
    const chunk = htmlText.slice(start, end);
    const iifeStart = chunk.indexOf('(function(){');
    const iifeEnd = chunk.lastIndexOf('})();');
    if (iifeStart < 0 || iifeEnd < 0 || iifeEnd <= iifeStart) continue;
    const body = chunk.slice(iifeStart + '(function(){'.length, iifeEnd).trim();
    out.push({ name: headers[i].name, body });
  }
  return out;
}

function normalizeBody(body) {
  // Rewrite the original first line: const el=$('id'),[c,ctx]=createCanvas(el,w,h);
  body = body.replace(
    /const\s+el\s*=\s*\$\('[^']+'\)\s*,\s*\[\s*c\s*,\s*ctx\s*\]\s*=\s*createCanvas\(\s*el\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*;/,
    "const el = $(__id);\nif (!el) return () => {};\nel.innerHTML = '';\nconst [c, ctx] = createCanvas(el, $1, $2);"
  );

  // If pattern above missed, fallback to replacing just id lookup.
  body = body.replace(/\$\('[^']+'\)/, '$(__id)');

  return body;
}

for (const cfg of configs) {
  const html = fs.readFileSync(path.join(root, cfg.html), 'utf8');
  const blocks = getBlocks(html);
  if (blocks.length !== cfg.mounts.length) {
    throw new Error(`section${cfg.section}: expected ${cfg.mounts.length} blocks, got ${blocks.length}`);
  }

  const used = new Set();
  const fnBlocks = [];

  blocks.forEach((b, i) => {
    const mount = cfg.mounts[i];
    const idMatch = b.body.match(/\$\('([^']+)'\)/);
    const defaultId = idMatch ? idMatch[1] : `demo-${cfg.section}-${i + 1}`;

    let body = normalizeBody(b.body);

    for (const s of sharedCandidates) {
      const p = s === '$' ? /\$(?=\()/ : new RegExp(`\\b${s.replace(/[$]/g, '\\$&')}\\b`);
      if (p.test(body)) used.add(s);
    }

    fnBlocks.push(`// ===== ${b.name} =====\nexport function ${mount}(containerId = '${defaultId}') {\n  const __id = containerId || '${defaultId}';\n${body}\n  return () => {\n    try {\n      if (typeof c !== 'undefined' && c) {\n        c.onclick = null;\n        c.oncontextmenu = null;\n      }\n      if (typeof tmr !== 'undefined' && tmr) clearInterval(tmr);\n      if (typeof animId !== 'undefined' && animId) cancelAnimationFrame(animId);\n      if (typeof el !== 'undefined' && el) el.innerHTML = '';\n    } catch (e) {}\n  };\n}\n`);
  });

  const imports = sharedCandidates.filter(s => used.has(s));
  const content = `import { ${imports.join(', ')} } from '../lib/shared.js'\n\n${fnBlocks.join('\n')}`;
  fs.writeFileSync(path.join(root, cfg.out), content, 'utf8');
  console.log(`regenerated section${cfg.section}: ${cfg.out}`);
}
