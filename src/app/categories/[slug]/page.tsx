// frontend/src/app/categories/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [categoryName, setCategoryName] = useState(''); // لعرض اسم الفئة
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchProductsByCategory = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/categories/${slug}/products`);
                
                // --- ✨ تم التصحيح هنا ---
                // تأكد من أن الـ API أعاد البيانات بالشكل المتوقع قبل تحديث الحالة
                if (response.data && Array.isArray(response.data.products)) {
                    setProducts(response.data.products);
                    setCategoryName(response.data.categoryName || slug); // استخدم اسم الفئة من الـAPI
                } else {
                    setProducts([]); // اضبطها كمصفوفة فارغة في حالة عدم وجود منتجات
                }

            } catch (error) {
                console.error("Failed to fetch products for category:", error);
                setProducts([]); // اضبطها كمصفوفة فارغة عند حدوث خطأ
            } finally {
                setLoading(false);
            }
        };

        fetchProductsByCategory();
    }, [slug]);

    return (
        <main className="container mx-auto p-8">
            <h1 className="text-3xl text-center font-bold mb-8">
                {/* استخدام اسم الفئة الديناميكي */}
                {categoryName ? `منتجات قسم: ${categoryName}` : 'جاري تحميل القسم...'}
            </h1>
            {loading ? (
                <p className="text-center text-lg">جاري تحميل المنتجات...</p>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} isInitiallyWishlisted={false} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-lg text-gray-600">لا توجد منتجات في هذا القسم حاليًا.</p>
            )}
        </main>
    );
}