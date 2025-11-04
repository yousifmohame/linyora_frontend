// linora-platform/frontend/src/lib/viewHistory.ts
"use client";

import { Product } from "@/types";

const HISTORY_KEY = "linora_view_history";
const MAX_HISTORY_ITEMS = 10;

// إضافة منتج إلى سجل المشاهدة
export const addProductToHistory = (product: Product): void => {
  if (typeof window === "undefined" || !product) {
    return;
  }

  try {
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    let history: Product[] = rawHistory ? JSON.parse(rawHistory) : [];

    // إزالة المنتج إذا كان موجوداً بالفعل لإضافته في البداية
    history = history.filter((item) => item.id !== product.id);

    // إضافة المنتج في بداية القائمة
    history.unshift(product);

    // الحفاظ على 10 عناصر فقط
    if (history.length > MAX_HISTORY_ITEMS) {
      history = history.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to update view history:", error);
  }
};

// جلب المنتجات التي تمت مشاهدتها مؤخراً
export const getRecentlyViewed = (): Product[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    return rawHistory ? JSON.parse(rawHistory) : [];
  } catch (error) {
    console.error("Failed to get view history:", error);
    return [];
  }
};
