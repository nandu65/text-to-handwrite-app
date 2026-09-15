import React, { forwardRef, useMemo } from 'react';
import { HandwritingStyle, PaperType, PersonalHandwritingProfile } from '../types';
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

    return (
      <div
        ref={ref}
        data-page-index={pageIndex}
        className={`relative bg-white text-slate-900 page-shadow select-none transition-shadow ${getPaperBackground(
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
        {/* Red Margin Line for Ruled Paper */}
        {style.paperType === 'ruled' && style.showRedMargin && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: `${Math.max(40, layout.marginLeftPx - 16)}px`,
              width: '1.5px',
              backgroundColor: 'rgba(239, 68, 68, 0.45)', // soft authentic notebook red line
            }}
          />
        )}

        {/* Content Area with exact margins */}
        <div
          className="absolute inset-0 flex flex-col"
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
                  transform: `translate(${lineData.lineOffsetYPx}px) rotate(${lineData.lineDriftAngleDeg}deg)`,
                  transformOrigin: '0% 100%',
                }}
              >
                {lineData.words.length === 0 || (lineData.words.length === 1 && lineData.words[0].chars.length === 0) ? (
                  <span className="opacity-0">&nbsp;</span>
                ) : (
                  lineData.words.map((wordData, wIdx) => (
                    <span
                      key={wIdx}
                      className="inline-flex items-baseline whitespace-nowrap"
                      style={{
                        marginRight: wIdx < lineData.words.length - 1 ? `${wordData.spaceWidthPx}px` : 0,
                      }}
                    >
                      {wordData.chars.map((charData) => {
                        if (charData.isPersonalGlyph && charData.glyphDataUrl) {
                          return (
                            <span key={charData.key} style={{ ...charData.style, backgroundColor: 'transparent' }} className="inline-flex items-baseline bg-transparent">
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
                                }}
                              />
                            </span>
                          );
                        }

                        return (
                          <span key={charData.key} style={charData.style}>
                            {charData.char}
                          </span>
                        );
                      })}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Discreet Page Number at bottom right */}
        {totalPages > 1 && (
          <div
            className="absolute bottom-3 right-6 text-xs text-slate-400 font-sans pointer-events-none select-none opacity-60"
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
