import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Eye,
  Sliders,
} from 'lucide-react';
import { recognizeHandwritingImage, AIScanProgress, AIScanResult } from '../utils/aiVisionScanner';

interface AIScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyText: (scannedText: string, mode: 'replace' | 'append') => void;
}

export const AIScanModal: React.FC<AIScanModalProps> = ({
  isOpen,
  onClose,
  onApplyText,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [progress, setProgress] = useState<AIScanProgress | null>(null);
  const [result, setResult] = useState<AIScanResult | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [insertMode, setInsertMode] = useState<'replace' | 'append'>('replace');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showPreprocessed, setShowPreprocessed] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartScan = async () => {
    if (!selectedImage) return;

    try {
      setIsScanning(true);
      setErrorMsg(null);
      setResult(null);

      const scanRes = await recognizeHandwritingImage(selectedImage, (prog) => {
        setProgress(prog);
      });

      setResult(scanRes);
      setEditedText(scanRes.text);
    } catch (err: any) {
      console.error('AI Scan Error:', err);
      setErrorMsg(err?.message || 'Failed to scan image. Please try again with a clearer photo.');
    } finally {
      setIsScanning(false);
      setProgress(null);
    }
  };

  const handleApply = () => {
    if (!editedText.trim()) return;
    onApplyText(editedText.trim(), insertMode);
    onClose();
  };

  const handleCopy = () => {
    if (!editedText) return;
    navigator.clipboard.writeText(editedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResult(null);
    setEditedText('');
    setProgress(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>AI Optical Handwriting Recognition</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  WebAssembly Offline ML
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Snap or upload physical handwritten notes to convert into digital text with authentic handwriting reproduction.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Upload / Image Selection Step */}
          {!result && (
            <div className="space-y-4">
              {!selectedImage ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-950/40 hover:bg-slate-950/70 transition rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 group-hover:bg-indigo-600/20 transition">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Upload Photo of Handwritten Notes
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mb-3">
                    Drag and drop your assignment, diary, or paper notes (PNG, JPG, WebP), or click to browse.
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Client-Side Privacy: Processed completely in your browser</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected Image Preview & Scan Action */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 max-h-80 flex items-center justify-center group">
                    <img
                      src={selectedImage}
                      alt="Handwritten source note"
                      className="max-h-80 w-auto object-contain"
                    />

                    {/* Laser scanning beam overlay when scanning */}
                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_#818cf8] animate-pulse absolute top-1/2 -translate-y-1/2" />
                        <div className="absolute inset-0 bg-indigo-500/10 animate-pulse" />
                      </div>
                    )}

                    {!isScanning && (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur transition"
                        title="Choose a different image"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  {isScanning && progress && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-indigo-300 flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                          <span>{progress.status}</span>
                        </span>
                        <span className="font-mono text-slate-400 font-bold">
                          {Math.round(progress.progress * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-200"
                          style={{ width: `${Math.round(progress.progress * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {!isScanning && (
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                      >
                        Change Image
                      </button>
                      <button
                        type="button"
                        onClick={handleStartScan}
                        className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Run AI Optical Recognition</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Results Step: Side-by-Side Review */}
          {result && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Image Source */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Original Document</span>
                  {result.preprocessedImage && (
                    <button
                      type="button"
                      onClick={() => setShowPreprocessed(!showPreprocessed)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{showPreprocessed ? 'View Original' : 'View AI Contrast View'}</span>
                    </button>
                  )}
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-72 flex items-center justify-center relative">
                  <img
                    src={showPreprocessed && result.preprocessedImage ? result.preprocessedImage : result.originalImage}
                    alt="Document source"
                    className="max-h-72 w-auto object-contain"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Confidence: <strong className="text-emerald-400">{result.confidence}%</strong></span>
                  <span>{result.wordCount} words • {result.lineCount} lines</span>
                </div>
              </div>

              {/* Right Column: Editable Transcribed Text */}
              <div className="space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Recognized Structured Text</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  placeholder="Recognized text will appear here..."
                  className="flex-1 w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-3.5 text-xs text-slate-200 font-mono resize-none outline-none leading-relaxed"
                />

                <div className="flex items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="insertMode"
                        checked={insertMode === 'replace'}
                        onChange={() => setInsertMode('replace')}
                        className="accent-indigo-600"
                      />
                      <span>Replace Editor</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="insertMode"
                        checked={insertMode === 'append'}
                        onChange={() => setInsertMode('append')}
                        className="accent-indigo-600"
                      />
                      <span>Append</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                    >
                      Scan Another
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5 active:scale-95"
                    >
                      <span>Insert into Notebook</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
