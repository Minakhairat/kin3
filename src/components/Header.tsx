import React, { useState } from 'react';
import { COMPANY_INFO } from '../data/content';
import { Language, Theme } from '../types';
import { Menu, X, PhoneCall, Calendar, Sun, Moon, LogIn, ShieldCheck, Film, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  lang: Language;
  theme: Theme;
  onToggleLang: () => void;
  onToggleTheme: () => void;
  onOpenBooking: (pkgId?: string) => void;
  onOpenAuth: () => void;
  onOpenAdminPortal: () => void;
  onOpenClientPortal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
  onOpenBooking,
  onOpenAuth,
  onOpenAdminPortal,
  onOpenClientPortal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  const navLinks = [
    { href: '#services', label: lang === 'ar' ? 'الخدمات' : 'Services' },
    { href: '#pricing', label: lang === 'ar' ? 'الباكدجات والأسعار' : 'Pricing' },
    { href: '#portfolio', label: lang === 'ar' ? 'إنستجرام KIN' : 'Instagram' },
    { href: '#reviews', label: lang === 'ar' ? 'آراء العملاء' : 'Reviews' },
    { href: '#studio', label: lang === 'ar' ? 'الاستوديو' : 'The Studio' },
    { href: '#contact', label: lang === 'ar' ? 'تواصل معنا' : 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#141211]/95 backdrop-blur-md border-b border-black/8 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Zone 1: Brand Wordmark & Logo (Crisp light/dark auto-switching) */}
        <a href="#" className="flex items-center gap-3 shrink-0 group py-2">
          {/* Light Mode Logo (transparent, black typography with red dot) */}
          <img
            src={COMPANY_INFO.logo}
            alt="Kin Media Production - KEEP IT NEAT"
            className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105 dark:hidden"
            referrerPolicy="no-referrer"
          />
          {/* Dark Mode Logo (transparent, glowing white typography with vibrant red dot) */}
          <img
            src={COMPANY_INFO.logoDark}
            alt="Kin Media Production - KEEP IT NEAT"
            className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-105 hidden dark:block"
            referrerPolicy="no-referrer"
          />
        </a>

        {/* Zone 2: Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#141211]/80 dark:text-white/80">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#C82626] dark:hover:text-[#C82626] transition-colors whitespace-nowrap shrink-0 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[#C82626] hover:after:w-full after:transition-all after:duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Actions (Deliverables Portal + Theme Switch + Lang Switch + CTA) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Client & Admin Portal Quick Access */}
          {user ? (
            <div className="flex items-center gap-1.5">
              {isAdmin ? (
                <button
                  onClick={onOpenAdminPortal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#C82626] text-white hover:bg-[#a51e1e] transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  title={lang === 'ar' ? 'لوحة تحكم الأدمن وإدارة الروابط' : 'Admin Portal'}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'ar' ? 'لوحة الأدمن' : 'Admin'}</span>
                </button>
              ) : (
                <button
                  onClick={onOpenClientPortal}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm cursor-pointer whitespace-nowrap"
                  title={lang === 'ar' ? 'ملفات الشغل والتسليمات' : 'My Deliverables'}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{lang === 'ar' ? 'شغلي والتسليمات' : 'Deliverables'}</span>
                </button>
              )}

              {/* User Account Button */}
              <button
                onClick={onOpenAuth}
                className="p-1 rounded-full border border-black/15 dark:border-white/20 hover:border-[#C82626] transition-all cursor-pointer"
                title={user.email || 'Account'}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#141211] dark:bg-white/10 text-white text-xs flex items-center justify-center font-bold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-black/15 dark:border-white/20 text-[#141211] dark:text-white bg-black/3 dark:bg-white/5 hover:border-[#C82626] dark:hover:border-[#C82626] transition-all cursor-pointer whitespace-nowrap"
              title={lang === 'ar' ? 'تسجيل الدخول / استلام شغلك' : 'Client & Admin Portal'}
            >
              <LogIn className="w-3.5 h-3.5 text-[#C82626]" />
              <span className="hidden sm:inline">
                {lang === 'ar' ? 'بوابة العملاء / استلام شغلك' : 'Client Portal'}
              </span>
              <span className="sm:hidden">{lang === 'ar' ? 'دخول' : 'Login'}</span>
            </button>
          )}

          {/* Cinema Dark / Light Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border border-black/15 dark:border-white/20 text-[#141211] dark:text-white bg-black/3 dark:bg-white/10 hover:bg-black/8 dark:hover:bg-white/15 transition-all cursor-pointer whitespace-nowrap"
            title={
              theme === 'dark'
                ? lang === 'ar' ? 'التحويل للوضع النهاري' : 'Switch to Light Mode'
                : lang === 'ar' ? 'التحويل للوضع السينمائي (Cinema Dark)' : 'Switch to Cinema Dark'
            }
            aria-label="Toggle Cinema Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline font-mono">{lang === 'ar' ? 'نهاري' : 'Light'}</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#C82626]" />
                <span className="hidden md:inline font-mono">{lang === 'ar' ? 'سينما دارك' : 'Dark'}</span>
              </>
            )}
          </button>

          {/* Language Switch */}
          <button
            onClick={onToggleLang}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-lg border border-black/15 dark:border-white/20 text-[#141211] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Switch Language"
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Book Session CTA */}
          <button
            onClick={() => onOpenBooking()}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] active:scale-[0.98] transition-all rounded-lg shadow-sm whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{lang === 'ar' ? 'احجز جلستك' : 'Book Session'}</span>
          </button>

          <a
            href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(
              lang === 'ar' ? 'مرحباً استوديو KIN، أود الاستفسار عن باقات التصوير' : 'Hello KIN Studio, I would like to inquire about production packages'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sm:hidden p-2 text-white bg-[#C82626] rounded-lg"
            aria-label="WhatsApp"
          >
            <PhoneCall className="w-4 h-4" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#141211] dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 dark:border-white/10 bg-white dark:bg-[#1C1A18] px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-[#141211] dark:text-white hover:text-[#C82626] dark:hover:text-[#C82626] transition-colors py-2 border-b border-black/5 dark:border-white/5"
              >
                {link.label}
              </a>
            ))}
          </nav>
          
          <div className="pt-2 flex flex-col gap-3">
            {/* Mobile Portal Button */}
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (isAdmin) onOpenAdminPortal();
                    else onOpenClientPortal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-emerald-600 rounded-lg shadow cursor-pointer"
                >
                  <Film className="w-4 h-4" />
                  <span>
                    {isAdmin
                      ? lang === 'ar' ? 'فتح لوحة تحكم الأدمن' : 'Open Admin Portal'
                      : lang === 'ar' ? 'فتح استعراض تسليماتي والشغل' : 'Open My Deliverables'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2 text-xs font-semibold text-[#141211]/70 dark:text-white/70 bg-black/5 dark:bg-white/10 rounded-lg"
                >
                  {user.email} (
                  {isAdmin ? (lang === 'ar' ? 'مدير' : 'Admin') : (lang === 'ar' ? 'عميل' : 'Client')}
                  )
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-[#141211] dark:text-white border-2 border-[#C82626] rounded-lg shadow-sm cursor-pointer"
              >
                <LogIn className="w-4 h-4 text-[#C82626]" />
                <span>{lang === 'ar' ? 'تسجيل دخول العملاء / استلام الشغل' : 'Client & Admin Login'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenBooking();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white bg-[#C82626] rounded-lg shadow cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{lang === 'ar' ? 'احجز استوديو الآن' : 'Book Studio Now'}</span>
            </button>
            
            <a
              href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/15 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{lang === 'ar' ? 'واتساب مباشر: 01280700319' : 'Direct WhatsApp'}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
