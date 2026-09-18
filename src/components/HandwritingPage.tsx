import React, { forwardRef, useMemo } from 'react';
import { HandwritingStyle, PaperType, PersonalHandwritingProfile, HIGHLIGHTER_COLORS } from '../types';
import { PageLayout } from '../utils/textFlow';
import { processHandwrittenLine } from '../utils/handwritingEngine';

interface HandwritingPageProps {
  lines: string[];
  pageIndex: number;
  totalPages: number;
  layout: PageLayout;
  style: HandwritingStyle;
  activeProfile?: PersonalHandwritingProfile | null;
}

export const HandwritingPage = forwardRef<HTMLDivElement, HandwritingPageProps>(
  ({ lines, pageIndex, totalPages, layout, style, activeProfile }, ref) => {
    const totalLinesCount = layout.maxLinesPerPage;
    const linesToRender = useMemo(
      () => Array.from({ length: totalLinesCount }, (_, i) => lines[i] || ''),
      [totalLinesCount, lines]
    );

    // Process all lines with the handwriting engine and active personal profile
    const processedLines = useMemo(() => {
      return linesToRender.map((lineText, idx) =>
        processHandwrittenLine(lineText, idx, pageIndex, style, activeProfile)
      );
    }, [linesToRender, pageIndex, style, activeProfile]);

    // Paper background style
    const getPaperBackground = (type: PaperType) => {
      if (type === 'blank') return 'paper-blank-bg';
      if (type === 'graph') return 'paper-graph-bg';
      return ''; // ruled paper uses dedicated ruled line elements for precision
    };

    const textureClass = `texture-${style.paperTexture || 'white'}`;
    const activeHighlighter = HIGHLIGHTER_COLORS[style.highlighterColor || 'yellow'] || HIGHLIGHTER_COLORS.yellow;

    // Spiral rings count based on page height
    const spiralRingCount = useMemo(() => {
      return Math.max(12, Math.floor(layout.heightPx / 38));
    }, [layout.heightPx]);

    return (
      <div
        ref={ref}
        data-page-index={pageIndex}
        className={`relative bg-white text-slate-900 page-shadow select-none transition-shadow ${textureClass} ${getPaperBackground(
          style.paperType
        )}`}
        style={{
          width: `${layout.widthPx}px`,
          height: `${layout.heightPx}px`,
          minWidth: `${layout.widthPx}px`,
          minHeight: `${layout.heightPx}px`,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        {/* Scanner / Mobile Photo Lighting Vignette */}
        {style.scannerLighting && (
          <div className="scanner-lighting-overlay" />
        )}

        {/* 1. Spiral Notebook Rings along Left Edge */}
        {style.edgeStyle === 'spiral' && (
          <div className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none z-30 flex flex-col justify-between py-6 pl-2">
            {Array.from({ length: spiralRingCount }).map((_, rIdx) => (
              <div key={rIdx} className="relative flex items-center h-4">
                {/* Punch hole cutout in paper */}
                <div
                  className="w-3.5 h-3.5 rounded-full bg-slate-900/80 shadow-inner"
                  style={{
                    boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8), 0 0.5px 0.5px rgba(255,255,255,0.4)',
                  }}
                />
                {/* 3D Metal Wire Loop */}
                <div
                  className="absolute -left-3.5 top-0.5 w-7 h-3 rounded-full border-[2.2px] border-slate-400/90 shadow-md"
                  style={{
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 50%, #475569 100%)',
                    boxShadow: '1px 2px 3px rgba(0, 0, 0, 0.35)',
                    transform: 'rotate(-4deg)',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* 2. 3-Hole Binder Punches */}
        {style.edgeStyle === 'binder-holes' && (
          <div className="absolute top-0 bottom-0 left-3.5 w-6 pointer-events-none z-30 flex flex-col justify-between py-[12%]">
            {[0, 1, 2].map((holeIdx) => (
              <div
                key={holeIdx}
                className="w-5 h-5 rounded-full bg-slate-900 shadow-inner relative"
                style={{
                  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.85), 0 1px 1px rgba(255,255,255,0.6)',
                }}
              >
                {/* Paper thickness highlight ring */}
                <div className="absolute inset-0 rounded-full border border-black/30 pointer-events-none" />
              </div>
            ))}
          </div>
        )}

        {/* Red Margin Line for Ruled Paper */}
        {style.paperType === 'ruled' && style.showRedMargin && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-10"
            style={{
              left: `${Math.max(40, layout.marginLeftPx - 16)}px`,
              width: '1.5px',
              backgroundColor: 'rgba(239, 68, 68, 0.45)', // soft authentic notebook red line
            }}
          />
        )}

        {/* Content Area with exact margins */}
        <div
          className="absolute inset-0 flex flex-col z-20"
          style={{
            paddingTop: `${layout.marginTopPx}px`,
            paddingLeft: `${layout.marginLeftPx}px`,
            paddingRight: `${layout.marginRightPx}px`,
            paddingBottom: `${layout.marginBottomPx}px`,
          }}
        >
          {processedLines.map((lineData, idx) => (
            <div
              key={idx}
              className="relative flex items-end"
              style={{
                height: `${layout.lineHeightPx}px`,
                lineHeight: `${layout.lineHeightPx}px`,
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                color: style.inkColor,
              }}
            >
              {/* Ruled horizontal line */}
              {style.paperType === 'ruled' && (
                <div
                  className="absolute left-0 right-0 bottom-0 pointer-events-none"
                  style={{
                    height: '1px',
                    backgroundColor: 'rgba(147, 197, 253, 0.65)', // crisp ruled blue line
                  }}
                />
              )}

              {/* Natural handwritten text line with slight organic drift, personal glyphs and character variations */}
              <div
                className="relative z-10 w-full flex items-baseline flex-nowrap pb-1 overflow-visible"
                style={{
                  transform: `translate(${lineData.lineOffsetXMarginPx.toFixed(2)}px, ${lineData.lineOffsetYPx.toFixed(2)}px) rotate(${lineData.lineDriftAngleDeg.toFixed(2)}deg)`,
                  transformOrigin: '0% 100%',
                }}
              >
                {lineData.words.length === 0 || (lineData.words.length === 1 && lineData.words[0].chars.length === 0) ? (
                  <span className="opacity-0">&nbsp;</span>
                ) : (
                  lineData.words.map((wordData, wIdx) => (
                    <span
                      key={wIdx}
                      className="relative inline-flex items-baseline whitespace-nowrap shrink-0"
                      style={{
                        marginRight: wIdx < lineData.words.length - 1 ? `${wordData.spaceWidthPx}px` : 0,
                        flexShrink: 0,
                      }}
                    >
                      {/* Translucent Fluorescent Highlighter */}
                      {wordData.isHighlighted && (
                        <span
                          className="absolute -inset-x-1.5 -top-1 -bottom-0.5 rounded-sm pointer-events-none"
                          style={{
                            backgroundColor: activeHighlighter.bg,
                            mixBlendMode: 'multiply',
                            transform: 'rotate(-0.35deg) skewX(-1.5deg)',
                            zIndex: 0,
                          }}
                        />
                      )}

                      {/* Organic Hand-Drawn Circle Loop */}
                      {wordData.isCircled && (
                        <svg
                          className="absolute -inset-x-2 -inset-y-1.5 w-[calc(100%+16px)] h-[calc(100%+12px)] pointer-events-none overflow-visible"
                          style={{ zIndex: 12 }}
                          viewBox="0 0 100 40"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M 12,22 C 8,10 25,4 52,3.5 C 78,3 96,9 96,21 C 96,33 75,37 46,37.5 C 18,38 4,28 8,16 C 10,10 22,6 36,5"
                            stroke={style.inkColor}
                            strokeWidth="1.8"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.88"
                          />
                        </svg>
                      )}

                      {/* Organic Wavy Underline */}
                      {wordData.isUnderlined && (
                        <svg
                          className="absolute left-0 right-0 -bottom-1.5 w-full h-3.5 pointer-events-none overflow-visible"
                          style={{ zIndex: 12 }}
                          viewBox="0 0 100 12"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M 1,4 Q 25,10 50,4 T 99,5"
                            stroke={style.inkColor}
                            strokeWidth="1.9"
                            fill="none"
                            strokeLinecap="round"
                            opacity="0.9"
                          />
                        </svg>
                      )}

                      {/* Organic Wavy Strike-through / Pen Scratch-out */}
                      {wordData.isScratched && (
                        <svg
                          className="absolute -inset-x-1 inset-y-0 w-[calc(100%+8px)] h-full pointer-events-none overflow-visible"
                          style={{ zIndex: 15 }}
                          viewBox="0 0 100 24"
                          preserveAspectRatio="none"
                        >
                          <path
                            d="M 2,12 Q 22,7 45,14 T 75,10 T 98,13 M 95,9 Q 70,16 48,9 T 5,14"
                            stroke={style.inkColor}
                            strokeWidth="2.2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.92"
                          />
                        </svg>
                      )}

                      {/* Checkbox rendered glyph */}
                      {wordData.isCheckbox ? (
                        <span className="inline-flex items-center justify-center mr-1.5 self-center relative" style={{ width: `${style.fontSize * 0.85}px`, height: `${style.fontSize * 0.85}px` }}>
                          <svg
                            viewBox="0 0 24 24"
                            className="w-full h-full overflow-visible"
                            style={{ color: style.inkColor }}
                          >
                            {/* Hand-drawn box */}
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="2.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              transform="rotate(-1 12 12)"
                            />
                            {/* Checkmark */}
                            {wordData.isChecked && (
                              <path
                                d="M 6,13 L 10.5,18 L 20,6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            )}
                          </svg>
                        </span>
                      ) : (
                        wordData.chars.map((charData) => {
                          if (charData.isPersonalGlyph && charData.glyphDataUrl) {
                            return (
                              <span key={charData.key} style={{ ...charData.style, backgroundColor: 'transparent', flexShrink: 0 }} className="inline-flex items-baseline bg-transparent shrink-0">
                                <img
                                  src={charData.glyphDataUrl}
                                  alt={charData.char}
                                  draggable={false}
                                  style={{
                                    width: `${charData.glyphWidthPx || style.fontSize}px`,
                                    height: `${charData.glyphHeightPx || style.fontSize}px`,
                                    objectFit: 'contain',
                                    display: 'inline-block',
                                    verticalAlign: 'baseline',
                                    pointerEvents: 'none',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    boxShadow: 'none',
                                    flexShrink: 0,
                                  }}
                                />
                              </span>
                            );
                          }

                          return (
                            <span key={charData.key} style={{ ...charData.style, flexShrink: 0 }} className="shrink-0">
                              {charData.char}
                            </span>
                          );
                        })
                      )}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Sticky Notes Overlay */}
        {style.stickyNotes && style.stickyNotes.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {style.stickyNotes.map((note) => {
              const noteColorBg =
                note.color === 'pink'
                  ? 'bg-pink-100 border-pink-300 text-pink-950 shadow-pink-900/20'
                  : note.color === 'cyan'
                  ? 'bg-cyan-100 border-cyan-300 text-cyan-950 shadow-cyan-900/20'
                  : note.color === 'green'
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-emerald-900/20'
                  : 'bg-amber-100 border-amber-300 text-amber-950 shadow-amber-900/20';

              return (
                <div
                  key={note.id}
                  className={`absolute p-3 rounded-sm border shadow-lg font-serif text-xs ${noteColorBg}`}
                  style={{
                    top: `${note.topPercent}%`,
                    left: `${note.leftPercent}%`,
                    width: `${note.widthPx || 140}px`,
                    transform: `rotate(${note.rotationDeg || -2}deg)`,
                    fontFamily: style.fontFamily,
                    fontSize: `${Math.max(13, style.fontSize * 0.65)}px`,
                    lineHeight: 1.3,
                  }}
                >
                  {/* Adhesive top strip tape */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3.5 bg-white/40 border border-white/60 shadow-xs rotate-1 backdrop-blur-xs rounded-xs" />
                  <p className="whitespace-pre-wrap font-medium">{note.text}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Discreet Page Number at bottom right */}
        {totalPages > 1 && (
          <div
            className="absolute bottom-3 right-6 text-xs text-slate-400 font-sans pointer-events-none select-none opacity-60 z-20"
            style={{ fontSize: '11px' }}
          >
            Page {pageIndex + 1} of {totalPages}
          </div>
        )}
      </div>
    );
  }
);

HandwritingPage.displayName = 'HandwritingPage';
