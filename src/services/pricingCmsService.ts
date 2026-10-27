import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { PackageCMSItem, PromotionItem } from '../types';

const PACKAGES_COLLECTION = 'packages_cms';
const PROMOTIONS_COLLECTION = 'promotions';

// --- Dynamic Pricing Packages ---

export function subscribePackagesCMS(
  onData: (packages: PackageCMSItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    return onSnapshot(
      collection(db, PACKAGES_COLLECTION),
      (snapshot) => {
        const list: PackageCMSItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as PackageCMSItem);
        });
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        console.warn('Packages CMS subscription notice:', error);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    return () => {};
  }
}

export async function savePackageCMS(pkg: PackageCMSItem): Promise<void> {
  const path = `${PACKAGES_COLLECTION}/${pkg.id}`;
  try {
    await setDoc(doc(db, PACKAGES_COLLECTION, pkg.id), {
      ...pkg,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePackageCMS(id: string): Promise<void> {
  const path = `${PACKAGES_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, PACKAGES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Limited-Time Promotions ---

export function subscribePromotions(
  onData: (promotions: PromotionItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    return onSnapshot(
      collection(db, PROMOTIONS_COLLECTION),
      (snapshot) => {
        const list: PromotionItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as PromotionItem);
        });
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        console.warn('Promotions subscription notice:', error);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    return () => {};
  }
}

export async function savePromotion(promo: Omit<PromotionItem, 'id'> & { id?: string }): Promise<string> {
  const id = promo.id || `promo_${Date.now()}`;
  const path = `${PROMOTIONS_COLLECTION}/${id}`;
  const payload: PromotionItem = {
    ...promo,
    id,
    createdAt: promo.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, PROMOTIONS_COLLECTION, id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePromotion(id: string): Promise<void> {
  const path = `${PROMOTIONS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, PROMOTIONS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function isPromotionActive(promo: PromotionItem): boolean {
  if (!promo.isActive) return false;
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  if (promo.startDate && todayStr < promo.startDate) return false;
  if (promo.endDate && todayStr > promo.endDate) return false;
  return true;
}
