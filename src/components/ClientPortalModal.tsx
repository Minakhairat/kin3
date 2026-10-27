import React, { useState, useEffect } from 'react';
import {
  X,
  Film,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Clock,
  CheckCircle2,
  Send,
  MessageSquare,
  AlertCircle,
  Sparkles,
  PhoneCall,
  Download,
  Video,
  Play,
  FileText,
  Printer,
  Timer,
  CheckCircle,
  Tag,
  Scissors,
  Mic,
  Palette,
  Type
} from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { COMPANY_INFO } from '../data/content';
import {
  DeliverableItem,
  RevisionItem,
  subscribeClientDeliverables,
  subscribeRevisions,
  addRevision,
  recordDeliverableView,
  recordDeliverableDownload,
} from '../services/deliverablesService';

interface ClientPortalModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  isOpen,
  lang,
  onClose,
  onOpenBooking,
}) => {
  const { user } = useAuth();
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'podcast' | 'reels' | 'commercial'>('all');

  // Copied link indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Timecoded revision form
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newTimecode, setNewTimecode] = useState('');
  const [newCategory, setNewCategory] = useState<'cut' | 'audio' | 'color' | 'caption' | 'general'>('general');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Video preview player
  const [isPreviewPlayerOpen, setIsPreviewPlayerOpen] = useState(false);

  // Receipt / Certificate modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !user?.email) {
      setDeliverables([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeClientDeliverables(
      user.email,
      (items) => {
        setDeliverables(items);
        setLoading(false);
        if (items.length > 0 && !selectedProjectId) {
          setSelectedProjectId(items[0].id);
          recordDeliverableView(items[0]);
        }
      },
      (err) => {
        console.error('Error fetching client deliverables:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, user?.email]);

  // Subscribe to revisions of selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setRevisions([]);
      return;
    }

    const unsub = subscribeRevisions(selectedProjectId, (revs) => {
      setRevisions(revs);
    });

    return () => unsub();
  }, [selectedProjectId]);

  if (!isOpen) return null;

  const handleSelectProject = (item: DeliverableItem) => {
    setSelectedProjectId(item.id);
    recordDeliverableView(item);
  };

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadClick = (item: DeliverableItem) => {
    recordDeliverableDownload(item);
  };

  const handleSendRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email || !selectedProjectId || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await addRevision(selectedProjectId, newComment, user.email, user.uid, {
        timecode: newTimecode.trim() || undefined,
        category: newCategory,
      });
      setNewComment('');
      setNewTimecode('');
      setNewCategory('general');
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err) {
      console.error('Error adding revision:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const filteredDeliverables = deliverables.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.serviceType === categoryFilter;
  });

  const selectedDeliverable = deliverables.find((d) => d.id === selectedProjectId) || filteredDeliverables[0];

  const getStatusStep = (st: DeliverableItem['status']) => {
    switch (st) {
      case 'shooting':
        return 1;
      case 'editing':
        return 2;
      case 'review':
        return 3;
      case 'delivered':
        return 4;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-6xl h-[94vh] bg-[#FAFAFA] dark:bg-[#141211] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col overflow-hidden text-[#141211] dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#141211] via-[#1c1817] to-[#2b1f1d] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#C82626] text-white shadow-md">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {lang === 'ar' ? 'بوابة العميل — استلام وتنزيل الشغل 4K' : 'KIN Client Portal & 4K Deliverables'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                  {lang === 'ar' ? 'جلسة معتمدة' : 'Verified'}
                </span>
              </div>
              <p className="text-xs text-white/70 font-mono mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedDeliverable && (
              <button
                onClick={() => setIsReceiptModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer border border-white/10 transition-colors"
                title={lang === 'ar' ? 'طباعة إيصال التسليم' : 'View Delivery Receipt'}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'إيصال التسليم' : 'Receipt'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-[#C82626] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-[#141211]/60 dark:text-white/60">
                {lang === 'ar' ? 'جاري استرجاع ملفاتك ومشاريعك المصورة...' : 'Retrieving your project files...'}
              </p>
            </div>
          ) : deliverables.length === 0 ? (
            /* No projects assigned to this email */
            <div className="py-20 px-4 text-center max-w-lg mx-auto space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-[#141211] dark:text-white">
                  {lang === 'ar' ? 'لم يتم ربط مشاريع بهذا البريد الإلكتروني بعد' : 'No deliverables linked to this email yet'}
                </h4>
                <p className="text-xs text-[#141211]/70 dark:text-white/70 leading-relaxed">
                  {lang === 'ar'
                    ? `أنت مسجل حالياً بالبريد (${user?.email}). يتم ربط الروابط بواسطة إدارة استوديو KIN حصرياً للإيميل المتفق عليه عند حجز جلسة التصوير.`
                    : `You are signed in as (${user?.email}). Deliverables are securely assigned by KIN Studio management based on the email provided during booking.`}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <a
                  href={`https://wa.me/${COMPANY_INFO.whatsappNumbers[0]}?text=${encodeURIComponent(
                    lang === 'ar'
                      ? `مرحباً ستوديو KIN، سجلت بالبريد (${user?.email}) وأود تفعيل رابط الشغل الخاص بي.`
                      : `Hello KIN Studio, I signed in with (${user?.email}) and would like to link my project files.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] rounded-xl shadow-md transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'تواصل مع فريق KIN بالواتساب' : 'Contact on WhatsApp'}</span>
                </a>

                <button
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 rounded-xl transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'احجز جلسة استوديو الآن' : 'Book a Session'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Deliverables found! */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Projects Selector & Category Filter */}
              <div className="lg:col-span-4 space-y-4">
                {/* Category Chips */}
                <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 overflow-x-auto">
                  {[
                    { id: 'all', label: lang === 'ar' ? 'الكل' : 'All' },
                    { id: 'podcast', label: lang === 'ar' ? 'بودكاست' : 'Podcast' },
                    { id: 'reels', label: lang === 'ar' ? 'ريلز' : 'Reels' },
                    { id: 'commercial', label: lang === 'ar' ? 'تجاري' : 'Commercial' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCategoryFilter(tab.id as any)}
                      className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        categoryFilter === tab.id
                          ? 'bg-white dark:bg-[#201c1b] text-[#C82626] shadow-sm'
                          : 'text-[#141211]/60 dark:text-white/60 hover:text-[#141211] dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Projects List */}
                <div className="space-y-2.5 max-h-[65vh] overflow-y-auto pe-1">
                  {filteredDeliverables.map((item) => {
                    const isSelected = item.id === selectedDeliverable?.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectProject(item)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-[#1a1716] border-[#C82626] shadow-md ring-1 ring-[#C82626]/20'
                            : 'bg-white/80 dark:bg-[#1a1716]/60 border-black/10 dark:border-white/10 hover:border-black/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-xs font-bold text-[#141211] dark:text-white line-clamp-2">
                            {item.title}
                          </h5>
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-black/5 dark:bg-white/10 text-[#141211]/70 dark:text-white/70 uppercase font-mono shrink-0">
                            {item.serviceType}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#141211]/50 dark:text-white/50 mt-2">
                          {item.recordingDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {item.recordingDate}
                            </span>
                          )}
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {item.status === 'delivered' ? (lang === 'ar' ? 'جاهز 4K' : 'Ready') : (lang === 'ar' ? 'قيد المتابعة' : 'Active')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Re-book promo card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#C82626]/10 to-[#C82626]/5 border border-[#C82626]/20 text-xs space-y-2.5">
                  <p className="font-bold text-[#C82626]">
                    {lang === 'ar' ? 'جاهز لتصوير حلقتك القادمة؟' : 'Ready for your next session?'}
                  </p>
                  <p className="text-[11px] text-[#141211]/70 dark:text-white/70 leading-relaxed">
                    {lang === 'ar'
                      ? 'احجز الجلسة القادمة بضغطة زر مع الحفاظ على نفس الإعدادات الفنية والديكور.'
                      : 'Book your next session with the same lighting, camera and acoustic preset.'}
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenBooking();
                    }}
                    className="w-full py-2 px-3 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] rounded-xl shadow cursor-pointer transition-all"
                  >
                    {lang === 'ar' ? 'حجز جلسة جديدة' : 'Book Next Session'}
                  </button>
                </div>
              </div>

              {/* Right Column: Selected Project Detail, Video Player, and Timecoded Feedback */}
              {selectedDeliverable && (
                <div className="lg:col-span-8 space-y-6">
                  {/* Master Card */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C82626]/10 text-[#C82626] border border-[#C82626]/20 uppercase">
                            {selectedDeliverable.serviceType}
                          </span>
                          {selectedDeliverable.recordingDate && (
                            <span className="text-xs text-[#141211]/60 dark:text-white/60 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {selectedDeliverable.recordingDate}
                            </span>
                          )}
                          {selectedDeliverable.expiresAt && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                              <Timer className="w-3 h-3" />
                              {lang === 'ar' ? `صلاحية التحميل: ${selectedDeliverable.expiresAt}` : `Valid until: ${selectedDeliverable.expiresAt}`}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-extrabold text-[#141211] dark:text-white">
                          {selectedDeliverable.title}
                        </h3>
                        {selectedDeliverable.clientName && (
                          <p className="text-xs text-[#141211]/70 dark:text-white/70 mt-0.5">
                            {selectedDeliverable.clientName}
                          </p>
                        )}
                      </div>

                      {/* Receipt button */}
                      <button
                        onClick={() => setIsReceiptModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-black/10 dark:border-white/10 text-xs font-semibold hover:border-[#C82626] transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C82626]" />
                        <span>{lang === 'ar' ? 'عرض السند' : 'Receipt'}</span>
                      </button>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="p-4 rounded-xl bg-black/2 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-[#141211] dark:text-white">
                        <span>{lang === 'ar' ? 'مراحل الإنتاج والتسليم' : 'Production Progress'}</span>
                        <span className="text-[#C82626]">
                          {selectedDeliverable.status === 'shooting' && (lang === 'ar' ? 'جاري التصوير' : 'Shooting')}
                          {selectedDeliverable.status === 'editing' && (lang === 'ar' ? 'جاري المونتاج والتلوين' : 'Editing')}
                          {selectedDeliverable.status === 'review' && (lang === 'ar' ? 'جاهز للمعاينة' : 'In Review')}
                          {selectedDeliverable.status === 'delivered' && (lang === 'ar' ? 'تم التسليم النهائي المعتمد 4K' : 'Delivered')}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        {[
                          { step: 1, title: lang === 'ar' ? 'التصوير' : 'Shoot' },
                          { step: 2, title: lang === 'ar' ? 'المونتاج' : 'Edit' },
                          { step: 3, title: lang === 'ar' ? 'المعاينة' : 'Review' },
                          { step: 4, title: lang === 'ar' ? 'التسليم 4K' : 'Master' },
                        ].map((s) => {
                          const currentStep = getStatusStep(selectedDeliverable.status);
                          const isDone = currentStep >= s.step;
                          const isCurrent = currentStep === s.step;
                          return (
                            <div key={s.step} className="space-y-1">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isDone ? 'bg-[#C82626]' : 'bg-black/10 dark:bg-white/10'
                                }`}
                              />
                              <p
                                className={`text-[10px] font-semibold ${
                                  isCurrent
                                    ? 'text-[#C82626]'
                                    : isDone
                                    ? 'text-[#141211] dark:text-white'
                                    : 'text-[#141211]/40 dark:text-white/40'
                                }`}
                              >
                                {s.title}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Embedded Video Preview (if available) */}
                    {selectedDeliverable.previewVideoUrl && (
                      <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold flex items-center gap-2">
                            <Play className="w-4 h-4 text-[#C82626]" />
                            <span>{lang === 'ar' ? 'معاينة الفيديو السريعة المباشرة' : 'Direct Video Preview'}</span>
                          </span>
                        </div>

                        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                          {selectedDeliverable.previewVideoUrl.includes('youtube.com') ||
                          selectedDeliverable.previewVideoUrl.includes('youtu.be') ? (
                            <iframe
                              src={selectedDeliverable.previewVideoUrl.replace('watch?v=', 'embed/')}
                              title="Preview"
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              src={selectedDeliverable.previewVideoUrl}
                              controls
                              className="w-full h-full object-contain"
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* THE CORE 4K MASTER WORK LINK BOX */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#141211] to-[#25201e] text-white space-y-4 shadow-xl border border-white/10">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-[#C82626] text-white shadow-md">
                            <Download className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm sm:text-base font-bold text-white">
                              {lang === 'ar' ? 'رابط ملفات العمل والتسليمات المعتمدة' : 'Official Deliverables Work Link'}
                            </h4>
                            <p className="text-[11px] text-white/70">
                              {lang === 'ar'
                                ? 'الفيديوهات بدقة 4K، الملفات الصوتية المنفصلة، ومقاطع الريلز'
                                : 'Master 4K video exports, multitrack audio, and vertical cutdowns'}
                            </p>
                          </div>
                        </div>

                        <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                          {lang === 'ar' ? 'صلاحية مؤكدة لك' : 'Verified Access'}
                        </span>
                      </div>

                      {/* Link URL preview */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                        <span className="font-mono text-white/80 truncate text-[11px]">
                          {selectedDeliverable.link}
                        </span>
                        <button
                          onClick={() => handleCopyLink(selectedDeliverable.link, selectedDeliverable.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs flex items-center gap-1.5 shrink-0"
                        >
                          {copiedId === selectedDeliverable.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">{lang === 'ar' ? 'تم النسخ' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[10px]">{lang === 'ar' ? 'نسخ' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Primary Open Button */}
                      <a
                        href={selectedDeliverable.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleDownloadClick(selectedDeliverable)}
                        className="w-full py-4 px-6 text-sm font-extrabold text-white bg-[#C82626] hover:bg-[#a51e1e] active:scale-[0.99] rounded-xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4 rtl:rotate-180" />
                        <span>
                          {lang === 'ar'
                            ? 'فتح وتحميل ملفات العمل (4K Drive / Frame.io)'
                            : 'Open & Download Master Files (4K)'}
                        </span>
                      </a>
                    </div>

                    {/* Studio Notes & Specs */}
                    {selectedDeliverable.notes && (
                      <div className="p-4 rounded-xl bg-black/2 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-1.5 text-xs">
                        <p className="font-bold text-[#141211] dark:text-white">
                          {lang === 'ar' ? 'ملاحظات الاستوديو والمواصفات الفنية:' : 'Studio Tech Specs & Notes:'}
                        </p>
                        <p className="text-[#141211]/80 dark:text-white/80 leading-relaxed">
                          {selectedDeliverable.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Client Timecoded Feedback & Revisions Center */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#C82626]" />
                      <h4 className="text-sm font-bold text-[#141211] dark:text-white">
                        {lang === 'ar' ? 'طلب تعديل كلاكيت بالثواني والتصنيف' : 'Timecoded Revision & Feedback'}
                      </h4>
                    </div>

                    <p className="text-xs text-[#141211]/70 dark:text-white/70">
                      {lang === 'ar'
                        ? 'يمكنك تحديد الدقيقة والثانية ونوع الملاحظة لتصل فوراً لمونتير الاستوديو في لوحة التحكم.'
                        : 'Submit exact timecodes and edit tags directly to the post-production editor.'}
                    </p>

                    {commentSuccess && (
                      <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{lang === 'ar' ? 'تم إرسال ملاحظاتك إلى المونتير بنجاح!' : 'Your revision was submitted!'}</span>
                      </div>
                    )}

                    <form onSubmit={handleSendRevision} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#141211]/70 dark:text-white/70 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#C82626]" />
                            <span>{lang === 'ar' ? 'التوقيت بالفيديو (مثال: 04:15)' : 'Timecode (e.g., 04:15)'}</span>
                          </label>
                          <input
                            type="text"
                            placeholder="04:15"
                            value={newTimecode}
                            onChange={(e) => setNewTimecode(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#141211] text-xs font-mono focus:outline-none focus:border-[#C82626]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[#141211]/70 dark:text-white/70 flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5 text-[#C82626]" />
                            <span>{lang === 'ar' ? 'نوع التعديل المطلوب' : 'Edit Category'}</span>
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e: any) => setNewCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#141211] text-xs focus:outline-none focus:border-[#C82626]"
                          >
                            <option value="general">{lang === 'ar' ? 'ملاحظة عامة' : 'General'}</option>
                            <option value="cut">{lang === 'ar' ? 'قص ومونتاج (Cut)' : 'Cut & Trim'}</option>
                            <option value="audio">{lang === 'ar' ? 'هندسة صوت وموسيقى (Audio)' : 'Audio & Music'}</option>
                            <option value="color">{lang === 'ar' ? 'تلوين سينمائي وإضاءة (Color)' : 'Color & Light'}</option>
                            <option value="caption">{lang === 'ar' ? 'كابشنز ونصوص (Captions)' : 'Captions & Titles'}</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        rows={3}
                        required
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={
                          lang === 'ar'
                            ? 'اكتب تفاصيل التعديل المطلوب بدقة...'
                            : 'Write revision details...'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#141211] text-[#141211] dark:text-white text-xs focus:outline-none focus:border-[#C82626]"
                      />

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingComment || !newComment.trim()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] active:scale-[0.98] rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                          <span>
                            {submittingComment
                              ? lang === 'ar' ? 'جاري الإرسال...' : 'Sending...'
                              : lang === 'ar' ? 'إرسال الملاحظة للمونتير' : 'Submit Revision'}
                          </span>
                        </button>
                      </div>
                    </form>

                    {/* Submitted Revisions Tracker */}
                    {revisions.length > 0 && (
                      <div className="pt-4 border-t border-black/8 dark:border-white/10 space-y-3">
                        <h5 className="text-xs font-bold text-[#141211] dark:text-white">
                          {lang === 'ar' ? 'سجل الملاحظات المرسلة وحالتها:' : 'Submitted Feedback & Status:'}
                        </h5>
                        <div className="space-y-2.5">
                          {revisions.map((rev) => (
                            <div
                              key={rev.id}
                              className="p-3.5 rounded-xl bg-black/2 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {rev.timecode && (
                                    <span className="px-2 py-0.5 rounded-md bg-[#C82626] text-white text-[10px] font-mono font-bold">
                                      {rev.timecode}
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] uppercase font-mono">
                                    {rev.category || 'general'}
                                  </span>
                                </div>

                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    rev.status === 'resolved'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      : rev.status === 'in_progress'
                                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                  }`}
                                >
                                  {rev.status === 'resolved'
                                    ? lang === 'ar' ? 'تم التعديل والاعتماد ✓' : 'Resolved'
                                    : rev.status === 'in_progress'
                                    ? lang === 'ar' ? 'جاري التعديل' : 'In Progress'
                                    : lang === 'ar' ? 'قيد المراجعة' : 'Pending'}
                                </span>
                              </div>

                              <p className="text-xs text-[#141211] dark:text-white font-medium leading-relaxed">
                                {rev.comment}
                              </p>

                              {rev.adminReply && (
                                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px] border border-emerald-500/20">
                                  <span className="font-bold">{lang === 'ar' ? 'رد الاستوديو: ' : 'Studio Reply: '}</span>
                                  {rev.adminReply}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certified Delivery Receipt Modal */}
        {isReceiptModalOpen && selectedDeliverable && (
          <div
            className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setIsReceiptModalOpen(false)}
          >
            <div
              className="relative w-full max-w-lg bg-white dark:bg-[#181514] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 border border-black/10 dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <img
                  src={COMPANY_INFO.logoDark}
                  alt="Kin Media Production"
                  className="h-10 w-auto object-contain hidden dark:block"
                />
                <img
                  src={COMPANY_INFO.logo}
                  alt="Kin Media Production"
                  className="h-10 w-auto object-contain dark:hidden"
                />
                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#C82626] font-bold">
                    Official Production Statement
                  </span>
                  <span className="text-[10px] font-mono text-[#141211]/50 dark:text-white/50">
                    ID: {selectedDeliverable.id}
                  </span>
                </div>
                <h4 className="text-xl font-black text-[#141211] dark:text-white">
                  {lang === 'ar' ? 'سند تسليم مشروع معتمد' : 'Certificate of Delivery'}
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-black/3 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'المشروع:' : 'Project:'}</span>
                  <span className="font-bold">{selectedDeliverable.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'العميل المستلم:' : 'Client:'}</span>
                  <span className="font-mono">{selectedDeliverable.clientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'نوع الباقة:' : 'Package:'}</span>
                  <span className="font-bold uppercase">{selectedDeliverable.serviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'تاريخ التسجيل:' : 'Shoot Date:'}</span>
                  <span className="font-mono">{selectedDeliverable.recordingDate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#141211]/60 dark:text-white/60">{lang === 'ar' ? 'مقر الاستوديو:' : 'Studio Location:'}</span>
                  <span>{lang === 'ar' ? COMPANY_INFO.address.ar : COMPANY_INFO.address.en}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C82626] text-white text-xs font-bold hover:bg-[#a51e1e] cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'طباعة السند / PDF' : 'Print / Save PDF'}</span>
                </button>

                <button
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/10 text-xs font-semibold cursor-pointer"
                >
                  {lang === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
