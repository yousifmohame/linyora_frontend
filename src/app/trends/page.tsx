'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import TrendCard from '@/components/TrendCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Filter, Grid3X3, List, Sparkles, TrendingUp, X, Search } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BackButton } from '@/components/BackButton';

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
}

export default function TrendsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const currencySymbol = 'ر.س'; // can be dynamic if needed

  const [products, setProducts] = useState<PromotedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'price-low' | 'price-high'>('popular');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPromotedProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<PromotedProduct[]>('/browse/trends');
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch promoted products:", error);
        // Optional: show toast
      } finally {
        setLoading(false);
      }
    };
    fetchPromotedProducts();
  }, []);

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'popular':
        default:
          return (b.rating || 0) - (a.rating || 0);
      }
    });

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <BackButton />
          </div>

          {/* Mobile Search & Filter */}
          <section className="sticky top-0 z-30 bg-white border-b border-rose-200 py-3 px-3 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('TrendsPage.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 bg-gray-100 border-0 rounded-xl text-sm"
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

              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-rose-200">
                    <Filter className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="text-left">{t('TrendsPage.filters.title')}</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full pb-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">{t('TrendsPage.sort.title')}</h3>
                        <div className="space-y-2">
                          {[
                            { value: 'popular', label: t('TrendsPage.sort.popular') },
                            { value: 'newest', label: t('TrendsPage.sort.newest') },
                            { value: 'price-low', label: t('TrendsPage.sort.priceLow') },
                            { value: 'price-high', label: t('TrendsPage.sort.priceHigh') }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value as any);
                                setShowFilters(false);
                              }}
                              className={`w-full text-left p-3 rounded-xl border transition-colors ${
                                sortBy === option.value
                                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                                  : 'border-gray-200 hover:border-rose-300'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">{t('TrendsPage.filters.quick')}</h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1 text-sm"
                            onClick={() => {
                              setSortBy('newest');
                              setShowFilters(false);
                            }}
                          >
                            {t('TrendsPage.badges.newArrivals')}
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1 text-sm"
                            onClick={() => {
                              setPriceRange([0, 50]);
                              setShowFilters(false);
                            }}
                          >
                            {t('TrendsPage.badges.under50')}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">{t('TrendsPage.view.title')}</h3>
                        <div className="flex border rounded-lg p-1 bg-gray-100 w-fit">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-8 w-8 p-0 rounded-md"
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'compact' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('compact')}
                            className="h-8 w-8 p-0 rounded-md"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </section>

          {/* Desktop Controls */}
          <section className="hidden lg:block bg-white border-b border-rose-200 py-4">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="w-full lg:w-64">
                  <Input
                    placeholder={t('TrendsPage.search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 border-0 rounded-full"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex border rounded-lg p-1 bg-gray-100">
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="h-8 w-8 p-0 rounded-md">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === 'compact' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('compact')} className="h-8 w-8 p-0 rounded-md">
                      <List className="h-4 w-4" />
                    </Button>
                  </div>

                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                    <SelectTrigger className="w-32 h-9 rounded-full bg-gray-100 border-0">
                      <SelectValue placeholder={t('TrendsPage.sort.placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">{t('TrendsPage.sort.popular')}</SelectItem>
                      <SelectItem value="newest">{t('TrendsPage.sort.newest')}</SelectItem>
                      <SelectItem value="price-low">{t('TrendsPage.sort.priceLow')}</SelectItem>
                      <SelectItem value="price-high">{t('TrendsPage.sort.priceHigh')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1"
                      onClick={() => setSortBy('newest')}
                    >
                      {t('TrendsPage.badges.newArrivals')}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1"
                      onClick={() => setPriceRange([0, 50])}
                    >
                      {t('TrendsPage.badges.under50')}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="container mx-auto px-3 py-6">
            {loading ? (
              <div className={`grid gap-3 ${viewMode === 'compact' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className={`${viewMode === 'compact' ? 'h-40' : 'h-32 sm:h-36'} w-full rounded-lg`} />
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-600">
                    {t('TrendsPage.results.showing', { 
                      current: filteredProducts.length, 
                      total: products.length 
                    })}
                  </p>
                  {searchQuery && (
                    <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')} className="text-gray-500 hover:text-gray-700 text-xs h-8">
                      {t('TrendsPage.search.clear')}
                    </Button>
                  )}
                </div>

                <div className={`gap-3 ${viewMode === 'compact' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
                  {filteredProducts.map(product => (
                    <TrendCard 
                      key={product.id} 
                      product={product} 
                      compact={viewMode === 'compact'}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-3 bg-rose-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-rose-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('TrendsPage.empty.title')}
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  {searchQuery 
                    ? t('TrendsPage.empty.noResults', { query: searchQuery })
                    : t('TrendsPage.empty.noTrends')
                  }
                </p>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery('')} size="sm" className="rounded-full">
                    {t('TrendsPage.search.clear')}
                  </Button>
                )}
              </div>
            )}
          </section>

          {!loading && filteredProducts.length > 0 && (
            <section className="container mx-auto px-3 py-6 border-t border-rose-200">
              <div className="text-center">
                <Button variant="outline" className="rounded-full px-6 text-sm h-10">
                  {t('TrendsPage.loadMore')}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {t('TrendsPage.results.footer', { 
                    current: filteredProducts.length, 
                    total: products.length 
                  })}
                </p>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}