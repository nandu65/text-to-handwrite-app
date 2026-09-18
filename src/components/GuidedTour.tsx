import React, { useState, useEffect, useRef } from 'react';
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
  Type,
  Layers,
  MoveVertical,
  HelpCircle,
  CheckCircle2,
  Compass,
} from 'lucide-react';

export interface TourStep {
  id: string;
  targetId: string;
  title: string;
  badge: string;
  icon: React.ReactNode;
  description: string;
  tips: string[];
  example?: string;
  preferredPlacement?: 'right' | 'left' | 'top' | 'bottom';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'editor',
    targetId: 'tour-text-editor',
    title: 'Text Input & Sample Prompts',
    badge: 'Step 1: Editor',
    icon: <Edit3 className="w-5 h-5 text-indigo-400" />,
    description:
      'Type or paste your text here. It automatically formats and live-renders into authentic handwriting on the notebook paper to the right.',
    tips: [
      'Click "Letters Test", "Essay", "Letter", or "Notes" for instant samples.',
      'Supports paragraphs, headings, bullet lists, and math symbols.',
    ],
    preferredPlacement: 'right',
  },
  {
    id: 'scribble-syntax',
    targetId: 'tour-scribble-guide',
    title: '✏️ Organic Scribbles & Mistake Syntax',
    badge: 'Step 2: Human Scribbles',
    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    description:
      'Render realistic hand-drawn mistakes, highlights, circle loops, and checkboxes using simple markdown syntax.',
    tips: [
      '~~mistake~~ ➔ Realistic pen scribble strike-through',
      '==important== ➔ Translucent fluorescent highlighter stroke',
      '((key phrase)) ➔ Hand-drawn wobbly pen circle loop',
      '__heading__ ➔ Hand-drawn wavy underline',
      '[x] and [ ] ➔ Handwritten checked & unchecked boxes',
      '-> and => ➔ Handwritten arrows',
    ],
    example: '~~error~~ ==key concept== ((circle this)) __title__ [x] Done -> Next',
    preferredPlacement: 'bottom',
  },
  {
    id: 'create-handwriting',
    targetId: 'tour-create-handwriting',
    title: '🌟 Create My Handwriting Font',
    badge: 'Step 3: Personal Handwriting',
    icon: <Type className="w-5 h-5 text-emerald-400" />,
    description:
      'Turn your own personal physical handwriting into a digital font with zero background boxes!',
    tips: [
      'Download the printable A-Z handwriting template sheet.',
      'Write your alphabet with your favourite pen and snap a photo.',
      'Upload the sheet, and our vision engine extracts transparent ink glyphs.',
      'Use your custom handwriting across all generated pages and PDF exports!',
    ],
    preferredPlacement: 'bottom',
  },
  {
    id: 'paper-controls',
    targetId: 'tour-paper-controls',
    title: '📄 Paper Textures & Spiral Binding',
    badge: 'Step 4: Paper Realism',
    icon: <Scroll className="w-5 h-5 text-amber-400" />,
    description:
      'Choose authentic physical paper textures and notebook edge bindings.',
    tips: [
      'Textures: Crisp White Notebook, Warm Cream, Aged Parchment, or Recycled Kraft.',
      'Edge Bindings: 3D metallic wire spiral rings or 3-hole binder punches.',
      'Paper Types: Lined ruled paper with red margins, blank paper, or graph grid.',
    ],
    preferredPlacement: 'right',
  },
  {
    id: 'typography-controls',
    targetId: 'tour-typography-controls',
    title: '📐 Typography, Indent & Spacing',
    badge: 'Step 5: Layout & Flow',
    icon: <Layers className="w-5 h-5 text-blue-400" />,
    description:
      'Fine-tune the geometry of your writing to look naturally spaced and authentic.',
    tips: [
      'Font Size & Line Height: Calibrate handwriting scale and ruling alignment.',
      'Paragraph Indent: Set custom first-line tab indentation.',
      'Paragraph & Section Gaps: Control vertical gaps between thoughts and headings.',
      'Word Gap: Adjust natural word spacing multiplier.',
    ],
    preferredPlacement: 'right',
  },
  {
    id: 'margins-controls',
    targetId: 'tour-margins-controls',
    title: '📏 Precise Page Margins',
    badge: 'Step 6: Margins',
    icon: <MoveVertical className="w-5 h-5 text-indigo-400" />,
    description:
      'Adjust physical margins with millimeter precision.',
    tips: [
      'Independently control Top, Bottom, Left, and Right margins.',
      'Text automatically wraps cleanly within your margin boundaries with zero edge overflow.',
    ],
    preferredPlacement: 'right',
  },
  {
    id: 'camera-studio',
    targetId: 'tour-camera-studio',
    title: '📸 Mobile Camera & Desk Studio',
    badge: 'Step 7: Lighting Studio',
    icon: <Camera className="w-5 h-5 text-violet-400" />,
    description:
      'Give your generated pages the authentic look of a smartphone photo taken on a physical desk.',
    tips: [
      'Lighting Moods: 💡 Warm Study Lamp, ❄️ Cool Office, 🔦 Spotlight, 🌅 Golden Hour.',
      '📱 Smartphone Shadow: Realistic phone silhouette cast over the top corner.',
      '3D Desk Shadow: Choose Flat, Subtle, Floating 3D, or Deep Dramatic elevation.',
      '🪵 Desk Surfaces: Preview on Oak Wood, Dark Walnut, or White Marble countertops.',
    ],
    preferredPlacement: 'right',
  },
  {
    id: 'paper-preview',
    targetId: 'tour-paper-preview',
    title: '🖱️ Live Paper & Click-to-Edit',
    badge: 'Step 8: Interactive Canvas',
    icon: <MousePointer className="w-5 h-5 text-rose-400" />,
    description:
      'Preview your handwritten document in real-time with full interactive features.',
    tips: [
      'Click directly on any line of text on the paper to edit text in place.',
      'Pin custom handwritten Sticky Notes to margins.',
      'Zoom in/out and Fit-to-Screen controls at top right.',
    ],
    preferredPlacement: 'left',
  },
  {
    id: 'export-buttons',
    targetId: 'tour-export-buttons',
    title: '📥 Ultra-Crisp Export (PNG & PDF)',
    badge: 'Step 9: Export',
    icon: <Download className="w-5 h-5 text-emerald-400" />,
    description:
      'Download your final handwritten assignments with crystal-clear print resolution.',
    tips: [
      'Export PNG: Download ultra-high resolution image files of every page.',
      'Export PDF: Generate a multi-page, print-ready document in A4, A5, or Letter sizes.',
    ],
    preferredPlacement: 'bottom',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Locate target element and compute spotlight rectangle
  const updateTargetPosition = () => {
    if (!isOpen || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(updateTargetPosition, 100);
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, true);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition, true);
      };
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLast) {
      handleSkip();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    localStorage.setItem('handwrite_studio_tour_completed', 'true');
    onClose();
  };

  // Compute Popover Position relative to Target Rect
  const getPopoverStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 60,
      };
    }

    const margin = 16;
    const popoverWidth = 420;
    const placement = step.preferredPlacement || 'bottom';

    let top = targetRect.bottom + margin;
    let left = targetRect.left;

    if (placement === 'bottom') {
      top = targetRect.bottom + margin;
      left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, targetRect.left));
    } else if (placement === 'right') {
      top = Math.max(16, Math.min(window.innerHeight - 380, targetRect.top));
      left = targetRect.right + margin;
      // If right overflows screen, flip to left
      if (left + popoverWidth > window.innerWidth - 16) {
        left = Math.max(16, targetRect.left - popoverWidth - margin);
      }
    } else if (placement === 'left') {
      top = Math.max(16, Math.min(window.innerHeight - 380, targetRect.top));
      left = Math.max(16, targetRect.left - popoverWidth - margin);
    } else if (placement === 'top') {
      top = Math.max(16, targetRect.top - 380 - margin);
      left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, targetRect.left));
    }

    // Ensure within viewport
    top = Math.max(16, Math.min(window.innerHeight - 420, top));
    left = Math.max(16, Math.min(window.innerWidth - popoverWidth - 16, left));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      zIndex: 60,
    };
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      {/* 1. Dark Backdrop Overlay */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] transition-all duration-300" />

      {/* 2. Target Spotlight Highlight Border & Pulse */}
      {targetRect && (
        <div
          className="absolute pointer-events-none transition-all duration-300 rounded-xl"
          style={{
            top: `${targetRect.top - 6}px`,
            left: `${targetRect.left - 6}px`,
            width: `${targetRect.width + 12}px`,
            height: `${targetRect.height + 12}px`,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.75), 0 0 25px rgba(99, 102, 241, 0.8), inset 0 0 15px rgba(99, 102, 241, 0.4)',
            border: '2px solid #818cf8',
            zIndex: 55,
          }}
        >
          {/* Animated Neon Pulse Ping */}
          <div className="absolute -inset-1 rounded-xl border-2 border-indigo-400 opacity-60 animate-ping" />
        </div>
      )}

      {/* 3. Interactive Floating Tooltip Popover */}
      <div
        ref={popoverRef}
        style={getPopoverStyle()}
        className="bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200"
      >
        {/* Popover Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Interactive Tour • {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-[11px] text-slate-400 hover:text-slate-200 font-medium px-2 py-0.5 rounded hover:bg-slate-800 transition"
          >
            Skip Tour ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div
            className="bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Popover Content */}
        <div className="p-5 space-y-3.5 max-h-[360px] overflow-y-auto">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-inner">
              {step.icon}
            </div>

            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {step.badge}
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight">{step.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
            </div>
          </div>

          {/* Tips List */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] text-slate-300">
            {step.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Example Code */}
          {step.example && (
            <div className="p-2.5 bg-slate-950 rounded-lg border border-amber-500/30 text-[11px] font-mono text-amber-300 whitespace-pre-wrap">
              {step.example}
            </div>
          )}
        </div>

        {/* Popover Navigation Footer */}
        <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Step indicator dots */}
          <div className="flex items-center gap-1">
            {TOUR_STEPS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-4 bg-indigo-400'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
          >
            <span>{isLast ? 'Finish Guide 🎉' : 'Next'}</span>
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
