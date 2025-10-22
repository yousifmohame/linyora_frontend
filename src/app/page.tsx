// frontend/src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import PromotedProductsSection from '@/components/promotions/PromotedProductsSection';
import CategorySlider from '@/components/CategorySlider'; // <-- 1. استيراد المكون الجديد
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. جلب المنتجات
        const productResponse = await api.get('/products');
        // تأكد من هيكل البيانات الصحيح
        const fetchedProducts: Product[] = productResponse.data.products || productResponse.data;
        setProducts(fetchedProducts);

        // 2. إذا كان المستخدم "عميل"، قم بجلب حالة قائمة الأمنيات
        if (user && user.role_id === 5 && fetchedProducts.length > 0) {
          const productIds = fetchedProducts.map(p => p.id);
          try {
            const wishlistResponse = await api.post('/customer/wishlist/status', { productIds });
            setWishlistStatus(wishlistResponse.data);
          } catch (wishlistError) {
            console.error("Failed to fetch wishlist status:", wishlistError);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [user]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <PromotedProductsSection />
      
      {/* 2. إضافة قسم الفئات هنا */}
      <CategorySlider />

      <div className="container mx-auto px-4 py-8">
      <h5 className="text-3xl md:text-4xl font-bold mb-8 text-center">
        <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-pink-600 
                        bg-clip-text text-transparent 
                        bg-size-200 bg-pos-0
                        hover:bg-pos-100
                        transition-all duration-2000
                        animate-gradient-x">
          {t('HomePage.title')}
        </span>
      </h5>
        {loading ? (
           <div className="text-center">{t('HomePage.loading')}</div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-500">{t('HomePage.noProducts')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isInitiallyWishlisted={wishlistStatus[product.id] || false} 
              />
            ))}
          </div>
        )}
      </div>
      <div className="mb-8 pb-6 border-b border-orange-200/50 flex justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 
                    hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-full 
                    shadow-md hover:shadow-lg transition-all duration-300 group"
        >
          عرض جميع المنتجات
          <TrendingUp className="w-5 h-5 transform group-hover:translate-x-1 group-hover:scale-110 transition-transform" />
        </Link>
      </div>

    </main>
  );
}