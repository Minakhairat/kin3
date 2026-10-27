import React, { useState } from 'react';
import { X, Printer, Share2, FileText, Check, DollarSign, Calendar, Phone, Mail, User } from 'lucide-react';
import { Language, InvoiceItem } from '../types';
import { COMPANY_INFO } from '../data/content';

interface InvoiceGeneratorModalProps {
  isOpen: boolean;
  lang: Language;
  initialData?: Partial<InvoiceItem>;
  onClose: () => void;
}

export const InvoiceGeneratorModal: React.FC<InvoiceGeneratorModalProps> = ({
  isOpen,
  lang,
  initialData,
  onClose,
}) => {
  const isAr = lang === 'ar';

  const [invoiceNumber, setInvoiceNumber] = useState(
    initialData?.invoiceNumber || `KIN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [issueDate, setIssueDate] = useState(initialData?.issueDate || new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || '');
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || '');
  const [serviceTitle, setServiceTitle] = useState(initialData?.serviceTitle || 'جلسة تصوير وإنتاج بودكاست');
  const [subtotal, setSubtotal] = useState(initialData?.subtotal || 8500);
  const [discountPercent, setDiscountPercent] = useState(initialData?.discountPercent || 0);
  const [paidAmount, setPaidAmount] = useState(initialData?.paidAmount || 3000);
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || 'InstaPay');
  const [notes, setNotes] = useState(initialData?.notes || 'شاملة 3 كاميرات 4K، مهندس صوت، وإضاءات سينمائية في استوديو الكوربة.');

  if (!isOpen) return null;

  const discountAmount = (subtotal * discountPercent) / 100;
  const total = Math.max(0, subtotal - discountAmount);
  const balanceDue = Math.max(0, total - paidAmount);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = isAr
      ? `مرحباً ${clientName}،\nفاتورة / عرض سعر من استوديو KIN Media Production (الكوربة):\nرقم الفاتورة: ${invoiceNumber}\nالخدمة: ${serviceTitle}\nالإجمالي: ${total.toLocaleString()} ج.م\nالمدفوع / العربون: ${paidAmount.toLocaleString()} ج.م\nالمتبقي: ${balanceDue.toLocaleString()} ج.م\nللاستفسار: ${COMPANY_INFO.phones[0]}`
      : `Hello ${clientName},\nInvoice from KIN Media Production (Korba):\nInvoice #: ${invoiceNumber}\nService: ${serviceTitle}\nTotal: EGP ${total.toLocaleString()}\nPaid: EGP ${paidAmount.toLocaleString()}\nBalance Due: EGP ${balanceDue.toLocaleString()}`;

    const cleanPhone = clientPhone.replace(/\D/g, '');
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#181615] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 my-8 text-neutral-900 dark:text-white print:p-0 print:border-none print:shadow-none">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-neutral-200 dark:border-neutral-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C82626]" />
            <h3 id="invoice-modal-title" className="font-bold text-base font-brand">
              {isAr ? 'فاتورة / عرض سعر رسمي KIN' : 'Official KIN Invoice / Quote'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isAr ? 'طباعة' : 'Print'}</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label={isAr ? 'إغلاق' : 'Close'}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="space-y-6">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-2xl font-black tracking-tight text-[#C82626] font-brand">
                KIN MEDIA PRODUCTION
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Keep It Neat • Korba, Heliopolis, Cairo
              </div>
              <div className="text-xs text-neutral-500 mt-0.5">
                {COMPANY_INFO.phones[0]} • contact@kin-media-production.com
              </div>
            </div>

            <div className="text-end">
              <span className="inline-block px-2.5 py-1 rounded bg-[#C82626]/10 text-[#C82626] text-xs font-bold tracking-wider uppercase mb-1">
                {isAr ? 'فاتورة ضريبية / عرض سعر' : 'INVOICE'}
              </span>
              <div className="font-mono text-sm font-bold text-neutral-700 dark:text-neutral-300">
                #{invoiceNumber}
              </div>
              <div className="text-xs text-neutral-400 mt-0.5">
                {issueDate}
              </div>
            </div>
          </div>

          {/* Client & Studio Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 text-xs">
            <div>
              <div className="font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {isAr ? 'بيانات العميل / السادة:' : 'Billed To:'}
              </div>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={isAr ? 'اسم العميل / الشركة' : 'Client / Company Name'}
                className="w-full font-bold text-sm bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#C82626] py-0.5 mb-1.5"
              />
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder={isAr ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#C82626] py-0.5 mb-1"
              />
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder={isAr ? 'البريد الإلكتروني' : 'Email Address'}
                className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#C82626] py-0.5"
              />
            </div>

            <div>
              <div className="font-bold text-neutral-400 uppercase tracking-wider mb-2">
                {isAr ? 'موقع الاستوديو والتنفيذ:' : 'Studio Location:'}
              </div>
              <div className="font-bold text-neutral-800 dark:text-neutral-200">
                استوديو كين للإنتاج الإعلامي
              </div>
              <div className="text-neutral-500 mt-1">
                {isAr ? COMPANY_INFO.address.ar : COMPANY_INFO.address.en}
              </div>
              <div className="text-neutral-500 mt-1">
                طريقة الدفع: <span className="font-bold text-neutral-700 dark:text-neutral-300">{paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase tracking-wider font-bold">
                  <th className="py-2.5 text-start">{isAr ? 'البيان / الخدمة' : 'Description / Item'}</th>
                  <th className="py-2.5 text-end">{isAr ? 'القيمة (ج.م)' : 'Amount (EGP)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                <tr>
                  <td className="py-3">
                    <input
                      type="text"
                      value={serviceTitle}
                      onChange={(e) => setServiceTitle(e.target.value)}
                      className="w-full font-bold text-sm bg-transparent focus:outline-none focus:underline"
                    />
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full text-xs text-neutral-500 dark:text-neutral-400 bg-transparent focus:outline-none mt-1 resize-none"
                    />
                  </td>
                  <td className="py-3 text-end font-bold text-sm">
                    <input
                      type="number"
                      value={subtotal}
                      onChange={(e) => setSubtotal(Number(e.target.value))}
                      className="w-24 text-end font-bold bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:outline-none focus:border-[#C82626]"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col items-end gap-2 text-xs">
            <div className="flex justify-between w-64 text-neutral-500">
              <span>{isAr ? 'المبلغ الفرعي:' : 'Subtotal:'}</span>
              <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">
                {subtotal.toLocaleString()} EGP
              </span>
            </div>

            <div className="flex items-center justify-between w-64 text-neutral-500">
              <span>{isAr ? 'خصم (%):' : 'Discount (%):'}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-12 text-end bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:outline-none"
                />
                <span className="font-mono text-red-500">
                  -{discountAmount.toLocaleString()} EGP
                </span>
              </div>
            </div>

            <div className="flex justify-between w-64 text-base font-extrabold text-neutral-900 dark:text-white border-t border-b border-neutral-200 dark:border-neutral-800 py-1.5">
              <span>{isAr ? 'الإجمالي المطلوب:' : 'Total Amount:'}</span>
              <span className="font-mono text-[#C82626]">
                {total.toLocaleString()} EGP
              </span>
            </div>

            <div className="flex items-center justify-between w-64 text-neutral-500">
              <span>{isAr ? 'المسدد / العربون:' : 'Paid / Deposit:'}</span>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-24 text-end bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:outline-none font-bold text-green-600"
              />
            </div>

            <div className="flex justify-between w-64 text-sm font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800/70 p-2 rounded-xl">
              <span>{isAr ? 'المتبقي يوم الجلسة:' : 'Balance Due:'}</span>
              <span className="font-mono text-amber-500">
                {balanceDue.toLocaleString()} EGP
              </span>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="text-[11px] text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 pt-4 text-center">
            {isAr
              ? 'شكراً لاختياركم استوديو KIN Media Production. يتم تسليم المواد الخام وروابط المونتاج عبر بوابة العميل الإلكترونية.'
              : 'Thank you for choosing KIN Media Production. Raw footage & edits are delivered via the Client Portal.'}
          </div>

        </div>

      </div>
    </div>
  );
};
