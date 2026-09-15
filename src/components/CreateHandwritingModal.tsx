import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Upload,
  Download,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileImage,
  RefreshCw,
  Eye,
  Type,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PersonalHandwritingProfile, ExtractedGlyph } from '../types';
import {
  generatePrintableTemplate,
  generateDemoSampleSheet,
} from '../utils/templateGenerator';
import {
  extractGlyphsFromImage,
  PreprocessOptions,
  ExtractionResult,
} from '../utils/glyphExtractor';
import { createProfileFromLibrary, saveProfile } from '../utils/personalProfileStorage';

interface CreateHandwritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileCreated: (profile: PersonalHandwritingProfile) => void;
}

type Step = 'upload' | 'preprocess' | 'preview' | 'save';

export const CreateHandwritingModal: React.FC<CreateHandwritingModalProps> = ({
  isOpen,
  onClose,
  onProfileCreated,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preprocessing options
  const [preprocessOptions, setPreprocessOptions] = useState<PreprocessOptions>({
    threshold: 190,
    contrast: 1.15,
    brightness: 0,
    invert: false,
  });

  // Extraction results
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [profileName, setProfileName] = useState<string>('My Personal Handwriting');
  const [testSentence, setTestSentence] = useState<string>('Quick brown fox jumps over 123');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !imageSource) {
      // Pre-load demo sample template by default so user can instantly test or upload their own
      const demoSample = generateDemoSampleSheet();
      setImageSource(demoSample);
      setImageFileName('sample_handwriting_template.png');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, JPEG).');
      return;
    }

    setErrorMessage(null);
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      setImageSource(reader.result as string);
      setCurrentStep('preprocess');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadTemplate = () => {
    const templateDataUrl = generatePrintableTemplate();
    const link = document.createElement('a');
    link.download = 'handwrite-studio-template.png';
    link.href = templateDataUrl;
    link.click();
  };

  const handleLoadDemoSheet = () => {
    setErrorMessage(null);
    const demo = generateDemoSampleSheet();
    setImageSource(demo);
    setImageFileName('demo_handwritten_sheet.png');
    setCurrentStep('preprocess');
  };

  const handleProcessImage = async () => {
    if (!imageSource) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await extractGlyphsFromImage(imageSource, preprocessOptions);
      setExtractionResult(result);
      if (result.totalExtracted === 0) {
        setErrorMessage(
          'No handwriting was detected in the template boxes. Please ensure the sample matches the grid template and increase threshold.'
        );
      } else {
        setCurrentStep('preview');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setErrorMessage('Failed to process handwriting image. Please try another image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndUse = () => {
    if (!extractionResult) return;

    const profile = createProfileFromLibrary(
      profileName,
      extractionResult.library,
      extractionResult.totalExtracted
    );

    saveProfile(profile);
    onProfileCreated(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create My Handwriting</h2>
              <p className="text-xs text-slate-400">
                Transform your own handwritten sample sheet into a personal digital handwriting profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2 sm:gap-6">
            <span
              className={`flex items-center gap-1.5 font-medium ${
                currentStep === 'upload' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">1</span>
              <span>Upload Sample</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span
              className={`flex items-center gap-1.5 font-medium ${
                currentStep === 'preprocess' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">2</span>
              <span>Process Ink</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span
              className={`flex items-center gap-1.5 font-medium ${
                currentStep === 'preview' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">3</span>
              <span>Extracted Glyphs</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span
              className={`flex items-center gap-1.5 font-medium ${
                currentStep === 'save' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">4</span>
              <span>Save & Apply</span>
            </span>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <X className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD & TEMPLATE */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Box: Printable Template Download */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-2">
                      <Download className="w-4 h-4" />
                      <span>Step A: Get Handwriting Template</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Download our structured grid calibration sheet, write the characters with your favorite pen, and take a clear photo or scan.
                    </p>
                    <div className="text-[11px] text-slate-400 bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1">
                      <p>✓ Includes A-Z, a-z, 0-9 & symbols</p>
                      <p>✓ Standardized grid for pixel-perfect extraction</p>
                      <p>✓ Compatible with any dark pen on white paper</p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Download Printable Template (PNG)</span>
                  </button>
                </div>

                {/* Right Box: Upload Your Filled Sample Sheet */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm mb-2">
                      <Upload className="w-4 h-4" />
                      <span>Step B: Upload Your Sample</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Upload your scanned or photographed sheet, or test immediately with our demo handwriting sample.
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/40 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition text-center hover:bg-indigo-950/10 group"
                    >
                      <FileImage className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition mb-2" />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300">
                        Click to select image or drag & drop
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, or JPEG</span>
                    </div>
                  </div>

                  <button
                    onClick={handleLoadDemoSheet}
                    className="w-full py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-xs font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>⚡ Quick Test: Load Demo Handwritten Sample</span>
                  </button>
                </div>
              </div>

              {imageSource && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Loaded Image: <strong className="text-slate-200">{imageFileName}</strong></span>
                    <button
                      onClick={() => setCurrentStep('preprocess')}
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <span>Proceed with this image</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="max-h-56 overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center">
                    <img src={imageSource} alt="Preview" className="max-h-56 object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PREPROCESSING & CONTRAST CLEANUP */}
          {currentStep === 'preprocess' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Preprocessing Controls */}
                <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ink & Background Tuning</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Adjust the sliders below so dark ink lines stand out crisply and the paper background turns pure white.
                  </p>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Background Threshold</span>
                      <span className="text-indigo-400 font-mono">{preprocessOptions.threshold}</span>
                    </div>
                    <input
                      type="range"
                      min={100}
                      max={240}
                      step={2}
                      value={preprocessOptions.threshold}
                      onChange={(e) =>
                        setPreprocessOptions((prev) => ({ ...prev, threshold: Number(e.target.value) }))
                      }
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300">Ink Contrast</span>
                      <span className="text-indigo-400 font-mono">{preprocessOptions.contrast.toFixed(2)}×</span>
                    </div>
                    <input
                      type="range"
                      min={0.8}
                      max={2.0}
                      step={0.05}
                      value={preprocessOptions.contrast}
                      onChange={(e) =>
                        setPreprocessOptions((prev) => ({ ...prev, contrast: Number(e.target.value) }))
                      }
                      className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleProcessImage}
                      disabled={isProcessing}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Extracting Characters...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Extract Personal Glyphs</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Image Preview Canvas */}
                <div className="md:col-span-2 bg-slate-950 rounded-xl border border-slate-800 p-3 flex flex-col items-center justify-center min-h-[300px]">
                  {imageSource ? (
                    <img
                      src={imageSource}
                      alt="Sample Template"
                      className="max-h-[360px] w-auto object-contain rounded-lg border border-slate-800"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No image loaded</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EXTRACTED GLYPHS PREVIEW */}
          {currentStep === 'preview' && extractionResult && (
            <div className="space-y-6">
              {/* Extraction Metrics Bar */}
              <div className="flex items-center justify-between bg-slate-950/80 px-4 py-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">
                      {extractionResult.totalExtracted} Personal Glyphs Extracted
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Successfully segmented characters from calibration grid
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep('save')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md flex items-center gap-1.5 transition"
                >
                  <span>Continue to Save Profile</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Extracted Glyphs Grid Preview */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Extracted Glyph Library
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-2 max-h-56 overflow-y-auto p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  {Object.entries(extractionResult.library).map(([char, glyphList]) => (
                    <div
                      key={char}
                      className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/95 text-slate-900 border border-slate-300 shadow-sm relative group"
                    >
                      <span className="absolute top-0.5 left-1 text-[9px] font-bold text-slate-400">
                        {char}
                      </span>
                      <img
                        src={glyphList[0]?.dataUrl}
                        alt={char}
                        className="h-7 w-auto object-contain mt-2"
                      />
                      {glyphList.length > 1 && (
                        <span className="absolute bottom-0.5 right-1 text-[8px] bg-indigo-100 text-indigo-700 px-1 rounded font-bold">
                          ×{glyphList.length}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Test Rendering Box */}
              <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Live Handwritten Test Render</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Rendered using your extracted glyphs</span>
                </div>

                <input
                  type="text"
                  value={testSentence}
                  onChange={(e) => setTestSentence(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-800 outline-none focus:border-indigo-500"
                  placeholder="Type anything to test your handwriting..."
                />

                {/* Rendered Preview Box */}
                <div className="p-4 bg-white text-slate-900 rounded-xl border border-slate-300 flex items-center flex-wrap gap-1 min-h-[56px]">
                  {testSentence.split('').map((c, i) => {
                    if (c === ' ') return <span key={i} className="w-2" />;
                    const glyphList = extractionResult.library[c];
                    if (glyphList && glyphList.length > 0) {
                      return (
                        <img
                          key={i}
                          src={glyphList[0].dataUrl}
                          alt={c}
                          className="h-6 w-auto object-contain inline-block align-baseline"
                        />
                      );
                    }
                    // Fallback to text
                    return (
                      <span key={i} className="font-caveat text-xl leading-none">
                        {c}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: SAVE PROFILE */}
          {currentStep === 'save' && extractionResult && (
            <div className="space-y-6 max-w-lg mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">Name Your Handwriting Style</h3>
                <p className="text-xs text-slate-400">
                  Save this personal handwriting profile to your browser's local library.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Profile Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g., My Everyday Penmanship"
                  className="w-full bg-slate-950 text-slate-100 text-sm px-4 py-2.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>Extracted Glyphs:</span>
                  <span className="text-slate-200 font-bold">{extractionResult.totalExtracted} characters</span>
                </div>
                <div className="flex justify-between">
                  <span>Supported Alphabets:</span>
                  <span className="text-slate-200">Uppercase A-Z, Lowercase a-z, 0-9, Symbols</span>
                </div>
                <div className="flex justify-between">
                  <span>Fallback Mode:</span>
                  <span className="text-emerald-400 font-medium">Auto fallback for missing symbols</span>
                </div>
              </div>

              <button
                onClick={handleSaveAndUse}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition active:scale-98 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save & Use This Handwriting</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0 text-xs">
          {currentStep !== 'upload' ? (
            <button
              onClick={() => {
                if (currentStep === 'preprocess') setCurrentStep('upload');
                else if (currentStep === 'preview') setCurrentStep('preprocess');
                else if (currentStep === 'save') setCurrentStep('preview');
              }}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Cancel
            </button>
          )}

          {currentStep === 'upload' && imageSource && (
            <button
              onClick={() => setCurrentStep('preprocess')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center gap-1.5 transition"
            >
              <span>Continue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
