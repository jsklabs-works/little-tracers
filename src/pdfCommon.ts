import type { jsPDF } from "jspdf";

export const PAGE_WIDTH = 210;
export const MARGIN = 15;
export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_TEXT = "Little Tracers (c) 2026 jsklabs-works. For personal and classroom use.";

/** Title on the left and a "Name: ____" line on the right, with an optional hint under the title. */
export function drawHeader(doc: jsPDF, title: string, hint?: string): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30);
  doc.text(title, MARGIN, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text("Name:", PAGE_WIDTH - MARGIN - 70, 22);
  doc.setDrawColor(150);
  doc.setLineWidth(0.25);
  doc.line(PAGE_WIDTH - MARGIN - 56, 22, PAGE_WIDTH - MARGIN, 22);
  if (hint) {
    doc.setFontSize(10);
    doc.text(hint, MARGIN, 29);
  }
}

export function drawFooter(doc: jsPDF): void {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text(FOOTER_TEXT, PAGE_WIDTH / 2, 289, { align: "center" });
}
