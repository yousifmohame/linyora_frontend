// linora-platform/frontend/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Product, Reel } from '@/types';
import { useAuth } from '@/context/AuthContext';
import PromotedProductsSection from '@/components/promotions/PromotedProductsSection';
import CategorySlider from '@/components/CategorySlider';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { ReelsSlider } from '@/components/reels/ReelsSlider';
import { ProductCarousel } from '@/components/products/ProductCarousel'; // استيراد المكون الجديد
import { getRecentlyViewed } from '@/lib/viewHistory'; // استيراد دالة "المشاهدة مؤخراً"
import { Skeleton } from '@/components/ui/skeleton'; // لاستخدامها أثناء التحميل

// مكون Skeleton لتحسين تجربة التحميل
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
  
  // تقسيم البيانات إلى أقسام
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // جلب البيانات المنسقة من الـ API
        const [
          newArrivalsRes,
          bestSellersRes,
          topRatedRes,
          reelsResponse
        ] = await Promise.all([
          api.get('/browse/new-arrivals'),
          api.get('/browse/best-sellers'),
          api.get('/browse/top-rated'),
          api.get('/reels')
        ]);

        const fetchedNewArrivals = newArrivalsRes.data || [];
        const fetchedBestSellers = bestSellersRes.data || [];
        const fetchedTopRated = topRatedRes.data || [];
        const fetchedReels = reelsResponse.data.reels || reelsResponse.data || [];

        setNewArrivals(fetchedNewArrivals);
        setBestSellers(fetchedBestSellers);
        setTopRated(fetchedTopRated);
        setReels(fetchedReels);

        // جلب قائمة الأمنيات لجميع المنتجات المعروضة
        if (user && user.role_id === 5) {
          const allProductIds = [
            ...fetchedNewArrivals.map((p: Product) => p.id),
            ...fetchedBestSellers.map((p: Product) => p.id),
            ...fetchedTopRated.map((p: Product) => p.id),
          ].filter((id, index, self) => self.indexOf(id) === index); // إزالة التكرار

          if (allProductIds.length > 0) {
            try {
              const wishlistResponse = await api.post('/customer/wishlist/status', { productIds: allProductIds });
              setWishlistStatus(wishlistResponse.data || {});
            } catch (wishlistError) {
              console.error("Failed to fetch wishlist status:", wishlistError);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch homepage data', error);
      } finally {
        setLoading(false);
      }
    };

    // جلب "المشاهدة مؤخراً" من localStorage (يعمل فقط في client-side)
    const fetchRecentlyViewed = () => {
      setRecentlyViewed(getRecentlyViewed());
    };

    fetchAllData();
    fetchRecentlyViewed();
  }, [user]);

  return (
    <main className="min-h-screen px-0 lg:px-20 bg-gray-100">
      {/* الأقسام العلوية كما هي */}
      <PromotedProductsSection />
      <CategorySlider />

      {loading ? (
        <>
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
        </>
      ) : (
        <>

          {/* قسم الريلز للفصل بين أقسام المنتجات */}
          <ReelsSlider reels={reels} />

          {/* الأقسام الجديدة المنسقة */}
          <ProductCarousel
            title={t('HomePage.newArrivals', 'وصل حديثاً')}
            products={newArrivals}
            wishlistStatus={wishlistStatus}
            viewAllLink="/products?sort=newest"
          />
          <ProductCarousel
            title={t('HomePage.bestSellers', 'الأكثر مبيعاً')}
            products={bestSellers}
            wishlistStatus={wishlistStatus}
            viewAllLink="/products?sort=best-selling"
          />
          <ProductCarousel
            title={t('HomePage.topRated', 'الأعلى تقييماً')}
            products={topRated}
            wishlistStatus={wishlistStatus}
            viewAllLink="/products?sort=top-rated"
          />
          <ProductCarousel
            title={t('HomePage.recentlyViewed', 'ما شاهدته مؤخراً')}
            products={recentlyViewed} // يتم جلبه من localStorage
            wishlistStatus={wishlistStatus}
          />
        </>
      )}

      {/* زر عرض كل المنتجات */}
      <div className="mb-8 pb-6 border-b border-orange-200/50 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 
                     hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-full 
                     shadow-md hover:shadow-lg transition-all duration-300 group"
        >
          {t('HomePage.viewAllProducts', 'تصفح كل المنتجات')}
          <TrendingUp className="w-5 h-5 transform group-hover:translate-x-1 group-hover:scale-110 transition-transform" />
        </Link>
      </div>
    </main>
  );
}
