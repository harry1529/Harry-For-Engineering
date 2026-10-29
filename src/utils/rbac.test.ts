import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasPermission,
  canManageUser,
  validateCredentials,
  filterSlideDecks,
  ROOT_ADMIN_EMAIL,
  ROOT_ADMIN_PASSWORD,
} from './rbac';
import { SlideDeck, User } from '../types';

const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Harshit Kumrawat',
    email: ROOT_ADMIN_EMAIL,
    role: 'SUPER_ADMIN',
    department: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: '2026-10-29T00:00:00Z',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'u2',
    name: 'Dr. Vikram Sarabhai',
    email: 'prof.sarabhai@blueprint.edu',
    role: 'FACULTY',
    department: 'CSE',
    status: 'ACTIVE',
    lastLogin: '2026-10-28T12:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'u3',
    name: 'Ananya Sharma',
    email: 'ta.ananya@blueprint.edu',
    role: 'TA',
    department: 'AIML',
    status: 'ACTIVE',
    lastLogin: '2026-10-27T10:00:00Z',
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'u4',
    name: 'Rahul Verma',
    email: 'student.rahul@blueprint.edu',
    role: 'STUDENT',
    department: 'ECE',
    status: 'ACTIVE',
    lastLogin: '2026-10-26T08:00:00Z',
    createdAt: '2026-04-01T00:00:00Z',
  },
  {
    id: 'u5',
    name: 'Suspended User',
    email: 'suspended@blueprint.edu',
    role: 'STUDENT',
    department: 'MECH',
    status: 'SUSPENDED',
    lastLogin: '2026-09-01T00:00:00Z',
    createdAt: '2026-01-15T00:00:00Z',
  },
];

const mockDecks: SlideDeck[] = [
  {
    id: 'd1',
    subjectCode: 'CS-301',
    subjectName: 'Advanced Data Structures & Algorithms',
    branch: 'CSE',
    semester: 3,
    unitNumber: 1,
    unitTitle: 'Red-Black Trees & Amortized Analysis',
    topicSummary: 'Self-balancing binary search trees, rotation invariant, potential methods',
    pdfUrl: 'https://example.com/cs301-u1.pdf',
    slideCount: 42,
    format: 'PDF',
    downloads: 124,
    uploadedBy: 'Dr. Sarabhai',
    dateUpdated: '2026-10-15',
    derivations: [],
    tags: ['trees', 'algorithms', 'cse'],
  },
  {
    id: 'd2',
    subjectCode: 'AI-401',
    subjectName: 'Deep Learning & Neural Architectures',
    branch: 'AIML',
    semester: 4,
    unitNumber: 2,
    unitTitle: 'Backpropagation & Gradient Descent',
    topicSummary: 'Jacobian matrices, chain rule derivation, Adam and RMSProp optimizers',
    pdfUrl: 'https://example.com/ai401-u2.pdf',
    slideCount: 56,
    format: 'PDF',
    downloads: 310,
    uploadedBy: 'Ananya Sharma',
    dateUpdated: '2026-10-20',
    derivations: [],
    tags: ['neural networks', 'gradient descent', 'aiml'],
  },
];

test('Root Admin authentication with exact credentials succeeds', () => {
  const result = validateCredentials(ROOT_ADMIN_EMAIL, ROOT_ADMIN_PASSWORD, mockUsers);
  assert.equal(result.success, true);
  assert.equal(result.user?.role, 'SUPER_ADMIN');
  assert.equal(result.user?.email, ROOT_ADMIN_EMAIL);
});

test('Root Admin authentication with wrong password fails', () => {
  const result = validateCredentials(ROOT_ADMIN_EMAIL, 'WrongPass123', mockUsers);
  assert.equal(result.success, false);
  assert.match(result.error || '', /invalid root password/i);
});

test('Suspended user cannot authenticate', () => {
  const result = validateCredentials('suspended@blueprint.edu', 'Password@123', mockUsers);
  assert.equal(result.success, false);
  assert.match(result.error || '', /account suspended/i);
});

test('SUPER_ADMIN has all privileges', () => {
  assert.equal(hasPermission('SUPER_ADMIN', 'slides:read'), true);
  assert.equal(hasPermission('SUPER_ADMIN', 'slides:delete'), true);
  assert.equal(hasPermission('SUPER_ADMIN', 'users:create'), true);
  assert.equal(hasPermission('SUPER_ADMIN', 'users:edit_role'), true);
  assert.equal(hasPermission('SUPER_ADMIN', 'system:config'), true);
});

test('FACULTY has slide upload & edit, but cannot delete users or change roles', () => {
  assert.equal(hasPermission('FACULTY', 'slides:upload'), true);
  assert.equal(hasPermission('FACULTY', 'slides:edit'), true);
  assert.equal(hasPermission('FACULTY', 'users:view'), true);
  assert.equal(hasPermission('FACULTY', 'users:delete'), false);
  assert.equal(hasPermission('FACULTY', 'users:edit_role'), false);
  assert.equal(hasPermission('FACULTY', 'system:config'), false);
});

test('TA can upload slides and edit syllabus, but cannot delete slides or manage users', () => {
  assert.equal(hasPermission('TA', 'slides:upload'), true);
  assert.equal(hasPermission('TA', 'slides:delete'), false);
  assert.equal(hasPermission('TA', 'users:view'), false);
});

test('STUDENT has read & download only', () => {
  assert.equal(hasPermission('STUDENT', 'slides:read'), true);
  assert.equal(hasPermission('STUDENT', 'slides:download'), true);
  assert.equal(hasPermission('STUDENT', 'slides:upload'), false);
  assert.equal(hasPermission('STUDENT', 'slides:edit'), false);
  assert.equal(hasPermission('STUDENT', 'slides:delete'), false);
  assert.equal(hasPermission('STUDENT', 'users:view'), false);
});

test('GUEST has read-only access and cannot download', () => {
  assert.equal(hasPermission('GUEST', 'slides:read'), true);
  assert.equal(hasPermission('GUEST', 'slides:download'), false);
});

test('Role hierarchy management check', () => {
  assert.equal(canManageUser('SUPER_ADMIN', 'FACULTY'), true);
  assert.equal(canManageUser('FACULTY', 'TA'), true);
  assert.equal(canManageUser('FACULTY', 'SUPER_ADMIN'), false);
  assert.equal(canManageUser('TA', 'FACULTY'), false);
  assert.equal(canManageUser('STUDENT', 'GUEST'), true);
});

test('filterSlideDecks filters properly by branch and search', () => {
  const cseOnly = filterSlideDecks(mockDecks, 'CSE', 'ALL', '');
  assert.equal(cseOnly.length, 1);
  assert.equal(cseOnly[0].subjectCode, 'CS-301');

  const searchTrees = filterSlideDecks(mockDecks, 'ALL', 'ALL', 'Trees');
  assert.equal(searchTrees.length, 1);
  assert.equal(searchTrees[0].subjectCode, 'CS-301');

  const searchNone = filterSlideDecks(mockDecks, 'ALL', 'ALL', 'NonExistent');
  assert.equal(searchNone.length, 0);
});
