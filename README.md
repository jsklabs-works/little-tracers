# Little Tracers

A free, browser-only pre-writing and colouring app for preschoolers: trace letters, numbers, lines and shapes, colour in pictures, and print the same pages. No accounts, no backend, no data collection.

Three tabs:

- **Letters & numbers**: pick Capital letters, Small letters or Numbers, then any character. Trace the big dotted guide with a finger, stylus or mouse on an HTML canvas, in a choice of pen colours, with *Previous*, *Next* and *Clear* buttons.
- **Lines & shapes** (pencil control): every pattern has a green start dot and a red stop dot.
  - *Lines*: flat, standing, slanting (both ways), zigzag, waves, bumps, loops and steps.
  - *Shapes*: circle, square, triangle, plus, cross, diamond, star and spiral.
- **Colouring**: ten simple pictures (sun, house, fish, flower, apple, butterfly, star, balloon, ice cream, tree). Pick a colour and tap a part of the picture to fill it, with *Undo*, *Start over* and an eraser.

Every tab has **Print it** buttons that download a PDF for one page or the whole set: dotted letters with guide lines (one page per character), dotted lines and shapes to trace, or the colouring outlines. Each page has a name line, and the letter and pattern pages are also fine to trace with a pencil.

The letters use a plain sans-serif font. Stroke order and start arrows for letters would need hand-drawn stroke paths per character, which are not included yet. The colouring canvas is tap-only (no free painting) and is not keyboard accessible.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # typecheck + production build into dist/
npm run lint
```

Code:

| File | What it does |
|---|---|
| [`src/App.tsx`](src/App.tsx) | Header and the three tabs |
| [`src/TraceStage.tsx`](src/TraceStage.tsx) | Shared drawing canvas (guide layer plus ink layer, pen colours, Clear) |
| [`src/TraceLetters.tsx`](src/TraceLetters.tsx), [`src/trace.ts`](src/trace.ts), [`src/tracePdf.ts`](src/tracePdf.ts) | Letters and numbers |
| [`src/PatternPractice.tsx`](src/PatternPractice.tsx), [`src/patterns.ts`](src/patterns.ts), [`src/patternsPdf.ts`](src/patternsPdf.ts) | Lines and shapes. A pattern is a function that returns stroke paths, which the screen and the PDF both draw |
| [`src/Colouring.tsx`](src/Colouring.tsx), [`src/pictures.ts`](src/pictures.ts), [`src/colouringPdf.ts`](src/colouringPdf.ts) | Colouring. Pictures are SVG path data in a 100 x 100 box; tapping flood-fills the region bounded by the outlines |
| [`src/pdfCommon.ts`](src/pdfCommon.ts) | PDF header (title, name line) and footer |

To add a picture, append an entry to `PICTURES` in `pictures.ts`. To add a pattern, add an entry to `rowPatterns` or `cellPatterns` in `patterns.ts`.

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds with `GITHUB_PAGES=true`, which sets the Vite base path to `/little-tracers/`. In the repo settings, set Pages → Source to **GitHub Actions**. If you name the repo something else, update `base` in [`vite.config.ts`](vite.config.ts).
