import { useState } from 'react'
import { getApiKey, setApiKey, getProvider, setProvider, PROVIDERS } from '../lib/apiKey.js'
import { runPipeline } from '../lib/agentPipeline.js'
import { getDemoSource } from '../lib/demoSources.js'
import DynamicDemo from './DynamicDemo.jsx'

export default function DemoChat({ model }) {
  const [question,     setQuestion]     = useState('')
  const [stage,        setStage]        = useState(null)
  const [result,       setResult]       = useState(null)
  const [error,        setError]        = useState(null)
  const [needKey,      setNeedKey]      = useState(false)
  const [keyDraft,     setKeyDraft]     = useState('')
  const [chatProvider, setChatProvider] = useState(() => getProvider())

  function getCurrentDemoCode() {
    const modulePath = model?.module || ''
    const filename = modulePath.split('/').pop()
    return getDemoSource(filename) || ''
  }

  async function submit(e) {
    e?.preventDefault()
    const q = question.trim()
    if (!q || stage) return
    if (!getApiKey()) { setChatProvider(getProvider()); setNeedKey(true); return }

    setError(null)
    setResult(null)
    try {
      const { explanation, code } = await runPipeline(
        getProvider(),
        getApiKey(),
        q,
        getCurrentDemoCode(),
        setStage,
      )
      setResult({ explanation, code })
    } catch (err) {
      setError(err.message || String(err))
    } finally {
      setStage(null)
    }
  }

  function saveKey(e) {
    e?.preventDefault()
    const k = keyDraft.trim()
    if (!k) return
    setApiKey(k, chatProvider)
    setProvider(chatProvider)
    setKeyDraft('')
    setNeedKey(false)
    if (question.trim()) submit()
  }

  function handleChatProvider(p) {
    setChatProvider(p)
    if (getApiKey(p)) {
      setProvider(p)
      setNeedKey(false)
      if (question.trim()) submit()
    }
  }

  return (
    <div className="demo-chat">
      <div className="demo-chat-header">
        <span className="demo-chat-icon">✦</span>
        <span>Ask AI to explain this demo differently</span>
      </div>

      {needKey && (
        <div className="demo-chat-keybox">
          <div className="provider-selector" style={{ marginBottom: '.6rem' }}>
            {PROVIDERS.map(p => (
              <button
                key={p.id}
                type="button"
                className={`provider-pill${chatProvider === p.id ? ' active' : ''}`}
                onClick={() => handleChatProvider(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <p className="demo-chat-keybox-hint">
            Paste your <strong>{PROVIDERS.find(p => p.id === chatProvider)?.label} API Key</strong> to use the AI assistant.
            Stored only in your browser — never sent to our servers.
          </p>
          <form className="demo-chat-keybox-form" onSubmit={saveKey}>
            <input
              type="password"
              autoComplete="off"
              spellCheck="false"
              placeholder={PROVIDERS.find(p => p.id === chatProvider)?.placeholder || '…'}
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              className="demo-chat-key-input"
            />
            <button type="submit" className="btn">Save</button>
            <button type="button" className="btn" onClick={() => setNeedKey(false)}>Cancel</button>
          </form>
          <a
            href={
              chatProvider === 'openai'    ? 'https://platform.openai.com/api-keys' :
              chatProvider === 'anthropic' ? 'https://console.anthropic.com/settings/keys' :
                                            'https://aistudio.google.com/apikey'
            }
            target="_blank" rel="noreferrer" className="demo-chat-keybox-link"
          >
            Get a {PROVIDERS.find(p => p.id === chatProvider)?.label} API key →
          </a>
        </div>
      )}

      <form className="demo-chat-form" onSubmit={submit}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="What part didn't make sense? Ask anything about this demo…"
          disabled={!!stage}
          className="demo-chat-input"
        />
        <button
          type="submit"
          disabled={!question.trim() || !!stage}
          className="btn demo-chat-send"
        >
          {stage ? '···' : 'Ask →'}
        </button>
      </form>

      {stage && (
        <div className="demo-chat-progress">
          <span className="demo-chat-spinner" />
          {stage}
        </div>
      )}

      {error && <div className="demo-chat-error">⚠ {error}</div>}

      {result && (
        <div className="demo-chat-result">
          <p className="demo-chat-explanation">{result.explanation}</p>
          <DynamicDemo code={result.code} />
          <div className="demo-chat-result-footer">
            <button className="btn" onClick={() => setResult(null)}>↺ Ask again</button>
          </div>
        </div>
      )}
    </div>
  )
}