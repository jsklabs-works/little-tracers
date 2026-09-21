import { useState } from "react";
import { CANVAS_SIZE, TraceStage } from "./TraceStage";
import { PATTERN_SETS, SCREEN_GRID, isClosed, layoutPattern, type Pattern, type PatternSetId, type Stroke } from "./patterns";
import { generatePatternPdf } from "./patternsPdf";

const MARGIN = 50;

function drawPatternGuide(ctx: CanvasRenderingContext2D, pattern: Pattern) {
  const { cols, rows } = SCREEN_GRID[pattern.kind];
  const strokes: Stroke[] = layoutPattern(
    pattern,
    { x: MARGIN, y: MARGIN, w: CANVAS_SIZE - 2 * MARGIN, h: CANVAS_SIZE - 2 * MARGIN },
    cols,
    rows,
  );

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#8b84a0";
  ctx.lineWidth = 8;
  ctx.setLineDash([1, 17]);
  for (const stroke of strokes) {
    ctx.beginPath();
    stroke.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (const stroke of strokes) {
    const start = stroke[0];
    const end = stroke[stroke.length - 1];
    ctx.fillStyle = "#22a050";
    ctx.beginPath();
    ctx.arc(start.x, start.y, 17, 0, 2 * Math.PI);
    ctx.fill();
    if (!isClosed(stroke)) {
      ctx.fillStyle = "#dc3c3c";
      ctx.beginPath();
      ctx.arc(end.x, end.y, 13, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}

export function PatternPractice() {
  const [setId, setSetId] = useState<PatternSetId>("lines");
  const [patternId, setPatternId] = useState(PATTERN_SETS[0].patterns[0].id);

  const set = PATTERN_SETS.find((s) => s.id === setId) ?? PATTERN_SETS[0];
  const pattern = set.patterns.find((p) => p.id === patternId) ?? set.patterns[0];

  function chooseSet(id: PatternSetId) {
    setSetId(id);
    setPatternId(PATTERN_SETS.find((s) => s.id === id)?.patterns[0].id ?? "");
  }

  function step(delta: number) {
    const i = set.patterns.indexOf(pattern);
    setPatternId(set.patterns[(i + delta + set.patterns.length) % set.patterns.length].id);
  }

  return (
    <section aria-label="Lines and shapes for pencil practice">
      <div className="mode-toggle trace-sets" role="radiogroup" aria-label="Lines or shapes">
        {PATTERN_SETS.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={setId === s.id}
            className={setId === s.id ? "mode-tab active" : "mode-tab"}
            onClick={() => chooseSet(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="trace-picker" role="group" aria-label="Pick a pattern">
        {set.patterns.map((p) => (
          <button
            key={p.id}
            className={p.id === pattern.id ? "trace-char wide active" : "trace-char wide"}
            aria-pressed={p.id === pattern.id}
            onClick={() => setPatternId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="trace-legend">
        Start at the <span className="dot start" /> green dot and stop at the <span className="dot end" /> red dot. Hold the pencil with
        your thumb and first two fingers.
      </p>

      <TraceStage
        guideKey={pattern.id}
        drawGuide={(ctx) => drawPatternGuide(ctx, pattern)}
        label={`Drawing area: trace the ${pattern.label.toLowerCase()} with your finger or mouse`}
        before={<button onClick={() => step(-1)}>← Previous</button>}
        after={<button onClick={() => step(1)}>Next →</button>}
      />

      <div className="trace-print">
        <span>Print it:</span>
        <div className="preview-actions">
          <button onClick={() => generatePatternPdf([pattern], `trace-${pattern.id}.pdf`)}>Download “{pattern.label}” page (PDF)</button>
          <button onClick={() => generatePatternPdf(set.patterns, `trace-${set.id}.pdf`)}>Download all {set.label.toLowerCase()} (PDF)</button>
        </div>
      </div>
    </section>
  );
}
