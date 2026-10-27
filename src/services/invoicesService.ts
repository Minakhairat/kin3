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
import { InvoiceItem } from '../types';

const INVOICES_COLLECTION = 'invoices';

export function subscribeInvoices(
  onData: (invoices: InvoiceItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, INVOICES_COLLECTION), orderBy('issueDate', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: InvoiceItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as InvoiceItem));
        onData(list);
      },
      (error) => {
        console.warn('Invoices subscription notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Invoices connection notice:', error);
    if (onError) onError(error);
    return () => {};
  }
}

export async function saveInvoice(
  invoice: Omit<InvoiceItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<string> {
  const id = invoice.id || `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const path = `${INVOICES_COLLECTION}/${id}`;
  const now = new Date().toISOString();

  const payload: InvoiceItem = {
    ...invoice,
    id,
    createdAt: (invoice as any).createdAt || now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, INVOICES_COLLECTION, id), payload, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteInvoice(id: string): Promise<void> {
  const path = `${INVOICES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, INVOICES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
