// src/types/wallet.ts

export interface WalletStats {
  balance: string; // الرصيد المتاح
  pending_balance: string; // الرصيد المعلق
  outstanding_debt: string; // المديونية (COD)
  total_earnings: string; // إجمالي الأرباح التاريخية
  currency: string;
  last_updated: string;
  pending_transactions_count: number;
  can_withdraw: boolean;
  is_in_debt: boolean;
}

export interface Transaction {
  id: number;
  amount: string;
  type: 
    | 'sale_earning' 
    | 'shipping_earning' 
    | 'cod_commission_deduction' 
    | 'payout' 
    | 'agreement_income' 
    | 'agreement_fee' 
    | 'adjustment';
  status: 'pending' | 'cleared' | 'cancelled';
  payment_method: 'online' | 'cod' | 'wallet';
  description: string;
  reference_id: number;
  created_at: string;
  available_at: string | null;
}

export interface PayoutRequest {
  amount: number;
}