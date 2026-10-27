import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { ReviewItem } from '../types';

const REVIEWS_COLLECTION = 'reviews';

export const INITIAL_CURATED_REVIEWS: ReviewItem[] = [
  {
    id: 'seed-1',
    authorUid: 'seed_uid_1',
    authorName: 'أحمد السعدني',
    authorProject: 'بودكاست العمارة والمجتمع',
    rating: 5,
    comment: 'استوديو كين في الكوربة نقل جودة البودكاست عندنا لمرحلة تانية خالص! العزل الصوتي فائق الدقة، وكاميرات سوني مع إضاءات الأبوتشر بتطلع صورة سينمائية بدون أي تشويش. التزام بالمواعيد وسرعة في تسليم الحلقات.',
    serviceType: 'podcast',
    status: 'approved',
    isFeatured: true,
    adminReply: 'شكراً أستاذ أحمد، شرفنا جداً استضافة برنامجكم الراقي في استوديوهاتنا!',
    createdAt: '2026-10-18T14:30:00.000Z',
    updatedAt: '2026-10-18T14:30:00.000Z',
  },
  {
    id: 'seed-2',
    authorUid: 'seed_uid_2',
    authorName: 'نورا الحفناوي',
    authorProject: 'مؤسسة Bloom Skincare',
    rating: 5,
    comment: 'باقة تصوير الـ 16 ريلز الشهرية مع فريق كين وفّرت علينا مجهود شهور. التصوير تم في يوم واحد باحترافية، والمونتاج مع المؤثرات الصوتية والـ Color Grading كان على أعلى مستوى في مصر.',
    serviceType: 'reels',
    status: 'approved',
    isFeatured: true,
    adminReply: 'سعداء جداً بنجاح الحملة ونسب المشاهدات العالية على إنستجرام وتيك توك!',
    createdAt: '2026-10-12T11:20:00.000Z',
    updatedAt: '2026-10-12T11:20:00.000Z',
  },
  {
    id: 'seed-3',
    authorUid: 'seed_uid_3',
    authorName: 'كريم البنا',
    authorProject: 'Foodie Cairo Club',
    rating: 5,
    comment: 'أفضل معاملة وروح فريق عمل شفتها. كرو الإخراج والتصوير بيساعدوا في الأفكار والزوايا وكأنهم شركاء في البرنامج مش مجرد استوديو تأجير. تجربة تستحق كل جنيه.',
    serviceType: 'podcast',
    status: 'approved',
    isFeatured: false,
    createdAt: '2026-10-05T16:00:00.000Z',
    updatedAt: '2026-10-05T16:00:00.000Z',
  },
];

let hasSeededReviews = false;
async function seedInitialReviewsIfEmpty() {
  if (hasSeededReviews) return;
  hasSeededReviews = true;
  try {
    const snap = await getDocs(collection(db, REVIEWS_COLLECTION));
    if (snap.empty) {
      for (const rev of INITIAL_CURATED_REVIEWS) {
        await setDoc(doc(db, REVIEWS_COLLECTION, rev.id), rev);
      }
    }
  } catch (err) {
    console.warn('Initial reviews seed notice:', err);
  }
}

export async function submitReview(
  authorUid: string,
  authorName: string,
  authorEmail: string | undefined,
  rating: number,
  comment: string,
  serviceType: 'podcast' | 'reels' | 'commercial' | 'general',
  authorProject?: string
): Promise<string> {
  const reviewId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const payload: ReviewItem = {
    id: reviewId,
    authorUid,
    authorName: authorName.trim(),
    authorEmail: authorEmail?.trim(),
    authorProject: authorProject?.trim() || '',
    rating: Math.min(5, Math.max(1, rating)),
    comment: comment.trim(),
    serviceType,
    status: 'pending', // Awaits admin approval
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, reviewId), payload);
    return reviewId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${REVIEWS_COLLECTION}/${reviewId}`);
  }
}

export function subscribeApprovedReviews(
  onData: (reviews: ReviewItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    // Attempt background seed if empty
    seedInitialReviewsIfEmpty();

    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('status', '==', 'approved')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: ReviewItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ReviewItem);
        });
        // Sort descending by creation date
        list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        onData(list);
      },
      (error) => {
        if (onError) onError(error);
        console.warn('Public approved reviews listener notice:', error);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    return () => {};
  }
}

export function subscribeAllReviewsForAdmin(
  onData: (reviews: ReviewItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    seedInitialReviewsIfEmpty();

    const q = query(
      collection(db, REVIEWS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const list: ReviewItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push(docSnap.data() as ReviewItem);
        });
        if (list.length === 0) {
          onData(INITIAL_CURATED_REVIEWS);
        } else {
          onData(list);
        }
      },
      (error) => {
        console.warn('Admin reviews subscription notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    if (onError) onError(error);
    return () => {};
  }
}

export async function updateReviewModeration(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  isFeatured?: boolean,
  adminReply?: string
): Promise<void> {
  const path = `${REVIEWS_COLLECTION}/${id}`;
  try {
    const updates: Partial<ReviewItem> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (typeof isFeatured === 'boolean') updates.isFeatured = isFeatured;
    if (typeof adminReply === 'string') updates.adminReply = adminReply.trim();

    await setDoc(doc(db, REVIEWS_COLLECTION, id), updates, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateReviewDetails(
  id: string,
  updates: Partial<Pick<ReviewItem, 'authorName' | 'comment' | 'authorProject' | 'rating' | 'serviceType'>>
): Promise<void> {
  const path = `${REVIEWS_COLLECTION}/${id}`;
  try {
    await setDoc(
      doc(db, REVIEWS_COLLECTION, id),
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteReview(id: string): Promise<void> {
  const path = `${REVIEWS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, REVIEWS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
