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

// Skeleton Component
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
  
  // 1. نخزن البيانات كما كنت تفعل تماماً
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  
  // 2. حالة جديدة للترتيب (Layout)
  const [pageLayout, setPageLayout] = useState<any[]>([]);
  
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // جلب البيانات + جلب الترتيب في نفس الوقت
        const results = await Promise.allSettled([
          api.get('/browse/new-arrivals'),
          api.get('/browse/best-sellers'),
          api.get('/browse/top-rated'),
          api.get('/reels'),
          api.get('/browse/homepage/layout') // ✅ هذا الرابط يجلب الترتيب + الأقسام المخصصة
        ]);

        const getData = (res: any) => res.status === 'fulfilled' ? res.value.data : [];

        // تعيين بيانات المنتجات والريلز
        const fetchedNewArrivals = getData(results[0]) || [];
        const fetchedBestSellers = getData(results[1]) || [];
        const fetchedTopRated = getData(results[2]) || [];
        const fetchedReels = getData(results[3]).reels || getData(results[3]) || [];
        
        // تعيين الترتيب (الذي يحتوي بداخله على بيانات الأقسام)
        const layoutData = getData(results[4]);
        
        setNewArrivals(fetchedNewArrivals);
        setBestSellers(fetchedBestSellers);
        setTopRated(fetchedTopRated);
        setReels(fetchedReels);
        
        // إذا فشل جلب الترتيب أو كان فارغاً، نستخدم الترتيب الافتراضي محلياً
        if (Array.isArray(layoutData) && layoutData.length > 0) {
            setPageLayout(layoutData);
        } else {
            // Fallback Layout (نفس ترتيبك الأصلي)
            // ملاحظة: الأقسام المخصصة لن تظهر هنا إذا فشل الاتصال لأن بياناتها تأتي من Layout
            setPageLayout([
                { type: 'stories', id: 'def1' },
                { type: 'main_slider', id: 'def2' },
                { type: 'promoted_products', id: 'def3' },
                { type: 'flash_sale', id: 'def4' },
                { type: 'categories', id: 'def5' },
                { type: 'reels', id: 'def6' },
                { type: 'new_arrivals', id: 'def7' },
                { type: 'best_sellers', id: 'def8' },
                { type: 'top_rated', id: 'def9' },
                { type: 'recently_viewed', id: 'def10' },
            ]);
        }

        // جلب الأمنيات (نفس كودك)
        if (user && user.role_id === 5) {
             const allProductIds = [
              ...fetchedNewArrivals.map((p:any) => p.id),
              ...fetchedBestSellers.map((p:any) => p.id),
              ...fetchedTopRated.map((p:any) => p.id),
            ].filter((id, index, self) => self.indexOf(id) === index);

            if (allProductIds.length > 0) {
               try {
                 const ws = await api.post('/customer/wishlist/status', { productIds: allProductIds });
                 setWishlistStatus(ws.data || {});
               } catch(e) {}
            }
        }

      } catch (error) {
        console.error('Failed to fetch data', error);
      } finally {
        setLoading(false);
      }
    };

    setRecentlyViewed(getRecentlyViewed());
    fetchAllData();
  }, [user]);

  // دالة توزيع المكونات بناءً على النوع
  const renderBlock = useCallback((block: any) => {
    if (block.isVisible === false) return null;

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
      
      // ✅ الأقسام المخصصة تأتي بياناتها من الباك إند داخل block.data
      case 'custom_section':
        if (!block.data) return null;
        return (
          <SectionDisplay 
            key={block.id} 
            section={block.data} 
            wishlistStatus={wishlistStatus} 
          />
        );

      // باقي المكونات تستخدم البيانات التي جلبناها في الـ State
      case 'reels':
        if (!reels || reels.length === 0) return null;
        return <div key={block.id} className="py-0 bg-black/5"><ReelsSlider reels={reels} /></div>;
      
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

      default:
        return null;
    }
  }, [newArrivals, bestSellers, topRated, reels, recentlyViewed, wishlistStatus, t]);

  return (
    <main className="min-h-screen px-0 bg-white">
      {loading ? (
        <div className="space-y-8 mt-2">
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {/* هنا يتم رسم الصفحة بناءً على الترتيب القادم من الباك إند */}
          {pageLayout.map((block) => renderBlock(block))}
        </div>
      )}

      {/* زر تصفح الكل الثابت */}
      <div className="py-12 flex justify-center bg-gray-50 mt-8">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          {t('HomePage.viewAllProducts', 'تصفح كل المنتجات')}
          <TrendingUp className="w-5 h-5 transform group-hover:translate-x-1 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </main>
  );
}
