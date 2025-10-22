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
  const { t } = useTranslation();
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
      } finally {
        setLoading(false);
      }
    };
    fetchPromotedProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const trendingCount = products.filter(p => p.promotion_tier_name?.includes('Trending')).length;
  const newArrivalsCount = products.filter(p => p.is_new).length;

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-rose-50 to-white pb-20">
        

        {/* Mobile Search Bar */}
        <section className="sticky top-0 z-30 bg-white border-b border-rose-200 py-3 px-3 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search trends..."
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
            
            {/* Mobile Filter Button */}
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-rose-200">
                  <Filter className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-left">Filters & Sort</SheetTitle>
                </SheetHeader>
                
                <ScrollArea className="h-full pb-4">
                  <div className="space-y-6">
                    {/* Sort Options */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Sort By</h3>
                      <div className="space-y-2">
                        {[
                          { value: 'popular', label: 'Most Popular' },
                          { value: 'newest', label: 'New Arrivals' },
                          { value: 'price-low', label: 'Price: Low to High' },
                          { value: 'price-high', label: 'Price: High to Low' }
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

                    {/* Quick Filters */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Quick Filters</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1 text-sm"
                          onClick={() => {
                            setSortBy('newest');
                            setShowFilters(false);
                          }}
                        >
                          New Arrivals
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1 text-sm"
                          onClick={() => {
                            setPriceRange([0, 50]);
                            setShowFilters(false);
                          }}
                        >
                          Under 50 ر.س
                        </Badge>
                      </div>
                    </div>

                    {/* View Mode */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">View Mode</h3>
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

        {/* Desktop Filters and Controls */}
        <section className="hidden lg:block bg-white border-b border-rose-200 py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search Bar */}
              <div className="w-full lg:w-64">
                <Input
                  placeholder="Search trends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-100 border-0 rounded-full"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                {/* View Toggle */}
                <div className="flex border rounded-lg p-1 bg-gray-100">
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

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32 h-9 rounded-full bg-gray-100 border-0">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="newest">New Arrivals</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* Quick Filters */}
                <div className="flex gap-2">
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1"
                    onClick={() => setSortBy('newest')}
                  >
                    New Arrivals
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-rose-100 rounded-full px-3 py-1"
                    onClick={() => setPriceRange([0, 50])}
                  >
                    Under 50 ر.س
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-3 py-6">
          {loading ? (
            <div className={`grid gap-3 ${
              viewMode === 'compact' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
            }`}>
              {Array.from({ length: 12 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton className={`${
                    viewMode === 'compact' ? 'h-40' : 'h-32 sm:h-36'
                  } w-full rounded-lg`} />
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {/* Results Count */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-600">
                  Showing {filteredProducts.length} of {products.length} products
                </p>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-500 hover:text-gray-700 text-xs h-8"
                  >
                    Clear search
                  </Button>
                )}
              </div>

              {/* Products Grid */}
              <div className={`gap-3 ${
                viewMode === 'compact' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
              }`}>
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
                No products found
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {searchQuery 
                  ? `No results for "${searchQuery}". Try adjusting your search.`
                  : 'No trending products available at the moment.'
                }
              </p>
              {searchQuery && (
                <Button 
                  onClick={() => setSearchQuery('')}
                  size="sm"
                  className="rounded-full"
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Load More Section */}
        {!loading && filteredProducts.length > 0 && (
          <section className="container mx-auto px-3 py-6 border-t border-rose-200">
            <div className="text-center">
              <Button variant="outline" className="rounded-full px-6 text-sm h-10">
                Load More Trends
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                Showing {filteredProducts.length} of {products.length} trending products
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
}