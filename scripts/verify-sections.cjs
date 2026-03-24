const fs = require('fs');
const path = require('path');

const root = process.cwd();
const raw = fs.readFileSync(path.join(root, 'src/data/sectionContent.js'), 'utf8');
const expr = raw
  .replace('export const sectionContent =', '')
  .trim()
  .replace(/;\s*$/, '');
const sectionContent = eval(`(${expr})`);

let ok = true;
for (let i = 1; i <= 8; i++) {
  const html = fs.readFileSync(path.join(root, `section${i}.html`), 'utf8');
  const ids = [...html.matchAll(/class="mc-demo" id="([^"]+)"/g)].map((m) => m[1]);
  const models = sectionContent[i]?.models ?? [];
  const dataIds = models.map((m) => m.id);

  const missingInData = ids.filter((id) => !dataIds.includes(id));
  const extraInData = dataIds.filter((id) => !ids.includes(id));

  if (missingInData.length || extraInData.length) {
    ok = false;
    console.log(`section${i} mismatch`);
    console.log('  missingInData:', missingInData);
    console.log('  extraInData  :', extraInData);
  } else {
    console.log(`section${i} OK (${ids.length} demos)`);
  }
}

if (!ok) process.exit(2);
console.log('ALL SECTIONS OK');
