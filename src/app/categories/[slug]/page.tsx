// frontend/src/app/categories/[slug]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { BackButton } from '@/components/BackButton';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { LayoutGrid, SlidersHorizontal, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

interface SubCategory {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
}

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [products, setProducts] = useState<Product[]>([]);
    const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
    const [categoryName, setCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('newest');

    // 1. مرجع لحاوية التمرير
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // 2. دالة التمرير
    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 300; // مسافة التمرير
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        if (!slug) return;

        const fetchCategoryData = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/categories/${slug}/products`);
                
                if (response.data) {
                    setProducts(response.data.products || []);
                    setCategoryName(response.data.categoryName || slug);
                    setSubcategories(response.data.subcategories || []);
                } else {
                    setProducts([]);
                }

            } catch (error) {
                console.error("Failed to fetch category data:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [slug]);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'price_desc') return b.price - a.price;
        return 0;
    });

    return (
        <main className="min-h-screen bg-gray-50/50 pb-12">
            <div className="container mx-auto px-4 py-8">
                
                {/* Header Section */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="w-fit">
                        <BackButton />
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                        <div>
                            {loading ? (
                                <Skeleton className="h-10 w-64 mb-2" />
                            ) : (
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-2">
                                    {categoryName}
                                </h1>
                            )}
                            <p className="text-gray-500 mt-2">تصفح أفضل المنتجات المختارة لك في قسم {categoryName}</p>
                        </div>
                    </div>
                </div>

                {/* Subcategories Section with Scroll Buttons */}
                {!loading && subcategories.length > 0 && (
                    <div className="mb-10 relative group/scroll">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4" /> تسوق حسب الفئة
                        </h2>
                        
                        <div className="relative">
                            {/* Left Scroll Button */}
                            <button 
                                onClick={() => scroll('left')}
                                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow-md hover:bg-white hover:text-purple-600 transition-all opacity-0 group-hover/scroll:opacity-100 disabled:opacity-0 -ml-2 lg:-ml-4"
                                aria-label="Scroll Left"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Scrollable Container */}
                            {/* تم تغيير flex-wrap إلى flex-nowrap وإضافة overflow-x-auto وإخفاء شريط التمرير */}
                            <div 
                                ref={scrollContainerRef}
                                className="flex gap-3 px-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // لإخفاء السكرول بار في فايرفوكس وIE
                            >
                                {subcategories.map((sub) => (
                                    <Link key={sub.id} href={`/categories/${sub.slug}`}>
                                    <div className="group hover:shadow-md text-center transition-all duration-300 rounded-xl px-5 py-3 grid gap-3 cursor-pointer">
                                        {/* إذا كان للتصنيف صورة */}
                                        {sub.image_url && (
                                            <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden">
                                                <img src={sub.image_url} alt={sub.name} className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        
                                        <div>
                                            <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                                                {sub.name}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                                ))}
                            </div>

                            {/* Right Scroll Button */}
                            <button 
                                onClick={() => scroll('right')}
                                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full p-2 shadow-md hover:bg-white hover:text-purple-600 transition-all opacity-0 group-hover/scroll:opacity-100 disabled:opacity-0 -mr-2 lg:-mr-4"
                                aria-label="Scroll Right"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Toolbar & Stats */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm z-10">
                    <div className="flex items-center gap-2 text-gray-600 text-sm font-medium">
                        <LayoutGrid className="w-4 h-4" />
                        <span>{products.length} منتج</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 w-full sm:w-[200px]">
                            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full h-9 text-sm">
                                    <SelectValue placeholder="ترتيب حسب" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                    <SelectItem value="newest">الأحدث</SelectItem>
                                    <SelectItem value="price_asc">السعر: من الأقل للأعلى</SelectItem>
                                    <SelectItem value="price_desc">السعر: من الأعلى للأقل</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-64 w-full rounded-xl" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {sortedProducts.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                isInitiallyWishlisted={false} 
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="bg-gray-50 p-4 rounded-full mb-4">
                            <Tag className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد منتجات</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            لم يتم العثور على منتجات في هذا القسم حالياً. يرجى التحقق لاحقاً أو تصفح أقسام أخرى.
                        </p>
                        <Link href="/products" className="mt-6">
                            <Button>تصفح كل المنتجات</Button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}