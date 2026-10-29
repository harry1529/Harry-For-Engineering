import React, { useState } from 'react';
import {
  Shield,
  Users,
  FileText,
  Key,
  Activity,
  UserPlus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  PlusCircle,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AuditLog, Branch, Permission, SlideDeck, User, UserRole } from '../types';
import {
  ALL_PERMISSIONS,
  hasPermission,
  canManageUser,
  ROLE_PERMISSIONS,
} from '../utils/rbac';
import { BRANCHES_INFO } from '../data/mockData';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  slideDecks: SlideDeck[];
  auditLogs: AuditLog[];
  onUpdateUserRole: (userId: string, newRole: UserRole) => void;
  onToggleUserStatus: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => void;
  onAddSlideDeck: (deck: Omit<SlideDeck, 'id' | 'downloads' | 'dateUpdated'>) => void;
  onDeleteSlideDeck: (deckId: string) => void;
  onLogAudit: (action: string, resource: string, status: 'GRANTED' | 'DENIED' | 'SUCCESS' | 'FAILED', details: string, email: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  slideDecks,
  auditLogs,
  onUpdateUserRole,
  onToggleUserStatus,
  onDeleteUser,
  onAddUser,
  onAddSlideDeck,
  onDeleteSlideDeck,
  onLogAudit,
}) => {
  // Role simulation state (allows testing RBAC feature restriction dynamically)
  const [simulatedRole, setSimulatedRole] = useState<UserRole>(currentUser.role);
  const [activeTab, setActiveTab] = useState<'users' | 'slides' | 'matrix' | 'audit' | 'telemetry'>('users');
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // User form modal state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT');
  const [newUserDept, setNewUserDept] = useState<Branch | 'ADMIN'>('CSE');

  // Slide form state
  const [isAddSlideOpen, setIsAddSlideOpen] = useState(false);
  const [newSlideCode, setNewSlideCode] = useState('CS-403');
  const [newSlideName, setNewSlideName] = useState('Compilers & Automata Theory');
  const [newSlideBranch, setNewSlideBranch] = useState<Branch>('CSE');
  const [newSlideSemester, setNewSlideSemester] = useState(4);
  const [newSlideUnit, setNewSlideUnit] = useState(1);
  const [newSlideTitle, setNewSlideTitle] = useState('UNIT 01: LEXICAL ANALYSIS & LR(1) PARSING');
  const [newSlideSummary, setNewSlideSummary] = useState('Deterministic finite automata, Chomsky hierarchy, and shift-reduce conflict resolution.');
  const [newSlidePdf, setNewSlidePdf] = useState('https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf');
  const [newSlideFormula, setNewSlideFormula] = useState('Follow(A) = union(First(beta))');
  const [newSlideExplanation, setNewSlideExplanation] = useState('LR parsing item closure sets guarantee unambiguous grammar reductions.');

  // Current effective role
  const effectiveRole = simulatedRole;

  // Enforce permission checks
  const checkActionPermission = (perm: Permission, actionName: string): boolean => {
    const granted = hasPermission(effectiveRole, perm);
    if (!granted) {
      setPermissionNotice(
        `ACCESS DENIED: Role [${effectiveRole}] lacks permission [${perm}] to ${actionName}. Action blocked by RBAC firewall.`
      );
      onLogAudit(
        'RBAC_RESTRICTION_TRIGGERED',
        actionName,
        'DENIED',
        `Role ${effectiveRole} attempted unauthorized action: ${perm}`,
        currentUser.email
      );
      setTimeout(() => setPermissionNotice(null), 5000);
      return false;
    }
    return true;
  };

  const handleRoleChange = (userId: string, targetUser: User, newRole: UserRole) => {
    if (!checkActionPermission('users:edit_role', 'modify user roles')) return;
    if (!canManageUser(effectiveRole, targetUser.role)) {
      setPermissionNotice(`CLEARANCE ERROR: Your role level cannot modify a user with role [${targetUser.role}].`);
      return;
    }
    onUpdateUserRole(userId, newRole);
    onLogAudit(
      'USER_ROLE_MODIFIED',
      targetUser.email,
      'SUCCESS',
      `Changed role of ${targetUser.email} from ${targetUser.role} to ${newRole}`,
      currentUser.email
    );
  };

  const handleStatusToggle = (userId: string, targetUser: User) => {
    if (!checkActionPermission('users:edit_role', 'alter user status')) return;
    onToggleUserStatus(userId);
    onLogAudit(
      'USER_STATUS_TOGGLED',
      targetUser.email,
      'SUCCESS',
      `Toggled status of ${targetUser.email}`,
      currentUser.email
    );
  };

  const handleDeleteUserClick = (userId: string, targetUser: User) => {
    if (!checkActionPermission('users:delete', 'delete user account')) return;
    if (targetUser.email === currentUser.email) {
      setPermissionNotice('SAFETY PROTOCOL: Cannot deprovision your own active administrator account.');
      return;
    }
    onDeleteUser(userId);
    onLogAudit(
      'USER_DELETED',
      targetUser.email,
      'SUCCESS',
      `Permanently removed user ${targetUser.email}`,
      currentUser.email
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkActionPermission('users:create', 'create user accounts')) return;
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    onAddUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDept,
      status: 'ACTIVE',
    });

    onLogAudit(
      'USER_PROVISIONED',
      newUserEmail.trim(),
      'SUCCESS',
      `Created account with role [${newUserRole}] for ${newUserEmail.trim()}`,
      currentUser.email
    );

    setIsAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleCreateSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkActionPermission('slides:upload', 'upload lecture slides')) return;

    onAddSlideDeck({
      subjectCode: newSlideCode.trim(),
      subjectName: newSlideName.trim(),
      branch: newSlideBranch,
      semester: Number(newSlideSemester),
      unitNumber: Number(newSlideUnit),
      unitTitle: newSlideTitle.trim(),
      topicSummary: newSlideSummary.trim(),
      pdfUrl: newSlidePdf.trim(),
      slideCount: 32,
      format: 'PDF',
      uploadedBy: currentUser.name,
      tags: [newSlideBranch, 'Lecture', 'Notes'],
      derivations: [
        {
          label: 'Module Invariant Formulation',
          formula: newSlideFormula.trim(),
          latex: newSlideFormula.trim(),
          explanation: newSlideExplanation.trim(),
        },
      ],
    });

    onLogAudit(
      'SLIDE_PUBLISHED',
      `${newSlideCode} / UNIT ${newSlideUnit}`,
      'SUCCESS',
      `Published slide deck for ${newSlideCode}`,
      currentUser.email
    );

    setIsAddSlideOpen(false);
  };

  const handleDeleteSlideClick = (deckId: string, deckTitle: string) => {
    if (!checkActionPermission('slides:delete', 'purge slide deck')) return;
    onDeleteSlideDeck(deckId);
    onLogAudit(
      'SLIDE_DELETED',
      deckTitle,
      'SUCCESS',
      `Purged slide deck ${deckId}`,
      currentUser.email
    );
  };

  const rolesList: UserRole[] = ['SUPER_ADMIN', 'FACULTY', 'TA', 'STUDENT', 'GUEST'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Admin Portal Header Banner */}
      <div className="bg-[#121318] border-2 border-[#262A36] p-4 sm:p-6 mb-6 hard-shadow-cobalt">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#F59E0B] font-bold mb-1">
              <Shield className="w-4 h-4 text-[#2563EB]" />
              <span>RBAC PRIVILEGE CONTROL HUB</span>
              <span className="text-[#434655]">|</span>
              <span className="text-[#10B981]">ACTIVE USER: {currentUser.email}</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F8FAFC]">
              ADMINISTRATION & PERMISSION LEVELS
            </h1>
            <p className="text-xs sm:text-sm text-[#C3C6D7] mt-1 max-w-2xl">
              Role-based access control engine enforcing strict authorization barriers across user management, slide curation, and system security logs.
            </p>
          </div>

          {/* Interactive Role Switcher for Dynamic RBAC Testing */}
          <div className="bg-[#090A0F] border border-[#262A36] p-3 shrink-0">
            <div className="text-[10px] font-mono uppercase text-[#8D90A0] mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <Sliders className="w-3.5 h-3.5 mr-1 text-[#2563EB]" />
                SIMULATE ACCESS ROLE:
              </span>
              <span className="text-[#2563EB] font-bold">LIVE TEST</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {rolesList.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setSimulatedRole(r);
                    setPermissionNotice(null);
                  }}
                  className={`px-2.5 py-1 text-xs font-mono font-bold border transition-all ${
                    simulatedRole === r
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[#121318] text-[#8D90A0] border-[#262A36] hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="text-[10px] font-mono text-[#8D90A0] mt-1.5">
              Testing as: <span className="text-[#F59E0B] font-bold">[{effectiveRole}]</span>
              {effectiveRole !== currentUser.role && ' (Simulated for RBAC check)'}
            </div>
          </div>
        </div>

        {/* Permission Denied Alert Bar */}
        {permissionNotice && (
          <div className="mt-4 bg-[#EF4444]/20 border border-[#EF4444] p-3 text-xs font-mono text-[#FFB4AB] flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
              <span>{permissionNotice}</span>
            </div>
            <button
              onClick={() => setPermissionNotice(null)}
              className="text-[#FFB4AB] hover:text-white font-bold ml-4"
            >
              DISMISS
            </button>
          </div>
        )}
      </div>

      {/* Dashboard Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#262A36] pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-2 text-xs font-mono font-bold uppercase border transition-all flex items-center space-x-1.5 ${
            activeTab === 'users'
              ? 'bg-[#2563EB] text-white border-[#2563EB]'
              : 'bg-[#121318] text-[#C3C6D7] border-[#262A36] hover:border-[#8D90A0]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>USER MANAGEMENT ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slides')}
          className={`px-3 py-2 text-xs font-mono font-bold uppercase border transition-all flex items-center space-x-1.5 ${
            activeTab === 'slides'
              ? 'bg-[#2563EB] text-white border-[#2563EB]'
              : 'bg-[#121318] text-[#C3C6D7] border-[#262A36] hover:border-[#8D90A0]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>SLIDE REPOSITORY ({slideDecks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3 py-2 text-xs font-mono font-bold uppercase border transition-all flex items-center space-x-1.5 ${
            activeTab === 'matrix'
              ? 'bg-[#2563EB] text-white border-[#2563EB]'
              : 'bg-[#121318] text-[#C3C6D7] border-[#262A36] hover:border-[#8D90A0]'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>RBAC PERMISSION MATRIX</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-2 text-xs font-mono font-bold uppercase border transition-all flex items-center space-x-1.5 ${
            activeTab === 'audit'
              ? 'bg-[#2563EB] text-white border-[#2563EB]'
              : 'bg-[#121318] text-[#C3C6D7] border-[#262A36] hover:border-[#8D90A0]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>SECURITY AUDIT TRAIL ({auditLogs.length})</span>
        </button>
      </div>

      {/* VIEW 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-[#121318] border border-[#262A36] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#F8FAFC]">
                DIRECTORY OF ENROLLED USERS & CLEARANCE
              </h2>
              <p className="text-xs font-mono text-[#8D90A0]">
                Assign, elevate, or revoke permission roles across undergraduate and faculty accounts.
              </p>
            </div>

            {/* Add User Action with Permission Guard */}
            {hasPermission(effectiveRole, 'users:create') ? (
              <button
                onClick={() => setIsAddUserOpen(true)}
                className="px-3.5 py-2 text-xs font-mono uppercase font-bold bg-[#2563EB] text-white border border-[#2563EB] hover:bg-[#1d4ed8] transition-all flex items-center space-x-1.5 hard-shadow-dark"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>ENROLL NEW USER</span>
              </button>
            ) : (
              <div className="text-xs font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444] px-3 py-1.5 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>[RESTRICTED: REQUIRES users:create]</span>
              </div>
            )}
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-[#262A36]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1A1B21] border-b border-[#262A36] text-[#8D90A0] uppercase">
                <tr>
                  <th className="py-3 px-4">User / Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Clearance</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262A36]">
                {users.map((user) => {
                  const isCurrent = user.email === currentUser.email;
                  const canEditThisUser = hasPermission(effectiveRole, 'users:edit_role') && canManageUser(effectiveRole, user.role);

                  return (
                    <tr key={user.id} className="hover:bg-[#1A1B21]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#F8FAFC] flex items-center space-x-2">
                          <span>{user.name}</span>
                          {isCurrent && (
                            <span className="bg-[#2563EB] text-white text-[9px] px-1.5 py-0.2">
                              YOU
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#8D90A0]">{user.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#090A0F] border border-[#262A36] px-2 py-0.5 text-[#C3C6D7]">
                          [{user.department}]
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {canEditThisUser ? (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, user, e.target.value as UserRole)}
                            className="bg-[#090A0F] border border-[#262A36] text-xs font-mono text-[#F59E0B] font-bold px-2 py-1 focus:border-[#2563EB] focus:outline-none"
                          >
                            {rolesList.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[#F59E0B] font-bold">
                            <span>[{user.role}]</span>
                            <Lock className="w-3 h-3 text-[#434655]" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold border ${
                            user.status === 'ACTIVE'
                              ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]'
                              : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#8D90A0]">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {canEditThisUser && (
                          <button
                            onClick={() => handleStatusToggle(user.id, user)}
                            className="px-2 py-1 text-[10px] uppercase font-bold border border-[#262A36] bg-[#090A0F] text-[#8D90A0] hover:text-white"
                          >
                            {user.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE'}
                          </button>
                        )}

                        {hasPermission(effectiveRole, 'users:delete') && (
                          <button
                            onClick={() => handleDeleteUserClick(user.id, user)}
                            disabled={isCurrent}
                            className="p-1 text-[#8D90A0] hover:text-[#EF4444] disabled:opacity-20"
                            title="Deprovision user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: SLIDE MANAGEMENT */}
      {activeTab === 'slides' && (
        <div className="bg-[#121318] border border-[#262A36] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#F8FAFC]">
                CURRICULAR SLIDE DECKS & ACADEMIC DOCUMENTS
              </h2>
              <p className="text-xs font-mono text-[#8D90A0]">
                Publish new lecture PDF modules, attach governing derivations, and manage subject syllabi.
              </p>
            </div>

            {hasPermission(effectiveRole, 'slides:upload') ? (
              <button
                onClick={() => setIsAddSlideOpen(true)}
                className="px-3.5 py-2 text-xs font-mono uppercase font-bold bg-[#2563EB] text-white border border-[#2563EB] hover:bg-[#1d4ed8] transition-all flex items-center space-x-1.5 hard-shadow-dark"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>UPLOAD NEW SLIDES</span>
              </button>
            ) : (
              <div className="text-xs font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444] px-3 py-1.5 flex items-center space-x-1">
                <Lock className="w-3.5 h-3.5" />
                <span>[RESTRICTED: REQUIRES slides:upload]</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {slideDecks.map((deck) => (
              <div
                key={deck.id}
                className="bg-[#0D0F17] border border-[#262A36] p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8D90A0] mb-2">
                    <span className="font-bold text-[#F8FAFC]">
                      [{deck.branch}] {deck.subjectCode} · SEM {deck.semester}
                    </span>
                    <span className="text-[#F59E0B] font-bold">.{deck.format}</span>
                  </div>
                  <h3 className="font-display font-bold text-base text-[#F8FAFC] mb-1">
                    {deck.unitTitle}
                  </h3>
                  <div className="text-xs text-[#C3C6D7] mb-3 line-clamp-2">
                    {deck.subjectName} — {deck.topicSummary}
                  </div>
                </div>

                <div className="border-t border-[#262A36] pt-3 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#8D90A0]">BY {deck.uploadedBy}</span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={deck.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:underline flex items-center space-x-1"
                    >
                      <span>PDF LINK</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {hasPermission(effectiveRole, 'slides:delete') && (
                      <button
                        onClick={() => handleDeleteSlideClick(deck.id, deck.unitTitle)}
                        className="text-[#EF4444] hover:text-[#FFB4AB] p-1"
                        title="Purge Deck"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: RBAC PERMISSION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-[#121318] border border-[#262A36] p-4 sm:p-6">
          <div className="mb-6">
            <h2 className="font-display font-bold text-xl text-[#F8FAFC]">
              ROLE-BASED ACCESS CONTROL (RBAC) AUTHORIZATION MATRIX
            </h2>
            <p className="text-xs font-mono text-[#8D90A0] mt-1">
              Deterministic privilege distribution mapping capabilities across clearance hierarchy levels.
            </p>
          </div>

          <div className="overflow-x-auto border border-[#262A36]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1A1B21] border-b border-[#262A36] text-[#8D90A0] uppercase">
                <tr>
                  <th className="py-3 px-4">Permission Granularity</th>
                  <th className="py-3 px-4">Category</th>
                  {rolesList.map((r) => (
                    <th
                      key={r}
                      className={`py-3 px-3 text-center ${
                        effectiveRole === r ? 'text-[#2563EB] font-bold bg-[#2563EB]/10' : ''
                      }`}
                    >
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262A36]">
                {ALL_PERMISSIONS.map((perm) => (
                  <tr key={perm.id} className="hover:bg-[#1A1B21]/50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#F8FAFC]">{perm.label}</div>
                      <div className="text-[10px] text-[#8D90A0]">{perm.description}</div>
                      <code className="text-[9px] text-[#2563EB]">{perm.id}</code>
                    </td>
                    <td className="py-3 px-4 text-[#8D90A0] uppercase">
                      [{perm.category}]
                    </td>
                    {rolesList.map((r) => {
                      const granted = hasPermission(r, perm.id);
                      const isSimulated = effectiveRole === r;

                      return (
                        <td
                          key={r}
                          className={`py-3 px-3 text-center ${
                            isSimulated ? 'bg-[#2563EB]/10' : ''
                          }`}
                        >
                          {granted ? (
                            <span className="inline-flex items-center text-[#10B981] font-bold">
                              <CheckCircle2 className="w-4 h-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[#EF4444]/40">
                              <Lock className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 4: SECURITY AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-[#121318] border border-[#262A36] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#F8FAFC]">
                REAL-TIME SECURITY AUDIT TRAILS & ACCESS LOGS
              </h2>
              <p className="text-xs font-mono text-[#8D90A0]">
                Cryptographic immutable log tracking authentication, resource accesses, and RBAC firewall events.
              </p>
            </div>
            <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981] px-2.5 py-1 text-xs font-mono font-bold">
              SYSTEM INTEGRITY: SECURE
            </span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#0D0F17] border border-[#262A36] p-3 flex flex-col md:flex-row md:items-center justify-between gap-2"
              >
                <div className="flex items-start md:items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold border shrink-0 ${
                      log.status === 'SUCCESS' || log.status === 'GRANTED'
                        ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]'
                        : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]'
                    }`}
                  >
                    {log.status}
                  </span>
                  <div>
                    <div className="font-bold text-[#F8FAFC]">
                      {log.action} <span className="text-[#8D90A0]">· {log.resource}</span>
                    </div>
                    <div className="text-[11px] text-[#C3C6D7]">{log.details}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-[10px] text-[#8D90A0] shrink-0 border-t md:border-t-0 pt-1 md:pt-0 border-[#262A36]">
                  <span>BY: <span className="text-white">{log.userEmail}</span> [{log.userRole}]</span>
                  <span>IP: {log.ipAddress}</span>
                  <span className="text-[#434655]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0F17] border-2 border-[#262A36] w-full max-w-md p-6 hard-shadow-cobalt">
            <h3 className="font-display font-bold text-lg text-[#F8FAFC] mb-4">
              PROVISION NEW USER ACCOUNT
            </h3>
            <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#8D90A0] mb-1 uppercase">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Prof. Arvind Kumar"
                  className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] focus:border-[#2563EB] text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#8D90A0] mb-1 uppercase">EMAIL ADDRESS</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. akumar@blueprint.edu"
                  className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] focus:border-[#2563EB] text-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8D90A0] mb-1 uppercase">ASSIGN ROLE</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F59E0B] font-bold"
                  >
                    {rolesList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#8D90A0] mb-1 uppercase">DEPARTMENT</label>
                  <select
                    value={newUserDept}
                    onChange={(e) => setNewUserDept(e.target.value as Branch | 'ADMIN')}
                    className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AIML">AIML</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#262A36]">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3 py-2 border border-[#262A36] text-[#8D90A0] hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] text-white border border-[#2563EB] font-bold"
                >
                  CONFIRM ENROLLMENT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SLIDE DECK */}
      {isAddSlideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D0F17] border-2 border-[#262A36] w-full max-w-lg p-6 hard-shadow-cobalt max-h-[90vh] overflow-y-auto">
            <h3 className="font-display font-bold text-lg text-[#F8FAFC] mb-4">
              PUBLISH NEW LECTURE SLIDES & PDF
            </h3>
            <form onSubmit={handleCreateSlide} className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8D90A0] mb-1 uppercase">SUBJECT CODE</label>
                  <input
                    type="text"
                    required
                    value={newSlideCode}
                    onChange={(e) => setNewSlideCode(e.target.value)}
                    placeholder="CS-403"
                    className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#8D90A0] mb-1 uppercase">BRANCH</label>
                  <select
                    value={newSlideBranch}
                    onChange={(e) => setNewSlideBranch(e.target.value as Branch)}
                    className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                  >
                    <option value="CSE">CSE</option>
                    <option value="AIML">AIML</option>
                    <option value="ECE">ECE</option>
                    <option value="EE">EE</option>
                    <option value="MECH">MECH</option>
                    <option value="CIVIL">CIVIL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8D90A0] mb-1 uppercase">SUBJECT NAME</label>
                <input
                  type="text"
                  required
                  value={newSlideName}
                  onChange={(e) => setNewSlideName(e.target.value)}
                  placeholder="Automata & Formal Languages"
                  className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8D90A0] mb-1 uppercase">SEMESTER (1-8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={newSlideSemester}
                    onChange={(e) => setNewSlideSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                  />
                </div>
                <div>
                  <label className="block text-[#8D90A0] mb-1 uppercase">UNIT NUMBER</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={newSlideUnit}
                    onChange={(e) => setNewSlideUnit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8D90A0] mb-1 uppercase">UNIT TITLE</label>
                <input
                  type="text"
                  required
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  placeholder="UNIT 01: PUSH DOWN AUTOMATA & CFL"
                  className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#8D90A0] mb-1 uppercase">TOPIC SUMMARY</label>
                <textarea
                  rows={2}
                  required
                  value={newSlideSummary}
                  onChange={(e) => setNewSlideSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#8D90A0] mb-1 uppercase">PDF DOCUMENT URL</label>
                <input
                  type="url"
                  required
                  value={newSlidePdf}
                  onChange={(e) => setNewSlidePdf(e.target.value)}
                  placeholder="https://example.com/lecture.pdf"
                  className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-[#8D90A0] mb-1 uppercase">CORE DERIVATION FORMULA</label>
                <input
                  type="text"
                  required
                  value={newSlideFormula}
                  onChange={(e) => setNewSlideFormula(e.target.value)}
                  placeholder="L(M) = { w in Sigma* | (q0, w, Z0) |- (qf, epsilon, gamma) }"
                  className="w-full px-3 py-2 bg-[#090A0F] border border-[#262A36] text-[#2563EB] font-bold"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#262A36]">
                <button
                  type="button"
                  onClick={() => setIsAddSlideOpen(false)}
                  className="px-3 py-2 border border-[#262A36] text-[#8D90A0] hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] text-white border border-[#2563EB] font-bold"
                >
                  PUBLISH SLIDE DECK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
