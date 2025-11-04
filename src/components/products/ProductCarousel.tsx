// linora-platform/frontend/src/components/products/ProductCarousel.tsx
"use client";

import * as React from "react";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; // استيراد مكون الكاروسيل من shadcn
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
          <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-pink-600 
                           bg-clip-text text-transparent 
                           bg-size-200 bg-pos-0
                           transition-all duration-2000">
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
      <Carousel
        opts={{
          align: "start",
          direction: document.dir === 'rtl' ? 'rtl' : 'ltr', // دعم RTL
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {products.map((product) => (
            <CarouselItem 
              key={product.id} 
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
            >
              <div className="h-full">
                <ProductCard
                  product={product}
                  isInitiallyWishlisted={wishlistStatus[product.id] || false}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
