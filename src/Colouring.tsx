import { useEffect, useRef, useState } from "react";
import { PICTURES, drawPicture } from "./pictures";
import { generateColouringPdf } from "./colouringPdf";

const SIZE = 800;
/** Pixels whose red channel is below this in the line art count as part of an outline. */
const OUTLINE_THRESHOLD = 150;
const MAX_UNDO = 10;
/** How far (in pixels) from a tap to look for empty space if the tap lands on an outline. */
const TAP_SLACK = 10;

const PALETTE = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#facc15" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Brown", value: "#92400e" },
  { name: "Grey", value: "#9ca3af" },
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function Colouring() {
  const [pictureId, setPictureId] = useState(PICTURES[0].id);
  const [colour, setColour] = useState<string | null>(PALETTE[0].value);
  const [canUndo, setCanUndo] = useState(false);
  const fillRef = useRef<HTMLCanvasElement>(null);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const outline = useRef<Uint8Array>(new Uint8Array(SIZE * SIZE));
  const undoStack = useRef<ImageData[]>([]);

  const picture = PICTURES.find((p) => p.id === pictureId) ?? PICTURES[0];

  useEffect(() => {
    const line = lineRef.current?.getContext("2d", { willReadFrequently: true });
    const fill = fillRef.current?.getContext("2d");
    if (!line || !fill) return;
    drawPicture(line, picture, SIZE);
    const pixels = line.getImageData(0, 0, SIZE, SIZE).data;
    for (let i = 0; i < SIZE * SIZE; i++) outline.current[i] = pixels[i * 4] < OUTLINE_THRESHOLD ? 1 : 0;
    fill.clearRect(0, 0, SIZE, SIZE);
    undoStack.current = [];
    setCanUndo(false);
  }, [picture]);

  function fillAt(tapX: number, tapY: number) {
    const ctx = fillRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const walls = outline.current;

    let start = -1;
    for (let r = 0; r <= TAP_SLACK && start < 0; r++) {
      for (let dy = -r; dy <= r && start < 0; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          const x = tapX + dx;
          const y = tapY + dy;
          if (x >= 0 && y >= 0 && x < SIZE && y < SIZE && !walls[y * SIZE + x]) {
            start = y * SIZE + x;
            break;
          }
        }
      }
    }
    if (start < 0) return;

    const before = ctx.getImageData(0, 0, SIZE, SIZE);
    const after = new ImageData(new Uint8ClampedArray(before.data), SIZE, SIZE);
    const [r, g, b] = colour ? hexToRgb(colour) : [0, 0, 0];
    const alpha = colour ? 255 : 0;

    const seen = new Uint8Array(SIZE * SIZE);
    const stack = [start];
    seen[start] = 1;
    while (stack.length > 0) {
      const i = stack.pop() as number;
      const o = i * 4;
      after.data[o] = r;
      after.data[o + 1] = g;
      after.data[o + 2] = b;
      after.data[o + 3] = alpha;
      const x = i % SIZE;
      const neighbours = [x > 0 ? i - 1 : -1, x < SIZE - 1 ? i + 1 : -1, i >= SIZE ? i - SIZE : -1, i < SIZE * (SIZE - 1) ? i + SIZE : -1];
      for (const n of neighbours) {
        if (n >= 0 && !seen[n] && !walls[n]) {
          seen[n] = 1;
          stack.push(n);
        }
      }
    }

    undoStack.current.push(before);
    if (undoStack.current.length > MAX_UNDO) undoStack.current.shift();
    ctx.putImageData(after, 0, 0);
    setCanUndo(true);
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    fillAt(Math.floor(((e.clientX - rect.left) * SIZE) / rect.width), Math.floor(((e.clientY - rect.top) * SIZE) / rect.height));
  }

  function undo() {
    const previous = undoStack.current.pop();
    if (previous) fillRef.current?.getContext("2d")?.putImageData(previous, 0, 0);
    setCanUndo(undoStack.current.length > 0);
  }

  function startOver() {
    fillRef.current?.getContext("2d")?.clearRect(0, 0, SIZE, SIZE);
    undoStack.current = [];
    setCanUndo(false);
  }

  return (
    <section aria-label="Colouring pictures">
      <div className="trace-picker" role="group" aria-label="Pick a picture">
        {PICTURES.map((p) => (
          <button
            key={p.id}
            className={p.id === picture.id ? "trace-char wide active" : "trace-char wide"}
            aria-pressed={p.id === picture.id}
            onClick={() => setPictureId(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <p className="trace-legend">Pick a colour, then tap a part of the picture to fill it.</p>

      <div className="trace-stage colour-stage">
        <canvas ref={fillRef} width={SIZE} height={SIZE} aria-hidden="true" />
        <canvas
          ref={lineRef}
          className="colour-lines"
          width={SIZE}
          height={SIZE}
          role="img"
          aria-label={`Colouring picture of a ${picture.label.toLowerCase()}. Tap a part of the picture to fill it with the chosen colour.`}
          onPointerDown={onPointerDown}
        />
      </div>

      <div className="trace-controls">
        <div className="trace-colours" role="radiogroup" aria-label="Fill colour">
          {PALETTE.map((c) => (
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
          <button
            role="radio"
            aria-checked={colour === null}
            aria-label="Eraser"
            title="Eraser"
            className={colour === null ? "trace-colour eraser active" : "trace-colour eraser"}
            onClick={() => setColour(null)}
          >
            ✕
          </button>
        </div>
        <div className="preview-actions">
          <button onClick={undo} disabled={!canUndo}>
            Undo
          </button>
          <button onClick={startOver}>Start over</button>
        </div>
      </div>

      <div className="trace-print">
        <span>Print it to colour with crayons:</span>
        <div className="preview-actions">
          <button onClick={() => generateColouringPdf([picture], `colour-${picture.id}.pdf`)}>Download “{picture.label}” page (PDF)</button>
          <button onClick={() => generateColouringPdf(PICTURES, "colouring-pictures.pdf")}>Download all pictures (PDF)</button>
        </div>
      </div>
    </section>
  );
}
