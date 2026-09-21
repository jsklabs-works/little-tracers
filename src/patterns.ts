export interface Point {
  x: number;
  y: number;
}
export type Stroke = Point[];

export type PatternSetId = "lines" | "shapes";

export interface Pattern {
  id: string;
  label: string;
  /** "row" patterns run across the full width and repeat down the page; "cell" patterns sit in a grid. */
  kind: "row" | "cell";
  /** Builds the strokes inside a w-by-h box whose top-left corner is (0, 0). Each stroke is drawn from its first point to its last. */
  make: (w: number, h: number) => Stroke[];
}

export interface PatternSet {
  id: PatternSetId;
  label: string;
  patterns: Pattern[];
}

const pt = (x: number, y: number): Point => ({ x, y });

function sample(count: number, f: (t: number) => Point): Stroke {
  return Array.from({ length: count + 1 }, (_, i) => f(i / count));
}

/** Evenly spaced x positions that fit the row, centred. */
function columns(w: number, gap: number, margin: number): number[] {
  const n = Math.max(1, Math.floor((w - 2 * margin) / gap) + 1);
  const start = (w - (n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => start + i * gap);
}

const rowPatterns: Pattern[] = [
  {
    id: "flat",
    label: "Flat lines",
    kind: "row",
    make: (w, h) => [[pt(h * 0.2, h / 2), pt(w - h * 0.2, h / 2)]],
  },
  {
    id: "standing",
    label: "Standing lines",
    kind: "row",
    make: (w, h) => columns(w, h * 0.55, h * 0.3).map((x) => [pt(x, h * 0.12), pt(x, h * 0.88)]),
  },
  {
    id: "slide-right",
    label: "Slanting lines ╲",
    kind: "row",
    make: (w, h) => columns(w, h * 0.55, h * 0.4).map((x) => [pt(x - h * 0.18, h * 0.12), pt(x + h * 0.18, h * 0.88)]),
  },
  {
    id: "slide-left",
    label: "Slanting lines ╱",
    kind: "row",
    make: (w, h) => columns(w, h * 0.55, h * 0.4).map((x) => [pt(x + h * 0.18, h * 0.12), pt(x - h * 0.18, h * 0.88)]),
  },
  {
    id: "zigzag",
    label: "Zigzag",
    kind: "row",
    make: (w, h) => {
      const p = h * 0.2;
      const step = h * 0.45;
      const n = Math.floor((w - 2 * p) / step);
      return [Array.from({ length: n + 1 }, (_, i) => pt(p + i * step, i % 2 === 0 ? h * 0.8 : h * 0.2))];
    },
  },
  {
    id: "waves",
    label: "Waves",
    kind: "row",
    make: (w, h) => {
      const p = h * 0.2;
      const period = h * 1.6;
      return [sample(Math.round(w / 2), (t) => pt(p + t * (w - 2 * p), h / 2 - (h * 0.32) * Math.sin(((t * (w - 2 * p)) / period) * 2 * Math.PI)))];
    },
  },
  {
    id: "bumps",
    label: "Bumps",
    kind: "row",
    make: (w, h) => {
      const r = h * 0.3;
      const base = h * 0.8;
      const n = Math.floor((w - h * 0.4) / (2 * r));
      const start = (w - n * 2 * r) / 2;
      const stroke: Stroke = [];
      for (let i = 0; i < n; i++) {
        for (let k = 0; k <= 24; k++) {
          const a = Math.PI - (k / 24) * Math.PI;
          stroke.push(pt(start + r + i * 2 * r + r * Math.cos(a), base - r * 1.25 * Math.sin(a)));
        }
      }
      return [stroke];
    },
  },
  {
    id: "loops",
    label: "Loops",
    kind: "row",
    make: (w, h) => {
      // A prolate trochoid: a point on a rolling wheel that sits outside its rim draws loops. It starts at the bottom of a loop.
      const b = h * 0.28;
      const a = b * 0.5;
      const turns = Math.max(1, Math.floor((w - h * 0.4 - 2 * b) / (2 * Math.PI * a)));
      const span = 2 * Math.PI * turns;
      const x0 = (w - a * span) / 2;
      return [sample(turns * 40, (t) => pt(x0 + a * span * t + b * Math.sin(span * t), h / 2 + b * Math.cos(span * t)))];
    },
  },
  {
    id: "steps",
    label: "Steps",
    kind: "row",
    make: (w, h) => {
      const step = h * 0.4;
      const p = h * 0.2;
      const n = Math.floor((w - 2 * p) / step);
      const top = h * 0.2;
      const bottom = h * 0.8;
      const stroke: Stroke = [pt(p, bottom)];
      for (let i = 0; i < n; i++) {
        const x = p + i * step;
        const up = i % 2 === 0;
        stroke.push(pt(x, up ? top : bottom), pt(x + step, up ? top : bottom));
      }
      return [stroke];
    },
  },
];

const shapeRadius = (w: number, h: number) => Math.min(w, h) * 0.38;

const cellPatterns: Pattern[] = [
  {
    id: "circle",
    label: "Circle",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h);
      // Start at the top and go anticlockwise, the way children are taught to draw circles.
      return [sample(60, (t) => pt(w / 2 + r * Math.cos(-Math.PI / 2 - t * 2 * Math.PI), h / 2 + r * Math.sin(-Math.PI / 2 - t * 2 * Math.PI)))];
    },
  },
  {
    id: "square",
    label: "Square",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h);
      const [cx, cy] = [w / 2, h / 2];
      return [[pt(cx - r, cy - r), pt(cx + r, cy - r), pt(cx + r, cy + r), pt(cx - r, cy + r), pt(cx - r, cy - r)]];
    },
  },
  {
    id: "triangle",
    label: "Triangle",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h);
      const [cx, cy] = [w / 2, h / 2];
      return [[pt(cx, cy - r), pt(cx - r, cy + r * 0.8), pt(cx + r, cy + r * 0.8), pt(cx, cy - r)]];
    },
  },
  {
    id: "plus",
    label: "Plus +",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h);
      const [cx, cy] = [w / 2, h / 2];
      return [
        [pt(cx, cy - r), pt(cx, cy + r)],
        [pt(cx - r, cy), pt(cx + r, cy)],
      ];
    },
  },
  {
    id: "cross",
    label: "Cross ×",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h);
      const [cx, cy] = [w / 2, h / 2];
      return [
        [pt(cx - r, cy - r), pt(cx + r, cy + r)],
        [pt(cx + r, cy - r), pt(cx - r, cy + r)],
      ];
    },
  },
  {
    id: "diamond",
    label: "Diamond",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h);
      const [cx, cy] = [w / 2, h / 2];
      return [[pt(cx, cy - r), pt(cx + r, cy), pt(cx, cy + r), pt(cx - r, cy), pt(cx, cy - r)]];
    },
  },
  {
    id: "star",
    label: "Star",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h) * 1.1;
      const vertex = (k: number) => pt(w / 2 + r * Math.cos(-Math.PI / 2 + (k * 2 * Math.PI) / 5), h / 2 + r * Math.sin(-Math.PI / 2 + (k * 2 * Math.PI) / 5));
      return [[0, 2, 4, 1, 3, 0].map(vertex)];
    },
  },
  {
    id: "spiral",
    label: "Spiral",
    kind: "cell",
    make: (w, h) => {
      const r = shapeRadius(w, h);
      return [sample(160, (t) => pt(w / 2 + r * t * Math.cos(t * 3 * 2 * Math.PI), h / 2 + r * t * Math.sin(t * 3 * 2 * Math.PI)))];
    },
  },
];

export const PATTERN_SETS: PatternSet[] = [
  { id: "lines", label: "Lines", patterns: rowPatterns },
  { id: "shapes", label: "Shapes", patterns: cellPatterns },
];

/** A closed stroke ends where it started (a circle, square and so on), so it only needs a start marker. */
export function isClosed(stroke: Stroke): boolean {
  const a = stroke[0];
  const b = stroke[stroke.length - 1];
  return Math.hypot(a.x - b.x, a.y - b.y) < 1e-6 * Math.max(1, Math.abs(a.x) + Math.abs(a.y)) + 0.5;
}

/** Repeats a pattern across a box: rows down the page for "row" patterns, a grid of cells for "cell" patterns. */
export function layoutPattern(pattern: Pattern, box: { x: number; y: number; w: number; h: number }, cols: number, rows: number): Stroke[] {
  const cw = box.w / cols;
  const ch = box.h / rows;
  const out: Stroke[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (const stroke of pattern.make(cw, ch)) {
        out.push(stroke.map((p) => pt(box.x + c * cw + p.x, box.y + r * ch + p.y)));
      }
    }
  }
  return out;
}

/** Grid used on screen (inside an 800px square) and on the A4 page (in mm) for each kind of pattern. */
export const SCREEN_GRID = {
  row: { cols: 1, rows: 4 },
  cell: { cols: 2, rows: 2 },
} as const;
export const PAGE_GRID = {
  row: { cols: 1, rows: 8 },
  cell: { cols: 3, rows: 4 },
} as const;
