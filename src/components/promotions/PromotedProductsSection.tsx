"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

// Swiper imports
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

// --- Helper to detect video ---
const isVideoUrl = (url: string) => {
  return url?.match(/\.(mp4|webm|ogg|mov)$/i);
};

// --- Skeleton Component ---
const BannerSkeleton = () => (
  <div className="w-full h-[300px] md:h-[500px] lg:h-[600px] bg-gray-200 animate-pulse rounded-3xl" />
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
    <section className="relative py-0">
      <div className="container mx-0 max-w-full px-0">
        <div className="relative group  overflow-hidden shadow-2xl ring-1 ring-black/5">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination, Navigation]}
            effect="fade"
            // زيادة وقت الانتظار قليلاً للسماح بقراءة النصوص ومشاهدة الفيديو
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true,
            }}
            navigation={{
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            }}
            loop={true}
            // تنسيقات Swiper المخصصة
            className="w-full h-[250px] md:h-[400px] lg:h-[600px] 
              [&_.swiper-pagination-bullet]:!bg-white 
              [&_.swiper-pagination-bullet]:!opacity-40 
              [&_.swiper-pagination-bullet]:transition-all
              [&_.swiper-pagination-bullet]:!w-2.5
              [&_.swiper-pagination-bullet]:!h-2.5
              [&_.swiper-pagination-bullet-active]:!opacity-100 
              [&_.swiper-pagination-bullet-active]:!w-8 
              [&_.swiper-pagination-bullet-active]:!rounded-full
              [&_.swiper-button-next]:!text-white [&_.swiper-button-prev]:!text-white
              [&_.swiper-button-next]:!w-10 [&_.swiper-button-prev]:!w-10
              [&_.swiper-button-next]:!h-10 [&_.swiper-button-prev]:!h-10
              [&_.swiper-button-next]:!bg-black/20 [&_.swiper-button-prev]:!bg-black/20
              [&_.swiper-button-next]:!backdrop-blur-sm [&_.swiper-button-prev]:!backdrop-blur-sm
              [&_.swiper-button-next]:!rounded-full [&_.swiper-button-prev]:!rounded-full
              [&_.swiper-button-next:after]:!text-base [&_.swiper-button-prev:after]:!text-base
              [&_.swiper-button-next]:!hidden md:[&_.swiper-button-next]:!flex
              [&_.swiper-button-prev]:!hidden md:[&_.swiper-button-prev]:!flex
              hover:[&_.swiper-button-next]:!bg-rose-500 hover:[&_.swiper-button-prev]:!bg-rose-500
              transition-colors"
          >
            {mainPromotions.map((promo) => {
                const isVideo = isVideoUrl(promo.image_url);

                return (
                  <SwiperSlide key={promo.id} className="bg-gray-900">
                    <Link href={promo.link_url} className="block w-full h-full relative">
                      
                      {/* --- Media Layer (Image or Video) --- */}
                      <div className="absolute inset-0 w-full h-full">
                        {isVideo ? (
                            <video
                                src={promo.image_url}
                                autoPlay
                                muted
                                loop
                                playsInline
                                className="object-cover w-full h-full"
                                // إضافة poster إذا توفرت صورة مصغرة (اختياري)
                            />
                        ) : (
                            <Image
                                src={promo.image_url}
                                alt={promo.title}
                                fill
                                priority
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 100vw"
                                className="object-cover transition-transform duration-[8s] ease-out group-hover:scale-105"
                            />
                        )}
                      </div>
                      
                      {/* --- Professional Gradient Overlay --- */}
                      {/* تدرج لوني يضمن قراءة النص فوق أي خلفية */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                      {/* --- Content Content --- */}
                      <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-4xl h-full">
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-forwards">
                          

                          {promo.title && (
                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight drop-shadow-lg">
                              {promo.title}
                            </h2>
                          )}
                          
                          {promo.subtitle && (
                            <p className="text-lg md:text-2xl text-gray-200 font-medium max-w-xl leading-relaxed drop-shadow-md">
                              {promo.subtitle}
                            </p>
                          )}

                          {promo.button_text && (
                            <div className="pt-6 flex items-center gap-4">
                              <Button 
                                size="lg" 
                                className="bg-white text-black hover:bg-rose-500 hover:text-white border-0 rounded-full px-8 py-7 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] group/btn"
                              >
                                {promo.button_text}
                                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                              </Button>
                              
                              {/* زر تشغيل وهمي إذا كان فيديو لإعطاء طابع تفاعلي */}
                              {isVideo && (
                                <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm">
                                    <Play className="w-5 h-5 text-white fill-white ml-1" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                );
            })}
            
            {/* Navigation Buttons (Container required for Swiper) */}
            <div className="swiper-button-prev after:!content-['']"></div>
            <div className="swiper-button-next after:!content-['']"></div>

          </Swiper>
        </div>
      </div>
    </section>
  );
}