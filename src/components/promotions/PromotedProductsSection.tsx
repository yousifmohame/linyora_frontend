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
  <div className="bg-white/90 backdrop-blur-sm border border-rose-200/50 rounded-2xl p-4 shadow-xl h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
        <Crown className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-800">{t('PromotedProducts.featured.title')}</h3>
        <p className="text-xs text-rose-600">{t('PromotedProducts.featured.subtitle')}</p>
      </div>
    </div>
    <div className="space-y-3 flex-1">
      {products.slice(0, 3).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="flex items-center gap-3 p-2 rounded-xl group hover:bg-rose-50 transition-colors"
        >
          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-md bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-rose-600 leading-tight">
              {product.name}
            </p>
            <p className="text-base font-bold text-rose-700 mt-1">
              {product.price.toFixed(2)} ر.س
            </p>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const DesktopHighDiscountColumn = ({ products, t }: { products: PromotedProduct[]; t: any }) => (
  <div className="bg-white/90 backdrop-blur-sm border border-orange-200/50 rounded-2xl p-4 shadow-xl h-full flex flex-col">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
        <Zap className="w-5 h-5 text-white" />
      </div>
      <div>
        <h3 className="text-base font-bold text-gray-800">{t('PromotedProducts.discounts.title')}</h3>
        <p className="text-xs text-orange-600">{t('PromotedProducts.discounts.subtitle')}</p>
      </div>
    </div>
    <div className="space-y-3 flex-1">
      {products.slice(0, 3).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="flex items-center gap-3 p-2 rounded-xl group hover:bg-orange-50 transition-colors"
        >
          <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-md bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {product.discount_percentage && (
              <Badge className="absolute top-1 right-1 bg-red-500 text-white border-0 text-[10px] px-1 py-0.5">
                {Math.round(product.discount_percentage)}%
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 leading-tight">
              {product.name}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <p className="text-base font-bold text-orange-700">{product.price.toFixed(2)} ر.س</p>
              {product.original_price && (
                <p className="text-xs text-gray-500 line-through">{product.original_price.toFixed(2)} ر.س</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

// --- Mobile Components ---
const MobilePromotedColumn = ({ products, t, showViewAll = false }: { products: PromotedProduct[]; t: any; showViewAll?: boolean }) => (
  <div className="bg-white/90 backdrop-blur-sm border border-rose-200/50 lg:rounded-2xl p-4 shadow-xl h-full flex flex-col min-h-[200px]">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center">
        <Crown className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-800">{t('PromotedProducts.featured.title')}</h3>
        <p className="text-xs text-rose-600">{t('PromotedProducts.featured.subtitle')}</p>
      </div>
    </div>
    <div className="space-y-2 flex-1">
      {products.slice(0, 1).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="flex items-center gap-2 p-2 rounded-lg group hover:bg-rose-50 transition-colors"
        >
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-rose-600 leading-tight">
              {product.name}
            </p>
            <p className="text-sm font-bold text-rose-700 mt-0.5">
              {product.price.toFixed(2)} ر.س
            </p>
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
  <div className="bg-white/90 backdrop-blur-sm border border-orange-200/50 lg:rounded-2xl p-4 shadow-xl h-full flex flex-col min-h-[200px]">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
        <Zap className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-bold text-gray-800">{t('PromotedProducts.discounts.title')}</h3>
        <p className="text-xs text-orange-600">{t('PromotedProducts.discounts.subtitle')}</p>
      </div>
    </div>
    <div className="space-y-2 flex-1">
      {products.slice(0, 1).map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`} 
          className="flex items-center gap-2 p-2 rounded-lg group hover:bg-orange-50 transition-colors"
        >
          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 shadow-sm bg-gray-100">
            <Image 
              src={product.image_url} 
              alt={product.name} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            {product.discount_percentage && (
              <Badge className="absolute top-0 right-0 bg-red-500 text-white border-0 text-[8px] px-1 py-0 min-h-0 h-3">
                {Math.round(product.discount_percentage)}%
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 line-clamp-1 group-hover:text-orange-600 leading-tight">
              {product.name}
            </p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <p className="text-sm font-bold text-orange-700">{product.price.toFixed(2)} ر.س</p>
              {product.original_price && (
                <p className="text-xs text-gray-500 line-through">{product.original_price.toFixed(2)} ر.س</p>
              )}
            </div>
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
  <div className="relative w-full h-[200px] lg:rounded-2xl overflow-hidden shadow-lg">
    <Image 
      src={promo.image_url} 
      alt={promo.title} 
      fill 
      className="object-cover" 
      priority 
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
    <div className="absolute bottom-4 left-4 right-4 text-white">
      <h3 className="text-lg font-bold line-clamp-1">{promo.title}</h3>
      <p className="text-sm opacity-90 line-clamp-1 mt-1">{promo.subtitle}</p>
      <Button 
        asChild 
        size="sm" 
        className="mt-2 bg-white text-black hover:bg-gray-100 rounded-full px-4 text-xs h-8"
      >
        <Link href={promo.link_url}>
          {promo.button_text}
        </Link>
      </Button>
    </div>
  </div>
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

  if (loading || (!promotedProducts.length && !mainPromotions.length)) return null;

  return (
    <section className="relative py-0 lg:py-6 bg-gray-50">
      <div className="container mx-auto px-0 lg:px-3 md:px-4">

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
        <div className="hidden lg:grid grid-cols-4 gap-4 min-h-[320px]">
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
                className="w-full h-full rounded-2xl overflow-hidden shadow-xl"
              >
                {mainPromotions.map((promo) => (
                  <SwiperSlide key={`d-main-${promo.id}`}>
                    <div className="relative w-full h-full flex items-end overflow-hidden rounded-2xl">
                      <Image 
                        src={promo.image_url} 
                        alt={promo.title} 
                        fill 
                        className="object-cover" 
                        priority 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                      <div className="relative z-10 p-6 w-full">
                        <h2 className="text-2xl font-bold text-white mb-2">{promo.title}</h2>
                        <p className="text-gray-200 text-sm mb-4">{promo.subtitle}</p>
                        <Button 
                          asChild 
                          className="bg-white text-black hover:bg-gray-100 font-semibold rounded-full px-6"
                        >
                          <Link href={promo.link_url}>
                            {promo.button_text}
                          </Link>
                        </Button>
                      </div>
                    </div>
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