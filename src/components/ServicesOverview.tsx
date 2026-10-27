import React from 'react';
import { COMPANY_INFO } from '../data/content';
import { Language } from '../types';
import { ArrowLeft, ArrowRight, Mic, Film, Sparkles, Check, Phone } from 'lucide-react';

interface ServicesOverviewProps {
  lang: Language;
  onSelectService: (service: 'podcasts' | 'reels' | 'commercials') => void;
  onOpenBooking: (pkgId?: string) => void;
}

export const ServicesOverview: React.FC<ServicesOverviewProps> = ({
  lang,
  onSelectService,
  onOpenBooking,
}) => {
  const ArrowIcon = lang === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#FAFAFA] dark:bg-[#141211] border-b border-black/8 dark:border-white/10 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C82626] mb-3">
            {lang === 'ar' ? 'مجالات الإنتاج' : 'Core Disciplines'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141211] dark:text-white tracking-tight leading-tight text-balance">
            {lang === 'ar' ? 'خدمات استوديو KIN المتخصصة' : 'Specialized Production Services'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#141211]/70 dark:text-white/70 leading-relaxed text-balance">
            {lang === 'ar'
              ? 'سواء كنت بتبدأ برنامج بودكاست جديد، أو عاوز شريك محتوى شهري لريلز السوشيال ميديا، أو إعلان سينمائي فاخر لشركتك.'
              : 'Whether launching an episodic broadcast podcast, securing an ongoing monthly reels partner, or shooting a bespoke cinematic commercial.'}
          </p>
        </div>

        {/* Services Stack */}
        <div className="space-y-16">

          {/* Service 1: Podcasts & Interviews */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white dark:bg-[#1C1A18] rounded-2xl p-6 sm:p-10 border border-black/8 dark:border-white/10 shadow-sm">
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C82626] uppercase tracking-wider">
                <Mic className="w-4 h-4" />
                <span>{lang === 'ar' ? 'بودكاست ولقاءات' : 'Podcasts & Interviews'}</span>
              </div>

              <div>
                <span className="text-xs font-mono text-[#141211]/60 dark:text-white/60 uppercase tracking-widest">
                  YOUR SHOW, ON SCREEN
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141211] dark:text-white mt-1 tracking-tight">
                  {lang === 'ar' ? 'إنتاج برامج البودكاست المتكاملة' : 'Complete Broadcast Podcast Production'}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-[#141211]/75 dark:text-white/75 leading-relaxed">
                {lang === 'ar'
                  ? 'حلقات متصورة بأكتر من كاميرا في ستوديو KIN بالكوربة. بنسلمك الحلقة كاملة متمنتجة بتصحيح ألوان احترافي وصوت نقي، بالإضافة لكليبات قصيرة رأسية جاهزة للنشر الفوري على Reels و TikTok و Shorts.'
                  : 'Multi-camera episodes recorded at KIN Studio in Korba. Delivered fully edited with color correction, broadcast audio engineering, plus viral short clips tailored for social media.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#141211]/80 dark:text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? 'تصوير بكاميرتين إلى 3 كاميرات 4K' : '2 to 3 4K Cinema Cameras'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? 'مايك استوديو مخصص لكل متحدث' : 'Dedicated broadcast mic per voice'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? 'مونتاج الحلقة وتصحيح الألوان كامل' : 'Complete color grading & audio master'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? 'كليبات سوشيال مقطوعة مع كل حلقة' : 'Vertical viral cuts included'}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onSelectService('podcasts')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#141211] dark:bg-[#C82626] hover:bg-[#C82626] dark:hover:bg-[#a51e1e] transition-colors rounded cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'عرض باكدجات البودكاست (من 10,000 ج)' : 'View Podcast Rates (From 10K EGP)'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenBooking('podcast-duo')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141211] dark:text-white hover:text-[#C82626] dark:hover:text-[#C82626] transition-colors cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'احجز استوديو فوري' : 'Quick Session Booking'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-black/10 dark:border-white/10 group shadow-md">
                <img
                  src={COMPANY_INFO.images.podcastSet}
                  alt="KIN Podcast Studio Lounge Setup"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 inset-x-4 text-white">
                  <p className="text-xs uppercase font-mono text-[#C82626] font-semibold">STUDIO SET · KORBA</p>
                  <p className="text-sm font-bold">{lang === 'ar' ? 'جلسة تسجيل بودكاست ثنائية بأعلى عزل صوتي' : 'Acoustically isolated duo lounge setup'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service 2: Monthly Reels Partner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white dark:bg-[#1C1A18] rounded-2xl p-6 sm:p-10 border border-black/8 dark:border-white/10 shadow-sm">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-black/10 dark:border-white/10 group shadow-md">
                <img
                  src={COMPANY_INFO.images.reelsProduction}
                  alt="KIN Reels Production Action"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 inset-x-4 text-white">
                  <p className="text-xs uppercase font-mono text-[#C82626] font-semibold">9:16 VERTICAL REELS</p>
                  <p className="text-sm font-bold">{lang === 'ar' ? 'تصوير ريلز سينمائي بكاميرات FX3 ومثبتات حركة' : 'High retention cinema gimbal workflow'}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C82626] uppercase tracking-wider">
                <Film className="w-4 h-4" />
                <span>{lang === 'ar' ? 'باكدجات الريلز الشهرية' : 'Monthly Reels Retainer'}</span>
              </div>

              <div>
                <span className="text-xs font-mono text-[#141211]/60 dark:text-white/60 uppercase tracking-widest">
                  CONTENT THAT SPEAKS FOR YOUR BRAND
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#141211] dark:text-white mt-1 tracking-tight">
                  {lang === 'ar' ? 'شريك محتوى شهري لصناع المحتوى والبراندات' : 'Monthly Content Partner for Creators & Brands'}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-[#141211]/75 dark:text-white/75 leading-relaxed">
                {lang === 'ar'
                  ? 'مش مجرد تصوير، إحنا شريكك المستمر: بنساعدك في كتابة وتطوير أفكار الفيديوهات، تصوير احترافي في الاستوديو أو في موقع خارجي، ومونتاج ديناميكي سريع الإيقاع يرفع المشاهدات ومعدل التفاعل.'
                  : 'More than just filming — we are your ongoing partner. Concept structuring, monthly shoot days in studio or on-location, and high-retention editing built for viral social algorithms.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[#141211]/80 dark:text-white/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? '10 إلى 20 ريل شهرياً' : '10 to 20 Reels per month'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? 'خطة محتوى شهرية وهوك جذاب' : 'Monthly content strategy & hooks'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? 'تسليم سريع في 3 إلى 5 أيام عمل' : 'Fast 3-5 days delivery'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#C82626] shrink-0" />
                  <span>{lang === 'ar' ? 'تعديلين لكل فيديو مجاناً' : '2 revisions included per reel'}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onSelectService('reels')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#141211] dark:bg-[#C82626] hover:bg-[#C82626] dark:hover:bg-[#a51e1e] transition-colors rounded cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'عرض باكدجات الريلز (من 12,000 ج)' : 'View Reels Retainers (From 12K EGP)'}</span>
                  <ArrowIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenBooking('reels-pro')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#141211] dark:text-white hover:text-[#C82626] dark:hover:text-[#C82626] transition-colors cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'حجز باقة Pro المقترحة' : 'Book Pro Retainer'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Service 3: Cinematic Commercials */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-[#141211] text-white rounded-2xl p-6 sm:p-10 shadow-xl border border-white/10">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#C82626] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'ar' ? 'الإعلانات السينمائية' : 'Cinematic Commercials'}</span>
              </div>

              <div>
                <span className="text-xs font-mono text-white/50 uppercase tracking-widest">
                  BESPOKE COMMERCIAL PRODUCTION
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
                  {lang === 'ar' ? 'إعلانات وحملات تجارية سينمائية متكاملة' : 'High-End Brand Films & Commercial Campaigns'}
                </h3>
              </div>

              <p className="text-sm sm:text-base text-white/75 leading-relaxed">
                {lang === 'ar'
                  ? 'من غير أسعار ثابتة — كل إعلان هو قصة فريدة تتطلب رؤية إخراجية خاصة، معدات سينمائية متقدمة، كرو متكامل، مواقع تصوير، وتصميم صوتي وموسيقي مخصص. تواصل معنا للحصول على عرض سعر مخصص لحملتك.'
                  : 'Tailored pricing per production brief. Every commercial demands unique director treatment, cinema glass, specialized crew, location scouting, bespoke scoring, and high-end finish. Get in touch for a custom estimate.'}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(
                    lang === 'ar'
                      ? 'مرحباً استوديو KIN، أود طلب عرض سعر لإعلان سينمائي / حملة تجارية'
                      : 'Hello KIN Studio, I would like to request a custom quote for a cinematic commercial'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a31d1d] active:scale-[0.98] transition-all rounded shadow cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'اطلب عرض سعر للإعلان الآن' : 'Request Commercial Quote'}</span>
                </a>

                <button
                  onClick={() => onOpenBooking('commercial')}
                  className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white/90 hover:text-white border border-white/20 hover:border-white/50 rounded transition-colors cursor-pointer"
                >
                  <span>{lang === 'ar' ? 'نموذج طلب المشروع' : 'Project Intake Form'}</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden aspect-[16/10] border border-white/10 group">
                <img
                  src={COMPANY_INFO.images.commercialSet}
                  alt="Cinematic commercial film crew"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 inset-x-3 text-xs font-mono text-white/80 flex justify-between">
                  <span>ANAMORPHIC · 8K RAW</span>
                  <span className="text-[#C82626]">KIN FILMS</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
