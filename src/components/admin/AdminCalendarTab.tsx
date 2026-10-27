import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  MessageCircle,
  Search,
  Check
} from 'lucide-react';
import { Language, StudioBookingItem } from '../../types';
import {
  subscribeBookings,
  createBookingRequest,
  updateBookingStatus,
  deleteBooking,
} from '../../services/studioErpService';
import { COMPANY_INFO } from '../../data/content';

interface AdminCalendarTabProps {
  lang: Language;
}

export const AdminCalendarTab: React.FC<AdminCalendarTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  const [bookings, setBookings] = useState<StudioBookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Add Booking Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [category, setCategory] = useState<'podcasts' | 'reels' | 'commercials' | 'custom'>('podcasts');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('14:00 - 18:00');
  const [totalAmount, setTotalAmount] = useState<number>(8500);
  const [depositPaid, setDepositPaid] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeBookings((list) => {
      setBookings(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    try {
      await createBookingRequest({
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        clientEmail: clientEmail.trim() || undefined,
        category,
        bookingDate,
        timeSlot,
        totalAmountEGP: Number(totalAmount),
        depositPaid,
        status: 'confirmed',
        notes: notes.trim() || undefined,
      });

      setShowAddModal(false);
      setClientName('');
      setClientPhone('');
      setNotes('');
      setActionSuccess(isAr ? 'تم تأكيد حجز موعد الاستوديو بنجاح' : 'Studio session booked and confirmed');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
    deposit?: boolean
  ) => {
    try {
      await updateBookingStatus(id, status, deposit);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(isAr ? 'حذف هذا الحجز؟' : 'Delete this booking?')) return;
    try {
      await deleteBooking(id);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.clientName.toLowerCase().includes(query) ||
      b.clientPhone.includes(query) ||
      (b.notes && b.notes.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 font-brand">
            <CalendarIcon className="w-5 h-5 text-[#C82626]" />
            <span>{isAr ? 'جدول ومواعيد جلسات الاستوديو' : 'Studio Calendar & Session Schedule'}</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isAr
              ? 'إدارة مواعيد التصوير والحجوزات لمنع تعارض الأوقات وتأكيد العربون مع العملاء.'
              : 'Manage shoot bookings and prevent studio slot conflicts.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAr ? 'حجز جلسة جديدة' : 'Book Session'}</span>
        </button>
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
            placeholder={isAr ? 'بحث باسم العميل، الهاتف، أو الملاحظات...' : 'Search by client, phone, or notes...'}
            className="w-full ps-10 pe-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#C82626]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: isAr ? 'الكل' : 'All' },
            { id: 'confirmed', label: isAr ? 'مؤكدة' : 'Confirmed' },
            { id: 'pending', label: isAr ? 'معلقة' : 'Pending' },
            { id: 'completed', label: isAr ? 'مكتملة' : 'Completed' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                filterStatus === st.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List / Cards */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400 text-xs">
          {isAr ? 'جاري تحميل جدول الاستوديو...' : 'Loading studio schedule...'}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          {isAr ? 'لا توجد حجوزات مسجلة مطابقة للبحث' : 'No bookings found'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const cleanPhone = item.clientPhone.replace(/\D/g, '');
            const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              isAr
                ? `مرحباً ${item.clientName}، تأكيداً لموعد جلسة التصوير باستوديو KIN Media Production في الكوربة بتاريخ ${item.bookingDate} الساعة ${item.timeSlot || ''}. نتطلع لاستقبالكم!`
                : `Hello ${item.clientName}, confirming your studio booking at KIN Media Production on ${item.bookingDate} at ${item.timeSlot || ''}.`
            )}`;

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-neutral-900 dark:text-white">
                      {item.clientName}
                    </span>
                    <span className="text-xs font-mono text-neutral-500">
                      {item.clientPhone}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 uppercase">
                      {item.category}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === 'confirmed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : item.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : item.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {item.status}
                    </span>

                    {item.depositPaid && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {isAr ? 'تم سداد العربون' : 'Deposit Paid'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-neutral-500">
                    <span className="flex items-center gap-1 font-mono font-bold text-neutral-800 dark:text-neutral-200">
                      <CalendarIcon className="w-3.5 h-3.5 text-[#C82626]" />
                      {item.bookingDate}
                    </span>
                    {item.timeSlot && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {item.timeSlot}
                      </span>
                    )}
                    {item.totalAmountEGP && (
                      <span className="font-mono text-neutral-600 dark:text-neutral-300">
                        {item.totalAmountEGP.toLocaleString()} EGP
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تأكيد واتساب' : 'WhatsApp'}</span>
                  </a>

                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as any, item.depositPaid)}
                    className="px-2 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 border-none cursor-pointer"
                  >
                    <option value="confirmed">{isAr ? 'مؤكد' : 'Confirmed'}</option>
                    <option value="pending">{isAr ? 'معلق' : 'Pending'}</option>
                    <option value="completed">{isAr ? 'تم التصوير' : 'Completed'}</option>
                    <option value="cancelled">{isAr ? 'ملغي' : 'Cancelled'}</option>
                  </select>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Book Session */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleAddBooking}
            className="bg-white dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h4 className="font-bold text-base text-neutral-900 dark:text-white font-brand">
              {isAr ? 'تسجيل حجز جلسة تصوير جديدة بالاستوديو' : 'New Studio Session Booking'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold mb-1">{isAr ? 'اسم العميل / البرنامج *' : 'Client Name *'}</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}</label>
                <input
                  type="text"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تاريخ الحجز:' : 'Booking Date:'}</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'الفترة الزمنية:' : 'Time Slot:'}</label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="10:00 - 14:00">10:00 AM - 02:00 PM (Morning Slot)</option>
                  <option value="14:00 - 18:00">02:00 PM - 06:00 PM (Afternoon Slot)</option>
                  <option value="18:00 - 22:00">06:00 PM - 10:00 PM (Evening Slot)</option>
                  <option value="Full Day (10h)">Full Day (10 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'الخدمة:' : 'Category:'}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="podcasts">{isAr ? 'بودكاست' : 'Podcast'}</option>
                  <option value="reels">{isAr ? 'ريلز شهرية' : 'Monthly Reels'}</option>
                  <option value="commercials">{isAr ? 'إعلان تجاري' : 'Commercial'}</option>
                  <option value="custom">{isAr ? 'جلسة مخصصة' : 'Custom'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'إجمالي السعر (ج.م):' : 'Total (EGP):'}</label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={depositPaid}
                    onChange={(e) => setDepositPaid(e.target.checked)}
                    className="w-4 h-4 accent-[#C82626] rounded cursor-pointer"
                  />
                  <span className="font-bold">{isAr ? 'تم استلام عربون الحجز مقدماً' : 'Advance deposit received'}</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">{isAr ? 'ملاحظات وتفاصيل الجلسة:' : 'Notes:'}</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr ? 'عدد الضيوف، الديكور المطلوب...' : 'Number of guests, set requirements...'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-500 text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow"
              >
                {isAr ? 'تأكيد الحجز' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
