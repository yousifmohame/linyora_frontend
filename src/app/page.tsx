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
import { TrendingUp, ArrowUp, ArrowDown, Save, Loader2 } from 'lucide-react'; // ✅ إضافة أيقونات جديدة
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
  section_id?: number;
};

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
  
  // ✅ التحقق من صلاحية الأدمن
  const isAdmin = user?.role_id === 1;

  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [topRated, setTopRated] = useState<Product[]>([]);
  const [reels, setReels] = useState<Reel[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [sectionsMap, setSectionsMap] = useState<Record<number, Section>>({});
  const [pageLayout, setPageLayout] = useState<LayoutItem[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  // ✅ حالات جديدة للحفظ والتحرير
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const results = await Promise.allSettled([
          api.get('/browse/new-arrivals'),
          api.get('/browse/best-sellers'),
          api.get('/browse/top-rated'),
          api.get('/reels'),
          api.get('/sections/active'),
          api.get('/browse/homepage/layout')
        ]);

        const getData = (res: PromiseSettledResult<any>) => 
          res.status === 'fulfilled' ? res.value.data : [];

        setNewArrivals(getData(results[0]) || []);
        setBestSellers(getData(results[1]) || []);
        setTopRated(getData(results[2]) || []);
        
        const reelsData = getData(results[3]);
        setReels(reelsData?.reels || reelsData || []);
        
        const fetchedSections = getData(results[4]) || [];
        const secMap: Record<number, Section> = {};
        if (Array.isArray(fetchedSections)) {
            fetchedSections.forEach((sec: Section) => {
                secMap[sec.id] = sec;
            });
        }
        setSectionsMap(secMap);

        let layoutData = getData(results[5]);
        if (layoutData && Array.isArray(layoutData) && layoutData.length > 0) {
            setPageLayout(layoutData);
        } else {
            console.log("Using Default Layout");
            setPageLayout(DEFAULT_LAYOUT);
        }

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
               } catch(e) { console.error(e); }
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
  // ✅ وظائف الأدمن (الترتيب والحفظ)
  // ------------------------------------------------------------------
  
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...pageLayout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // التحقق من الحدود
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;

    // تبديل العناصر
    const temp = newLayout[index];
    newLayout[index] = newLayout[targetIndex];
    newLayout[targetIndex] = temp;

    // تحديث الترتيب (order) بناءً على الاندكس الجديد
    const updatedOrderLayout = newLayout.map((item, idx) => ({
        ...item,
        order: idx + 1
    }));

    setPageLayout(updatedOrderLayout);
    setHasChanges(true); // تفعيل زر الحفظ
  };

  const saveLayout = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    try {
        // نرسل الترتيب الجديد للباك إند
        // ملاحظة: نرسل فقط البيانات الضرورية للحفظ (بدون الـ data الضخمة)
        const layoutToSave = pageLayout.map(({ data, ...rest }: any) => rest);
        
        await api.post('/browse/homepage/layout', layoutToSave);
        
        setHasChanges(false);
        // يمكنك إضافة إشعار نجاح هنا (Toast)
        alert('تم حفظ ترتيب الصفحة بنجاح ✅');
    } catch (error) {
        console.error("Failed to save layout", error);
        alert('فشل حفظ الترتيب ❌');
    } finally {
        setIsSaving(false);
    }
  };

  // ------------------------------------------------------------------
  // دالة العرض
  // ------------------------------------------------------------------
  const renderBlock = useCallback((block: LayoutItem) => {
    // للأدمن: نعرض كل شيء حتى لو مخفي لكي يستطيع التحكم به
    // للمستخدم العادي: نخفي العناصر المخفية
    if (!isAdmin && block.isVisible === false) return null;

    let content = null;

    switch (block.type) {
      case 'stories': content = <StoriesFeed key={block.id} />; break;
      case 'main_slider': content = <MainSlider key={block.id} />; break;
      case 'promoted_products': content = <PromotedProductsSection key={block.id} />; break;
      case 'flash_sale': content = <FlashPage key={block.id} />; break;
      case 'categories': content = <div key={block.id} className='bg-gray-50 pb-2'><CategorySlider /></div>; break;
      
      case 'custom_section':
        if (!block.section_id) return null;
        const sectionData = sectionsMap[block.section_id];
        if (sectionData) {
            content = <SectionDisplay key={block.id} section={sectionData} wishlistStatus={wishlistStatus} />;
        } else {
            // رسالة للأدمن إذا كان القسم مفقوداً
            content = isAdmin ? <div className="p-4 text-red-500 border border-red-200 bg-red-50 text-center">قسم مخصص مفقود (ID: {block.section_id})</div> : null;
        }
        break;

      case 'reels':
        if (!reels || reels.length === 0) return null;
        content = <div key={block.id} className="py-0 bg-black/5"><ReelsSlider reels={reels} /></div>;
        break;
      
      case 'new_arrivals':
        content = <ProductCarousel key={block.id} title={t('HomePage.newArrivals', 'وصل حديثاً')} products={newArrivals} wishlistStatus={wishlistStatus} viewAllLink="/products?sort=newest" />;
        break;
      
      case 'best_sellers':
        content = <ProductCarousel key={block.id} title={t('HomePage.bestSellers', 'الأكثر مبيعاً')} products={bestSellers} wishlistStatus={wishlistStatus} viewAllLink="/products?sort=best-selling" />;
        break;
      
      case 'top_rated':
        content = <ProductCarousel key={block.id} title={t('HomePage.topRated', 'الأعلى تقييماً')} products={topRated} wishlistStatus={wishlistStatus} viewAllLink="/products?sort=top-rated" />;
        break;
      
      case 'recently_viewed':
        if (recentlyViewed.length === 0) return null;
        content = <ProductCarousel key={block.id} title={t('HomePage.recentlyViewed', 'ما شاهدته مؤخراً')} products={recentlyViewed} wishlistStatus={wishlistStatus} />;
        break;

      default: content = null;
    }

    return content;
  }, [newArrivals, bestSellers, topRated, reels, recentlyViewed, wishlistStatus, sectionsMap, t, isAdmin]); // أضفنا isAdmin

  // ------------------------------------------------------------------
  // واجهة المستخدم
  // ------------------------------------------------------------------
  return (
    <main className="min-h-screen px-0 bg-white relative">
      
      {/* ✅ زر الحفظ للأدمن (يظهر فقط عند وجود تغييرات) */}
      {isAdmin && hasChanges && (
        <div className="fixed bottom-8 right-8 z-50">
            <button
                onClick={saveLayout}
                disabled={isSaving}
                className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full shadow-2xl hover:bg-gray-800 transition-all animate-bounce"
            >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span className="font-bold">حفظ الترتيب الجديد</span>
            </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-8 mt-2">
          <ProductCarouselSkeleton />
          <ProductCarouselSkeleton />
        </div>
      ) : (
        <div className="flex flex-col gap-0">
          {pageLayout.length > 0 ? (
             pageLayout.map((block, index) => {
                 const uniqueKey = `${block.id}-${index}`;
                 const content = renderBlock(block);

                 if (!content) return null;

                 // ✅ إذا كان أدمن، نغلف المكون بأزرار التحكم
                 if (isAdmin) {
                     return (
                         <div key={uniqueKey} className="relative group border-2 border-transparent hover:border-blue-500/30 transition-all">
                             
                             {/* شريط التحكم */}
                             <div className="absolute left-2 top-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2 bg-white/90 backdrop-blur shadow-lg rounded-lg p-1.5 border border-gray-200">
                                 {/* زر للأعلى */}
                                 <button 
                                    onClick={() => moveSection(index, 'up')}
                                    disabled={index === 0}
                                    className="p-2 hover:bg-blue-50 rounded-md text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="تحريك للأعلى"
                                 >
                                     <ArrowUp size={20} />
                                 </button>
                                 
                                 <div className="h-px bg-gray-200 w-full"></div>

                                 {/* زر للأسفل */}
                                 <button 
                                    onClick={() => moveSection(index, 'down')}
                                    disabled={index === pageLayout.length - 1}
                                    className="p-2 hover:bg-blue-50 rounded-md text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="تحريك للأسفل"
                                 >
                                     <ArrowDown size={20} />
                                 </button>

                                 {/* رقم الترتيب */}
                                 <span className="text-xs font-mono text-center text-gray-400 mt-1">
                                     {index + 1}
                                 </span>
                             </div>

                             {/* المحتوى الفعلي */}
                             {content}
                         </div>
                     );
                 }

                 // للمستخدم العادي
                 return <div key={uniqueKey}>{content}</div>;
             })
          ) : (
             <div className="text-center py-10">جاري تحميل المحتوى...</div>
          )}
        </div>
      )}

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
