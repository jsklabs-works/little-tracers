import { jsPDF } from "jspdf";
import { CONTENT_WIDTH, MARGIN, drawFooter, drawHeader } from "./pdfCommon";
import { PAGE_GRID, isClosed, layoutPattern, type Pattern, type Stroke } from "./patterns";

const TOP = 36;
const HEIGHT = 240;

function drawStroke(doc: jsPDF, stroke: Stroke): void {
  const deltas = stroke.slice(1).map((p, i) => [p.x - stroke[i].x, p.y - stroke[i].y]);
  doc.lines(deltas, stroke[0].x, stroke[0].y, [1, 1], "S", false);
}

function drawPage(doc: jsPDF, pattern: Pattern): void {
  drawHeader(doc, `Trace the ${pattern.label.toLowerCase()}`, "Start at the green dot and stop at the red dot. Hold your pencil with a tripod grip.");

  const { cols, rows } = PAGE_GRID[pattern.kind];
  const strokes = layoutPattern(pattern, { x: MARGIN, y: TOP, w: CONTENT_WIDTH, h: HEIGHT }, cols, rows);

  doc.setLineCap("round");
  doc.setLineJoin("round");
  doc.setDrawColor(110);
  doc.setLineWidth(0.6);
  doc.setLineDashPattern([0.1, 1.6], 0);
  for (const stroke of strokes) drawStroke(doc, stroke);
  doc.setLineDashPattern([], 0);

  for (const stroke of strokes) {
    const start = stroke[0];
    const end = stroke[stroke.length - 1];
    doc.setFillColor(34, 160, 80);
    doc.circle(start.x, start.y, 1.8, "F");
    if (!isClosed(stroke)) {
      doc.setFillColor(220, 60, 60);
      doc.circle(end.x, end.y, 1.4, "F");
    }
  }

  drawFooter(doc);
}

export function buildPatternPdf(patterns: Pattern[]): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  patterns.forEach((pattern, i) => {
    if (i > 0) doc.addPage();
    drawPage(doc, pattern);
  });
  return doc;
}

export function generatePatternPdf(patterns: Pattern[], filename: string): void {
  buildPatternPdf(patterns).save(filename);
}
