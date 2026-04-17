// Loads all demo source files as raw strings via Vite's import.meta.glob.
// Used by agentPipeline.js to feed reference code to agents.

const rawModules = import.meta.glob('../demos/*.js', { query: '?raw', import: 'default', eager: true })

// Build a map of filename → raw source string
// e.g. "linearRegression-section1.js" → "import { ... } export function mount..."
const sourceMap = {}
for (const [path, src] of Object.entries(rawModules)) {
  const filename = path.split('/').pop()
  sourceMap[filename] = src
}

export function getDemoSource(filename) {
  return sourceMap[filename] ?? null
}
