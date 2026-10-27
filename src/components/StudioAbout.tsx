import React from 'react';
import { COMPANY_INFO, STUDIO_EQUIPMENT } from '../data/content';
import { Language } from '../types';
import { MapPin, Check, Camera, Mic, Sliders, Monitor } from 'lucide-react';

interface StudioAboutProps {
  lang: Language;
  onOpenBooking: () => void;
}

const equipIcons = [Camera, Mic, Sliders, Monitor];

export const StudioAbout: React.FC<StudioAboutProps> = ({ lang, onOpenBooking }) => {
  return (
    <section id="studio" className="py-20 lg:py-28 bg-white dark:bg-[#141211] border-b border-black/8 dark:border-white/10 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Split: Narrative on Left, Studio Setup on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
          
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C82626]">
              {lang === 'ar' ? 'الموقع والفلسفة' : 'The Studio & Heritage'}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#141211] dark:text-white tracking-tight leading-[1.15] text-balance">
              {lang === 'ar' ? (
                <>
                  ستوديو KIN في قلب الكوربة: <br />
                  <span className="text-[#C82626]">KEEP IT NEAT</span>
                </>
              ) : (
                <>
                  KIN Studio in Iconic Korba: <br />
                  <span className="text-[#C82626]">KEEP IT NEAT</span>
                </>
              )}
            </h2>

            <p className="text-base sm:text-lg text-[#141211]/80 dark:text-white/80 leading-relaxed text-balance">
              {lang === 'ar'
                ? 'اخترنا حي الكوربة العريق بمصر الجديدة ليكون مقراً لاستوديوهات KIN لأننا نؤمن بأن البيئة الإبداعية الهادئة والأنيقة تنعكس مباشرة على جودة المحتوى الذي تقدمه لجمهورك.'
                : 'We selected Cairo’s historic Korba district in Heliopolis for KIN Studio. We believe that an inspiring, tranquil, and immaculate space directly translates into exceptional media for your brand.'}
            </p>

            <div className="p-6 bg-[#FAFAFA] dark:bg-[#1C1A18] rounded-xl border border-black/8 dark:border-white/10 space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C82626] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'العنوان بالتفصيل:' : 'Exact Studio Location:'}
                  </h4>
                  <p className="text-xs sm:text-sm text-[#141211]/70 dark:text-white/70 mt-0.5">
                    {lang === 'ar'
                      ? '24 شارع غرناطة، الكوربة، مصر الجديدة — الدور الثاني، شقة 9'
                      : '24 Granada St., Korba, Heliopolis, Cairo — 2nd Floor, Apt 9'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#141211]/70 dark:text-white/70 leading-relaxed">
              {lang === 'ar'
                ? 'بدل ما تتعامل مع مصور لوحده، ومونتير لوحده، ومهندس صوت منفصل — في KIN إنت بتتعامل مع فريق واحد متناغم بيقود مشروعك من أول جلسة العصف الذهني وحتى تسليم الفيديوهات الجاهزة للنشر.'
                : 'Instead of coordinating fragmented freelance videographers, editors, and sound technicians, KIN gives you one united team orchestrating your production from ideation to final ready-to-publish files.'}
            </p>

            <div className="pt-2">
              <button
                onClick={() => onOpenBooking()}
                className="px-6 py-3 text-xs font-bold text-white bg-[#141211] dark:bg-[#C82626] hover:bg-[#C82626] dark:hover:bg-[#a51e1e] transition-colors rounded-lg cursor-pointer"
              >
                {lang === 'ar' ? 'تنسيق زيارة أو حجز الاستوديو' : 'Schedule Studio Tour or Session'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] border border-black/10 dark:border-white/10 shadow-lg">
              <img
                src={COMPANY_INFO.images.heroStudio}
                alt="KIN Production Studio Interior"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 inset-x-4 text-white text-xs font-mono flex justify-between items-center">
                <span>ACOUSTIC SUITE 01</span>
                <span className="text-[#C82626]">KORBA, CAIRO</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-black/10 dark:border-white/10">
                <img
                  src={COMPANY_INFO.images.podcastSet}
                  alt="Podcast lounge setup"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-black/10 dark:border-white/10">
                <img
                  src={COMPANY_INFO.images.reelsProduction}
                  alt="Reels filming set"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Studio Specs & Equipment Grid */}
        <div className="pt-12 border-t border-black/8 dark:border-white/10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C82626] mb-1">
              {lang === 'ar' ? 'التجهيزات التقنية' : 'Studio Tech Specs'}
            </p>
            <h3 className="text-2xl font-extrabold text-[#141211] dark:text-white tracking-tight">
              {lang === 'ar' ? 'معدات استوديو بمعايير البث السينمائي' : 'Broadcast-Grade Studio Infrastructure'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STUDIO_EQUIPMENT.map((item, idx) => {
              const Icon = equipIcons[idx] || Camera;
              return (
                <div key={idx} className="p-6 bg-[#FAFAFA] dark:bg-[#1C1A18] rounded-xl border border-black/6 dark:border-white/10 space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#252220] border border-black/10 dark:border-white/10 flex items-center justify-center text-[#C82626]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? item.nameAr : item.nameEn}
                  </h4>
                  <p className="text-xs text-[#141211]/70 dark:text-white/70 leading-relaxed">
                    {lang === 'ar' ? item.descAr : item.descEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
