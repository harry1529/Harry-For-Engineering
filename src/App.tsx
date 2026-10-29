import React, { useState, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import {
  BranchFilterBar,
} from './components/BranchFilterBar';
import {
  SlideDeckCard,
} from './components/SlideDeckCard';
import {
  SlideViewerModal,
} from './components/SlideViewerModal';
import {
  AuthModal,
} from './components/AuthModal';
import {
  AdminDashboard,
} from './components/AdminDashboard';
import {
  AuditLog,
  Branch,
  SlideDeck,
  User,
  UserRole,
} from './types';
import {
  BRANCHES_INFO,
  INITIAL_AUDIT_LOGS,
  INITIAL_SLIDE_DECKS,
  INITIAL_USERS,
} from './data/mockData';
import {
  filterSlideDecks,
  hasPermission,
  ROOT_ADMIN_EMAIL,
} from './utils/rbac';
import {
  Shield,
  Layers,
  BookOpen,
  CheckCircle2,
  Lock,
  Download,
  Terminal,
  Cpu,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

export default function App() {
  // Application State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('blueprint_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeView, setActiveView] = useState<'repository' | 'admin'>('repository');
  const [selectedBranch, setSelectedBranch] = useState<Branch | 'ALL'>('ALL');
  const [selectedSemester, setSelectedSemester] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Repositories State
  const [slideDecks, setSlideDecks] = useState<SlideDeck[]>(() => {
    const saved = localStorage.getItem('blueprint_decks');
    return saved ? JSON.parse(saved) : INITIAL_SLIDE_DECKS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('blueprint_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('blueprint_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Modals & Viewer
  const [activeViewerDeck, setActiveViewerDeck] = useState<SlideDeck | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync state to local storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('blueprint_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('blueprint_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('blueprint_decks', JSON.stringify(slideDecks));
  }, [slideDecks]);

  useEffect(() => {
    localStorage.setItem('blueprint_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('blueprint_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogAudit = (
    action: string,
    resource: string,
    status: 'GRANTED' | 'DENIED' | 'SUCCESS' | 'FAILED',
    details: string,
    email: string = currentUser?.email || 'anonymous'
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: email,
      userRole: currentUser?.role || 'GUEST',
      action,
      resource,
      status,
      ipAddress: '127.0.0.1',
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const handleDownload = (deck: SlideDeck) => {
    const userRole: UserRole = currentUser ? currentUser.role : 'STUDENT';
    const allowed = hasPermission(userRole, 'slides:download');

    if (!allowed) {
      showToast('ACCESS RESTRICTED: Role clearance required to download lecture PDF.', 'error');
      handleLogAudit('DOWNLOAD_BLOCKED', deck.subjectCode, 'DENIED', 'Missing slides:download clearance');
      return;
    }

    // Increment downloads count
    setSlideDecks((prev) =>
      prev.map((d) => (d.id === deck.id ? { ...d, downloads: d.downloads + 1 } : d))
    );

    // Trigger download / open PDF in new tab
    const link = document.createElement('a');
    link.href = deck.pdfUrl;
    link.target = '_blank';
    link.download = `${deck.subjectCode}_Unit_${deck.unitNumber}_Slides.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Downloading: ${deck.subjectCode} - ${deck.unitTitle}`, 'success');
    handleLogAudit('DOWNLOAD_PDF', deck.subjectCode, 'SUCCESS', `Downloaded PDF for ${deck.subjectName}`);
  };

  const handleAddUser = (newUserData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => {
    const newUser: User = {
      ...newUserData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    showToast(`Enrolled account for ${newUser.name} as [${newUser.role}]`, 'success');
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // If updating current user's role
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: newRole } : null));
    }
    showToast(`Updated user clearance role to [${newRole}]`, 'success');
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }
          : u
      )
    );
    showToast('User account status updated', 'info');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast('User account deprovisioned', 'info');
  };

  const handleAddSlideDeck = (newDeckData: Omit<SlideDeck, 'id' | 'downloads' | 'dateUpdated'>) => {
    const newDeck: SlideDeck = {
      ...newDeckData,
      id: `deck-${Date.now()}`,
      downloads: 0,
      dateUpdated: new Date().toISOString().split('T')[0],
    };
    setSlideDecks((prev) => [newDeck, ...prev]);
    showToast(`Published new slide deck: ${newDeck.subjectCode}`, 'success');
  };

  const handleDeleteSlideDeck = (deckId: string) => {
    setSlideDecks((prev) => prev.filter((d) => d.id !== deckId));
    showToast('Slide deck purged from repository', 'info');
  };

  const handleAdminViewNavigation = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      showToast('Authentication required to access Admin Portal and RBAC controls', 'info');
    } else {
      setActiveView('admin');
    }
  };

  // Filter slide decks
  const filteredDecks = filterSlideDecks(slideDecks, selectedBranch, selectedSemester, searchQuery);

  return (
    <div className="min-h-screen bg-[#090A0F] text-[#F8FAFC] flex flex-col font-body selection:bg-[#2563EB] selection:text-white">
      {/* Toast Alert Banner */}
      {toast && (
        <div className="fixed top-14 right-4 z-50 flex items-center space-x-2 bg-[#121318] border-2 border-[#262A36] px-4 py-3 text-xs font-mono hard-shadow-cobalt animate-bounce-short">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#10B981]" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#EF4444]" />}
          {toast.type === 'info' && <FileCheck className="w-4 h-4 text-[#2563EB]" />}
          <span className="text-[#F8FAFC]">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={(v) => {
          if (v === 'admin') {
            handleAdminViewNavigation();
          } else {
            setActiveView('repository');
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          handleLogAudit('AUTH_LOGOUT', 'SYSTEM', 'SUCCESS', 'User logged out');
          setCurrentUser(null);
          setActiveView('repository');
          showToast('Signed out successfully', 'info');
        }}
      />

      {/* Quick Root Admin Access Callout Ribbon */}
      <div className="bg-[#121318] border-b border-[#262A36] px-4 py-2 text-xs font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[#C3C6D7]">
            <span className="bg-[#2563EB] text-white text-[10px] font-bold px-1.5 py-0.5">
              PROMPT ADMIN
            </span>
            <span>
              Configured Super Admin: <code className="text-[#2563EB] font-bold">{ROOT_ADMIN_EMAIL}</code>
            </span>
            <span className="hidden sm:inline text-[#434655]">|</span>
            <span className="hidden sm:inline text-[#8D90A0]">
              Pass: <code className="text-[#F59E0B]">Hanu1529@</code>
            </span>
          </div>

          {!currentUser ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#2563EB] text-white border border-[#2563EB] hover:bg-[#1d4ed8] flex items-center space-x-1"
            >
              <Lock className="w-3 h-3" />
              <span>TEST ADMIN LOGIN</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 text-[11px] text-[#10B981]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>LOGGED IN AS [{currentUser.role}]</span>
            </div>
          )}
        </div>
      </div>

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeView === 'repository' ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            {/* Hero / Technical Manifesto Header */}
            <div className="mb-8 border-b border-[#262A36] pb-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-mono uppercase text-[#2563EB] font-bold tracking-widest mb-1.5 flex items-center space-x-2">
                    <span className="inline-block w-2 h-2 bg-[#2563EB]"></span>
                    <span>UNDERGRADUATE ENGINEERING SLIDE PORTAL</span>
                  </div>
                  <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F8FAFC] tracking-tight">
                    TECHNICAL BLUEPRINT MODERNISM
                  </h1>
                  <p className="text-sm sm:text-base text-[#C3C6D7] max-w-3xl mt-2 leading-relaxed">
                    High-density academic slide repository and rigorous derivation handbook across Computer Science, AI/ML, Electronics, Electrical, Mechanical, and Civil disciplines with authentic PDF decks.
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="flex items-center space-x-4 shrink-0 bg-[#121318] border border-[#262A36] p-3 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-[#8D90A0]">BRANCHES</div>
                    <div className="text-lg font-bold text-[#F8FAFC]">6 DEPTS</div>
                  </div>
                  <div className="w-px h-8 bg-[#262A36]"></div>
                  <div>
                    <div className="text-[10px] text-[#8D90A0]">TOTAL DECKS</div>
                    <div className="text-lg font-bold text-[#2563EB]">{slideDecks.length} MODULES</div>
                  </div>
                  <div className="w-px h-8 bg-[#262A36]"></div>
                  <div>
                    <div className="text-[10px] text-[#8D90A0]">FORMAT</div>
                    <div className="text-lg font-bold text-[#F59E0B]">.PDF / LATEX</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <BranchFilterBar
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              selectedSemester={selectedSemester}
              setSelectedSemester={setSelectedSemester}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalMatches={filteredDecks.length}
            />

            {/* 12-Column Responsive Card Grid */}
            {filteredDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDecks.map((deck) => (
                  <SlideDeckCard
                    key={deck.id}
                    deck={deck}
                    onOpenViewer={(d) => setActiveViewerDeck(d)}
                    onDownload={(d) => handleDownload(d)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#121318] border-2 border-dashed border-[#262A36] p-12 text-center my-8">
                <Terminal className="w-10 h-10 text-[#8D90A0] mx-auto mb-3" />
                <h3 className="font-display font-bold text-lg text-[#F8FAFC]">
                  NO MATCHING SLIDE MODULES FOUND
                </h3>
                <p className="text-xs font-mono text-[#8D90A0] mt-1 max-w-md mx-auto">
                  Try adjusting the discipline filter or searching by another topic like "Trees", "Attention", or "Thermodynamics".
                </p>
                <button
                  onClick={() => {
                    setSelectedBranch('ALL');
                    setSelectedSemester('ALL');
                    setSearchQuery('');
                  }}
                  className="mt-4 px-4 py-2 text-xs font-mono uppercase font-bold bg-[#2563EB] text-white border border-[#2563EB]"
                >
                  RESET ALL FILTERS
                </button>
              </div>
            )}
          </div>
        ) : (
          <AdminDashboard
            currentUser={currentUser!}
            users={users}
            slideDecks={slideDecks}
            auditLogs={auditLogs}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleUserStatus={handleToggleUserStatus}
            onDeleteUser={handleDeleteUser}
            onAddUser={handleAddUser}
            onAddSlideDeck={handleAddSlideDeck}
            onDeleteSlideDeck={handleDeleteSlideDeck}
            onLogAudit={handleLogAudit}
          />
        )}
      </main>

      {/* Slide & PDF Viewer Modal */}
      <SlideViewerModal
        deck={activeViewerDeck}
        onClose={() => setActiveViewerDeck(null)}
        onDownload={(d) => handleDownload(d)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome, ${user.name} [${user.role}]`, 'success');
          setActiveView('admin');
        }}
        onLogAudit={handleLogAudit}
      />

      {/* Footer */}
      <footer className="border-t border-[#262A36] bg-[#090A0F] py-6 text-xs font-mono text-[#8D90A0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#2563EB]"></span>
            <span className="font-bold text-[#F8FAFC]">BLUEPRINT ACADEMIC REPOSITORY</span>
            <span>// FORM FOLLOWS FUNCTION</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>ENGINEERING SYLLABI: VERIFIED</span>
            <span className="text-[#434655]">|</span>
            <span>AUTH PROVIDER: SHA-256 RBAC</span>
            <span className="text-[#434655]">|</span>
            <span>REV 2026.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
