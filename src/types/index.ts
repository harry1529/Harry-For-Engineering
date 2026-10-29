export type Branch = 'CSE' | 'AIML' | 'ECE' | 'EE' | 'MECH' | 'CIVIL';

export type UserRole = 'SUPER_ADMIN' | 'FACULTY' | 'TA' | 'STUDENT' | 'GUEST';

export type Permission =
  | 'slides:read'
  | 'slides:download'
  | 'slides:upload'
  | 'slides:edit'
  | 'slides:delete'
  | 'users:view'
  | 'users:create'
  | 'users:edit_role'
  | 'users:delete'
  | 'syllabus:edit'
  | 'syllabus:approve'
  | 'audit_logs:view'
  | 'system:config';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Branch | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  lastLogin: string;
  createdAt: string;
  avatarColor?: string;
}

export interface DerivationBlock {
  formula: string;
  label: string;
  latex: string;
  explanation: string;
}

export interface SlideDeck {
  id: string;
  subjectCode: string;
  subjectName: string;
  branch: Branch;
  semester: number;
  unitNumber: number;
  unitTitle: string;
  topicSummary: string;
  pdfUrl: string;
  backupPdfUrl?: string;
  slideCount: number;
  format: 'PDF' | 'LATEX' | 'DECK';
  downloads: number;
  uploadedBy: string;
  dateUpdated: string;
  derivations: DerivationBlock[];
  tags: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  userRole: UserRole;
  action: string;
  resource: string;
  status: 'GRANTED' | 'DENIED' | 'SUCCESS' | 'FAILED';
  ipAddress: string;
  details?: string;
}

export interface BranchInfo {
  code: Branch;
  name: string;
  color: string;
  hex: string;
  borderClass: string;
  bgTintClass: string;
  shadowClass: string;
  description: string;
  totalDecks: number;
}
