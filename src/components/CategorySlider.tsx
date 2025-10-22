'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from 'embla-carousel-autoplay';

interface Category {
  id: number;
  name: string;
  image_url: string;
  slug: string;
}

const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-2 p-1">
    <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50" />
    <Skeleton className="h-2 w-12 sm:w-14 md:w-16 bg-gray-200 rounded-full" />
  </div>
);

export default function CategorySlider() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/categories');
        setCategories(response.data.categories || response.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleImageLoad = (categoryId: number) => {
    setImageLoaded(prev => ({ ...prev, [categoryId]: true }));
  };

  const isRTL = i18n.language === 'ar';

  return (
    <section className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* العنوان */}
      <div className="flex justify-center items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl text-rose-700 font-bold text-center font-serif">
          {t('CategorySlider.title')}
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => <CategorySkeleton key={i} />)}
        </div>
      ) : (
        <Carousel
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            })
          ]}
          opts={{
            align: "start",
            direction: isRTL ? "rtl" : "ltr",
            dragFree: true,
            skipSnaps: false,
            loop: true,
          }}
          className="w-full relative"
        >
          <CarouselContent className="-ml-2">
            {categories.map((category) => (
              <CarouselItem 
                key={category.id} 
                className="basis-1/4 sm:basis-1/5 md:basis-1/6 lg:basis-1/8 pl-2"
              >
                <Link 
                  href={`/categories/${category.slug}`} 
                  className="group block"
                >
                  <div className="flex flex-col items-center gap-2 p-1 sm:p-2">
                    {/* الصورة */}
                    <Card className="relative aspect-square w-full max-w-[70px] sm:max-w-[80px] md:max-w-[90px] rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all duration-300 group-hover:scale-105 bg-gradient-to-br from-pink-50 to-purple-50">
                      {!imageLoaded[category.id] && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-shimmer z-10" />
                      )}
                      <Image
                        src={category.image_url || '/placeholder-category.svg'}
                        alt={category.name}
                        fill
                        sizes="(max-width: 640px) 70px, (max-width: 768px) 80px, 90px"
                        className={`object-cover transition-opacity duration-300 ${
                          imageLoaded[category.id] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoad(category.id)}
                      />
                      
                      {/* Overlay effect */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 rounded-xl sm:rounded-2xl" />
                    </Card>

                    {/* الاسم */}
                    <p className="font-medium text-center text-xs sm:text-sm text-gray-700 line-clamp-2 group-hover:text-rose-700 transition-colors duration-200 leading-tight min-h-[32px] flex items-center justify-center">
                      {category.name}
                    </p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* أزرار التنقل - تظهر فقط على الشاشات المتوسطة فما فوق */}
          <CarouselPrevious 
            className={`left-0 sm:left-2 md:left-4 disabled:opacity-30 hidden md:flex size-8 md:size-10 bg-white/90 hover:bg-white border-rose-200 text-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 ${
              isRTL ? 'rotate-180' : ''
            }`}
          />
          <CarouselNext 
            className={`right-0 sm:right-2 md:right-4 disabled:opacity-30 hidden md:flex size-8 md:size-10 bg-white/90 hover:bg-white border-rose-200 text-rose-700 shadow-lg hover:shadow-xl transition-all duration-200 ${
              isRTL ? 'rotate-180' : ''
            }`}
          />

          {/* مؤشر التمرير للنقال */}
          <div className="flex justify-center mt-4 md:hidden">
            <div className="flex gap-1.5">
              {categories.slice(0, 4).map((_, index) => (
                <div 
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-gray-300"
                />
              ))}
            </div>
          </div>
        </Carousel>
      )}

      {/* زر عرض الكل */}
      {!loading && categories.length > 0 && (
        <div className="flex justify-center mt-6">
          <Link 
            href="/categories"
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            {t('CategorySlider.viewAll')}
          </Link>
        </div>
      )}
    </section>
  );
}