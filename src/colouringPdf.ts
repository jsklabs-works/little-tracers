import { jsPDF } from "jspdf";
import { CONTENT_WIDTH, MARGIN, drawFooter, drawHeader } from "./pdfCommon";
import { drawPicture, type Picture } from "./pictures";

const IMAGE_PIXELS = 1400;

function pictureImage(picture: Picture): string {
  const canvas = document.createElement("canvas");
  canvas.width = IMAGE_PIXELS;
  canvas.height = IMAGE_PIXELS;
  const ctx = canvas.getContext("2d");
  if (ctx) drawPicture(ctx, picture, IMAGE_PIXELS);
  return canvas.toDataURL("image/png");
}

export function generateColouringPdf(pictures: Picture[], filename: string): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  pictures.forEach((picture, i) => {
    if (i > 0) doc.addPage();
    drawHeader(doc, `Colour the ${picture.label.toLowerCase()}`, "Colour inside the lines. Hold your crayon with a tripod grip.");
    const size = CONTENT_WIDTH;
    doc.addImage(pictureImage(picture), "PNG", MARGIN, 40, size, size);
    drawFooter(doc);
  });
  doc.save(filename);
}
