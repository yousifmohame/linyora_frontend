// src/app/reels/ReelPlayer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Reel } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ShoppingBag, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from 'next/image';
import { ReelCommentsSheet } from '@/components/reels/ReelCommentsSheet'; // [cite: linora-platform/frontend/src/components/reels/ReelCommentsSheet.tsx]
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useInView } from 'react-intersection-observer'; // لمراقبة ظهور الفيديو لتشغيله

interface ReelPlayerProps {
  reel: Reel;
  onLikeUpdate: (reelId: number, newLikeStatus: boolean, newLikeCount: number) => void;
  onCommentUpdate: (reelId: number, newCommentCount: number) => void; // سنضيف هذا لاحقاً
}

const ReelPlayer: React.FC<ReelPlayerProps> = ({ reel, onLikeUpdate, onCommentUpdate }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // البدء مكتوم الصوت أفضل
  const [isLiked, setIsLiked] = useState(reel.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(reel.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(reel.comments_count || 0);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // Hook لمراقبة ظهور عنصر الفيديو في الشاشة
  const { ref: videoContainerRef, inView } = useInView({
      threshold: 0.5, // تشغيل/إيقاف عندما يكون 50% من الفيديو مرئياً
  });

  // تشغيل/إيقاف الفيديو بناءً على ظهوره
  useEffect(() => {
      const videoElement = videoRef.current;
      if (videoElement) {
          if (inView) {
              videoElement.play().catch(error => console.log("Autoplay prevented:", error)); // محاولة التشغيل
              setIsPlaying(true);
          } else {
              videoElement.pause();
              setIsPlaying(false);
          }
      }
  }, [inView]); // يعمل عند تغير حالة الظهور

  // تحديث الحالة الداخلية عند تغير الـ props (مهم لتحديث الإعجاب من الصفحة الأبوية)
  useEffect(() => {
      setIsLiked(reel.isLikedByCurrentUser || false);
      setLikesCount(reel.likes_count || 0);
      setCommentsCount(reel.comments_count || 0);
  }, [reel.isLikedByCurrentUser, reel.likes_count, reel.comments_count]);


  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(error => console.log("Play error:", error));
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
        video.muted = !video.muted;
        setIsMuted(video.muted);
    }
  };

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error('Please log in to like this reel.');
      return;
    }
    const newLikedStatus = !isLiked;
    const newLikeCount = newLikedStatus ? likesCount + 1 : Math.max(0, likesCount - 1);

    // 1. Optimistic UI update (update local state first)
    setIsLiked(newLikedStatus);
    setLikesCount(newLikeCount);
    // 2. Notify parent component
    onLikeUpdate(reel.id, newLikedStatus, newLikeCount);

    // 3. Send request to backend
    try {
      if (newLikedStatus) {
        await api.post(`/reels/${reel.id}/like`);
      } else {
        await api.delete(`/reels/${reel.id}/like`);
      }
    } catch (error) {
      console.error('Failed to update like status on server:', error);
      toast.error('Failed to update like status.');
      // 4. Rollback UI on Failure (revert local state)
      setIsLiked(!newLikedStatus);
      setLikesCount(newLikedStatus ? Math.max(0, likesCount) : likesCount + 1); // Revert count
       // Notify parent again about the rollback (optional, depends on complexity)
       onLikeUpdate(reel.id, !newLikedStatus, newLikedStatus ? Math.max(0, likesCount) : likesCount + 1);
    }
  };


  const openComments = () => {
    setIsCommentsOpen(true);
  };

  const hasTaggedProducts = reel.tagged_products && reel.tagged_products.length > 0;

  return (
    // حاوية الفيديو تأخذ كامل الشاشة وتستخدم Snap
    <div ref={videoContainerRef} className="relative h-screen w-screen snap-start flex justify-center items-center bg-black">
      {/* --- Video Element --- */}
      <video
        ref={videoRef}
        src={reel.video_url}
        className="max-h-full max-w-full object-contain" // object-contain للحفاظ على النسبة
        poster={reel.thumbnail_url || undefined}
        loop
        playsInline
        preload="auto"
        onClick={togglePlay} // تشغيل/إيقاف عند النقر على الفيديو
        // onEnded={() => setIsPlaying(false)} // تحديث حالة التشغيل عند الانتهاء (اختياري)
      />

      {/* --- Play/Pause Button Overlay (optional, shown on pause) --- */}
       {!isPlaying && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
               <Play className="w-20 h-20 text-white/50" />
           </div>
       )}

        {/* --- Mute/Unmute Button --- */}
        <Button
            variant="ghost" size="icon"
            className="absolute top-4 right-4 z-20 text-white bg-black/30 hover:bg-black/50 rounded-full h-9 w-9 p-2"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? <VolumeX className="w-full h-full" /> : <Volume2 className="w-full h-full" />}
        </Button>

        {/* --- Tagged Products Button --- */}
         {hasTaggedProducts && (
             <Popover>
                 <PopoverTrigger asChild>
                     <Button
                         variant="ghost" size="icon"
                         className="absolute top-4 left-4 z-20 text-white bg-black/30 hover:bg-black/50 rounded-full h-9 w-9 p-2"
                         aria-label="Show tagged products"
                     >
                         <ShoppingBag className="w-full h-full" />
                     </Button>
                 </PopoverTrigger>
                 <PopoverContent className="w-60 p-2">
                    {/* ... Popover content (product list from previous step) ... */}
                    <div className="space-y-2">
                       <h4 className="font-medium leading-none text-center text-sm">Products</h4>
                       <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                         {reel.tagged_products.map((product) => (
                           <Link key={product.id} href={`/products/${product.id}`} className="flex items-center gap-2 p-1 rounded hover:bg-gray-100">
                             <div className="relative w-10 h-10 flex-shrink-0 rounded overflow-hidden">
                               <Image src={product.image_url || '/placeholder.svg'} alt={product.name} fill sizes="40px" className="object-cover"/>
                             </div>
                             <span className="text-xs font-medium truncate flex-grow">{product.name}</span>
                           </Link>
                         ))}
                       </div>
                    </div>
                 </PopoverContent>
             </Popover>
         )}

      {/* --- Sidebar Actions (Likes, Comments) --- */}
      <div className="absolute bottom-[80px] right-2 z-10 flex flex-col items-center space-y-4">
        {/* Like Button */}
        <div className="flex flex-col items-center">
          <Button variant="ghost" size="icon" className="text-white hover:text-red-500 h-10 w-10 p-0" onClick={handleLikeToggle}>
            <Heart className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </Button>
          <span className="text-xs font-semibold text-white mt-1">{likesCount}</span>
        </div>
        {/* Comment Button */}
        <div className="flex flex-col items-center">
          <Button variant="ghost" size="icon" className="text-white hover:text-blue-400 h-10 w-10 p-0" onClick={openComments}>
            <MessageCircle className="w-7 h-7" />
          </Button>
          <span className="text-xs font-semibold text-white mt-1">{commentsCount}</span>
        </div>
         {/* Share Button (Placeholder) */}
         {/* <div className="flex flex-col items-center">
             <Button variant="ghost" size="icon" className="text-white h-10 w-10 p-0">
                 <Send className="w-7 h-7" />
             </Button>
             <span className="text-xs font-semibold text-white mt-1">Share</span>
         </div> */}
      </div>

      {/* --- Bottom Overlay (User Info, Caption) --- */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent text-white z-10 pointer-events-none">
        <div className="flex items-center gap-3 mb-2 pointer-events-auto">
          <Link href={`/models/${reel.userId}`}>
            <Avatar className="w-10 h-10 border-2 border-white">
              <AvatarImage src={reel.userAvatar || ''} alt={reel.userName} />
              <AvatarFallback>{reel.userName ? reel.userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
            </Avatar>
          </Link>
          <Link href={`/models/${reel.userId}`} className="font-semibold text-sm hover:underline">
            {reel.userName}
          </Link>
          {/* Follow Button Placeholder */}
        </div>
        {reel.caption && (
          <p className="text-sm line-clamp-2">{reel.caption}</p>
        )}
      </div>

      {/* --- Comments Sheet --- */}
      {/* تأكد من أن ReelCommentsSheet لا يمنع التفاعل مع الفيديو */}
      <ReelCommentsSheet
        reel={reel}
        isOpen={isCommentsOpen}
        onOpenChange={setIsCommentsOpen}
        // يمكن إضافة دالة لتحديث عدد التعليقات هنا
        // onCommentPosted={(newCount) => setCommentsCount(newCount)}
      />
    </div>
  );
};

export default ReelPlayer; // مهم لـ Next.js App Router إذا كان هذا هو الـ default export