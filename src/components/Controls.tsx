import React, { useState } from 'react';
import {
  HandwritingStyle,
  PaperType,
  PageSize,
  PaperTexture,
  EdgeStyle,
  HighlighterColor,
  StickyNote,
  FONT_OPTIONS,
  INK_COLORS,
  HIGHLIGHTER_COLORS,
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
  Camera,
  Scroll,
  Highlighter,
  HelpCircle,
  StickyNote as StickyNoteIcon,
  X,
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
  const [showSyntaxGuide, setShowSyntaxGuide] = useState(false);
  const [showStickyModal, setShowStickyModal] = useState(false);
  const [newStickyText, setNewStickyText] = useState('');
  const [newStickyColor, setNewStickyColor] = useState<'yellow' | 'pink' | 'cyan' | 'green'>('yellow');

  const handleNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000);
    onChange({ seed: newSeed });
  };

  const handleAddStickyNote = () => {
    if (!newStickyText.trim()) return;
    const currentNotes = style.stickyNotes || [];
    const newNote: StickyNote = {
      id: 'sn-' + Date.now(),
      text: newStickyText.trim(),
      color: newStickyColor,
      rotationDeg: (Math.random() * 8 - 4),
      topPercent: 8 + (currentNotes.length * 15) % 65,
      leftPercent: currentNotes.length % 2 === 0 ? 68 : 72,
      widthPx: 145,
    };
    onChange({ stickyNotes: [...currentNotes, newNote] });
    setNewStickyText('');
    setShowStickyModal(false);
  };

  const handleRemoveStickyNote = (id: string) => {
    const currentNotes = style.stickyNotes || [];
    onChange({ stickyNotes: currentNotes.filter((n) => n.id !== id) });
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4 max-h-[410px] overflow-y-auto">
      {/* Header with quick actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 tracking-wide uppercase">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Document & Style Controls</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Syntax Guide trigger */}
          <button
            type="button"
            onClick={() => setShowSyntaxGuide(!showSyntaxGuide)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium transition active:scale-95"
            title="View human scribble syntax formatting guide"
          >
            <HelpCircle className="w-3 h-3 text-amber-400" />
            <span>Scribble Syntax</span>
          </button>

          {/* Randomize variation seed */}
          <button
            type="button"
            onClick={handleNewSeed}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition active:scale-95"
            title="Regenerate deterministic handwriting variation seed"
          >
            <Dices className="w-3 h-3 text-indigo-400" />
            <span>Randomize</span>
          </button>
        </div>
      </div>

      {/* Syntax Guide Popup Card */}
      {showSyntaxGuide && (
        <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 text-xs space-y-2 relative shadow-lg">
          <button
            type="button"
            onClick={() => setShowSyntaxGuide(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="font-semibold text-amber-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <span>✏️ Human Scribble & Mistake Syntax</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-300">~~mistake~~</span>
              <span className="text-slate-400 block font-sans text-[10px]">Wavy pen scratch-out</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-300">==highlight==</span>
              <span className="text-slate-400 block font-sans text-[10px]">Fluorescent highlighter</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-300">((circle phrase))</span>
              <span className="text-slate-400 block font-sans text-[10px]">Hand-drawn pen circle</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-300">__wavy text__</span>
              <span className="text-slate-400 block font-sans text-[10px]">Hand-drawn underline</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-300">[x] and [ ]</span>
              <span className="text-slate-400 block font-sans text-[10px]">Handwritten checkboxes</span>
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
              <span className="text-amber-300">-&gt; and =&gt;</span>
              <span className="text-slate-400 block font-sans text-[10px]">Handwritten arrows</span>
            </div>
          </div>
        </div>
      )}

      {/* 1. Page & Paper Properties */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Page Size */}
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

        {/* Paper Grid Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Ruling & Grid</span>
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

      {/* 2. Authentic Paper Textures & Edge Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        {/* Paper Texture */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Scroll className="w-3.5 h-3.5 text-amber-400" />
            <span>Paper Texture</span>
          </label>
          <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'white', label: 'White', color: '#ffffff' },
              { id: 'cream', label: 'Cream', color: '#fefce8' },
              { id: 'parchment', label: 'Parchment', color: '#fbf4dc' },
              { id: 'kraft', label: 'Kraft', color: '#e8d4b8' },
            ].map((tex) => (
              <button
                key={tex.id}
                type="button"
                onClick={() => onChange({ paperTexture: tex.id as PaperTexture })}
                className={`py-1 px-1.5 rounded text-[10px] font-medium transition flex items-center justify-center gap-1 ${
                  (style.paperTexture || 'white') === tex.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: tex.color }} />
                <span>{tex.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notebook Edge / Ring Binding */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <span>📎 Edge / Binder Style</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'none', label: 'None' },
              { id: 'spiral', label: '🌀 Spiral' },
              { id: 'binder-holes', label: '🕳️ 3-Hole' },
            ].map((edge) => (
              <button
                key={edge.id}
                type="button"
                onClick={() => onChange({ edgeStyle: edge.id as EdgeStyle })}
                className={`py-1 px-1.5 rounded text-[10px] font-medium transition ${
                  (style.edgeStyle || 'none') === edge.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {edge.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Handwriting Source Selector */}
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

      {/* 4. Handwriting Size & Spacings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Handwriting Size */}
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

        {/* Line Spacing */}
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

        {/* Letter Tightness / Spacing */}
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

        {/* Word Spacing */}
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

      {/* Cursive & Messiness Personality Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        {/* Cursive Forward Slant */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <span>✍️ Cursive Slant</span>
            </span>
            <span className="text-indigo-400 font-mono text-[11px]">
              {style.cursiveSlant ?? 8}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={18}
            step={1}
            value={style.cursiveSlant ?? 8}
            onChange={(e) => onChange({ cursiveSlant: Number(e.target.value) })}
            className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Upright (0°)</span>
            <span>Natural (8°)</span>
            <span>Rushed (18°)</span>
          </div>
        </div>

        {/* Messiness / Rushed Penmanship */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <span>⚡ Messy / Rushed Flow</span>
            </span>
            <span className="text-amber-400 font-mono text-[11px]">
              {(style.messiness ?? 1.0).toFixed(1)}×
            </span>
          </div>
          <input
            type="range"
            min={0.2}
            max={2.0}
            step={0.1}
            value={style.messiness ?? 1.0}
            onChange={(e) => onChange({ messiness: Number(e.target.value) })}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Neat (0.2)</span>
            <span>Natural (1.0)</span>
            <span>Messy / Fast (2.0)</span>
          </div>
        </div>
      </div>

      {/* Quick Handwriting Presets */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Handwriting Presets</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => {
              const f = FONT_OPTIONS.find((opt) => opt.id === 'rushed-cursive') || FONT_OPTIONS[0];
              onSelectProfile(null);
              onChange({
                usePersonalHandwriting: false,
                fontFamily: f.fontFamily,
                fontName: f.name,
                cursiveSlant: 14,
                messiness: 1.6,
                letterSpacing: -1.0,
                wordSpacing: 0.9,
                variationIntensity: 1.4,
                connectedCursive: true,
              });
            }}
            className="py-1.5 px-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-[11px] font-medium transition text-left"
          >
            ⚡ Rushed Notes
          </button>

          <button
            type="button"
            onClick={() => {
              const f = FONT_OPTIONS.find((opt) => opt.id === 'doctor-scrawl') || FONT_OPTIONS[0];
              onSelectProfile(null);
              onChange({
                usePersonalHandwriting: false,
                fontFamily: f.fontFamily,
                fontName: f.name,
                cursiveSlant: 16,
                messiness: 1.8,
                letterSpacing: -1.5,
                wordSpacing: 0.85,
                variationIntensity: 1.5,
                connectedCursive: true,
              });
            }}
            className="py-1.5 px-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-[11px] font-medium transition text-left"
          >
            🩺 Doctor Scrawl
          </button>

          <button
            type="button"
            onClick={() => {
              const f = FONT_OPTIONS.find((opt) => opt.id === 'cedarville') || FONT_OPTIONS[0];
              onSelectProfile(null);
              onChange({
                usePersonalHandwriting: false,
                fontFamily: f.fontFamily,
                fontName: f.name,
                cursiveSlant: 9,
                messiness: 1.1,
                letterSpacing: -0.5,
                wordSpacing: 1.0,
                variationIntensity: 1.1,
                connectedCursive: true,
              });
            }}
            className="py-1.5 px-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-[11px] font-medium transition text-left"
          >
            ✍️ Loose Cursive
          </button>

          <button
            type="button"
            onClick={() => {
              const f = FONT_OPTIONS.find((opt) => opt.id === 'kalam') || FONT_OPTIONS[0];
              onSelectProfile(null);
              onChange({
                usePersonalHandwriting: false,
                fontFamily: f.fontFamily,
                fontName: f.name,
                cursiveSlant: 5,
                messiness: 0.8,
                letterSpacing: 0,
                wordSpacing: 1.1,
                variationIntensity: 0.9,
                connectedCursive: true,
              });
            }}
            className="py-1.5 px-2 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 text-[11px] font-medium transition text-left"
          >
            📝 Everyday Pen
          </button>
        </div>
      </div>

      {/* 5. Ink Colors & Highlighter Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ink Color */}
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

        {/* Highlighter Color Picker */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Highlighter className="w-3.5 h-3.5 text-amber-400" />
              <span>Highlighter Stroke</span>
            </span>
            <span className="text-[11px] text-slate-400">==syntax==</span>
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(Object.keys(HIGHLIGHTER_COLORS) as HighlighterColor[]).map((hColor) => {
              const info = HIGHLIGHTER_COLORS[hColor];
              const isSelected = (style.highlighterColor || 'yellow') === hColor;
              return (
                <button
                  key={hColor}
                  type="button"
                  onClick={() => onChange({ highlighterColor: hColor })}
                  className={`py-1.5 px-2 rounded-lg border text-[10px] font-medium capitalize flex items-center justify-center gap-1 transition ${
                    isSelected
                      ? 'border-indigo-400 bg-slate-800 text-white shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: info.bg }} />
                  <span>{hColor}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. Sticky Notes Section */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <StickyNoteIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Pinned Sticky Notes (Margin / Corrections)</span>
          </label>
          <button
            type="button"
            onClick={() => setShowStickyModal(true)}
            className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition"
          >
            <Plus className="w-3 h-3" />
            <span>Add Sticky Note</span>
          </button>
        </div>

        {style.stickyNotes && style.stickyNotes.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {style.stickyNotes.map((note) => (
              <div
                key={note.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300"
              >
                <span className={`w-2 h-2 rounded-full ${
                  note.color === 'pink' ? 'bg-pink-400' : note.color === 'cyan' ? 'bg-cyan-400' : note.color === 'green' ? 'bg-emerald-400' : 'bg-amber-400'
                }`} />
                <span className="max-w-[120px] truncate">{note.text}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveStickyNote(note.id)}
                  className="text-slate-500 hover:text-red-400 transition ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">No sticky notes added. Click "+ Add Sticky Note" to pin margin notes or teacher marks.</p>
        )}

        {/* Modal / Card to add sticky note */}
        {showStickyModal && (
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-700 space-y-2 mt-2">
            <div className="flex justify-between items-center text-xs font-medium text-slate-300">
              <span>New Sticky Note</span>
              <button type="button" onClick={() => setShowStickyModal(false)} className="text-slate-500 hover:text-slate-300">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              rows={2}
              value={newStickyText}
              onChange={(e) => setNewStickyText(e.target.value)}
              placeholder="e.g., Remember to submit by Friday! Or Teacher Red review comment..."
              className="w-full bg-slate-950 text-slate-200 text-xs rounded p-2 border border-slate-800 focus:border-indigo-500 outline-none resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {(['yellow', 'pink', 'cyan', 'green'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewStickyColor(c)}
                    className={`w-5 h-5 rounded-full border transition ${
                      newStickyColor === c ? 'scale-125 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                    } ${
                      c === 'pink' ? 'bg-pink-300' : c === 'cyan' ? 'bg-cyan-300' : c === 'green' ? 'bg-emerald-300' : 'bg-amber-300'
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddStickyNote}
                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
              >
                Pin to Page
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. Realistic Paper & Ink Physics Toggles */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={style.scannerLighting ?? false}
              onChange={(e) => onChange({ scannerLighting: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
            />
            <span className="flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mobile Cam / Scanner Lighting</span>
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400 text-[11px] pt-1">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={style.inkFade ?? true}
              onChange={(e) => onChange({ inkFade: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
            />
            <span>Ink Fade & Flow</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={style.connectedCursive ?? true}
              onChange={(e) => onChange({ connectedCursive: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
            />
            <span>Cursive Flow</span>
          </label>

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
              checked={style.inkBleed ?? true}
              onChange={(e) => onChange({ inkBleed: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
            />
            <span>Ink Bleed</span>
          </label>
        </div>
      </div>
    </div>
  );
};
