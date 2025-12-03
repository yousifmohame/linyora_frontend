'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Product } from '@/types';
import { Section } from '@/types/section';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export default function SectionDetailsPage() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [section, setSection] = useState<Section | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="container mx-auto px-4 py-8"><Skeleton className="w-full h-[400px]" /></div>;
  if (!section) return <div className="text-center py-20">Section not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* 1. Hero Slider */}
      {section.slides && section.slides.length > 0 && (
        <div className="relative w-full bg-white mb-10">
          <Carousel 
            className="w-full"
            plugins={[Autoplay({ delay: 8000 })]} // تأخير أطول للفيديو
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
                                style={{ backgroundColor: section.theme_color || '#ea580c' }} // استخدام لون القسم
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
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div>
            <h2 className="text-3xl font-bold" style={{ color: section.theme_color }}>
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
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}
      </div>
    </div>
  );
}