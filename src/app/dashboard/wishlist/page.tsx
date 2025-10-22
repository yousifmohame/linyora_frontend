// app/dashboard/wishlist/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard'; // استيراد بطاقة المنتج الاحترافية

export default function WishlistPage() {
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchWishlist = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/customer/wishlist');
            setWishlistProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
                        <Heart className="w-8 h-8 text-rose-400" />
                    </div>
                    <p className="text-gray-600">جاري تحميل قائمة الأمنيات...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                        <Heart className="w-8 h-8 text-rose-500" />
                        قائمة الأمنيات
                    </h1>
                    <p className="text-gray-500 mt-2">المنتجات التي أضفتها للمتابعة والشراء لاحقاً.</p>
                </header>

                {wishlistProducts.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl text-center py-16">
                        <CardContent>
                            <div className="flex justify-center mb-6">
                                <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-purple-100 rounded-3xl flex items-center justify-center">
                                    <Heart className="w-12 h-12 text-rose-400" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">قائمة أمنياتك فارغة</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                ابدأ بتصفح مجموعتنا الفاخرة وأضف ما يعجبك للعودة إليه لاحقاً.
                            </p>
                            <Link href="/">
                                <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-8 rounded-2xl">
                                    <Sparkles className="w-4 h-4 ml-2" />
                                    تصفح المنتجات الآن
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlistProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                isInitiallyWishlisted={true} // كل المنتجات هنا هي بالفعل في القائمة
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}