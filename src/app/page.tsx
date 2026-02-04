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

// تعريف نوع عنصر التخطيط (Layout Item)
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
    | 'custom_section'; // للأقسام المخصصة القادمة من جدول sections
  order: number;
  isVisible: boolean;
  data?: Section; // في حالة القسم المخصص، نحتفظ ببياناته هنا
};

// مكون Skeleton
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
  
  // تخزين البيانات الخام
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  
  // تخزين ترتيب الصفحة
  const [pageLayout, setPageLayout] = useState<LayoutItem[]>([]);
  
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchAllData = async () => {
        try {
          setLoading(true);

          const [
            newArrivalsRes,
            bestSellersRes,
            topRatedRes,
            reelsResponse,
            layoutResponse // ✅ هذا هو الطلب الجديد
          ] = await Promise.all([
            api.get('/browse/new-arrivals'),
            api.get('/browse/best-sellers'),
            api.get('/browse/top-rated'),
            api.get('/reels'),
            api.get('/browse/homepage/layout') // ✅ طلب الترتيب من الباك إند
          ]);

          const fetchedNewArrivals = newArrivalsRes.data || [];
          const fetchedBestSellers = bestSellersRes.data || [];
          const fetchedTopRated = topRatedRes.data || [];
          const fetchedReels = reelsResponse.data.reels || reelsResponse.data || [];
          
          // ✅ استقبال الترتيب من الباك إند
          const fetchedLayout = layoutResponse.data || [];

          setNewArrivals(fetchedNewArrivals);
          setBestSellers(fetchedBestSellers);
          setTopRated(fetchedTopRated);
          setReels(fetchedReels);
          setPageLayout(fetchedLayout); // ✅ تحديث الـ State بالترتيب الحقيقي
        // جلب قائمة الأمنيات
        if (user && user.role_id === 5) {
           // ... (نفس الكود السابق لجلب التفضيلات)
           // يفضل تجميع الـ IDs هنا بناءً على البيانات المحملة
           const allProductIds = [
            ...fetchedNewArrivals.map((p: Product) => p.id),
            ...fetchedBestSellers.map((p: Product) => p.id),
            ...fetchedTopRated.map((p: Product) => p.id),
          ].filter((id, index, self) => self.indexOf(id) === index);

          if (allProductIds.length > 0) {
             const wishlistResponse = await api.post('/customer/wishlist/status', { productIds: allProductIds });
             setWishlistStatus(wishlistResponse.data || {});
          }
        }

      } catch (error) {
        console.error('Failed to fetch homepage data', error);
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

  // دالة المابينج (Mapping) لتحويل الكائنات إلى مكونات
  const renderBlock = useCallback((block: LayoutItem) => {
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
        if (reels.length === 0) return null;
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
        if (!block.data) return null;
        return (
          <SectionDisplay 
            key={block.id} 
            section={block.data} 
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
          {/* عرض Skeleton أثناء التحميل */}
          <div className="h-64 bg-gray-200 animate-pulse mb-4"></div>
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {/* التكرار على القائمة المرتبة لعرض المكونات */}
          {pageLayout.map((block) => renderBlock(block))}
        </div>
      )}

      {/* زر عرض كل المنتجات - يمكن جعله أيضاً جزءاً من الترتيب إذا أردت */}
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
