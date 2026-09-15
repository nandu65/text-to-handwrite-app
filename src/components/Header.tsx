import React from 'react';
import { PenTool, Download, FileText, Sparkles, Image } from 'lucide-react';

interface HeaderProps {
  onExportPNG: () => void;
  onExportPDF: () => void;
  onOpenComingSoon: () => void;
  isExporting: boolean;
  pageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onExportPNG,
  onExportPDF,
  onOpenComingSoon,
  isExporting,
  pageCount,
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
              MVP
            </span>
          </div>
          <p className="text-xs text-slate-400">Generate realistic handwritten documents in real-time</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Placeholder feature badge / button */}
        <button
          onClick={onOpenComingSoon}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/30 text-xs font-medium hover:bg-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Create My Handwriting</span>
          <span className="bg-amber-400/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
            Coming Soon
          </span>
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
          <span>Export PNG</span>
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
