import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Trash2,
  Download,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  PieChart,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import {
  Language,
  ExpenseItem,
  FinancialTransactionItem,
  ExpenseCategory,
  PaymentMethod,
  PaymentStatus,
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeExpenses,
  createExpense,
  deleteExpense,
  subscribeTransactions,
  createTransaction,
  deleteTransaction,
  exportFinancialsToCSV,
} from '../../services/studioErpService';

interface AdminFinancialsTabProps {
  lang: Language;
}

export const AdminFinancialsTab: React.FC<AdminFinancialsTabProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransactionItem[]>([]);
  const [activeSection, setActiveSection] = useState<'overview' | 'revenue' | 'expenses'>('overview');

  // New Revenue Transaction Form state
  const [showAddRevenueModal, setShowAddRevenueModal] = useState(false);
  const [txTitle, setTxTitle] = useState('');
  const [txClientName, setTxClientName] = useState('');
  const [txClientPhone, setTxClientPhone] = useState('');
  const [txServiceType, setTxServiceType] = useState<'podcast' | 'reels' | 'commercial' | 'gear_rental' | 'other'>('podcast');
  const [txTotal, setTxTotal] = useState<number>(8500);
  const [txPaid, setTxPaid] = useState<number>(3000);
  const [txMethod, setTxMethod] = useState<PaymentMethod>('instapay');
  const [txStatus, setTxStatus] = useState<PaymentStatus>('partial');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txNotes, setTxNotes] = useState('');

  // New Expense Form state
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState<number>(1500);
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('salaries_crew');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expNotes, setExpNotes] = useState('');
  const [expInvoiceRef, setExpInvoiceRef] = useState('');

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    const unsubExp = subscribeExpenses(setExpenses);
    const unsubTx = subscribeTransactions(setTransactions);
    return () => {
      unsubExp();
      unsubTx();
    };
  }, []);

  // Summary Metrics calculations
  const totalAgreed = transactions.reduce((sum, t) => sum + (t.totalAmountEGP || 0), 0);
  const totalRevenueCollected = transactions.reduce((sum, t) => sum + (t.paidAmountEGP || 0), 0);
  const totalOutstandingBalance = transactions.reduce((sum, t) => sum + (t.remainingAmountEGP ?? 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amountEGP || 0), 0);
  const netProfit = totalRevenueCollected - totalExpenses;
  const profitMargin = totalRevenueCollected > 0
    ? Math.round((netProfit / totalRevenueCollected) * 100)
    : 0;

  // Expenses categorical breakdown
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amountEGP;
  });

  const handleSaveRevenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || txTotal <= 0) return;

    try {
      await createTransaction({
        title: txTitle.trim(),
        clientName: txClientName.trim() || undefined,
        clientPhone: txClientPhone.trim() || undefined,
        serviceType: txServiceType,
        totalAmountEGP: Number(txTotal),
        paidAmountEGP: Number(txPaid),
        paymentMethod: txMethod,
        paymentStatus: txPaid >= txTotal ? 'paid' : txPaid > 0 ? 'partial' : 'pending',
        sessionDate: txDate,
        notes: txNotes.trim() || undefined,
        createdBy: user?.uid,
      });

      setShowAddRevenueModal(false);
      setTxTitle('');
      setTxClientName('');
      setTxClientPhone('');
      setTxNotes('');
      setActionSuccess(isAr ? 'تم تسجيل دفعة الإيراد بنجاح' : 'Revenue transaction recorded');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || expAmount <= 0) return;

    try {
      await createExpense({
        title: expTitle.trim(),
        amountEGP: Number(expAmount),
        category: expCategory,
        date: expDate,
        notes: expNotes.trim() || undefined,
        invoiceRef: expInvoiceRef.trim() || undefined,
        recordedBy: user?.uid || 'admin',
      });

      setShowAddExpenseModal(false);
      setExpTitle('');
      setExpNotes('');
      setExpInvoiceRef('');
      setActionSuccess(isAr ? 'تم تسجيل المصروف بنجاح' : 'Expense recorded');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 font-brand">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span>{isAr ? 'برنامج إدارة الاستوديو والحسابات المالية (P&L)' : 'Studio Operations & Financial ERP'}</span>
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            {isAr
              ? 'متابعة إيرادات جلسات التصوير، المصروفات التشغيلية، وصافي الأرباح والخسائر في استوديو الكوربة.'
              : 'Track shooting revenue, operational expenses, and net profit & loss.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportFinancialsToCSV(transactions, expenses)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير تقرير مالي (CSV / Excel)' : 'Export CSV Report'}</span>
          </button>

          <button
            onClick={() => setShowAddRevenueModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'تسجيل إيراد / دفعة' : 'Add Revenue'}</span>
          </button>

          <button
            onClick={() => setShowAddExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'تسجيل مصروف' : 'Add Expense'}</span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Cards (4 pillars: Collected Revenue, Expenses, Net Profit/Loss, Margin) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Collected Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>{isAr ? 'إجمالي الإيرادات المحصلة' : 'Revenue Collected'}</span>
            <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
            {totalRevenueCollected.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-400">EGP</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 flex items-center justify-between">
            <span>{isAr ? `إجمالي العقود: ${totalAgreed.toLocaleString()}` : `Total Agreed: ${totalAgreed.toLocaleString()}`}</span>
            {totalOutstandingBalance > 0 && (
              <span className="text-amber-500 font-bold">
                {isAr ? `متبقي: ${totalOutstandingBalance.toLocaleString()}` : `Due: ${totalOutstandingBalance.toLocaleString()}`}
              </span>
            )}
          </div>
        </div>

        {/* Total Expenses */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>{isAr ? 'المصروفات التشغيلية' : 'Total Expenses'}</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
            {totalExpenses.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-400">EGP</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {isAr ? `${expenses.length} بند مصروف مسجل` : `${expenses.length} expenses logged`}
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>{isAr ? 'صافي الربح / الخسارة' : 'Net Profit / Loss'}</span>
            <div
              className={`p-1.5 rounded-lg ${
                netProfit >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}
            >
              {netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            </div>
          </div>
          <div
            className={`text-2xl font-black font-mono tracking-tight ${
              netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {netProfit >= 0 ? `+${netProfit.toLocaleString()}` : netProfit.toLocaleString()}{' '}
            <span className="text-xs font-bold text-neutral-400">EGP</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {netProfit >= 0
              ? (isAr ? 'الاستوديو يحقق أرباحاً تشغيلية' : 'Positive operating profit')
              : (isAr ? 'عجز تشغيلي مؤقت' : 'Operating deficit')}
          </div>
        </div>

        {/* Margin % */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="flex items-center justify-between text-neutral-500 text-xs mb-2">
            <span>{isAr ? 'هامش الربح الصافي' : 'Profit Margin'}</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-neutral-900 dark:text-white">
            {profitMargin}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {isAr ? 'نسبة صافي الربح من المحصل' : 'Net profit percentage'}
          </div>
        </div>

      </div>

      {/* Sub-Section Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveSection('overview')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'overview'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {isAr ? 'نظرة عامة وتوزيع التكاليف' : 'Overview & Breakdown'}
        </button>

        <button
          onClick={() => setActiveSection('revenue')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'revenue'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {isAr ? `حركات الإيراد (${transactions.length})` : `Revenue Logs (${transactions.length})`}
        </button>

        <button
          onClick={() => setActiveSection('expenses')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSection === 'expenses'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          {isAr ? `بنود المصروفات (${expenses.length})` : `Expense Logs (${expenses.length})`}
        </button>
      </div>

      {/* SECTION 1: OVERVIEW & BREAKDOWN */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Expenses Categorical Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              {isAr ? 'توزيع المصروفات التشغيلية حسب الفئة' : 'Expenses Breakdown by Category'}
            </h4>

            {expenses.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400">
                {isAr ? 'لم يتم تسجيل مصروفات بعد' : 'No expenses logged yet'}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { key: 'rent', labelAr: 'إيجار الاستوديو والمقر (الكوربة)', labelEn: 'Studio Rent' },
                  { key: 'salaries_crew', labelAr: 'أجور المصورين والمونتيرين وفريق العمل', labelEn: 'Crew & Editing Salaries' },
                  { key: 'equipment', labelAr: 'معدات وكاميرات وإضاءة', labelEn: 'Gear & Equipment' },
                  { key: 'marketing', labelAr: 'تسويق وإعلانات', labelEn: 'Marketing & Ads' },
                  { key: 'utilities_hospitality', labelAr: 'مرافق وضيافة وبوفيه العملاء', labelEn: 'Hospitality & Utilities' },
                  { key: 'other', labelAr: 'مصروفات أخرى', labelEn: 'Other' },
                ].map((cat) => {
                  const amount = expensesByCategory[cat.key] || 0;
                  const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                  if (amount === 0) return null;
                  return (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-neutral-700 dark:text-neutral-300">
                          {isAr ? cat.labelAr : cat.labelEn}
                        </span>
                        <span className="font-mono text-neutral-900 dark:text-white font-bold">
                          {amount.toLocaleString()} EGP ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full bg-[#C82626] rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Payment Methods Breakdown */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
              {isAr ? 'قنوات التحصيل الأكثر استخداماً' : 'Revenue by Payment Method'}
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { method: 'instapay', label: 'InstaPay إنستاباي' },
                { method: 'vodafone_cash', label: 'فودافون كاش' },
                { method: 'cash', label: 'كاش بالاستوديو' },
                { method: 'bank_transfer', label: 'تحويل بنكي' },
              ].map((m) => {
                const totalMethod = transactions
                  .filter((t) => t.paymentMethod === m.method)
                  .reduce((sum, t) => sum + (t.paidAmountEGP || 0), 0);
                return (
                  <div key={m.method} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-800">
                    <span className="text-neutral-500 block text-[11px] mb-1">{m.label}</span>
                    <span className="font-mono font-bold text-sm text-neutral-900 dark:text-white">
                      {totalMethod.toLocaleString()} EGP
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: REVENUE TRANSACTIONS TABLE */}
      {activeSection === 'revenue' && (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              {isAr ? 'لا توجد حركات إيراد مسجلة بعد' : 'No revenue logged yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-bold uppercase">
                    <th className="py-2.5 text-start">{isAr ? 'الجلسة / العميل' : 'Session / Client'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'الخدمة' : 'Service'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'الإجمالي' : 'Total'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'المحصل' : 'Collected'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'المتبقي' : 'Due'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'طريقة الدفع' : 'Method'}</th>
                    <th className="py-2.5 text-end">{isAr ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                      <td className="py-3">
                        <span className="font-bold text-neutral-900 dark:text-white block">
                          {tx.title}
                        </span>
                        {tx.clientName && (
                          <span className="text-[11px] text-neutral-400">
                            {tx.clientName} {tx.clientPhone ? `(${tx.clientPhone})` : ''}
                          </span>
                        )}
                      </td>
                      <td className="py-3 font-mono text-neutral-500">{tx.sessionDate}</td>
                      <td className="py-3 font-semibold">{tx.serviceType}</td>
                      <td className="py-3 font-mono font-bold">{tx.totalAmountEGP.toLocaleString()} EGP</td>
                      <td className="py-3 font-mono font-bold text-green-600">{tx.paidAmountEGP.toLocaleString()} EGP</td>
                      <td className="py-3 font-mono text-amber-500">{tx.remainingAmountEGP ?? 0} EGP</td>
                      <td className="py-3 font-semibold uppercase">{tx.paymentMethod}</td>
                      <td className="py-3 text-end">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: EXPENSES TABLE */}
      {activeSection === 'expenses' && (
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 bg-neutral-50 dark:bg-neutral-900/30 rounded-2xl border border-neutral-200 dark:border-neutral-800">
              {isAr ? 'لا توجد مصروفات مسجلة بعد' : 'No expenses logged yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-bold uppercase">
                    <th className="py-2.5 text-start">{isAr ? 'البند' : 'Title'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'الفئة' : 'Category'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'المبلغ (ج.م)' : 'Amount'}</th>
                    <th className="py-2.5 text-start">{isAr ? 'ملاحظات / إيصال' : 'Notes'}</th>
                    <th className="py-2.5 text-end">{isAr ? 'إجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-neutral-50/60 dark:hover:bg-neutral-900/40">
                      <td className="py-3 font-bold text-neutral-900 dark:text-white">{exp.title}</td>
                      <td className="py-3 font-mono text-neutral-500">{exp.date}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-600 dark:text-neutral-300">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-red-600">
                        -{exp.amountEGP.toLocaleString()} EGP
                      </td>
                      <td className="py-3 text-neutral-500">{exp.notes || exp.invoiceRef || '-'}</td>
                      <td className="py-3 text-end">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 text-neutral-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD REVENUE */}
      {showAddRevenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveRevenue}
            className="bg-white dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h4 className="font-bold text-base text-neutral-900 dark:text-white font-brand">
              {isAr ? 'تسجيل إيراد / دفعة جلسة تصوير جديدة' : 'Record Revenue Payment'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">{isAr ? 'بيان الجلسة / العنوان *' : 'Session Title *'}</label>
                <input
                  type="text"
                  required
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: بودكاست حلقة 14 - د. حسام' : 'e.g. Podcast Ep 14'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'اسم العميل / البرنامج' : 'Client Name'}</label>
                <input
                  type="text"
                  value={txClientName}
                  onChange={(e) => setTxClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'رقم الهاتف' : 'Phone'}</label>
                <input
                  type="text"
                  value={txClientPhone}
                  onChange={(e) => setTxClientPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'إجمالي المتفق عليه (ج.م) *' : 'Total Agreed (EGP) *'}</label>
                <input
                  type="number"
                  required
                  value={txTotal}
                  onChange={(e) => setTxTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'المسدد فعلياً (ج.م) *' : 'Amount Paid (EGP) *'}</label>
                <input
                  type="number"
                  required
                  value={txPaid}
                  onChange={(e) => setTxPaid(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono font-bold text-green-600"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</label>
                <select
                  value={txMethod}
                  onChange={(e) => setTxMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="instapay">InstaPay (إنستاباي)</option>
                  <option value="vodafone_cash">Vodafone Cash (فودافون كاش)</option>
                  <option value="cash">Cash (كاش استوديو)</option>
                  <option value="bank_transfer">Bank Transfer (تحويل بنكي)</option>
                  <option value="card">Credit Card (فيزا)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تاريخ الجلسة:' : 'Session Date:'}</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddRevenueModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-500 text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow"
              >
                {isAr ? 'حفظ الإيراد' : 'Save Transaction'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: ADD EXPENSE */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleSaveExpense}
            className="bg-white dark:bg-[#1A1817] border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
          >
            <h4 className="font-bold text-base text-neutral-900 dark:text-white font-brand">
              {isAr ? 'تسجيل مصروف تشغيلي جديد' : 'Record Operating Expense'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold mb-1">{isAr ? 'بند المصروف / البيان *' : 'Expense Title *'}</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder={isAr ? 'مثال: أجر مصور إضافي / صيانة كابلات / إيجار' : 'e.g. Camera operator fee'}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'المبلغ (ج.م) *' : 'Amount (EGP) *'}</label>
                <input
                  type="number"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono font-bold text-red-600"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'تصنيف المصروف:' : 'Category:'}</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                >
                  <option value="salaries_crew">{isAr ? 'أجور مصورين ومونتيرين' : 'Crew / Freelancers'}</option>
                  <option value="rent">{isAr ? 'إيجار الاستوديو' : 'Studio Rent'}</option>
                  <option value="equipment">{isAr ? 'معدات وصيانة' : 'Equipment'}</option>
                  <option value="marketing">{isAr ? 'إعلانات وتسويق' : 'Marketing'}</option>
                  <option value="utilities_hospitality">{isAr ? 'ضيافة وبوفيه ومرافق' : 'Hospitality / Utilities'}</option>
                  <option value="other">{isAr ? 'أخرى' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'التاريخ:' : 'Date:'}</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">{isAr ? 'رقم الإيصال / الفاتورة:' : 'Receipt Ref:'}</label>
                <input
                  type="text"
                  value={expInvoiceRef}
                  onChange={(e) => setExpInvoiceRef(e.target.value)}
                  placeholder="REC-104"
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddExpenseModal(false)}
                className="px-4 py-2 rounded-xl text-neutral-500 text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#C82626] hover:bg-[#a81e1e] text-white text-xs font-bold shadow"
              >
                {isAr ? 'حفظ المصروف' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
