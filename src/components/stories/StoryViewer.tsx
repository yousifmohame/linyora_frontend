// src/components/stories/StoryViewer.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { X, ShoppingBag } from 'lucide-react';
import { StoryFeedItem, Story } from '@/types/story';
import { fetchStoriesById, markStoryViewed } from '@/lib/api/stories';
import Link from 'next/link';

interface StoryViewerProps {
  feedItems: StoryFeedItem[];
  initialIndex: number;
  onClose: () => void;
}

export default function StoryViewer({ feedItems, initialIndex, onClose }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialIndex);
  const [stories, setStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // حماية: إذا كان الفهرس خارج الحدود، أغلق العارض
  const currentUserItem = feedItems[currentUserIndex];

  // 1. جلب القصص عند تغيير المستخدم
  useEffect(() => {
    let isMounted = true; // لمنع تحديث الحالة إذا تم إلغاء تحميل المكون

    const loadStories = async () => {
      if (!currentUserItem || !currentUserItem.id) return;

      setIsLoading(true);
      setStories([]); // تصفير القصص القديمة فوراً
      setProgress(0);
      setCurrentStoryIndex(0); // إعادة تعيين الفهرس

      try {
        const type = currentUserItem.isAdminSection ? 'section' : 'user';
        const data = await fetchStoriesById(currentUserItem.id, type);
        
        if (isMounted) {
          if (data && data.length > 0) {
            setStories(data);
          } else {
             // إذا لم تكن هناك قصص، ننتقل للمستخدم التالي أو نغلق
             // نستخدم timeout بسيط لتجنب خطأ "update while rendering"
             setTimeout(() => onClose(), 0);
          }
        }
      } catch (error) {
        console.error("Failed to load stories", error);
        if (isMounted) setTimeout(() => onClose(), 0);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadStories();

    return () => { isMounted = false; };
  }, [currentUserIndex, currentUserItem, onClose]);

  // 2. تسجيل المشاهدة (مع إصلاح الخطأ)
  useEffect(() => {
    // التأكد من وجود القصة والفهرس الصحيح
    const story = stories[currentStoryIndex];
    if (story && !story.isViewed) {
      markStoryViewed(story.id).catch(console.error);
    }
  }, [currentStoryIndex, stories]);

  // منطق التنقل
  const handleNext = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentUserIndex < feedItems.length - 1) {
      setCurrentUserIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentStoryIndex, stories.length, currentUserIndex, feedItems.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(prev => prev - 1);
    }
  }, [currentStoryIndex, currentUserIndex]);

  // المؤقت
  useEffect(() => {
    if (isLoading || stories.length === 0 || isPaused) return;

    const currentStory = stories[currentStoryIndex];
    // حماية إضافية هنا أيضاً
    if (!currentStory) return;

    if (currentStory.type === 'video') return;

    const duration = 5000;
    const interval = 50;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          handleNext();
          return 0;
        }
        return prev + (interval / duration) * 100;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStoryIndex, isLoading, stories, handleNext, isPaused]);

  // معالجة الفيديو
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration > 0) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    }
  };

  if (!currentUserItem) return null;

  const activeStory = stories[currentStoryIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="relative w-full h-full md:w-[400px] md:h-[90vh] md:rounded-xl overflow-hidden bg-gray-900 shadow-2xl">
        
        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {!isLoading && activeStory && (
          <>
            {/* Header & Progress */}
            <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-6 bg-gradient-to-b from-black/60 to-transparent">
              <div className="flex gap-1 mb-3">
                {stories.map((story, idx) => (
                  <div key={story.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-100 ease-linear"
                      style={{ 
                        width: idx < currentStoryIndex ? '100%' : 
                               idx === currentStoryIndex ? `${progress}%` : '0%' 
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-white/50 overflow-hidden">
                     <Image 
                       src={currentUserItem.isAdminSection ? (currentUserItem.cover_image || '/placeholder-story.jpg') : (currentUserItem.userAvatar || '/placeholder-user.png')} 
                       alt="Avatar" 
                       fill 
                       className="object-cover" 
                     />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-bold">{currentUserItem.isAdminSection ? currentUserItem.title : currentUserItem.userName}</p>
                    <p className="text-xs text-white/70">
                        {new Date(activeStory.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div 
              className="absolute inset-0 z-10"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
                {activeStory.type === 'image' && (
                    <Image 
                      src={activeStory.media_url || ''} 
                      alt="Story" 
                      fill 
                      className="object-cover"
                      priority
                    />
                )}
                
                {activeStory.type === 'video' && (
                    <video
                        ref={videoRef}
                        src={activeStory.media_url || ''}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        onTimeUpdate={handleVideoTimeUpdate}
                        onEnded={handleNext}
                    />
                )}

                {activeStory.type === 'text' && (
                    <div 
                        className="w-full h-full flex items-center justify-center p-8 text-center"
                        style={{ backgroundColor: activeStory.background_color || '#000' }}
                    >
                        <p className="text-2xl md:text-3xl font-bold text-white whitespace-pre-wrap leading-relaxed">
                            {activeStory.text_content}
                        </p>
                    </div>
                )}
                
                {activeStory.type !== 'text' && activeStory.text_content && (
                    <div className="absolute bottom-32 left-0 right-0 p-6 text-center z-20">
                         <p className="text-white text-lg font-medium drop-shadow-md bg-black/30 p-2 rounded-lg inline-block">
                             {activeStory.text_content}
                         </p>
                    </div>
                )}

                <div className="absolute inset-0 flex">
                    <div className="w-1/3 h-full" onClick={handlePrev}></div>
                    <div className="w-2/3 h-full" onClick={handleNext}></div>
                </div>
            </div>

            {/* Product Link */}
            {activeStory.product_id && (
                <div className="absolute bottom-8 left-4 right-4 z-40">
                    <Link href={`/products/${activeStory.product_id}`} passHref>
                        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl flex items-center gap-4 shadow-lg hover:bg-white transition-colors cursor-pointer group">
                             {activeStory.product_image && (
                                 <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                                     <Image src={activeStory.product_image} alt="Product" fill className="object-cover" />
                                 </div>
                             )}
                             <div className="flex-1">
                                 <p className="text-xs font-semibold text-primary mb-0.5">ترويج منتج</p>
                                 <p className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                     {activeStory.product_name}
                                 </p>
                                 {activeStory.product_price && (
                                     <p className="text-xs text-gray-600">{activeStory.product_price} ج.م</p>
                                 )}
                             </div>
                             <div className="bg-primary text-white p-2 rounded-full">
                                 <ShoppingBag size={20} />
                             </div>
                        </div>
                    </Link>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}