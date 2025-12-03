'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Product, Reel } from '@/types';
import { Section } from '@/types/section'; // تأكد من استيراد النوع الجديد
import { useAuth } from '@/context/AuthContext';
import PromotedProductsSection from '@/components/promotions/PromotedProductsSection';
import CategorySlider from '@/components/CategorySlider';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { ReelsSlider } from '@/components/reels/ReelsSlider';
import { ProductCarousel } from '@/components/products/ProductCarousel';
import { getRecentlyViewed } from '@/lib/viewHistory';
import { Skeleton } from '@/components/ui/skeleton';
import SectionDisplay from '@/components/sections/SectionDisplay'; // استيراد مكون الأقسام

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
  
  // الحالة الجديدة للأقسام المخصصة
  const [sections, setSections] = useState<Section[]>([]);
  
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
          reelsResponse,
          sectionsResponse // استجابة الأقسام
        ] = await Promise.all([
          api.get('/browse/new-arrivals'),
          api.get('/browse/best-sellers'),
          api.get('/browse/top-rated'),
          api.get('/reels'),
          api.get('/sections/active') // طلب الأقسام النشطة
        ]);

        const fetchedNewArrivals = newArrivalsRes.data || [];
        const fetchedBestSellers = bestSellersRes.data || [];
        const fetchedTopRated = topRatedRes.data || [];
        const fetchedReels = reelsResponse.data.reels || reelsResponse.data || [];
        const fetchedSections = sectionsResponse.data || [];

        setNewArrivals(fetchedNewArrivals);
        setBestSellers(fetchedBestSellers);
        setTopRated(fetchedTopRated);
        setReels(fetchedReels);
        setSections(fetchedSections);

        // جلب قائمة الأمنيات لجميع المنتجات المعروضة
        if (user && user.role_id === 5) {
          const allProductIds = [
            ...fetchedNewArrivals.map((p: Product) => p.id),
            ...fetchedBestSellers.map((p: Product) => p.id),
            ...fetchedTopRated.map((p: Product) => p.id),
          ].filter((id, index, self) => self.indexOf(id) === index);

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

    const fetchRecentlyViewed = () => {
      setRecentlyViewed(getRecentlyViewed());
    };

    fetchAllData();
    fetchRecentlyViewed();
  }, [user]);

  return (
    <main className="min-h-screen px-0 bg-white">
      {/* 1. الأقسام الثابتة العلوية */}
      <div className="bg-gray-50 pb-8">
        <PromotedProductsSection />
        <CategorySlider />
      </div>

      {loading ? (
        <div className="space-y-8 mt-8">
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
        </div>
      ) : (
        <div className="space-y-12">

          {/* 2. قسم وصل حديثاً */}
          <ProductCarousel
            title={t('HomePage.newArrivals', 'وصل حديثاً')}
            products={newArrivals}
            wishlistStatus={wishlistStatus}
            viewAllLink="/products?sort=newest"
          />

          {/* 3. الأقسام الديناميكية (Dynamic Sections) - الجزء الذي أضفناه */}
          {/* نعرض الأقسام هنا. يمكننا وضعها بين الأقسام الثابتة أو جميعها متتالية */}
          {sections.map((section) => (
            <SectionDisplay 
              key={section.id} 
              section={section} 
              wishlistStatus={wishlistStatus} 
            />
          ))}

          {/* 4. فاصل الريلز */}
          <div className="py-8 bg-black/5">
            <ReelsSlider reels={reels} />
          </div>

          {/* 5. باقي الأقسام الثابتة */}
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
          
          {recentlyViewed.length > 0 && (
             <ProductCarousel
               title={t('HomePage.recentlyViewed', 'ما شاهدته مؤخراً')}
               products={recentlyViewed}
               wishlistStatus={wishlistStatus}
             />
          )}
        </div>
      )}

      {/* زر عرض كل المنتجات */}
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