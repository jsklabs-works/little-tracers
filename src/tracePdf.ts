import { jsPDF } from "jspdf";
import { midLineRatio } from "./trace";

const PAGE_WIDTH = 210;
const MARGIN = 15;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FIRST_ROW_Y = 40;
const ROW_PITCH = 34;
const ROWS = 7;
const CELLS_PER_ROW = 5;
const CELL_WIDTH = CONTENT_WIDTH / CELLS_PER_ROW;
/** Height of a capital letter in mm; the font size is derived from it (Helvetica cap height is ~0.716 em). */
const CAP_HEIGHT_MM = 20;
const FONT_SIZE_PT = CAP_HEIGHT_MM / 0.716 / 0.3528;
const FOOTER_TEXT = "Little Tracers (c) 2026 jsklabs-works. For personal and classroom use.";

/** How many dotted copies each row shows; the rest of the row is left blank for free writing. */
function tracedCells(row: number): number {
  if (row === 0) return CELLS_PER_ROW - 1;
  if (row < 4) return CELLS_PER_ROW;
  return 2;
}

function drawGuides(doc: jsPDF, y: number, char: string): void {
  const baseline = y + 28;
  const top = baseline - CAP_HEIGHT_MM;
  const mid = baseline - CAP_HEIGHT_MM * midLineRatio(char);
  doc.setLineWidth(0.25);
  doc.setDrawColor(150);
  doc.setLineDashPattern([], 0);
  doc.line(MARGIN, top, PAGE_WIDTH - MARGIN, top);
  doc.line(MARGIN, baseline, PAGE_WIDTH - MARGIN, baseline);
  doc.setDrawColor(190);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(MARGIN, mid, PAGE_WIDTH - MARGIN, mid);
  doc.setLineDashPattern([], 0);
}

function drawPage(doc: jsPDF, char: string): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text(`Trace the ${/\d/.test(char) ? "number" : "letter"} ${char}`, MARGIN, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text("Name:", PAGE_WIDTH - MARGIN - 70, 22);
  doc.setDrawColor(150);
  doc.setLineWidth(0.25);
  doc.line(PAGE_WIDTH - MARGIN - 56, 22, PAGE_WIDTH - MARGIN, 22);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(FONT_SIZE_PT);

  for (let row = 0; row < ROWS; row++) {
    const y = FIRST_ROW_Y + row * ROW_PITCH;
    const baseline = y + 28;
    drawGuides(doc, y, char);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(FONT_SIZE_PT);
    const traced = tracedCells(row);
    const firstTraced = row === 0 ? 1 : 0;

    if (row === 0) {
      doc.setTextColor(40);
      doc.text(char, MARGIN + CELL_WIDTH / 2, baseline, { align: "center" });
    }

    doc.setDrawColor(120);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([0.6, 1.4], 0);
    for (let cell = firstTraced; cell < firstTraced + traced && cell < CELLS_PER_ROW; cell++) {
      doc.text(char, MARGIN + cell * CELL_WIDTH + CELL_WIDTH / 2, baseline, {
        align: "center",
        renderingMode: "stroke",
      });
    }
    doc.setLineDashPattern([], 0);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(FOOTER_TEXT, PAGE_WIDTH / 2, 289, { align: "center" });
}

/** Builds a tracing worksheet with one page per character and returns it for saving. */
export function buildTracePdf(chars: string[]): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  chars.forEach((char, i) => {
    if (i > 0) doc.addPage();
    drawPage(doc, char);
  });
  return doc;
}

export function generateTracePdf(chars: string[], filename: string): void {
  buildTracePdf(chars).save(filename);
}
