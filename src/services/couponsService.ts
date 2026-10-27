import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { CouponCodeItem } from '../types';

const COUPONS_COLLECTION = 'coupons';

export function subscribeCoupons(
  onData: (coupons: CouponCodeItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const q = query(collection(db, COUPONS_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: CouponCodeItem[] = [];
        snapshot.forEach((d) => list.push(d.data() as CouponCodeItem));
        onData(list);
      },
      (error) => {
        console.warn('Coupons subscription notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Coupons connection notice:', error);
    if (onError) onError(error);
    return () => {};
  }
}

export async function saveCoupon(
  coupon: Omit<CouponCodeItem, 'id' | 'createdAt'> & { id?: string }
): Promise<string> {
  const id = coupon.id || `cpn_${coupon.code.trim().toUpperCase()}`;
  const path = `${COUPONS_COLLECTION}/${id}`;
  const now = new Date().toISOString();

  const payload: CouponCodeItem = {
    ...coupon,
    id,
    code: coupon.code.trim().toUpperCase(),
    createdAt: (coupon as any).createdAt || now,
  };

  try {
    await setDoc(doc(db, COUPONS_COLLECTION, id), payload, { merge: true });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleCouponActive(id: string, isActive: boolean): Promise<void> {
  const path = `${COUPONS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, COUPONS_COLLECTION, id), { isActive });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  const path = `${COUPONS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, COUPONS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: CouponCodeItem;
  discountAmount?: number;
  errorAr?: string;
  errorEn?: string;
}

export async function validateCouponCode(
  inputCode: string,
  baseAmount: number
): Promise<CouponValidationResult> {
  const cleanCode = inputCode.trim().toUpperCase();
  if (!cleanCode) {
    return {
      valid: false,
      errorAr: 'يرجى إدخال كود الخصم',
      errorEn: 'Please enter a coupon code',
    };
  }

  try {
    const snapshot = await getDocs(collection(db, COUPONS_COLLECTION));
    let match: CouponCodeItem | null = null;
    snapshot.forEach((d) => {
      const item = d.data() as CouponCodeItem;
      if (item.code.toUpperCase() === cleanCode) {
        match = item;
      }
    });

    // Fallback default coupons for demo/testing if not seeded yet
    if (!match) {
      if (cleanCode === 'KIN10') {
        match = {
          id: 'cpn_KIN10',
          code: 'KIN10',
          discountType: 'percent',
          discountValue: 10,
          isActive: true,
          description: 'خصم 10% ترحيبي لعملاء استوديو كين الجدد',
          createdAt: new Date().toISOString(),
        };
      } else if (cleanCode === 'VIP20') {
        match = {
          id: 'cpn_VIP20',
          code: 'VIP20',
          discountType: 'percent',
          discountValue: 20,
          isActive: true,
          description: 'خصم 20% لكبار صناع المحتوى VIP',
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (!match) {
      return {
        valid: false,
        errorAr: 'كود الخصم غير صحيح أو غير موجود',
        errorEn: 'Invalid coupon code',
      };
    }

    if (!match.isActive) {
      return {
        valid: false,
        errorAr: 'عذراً، هذا الكوبون منتهي الصلاحية أو غير نشط حالياً',
        errorEn: 'This coupon is expired or inactive',
      };
    }

    if (match.expiresAt) {
      const today = new Date().toISOString().split('T')[0];
      if (match.expiresAt < today) {
        return {
          valid: false,
          errorAr: `هذا الكوبون انتهت صلاحيته في ${match.expiresAt}`,
          errorEn: `This coupon expired on ${match.expiresAt}`,
        };
      }
    }

    if (match.minBookingAmount && baseAmount < match.minBookingAmount) {
      return {
        valid: false,
        errorAr: `هذا الكوبون يتطلب حجزاً بقيمة لا تقل عن ${match.minBookingAmount} ج.م`,
        errorEn: `This coupon requires a minimum booking of ${match.minBookingAmount} EGP`,
      };
    }

    let discountAmount = 0;
    if (match.discountType === 'percent') {
      discountAmount = Math.round((baseAmount * match.discountValue) / 100);
    } else {
      discountAmount = Math.min(baseAmount, match.discountValue);
    }

    return {
      valid: true,
      coupon: match,
      discountAmount,
    };
  } catch (error) {
    console.warn('Error validating coupon:', error);
    return {
      valid: false,
      errorAr: 'حدث خطأ أثناء فحص الكوبون، يرجى المحاولة مرة أخرى',
      errorEn: 'Error checking coupon code',
    };
  }
}
