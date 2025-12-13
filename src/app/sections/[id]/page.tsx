'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Product } from '@/types';
import { Section } from '@/types/section';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

// --- Helper Function Moved Outside Component ---
function adjustHexColor(
  color: string,
  adjustments: {
    r?: number | string;
    g?: number | string;
    b?: number | string;
  }
): string {
  if (!color || !color.startsWith('#')) {
    return color || '#000000';
  }

  let hex = color.slice(1);
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) {
    return color;
  }

  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return color;
  }

  const applyAdjustment = (value: number, adjustment: number | string): number => {
    let delta = 0;
    if (typeof adjustment === 'string') {
      const match = adjustment.trim().match(/^([+-]?)(\d+(?:\.\d+)?)%$/);
      if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const percent = parseFloat(match[2]) / 100;
        delta = Math.round(value * percent * sign);
      }
    } else {
      delta = adjustment;
    }
    return Math.min(255, Math.max(0, Math.round(value + delta)));
  };

  if (adjustments.r !== undefined) r = applyAdjustment(r, adjustments.r);
  if (adjustments.g !== undefined) g = applyAdjustment(g, adjustments.g);
  if (adjustments.b !== undefined) b = applyAdjustment(b, adjustments.b);

  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

export default function SectionDetailsPage() {
  const { id } = useParams();
  const router = useRouter(); // Use Next.js router
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [section, setSection] = useState<Section | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Ensure ID exists before fetching
        if (!id) return;

        const sectionRes = await api.get(`/sections/${id}`);
        const sectionData = sectionRes.data;
        setSection(sectionData);

        if (sectionData.category_ids && sectionData.category_ids.length > 0) {
          const productsRes = await api.get('/products', {
            params: {
              category_ids: sectionData.category_ids.join(','),
              limit: 50
            }
          });
          setProducts(productsRes.data.products || productsRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching section details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 2. Handle Loading State FIRST
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="w-full h-[400px] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
            <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  // 3. Handle Not Found
  if (!section) return <div className="text-center py-20">Section not found</div>;

  // 4. Calculate Colors (Only AFTER we know section exists)
  const themeColor = section.theme_color || '#ea580c';
  const secondColor = adjustHexColor(themeColor, {
    g: -3, 
    b: +110,
  });

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div 
        className="sticky top-0 z-50 text-white py-4 px-4 backdrop-blur-lg shadow-sm" 
        style={{
           background: `linear-gradient(to left, ${themeColor}, ${secondColor})`,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            onClick={() => router.back()} 
            aria-label={t('GoBack', 'Go back')}
          >
            {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </button>
          <h1 className="text-xl flex-1 font-medium truncate">
            {(isRTL ? section.title_ar : section.title_en) || t('Section', 'Section')}
          </h1>
          <ShoppingBag className="h-6 w-6" />
        </div>
      </div>

      {/* 1. Hero Slider */}
      {section.slides && section.slides.length > 0 && (
        <div className="relative w-full bg-white mb-10">
          <Carousel 
            className="w-full"
            plugins={[Autoplay({ delay: 8000 })]}
            opts={{ direction: isRTL ? 'rtl' : 'ltr', loop: true }}
          >
            <CarouselContent>
              {section.slides.map((slide) => (
                <CarouselItem key={slide.id} className="relative h-[50vh] md:h-[70vh] w-full">
                  <div className="relative w-full h-full">
                    
                    {/* Media Display Logic */}
                    {slide.media_type === 'video' ? (
                        <video 
                            src={slide.image_url} 
                            className="w-full h-full object-cover"
                            autoPlay 
                            muted 
                            loop 
                            playsInline
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                            src={slide.image_url} 
                            alt={isRTL ? slide.title_ar : slide.title_en}
                            className="w-full h-full object-cover"
                        />
                    )}

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-4">
                      <div className="text-white max-w-4xl space-y-6">
                        <h1 className="text-4xl md:text-7xl font-bold tracking-tight">
                          {isRTL ? slide.title_ar : slide.title_en}
                        </h1>
                        <p className="text-lg md:text-2xl text-gray-100 font-light">
                          {isRTL ? slide.description_ar : slide.description_en}
                        </p>
                        {(slide.button_text_en || slide.button_text_ar) && (
                          <Link href={slide.button_link || '#'}>
                            <Button 
                                size="lg" 
                                className="mt-4 text-white rounded-full px-10 py-6 text-lg transition-transform hover:scale-105"
                                style={{ backgroundColor: themeColor, borderColor: themeColor }}
                            >
                              {isRTL ? slide.button_text_ar : slide.button_text_en}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {section.slides.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </div>
      )}

      {/* 2. Products Grid */}
      <div className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: themeColor }}>
              {isRTL ? section.title_ar : section.title_en}
            </h2>
            <p className="text-gray-500 mt-2">
              {isRTL ? section.description_ar : section.description_en}
            </p>
          </div>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isInitiallyWishlisted={false} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
            <p className="text-gray-500">No products found in this section.</p>
          </div>
        )}
      </div>
    </div>
  );
}