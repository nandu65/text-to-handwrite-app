import { HandwritingStyle } from '../types';

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
 * Computes deterministic, natural handwriting transformation properties for a character.
 */
export function computeCharTransform(
  char: string,
  charIndexInWord: number,
  wordIndex: number,
  lineIndex: number,
  pageIndex: number,
  style: HandwritingStyle,
  prevChar?: string
): React.CSSProperties {
  if (!style.subtleVariation) {
    return {
      display: 'inline-block',
      position: 'relative',
    };
  }

  const intensity = style.variationIntensity ?? 1.0;
  const seed = style.seed ?? 42;

  // Compute unique hash for this character occurrence
  const h = hashValues(seed, pageIndex, lineIndex, wordIndex, charIndexInWord, char);
  const rand = mulberry32(h);

  // 1. Rotation (slight angle variation, e.g. -1.5deg to +1.5deg at 1.0 intensity)
  const rotRange = 1.6 * intensity;
  const rotateDeg = (rand() * 2 - 1) * rotRange;

  // 2. Baseline & vertical jitter (slight up/down, -0.9px to +0.8px)
  const dyRange = 0.9 * intensity;
  let dy = (rand() * 2 - 1) * dyRange;

  // 3. Horizontal offset (micro-shift)
  const dxRange = 0.5 * intensity;
  const dx = (rand() * 2 - 1) * dxRange;

  // 4. Width and Height scale (scaleX 0.96-1.04, scaleY 0.96-1.04)
  const scaleVar = 0.045 * intensity;
  const scaleX = 1 + (rand() * 2 - 1) * scaleVar;
  const scaleY = 1 + (rand() * 2 - 1) * scaleVar;

  // 5. Skew (natural slant variations from pen grip)
  const skewRange = 1.4 * intensity;
  const skewX = (rand() * 2 - 1) * skewRange;

  // 6. Repeated character variant handling (e.g. 'll', 'ee', 'oo', 'tt')
  const isRepeated = prevChar && prevChar.toLowerCase() === char.toLowerCase();
  let weight = 400;
  if (isRepeated) {
    // Alternate weight, vertical anchor, and slant for the second repeated letter
    dy += (rand() > 0.5 ? 0.6 : -0.6) * intensity;
    weight = rand() > 0.5 ? 500 : 300;
  } else {
    // Subtle font-weight variation across characters
    const wRand = rand();
    if (wRand > 0.85) weight = 500;
    else if (wRand < 0.15) weight = 400;
  }

  // 7. Dynamic ink density (slight opacity and subtle text shadow to mimic pen pressure)
  const opacityJitter = 1 - (rand() * 0.08 * intensity);
  const inkOpacity = Math.max(0.82, Math.min(1.0, (style.inkOpacity || 0.95) * opacityJitter));

  // 8. Individual letter spacing variance
  const letterSpacingDelta = (rand() * 2 - 1) * 0.35 * intensity;

  return {
    display: 'inline-block',
    position: 'relative',
    transform: `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0) rotate(${rotateDeg.toFixed(2)}deg) skewX(${skewX.toFixed(2)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`,
    transformOrigin: '50% 85%',
    fontWeight: weight,
    opacity: inkOpacity,
    marginRight: `${letterSpacingDelta.toFixed(2)}px`,
    fontFeatureSettings: '"calt" 1, "liga" 1, "dlig" 1, "kern" 1',
    WebkitFontSmoothing: 'antialiased',
  };
}

/**
 * Processes a line of text into words and individual characters with natural human handwriting variance.
 */
export function processHandwrittenLine(
  lineText: string,
  lineIndex: number,
  pageIndex: number,
  style: HandwritingStyle
): LineRenderProps {
  const intensity = style.variationIntensity ?? 1.0;
  const seed = style.seed ?? 42;

  // Line-level drift & slant calculation
  let lineDriftAngleDeg = 0;
  let lineOffsetYPx = 0;

  if (style.lineDrift && style.subtleVariation) {
    const lineHash = hashValues(seed, pageIndex, lineIndex, 'line-drift');
    const lineRand = mulberry32(lineHash);
    lineDriftAngleDeg = (lineRand() * 2 - 1) * 0.28 * intensity; // -0.28deg to +0.28deg
    lineOffsetYPx = (lineRand() * 2 - 1) * 0.75 * intensity; // -0.75px to +0.75px
  }

  const rawWords = lineText.split(' ');
  const words: WordRenderProps[] = [];

  for (let wIdx = 0; wIdx < rawWords.length; wIdx++) {
    const word = rawWords[wIdx];
    const wordHash = hashValues(seed, pageIndex, lineIndex, wIdx, 'word');
    const wordRand = mulberry32(wordHash);

    // Natural word space width (between ~0.24em and ~0.38em)
    const baseSpacePx = style.fontSize * 0.28;
    const spaceVarPx = style.wordSpacingVariation && style.subtleVariation
      ? (wordRand() * 2 - 1) * (style.fontSize * 0.08) * intensity
      : 0;
    const spaceWidthPx = Math.max(4, baseSpacePx + spaceVarPx);

    const chars: CharRenderProps[] = [];
    let prevChar = '';

    for (let cIdx = 0; cIdx < word.length; cIdx++) {
      const char = word[cIdx];
      const charStyle = computeCharTransform(
        char,
        cIdx,
        wIdx,
        lineIndex,
        pageIndex,
        style,
        prevChar
      );

      chars.push({
        char,
        style: charStyle,
        key: `c-${pageIndex}-${lineIndex}-${wIdx}-${cIdx}-${char}`,
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
