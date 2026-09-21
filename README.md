# Little Tracers

A free, browser-only letter and number tracing page for preschoolers. No accounts, no backend, no data collection.

- Pick **Capital letters**, **Small letters** or **Numbers**, then any character from the grid
- Trace the big dotted guide with a finger, stylus or mouse on an HTML canvas, in a choice of pen colours
- **Previous**, **Next** and **Clear** buttons
- **Print it**: download a dotted-outline PDF for the current character or the whole set (one page per character, with a name line, guide lines, a solid model in the first row and blank rows for free writing)

The letters use a plain sans-serif font. Stroke order and start arrows would need hand-drawn stroke paths per character, which are not included yet.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
npm run lint
```

Code: [`src/TraceLetters.tsx`](src/TraceLetters.tsx) (canvas UI), [`src/tracePdf.ts`](src/tracePdf.ts) (jsPDF worksheet), [`src/trace.ts`](src/trace.ts) (character sets and guide-line ratios).

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds with `GITHUB_PAGES=true`, which sets the Vite base path to `/little-tracers/`. In the repo settings, set Pages → Source to **GitHub Actions**. If you name the repo something else, update `base` in [`vite.config.ts`](vite.config.ts).
