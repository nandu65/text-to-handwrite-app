import React, { useState, useRef, useEffect } from 'react';
import { HandwritingStyle, FONT_OPTIONS, INK_COLORS, PersonalHandwritingProfile } from './types';
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import { Controls } from './components/Controls';
import { PaperPreview } from './components/PaperPreview';
import { CreateHandwritingModal } from './components/CreateHandwritingModal';
import { AIScanModal } from './components/AIScanModal';
import { GuidedTour } from './components/GuidedTour';
import { exportAllPagesToPNG, exportAllPagesToPDF } from './utils/exportUtils';
import {
  getSavedProfiles,
  getActiveProfileId,
  setActiveProfileId,
  deleteProfile as removeProfileStorage,
} from './utils/personalProfileStorage';

const SAMPLES: Record<'repeated' | 'essay' | 'letter' | 'notes', string> = {
  repeated: `__Biology Chapter 4: Cellular Respiration__

1. Core Definition:
   -> Cells convert biochemical energy from ==nutrients into ATP==.
   -> Glycolysis occurs in the cytoplasm and is ~~anaerobic~~ ((crucial for all cells)).

2. Study Checklist:
   [x] Review Krebs cycle diagram
   [x] Calculate net ATP yield per glucose molecule
   [ ] Prepare lab report for Friday

Teacher Note: Great effort on this summary! Keep the handwriting clear.`,
  essay: `__The Influence of Literature on Human Empathy__

Literature has long served as a mirror to the human soul, allowing us to traverse boundaries of time, geography, and culture. Through the written word, we step into minds fundamentally different from our own.

Psychological studies indicate that reading ==narrative fiction enhances theory of mind== — the capacity to understand others' mental states, beliefs, and emotions.

Ultimately, storytelling is not merely ~~idle pastime~~ entertainment; it is an ((evolutionary mechanism)) for building communal bonds and fostering deeper collective compassion.`,
  letter: `Dearest Eleanor,

I hope this letter finds you in wonderful health and high spirits.

The autumn leaves have begun to carpet the cobblestone streets here in ==golden hues==. Yesterday evening, as I walked by the riverbank, the air was crisp and scented with pine and rain.

I often think of our lively conversations by the fireplace and look forward with ((great excitement)) to our reunion next month. Please give my warmest regards to everyone at home.

With heartfelt affection,
Arthur`,
  notes: `__Physics Lecture: Principles of Wave-Particle Duality__

1. Core Concept:
   -> Light exhibits both wave-like (interference) and particle-like properties.
   -> De Broglie Equation: ==λ = h / p==, where h is Planck's constant.

2. Experimental Observations:
   [x] Young's Double-Slit Experiment confirms wave interference.
   [x] Photoelectric effect proved ((photons carry discrete energy E = hf)).
   [ ] Complete problem set #4 before Thursday's exam.`,
};

export function App() {
  const [text, setText] = useState<string>(SAMPLES.repeated);
  const [profiles, setProfiles] = useState<PersonalHandwritingProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<PersonalHandwritingProfile | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isAIScanOpen, setIsAIScanOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    return !localStorage.getItem('handwrite_studio_tour_completed');
  });

  const [style, setStyle] = useState<HandwritingStyle>({
    fontFamily: FONT_OPTIONS[0].fontFamily,
    fontName: FONT_OPTIONS[0].name,
    fontSize: 26,
    lineSpacing: 1.85,
    letterSpacing: -0.5,
    wordSpacing: 1.0,
    sentenceSpacing: 1.0,
    paragraphSpacing: 0,
    paragraphIndent: 0,
    sectionSpacing: 0,
    cursiveSlant: 10,
    messiness: 1.2,
    connectedCursive: true,
    inkBleed: true,
    inkFade: true,
    paperTexture: 'white',
    edgeStyle: 'spiral',
    scannerLighting: false,
    cameraLightingTone: 'neutral',
    cameraDeskShadow: 'floating',
    pageShadowIntensity: 55,
    cameraPhoneShadow: false,
    cameraPhoneShadowIntensity: 0,
    deskSurface: 'none',
    paperCreases: false,
    paperFoldingIntensity: 0,
    paperFoldType: 'quad-cross',
    highlighterColor: 'yellow',
    inkColor: INK_COLORS[0].value, // Dark Slate
    inkOpacity: 0.95,
    paperType: 'ruled',
    pageSize: 'A4',
    paperColor: '#ffffff',
    marginTopMm: 24,
    marginLeftMm: 25,
    marginRightMm: 20,
    marginBottomMm: 22,
    showRedMargin: true,
    subtleVariation: true,
    glyphVariation: true,
    seed: 42,
    variationIntensity: 1.1,
    lineDrift: true,
    wordSpacingVariation: true,
    usePersonalHandwriting: false,
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load profiles on mount
  useEffect(() => {
    const saved = getSavedProfiles();
    setProfiles(saved);

    const activeId = getActiveProfileId();
    if (activeId) {
      const match = saved.find((p) => p.id === activeId);
      if (match) {
        setActiveProfile(match);
        setStyle((prev) => ({
          ...prev,
          usePersonalHandwriting: true,
          activeProfileId: match.id,
        }));
      }
    }
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3200);
  };

  const handleStyleChange = (updated: Partial<HandwritingStyle>) => {
    setStyle((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectProfile = (profile: PersonalHandwritingProfile | null) => {
    setActiveProfile(profile);
    if (profile) {
      setActiveProfileId(profile.id);
      setStyle((prev) => ({
        ...prev,
        usePersonalHandwriting: true,
        activeProfileId: profile.id,
        letterSpacing: profile.characterSpacingMultiplier ? (profile.characterSpacingMultiplier - 1) * 10 : prev.letterSpacing,
        wordSpacing: profile.wordSpacingMultiplier || prev.wordSpacing,
        lineSpacing: profile.lineSpacingMultiplier || prev.lineSpacing,
      }));
      showStatus(`Applied profile: ${profile.name}`);
    } else {
      setActiveProfileId(null);
      setStyle((prev) => ({
        ...prev,
        usePersonalHandwriting: false,
        activeProfileId: undefined,
      }));
    }
  };

  const handleProfileCreated = (profile: PersonalHandwritingProfile) => {
    setProfiles((prev) => [profile, ...prev.filter((p) => p.id !== profile.id)]);
    handleSelectProfile(profile);
    showStatus(`Personal handwriting "${profile.name}" created with ${profile.totalExtracted} extracted glyphs!`);
  };

  const handleDeleteProfile = (profileId: string) => {
    removeProfileStorage(profileId);
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    if (activeProfile && activeProfile.id === profileId) {
      handleSelectProfile(null);
    }
    showStatus('Custom handwriting profile deleted');
  };

  const handleClear = () => {
    setText('');
  };

  const handleLoadSample = (sampleKey: 'repeated' | 'essay' | 'letter' | 'notes') => {
    setText(SAMPLES[sampleKey]);
  };

  const handleExportPNG = async () => {
    if (isExporting) return;
    const validPages = pageRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (validPages.length === 0) return;

    try {
      setIsExporting(true);
      showStatus('Rendering ultra-crisp handwritten PNG pages...');
      await exportAllPagesToPNG(validPages, `handwritten-notes-${Date.now()}`);
      showStatus('Downloaded PNG image pages successfully!');
    } catch (err) {
      console.error('PNG export failed:', err);
      showStatus('Failed to export PNG. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    const validPages = pageRefs.current.filter((el): el is HTMLDivElement => el !== null);
    if (validPages.length === 0) return;

    try {
      setIsExporting(true);
      showStatus('Generating multi-page PDF document...');
      await exportAllPagesToPDF(validPages, style.pageSize, `handwritten-notes-${Date.now()}`);
      showStatus('Downloaded PDF document successfully!');
    } catch (err) {
      console.error('PDF export failed:', err);
      showStatus('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleApplyScannedText = (scannedText: string, mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setText(scannedText);
    } else {
      setText((prev) => (prev ? `${prev}\n\n${scannedText}` : scannedText));
    }
    showStatus('Applied AI scanned handwriting to document!');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Top Application Header Bar */}
      <Header
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onOpenCreateHandwriting={() => setIsCreateModalOpen(true)}
        onOpenTour={() => setIsTourOpen(true)}
        onOpenAIScan={() => setIsAIScanOpen(true)}
        isExporting={isExporting}
        pageCount={pageCount}
        hasPersonalProfile={style.usePersonalHandwriting && activeProfile !== null}
      />

      {/* Main Split Layout: Left = Editor & Controls, Right = Paper Preview */}
      <main className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Side: Text Input & Document Controls */}
        <section className="w-full md:w-[480px] lg:w-[520px] shrink-0 flex flex-col border-r border-slate-800 bg-slate-900 z-10">
          <div className="flex-1 min-h-0">
            <Editor
              text={text}
              onChange={setText}
              onClear={handleClear}
              onLoadSample={handleLoadSample}
            />
          </div>

          <Controls
            style={style}
            onChange={handleStyleChange}
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={handleSelectProfile}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onDeleteProfile={handleDeleteProfile}
          />
        </section>

        {/* Right Side: Paper Preview Canvas */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden relative">
          <PaperPreview
            text={text}
            style={style}
            pageRefs={pageRefs}
            activeProfile={activeProfile}
            onPageCountChange={setPageCount}
            onTextChange={setText}
          />
        </section>
      </main>

      {/* Toast Notification Status */}
      {statusMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-800 text-white border border-indigo-500/40 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Create My Handwriting Feature Modal */}
      <CreateHandwritingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProfileCreated={handleProfileCreated}
      />

      {/* AI Optical Handwriting Recognition Modal */}
      <AIScanModal
        isOpen={isAIScanOpen}
        onClose={() => setIsAIScanOpen(false)}
        onApplyText={handleApplyScannedText}
      />

      {/* Interactive Guided Tour Walkthrough */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}

export default App;
