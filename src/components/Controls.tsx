import React from 'react';
import {
  HandwritingStyle,
  PaperType,
  PageSize,
  PAGE_SIZES,
  FONT_OPTIONS,
  INK_COLORS,
} from '../types';
import {
  Sliders,
  Type,
  FileText,
  Palette,
  Layers,
  Sparkles,
  AlignLeft,
  Maximize2,
} from 'lucide-react';

interface ControlsProps {
  style: HandwritingStyle;
  onChange: (updated: Partial<HandwritingStyle>) => void;
}

export const Controls: React.FC<ControlsProps> = ({ style, onChange }) => {
  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4 max-h-[380px] overflow-y-auto">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 tracking-wide uppercase">
        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
        <span>Document & Style Controls</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 1. Page Size */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Page Size</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            {(['A4', 'A5', 'Letter'] as PageSize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ pageSize: size })}
                className={`py-1.5 px-2 rounded-md text-xs font-medium transition ${
                  style.pageSize === size
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Paper Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Paper Type</span>
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
            {(['ruled', 'blank', 'graph'] as PaperType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onChange({ paperType: type })}
                className={`py-1.5 px-2 rounded-md text-xs capitalize font-medium transition ${
                  style.paperType === type
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Handwriting Font Selection */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-indigo-400" />
          <span>Handwriting Font</span>
        </label>
        <select
          value={style.fontFamily}
          onChange={(e) => {
            const selected = FONT_OPTIONS.find((f) => f.fontFamily === e.target.value);
            onChange({
              fontFamily: e.target.value,
              fontName: selected ? selected.name : 'Custom',
            });
          }}
          className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.id} value={font.fontFamily}>
              {font.name} — {font.description}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 4. Handwriting Size */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-400">Handwriting Size</span>
            <span className="text-indigo-400 font-mono">{style.fontSize}px</span>
          </div>
          <input
            type="range"
            min={14}
            max={32}
            step={1}
            value={style.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* 5. Line Spacing */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-400">Line Spacing</span>
            <span className="text-indigo-400 font-mono">{style.lineSpacing.toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={1.2}
            max={2.6}
            step={0.1}
            value={style.lineSpacing}
            onChange={(e) => onChange({ lineSpacing: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* 6. Ink Color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ink Color</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">{style.inkColor}</span>
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          {INK_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => onChange({ inkColor: color.value })}
              className={`w-7 h-7 rounded-full border-2 transition-transform ${
                style.inkColor === color.value
                  ? 'border-indigo-400 scale-110 shadow-md ring-2 ring-indigo-500/30'
                  : 'border-slate-700 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          {/* Custom color input */}
          <label
            className="w-7 h-7 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-slate-400 transition"
            title="Custom ink color"
          >
            <input
              type="color"
              value={style.inkColor}
              onChange={(e) => onChange({ inkColor: e.target.value })}
              className="opacity-0 w-0 h-0"
            />
            <span className="text-[10px] text-slate-400 font-bold">+</span>
          </label>
        </div>
      </div>

      {/* 7. Additional Options: Subtle Variation & Margin line */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
          <input
            type="checkbox"
            checked={style.subtleVariation}
            onChange={(e) => onChange({ subtleVariation: e.target.checked })}
            className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
          />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            Natural Character Jitter
          </span>
        </label>

        {style.paperType === 'ruled' && (
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={style.showRedMargin}
              onChange={(e) => onChange({ showRedMargin: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
            />
            <span>Red Left Margin Line</span>
          </label>
        )}
      </div>
    </div>
  );
};
