import React from 'react';
import { STRENGTHS } from '../data/content';
import { Language } from '../types';
import { Video, Mic, Users, Scissors, Target, Clock } from 'lucide-react';

interface WhyKinProps {
  lang: Language;
}

const iconMap: Record<string, React.ElementType> = {
  Video,
  Mic,
  Users,
  Scissors,
  Target,
  Clock,
};

export const WhyKin: React.FC<WhyKinProps> = ({ lang }) => {
  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#141211] border-b border-black/8 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C82626] mb-3">
            {lang === 'ar' ? 'فلسفة العمل' : 'Our Philosophy'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141211] dark:text-white tracking-tight leading-tight text-balance">
            {lang === 'ar' ? 'ليه تصنع محتواك مع استوديو KIN؟' : 'Why Produce Your Content with KIN?'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#141211]/70 dark:text-white/70 leading-relaxed text-balance">
            {lang === 'ar'
              ? 'شعارنا "KEEP IT NEAT" مش مجرد كلمة، دي منظومة إنتاج كاملة بتوفر عليك تشتت الكرو المستقل والشركات الوسيطة.'
              : '"KEEP IT NEAT" is more than a tagline — it is our operational discipline eliminating the chaos of fragmented freelancers.'}
          </p>
        </div>

        {/* 6 Key Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STRENGTHS.map((strength, index) => {
            const Icon = iconMap[strength.iconName] || Video;
            return (
              <div
                key={strength.id}
                className="group p-8 rounded-xl bg-[#FAFAFA] dark:bg-[#1C1A18] border border-black/6 dark:border-white/10 hover:border-black/20 dark:hover:border-white/25 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Clean Icon Box */}
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#252220] border border-black/8 dark:border-white/10 flex items-center justify-center text-[#141211] dark:text-white group-hover:text-white group-hover:bg-[#C82626] dark:group-hover:bg-[#C82626] transition-colors mb-6 shadow-2xs">
                    <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-[#141211] dark:text-white tracking-tight mb-3">
                    {lang === 'ar' ? strength.titleAr : strength.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[#141211]/70 dark:text-white/70 leading-relaxed">
                    {lang === 'ar' ? strength.descAr : strength.descEn}
                  </p>
                </div>

                {/* Subtle Numerical Marker */}
                <div className="mt-8 pt-4 border-t border-black/6 dark:border-white/10 flex items-center justify-between text-xs font-mono text-[#141211]/40 dark:text-white/40">
                  <span>KIN 0{index + 1}</span>
                  <span className="text-[#C82626] font-sans font-semibold">KEEP IT NEAT</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
