import React from 'react';
import { COMPANY_INFO } from '../data/content';
import { Language } from '../types';
import { Instagram, Phone, MapPin, ArrowUp } from 'lucide-react';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#141211] text-white pt-16 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={COMPANY_INFO.logoDark}
                alt="Kin Media Production"
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs uppercase tracking-widest text-[#C82626] font-bold">
              KEEP IT NEAT
            </p>
            <p className="text-xs text-white/60 max-w-sm leading-relaxed">
              {lang === 'ar'
                ? 'ستوديو إنتاج محتوى متكامل في مصر الجديدة: فريق واحد بيخطط ويصور ويمنتج من الأول للآخر تحت سقف واحد.'
                : 'All-in-one creative media production studio in Heliopolis: one team planning, shooting, and editing under one roof.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
              {lang === 'ar' ? 'أقسام الموقع' : 'Navigation'}
            </h4>
            <ul className="space-y-2 text-xs text-white/60">
              <li>
                <a href="#services" className="hover:text-white transition-colors">
                  {lang === 'ar' ? 'الخدمات المتخصصة' : 'Production Services'}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  {lang === 'ar' ? 'الباكدجات والأسعار' : 'Packages & Pricing'}
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-white transition-colors">
                  {lang === 'ar' ? 'إنستجرام KIN الرسمي' : 'Official KIN Instagram'}
                </a>
              </li>
              <li>
                <a href="#studio" className="hover:text-white transition-colors">
                  {lang === 'ar' ? 'عن الاستوديو والتجهيزات' : 'The Korba Studio'}
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">
                  {lang === 'ar' ? 'تواصل معنا وحجز جلسة' : 'Contact & Book'}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Studio Details */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/80">
              {lang === 'ar' ? 'معلومات الاستوديو' : 'Studio Details'}
            </h4>
            <div className="text-xs text-white/60 space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C82626] shrink-0 mt-0.5" />
                <span>{lang === 'ar' ? COMPANY_INFO.address.ar : COMPANY_INFO.address.en}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C82626] shrink-0" />
                <span className="font-mono">{COMPANY_INFO.phones[0]} — {COMPANY_INFO.phones[1]}</span>
              </p>
              <p className="flex items-center gap-2">
                <Instagram className="w-3.5 h-3.5 text-[#C82626] shrink-0" />
                <a
                  href={COMPANY_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:text-white transition-colors"
                >
                  @{COMPANY_INFO.instagram}
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Clean copyright and back-to-top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40 font-mono">
          <div>
            © {new Date().getFullYear()} Kin Media Production. {lang === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'ar' ? 'العودة للأعلى' : 'Back to Top'}</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#C82626]" />
          </button>
        </div>

      </div>
    </footer>
  );
};
