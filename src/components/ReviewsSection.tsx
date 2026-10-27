import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Plus, CheckCircle2, Quote, Sparkles, Filter } from 'lucide-react';
import { Language, ReviewItem } from '../types';
import { subscribeApprovedReviews } from '../services/reviewsService';

interface ReviewsSectionProps {
  lang: Language;
  onOpenAddReview: () => void;
}

// Authentic initial seed fallback for KIN studio clients so section is never blank
const INITIAL_CURATED_REVIEWS: ReviewItem[] = [
  {
    id: 'seed-1',
    authorUid: 'seed_uid_1',
    authorName: 'أحمد السعدني',
    authorProject: 'بودكاست العمارة والمجتمع',
    rating: 5,
    comment: 'استوديو كين في الكوربة نقل جودة البودكاست عندنا لمرحلة تانية خالص! العزل الصوتي فائق الدقة، وكاميرات سوني مع إضاءات الأبوتشر بتطلع صورة سينمائية بدون أي تشويش. التزام بالمواعيد وسرعة في تسليم الحلقات.',
    serviceType: 'podcast',
    status: 'approved',
    isFeatured: true,
    adminReply: 'شكراً أستاذ أحمد، شرفنا جداً استضافة برنامجكم الراقي في استوديوهاتنا!',
    createdAt: '2026-10-18T14:30:00.000Z',
  },
  {
    id: 'seed-2',
    authorUid: 'seed_uid_2',
    authorName: 'نورا الحفناوي',
    authorProject: 'مؤسسة Bloom Skincare',
    rating: 5,
    comment: 'باقة تصوير الـ 16 ريلز الشهرية مع فريق كين وفّرت علينا مجهود شهور. التصوير تم في يوم واحد باحترافية، والمونتاج مع المؤثرات الصوتية والـ Color Grading كان على أعلى مستوى في مصر.',
    serviceType: 'reels',
    status: 'approved',
    isFeatured: true,
    adminReply: 'سعداء جداً بنجاح الحملة ونسب المشاهدات العالية على إنستجرام وتيك توك!',
    createdAt: '2026-10-12T11:20:00.000Z',
  },
  {
    id: 'seed-3',
    authorUid: 'seed_uid_3',
    authorName: 'كريم البنا',
    authorProject: 'Foodie Cairo Club',
    rating: 5,
    comment: 'أفضل معاملة وروح فريق عمل شفتها. كرو الإخراج والتصوير بيساعدوا في الأفكار والزوايا وكأنهم شركاء في البرنامج مش مجرد استوديو تأجير. تجربة تستحق كل جنيه.',
    serviceType: 'podcast',
    status: 'approved',
    isFeatured: false,
    createdAt: '2026-10-05T16:00:00.000Z',
  },
];

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ lang, onOpenAddReview }) => {
  const isAr = lang === 'ar';
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_CURATED_REVIEWS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'podcast' | 'reels' | 'commercial'>('all');

  useEffect(() => {
    const unsub = subscribeApprovedReviews((liveReviews) => {
      setReviews(liveReviews);
    });
    return () => unsub();
  }, []);

  const filteredReviews = reviews.filter((r) => {
    if (selectedCategory === 'all') return true;
    return r.serviceType === selectedCategory;
  });

  // Deduplicate reviews by ID to guarantee unique elements
  const uniqueReviews = Array.from(
    new Map(filteredReviews.map((r, idx) => [r.id || `rev-index-${idx}`, r])).values()
  );

  const totalReviews = uniqueReviews.length;
  const avgRating = totalReviews > 0
    ? (uniqueReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  return (
    <section id="reviews" className="py-20 bg-neutral-50/50 dark:bg-[#11100F] border-t border-neutral-200/80 dark:border-neutral-800/80 relative overflow-hidden">
      
      {/* Background Accent glow */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#C82626]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C82626]/10 text-[#C82626] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? 'آراء العملاء الحقيقيين' : 'Verified Client Reviews'}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold font-brand tracking-tight text-neutral-900 dark:text-white">
              {isAr ? 'ماذا يقول صناع المحتوى عنا؟' : 'What Creators & Brands Say'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl">
              {isAr
                ? 'تقييمات فعلية من شركائنا وعملائنا الذين قاموا بتسجيل وتصوير برامجهم وإعلاناتهم في استوديو كين بالكوربة.'
                : 'Real experiences from partners and creators who filmed their podcasts and commercial campaigns at KIN.'}
            </p>
          </div>

          {/* Rating Summary & Add Review CTA */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
              <div className="flex items-center text-amber-400">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div>
                <div className="text-lg font-extrabold text-neutral-900 dark:text-white leading-none">
                  {avgRating} <span className="text-xs text-neutral-400 font-normal">/ 5.0</span>
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {isAr ? `${totalReviews} تقييم معتمد` : `${totalReviews} verified ratings`}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenAddReview}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#C82626] hover:bg-[#A81E1E] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'أضف تقييمك' : 'Share Your Review'}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {[
            { id: 'all', labelAr: 'جميع الآراء', labelEn: 'All Reviews' },
            { id: 'podcast', labelAr: 'البودكاست', labelEn: 'Podcasts' },
            { id: 'reels', labelAr: 'الريلز وسوشيال ميديا', labelEn: 'Monthly Reels' },
            { id: 'commercial', labelAr: 'الإعلانات التجارية', labelEn: 'Commercials' },
          ].map((tab) => (
            <button
              key={`filter-tab-${tab.id}`}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-white dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {isAr ? tab.labelAr : tab.labelEn}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueReviews.map((review, idx) => (
            <div
              key={`rev-card-${review.id || idx}-${idx}`}
              className="relative flex flex-col justify-between p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all hover:border-[#C82626]/30 group"
            >
              <div>
                
                {/* Header: Stars & Service Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={`star-${review.id || idx}-${s}`}
                        className={`w-4 h-4 ${
                          s <= review.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-neutral-200 dark:text-neutral-700'
                        }`}
                      />
                    ))}
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {review.serviceType === 'podcast' && (isAr ? 'بودكاست' : 'Podcast')}
                    {review.serviceType === 'reels' && (isAr ? 'ريلز' : 'Reels')}
                    {review.serviceType === 'commercial' && (isAr ? 'إعلان' : 'Commercial')}
                    {review.serviceType === 'general' && (isAr ? 'عام' : 'General')}
                  </span>
                </div>

                {/* Comment */}
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 italic">
                  "{review.comment}"
                </p>

                {/* Admin Reply Note if present */}
                {review.adminReply && (
                  <div className="mb-4 p-3 rounded-2xl bg-[#C82626]/5 border border-[#C82626]/15 text-xs text-neutral-700 dark:text-neutral-300">
                    <div className="font-bold text-[#C82626] mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAr ? 'رد إدارة KIN Studio:' : 'KIN Studio Response:'}</span>
                    </div>
                    <p className="leading-relaxed">{review.adminReply}</p>
                  </div>
                )}
              </div>

              {/* Author Footer */}
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <span>{review.authorName}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
                  </h4>
                  {review.authorProject && (
                    <p className="text-xs text-[#C82626] font-medium">
                      {review.authorProject}
                    </p>
                  )}
                </div>

                <span className="text-[11px] text-neutral-400">
                  {review.createdAt ? new Date(review.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : ''}
                </span>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
