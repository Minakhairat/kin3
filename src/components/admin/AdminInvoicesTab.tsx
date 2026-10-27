import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Printer,
  Share2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  DollarSign,
  TrendingUp,
  X,
  Receipt
} from 'lucide-react';
import { Language, InvoiceItem } from '../../types';
import { COMPANY_INFO } from '../../data/content';
import {
  subscribeInvoices,
  saveInvoice,
  deleteInvoice,
} from '../../services/invoicesService';

interface AdminInvoicesTabProps {
  lang: Language;
}

const INITIAL_SEED_INVOICES: InvoiceItem[] = [
  {
    id: 'inv_kin_1001',
    invoiceNumber: 'KIN-2026-1001',
    issueDate: '2026-10-15',
    dueDate: '2026-10-25',
    clientName: 'د. حسام الشاذلي',
    clientEmail: 'hossam@alshazly-group.com',
    clientPhone: '01012345678',
    serviceTitle: 'باقة تصوير بودكاست رواد الأعمال (Double Day - 4 حلقات)',
    subtotal: 24000,
    discountPercent: 10,
    discountAmount: 2400,
    taxPercent: 0,
    taxAmount: 0,
    total: 21600,
    paidAmount: 21600,
    balanceDue: 0,
    paymentStatus: 'paid',
    paymentMethod: 'InstaPay',
    notes: 'تم استلام الدفعة بالكامل عبر إنستاباي. تم تسليم الحلقات بدقة 4K.',
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'inv_kin_1002',
    invoiceNumber: 'KIN-2026-1002',
    issueDate: '2026-10-20',
    dueDate: '2026-11-05',
    clientName: 'مؤسسة Bloom Skincare',
    clientEmail: 'marketing@bloomskin.com',
    clientPhone: '01223456789',
    serviceTitle: 'إنتاج باقة ريلز شهرية Pro (16 ريلز احترافية مع مونتاج)',
    subtotal: 15000,
    discountPercent: 0,
    discountAmount: 0,
    total: 15000,
    paidAmount: 7500,
    balanceDue: 7500,
    paymentStatus: 'partial',
    paymentMethod: 'Bank Transfer',
    notes: 'تم دفع العربون 50%، المتبقي عند تسليم النسخ النهائية.',
    createdAt: '2026-10-20T14:30:00.000Z',
    updatedAt: '2026-10-20T14:30:00.000Z',
  },
  {
    id: 'inv_kin_1003',
    invoiceNumber: 'KIN-2026-1003',
    issueDate: '2026-10-24',
    dueDate: '2026-11-01',
    clientName: 'أحمد السعدني',
    clientEmail: 'ahmed@saadany.me',
    clientPhone: '01198765432',
    serviceTitle: 'جلسة تصوير إعلان تجاري سينمائي (كاميرات FX3 + إضاءة كاملة)',
    subtotal: 35000,
    discountPercent: 5,
    discountAmount: 1750,
    total: 33250,
    paidAmount: 0,
    balanceDue: 33250,
    paymentStatus: 'unpaid',
    paymentMethod: 'Vodafone Cash',
    notes: 'عرض سعر معتمد - بانتظار تأكيد ميعاد التصوير وسداد العربون.',
    createdAt: '2026-10-24T09:15:00.000Z',
    updatedAt: '2026-10-24T09:15:00.000Z',
  },
];

export const AdminInvoicesTab: React.FC<AdminInvoicesTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  const [invoices, setInvoices] = useState<InvoiceItem[]>(INITIAL_SEED_INVOICES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'partial' | 'unpaid'>('all');

  // Manual Invoice Editor Modal
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [serviceTitle, setServiceTitle] = useState('جلسة تصوير وإنتاج بودكاست (استوديو الكوربة)');
  const [subtotal, setSubtotal] = useState<number>(15000);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'partial' | 'unpaid'>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState('InstaPay');
  const [notes, setNotes] = useState('شاملة التصوير بـ 3 كاميرات FX3، مهندس صوت، وتلوين سينمائي.');

  // Print/Preview Modal
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceItem | null>(null);

  const [notification, setNotification] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const hasSeededRef = useRef(false);

  useEffect(() => {
    const unsub = subscribeInvoices(
      (items) => {
        if (items && items.length > 0) {
          setInvoices(items);
        } else {
          setInvoices(INITIAL_SEED_INVOICES);
          if (!hasSeededRef.current) {
            hasSeededRef.current = true;
            (async () => {
              try {
                for (const inv of INITIAL_SEED_INVOICES) {
                  await saveInvoice(inv);
                }
              } catch (err) {
                console.warn('Invoices initial seed notice:', err);
              }
            })();
          }
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Invoices listener notice:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Calculated values in editor
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((afterDiscount * taxPercent) / 100);
  const currentTotal = afterDiscount + taxAmount;
  const currentBalance = Math.max(0, currentTotal - paidAmount);

  const handleOpenNewInvoice = () => {
    setEditingId(null);
    setInvoiceNumber(`KIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setIssueDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setDate(d.getDate() + 14);
    setDueDate(d.toISOString().split('T')[0]);
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setServiceTitle('جلسة تصوير وإنتاج بودكاست (استوديو الكوربة)');
    setSubtotal(15000);
    setDiscountPercent(0);
    setTaxPercent(0);
    setPaidAmount(0);
    setPaymentStatus('unpaid');
    setPaymentMethod('InstaPay');
    setNotes('شاملة التصوير بـ 3 كاميرات FX3، مهندس صوت، وتلوين سينمائي في استوديو كين بالكوربة.');
    setShowEditor(true);
  };

  const handleOpenEdit = (inv: InvoiceItem) => {
    setEditingId(inv.id);
    setInvoiceNumber(inv.invoiceNumber);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate || '');
    setClientName(inv.clientName);
    setClientEmail(inv.clientEmail || '');
    setClientPhone(inv.clientPhone || '');
    setServiceTitle(inv.serviceTitle);
    setSubtotal(inv.subtotal);
    setDiscountPercent(inv.discountPercent || 0);
    setTaxPercent(inv.taxPercent || 0);
    setPaidAmount(inv.paidAmount);
    setPaymentStatus(inv.paymentStatus);
    setPaymentMethod(inv.paymentMethod || 'InstaPay');
    setNotes(inv.notes || '');
    setShowEditor(true);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || subtotal <= 0) return;

    setIsSaving(true);
    try {
      const discAmt = Math.round((subtotal * discountPercent) / 100);
      const net = Math.max(0, subtotal - discAmt);
      const txAmt = Math.round((net * taxPercent) / 100);
      const tot = net + txAmt;
      const bal = Math.max(0, tot - paidAmount);

      let computedStatus: 'paid' | 'partial' | 'unpaid' = paymentStatus;
      if (paidAmount >= tot && tot > 0) {
        computedStatus = 'paid';
      } else if (paidAmount > 0 && paidAmount < tot) {
        computedStatus = 'partial';
      } else if (paidAmount === 0) {
        computedStatus = 'unpaid';
      }

      const payload: InvoiceItem = {
        id: editingId || `inv_${Date.now()}`,
        invoiceNumber: invoiceNumber.trim() || `KIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        issueDate,
        dueDate: dueDate || undefined,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        serviceTitle: serviceTitle.trim(),
        subtotal: Number(subtotal),
        discountPercent: Number(discountPercent),
        discountAmount: discAmt,
        taxPercent: Number(taxPercent),
        taxAmount: txAmt,
        total: tot,
        paidAmount: Number(paidAmount),
        balanceDue: bal,
        paymentStatus: computedStatus,
        paymentMethod,
        notes: notes.trim() || undefined,
        createdAt: editingId ? (invoices.find((i) => i.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveInvoice(payload);
      setShowEditor(false);
      showNotification(isAr ? 'تم حفظ الفاتورة بنجاح في قاعدة البيانات!' : 'Invoice saved successfully!');
    } catch (err: unknown) {
      console.error(err);
      showNotification(isAr ? 'حدث خطأ أثناء حفظ الفاتورة' : 'Failed to save invoice');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, invNum: string) => {
    if (!window.confirm(isAr ? `هل أنت متأكد من حذف فاتورة "${invNum}" نهائياً؟` : `Delete invoice ${invNum}?`)) return;
    try {
      await deleteInvoice(id);
      setInvoices((prev) => prev.filter((i) => i.id !== id));
      showNotification(isAr ? 'تم حذف الفاتورة' : 'Invoice deleted');
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleShareWhatsApp = (inv: InvoiceItem) => {
    const text = isAr
      ? `مرحباً ${inv.clientName}،\nتفاصيل فاتورة / عرض سعر من استوديو KIN Media Production (الكوربة):\n- رقم الفاتورة: #${inv.invoiceNumber}\n- الخدمة: ${inv.serviceTitle}\n- الإجمالي: ${inv.total.toLocaleString()} ج.م\n- المدفوع: ${inv.paidAmount.toLocaleString()} ج.م\n- المتبقي المستحق: ${inv.balanceDue.toLocaleString()} ج.م\n- طريقة السداد: ${inv.paymentMethod || 'InstaPay'}\nللتواصل والاستفسار: ${COMPANY_INFO.phones[0]}`
      : `Hello ${inv.clientName},\nInvoice from KIN Media Production:\nInvoice #: ${inv.invoiceNumber}\nService: ${inv.serviceTitle}\nTotal: EGP ${inv.total.toLocaleString()}\nPaid: EGP ${inv.paidAmount.toLocaleString()}\nBalance Due: EGP ${inv.balanceDue.toLocaleString()}`;

    const clean = (inv.clientPhone || '').replace(/\D/g, '');
    const url = clean
      ? `https://wa.me/${clean}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const filtered = invoices.filter((inv) => {
    const matchesFilter = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.clientName.toLowerCase().includes(q) ||
      (inv.clientPhone && inv.clientPhone.includes(q)) ||
      inv.serviceTitle.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // KPI Calculations
  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
  const totalCollected = invoices.reduce((sum, i) => sum + (i.paidAmount || 0), 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + (i.balanceDue || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 font-brand">
            <Receipt className="w-5 h-5 text-[#C82626]" />
            <span>{isAr ? 'سجل وإدارة فواتير وعروض أسعار العملاء' : 'Invoices & Quotations Dashboard'}</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isAr
              ? 'عرض كافة الفواتير السابقة للعملاء، التعديل اليدوي على أي فاتورة، الطباعة، والإرسال عبر واتساب.'
              : 'Complete invoices history with manual editing, PDF printing, and WhatsApp delivery.'}
          </p>
        </div>

        <button
          onClick={handleOpenNewInvoice}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'إنشاء فاتورة جديدة يدوياً' : 'Create New Invoice'}</span>
        </button>
      </div>

      {notification && (
        <div className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-[11px] font-bold text-neutral-500">{isAr ? 'إجمالي الفواتير الصادرة' : 'Total Invoiced'}</span>
          <div className="text-xl font-black text-neutral-900 dark:text-white font-mono mt-1">
            {totalInvoiced.toLocaleString()} <span className="text-xs font-normal">{isAr ? 'ج.م' : 'EGP'}</span>
          </div>
          <span className="text-[10px] text-neutral-400">{invoices.length} {isAr ? 'فاتورة مسجلة' : 'invoices'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-[11px] font-bold text-green-600">{isAr ? 'المبالغ المحصلة فعلياً' : 'Total Collected'}</span>
          <div className="text-xl font-black text-green-600 font-mono mt-1">
            {totalCollected.toLocaleString()} <span className="text-xs font-normal">{isAr ? 'ج.م' : 'EGP'}</span>
          </div>
          <span className="text-[10px] text-neutral-400">{isAr ? 'مدفوعة بالكامل أو جزئياً' : 'Paid amount'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600">{isAr ? 'المستحق المتبقي (المديونيات)' : 'Outstanding Receivables'}</span>
          <div className="text-xl font-black text-amber-600 font-mono mt-1">
            {totalOutstanding.toLocaleString()} <span className="text-xs font-normal">{isAr ? 'ج.م' : 'EGP'}</span>
          </div>
          <span className="text-[10px] text-neutral-400">{isAr ? 'بانتظار التحصيل' : 'Pending balance'}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <span className="text-[11px] font-bold text-purple-600">{isAr ? 'نسبة التحصيل' : 'Collection Rate'}</span>
          <div className="text-xl font-black text-purple-600 font-mono mt-1">
            {totalInvoiced > 0 ? `${Math.round((totalCollected / totalInvoiced) * 100)}%` : '0%'}
          </div>
          <span className="text-[10px] text-neutral-400">{isAr ? 'كفاءة التدفق النقدي' : 'Cash flow rate'}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isAr ? 'بحث برقم الفاتورة، اسم العميل، رقم الهاتف، أو نوع الخدمة...' : 'Search invoice, client, phone...'}
            className="w-full ps-10 pe-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#C82626]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'paid', label: isAr ? 'مدفوعة' : 'Paid' },
            { id: 'partial', label: isAr ? 'دفع جزئي' : 'Partial' },
            { id: 'unpaid', label: isAr ? 'غير مدفوعة' : 'Unpaid' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <table className="w-full text-start text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-800/60 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="p-3.5 text-start font-bold">{isAr ? 'رقم الفاتورة' : 'Invoice #'}</th>
              <th className="p-3.5 text-start font-bold">{isAr ? 'العميل' : 'Client'}</th>
              <th className="p-3.5 text-start font-bold">{isAr ? 'الخدمة / الباقة' : 'Service'}</th>
              <th className="p-3.5 text-start font-bold">{isAr ? 'الإجمالي' : 'Total'}</th>
              <th className="p-3.5 text-start font-bold">{isAr ? 'المدفوع' : 'Paid'}</th>
              <th className="p-3.5 text-start font-bold">{isAr ? 'المتبقي' : 'Balance'}</th>
              <th className="p-3.5 text-start font-bold">{isAr ? 'الحالة' : 'Status'}</th>
              <th className="p-3.5 text-end font-bold">{isAr ? 'إجراءات' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {filtered.map((inv) => (
              <tr key={inv.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/40 transition-colors">
                <td className="p-3.5 font-mono font-bold text-neutral-900 dark:text-white">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C82626]" />
                    <span>#{inv.invoiceNumber}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block font-sans">{inv.issueDate}</span>
                </td>

                <td className="p-3.5 font-medium text-neutral-900 dark:text-white">
                  <div>{inv.clientName}</div>
                  {inv.clientPhone && (
                    <span className="text-[11px] font-mono text-neutral-400 block">{inv.clientPhone}</span>
                  )}
                </td>

                <td className="p-3.5 max-w-xs text-neutral-600 dark:text-neutral-300 truncate" title={inv.serviceTitle}>
                  {inv.serviceTitle}
                </td>

                <td className="p-3.5 font-bold font-mono text-neutral-900 dark:text-white">
                  {inv.total.toLocaleString()} ج.م
                </td>

                <td className="p-3.5 font-bold font-mono text-green-600">
                  {inv.paidAmount.toLocaleString()} ج.م
                </td>

                <td className="p-3.5 font-bold font-mono text-amber-600">
                  {inv.balanceDue.toLocaleString()} ج.م
                </td>

                <td className="p-3.5">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      inv.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : inv.paymentStatus === 'partial'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {inv.paymentStatus === 'paid'
                      ? (isAr ? 'مدفوعة بالكامل' : 'Paid')
                      : inv.paymentStatus === 'partial'
                      ? (isAr ? 'دفع جزئي' : 'Partial')
                      : (isAr ? 'غير مدفوعة' : 'Unpaid')}
                  </span>
                </td>

                <td className="p-3.5 text-end">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(inv)}
                      title={isAr ? 'تعديل الفاتورة يدوي' : 'Edit Manually'}
                      className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setPreviewInvoice(inv)}
                      title={isAr ? 'معاينة وطباعة الفاتورة' : 'Print / Preview'}
                      className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleShareWhatsApp(inv)}
                      title={isAr ? 'إرسال تفاصيل الفاتورة عبر واتساب' : 'WhatsApp'}
                      className="p-1.5 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                      title={isAr ? 'حذف الفاتورة' : 'Delete'}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MANUAL INVOICE EDITOR MODAL */}
      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <form
            onSubmit={handleSaveInvoice}
            className="bg-white dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl my-8 text-neutral-900 dark:text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <h4 className="font-bold text-base font-brand flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#C82626]" />
                <span>
                  {editingId
                    ? (isAr ? `تعديل يدوي للفاتورة #${invoiceNumber}` : `Edit Invoice #${invoiceNumber}`)
                    : (isAr ? 'إنشاء فاتورة / عرض سعر جديد يدوياً' : 'Create New Invoice Manually')}
                </span>
              </h4>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isAr ? 'رقم الفاتورة *' : 'Invoice Number *'}</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تاريخ الإصدار:' : 'Issue Date:'}</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تاريخ الاستحقاق:' : 'Due Date:'}</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'اسم العميل / الشركة *' : 'Client Name *'}</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder={isAr ? 'د. حسام الشاذلي' : 'Client Name'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'رقم الهاتف (واتساب):' : 'Phone / WhatsApp:'}</label>
                <input
                  type="text"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'البريد الإلكتروني:' : 'Email:'}</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold mb-1">{isAr ? 'بيان الخدمة / مخرجات الجلسة *' : 'Service Description *'}</label>
                <input
                  type="text"
                  required
                  value={serviceTitle}
                  onChange={(e) => setServiceTitle(e.target.value)}
                  placeholder={isAr ? 'جلسة تصوير بودكاست 4 حلقات + 8 ريلز' : 'Podcast production session'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'المبلغ الإجمالي المبدئي (ج.م) *' : 'Subtotal (EGP) *'}</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={subtotal}
                  onChange={(e) => setSubtotal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'نسبة الخصم (%):' : 'Discount (%):'}</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'ضريبة القيمة المضافة (%):' : 'Tax / VAT (%):'}</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'المبلغ المدفوع / العربون (ج.م):' : 'Paid / Deposit (EGP):'}</label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono text-sm font-bold text-green-600"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'حالة السداد:' : 'Payment Status:'}</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="unpaid">{isAr ? 'غير مدفوعة (Unpaid)' : 'Unpaid'}</option>
                  <option value="partial">{isAr ? 'دفع جزئي / عربون' : 'Partial'}</option>
                  <option value="paid">{isAr ? 'مدفوعة بالكامل (Paid)' : 'Paid'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="InstaPay">InstaPay</option>
                  <option value="Vodafone Cash">Vodafone Cash</option>
                  <option value="Bank Transfer">{isAr ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                  <option value="Cash">{isAr ? 'نقداً بالاستوديو' : 'Cash'}</option>
                  <option value="Card">{isAr ? 'فيزا / بطاقة' : 'Card'}</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block font-bold mb-1">{isAr ? 'ملاحظات وشروط الفاتورة:' : 'Invoice Terms & Notes:'}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>
            </div>

            {/* Live Calculation Summary Banner */}
            <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div>
                <span className="text-neutral-500 font-sans block">{isAr ? 'الإجمالي الصافي:' : 'Net Total:'}</span>
                <span className="text-base font-bold text-neutral-900 dark:text-white">
                  {currentTotal.toLocaleString()} ج.م
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-sans block">{isAr ? 'المدفوع:' : 'Paid:'}</span>
                <span className="text-base font-bold text-green-600">
                  {paidAmount.toLocaleString()} ج.م
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-sans block">{isAr ? 'المتبقي المستحق:' : 'Balance Due:'}</span>
                <span className="text-base font-bold text-[#C82626]">
                  {currentBalance.toLocaleString()} ج.م
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                className="px-4 py-2 rounded-xl text-neutral-500 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الفاتورة في السجل' : 'Save Invoice')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT / PREVIEW MODAL */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#181615] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-neutral-900 dark:text-white print:p-0 print:border-none print:shadow-none">
            
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#C82626]" />
                <h4 className="font-bold text-base font-brand">
                  {isAr ? 'معاينة وطباعة الفاتورة' : 'Invoice Preview'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold transition-opacity cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isAr ? 'طباعة / تصدير' : 'Print'}</span>
                </button>

                <button
                  onClick={() => handleShareWhatsApp(previewInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
                </button>

                <button
                  onClick={() => setPreviewInvoice(null)}
                  className="p-1 rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-2xl font-black tracking-tight text-[#C82626] font-brand">
                    KIN MEDIA PRODUCTION
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    Keep It Neat • Korba, Heliopolis, Cairo
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {COMPANY_INFO.phones[0]} • contact@kin-media-production.com
                  </div>
                </div>

                <div className="text-end">
                  <span className="inline-block px-2.5 py-1 rounded bg-[#C82626]/10 text-[#C82626] text-xs font-bold uppercase mb-1">
                    {isAr ? 'فاتورة ضريبية / عرض سعر' : 'INVOICE'}
                  </span>
                  <div className="font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    #{previewInvoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-neutral-400 mt-0.5">
                    {previewInvoice.issueDate}
                  </div>
                </div>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-xs">
                <div>
                  <div className="font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    {isAr ? 'فاتورة إلى:' : 'Billed To:'}
                  </div>
                  <div className="font-bold text-sm text-neutral-900 dark:text-white">{previewInvoice.clientName}</div>
                  {previewInvoice.clientPhone && <div className="font-mono text-neutral-500">{previewInvoice.clientPhone}</div>}
                  {previewInvoice.clientEmail && <div className="font-mono text-neutral-500">{previewInvoice.clientEmail}</div>}
                </div>

                <div className="text-end">
                  <div className="font-bold text-neutral-400 uppercase tracking-wider mb-1">
                    {isAr ? 'حالة السداد:' : 'Payment Status:'}
                  </div>
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                      previewInvoice.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : previewInvoice.paymentStatus === 'partial'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}
                  >
                    {previewInvoice.paymentStatus === 'paid'
                      ? (isAr ? 'مدفوعة بالكامل' : 'Paid')
                      : previewInvoice.paymentStatus === 'partial'
                      ? (isAr ? 'سداد جزئي' : 'Partial')
                      : (isAr ? 'غير مدفوعة' : 'Unpaid')}
                  </span>
                  <div className="text-xs text-neutral-500 mt-1 font-mono">
                    {previewInvoice.paymentMethod || 'InstaPay'}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden text-xs">
                <table className="w-full text-start">
                  <thead className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500">
                    <tr>
                      <th className="p-3 text-start font-bold">{isAr ? 'بيان الخدمة والمعدات' : 'Service & Scope'}</th>
                      <th className="p-3 text-end font-bold">{isAr ? 'المبلغ' : 'Amount'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3.5 font-medium">{previewInvoice.serviceTitle}</td>
                      <td className="p-3.5 text-end font-bold font-mono">{previewInvoice.subtotal.toLocaleString()} ج.م</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-2 border-t border-neutral-200 dark:border-neutral-800 pt-4 text-xs font-mono max-w-xs ms-auto">
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">{isAr ? 'المبلغ الإجمالي:' : 'Subtotal:'}</span>
                  <span>{previewInvoice.subtotal.toLocaleString()} ج.م</span>
                </div>

                {previewInvoice.discountPercent ? (
                  <div className="flex justify-between text-green-600">
                    <span className="font-sans">{isAr ? `الخصم (${previewInvoice.discountPercent}%):` : 'Discount:'}</span>
                    <span>-{(previewInvoice.discountAmount || 0).toLocaleString()} ج.م</span>
                  </div>
                ) : null}

                <div className="flex justify-between text-sm font-bold border-t border-neutral-200 dark:border-neutral-800 pt-2 text-[#C82626]">
                  <span className="font-sans">{isAr ? 'صافي الإجمالي المستحق:' : 'Total Due:'}</span>
                  <span>{previewInvoice.total.toLocaleString()} ج.م</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span className="font-sans">{isAr ? 'المدفوع / المحصل:' : 'Paid:'}</span>
                  <span>{previewInvoice.paidAmount.toLocaleString()} ج.م</span>
                </div>

                <div className="flex justify-between font-bold text-amber-600 border-t border-neutral-200 dark:border-neutral-800 pt-1">
                  <span className="font-sans">{isAr ? 'المتبقي:' : 'Balance Due:'}</span>
                  <span>{previewInvoice.balanceDue.toLocaleString()} ج.م</span>
                </div>
              </div>

              {previewInvoice.notes && (
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500">
                  <span className="font-bold text-neutral-700 dark:text-neutral-300 block mb-0.5">{isAr ? 'ملاحظات الاستوديو:' : 'Notes:'}</span>
                  {previewInvoice.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
