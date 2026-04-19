import { useState, useEffect, useRef, useMemo } from 'react'
import { SHARED, SHARED_CSS } from '../lib/sharedCode.js'

export default function DynamicDemo({ code, onError }) {
  const [height, setHeight] = useState(360)
  const iframeRef = useRef(null)

  useEffect(() => {
    function onMessage(e) {
      if (e.source !== iframeRef.current?.contentWindow) return
      if (e.data?.type === 'iframeHeight' && typeof e.data.height === 'number' && e.data.height > 0) {
        setHeight(e.data.height)
      }
      if (e.data?.type === 'iframeError') {
        onError?.()
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [onError])

  const srcdoc = useMemo(() => `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>${SHARED_CSS}</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
${SHARED}
try {
${code}
} catch(err) {
  window.parent.postMessage({type:'iframeError'},'*');
  document.body.innerHTML = '<pre style="color:#ff6b6b;font-family:monospace;padding:1rem;white-space:pre-wrap">' + err.toString() + '</pre>'
}
</script>
</body>
</html>`, [code])

  if (!code) return null

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcdoc}
      style={{ width: '100%', height: height + 'px', border: 'none', display: 'block' }}
      sandbox="allow-scripts"
      title="AI Generated Demo"
    />
  )
}