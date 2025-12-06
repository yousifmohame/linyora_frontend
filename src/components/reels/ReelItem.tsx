'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Reel } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, PlayCircle, MessageCircle, Eye, AlertCircle, ArrowLeft 
} from 'lucide-react';
import Link from 'next/link';

interface ReelItemProps {
  reel: Reel;
  isLiked: boolean;
  onLikeToggle: (id: number) => void;
  onOpenComments: (reel: Reel) => void;
  onShare: (reel: Reel) => void;
  onReport: (id: number) => void;
  isPlaying: boolean;
  onTogglePlayPause: (id: number, videoElement: HTMLVideoElement | null) => void;
  onVideoMount: (id: number, element: HTMLVideoElement) => void;
  onVideoUnmount: (id: number) => void;
}

export const ReelItem = memo<ReelItemProps>(({
  reel,
  isLiked,
  onLikeToggle,
  onOpenComments,
  isPlaying,
  onTogglePlayPause,
  onVideoMount,
  onVideoUnmount,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // تسجيل الفيديو عند التحميل
  useEffect(() => {
    if (videoRef.current) {
      onVideoMount(reel.id, videoRef.current);
    }
    return () => {
      onVideoUnmount(reel.id);
    };
  }, [reel.id, onVideoMount, onVideoUnmount]);

  // التحكم في التشغيل/الإيقاف
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying && video.paused) {
      video.currentTime = 0;
      video.play().catch(() => {});
    } else if (!isPlaying && !video.paused) {
      video.pause();
    }
  }, [isPlaying]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setHasError(false);
        setIsLoading(true);
        videoRef.current?.load();
      }, 1000 * (retryCount + 1));
    }
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    videoRef.current?.load();
  };

  const isValidVideoUrl = reel.video_url && 
    (reel.video_url.startsWith('http') || reel.video_url.startsWith('/'));

  return (
    <div className="w-full max-w-md mx-auto aspect-[9/16] relative bg-black rounded-xl overflow-hidden shadow-2xl">
      <Card className="border-0 bg-transparent h-full w-full">
        <CardContent className="p-0 h-full w-full relative">
          
          {/* Video Player */}
          {isValidVideoUrl && !hasError ? (
            <>
              <video
                ref={videoRef}
                src={reel.video_url}
                className="w-full h-full object-cover"
                poster={reel.thumbnail_url || undefined}
                muted
                loop
                playsInline
                preload="metadata"
                onLoadStart={() => setIsLoading(true)}
                onLoadedData={() => setIsLoading(false)}
                onError={handleVideoError}
                onCanPlay={() => setIsLoading(false)}
                onClick={() => onTogglePlayPause(reel.id, videoRef.current)}
              />
              
              {/* Loading Spinner */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                  <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}

              {/* Play Button Overlay */}
              {!isPlaying && !isLoading && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 cursor-pointer"
                  onClick={() => onTogglePlayPause(reel.id, videoRef.current)}
                >
                  <PlayCircle className="w-16 h-16 text-white/80 opacity-80" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-gray-400 gap-4">
              <AlertCircle className="w-12 h-12" />
              <p>تعذر تحميل الفيديو</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>إعادة المحاولة</Button>
            </div>
          )}

          {/* Overlays (Gradient) */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

          {/* Top Button (All Reels) */}
          <div className="absolute top-4 right-4 z-20">
             <Link href="/reels">
                <Button size="sm" variant="secondary" className="rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border-0 h-8 text-xs">
                   شاهد المزيد <ArrowLeft className="w-3 h-3 mr-1" />
                </Button>
             </Link>
          </div>

          {/* Bottom Info Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20 space-y-3">
            
            {/* User Info */}
            <Link href={`/models/${reel.userId}`} className="flex items-center gap-3 group">
              <Avatar className="w-10 h-10 border-2 border-white transition-transform group-hover:scale-105">
                <AvatarImage src={reel.userAvatar || ''} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-white font-bold text-sm truncate shadow-black drop-shadow-md">
                  {reel.userName}
                </p>
                {reel.caption && (
                  <p className="text-white/90 text-xs line-clamp-2 drop-shadow-md">
                    {reel.caption}
                  </p>
                )}
              </div>
            </Link>

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  {/* Like Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                    onClick={(e) => { e.stopPropagation(); onLikeToggle(reel.id); }}
                  >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <span className="text-white text-xs font-bold -ml-1">
                    {formatNumber(reel.likes_count)}
                  </span>

                  {/* Comment Button */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                    onClick={(e) => { e.stopPropagation(); onOpenComments(reel); }}
                  >
                    <MessageCircle className="w-6 h-6" />
                  </Button>
                  <span className="text-white text-xs font-bold -ml-1">
                    {formatNumber(reel.comments_count)}
                  </span>
               </div>

               {/* Views Count */}
               {reel.views_count > 0 && (
                 <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <Eye className="w-3 h-3 text-white/70" />
                    <span className="text-white/90 text-xs font-medium">{formatNumber(reel.views_count)}</span>
                 </div>
               )}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
});

ReelItem.displayName = 'ReelItem';