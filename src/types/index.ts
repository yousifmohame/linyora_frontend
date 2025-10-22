// types/index.ts

// ✨ تعريف شكل التقييم الواحد
export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  userName: string;
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
}