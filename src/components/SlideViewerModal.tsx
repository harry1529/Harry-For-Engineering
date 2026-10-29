import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Copy,
  Check,
  FileText,
  Sparkles,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { SlideDeck } from '../types';
import { BRANCHES_INFO } from '../data/mockData';

interface SlideViewerModalProps {
  deck: SlideDeck | null;
  onClose: () => void;
  onDownload: (deck: SlideDeck) => void;
}

export const SlideViewerModal: React.FC<SlideViewerModalProps> = ({
  deck,
  onClose,
  onDownload,
}) => {
  if (!deck) return null;

  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'slides' | 'pdf' | 'derivations'>('slides');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const branchInfo = BRANCHES_INFO[deck.branch];

  // Keyboard navigation for slides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        setCurrentSlideIndex((prev) => Math.min(deck.slideCount, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentSlideIndex((prev) => Math.max(1, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, isFullscreen, onClose]);

  const copyLatex = (latex: string, index: number) => {
    navigator.clipboard.writeText(latex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto">
      <div
        className={`bg-[#0D0F17] border-2 border-[#262A36] w-full flex flex-col transition-all duration-200 ${
          isFullscreen
            ? 'fixed inset-0 z-50 border-0 h-screen'
            : 'max-w-6xl max-h-[92vh] h-[850px] hard-shadow-cobalt'
        }`}
      >
        {/* Top Blueprint Control Bar */}
        <div className="bg-[#121318] border-b border-[#262A36] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
          {/* Deck Identification */}
          <div className="flex items-center space-x-3">
            <span
              className="w-3 h-3 inline-block"
              style={{ backgroundColor: branchInfo.hex }}
            ></span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-[#F8FAFC]">
                  [{deck.branch}] {deck.subjectCode}
                </span>
                <span className="text-[#434655]">/</span>
                <span className="font-mono text-xs text-[#F59E0B]">{deck.unitTitle}</span>
              </div>
              <h2 className="font-display font-bold text-sm sm:text-base text-[#F8FAFC] line-clamp-1">
                {deck.subjectName}
              </h2>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center space-x-1 bg-[#090A0F] border border-[#262A36] p-0.5">
            <button
              onClick={() => setActiveTab('slides')}
              className={`px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'slides'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#8D90A0] hover:text-white'
              }`}
            >
              PRESENTATION
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'pdf'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#8D90A0] hover:text-white'
              }`}
            >
              EMBEDDED PDF
            </button>
            <button
              onClick={() => setActiveTab('derivations')}
              className={`px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all ${
                activeTab === 'derivations'
                  ? 'bg-[#2563EB] text-white'
                  : 'text-[#8D90A0] hover:text-white'
              }`}
            >
              DERIVATIONS ({deck.derivations.length})
            </button>
          </div>

          {/* Controls: Zoom, Fullscreen, Download, Close */}
          <div className="flex items-center space-x-2">
            {activeTab === 'slides' && (
              <div className="hidden sm:flex items-center space-x-1 border border-[#262A36] bg-[#090A0F] px-1 py-0.5 text-xs font-mono">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 25))}
                  className="p-1 text-[#8D90A0] hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-1 text-[#C3C6D7]">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(150, z + 25))}
                  className="p-1 text-[#8D90A0] hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 text-[#8D90A0] hover:text-white"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => onDownload(deck)}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-[#1A1B21] text-[#E3E1E9] border border-[#262A36] hover:border-[#8D90A0] hover:text-white flex items-center space-x-1"
              title="Download PDF Document"
            >
              <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden md:inline">DOWNLOAD .PDF</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-[#8D90A0] hover:text-white border border-[#262A36] bg-[#1A1B21]"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#8D90A0] hover:text-[#EF4444] border border-[#262A36] bg-[#1A1B21]"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Viewer Body */}
        <div className="flex-1 bg-[#090A0F] overflow-hidden flex flex-col relative bg-blueprint-grid">
          {/* TAB 1: PRESENTATION SLIDE MODE */}
          {activeTab === 'slides' && (
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 overflow-auto items-center">
              {/* Slide Card Canvas with simulated presentation deck */}
              <div
                className="w-full max-w-4xl bg-[#121318] border-2 border-[#262A36] hard-shadow-cobalt flex flex-col justify-between my-auto transition-transform"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  minHeight: '440px',
                }}
              >
                {/* Slide Top Banner */}
                <div className="bg-[#1A1B21] border-b border-[#262A36] px-4 py-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 inline-block"
                      style={{ backgroundColor: branchInfo.hex }}
                    ></span>
                    <span className="font-bold text-[#F8FAFC]">
                      {deck.subjectCode} · {deck.subjectName}
                    </span>
                  </div>
                  <div className="text-[#8D90A0]">
                    SLIDE <span className="text-[#2563EB] font-bold">{currentSlideIndex}</span> / {deck.slideCount}
                  </div>
                </div>

                {/* Slide Content Layout */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center">
                  <div className="text-xs font-mono uppercase text-[#F59E0B] font-bold tracking-widest mb-2">
                    {deck.unitTitle}
                  </div>
                  <h3 className="font-display font-bold text-2xl sm:text-3xl text-[#F8FAFC] mb-4">
                    {currentSlideIndex === 1
                      ? `Overview: ${deck.topicSummary.split(',')[0]}`
                      : currentSlideIndex % 2 === 0
                      ? `Formal Derivation & Proof Invariants`
                      : `Architectural State & Technical Specifications`}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-[#C3C6D7] mb-6">
                    <div className="bg-[#090A0F] p-4 border border-[#262A36]">
                      <div className="text-[11px] font-mono text-[#8D90A0] uppercase mb-1 flex items-center">
                        <BookOpen className="w-3 h-3 mr-1 text-[#2563EB]" />
                        KEY CONCEPT
                      </div>
                      <p className="leading-relaxed">
                        {deck.topicSummary}
                      </p>
                    </div>

                    <div className="bg-[#090A0F] p-4 border border-[#262A36]">
                      <div className="text-[11px] font-mono text-[#8D90A0] uppercase mb-1 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-[#F59E0B]" />
                        GOVERNING THEOREM
                      </div>
                      <div className="font-mono text-xs text-[#2563EB] mb-2 font-bold">
                        {deck.derivations[0]?.formula || 'Invariant Proof Bound'}
                      </div>
                      <p className="text-[11px] text-[#8D90A0]">
                        {deck.derivations[0]?.explanation || 'Universal mathematical guarantee for system stability and complexity.'}
                      </p>
                    </div>
                  </div>

                  {/* Blueprint Coordinate Strip */}
                  <div className="border-t border-[#262A36] pt-3 flex items-center justify-between text-[11px] font-mono text-[#8D90A0]">
                    <span>BRANCH CLEARANCE: [{deck.branch}]</span>
                    <span>LECTURER: {deck.uploadedBy}</span>
                    <span>SYS.REV // 2026</span>
                  </div>
                </div>

                {/* Slide Bottom Bar */}
                <div className="bg-[#1A1B21] border-t border-[#262A36] px-4 py-2 flex items-center justify-between text-[11px] font-mono text-[#8D90A0]">
                  <span>CONFIDENTIAL ACADEMIC BLUEPRINT</span>
                  <span>PAGE {currentSlideIndex} OF {deck.slideCount}</span>
                </div>
              </div>

              {/* Slide Navigation Carousel Controls */}
              <div className="w-full max-w-4xl mt-4 flex items-center justify-between bg-[#121318] border border-[#262A36] px-4 py-2.5">
                <button
                  onClick={() => setCurrentSlideIndex((i) => Math.max(1, i - 1))}
                  disabled={currentSlideIndex === 1}
                  className="px-3 py-1.5 text-xs font-mono uppercase font-bold border border-[#262A36] bg-[#090A0F] text-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#2563EB] flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREV SLIDE</span>
                </button>

                {/* Slide Range Slider */}
                <div className="flex items-center space-x-3 flex-1 max-w-md mx-4">
                  <input
                    type="range"
                    min="1"
                    max={deck.slideCount}
                    value={currentSlideIndex}
                    onChange={(e) => setCurrentSlideIndex(Number(e.target.value))}
                    className="w-full accent-[#2563EB] bg-[#262A36] h-1.5 rounded-none cursor-pointer"
                  />
                  <span className="text-xs font-mono text-[#F8FAFC] whitespace-nowrap">
                    {currentSlideIndex} / {deck.slideCount}
                  </span>
                </div>

                <button
                  onClick={() => setCurrentSlideIndex((i) => Math.min(deck.slideCount, i + 1))}
                  disabled={currentSlideIndex === deck.slideCount}
                  className="px-3 py-1.5 text-xs font-mono uppercase font-bold border border-[#262A36] bg-[#090A0F] text-[#F8FAFC] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[#2563EB] flex items-center space-x-1"
                >
                  <span>NEXT SLIDE</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EMBEDDED REAL PDF VIEWER */}
          {activeTab === 'pdf' && (
            <div className="flex-1 flex flex-col p-4">
              <div className="bg-[#121318] border border-[#262A36] px-4 py-2 mb-2 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 text-[#C3C6D7]">
                  <FileText className="w-4 h-4 text-[#2563EB]" />
                  <span>LIVE REPOSITORY DOCUMENT: <span className="text-white font-bold">{deck.subjectCode} - {deck.unitTitle}</span></span>
                </div>
                <a
                  href={deck.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-[#F59E0B] hover:underline flex items-center space-x-1"
                >
                  <span>OPEN IN STANDALONE TAB</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Embedded PDF iframe / object */}
              <div className="flex-1 border-2 border-[#262A36] bg-[#121318] relative min-h-[480px]">
                <iframe
                  src={`${deck.pdfUrl}#toolbar=1&navpanes=0`}
                  title={`${deck.subjectName} PDF Viewer`}
                  className="w-full h-full border-0"
                />
              </div>
            </div>
          )}

          {/* TAB 3: DERIVATIONS & MATHEMATICAL SPECIFICATIONS */}
          {activeTab === 'derivations' && (
            <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
              <div className="mb-6">
                <div className="text-xs font-mono uppercase text-[#F59E0B] font-bold mb-1">
                  TECHNICAL SPECIFICATION & DERIVATION REPOSITORY
                </div>
                <h3 className="font-display font-bold text-2xl text-[#F8FAFC]">
                  Mathematical Formulations: {deck.subjectName}
                </h3>
                <p className="text-sm text-[#C3C6D7] mt-1">
                  Rigorous analytical equations, LaTeX markup, and governing theorems for {deck.unitTitle}.
                </p>
              </div>

              <div className="space-y-4">
                {deck.derivations.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#121318] border border-[#262A36] p-4 sm:p-5 relative"
                    style={{ borderLeft: `4px solid ${branchInfo.hex}` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#F59E0B]">
                          [THEOREM {idx + 1}]
                        </span>
                        <h4 className="font-display font-bold text-base text-[#F8FAFC]">
                          {item.label}
                        </h4>
                      </div>
                      <button
                        onClick={() => copyLatex(item.latex, idx)}
                        className="px-2 py-1 text-xs font-mono bg-[#090A0F] border border-[#262A36] text-[#8D90A0] hover:text-white flex items-center space-x-1"
                        title="Copy LaTeX snippet"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            <span className="text-[#10B981]">COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>COPY LATEX</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Formula Display */}
                    <div className="bg-[#090A0F] p-3 border border-[#262A36] font-mono text-sm sm:text-base text-[#2563EB] font-bold overflow-x-auto my-3">
                      {item.formula}
                    </div>

                    {/* LaTeX source snippet */}
                    <div className="bg-[#090A0F] px-3 py-2 border border-[#262A36] text-xs font-mono text-[#8D90A0] mb-3 overflow-x-auto">
                      <span className="text-[#434655] mr-2">LaTeX:</span>
                      <code>{item.latex}</code>
                    </div>

                    {/* Explanation */}
                    <p className="text-xs sm:text-sm text-[#C3C6D7] leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
