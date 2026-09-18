import { ExtractedGlyph, PersonalGlyphLibrary } from '../types';
import { getTemplateCells, TemplateCell } from './templateGenerator';

export interface PreprocessOptions {
  threshold: number; // 60 - 240, default 185
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
 * Evaluates whether a pixel is considered handwriting ink given preprocessing options.
 */
export function evaluatePixelInk(
  r: number,
  g: number,
  b: number,
  options: PreprocessOptions
): { isInk: boolean; processedLum: number; alpha: number } {
  let gray = getLuminance(r, g, b);

  // Linear contrast scaling around midpoint 128
  const factor = Math.max(0.2, options.contrast);
  gray = (gray - 128) * factor + 128 + (options.brightness || 0);
  gray = Math.max(0, Math.min(255, gray));

  const threshold = options.threshold;
  const isInk = gray < threshold;

  // Compute smooth alpha based on darkness relative to threshold
  const darkness = Math.max(0, threshold - gray);
  const alphaRatio = Math.min(1, darkness / Math.max(1, threshold * 0.75));
  const alpha = Math.min(255, Math.max(140, Math.round(alphaRatio * 255)));

  return { isInk, processedLum: gray, alpha };
}

/**
 * Generates a real-time live preview canvas reflecting the current threshold & contrast sliders.
 */
export async function renderLivePreprocessPreview(
  imageSource: string | HTMLImageElement,
  targetCanvas: HTMLCanvasElement,
  options: PreprocessOptions,
  showGridZones: boolean = true
): Promise<{ detectedCount: number }> {
  const img = typeof imageSource === 'string' ? await loadImage(imageSource) : imageSource;
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  targetCanvas.width = width;
  targetCanvas.height = height;
  const ctx = targetCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return { detectedCount: 0 };

  // Draw base image
  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Apply contrast and thresholding to pixel data
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const { isInk, alpha } = evaluatePixelInk(r, g, b, options);

    if (isInk) {
      // Dark ink stroke preview
      data[i] = 24;
      data[i + 1] = 32;
      data[i + 2] = 52;
      data[i + 3] = 255;
    } else {
      // Pure white cleaned paper background
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  let detectedCount = 0;
  const cells = getTemplateCells();

  // Highlight detected character zones
  if (showGridZones) {
    for (const cell of cells) {
      const cellX = Math.round(cell.xRatio * width);
      const cellY = Math.round(cell.yRatio * height);
      const cellW = Math.round(cell.widthRatio * width);
      const cellH = Math.round(cell.heightRatio * height);

      const zoneX = cellX + Math.round(cellW * 0.16);
      const zoneY = cellY + Math.round(cellH * 0.28);
      const zoneW = Math.max(12, Math.round(cellW * 0.70));
      const zoneH = Math.max(12, Math.round(cellH * 0.62));

      // Quick check for dark pixels in this zone
      const zoneData = ctx.getImageData(zoneX, zoneY, zoneW, zoneH).data;
      let inkCount = 0;
      for (let j = 0; j < zoneData.length; j += 4) {
        if (zoneData[j] < 100) {
          inkCount++;
        }
      }

      if (inkCount >= 6) {
        detectedCount++;
        // Subtle green border around recognized writing zone
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(zoneX, zoneY, zoneW, zoneH);
      } else {
        // Gray subtle box
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(zoneX, zoneY, zoneW, zoneH);
      }
    }
  }

  return { detectedCount };
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

    // Inset safe writing zone to avoid cell borders and reference labels
    const zoneX = cellX + Math.round(cellW * 0.16);
    const zoneY = cellY + Math.round(cellH * 0.28);
    const zoneW = Math.max(12, Math.round(cellW * 0.70));
    const zoneH = Math.max(12, Math.round(cellH * 0.62));

    // 1. Pass 1: Find bounding box of valid ink pixels using the unified evaluator
    let minX = zoneW;
    let minY = zoneH;
    let maxX = -1;
    let maxY = -1;
    let inkPixelCount = 0;

    const isInkGrid: { isInk: boolean; alpha: number }[][] = Array.from({ length: zoneH }, () =>
      new Array(zoneW).fill({ isInk: false, alpha: 0 })
    );

    for (let py = 0; py < zoneH; py++) {
      for (let px = 0; px < zoneW; px++) {
        // Exclude outer 1px border edge of the safe zone
        if (px === 0 || px === zoneW - 1 || py === 0 || py === zoneH - 1) {
          continue;
        }

        const idx = ((zoneY + py) * width + (zoneX + px)) * 4;
        const r = rawPixels[idx];
        const g = rawPixels[idx + 1];
        const b = rawPixels[idx + 2];

        const { isInk, alpha } = evaluatePixelInk(r, g, b, options);

        if (isInk) {
          isInkGrid[py][px] = { isInk: true, alpha };
          inkPixelCount++;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
      }
    }

    // 2. If ink detected (at least 6 pixels), tightly crop and create transparent PNG
    if (inkPixelCount >= 6 && maxX >= minX && maxY >= minY) {
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
          gData[i + 3] = 0; // 100% Transparent
        }

        // Copy ONLY the detected ink pixels with smooth alpha opacity
        for (let py = minY; py <= maxY; py++) {
          for (let px = minX; px <= maxX; px++) {
            const cellPixel = isInkGrid[py][px];
            if (cellPixel && cellPixel.isInk) {
              const dstX = px - minX + padding;
              const dstY = py - minY + padding;
              const dstIdx = (dstY * cropW + dstX) * 4;

              // Dark ink color (RGB 24, 32, 48) with transparent alpha
              gData[dstIdx] = 24;
              gData[dstIdx + 1] = 32;
              gData[dstIdx + 2] = 48;
              gData[dstIdx + 3] = cellPixel.alpha;
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
          baselineOffsetRatio: maxY / zoneH,
          heightRatioInCell: strokeH / zoneH,
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

const tintCache = new Map<string, string>();

/**
 * Returns a tinted version of a glyph data URL matching the user's selected ink color.
 */
export function getTintedGlyphUrl(originalDataUrl: string, inkColor: string): string {
  if (!originalDataUrl) return originalDataUrl;
  if (!inkColor || inkColor === '#0f172a' || inkColor === '#1e293b' || inkColor === '#000000') {
    return originalDataUrl;
  }

  const cacheKey = `${originalDataUrl.slice(0, 40)}_${originalDataUrl.length}_${inkColor}`;
  if (tintCache.has(cacheKey)) {
    return tintCache.get(cacheKey)!;
  }

  // Pre-tint synchronously with an Image + Canvas if possible
  try {
    const img = new Image();
    img.src = originalDataUrl;
    if (img.complete && img.naturalWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = inkColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const tintedUrl = canvas.toDataURL('image/png');
        tintCache.set(cacheKey, tintedUrl);
        return tintedUrl;
      }
    }
  } catch (err) {
    // fallback to originalDataUrl
  }

  return originalDataUrl;
}
