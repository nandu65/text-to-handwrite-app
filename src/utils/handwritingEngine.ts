import { HandwritingStyle, FONT_OPTIONS, FontVariant, PersonalHandwritingProfile, ExtractedGlyph } from '../types';
import { getTintedGlyphUrl } from './glyphExtractor';

/**
 * Fast seeded pseudo-random number generator (Mulberry32).
 * Returns a deterministic float between 0 (inclusive) and 1 (exclusive).
 */
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic integer hash for any set of numbers / strings.
 */
export function hashValues(...args: (number | string)[]): number {
  let hash = 0x811c9dc5;
  for (const val of args) {
    const str = String(val);
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
  }
  return hash >>> 0;
}

export interface CharRenderProps {
  char: string;
  style: React.CSSProperties;
  key: string;
  glyphDataUrl?: string;
  glyphWidthPx?: number;
  glyphHeightPx?: number;
  isPersonalGlyph?: boolean;
}

export interface WordRenderProps {
  wordIndex: number;
  chars: CharRenderProps[];
  spaceWidthPx: number;
}

export interface LineRenderProps {
  lineIndex: number;
  words: WordRenderProps[];
  lineDriftAngleDeg: number;
  lineOffsetYPx: number;
}

/**
 * Finds available font variants for the active font family.
 */
function getActiveFontVariants(style: HandwritingStyle): FontVariant[] {
  const matched = FONT_OPTIONS.find((f) => f.fontFamily === style.fontFamily);
  if (matched && matched.variants && matched.variants.length > 0) {
    return matched.variants;
  }
  return [{ fontFamily: style.fontFamily, scale: 1.0, baselineShift: 0 }];
}

/**
 * Computes deterministic, natural handwriting transformation properties for a character.
 */
export function computeCharTransform(
  char: string,
  charIndexInWord: number,
  wordIndex: number,
  lineIndex: number,
  pageIndex: number,
  style: HandwritingStyle,
  charOccurrencesInLine: number,
  prevChar?: string,
  activeProfile?: PersonalHandwritingProfile | null
): { css: React.CSSProperties; glyph?: ExtractedGlyph; isPersonalGlyph: boolean; glyphWidthPx?: number; glyphHeightPx?: number } {
  const intensity = style.variationIntensity ?? 1.0;
  const seed = style.seed ?? 42;

  // Compute unique hash for this character occurrence
  const h = hashValues(seed, pageIndex, lineIndex, wordIndex, charIndexInWord, char);
  const rand = mulberry32(h);

  // Check if personal glyph exists
  let personalGlyph: ExtractedGlyph | undefined;
  if (style.usePersonalHandwriting && activeProfile && activeProfile.glyphs[char]) {
    const glyphVariants = activeProfile.glyphs[char];
    if (glyphVariants.length > 0) {
      // Deterministically pick variant
      const variantIdx = (charOccurrencesInLine + h) % glyphVariants.length;
      personalGlyph = glyphVariants[variantIdx] || glyphVariants[0];
    }
  }

  // Fallback font variant
  const variants = getActiveFontVariants(style);
  let selectedVariant: FontVariant = variants[0];

  const isLetter = /[a-zA-Z]/.test(char);
  const isDirectlyRepeated = prevChar && prevChar.toLowerCase() === char.toLowerCase();

  if (!personalGlyph && style.glyphVariation && isLetter && variants.length > 1) {
    if (isDirectlyRepeated) {
      const variantIdx = (h % (variants.length - 1)) + 1;
      selectedVariant = variants[variantIdx] || variants[1];
    } else if (charOccurrencesInLine > 0) {
      const variantIdx = (charOccurrencesInLine + h) % variants.length;
      selectedVariant = variants[variantIdx] || variants[0];
    }
  }

  if (!style.subtleVariation) {
    if (personalGlyph) {
      const targetHeight = style.fontSize * 1.15;
      const targetWidth = targetHeight * personalGlyph.aspectRatio;
      return {
        css: {
          display: 'inline-block',
          position: 'relative',
          verticalAlign: 'baseline',
        },
        glyph: personalGlyph,
        isPersonalGlyph: true,
        glyphWidthPx: targetWidth,
        glyphHeightPx: targetHeight,
      };
    }

    return {
      css: {
        display: 'inline-block',
        position: 'relative',
        fontFamily: selectedVariant.fontFamily,
        fontFeatureSettings: '"calt" 1, "liga" 1, "dlig" 1, "kern" 1',
        color: style.inkColor,
      },
      isPersonalGlyph: false,
    };
  }

  // 1. Rotation (subtle angle variation: e.g. -1.4deg to +1.4deg at 1.0 intensity)
  const rotRange = 1.4 * intensity;
  const rotateDeg = (rand() * 2 - 1) * rotRange;

  // 2. Baseline & vertical jitter
  const dyRange = 0.7 * intensity;
  let dy = (rand() * 2 - 1) * dyRange + (selectedVariant.baselineShift || 0);

  // 3. Horizontal offset
  const dxRange = 0.4 * intensity;
  const dx = (rand() * 2 - 1) * dxRange;

  // 4. Width and Height scale
  const scaleVar = 0.04 * intensity;
  const baseScale = selectedVariant.scale || 1.0;
  const scaleX = baseScale * (1 + (rand() * 2 - 1) * scaleVar);
  const scaleY = baseScale * (1 + (rand() * 2 - 1) * scaleVar);

  // 5. Skew
  const skewRange = 1.2 * intensity;
  const skewX = (rand() * 2 - 1) * skewRange;

  // 6. Stroke Weight / Pressure variation
  let weight = 400;
  if (isDirectlyRepeated) {
    dy += (rand() > 0.5 ? 0.5 : -0.5) * intensity;
    weight = rand() > 0.5 ? 500 : 300;
  } else {
    const wRand = rand();
    if (wRand > 0.82) weight = 500;
    else if (wRand < 0.18) weight = 300;
  }

  // 7. Dynamic ink density
  const opacityJitter = 1 - (rand() * 0.07 * intensity);
  const inkOpacity = Math.max(0.85, Math.min(1.0, (style.inkOpacity || 0.95) * opacityJitter));

  // 8. Individual letter spacing variance
  const letterSpacingDelta = (rand() * 2 - 1) * 0.3 * intensity;

  if (personalGlyph) {
    const targetHeight = style.fontSize * 1.15 * scaleY;
    const targetWidth = targetHeight * personalGlyph.aspectRatio * scaleX;

    return {
      css: {
        display: 'inline-block',
        position: 'relative',
        verticalAlign: 'baseline',
        transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rotateDeg.toFixed(2)}deg) skewX(${skewX.toFixed(2)}deg)`,
        transformOrigin: '50% 80%',
        opacity: inkOpacity,
        marginRight: `${letterSpacingDelta.toFixed(2)}px`,
      },
      glyph: personalGlyph,
      isPersonalGlyph: true,
      glyphWidthPx: targetWidth,
      glyphHeightPx: targetHeight,
    };
  }

  return {
    css: {
      display: 'inline-block',
      position: 'relative',
      fontFamily: selectedVariant.fontFamily,
      color: style.inkColor,
      transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rotateDeg.toFixed(2)}deg) skewX(${skewX.toFixed(2)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`,
      transformOrigin: '50% 80%',
      fontWeight: weight,
      opacity: inkOpacity,
      marginRight: `${letterSpacingDelta.toFixed(2)}px`,
      fontFeatureSettings: '"calt" 1, "liga" 1, "dlig" 1, "kern" 1, "ss01" 1',
      WebkitFontSmoothing: 'antialiased',
    },
    isPersonalGlyph: false,
  };
}

/**
 * Processes a line of text into words and individual characters with natural human handwriting variance.
 */
export function processHandwrittenLine(
  lineText: string,
  lineIndex: number,
  pageIndex: number,
  style: HandwritingStyle,
  activeProfile?: PersonalHandwritingProfile | null
): LineRenderProps {
  const intensity = style.variationIntensity ?? 1.0;
  const seed = style.seed ?? 42;

  // Line-level drift & slant calculation
  let lineDriftAngleDeg = 0;
  let lineOffsetYPx = 0;

  if (style.lineDrift && style.subtleVariation) {
    const lineHash = hashValues(seed, pageIndex, lineIndex, 'line-drift');
    const lineRand = mulberry32(lineHash);
    lineDriftAngleDeg = (lineRand() * 2 - 1) * 0.22 * intensity;
    lineOffsetYPx = (lineRand() * 2 - 1) * 0.6 * intensity;
  }

  const rawWords = lineText.split(' ');
  const words: WordRenderProps[] = [];

  // Track character occurrence counts across the line
  const charOccurrences = new Map<string, number>();

  for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
    const word = rawWords[wIdx];
    const wordHash = hashValues(seed, pageIndex, lineIndex, wIdx, 'word');
    const wordRand = mulberry32(wordHash);

    // Natural word space width
    const baseSpacePx = style.fontSize * 0.3;
    const spaceVarPx = style.wordSpacingVariation && style.subtleVariation
      ? (wordRand() * 2 - 1) * (style.fontSize * 0.07) * intensity
      : 0;
    const spaceWidthPx = Math.max(5, baseSpacePx + spaceVarPx);

    const chars: CharRenderProps[] = [];
    let prevChar = '';

    for (let cIdx = 0; cIdx < word.length; cIdx++) {
      const char = word[cIdx];
      const charLower = char.toLowerCase();
      const occurrenceCount = charOccurrences.get(charLower) || 0;
      charOccurrences.set(charLower, occurrenceCount + 1);

      const { css, glyph, isPersonalGlyph, glyphWidthPx, glyphHeightPx } = computeCharTransform(
        char,
        cIdx,
        wIdx,
        lineIndex,
        pageIndex,
        style,
        occurrenceCount,
        prevChar,
        activeProfile
      );

      const glyphDataUrl = glyph ? getTintedGlyphUrl(glyph.dataUrl, style.inkColor) : undefined;

      chars.push({
        char,
        style: css,
        key: `c-${pageIndex}-${lineIndex}-${wIdx}-${cIdx}-${char}-${occurrenceCount}`,
        glyphDataUrl,
        glyphWidthPx,
        glyphHeightPx,
        isPersonalGlyph,
      });

      prevChar = char;
    }

    words.push({
      wordIndex: wIdx,
      chars,
      spaceWidthPx,
    });
  }

  return {
    lineIndex,
    words,
    lineDriftAngleDeg,
    lineOffsetYPx,
  };
}
