import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Edit3,
  Scroll,
  Camera,
  MousePointer,
  Download,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Type,
  Layers,
  Palette,
} from 'lucide-react';

export interface TourStep {
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  tips: string[];
  example?: string;
  highlightCategory?: 'editor' | 'profile' | 'controls' | 'camera' | 'preview' | 'export';
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Handwrite Studio!',
    badge: 'Overview',
    icon: <Sparkles className="w-6 h-6 text-amber-400" />,
    description:
      'Transform any digital text into authentic, natural human handwriting on real paper textures with physics-based ink flow, spiral binding, and camera lighting.',
    tips: [
      'Write or paste notes on the left, see live handwritten paper on the right.',
      'Export multi-page documents to ultra-crisp PNG or PDF anytime.',
      'Create and use your own physical handwriting using calibration sheets.',
    ],
    highlightCategory: 'editor',
  },
  {
    title: '✏️ Organic Scribbles & Human Mistake Syntax',
    badge: 'Scribbles & Marks',
    icon: <Edit3 className="w-6 h-6 text-indigo-400" />,
    description:
      'Make your notes look realistically human with authentic scratch-outs, fluorescent highlighters, circled notes, wavy underlines, and checkboxes.',
    tips: [
      '~~mistake~~ ➔ Realistic pen scribble strike-through',
      '==important== ➔ Translucent fluorescent highlighter stroke',
      '((key point)) ➔ Hand-drawn pen circle loop',
      '__heading__ ➔ Hand-drawn wavy underline',
      '[x] and [ ] ➔ Hand-drawn checked & unchecked boxes',
      '-> and => ➔ Handwritten arrows',
    ],
    example: '__Chapter 1: Biology__\n-> Cells produce ==ATP energy==.\n-> Glycolysis is ~~aerobic~~ ((anaerobic)).\n[x] Completed Homework',
    highlightCategory: 'editor',
  },
  {
    title: '🌟 Create & Use Your Own Handwriting',
    badge: 'Custom Font',
    icon: <Type className="w-6 h-6 text-emerald-400" />,
    description:
      'Turn your own personal handwriting into a digital font! Print a calibration template, write your alphabet, take a photo, and our vision engine extracts transparent ink glyphs.',
    tips: [
      'Click "Create My Handwriting" in the top bar.',
      'Download & write the A-Z sample sheet, then upload a photo.',
      'Our engine automatically extracts transparent vector glyphs with zero white background boxes.',
      'Switch between built-in cursive fonts and your personal profiles in one click.',
    ],
    highlightCategory: 'profile',
  },
  {
    title: '📄 Authentic Paper Textures & Spiral Binding',
    badge: 'Paper Styles',
    icon: <Scroll className="w-6 h-6 text-amber-400" />,
    description:
      'Select authentic paper textures and edge bindings for homework, assignments, and vintage journals.',
    tips: [
      'Textures: Crisp White Notebook, Warm Cream, Aged Parchment, or Recycled Kraft.',
      'Edge Bindings: Realistic 3D metallic spiral notebook rings or 3-hole binder punches.',
      'Paper Grids: Ruled lined paper with soft red margin lines, blank paper, or engineering graph grid.',
    ],
    highlightCategory: 'controls',
  },
  {
    title: '📐 Fine Spacing, Indent & Page Margins',
    badge: 'Typography',
    icon: <Layers className="w-6 h-6 text-blue-400" />,
    description:
      'Control every geometric dimension of your document to match real physical paper.',
    tips: [
      'Font Size & Line Spacing: Fine-tune character scale and line height.',
      'Paragraph Indent & Spacing: Add custom first-line tab indents and paragraph gaps.',
      'Page Margins: Independently adjust Top, Bottom, Left, and Right margins in millimeters.',
      'Word Gap & Slant: Adjust natural word spacing and forward cursive tilt.',
    ],
    highlightCategory: 'controls',
  },
  {
    title: '📸 Mobile Camera & Desk Lighting Studio',
    badge: 'Realistic Lighting',
    icon: <Camera className="w-6 h-6 text-violet-400" />,
    description:
      'Give your pages the look of a physical photo taken on a study desk with a smartphone.',
    tips: [
      'Lighting Moods: Warm Study Lamp, Cool Office, Spotlight, or Golden Hour Sunset.',
      '📱 Smartphone Shadow: Casts a subtle silhouette of a phone and hand over the page.',
      '3D Desk Shadow: Choose Flat, Subtle, Floating 3D, or Deep Dramatic elevation.',
      '🪵 Desk Surfaces: Preview on Oak Wood, Dark Walnut, or White Marble countertops.',
    ],
    highlightCategory: 'camera',
  },
  {
    title: '🖱️ Direct On-Page Click-to-Edit & Export',
    badge: 'Interactive Canvas',
    icon: <MousePointer className="w-6 h-6 text-rose-400" />,
    description:
      'Edit text directly on the rendered paper canvas and download your completed assignments with one click.',
    tips: [
      'Click any line of text on the paper to open an instant in-place editor.',
      'Hit Enter to save and instantly re-render the page.',
      'Pin custom handwritten Sticky Notes to margins or corrections.',
      'Click "Export PNG" or "Export PDF" in the header to download high-resolution multi-page files.',
    ],
    highlightCategory: 'export',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('handwrite_studio_tour_completed', 'true');
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleComplete = () => {
    localStorage.setItem('handwrite_studio_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with progress */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Interactive Guide • Step {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close Tour"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
              {step.icon}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {step.badge}
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">{step.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
            </div>
          </div>

          {/* Tips List */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              💡 Key Highlights & Capabilities
            </span>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {step.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Optional Code Example */}
          {step.example && (
            <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 space-y-1">
              <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase">
                Example Live Syntax:
              </span>
              <pre className="text-[11px] font-mono text-slate-200 whitespace-pre-wrap leading-relaxed bg-slate-900/80 p-2 rounded border border-slate-800">
                {step.example}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-indigo-500'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <span>{isLast ? 'Get Started 🚀' : 'Next Step'}</span>
            {!isLast && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
