"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Crown, ChevronLeft } from "lucide-react";

// ✅ Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

// --- Type Definitions ---
interface PromotedProduct {
  id: number;
  name: string;
  price: number;
  original_price?: number;
  image_url: string;
  discount_percentage?: number;
}

interface MainPromotion {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  button_text: string;
}

// --- Desktop Components ---
const DesktopPromotedColumn = ({ products, t }: { products: PromotedProduct[]; t: any }) => (
  <div className="bg-gradient-to-b from-rose-100 to-pink-50  backdrop-blur-sm border border-rose-100 rounded p-4 shadow-xl h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded flex items-center justify-center">
        <Crown className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-800">{t('PromotedProducts.featured.title')}</h3>
        <p className="text-xs text-rose-600">{t('PromotedProducts.featured.subtitle')}</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {products.slice(0, 3).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="block relative group"
        >
          <div className="relative w-full h-32 rounded overflow-hidden shadow-md bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {/* عرض السعر فقط في الصورة */}
            <div className="absolute bottom-2 left-2 bg-white text-orange-500 px-2 py-1 rounded-lg text-[12px] font-bold backdrop-blur-sm">
              {product.price.toFixed(2)} ر.س
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const DesktopHighDiscountColumn = ({ products, t }: { products: PromotedProduct[]; t: any }) => (
  <div className="bg-gradient-to-b from-orange-100 to-red-50 backdrop-blur-sm border border-orange-100 rounded p-4 shadow-xl h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
        <Zap className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-800">{t('PromotedProducts.discounts.title')}</h3>
        <p className="text-xs text-orange-600">{t('PromotedProducts.discounts.subtitle')}</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {products.slice(0, 3).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="block relative group"
        >
          <div className="relative w-full h-32 rounded overflow-hidden shadow-md bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {/* عرض السعر فقط في الصورة */}
            <div className="absolute bottom-2 left-2 bg-white text-orange-500 px-2 py-1 rounded-lg text-[12px] font-bold backdrop-blur-sm">
              {product.price.toFixed(2)} ر.س
            </div>
            {/* عرض نسبة الخصم إذا كانت متوفرة */}
            {product.discount_percentage && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white border-0 text-xs px-2 py-1">
                {Math.round(product.discount_percentage)}%
              </Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// --- Mobile Components ---
const MobilePromotedColumn = ({ products, t, showViewAll = false }: { products: PromotedProduct[]; t: any; showViewAll?: boolean }) => (
  <div className="bg-gradient-to-b from-rose-100 to-pink-50 backdrop-blur-sm border border-rose-100 lg:rounded p-4 shadow-xl h-full flex flex-col min-h-[200px]">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded flex items-center justify-center">
        <Crown className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-800">{t('PromotedProducts.featured.title')}</h3>
        <p className="text-xs text-rose-600">{t('PromotedProducts.featured.subtitle')}</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {products.slice(0, 1).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="block relative group"
        >
          <div className="relative w-full h-28 rounded-lg overflow-hidden shadow-sm bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {/* عرض السعر فقط في الصورة */}
            <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-bold backdrop-blur-sm">
              {product.price.toFixed(2)} ر.س
            </div>
          </div>
        </Link>
      ))}
    </div>
    
    {/* زر عرض الكل */}
    {showViewAll && products.length > 2 && (
      <Link 
        href="/trends?filter=featured" 
        className="flex items-center justify-center gap-1 mt-2 p-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors group"
      >
        عرض الكل ({products.length})
        <ChevronLeft className="w-3 h-3 transform rotate-180 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    )}
  </div>
);

const MobileHighDiscountColumn = ({ products, t, showViewAll = false }: { products: PromotedProduct[]; t: any; showViewAll?: boolean }) => (
  <div className="bg-gradient-to-b from-orange-100 to-red-50 backdrop-blur-sm border border-orange-100 lg:rounded-2xl p-4 shadow-xl h-full flex flex-col min-h-[200px]">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-800">{t('PromotedProducts.discounts.title')}</h3>
        <p className="text-xs text-orange-600">{t('PromotedProducts.discounts.subtitle')}</p>
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {products.slice(0, 1).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="block relative group"
        >
          <div className="relative w-full h-28 rounded-lg overflow-hidden shadow-sm bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {/* عرض السعر فقط في الصورة */}
            <div className="absolute bottom-1 left-1 bg-black/70 text-white px-2 py-1 rounded-md text-xs font-bold backdrop-blur-sm">
              {product.price.toFixed(2)} ر.س
            </div>
            {/* عرض نسبة الخصم إذا كانت متوفرة */}
            {product.discount_percentage && (
              <Badge className="absolute top-1 right-1 bg-red-500 text-white border-0 text-[10px] px-1 py-0.5">
                {Math.round(product.discount_percentage)}%
              </Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
    
    {/* زر عرض الكل */}
    {showViewAll && products.length > 2 && (
      <Link 
        href="/trends?filter=discount" 
        className="flex items-center justify-center gap-1 mt-2 p-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors group"
      >
        عرض الكل ({products.length})
        <ChevronLeft className="w-3 h-3 transform rotate-180 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    )}
  </div>
);

// Mobile Banner Component with fixed height
const MobileBannerSlide = ({ promo }: { promo: MainPromotion }) => (
  <Link href={promo.link_url}>
  <div className="relative w-full h-[200px] lg:rounded-2xl overflow-hidden">
    <Image 
      src={promo.image_url} 
      alt={promo.title} 
      fill 
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      className="object-cover object-[initial] absolute h-full align-top w-full" 
      priority 
    />
  </div>
  </Link>
);

const PromotedProductsSkeleton = () => (
  <section className="relative py-6 lg:py-8 bg-gray-50">
    <div className="container mx-auto px-4 lg:px-6">
      <div className="hidden lg:grid grid-cols-4 gap-6 min-h-[400px]">
        {/* Left Column Skeleton */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-xl animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-16 h-16 bg-gray-300 rounded-2xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Center Column Skeleton */}
        <div className="col-span-2 bg-gray-300 rounded-3xl animate-pulse"></div>
        
        {/* Right Column Skeleton */}
        <div className="bg-white/80 rounded-3xl p-6 shadow-xl animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-2xl"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3">
                <div className="w-16 h-16 bg-gray-300 rounded-2xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile Skeleton */}
      <div className="lg:hidden space-y-4">
        <div className="bg-gray-300 rounded h-[220px] animate-pulse"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/80 rounded p-5 shadow-xl animate-pulse h-[200px]"></div>
          <div className="bg-white/80 rounded p-5 shadow-xl animate-pulse h-[200px]"></div>
        </div>
      </div>
    </div>
  </section>
);

// --- Helper Functions ---
const normalizeProduct = (raw: any): PromotedProduct | null => {
  if (!raw || typeof raw.id === "undefined") return null;
  const price = parseFloat(raw.price);
  const original_price = raw.compare_at_price ? parseFloat(raw.compare_at_price) : undefined;
  const discount_percentage =
    original_price && price < original_price
      ? Math.round(((original_price - price) / original_price) * 100)
      : undefined;
  return {
    id: parseInt(raw.id, 10),
    name: String(raw.name || ""),
    price,
    original_price,
    image_url: String(raw.image || raw.image_url || "/placeholder.png"),
    discount_percentage,
  };
};

const removeDuplicateProducts = (products: (PromotedProduct | null)[]): PromotedProduct[] => {
  const seen = new Set<number>();
  return products
    .filter((p): p is PromotedProduct => p !== null)
    .filter((p) => {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        return true;
      }
      return false;
    });
};

// --- Main Component ---
export default function PromotedProductsSection() {
  const { t } = useTranslation();
  const [promotedProducts, setPromotedProducts] = useState<PromotedProduct[]>([]);
  const [mainPromotions, setMainPromotions] = useState<MainPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPromotions = async () => {
      try {
        setLoading(true);
        const [promoProductsRes, mainPromosRes] = await Promise.all([
          api.get("/browse/trends"),
          api.get("/browse/main-banners"),
        ]);

        if (promoProductsRes.data && Array.isArray(promoProductsRes.data))
          setPromotedProducts(removeDuplicateProducts(promoProductsRes.data.map(normalizeProduct)));

        if (mainPromosRes.data && Array.isArray(mainPromosRes.data))
          setMainPromotions(mainPromosRes.data);

      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPromotions();
  }, [t]);

  const highDiscountProducts = promotedProducts
    .filter((p) => p.discount_percentage != null && p.discount_percentage >= 10)
    .sort((a, b) => (b.discount_percentage || 0) - (a.discount_percentage || 0));

  const highDiscountIds = new Set(highDiscountProducts.map((p) => p.id));
  const otherPromotedProducts = promotedProducts.filter((p) => !highDiscountIds.has(p.id));

  if (loading) return <PromotedProductsSkeleton />;
  if (!promotedProducts.length && !mainPromotions.length) return null;

  return (
    <section className="relative py-3 bg-transparent">
      <div className="container max-w-fit px-0">

        {/* ✅ Mobile View - تصميم منفصل للهواتف */}
        <div className="lg:hidden">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4000 }}
            spaceBetween={16}
            slidesPerView={1}
            loop
            className="w-full"
          >
            {/* Main Promotions Slides */}
            {mainPromotions.map((promo) => (
              <SwiperSlide key={`m-main-${promo.id}`}>
                <MobileBannerSlide promo={promo} />
              </SwiperSlide>
            ))}

            {/* Featured Products Slide */}
            {otherPromotedProducts.length > 0 && (
              <SwiperSlide>
                <MobilePromotedColumn 
                  products={otherPromotedProducts} 
                  t={t} 
                  showViewAll={otherPromotedProducts.length > 2}
                />
              </SwiperSlide>
            )}

            {/* Discount Products Slide */}
            {highDiscountProducts.length > 0 && (
              <SwiperSlide>
                <MobileHighDiscountColumn 
                  products={highDiscountProducts} 
                  t={t} 
                  showViewAll={highDiscountProducts.length > 2}
                />
              </SwiperSlide>
            )}
          </Swiper>
        </div>

        {/* ✅ Desktop View - التصميم الأصلي للكمبيوتر */}
        <div className="hidden w-full lg:grid grid-cols-4 gap-3 min-h-[320px]">
          {/* Left Column - Featured Products */}
          {otherPromotedProducts.length > 0 && (
            <div className="col-span-1">
              <DesktopPromotedColumn products={otherPromotedProducts} t={t} />
            </div>
          )}

          {/* Center Column - Main Promotion */}
          {mainPromotions.length > 0 && (
            <div className="col-span-2">
              <Swiper
                modules={[Autoplay, EffectFade]}
                effect="fade"
                autoplay={{ delay: 5000 }}
                loop
                className="w-full h-full rounded overflow-hidden shadow-xl"
              >
                {mainPromotions.map((promo) => (
                  <SwiperSlide key={`d-main-${promo.id}`}>
                    <Link href={promo.link_url}>
                    <div className="relative w-full h-full flex items-end overflow-hidden rounded">
                      <Image 
                        src={promo.image_url} 
                        alt={promo.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover" 
                        priority 
                      />
                    </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Right Column - Discount Products */}
          {highDiscountProducts.length > 0 && (
            <div className="col-span-1">
              <DesktopHighDiscountColumn products={highDiscountProducts} t={t} />
            </div>
          )}
        </div>

      </div>
    </section>
  );
}