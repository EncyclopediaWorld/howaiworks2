import { attachToWindow } from '/src/lib/shared.js'

function extractScripts(htmlText){
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while((m = re.exec(htmlText)) !== null){
    const attrs = m[1];
    const srcMatch = attrs.match(/src=["']?([^"'\s>]+)["']?/i);
    out.push({ src: srcMatch ? srcMatch[1] : null, code: m[2] });
  }
  return out;
}

export async function loadScriptsFrom(path){
  attachToWindow()
  const res = await fetch(path)
  const text = await res.text()
  const scripts = extractScripts(text)

  for(const s of scripts){
    if(s.src){
      if(s.src.endsWith('shared.js')){
        // skip — our ESM shared is already attached
        continue
      }
      const se = document.createElement('script')
      se.src = s.src.startsWith('/') ? s.src : s.src
      document.body.appendChild(se)
      await new Promise(res=>se.addEventListener('load', res))
    }else if(s.code && s.code.trim()){
      const wrapped = `import('/src/lib/shared.js').then(mod=>{ if(mod && mod.attachToWindow) mod.attachToWindow(); (function(){\n${s.code}\n})(); })`
      const blob = new Blob([wrapped], {type:'text/javascript'})
      const url = URL.createObjectURL(blob)
      const se = document.createElement('script')
      se.type = 'module'
      se.src = url
      document.body.appendChild(se)
      await new Promise(res=>se.addEventListener('load', ()=>{ URL.revokeObjectURL(url); res() }))
    }
  }

  // attempt to shim canvases
  try{ if(window.autoShimCanvases) window.autoShimCanvases() }catch(e){}
}
