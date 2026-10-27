import React from 'react';
import { COMPANY_INFO } from '../data/content';
import { Language } from '../types';
import {
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Instagram,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Mic,
  Film,
  Camera,
} from 'lucide-react';

interface HeroProps {
  lang: Language;
  onOpenBooking: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  lang,
  onOpenBooking,
}) => {
  return (
    <section className="relative overflow-hidden bg-[#FAFAF8] dark:bg-[#141211] pt-10 pb-16 lg:pt-20 lg:pb-28 border-b border-black/6 dark:border-white/10 transition-colors duration-300">
      {/* Subtle Warm Studio Background Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(#14121105_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-[#C82626]/5 dark:bg-[#C82626]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Typographic Presence & Studio Heritage */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Elegant Subtitle / Kicker */}
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C82626] mb-5">
              <span className="w-2 h-2 rounded-full bg-[#C82626]" />
              <span>{lang === 'ar' ? 'استوديو إنتاج متكامل في الكوربة' : 'Creative Studio in Korba, Heliopolis'}</span>
              <span className="text-[#141211]/30 dark:text-white/30">·</span>
              <span className="text-[#141211]/60 dark:text-white/60 font-mono">KEEP IT NEAT</span>
            </div>

            {/* Display Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black text-[#141211] dark:text-white tracking-tight leading-[1.18] mb-6 text-balance">
              {lang === 'ar' ? (
                <>
                  فريق واحد بيخطط ويصور ويمنتج{' '}
                  <span className="text-[#C82626] relative inline-block">
                    تحت سقف واحد
                  </span>
                </>
              ) : (
                <>
                  One team to plan, shoot, and edit{' '}
                  <span className="text-[#C82626] relative inline-block">
                    under one roof
                  </span>
                </>
              )}
            </h1>

            {/* Comfortable Lead Copy */}
            <p className="text-base sm:text-lg text-[#141211]/75 dark:text-white/70 leading-relaxed mb-8 max-w-xl text-balance font-normal">
              {lang === 'ar'
                ? 'استوديو KIN في قلب حي الكوربة العريق بمصر الجديدة. بنحول فكرتك لبرنامج بودكاست متكامل، أو محتوى ريلز شهري منظم يبني حضور حقيقي لبراندك بدون أي فوضى.'
                : 'Based in Cairo’s historic Korba district in Heliopolis. We turn your vision into multi-cam broadcast podcasts and strategic monthly reels that grow your brand.'}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-10">
              <a
                href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(
                  lang === 'ar'
                    ? 'مرحباً استوديو KIN، أود الاستفسار عن حجز جلسة تصوير'
                    : 'Hello KIN Studio, I would like to inquire about booking a production session'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] active:scale-[0.98] transition-all rounded-xl shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{lang === 'ar' ? 'تواصل معنا على واتساب' : 'Chat on WhatsApp'}</span>
              </a>

              <a
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-[#141211] dark:text-white bg-white dark:bg-[#1C1A18] border border-black/12 dark:border-white/15 hover:border-[#C82626] dark:hover:border-[#C82626] hover:text-[#C82626] hover:bg-[#FAFAFA] dark:hover:bg-[#252220] transition-all rounded-xl shadow-2xs cursor-pointer"
              >
                <Instagram className="w-4 h-4 text-[#C82626]" />
                <span>{lang === 'ar' ? 'صفحة إنستجرام الرسمية' : 'Official Instagram Page'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#141211]/50 dark:text-white/50" />
              </a>
            </div>

            {/* Location & Studio Features Bar */}
            <div className="pt-6 border-t border-black/8 dark:border-white/10 space-y-4">
              <div className="flex items-center gap-2.5 text-xs text-[#141211]/70 dark:text-white/70">
                <MapPin className="w-4 h-4 text-[#C82626] shrink-0" />
                <span className="font-medium">
                  {lang === 'ar'
                    ? '24 شارع غرناطة، الكوربة، مصر الجديدة — الدور الثاني، شقة 9'
                    : '24 Granada St., Korba, Heliopolis, Cairo — 2nd Floor, Apt 9'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white dark:bg-[#1C1A18] border border-black/6 dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#C82626] uppercase font-mono block">BROADCAST 4K</span>
                  <span className="text-xs font-semibold text-[#141211] dark:text-white mt-0.5 block">
                    {lang === 'ar' ? 'تصوير سينمائي متكامل' : 'Cinema Multi-Cam'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1C1A18] border border-black/6 dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#C82626] uppercase font-mono block">STUDIO AUDIO</span>
                  <span className="text-xs font-semibold text-[#141211] dark:text-white mt-0.5 block">
                    {lang === 'ar' ? 'عزل صوتي إذاعي نقي' : 'Isolated Audio Suite'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#1C1A18] border border-black/6 dark:border-white/10">
                  <span className="text-[10px] font-bold text-[#C82626] uppercase font-mono block">100% IN-HOUSE</span>
                  <span className="text-xs font-semibold text-[#141211] dark:text-white mt-0.5 block">
                    {lang === 'ar' ? 'فريق واحد متناغم' : 'Unified Crew'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High-End Official Instagram Profile Card (Zero Unverified Videos) */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-[#1C1A18] rounded-3xl border border-black/10 dark:border-white/15 shadow-xl overflow-hidden transition-all">
              
              {/* Instagram Card Header (Native Instagram Look & Feel) */}
              <div className="p-6 sm:p-8 bg-gradient-to-b from-[#FAFAFA] to-white dark:from-[#211E1C] dark:to-[#1C1A18] border-b border-black/8 dark:border-white/10">
                <div className="flex items-start justify-between gap-4">
                  
                  {/* Avatar & Account Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {/* Gradient ring */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
                        <div className="w-full h-full rounded-full bg-white dark:bg-[#141211] p-1.5 flex items-center justify-center overflow-hidden">
                          <img
                            src={COMPANY_INFO.logo}
                            alt="Kin Media Production"
                            className="w-full h-full object-contain dark:hidden"
                          />
                          <img
                            src={COMPANY_INFO.logoDark}
                            alt="Kin Media Production"
                            className="w-full h-full object-contain hidden dark:block"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-0 end-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#141211]" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-lg sm:text-xl font-extrabold text-[#141211] dark:text-white tracking-tight">
                          kin.media.production
                        </h2>
                        <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">✓</span>
                      </div>
                      <p className="text-xs text-[#141211]/60 dark:text-white/60 font-medium">Kin Media Production</p>
                      <p className="text-xs text-[#C82626] font-semibold tracking-wider font-mono uppercase mt-0.5">
                        KEEP IT NEAT
                      </p>
                    </div>
                  </div>

                  {/* Follow Button */}
                  <a
                    href={COMPANY_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] rounded-xl transition-colors shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'متابعة' : 'Follow'}</span>
                  </a>
                </div>

                {/* Account Bio */}
                <div className="mt-5 pt-4 border-t border-black/6 dark:border-white/10 text-xs sm:text-sm text-[#141211]/85 dark:text-white/85 leading-relaxed space-y-1">
                  <p className="font-bold text-[#141211] dark:text-white">
                    🎬 Cairo-based Creative Media Production Studio in Korba, Heliopolis
                  </p>
                  <p className="text-xs text-[#141211]/70 dark:text-white/70">
                    🎙️ Podcasts · 📱 Social Media Reels · 🎥 Commercial Ads · 🏢 Studio Rental
                  </p>
                  <p className="text-xs text-[#C82626] font-mono font-medium pt-1">
                    📍 24 Granada St., Korba, Heliopolis, Cairo
                  </p>
                </div>

                {/* Profile Stats */}
                <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-black/6 dark:border-white/10 text-center font-mono">
                  <div className="py-1">
                    <span className="text-base font-extrabold text-[#141211] dark:text-white block">100%</span>
                    <span className="text-[11px] text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'رسمي' : 'official'}</span>
                  </div>
                  <div className="py-1 border-x border-black/6 dark:border-white/10">
                    <span className="text-base font-extrabold text-[#141211] dark:text-white block">12.8K</span>
                    <span className="text-[11px] text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'متابع' : 'followers'}</span>
                  </div>
                  <div className="py-1">
                    <span className="text-base font-extrabold text-[#141211] dark:text-white block">الكوربة</span>
                    <span className="text-[11px] text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'مصر الجديدة' : 'Cairo'}</span>
                  </div>
                </div>
              </div>

              {/* Direct Access & Official Channel Gateway */}
              <div className="p-6 sm:p-8 bg-[#FAFAFA] dark:bg-[#171514] space-y-4">
                <div className="text-xs text-[#141211]/80 dark:text-white/80 leading-relaxed space-y-3">
                  <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#201D1B] rounded-xl border border-black/6 dark:border-white/10">
                    <Mic className="w-5 h-5 text-[#C82626] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-[#141211] dark:text-white">
                        {lang === 'ar' ? 'شاهد كل الحلقات والريلز على إنستجرام' : 'Watch All Content on Instagram'}
                      </p>
                      <p className="text-[11px] text-[#141211]/60 dark:text-white/60 mt-0.5">
                        {lang === 'ar'
                          ? 'جميع أعمالنا وحلقات البودكاست معروضة ومتاحة على حسابنا الرسمي.'
                          : 'All our authentic episodes and creator reels are published on our page.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 bg-white dark:bg-[#201D1B] rounded-xl border border-black/6 dark:border-white/10">
                    <Camera className="w-5 h-5 text-[#C82626] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-[#141211] dark:text-white">
                        {lang === 'ar' ? 'كواليس الاستوديو اليومية (Stories)' : 'Daily Studio Stories & BTS'}
                      </p>
                      <p className="text-[11px] text-[#141211]/60 dark:text-white/60 mt-0.5">
                        {lang === 'ar'
                          ? 'تابع كواليس جلسات التصوير وتجهيزات الإضاءة يوم بيوم من الكوربة.'
                          : 'Catch daily studio behind-the-scenes and production setups in Korba.'}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={COMPANY_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-[#141211] dark:bg-[#C82626] hover:bg-[#C82626] dark:hover:bg-[#a51e1e] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'الانتقال لصفحة @kin.media.production ↗' : 'Visit @kin.media.production on IG ↗'}</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
