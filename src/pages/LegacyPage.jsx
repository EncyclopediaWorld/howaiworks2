import React, {useEffect, useState, useRef} from 'react'

function extractBody(htmlText){
  const m = htmlText.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return m ? m[1] : htmlText
}

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

export default function LegacyPage({srcPath}){
  const [html, setHtml] = useState('<div style="padding:40px;color:#ddd">Loading…</div>')
  const containerRef = useRef(null)

  useEffect(() => {
    let mounted = true;

    function run() {
      fetch(srcPath)
        .then(r => r.text())
        .then(async t => {
          if (!mounted) return
          const body = extractBody(t)
          setHtml(body)

          // Try to import a prebuilt legacy module (src/legacy/<basename>.js). If it exists
          // it will fetch and run the original scripts. Otherwise fall back to inline execution.
          const basename = srcPath.replace(/^[\/]?/, '').replace(/\.html$/, '')
          const legacyModule = `/src/legacy/${basename}.js`
          let usedLegacy = false
          try {
            await import(legacyModule)
            usedLegacy = true
          } catch (e) {
            // legacy module missing — fall back to inline script execution
          }

          const modernSections = new Set(['section1','section2','section3','section4','section5','section6','section7','section8'])
          const isModernSection = modernSections.has(basename)

          if (!usedLegacy && !isModernSection) {
            const scripts = extractScripts(t)
            try {
              const mod = await import('/src/lib/shared.js')
              if (mod && mod.attachToWindow) mod.attachToWindow()
            } catch (e) {
              const s = document.createElement('script')
              s.src = '/shared.js'
              document.body.appendChild(s)
            }

            for (const s of scripts) {
              if (s.src) {
                if (s.src.endsWith('shared.js')) continue
                const se = document.createElement('script')
                se.src = s.src.startsWith('/') ? s.src : s.src
                document.body.appendChild(se)
                await new Promise(res => se.addEventListener('load', res))
              } else if (s.code && s.code.trim()) {
                const wrapped = `import('/src/lib/shared.js').then(mod=>{ if(mod && mod.attachToWindow) mod.attachToWindow(); (function(){\n${s.code}\n})(); })`
                const blob = new Blob([wrapped], { type: 'text/javascript' })
                const url = URL.createObjectURL(blob)
                const se = document.createElement('script')
                se.type = 'module'
                se.src = url
                document.body.appendChild(se)
                await new Promise(res => se.addEventListener('load', () => { URL.revokeObjectURL(url); res() }))
              }
            }
            try { if (window.autoShimCanvases) window.autoShimCanvases() } catch (e) { }
          }


        .catch(err => {
          if (!mounted) return
          setHtml('<div style="padding:40px;color:#ddd">Unable to load page.</div>')
        })
    }
    run()
    return () => { mounted = false }
  }, [srcPath])

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{__html: html}} />
  )
}
