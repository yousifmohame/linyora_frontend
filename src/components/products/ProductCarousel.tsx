// linora-platform/frontend/src/components/products/ProductCarousel.tsx
"use client";

import * as React from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
// [1] تم حذف استيراد مكونات الكاروسيل
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ProductCarouselProps {
  title: string;
  products: Product[];
  wishlistStatus?: Record<number, boolean>;
  viewAllLink?: string; // رابط اختياري لعرض "مشاهدة الكل"
}

export function ProductCarousel({
  title,
  products,
  wishlistStatus = {},
  viewAllLink,
}: ProductCarouselProps) {
  if (!products || products.length === 0) {
    return null; // لا تعرض شيئاً إذا لم تكن هناك منتجات
  }

  return (
    <div className="container mb-3 bg-[#fff] mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">
          <span
            className="bg-gradient-to-r from-rose-600 via-purple-600 to-pink-600 
                             bg-clip-text text-transparent 
                             bg-size-200 bg-pos-0
                             transition-all duration-2000"
          >
            {title}
          </span>
        </h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-800 transition-colors"
          >
            مشاهدة الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* [2] تم استبدال الكاروسيل بـ <div> يستخدم Grid */}
      {/* استخدمنا نفس التنسيقات التي كانت في CarouselItem (basis-1/2 -> grid-cols-2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
        {products.map((product) => (
          // [3] تم حذف CarouselItem وعرض ProductCard مباشرة
          <ProductCard
            key={product.id}
            product={product}
            isInitiallyWishlisted={wishlistStatus[product.id] || false}
          />
        ))}
      </div>
      {/* [4] تم حذف أزرار التنقل (CarouselPrevious و CarouselNext) */}
    </div>
  );
}