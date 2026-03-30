# How AI Works

Interactive educational web project for AI/ML history and model intuition.

This repository delivers a section-based learning experience with narrative content, formulas, lineage context, and interactive Canvas demos.

## Project Overview

- Framework: React + Vite
- Routing: React Router
- Demo Runtime: plain JavaScript modules mounted into Canvas containers
- Content Model: data-driven configuration via section metadata

The system is intentionally modular so contributors can add or update demos without changing routing or page framework code.

## Quick Start

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Architecture

The project separates application responsibilities into three layers:

1. Page layer
- Handles route matching and page composition.
- Key files: `src/main.jsx`, `src/App.jsx`, `src/pages/Home.jsx`, `src/pages/SectionPage.jsx`.

2. Data layer
- Defines section metadata and model registry.
- Key file: `src/data/sectionContent.js`.

3. Demo module layer
- Implements interactive demos as mountable modules.
- Key folder: `src/demos/`.

Runtime flow:

1. Route `/section/:idx` resolves to Section page.
2. Section page reads section data from `sectionContent`.
3. For each model, page dynamically loads demo module via `import.meta.glob('/src/demos/**/*.js')`.
4. Page calls the configured mount function and stores its cleanup callback.
5. On route change/unmount, page executes cleanup callbacks in reverse order.

## Repository Structure

```text
.
|- src/
|  |- main.jsx                  # App bootstrap + BrowserRouter
|  |- App.jsx                   # Route table
|  |- pages/
|  |  |- Home.jsx               # Landing page
|  |  |- SectionPage.jsx        # Section renderer + demo loader
|  |  |- NotFound.jsx           # 404 page
|  |- data/
|  |  |- sectionContent.js      # Section/model registry (runtime source)
|  |- demos/                    # Interactive demo modules
|  |- lib/
|  |  |- shared.js              # Canvas and interaction utilities
|  |- assets/
|     |- styles.css             # Global styles
|- content/sections/            # Source section HTML artifacts
|- scripts/                     # Generation and verification scripts
|- public/                      # Static deploy assets and fallbacks
```

## Demo Module Contract

Every demo must export a mount function referenced by the model entry.

Standard contract:

```js
export function mountYourDemo(containerId = 'demo-your') {
  const el = document.getElementById(containerId)
  if (!el) return () => {}

  el.innerHTML = ''
  // create canvas, controls, handlers, animation

  return () => {
    // remove handlers, cancel timers/raf, release DOM
    try { el.innerHTML = '' } catch {}
  }
}
```

Required behavior:

- Mount is idempotent for the same container.
- Demo registers no global side effects without cleanup.
- Cleanup safely handles repeated invocation.

Recommended utilities from `src/lib/shared.js`:

- `createCanvas`
- `addHint`
- `addControls`
- pointer helpers and math helpers

## How to Add a New Demo

1. Implement a mount function in `src/demos/`.
2. Register a model entry in `src/data/sectionContent.js` under the target section.
3. Ensure registration fields are complete:

```js
{
  id: 'demo-your',
  anchorId: 'model-your',
  year: '2026',
  name: 'Your Model',
  paper: 'https://...',
  text: 'Short description',
  lineage: 'Optional lineage HTML',
  formula: 'Optional formula text',
  module: '/src/demos/yourDemo.js',
  mount: 'mountYourDemo'
}
```

4. Validate locally:

```bash
npm run lint
npm run verify
npm run dev
```

## Development Scripts

- `npm run dev`: start development server
- `npm run build`: create production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint on source files
- `npm run generate`: regenerate `src/data/sectionContent.js` from `content/sections/*.html`
- `npm run verify`: verify consistency between section HTML and model registry

## Content Source of Truth

- Runtime rendering reads from: `src/data/sectionContent.js`
- Source artifacts for regeneration live in: `content/sections/`

If you update section HTML artifacts, run `npm run generate` and then `npm run verify`.

## Contribution Guidelines

- Keep demos self-contained and deterministic where possible.
- Use clear naming for `id`, `anchorId`, and mount function exports.
- Avoid breaking existing route paths and model anchors.
- Include concise educational hints inside each demo.
- Ensure all animations and timers are cleaned up on unmount.

## Licensing

- Code: Apache-2.0 (`LICENSE`)
- Educational content: CC BY-NC 4.0 (`CONTENT_LICENSE.md`)
- Brand and naming constraints: `BRAND_GUIDELINES.md`
- Commercial usage guidance: `COMMERCIAL.md`
