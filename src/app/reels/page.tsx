// src/app/reels/page.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Reel } from '@/types'; // [cite: linora-platform/frontend/src/types/index.ts]
import api from '@/lib/axios'; // [cite: linora-platform/frontend/src/lib/axios.ts]
import { useInView } from 'react-intersection-observer'; // <-- مكتبة التحميل عند التمرير
import ReelPlayer from './ReelPlayer'; // <-- سننشئ هذا المكون
import { Loader2 } from 'lucide-react';

const REELS_PAGE_LIMIT = 3; // عدد الفيديوهات لتحميلها في كل مرة

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Hook لمراقبة عنصر التحميل في نهاية القائمة
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 1.0, // تشغيل عندما يكون العنصر مرئياً بالكامل
    triggerOnce: false, // استمر في المراقبة
  });

  // دالة جلب الفيديوهات
  const fetchReels = useCallback(async (pageNum: number) => {
    if (loading || !hasMore) return; // منع الطلبات المتعددة أو إذا لم يعد هناك المزيد
    setLoading(true);
    console.log(`Fetching reels page: ${pageNum}`);
    try {
      const response = await api.get('/reels', {
        params: {
          page: pageNum,
          limit: REELS_PAGE_LIMIT,
        },
      });
      const data = response.data;
      setReels((prevReels) => {
          // منع إضافة التكرارات إذا تم استدعاء fetchReels مرتين بنفس الصفحة
          const newReels = data.reels || [];
          const existingIds = new Set(prevReels.map(r => r.id));
          return [...prevReels, ...newReels.filter((r : Reel) => !existingIds.has(r.id))];
      });
      setHasMore(data.hasMore || false);
      setPage(pageNum + 1); // الانتقال للصفحة التالية للطلب القادم
    } catch (error) {
      console.error('Failed to fetch reels:', error);
      // يمكنك إضافة التعامل مع الخطأ هنا
    } finally {
      setLoading(false);
      if (initialLoad) setInitialLoad(false);
    }
  }, [loading, hasMore, initialLoad]); // تحديث الاعتماديات

  // جلب الدفعة الأولى عند تحميل المكون
  useEffect(() => {
    fetchReels(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // تشغيل مرة واحدة فقط عند التحميل

  // جلب المزيد عند رؤية عنصر التحميل
  useEffect(() => {
    if (inView && !loading && hasMore && !initialLoad) {
      fetchReels(page);
    }
  }, [inView, loading, hasMore, fetchReels, page, initialLoad]);


  return (
    // حاوية رئيسية تأخذ كامل الشاشة وتفعل التمرير العمودي Snap
    <div className="relative h-screen w-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {initialLoad && loading && (
         <div className="h-screen w-screen flex justify-center items-center text-white">
             <Loader2 className="h-12 w-12 animate-spin" />
         </div>
      )}
      {!initialLoad && reels.length === 0 && !loading && (
          <div className="h-screen w-screen flex justify-center items-center text-white text-center p-4">
              No videos found.
          </div>
      )}

      {/* عرض الفيديوهات */}
      {reels.map((reel, index) => (
        <ReelPlayer
          key={`${reel.id}-${index}`} // استخدام index لضمان مفتاح فريد في حالة تكرار محتمل مؤقت
          reel={reel}
          // نمرر الدالة لتحديث الحالة في هذه الصفحة عند الإعجاب/التعليق
          onLikeUpdate={(reelId, newLikeStatus, newLikeCount) => {
              setReels(prev => prev.map(r => r.id === reelId ? {...r, isLikedByCurrentUser: newLikeStatus, likes_count: newLikeCount} : r));
          }}
          onCommentUpdate={(reelId, newCommentCount) => {
              setReels(prev => prev.map(r => r.id === reelId ? {...r, comments_count: newCommentCount} : r));
          }}
        />
      ))}

      {/* عنصر مراقبة التحميل */}
      {hasMore && (
        <div ref={loadMoreRef} className="h-20 flex justify-center items-center text-white">
          {loading && <Loader2 className="h-8 w-8 animate-spin" />}
        </div>
      )}
       {!hasMore && reels.length > 0 && (
           <div className="h-20 flex justify-center items-center text-gray-500 text-sm">
               End of videos.
           </div>
       )}
    </div>
  );
}