import React, { useRef, useEffect, useState } from 'react';
import { HandwritingStyle, PAGE_SIZES, PersonalHandwritingProfile } from '../types';
import { calculateLayout, paginateText } from '../utils/textFlow';
import { HandwritingPage } from './HandwritingPage';
import { ZoomIn, ZoomOut, RotateCcw, FileText, MousePointer } from 'lucide-react';

interface PaperPreviewProps {
  text: string;
  style: HandwritingStyle;
  pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  activeProfile?: PersonalHandwritingProfile | null;
  onPageCountChange?: (count: number) => void;
  onTextChange?: (newText: string) => void;
}

export const PaperPreview: React.FC<PaperPreviewProps> = ({
  text,
  style,
  pageRefs,
  activeProfile,
  onPageCountChange,
  onTextChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomScale, setZoomScale] = useState<number>(0.75);
  const [autoScale, setAutoScale] = useState<boolean>(true);

  const dimensions = PAGE_SIZES[style.pageSize];
  const layout = calculateLayout(dimensions, style);
  const pages = paginateText(text, layout, style, activeProfile);

  useEffect(() => {
    if (onPageCountChange) {
      onPageCountChange(pages.length);
    }
  }, [pages.length, onPageCountChange]);

  // Adjust preview scaling to automatically fit nicely in container on load or resize
  useEffect(() => {
    const handleResize = () => {
      if (!autoScale || !containerRef.current) return;
      const container = containerRef.current;
      const availableWidth = container.clientWidth - 80;
      const availableHeight = container.clientHeight - 80;

      if (availableWidth > 0 && availableHeight > 0) {
        const scaleX = availableWidth / layout.widthPx;
        const scaleY = availableHeight / layout.heightPx;
        // Balance width readability and vertical visibility
        const computed = Math.min(scaleX, Math.max(scaleY, 0.72));
        setZoomScale(Math.max(0.45, Math.min(1.15, Math.min(scaleX, computed))));
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [layout.widthPx, layout.heightPx, autoScale]);

  const handleZoomIn = () => {
    setAutoScale(false);
    setZoomScale((prev) => Math.min(1.5, prev + 0.1));
  };

  const handleZoomOut = () => {
    setAutoScale(false);
    setZoomScale((prev) => Math.max(0.3, prev - 0.1));
  };

  const handleResetZoom = () => {
    setAutoScale(true);
    if (containerRef.current) {
      const container = containerRef.current;
      const availableWidth = container.clientWidth - 80;
      const availableHeight = container.clientHeight - 80;
      const scaleX = availableWidth / layout.widthPx;
      const scaleY = availableHeight / layout.heightPx;
      setZoomScale(Math.max(0.35, Math.min(1.0, Math.min(scaleX, scaleY))));
    }
  };

  const handleUpdateLine = (pageIdx: number, lineIdx: number, newText: string) => {
    if (!onTextChange) return;
    const updatedPages = pages.map((page, p) =>
      p === pageIdx ? page.map((line, l) => (l === lineIdx ? newText : line)) : page
    );
    const flattenedText = updatedPages.map((p) => p.join('\n')).join('\n');
    onTextChange(flattenedText);
  };

  const deskClass = style.deskSurface && style.deskSurface !== 'none' ? `desk-${style.deskSurface}` : '';

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/80 overflow-hidden relative select-none">
      {/* Top Preview Status & Zoom Bar */}
      <div className="h-11 border-b border-slate-800/80 px-6 flex items-center justify-between shrink-0 bg-slate-900/60 backdrop-blur z-20 flex-wrap gap-2">
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>{dimensions.label}</span>
          </div>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
          </span>
          <span className="text-slate-600">•</span>
          <span className="capitalize text-slate-400">{style.paperType} Paper</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-[11px] text-amber-400/90 font-medium hidden sm:flex items-center gap-1">
            <MousePointer className="w-3 h-3" />
            <span>Click any text to edit inline</span>
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-2 text-slate-300 min-w-[44px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition ml-0.5 border-l border-slate-800 pl-1.5"
            title="Fit to Screen"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Pages Container with display scaling & optional desk background */}
      <div
        id="tour-paper-preview"
        ref={containerRef}
        className={`flex-1 overflow-y-auto overflow-x-auto p-8 flex flex-col items-center gap-10 ${deskClass}`}
        style={
          !deskClass
            ? { background: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)' }
            : undefined
        }
      >
        {pages.map((pageLines, index) => (
          <div
            key={index}
            className="transition-transform duration-150 origin-top flex flex-col items-center"
            style={{
              transform: `scale(${zoomScale})`,
              marginBottom: `${layout.heightPx * (zoomScale - 1)}px`,
            }}
          >
            {/* Handwriting Document Page with Click-to-Edit */}
            <HandwritingPage
              ref={(el) => {
                pageRefs.current[index] = el;
              }}
              lines={pageLines}
              pageIndex={index}
              totalPages={pages.length}
              layout={layout}
              style={style}
              activeProfile={activeProfile}
              onUpdateLine={handleUpdateLine}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
