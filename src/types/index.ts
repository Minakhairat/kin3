export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';

export type ServiceCategory = 'podcasts' | 'reels' | 'commercials';

export interface PricingPackage {
  id: string;
  name: string;
  category: ServiceCategory;
  price: number;
  period: string;
  unitAr: string;
  unitEn: string;
  recommended?: boolean;
  highlightAr?: string;
  highlightEn?: string;
  featuresAr: string[];
  featuresEn: string[];
  deliverablesAr: string;
  deliverablesEn: string;
  sessionTimeAr?: string;
  sessionTimeEn?: string;
  revisionsAr?: string;
  revisionsEn?: string;
  turnaroundAr?: string;
  turnaroundEn?: string;
  cameras?: string;
  sound?: string;
  clipsCount?: number;
  // Dynamic pricing fields
  originalPrice?: number;
  isCustomPrice?: boolean;
  activePromoDiscount?: number;
  isPopular?: boolean;
  duration?: string;
  highlight?: string;
  deliverables?: string;
  features?: string[];
}

export interface PortfolioItem {
  id: string;
  titleAr: string;
  titleEn: string;
  category: 'podcasts' | 'reels' | 'commercials';
  client: string;
  duration: string;
  aspectRatio: '16:9' | '9:16';
  coverImage: string;
  summaryAr: string;
  summaryEn: string;
  instagramUrl: string;
  instagramCaptionAr: string;
  instagramCaptionEn: string;
  likes?: number;
  comments?: number;
  shares?: number;
  views?: string;
  instagramShortcode?: string;
  instagramEmbedUrl?: string;
  videoUrl?: string;
  specs: {
    camerasAr: string;
    camerasEn: string;
    soundAr: string;
    soundEn: string;
    deliverablesAr: string;
    deliverablesEn: string;
    colorGradeAr: string;
    colorGradeEn: string;
  };
}

export interface BookingFormData {
  fullName: string;
  phone: string;
  email?: string;
  service: string;
  packageId: string;
  preferredDate: string;
  timeSlot?: string;
  addons: string[];
  notes?: string;
}

// 1. Client Reviews
export interface ReviewItem {
  id: string;
  authorUid: string;
  authorName: string;
  authorEmail?: string;
  authorProject?: string;
  rating: number; // 1 to 5
  comment: string;
  serviceType: 'podcast' | 'reels' | 'commercial' | 'general';
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
  adminReply?: string;
  createdAt: string;
  updatedAt?: string;
}

// 2. Dynamic Pricing CMS
export interface PackageCMSItem {
  id: string;
  category: ServiceCategory;
  nameEn: string;
  nameAr: string;
  priceEGP: number;
  originalPriceEGP?: number;
  periodAr?: string;
  periodEn?: string;
  highlightAr?: string;
  highlightEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  deliverablesAr?: string;
  deliverablesEn?: string;
  featuresAr?: string[];
  featuresEn?: string[];
  sessionTimeAr?: string;
  sessionTimeEn?: string;
  revisionsAr?: string;
  revisionsEn?: string;
  turnaroundAr?: string;
  turnaroundEn?: string;
  cameras?: string;
  sound?: string;
  clipsCount?: number;
  isPopular?: boolean;
  isActive: boolean;
  updatedAt?: string;
}

// 3. Limited-time Promotions
export interface PromotionItem {
  id: string;
  titleAr: string;
  titleEn?: string;
  code?: string;
  discountPercent: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  applicableCategory?: 'all' | 'podcasts' | 'reels' | 'commercials';
  bannerTextAr?: string;
  bannerTextEn?: string;
  isActive: boolean;
  createdAt?: string;
}

// 4. Studio Operational Expenses (P&L)
export type ExpenseCategory =
  | 'rent'
  | 'salaries_crew'
  | 'equipment'
  | 'marketing'
  | 'utilities_hospitality'
  | 'maintenance'
  | 'other';

export interface ExpenseItem {
  id: string;
  title: string;
  amountEGP: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  notes?: string;
  invoiceRef?: string;
  recordedBy: string;
  createdAt: string;
}

// 5. Studio Financial Transactions (Revenue)
export type PaymentMethod = 'cash' | 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'card';
export type PaymentStatus = 'paid' | 'partial' | 'pending';

export interface FinancialTransactionItem {
  id: string;
  title: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  serviceType?: 'podcast' | 'reels' | 'commercial' | 'gear_rental' | 'other';
  totalAmountEGP: number;
  paidAmountEGP: number;
  remainingAmountEGP?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  sessionDate: string; // YYYY-MM-DD
  notes?: string;
  createdBy?: string;
  createdAt: string;
}

// 6. Studio Hardware & Gear Inventory
export type GearCategory = 'camera' | 'lens' | 'audio' | 'lighting' | 'grip' | 'accessories';
export type GearStatus = 'available' | 'in_use' | 'maintenance' | 'external_shoot';

export interface StudioGearItem {
  id: string;
  name: string;
  category: GearCategory;
  serialNumber?: string;
  status: GearStatus;
  location?: string;
  conditionNotes?: string;
  purchaseDate?: string;
  purchasePriceEGP?: number;
  updatedAt?: string;
}

// 7. Studio Bookings / Calendar Reservations
export interface StudioBookingItem {
  id: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  packageId?: string;
  category: 'podcasts' | 'reels' | 'commercials' | 'custom';
  bookingDate: string; // YYYY-MM-DD
  timeSlot?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalAmountEGP?: number;
  depositPaid?: boolean;
  notes?: string;
  createdAt: string;
}

// 8. Invoice / Quotation Model
export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  serviceTitle: string;
  category?: string;
  items?: {
    description: string;
    amount: number;
  }[];
  subtotal: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  total: number;
  paidAmount: number;
  balanceDue: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 9. Custom Discount Coupon Codes
export interface CouponCodeItem {
  id: string; // uppercase code
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  expiresAt?: string; // YYYY-MM-DD
  isActive: boolean;
  minBookingAmount?: number;
  description?: string;
  createdAt: string;
}
