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

const allFilenames = Object.keys(sourceMap)

/**
 * Returns the raw source string for a given demo filename.
 * @param {string} filename  e.g. "linearRegression-section1.js"
 */
export function getDemoSource(filename) {
  return sourceMap[filename] ?? null
}

/**
 * Returns 3 raw source strings picked at random, excluding the given filename.
 * @param {string} excludeFilename  The demo to exclude (the current one)
 * @returns {string[]}  Array of 3 raw source strings
 */
export function getRandomDemoSources(excludeFilename) {
  const pool = allFilenames.filter(f => f !== excludeFilename)
  const picked = []
  const used = new Set()
  while (picked.length < 3 && used.size < pool.length) {
    const idx = Math.floor(Math.random() * pool.length)
    if (!used.has(idx)) {
      used.add(idx)
      picked.push(sourceMap[pool[idx]])
    }
  }
  return picked
}
