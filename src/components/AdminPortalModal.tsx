import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Link as LinkIcon,
  Mail,
  User,
  Calendar,
  Trash2,
  Edit2,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Video,
  MessageSquare,
  Search,
  Copy,
  Check,
  AlertCircle,
  Users,
  FolderGit2,
  TrendingUp,
  Eye,
  Download,
  Share2,
  PhoneCall,
  Play,
  CheckCircle2,
  Sparkles,
  Layers,
  Send,
  Timer
} from 'lucide-react';
import { Language } from '../types';
import { useAuth } from '../context/AuthContext';
import { COMPANY_INFO } from '../data/content';
import {
  DeliverableItem,
  RevisionItem,
  subscribeAllDeliverables,
  createDeliverable,
  updateDeliverable,
  deleteDeliverable,
  subscribeRevisions,
  updateRevisionStatus,
} from '../services/deliverablesService';
import { AdminReviewsTab } from './admin/AdminReviewsTab';
import { AdminPricingCmsTab } from './admin/AdminPricingCmsTab';
import { AdminFinancialsTab } from './admin/AdminFinancialsTab';
import { AdminGearTab } from './admin/AdminGearTab';
import { AdminCalendarTab } from './admin/AdminCalendarTab';
import { AdminInvoicesTab } from './admin/AdminInvoicesTab';
import { InvoiceGeneratorModal } from './InvoiceGeneratorModal';
import { Star, Tag, Camera, FileText, Receipt } from 'lucide-react';

interface AdminPortalModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
  onOpenClientPortal: () => void;
}

export type AdminTab =
  | 'dashboard'
  | 'list'
  | 'add'
  | 'clients'
  | 'invoices'
  | 'reviews'
  | 'pricing_cms'
  | 'financials'
  | 'calendar'
  | 'gear';

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  lang,
  onClose,
  onOpenClientPortal,
}) => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [link, setLink] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [serviceType, setServiceType] = useState<'podcast' | 'reels' | 'commercial' | 'other'>('podcast');
  const [status, setStatus] = useState<'shooting' | 'editing' | 'review' | 'delivered'>('editing');
  const [recordingDate, setRecordingDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiresInDays, setExpiresInDays] = useState<'none' | '14' | '30' | '60'>('30');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Revisions & Feedback modal
  const [selectedDeliverableForRevisions, setSelectedDeliverableForRevisions] = useState<DeliverableItem | null>(null);
  const [activeRevisions, setActiveRevisions] = useState<RevisionItem[]>([]);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Video preview player modal
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  // Copied link indicator
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // In-app delete confirmation modal state (sandbox & Canva safe)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    setLoadingList(true);
    const unsubscribe = subscribeAllDeliverables(
      (items) => {
        setDeliverables(items);
        setLoadingList(false);
      },
      (err) => {
        console.error('Failed to load deliverables:', err);
        setLoadingList(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen, isAdmin]);

  // Revisions subscription
  useEffect(() => {
    if (!selectedDeliverableForRevisions) {
      setActiveRevisions([]);
      return;
    }
    const unsub = subscribeRevisions(selectedDeliverableForRevisions.id, (revs) => {
      setActiveRevisions(revs);
    });
    return () => unsub();
  }, [selectedDeliverableForRevisions]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setClientEmail('');
    setClientName('');
    setClientPhone('');
    setLink('');
    setPreviewVideoUrl('');
    setServiceType('podcast');
    setStatus('editing');
    setRecordingDate(new Date().toISOString().split('T')[0]);
    setExpiresInDays('30');
    setNotes('');
    setFormError(null);
  };

  const handleStartEdit = (item: DeliverableItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setClientEmail(item.clientEmail);
    setClientName(item.clientName || '');
    setClientPhone(item.clientPhone || '');
    setLink(item.link);
    setPreviewVideoUrl(item.previewVideoUrl || '');
    setServiceType(item.serviceType || 'podcast');
    setStatus(item.status);
    setRecordingDate(item.recordingDate || '');
    setNotes(item.notes || '');
    setActiveTab('add');
    setFormSuccess(null);
    setFormError(null);
  };

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!title.trim() || !clientEmail.trim() || !link.trim()) {
      setFormError(
        lang === 'ar'
          ? 'يرجى ملء جميع الحقول المطلوبة (اسم المشروع، إيميل العميل، الرابط)'
          : 'Please fill in required fields (title, client email, link)'
      );
      return;
    }

    if (!clientEmail.includes('@') || !clientEmail.includes('.')) {
      setFormError(lang === 'ar' ? 'صيغة البريد الإلكتروني غير صحيحة' : 'Invalid email format');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    // Compute expiry date if configured
    let expiresAt: string | undefined = undefined;
    if (expiresInDays !== 'none') {
      const days = parseInt(expiresInDays, 10);
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + days);
      expiresAt = expDate.toISOString().split('T')[0];
    }

    try {
      if (editingId) {
        await updateDeliverable(editingId, {
          title: title.trim(),
          clientEmail: clientEmail.trim().toLowerCase(),
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim() || undefined,
          link: link.trim(),
          previewVideoUrl: previewVideoUrl.trim() || undefined,
          serviceType,
          status,
          recordingDate,
          expiresAt,
          notes: notes.trim(),
        });
        setFormSuccess(lang === 'ar' ? 'تم تحديث بيانات المشروع بنجاح!' : 'Deliverable updated successfully!');
      } else {
        await createDeliverable({
          title: title.trim(),
          clientEmail: clientEmail.trim().toLowerCase(),
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim() || undefined,
          link: link.trim(),
          previewVideoUrl: previewVideoUrl.trim() || undefined,
          serviceType,
          status,
          recordingDate,
          expiresAt,
          notes: notes.trim(),
          createdBy: user.uid,
        });
        setFormSuccess(
          lang === 'ar'
            ? 'تمت إضافة رابط الشغل وتخصيصه للعميل بنجاح مع تفعيل صلاحيات المشاهدة!'
            : 'Deliverable link created and assigned to client email successfully!'
        );
      }

      resetForm();
      setActiveTab('list');
    } catch (err: any) {
      console.error('Error saving deliverable:', err);
      setFormError(err.message || 'Error saving deliverable');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);
    try {
      await deleteDeliverable(deleteConfirmTarget.id);
      setFormSuccess(
        lang === 'ar'
          ? `تم حذف مشروع "${deleteConfirmTarget.title}" بنجاح!`
          : `Deliverable "${deleteConfirmTarget.title}" deleted successfully!`
      );
      setDeleteConfirmTarget(null);
    } catch (err: any) {
      console.error('Error deleting deliverable:', err);
      setFormError(
        err.message ||
          (lang === 'ar'
            ? 'حدث خطأ أثناء محاولة الحذف، يرجى التأكد من صلاحيات الأدمن.'
            : 'Error deleting deliverable.')
      );
      setDeleteConfirmTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = (item: DeliverableItem) => {
    navigator.clipboard.writeText(item.link);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // WhatsApp notification dispatch generator
  const getWhatsAppDispatchUrl = (item: DeliverableItem) => {
    const phone = (item.clientPhone || '').replace(/[^0-9]/g, '');
    const clientGreeting = item.clientName ? `أهلاً يا ${item.clientName}` : 'مرحباً بك';
    const message =
      lang === 'ar'
        ? `${clientGreeting}! فريق استوديو KIN Media Production يحييك.\n\nتم الانتهاء وتجهيز ملفات مشروعك:\n🎬 *${item.title}*\n\nيمكنك الآن الدخول لبوابتك الخاصة في الموقع بالبريد الإلكتروني (${item.clientEmail}) للمعاينة والتحميل بدقة 4K:\n🔗 ${window.location.origin}\n\nأو الرابط المباشر للملفات:\n${item.link}\n\nنتمنى لك عملاً ملهماً! KEEP IT NEAT ✨`
        : `Hello ${item.clientName || 'there'}! KIN Media Production team here.\n\nYour project files are ready:\n🎬 *${item.title}*\n\nSign in to your private portal with (${item.clientEmail}) to access 4K master files:\n🔗 ${window.location.origin}\n\nOr direct link:\n${item.link}\n\nKEEP IT NEAT ✨`;

    const targetNumber = phone.length >= 10 ? phone : COMPANY_INFO.whatsappNumbers[0];
    return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleUpdateRevStatus = async (
    revId: string,
    newStatus: 'pending' | 'in_progress' | 'resolved'
  ) => {
    if (!selectedDeliverableForRevisions) return;
    const reply = replyTextMap[revId];
    try {
      await updateRevisionStatus(selectedDeliverableForRevisions.id, revId, newStatus, reply);
    } catch (err) {
      console.error('Error updating revision status:', err);
    }
  };

  // Metrics calculation
  const totalProjects = deliverables.length;
  const inPostCount = deliverables.filter((d) => d.status === 'editing' || d.status === 'shooting').length;
  const inReviewCount = deliverables.filter((d) => d.status === 'review').length;
  const deliveredCount = deliverables.filter((d) => d.status === 'delivered').length;
  const totalViews = deliverables.reduce((acc, curr) => acc + (curr.viewCount || 0), 0);
  const totalDownloads = deliverables.reduce((acc, curr) => acc + (curr.downloadCount || 0), 0);

  // Clients directory map
  const clientEmailMap = new Map<string, { count: number; name?: string; phone?: string; lastDate?: string }>();
  deliverables.forEach((item) => {
    const e = item.clientEmail.toLowerCase();
    const existing = clientEmailMap.get(e);
    if (!existing) {
      clientEmailMap.set(e, { count: 1, name: item.clientName, phone: item.clientPhone, lastDate: item.createdAt });
    } else {
      existing.count += 1;
      if (!existing.name && item.clientName) existing.name = item.clientName;
      if (!existing.phone && item.clientPhone) existing.phone = item.clientPhone;
    }
  });

  const filteredDeliverables = deliverables.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clientName && item.clientName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (st: DeliverableItem['status']) => {
    switch (st) {
      case 'shooting':
        return {
          label: lang === 'ar' ? 'تصوير بالاستوديو' : 'Shooting',
          bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800',
        };
      case 'editing':
        return {
          label: lang === 'ar' ? 'مونتاج وتلوين' : 'Editing & Color',
          bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300 border-sky-300 dark:border-sky-800',
        };
      case 'review':
        return {
          label: lang === 'ar' ? 'جاهز للمعاينة' : 'Ready for Review',
          bg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300 dark:border-purple-800',
        };
      case 'delivered':
        return {
          label: lang === 'ar' ? 'تسليم نهائي 4K' : 'Delivered (4K Master)',
          bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
        };
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
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {lang === 'ar' ? 'لوحة تحكم استوديو KIN — نظام إدارة التسليمات والعملاء' : 'KIN Studio Executive Admin Suite'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#C82626] text-[10px] font-bold text-white uppercase tracking-wider">
                  Admin Pro
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                {lang === 'ar'
                  ? 'إدارة الروابط المحمية، إرسال إشعارات الواتساب، متابعة إحصائيات التحميل، ومراجعات العملاء'
                  : 'Manage encrypted links, send WhatsApp notifications, track downloads & client feedback'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenClientPortal}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10"
              title={lang === 'ar' ? 'معاينة شاشة العميل' : 'Preview Client View'}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'معاينة شاشة العميل' : 'Client View'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-white dark:bg-[#1a1716] border-b border-black/8 dark:border-white/10 shrink-0 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#C82626] text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'الداشبورد' : 'Dashboard'}</span>
            </button>

            <button
              onClick={() => setActiveTab('financials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'financials'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'ar' ? 'الحسابات (P&L)' : 'Financials (P&L)'}</span>
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'invoices'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'الفواتير وعروض الأسعار' : 'Invoices'}</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              <span>{lang === 'ar' ? 'جدول الحجوزات' : 'Studio Schedule'}</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'ar' ? 'اعتماد التقييمات' : 'Reviews CMS'}</span>
            </button>

            <button
              onClick={() => setActiveTab('pricing_cms')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'pricing_cms'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              <span>{lang === 'ar' ? 'الأسعار والعروض' : 'Pricing & Deals'}</span>
            </button>

            <button
              onClick={() => setActiveTab('gear')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'gear'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-purple-500" />
              <span>{lang === 'ar' ? 'عهدة المعدات' : 'Gear Inventory'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('list');
                resetForm();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-[#C82626] text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'المشاريع والتسليمات' : 'Deliverables'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/20 text-[10px]">
                {deliverables.length}
              </span>
            </button>

            <button
              onClick={() => {
                setActiveTab('add');
                if (editingId) resetForm();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-[#C82626] text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {editingId
                  ? lang === 'ar' ? 'تعديل المشروع' : 'Edit Project'
                  : lang === 'ar' ? 'إضافة رابط جديد' : 'New Link'}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('clients')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'clients'
                  ? 'bg-[#C82626] text-white shadow-sm'
                  : 'text-[#141211]/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{lang === 'ar' ? 'العملاء' : 'Clients'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-black/15 dark:bg-white/20 text-[10px]">
                {clientEmailMap.size}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('invoices')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 shadow transition-all cursor-pointer shrink-0"
            >
              <Receipt className="w-3.5 h-3.5 text-[#C82626]" />
              <span>{lang === 'ar' ? 'سجل الفواتير' : 'Invoices Hub'}</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs text-[#141211]/60 dark:text-white/60">
            <span className="flex items-center gap-1 font-mono">
              <Eye className="w-3.5 h-3.5 text-sky-500" />
              {totalViews} {lang === 'ar' ? 'مشاهدة' : 'views'}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              {totalDownloads} {lang === 'ar' ? 'تحميل' : 'downloads'}
            </span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {formSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
              <button
                onClick={() => setFormSuccess(null)}
                className="text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          )}

          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#141211]/60 dark:text-white/60">
                      {lang === 'ar' ? 'إجمالي المشاريع المسجلة' : 'Total Projects'}
                    </span>
                    <FolderGit2 className="w-4 h-4 text-[#C82626]" />
                  </div>
                  <p className="text-2xl font-black text-[#141211] dark:text-white font-mono">
                    {totalProjects}
                  </p>
                  <p className="text-[11px] text-[#141211]/50 dark:text-white/50">
                    {lang === 'ar' ? 'شاملة البودكاست والريلز' : 'Podcasts & Reels'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {lang === 'ar' ? 'قيد المونتاج والتلوين' : 'In Post-Production'}
                    </span>
                    <Video className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-2xl font-black text-[#141211] dark:text-white font-mono">
                    {inPostCount}
                  </p>
                  <p className="text-[11px] text-[#141211]/50 dark:text-white/50">
                    {lang === 'ar' ? 'جاري العمل في الاستوديو' : 'Active studio sessions'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {lang === 'ar' ? 'جاهز للمعاينة والمراجعة' : 'Awaiting Review'}
                    </span>
                    <Clock className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-[#141211] dark:text-white font-mono">
                    {inReviewCount}
                  </p>
                  <p className="text-[11px] text-[#141211]/50 dark:text-white/50">
                    {lang === 'ar' ? 'بانتظار موافقة العميل' : 'Client review pending'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {lang === 'ar' ? 'تم التسليم النهائي 4K' : 'Delivered Masters'}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-black text-[#141211] dark:text-white font-mono">
                    {deliveredCount}
                  </p>
                  <p className="text-[11px] text-[#141211]/50 dark:text-white/50">
                    {lang === 'ar' ? 'جاهزة للنشر بالكامل' : 'Complete 4K master'}
                  </p>
                </div>
              </div>

              {/* Engagement & Quick Actions Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Engagement Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#141211] to-[#201c1b] text-white border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C82626]" />
                      <span>{lang === 'ar' ? 'نشاط العملاء وتفاعل الروابط' : 'Client Access Insights'}</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 font-mono">
                      Live
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/70">{lang === 'ar' ? 'مرات فتح البوابة للمشاريع:' : 'Total Portal Visits:'}</span>
                      <span className="font-mono font-bold text-sky-400">{totalViews}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/70">{lang === 'ar' ? 'مرات النقر على روابط التحميل:' : 'Download Link Clicks:'}</span>
                      <span className="font-mono font-bold text-emerald-400">{totalDownloads}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-white/70">{lang === 'ar' ? 'العملاء المميزون المسجلون:' : 'Active Unique Clients:'}</span>
                      <span className="font-mono font-bold text-amber-400">{clientEmailMap.size}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('add');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إضافة وتخصيص رابط جديد الآن' : 'Create New Deliverable'}</span>
                  </button>
                </div>

                {/* Recent Deliverables Overview */}
                <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-[#141211] dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C82626]" />
                      <span>{lang === 'ar' ? 'أحدث المشاريع المسجلة' : 'Recent Deliverables'}</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab('list')}
                      className="text-xs font-bold text-[#C82626] hover:underline cursor-pointer"
                    >
                      {lang === 'ar' ? 'عرض الكل' : 'View All'}
                    </button>
                  </div>

                  {deliverables.length === 0 ? (
                    <p className="text-xs text-[#141211]/50 dark:text-white/50 py-8 text-center">
                      {lang === 'ar' ? 'لم يتم تسجيل أي مشروع حتى الآن.' : 'No projects registered yet.'}
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {deliverables.slice(0, 4).map((d) => (
                        <div
                          key={d.id}
                          className="p-3 rounded-xl bg-black/2 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[#141211] dark:text-white truncate">
                              {d.title}
                            </p>
                            <p className="text-[11px] font-mono text-[#C82626] truncate">
                              {d.clientEmail} {d.clientName ? `(${d.clientName})` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-mono">
                              {d.viewCount || 0} {lang === 'ar' ? 'مشاهدة' : 'views'}
                            </span>
                            <a
                              href={getWhatsAppDispatchUrl(d)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                              title={lang === 'ar' ? 'إرسال إشعار للعميل بالواتساب' : 'Dispatch WhatsApp Alert'}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE DELIVERABLES LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              {/* Search and Filters Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute start-3 top-3 text-[#141211]/50 dark:text-white/50" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'بحث بالعنوان أو إيميل العميل أو اسم الشركة...'
                        : 'Search by title, client email, or company...'
                    }
                    className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a1716] text-xs text-[#141211] dark:text-white focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1a1716] text-xs text-[#141211] dark:text-white focus:outline-none"
                  >
                    <option value="all">{lang === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                    <option value="shooting">{lang === 'ar' ? 'تصوير بالاستوديو' : 'Shooting'}</option>
                    <option value="editing">{lang === 'ar' ? 'مونتاج وتلوين' : 'Editing'}</option>
                    <option value="review">{lang === 'ar' ? 'جاهز للمعاينة' : 'Review'}</option>
                    <option value="delivered">{lang === 'ar' ? 'تم التسليم 4K' : 'Delivered'}</option>
                  </select>

                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('add');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] rounded-xl cursor-pointer shrink-0 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'ar' ? 'إضافة رابط' : 'Add Link'}</span>
                  </button>
                </div>
              </div>

              {loadingList ? (
                <div className="py-20 text-center text-xs text-[#141211]/60 dark:text-white/60">
                  {lang === 'ar' ? 'جاري تحميل المشاريع...' : 'Loading deliverables...'}
                </div>
              ) : filteredDeliverables.length === 0 ? (
                <div className="py-20 text-center space-y-3 rounded-2xl bg-white dark:bg-[#1a1716] border border-dashed border-black/10 dark:border-white/10">
                  <FolderGit2 className="w-12 h-12 mx-auto text-[#141211]/20 dark:text-white/20" />
                  <p className="text-sm font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'لا توجد مشاريع مطابقة للبحث' : 'No deliverables found'}
                  </p>
                  <p className="text-xs text-[#141211]/60 dark:text-white/60 max-w-sm mx-auto">
                    {lang === 'ar'
                      ? 'يمكنك إضافة مشروع جديد وربطه بإيميل العميل بضغطة زر.'
                      : 'Create a new project deliverable and assign it to a client email.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredDeliverables.map((item) => {
                    const statusInfo = getStatusBadge(item.status);
                    return (
                      <div
                        key={item.id}
                        className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all shadow-sm space-y-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-extrabold text-[#141211] dark:text-white">
                                {item.title}
                              </h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.bg}`}>
                                {statusInfo.label}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#141211]/70 dark:text-white/70 text-[10px] uppercase font-mono">
                                {item.serviceType}
                              </span>
                              {item.expiresAt && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono flex items-center gap-1 border border-amber-500/20">
                                  <Timer className="w-3 h-3" />
                                  {lang === 'ar' ? `الصلاحية حتى: ${item.expiresAt}` : `Expires: ${item.expiresAt}`}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-[#141211]/70 dark:text-white/70 flex-wrap pt-0.5">
                              <span className="flex items-center gap-1 font-mono text-[#C82626] font-semibold">
                                <Mail className="w-3.5 h-3.5" />
                                {item.clientEmail}
                              </span>
                              {item.clientName && (
                                <span className="flex items-center gap-1">
                                  <User className="w-3.5 h-3.5" />
                                  {item.clientName}
                                </span>
                              )}
                              {item.clientPhone && (
                                <span className="flex items-center gap-1 font-mono">
                                  <PhoneCall className="w-3.5 h-3.5 text-emerald-500" />
                                  {item.clientPhone}
                                </span>
                              )}
                              {item.recordingDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {item.recordingDate}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions Bar */}
                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            {/* WhatsApp Dispatch Button */}
                            <a
                              href={getWhatsAppDispatchUrl(item)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                              title={lang === 'ar' ? 'إرسال إشعار للعميل بالواتساب' : 'Dispatch WhatsApp Alert'}
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{lang === 'ar' ? 'إشعار واتساب' : 'WhatsApp'}</span>
                            </a>

                            {/* Video Preview Modal Trigger (if previewVideoUrl provided) */}
                            {item.previewVideoUrl && (
                              <button
                                onClick={() => setPreviewModalUrl(item.previewVideoUrl || null)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold transition-colors cursor-pointer"
                                title={lang === 'ar' ? 'مشاهدة الفيديو المدمج' : 'Preview Video'}
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span>{lang === 'ar' ? 'معاينة الفيديو' : 'Preview'}</span>
                              </button>
                            )}

                            {/* Copy Link */}
                            <button
                              onClick={() => handleCopyLink(item)}
                              className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#141211] dark:text-white transition-colors cursor-pointer text-xs"
                              title={lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Open Link */}
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#141211] dark:text-white transition-colors"
                              title={lang === 'ar' ? 'فتح الرابط في نافذة جديدة' : 'Open Link'}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Revisions & Feedback Button */}
                            <button
                              onClick={() => setSelectedDeliverableForRevisions(item)}
                              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer relative"
                              title={lang === 'ar' ? 'ملاحظات وتعديلات العميل' : 'Client Revisions'}
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#141211] dark:text-white transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'تعديل' : 'Edit'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteConfirmTarget({ id: item.id, title: item.title })}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title={lang === 'ar' ? 'حذف' : 'Delete'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Deliverable Link Box */}
                        <div className="p-3 rounded-xl bg-black/2 dark:bg-white/5 border border-black/5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 truncate min-w-0">
                            <LinkIcon className="w-3.5 h-3.5 text-[#C82626] shrink-0" />
                            <span className="font-mono text-[#141211]/80 dark:text-white/80 truncate">
                              {item.link}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-[#141211]/60 dark:text-white/60 shrink-0 font-mono">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-sky-500" />
                              {item.viewCount || 0} {lang === 'ar' ? 'مشاهدة' : 'views'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3 text-emerald-500" />
                              {item.downloadCount || 0} {lang === 'ar' ? 'تحميل' : 'downloads'}
                            </span>
                            {item.lastViewedAt && (
                              <span className="hidden md:inline">
                                {lang === 'ar' ? 'آخر دخول: ' : 'Last: '}
                                {new Date(item.lastViewedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        {item.notes && (
                          <p className="text-xs text-[#141211]/70 dark:text-white/70 bg-black/2 dark:bg-white/3 p-2.5 rounded-xl border border-black/5 dark:border-white/5">
                            <span className="font-bold">{lang === 'ar' ? 'ملاحظات الاستوديو الفنية: ' : 'Technical Notes: '}</span>
                            {item.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADD / EDIT DELIVERABLE LINK FORM */}
          {activeTab === 'add' && (
            <form onSubmit={handleSubmitDeliverable} className="max-w-2xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-bold">
                    {lang === 'ar' ? 'حماية مشددة بصلاحية مخصصة للإيميل المحدد' : 'Zero-Trust Client Access Protection'}
                  </p>
                  <p className="mt-0.5 text-[11px] opacity-90">
                    {lang === 'ar'
                      ? 'الرابط مبرمج ليكون مرئياً ومتاحاً فقط للشخص الذي يسجل دخوله بنفس البريد الإلكتروني الذي تدخله في هذه الخانة. لا يمكن لأي مستخدم آخر أو محرك بحث كشف أو استعلام هذا الملف.'
                      : 'This deliverable is mathematically protected by Firestore Security Rules. Only the user signed in with this exact client email can see or download it.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project Title */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-[#C82626]" />
                    <span>{lang === 'ar' ? 'عنوان المشروع / الحلقة *' : 'Project / Episode Title *'}</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'مثال: بودكاست رواد الأعمال - حلقة 5 (د. حسام)'
                        : 'e.g., The Leaders Podcast - Episode 05'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                {/* Target Client Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-[#C82626]" />
                    <span>{lang === 'ar' ? 'إيميل العميل المصرح له بالرؤية *' : 'Authorized Client Email *'}</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm font-mono focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                {/* Client Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#C82626]" />
                    <span>{lang === 'ar' ? 'اسم العميل / الشركة' : 'Client / Brand Name'}</span>
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder={lang === 'ar' ? 'مثال: د. حسام الشاذلي' : 'e.g., Dr. Hossam'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                {/* Client Phone for WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <PhoneCall className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'ar' ? 'رقم هاتف العميل (لإشعار الواتساب)' : 'Client WhatsApp Phone'}</span>
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="201280700319"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm font-mono focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                {/* Shoot Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#C82626]" />
                    <span>{lang === 'ar' ? 'تاريخ التصوير بالاستوديو' : 'Shooting Date'}</span>
                  </label>
                  <input
                    type="date"
                    value={recordingDate}
                    onChange={(e) => setRecordingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                {/* Primary Work Link */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-[#C82626]" />
                    <span>{lang === 'ar' ? 'رابط ملفات العمل والتسليمات *' : 'Master Deliverable Link (Drive, Frame.io) *'}</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/... or https://app.frame.io/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm font-mono focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                {/* Optional Embedded Video / Preview URL */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <Play className="w-4 h-4 text-sky-500" />
                    <span>{lang === 'ar' ? 'رابط فيديو المعاينة المباشر (اختياري - YouTube / Vimeo / MP4)' : 'Video Preview URL (Optional - MP4/YouTube/Vimeo)'}</span>
                  </label>
                  <input
                    type="url"
                    value={previewVideoUrl}
                    onChange={(e) => setPreviewVideoUrl(e.target.value)}
                    placeholder="https://youtu.be/... or https://vimeo.com/... or direct mp4"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm font-mono focus:outline-none focus:border-[#C82626]"
                  />
                </div>

                {/* Service Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'نوع باقة الإنتاج' : 'Production Package'}
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e: any) => setServiceType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                  >
                    <option value="podcast">{lang === 'ar' ? 'إنتاج بودكاست (Podcast)' : 'Podcast Production'}</option>
                    <option value="reels">{lang === 'ar' ? 'باقة ريلز سوشيال شهري (Social Reels)' : 'Social Reels'}</option>
                    <option value="commercial">{lang === 'ar' ? 'إعلان تجاري وسينمائي (Commercial)' : 'Commercial Film'}</option>
                    <option value="other">{lang === 'ar' ? 'خدمة إنتاج مخصصة (Custom)' : 'Custom Production'}</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'مرحلة الشغل الحالية' : 'Current Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                  >
                    <option value="shooting">{lang === 'ar' ? 'جاري التصوير بالاستوديو' : 'Shooting in Studio'}</option>
                    <option value="editing">{lang === 'ar' ? 'جاري المونتاج وتلوين السينما وهندسة الصوت' : 'Editing & Audio Mastering'}</option>
                    <option value="review">{lang === 'ar' ? 'جاهز للمعاينة والمراجعات' : 'Ready for Client Review'}</option>
                    <option value="delivered">{lang === 'ar' ? 'تم التسليم النهائي المعتمد 4K' : 'Delivered (Final 4K)'}</option>
                  </select>
                </div>

                {/* Expiry Window */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white flex items-center gap-1.5">
                    <Timer className="w-4 h-4 text-amber-500" />
                    <span>{lang === 'ar' ? 'مهلة صلاحية تحميل الرابط للعميل' : 'Download Link Validity Window'}</span>
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e: any) => setExpiresInDays(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                  >
                    <option value="30">{lang === 'ar' ? 'متاح للتحميل لمدة 30 يوماً (الافتراضي)' : '30 Days (Recommended)'}</option>
                    <option value="14">{lang === 'ar' ? 'متاح للتحميل لمدة 14 يوماً' : '14 Days'}</option>
                    <option value="60">{lang === 'ar' ? 'متاح للتحميل لمدة 60 يوماً' : '60 Days'}</option>
                    <option value="none">{lang === 'ar' ? 'بدون تاريخ انتهاء (صلاحية مفتوحة)' : 'No Expiry (Permanent)'}</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'ملاحظات الاستوديو الفنية وتعليمات التحميل للعميل' : 'Studio Technical Notes & Download Instructions'}
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      lang === 'ar'
                        ? 'مثال: تم التصدير بدقة 4K ProRes + H.264 للإنستجرام واليوتيوب. كاميرات Sony FX6 + مايكات Shure SM7B.'
                        : 'e.g., Exported in 4K ProRes + H.264. Sony FX6 multi-cam with Shure SM7B broadcast chain.'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/15 dark:border-white/15 bg-white dark:bg-[#1a1716] text-[#141211] dark:text-white text-sm focus:outline-none focus:border-[#C82626]"
                  />
                </div>
              </div>

              {/* Form buttons */}
              <div className="pt-3 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-6 text-sm font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] active:scale-[0.98] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? lang === 'ar' ? 'جاري الحفظ والتسجيل...' : 'Saving...'
                    : editingId
                    ? lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'
                    : lang === 'ar' ? 'نشر وربط الرابط بإيميل العميل' : 'Publish & Assign Link'}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="py-3.5 px-6 text-sm font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 rounded-xl cursor-pointer"
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 4: CLIENTS DIRECTORY */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-[#141211] dark:text-white">
                    {lang === 'ar' ? 'سجل العملاء وإيميلات الوصول' : 'Registered Clients Directory'}
                  </h4>
                  <p className="text-xs text-[#141211]/60 dark:text-white/60">
                    {lang === 'ar'
                      ? 'يمكنك من هنا معرفة عدد المشاريع المخصصة لكل عميل ومراسلته فوراً.'
                      : 'Overview of all client emails and projects assigned.'}
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab('add');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#C82626] hover:bg-[#a51e1e] rounded-xl cursor-pointer shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'ربط مشروع لعميل جديد' : 'Assign New Client'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from(clientEmailMap.entries()).map(([email, data]) => (
                  <div
                    key={email}
                    className="p-5 rounded-2xl bg-white dark:bg-[#1a1716] border border-black/10 dark:border-white/10 space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#141211] dark:text-white truncate">
                          {data.name || email.split('@')[0]}
                        </p>
                        <p className="text-xs font-mono text-[#C82626] truncate">
                          {email}
                        </p>
                        {data.phone && (
                          <p className="text-[11px] font-mono text-[#141211]/60 dark:text-white/60 mt-0.5">
                            {data.phone}
                          </p>
                        )}
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#C82626]/10 text-[#C82626] text-xs font-bold font-mono shrink-0">
                        {data.count} {lang === 'ar' ? 'مشاريع' : 'links'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => {
                          setClientEmail(email);
                          setClientName(data.name || '');
                          setClientPhone(data.phone || '');
                          setActiveTab('add');
                        }}
                        className="flex-1 py-2 px-3 text-xs font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C82626]" />
                        <span>{lang === 'ar' ? 'مشروع جديد' : 'New Link'}</span>
                      </button>

                      {data.phone && (
                        <a
                          href={`https://wa.me/${data.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                          title={lang === 'ar' ? 'مراسلة واتساب' : 'WhatsApp'}
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: INVOICES & QUOTATIONS DASHBOARD */}
          {activeTab === 'invoices' && <AdminInvoicesTab lang={lang} />}

          {/* TAB 6: REVIEWS MODERATION */}
          {activeTab === 'reviews' && <AdminReviewsTab lang={lang} />}

          {/* TAB 6: DYNAMIC PRICING & PROMOTIONS CMS */}
          {activeTab === 'pricing_cms' && <AdminPricingCmsTab lang={lang} />}

          {/* TAB 7: FINANCIALS & P&L DASHBOARD */}
          {activeTab === 'financials' && <AdminFinancialsTab lang={lang} />}

          {/* TAB 8: STUDIO CALENDAR & BOOKINGS */}
          {activeTab === 'calendar' && <AdminCalendarTab lang={lang} />}

          {/* TAB 9: GEAR & EQUIPMENT INVENTORY */}
          {activeTab === 'gear' && <AdminGearTab lang={lang} />}
        </div>

        {/* Client Revisions Side Drawer */}
        {selectedDeliverableForRevisions && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-end animate-fade-in">
            <div className="w-full max-w-lg h-full bg-white dark:bg-[#1a1716] p-6 flex flex-col justify-between shadow-2xl border-s border-black/10 dark:border-white/10">
              <div className="space-y-4 flex-1 overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#C82626]" />
                    <h4 className="text-sm font-bold text-[#141211] dark:text-white">
                      {lang === 'ar' ? 'مركز ملاحظات وتعديلات العميل' : 'Client Revisions & Feedback Hub'}
                    </h4>
                  </div>
                  <button
                    onClick={() => setSelectedDeliverableForRevisions(null)}
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-4 h-4 text-[#141211] dark:text-white" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-black/3 dark:bg-white/5 text-xs space-y-1">
                  <p className="font-bold text-[#141211] dark:text-white">
                    {selectedDeliverableForRevisions.title}
                  </p>
                  <p className="text-[#C82626] font-mono text-[11px]">
                    {selectedDeliverableForRevisions.clientEmail}
                  </p>
                </div>

                {/* Revisions List */}
                <div className="space-y-3">
                  {activeRevisions.length === 0 ? (
                    <p className="text-xs text-[#141211]/50 dark:text-white/50 text-center py-12">
                      {lang === 'ar' ? 'لم يقم العميل بإرسال أي ملاحظات بعد.' : 'No feedback submitted by client yet.'}
                    </p>
                  ) : (
                    activeRevisions.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl bg-black/3 dark:bg-white/5 border border-black/8 dark:border-white/10 space-y-2.5 text-xs"
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

                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rev.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : rev.status === 'in_progress'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                          }`}>
                            {rev.status === 'resolved'
                              ? (lang === 'ar' ? 'تم التنفيذ والاعتماد ✓' : 'Resolved')
                              : rev.status === 'in_progress'
                              ? (lang === 'ar' ? 'جاري التعديل' : 'In Progress')
                              : (lang === 'ar' ? 'قيد المراجعة' : 'Pending')}
                          </span>
                        </div>

                        <p className="text-xs text-[#141211] dark:text-white leading-relaxed font-medium">
                          {rev.comment}
                        </p>

                        {rev.adminReply && (
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[11px]">
                            <span className="font-bold">{lang === 'ar' ? 'رد الاستوديو: ' : 'Studio Reply: '}</span>
                            {rev.adminReply}
                          </div>
                        )}

                        {/* Admin Action Bar */}
                        <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder={lang === 'ar' ? 'اكتب رداً للعميل...' : 'Reply to client...'}
                            value={replyTextMap[rev.id] || ''}
                            onChange={(e) =>
                              setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })
                            }
                            className="flex-1 px-2.5 py-1 text-[11px] rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#141211]"
                          />
                          <button
                            onClick={() => handleUpdateRevStatus(rev.id, 'resolved')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            {lang === 'ar' ? 'تم ✓' : 'Done'}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedDeliverableForRevisions(null)}
                className="w-full mt-4 py-2.5 text-xs font-bold text-[#141211] dark:text-white bg-black/5 dark:bg-white/10 hover:bg-black/10 rounded-xl cursor-pointer"
              >
                {lang === 'ar' ? 'إغلاق الملاحظات' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {previewModalUrl && (
          <div
            className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setPreviewModalUrl(null)}
          >
            <div
              className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-[#141211] flex items-center justify-between text-white border-b border-white/10">
                <span className="text-xs font-bold flex items-center gap-2">
                  <Play className="w-4 h-4 text-[#C82626]" />
                  <span>{lang === 'ar' ? 'مشغل معاينة فيديو المشروع' : 'Video Preview Player'}</span>
                </span>
                <button
                  onClick={() => setPreviewModalUrl(null)}
                  className="p-1 rounded-full hover:bg-white/20 cursor-pointer"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="aspect-video w-full bg-black flex items-center justify-center">
                {previewModalUrl.includes('youtube.com') || previewModalUrl.includes('youtu.be') ? (
                  <iframe
                    src={previewModalUrl.replace('watch?v=', 'embed/')}
                    title="Video preview"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={previewModalUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* In-app Delete Confirmation Dialog (Canva & Iframe safe) */}
        {deleteConfirmTarget && (
          <div
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
            onClick={() => !isDeleting && setDeleteConfirmTarget(null)}
          >
            <div
              className="bg-white dark:bg-[#1a1716] max-w-md w-full rounded-2xl p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h4 className="text-base font-bold text-[#141211] dark:text-white">
                  {lang === 'ar' ? 'تأكيد حذف المشروع نهائياً' : 'Confirm Permanent Deletion'}
                </h4>
                <p className="text-xs text-[#141211]/70 dark:text-white/70 leading-relaxed">
                  {lang === 'ar'
                    ? `هل أنت متأكد من حذف مشروع "${deleteConfirmTarget.title}"؟ سيتم حذف الرابط ولن يتمكن العميل من الوصول إليه بعد الآن.`
                    : `Are you sure you want to delete "${deleteConfirmTarget.title}"?`}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isDeleting
                    ? lang === 'ar' ? 'جاري الحذف من قاعدة البيانات...' : 'Deleting...'
                    : lang === 'ar' ? 'نعم، احذف نهائياً' : 'Yes, Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 px-4 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[#141211] dark:text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoice & Quotation Generator Modal */}
        <InvoiceGeneratorModal
          isOpen={isInvoiceModalOpen}
          lang={lang}
          onClose={() => setIsInvoiceModalOpen(false)}
        />
      </div>
    </div>
  );
};
