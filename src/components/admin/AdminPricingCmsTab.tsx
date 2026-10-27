import React, { useState, useEffect } from 'react';
import {
  Tag,
  DollarSign,
  Plus,
  Trash2,
  Edit3,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Save,
  Check,
  Eye,
  EyeOff,
  Ticket,
  Clock,
  X,
  AlertCircle
} from 'lucide-react';
import { Language, PackageCMSItem, PromotionItem, CouponCodeItem, ServiceCategory } from '../../types';
import { PODCAST_PACKAGES, REELS_PACKAGES } from '../../data/content';
import {
  subscribePackagesCMS,
  savePackageCMS,
  deletePackageCMS,
  subscribePromotions,
  savePromotion,
  deletePromotion,
} from '../../services/pricingCmsService';
import {
  subscribeCoupons,
  saveCoupon,
  toggleCouponActive,
  deleteCoupon,
} from '../../services/couponsService';

interface AdminPricingCmsTabProps {
  lang: Language;
}

export const AdminPricingCmsTab: React.FC<AdminPricingCmsTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  const [activeSubTab, setActiveSubTab] = useState<'packages' | 'promotions' | 'coupons'>('packages');
  const [cmsPackages, setCmsPackages] = useState<PackageCMSItem[]>([]);
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [coupons, setCoupons] = useState<CouponCodeItem[]>([]);

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Package Full Edit Modal state
  const [editingPkg, setEditingPkg] = useState<PackageCMSItem | null>(null);
  const [pkgNameAr, setPkgNameAr] = useState('');
  const [pkgNameEn, setPkgNameEn] = useState('');
  const [pkgCategory, setPkgCategory] = useState<ServiceCategory>('podcasts');
  const [pkgPrice, setPkgPrice] = useState<number>(0);
  const [pkgOriginalPrice, setPkgOriginalPrice] = useState<number>(0);
  const [pkgPeriodAr, setPkgPeriodAr] = useState('');
  const [pkgHighlightAr, setPkgHighlightAr] = useState('');
  const [pkgDeliverablesAr, setPkgDeliverablesAr] = useState('');
  const [pkgFeaturesText, setPkgFeaturesText] = useState('');
  const [pkgIsActive, setPkgIsActive] = useState<boolean>(true);
  const [pkgIsPopular, setPkgIsPopular] = useState<boolean>(false);
  const [isSavingPkg, setIsSavingPkg] = useState(false);

  // New Promotion Form state
  const [promoTitleAr, setPromoTitleAr] = useState('');
  const [promoTitleEn, setPromoTitleEn] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [bannerTextAr, setBannerTextAr] = useState('');
  const [applicableCategory, setApplicableCategory] = useState<'all' | 'podcasts' | 'reels'>('all');
  const [isSavingPromo, setIsSavingPromo] = useState(false);

  // New Coupon Form state
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percent' | 'fixed'>('percent');
  const [couponValue, setCouponValue] = useState<number>(10);
  const [couponExpiresAt, setCouponExpiresAt] = useState('');
  const [couponMinAmount, setCouponMinAmount] = useState<number>(0);
  const [couponDescription, setCouponDescription] = useState('');
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);

  useEffect(() => {
    const unsubPkg = subscribePackagesCMS(setCmsPackages);
    const unsubPromo = subscribePromotions(setPromotions);
    const unsubCoupons = subscribeCoupons(setCoupons);
    return () => {
      unsubPkg();
      unsubPromo();
      unsubCoupons();
    };
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  // Base list merged from static items and CMS overrides
  const staticPackages = [...PODCAST_PACKAGES, ...REELS_PACKAGES];
  
  // Combine static packages with CMS overrides + new custom packages in CMS
  const mergedPackages: PackageCMSItem[] = [
    ...staticPackages.map((s) => {
      const cms = cmsPackages.find((c) => c.id === s.id);
      if (cms) return cms;
      return {
        id: s.id,
        category: s.category,
        nameAr: s.name,
        nameEn: s.name,
        priceEGP: s.price,
        originalPriceEGP: s.originalPrice,
        periodAr: s.duration,
        highlightAr: s.highlight,
        deliverablesAr: s.deliverables,
        featuresAr: s.features,
        isActive: true,
        isPopular: s.isPopular,
      } as PackageCMSItem;
    }),
    ...cmsPackages.filter((c) => !staticPackages.some((s) => s.id === c.id)),
  ];

  const handleOpenEditPkg = (pkg: PackageCMSItem) => {
    setEditingPkg(pkg);
    setPkgNameAr(pkg.nameAr || '');
    setPkgNameEn(pkg.nameEn || pkg.nameAr || '');
    setPkgCategory(pkg.category || 'podcasts');
    setPkgPrice(pkg.priceEGP || 0);
    setPkgOriginalPrice(pkg.originalPriceEGP || 0);
    setPkgPeriodAr(pkg.periodAr || '');
    setPkgHighlightAr(pkg.highlightAr || '');
    setPkgDeliverablesAr(pkg.deliverablesAr || '');
    setPkgFeaturesText(pkg.featuresAr ? pkg.featuresAr.join('\n') : '');
    setPkgIsActive(pkg.isActive !== false);
    setPkgIsPopular(!!pkg.isPopular);
  };

  const handleCreateNewPkg = () => {
    const newId = `pkg_${Date.now()}`;
    const newTemplate: PackageCMSItem = {
      id: newId,
      category: 'podcasts',
      nameAr: isAr ? 'باقة جديدة' : 'New Package',
      nameEn: 'New Package',
      priceEGP: 12000,
      isActive: true,
    };
    handleOpenEditPkg(newTemplate);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg || !pkgNameAr.trim() || pkgPrice <= 0) return;

    setIsSavingPkg(true);
    try {
      const features = pkgFeaturesText
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload: PackageCMSItem = {
        id: editingPkg.id,
        category: pkgCategory,
        nameAr: pkgNameAr.trim(),
        nameEn: pkgNameEn.trim() || pkgNameAr.trim(),
        priceEGP: Number(pkgPrice),
        originalPriceEGP: pkgOriginalPrice > 0 ? Number(pkgOriginalPrice) : undefined,
        periodAr: pkgPeriodAr.trim() || undefined,
        periodEn: pkgPeriodAr.trim() || undefined,
        highlightAr: pkgHighlightAr.trim() || undefined,
        highlightEn: pkgHighlightAr.trim() || undefined,
        deliverablesAr: pkgDeliverablesAr.trim() || undefined,
        deliverablesEn: pkgDeliverablesAr.trim() || undefined,
        featuresAr: features.length > 0 ? features : undefined,
        isActive: pkgIsActive,
        isPopular: pkgIsPopular,
        updatedAt: new Date().toISOString(),
      };

      await savePackageCMS(payload);
      setEditingPkg(null);
      notify('success', isAr ? 'تم حفظ وتحديث جميع تفاصيل الباقة بنجاح!' : 'Package saved successfully!');
    } catch (err: unknown) {
      console.error(err);
      notify('error', isAr ? 'حدث خطأ أثناء حفظ الباقة' : 'Failed to save package');
    } finally {
      setIsSavingPkg(false);
    }
  };

  const handleTogglePkgActive = async (pkg: PackageCMSItem) => {
    try {
      const updated = {
        ...pkg,
        isActive: !pkg.isActive,
        updatedAt: new Date().toISOString(),
      };
      await savePackageCMS(updated);
      notify('success', updated.isActive ? (isAr ? 'تم تفعيل الباقة وإظهارها بالموقع' : 'Package activated') : (isAr ? 'تم إخفاء الباقة من الموقع' : 'Package hidden'));
    } catch (err: unknown) {
      console.error(err);
      notify('error', isAr ? 'تعذر تغيير حالة العرض' : 'Failed to update visibility');
    }
  };

  const handleDeletePkg = async (id: string, name: string) => {
    if (!window.confirm(isAr ? `هل أنت متأكد من حذف باقة "${name}" نهائياً من الموقع؟` : `Delete package "${name}"?`)) return;
    try {
      // Mark as inactive or delete doc
      await savePackageCMS({
        id,
        category: 'podcasts',
        nameAr: name,
        nameEn: name,
        priceEGP: 0,
        isActive: false,
      });
      await deletePackageCMS(id);
      notify('success', isAr ? 'تم حذف الباقة' : 'Package deleted');
    } catch (err: unknown) {
      console.error(err);
      notify('error', isAr ? 'تعذر حذف الباقة' : 'Failed to delete package');
    }
  };

  // Promotion Handlers
  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitleAr.trim() || discountPercent <= 0) return;

    setIsSavingPromo(true);
    try {
      await savePromotion({
        titleAr: promoTitleAr.trim(),
        titleEn: promoTitleEn.trim(),
        code: promoCode.trim().toUpperCase() || undefined,
        discountPercent: Number(discountPercent),
        startDate,
        endDate,
        bannerTextAr: bannerTextAr.trim() || undefined,
        applicableCategory,
        isActive: true,
      });

      setPromoTitleAr('');
      setPromoTitleEn('');
      setPromoCode('');
      setBannerTextAr('');
      notify('success', isAr ? 'تم إطلاق العرض الترويجي وتفعيله في الموقع!' : 'Promotion launched successfully!');
    } catch (err: unknown) {
      console.error(err);
      notify('error', isAr ? 'حدث خطأ أثناء حفظ العرض' : 'Failed to save promotion');
    } finally {
      setIsSavingPromo(false);
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!window.confirm(isAr ? 'حذف هذا العرض؟' : 'Delete this promotion?')) return;
    try {
      await deletePromotion(id);
      notify('success', isAr ? 'تم حذف العرض' : 'Promotion deleted');
    } catch (err: unknown) {
      console.error(err);
      notify('error', isAr ? 'تعذر حذف العرض' : 'Failed to delete promotion');
    }
  };

  // Coupon Handlers
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || couponValue <= 0) return;

    setIsSavingCoupon(true);
    try {
      await saveCoupon({
        code: couponCode.trim().toUpperCase(),
        discountType: couponType,
        discountValue: Number(couponValue),
        expiresAt: couponExpiresAt || undefined,
        minBookingAmount: couponMinAmount > 0 ? Number(couponMinAmount) : undefined,
        description: couponDescription.trim() || undefined,
        isActive: true,
      });

      setCouponCode('');
      setCouponValue(10);
      setCouponExpiresAt('');
      setCouponMinAmount(0);
      setCouponDescription('');
      notify('success', isAr ? 'تم إنشاء كود الخصم وأصبح جاهزاً للاستخدام عند الحجز!' : 'Coupon created successfully!');
    } catch (err: unknown) {
      console.error(err);
      notify('error', isAr ? 'حدث خطأ أثناء حفظ الكوبون' : 'Failed to save coupon');
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleToggleCoupon = async (id: string, currentActive: boolean) => {
    try {
      await toggleCouponActive(id, !currentActive);
      notify('success', !currentActive ? (isAr ? 'تم تفعيل الكوبون' : 'Coupon activated') : (isAr ? 'تم تعطيل / إنهاء صلاحية الكوبون' : 'Coupon deactivated'));
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDeleteCouponItem = async (id: string, code: string) => {
    if (!window.confirm(isAr ? `حذف كود الخصم "${code}" نهائياً؟` : `Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      notify('success', isAr ? 'تم حذف الكوبون' : 'Coupon deleted');
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 font-brand">
            <Tag className="w-5 h-5 text-[#C82626]" />
            <span>{isAr ? 'إدارة الأسعار، العروض، وكوبونات الخصم' : 'Pricing, Promotions & Coupons CMS'}</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isAr
              ? 'تعديل كافة تفاصيل باقات الاستوديو بالكامل، حذف أو إخفاء أي باقة، إنشاء عروض ترويجية، وتوليد كوبونات خصم لصفحة الحجز.'
              : 'Full control over studio packages, seasonal offers, and client discount codes.'}
          </p>
        </div>

        {/* Subtab Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          <button
            onClick={() => setActiveSubTab('packages')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'packages'
                ? 'bg-white dark:bg-[#1A1817] text-[#C82626] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isAr ? 'باقات الاستوديو' : 'Packages'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-700">
              {mergedPackages.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('promotions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'promotions'
                ? 'bg-white dark:bg-[#1A1817] text-[#C82626] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'العروض الترويجية' : 'Promotions'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-700">
              {promotions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('coupons')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'coupons'
                ? 'bg-white dark:bg-[#1A1817] text-[#C82626] shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{isAr ? 'أكواد الخصم والكوبونات' : 'Coupons'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-700">
              {coupons.length}
            </span>
          </button>
        </div>
      </div>

      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
            notification.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-600'
              : 'bg-red-500/10 border border-red-500/20 text-red-600'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* SUBTAB 1: PACKAGES CMS (Full Editing & Deletion) */}
      {activeSubTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                {isAr ? 'قائمة باقات الاستوديو المعروضة بالموقع' : 'Live Studio Packages CMS'}
              </h4>
              <p className="text-xs text-neutral-500">
                {isAr ? 'يمكنك تعديل أي تفاصيل، مسميات، أسعار، مميزات، أو إخفاء وحذف أي باقة.' : 'Modify all package specs, deliverables, pricing, and visibility.'}
              </p>
            </div>

            <button
              onClick={handleCreateNewPkg}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة باقة جديدة' : 'New Package'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mergedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  pkg.isActive === false
                    ? 'bg-neutral-100/60 dark:bg-neutral-900/40 border-dashed border-neutral-300 dark:border-neutral-800 opacity-60'
                    : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase">
                          {pkg.category}
                        </span>
                        {pkg.isPopular && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            ★ {isAr ? 'الأكثر طلباً' : 'Popular'}
                          </span>
                        )}
                        {pkg.isActive === false && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400">
                            {isAr ? 'مخفية بالموقع' : 'Hidden'}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-neutral-900 dark:text-white mt-1.5">
                        {pkg.nameAr}
                      </h5>
                    </div>

                    <div className="text-end">
                      <div className="font-black text-base text-[#C82626] font-mono">
                        {pkg.priceEGP.toLocaleString()} <span className="text-xs font-normal">{isAr ? 'ج.م' : 'EGP'}</span>
                      </div>
                      {pkg.originalPriceEGP && (
                        <div className="text-[11px] line-through text-neutral-400 font-mono">
                          {pkg.originalPriceEGP.toLocaleString()} ج.م
                        </div>
                      )}
                    </div>
                  </div>

                  {pkg.periodAr && (
                    <div className="text-xs text-neutral-500 mb-1">
                      {isAr ? 'المدة: ' : 'Duration: '}
                      <span className="text-neutral-700 dark:text-neutral-300 font-medium">{pkg.periodAr}</span>
                    </div>
                  )}

                  {pkg.highlightAr && (
                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                      {pkg.highlightAr}
                    </div>
                  )}

                  {pkg.deliverablesAr && (
                    <div className="text-xs text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-xl mb-2 line-clamp-2">
                      {pkg.deliverablesAr}
                    </div>
                  )}

                  {pkg.featuresAr && pkg.featuresAr.length > 0 && (
                    <div className="text-[11px] text-neutral-500 mb-2">
                      {isAr ? `تتضمن ${pkg.featuresAr.length} بنود ومميزات فنية` : `${pkg.featuresAr.length} features included`}
                    </div>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTogglePkgActive(pkg)}
                      title={pkg.isActive !== false ? (isAr ? 'إخفاء من الموقع' : 'Hide') : (isAr ? 'إظهار بالموقع' : 'Show')}
                      className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-400 cursor-pointer"
                    >
                      {pkg.isActive !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
                    </button>

                    <button
                      onClick={() => handleDeletePkg(pkg.id, pkg.nameAr)}
                      title={isAr ? 'حذف نهائي' : 'Delete'}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenEditPkg(pkg)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 shadow-sm transition-opacity cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعديل الباقة بالكامل' : 'Edit Specs'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 2: PROMOTIONS */}
      {activeSubTab === 'promotions' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreatePromo}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm"
          >
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C82626]" />
              <span>{isAr ? 'إطلاق عرض ترويجي جديد لفترة محددة' : 'Launch New Limited-Time Promotion'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isAr ? 'عنوان العرض (عربي) *' : 'Title (AR) *'}</label>
                <input
                  type="text"
                  required
                  value={promoTitleAr}
                  onChange={(e) => setPromoTitleAr(e.target.value)}
                  placeholder={isAr ? 'عرض خريف البودكاست 2026' : 'Autumn Promo'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'نسبة الخصم % *' : 'Discount % *'}</label>
                <input
                  type="number"
                  min="1"
                  max="90"
                  required
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تاريخ البدء:' : 'Start Date:'}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تاريخ الانتهاء:' : 'End Date:'}</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'ينطبق على:' : 'Applicable to:'}</label>
                <select
                  value={applicableCategory}
                  onChange={(e) => setApplicableCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="all">{isAr ? 'كل الباقات والخدمات' : 'All Packages'}</option>
                  <option value="podcasts">{isAr ? 'البودكاست فقط' : 'Podcasts Only'}</option>
                  <option value="reels">{isAr ? 'الريلز وسوشيال ميديا فقط' : 'Reels Only'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'كود العرض الترويجي:' : 'Promo Code:'}</label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="FALL26"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono uppercase"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">{isAr ? 'نص شريط الإعلان (Banner):' : 'Banner Text:'}</label>
                <input
                  type="text"
                  value={bannerTextAr}
                  onChange={(e) => setBannerTextAr(e.target.value)}
                  placeholder={isAr ? 'خصم حصري 15% على جميع جلسات البودكاست في الكوربة لفترة محدودة!' : 'Limited time discount...'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingPromo}
                className="px-5 py-2.5 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingPromo ? (isAr ? 'جاري الإطلاق...' : 'Launching...') : (isAr ? 'إطلاق العرض في الموقع' : 'Launch Promo')}
              </button>
            </div>
          </form>

          {/* Active Promotions List */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              {isAr ? 'العروض الترويجية المسجلة' : 'Registered Promotions'}
            </h4>

            {promotions.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                {isAr ? 'لا توجد عروض نشطة حالياً. يمكنك إطلاق عرض جديد أعلاه.' : 'No promotions active.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-neutral-900 dark:text-white">
                          {promo.titleAr}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-[#C82626] text-xs font-bold">
                          {promo.discountPercent}% OFF
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {promo.startDate} ➔ {promo.endDate}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePromo(promo.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: COUPONS ENGINE (Create, Expire, Delete) */}
      {activeSubTab === 'coupons' && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateCoupon}
            className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4 shadow-sm"
          >
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[#C82626]" />
              <span>{isAr ? 'إنشاء كود خصم / كوبون جديد للعملاء' : 'Create Custom Coupon Code'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isAr ? 'كود الكوبون (رمز الخصم) *' : 'Coupon Code *'}</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. KIN20 / RAMADAN"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono uppercase font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'نوع الخصم:' : 'Discount Type:'}</label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="percent">{isAr ? 'نسبة مئوية (%)' : 'Percentage (%)'}</option>
                  <option value="fixed">{isAr ? 'مبلغ ثابت (ج.م)' : 'Fixed Amount (EGP)'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">
                  {couponType === 'percent' ? (isAr ? 'قيمة الخصم (%) *' : 'Discount (%) *') : (isAr ? 'قيمة الخصم (ج.م) *' : 'Discount (EGP) *')}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={couponValue}
                  onChange={(e) => setCouponValue(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تاريخ انتهاء الصلاحية:' : 'Expiry Date:'}</label>
                <input
                  type="date"
                  value={couponExpiresAt}
                  onChange={(e) => setCouponExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'الحد الأدنى لقيمة الحجز (اختياري):' : 'Min Booking Amount:'}</label>
                <input
                  type="number"
                  value={couponMinAmount}
                  onChange={(e) => setCouponMinAmount(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold mb-1">{isAr ? 'وصف أو ملاحظات الكوبون:' : 'Coupon Description:'}</label>
                <input
                  type="text"
                  value={couponDescription}
                  onChange={(e) => setCouponDescription(e.target.value)}
                  placeholder={isAr ? 'كوبون مخصص لرواد البودكاست في مؤتمر القاهرة' : 'Special promo for partners...'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSavingCoupon}
                className="px-5 py-2.5 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSavingCoupon ? (isAr ? 'جاري الإنشاء...' : 'Creating...') : (isAr ? 'حفظ وتفعيل كود الخصم' : 'Save Coupon')}
              </button>
            </div>
          </form>

          {/* Coupons List Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              {isAr ? 'أكواد الخصم والكوبونات النشطة' : 'Active Coupons Registry'}
            </h4>

            {coupons.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500">
                {isAr ? 'لا توجد كوبونات مخصصة مسجلة بعد. جرب إنشاء أول كوبون أعلاه.' : 'No custom coupons registered.'}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <table className="w-full text-start text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="p-3 text-start font-bold">{isAr ? 'الكود' : 'Code'}</th>
                      <th className="p-3 text-start font-bold">{isAr ? 'قيمة الخصم' : 'Discount'}</th>
                      <th className="p-3 text-start font-bold">{isAr ? 'تاريخ الانتهاء' : 'Expires'}</th>
                      <th className="p-3 text-start font-bold">{isAr ? 'الحد الأدنى' : 'Min Order'}</th>
                      <th className="p-3 text-start font-bold">{isAr ? 'الحالة' : 'Status'}</th>
                      <th className="p-3 text-end font-bold">{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40">
                        <td className="p-3 font-mono font-bold text-neutral-900 dark:text-white">
                          <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                            {c.code}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-[#C82626]">
                          {c.discountType === 'percent' ? `${c.discountValue}%` : `${c.discountValue.toLocaleString()} ج.م`}
                        </td>
                        <td className="p-3 text-neutral-500 font-mono">
                          {c.expiresAt || (isAr ? 'مفتوح بدون انتهاء' : 'Never')}
                        </td>
                        <td className="p-3 text-neutral-500 font-mono">
                          {c.minBookingAmount ? `${c.minBookingAmount.toLocaleString()} ج.م` : '-'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              c.isActive
                                ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                                : 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                          >
                            {c.isActive ? (isAr ? 'نشط ومتاح' : 'Active') : (isAr ? 'منتهي / معطل' : 'Expired')}
                          </span>
                        </td>
                        <td className="p-3 text-end space-x-1.5 space-x-reverse">
                          <button
                            onClick={() => handleToggleCoupon(c.id, c.isActive)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                              c.isActive
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-950 dark:text-green-300'
                            }`}
                          >
                            {c.isActive ? (isAr ? 'تعطيل / إنهاء' : 'Expire') : (isAr ? 'إعادة تفعيل' : 'Activate')}
                          </button>

                          <button
                            onClick={() => handleDeleteCouponItem(c.id, c.code)}
                            className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL PACKAGE EDIT MODAL */}
      {editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleSavePackage}
            className="bg-white dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl my-8 text-neutral-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-base font-brand flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C82626]" />
                <span>{isAr ? `تعديل تفاصيل باقة: ${pkgNameAr}` : `Edit Package: ${pkgNameAr}`}</span>
              </h4>
              <button
                type="button"
                onClick={() => setEditingPkg(null)}
                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isAr ? 'اسم الباقة (عربي) *' : 'Package Name (AR) *'}</label>
                <input
                  type="text"
                  required
                  value={pkgNameAr}
                  onChange={(e) => setPkgNameAr(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'اسم الباقة (إنجليزي):' : 'Package Name (EN):'}</label>
                <input
                  type="text"
                  value={pkgNameEn}
                  onChange={(e) => setPkgNameEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'التصنيف:' : 'Category:'}</label>
                <select
                  value={pkgCategory}
                  onChange={(e) => setPkgCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="podcasts">{isAr ? 'بودكاست ولقاءات' : 'Podcasts'}</option>
                  <option value="reels">{isAr ? 'ريلز شهرية وسوشيال' : 'Monthly Reels'}</option>
                  <option value="commercials">{isAr ? 'إعلانات تجارية سينمائية' : 'Commercials'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'المدة / الفترة (مثلاً: جلسة 4 ساعات أو شهرياً):' : 'Period / Duration:'}</label>
                <input
                  type="text"
                  value={pkgPeriodAr}
                  onChange={(e) => setPkgPeriodAr(e.target.value)}
                  placeholder={isAr ? 'جلسة يومين (4 ساعات)' : 'Double Day Session'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'السعر الفعلي (ج.م) *' : 'Price (EGP) *'}</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={pkgPrice}
                  onChange={(e) => setPkgPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'السعر قبل الخصم (مشطوب):' : 'Original Price (Crossed):'}</label>
                <input
                  type="number"
                  min="0"
                  value={pkgOriginalPrice}
                  onChange={(e) => setPkgOriginalPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">{isAr ? 'شارة التميز (Badge):' : 'Highlight Badge:'}</label>
                <input
                  type="text"
                  value={pkgHighlightAr}
                  onChange={(e) => setPkgHighlightAr(e.target.value)}
                  placeholder={isAr ? 'الأكثر طلباً - توفير 20%' : 'Best Value'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">{isAr ? 'التسليمات والمخرجات (Deliverables Summary):' : 'Deliverables Summary:'}</label>
                <input
                  type="text"
                  value={pkgDeliverablesAr}
                  onChange={(e) => setPkgDeliverablesAr(e.target.value)}
                  placeholder={isAr ? 'حلقتين كاملتين 4K + 6 ريلز مقصوصة جاهزة للنشر' : 'Full 4K episodes + 6 vertical reels'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">{isAr ? 'بنود ومميزات الباقة (كل ميزة في سطر منفصل):' : 'Features List (One per line):'}</label>
                <textarea
                  rows={4}
                  value={pkgFeaturesText}
                  onChange={(e) => setPkgFeaturesText(e.target.value)}
                  placeholder={isAr ? "3 كاميرات Sony FX3 سينمائية 4K\nمهندس صوت مع ميكروفونات Shure SM7B\nتلوين ومكساج سينمائي شامل\nتسليم خلال 48 ساعة" : "3 Sony Cinema Cameras\nShure SM7B Audio Rig\nSound design & mastering"}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div className="flex items-center gap-4 sm:col-span-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkgIsActive}
                    onChange={(e) => setPkgIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#C82626] rounded focus:ring-0"
                  />
                  <span className="font-bold">{isAr ? 'تفعيل الباقة وإظهارها في حاسبة الأسعار بالموقع' : 'Active & Visible on Website'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pkgIsPopular}
                    onChange={(e) => setPkgIsPopular(e.target.checked)}
                    className="w-4 h-4 text-[#C82626] rounded focus:ring-0"
                  />
                  <span className="font-bold">{isAr ? 'تمييز كباقة مقترحة (Featured)' : 'Featured Recommendation'}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingPkg(null)}
                className="px-4 py-2 rounded-xl text-neutral-500 text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSavingPkg}
                className="px-5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow cursor-pointer disabled:opacity-50"
              >
                {isSavingPkg ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ كافة تعديلات الباقة' : 'Save Package')}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
