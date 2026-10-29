import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Key,
  ShieldCheck,
  AlertTriangle,
  X,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { User } from '../types';
import {
  ROOT_ADMIN_EMAIL,
  ROOT_ADMIN_PASSWORD,
  validateCredentials,
} from '../utils/rbac';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  users: User[];
  onLogAudit: (action: string, resource: string, status: 'SUCCESS' | 'FAILED', details: string, email: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  users,
  onLogAudit,
}) => {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [successUser, setSuccessUser] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsVerifying(true);

    // Simulate secure cryptographic roundtrip with real validation
    setTimeout(() => {
      const result = validateCredentials(email, password, users);
      setIsVerifying(false);

      if (result.success && result.user) {
        setSuccessUser(result.user);
        onLogAudit(
          'AUTH_SUCCESS',
          'ADMIN_PORTAL',
          'SUCCESS',
          `Authenticated user with role ${result.user.role}`,
          result.user.email
        );
        setTimeout(() => {
          onLoginSuccess(result.user!);
          onClose();
        }, 600);
      } else {
        const errMessage = result.error || 'Authentication clearance failed.';
        setError(errMessage);
        onLogAudit(
          'AUTH_FAILED',
          'ADMIN_PORTAL',
          'FAILED',
          `Failed authentication attempt for ${email || 'unknown'}`,
          email || 'anonymous'
        );
      }
    }, 400);
  };

  const handleQuickFill = (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0D0F17] border-2 border-[#262A36] w-full max-w-md hard-shadow-cobalt relative flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#121318] border-b border-[#262A36] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-[#2563EB] text-white flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-[#F8FAFC]">
                SECURITY CLEARANCE AUTH
              </h2>
              <div className="text-[10px] font-mono text-[#8D90A0]">
                AUTHENTICATION PROVIDER GATEWAY
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Authentication Modal"
            className="p-1 text-[#8D90A0] hover:text-[#EF4444]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Quick Credential Presets */}
          <div className="mb-5 bg-[#121318] p-3 border border-[#262A36]">
            <div className="text-[10px] font-mono text-[#8D90A0] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>ADMIN & ROLE PRESETS (ONE-CLICK):</span>
              <span className="text-[#2563EB] font-bold">CLICK TO LOAD</span>
            </div>
            <div className="space-y-1.5">
              {/* Root Super Admin Preset (From Instructions) */}
              <button
                type="button"
                onClick={() => handleQuickFill(ROOT_ADMIN_EMAIL, ROOT_ADMIN_PASSWORD)}
                className="w-full text-left px-2.5 py-1.5 text-xs font-mono bg-[#1A1B21] border border-[#2563EB] hover:bg-[#2563EB]/10 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="text-[#2563EB] font-bold flex items-center">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    ROOT SUPER ADMIN (User Specified)
                  </div>
                  <div className="text-[10px] text-[#8D90A0]">
                    {ROOT_ADMIN_EMAIL}
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-[#2563EB] text-white px-1.5 py-0.5 font-bold">
                  AUTOFILL
                </span>
              </button>

              {/* Faculty Demo Preset */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleQuickFill('prof.sarabhai@blueprint.edu', 'Password@123')}
                  className="px-2 py-1 text-[10px] font-mono bg-[#1A1B21] border border-[#262A36] text-[#C3C6D7] hover:border-[#F59E0B] hover:text-white"
                >
                  FACULTY
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('ta.ananya@blueprint.edu', 'Password@123')}
                  className="px-2 py-1 text-[10px] font-mono bg-[#1A1B21] border border-[#262A36] text-[#C3C6D7] hover:border-[#8B5CF6] hover:text-white"
                >
                  TA
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('student.priya@blueprint.edu', 'Password@123')}
                  className="px-2 py-1 text-[10px] font-mono bg-[#1A1B21] border border-[#262A36] text-[#C3C6D7] hover:border-[#10B981] hover:text-white"
                >
                  STUDENT
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-[#EF4444]/15 border border-[#EF4444] p-3 text-xs font-mono text-[#FFB4AB] flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">CLEARANCE REJECTED: </span>
                {error}
              </div>
            </div>
          )}

          {/* Success Notification */}
          {successUser && (
            <div className="mb-4 bg-[#10B981]/15 border border-[#10B981] p-3 text-xs font-mono text-[#BDFFDB] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <div>
                <span className="font-bold">VERIFIED:</span> Clearance Granted for [{successUser.role}]
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-[#8D90A0] mb-1">
                AUTHORIZED EMAIL ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8D90A0]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="harshitkumrawat42938@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#090A0F] border border-[#262A36] focus:border-[#2563EB] focus:outline-none text-xs font-mono text-[#F8FAFC]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#8D90A0] mb-1">
                SECURE ACCESS KEY / PASSWORD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8D90A0]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-[#090A0F] border border-[#262A36] focus:border-[#2563EB] focus:outline-none text-xs font-mono text-[#F8FAFC]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8D90A0] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 text-xs font-mono uppercase font-bold bg-[#2563EB] text-white border border-[#2563EB] hover:bg-[#1d4ed8] transition-all flex items-center justify-center space-x-2 hard-shadow-dark disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isVerifying ? 'VALIDATING CREDENTIALS...' : 'VALIDATE & ENTER PORTAL'}</span>
            </button>
          </form>

          {/* Security Disclaimer */}
          <div className="mt-4 pt-4 border-t border-[#262A36] text-[10px] font-mono text-[#8D90A0] flex items-center justify-between">
            <span>CRYPTO ENCRYPTION: SHA-256</span>
            <span>AUDIT LOGGING: ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
