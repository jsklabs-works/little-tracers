import { useCallback, useEffect, useRef, useState } from "react";
import { TRACE_SETS, midLineRatio, type TraceSetId } from "./trace";
import { generateTracePdf } from "./tracePdf";

const CANVAS_SIZE = 800;
const BASELINE = 630;
const CAP_HEIGHT = 440;
const FONT_SIZE = CAP_HEIGHT / 0.716;
const PEN_WIDTH = 26;
const PEN_COLOURS = [
  { name: "Purple", value: "#7c3aed" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
];

function drawGuide(canvas: HTMLCanvasElement, char: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const top = BASELINE - CAP_HEIGHT;
  const mid = BASELINE - CAP_HEIGHT * midLineRatio(char);
  ctx.lineWidth = 3;
  ctx.setLineDash([]);
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
  const [colour, setColour] = useState(PEN_COLOURS[0].value);
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const set = TRACE_SETS.find((s) => s.id === setId) ?? TRACE_SETS[0];

  const clearInk = useCallback(() => {
    inkRef.current?.getContext("2d")?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }, []);

  useEffect(() => {
    if (guideRef.current) drawGuide(guideRef.current, char);
    clearInk();
  }, [char, clearInk]);

  function chooseSet(id: TraceSetId) {
    setSetId(id);
    setChar(TRACE_SETS.find((s) => s.id === id)?.chars[0] ?? "A");
  }

  function step(delta: number) {
    const i = set.chars.indexOf(char);
    setChar(set.chars[(i + delta + set.chars.length) % set.chars.length]);
  }

  function pointFor(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function strokeTo(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = e.currentTarget.getContext("2d");
    const from = lastPoint.current;
    if (!ctx || !from) return;
    const to = pointFor(e);
    ctx.strokeStyle = colour;
    ctx.lineWidth = PEN_WIDTH;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    lastPoint.current = to;
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPoint.current = pointFor(e);
    strokeTo(e); // a tap leaves a dot
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (lastPoint.current) strokeTo(e);
  }

  function endStroke() {
    lastPoint.current = null;
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Little Tracers</h1>
        <p className="subtitle">Trace letters and numbers with a finger or mouse, or print a dotted worksheet.</p>
      </header>

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

      <div className="trace-stage">
        <canvas ref={guideRef} width={CANVAS_SIZE} height={CANVAS_SIZE} aria-hidden="true" />
        <canvas
          ref={inkRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          role="img"
          aria-label={`Drawing area: trace the ${/\d/.test(char) ? "number" : "letter"} ${char} with your finger or mouse`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
        />
      </div>

      <div className="trace-controls">
        <div className="trace-colours" role="radiogroup" aria-label="Pen colour">
          {PEN_COLOURS.map((c) => (
            <button
              key={c.value}
              role="radio"
              aria-checked={colour === c.value}
              aria-label={c.name}
              title={c.name}
              className={colour === c.value ? "trace-colour active" : "trace-colour"}
              style={{ background: c.value }}
              onClick={() => setColour(c.value)}
            />
          ))}
        </div>
        <div className="preview-actions">
          <button onClick={() => step(-1)}>← Previous</button>
          <button onClick={clearInk}>Clear</button>
          <button onClick={() => step(1)}>Next →</button>
        </div>
      </div>

      <div className="trace-print">
        <span>Print it:</span>
        <div className="preview-actions">
          <button onClick={() => generateTracePdf([char], `trace-${setId}-${char}.pdf`)}>Download “{char}” page (PDF)</button>
          <button onClick={() => generateTracePdf(set.chars, `trace-${set.label.toLowerCase().replace(/\s+/g, "-")}.pdf`)}>
            Download all {set.label.toLowerCase()} (PDF)
          </button>
        </div>
      </div>
    </main>
  );
}
