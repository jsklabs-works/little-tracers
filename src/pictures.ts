/** Colouring pictures are drawn in a 100 x 100 box, later shapes covering earlier ones (like layers of paper). */
export interface Shape {
  /** SVG path data. */
  d: string;
  /** "white" (default) hides what is underneath, "black" is a solid dot such as an eye, "none" is a line only. */
  fill?: "white" | "black" | "none";
}

export interface Picture {
  id: string;
  label: string;
  shapes: Shape[];
}

export const LINE_WIDTH = 1.6;

const circle = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

const polygon = (points: [number, number][]): string => `M${points.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join("L")}Z`;

const polar = (cx: number, cy: number, radius: number, degrees: number): [number, number] => {
  const a = (degrees * Math.PI) / 180;
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
};

const eye = (cx: number, cy: number): Shape => ({ d: circle(cx, cy, 2.2), fill: "black" });
const line = (d: string): Shape => ({ d, fill: "none" });

const sun: Picture = {
  id: "sun",
  label: "Sun",
  shapes: [
    ...Array.from({ length: 8 }, (_, k): Shape => ({
      d: polygon([polar(50, 50, 25, k * 45 - 10), polar(50, 50, 46, k * 45), polar(50, 50, 25, k * 45 + 10)]),
    })),
    { d: circle(50, 50, 22) },
    eye(42, 46),
    eye(58, 46),
    line("M40 56Q50 68 60 56"),
  ],
};

const house: Picture = {
  id: "house",
  label: "House",
  shapes: [
    { d: "M64 18H77V44H64Z" },
    { d: "M20 46H80V90H20Z" },
    { d: "M13 47L50 15L87 47Z" },
    { d: "M42 66H58V90H42Z" },
    { d: "M25 55H38V68H25Z" },
    line("M31.5 55V68M25 61.5H38"),
    { d: "M62 55H75V68H62Z" },
    line("M68.5 55V68M62 61.5H75"),
    { d: circle(54, 78, 1.3), fill: "black" },
  ],
};

const fish: Picture = {
  id: "fish",
  label: "Fish",
  shapes: [
    { d: "M64 50L90 28V72Z" },
    { d: "M40 38Q50 20 62 42Z" },
    { d: "M12 50Q38 18 68 50Q38 82 12 50Z" },
    eye(28, 46),
    line("M44 43Q51 50 44 57"),
    line("M54 41Q62 50 54 59"),
    { d: circle(18, 24, 4.5) },
    { d: circle(28, 12, 3) },
  ],
};

const flower: Picture = {
  id: "flower",
  label: "Flower",
  shapes: [
    { d: "M47 50H53V93H47Z" },
    { d: "M53 78Q72 60 86 70Q72 88 53 78Z" },
    { d: "M47 70Q28 52 14 62Q28 80 47 70Z" },
    ...Array.from({ length: 6 }, (_, k): Shape => {
      const [x, y] = polar(50, 36, 17, k * 60 - 90);
      return { d: circle(x, y, 12.5) };
    }),
    { d: circle(50, 36, 10) },
    eye(46, 34),
    eye(54, 34),
    line("M45 40Q50 45 55 40"),
  ],
};

const apple: Picture = {
  id: "apple",
  label: "Apple",
  shapes: [
    { d: "M48 32Q47 18 54 8L59 11Q53 20 53 32Z" },
    { d: "M56 22Q68 8 84 14Q74 32 56 22Z" },
    { d: "M50 28C30 14 8 34 15 58C21 80 38 94 50 86C62 94 79 80 85 58C92 34 70 14 50 28Z" },
    line("M25 42Q20 54 27 64"),
  ],
};

const butterfly: Picture = {
  id: "butterfly",
  label: "Butterfly",
  shapes: [
    { d: "M50 46C36 8 4 14 11 40C15 54 36 54 50 46Z" },
    { d: "M50 46C64 8 96 14 89 40C85 54 64 54 50 46Z" },
    { d: "M50 52C36 54 16 62 21 79C26 94 46 80 50 52Z" },
    { d: "M50 52C64 54 84 62 79 79C74 94 54 80 50 52Z" },
    { d: circle(27, 32, 6.5) },
    { d: circle(73, 32, 6.5) },
    { d: circle(33, 74, 5) },
    { d: circle(67, 74, 5) },
    { d: "M50 26C57 30 57 70 50 78C43 70 43 30 50 26Z" },
    line("M48 28Q44 14 37 9"),
    line("M52 28Q56 14 63 9"),
  ],
};

const starPoints: [number, number][] = Array.from({ length: 10 }, (_, k) => polar(50, 54, k % 2 === 0 ? 42 : 18, k * 36 - 90));
const star: Picture = {
  id: "star",
  label: "Star",
  shapes: [{ d: polygon(starPoints) }, eye(42, 52), eye(58, 52), line("M41 62Q50 72 59 62")],
};

const balloon: Picture = {
  id: "balloon",
  label: "Balloon",
  shapes: [
    { d: "M50 8C20 8 14 42 28 60C34 68 44 74 50 77C56 74 66 68 72 60C86 42 80 8 50 8Z" },
    { d: "M50 77L43 85H57Z" },
    line("M50 85Q38 89 50 92Q60 95 48 98"),
    line("M33 26Q27 36 31 46"),
  ],
};

const iceCream: Picture = {
  id: "ice-cream",
  label: "Ice cream",
  shapes: [
    { d: "M30 50L50 96L70 50Z" },
    line("M34 60H66M39.5 72H60.5"),
    { d: circle(50, 25, 15) },
    { d: "M27 50C26 36 38 32 50 34C62 32 74 36 73 50Q68 58 62 50Q56 58 50 50Q44 58 38 50Q32 58 27 50Z" },
    { d: circle(50, 8, 5) },
  ],
};

const tree: Picture = {
  id: "tree",
  label: "Tree",
  shapes: [
    { d: "M43 58H57V94H43Z" },
    { d: circle(50, 30, 21) },
    { d: circle(32, 47, 16) },
    { d: circle(68, 47, 16) },
    { d: circle(42, 30, 4) },
    { d: circle(60, 40, 4) },
    { d: circle(30, 50, 4) },
    { d: circle(70, 52, 4) },
    line("M6 94H94"),
  ],
};

export const PICTURES: Picture[] = [sun, house, fish, flower, apple, butterfly, star, balloon, iceCream, tree];

/** Draws a picture's line art onto a square canvas: opaque white paper with black outlines. */
export function drawPicture(ctx: CanvasRenderingContext2D, picture: Picture, size: number): void {
  ctx.save();
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, size, size);
  ctx.scale(size / 100, size / 100);
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#111";
  for (const shape of picture.shapes) {
    const path = new Path2D(shape.d);
    const fill = shape.fill ?? "white";
    if (fill !== "none") {
      ctx.fillStyle = fill === "black" ? "#111" : "#fff";
      ctx.fill(path);
    }
    ctx.stroke(path);
  }
  ctx.restore();
}
