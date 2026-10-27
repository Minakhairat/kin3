import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  ExpenseItem,
  FinancialTransactionItem,
  StudioGearItem,
  StudioBookingItem,
} from '../types';

const EXPENSES_COLLECTION = 'expenses';
const TRANSACTIONS_COLLECTION = 'financial_transactions';
const GEAR_COLLECTION = 'gear_inventory';
const BOOKINGS_COLLECTION = 'studio_bookings';

// --- Expenses (Operational Costs) ---

export function subscribeExpenses(
  onData: (expenses: ExpenseItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, EXPENSES_COLLECTION), orderBy('date', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: ExpenseItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as ExpenseItem));
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, EXPENSES_COLLECTION);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    return () => {};
  }
}

export async function createExpense(
  expense: Omit<ExpenseItem, 'id' | 'createdAt'>
): Promise<string> {
  const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${EXPENSES_COLLECTION}/${id}`;
  const payload: ExpenseItem = {
    ...expense,
    id,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, EXPENSES_COLLECTION, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateExpense(
  id: string,
  updates: Partial<ExpenseItem>
): Promise<void> {
  const path = `${EXPENSES_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, EXPENSES_COLLECTION, id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteExpense(id: string): Promise<void> {
  const path = `${EXPENSES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, EXPENSES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Financial Transactions (Revenue) ---

export function subscribeTransactions(
  onData: (transactions: FinancialTransactionItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, TRANSACTIONS_COLLECTION), orderBy('sessionDate', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: FinancialTransactionItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as FinancialTransactionItem));
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, TRANSACTIONS_COLLECTION);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    return () => {};
  }
}

export async function createTransaction(
  tx: Omit<FinancialTransactionItem, 'id' | 'createdAt'>
): Promise<string> {
  const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${TRANSACTIONS_COLLECTION}/${id}`;
  const remaining = Math.max(0, tx.totalAmountEGP - tx.paidAmountEGP);
  const payload: FinancialTransactionItem = {
    ...tx,
    id,
    remainingAmountEGP: remaining,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, TRANSACTIONS_COLLECTION, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTransaction(
  id: string,
  updates: Partial<FinancialTransactionItem>
): Promise<void> {
  const path = `${TRANSACTIONS_COLLECTION}/${id}`;
  try {
    const finalUpdates = { ...updates };
    if (
      typeof finalUpdates.totalAmountEGP === 'number' &&
      typeof finalUpdates.paidAmountEGP === 'number'
    ) {
      finalUpdates.remainingAmountEGP = Math.max(
        0,
        finalUpdates.totalAmountEGP - finalUpdates.paidAmountEGP
      );
    }
    await updateDoc(doc(db, TRANSACTIONS_COLLECTION, id), finalUpdates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const path = `${TRANSACTIONS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Gear Inventory ---

export function subscribeGear(
  onData: (gear: StudioGearItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    return onSnapshot(
      collection(db, GEAR_COLLECTION),
      (snapshot) => {
        const list: StudioGearItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as StudioGearItem));
        onData(list);
      },
      (error) => {
        console.warn('Gear inventory subscription notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Gear inventory connection notice:', error);
    if (onError) onError(error);
    return () => {};
  }
}

export async function createGear(gear: Omit<StudioGearItem, 'id' | 'updatedAt'>): Promise<string> {
  const id = `gear_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${GEAR_COLLECTION}/${id}`;
  const payload: StudioGearItem = {
    ...gear,
    id,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, GEAR_COLLECTION, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGear(id: string, updates: Partial<StudioGearItem>): Promise<void> {
  const path = `${GEAR_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, GEAR_COLLECTION, id), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteGear(id: string): Promise<void> {
  const path = `${GEAR_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, GEAR_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Studio Bookings / Calendar Reservations ---

export function subscribeBookings(
  onData: (bookings: StudioBookingItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, BOOKINGS_COLLECTION), orderBy('bookingDate', 'asc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: StudioBookingItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as StudioBookingItem));
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        console.warn('Bookings listener notice:', error);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    return () => {};
  }
}

export async function createBookingRequest(
  booking: Omit<StudioBookingItem, 'id' | 'createdAt'>
): Promise<string> {
  const id = `book_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${BOOKINGS_COLLECTION}/${id}`;
  const payload: StudioBookingItem = {
    ...booking,
    id,
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, BOOKINGS_COLLECTION, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBookingStatus(
  id: string,
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
  depositPaid?: boolean
): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${id}`;
  try {
    const updates: Partial<StudioBookingItem> = { status };
    if (typeof depositPaid === 'boolean') updates.depositPaid = depositPaid;
    await updateDoc(doc(db, BOOKINGS_COLLECTION, id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBooking(id: string): Promise<void> {
  const path = `${BOOKINGS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, BOOKINGS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- CSV Export Utility for Financial Reports ---

export function exportFinancialsToCSV(
  transactions: FinancialTransactionItem[],
  expenses: ExpenseItem[]
): void {
  const rows: string[][] = [
    ['KIN Media Production - Financial Report'],
    ['Generated at', new Date().toLocaleString('ar-EG')],
    [],
    ['--- REVENUE TRANSACTIONS ---'],
    ['Date', 'Title / Client', 'Service', 'Total (EGP)', 'Collected (EGP)', 'Balance Due (EGP)', 'Payment Method', 'Status', 'Notes'],
  ];

  transactions.forEach((tx) => {
    rows.push([
      tx.sessionDate,
      `"${(tx.clientName ? `${tx.clientName} - ` : '') + tx.title}"`,
      tx.serviceType || 'podcast',
      String(tx.totalAmountEGP),
      String(tx.paidAmountEGP),
      String(tx.remainingAmountEGP ?? 0),
      tx.paymentMethod,
      tx.paymentStatus,
      `"${tx.notes || ''}"`,
    ]);
  });

  rows.push([]);
  rows.push(['--- OPERATIONAL EXPENSES ---']);
  rows.push(['Date', 'Expense Title', 'Category', 'Amount (EGP)', 'Invoice Ref', 'Notes']);

  expenses.forEach((exp) => {
    rows.push([
      exp.date,
      `"${exp.title}"`,
      exp.category,
      String(exp.amountEGP),
      exp.invoiceRef || '',
      `"${exp.notes || ''}"`,
    ]);
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.paidAmountEGP || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amountEGP || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  rows.push([]);
  rows.push(['--- FINANCIAL SUMMARY ---']);
  rows.push(['Total Revenue Collected (EGP)', String(totalRevenue)]);
  rows.push(['Total Expenses (EGP)', String(totalExpenses)]);
  rows.push(['Net Profit / Loss (EGP)', String(netProfit)]);

  const csvContent = '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `kin_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
