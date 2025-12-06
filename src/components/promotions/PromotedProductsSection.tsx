"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

// ✅ Swiper imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

// --- Type Definitions ---
interface MainPromotion {
  id: number;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  button_text: string;
}

// --- Skeleton Component ---
const BannerSkeleton = () => (
  <div className="w-full h-[250px] md:h-[400px] lg:h-[500px] bg-gray-200 animate-pulse rounded-3xl" />
);

// --- Main Component ---
export default function PromotedProductsSection() {
  const [mainPromotions, setMainPromotions] = useState<MainPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/browse/main-banners");

        if (response.data && Array.isArray(response.data)) {
          setMainPromotions(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-6">
        <BannerSkeleton />
      </section>
    );
  }

  if (!mainPromotions.length) return null;

  return (
    <section className="relative py-6">
      <div className="container mx-auto px-4">
        <div className="relative group rounded-3xl overflow-hidden shadow-2xl">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination, Navigation]}
            effect="fade"
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            // ✅ تم إصلاح الخطأ هنا: إزالة تعريف الكلاسات المباشر
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            loop={true}
            // ✅ إضافة التنسيقات هنا باستخدام Selectors
            className="w-full h-[250px] md:h-[400px] lg:h-[500px] 
              [&_.swiper-pagination-bullet]:!bg-white 
              [&_.swiper-pagination-bullet]:!opacity-50 
              [&_.swiper-pagination-bullet]:transition-all
              [&_.swiper-pagination-bullet-active]:!opacity-100 
              [&_.swiper-pagination-bullet-active]:!w-8 
              [&_.swiper-pagination-bullet-active]:!rounded-full"
          >
            {mainPromotions.map((promo) => (
              <SwiperSlide key={promo.id}>
                <Link href={promo.link_url} className="block w-full h-full relative">
                  {/* Background Image */}
                  <Image
                    src={promo.image_url}
                    alt={promo.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 100vw"
                    className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                    priority
                  />
                  
                  {/* Dark Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-24 max-w-3xl">
                    <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      {promo.title && (
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg leading-tight">
                          {promo.title}
                        </h2>
                      )}
                      
                      {promo.subtitle && (
                        <p className="text-lg md:text-2xl text-gray-100 font-medium drop-shadow-md max-w-lg leading-relaxed">
                          {promo.subtitle}
                        </p>
                      )}

                      {promo.button_text && (
                        <div className="pt-2">
                          <Button 
                            size="lg" 
                            className="bg-white text-rose-500 hover:bg-gray-100 rounded-full px-8 py-6 text-base md:text-lg font-bold transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
                          >
                            {promo.button_text}
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
            
          </Swiper>
        </div>
      </div>
    </section>
  );
}