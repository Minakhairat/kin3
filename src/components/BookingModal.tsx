import React, { useState } from 'react';
import { COMPANY_INFO, PODCAST_PACKAGES, REELS_PACKAGES } from '../data/content';
import { Language, BookingFormData, CouponCodeItem } from '../types';
import { X, Send, CheckCircle2, Phone, MessageCircle, Tag, Check, AlertCircle } from 'lucide-react';
import { validateCouponCode } from '../services/couponsService';

interface BookingModalProps {
  isOpen: boolean;
  initialPackageId?: string;
  initialAddons?: string[];
  calculatedTotal?: number;
  lang: Language;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  initialPackageId,
  initialAddons = [],
  calculatedTotal,
  lang,
  onClose,
}) => {
  const isAr = lang === 'ar';
  const allPackages = [...PODCAST_PACKAGES, ...REELS_PACKAGES];
  
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    service: initialPackageId?.startsWith('reels') ? 'reels' : 'podcasts',
    packageId: initialPackageId || 'podcast-doubleday',
    preferredDate: '',
    addons: initialAddons,
    notes: '',
  });

  // Promo Code State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCodeItem | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  if (!isOpen) return null;

  const selectedPkg = allPackages.find((p) => p.id === formData.packageId);
  const baseTotal = calculatedTotal || selectedPkg?.price || 15000;
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!couponInput.trim()) return;

    setIsCheckingCoupon(true);
    setCouponError(null);

    const res = await validateCouponCode(couponInput.trim(), baseTotal);
    setIsCheckingCoupon(false);

    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      setDiscountAmount(res.discountAmount || 0);
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setCouponError(isAr ? (res.errorAr || 'كود غير صحيح') : (res.errorEn || 'Invalid coupon'));
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponInput('');
    setCouponError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    const ref = 'KIN-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setSubmitted(true);

    const couponLine = appliedCoupon
      ? (isAr
          ? `\n- كود الخصم المطبق: ${appliedCoupon.code} (خصم ${discountAmount.toLocaleString()} ج.م)\n- الإجمالي بعد الخصم: ${finalTotal.toLocaleString()} ج.م`
          : `\n- Coupon Code Applied: ${appliedCoupon.code} (-${discountAmount.toLocaleString()} EGP)\n- Total After Discount: ${finalTotal.toLocaleString()} EGP`)
      : (isAr ? `\n- الإجمالي التقديري: ${finalTotal.toLocaleString()} ج.م` : `\n- Total: ${finalTotal.toLocaleString()} EGP`);

    const msg =
      isAr
        ? `طلب حجز استوديو KIN جديد [${ref}]:\n- الاسم: ${formData.fullName}\n- رقم الهاتف: ${formData.phone}\n- الباقة: ${selectedPkg?.name || 'مخصصة'}\n- التاريخ: ${formData.preferredDate || 'أقرب ميعاد متاح'}${couponLine}\n${formData.notes ? `- ملاحظات: ${formData.notes}\n` : ''}أرجو تأكيد الحجز وإرسال تفاصيل جلسة التصوير بالاستوديو.`
        : `New KIN Studio Booking Request [${ref}]:\n- Name: ${formData.fullName}\n- Phone: ${formData.phone}\n- Package: ${selectedPkg?.name || 'Custom'}\n- Date: ${formData.preferredDate || 'Earliest available'}${couponLine}\n${formData.notes ? `- Notes: ${formData.notes}\n` : ''}Please confirm availability.`;

    const waUrl = `https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(msg)}`;
    setWhatsAppUrl(waUrl);
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // safe fallback for restricted iframe sandbox
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#1C1A18] text-[#141211] dark:text-white rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-[#FAFAFA] dark:bg-[#141211]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C82626]" />
            <h3 className="text-base font-bold text-[#141211] dark:text-white font-brand">
              {isAr ? 'حجز جلسة في استوديو KIN' : 'Book a Session at KIN Studio'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-black/60 dark:text-white/70 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          {submitted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#141211] dark:text-white">
                {isAr ? 'تم استلام طلبك وتوجيهه إلى واتساب!' : 'Request Sent to WhatsApp!'}
              </h4>
              <p className="text-xs font-mono text-[#C82626] font-bold">
                {bookingRef}
              </p>
              <p className="text-xs text-[#141211]/70 dark:text-white/70 max-w-sm mx-auto">
                {isAr
                  ? 'تم تجهيز رسالتك مع تفاصيل الحجز وكوبون الخصم، وسيقوم فريق الاستوديو بالرد عليك فوراً لتأكيد الحجز.'
                  : 'Your booking details and promo code are prepared. Our team will verify slot availability promptly.'}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                {whatsAppUrl && (
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a31d1d] rounded transition-colors inline-flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{isAr ? 'فتح المحادثة في واتساب' : 'Open in WhatsApp'}</span>
                  </a>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 text-xs font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded transition-colors cursor-pointer"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1">
                  {isAr ? 'الاسم بالكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isAr ? 'مثال: كريم سامح' : 'Your name'}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1">
                  {isAr ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={isAr ? '010XXXXXXXX' : '+20 10X XXX XXXX'}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626] font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1">
                    {isAr ? 'نوع الخدمة' : 'Service'}
                  </label>
                  <select
                    value={formData.service}
                    onChange={(e) => {
                      const s = e.target.value;
                      setFormData({
                        ...formData,
                        service: s,
                        packageId: s === 'podcasts' ? 'podcast-doubleday' : 'reels-pro',
                      });
                      if (appliedCoupon) {
                        setDiscountAmount(0);
                        setAppliedCoupon(null);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-xs focus:outline-none focus:border-[#C82626]"
                  >
                    <option value="podcasts">{isAr ? 'بودكاست ولقاءات' : 'Podcasts'}</option>
                    <option value="reels">{isAr ? 'ريلز شهرية' : 'Monthly Reels'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1">
                    {isAr ? 'الباكدج' : 'Package'}
                  </label>
                  <select
                    value={formData.packageId}
                    onChange={(e) => {
                      setFormData({ ...formData, packageId: e.target.value });
                      if (appliedCoupon) {
                        setDiscountAmount(0);
                        setAppliedCoupon(null);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-xs focus:outline-none focus:border-[#C82626]"
                  >
                    {formData.service === 'podcasts' ? (
                      <>
                        <option value="podcast-solo">Solo ({isAr ? '10,000 ج' : '10,000 EGP'})</option>
                        <option value="podcast-duo">Duo ({isAr ? '15,000 ج' : '15,000 EGP'})</option>
                        <option value="podcast-doubleday">Double Day - {isAr ? 'المقترحة (24,000 ج)' : 'Recommended (24,000 EGP)'}</option>
                        <option value="podcast-monthly">Monthly Show ({isAr ? '44,000 ج / شهر' : '44,000 EGP / mo'})</option>
                      </>
                    ) : (
                      <>
                        <option value="reels-basic">Basic ({isAr ? '12,000 ج / شهر' : '12,000 EGP / mo'})</option>
                        <option value="reels-pro">Pro - {isAr ? 'المقترحة (15,000 ج / شهر)' : 'Recommended (15,000 EGP / mo)'}</option>
                        <option value="reels-premium">Premium ({isAr ? '22,000 ج / شهر' : '22,000 EGP / mo'})</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1">
                  {isAr ? 'الميعاد المقترح' : 'Preferred Date'}
                </label>
                <input
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-xs focus:outline-none focus:border-[#C82626]"
                />
              </div>

              {/* Coupon / Promo Code Input Section */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#151312] border border-neutral-200 dark:border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#C82626]" />
                    <span>{isAr ? 'هل لديك كود خصم أو كوبون؟' : 'Have a Promo / Coupon Code?'}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-normal">
                    {isAr ? '(جرّب: KIN10 أو VIP20)' : '(Try: KIN10)'}
                  </span>
                </div>

                {!appliedCoupon ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError(null);
                      }}
                      placeholder="e.g. KIN10"
                      className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-[#201D1B] border border-neutral-300 dark:border-neutral-700 text-xs font-mono uppercase focus:outline-none focus:border-[#C82626]"
                    />
                    <button
                      type="button"
                      disabled={isCheckingCoupon || !couponInput.trim()}
                      onClick={() => handleApplyCoupon()}
                      className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shrink-0"
                    >
                      {isCheckingCoupon ? (isAr ? 'فحص...' : 'Checking...') : (isAr ? 'تطبيق الخصم' : 'Apply')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300 text-xs">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <div>
                        <span className="font-mono font-bold">{appliedCoupon.code}</span>
                        <span className="ms-2 text-[11px] font-medium">
                          {isAr ? `(وفرت ${discountAmount.toLocaleString()} ج.م)` : `(-${discountAmount.toLocaleString()} EGP)`}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 rounded hover:bg-green-500/20 text-neutral-500 hover:text-red-500 cursor-pointer"
                      title={isAr ? 'إلغاء الكود' : 'Remove Code'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{couponError}</span>
                  </p>
                )}

                {/* Price Breakdown */}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">{isAr ? 'إجمالي الحجز:' : 'Booking Total:'}</span>
                  <div className="text-end">
                    {appliedCoupon && (
                      <span className="line-through text-neutral-400 me-2 text-[11px]">
                        {baseTotal.toLocaleString()} ج.م
                      </span>
                    )}
                    <span className="font-extrabold text-base text-[#C82626] font-mono">
                      {finalTotal.toLocaleString()} {isAr ? 'ج.م' : 'EGP'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1">
                  {isAr ? 'ملاحظات إضافية' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  placeholder={isAr ? 'أي تفاصيل عن الفكرة أو عدد الضيوف...' : 'Additional project details...'}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-xs focus:outline-none focus:border-[#C82626]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a31d1d] rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'إرسال الحجز لواتساب الاستوديو' : 'Send to Studio WhatsApp'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
