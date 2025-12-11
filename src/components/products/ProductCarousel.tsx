// linora-platform/frontend/src/components/products/ProductCarousel.tsx
"use client";

import * as React from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"; // [1] استيراد أيقونات التنقل
import { Button } from "@/components/ui/button"; // [2] استيراد مكون الزر (اختياري، يمكن استخدام div عادي)

interface ProductCarouselProps {
  title: string;
  products: Product[];
  wishlistStatus?: Record<number, boolean>;
  viewAllLink?: string;
}

export function ProductCarousel({
  title,
  products,
  wishlistStatus = {},
  viewAllLink,
}: ProductCarouselProps) {
  // [3] إنشاء مرجع (Reference) للوصول إلى حاوية المنتجات
  const carouselRef = React.useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) {
    return null;
  }

  // [4] دالة التمرير
  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { current } = carouselRef;
      // تحديد مسافة التمرير (مثلاً عرض كارت واحد تقريباً)
      const scrollAmount = 300; 
      
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="container mb-1 bg-[#fff] mx-auto px-4 py-2 relative group">
      {/* رأس القسم */}
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

      {/* حاوية نسبية لتتموضع الأزرار بداخلها */}
      <div className="relative">
        
        {/* [5] زر التمرير لليمين */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 
                     bg-white/80 backdrop-blur-sm border border-gray-200 
                     text-gray-700 hover:text-rose-600 hover:border-rose-300
                     w-10 h-10 rounded-full shadow-lg flex items-center justify-center
                     transition-all duration-300 opacity-0 group-hover:opacity-100
                     disabled:opacity-0 translate-x-3 md:translate-x-5"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* [6] زر التمرير لليسار */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 
                     bg-white/80 backdrop-blur-sm border border-gray-200 
                     text-gray-700 hover:text-rose-600 hover:border-rose-300
                     w-10 h-10 rounded-full shadow-lg flex items-center justify-center
                     transition-all duration-300 opacity-0 group-hover:opacity-100
                     disabled:opacity-0 -translate-x-3 md:-translate-x-5"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* حاوية المنتجات */}
        <div 
          ref={carouselRef} // [7] ربط المرجع هنا
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide scroll-smooth"
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="min-w-[160px] md:min-w-[220px] snap-start"
            >
              <ProductCard
                product={product}
                isInitiallyWishlisted={wishlistStatus[product.id] || false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}