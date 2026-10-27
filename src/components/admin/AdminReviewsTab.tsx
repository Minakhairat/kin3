import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Sparkles,
  MessageSquare,
  Search,
  Filter,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { Language, ReviewItem } from '../../types';
import {
  subscribeAllReviewsForAdmin,
  updateReviewModeration,
  updateReviewDetails,
  deleteReview,
} from '../../services/reviewsService';

interface AdminReviewsTabProps {
  lang: Language;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Edit / Reply modal state
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editProject, setEditProject] = useState('');
  const [editRating, setEditRating] = useState(5);
  const [editReply, setEditReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeAllReviewsForAdmin((all) => {
      setReviews(all);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleApprove = async (review: ReviewItem) => {
    try {
      await updateReviewModeration(review.id, 'approved', review.isFeatured);
      setActionSuccess(isAr ? 'تمت الموافقة على التقييم ونشره في الموقع' : 'Review approved and published');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleReject = async (review: ReviewItem) => {
    try {
      await updateReviewModeration(review.id, 'rejected');
      setActionSuccess(isAr ? 'تم رفض التقييم وحجبه' : 'Review rejected');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (review: ReviewItem) => {
    try {
      await updateReviewModeration(review.id, review.status, !review.isFeatured);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من حذف هذا التقييم نهائياً؟' : 'Permanently delete this review?')) return;
    try {
      await deleteReview(id);
      setActionSuccess(isAr ? 'تم حذف التقييم' : 'Review deleted');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    setIsSubmitting(true);
    try {
      await updateReviewDetails(editingReview.id, {
        authorName: editAuthorName.trim() || editingReview.authorName,
        comment: editComment,
        authorProject: editProject,
        rating: editRating,
      });

      if (editReply.trim() || editingReview.adminReply) {
        await updateReviewModeration(
          editingReview.id,
          editingReview.status,
          editingReview.isFeatured,
          editReply.trim()
        );
      }

      setEditingReview(null);
      setActionSuccess(isAr ? 'تم حفظ التعديلات والرد بنجاح' : 'Changes and reply saved');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = reviews.filter((r) => {
    const matchesFilter = filterStatus === 'all' || r.status === filterStatus;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      r.authorName.toLowerCase().includes(query) ||
      (r.authorProject && r.authorProject.toLowerCase().includes(query)) ||
      r.comment.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 font-brand">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>{isAr ? 'إدارة واعتماد آراء وتقييمات العملاء' : 'Client Reviews & Moderation CMS'}</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isAr
              ? 'مراجعة تقييمات العملاء الواردة من الموقع، قبولها، تعديل صياغتها، أو إضافة رد رسمي.'
              : 'Approve, edit, or officially reply to client testimonials before publication.'}
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold animate-pulse">
            <AlertCircle className="w-4 h-4" />
            <span>{isAr ? `${pendingCount} تقييمات في انتظار الموافقة` : `${pendingCount} pending reviews`}</span>
          </div>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث بالاسم، البودكاست، أو نص التقييم...' : 'Search by name, podcast, or feedback...'}
            className="w-full ps-10 pe-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#C82626]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {st === 'all' && (isAr ? 'الكل' : 'All')}
              {st === 'pending' && (isAr ? `معلقة (${pendingCount})` : `Pending (${pendingCount})`)}
              {st === 'approved' && (isAr ? 'معتمدة' : 'Approved')}
              {st === 'rejected' && (isAr ? 'مرفوضة' : 'Rejected')}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table / Cards */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400 text-xs">
          {isAr ? 'جاري تحميل التقييمات...' : 'Loading reviews...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-xs bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          {isAr ? 'لا توجد تقييمات مطابقة للبحث' : 'No reviews match your filter'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className={`p-4 rounded-2xl border transition-all ${
                rev.status === 'pending'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/50'
                  : rev.status === 'approved'
                  ? 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                  : 'bg-neutral-100/50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Author Info & Content */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {rev.authorName}
                    </span>
                    {rev.authorProject && (
                      <span className="text-xs font-semibold text-[#C82626] bg-[#C82626]/10 px-2 py-0.5 rounded">
                        {rev.authorProject}
                      </span>
                    )}

                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-current' : 'text-neutral-300 dark:text-neutral-700'
                          }`}
                        />
                      ))}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        rev.status === 'approved'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : rev.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {rev.status === 'approved' && (isAr ? 'معتمد ومنشور' : 'Approved')}
                      {rev.status === 'pending' && (isAr ? 'في انتظار الموافقة' : 'Pending')}
                      {rev.status === 'rejected' && (isAr ? 'مرفوض' : 'Rejected')}
                    </span>

                    {rev.isFeatured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {isAr ? 'مميز بالرئيسية' : 'Featured'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {rev.adminReply && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#C82626]/5 border border-[#C82626]/15 text-xs">
                      <span className="font-bold text-[#C82626] block mb-0.5">
                        {isAr ? 'رد الاستوديو:' : 'Studio Reply:'}
                      </span>
                      <p className="text-neutral-600 dark:text-neutral-400">{rev.adminReply}</p>
                    </div>
                  )}

                  <div className="text-[11px] text-neutral-400 flex items-center gap-3 pt-1">
                    <span>{rev.serviceType}</span>
                    <span>•</span>
                    <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : ''}</span>
                    {rev.authorEmail && (
                      <>
                        <span>•</span>
                        <span>{rev.authorEmail}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Moderation Actions Toolbar */}
                <div className="flex sm:flex-col items-center gap-1.5 shrink-0">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => handleApprove(rev)}
                      title={isAr ? 'قبول ونشر' : 'Approve'}
                      className="px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isAr ? 'قبول' : 'Approve'}</span>
                    </button>
                  )}

                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => handleReject(rev)}
                      title={isAr ? 'إخفاء وحجب التقييم من الموقع' : 'Hide from website'}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-800 hover:bg-red-500/10 hover:text-red-600 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إخفاء / حجب' : 'Hide'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleFeatured(rev)}
                    title={isAr ? 'تثبيت / إلغاء تثبيت بالرئيسية' : 'Toggle Featured'}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                      rev.isFeatured
                        ? 'bg-purple-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{rev.isFeatured ? (isAr ? 'مثبت' : 'Featured') : (isAr ? 'تثبيت' : 'Feature')}</span>
                  </button>

                  <button
                    onClick={() => {
                      setEditingReview(rev);
                      setEditAuthorName(rev.authorName || '');
                      setEditComment(rev.comment);
                      setEditProject(rev.authorProject || '');
                      setEditRating(rev.rating);
                      setEditReply(rev.adminReply || '');
                    }}
                    title={isAr ? 'تعديل أو رد' : 'Edit or Reply'}
                    className="px-2.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعديل / رد' : 'Edit'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(rev.id)}
                    title={isAr ? 'حذف نهائي' : 'Delete'}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-base text-neutral-900 dark:text-white">
                {isAr ? `تعديل تقييم: ${editingReview.authorName}` : `Edit Review: ${editingReview.authorName}`}
              </h4>
              <button
                onClick={() => setEditingReview(null)}
                className="p-1.5 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'اسم العميل / صاحب التقييم:' : 'Client Name:'}
                </label>
                <input
                  type="text"
                  value={editAuthorName}
                  onChange={(e) => setEditAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'اسم البودكاست / البراند:' : 'Podcast / Brand Title:'}
                </label>
                <input
                  type="text"
                  value={editProject}
                  onChange={(e) => setEditProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'التقييم بالنجوم:' : 'Rating:'}
                </label>
                <select
                  value={editRating}
                  onChange={(e) => setEditRating(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none"
                >
                  <option value={5}>5 ★★★★★</option>
                  <option value={4}>4 ★★★★☆</option>
                  <option value={3}>3 ★★★☆☆</option>
                  <option value={2}>2 ★★☆☆☆</option>
                  <option value={1}>1 ★☆☆☆☆</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'نص مراجعة العميل:' : 'Review Content:'}
                </label>
                <textarea
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626]"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-neutral-700 dark:text-neutral-300">
                  {isAr ? 'رد رسمي من إدارة الاستوديو (اختياري يظهر تحت التقييم):' : 'Official Studio Reply (Optional):'}
                </label>
                <textarea
                  rows={2}
                  value={editReply}
                  onChange={(e) => setEditReply(e.target.value)}
                  placeholder={isAr ? 'شكراً لثقتكم في كين...' : 'Thank you for choosing KIN...'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-[#C82626]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="px-4 py-2 rounded-xl text-neutral-500 hover:bg-neutral-100 text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow transition-all cursor-pointer"
              >
                {isAr ? 'حفظ التعديلات والرد' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
