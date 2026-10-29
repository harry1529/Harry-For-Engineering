import React from 'react';
import { FileText, Download, ExternalLink, Hash, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import { SlideDeck } from '../types';
import { BRANCHES_INFO } from '../data/mockData';

interface SlideDeckCardProps {
  deck: SlideDeck;
  onOpenViewer: (deck: SlideDeck) => void;
  onDownload: (deck: SlideDeck) => void;
}

export const SlideDeckCard: React.FC<SlideDeckCardProps> = ({
  deck,
  onOpenViewer,
  onDownload,
}) => {
  const branchInfo = BRANCHES_INFO[deck.branch];

  return (
    <div
      className="bg-[#121318] border border-[#262A36] flex flex-col justify-between transition-all duration-150 hover:border-[#8D90A0] relative group"
      style={{
        boxShadow: `3px 3px 0px 0px ${branchInfo.hex}22`,
      }}
    >
      {/* Top Blueprint Index Header Bar */}
      <div className="bg-[#1A1B21] border-b border-[#262A36] px-3.5 py-2 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center space-x-2">
          <span
            className="w-2.5 h-2.5 inline-block"
            style={{ backgroundColor: branchInfo.hex }}
          ></span>
          <span className="font-bold text-[#F8FAFC]">
            [{deck.branch}] {deck.subjectCode}
          </span>
          <span className="text-[#434655]">/</span>
          <span className="text-[#8D90A0]">SEM {deck.semester}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-[#090A0F] text-[#2563EB] px-1.5 py-0.5 border border-[#262A36] font-bold text-[10px]">
            .{deck.format}
          </span>
          <span className="text-[#8D90A0] text-[10px] hidden sm:inline">
            {deck.slideCount} SLIDES
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Unit Title */}
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#F59E0B] font-semibold mb-1">
          {deck.unitTitle}
        </div>
        
        {/* Subject Name */}
        <h3 className="font-display font-bold text-lg sm:text-xl text-[#F8FAFC] mb-2 leading-snug group-hover:text-[#b4c5ff] transition-colors">
          {deck.subjectName}
        </h3>

        {/* Topic Summary */}
        <p className="text-xs sm:text-sm text-[#C3C6D7] leading-relaxed mb-4 flex-1">
          {deck.topicSummary}
        </p>

        {/* Derivation Callout Box (as mandated in Image_13: 3px solid strip, LaTeX snippet) */}
        {deck.derivations && deck.derivations.length > 0 && (
          <div
            className="bg-[#0D0F17] p-3 mb-4 border border-[#262A36] relative"
            style={{ borderLeft: `3px solid ${branchInfo.hex}` }}
          >
            <div className="flex items-center justify-between text-[10px] font-mono text-[#8D90A0] uppercase mb-1">
              <span className="flex items-center text-[#E3E1E9]">
                <Sparkles className="w-3 h-3 mr-1 text-[#F59E0B]" />
                CORE DERIVATION: {deck.derivations[0].label}
              </span>
              <span className="text-[#434655]">FORMULA</span>
            </div>
            <div className="font-mono text-xs text-[#2563EB] bg-[#090A0F] px-2 py-1.5 border border-[#262A36] overflow-x-auto whitespace-nowrap">
              {deck.derivations[0].formula}
            </div>
            <div className="text-[11px] text-[#8D90A0] mt-1.5 leading-normal">
              {deck.derivations[0].explanation}
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {deck.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-[#8D90A0] bg-[#1A1B21] px-2 py-0.5 border border-[#262A36]"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Metadata Footer */}
        <div className="border-t border-[#262A36] pt-3 flex items-center justify-between text-[11px] font-mono text-[#8D90A0] mb-4">
          <div>
            BY <span className="text-[#E3E1E9]">{deck.uploadedBy.split(' ')[0]}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>{deck.downloads.toLocaleString()} READS</span>
            <span className="text-[#434655]">·</span>
            <span>{deck.dateUpdated}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            onClick={() => onOpenViewer(deck)}
            aria-label={`View slides for ${deck.subjectName}`}
            className="w-full py-2 px-3 text-xs font-mono uppercase font-bold bg-[#2563EB] text-white border border-[#2563EB] hover:bg-[#1d4ed8] transition-all flex items-center justify-center space-x-1.5 hard-shadow-dark"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VIEW SLIDES</span>
          </button>

          <button
            onClick={() => onDownload(deck)}
            aria-label={`Download PDF for ${deck.subjectName}`}
            className="w-full py-2 px-3 text-xs font-mono uppercase font-bold bg-[#1A1B21] text-[#E3E1E9] border border-[#262A36] hover:border-[#8D90A0] hover:text-white transition-all flex items-center justify-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>GET .PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
