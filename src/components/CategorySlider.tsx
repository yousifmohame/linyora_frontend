'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

// Import Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface Category {
  id: number;
  name: string;
  image_url: string;
  slug: string;
}

export default function CategorySwiper() {
  const { t } = useTranslation('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const swiperRef = useRef<SwiperType | null>(null);

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

  // ➤ إعدادات Swiper — صف واحد + Loop + AutoPlay
  const swiperConfig = {
    slidesPerView: 4,
    spaceBetween: 12,
    loop: true,
    freeMode: false,

    autoplay: {
      delay: 1200,
      disableOnInteraction: false,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    breakpoints: {
      320: { slidesPerView: 4, spaceBetween: 8 },
      768: { slidesPerView: 6, spaceBetween: 12 },
      1124: { slidesPerView: 8, spaceBetween: 16 },
    },
  };

  return (
    <section className="relative py-2 mb-1 lg:py-4 bg-white w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200" />
                <Skeleton className="h-4 w-20 mt-2 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">

            <Swiper
              {...swiperConfig}
              modules={[Navigation, FreeMode, Autoplay]}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              className="category-swiper"
            >

              {categories.map((category) => (
                <SwiperSlide key={category.id}>
                  <div className="flex flex-col items-center p-2">

                    <Link
                      href={`/categories/${category.slug}`}
                      className="group flex flex-col items-center text-center p-3 rounded-2xl hover:bg-gray-50 transition-all duration-300 hover:scale-105"
                    >

                      <div className="relative aspect-square w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 mb-3 bg-gray-100 rounded-2xl overflow-hidden">

                        {!imageLoaded[category.id] && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-12 animate-shimmer z-10" />
                        )}

                        <Image
                          src={category.image_url || '/placeholder-category.svg'}
                          alt={category.name}
                          fill
                          sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                          className={`object-cover transition-opacity duration-300 ${
                            imageLoaded[category.id] ? 'opacity-100' : 'opacity-0'
                          }`}
                          onLoad={() => handleImageLoad(category.id)}
                        />
                      </div>

                      <div className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-rose-700 transition-colors duration-200 leading-tight">
                        {category.name}
                      </div>

                    </Link>
                  </div>
                </SwiperSlide>
              ))}

            </Swiper>

            {/* Navigation Buttons */}
            <div className="swiper-button-prev !hidden md:!flex after:!text-xl after:!text-gray-600 hover:after:!text-rose-600 !w-10 !h-10 !bg-white !rounded-full !shadow-lg hover:!shadow-xl transition-all duration-200"></div>
            <div className="swiper-button-next !hidden md:!flex after:!text-xl after:!text-gray-600 hover:after:!text-rose-600 !w-10 !h-10 !bg-white !rounded-full !shadow-lg hover:!shadow-xl transition-all duration-200"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        .category-swiper {
          padding: 8px 4px;
        }

        .swiper-slide {
          display: flex;
          justify-content: center;
        }

        .swiper-button-prev,
        .swiper-button-next {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          display: none;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .swiper-button-prev,
          .swiper-button-next {
            display: flex;
          }
        }
      `}</style>
    </section>
  );
}
