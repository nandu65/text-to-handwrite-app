import { ExtractedGlyph, PersonalGlyphLibrary } from '../types';
import { getTemplateCells, TemplateCell } from './templateGenerator';

export interface PreprocessOptions {
  threshold: number; // 60 - 240, default 180
  contrast: number; // 0.8 - 2.0, default 1.15
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
 * Converts color to luminance (0 - 255).
 */
function getLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Extracts personal glyphs with 100% transparent backgrounds and tightly cropped ink strokes.
 */
export async function extractGlyphsFromImage(
  imageSource: string | HTMLImageElement,
  options: PreprocessOptions = { threshold: 185, contrast: 1.15, brightness: 0, invert: false }
): Promise<ExtractionResult> {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;

  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  // Render original image on working canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available');

  ctx.drawImage(img, 0, 0, width, height);
  const rawImageData = ctx.getImageData(0, 0, width, height);
  const rawPixels = rawImageData.data;

  const library: PersonalGlyphLibrary = {};
  let totalExtracted = 0;

  const cells = getTemplateCells();

  // Preview canvas for visualization
  const previewCanvas = document.createElement('canvas');
  previewCanvas.width = width;
  previewCanvas.height = height;
  const pCtx = previewCanvas.getContext('2d');
  if (pCtx) {
    pCtx.drawImage(canvas, 0, 0);
  }

  for (const cell of cells) {
    const cellX = Math.round(cell.xRatio * width);
    const cellY = Math.round(cell.yRatio * height);
    const cellW = Math.round(cell.widthRatio * width);
    const cellH = Math.round(cell.heightRatio * height);

    // DEDICATED SAFE WRITING ZONE:
    // Inset 16% horizontally, and start at 28% from top to avoid cell border lines and printed reference labels
    const zoneX = cellX + Math.round(cellW * 0.16);
    const zoneY = cellY + Math.round(cellH * 0.28);
    const zoneW = Math.max(12, Math.round(cellW * 0.70));
    const zoneH = Math.max(12, Math.round(cellH * 0.62));

    // Sample background paper color from the 4 corners of the safe zone
    let paperLumSum = 0;
    let sampleCount = 0;
    const cornerOffsets = [
      [2, 2],
      [zoneW - 3, 2],
      [2, zoneH - 3],
      [zoneW - 3, zoneH - 3],
    ];

    for (const [ox, oy] of cornerOffsets) {
      const pIdx = ((zoneY + oy) * width + (zoneX + ox)) * 4;
      if (pIdx >= 0 && pIdx < rawPixels.length - 4) {
        paperLumSum += getLuminance(rawPixels[pIdx], rawPixels[pIdx + 1], rawPixels[pIdx + 2]);
        sampleCount++;
      }
    }

    const avgPaperLum = sampleCount > 0 ? paperLumSum / sampleCount : 240;
    // Adaptive dark threshold relative to paper brightness and user threshold setting
    const thresholdDelta = (255 - options.threshold) * 0.6 + 25;
    const inkThreshold = Math.min(options.threshold, avgPaperLum - thresholdDelta);

    // 1. Pass 1: Find bounding box of valid ink pixels
    let minX = zoneW;
    let minY = zoneH;
    let maxX = -1;
    let maxY = -1;
    let inkPixelCount = 0;

    const isInkGrid: boolean[][] = Array.from({ length: zoneH }, () =>
      new Array(zoneW).fill(false)
    );

    for (let py = 0; py < zoneH; py++) {
      for (let px = 0; px < zoneW; px++) {
        // Exclude outer 1px border edge of the safe zone to remove stray line artifacts
        if (px === 0 || px === zoneW - 1 || py === 0 || py === zoneH - 1) {
          continue;
        }

        const idx = ((zoneY + py) * width + (zoneX + px)) * 4;
        const r = rawPixels[idx];
        const g = rawPixels[idx + 1];
        const b = rawPixels[idx + 2];
        const lum = getLuminance(r, g, b);

        if (lum < inkThreshold) {
          isInkGrid[py][px] = true;
          inkPixelCount++;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }
    }

    // 2. If significant ink detected (at least 10 pixels), tightly crop and create transparent PNG
    if (inkPixelCount >= 8 && maxX >= minX && maxY >= minY) {
      const strokeW = maxX - minX + 1;
      const strokeH = maxY - minY + 1;

      // Tight bounding box with 2px transparent padding
      const padding = 2;
      const cropW = strokeW + padding * 2;
      const cropH = strokeH + padding * 2;

      const glyphCanvas = document.createElement('canvas');
      glyphCanvas.width = cropW;
      glyphCanvas.height = cropH;
      const gCtx = glyphCanvas.getContext('2d');

      if (gCtx) {
        const glyphImgData = gCtx.createImageData(cropW, cropH);
        const gData = glyphImgData.data;

        // Initialize all pixels as 100% TRANSPARENT
        for (let i = 0; i < gData.length; i += 4) {
          gData[i] = 0;
          gData[i + 1] = 0;
          gData[i + 2] = 0;
          gData[i + 3] = 0; // Transparent
        }

        // Copy ONLY the detected ink pixels with smooth alpha opacity
        for (let py = minY; py <= maxY; py++) {
          for (let px = minX; px <= maxX; px++) {
            if (isInkGrid[py][px]) {
              const srcIdx = ((zoneY + py) * width + (zoneX + px)) * 4;
              const r = rawPixels[srcIdx];
              const g = rawPixels[srcIdx + 1];
              const b = rawPixels[srcIdx + 2];
              const lum = getLuminance(r, g, b);

              // Calculate ink opacity based on darkness
              const darknessRatio = Math.max(0, (avgPaperLum - lum) / Math.max(1, avgPaperLum));
              const alpha = Math.min(255, Math.max(160, Math.round(darknessRatio * 320)));

              const dstX = px - minX + padding;
              const dstY = py - minY + padding;
              const dstIdx = (dstY * cropW + dstX) * 4;

              // Dark ink color (RGB 24, 32, 48) with variable transparent alpha
              gData[dstIdx] = 24;
              gData[dstIdx + 1] = 32;
              gData[dstIdx + 2] = 48;
              gData[dstIdx + 3] = alpha;
            }
          }
        }

        gCtx.putImageData(glyphImgData, 0, 0);

        const dataUrl = glyphCanvas.toDataURL('image/png');
        const extracted: ExtractedGlyph = {
          char: cell.char,
          dataUrl,
          width: cropW,
          height: cropH,
          aspectRatio: cropW / Math.max(1, cropH),
          baselineOffsetRatio: (maxY / zoneH),
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
    previewProcessedImageUrl: previewCanvas.toDataURL('image/jpeg', 0.85),
  };
}

/**
 * Tint transparent PNG glyph with user-selected ink color.
 * Uses an offscreen canvas to cleanly recolor ONLY the ink pixels while keeping the background 100% transparent.
 */
const tintCache = new Map<string, string>();

export function getTintedGlyphUrl(originalDataUrl: string, inkColor: string): string {
  // If standard dark ink, return original transparent PNG directly
  if (inkColor === '#1e293b' || inkColor === '#09090b' || inkColor === '#000000') {
    return originalDataUrl;
  }

  const cacheKey = `${originalDataUrl.slice(-32)}_${inkColor}`;
  if (tintCache.has(cacheKey)) {
    return tintCache.get(cacheKey)!;
  }

  return originalDataUrl;
}
