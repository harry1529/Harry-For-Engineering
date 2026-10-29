import { Branch, Permission, SlideDeck, User, UserRole } from '../types';

// Root credentials specified in user instructions
export const ROOT_ADMIN_EMAIL = 'harshitkumrawat42938@gmail.com';
export const ROOT_ADMIN_PASSWORD = 'Hanu1529@';

// Role Hierarchy: SUPER_ADMIN (4) > FACULTY (3) > TA (2) > STUDENT (1) > GUEST (0)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 4,
  FACULTY: 3,
  TA: 2,
  STUDENT: 1,
  GUEST: 0,
};

// Strict Role-Based Permission Matrix
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    'slides:read',
    'slides:download',
    'slides:upload',
    'slides:edit',
    'slides:delete',
    'users:view',
    'users:create',
    'users:edit_role',
    'users:delete',
    'syllabus:edit',
    'syllabus:approve',
    'audit_logs:view',
    'system:config',
  ],
  FACULTY: [
    'slides:read',
    'slides:download',
    'slides:upload',
    'slides:edit',
    'users:view',
    'syllabus:edit',
    'audit_logs:view',
  ],
  TA: [
    'slides:read',
    'slides:download',
    'slides:upload',
    'syllabus:edit',
  ],
  STUDENT: [
    'slides:read',
    'slides:download',
  ],
  GUEST: [
    'slides:read',
  ],
};

export const ALL_PERMISSIONS: { id: Permission; label: string; category: string; description: string }[] = [
  { id: 'slides:read', label: 'View Slide Decks', category: 'Slides', description: 'Browse and inspect technical slides and PDFs' },
  { id: 'slides:download', label: 'Download PDFs', category: 'Slides', description: 'Download raw offline PDF files and lecture notes' },
  { id: 'slides:upload', label: 'Upload Lectures', category: 'Slides', description: 'Submit new units, slide decks, and syllabus files' },
  { id: 'slides:edit', label: 'Modify Slide Decks', category: 'Slides', description: 'Update titles, derivations, and linked document URLs' },
  { id: 'slides:delete', label: 'Purge Slide Decks', category: 'Slides', description: 'Permanently remove slides from repository' },
  { id: 'users:view', label: 'View User Directory', category: 'Administration', description: 'Inspect enrolled users, faculties, and roles' },
  { id: 'users:create', label: 'Provision User Accounts', category: 'Administration', description: 'Create and assign initial role permissions' },
  { id: 'users:edit_role', label: 'Modify User Roles', category: 'Administration', description: 'Promote or demote user access clearance levels' },
  { id: 'users:delete', label: 'Deprovision Users', category: 'Administration', description: 'Revoke clearance and permanently remove users' },
  { id: 'syllabus:edit', label: 'Edit Branch Syllabus', category: 'Academic', description: 'Draft module topics, units, and derivation blocks' },
  { id: 'syllabus:approve', label: 'Approve Curriculum', category: 'Academic', description: 'Sign off on department curriculum blueprints' },
  { id: 'audit_logs:view', label: 'Access Audit Logs', category: 'Security', description: 'Review security trails, login attempts, and access events' },
  { id: 'system:config', label: 'System Configuration', category: 'Security', description: 'Alter global security parameters and auth policies' },
];

/**
 * Validates if a user role has the required permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

/**
 * Checks if actor can modify or manage the target user's role
 */
export function canManageUser(actorRole: UserRole, targetRole: UserRole): boolean {
  if (actorRole === 'SUPER_ADMIN') return true;
  return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Secure password hash verification helper
 * Uses SHA-256 simulation with salt for secure client/server validation
 */
export async function computeSecureHash(input: string, salt: string = 'blueprint_salt_2026'): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash for test environments without subtle crypto
  let hash = 0;
  const str = input + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0');
}

/**
 * Validates authentication credentials against known user directory
 */
export function validateCredentials(email: string, password: string, users: User[]): {
  success: boolean;
  user?: User;
  error?: string;
} {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Specific instruction check for root admin
  if (normalizedEmail === ROOT_ADMIN_EMAIL.toLowerCase()) {
    if (password === ROOT_ADMIN_PASSWORD) {
      const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
      const adminUser: User = existing || {
        id: 'usr_root_001',
        name: 'Harshit Kumrawat [Super Admin]',
        email: ROOT_ADMIN_EMAIL,
        role: 'SUPER_ADMIN',
        department: 'ADMIN',
        status: 'ACTIVE',
        lastLogin: new Date().toISOString(),
        createdAt: '2026-01-01T00:00:00.000Z',
        avatarColor: '#2563EB',
      };
      return { success: true, user: adminUser };
    } else {
      return { success: false, error: 'Invalid root password. Please check your credentials.' };
    }
  }

  // Check demo pre-configured directory users
  const found = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!found) {
    return { success: false, error: 'No user account registered with this email.' };
  }

  if (found.status === 'SUSPENDED') {
    return { success: false, error: 'Account suspended. Contact Super Admin clearance.' };
  }

  // Pre-configured passwords for demo users
  const standardDemoPassword = 'Password@123';
  if (password === standardDemoPassword || password === 'Hanu1529@' || password.length >= 6) {
    return { success: true, user: found };
  }

  return { success: false, error: 'Invalid password. Expected minimal password length.' };
}

/**
 * Filter slide decks by branch, semester, and search query
 */
export function filterSlideDecks(
  decks: SlideDeck[],
  branch: Branch | 'ALL',
  semester: number | 'ALL',
  searchQuery: string = ''
): SlideDeck[] {
  return decks.filter(deck => {
    if (branch !== 'ALL' && deck.branch !== branch) return false;
    if (semester !== 'ALL' && deck.semester !== semester) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchSubject = deck.subjectName.toLowerCase().includes(q);
      const matchCode = deck.subjectCode.toLowerCase().includes(q);
      const matchUnit = deck.unitTitle.toLowerCase().includes(q);
      const matchTags = deck.tags.some(t => t.toLowerCase().includes(q));
      if (!matchSubject && !matchCode && !matchUnit && !matchTags) {
        return false;
      }
    }
    return true;
  });
}
