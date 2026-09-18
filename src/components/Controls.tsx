import React, { useState } from 'react';
import {
  HandwritingStyle,
  PaperType,
  PageSize,
  PaperTexture,
  EdgeStyle,
  HighlighterColor,
  CameraLightingTone,
  DeskSurface,
  PageShadowDepth,
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
  X,
  AlignLeft,
  MoveHorizontal,
  MoveVertical,
  Sun,
  Box,
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

  const handleNewSeed = () => {
    const newSeed = Math.floor(Math.random() * 100000);
    onChange({ seed: newSeed });
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 space-y-4 max-h-[430px] overflow-y-auto">
      {/* Header with quick actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 tracking-wide uppercase">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          <span>Document & Typography Controls</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Syntax Guide trigger */}
          <button
            id="tour-scribble-guide"
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

      {/* 1. Page Size & Ruling */}
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

      {/* 2. Paper Textures & Spiral / Binder Edge */}
      <div id="tour-paper-controls" className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
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

      {/* 4. Complete Typography, Spacing & Layout Sliders */}
      <div id="tour-typography-controls" className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>Typography, Indent & Paragraph Spacings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Font Size */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Font Size</span>
              <span className="text-indigo-400 font-mono font-medium">{style.fontSize}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={44}
              step={1}
              value={style.fontSize}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Line Spacing */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Line Spacing</span>
              <span className="text-indigo-400 font-mono font-medium">{style.lineSpacing.toFixed(1)}×</span>
            </div>
            <input
              type="range"
              min={1.2}
              max={2.8}
              step={0.1}
              value={style.lineSpacing}
              onChange={(e) => onChange({ lineSpacing: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Paragraph Indent */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Paragraph Indent</span>
              <span className="text-indigo-400 font-mono font-medium">{style.paragraphIndent ?? 0}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={5}
              value={style.paragraphIndent ?? 0}
              onChange={(e) => onChange({ paragraphIndent: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Paragraph Spacing */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Paragraph Gap</span>
              <span className="text-indigo-400 font-mono font-medium">+{style.paragraphSpacing ?? 0} lines</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={style.paragraphSpacing ?? 0}
              onChange={(e) => onChange({ paragraphSpacing: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Section Spacing */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Section Gap</span>
              <span className="text-indigo-400 font-mono font-medium">+{style.sectionSpacing ?? 0} lines</span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              step={1}
              value={style.sectionSpacing ?? 0}
              onChange={(e) => onChange({ sectionSpacing: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Word Gap */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Word Gap</span>
              <span className="text-indigo-400 font-mono font-medium">{(style.wordSpacing ?? 1.0).toFixed(1)}×</span>
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
      </div>

      {/* 5. Page Margins (Top, Bottom, Side Margins) */}
      <div id="tour-margins-controls" className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <MoveVertical className="w-3.5 h-3.5 text-indigo-400" />
          <span>Page Margins (Top, Bottom & Sides)</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Top Margin */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Top Margin</span>
              <span className="text-indigo-400 font-mono">{style.marginTopMm}mm</span>
            </div>
            <input
              type="range"
              min={8}
              max={45}
              step={2}
              value={style.marginTopMm}
              onChange={(e) => onChange({ marginTopMm: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Bottom Margin */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Bottom Margin</span>
              <span className="text-indigo-400 font-mono">{style.marginBottomMm}mm</span>
            </div>
            <input
              type="range"
              min={8}
              max={45}
              step={2}
              value={style.marginBottomMm}
              onChange={(e) => onChange({ marginBottomMm: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Left Margin */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Left Margin</span>
              <span className="text-indigo-400 font-mono">{style.marginLeftMm}mm</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={2}
              value={style.marginLeftMm}
              onChange={(e) => onChange({ marginLeftMm: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          {/* Right Margin */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Right Margin</span>
              <span className="text-indigo-400 font-mono">{style.marginRightMm}mm</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              step={2}
              value={style.marginRightMm}
              onChange={(e) => onChange({ marginRightMm: Number(e.target.value) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* 6. Mobile & Camera Studio, Lighting & Shadows */}
      <div id="tour-camera-studio" className="space-y-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Mobile Camera & Lighting Studio</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-amber-300">
            <input
              type="checkbox"
              checked={style.scannerLighting ?? false}
              onChange={(e) => onChange({ scannerLighting: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-amber-500"
            />
            <span>Enable Photo Lighting</span>
          </label>
        </div>

        {/* Lighting Tone & Shadow Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Lighting Mood / Warmth */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Lighting Mood / Tone</span>
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
              {[
                { id: 'neutral', label: 'Daylight' },
                { id: 'warm-desk', label: '💡 Warm Lamp' },
                { id: 'cool-office', label: '❄️ Cool Office' },
                { id: 'dramatic-lamp', label: '🔦 Spotlight' },
                { id: 'golden-sunset', label: '🌅 Golden Hour' },
              ].map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => onChange({ cameraLightingTone: tone.id as CameraLightingTone, scannerLighting: true })}
                  className={`py-1 px-1 rounded font-medium transition ${
                    (style.cameraLightingTone || 'neutral') === tone.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Page Elevation / Shadow Depth */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 flex items-center gap-1">
              <Box className="w-3 h-3 text-indigo-400" />
              <span>3D Page Shadow Depth</span>
            </label>
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
              {[
                { id: 'none', label: 'Flat' },
                { id: 'subtle', label: 'Subtle' },
                { id: 'floating', label: 'Floating' },
                { id: 'deep', label: 'Deep 3D' },
              ].map((shadow) => (
                <button
                  key={shadow.id}
                  type="button"
                  onClick={() => onChange({ cameraDeskShadow: shadow.id as PageShadowDepth })}
                  className={`py-1 px-1 rounded font-medium transition ${
                    (style.cameraDeskShadow || 'floating') === shadow.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {shadow.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desk Surface & Extra Camera Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Desk Surface */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400">Desk Surface Material</label>
            <div className="grid grid-cols-4 gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[10px]">
              {[
                { id: 'none', label: 'Studio Dark' },
                { id: 'oak-wood', label: '🪵 Oak' },
                { id: 'dark-walnut', label: '🪵 Walnut' },
                { id: 'marble', label: '🏛️ Marble' },
              ].map((desk) => (
                <button
                  key={desk.id}
                  type="button"
                  onClick={() => onChange({ deskSurface: desk.id as DeskSurface })}
                  className={`py-1 px-1 rounded font-medium transition ${
                    (style.deskSurface || 'none') === desk.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {desk.label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Extra Toggles */}
          <div className="flex flex-col justify-end space-y-1.5 text-[11px] text-slate-300">
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.cameraPhoneShadow ?? false}
                onChange={(e) => onChange({ cameraPhoneShadow: e.target.checked, scannerLighting: true })}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
              />
              <span>📱 Smartphone Cast Shadow</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.paperCreases ?? false}
                onChange={(e) => onChange({ paperCreases: e.target.checked })}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3 h-3 cursor-pointer accent-indigo-600"
              />
              <span>📄 Paper Fold & Crease Lines</span>
            </label>
          </div>
        </div>
      </div>

      {/* 7. Ink Color & Highlighter Tools */}
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

      {/* 8. Realistic Handwriting Flow & Ink Physics */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={style.subtleVariation}
              onChange={(e) => onChange({ subtleVariation: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-indigo-600"
            />
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Organic Letter Jitter & Flow</span>
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
            <span>Ink Fade Dynamics</span>
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
            <span>Ink Bleed / Pressure</span>
          </label>
        </div>
      </div>
    </div>
  );
};
