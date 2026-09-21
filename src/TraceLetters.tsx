import { useState } from "react";
import { TRACE_SETS, midLineRatio, type TraceSetId } from "./trace";
import { generateTracePdf } from "./tracePdf";
import { CANVAS_SIZE, TraceStage } from "./TraceStage";

const BASELINE = 630;
const CAP_HEIGHT = 440;
const FONT_SIZE = CAP_HEIGHT / 0.716;

function drawLetterGuide(ctx: CanvasRenderingContext2D, char: string) {
  const top = BASELINE - CAP_HEIGHT;
  const mid = BASELINE - CAP_HEIGHT * midLineRatio(char);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#a8a3b5";
  for (const y of [top, BASELINE]) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(CANVAS_SIZE - 30, y);
    ctx.stroke();
  }
  ctx.setLineDash([14, 12]);
  ctx.strokeStyle = "#cfcbda";
  ctx.beginPath();
  ctx.moveTo(30, mid);
  ctx.lineTo(CANVAS_SIZE - 30, mid);
  ctx.stroke();

  ctx.font = `bold ${FONT_SIZE}px "Helvetica Neue", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ece9f3";
  ctx.fillText(char, CANVAS_SIZE / 2, BASELINE);
  ctx.setLineDash([2, 16]);
  ctx.lineCap = "round";
  ctx.lineWidth = 7;
  ctx.strokeStyle = "#8b84a0";
  ctx.strokeText(char, CANVAS_SIZE / 2, BASELINE);
  ctx.setLineDash([]);
}

export function TraceLetters() {
  const [setId, setSetId] = useState<TraceSetId>("upper");
  const [char, setChar] = useState("A");

  const set = TRACE_SETS.find((s) => s.id === setId) ?? TRACE_SETS[0];

  function chooseSet(id: TraceSetId) {
    setSetId(id);
    setChar(TRACE_SETS.find((s) => s.id === id)?.chars[0] ?? "A");
  }

  function step(delta: number) {
    const i = set.chars.indexOf(char);
    setChar(set.chars[(i + delta + set.chars.length) % set.chars.length]);
  }

  return (
    <section aria-label="Trace letters and numbers">
      <div className="mode-toggle trace-sets" role="radiogroup" aria-label="Character set">
        {TRACE_SETS.map((s) => (
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

      <div className="trace-picker" role="group" aria-label="Pick a character">
        {set.chars.map((c) => (
          <button
            key={c}
            className={c === char ? "trace-char active" : "trace-char"}
            aria-pressed={c === char}
            onClick={() => setChar(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <TraceStage
        guideKey={char}
        drawGuide={(ctx) => drawLetterGuide(ctx, char)}
        label={`Drawing area: trace the ${/\d/.test(char) ? "number" : "letter"} ${char} with your finger or mouse`}
        before={<button onClick={() => step(-1)}>← Previous</button>}
        after={<button onClick={() => step(1)}>Next →</button>}
      />

      <div className="trace-print">
        <span>Print it:</span>
        <div className="preview-actions">
          <button onClick={() => generateTracePdf([char], `trace-${setId}-${char}.pdf`)}>Download “{char}” page (PDF)</button>
          <button onClick={() => generateTracePdf(set.chars, `trace-${set.label.toLowerCase().replace(/\s+/g, "-")}.pdf`)}>
            Download all {set.label.toLowerCase()} (PDF)
          </button>
        </div>
      </div>
    </section>
  );
}
