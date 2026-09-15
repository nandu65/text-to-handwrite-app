import React from 'react';
import {
  HandwritingStyle,
  PaperType,
  PageSize,
  FONT_OPTIONS,
  INK_COLORS,
  PersonalHandwritingProfile,
} from '../types';
import {
  Sliders,
  Type,
  Palette,
  Layers,
  Sparkles,
  Maximize2,
  Dices,
  UserCheck,
  Plus,
  Trash2,
} from 'lucide-react';

interface ControlsProps {
  style: HandwritingStyle;
  onChange: (updated: Partial<HandwritingStyle>) => void;
  profiles: PersonalHandwritingProfile[];
  activeProfile: PersonalHandwritingProfile | null;
  onSelectProfile: (profile: PersonalHandwritingProfile | null) => void;
  onOpenCreateModal: () => void;
  onDeleteProfile: (profileId: string) => void;
}

export const Controls: React.FC<ControlsProps> = ({
  style,
  onChange,
  profiles,
  activeProfile,
  onSelectProfile,
  onOpenCreateModal,
  onDeleteProfile,
}) => {
  const handleNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000);
    onChange({ seed: newSeed });
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4 max-h-[390px] overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 tracking-wide uppercase">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Document & Style Controls</span>
        </div>

        {/* Randomize variation seed */}
        <button
          type="button"
          onClick={handleNewSeed}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition active:scale-95"
          title="Regenerate deterministic handwriting variation seed"
        >
          <Dices className="w-3 h-3 text-indigo-400" />
          <span>Randomize Variation</span>
        </button>
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

      {/* 3. Handwriting Source (Personal Profile vs Built-in Font) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-400" />
            <span>Handwriting Source</span>
          </label>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>New Custom Profile</span>
          </button>
        </div>

        {/* Source selector dropdown */}
        <div className="flex gap-2">
          <select
            value={
              style.usePersonalHandwriting && activeProfile
                ? `profile:${activeProfile.id}`
                : `font:${style.fontFamily}`
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('profile:')) {
                const pId = val.replace('profile:', '');
                const target = profiles.find((p) => p.id === pId);
                if (target) {
                  onSelectProfile(target);
                }
              } else if (val.startsWith('font:')) {
                const fontFam = val.replace('font:', '');
                const selected = FONT_OPTIONS.find((f) => f.fontFamily === fontFam);
                onSelectProfile(null);
                onChange({
                  usePersonalHandwriting: false,
                  fontFamily: fontFam,
                  fontName: selected ? selected.name : 'Custom',
                });
              }
            }}
            className="w-full bg-slate-950 text-slate-200 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:border-indigo-500 outline-none cursor-pointer"
          >
            {profiles.length > 0 && (
              <optgroup label="🌟 My Personal Handwriting Profiles">
                {profiles.map((p) => (
                  <option key={p.id} value={`profile:${p.id}`}>
                    ✍️ {p.name} ({p.totalExtracted} glyphs)
                  </option>
                ))}
              </optgroup>
            )}

            <optgroup label="🖋️ Built-in Handwriting Fonts">
              {FONT_OPTIONS.map((font) => (
                <option key={font.id} value={`font:${font.fontFamily}`}>
                  {font.name} — {font.description}
                </option>
              ))}
            </optgroup>
          </select>

          {style.usePersonalHandwriting && activeProfile && (
            <button
              type="button"
              onClick={() => onDeleteProfile(activeProfile.id)}
              className="px-2 py-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/60 transition"
              title="Delete this custom handwriting profile"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {style.usePersonalHandwriting && activeProfile && (
          <div className="flex items-center justify-between text-[11px] bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 px-3 py-1.5 rounded-lg">
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Using Personal Profile: <strong>{activeProfile.name}</strong></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              {activeProfile.totalExtracted} glyphs
            </span>
          </div>
        )}
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
            min={16}
            max={40}
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

        {/* 6. Letter Tightness / Spacing */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-400">Letter Spacing</span>
            <span className="text-indigo-400 font-mono">
              {(style.letterSpacing ?? 0) > 0 ? `+${style.letterSpacing}` : (style.letterSpacing ?? 0)}px
            </span>
          </div>
          <input
            type="range"
            min={-3}
            max={3}
            step={0.5}
            value={style.letterSpacing ?? 0}
            onChange={(e) => onChange({ letterSpacing: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* 7. Word Spacing */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-400">Word Gap</span>
            <span className="text-indigo-400 font-mono">{(style.wordSpacing ?? 1.0).toFixed(1)}×</span>
          </div>
          <input
            type="range"
            min={0.6}
            max={1.8}
            step={0.1}
            value={style.wordSpacing ?? 1.0}
            onChange={(e) => onChange({ wordSpacing: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>

      {/* 6. Variation Intensity Slider */}
      {style.subtleVariation && (
        <div className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Natural Variation Strength</span>
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              {(style.variationIntensity ?? 1.0).toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={1.8}
            step={0.1}
            value={style.variationIntensity ?? 1.0}
            onChange={(e) => onChange({ variationIntensity: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Subtle</span>
            <span>Balanced</span>
            <span>Expressive</span>
          </div>
        </div>
      )}

      {/* 7. Ink Color */}
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

      {/* 8. Fine-grained Options */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between">
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
              <span>Red Margin Line</span>
            </label>
          )}
        </div>

        {style.subtleVariation && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-400 text-[11px] pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.glyphVariation ?? true}
                onChange={(e) => onChange({ glyphVariation: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
              />
              <span>Glyph Variants</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.lineDrift ?? true}
                onChange={(e) => onChange({ lineDrift: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
              />
              <span>Line Drift</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.wordSpacingVariation ?? true}
                onChange={(e) => onChange({ wordSpacingVariation: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
              />
              <span>Word Gaps</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
