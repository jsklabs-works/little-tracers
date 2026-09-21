import { useEffect, useRef, useState, type ReactNode } from "react";

export const CANVAS_SIZE = 800;
const PEN_WIDTH = 26;
const PEN_COLOURS = [
  { name: "Purple", value: "#7c3aed" },
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
];

interface TraceStageProps {
  /** Paints the dotted guide. Whenever `guideKey` changes the guide is redrawn and the child's ink is cleared. */
  drawGuide: (ctx: CanvasRenderingContext2D) => void;
  guideKey: string;
  label: string;
  /** Buttons shown before and after the Clear button. */
  before?: ReactNode;
  after?: ReactNode;
}

/** A square drawing area: a guide canvas underneath and a canvas on top that records finger or mouse strokes. */
export function TraceStage({ drawGuide, guideKey, label, before, after }: TraceStageProps) {
  const [colour, setColour] = useState(PEN_COLOURS[0].value);
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  function clearInk() {
    inkRef.current?.getContext("2d")?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }

  useEffect(() => {
    const ctx = guideRef.current?.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.setLineDash([]);
      drawGuide(ctx);
    }
    inkRef.current?.getContext("2d")?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only redraw when the guide changes
  }, [guideKey]);

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
    <>
      <div className="trace-stage">
        <canvas ref={guideRef} width={CANVAS_SIZE} height={CANVAS_SIZE} aria-hidden="true" />
        <canvas
          ref={inkRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          role="img"
          aria-label={label}
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
          {before}
          <button onClick={clearInk}>Clear</button>
          {after}
        </div>
      </div>
    </>
  );
}
