'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import Hls from 'hls.js';
import type { Hls as HlsType } from 'hls.js';
import { Reel } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  PlayCircle,
  MessageCircle,
  ShoppingBag,
  MoreVertical,
  Share2,
  Flag,
  Eye,
  Pause,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ReelCommentsSheet } from './ReelCommentsSheet';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface ReelsSliderProps {
  reels: Reel[];
  autoPlay?: boolean;
}

const ReelItem = memo(
  ({
    reel,
    isLiked,
    onLikeToggle,
    onOpenComments,
    onShare,
    onReport,
    isPlaying,
    onTogglePlayPause,
    onVideoMount,
    onVideoUnmount,
  }: {
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
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<HlsType | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const hasTaggedProducts = reel.tagged_products && reel.tagged_products.length > 0;

    useEffect(() => {
      if (videoRef.current) {
        onVideoMount(reel.id, videoRef.current);
      }

      return () => {
        onVideoUnmount(reel.id);
      };
    }, [reel.id, onVideoMount, onVideoUnmount]);

    const handleVideoError = useCallback(
      (e: React.SyntheticEvent<HTMLVideoElement>) => {
        console.warn(`Video error for reel ${reel.id}:`, reel.video_url);
        setHasError(true);
        setIsLoading(false);

        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
            setHasError(false);
            setIsLoading(true);
            if (videoRef.current) {
              videoRef.current.load();
            }
          }, 1000 * (retryCount + 1));
        }
      },
      [reel.id, reel.video_url, retryCount]
    );

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = '';

      const videoUrl = reel.video_url;
      if (videoUrl && videoUrl.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(videoUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.warn('HLS Error:', data);
            handleVideoError(new Event('error') as any);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = videoUrl;
        }
      } else if (videoUrl) {
        video.src = videoUrl;
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [reel.video_url, handleVideoError]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      if (isPlaying && video.paused) {
        video.currentTime = 0;
        video.play().catch(console.warn);
      } else if (!isPlaying && !video.paused) {
        video.pause();
      }
    }, [isPlaying]);

    const formatNumber = useCallback((num: number): string => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }, []);

    const handleVideoLoad = useCallback(() => {
      setIsLoading(false);
      setHasError(false);
    }, []);

    const handleVideoLoadStart = useCallback(() => {
      setIsLoading(true);
    }, []);

    const handleVideoCanPlay = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleTogglePlayPause = useCallback(() => {
      onTogglePlayPause(reel.id, videoRef.current);
    }, [reel.id, onTogglePlayPause]);

    const handleLikeClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onLikeToggle(reel.id);
      },
      [reel.id, onLikeToggle]
    );

    const handleCommentsClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenComments(reel);
      },
      [reel, onOpenComments]
    );

    const isValidVideoUrl =
      reel.video_url &&
      (reel.video_url.startsWith('http') ||
        reel.video_url.startsWith('blob') ||
        reel.video_url.startsWith('/') ||
        reel.video_url.startsWith('https'));

    const handleRetry = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setRetryCount(0);
        setHasError(false);
        setIsLoading(true);
        if (videoRef.current) {
          videoRef.current.load();
        }
      },
      []
    );

    return (
      <CarouselItem className="pl-2 sm:pl-4 basis-4/5 xs:basis-3/4 sm:basis-1/2 md:basis-2/5 lg:basis-1/4 xl:basis-1/5">
        <Card className="overflow-hidden py-0 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 group relative border-0 bg-white">
          <CardContent className="p-0 relative">
            <div className="relative aspect-[9/16] bg-gray-100 rounded-2xl overflow-hidden">
              {isValidVideoUrl && !hasError ? (
                <>
                  <video
                    ref={videoRef}
                    data-reel-id={reel.id}
                    className="w-full h-full object-cover"
                    poster={reel.thumbnail_url || undefined}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadStart={handleVideoLoadStart}
                    onLoadedData={handleVideoLoad}
                    onError={handleVideoError}
                    onCanPlay={handleVideoCanPlay}
                    onEmptied={handleVideoError}
                    onStalled={handleVideoError}
                    crossOrigin="anonymous"
                  />

                  {isLoading && (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-600">جاري التحميل...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm mb-2">تعذر تحميل الفيديو</p>
                    {retryCount < 2 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="text-xs border-gray-400 text-gray-600"
                      >
                        إعادة المحاولة
                      </Button>
                    ) : (
                      <p className="text-gray-500 text-xs">يرجى تحديث الصفحة</p>
                    )}
                  </div>
                </div>
              )}

              {isValidVideoUrl && !hasError && !isLoading && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/30 to-transparent" />
                </>
              )}

              {isValidVideoUrl && !hasError && !isLoading && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={handleTogglePlayPause}
                >
                  <div className="bg-black/60 rounded-full p-3 transition-transform hover:scale-110">
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <PlayCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* Top Action Buttons */}
              <div className="absolute top-2 left-2 right-2 z-20 flex justify-between items-start">
                {hasTaggedProducts && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white bg-black/50 hover:bg-black/70 rounded-full h-9 w-9 p-1 transition-all duration-200"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-[10px] bg-red-500 border-0">
                          {reel.tagged_products.length}
                        </Badge>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3 bg-white border-0 shadow-xl rounded-xl">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-sm">المنتجات في الفيديو</h4>
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            {reel.tagged_products.length} منتج
                          </Badge>
                        </div>
                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                          {reel.tagged_products.map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                              <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                  src={product.image_url || '/placeholder-product.jpg'}
                                  alt={product.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-product.jpg';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-semibold text-gray-900 truncate block">
                                  {product.name}
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white bg-black/50 hover:bg-black/70 rounded-full h-9 w-9 p-1 transition-all duration-200"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border-0 shadow-xl rounded-xl min-w-36 p-2"
                  >
                    <DropdownMenuItem
                      onClick={() => onShare(reel)}
                      className="cursor-pointer text-sm px-3 py-2 rounded-lg flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      مشاركة
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200 my-1" />
                    <DropdownMenuItem
                      onClick={() => onReport(reel.id)}
                      className="cursor-pointer text-sm px-3 py-2 rounded-lg flex items-center gap-2 text-red-600"
                    >
                      <Flag className="w-4 h-4" />
                      الإبلاغ
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <Link href={`/models/${reel.userId}`} className="flex items-center gap-2 mb-2">
                  <Avatar className="w-10 h-10 border-2 border-white/80 shadow-lg flex-shrink-0">
                    <AvatarImage
                      src={reel.userAvatar || ''}
                      alt={reel.userName}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-primary to-purple-600 text-white font-semibold text-sm">
                      {reel.userName ? reel.userName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="text-white text-sm font-bold truncate block">
                      {reel.userName}
                    </span>
                    {reel.caption && (
                      <p className="text-white/90 text-xs truncate mt-0.5 leading-relaxed">
                        {reel.caption}
                      </p>
                    )}
                  </div>
                </Link>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-blue-300 h-auto p-1.5 flex items-center gap-1 transition-colors duration-200"
                      onClick={handleCommentsClick}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-xs font-medium min-w-[18px] text-right">
                        {reel.comments_count > 0 ? formatNumber(reel.comments_count) : ''}
                      </span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-red-300 h-auto p-1.5 transition-colors duration-200"
                      onClick={handleLikeClick}
                    >
                      <Heart
                        className={`w-4 h-4 transition-all duration-200 ${
                          isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                        }`}
                      />
                      <span className="text-xs font-medium min-w-[18px] text-right">
                        {reel.likes_count > 0 ? formatNumber(reel.likes_count) : ''}
                      </span>
                    </Button>
                  </div>

                  {reel.views_count > 0 && (
                    <div className="text-white/90 text-xs font-medium bg-black/40 rounded-full px-2 py-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(reel.views_count)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CarouselItem>
    );
  }
);

ReelItem.displayName = 'ReelItem';

export const ReelsSlider: React.FC<ReelsSliderProps> = ({ reels: initialReels, autoPlay = true }) => {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [likedStatus, setLikedStatus] = useState<Record<number, boolean>>({});
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  const videoElementsRef = useRef<Map<number, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const validReels = (initialReels || []).filter((reel) => {
      return (
        reel.video_url &&
        (reel.video_url.startsWith('http') ||
          reel.video_url.startsWith('blob') ||
          reel.video_url.startsWith('/') ||
          reel.video_url.startsWith('https'))
      );
    });
    setReels(validReels);
  }, [initialReels]);

  const handleVideoMount = useCallback((id: number, element: HTMLVideoElement) => {
    videoElementsRef.current.set(id, element);
  }, []);

  const handleVideoUnmount = useCallback((id: number) => {
    videoElementsRef.current.delete(id);
  }, []);

  const safePlayVideo = useCallback(async (videoElement: HTMLVideoElement) => {
    try {
      videoElement.currentTime = 0;
      await videoElement.play();
      return true;
    } catch (error) {
      console.warn('Video play failed:', error);
      return false;
    }
  }, []);

  const safePauseVideo = useCallback((videoElement: HTMLVideoElement) => {
    try {
      videoElement.pause();
    } catch (error) {
      console.warn('Video pause failed:', error);
    }
  }, []);

  useEffect(() => {
    if (!autoPlay || reels.length === 0) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      let mostVisibleReel: { id: number; visibility: number } | null = null;

      entries.forEach((entry) => {
        const videoId = Number(entry.target.getAttribute('data-reel-id'));
        const visibility = entry.intersectionRatio;

        if (visibility > 0.5) {
          if (!mostVisibleReel || visibility > mostVisibleReel.visibility) {
            mostVisibleReel = { id: videoId, visibility };
          }
        }
      });

      if (mostVisibleReel && mostVisibleReel.visibility >= 0.7) {
        setPlayingVideo(mostVisibleReel.id);

        videoElementsRef.current.forEach((video, id) => {
          if (id !== mostVisibleReel!.id && !video.paused) {
            safePauseVideo(video);
          }
        });

        const visibleVideo = videoElementsRef.current.get(mostVisibleReel.id);
        if (visibleVideo && visibleVideo.paused) {
          safePlayVideo(visibleVideo);
        }
      } else if (playingVideo) {
        const currentVideo = videoElementsRef.current.get(playingVideo);
        if (currentVideo && !currentVideo.paused) {
          safePauseVideo(currentVideo);
        }
        setPlayingVideo(null);
      }
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold: [0, 0.3, 0.5, 0.7, 0.9],
      rootMargin: '0px',
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [autoPlay, reels.length, playingVideo, safePlayVideo, safePauseVideo]);

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    videoElementsRef.current.forEach((video) => {
      observer.observe(video);
    });

    return () => {
      videoElementsRef.current.forEach((video) => {
        observer.unobserve(video);
      });
    };
  }, [reels]);

  const togglePlayPause = useCallback(
    async (reelId: number, videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return;

      try {
        if (videoElement.paused) {
          if (playingVideo && playingVideo !== reelId) {
            const currentVideo = videoElementsRef.current.get(playingVideo);
            if (currentVideo) {
              safePauseVideo(currentVideo);
            }
          }
          const played = await safePlayVideo(videoElement);
          if (played) {
            setPlayingVideo(reelId);
          }
        } else {
          safePauseVideo(videoElement);
          setPlayingVideo(null);
        }
      } catch (error) {
        console.error('Error toggling play/pause:', error);
      }
    },
    [playingVideo, safePlayVideo, safePauseVideo]
  );

  const handleLikeToggle = useCallback(
    async (reelId: number) => {
      if (!user) {
        toast.error('يرجى تسجيل الدخول للإعجاب بالفيديوهات.');
        return;
      }

      const currentlyLiked = likedStatus[reelId] || false;
      const newLikedStatus = !currentlyLiked;

      setLikedStatus((prev) => ({ ...prev, [reelId]: newLikedStatus }));
      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel.id === reelId
            ? {
                ...reel,
                likes_count: newLikedStatus
                  ? reel.likes_count + 1
                  : Math.max(0, reel.likes_count - 1),
              }
            : reel
        )
      );

      try {
        if (newLikedStatus) {
          await api.post(`/reels/${reelId}/like`);
        } else {
          await api.delete(`/reels/${reelId}/like`);
        }
      } catch (error) {
        setLikedStatus((prev) => ({ ...prev, [reelId]: currentlyLiked }));
        setReels((prevReels) =>
          prevReels.map((reel) =>
            reel.id === reelId
              ? {
                  ...reel,
                  likes_count: currentlyLiked
                    ? reel.likes_count
                    : Math.max(0, reel.likes_count - 1),
                }
              : reel
          )
        );
        toast.error('فشل في تحديث حالة الإعجاب.');
      }
    },
    [user, likedStatus]
  );

  const openComments = useCallback((reel: Reel) => {
    setSelectedReel(reel);
    setIsCommentsOpen(true);
  }, []);

  const handleShare = useCallback((reel: Reel) => {
    const shareUrl = `${window.location.origin}/reels/${reel.id}`;

    if (navigator.share) {
      navigator
        .share({
          title: `فيديو من ${reel.userName} - Linyora`,
          text: reel.caption || 'شاهد هذا الفيديو المميز على Linyora',
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast.success('تم نسخ رابط الفيديو إلى الحافظة');
        })
        .catch(() => {
          toast.error('فشل في نسخ الرابط');
        });
    }
  }, []);

  const handleReport = useCallback(async (reelId: number) => {
    try {
      await api.post(`/reels/${reelId}/report`);
      toast.success('تم الإبلاغ عن الفيديو بنجاح');
    } catch (error) {
      toast.error('فشل في الإبلاغ عن الفيديو');
    }
  }, []);

  useEffect(() => {
    if (!user || reels.length === 0) {
      setLikedStatus({});
      return;
    }

    const fetchLikeStatus = async () => {
      try {
        const reelIds = reels.map((r) => r.id);
        const response = await api.post('/reels/like-status', { reelIds });
        setLikedStatus(response.data || {});
      } catch (error) {
        console.error('Failed to fetch initial like status:', error);
        setLikedStatus({});
      }
    };

    fetchLikeStatus();
  }, [user, reels]);

  if (!reels || reels.length === 0) {
    return (
      <section className="bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlayCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد فيديوهات حالياً</h3>
            <p className="text-gray-500 mb-6">كن أول من يشارك ستايله مع المجتمع!</p>
            <Button className="bg-primary hover:bg-primary/90">ابدأ بمشاركة فيديو</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white mb-3 py-4">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs bg-primary/10 text-primary border-0">
              🎥 الريلات الجديدة
            </Badge>
          </div>

          {reels.length > 0 ? (
            <Carousel
              ref={carouselRef}
              opts={{
                align: 'start',
                loop: false,
                direction: 'rtl',
                skipSnaps: false,
              }}
              className="w-full relative"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {reels.map((reel) => (
                  <ReelItem
                    key={reel.id}
                    reel={reel}
                    isLiked={likedStatus[reel.id] || false}
                    onLikeToggle={handleLikeToggle}
                    onOpenComments={openComments}
                    onShare={handleShare}
                    onReport={handleReport}
                    isPlaying={playingVideo === reel.id}
                    onTogglePlayPause={togglePlayPause}
                    onVideoMount={handleVideoMount}
                    onVideoUnmount={handleVideoUnmount}
                  />
                ))}
              </CarouselContent>

              {reels.length > 2 && (
                <>
                  <CarouselPrevious className="absolute -start-2 md:-start-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:h-10 md:w-10 bg-white/90 border-0 shadow-lg hover:bg-white transition-colors duration-200 text-gray-700" />
                  <CarouselNext className="absolute -end-2 md:-end-4 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:h-10 md:w-10 bg-white/90 border-0 shadow-lg hover:bg-white transition-colors duration-200 text-gray-700" />
                </>
              )}
            </Carousel>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">لا توجد فيديوهات متاحة</h3>
              <p className="text-gray-500">جميع الفيديوهات غير متاحة حاليًا</p>
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/style-today">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full px-6 text-sm"
              >
                عرض الكل
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {selectedReel && (
        <ReelCommentsSheet reel={selectedReel} isOpen={isCommentsOpen} onOpenChange={setIsCommentsOpen} />
      )}
    </>
  );
};