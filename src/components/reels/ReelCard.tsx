"use client";

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import Hls from 'hls.js';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MessageCircle,
  Share2,
  ShoppingBag,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MoreHorizontal,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import api from '@/lib/axios';
import { ReelProductsSheet } from './ReelProductsSheet';
import { ReelCommentsSheet } from './ReelCommentsSheet';
import { ReelData } from './ReelVerticalViewer';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useReelAudio } from '@/context/ReelAudioContext';
import { BackButtonIcon } from '../BackButton';

interface ReelCardProps {
  reel: ReelData;
  isActive: boolean;
  isVisible: boolean;
}

export const ReelCard = memo(function ReelCard({ reel, isActive, isVisible }: ReelCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { isMuted, toggleMute } = useReelAudio();

  const [isProductsSheetOpen, setIsProductsSheetOpen] = useState(false);
  const [isCommentsSheetOpen, setIsCommentsSheetOpen] = useState(false);

  const [likes, setLikes] = useState(reel.likes_count);
  const [shares, setShares] = useState(reel.shares_count);
  const [isLiked, setIsLiked] = useState(reel.isLikedByMe);
  const [isFollowing, setIsFollowing] = useState(reel.isFollowedByMe);

  const [likeLoading, setLikeLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [hasAudio, setHasAudio] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  // Handle HLS or MP4 video loading
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const videoUrl = reel.video_url;
    let hls: Hls | null = null;

    if (videoUrl.endsWith('.m3u8')) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
      }
    } else {
      video.src = videoUrl;
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [reel.video_url]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setVideoProgress(0);
    };
    const handleLoadedMetadata = () => {
      setHasAudio(
        video.mozHasAudio ||
        Boolean(video.webkitAudioDecodedByteCount) ||
        Boolean(video.audioTracks && video.audioTracks.length > 0)
      );
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  // Apply global mute state to video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = isMuted;
  }, [isMuted]);

  // Auto-play logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive && isVisible) {
      const playWithSound = async () => {
        try {
          video.muted = false;
          await video.play();
          if (isMuted) {
            video.muted = true;
          }
        } catch (error) {
          try {
            video.muted = true;
            await video.play();
          } catch (secondError) {
            console.log('Auto-play failed:', secondError);
          }
        }
      };

      const timer = setTimeout(playWithSound, 100);

      return () => {
        clearTimeout(timer);
        video.pause();
        setIsPlaying(false);
      };
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, isVisible, isMuted]);

  // Video progress tracking
  useEffect(() => {
    if (isPlaying && isActive) {
      progressIntervalRef.current = setInterval(() => {
        const video = videoRef.current;
        if (video && video.duration) {
          setVideoProgress((video.currentTime / video.duration) * 100);
        }
      }, 200);
    } else {
      clearInterval(progressIntervalRef.current);
    }

    return () => clearInterval(progressIntervalRef.current);
  }, [isPlaying, isActive]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  }, []);

  const handleLike = useCallback(async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول للإعجاب بالفيديوهات');
      router.push('/login');
      return;
    }

    setLikeLoading(true);
    const originalLikeState = isLiked;
    setIsLiked(!originalLikeState);
    setLikes((prev) => (originalLikeState ? prev - 1 : prev + 1));

    try {
      if (originalLikeState) {
        await api.delete(`/reels/${reel.id}/like`);
      } else {
        await api.post(`/reels/${reel.id}/like`);
      }
    } catch (error) {
      console.error('فشل في الإعجاب:', error);
      toast.error('حدث خطأ ما');
      setIsLiked(originalLikeState);
      setLikes((prev) => (originalLikeState ? prev + 1 : prev - 1));
    } finally {
      setLikeLoading(false);
    }
  }, [user, isLiked, reel.id, router]);

  const handleShare = useCallback(async () => {
    try {
      const { data } = await api.post(`/reels/${reel.id}/share`);
      setShares(data.shares_count);

      const shareUrl = `${window.location.origin}/reels/${reel.id}`;

      if (navigator.share) {
        await navigator.share({
          title: `فيديو من ${reel.userName}`,
          text: reel.caption,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('تم نسخ الرابط!');
      }
    } catch (error) {
      console.error('فشل في المشاركة:', error);
    }
  }, [reel.id, reel.userName, reel.caption]);

  const handleFollow = useCallback(async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول لمتابعة المستخدمين');
      router.push('/login');
      return;
    }

    if (user.id === reel.userId) {
      toast.info('لا يمكنك متابعة نفسك');
      return;
    }

    setFollowLoading(true);
    const originalFollowState = isFollowing;
    setIsFollowing(!originalFollowState);

    try {
      if (originalFollowState) {
        await api.delete(`/users/${reel.userId}/follow`);
        toast.success(`تم إلغاء متابعة ${reel.userName}`);
      } else {
        await api.post(`/users/${reel.userId}/follow`);
        toast.success(`بدأت متابعة ${reel.userName}`);
      }
    } catch (error) {
      console.error('فشل في المتابعة:', error);
      toast.error('حدث خطأ ما');
      setIsFollowing(originalFollowState);
    } finally {
      setFollowLoading(false);
    }
  }, [user, isFollowing, reel.userId, reel.userName, router]);

  const hasProducts = reel.tagged_products && reel.tagged_products.length > 0;

  const formatNumber = useCallback((num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }, []);

  return (
    <div className="relative h-full w-full max-w-md mx-auto bg-black snap-center touch-none">
      {/* Video Container */}
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          loop
          muted={isMuted}
          playsInline
          preload="metadata"
          poster={reel.thumbnail_url}
          className="h-full w-full object-cover"
          onClick={togglePlayPause}
        />

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600 z-20">
          <div
            className="h-full bg-primary transition-all duration-200"
            style={{ width: `${videoProgress}%` }}
          />
        </div>

        {/* Top Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10" />

        {/* Top Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          <div className="mb-4">
            <BackButtonIcon />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <Link href={`/models/${reel.userId}`} className="flex items-center gap-3 group/user">
              <Avatar className="w-10 h-10 border-2 border-white/80 cursor-pointer hover:border-white transition-all">
                <AvatarImage src={reel.userAvatar} alt={reel.userName} />
                <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white font-semibold">
                  {reel.userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="text-white">
              <div className="font-semibold text-sm">{reel.userName}</div>
              {user && user.id !== reel.userId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-3 text-xs bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 mt-1"
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {isFollowing ? (
                    <UserCheck className="w-3 h-3 mr-1" />
                  ) : (
                    <UserPlus className="w-3 h-3 mr-1" />
                  )}
                  {isFollowing ? 'متابَع' : 'متابعة'}
                </Button>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {hasAudio && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-white hover:bg-white/20 backdrop-blur-sm"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <MoreHorizontal size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-black/90 backdrop-blur-sm border-gray-800">
                <DropdownMenuItem className="text-white hover:bg-white/10">حفظ في المفضلة</DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10">الإبلاغ</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-white hover:bg-white/10">غير مهتم</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

        {/* Caption */}
        <div className="absolute bottom-20 left-4 right-4 z-20">
          <p className="text-white text-sm font-medium line-clamp-2 leading-relaxed">{reel.caption}</p>
          {hasProducts && (
            <Badge variant="secondary" className="mt-2 bg-white/20 backdrop-blur-sm text-white border-0">
              {reel.tagged_products.length} منتج متوفر
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute right-4 bottom-20 flex flex-col gap-4 items-center z-20">
          {/* Like */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-white hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110"
              onClick={handleLike}
              disabled={likeLoading}
            >
              <Heart
                size={28}
                className={`transition-all duration-200 ${
                  isLiked ? 'fill-red-500 text-red-500 scale-110' : ''
                }`}
              />
            </Button>
            <span className="text-white text-xs font-medium mt-1">{formatNumber(likes)}</span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-white hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110"
              onClick={() => setIsCommentsSheetOpen(true)}
            >
              <MessageCircle size={28} />
            </Button>
            <span className="text-white text-xs font-medium mt-1">{formatNumber(reel.comments_count)}</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 text-white hover:bg-white/20 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110"
              onClick={handleShare}
            >
              <Share2 size={28} />
            </Button>
            <span className="text-white text-xs font-medium mt-1">{formatNumber(shares)}</span>
          </div>

          {/* Shop */}
          {hasProducts && (
            <div className="flex flex-col items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-14 w-14 text-pink-400 hover:bg-pink-400/20 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 border-2 border-pink-400/50"
                onClick={() => setIsProductsSheetOpen(true)}
              >
                <ShoppingBag size={32} />
              </Button>
              <span className="text-white text-xs font-medium mt-1">تسوق</span>
            </div>
          )}
        </div>

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer z-10"
            onClick={togglePlayPause}
          >
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-4 transition-all duration-200 hover:scale-110">
              <Play size={40} className="text-white ml-1" />
            </div>
          </div>
        )}
      </div>

      {/* Sheets */}
      <ReelProductsSheet
        reelId={reel.id}
        modelId={reel.userId}
        isOpen={isProductsSheetOpen}
        setIsOpen={setIsProductsSheetOpen}
      />

      <ReelCommentsSheet
        reel={reel}
        isOpen={isCommentsSheetOpen}
        onOpenChange={setIsCommentsSheetOpen}
      />
    </div>
  );
});