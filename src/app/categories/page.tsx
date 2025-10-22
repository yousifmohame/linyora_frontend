'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Layers, 
  Search, 
  Grid3X3, 
  List, 
  ChevronRight,
  Star,
  Crown,
  Zap
} from 'lucide-react';

// --- واجهات الأنواع ---
interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  children?: Category[]; // جعلها اختيارية
  product_count?: number;
  is_featured?: boolean;
  is_trending?: boolean;
}

// --- مكون الهيكل العظمي للتحميل المحسن ---
const LoadingSkeleton = () => (
  <div className="space-y-8 animate-pulse">

    {/* Search and Filters Skeleton */}
    <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
      <Skeleton className="h-12 w-full sm:w-80 bg-gray-200 rounded-full" />
      <div className="flex gap-2">
        <Skeleton className="h-10 w-20 bg-gray-200 rounded-lg" />
        <Skeleton className="h-10 w-20 bg-gray-200 rounded-lg" />
      </div>
    </div>

    {/* Categories Grid Skeleton */}
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
      {Array.from({ length: 18 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="w-full aspect-square bg-gray-200" />
            <div className="p-3">
              <Skeleton className="h-4 w-3/4 mb-2 bg-gray-200 rounded" />
              <Skeleton className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// دالة مساعدة للتحقق من وجود children
const hasChildren = (category: Category): boolean => {
  return Array.isArray(category.children) && category.children.length > 0;
};

const getChildrenCount = (category: Category): number => {
  return Array.isArray(category.children) ? category.children.length : 0;
};

// --- بطاقة الفئة المحسنة (معدلة لتكون مثل الصورة المرفقة) ---
const CategoryCard = ({ category, viewMode }: { category: Category; viewMode: 'grid' | 'list' }) => {
  const childrenCount = getChildrenCount(category);
  const hasChildrenItems = hasChildren(category);

  if (viewMode === 'list') {
    return (
      <Link href={`/categories/${category.slug}`}>
        <Card className="group hover:shadow-lg transition-all duration-300 hover:border-rose-300 border-2">
          <CardContent className="p-4 flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src={category.image_url || '/placeholder.png'}
                alt={category.name}
                fill
                sizes="64px"
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                unoptimized
              />
              {(category.is_featured || category.is_trending) && (
                <div className="absolute top-1 right-1">
                  {category.is_featured ? (
                    <Badge className="bg-amber-500 text-white border-0 text-xs px-1.5 py-0.5">
                      <Crown className="w-3 h-3 mr-1" />
                    </Badge>
                  ) : (
                    <Badge className="bg-green-500 text-white border-0 text-xs px-1.5 py-0.5">
                      <Zap className="w-3 h-3 mr-1" />
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors truncate">
                  {category.name}
                </h3>
                {hasChildrenItems && (
                  <Badge variant="outline" className="text-xs">
                    +{childrenCount}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                {category.product_count && (
                  <span>{category.product_count} منتج</span>
                )}
                {hasChildrenItems && (
                  <span>{childrenCount} فئة فرعية</span>
                )}
              </div>
            </div>
            
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors flex-shrink-0" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Grid View - تصميم جديد يشبه الصورة المرفقة (صورة دائرية + اسم فقط)
  return (
    <Link href={`/categories/${category.slug}`} className="group">
      <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-rose-300">
        <CardContent className="p-0 h-full flex flex-col items-center justify-center gap-3">
          {/* Image Container - صورة دائرية صغيرة */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            <Image
              src={category.image_url || '/placeholder.png'}
              alt={category.name}
              fill
              sizes="96px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          </div>

          {/* Category Name - نص أسفل الصورة */}
          <h3 className="font-medium text-center text-gray-800 group-hover:text-rose-600 transition-colors text-sm leading-tight">
            {category.name}
          </h3>
        </CardContent>
      </Card>
    </Link>
  );
};

// --- المكون الرئيسي للصفحة ---
export default function CategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'featured' | 'trending'>('all');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/browse/categories');
        
        // تأكد من أن كل كائن category لديه children كمصفوفة
        const safeCategories = (response.data || []).map((category: Category) => ({
          ...category,
          children: category.children || [] // تأكد من أن children هي مصفوفة فارغة إذا كانت undefined
        }));
        
        setCategories(safeCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]); // تأكد من تعيين مصفوفة فارغة في حالة الخطأ
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Filter and search categories
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        filter === 'all' ||
        (filter === 'featured' && category.is_featured) ||
        (filter === 'trending' && category.is_trending);
      
      return matchesSearch && matchesFilter;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50/30">
      
      <main className="container mx-auto px-4 py-8">

        {/* Search and Controls */}
        <section className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative w-full lg:w-96">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="ابحث في الفئات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 h-12 rounded-2xl bg-white border-2 border-gray-200 focus:border-rose-300 transition-colors"
              />
            </div>

            {/* Filters and View Toggle */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* View Toggle */}
              <div className="flex border border-gray-200 rounded-2xl p-1 bg-white">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-xl ${viewMode === 'grid' ? 'bg-rose-500 text-white' : ''}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`rounded-xl ${viewMode === 'list' ? 'bg-rose-500 text-white' : ''}`}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={`rounded-xl ${filter === 'all' ? 'bg-rose-500 text-white' : ''}`}
                >
                  الكل
                </Button>
                
                <Button
                  variant={filter === 'featured' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('featured')}
                  className={`rounded-xl ${filter === 'featured' ? 'bg-amber-500 text-white' : ''}`}
                >
                  مميزة
                </Button>
                
                <Button
                  variant={filter === 'trending' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('trending')}
                  className={`rounded-xl ${filter === 'trending' ? 'bg-green-500 text-white' : ''}`}
                >
                  رائجة
                </Button>
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <LoadingSkeleton />
        ) : (
          <section>
            {/* Results Info */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                عرض {filteredCategories.length} من {categories.length} فئة
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="text-rose-600 hover:text-rose-700"
                >
                  مسح البحث
                </Button>
              )}
            </div>

            {/* Categories Grid/List */}
            {filteredCategories.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2'
                  : 'space-y-3'
              }>
                {filteredCategories.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Layers className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  لم يتم العثور على فئات
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery 
                    ? `لا توجد نتائج لـ "${searchQuery}". جرب مصطلحات بحث أخرى.`
                    : 'لا توجد فئات متاحة حاليًا.'
                  }
                </p>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery('')}>
                    عرض كل الفئات
                  </Button>
                )}
              </Card>
            )}
          </section>
        )}
      </main>
    </div>
  );
}