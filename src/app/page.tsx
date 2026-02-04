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

// ------------------------------------------------------------------
// 1. تعريف الأنواع
// ------------------------------------------------------------------
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
  section_id?: number; // خاص بالأقسام المخصصة
};

// ------------------------------------------------------------------
// 2. الترتيب الافتراضي (Fallback)
// ------------------------------------------------------------------
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

// مكون التحميل
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
  
  // ------------------------------------------------------------------
  // 3. إدارة الحالة (State Management)
  // ------------------------------------------------------------------
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  
  // خريطة لتخزين الأقسام المخصصة ليسهل الوصول إليها بالـ ID
  const [sectionsMap, setSectionsMap] = useState<Record<number, Section>>({});
  
  // الترتيب النهائي للصفحة
  const [pageLayout, setPageLayout] = useState<LayoutItem[]>([]);
  
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  // ------------------------------------------------------------------
  // 4. جلب البيانات (Fetching)
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // نطلب كل شيء في نفس الوقت لتقليل وقت الانتظار
        const results = await Promise.allSettled([
          api.get('/browse/new-arrivals'),
          api.get('/browse/best-sellers'),
          api.get('/browse/top-rated'),
          api.get('/reels'),
          api.get('/sections/active'),       // جلب الأقسام بمنتجاتها
          api.get('/browse/homepage/layout') // جلب الترتيب فقط
        ]);

        const getData = (res: PromiseSettledResult<any>) => 
          res.status === 'fulfilled' ? res.value.data : [];

        // توزيع البيانات على المتغيرات
        setNewArrivals(getData(results[0]) || []);
        setBestSellers(getData(results[1]) || []);
        setTopRated(getData(results[2]) || []);
        
        const reelsData = getData(results[3]);
        setReels(reelsData?.reels || reelsData || []);
        
        // --- المنطق الذكي: معالجة الأقسام ---
        const fetchedSections = getData(results[4]) || [];
        const secMap: Record<number, Section> = {};
        
        if (Array.isArray(fetchedSections)) {
            fetchedSections.forEach((sec: Section) => {
                // نخزن القسم باستخدام الـ ID كمفتاح للخريطة
                secMap[sec.id] = sec;
            });
        }
        setSectionsMap(secMap);

        // --- المنطق الذكي: معالجة الترتيب ---
        let layoutData = getData(results[5]);
        
        // التحقق من صحة الترتيب القادم من الباك إند
        if (layoutData && Array.isArray(layoutData) && layoutData.length > 0) {
            setPageLayout(layoutData);
        } else {
            // إذا لم يوجد ترتيب محفوظ، نستخدم الافتراضي
            console.log("Using Default Layout");
            setPageLayout(DEFAULT_LAYOUT);
        }

        // --- جلب حالة المفضلة (Wishlist) ---
        if (user && user.role_id === 5) {
             const allProducts = [
              ...(getData(results[0]) || []),
              ...(getData(results[1]) || []),
              ...(getData(results[2]) || [])
            ];
            
            const allProductIds = allProducts
                .map((p: any) => p.id)
                .filter((id, index, self) => self.indexOf(id) === index);

            if (allProductIds.length > 0) {
               try {
                 const ws = await api.post('/customer/wishlist/status', { productIds: allProductIds });
                 setWishlistStatus(ws.data || {});
               } catch(e) { console.error("Wishlist Error:", e); }
            }
        }

      } catch (error) {
        console.error('Failed to fetch homepage data', error);
      } finally {
        setLoading(false);
      }
    };

    setRecentlyViewed(getRecentlyViewed());
    fetchAllData();
  }, [user]);

  // ------------------------------------------------------------------
  // 5. دالة العرض (Renderer)
  // ------------------------------------------------------------------
  const renderBlock = useCallback((block: LayoutItem) => {
    // عدم عرض العناصر المخفية
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
      
      // ✅ التعامل مع الأقسام المخصصة
      case 'custom_section':
        // 1. نتأكد أن لدينا ID للقسم
        if (!block.section_id) return null;

        // 2. نبحث عن بيانات القسم في الخريطة التي جلبناها من /sections/active
        const sectionData = sectionsMap[block.section_id];
        
        // 3. إذا وجدنا القسم، نعرضه
        if (sectionData) {
            return (
              <SectionDisplay 
                key={block.id} 
                section={sectionData} 
                wishlistStatus={wishlistStatus} 
              />
            );
        }
        // إذا كان القسم موجوداً في الترتيب ولكن تم حذفه من قاعدة البيانات، لا نعرض شيئاً
        return null;

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

      default:
        return null;
    }
  }, [newArrivals, bestSellers, topRated, reels, recentlyViewed, wishlistStatus, sectionsMap, t]);

  // ------------------------------------------------------------------
  // 6. واجهة المستخدم (UI)
  // ------------------------------------------------------------------
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
          {/* التكرار على مصفوفة الترتيب لعرض المكونات */}
          {pageLayout.length > 0 ? (
             pageLayout.map((block, index) => {
                 // إضافة index للمفتاح لضمان التفرد في حال تكرار الكتل
                 const uniqueKey = `${block.id}-${index}`;
                 return <div key={uniqueKey}>{renderBlock(block)}</div>;
             })
          ) : (
             <div className="text-center py-10">جاري تحميل المحتوى...</div>
          )}
        </div>
      )}

      {/* زر تصفح الكل الثابت في الأسفل */}
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
