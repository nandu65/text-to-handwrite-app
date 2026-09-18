import React from 'react';
import { PenTool, FileText, Sparkles, Image, Compass } from 'lucide-react';

interface HeaderProps {
  onExportPNG: () => void;
  onExportPDF: () => void;
  onOpenCreateHandwriting: () => void;
  onOpenTour: () => void;
  isExporting: boolean;
  pageCount: number;
  hasPersonalProfile: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onExportPNG,
  onExportPDF,
  onOpenCreateHandwriting,
  onOpenTour,
  isExporting,
  pageCount,
  hasPersonalProfile,
}) => {
  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <PenTool className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg text-white tracking-tight">Handwrite Studio</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Personalized
            </span>
          </div>
          <p className="text-xs text-slate-400">Generate realistic handwritten documents in real-time</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Guided Feature Tour button */}
        <button
          onClick={onOpenTour}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition active:scale-95 shadow-xs"
          title="Start interactive feature guide & tutorial"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Feature Guide</span>
        </button>

        {/* Create My Handwriting feature button */}
        <button
          onClick={onOpenCreateHandwriting}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold hover:bg-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Create My Handwriting</span>
          {hasPersonalProfile && (
            <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider border border-emerald-500/30">
              Active
            </span>
          )}
        </button>

        <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />

        {/* Export PNG */}
        <button
          onClick={onExportPNG}
          disabled={isExporting}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition shadow-sm active:scale-95 disabled:opacity-50"
          title={`Export ${pageCount} ${pageCount === 1 ? 'page' : 'pages'} as PNG`}
        >
          <Image className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Export PNG</span>
        </button>

        {/* Export PDF */}
        <button
          onClick={onExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
          title={`Export as physical PDF`}
        >
          <FileText className="w-4 h-4" />
          <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
        </button>
      </div>
    </header>
  );
};
