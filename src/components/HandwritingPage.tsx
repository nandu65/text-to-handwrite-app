import React, { forwardRef } from 'react';
import { HandwritingStyle, PaperType } from '../types';
import { PageLayout } from '../utils/textFlow';

interface HandwritingPageProps {
  lines: string[];
  pageIndex: number;
  totalPages: number;
  layout: PageLayout;
  style: HandwritingStyle;
}

export const HandwritingPage = forwardRef<HTMLDivElement, HandwritingPageProps>(
  ({ lines, pageIndex, totalPages, layout, style }, ref) => {
    // Generate line elements matching maxLinesPerPage to render ruled lines across the whole page
    const totalLinesCount = layout.maxLinesPerPage;
    const linesToRender = Array.from({ length: totalLinesCount }, (_, i) => lines[i] || '');

    // Function to render text with subtle character-level rotation/shift
    const renderHandwrittenText = (lineText: string, lineIdx: number) => {
      if (!lineText) return <span className="opacity-0">&nbsp;</span>;

      if (!style.subtleVariation) {
        return <span>{lineText}</span>;
      }

      // Render character-by-character with pseudo-random deterministic jitter
      return lineText.split('').map((char, charIdx) => {
        if (char === ' ') {
          return <span key={charIdx}> </span>;
        }
        // deterministic hash from page, line, char index and char code
        const hash = (pageIndex * 137 + lineIdx * 43 + charIdx * 19 + char.charCodeAt(0)) % 5;
        return (
          <span key={charIdx} className={`char-jitter-${hash}`}>
            {char}
          </span>
        );
      });
    };

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
              backgroundColor: 'rgba(239, 68, 68, 0.45)', // soft red margin line
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
          {linesToRender.map((lineText, idx) => (
            <div
              key={idx}
              className="relative flex items-end"
              style={{
                height: `${layout.lineHeightPx}px`,
                lineHeight: `${layout.lineHeightPx}px`,
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                letterSpacing: `${style.letterSpacing}px`,
                color: style.inkColor,
                opacity: style.inkOpacity,
              }}
            >
              {/* Ruled horizontal line */}
              {style.paperType === 'ruled' && (
                <div
                  className="absolute left-0 right-0 bottom-0 pointer-events-none"
                  style={{
                    height: '1px',
                    backgroundColor: 'rgba(147, 197, 253, 0.65)', // ruled blue line
                  }}
                />
              )}

              {/* Text content */}
              <div className="relative z-10 w-full truncate pb-1">
                {renderHandwrittenText(lineText, idx)}
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
