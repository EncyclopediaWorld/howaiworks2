const PROVIDER_KEY = 'howaiworks-provider'
const KEY_PREFIX   = 'howaiworks-key-'

export const PROVIDERS = [
  { id: 'openai',    label: 'OpenAI',  model: 'GPT-4o mini',      placeholder: 'sk-proj-…' },
  { id: 'anthropic', label: 'Claude',  model: 'claude-3.5-haiku', placeholder: 'sk-ant-…'  },
  { id: 'gemini',    label: 'Gemini',  model: 'gemini-2.0-flash', placeholder: 'AIza…'     },
]

export const getProvider = ()              => localStorage.getItem(PROVIDER_KEY) || 'openai'
export const setProvider = (p)             => localStorage.setItem(PROVIDER_KEY, p)
export const getApiKey   = (provider)      => localStorage.getItem(KEY_PREFIX + (provider ?? getProvider())) || ''
export const setApiKey   = (key, provider) => { if (key) localStorage.setItem(KEY_PREFIX + (provider ?? getProvider()), key.trim()) }
export const clearApiKey = (provider)      => localStorage.removeItem(KEY_PREFIX + (provider ?? getProvider()))
