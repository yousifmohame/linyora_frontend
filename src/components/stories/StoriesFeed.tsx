// src/components/stories/StoriesFeed.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchStoriesFeed } from '@/lib/api/stories';
import { StoryFeedItem } from '@/types/story';
import StoryItem from './StoryItem';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import StoryViewer from './StoryViewer';

export default function StoriesFeed() {
  const [stories, setStories] = useState<StoryFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [initialStoryIndex, setInitialStoryIndex] = useState(0);

  // دالة لجلب البيانات (تم فصلها لاستخدامها لاحقاً)
  const loadStories = async () => {
    try {
      const data = await fetchStoriesFeed();
      setStories(data);
    } catch (error) {
      console.error("Failed to load stories feed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleStoryClick = (index: number) => {
    setInitialStoryIndex(index);
    setViewerOpen(true);
  };

  // ✅ التعديل هنا: إعادة جلب البيانات عند الإغلاق لتحديث حالة "تمت المشاهدة"
  const handleCloseViewer = async () => {
    setViewerOpen(false);
    // نقوم بإعادة تحميل الشريط ليتحقق مما إذا تمت مشاهدة القصص ويحولها للون الرمادي
    await loadStories();
  };

  if (!loading && stories.length === 0) return null;

  return (
    <div className="w-full py-4 border-b bg-background">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center gap-4 px-4 min-w-max">
          
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
               <div key={i} className="flex flex-col gap-2 items-center">
                 <Skeleton className="w-16 h-16 rounded-full" />
                 <Skeleton className="w-12 h-3" />
               </div>
            ))
          ) : (
            stories.map((item, index) => (
              <StoryItem 
                key={`${item.isAdminSection ? 's' : 'u'}-${item.id}`} 
                item={item} 
                onClick={() => handleStoryClick(index)} 
              />
            ))
          )}
          
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
      
      {viewerOpen && (
        <StoryViewer 
            feedItems={stories} 
            initialIndex={initialStoryIndex} 
            onClose={handleCloseViewer} // تمرير الدالة المحدثة
        />
      )}
    </div>
  );
}