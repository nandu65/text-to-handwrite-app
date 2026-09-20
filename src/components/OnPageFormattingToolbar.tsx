import React, { useState } from 'react';
import {
  Highlighter,
  Sparkles,
  Circle,
  Underline,
  CheckSquare,
  ArrowRight,
  Edit2,
  Trash2,
  Check,
  X,
  Palette,
} from 'lucide-react';
import { HighlighterColor, HIGHLIGHTER_COLORS } from '../types';

export interface SelectionCoords {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface OnPageFormattingToolbarProps {
  selectedText: string;
  coords: SelectionCoords | null;
  onApplyFormat: (formatType: 'highlight' | 'scratch' | 'circle' | 'underline' | 'checkbox' | 'arrow' | 'clear', color?: HighlighterColor) => void;
  onReplaceText: (newText: string) => void;
  onClose: () => void;
}

export const OnPageFormattingToolbar: React.FC<OnPageFormattingToolbarProps> = ({
  selectedText,
  coords,
  onApplyFormat,
  onReplaceText,
  onClose,
}) => {
  const [showHighlighterColors, setShowHighlighterColors] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editValue, setEditValue] = useState(selectedText);

  if (!coords || !selectedText.trim()) return null;

  const handleSaveInlineEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editValue.trim() !== selectedText) {
      onReplaceText(editValue);
    }
    setIsEditingInline(false);
    onClose();
  };

  return (
    <div
      className="absolute z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
      style={{
        top: `${Math.max(10, coords.top - 48)}px`,
        left: `${Math.max(10, coords.left + coords.width / 2)}px`,
        transform: 'translateX(-50%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {isEditingInline ? (
        <form
          onSubmit={handleSaveInlineEdit}
          className="flex items-center gap-1.5 bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 p-1.5 rounded-xl shadow-2xl"
        >
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            className="bg-slate-950 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700 outline-none focus:border-indigo-400 min-w-[140px]"
            placeholder="Edit text..."
          />
          <button
            type="submit"
            className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
            title="Apply text change"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsEditingInline(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-indigo-500/40 p-1 rounded-xl shadow-2xl text-slate-200 text-xs">
          {/* 1. Highlighter Button & Color Flyout */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHighlighterColors(!showHighlighterColors)}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition ${
                showHighlighterColors
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'hover:bg-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Highlight phrase (==syntax==)"
            >
              <Highlighter className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-medium hidden sm:inline">Highlight</span>
            </button>

            {showHighlighterColors && (
              <div className="absolute top-full left-0 mt-1 bg-slate-950 border border-slate-700 p-1.5 rounded-lg shadow-xl flex items-center gap-1.5 z-60 animate-in fade-in duration-100">
                {(['yellow', 'cyan', 'pink', 'lime'] as HighlighterColor[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onApplyFormat('highlight', c);
                      setShowHighlighterColors(false);
                      onClose();
                    }}
                    className="w-5 h-5 rounded-full border border-slate-700 hover:scale-120 transition flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: HIGHLIGHTER_COLORS[c].bg }}
                    title={`Highlight in ${c}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 2. Pen Scratch-out Strike-through */}
          <button
            type="button"
            onClick={() => {
              onApplyFormat('scratch');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition"
            title="Organic Pen Scratch-out (~~mistake~~)"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-[10px] font-medium hidden sm:inline">Scratch</span>
          </button>

          {/* 3. Hand-Drawn Circle Loop */}
          <button
            type="button"
            onClick={() => {
              onApplyFormat('circle');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition"
            title="Hand-Drawn Circle Loop (((phrase)))"
          >
            <Circle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-medium hidden sm:inline">Circle</span>
          </button>

          {/* 4. Wavy Underline */}
          <button
            type="button"
            onClick={() => {
              onApplyFormat('underline');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 transition"
            title="Wavy Heading Underline (__title__)"
          >
            <Underline className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-medium hidden sm:inline">Underline</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

          {/* 5. Checkbox toggle */}
          <button
            type="button"
            onClick={() => {
              onApplyFormat('checkbox');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Insert Checkbox ([x])"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          </button>

          {/* 6. Arrow toggle */}
          <button
            type="button"
            onClick={() => {
              onApplyFormat('arrow');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Insert Arrow (->)"
          >
            <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
          </button>

          {/* 7. In-Place Direct Edit */}
          <button
            type="button"
            onClick={() => {
              setEditValue(selectedText);
              setIsEditingInline(true);
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Edit wording directly in place"
          >
            <Edit2 className="w-3.5 h-3.5 text-indigo-300" />
          </button>

          {/* 8. Clear Formatting */}
          <button
            type="button"
            onClick={() => {
              onApplyFormat('clear');
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-300 transition"
            title="Remove formatting syntax"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* 9. Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-white transition ml-0.5"
            title="Close toolbar"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
