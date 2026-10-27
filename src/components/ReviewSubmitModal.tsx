import React, { useState } from 'react';
import { X, Star, Sparkles, CheckCircle2, AlertCircle, LogIn } from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { submitReview } from '../services/reviewsService';

interface ReviewSubmitModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ReviewSubmitModal: React.FC<ReviewSubmitModalProps> = ({
  isOpen,
  lang,
  onClose,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const isAr = lang === 'ar';

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>(user?.displayName || '');
  const [authorProject, setAuthorProject] = useState<string>('');
  const [serviceType, setServiceType] = useState<'podcast' | 'reels' | 'commercial' | 'general'>('podcast');
  const [comment, setComment] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!authorName.trim()) {
      setErrorMessage(isAr ? 'يرجى كتابة اسمك' : 'Please provide your name');
      return;
    }

    if (!comment.trim() || comment.trim().length < 10) {
      setErrorMessage(
        isAr
          ? 'يرجى كتابة تفاصيل التقييم (على الأقل 10 أحرف)'
          : 'Please write a review comment (minimum 10 characters)'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitReview(
        user.uid,
        authorName,
        user.email || undefined,
        rating,
        comment,
        serviceType,
        authorProject
      );

      setSuccessMessage(
        isAr
          ? 'شكراً لك! تم استلام تقييمك بنجاح وسيتم نشره على الموقع بعد مراجعة الإدارة.'
          : 'Thank you! Your review has been submitted and will be published upon moderation.'
      );
      setComment('');
      setAuthorProject('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(isAr ? `حدث خطأ أثناء حفظ التقييم: ${msg}` : `Failed to submit review: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
    >
      <div className="relative w-full max-w-lg bg-[#FAFAFA] dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className="absolute top-5 end-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#C82626]/10 text-[#C82626] flex items-center justify-center shadow-inner">
            <Star className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h3 id="review-modal-title" className="text-xl font-bold font-brand tracking-tight text-neutral-900 dark:text-white">
              {isAr ? 'أضف تقييمك لـ KIN' : 'Rate Your KIN Experience'}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {isAr
                ? 'رأيك الحقيقي يساعد صناع المحتوى والبراندات في اختيارنا'
                : 'Your authentic feedback helps creators & brands choose us'}
            </p>
          </div>
        </div>

        {/* If user is NOT signed in, prompt authentication */}
        {!user ? (
          <div className="text-center py-6 px-4 bg-neutral-100 dark:bg-neutral-900/60 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <LogIn className="w-10 h-10 text-[#C82626] mx-auto mb-3" />
            <h4 className="font-bold text-neutral-900 dark:text-white mb-1">
              {isAr ? 'سجّل دخولك لإضافة تقييم معتمد' : 'Sign In to Post a Verified Review'}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto mb-5 leading-relaxed">
              {isAr
                ? 'لضمان مصداقية التقييمات، يتطلب الموقع تسجيل الدخول بحساب Google أو بريدك الإلكتروني.'
                : 'To ensure genuine verified client feedback, please sign in with your account first.'}
            </p>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="px-6 py-2.5 rounded-full bg-[#C82626] hover:bg-[#A81E1E] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              {isAr ? 'تسجيل الدخول الآن' : 'Sign In Now'}
            </button>
          </div>
        ) : successMessage ? (
          <div className="text-center py-8 px-4 bg-green-500/10 border border-green-500/30 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h4 className="font-bold text-neutral-900 dark:text-white text-lg mb-2">
              {isAr ? 'تم إرسال التقييم بنجاح' : 'Review Submitted!'}
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mb-6">
              {successMessage}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-bold"
            >
              {isAr ? 'حسناً' : 'Done'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Interactive Star Rating */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2">
                {isAr ? 'التقييم العام:' : 'Your Rating:'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      aria-label={isAr ? `${star} من 5 نجوم` : `${star} of 5 stars`}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-300 dark:text-neutral-700'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 ms-2">
                  {rating} / 5
                </span>
              </div>
            </div>

            {/* Author Name & Project/Show Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {isAr ? 'الاسم بالكامل *' : 'Your Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={isAr ? 'مثال: مروان الشامي' : 'e.g. Sarah Miller'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  {isAr ? 'اسم البودكاست / البراند' : 'Podcast / Brand Name'}
                </label>
                <input
                  type="text"
                  value={authorProject}
                  onChange={(e) => setAuthorProject(e.target.value)}
                  placeholder={isAr ? 'مثال: بودكاست فنجان كيميا' : 'e.g. Tech Talk Podcast'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626]"
                />
              </div>
            </div>

            {/* Service Category */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {isAr ? 'نوع الخدمة التي قمت بتجربتها:' : 'Service Experienced:'}
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626]"
              >
                <option value="podcast">{isAr ? 'إنتاج وتصوير بودكاست' : 'Podcast Production'}</option>
                <option value="reels">{isAr ? 'ريلز وسوشيال ميديا شهرية' : 'Monthly Reels Shoot'}</option>
                <option value="commercial">{isAr ? 'إعلان تجاري سينمائي' : 'Cinematic Commercial'}</option>
                <option value="general">{isAr ? 'تجربة استوديو عامة' : 'General Studio Experience'}</option>
              </select>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                {isAr ? 'تفاصيل تجربتك ورأيك *' : 'Your Review & Feedback *'}
              </label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  isAr
                    ? 'احكِ لنا عن جودة الصوت، الإضاءة، تعامل الفريق، وسرعة تسليم الحلقات...'
                    : 'Tell us about audio quality, lighting, crew vibe, and turnaround speed...'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626] resize-none"
              />
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-[11px] text-neutral-400">
                {isAr ? 'يتم مراجعة التقييم قبل نشره' : 'Reviewed before public publishing'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-xl bg-[#C82626] hover:bg-[#A81E1E] text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isAr ? 'إرسال التقييم' : 'Submit Review'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
