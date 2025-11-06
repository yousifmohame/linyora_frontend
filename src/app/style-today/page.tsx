"use client";

import { useState, useEffect } from "react";
import ReelVerticalViewer, { ReelData } from "@/components/reels/ReelVerticalViewer";
import api from "@/lib/axios";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

// (هيكل عظمي لتحسين تجربة المستخدم)
const ReelSkeleton = () => (
  <div className="relative h-full w-full max-w-md mx-auto bg-black">
    <Skeleton className="h-full w-full bg-gray-900" />
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full bg-gray-800" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 bg-gray-800" />
          <Skeleton className="h-4 w-16 bg-gray-800" />
        </div>
      </div>
      <Skeleton className="h-9 w-9 rounded-full bg-gray-800" />
    </div>
    <div className="absolute bottom-20 left-4 right-4 z-20">
      <Skeleton className="h-4 w-3/4 bg-gray-800" />
      <Skeleton className="h-4 w-1/2 bg-gray-800 mt-2" />
    </div>
    <div className="absolute right-4 bottom-20 flex flex-col gap-4 items-center z-20">
      <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
      <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
      <Skeleton className="h-12 w-12 rounded-full bg-gray-800" />
    </div>
  </div>
);


export default function StyleTodayPage() {
  const [reels, setReels] = useState<ReelData[]>([]);
  const [loadingReels, setLoadingReels] = useState(true); 
  
  // 1. 🗑️ حذفنا (page) و (hasMore) لأننا سنجلب الكل مرة واحدة
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchReels = async () => {
      setLoadingReels(true);
      try {
        console.log(`[CLIENT BROWSER] Fetching ALL reels...`);
        
        // 2. ✏️ تعديل الطلب: حذفنا (page) و (limit)
        const response = await api.get(`/reels`, {
          params: { sort: 'latest' } // طلب الكل، مرتبة بالأحدث
        });
        
        console.log("[CLIENT BROWSER] /api/reels response:", response.data);
        if (response.data.reels && response.data.reels.length > 0) {
           console.log("[CLIENT BROWSER] Example Reel (isLikedByMe):", response.data.reels[0].isLikedByMe);
           
           // 3. ✏️ تعديل: (setReels) بدلاً من الإضافة
           setReels(response.data.reels);
        }

      } catch (error) {
        console.error("Failed to fetch reels:", error);
      } finally {
        setLoadingReels(false);
      }
    };

    // لا نقم بالجلب إلا إذا انتهت المصادقة
    if (!authLoading) {
      console.log("[CLIENT BROWSER] Auth is ready. Fetching reels.");
      if (reels.length === 0) {
        fetchReels();
      }
    } else {
      console.log("[CLIENT BROWSER] Waiting for Auth to be ready...");
    }
    
  }, [authLoading, reels.length]); // 4. ✏️ تبسيط الاعتمادات


  if ((authLoading || loadingReels) && reels.length === 0) {
    return (
      <div className="h-screen w-screen bg-black" dir="ltr">
        <ReelSkeleton />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black" dir="ltr">
      <ReelVerticalViewer initialReels={reels} />
    </div>
  );
}