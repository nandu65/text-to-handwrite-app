import { PageDimensions, HandwritingStyle, PersonalHandwritingProfile, FONT_OPTIONS } from '../types';

export const MM_TO_PX = 3.7795275591; // 1 mm in standard 96 DPI CSS pixels

export interface PageLayout {
  widthPx: number;
  heightPx: number;
  marginTopPx: number;
  marginLeftPx: number;
  marginRightPx: number;
  marginBottomPx: number;
  printableWidthPx: number;
  printableHeightPx: number;
  lineHeightPx: number;
  maxLinesPerPage: number;
}

export function calculateLayout(
  dimensions: PageDimensions,
  style: HandwritingStyle
): PageLayout {
  const widthPx = Math.round(dimensions.widthMm * MM_TO_PX);
  const heightPx = Math.round(dimensions.heightMm * MM_TO_PX);

  const marginTopPx = Math.round(style.marginTopMm * MM_TO_PX);
  const marginLeftPx = Math.round(style.marginLeftMm * MM_TO_PX);
  const marginRightPx = Math.round(style.marginRightMm * MM_TO_PX);
  const marginBottomPx = Math.round(style.marginBottomMm * MM_TO_PX);

  // Use full available line width between left and right margins
  const printableWidthPx = Math.max(80, widthPx - marginLeftPx - marginRightPx);
  const printableHeightPx = Math.max(80, heightPx - marginTopPx - marginBottomPx);

  const lineHeightPx = Math.round(style.fontSize * style.lineSpacing);
  const maxLinesPerPage = Math.max(1, Math.floor(printableHeightPx / lineHeightPx));

  return {
    widthPx,
    heightPx,
    marginTopPx,
    marginLeftPx,
    marginRightPx,
    marginBottomPx,
    printableWidthPx,
    printableHeightPx,
    lineHeightPx,
    maxLinesPerPage,
  };
}

let measureCanvas: HTMLCanvasElement | null = null;

function getTextWidth(text: string, font: string): number {
  if (typeof window === 'undefined') return text.length * 12;
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
  }
  const ctx = measureCanvas.getContext('2d');
  if (!ctx) return text.length * 12;
  ctx.font = font;
  return ctx.measureText(text).width;
}

export function stripFormattingTokens(text: string): string {
  return text
    .replace(/~~(.*?)~~/g, '$1')
    .replace(/==(.*?)==/g, '$1')
    .replace(/\(\((.*?)\)\)/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\[x\]|\[X\]/g, '✓')
    .replace(/\[ \]|\[\]/g, '◻')
    .replace(/-->|->/g, '→')
    .replace(/==>|=>/g, '⇒');
}

/**
 * Accurately measures the true rendered width of text for both Personal Glyphs and Built-in Cursive Fonts.
 */
export function measureTextLineWidth(
  rawText: string,
  style: HandwritingStyle,
  activeProfile?: PersonalHandwritingProfile | null
): number {
  const cleanFontFamily = (style.fontFamily || 'cursive').replace(/'/g, '"');
  const fontSpec = `${style.fontSize}px ${cleanFontFamily}`;
  const wordSpacingMultiplier = style.wordSpacing ?? 1.0;
  const sentenceSpacingMultiplier = style.sentenceSpacing ?? 1.0;
  const baseSpacePx = style.fontSize * 0.28 * wordSpacingMultiplier;
  const userLetterSpacing = style.letterSpacing ?? 0;

  // 1. Personal Glyph Library Measurement
  if (style.usePersonalHandwriting && activeProfile && activeProfile.glyphs) {
    let totalW = 0;
    const cellHeightPx = style.fontSize * 1.30;
    const cleanText = stripFormattingTokens(rawText);

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      if (char === ' ') {
        const prevChar = i > 0 ? cleanText[i - 1] : '';
        const isSentenceEnd = /[.!?:]/.test(prevChar);
        totalW += isSentenceEnd ? baseSpacePx * sentenceSpacingMultiplier : baseSpacePx;
        continue;
      }

      const glyphList = activeProfile.glyphs[char];
      if (glyphList && glyphList.length > 0) {
        const glyph = glyphList[0];
        let relHeight = glyph.heightRatioInCell;
        if (!relHeight || relHeight <= 0) {
          if (char === '.' || char === ',') relHeight = 0.20;
          else if (char === '-' || char === '_') relHeight = 0.15;
          else if (/[!?:;'"()/@#+]/.test(char)) relHeight = 0.55;
          else if (/[acegmnopqrsuvwxyz]/.test(char)) relHeight = 0.50;
          else if (/[bdfhkltA-Z0-9]/.test(char)) relHeight = 0.80;
          else relHeight = 0.65;
        }
        const targetHeight = Math.max(4, cellHeightPx * relHeight);
        const computedGlyphW = targetHeight * (glyph.aspectRatio || 0.75);
        totalW += computedGlyphW + userLetterSpacing;
      } else {
        const fontW = getTextWidth(char, fontSpec) || style.fontSize * 0.40;
        totalW += fontW + userLetterSpacing;
      }
    }
    return totalW;
  }

  // 2. Built-in Cursive Font Word-by-Word & Character Measurement
  let totalW = 0;
  const words = rawText.split(' ');

  for (let wIdx = 0; wIdx < words.length; wIdx++) {
    const rawWord = words[wIdx];
    if (!rawWord) continue;

    if (wIdx > 0) {
      const prevWord = words[wIdx - 1];
      const isSentenceEnd = /[.!?:]['"]?$/.test(prevWord);
      totalW += isSentenceEnd ? baseSpacePx * sentenceSpacingMultiplier : baseSpacePx;
    }

    // Checkbox Tokens
    if (rawWord === '[x]' || rawWord === '[X]' || rawWord === '[ ]' || rawWord === '[]') {
      totalW += style.fontSize * 0.85 + 6;
      continue;
    }

    // Arrow Tokens
    if (rawWord === '->' || rawWord === '-->' || rawWord === '=>' || rawWord === '==>') {
      totalW += style.fontSize * 0.75 + 4;
      continue;
    }

    const cleanWord = stripFormattingTokens(rawWord);

    for (let cIdx = 0; cIdx < cleanWord.length; cIdx++) {
      const char = cleanWord[cIdx];
      let measuredCharW = getTextWidth(char, fontSpec);
      if (measuredCharW <= 0) {
        measuredCharW = style.fontSize * (/[A-Z0-9]/.test(char) ? 0.48 : 0.36);
      }
      totalW += measuredCharW + userLetterSpacing;
    }
  }

  return totalW;
}

/**
 * Splits input text into visual wrapped lines and groups them into pages.
 */
export function paginateText(
  rawText: string,
  layout: PageLayout,
  style: HandwritingStyle,
  activeProfile?: PersonalHandwritingProfile | null
): string[][] {
  const paragraphs = rawText.split('\n');
  const allWrappedLines: string[] = [];

  const paraIndentPx = style.paragraphIndent ?? 0;
  const extraParaSpacing = style.paragraphSpacing ?? 0;
  const extraSectionSpacing = style.sectionSpacing ?? 0;
  const maxAllowedWidth = layout.printableWidthPx;

  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const para = paragraphs[pIdx];
    if (para.trim() === '') {
      allWrappedLines.push('');
      continue;
    }

    // Section spacing before headings
    const isSectionHeading = para.trim().startsWith('__') || para.trim().startsWith('#');
    if (pIdx > 0 && isSectionHeading && extraSectionSpacing > 0) {
      for (let s = 0; s < extraSectionSpacing; s++) {
        allWrappedLines.push('');
      }
    }

    const words = para.split(' ');
    let currentLine = '';
    let isFirstLineInPara = true;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!word) continue;

      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const availableWidth = isFirstLineInPara
        ? maxAllowedWidth - paraIndentPx
        : maxAllowedWidth;

      const testWidth = measureTextLineWidth(testLine, style, activeProfile);

      if (testWidth <= availableWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          allWrappedLines.push(currentLine);
          currentLine = word;
          isFirstLineInPara = false;
        } else {
          // Word itself is wider than line -> break it up
          let partialWord = '';
          for (const char of word) {
            if (measureTextLineWidth(partialWord + char, style, activeProfile) <= availableWidth) {
              partialWord += char;
            } else {
              allWrappedLines.push(partialWord);
              partialWord = char;
              isFirstLineInPara = false;
            }
          }
          currentLine = partialWord;
        }
      }
    }

    if (currentLine) {
      allWrappedLines.push(currentLine);
    }

    // Extra paragraph spacing
    if (extraParaSpacing > 0 && pIdx < paragraphs.length - 1 && para.trim() !== '') {
      for (let ep = 0; ep < extraParaSpacing; ep++) {
        allWrappedLines.push('');
      }
    }
  }

  // Ensure at least 1 page
  if (allWrappedLines.length === 0) {
    return [['']];
  }

  // Group into pages
  const pages: string[][] = [];
  const linesPerPage = layout.maxLinesPerPage;

  for (let i = 0; i < allWrappedLines.length; i += linesPerPage) {
    pages.push(allWrappedLines.slice(i, i + linesPerPage));
  }

  return pages.length > 0 ? pages : [['']];
}
