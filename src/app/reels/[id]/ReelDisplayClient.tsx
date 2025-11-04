// src/app/reels/[id]/ReelDisplayClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Reel } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, ShoppingBag, SendHorizonal } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Image from 'next/image';
import { ReelCommentsSheet } from '@/components/reels/ReelCommentsSheet'; //
import { useAuth } from '@/context/AuthContext'; //
import api from '@/lib/axios';
import { toast } from 'sonner';

interface ReelDisplayClientProps {
  initialReelData: Reel;
}

const ReelDisplayClient: React.FC<ReelDisplayClientProps> = ({ initialReelData }) => {
  const { user } = useAuth();
  const [reelData, setReelData] = useState<Reel>(initialReelData);
  const [isLiked, setIsLiked] = useState(initialReelData.isLikedByCurrentUser || false);
  const [likesCount, setLikesCount] = useState(initialReelData.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(initialReelData.comments_count || 0); // حالة لعدد التعليقات
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

   // تحديث الحالة إذا تغيرت الـ props (قد لا يكون ضرورياً هنا)
   useEffect(() => {
    setReelData(initialReelData);
    setIsLiked(initialReelData.isLikedByCurrentUser || false);
    setLikesCount(initialReelData.likes_count || 0);
    setCommentsCount(initialReelData.comments_count || 0);
   }, [initialReelData]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error('Please log in to like this reel.');
      return;
    }
    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus); // Optimistic UI update
    setLikesCount(prev => newLikedStatus ? prev + 1 : Math.max(0, prev - 1));

    try {
      if (newLikedStatus) {
        await api.post(`/reels/${reelData.id}/like`);
      } else {
        await api.delete(`/reels/${reelData.id}/like`);
      }
    } catch (error) {
      console.error('Failed to update like status:', error);
      toast.error('Failed to update like status.');
      // Rollback UI on error
      setIsLiked(!newLikedStatus);
      setLikesCount(prev => newLikedStatus ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  const openComments = () => {
      setIsCommentsOpen(true);
  };

  const hasTaggedProducts = reelData.tagged_products && reelData.tagged_products.length > 0;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div className="relative w-full max-w-[400px] aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-xl">
        {/* --- Video Player --- */}
        <video
          src={reelData.video_url}
          className="w-full h-full object-cover"
          poster={reelData.thumbnail_url || undefined}
          controls // إضافة عناصر التحكم الأساسية
          autoPlay // تشغيل تلقائي (قد يحتاج لـ muted ليعمل في بعض المتصفحات)
          muted
          loop
          playsInline
          preload="auto" // تحميل الفيديو بالكامل أو جزء منه
        />

        {/* --- Overlay Content (User Info, Caption, Actions) --- */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-2">
            <Link href={`/models/${reelData.userId}`}>
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={reelData.userAvatar || ''} alt={reelData.userName} />
                <AvatarFallback>{reelData.userName ? reelData.userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
            </Link>
            <Link href={`/models/${reelData.userId}`} className="font-semibold text-sm hover:underline">
              {reelData.userName}
            </Link>
            {/* Follow button (placeholder) */}
            {/* <Button variant="outline" size="sm" className="ml-auto text-xs h-7">Follow</Button> */}
          </div>

          {/* Caption */}
          {reelData.caption && (
            <p className="text-sm mb-3 line-clamp-2">{reelData.caption}</p>
          )}

           {/* Tagged Products Icon */}
           {hasTaggedProducts && (
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant="ghost"
                        size="sm" // Smaller button
                        className="absolute top-[-50px] right-2 z-10 text-white bg-black/40 hover:bg-black/60 rounded-full h-9 w-9 p-2 flex items-center justify-center mb-3" // Adjusted position and style
                        aria-label="Show tagged products"
                        >
                        <ShoppingBag className="w-full h-full" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60 p-2">
                         {/* ... Popover content from ReelsSlider ... */}
                         <div className="space-y-2">
                           <h4 className="font-medium leading-none text-center text-sm">Products in this video</h4>
                           <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                             {reelData.tagged_products.map((product) => (
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

          {/* Action Buttons (Like, Comment) */}
          <div className="flex items-center justify-end space-x-4 rtl:space-x-reverse">
             <div className="flex flex-col items-center">
                <Button variant="ghost" size="icon" className="text-white hover:text-red-500 h-10 w-10" onClick={handleLikeToggle}>
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <span className="text-xs font-light">{likesCount}</span>
             </div>
             <div className="flex flex-col items-center">
                 <Button variant="ghost" size="icon" className="text-white hover:text-blue-400 h-10 w-10" onClick={openComments}>
                     <MessageCircle className="w-6 h-6" />
                 </Button>
                 <span className="text-xs font-light">{commentsCount}</span>
              </div>
              {/* Add Share button later if needed */}
          </div>
        </div>
      </div>

       {/* Comments Sheet */}
       <ReelCommentsSheet
          reel={reelData}
          isOpen={isCommentsOpen}
          onOpenChange={setIsCommentsOpen}
        />
    </div>
  );
};

export default ReelDisplayClient;