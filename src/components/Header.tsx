import React from 'react';
import { Shield, BookOpen, UserCheck, LogOut, Lock, Terminal, Cpu } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  activeView: 'repository' | 'admin';
  setActiveView: (view: 'repository' | 'admin') => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="brutal-border-thick border-b border-[#262A36] bg-[#090A0F]/95 backdrop-blur-sm sticky top-0 z-40">
      {/* Top Telemetry Ticker (Bauhaus Blueprint Style) */}
      <div className="bg-[#121318] border-b border-[#262A36] px-4 py-1.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-[#8D90A0]">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-[#2563EB] font-bold">
            <span className="inline-block w-2 h-2 bg-[#2563EB] mr-1.5 animate-pulse"></span>
            SYS.PORTAL // v4.2
          </span>
          <span className="hidden sm:inline text-[#434655]">|</span>
          <span className="hidden sm:inline">LAT: 23.0225° N · LON: 72.5714° E</span>
          <span className="hidden md:inline text-[#434655]">|</span>
          <span className="hidden md:inline text-[#E3E1E9]">CLEARANCE: {currentUser ? currentUser.role : 'PUBLIC_READ'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="hidden lg:inline text-[#8D90A0]">SECURITY: <span className="text-[#10B981] font-semibold">RBAC ENFORCED</span></span>
          <span className="text-[#434655]">|</span>
          <span className="text-[#b4c5ff] font-mono">ENGR.BLUEPRINT.REPOS</span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Platform Name */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveView('repository')}>
          <div className="w-10 h-10 bg-[#2563EB] flex items-center justify-center text-white hard-shadow-white border border-[#262A36]">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-bold text-xl sm:text-2xl tracking-tight text-[#F8FAFC]">
                BLUEPRINT
              </span>
              <span className="text-xs font-mono uppercase bg-[#1A1B21] text-[#2563EB] px-2 py-0.5 border border-[#262A36] font-semibold">
                CORE
              </span>
            </div>
            <p className="text-[11px] font-mono text-[#8D90A0] uppercase tracking-wider hidden sm:block">
              Engineering Academic Slide Repository & RBAC Matrix
            </p>
          </div>
        </div>

        {/* Navigation & Auth Clearance Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* View Switchers */}
          <button
            onClick={() => setActiveView('repository')}
            aria-label="Public Slide Repository"
            className={`px-3 py-2 text-xs font-mono uppercase font-bold flex items-center space-x-1.5 transition-all border ${
              activeView === 'repository'
                ? 'bg-[#2563EB] text-white border-[#2563EB] hard-shadow-white'
                : 'bg-[#121318] text-[#C3C6D7] border-[#262A36] hover:border-[#2563EB] hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SLIDES & NOTES</span>
            <span className="sm:hidden">SLIDES</span>
          </button>

          <button
            onClick={() => setActiveView('admin')}
            aria-label="Admin Portal & RBAC"
            className={`px-3 py-2 text-xs font-mono uppercase font-bold flex items-center space-x-1.5 transition-all border ${
              activeView === 'admin'
                ? 'bg-[#F59E0B] text-black border-[#F59E0B] hard-shadow-white'
                : 'bg-[#121318] text-[#C3C6D7] border-[#262A36] hover:border-[#F59E0B] hover:text-[#F59E0B]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ADMIN & RBAC</span>
            <span className="sm:hidden">ADMIN</span>
          </button>

          {/* User Status / Login Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-[#121318] border border-[#262A36] px-2.5 py-1.5">
              <div className="w-6 h-6 bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold font-mono">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-mono font-bold text-[#F8FAFC] truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-[#F59E0B] font-semibold">
                  [{currentUser.role}]
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                aria-label="Sign Out"
                className="p-1 hover:text-[#EF4444] text-[#8D90A0] transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              aria-label="Admin Sign In"
              className="px-3 py-2 text-xs font-mono uppercase font-bold bg-[#FFFFFF] text-black border border-white hover:bg-[#E3E1E9] transition-all hard-shadow-cobalt flex items-center space-x-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
