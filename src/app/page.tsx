'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Product, Reel } from '@/types';
import { Section } from '@/types/section';
import { useAuth } from '@/context/AuthContext';
import PromotedProductsSection from '@/components/promotions/PromotedProductsSection';
import CategorySlider from '@/components/CategorySlider';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { ReelsSlider } from '@/components/reels/ReelsSlider';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { getRecentlyViewed } from '@/lib/viewHistory';
import { Skeleton } from '@/components/ui/skeleton';
import SectionDisplay from '@/components/sections/SectionDisplay';
import StoriesFeed from '@/components/stories/StoriesFeed';
import MainSlider from '@/components/MainSlider';
import FlashPage from '@/components/FlashSale/flashpage';

// تعريف نوع عنصر التخطيط
type LayoutItem = {
  id: string | number;
  type: 
    | 'stories' 
    | 'main_slider' 
    | 'promoted_products' 
    | 'flash_sale' 
    | 'categories' 
    | 'new_arrivals' 
    | 'best_sellers' 
    | 'top_rated' 
    | 'recently_viewed'
    | 'reels'
    | 'custom_section';
  order: number;
  isVisible: boolean;
  data?: Section;
};

// 1. ✅ تعريف الترتيب الافتراضي (للاستخدام في حال كان الباك إند فارغاً)
const DEFAULT_LAYOUT: LayoutItem[] = [
  { id: 'stories', type: 'stories', order: 1, isVisible: true },
  { id: 'slider', type: 'main_slider', order: 2, isVisible: true },
  { id: 'promo', type: 'promoted_products', order: 3, isVisible: true },
  { id: 'flash', type: 'flash_sale', order: 4, isVisible: true },
  { id: 'cats', type: 'categories', order: 5, isVisible: true },
  { id: 'reels', type: 'reels', order: 6, isVisible: true },
  { id: 'new', type: 'new_arrivals', order: 7, isVisible: true },
  { id: 'best', type: 'best_sellers', order: 8, isVisible: true },
  { id: 'top', type: 'top_rated', order: 9, isVisible: true },
  { id: 'recent', type: 'recently_viewed', order: 10, isVisible: true },
];

const ProductCarouselSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-8 w-1/3 mb-4" />
    <div className="flex space-x-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="min-w-[calc(50%-8px)] sm:min-w-[calc(33.33%-10px)] md:min-w-[calc(25%-12px)] lg:min-w-[calc(20%-12.8px)]">
          <Skeleton className="h-[200px] w-full mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  </div>
);

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [pageLayout, setPageLayout] = useState<LayoutItem[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // استخدام Promise.allSettled لضمان عدم توقف الصفحة إذا فشل طلب واحد
        const results = await Promise.allSettled([
          api.get('/browse/new-arrivals'),
          api.get('/browse/best-sellers'),
          api.get('/browse/top-rated'),
          api.get('/reels'),
          api.get('/browse/homepage/layout') // ⚠️ تأكد من أن هذا المسار يطابق الباك إند
        ]);

        // دوال مساعدة لاستخراج البيانات بأمان
        const getData = (result: PromiseSettledResult<any>) => 
          result.status === 'fulfilled' ? result.value.data : [];

        const fetchedNewArrivals = getData(results[0]) || [];
        const fetchedBestSellers = getData(results[1]) || [];
        const fetchedTopRated = getData(results[2]) || [];
        const reelsData = getData(results[3]);
        const fetchedReels = reelsData?.reels || reelsData || [];
        
        // 2. ✅ معالجة الترتيب: إذا كان الرد فارغاً، نستخدم الافتراضي
        let fetchedLayout = getData(results[4]);
        
        console.log("📥 Layout from API:", fetchedLayout); // للتشخيص

        if (!fetchedLayout || !Array.isArray(fetchedLayout) || fetchedLayout.length === 0) {
            console.warn("⚠️ Layout is empty, using default.");
            fetchedLayout = DEFAULT_LAYOUT;
        }

        setNewArrivals(fetchedNewArrivals);
        setBestSellers(fetchedBestSellers);
        setTopRated(fetchedTopRated);
        setReels(fetchedReels);
        setPageLayout(fetchedLayout);

        // منطق الأمنيات (كما هو)
        if (user && user.role_id === 5) {
           const allProductIds = [
            ...fetchedNewArrivals.map((p: any) => p.id),
            ...fetchedBestSellers.map((p: any) => p.id),
            ...fetchedTopRated.map((p: any) => p.id),
          ].filter((id, index, self) => self.indexOf(id) === index);

          if (allProductIds.length > 0) {
             try {
               const wishlistResponse = await api.post('/customer/wishlist/status', { productIds: allProductIds });
               setWishlistStatus(wishlistResponse.data || {});
             } catch(e) { console.error(e) }
          }
        }

      } catch (error) {
        console.error('Failed to fetch homepage data', error);
        // في حالة الخطأ الكلي، نستخدم الترتيب الافتراضي
        setPageLayout(DEFAULT_LAYOUT);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentlyViewed = () => {
      setRecentlyViewed(getRecentlyViewed());
    };

    fetchAllData();
    fetchRecentlyViewed();
  }, [user]);

  const renderBlock = useCallback((block: LayoutItem) => {
    // 3. ✅ التحقق من الإخفاء قبل الريندر
    if (block.isVisible === false) return null;

    // طباعة للتشخيص: لنعرف ما هي الكتل التي تحاول الظهور
    // console.log("Rendering block:", block.type); 

    switch (block.type) {
      case 'stories':
        return <StoriesFeed key={block.id} />;
      
      case 'main_slider':
        return <MainSlider key={block.id} />;
      
      case 'promoted_products':
        return <PromotedProductsSection key={block.id} />;
      
      case 'flash_sale':
        return <FlashPage key={block.id} />;
      
      case 'categories':
        return <div key={block.id} className='bg-gray-50 pb-2'><CategorySlider /></div>;
      
      case 'reels':
        if (!reels || reels.length === 0) return null;
        return (
          <div key={block.id} className="py-0 bg-black/5">
            <ReelsSlider reels={reels} />
          </div>
        );
      
      case 'new_arrivals':
        return (
          <ProductCarousel
            key={block.id}
            title={t('HomePage.newArrivals', 'وصل حديثاً')}
            products={newArrivals}
            wishlistStatus={wishlistStatus}
            viewAllLink="/products?sort=newest"
          />
        );
      
      case 'best_sellers':
        return (
          <ProductCarousel
            key={block.id}
            title={t('HomePage.bestSellers', 'الأكثر مبيعاً')}
            products={bestSellers}
            wishlistStatus={wishlistStatus}
            viewAllLink="/products?sort=best-selling"
          />
        );
      
      case 'top_rated':
        return (
          <ProductCarousel
            key={block.id}
            title={t('HomePage.topRated', 'الأعلى تقييماً')}
            products={topRated}
            wishlistStatus={wishlistStatus}
            viewAllLink="/products?sort=top-rated"
          />
        );
      
      case 'recently_viewed':
        if (recentlyViewed.length === 0) return null;
        return (
          <ProductCarousel
            key={block.id}
            title={t('HomePage.recentlyViewed', 'ما شاهدته مؤخراً')}
            products={recentlyViewed}
            wishlistStatus={wishlistStatus}
          />
        );

      case 'custom_section':
        // 4. ✅ تحقق إضافي لضمان عدم انهيار التطبيق إذا كانت البيانات ناقصة
        if (!block.data) {
           // console.warn("Custom section missing data:", block.id);
           return null;
        }
        return (
          <SectionDisplay 
            key={block.id} 
            section={block.data} 
            wishlistStatus={wishlistStatus} 
          />
        );

      default:
        // console.warn("Unknown block type:", block.type);
        return null;
    }
  }, [newArrivals, bestSellers, topRated, reels, recentlyViewed, wishlistStatus, t]);

  return (
    <main className="min-h-screen px-0 bg-white">
      {loading ? (
        <div className="space-y-8 mt-2">
          <div className="h-64 bg-gray-200 animate-pulse mb-4"></div>
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {pageLayout.length > 0 ? (
            pageLayout.map((block) => renderBlock(block))
          ) : (
             // شبكة أمان أخيرة
            <div className="text-center py-10">جاري تحميل المحتوى...</div>
          )}
        </div>
      )}

      <div className="py-12 flex justify-center bg-gray-50 mt-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-full 
                     shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          {t('HomePage.viewAllProducts', 'تصفح كل المنتجات')}
          <TrendingUp className="w-5 h-5 transform group-hover:translate-x-1 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </main>
  );
}
