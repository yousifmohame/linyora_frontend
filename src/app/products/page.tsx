'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PackageSearch, SlidersHorizontal, Grid, List, SortAsc, Filter, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterSidebar from '@/components/products/FilterSidebar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

// مكون الهيكل العظمي للتحميل - معدل للهواتف
const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
        <div className="container mx-auto px-3 py-6">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* الشريط الجانبي للشاشات الكبيرة */}
                <div className="hidden lg:block lg:w-80">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-rose-200">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="mb-4">
                                <Skeleton className="h-5 w-28 bg-rose-200 rounded mb-2" />
                                <Skeleton className="h-3 w-full bg-rose-200 rounded mb-1" />
                                <Skeleton className="h-3 w-3/4 bg-rose-200 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
                
                <main className="flex-1">
                    {/* Header Skeleton */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <Skeleton className="h-6 w-40 bg-rose-200 rounded-xl" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-24 bg-rose-200 rounded-2xl" />
                                <Skeleton className="h-9 w-32 bg-rose-200 rounded-2xl" />
                            </div>
                        </div>
                    </div>

                    {/* Products Grid Skeleton - 2 columns on mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="bg-white rounded-lg p-2 shadow-sm border border-rose-100">
                                <Skeleton className="h-32 w-full bg-rose-200 rounded-lg mb-2" />
                                <Skeleton className="h-3 w-3/4 bg-rose-200 rounded mb-1" />
                                <Skeleton className="h-3 w-1/2 bg-rose-200 rounded mb-2" />
                                <Skeleton className="h-4 w-16 bg-rose-200 rounded" />
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    </div>
);

// مكون العنوان المبسط
const AnimatedTitle = ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-xl font-bold">
        <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            {children}
        </span>
    </h1>
);

function ProductsPageContent() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const updateQuery = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(pathname + '?' + params.toString(), { scroll: false });
    }, [searchParams, pathname, router]);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await api.get('/products', {
                    params: Object.fromEntries(searchParams.entries())
                });
                
                const fetchedProducts: Product[] = response.data;
                setProducts(fetchedProducts);

                if (user && fetchedProducts.length > 0) {
                    const productIds = fetchedProducts.map(p => p.id);
                    const wishlistResponse = await api.post('/customer/wishlist/status', { productIds });
                    setWishlistStatus(wishlistResponse.data);
                }
            } catch (error) {
                console.error('Failed to fetch products', error);
                setError('فشل في جلب المنتجات. الرجاء المحاولة مرة أخرى.');
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, [user, searchParams]);

    const activeFiltersCount = Array.from(searchParams.entries()).filter(([key]) => 
        !['sortBy', 'view'].includes(key)
    ).length;

    return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white" dir='rtl'>
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            
            <div className="container mx-auto px-3 py-6 relative">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* الشريط الجانبي للشاشات الكبيرة */}
                    <div className="hidden lg:block lg:w-80">
                        <FilterSidebar />
                    </div>

                    <main className="flex-1">
                        {/* Header Section - مضغوط للهواتف */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-rose-200 p-4 mb-6 shadow-lg">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <AnimatedTitle>
                                            منتجاتنا
                                        </AnimatedTitle>
                                        <p className="text-gray-600 text-xs mt-1">
                                            {loading ? 'جاري البحث...' : `${products.length} منتج`}
                                        </p>
                                    </div>
                                    {activeFiltersCount > 0 && (
                                        <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 text-xs">
                                            {activeFiltersCount}
                                        </Badge>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* زر الفلترة للشاشات الصغيرة */}
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="lg:hidden border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl transition-all duration-200"
                                            >
                                                <Filter className="w-3 h-3 ml-1" />
                                                فلاتر
                                                {activeFiltersCount > 0 && (
                                                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white mr-1 text-xs">
                                                        {activeFiltersCount}
                                                    </Badge>
                                                )}
                                            </Button>
                                        </SheetTrigger>
                                        <SheetContent className="w-80 sm:w-96 border-rose-200">
                                            <SheetHeader className="mb-4">
                                                <SheetTitle className="flex items-center gap-2 text-rose-800 text-lg">
                                                    <SlidersHorizontal className="w-4 h-4" />
                                                    فلاتر البحث
                                                </SheetTitle>
                                            </SheetHeader>
                                            <div className="h-full overflow-y-auto">
                                                <FilterSidebar />
                                            </div>
                                        </SheetContent>
                                    </Sheet>
                                    
                                    {/* View Mode Toggle - أصغر للهواتف */}
                                    <div className="flex items-center gap-1 bg-rose-50 rounded-xl border border-rose-200 p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                                                viewMode === 'grid' 
                                                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm' 
                                                    : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
                                            }`}
                                        >
                                            <Grid className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                                                viewMode === 'list' 
                                                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-sm' 
                                                    : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
                                            }`}
                                        >
                                            <List className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    {/* Sort Select - أصغر للهواتف */}
                                    <Select value={searchParams.get('sortBy') || 'latest'} onValueChange={(value) => updateQuery('sortBy', value)}>
                                        <SelectTrigger className="w-32 h-9 border-rose-200 focus:border-rose-400 rounded-xl bg-white/80 backdrop-blur-sm text-xs">
                                            <SortAsc className="w-3 h-3 ml-1 text-rose-400" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="border-rose-200 rounded-xl bg-white/95 backdrop-blur-sm">
                                            <SelectItem value="latest" className="text-xs focus:bg-rose-50 focus:text-rose-700">الأحدث</SelectItem>
                                            <SelectItem value="price_asc" className="text-xs focus:bg-rose-50 focus:text-rose-700">السعر: منخفض</SelectItem>
                                            <SelectItem value="price_desc" className="text-xs focus:bg-rose-50 focus:text-rose-700">السعر: مرتفع</SelectItem>
                                            <SelectItem value="rating" className="text-xs focus:bg-rose-50 focus:text-rose-700">الأعلى تقييماً</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <div key={index} className="bg-white rounded-lg p-2 shadow-sm border border-rose-100 animate-pulse">
                                        <Skeleton className="h-32 w-full bg-gradient-to-r from-rose-200 to-pink-200 rounded-lg mb-2" />
                                        <Skeleton className="h-3 w-3/4 bg-gradient-to-r from-rose-200 to-pink-200 rounded mb-1" />
                                        <Skeleton className="h-3 w-1/2 bg-gradient-to-r from-rose-200 to-pink-200 rounded mb-2" />
                                        <Skeleton className="h-4 w-16 bg-gradient-to-r from-rose-200 to-pink-200 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <PackageSearch className="w-6 h-6 text-red-500" />
                                </div>
                                <h2 className="text-lg font-bold text-red-600 mb-2">
                                    حدث خطأ
                                </h2>
                                <p className="text-gray-600 text-sm mb-4">{error}</p>
                                <Button 
                                    onClick={() => window.location.reload()}
                                    size="sm"
                                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl px-4 py-2 text-sm"
                                >
                                    إعادة المحاولة
                                </Button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-r from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <PackageSearch className="w-6 h-6 text-rose-500" />
                                </div>
                                <h2 className="text-lg font-bold text-rose-600 mb-2">
                                    لا توجد منتجات
                                </h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    لم نعثر على منتجات تطابق معايير البحث الخاصة بك.
                                </p>
                                <Button 
                                    onClick={() => window.location.href = '/products'}
                                    size="sm"
                                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl px-4 py-2 text-sm"
                                >
                                    عرض جميع المنتجات
                                </Button>
                            </div>
                        ) : (
                            <div className={
                                viewMode === 'grid' 
                                    ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
                                    : "space-y-3"
                            }>
                                {products.map((product) => (
                                    <ProductCard 
                                        key={product.id} 
                                        product={product} 
                                        isInitiallyWishlisted={wishlistStatus[product.id] || false}
                                    />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<LoadingSkeleton />}>
            <ProductsPageContent />
        </Suspense>
    );
}