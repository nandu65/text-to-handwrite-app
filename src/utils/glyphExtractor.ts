import { ExtractedGlyph, PersonalGlyphLibrary } from '../types';
import { getTemplateCells, TemplateCell } from './templateGenerator';

export interface PreprocessOptions {
  threshold: number; // 50 - 240, default ~185
  contrast: number; // 0.5 - 2.0, default 1.2
  brightness: number; // -50 - 50, default 0
  invert: boolean;
}

export interface ExtractionResult {
  library: PersonalGlyphLibrary;
  totalExtracted: number;
  previewProcessedImageUrl: string;
}

/**
 * Loads an image from a URL or File into an HTMLImageElement.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Preprocesses the image on canvas (grayscale, contrast, thresholding).
 */
export function preprocessCanvas(
  sourceCanvas: HTMLCanvasElement,
  options: PreprocessOptions
): HTMLCanvasElement {
  const { width, height } = sourceCanvas;
  const processedCanvas = document.createElement('canvas');
  processedCanvas.width = width;
  processedCanvas.height = height;
  const ctx = processedCanvas.getContext('2d');
  if (!ctx) return sourceCanvas;

  ctx.drawImage(sourceCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const { threshold, contrast, brightness } = options;
  const contrastFactor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 1. Grayscale (Luminance)
    let gray = 0.299 * r + 0.587 * g + 0.114 * b;

    // 2. Brightness & Contrast
    gray = contrastFactor * (gray - 128) + 128 + brightness;
    gray = Math.max(0, Math.min(255, gray));

    // 3. Thresholding: dark ink vs white background
    const isInk = gray < threshold;

    if (isInk) {
      // Retain ink darkness smoothly with alpha
      const inkAlpha = Math.min(255, Math.max(140, 255 - gray));
      data[i] = 20; // dark ink RGB
      data[i + 1] = 20;
      data[i + 2] = 20;
      data[i + 3] = inkAlpha;
    } else {
      // Pure transparent white background
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 0; // Transparent
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return processedCanvas;
}

/**
 * Extracts personal glyphs from the preprocessed canvas using the template grid definitions.
 */
export async function extractGlyphsFromImage(
  imageSource: string | HTMLImageElement,
  options: PreprocessOptions = { threshold: 190, contrast: 1.1, brightness: 0, invert: false }
): Promise<ExtractionResult> {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;

  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = img.width;
  baseCanvas.height = img.height;
  const baseCtx = baseCanvas.getContext('2d');
  if (!baseCtx) throw new Error('Canvas context not available');
  baseCtx.drawImage(img, 0, 0);

  const processedCanvas = preprocessCanvas(baseCanvas, options);
  const pCtx = processedCanvas.getContext('2d');
  if (!pCtx) throw new Error('Processed canvas context not available');

  const library: PersonalGlyphLibrary = {};
  let totalExtracted = 0;

  const cells = getTemplateCells();
  const imgW = processedCanvas.width;
  const imgH = processedCanvas.height;

  for (const cell of cells) {
    // Map cell normalized ratios to actual image pixels
    const cellX = Math.round(cell.xRatio * imgW);
    const cellY = Math.round(cell.yRatio * imgH);
    const cellW = Math.round(cell.widthRatio * imgW);
    const cellH = Math.round(cell.heightRatio * imgH);

    // Inner region ignoring cell borders and top-left reference text
    const innerX = cellX + Math.round(cellW * 0.12);
    const innerY = cellY + Math.round(cellH * 0.22);
    const innerW = Math.max(10, cellW - Math.round(cellW * 0.24));
    const innerH = Math.max(10, cellH - Math.round(cellH * 0.32));

    const cellData = pCtx.getImageData(innerX, innerY, innerW, innerH);
    const pixels = cellData.data;

    // Find bounding box of non-transparent ink pixels
    let minX = innerW;
    let minY = innerH;
    let maxX = 0;
    let maxY = 0;
    let inkPixelCount = 0;

    for (let py = 0; py < innerH; py++) {
      for (let px = 0; px < innerW; px++) {
        const idx = (py * innerW + px) * 4;
        const alpha = pixels[idx + 3];
        if (alpha > 40) {
          inkPixelCount++;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }
    }

    // If significant ink detected (at least ~15 pixels for small punctuation or letters)
    if (inkPixelCount >= 12 && maxX >= minX && maxY >= minY) {
      const glyphW = maxX - minX + 1;
      const glyphH = maxY - minY + 1;

      // Crop to separate canvas with 2px padding
      const padding = 2;
      const glyphCanvas = document.createElement('canvas');
      glyphCanvas.width = glyphW + padding * 2;
      glyphCanvas.height = glyphH + padding * 2;
      const gCtx = glyphCanvas.getContext('2d');

      if (gCtx) {
        gCtx.drawImage(
          processedCanvas,
          innerX + minX,
          innerY + minY,
          glyphW,
          glyphH,
          padding,
          padding,
          glyphW,
          glyphH
        );

        const dataUrl = glyphCanvas.toDataURL('image/png');
        const extracted: ExtractedGlyph = {
          char: cell.char,
          dataUrl,
          width: glyphCanvas.width,
          height: glyphCanvas.height,
          aspectRatio: glyphCanvas.width / Math.max(1, glyphCanvas.height),
          baselineOffsetRatio: (maxY / innerH), // baseline metric
        };

        if (!library[cell.char]) {
          library[cell.char] = [];
        }
        library[cell.char].push(extracted);
        totalExtracted++;
      }
    }
  }

  return {
    library,
    totalExtracted,
    previewProcessedImageUrl: processedCanvas.toDataURL('image/jpeg', 0.85),
  };
}

export function getTintedGlyphUrl(originalDataUrl: string, inkColor: string): string {
  // Return the original high-resolution transparent PNG data URL directly
  return originalDataUrl;
}
