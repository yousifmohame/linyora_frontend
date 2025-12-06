// types/index.ts

// ✨ تعريف شكل التقييم الواحد
export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  userName: string;
}

export interface Order {
  orderId: number;
  customerName: string;
  orderDate: string;
  orderStatus: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
  products: string;
}

export interface RawOrder {
  orderId: number;
  customerName: string;
  orderDate: string;
  orderStatus: Order['orderStatus'];
  totalAmount: number | string;
  products: string;
}

export interface Variant {
  id: number;
  color: string;
  price: number;
  stock_quantity: number;
  compare_at_price: number | null; // or just `number` if it's always present
  images?: string[] | null;
}

export interface Product {
  price: number;
  merchant_id: number; // ✅ Replaced `any` with `number`
  id: number;
  name: string;
  description: string;
  merchantName: string;
  variants: Variant[];
  reviews: Review[];
  rating?: number;
  reviewCount?: number;
  isPremium?: boolean;
  categoryIds: number[];
}

export interface CartItem {
  id: number; // variant ID
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  merchantName: string;
  product: Product;
}

export interface ModelWallet {
  balance: string;
  pending_clearance: string;
}

export interface ModelPayoutRequest {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user_id: number;
  userName: string;
  userEmail: string;
  iban: string;
  account_number: string;
  iban_certificate_url: string;
}

export interface Category {
  id: number;
  name: string;
  image_url: string;
  slug: string;
}

export interface ReelTaggedProduct {
  id: number;       // معرف المنتج
  name: string;     // اسم المنتج
  image_url: string | null; // رابط صورة المنتج (قد يكون null)
}

export interface Reel {
  id: number;
  video_url: string;
  thumbnail_url: string | null;
  caption: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  isLikedByMe: boolean;
  isFollowedByMe: boolean;
  tagged_products_count:number;
  userId: number;
  userName: string;
  userAvatar: string | null;
  tagged_products: ReelTaggedProduct[];
}

export interface Comment {
  id: number;
  comment: string;
  created_at: string;
  userId: number;
  userName: string;
  userAvatar: string | null;
}

export interface ServicePackage {
  id: number;
  user_id: number; // معرف العارضة التي تقدم الباقة
  title: string;
  description: string | null;
  category?: string | null; // (اختياري)
  status: 'active' | 'paused';
  created_at: string; // أو Date
  starting_price?: number | string | null; // أقل سعر من package_tiers
}

export interface Offer {
  id: number;
  user_id: number; // معرف العارضة التي تقدم العرض
  title: string;
  description: string | null;
  price: number | string; // السعر قد يأتي كنص أحياناً من الـ API
  type: 'story' | 'post' | 'reels' | 'photoshoot'; // أنواع العروض الممكنة
  status: 'active' | 'paused';
  created_at: string; // أو Date
}

// --- 3. واجهة المستخدم (User) - محدثة للملف الشخصي العام ---
// (إذا كانت لديك واجهة User بالفعل، قم بدمج هذه الحقول معها وجعل الحقول الجديدة اختيارية ?)
export interface User {
  id: number;
  name: string;
  phone:string,
  email?: string; // قد لا نحتاجه في الملف العام
  phone_number?: string | null;
  address?: string | null; // قد لا نحتاجه في الملف العام
  profile_picture_url?: string | null;
  bio?: string | null;
  is_banned?: boolean;
  is_email_verified?: boolean;
  store_name?: string | null; // للتجار
  store_description?: string | null; // للتجار
  store_logo_url?: string | null; // للتجار
  store_banner_url?: string | null; // للتجار
  role_id?: number; // الدور الأساسي
  role_name?: string; // اسم الدور (مثل "العارضة")
  stats?: {
    followers?: string | number;
    engagement?: string | number;
    reelsCount?: number; // نضيفه لاحقاً للـ backend
    [key: string]: any; // للسماح بإحصائيات أخرى
  } | null;
  social_links?: {
    instagram?: string;
    snapchat?: string;
    tiktok?: string; // أضف حسب الحاجة
    [key: string]: any; // للسماح بروابط أخرى
  } | null;
  portfolio?: string[] | null; // مصفوفة من روابط الصور/الفيديو
  is_verified?: boolean; // هل الحساب موثق؟
}

// src/types/index.ts
export type ReelData = {
  id: number;
  video_url: string;
  caption: string;
  views_count: number;
  shares_count: number;
  likes_count: number;
  comments_count: number;
  userId: number;
  userName: string;
  userAvatar: string;
};