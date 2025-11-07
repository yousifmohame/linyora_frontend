'use client';

import { Swiper, SwiperSlide, Swiper as SwiperType } from 'swiper/react';
import { Mousewheel, Keyboard, Virtual } from 'swiper/modules';
import 'swiper/css';
import { ReelCard } from './ReelCard';
import { useState, useEffect, useCallback, useMemo } from 'react';

export type ReelData = {
  id: number;
  video_url: string;
  thumbnail_url?: string;
  caption: string;
  views_count: number;
  shares_count: number;
  likes_count: number;
  comments_count: number;
  userId: number;
  userName: string;
  userAvatar: string;
  duration?: number;
  tagged_products?: Array<{
    id: number;
    name: string;
    price: number;
    image_url: string;
    discount_price?: number;
  }>;
  created_at: string;
  isLikedByMe: boolean;
  isFollowedByMe: boolean;
};

interface ReelVerticalViewerProps {
  initialReels: ReelData[];
}

export default function ReelVerticalViewer({ initialReels }: ReelVerticalViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const reels = useMemo(() => {
    if (Array.isArray(initialReels)) {
      return initialReels.filter(
        (reel) =>
          reel.video_url &&
          (reel.video_url.startsWith('http') || reel.video_url.startsWith('/'))
      );
    }
    return [];
  }, [initialReels]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
  }, []);

  const swiperConfig = useMemo(
    () => ({
      direction: 'vertical' as const,
      slidesPerView: 1,
      spaceBetween: 0,
      mousewheel: {
        forceToAxis: true,
        sensitivity: 1,
        releaseOnEdges: true,
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false,
      },
      virtual: {
        addSlidesAfter: 1,
        addSlidesBefore: 1,
        cache: true,
      },
      resistanceRatio: 0,
      speed: 400,
      threshold: 5,
      followFinger: true,
      longSwipesRatio: 0.1,
    }),
    []
  );

  if (isLoading) {
    return (
      <div className="h-full w-full bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-black">
      <Swiper
        {...swiperConfig}
        modules={[Mousewheel, Keyboard, Virtual]}
        className="h-full w-full"
        onSlideChange={handleSlideChange}
      >
        {reels.length > 0 ? (
          reels.map((reel, index) => (
            <SwiperSlide key={reel.id} virtualIndex={index}>
              {({ isActive }) => (
                <div className="flex items-center justify-center h-full w-full">
                  <ReelCard
                    reel={reel}
                    isActive={isActive}
                    isVisible={Math.abs(index - activeIndex) <= 1}
                  />
                </div>
              )}
            </SwiperSlide>
          ))
        ) : (
          <SwiperSlide>
            <div className="flex flex-col items-center justify-center h-full text-white bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center max-w-md mx-4">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎥</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">لا توجد فيديوهات</h3>
                <p className="text-gray-400 mb-6">كن أول من يشارك ستايله مع المجتمع!</p>
                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-all duration-200">
                  أنشئ أول فيديو لك
                </button>
              </div>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  );
}