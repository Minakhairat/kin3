import React, { useState, useEffect } from 'react';
import { Sparkles, Tag, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Language, PromotionItem } from '../types';
import { subscribePromotions, isPromotionActive } from '../services/pricingCmsService';

interface PromoBannerProps {
  lang: Language;
  onExplorePricing: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ lang, onExplorePricing }) => {
  const [activePromos, setActivePromos] = useState<PromotionItem[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsub = subscribePromotions((promos) => {
      const live = promos.filter(isPromotionActive);
      setActivePromos(live);
    });
    return () => unsub();
  }, []);

  if (isDismissed || activePromos.length === 0) {
    return null;
  }

  const promo = activePromos[0];
  const isAr = lang === 'ar';
  const headline = isAr ? promo.titleAr : (promo.titleEn || promo.titleAr);
  const bannerText = isAr
    ? (promo.bannerTextAr || `خصم استثنائي ${promo.discountPercent}% على باقات الاستوديو لفترة محدودة`)
    : (promo.bannerTextEn || `Special ${promo.discountPercent}% OFF on studio packages for a limited time`);

  return (
    <aside aria-label={isAr ? "عرض ترويجي خاص" : "Special promotional offer"} className="relative z-40 bg-gradient-to-r from-[#9B1818] via-[#C82626] to-[#7D1111] text-white py-2.5 px-4 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-sm">
        
        {/* Left / Start Info */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#C82626] text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? `عرض ${promo.discountPercent}% خصم` : `${promo.discountPercent}% OFF`}
          </span>

          <span className="font-bold font-brand tracking-tight">{headline}</span>
          <span className="hidden md:inline text-white/80">•</span>
          <span className="hidden sm:inline text-white/90 text-xs">{bannerText}</span>

          {promo.code && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/30 border border-white/20 text-xs font-mono font-bold tracking-widest">
              <Tag className="w-3 h-3 text-red-200" />
              {promo.code}
            </span>
          )}

          {promo.endDate && (
            <span className="hidden lg:inline text-[11px] text-white/75 bg-white/10 px-2 py-0.5 rounded-md">
              {isAr ? `ينتهي في ${promo.endDate}` : `Valid until ${promo.endDate}`}
            </span>
          )}
        </div>

        {/* Right CTA & Close */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExplorePricing}
            className="inline-flex items-center gap-1.5 text-xs font-bold underline underline-offset-4 hover:text-white/90 transition-colors cursor-pointer"
          >
            <span>{isAr ? 'احجز بالعرض الآن' : 'Claim Offer'}</span>
            {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            aria-label={isAr ? 'إغلاق الإعلان' : 'Dismiss banner'}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
