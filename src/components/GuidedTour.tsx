import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  CheckCircle2,
  HelpCircle,
  Eye,
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
    icon: <Edit3 className="w-4 h-4 text-indigo-400" />,
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
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
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
    preferredPlacement: 'right',
  },
  {
    id: 'create-handwriting',
    targetId: 'tour-create-handwriting',
    title: '🌟 Create My Handwriting Font',
    badge: 'Step 3: Personal Handwriting',
    icon: <Type className="w-4 h-4 text-emerald-400" />,
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
    icon: <Scroll className="w-4 h-4 text-amber-400" />,
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
    icon: <Layers className="w-4 h-4 text-blue-400" />,
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
    icon: <MoveVertical className="w-4 h-4 text-indigo-400" />,
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
    icon: <Camera className="w-4 h-4 text-violet-400" />,
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
    icon: <MousePointer className="w-4 h-4 text-rose-400" />,
    description:
      'Preview your handwritten document in real-time with full interactive features.',
    tips: [
      'Click directly on any line of text on the paper to edit text in place.',
      'Auto-formats indentation, margin wrapping, and line ruling.',
      'Zoom in/out and Fit-to-Screen controls at top right.',
    ],
    preferredPlacement: 'left',
  },
  {
    id: 'export-buttons',
    targetId: 'tour-export-buttons',
    title: '📥 Ultra-Crisp Export (PNG & PDF)',
    badge: 'Step 9: Export',
    icon: <Download className="w-4 h-4 text-emerald-400" />,
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
  const animFrameRef = useRef<number | null>(null);

  const step = TOUR_STEPS[currentStep];
  const isLast = currentStep === TOUR_STEPS.length - 1;

  // Locate target element and compute spotlight rectangle
  const updateTargetPosition = useCallback(() => {
    if (!isOpen || !step) return;
    const el = document.getElementById(step.targetId);
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isOpen, step]);

  // Scroll target element into view smoothly when step changes
  useEffect(() => {
    if (!isOpen || !step) return;

    const el = document.getElementById(step.targetId);
    if (el) {
      // Smoothly scroll container or window to make element visible
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }

    // Continuously update position during smooth scroll animation
    let frames = 0;
    const loop = () => {
      updateTargetPosition();
      frames++;
      if (frames < 40) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };
    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, currentStep, step, updateTargetPosition]);

  // Listen for window resize and scroll events
  useEffect(() => {
    if (!isOpen) return;

    const onScrollOrResize = () => {
      updateTargetPosition();
    };

    window.addEventListener('resize', onScrollOrResize, { passive: true });
    window.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true });

    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [isOpen, updateTargetPosition]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') handleSkip();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, isLast]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (isLast) {
      handleSkip();
    } else {
      setCurrentStep((prev) => Math.min(TOUR_STEPS.length - 1, prev + 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    localStorage.setItem('handwrite_studio_tour_completed', 'true');
    onClose();
  };

  // Smart non-occluding popover positioning
  const getPopoverStyle = (): React.CSSProperties => {
    const cardWidth = Math.min(380, window.innerWidth - 32);
    const estimatedCardHeight = 320; // Compact height
    const margin = 18;

    if (!targetRect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`,
        maxHeight: 'calc(100vh - 40px)',
        zIndex: 70,
      };
    }

    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    let placement = step.preferredPlacement || 'right';

    // Auto-detect best side to NEVER occlude the target element
    const isTargetOnLeft = targetRect.left + targetRect.width / 2 < windowW * 0.5;
    const isTargetNearTop = targetRect.top < 110;

    if (isTargetNearTop && (step.id === 'create-handwriting' || step.id === 'export-buttons')) {
      placement = 'bottom';
    } else if (isTargetOnLeft) {
      placement = 'right';
    } else {
      placement = 'left';
    }

    let left = 20;
    let top = 20;

    if (placement === 'right') {
      left = targetRect.right + margin;
      // If right side doesn't fit, clamp or flip
      if (left + cardWidth > windowW - 16) {
        left = Math.max(16, targetRect.left - cardWidth - margin);
      }
      // Vertically align with target center
      const targetCenterY = targetRect.top + targetRect.height / 2;
      top = targetCenterY - estimatedCardHeight / 2;
    } else if (placement === 'left') {
      left = targetRect.left - cardWidth - margin;
      if (left < 16) {
        left = Math.max(16, targetRect.right + margin);
      }
      const targetCenterY = targetRect.top + targetRect.height / 2;
      top = targetCenterY - estimatedCardHeight / 2;
    } else if (placement === 'bottom') {
      top = targetRect.bottom + margin;
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    } else if (placement === 'top') {
      top = targetRect.top - estimatedCardHeight - margin;
      left = targetRect.left + targetRect.width / 2 - cardWidth / 2;
    }

    // Viewport bounds clamping - GUARANTEE card is 100% on screen
    const maxTop = Math.max(16, windowH - estimatedCardHeight - 24);
    const clampedTop = Math.max(16, Math.min(maxTop, top));
    const clampedLeft = Math.max(16, Math.min(windowW - cardWidth - 16, left));

    return {
      position: 'fixed',
      top: `${clampedTop}px`,
      left: `${clampedLeft}px`,
      width: `${cardWidth}px`,
      maxHeight: 'calc(100vh - 32px)',
      zIndex: 70,
    };
  };

  const pad = 6;
  const targetX = targetRect ? Math.max(0, targetRect.left - pad) : 0;
  const targetY = targetRect ? Math.max(0, targetRect.top - pad) : 0;
  const targetW = targetRect ? targetRect.width + pad * 2 : 0;
  const targetH = targetRect ? targetRect.height + pad * 2 : 0;

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto overflow-hidden animate-in fade-in duration-200">
      {/* 1. Crystal-Clear Spotlight Mask Overlay (0% blur, dark ambient shade outside target) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 51 }}>
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White = dark overlay visible */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout = 100% transparent & crystal-clear over target */}
            {targetRect && (
              <rect
                x={targetX}
                y={targetY}
                width={targetW}
                height={targetH}
                rx="10"
                ry="10"
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Darkened backdrop with cutout */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(3, 7, 18, 0.76)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* 2. Illuminated Glowing Target Box & Cyber Corners */}
      {targetRect && (
        <div
          className="fixed pointer-events-none transition-all duration-200 rounded-xl"
          style={{
            top: `${targetY}px`,
            left: `${targetX}px`,
            width: `${targetW}px`,
            height: `${targetH}px`,
            border: '2px solid #818cf8',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.6), inset 0 0 15px rgba(99, 102, 241, 0.25)',
            zIndex: 55,
          }}
        >
          {/* Subtle animated neon pulse halo */}
          <div className="absolute -inset-1 rounded-xl border border-indigo-400/60 animate-pulse" />

          {/* Glowing Target Corner Accents */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

          {/* Floating Live Badge */}
          <div className="absolute -top-3 left-3 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>Active Feature</span>
          </div>
        </div>
      )}

      {/* 3. Non-Occluding Floating Explanation Card */}
      <div
        ref={popoverRef}
        style={getPopoverStyle()}
        className="bg-slate-900/95 backdrop-blur-md border border-indigo-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200 text-slate-100"
      >
        {/* Card Header (Always Pinned at Top) */}
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Interactive Tour • {currentStep + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white font-medium px-2 py-0.5 rounded hover:bg-slate-800 transition"
          >
            <span>Skip</span>
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1 shrink-0">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 h-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Card Body (Scrollable if height is constrained) */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 min-h-0 text-xs custom-scrollbar">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/90 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-inner">
              {step.icon}
            </div>

            <div className="space-y-0.5 min-w-0 flex-1">
              <span className="inline-block text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {step.badge}
              </span>
              <h3 className="text-sm font-bold text-white tracking-tight leading-tight">{step.title}</h3>
              <p className="text-[11.5px] text-slate-300 leading-snug pt-0.5">{step.description}</p>
            </div>
          </div>

          {/* Tips Bullet List */}
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/90 space-y-1 text-[11px] text-slate-300">
            {step.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-1.5 leading-tight">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>

          {/* Example Code Snippet */}
          {step.example && (
            <div className="p-2 bg-slate-950 rounded-lg border border-amber-500/30 text-[10.5px] font-mono text-amber-300 whitespace-pre-wrap leading-tight">
              {step.example}
            </div>
          )}
        </div>

        {/* Card Footer (Always Pinned at Bottom with Previous / Next) */}
        <div className="px-4 py-2.5 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition"
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
                    ? 'w-4 bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]'
                    : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/40 transition active:scale-95"
          >
            <span>{isLast ? 'Done 🎉' : 'Next'}</span>
            {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
