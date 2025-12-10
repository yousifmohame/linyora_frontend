'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

interface RelatedProductsSectionProps {
  categoryId?: number;    // الخيار الأول: حسب القسم
  merchantId?: number;    // الخيار الثاني: حسب التاجر
  currentProductId?: number;
  title?: string;
  limit?: number;
  className?: string;
}

export default function RelatedProductsSection({
  categoryId,
  merchantId,
  currentProductId,
  title, // سنجعل العنوان ديناميكيًا إذا لم يتم تمريره
  limit = 4,
  className = ""
}: RelatedProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // تحديد العنوان الافتراضي بناءً على طريقة الجلب
  const displayTitle = title || (categoryId ? "منتجات مشابهة" : merchantId ? "المزيد من هذا المتجر" : "وصل حديثاً");

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true);
      try {
        const params: any = {
          limit: limit + 2 // نطلب زيادة قليلاً لضمان وجود بدائل بعد الفلترة
        };

        // 
        // منطق تحديد الأولويات: القسم > التاجر > لا شيء (عام)
        if (categoryId) {
          params.category_id = categoryId;
        } else if (merchantId) {
          params.merchant_id = merchantId;
        }
        // إذا لم يوجد كلاهما، سيتم جلب المنتجات العامة (أحدث المنتجات)

        const { data } = await api.get(`/products`, { params });

        let productsList: Product[] = Array.isArray(data) ? data : data.products || [];

        // استبعاد المنتج الحالي
        if (currentProductId) {
          productsList = productsList.filter(p => p.id !== Number(currentProductId));
        }

        setProducts(productsList.slice(0, limit));
      } catch (error) {
        console.error("Failed to load related products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryId, merchantId, currentProductId, limit]);

  if (loading) {
    return (
      <div className={`py-8 ${className}`}>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-[250px] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className={`py-10 border-t border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {displayTitle}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard 
                key={product.id}
                product={product} isInitiallyWishlisted={false}          />
        ))}
      </div>
    </section>
  );
}