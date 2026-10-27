import React, { useState } from 'react';
import {
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  Film,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../types';
import { COMPANY_INFO } from '../data/content';

interface AuthModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onOpenAdminPortal: () => void;
  onOpenClientPortal: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  lang,
  onClose,
  onOpenAdminPortal,
  onOpenClientPortal,
}) => {
  const { user, isAdmin, loading, loginWithGoogle, logout } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user') {
        // User voluntarily closed popup
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError(
          lang === 'ar'
            ? 'النطاق الحالي يحتاج للإضافة في Firebase Console > Authentication > Settings > Authorized domains.'
            : 'Domain needs to be added in Firebase Console > Authentication > Settings > Authorized domains.'
        );
      } else {
        setAuthError(
          err?.message ||
            (lang === 'ar'
              ? 'تعذر إتمام تسجيل الدخول، يرجى المحاولة مرة أخرى.'
              : 'Unable to sign in, please try again.')
        );
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-white dark:bg-[#1a1716] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-7 bg-gradient-to-br from-[#141211] via-[#1a1716] to-[#25201e] text-white">
          <button
            onClick={onClose}
            className="absolute top-5 end-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <img
              src={COMPANY_INFO.logoDark}
              alt="Kin Media Production"
              className="h-10 w-auto object-contain"
            />
          </div>

          <h3 className="text-xl font-black tracking-tight">
            {lang === 'ar' ? 'بوابة استوديو KIN والتسليمات' : 'KIN Studio Portal'}
          </h3>
          <p className="text-xs text-white/70 mt-1.5 leading-relaxed">
            {lang === 'ar'
              ? 'تسجيل الدخول للوصول إلى روابط الأعمال والتسليمات وملفات الميديا 4K'
              : 'Sign in to access deliverables, raw footage, and 4K production links'}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {authError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="leading-relaxed flex-1">{authError}</p>
            </div>
          )}

          {user ? (
            /* Logged in state */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#C82626]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#C82626] text-white flex items-center justify-center font-bold text-lg">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#141211] dark:text-white truncate">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    {isAdmin ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#C82626] text-white flex items-center gap-1 shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        {lang === 'ar' ? 'أدمن' : 'Admin'}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        {lang === 'ar' ? 'عميل KIN' : 'Client'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#141211]/60 dark:text-white/60 truncate font-mono mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Portal Navigation buttons */}
              <div className="space-y-2.5">
                {isAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPortal();
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] rounded-2xl shadow-lg shadow-[#C82626]/20 transition-all cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5" />
                      {lang === 'ar' ? 'لوحة تحكم الأدمن وإدارة الروابط' : 'Admin Control Hub'}
                    </span>
                    <ExternalLink className="w-4 h-4 rtl:rotate-180" />
                  </button>
                )}

                <button
                  onClick={() => {
                    onClose();
                    onOpenClientPortal();
                  }}
                  className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-2xl transition-all cursor-pointer border border-black/10 dark:border-white/10"
                >
                  <span className="flex items-center gap-2.5">
                    <Film className="w-5 h-5 text-[#C82626]" />
                    {lang === 'ar' ? 'استعراض تسليماتي والشغل المصور' : 'My Deliverables & Footage'}
                  </span>
                  <ExternalLink className="w-4 h-4 rtl:rotate-180" />
                </button>
              </div>

              {/* Sign out */}
              <div className="pt-2 border-t border-black/8 dark:border-white/10 flex justify-end">
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'ar' ? 'تسجيل الخروج من الحساب' : 'Sign Out'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged out state - Classic sleek Google Sign-in */
            <div className="space-y-4">
              <button
                onClick={handleGoogleLogin}
                disabled={isSigningIn || loading}
                className="w-full flex items-center justify-center gap-3.5 px-6 py-4 text-sm font-bold text-[#141211] dark:text-white bg-white dark:bg-[#201c1b] border-2 border-black/10 dark:border-white/15 hover:border-[#C82626] dark:hover:border-[#C82626] hover:bg-black/2 dark:hover:bg-white/5 active:scale-[0.99] rounded-2xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isSigningIn
                    ? lang === 'ar' ? 'جاري فتح حساب Google...' : 'Connecting to Google...'
                    : lang === 'ar' ? 'تسجيل الدخول عبر Google' : 'Sign in with Google'}
                </span>
              </button>

              <p className="text-[11px] text-center text-[#141211]/60 dark:text-white/60 leading-relaxed px-2">
                {lang === 'ar'
                  ? 'سجّل دخولك بحساب Google الخاص بك لتصفح الروابط والتسليمات المخصصة لإيميلك.'
                  : 'Sign in with your Google account to view deliverables and files shared with your email.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
