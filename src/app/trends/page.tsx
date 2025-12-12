// app/(main)/trends/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import TrendCard from '@/components/TrendCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Star, ArrowUp, Sparkles, Search, X, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PromotedProduct {
  id: number;
  name: string;
  brand: string | null;
  price: number;
  image: string | null;
  promotion_tier_name: string;
  badge_color: string;
  original_price?: number;
  discount_percentage?: number;
  is_new?: boolean;
  rating?: number;
  review_count?: number;
  category?: string;
  trend_score: number;
  rank: number;
}

export default function TrendsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [products, setProducts] = useState<PromotedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPromotedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<PromotedProduct[]>('/browse/trends');
        // Ensure rank is assigned if not in API
        const productsWithRank = response.data.map((p, i) => ({
          ...p,
          rank: i + 1,
        }));
        setProducts(productsWithRank);
      } catch (error) {
        console.error("Failed to fetch promoted products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotedProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.category && product.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white pb-24 pt-4 px-4">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-lg mb-4">
          <Flame className="h-5 w-5" />
          <h1 className="text-xl font-bold">الترندات الحالية</h1>
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <p className="text-gray-600">أكثر المنتجات رواجاً هذا الأسبوع</p>
      </div>

      {/* Trend Tiers Legend */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white p-4 rounded-2xl text-center shadow-lg">
          <Flame className="h-6 w-6 mx-auto mb-2" />
          <p className="text-xs">حار جداً</p>
          <p className="text-xl mt-1">95+</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-2xl text-center shadow-lg">
          <Star className="h-6 w-6 mx-auto mb-2" />
          <p className="text-xs">رائج</p>
          <p className="text-xl mt-1">85-95</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white p-4 rounded-2xl text-center shadow-lg">
          <ArrowUp className="h-6 w-6 mx-auto mb-2" />
          <p className="text-xs">صاعد</p>
          <p className="text-xl mt-1">75-85</p>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="sticky top-0 z-30 bg-white py-3 px-3 lg:hidden mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={t('TrendsPage.search.placeholder') || 'ابحث عن منتج...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 h-10 bg-gray-100 border-0 rounded-xl text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl shadow-lg p-4">
              <div className="flex gap-4">
                <Skeleton className="w-24 h-24 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-6 w-16 mt-2" />
                </div>
              </div>
              <Skeleton className="h-2 w-full mt-3 rounded-full" />
            </div>
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <TrendCard key={product.id} product={product} />
          ))
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-rose-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد ترندات حالياً'}
            </h3>
            {searchQuery && (
              <Button onClick={() => setSearchQuery('')} size="sm" className="mt-2">
                مسح البحث
              </Button>
            )}
          </div>
        )}
      </div>

      
    </div>
  );
}