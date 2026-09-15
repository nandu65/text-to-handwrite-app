import React from 'react';
import { Sparkles, X, UploadCloud, Cpu, Award, ArrowRight } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create My Handwriting</h3>
            <span className="text-xs text-amber-400 font-medium">Future AI Pipeline Concept</span>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Clone and replicate your unique personal handwriting style with precision. This feature is coming in future updates!
        </p>

        {/* Pipeline Concept Flow */}
        <div className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Planned 5-Stage Pipeline
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              1
            </div>
            <span>Upload physical handwriting photo / scan</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              2
            </div>
            <span>Handwriting stroke & slant analysis</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              3
            </div>
            <span>Personal handwriting profile generation</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              4
            </div>
            <span>Custom vector glyph library compilation</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold shrink-0">
              5
            </div>
            <span>Dynamic handwritten document synthesis</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm transition shadow-lg shadow-indigo-600/25"
        >
          Got it! Back to Studio
        </button>
      </div>
    </div>
  );
};
