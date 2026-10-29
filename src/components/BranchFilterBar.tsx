import React from 'react';
import { Search, Filter, Layers, BookMarked, X } from 'lucide-react';
import { Branch } from '../types';
import { BRANCHES_INFO } from '../data/mockData';

interface BranchFilterBarProps {
  selectedBranch: Branch | 'ALL';
  setSelectedBranch: (branch: Branch | 'ALL') => void;
  selectedSemester: number | 'ALL';
  setSelectedSemester: (semester: number | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalMatches: number;
}

export const BranchFilterBar: React.FC<BranchFilterBarProps> = ({
  selectedBranch,
  setSelectedBranch,
  selectedSemester,
  setSelectedSemester,
  searchQuery,
  setSearchQuery,
  totalMatches,
}) => {
  const branches: (Branch | 'ALL')[] = ['ALL', 'CSE', 'AIML', 'ECE', 'EE', 'MECH', 'CIVIL'];
  const semesters: (number | 'ALL')[] = ['ALL', 1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="bg-[#121318] border border-[#262A36] p-4 sm:p-5 mb-8">
      {/* Top row: Search & Semester selector */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
        {/* Search input with brutalist zero-radius styling */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8D90A0]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject code (CS-301), derivation topic, or unit..."
            className="w-full pl-9 pr-8 py-2.5 bg-[#090A0F] border border-[#262A36] focus:border-[#2563EB] focus:outline-none text-xs sm:text-sm font-mono text-[#F8FAFC] placeholder:text-[#8D90A0]/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8D90A0] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Semester selector */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono uppercase text-[#8D90A0] flex items-center">
            <Layers className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
            SEM:
          </span>
          <div className="flex flex-wrap gap-1">
            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-2.5 py-1 text-xs font-mono font-bold border transition-all ${
                  selectedSemester === sem
                    ? 'bg-[#2563EB] text-white border-[#2563EB] hard-shadow-dark'
                    : 'bg-[#090A0F] text-[#8D90A0] border-[#262A36] hover:border-[#8D90A0] hover:text-[#F8FAFC]'
                }`}
              >
                {sem === 'ALL' ? 'ALL' : `S${sem}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row: Branch Chips with Blueprint Structural Accents */}
      <div className="border-t border-[#262A36] pt-4">
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[11px] font-mono uppercase text-[#8D90A0] tracking-wider flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-[#F59E0B]" />
            ENGINEERING DISCIPLINES
          </div>
          <div className="text-[11px] font-mono text-[#8D90A0]">
            SHOWING <span className="text-[#2563EB] font-bold">{totalMatches}</span> CURATED DECK(S)
          </div>
        </div>

        {/* Horizontal scroll track for mobile, grid/flex on desktop */}
        <div className="flex flex-wrap gap-2">
          {branches.map((b) => {
            const isSelected = selectedBranch === b;
            if (b === 'ALL') {
              return (
                <button
                  key="ALL"
                  onClick={() => setSelectedBranch('ALL')}
                  className={`px-3 py-1.5 text-xs font-mono uppercase font-bold border transition-all ${
                    isSelected
                      ? 'bg-[#F8FAFC] text-black border-white hard-shadow-cobalt'
                      : 'bg-[#090A0F] text-[#C3C6D7] border-[#262A36] hover:border-[#8D90A0]'
                  }`}
                >
                  [ALL DISCIPLINES]
                </button>
              );
            }

            const info = BRANCHES_INFO[b];
            return (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                style={{
                  borderColor: isSelected ? info.hex : '#262A36',
                  backgroundColor: isSelected ? info.hex : '#090A0F',
                  color: isSelected ? '#FFFFFF' : '#C3C6D7',
                  boxShadow: isSelected ? `2px 2px 0px 0px #000000` : 'none',
                }}
                className="px-3 py-1.5 text-xs font-mono uppercase font-bold border transition-all flex items-center space-x-1.5 hover:border-[#8D90A0]"
              >
                <span
                  className="w-2 h-2 inline-block"
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : info.hex }}
                ></span>
                <span>[{b}]</span>
                <span className="hidden sm:inline text-[10px] opacity-80">{info.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
