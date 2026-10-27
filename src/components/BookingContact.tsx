import React, { useState } from 'react';
import { COMPANY_INFO, PODCAST_PACKAGES, REELS_PACKAGES } from '../data/content';
import { Language, BookingFormData } from '../types';
import { Phone, MessageCircle, Instagram, MapPin, Send, CheckCircle2, Calendar, Clock, Sparkles } from 'lucide-react';

interface BookingContactProps {
  lang: Language;
  preselectedPackageId?: string;
  preselectedAddons?: string[];
  calculatedTotal?: number;
}

export const BookingContact: React.FC<BookingContactProps> = ({
  lang,
  preselectedPackageId,
  preselectedAddons = [],
  calculatedTotal,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: '',
    phone: '',
    service: 'podcasts',
    packageId: preselectedPackageId || 'podcast-doubleday',
    preferredDate: '',
    addons: preselectedAddons,
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [whatsAppUrl, setWhatsAppUrl] = useState('');

  const allPackages = [...PODCAST_PACKAGES, ...REELS_PACKAGES];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) return;

    const ref = 'KIN-' + Math.floor(100000 + Math.random() * 900000);
    setBookingRef(ref);
    setSubmitted(true);

    // Format WhatsApp prefilled message
    const selectedPkg = allPackages.find((p) => p.id === formData.packageId);
    const msg =
      lang === 'ar'
        ? `طلب حجز جديد في استوديو KIN [${ref}]:\n- الاسم: ${formData.fullName}\n- الهاتف: ${formData.phone}\n- الخدمة: ${selectedPkg?.category === 'podcasts' ? 'بودكاست ولقاءات' : 'ريلز شهرية'}\n- الباقة: ${selectedPkg?.name || 'مخصصة'}\n- التاريخ المفضل: ${formData.preferredDate || 'أقرب ميعاد متاح'}\n${formData.notes ? `- ملاحظات: ${formData.notes}\n` : ''}أرجو تأكيد الحجز وإرسال تفاصيل جلسة التصوير.`
        : `New Studio Booking Request at KIN [${ref}]:\n- Name: ${formData.fullName}\n- Phone: ${formData.phone}\n- Service: ${selectedPkg?.category || 'Custom'}\n- Package: ${selectedPkg?.name || 'Custom'}\n- Date: ${formData.preferredDate || 'Earliest available'}\n${formData.notes ? `- Notes: ${formData.notes}\n` : ''}Please confirm slot availability.`;

    const waUrl = `https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(msg)}`;
    setWhatsAppUrl(waUrl);
    try {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // safe fallback if popup is restricted in iframe
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-[#FAFAFA] dark:bg-[#141211] border-b border-black/8 dark:border-white/10 scroll-mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#C82626] mb-3">
            {lang === 'ar' ? 'ابدأ خطوتك الأولى' : 'Take The Next Step'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141211] dark:text-white tracking-tight leading-tight text-balance">
            {lang === 'ar' ? 'تواصل معنا واحجز جلستك القادمة' : 'Contact Us & Book Your Next Session'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-[#141211]/70 dark:text-white/70 leading-relaxed text-balance">
            {lang === 'ar'
              ? 'فريق KIN جاهز للإجابة على استفساراتك وتنسيق مواعيد جلسات التصوير أو إعداد عروض أسعار الحملات التجارية.'
              : 'The KIN production crew is ready to schedule your studio session or structure a bespoke commercial project.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Direct Contact Cards & Korba Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contact Box */}
            <div className="bg-white dark:bg-[#1C1A18] rounded-2xl p-6 sm:p-8 border border-black/8 dark:border-white/10 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-[#141211] dark:text-white pb-4 border-b border-black/6 dark:border-white/10">
                {lang === 'ar' ? 'قنوات التواصل المباشر' : 'Direct Studio Channels'}
              </h3>

              {/* Phone 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] dark:bg-[#252220] border border-black/10 dark:border-white/10 flex items-center justify-center text-[#C82626] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#141211]/60 dark:text-white/60 font-semibold">{lang === 'ar' ? 'هاتف / واتساب 1:' : 'Phone & WhatsApp 1:'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href={`tel:${COMPANY_INFO.phones[0]}`}
                      className="text-base font-bold text-[#141211] dark:text-white hover:text-[#C82626] dark:hover:text-[#C82626] transition-colors font-mono tracking-wider"
                    >
                      {COMPANY_INFO.phones[0]}
                    </a>
                    <a
                      href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 text-[11px] font-bold bg-[#C82626] text-white rounded hover:bg-[#a31d1d] transition-colors"
                    >
                      {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Phone 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] dark:bg-[#252220] border border-black/10 dark:border-white/10 flex items-center justify-center text-[#C82626] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#141211]/60 dark:text-white/60 font-semibold">{lang === 'ar' ? 'هاتف / واتساب 2:' : 'Phone & WhatsApp 2:'}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <a
                      href={`tel:${COMPANY_INFO.phones[1]}`}
                      className="text-base font-bold text-[#141211] dark:text-white hover:text-[#C82626] dark:hover:text-[#C82626] transition-colors font-mono tracking-wider"
                    >
                      {COMPANY_INFO.phones[1]}
                    </a>
                    <a
                      href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[1]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 text-[11px] font-bold bg-[#C82626] text-white rounded hover:bg-[#a31d1d] transition-colors"
                    >
                      {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
                    </a>
                  </div>
                </div>
              </div>

              {/* Instagram */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] dark:bg-[#252220] border border-black/10 dark:border-white/10 flex items-center justify-center text-[#C82626] shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#141211]/60 dark:text-white/60 font-semibold">{lang === 'ar' ? 'إنستجرام الرسمي:' : 'Official Instagram:'}</p>
                  <a
                    href={COMPANY_INFO.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-[#141211] dark:text-white hover:text-[#C82626] dark:hover:text-[#C82626] transition-colors block mt-1 font-mono"
                  >
                    @{COMPANY_INFO.instagram}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 pt-4 border-t border-black/6 dark:border-white/10">
                <div className="w-10 h-10 rounded-lg bg-[#FAFAFA] dark:bg-[#252220] border border-black/10 dark:border-white/10 flex items-center justify-center text-[#C82626] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-[#141211]/60 dark:text-white/60 font-semibold">{lang === 'ar' ? 'عنوان الاستوديو:' : 'Studio Address:'}</p>
                  <p className="text-sm font-semibold text-[#141211] dark:text-white mt-1 leading-snug">
                    {lang === 'ar' ? COMPANY_INFO.address.ar : COMPANY_INFO.address.en}
                  </p>
                </div>
              </div>
            </div>

            {/* Korba Location Map Card */}
            <div className="bg-white dark:bg-[#1C1A18] rounded-2xl overflow-hidden border border-black/8 dark:border-white/10 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#141211]/70 dark:text-white/70 px-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C82626]" />
                  {lang === 'ar' ? 'موقع الاستوديو في الكوربة' : 'Korba Studio Location'}
                </span>
                <a
                  href={COMPANY_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C82626] hover:underline"
                >
                  {lang === 'ar' ? 'فتح في خرائط Google ↗' : 'Open in Google Maps ↗'}
                </a>
              </div>

              <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 aspect-[16/9] relative bg-slate-100 dark:bg-black/40 flex items-center justify-center">
                <iframe
                  title="KIN Studio Korba Map"
                  src="https://maps.google.com/maps?q=24+Granada+Street+Korba+Heliopolis+Cairo+Egypt&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Booking Form */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[#1C1A18] rounded-2xl p-6 sm:p-10 border border-black/8 dark:border-white/10 shadow-sm">
              
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'تم استلام طلب الحجز بنجاح!' : 'Booking Request Received!'}
                  </h3>
                  <p className="text-xs font-mono text-[#C82626] uppercase tracking-wider font-bold">
                    {lang === 'ar' ? `رقم الحجز المرجعي: ${bookingRef}` : `Reference ID: ${bookingRef}`}
                  </p>
                  <p className="text-sm text-[#141211]/70 dark:text-white/70 max-w-md mx-auto">
                    {lang === 'ar'
                      ? 'تم فتح محادثة واتساب لتأكيد الموعد النهائي معك مباشرة، وسيتواصل معك مدير إنتاج استوديو KIN خلال وقت قصير.'
                      : 'A direct WhatsApp session was opened with your booking summary. Our production lead will verify slot availability promptly.'}
                  </p>

                  <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    {whatsAppUrl && (
                      <a
                        href={whatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a31d1d] rounded transition-colors inline-flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{lang === 'ar' ? 'فتح المحادثة في واتساب' : 'Open in WhatsApp'}</span>
                      </a>
                    )}
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-6 py-2.5 text-xs font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded transition-colors cursor-pointer"
                    >
                      {lang === 'ar' ? 'حجز جلسة أخرى' : 'Book Another Session'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#141211] dark:text-white tracking-tight">
                      {lang === 'ar' ? 'نموذج حجز استوديو KIN' : 'KIN Studio Reservation Form'}
                    </h3>
                    <p className="text-xs text-[#141211]/60 dark:text-white/60 mt-1">
                      {lang === 'ar'
                        ? 'املأ البيانات وسيتم توجيهك فوراً لتأكيد الحجز وموعدك بالاستوديو.'
                        : 'Fill in your details and confirm slot availability directly.'}
                    </p>
                  </div>

                  {/* Name & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1.5">
                        {lang === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'ar' ? 'مثال: أحمد مصطفى' : 'e.g. John Doe'}
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1.5">
                        {lang === 'ar' ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder={lang === 'ar' ? '010XXXXXXXX' : '+20 10X XXX XXXX'}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626] transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Service & Package Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1.5">
                        {lang === 'ar' ? 'الخدمة المطلوبة' : 'Service Category'}
                      </label>
                      <select
                        value={formData.service}
                        onChange={(e) => {
                          const s = e.target.value;
                          setFormData({
                            ...formData,
                            service: s,
                            packageId: s === 'podcasts' ? 'podcast-doubleday' : s === 'reels' ? 'reels-pro' : 'commercial',
                          });
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626] transition-colors"
                      >
                        <option value="podcasts">{lang === 'ar' ? 'بودكاست ولقاءات' : 'Podcasts & Interviews'}</option>
                        <option value="reels">{lang === 'ar' ? 'ريلز شهرية' : 'Monthly Reels'}</option>
                        <option value="commercials">{lang === 'ar' ? 'إعلان سينمائي تجاري' : 'Cinematic Commercial'}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1.5">
                        {lang === 'ar' ? 'الباكدج المختارة' : 'Selected Package'}
                      </label>
                      <select
                        value={formData.packageId}
                        onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626] transition-colors"
                      >
                        {formData.service === 'podcasts' ? (
                          <>
                            <option value="podcast-solo">Solo ({lang === 'ar' ? '10,000 ج' : '10,000 EGP'})</option>
                            <option value="podcast-duo">Duo ({lang === 'ar' ? '15,000 ج' : '15,000 EGP'})</option>
                            <option value="podcast-doubleday">Double Day - {lang === 'ar' ? 'المقترحة (24,000 ج)' : 'Recommended (24,000 EGP)'}</option>
                            <option value="podcast-monthly">Monthly Show ({lang === 'ar' ? '44,000 ج / شهر' : '44,000 EGP / mo'})</option>
                          </>
                        ) : formData.service === 'reels' ? (
                          <>
                            <option value="reels-basic">Basic ({lang === 'ar' ? '12,000 ج / شهر' : '12,000 EGP / mo'})</option>
                            <option value="reels-pro">Pro - {lang === 'ar' ? 'المقترحة (15,000 ج / شهر)' : 'Recommended (15,000 EGP / mo)'}</option>
                            <option value="reels-premium">Premium ({lang === 'ar' ? '22,000 ج / شهر' : '22,000 EGP / mo'})</option>
                          </>
                        ) : (
                          <option value="commercial">
                            {lang === 'ar' ? 'إعلان سينمائي مخصص (طلب عرض سعر)' : 'Cinematic Commercial (Custom Quote)'}
                          </option>
                        )}
                      </select>
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div>
                    <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1.5">
                      {lang === 'ar' ? 'الميعاد أو اليوم المناسب لجلسة التصوير' : 'Preferred Shoot Date / Timeline'}
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626] transition-colors"
                    />
                  </div>

                  {/* Notes / Special Requests */}
                  <div>
                    <label className="block text-xs font-semibold text-[#141211] dark:text-white mb-1.5">
                      {lang === 'ar' ? 'أي تفاصيل إضافية أو طلبات خاصة (اختياري)' : 'Additional Notes / Vision (Optional)'}
                    </label>
                    <textarea
                      rows={3}
                      placeholder={
                        lang === 'ar'
                          ? 'اكتب لنا عن فكرة البرنامج أو عدد الضيوف أو متطلبات الديكور...'
                          : 'Share your show theme, guests, or custom requests...'
                      }
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-black/15 dark:border-white/15 bg-white dark:bg-[#201D1B] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626] transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 text-sm font-bold text-white bg-[#C82626] hover:bg-[#a31d1d] active:scale-[0.98] transition-all rounded-lg shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'تأكيد الحجز وإرسال التفاصيل لواتساب' : 'Confirm & Send to Studio WhatsApp'}</span>
                    </button>
                    <p className="text-[11px] text-center text-[#141211]/50 dark:text-white/40 mt-2 font-mono">
                      {lang === 'ar'
                        ? 'KEEP IT NEAT — سنقوم بتثبيت الموعد وإرسال لوكيشن الاستوديو مباشرة'
                        : 'KEEP IT NEAT — We will finalize slot confirmation and send studio directions'}
                    </p>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
