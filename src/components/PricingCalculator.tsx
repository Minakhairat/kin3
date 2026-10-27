import React, { useState, useEffect } from 'react';
import { PODCAST_PACKAGES, REELS_PACKAGES, ADDONS_DATA, COMPANY_INFO } from '../data/content';
import { Language, PricingPackage, PromotionItem, PackageCMSItem } from '../types';
import { Check, Star, Calculator, Image as ImageIcon, MessageCircle, Calendar, Plus, Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { subscribePackagesCMS, subscribePromotions, isPromotionActive } from '../services/pricingCmsService';

interface PricingCalculatorProps {
  lang: Language;
  activeCategory: 'podcasts' | 'reels';
  onCategoryChange: (category: 'podcasts' | 'reels') => void;
  onOpenBooking: (pkgId: string, customAddons?: string[], calculatedTotal?: number) => void;
  onViewPoster: (type: 'podcasts' | 'reels') => void;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  lang,
  activeCategory,
  onCategoryChange,
  onOpenBooking,
  onViewPoster,
}) => {
  // Calculator state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('podcast-doubleday');
  const [extraGuests, setExtraGuests] = useState<number>(0);
  const [extraHours, setExtraHours] = useState<number>(0);
  const [includeOutdoorShoot, setIncludeOutdoorShoot] = useState<boolean>(false);
  const [requestCustomSet, setRequestCustomSet] = useState<boolean>(false);

  // Dynamic pricing from CMS and active promotions
  const [cmsPackages, setCmsPackages] = useState<PackageCMSItem[]>([]);
  const [activePromos, setActivePromos] = useState<PromotionItem[]>([]);

  useEffect(() => {
    const unsubPkg = subscribePackagesCMS((packages) => {
      if (packages && packages.length > 0) {
        setCmsPackages(packages);
      }
    });

    const unsubPromo = subscribePromotions((promos) => {
      const live = promos.filter(isPromotionActive);
      setActivePromos(live);
    });

    return () => {
      unsubPkg();
      unsubPromo();
    };
  }, []);

  // Determine active promo for current category
  const activePromo = activePromos.find(
    (p) => p.applicableCategory === 'all' || p.applicableCategory === activeCategory
  );

  // Helper to merge base package with CMS & Promo
  const enrichPackage = (basePkg: PricingPackage): PricingPackage => {
    const cmsMatch = cmsPackages.find((p) => p.id === basePkg.id);
    let price = cmsMatch ? cmsMatch.priceEGP : basePkg.price;
    let originalPrice: number | undefined = cmsMatch?.originalPriceEGP || basePkg.originalPrice;

    // Apply active promotional discount
    if (activePromo && activePromo.discountPercent > 0) {
      originalPrice = price;
      price = Math.round(price * (1 - activePromo.discountPercent / 100));
    }

    return {
      ...basePkg,
      name: (cmsMatch ? (lang === 'ar' ? cmsMatch.nameAr : cmsMatch.nameEn) : null) || basePkg.name,
      duration: (cmsMatch ? (lang === 'ar' ? cmsMatch.periodAr : cmsMatch.periodEn) : null) || basePkg.duration,
      highlight: (cmsMatch ? (lang === 'ar' ? cmsMatch.highlightAr : cmsMatch.highlightEn) : null) || basePkg.highlight,
      deliverables: (cmsMatch ? (lang === 'ar' ? cmsMatch.deliverablesAr : cmsMatch.deliverablesEn) : null) || basePkg.deliverables,
      features: (cmsMatch?.featuresAr && cmsMatch.featuresAr.length > 0) ? cmsMatch.featuresAr : basePkg.features,
      isPopular: typeof cmsMatch?.isPopular === 'boolean' ? cmsMatch.isPopular : basePkg.isPopular,
      price,
      originalPrice,
      activePromoDiscount: activePromo?.discountPercent,
      isCustomPrice: !!cmsMatch || !!activePromo,
    };
  };

  const isPkgActive = (pkg: PricingPackage): boolean => {
    const cms = cmsPackages.find((c) => c.id === pkg.id);
    return cms ? cms.isActive !== false : true;
  };

  // Convert any custom CMS packages into PricingPackage shape
  const customCmsPackages: PricingPackage[] = cmsPackages
    .filter((c) => c.isActive !== false && !PODCAST_PACKAGES.some((p) => p.id === c.id) && !REELS_PACKAGES.some((p) => p.id === c.id))
    .map((c) => enrichPackage({
      id: c.id,
      category: c.category as any,
      name: lang === 'ar' ? c.nameAr : (c.nameEn || c.nameAr),
      price: c.priceEGP,
      period: (lang === 'ar' ? c.periodAr : c.periodEn) || 'جلسة استوديو',
      unitAr: 'ج.م',
      unitEn: 'EGP',
      duration: (lang === 'ar' ? c.periodAr : c.periodEn) || 'جلسة استوديو',
      originalPrice: c.originalPriceEGP,
      highlight: (lang === 'ar' ? c.highlightAr : c.highlightEn) || undefined,
      highlightAr: c.highlightAr,
      highlightEn: c.highlightEn,
      deliverables: (lang === 'ar' ? c.deliverablesAr : c.deliverablesEn) || '',
      deliverablesAr: c.deliverablesAr || '',
      deliverablesEn: c.deliverablesEn || '',
      features: c.featuresAr || [],
      featuresAr: c.featuresAr || [],
      featuresEn: c.featuresEn || c.featuresAr || [],
      isPopular: !!c.isPopular,
    }));

  const baseList = activeCategory === 'podcasts' ? PODCAST_PACKAGES : REELS_PACKAGES;
  const currentPackages = [
    ...baseList.filter(isPkgActive).map(enrichPackage),
    ...customCmsPackages.filter((p) => p.category === activeCategory),
  ];

  const allPackages = [
    ...PODCAST_PACKAGES.filter(isPkgActive).map(enrichPackage),
    ...REELS_PACKAGES.filter(isPkgActive).map(enrichPackage),
    ...customCmsPackages,
  ];

  const currentSelectedPkg = allPackages.find((p) => p.id === selectedPackageId) || currentPackages[0] || PODCAST_PACKAGES[0];

  // Calculate live total price
  const calculateTotal = (): number => {
    let total = currentSelectedPkg.price;
    if (currentSelectedPkg.category === 'podcasts') {
      total += extraGuests * 3500;
    } else {
      if (includeOutdoorShoot) total += 4000;
      total += extraHours * 1000;
    }
    return total;
  };

  const currentTotal = calculateTotal();

  const generateWhatsAppUrl = (pkg: PricingPackage, isCustom = false) => {
    let text = '';
    const promoCodeNotice = activePromo?.code ? ` (كود الخصم: ${activePromo.code})` : '';

    if (isCustom) {
      text =
        lang === 'ar'
          ? `مرحباً KIN Media Production، أود حجز الباقة التالية:\n- الباقة: ${currentSelectedPkg.name} (${currentSelectedPkg.category === 'podcasts' ? 'بودكاست ولقاءات' : 'ريلز شهرية'})\n` +
            (extraGuests > 0 ? `- ضيوف إضافيين: ${extraGuests} (+${extraGuests * 3500} ج)\n` : '') +
            (includeOutdoorShoot ? `- تصوير خارجي: نعم (+4000 ج)\n` : '') +
            (extraHours > 0 ? `- ساعات إضافية: ${extraHours} (+${extraHours * 1000} ج)\n` : '') +
            (requestCustomSet ? `- طلب ديكور مخصص أو خلفية AI: نعم\n` : '') +
            `- الإجمالي التقديري: ${currentTotal.toLocaleString()} ج.م${promoCodeNotice}\nأرجو إفادتي بأقرب المواعيد المتاحة في استوديو الكوربة.`
          : `Hello KIN Media Production, I would like to book the following configuration:\n- Package: ${currentSelectedPkg.name} (${currentSelectedPkg.category})\n` +
            (extraGuests > 0 ? `- Extra Guests: ${extraGuests} (+${extraGuests * 3500} EGP)\n` : '') +
            (includeOutdoorShoot ? `- Outdoor Shoot: Yes (+4000 EGP)\n` : '') +
            (extraHours > 0 ? `- Extra Hours: ${extraHours} (+${extraHours * 1000} EGP)\n` : '') +
            (requestCustomSet ? `- Custom Set / AI Backdrop: Yes\n` : '') +
            `- Total Estimated: ${currentTotal.toLocaleString()} EGP${promoCodeNotice}\nPlease let me know available recording slots in Korba studio.`;
    } else {
      text =
        lang === 'ar'
          ? `مرحباً استوديو KIN، أود حجز باقة "${pkg.name}" (${pkg.category === 'podcasts' ? 'بودكاست ولقاءات' : 'ريلز شهرية'}) بسعر ${pkg.price.toLocaleString()} ج.م${promoCodeNotice}. أرجو تأكيد المواعيد المتاحة.`
          : `Hello KIN Studio, I want to book the "${pkg.name}" package (${pkg.category}) for ${pkg.price.toLocaleString()} EGP${promoCodeNotice}. Please confirm available slots.`;
    }
    return `https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(text)}`;
  };

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white dark:bg-[#141211] border-b border-black/8 dark:border-white/10 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C82626]">
                {lang === 'ar' ? 'الشفافية الكاملة' : 'Transparent Pricing'}
              </span>
              {activePromo && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-[#C82626] border border-red-500/20 text-xs font-bold animate-pulse">
                  <Sparkles className="w-3 h-3" />
                  {lang === 'ar' ? `عرض نشط - خصم ${activePromo.discountPercent}%` : `Active Offer: ${activePromo.discountPercent}% OFF`}
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141211] dark:text-white tracking-tight leading-tight text-balance">
              {lang === 'ar' ? 'الباكدجات والأسعار الرسمية' : 'Official Studio Packages & Rates'}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#141211]/70 dark:text-white/70 leading-relaxed">
              {lang === 'ar'
                ? 'جميع الأسعار بالجنيه المصري وهي أسعار التصوير داخل استوديو KIN بالكوربة. اختر نوع الخدمة أو استخدم الحاسبة لتخصيص جلستك.'
                : 'All rates are in Egyptian Pounds (EGP) for in-studio production at KIN Studio in Korba. Choose a service or customize your session.'}
            </p>
          </div>

          {/* View Official Graphic Poster Button */}
          <button
            onClick={() => onViewPoster(activeCategory)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-lg border border-black/10 dark:border-white/20 transition-colors whitespace-nowrap shrink-0 self-start md:self-end cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-[#C82626]" />
            <span>
              {lang === 'ar' ? 'عرض البوستر الأصلي المعتمد' : 'View Official Price Poster'}
            </span>
          </button>
        </div>

        {/* Interactive Category Segmented Control */}
        <div className="flex items-center justify-center mb-14">
          <div className="inline-flex p-1.5 bg-[#FAFAFA] dark:bg-[#1C1A18] border border-black/10 dark:border-white/15 rounded-xl max-w-md w-full sm:w-auto shadow-inner">
            <button
              onClick={() => {
                onCategoryChange('podcasts');
                setSelectedPackageId('podcast-doubleday');
              }}
              className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeCategory === 'podcasts'
                  ? 'bg-[#141211] dark:bg-[#C82626] text-white shadow'
                  : 'text-[#141211]/70 dark:text-white/70 hover:text-[#141211] dark:hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'بودكاست ولقاءات' : 'Podcasts & Interviews'}
            </button>
            <button
              onClick={() => {
                onCategoryChange('reels');
                setSelectedPackageId('reels-pro');
              }}
              className={`flex-1 sm:flex-initial px-6 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                activeCategory === 'reels'
                  ? 'bg-[#141211] dark:bg-[#C82626] text-white shadow'
                  : 'text-[#141211]/70 dark:text-white/70 hover:text-[#141211] dark:hover:text-white'
              }`}
            >
              {lang === 'ar' ? 'ريلز شهرية' : 'Monthly Reels'}
            </button>
          </div>
        </div>

        {/* Dynamic Category Tagline Banner */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#C82626] font-semibold block mb-1">
            {activeCategory === 'podcasts' ? 'YOUR SHOW, ON SCREEN' : 'CONTENT THAT SPEAKS FOR YOUR BRAND'}
          </span>
          <p className="text-sm text-[#141211]/70 dark:text-white/70 max-w-xl mx-auto">
            {activeCategory === 'podcasts'
              ? (lang === 'ar'
                  ? 'حلقات متصورة بأكتر من كاميرا في ستوديو KIN — الحلقة كاملة متمنتجة + كليبات قصيرة جاهزة للسوشيال.'
                  : 'Multi-camera episodes recorded at KIN — the full episode edited, plus short clips ready for social.')
              : (lang === 'ar'
                  ? 'شريك محتوى شهري لصناع المحتوى والبراندات الشخصية — تخطيط وتصوير ومونتاج في مكان واحد.'
                  : 'A monthly content partner for creators and personal brands — planned, shot and edited in one place.')}
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className={`grid grid-cols-1 gap-8 mb-16 ${
          activeCategory === 'podcasts'
            ? 'md:grid-cols-2 lg:grid-cols-4'
            : 'md:grid-cols-3'
        }`}>
          {currentPackages.map((pkg) => {
            const isRec = pkg.recommended;
            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl flex flex-col justify-between transition-all duration-200 ${
                  isRec
                    ? 'bg-[#141211] dark:bg-[#1E1B19] text-white shadow-xl scale-[1.02] border-2 border-[#C82626] p-7'
                    : 'bg-[#FAFAFA] dark:bg-[#1C1A18] text-[#141211] dark:text-white border border-black/8 dark:border-white/10 hover:border-black/20 dark:hover:border-white/25 hover:shadow-md p-6'
                }`}
              >
                {/* Recommended Tag */}
                {isRec && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C82626] text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" />
                    <span>{lang === 'ar' ? 'الباقة المقترحة' : 'RECOMMENDED'}</span>
                  </div>
                )}

                <div>
                  {/* Package Name & Unit */}
                  <div className="mb-6">
                    <h3 className={`text-xl font-black tracking-tight ${isRec ? 'text-white' : 'text-[#141211] dark:text-white'}`}>
                      {pkg.name}
                    </h3>
                    <p className={`text-xs mt-1 ${isRec ? 'text-white/70' : 'text-[#141211]/60 dark:text-white/60'}`}>
                      {lang === 'ar' ? pkg.deliverablesAr : pkg.deliverablesEn}
                    </p>
                  </div>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-black/8 dark:border-white/10">
                    {/* Crossed-out original price if discount applied */}
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm line-through text-neutral-400 font-mono">
                          {pkg.originalPrice.toLocaleString()} EGP
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
                          -{pkg.activePromoDiscount}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight ${isRec ? 'text-white' : 'text-[#141211] dark:text-white'}`}>
                        {pkg.price.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-[#C82626]">
                        {lang === 'ar' ? 'ج.م' : 'EGP'}
                      </span>
                    </div>
                    <span className={`text-xs font-medium block mt-1 ${isRec ? 'text-white/60' : 'text-[#141211]/50 dark:text-white/50'}`}>
                      {lang === 'ar' ? pkg.unitAr : pkg.unitEn}
                    </span>
                    <span className={`text-[11px] inline-block mt-1 font-mono uppercase ${isRec ? 'text-[#C82626]' : 'text-black/40 dark:text-white/40'}`}>
                      {lang === 'ar' ? 'سعر التصوير بالاستوديو' : 'In-studio production rate'}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 text-xs sm:text-sm">
                    {(lang === 'ar' ? pkg.featuresAr : pkg.featuresEn).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#C82626]" />
                        <span className={isRec ? 'text-white/85' : 'text-[#141211]/80 dark:text-white/80'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA Actions */}
                <div className="space-y-2 pt-4 border-t border-black/8 dark:border-white/10">
                  <a
                    href={generateWhatsAppUrl(pkg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      isRec
                        ? 'bg-[#C82626] text-white hover:bg-[#a31d1d] shadow'
                        : 'bg-[#141211] dark:bg-white/10 text-white hover:bg-[#C82626] dark:hover:bg-[#C82626]'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'احجز عبر واتساب' : 'Book on WhatsApp'}</span>
                  </a>

                  <button
                    onClick={() => {
                      setSelectedPackageId(pkg.id);
                      onOpenBooking(pkg.id, [], pkg.price);
                    }}
                    className={`w-full text-center py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isRec
                        ? 'text-white/70 hover:text-white'
                        : 'text-[#141211]/60 dark:text-white/60 hover:text-[#141211] dark:hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? 'تخصيص في فورم الحجز' : 'Customize Booking'}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Live Interactive Session Customizer Calculator */}
        <div className="bg-[#FAFAFA] dark:bg-[#1A1817] rounded-3xl border border-black/10 dark:border-white/15 p-6 sm:p-10 shadow-lg">
          <div className="max-w-4xl mx-auto">
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#C82626]/10 text-[#C82626] flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#141211] dark:text-white tracking-tight">
                  {lang === 'ar' ? 'حاسبة الجلسة المخصصة' : 'Custom Session Calculator'}
                </h3>
                <p className="text-xs sm:text-sm text-[#141211]/60 dark:text-white/60">
                  {lang === 'ar'
                    ? 'اختر باقة وأضف ضيوف أو ساعات إضافية لحساب التكلفة التقديرية بدقة.'
                    : 'Select a base package and tweak hours or guests for an accurate live quote.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Options Column */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Select Base Package */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#141211]/70 dark:text-white/70 mb-2">
                    {lang === 'ar' ? 'الباقة الأساسية:' : 'Base Package:'}
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#141211] border border-black/15 dark:border-white/20 text-[#141211] dark:text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#C82626] cursor-pointer"
                  >
                    {allPackages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.category === 'podcasts' ? (lang === 'ar' ? 'بودكاست' : 'Podcast') : (lang === 'ar' ? 'ريلز' : 'Reels')}) — {p.price.toLocaleString()} EGP
                      </option>
                    ))}
                  </select>
                </div>

                {/* Podcast Specific Options */}
                {currentSelectedPkg.category === 'podcasts' && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#141211] border border-black/10 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-[#141211] dark:text-white">
                        {lang === 'ar' ? 'ضيوف إضافيين على الحلقة (+3,500 ج/ضيف)' : 'Extra Guests (+3,500 EGP/guest)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExtraGuests((prev) => Math.max(0, prev - 1))}
                          className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-sm font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold font-mono">{extraGuests}</span>
                        <button
                          type="button"
                          onClick={() => setExtraGuests((prev) => prev + 1)}
                          className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-sm font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reels Specific Options */}
                {currentSelectedPkg.category === 'reels' && (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#141211] border border-black/10 dark:border-white/10 space-y-4">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-semibold text-[#141211] dark:text-white">
                        {lang === 'ar' ? 'ساعات تصوير إضافية (+1,000 ج/ساعة)' : 'Extra Shoot Hours (+1,000 EGP/hr)'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExtraHours((prev) => Math.max(0, prev - 1))}
                          className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-sm font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-bold font-mono">{extraHours}</span>
                        <button
                          type="button"
                          onClick={() => setExtraHours((prev) => prev + 1)}
                          className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 text-sm font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-black/5 dark:border-white/5">
                      <input
                        type="checkbox"
                        checked={includeOutdoorShoot}
                        onChange={(e) => setIncludeOutdoorShoot(e.target.checked)}
                        className="w-4 h-4 accent-[#C82626] rounded cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm text-[#141211] dark:text-white font-medium">
                        {lang === 'ar' ? 'إضافة يوم تصوير خارجي Outdoor (+4,000 ج)' : 'Add Outdoor Shoot Day (+4,000 EGP)'}
                      </span>
                    </label>
                  </div>
                )}

                {/* Custom Decor / AI Backdrop Add-on */}
                <label className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-[#141211] border border-black/10 dark:border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requestCustomSet}
                    onChange={(e) => setRequestCustomSet(e.target.checked)}
                    className="w-4 h-4 accent-[#C82626] rounded cursor-pointer"
                  />
                  <div className="text-xs sm:text-sm">
                    <span className="font-semibold text-[#141211] dark:text-white block">
                      {lang === 'ar' ? 'طلب تصميم ديكور مخصص بالاستوديو أو خلفية AI خاصة' : 'Custom Studio Set Design or Custom AI Virtual Backdrop'}
                    </span>
                    <span className="text-[11px] text-[#141211]/60 dark:text-white/60">
                      {lang === 'ar' ? 'يتم تحديد التكلفة مع مهندس الديكور حسب المطلوب' : 'Cost quoted based on set specs and materials'}
                    </span>
                  </div>
                </label>

              </div>

              {/* Total Summary Card Column */}
              <div className="lg:col-span-5 bg-[#141211] dark:bg-black text-white p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#C82626] font-bold block mb-1">
                    {lang === 'ar' ? 'التكلفة الإجمالية التقديرية' : 'ESTIMATED TOTAL'}
                  </span>
                  
                  <div className="flex items-baseline gap-2 my-4">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
                      {currentTotal.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold text-[#C82626]">
                      {lang === 'ar' ? 'ج.م' : 'EGP'}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 mb-6 leading-relaxed">
                    {lang === 'ar'
                      ? `تشمل باقة "${currentSelectedPkg.name}" بجميع كاميراتها، إضاءتها، هندسة الصوت، والمونتاج المعتمد.`
                      : `Includes the "${currentSelectedPkg.name}" package with all cameras, pro lighting, audio engineering & color grade.`}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <a
                    href={generateWhatsAppUrl(currentSelectedPkg, true)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs sm:text-sm font-bold rounded-xl shadow transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'تأكيد الحجز المخصص عبر واتساب' : 'Confirm Custom Quote on WhatsApp'}</span>
                  </a>

                  <button
                    onClick={() => {
                      const addons: string[] = [];
                      if (extraGuests > 0) addons.push(`${extraGuests} ضيوف إضافيين`);
                      if (extraHours > 0) addons.push(`${extraHours} ساعات إضافية`);
                      if (includeOutdoorShoot) addons.push('تصوير خارجي');
                      if (requestCustomSet) addons.push('ديكور مخصص');
                      onOpenBooking(currentSelectedPkg.id, addons, currentTotal);
                    }}
                    className="w-full text-center py-2.5 text-xs font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    {lang === 'ar' ? 'حجز التاريخ في الاستوديو' : 'Reserve Session Date Online'}
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
