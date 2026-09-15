/**
 * Structured Template Layout and Generator for Handwrite Studio.
 */

export interface TemplateCell {
  char: string;
  variantIndex: number;
  row: number;
  col: number;
  xRatio: number;
  yRatio: number;
  widthRatio: number;
  heightRatio: number;
}

export const TEMPLATE_ROWS = [
  // Row 0: Uppercase A-M (13)
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'],
  // Row 1: Uppercase N-Z (13)
  ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  // Row 2: Lowercase a-m (13)
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'],
  // Row 3: Lowercase n-z (13)
  ['n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  // Row 4: Digits 0-9 (10) + common symbols
  ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', ',', '!'],
  // Row 5: Punctuation (13)
  ['?', ':', ';', "'", '"', '-', '(', ')', '&', '/', '@', '#', '+'],
  // Row 6: Alternate variants for high-frequency letters (10)
  ['a', 'e', 'l', 't', 'r', 's', 'o', 'd', 'm', 'n', 'c', 'h', 'p'],
];

export const TEMPLATE_METRICS = {
  width: 1400,
  height: 1000,
  headerHeight: 120,
  footerHeight: 60,
  marginHorizontal: 60,
  marginVertical: 40,
  numRows: TEMPLATE_ROWS.length,
  maxCols: 13,
};

/**
 * Calculates normalized bounding box ratios for all template character cells.
 */
export function getTemplateCells(): TemplateCell[] {
  const { width, height, headerHeight, footerHeight, marginHorizontal, numRows } = TEMPLATE_METRICS;
  const gridWidth = width - marginHorizontal * 2;
  const gridHeight = height - headerHeight - footerHeight;
  const cellHeight = gridHeight / numRows;

  const cells: TemplateCell[] = [];

  for (let r = 0; r < numRows; r++) {
    const rowChars = TEMPLATE_ROWS[r];
    const numColsInRow = rowChars.length;
    const cellWidth = gridWidth / numColsInRow;

    for (let c = 0; c < numColsInRow; c++) {
      const char = rowChars[c];
      const isVariantRow = r === 6;
      const variantIndex = isVariantRow ? 1 : 0;

      const x = marginHorizontal + c * cellWidth;
      const y = headerHeight + r * cellHeight;

      cells.push({
        char,
        variantIndex,
        row: r,
        col: c,
        xRatio: x / width,
        yRatio: y / height,
        widthRatio: cellWidth / width,
        heightRatio: cellHeight / height,
      });
    }
  }

  return cells;
}

/**
 * Generates the clean printable template sheet as a Data URL PNG.
 */
export function generatePrintableTemplate(): string {
  const canvas = document.createElement('canvas');
  canvas.width = TEMPLATE_METRICS.width;
  canvas.height = TEMPLATE_METRICS.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Header Title & Instructions
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('Handwrite Studio — Personal Handwriting Calibration Sheet', 60, 50);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px sans-serif';
  ctx.fillText(
    'Instructions: Neatly write each indicated letter inside its box below with a dark pen, then upload a scan or clear photo.',
    60,
    85
  );

  // Border alignment markers (corner crosshairs for automatic alignment)
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  // Top-left
  ctx.strokeRect(30, 30, 20, 20);
  // Top-right
  ctx.strokeRect(canvas.width - 50, 30, 20, 20);
  // Bottom-left
  ctx.strokeRect(30, canvas.height - 50, 20, 20);
  // Bottom-right
  ctx.strokeRect(canvas.width - 50, canvas.height - 50, 20, 20);

  const cells = getTemplateCells();
  const { width, height } = TEMPLATE_METRICS;

  for (const cell of cells) {
    const x = cell.xRatio * width;
    const y = cell.yRatio * height;
    const w = cell.widthRatio * width;
    const h = cell.heightRatio * height;

    // Cell Box
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    // Baseline guide line
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x + 10, y + h - 22);
    ctx.lineTo(x + w - 10, y + h - 22);
    ctx.stroke();
    ctx.setLineDash([]);

    // Reference character label (top left of cell)
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px sans-serif';
    const label = cell.row === 6 ? `${cell.char} (alt)` : cell.char;
    ctx.fillText(label, x + 10, y + 24);
  }

  // Footer
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px sans-serif';
  ctx.fillText('Handwrite Studio MVP Template • Structured Grid Calibration', 60, canvas.height - 20);

  return canvas.toDataURL('image/png');
}

/**
 * Generates a realistic synthetic handwritten sample sheet for immediate live testing.
 */
export function generateDemoSampleSheet(fontFamily: string = "'Caveat', cursive"): string {
  const canvas = document.createElement('canvas');
  canvas.width = TEMPLATE_METRICS.width;
  canvas.height = TEMPLATE_METRICS.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Draw base template
  const baseImg = new Image();
  baseImg.src = generatePrintableTemplate();

  // Draw background
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cells = getTemplateCells();
  const { width, height } = TEMPLATE_METRICS;

  for (const cell of cells) {
    const x = cell.xRatio * width;
    const y = cell.yRatio * height;
    const w = cell.widthRatio * width;
    const h = cell.heightRatio * height;

    // Cell border
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);

    // Label
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 15px sans-serif';
    const label = cell.row === 6 ? `${cell.char} (alt)` : cell.char;
    ctx.fillText(label, x + 10, y + 24);

    // Draw simulated handwriting in center
    ctx.save();
    ctx.fillStyle = '#1e3a8a'; // Realistic dark blue ink
    ctx.font = `44px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // Slight organic jitter
    const jx = (Math.sin(cell.row * 10 + cell.col) * 2);
    const jy = (Math.cos(cell.row * 5 + cell.col) * 1.5);
    const rot = (Math.sin(cell.row + cell.col * 3) * 0.04);

    ctx.translate(x + w / 2 + jx, y + h * 0.72 + jy);
    ctx.rotate(rot);
    ctx.fillText(cell.char, 0, 0);
    ctx.restore();
  }

  return canvas.toDataURL('image/png');
}
