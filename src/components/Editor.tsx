import React from 'react';
import { Type, Sparkles, Trash2, FileText } from 'lucide-react';

interface EditorProps {
  text: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onLoadSample: (sampleType: 'essay' | 'letter' | 'notes') => void;
}

export const Editor: React.FC<EditorProps> = ({
  text,
  onChange,
  onClear,
  onLoadSample,
}) => {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Editor Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/50">
        <div className="flex items-center gap-2 text-slate-300 font-medium text-xs">
          <Type className="w-4 h-4 text-indigo-400" />
          <span>Text Input</span>
        </div>

        {/* Quick Sample Text Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onLoadSample('essay')}
            className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Load sample assignment"
          >
            Essay
          </button>
          <button
            onClick={() => onLoadSample('letter')}
            className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Load sample personal letter"
          >
            Letter
          </button>
          <button
            onClick={() => onLoadSample('notes')}
            className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Load sample lecture notes"
          >
            Notes
          </button>
          {text && (
            <button
              onClick={onClear}
              className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition ml-1"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="flex-1 p-4 flex flex-col relative">
        <textarea
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or paste your text here... It will instantly convert into realistic handwriting on the paper preview to the right."
          className="w-full flex-1 bg-slate-950/60 text-slate-100 placeholder:text-slate-500 rounded-xl p-4 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none font-sans text-sm leading-relaxed transition shadow-inner"
          spellCheck="false"
        />
      </div>

      {/* Editor Footer / Stats */}
      <div className="px-4 py-2.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0 bg-slate-950/40">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-slate-200">{wordCount}</strong> words
          </span>
          <span>
            <strong className="text-slate-200">{charCount}</strong> characters
          </span>
        </div>
        <span className="text-slate-500 text-[10px]">Real-time synchronization</span>
      </div>
    </div>
  );
};
