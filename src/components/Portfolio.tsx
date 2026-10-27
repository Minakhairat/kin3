import React from 'react';
import { COMPANY_INFO } from '../data/content';
import { Language } from '../types';
import {
  Instagram,
  ExternalLink,
  MessageCircle,
  MapPin,
  Sparkles,
  Camera,
  Film,
  Mic,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface PortfolioProps {
  lang: Language;
}

export const Portfolio: React.FC<PortfolioProps> = ({ lang }) => {
  return (
    <section id="portfolio" className="py-20 lg:py-28 bg-[#FAFAFA] dark:bg-[#141211] border-b border-black/8 dark:border-white/10 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C82626] mb-3">
            <Instagram className="w-4 h-4" />
            <span>@kin.media.production</span>
            <span className="text-[#141211]/30 dark:text-white/30">·</span>
            <span className="text-[#141211]/60 dark:text-white/60">KEEP IT NEAT</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141211] dark:text-white tracking-tight leading-tight text-balance">
            {lang === 'ar' ? 'صفحة إنستجرام الرسمية لاستوديو KIN' : 'Official KIN Media Instagram'}
          </h2>
          <p className="mt-3 text-base text-[#141211]/75 dark:text-white/70 leading-relaxed max-w-2xl text-balance font-normal">
            {lang === 'ar'
              ? 'تابع جميع أعمالنا وحلقات البودكاست والريلز وكواليس جلسات التصوير الحقيقية من داخل استوديو KIN بالكوربة مباشرة وحصرياً عبر حسابنا الرسمي على إنستجرام.'
              : 'Explore all our productions, broadcast podcast episodes, vertical reels, and behind-the-scenes moments directly and exclusively on our official Instagram.'}
          </p>
        </div>

        {/* Main Official Instagram Hub Card (Clean, Comfortable, Luxury) */}
        <div className="bg-white dark:bg-[#1C1A18] rounded-3xl border border-black/10 dark:border-white/15 shadow-lg overflow-hidden transition-all">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#141211] to-[#252220] text-white p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 end-0 w-80 h-80 bg-[#C82626]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              {/* Account Identity */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-[3px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0">
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
                  <div className="absolute bottom-1 end-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#141211] flex items-center justify-center text-[10px] text-white font-bold">
                    ✓
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      kin.media.production
                    </h3>
                    <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">
                      ✓
                    </span>
                  </div>
                  <p className="text-sm text-white/70 font-medium">Kin Media Production</p>
                  <p className="text-xs text-[#C82626] font-mono font-bold tracking-wider uppercase">
                    KEEP IT NEAT · HELIOPOLIS
                  </p>
                </div>
              </div>

              {/* Direct Follow & Open Button */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <a
                  href={COMPANY_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] active:scale-[0.98] transition-all rounded-xl shadow-md cursor-pointer whitespace-nowrap"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'فتح الحساب في إنستجرام' : 'Open in Instagram'}</span>
                  <ExternalLink className="w-4 h-4 text-white/70" />
                </a>
              </div>

            </div>
          </div>

          {/* Account Details & Highlights */}
          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Bio & Location Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-black/8 dark:border-white/10">
              <div className="lg:col-span-8 space-y-3">
                <h4 className="text-base font-bold text-[#141211] dark:text-white">
                  {lang === 'ar' ? 'الوصف الرسمي للحساب (Bio):' : 'Official Instagram Bio:'}
                </h4>
                <div className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#201D1B] border border-black/6 dark:border-white/10 text-sm text-[#141211]/85 dark:text-white/85 leading-relaxed space-y-1 font-mono">
                  <p className="font-sans font-semibold text-[#141211] dark:text-white">
                    🎬 Cairo-based Creative Media Production Studio in Korba, Heliopolis
                  </p>
                  <p className="text-xs text-[#141211]/70 dark:text-white/70">
                    🎙️ Podcasts · 📱 Social Media Reels · 🎥 Commercial Ads · 🏢 Studio Rental
                  </p>
                  <p className="text-xs text-[#C82626] font-semibold pt-1">
                    📍 24 Granada St., Korba, Heliopolis, Cairo
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-around p-5 rounded-xl bg-[#FAFAFA] dark:bg-[#201D1B] border border-black/6 dark:border-white/10 text-center font-mono">
                <div>
                  <span className="text-2xl font-black text-[#141211] dark:text-white block">12.8K</span>
                  <span className="text-xs text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'متابع' : 'followers'}</span>
                </div>
                <div className="border-x border-black/8 dark:border-white/10 px-6">
                  <span className="text-2xl font-black text-[#141211] dark:text-white block">100%</span>
                  <span className="text-xs text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'استوديو الكوربة' : 'Korba studio'}</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#141211] dark:text-white block">HD</span>
                  <span className="text-xs text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'سينمائي' : 'Cinema 4K'}</span>
                </div>
              </div>
            </div>

            {/* 3 Core Production Pillars showcased on KIN Instagram */}
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#141211]/60 dark:text-white/60 mb-5 font-mono">
                {lang === 'ar' ? 'ما ستجده على صفحتنا الرسمية:' : 'What You Will Find on Our Page:'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Podcasts */}
                <div className="p-6 rounded-2xl bg-[#FAFAFA] dark:bg-[#201D1B] border border-black/6 dark:border-white/10 hover:border-[#C82626]/30 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2A2724] border border-black/8 dark:border-white/10 flex items-center justify-center text-[#C82626] shadow-2xs">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h5 className="text-base font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'برامج البودكاست المتكاملة' : 'Broadcast Podcasts'}
                  </h5>
                  <p className="text-xs text-[#141211]/70 dark:text-white/70 leading-relaxed">
                    {lang === 'ar'
                      ? 'مقتطفات وحلقات مصورة بنظام الـ 3 كاميرات السينمائية ومايكات Shure SM7B الإذاعية من صالة استوديو KIN.'
                      : 'High-production podcast episodes and short cutdowns filmed in our dedicated acoustic lounge.'}
                  </p>
                </div>

                {/* 2. Reels */}
                <div className="p-6 rounded-2xl bg-[#FAFAFA] dark:bg-[#201D1B] border border-black/6 dark:border-white/10 hover:border-[#C82626]/30 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2A2724] border border-black/8 dark:border-white/10 flex items-center justify-center text-[#C82626] shadow-2xs">
                    <Film className="w-5 h-5" />
                  </div>
                  <h5 className="text-base font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'ريلز السوشيال ميديا الشهرية' : 'Monthly Social Reels'}
                  </h5>
                  <p className="text-xs text-[#141211]/70 dark:text-white/70 leading-relaxed">
                    {lang === 'ar'
                      ? 'فيديوهات عمودية 9:16 ذات هوك قوي وإيقاع سريع مصممة لرفع التفاعل والانتشار على إنستجرام وتيك توك.'
                      : 'Engaging vertical reels with dynamic motion, subtitles, and color grading for modern creators.'}
                  </p>
                </div>

                {/* 3. Behind The Scenes */}
                <div className="p-6 rounded-2xl bg-[#FAFAFA] dark:bg-[#201D1B] border border-black/6 dark:border-white/10 hover:border-[#C82626]/30 transition-all space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#2A2724] border border-black/8 dark:border-white/10 flex items-center justify-center text-[#C82626] shadow-2xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h5 className="text-base font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'كواليس الاستوديو وتصوير الكوربة' : 'Studio BTS & Stories'}
                  </h5>
                  <p className="text-xs text-[#141211]/70 dark:text-white/70 leading-relaxed">
                    {lang === 'ar'
                      ? 'كواليس حية من جلسات تصوير البراندات، وتجهيزات الإضاءة ومتابعة فريق العمل تحت سقف واحد.'
                      : 'Daily stories and behind-the-scenes glimpses of lighting setups and live shooting in Korba.'}
                  </p>
                </div>

              </div>
            </div>

            {/* Direct Instagram Action Banner */}
            <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#141211] to-[#1e1b1a] text-white flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/10">
              <div className="space-y-1 text-center sm:text-start">
                <h4 className="text-lg font-bold text-white">
                  {lang === 'ar' ? 'تفضل بزيارة حساب @kin.media.production' : 'Visit @kin.media.production'}
                </h4>
                <p className="text-xs text-white/70 max-w-md">
                  {lang === 'ar'
                    ? 'جميع الفيديوهات والريلز منشورة ومتاحة للمشاهدة والتفاعل المباشر على الحساب الرسمي.'
                    : 'All authentic reels and productions are live and ready to watch on our official page.'}
                </p>
              </div>

              <a
                href={COMPANY_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
              >
                <Instagram className="w-4 h-4" />
                <span>{lang === 'ar' ? 'الانتقال لإنستجرام الآن ↗' : 'Visit Instagram Profile ↗'}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
