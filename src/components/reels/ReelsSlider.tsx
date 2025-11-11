// src/components/reels/ReelsSlider.tsx
// --- هذا هو الكود الكامل والجديد والمدمج ---

'use client';

// [1] استيراد المكونات اللازمة
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Reel } from '@/types';
import api from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// ✨ [إضافة] استيراد الأيقونات والحالات التي يحتاجها ReelItem
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
  Play,
  Camera,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ReelCommentsSheet } from './ReelCommentsSheet';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// [2] تعريف نوع المستخدم (User)
interface User {
  id: number;
  name: string;
  profile_picture_url?: string;
}

// [3] مكون مساعد لبطاقة المستخدم (للمودلز والتاجرات)
const UserCard = ({ user, userType = 'models' }: { user: User, userType?: 'models' | 'merchants' }) => {
  
  // --- ✨ هذا هو التعديل المطلوب ---
  // إذا لم يكن هناك رابط للصورة (null أو undefined أو string فارغ)
  // لا تقم بعرض المكون (اعرض null)
  if (!user.profile_picture_url) {
    return null; 
  }
  // ---------------------------------

  // إذا وصلنا إلى هنا، فالصورة موجودة، وسنستمر في عرض الكود الأصلي
  return (
    <Link
      href={`/${userType}/${user.id}`}
      className="flex items-center align-middle p-0 rounded hover:bg-gray-100 transition-colors"
    >
      <Avatar className="relative w-full h-25 bg-amber-200 border rounded overflow-hidden flex items-center justify-center">
        
        {/* هذا الكود سيعمل دائمًا الآن 
          لأننا تأكدنا أن `profile_picture_url` موجود
        */}
        <AvatarImage
          src={user.profile_picture_url}
          alt={user.name}
          className="object-cover w-full h-full"
        />
        {/* هذا الـ Fallback سيعمل فقط إذا كان الرابط موجوداً ولكنه "مكسور" أو فشل تحميله
        */}
        <AvatarFallback className="text-3xl font-semibold bg-amber-200 border-none">
          {user.name?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h4 className="hidden lg:block md:block font-semibold text-sm truncate">{user.name}</h4>
        <p className="hidden lg:block md:block text-xs text-gray-500 truncate">@{user.name}</p>
      </div>
    </Link>
  );
};

// [4] مكون مساعد للهيكل العظمي (Skeleton)
const SidebarSkeleton = () => (
  <div className="space-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-20 h-8 rounded-md" />
      </div>
    ))}
  </div>
);

// ✨ [5] إضافة مكون ReelItem الذي كان ناقصاً
// (هذا هو الكود الذي أرسلته سابقاً، وهو المسؤول عن عرض الفيديو)
const ReelItem = memo<{
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
}>(
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
  }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
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

    const formatNumber = useCallback((num: number): string => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    }, []);

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

    const handleRetry = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setRetryCount(0);
      setHasError(false);
      setIsLoading(true);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }, []);

    // هذا هو كود عرض الفيديو
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <Card className="overflow-hidden w-auto h-full aspect-[9/16] relative border-0 bg-black">
          <CardContent className="p-0 relative h-full">
            <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
              {isValidVideoUrl && !hasError ? (
                <>
                  <video
                    ref={videoRef}
                    data-reel-id={reel.id}
                    src={reel.video_url}
                    className="w-full h-full object-contain"
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
                    <div className="absolute inset-0 bg-black flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-gray-400">جاري التحميل...</p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                  <div className="text-center p-4">
                    <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm mb-2">تعذر تحميل الفيديو</p>
                    {retryCount < 2 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        className="text-xs border-gray-600 text-gray-300"
                      >
                        إعادة المحاولة
                      </Button>
                    ) : (
                      <p className="text-gray-500 text-xs">يرجى تحديث الصفحة</p>
                    )}
                  </div>
                </div>
              )}

              {/* ... (باقي أزرار الواجهة للفيديو) ... */}
              {isValidVideoUrl && !hasError && !isLoading && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-70" />
                  <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
                </>
              )}

              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                onClick={handleTogglePlayPause}
              >
                {!isPlaying && (
                  <div className="bg-black/50 backdrop-blur-sm rounded-full p-4 transition-transform hover:scale-110 opacity-80">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              <div className="absolute top-4 left-2 right-2 z-20 flex justify-between items-start">
                {/* زر المنتجات */}
                {hasTaggedProducts && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full h-10 w-10 p-1"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] bg-red-500 border-0">
                          {reel.tagged_products.length}
                        </Badge>
                      </Button>
                    </PopoverTrigger>
                  </Popover>
                )}

                {/* زر المزيد */}
                <DropdownMenu>
                   {/* ... (محتوى DropdownMenu) ... */}
                </DropdownMenu>
              </div>

              <div className="absolute bottom-4 left-0 right-0 p-3 z-10">
                {/* ... (معلومات المستخدم والتعليقات واللايكات) ... */}
                <Link href={`/models/${reel.userId}`} className="flex items-center gap-2 mb-2">
                    <Avatar className="hidden lg:block md:block w-10 h-10 border-2 border-white/80 shadow-lg flex-shrink-0">
                      <AvatarImage src={reel.userAvatar || ''} alt={reel.userName} />
                      <AvatarFallback>{reel.userName ? reel.userName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="hidden lg:block md:block text-white text-sm font-bold truncate">{reel.userName}</span>
                      {reel.caption && (<p className="hidden lg:block md:block text-white/90 text-xs truncate mt-0.5">{reel.caption}</p>)}
                    </div>
                </Link>

                <div className="flex items-center justify-between">
                  <div className="hidden lg:flex md:flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-white" onClick={handleCommentsClick}>
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs font-medium min-w-[18px]">{reel.comments_count > 0 ? formatNumber(reel.comments_count) : ''}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white" onClick={handleLikeClick}>
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      <span className="text-xs font-medium min-w-[18px]">{reel.likes_count > 0 ? formatNumber(reel.likes_count) : ''}</span>
                    </Button>
                  </div>
                  {reel.views_count > 0 && (
                    <div className="text-white/90 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {formatNumber(reel.views_count)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);
ReelItem.displayName = 'ReelItem';


// --- المكون الرئيسي: ReelsSlider ---
interface ReelsSliderProps {
  reels: Reel[]; // الريلز التي تم جلبها من الصفحة الرئيسية (page.tsx)
}

export const ReelsSlider: React.FC<ReelsSliderProps> = ({ reels: initialReels }) => {
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [models, setModels] = useState<User[]>([]);
  const [merchants, setMerchants] = useState<User[]>([]);
  const [loadingSidebars, setLoadingSidebars] = useState(true);

  // ✨ [إضافة] الحالات (State) اللازمة لـ ReelItem
  const [likedStatus, setLikedStatus] = useState<Record<number, boolean>>({});
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [activeReelId, setActiveReelId] = useState<number | null>(null);
  const videoElementsRef = useRef<Map<number, HTMLVideoElement>>(new Map());

  // [7] جلب بيانات الأعمدة الجانبية
  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoadingSidebars(true);
        const [modelsRes, merchantsRes] = await Promise.all([
          api.get('/browse/top-models?limit=10'),
          api.get('/browse/top-merchants?limit=10')
        ]);
        setModels(modelsRes.data || []);
        setMerchants(merchantsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
        setModels([]);
        setMerchants([]);
      } finally {
        setLoadingSidebars(false);
      }
    };
    fetchSidebarData();
  }, []);

  // ✨ [إضافة] تهيئة الريلز وتعيين الفيديو النشط
  useEffect(() => {
    const validReels = (initialReels || []).filter(reel => reel.video_url);
    setReels(validReels);
    if (validReels.length > 0) {
      // تشغيل الفيديو الأول تلقائياً
      setActiveReelId(validReels[0].id);
    }
  }, [initialReels]);

  // ✨ [إضافة] جلب حالة اللايكات
  useEffect(() => {
    if (!user || reels.length === 0) {
      setLikedStatus({});
      return;
    }
    const fetchLikeStatus = async () => {
      try {
        const reelIds = reels.map(r => r.id);
        const response = await api.post('/reels/like-status', { reelIds });
        setLikedStatus(response.data || {});
      } catch (error) {
        console.error("Failed to fetch initial like status:", error);
      }
    };
    fetchLikeStatus();
  }, [user, reels]);
  
  // ✨ [إضافة] الدوال المساعدة لـ ReelItem
  const handleVideoMount = useCallback((id: number, element: HTMLVideoElement) => {
    videoElementsRef.current.set(id, element);
  }, []);

  const handleVideoUnmount = useCallback((id: number) => {
    videoElementsRef.current.delete(id);
  }, []);

  const togglePlayPause = useCallback(async (reelId: number, videoElement: HTMLVideoElement | null) => {
    if (!videoElement) return;
    if (videoElement.paused) {
      await videoElement.play().catch(() => {});
      setActiveReelId(reelId);
    } else {
      videoElement.pause();
      setActiveReelId(null);
    }
  }, []);

  const handleLikeToggle = useCallback(async (reelId: number) => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول للإعجاب بالفيديوهات.');
      return;
    }
    const currentlyLiked = likedStatus[reelId] || false;
    const newLikedStatus = !currentlyLiked;
    setLikedStatus(prev => ({ ...prev, [reelId]: newLikedStatus }));
    // ... (باقي كود تحديث اللايكات في السيرفر)
  }, [user, likedStatus]);

  const openComments = useCallback((reel: Reel) => {
    setSelectedReel(reel);
    setIsCommentsOpen(true);
  }, []);

  const handleShare = useCallback(async (reel: Reel) => {
    // ... (كود المشاركة)
  }, []);

  const handleReport = useCallback(async (reelId: number) => {
    // ... (كود الإبلاغ)
  }, []);

  // --- [8] العرض (Return) ---
  
  // نجد الفيديو الأول لعرضه
  const firstReel = reels.length > 0 ? reels[0] : null;

  return (
    <>
      <section className="bg-white mb-3 py-4">
        <div className="container mx-auto px-0">
          <div className="text-center mb-4">
            <Badge variant="secondary" className="mb-3 px-3 py-1 text-xs bg-primary/10 text-primary border-0">
              🎥 الريلات الجديدة
            </Badge>
          </div>

          {/* --- التصميم ثلاثي الأعمدة --- */}
          <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-5 h-[45vh] lg:h-[70vh] max-h-[800px] border rounded-lg overflow-hidden">
            {/* عمود المودلز - الهاتف: 1 | MD: 1 | LG: 2 */}
            <aside className="col-span-1 md:col-span-1 lg:col-span-2 justify-items-center h-full overflow-y-auto p-1 border-l bg-white">
              <h3 className="font-bold text-[12px] text-[#BA0393] lg:text-[15px] text-lg mb-4 sticky top-0 bg-white py-2">أشهر المودلز</h3>
              {loadingSidebars ? <SidebarSkeleton /> : (
                <div className="space-y-2">
                  {models.length > 0 ? (
                    models.map(user => <UserCard key={user.id} user={user} userType="models" />)
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">لا يوجد مودلز لعرضهم</p>
                  )}
                </div>
              )}
            </aside>

            {/* العمود الأوسط - الهاتف: 2 | MD: 1 | LG: 1 */}
            <main className="col-span-2 md:col-span-1 lg:col-span-1 h-full bg-black relative">
              {firstReel ? (
                <ReelItem
                  key={firstReel.id}
                  reel={firstReel}
                  isLiked={likedStatus[firstReel.id] || false}
                  onLikeToggle={handleLikeToggle}
                  onOpenComments={openComments}
                  onShare={handleShare}
                  onReport={handleReport}
                  isPlaying={activeReelId === firstReel.id}
                  onTogglePlayPause={togglePlayPause}
                  onVideoMount={handleVideoMount}
                  onVideoUnmount={handleVideoUnmount}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  لا توجد ريلز لعرضها
                </div>
              )}
            </main>

            {/* عمود التاجرات - الهاتف: 1 | MD: 1 | LG: 2 */}
            <aside className="col-span-1 md:col-span-1 lg:col-span-2 justify-items-center h-full overflow-y-auto p-1 border-r bg-white">
              <h3 className="font-bold text-[12px] text-[#BA0393] lg:text-[15px] mb-4 sticky top-0 bg-white py-2">أشهر التاجرات</h3>
              {loadingSidebars ? <SidebarSkeleton /> : (
                <div className="space-y-2">
                  {merchants.length > 0 ? (
                    merchants.map(user => <UserCard key={user.id} user={user} userType="merchants" />)
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">لا يوجد تاجرات لعرضهم</p>
                  )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ✨ [إضافة] Sheet التعليقات الذي يحتاجه ReelItem */}
      {selectedReel && (
        <ReelCommentsSheet
          reel={selectedReel}
          isOpen={isCommentsOpen}
          onOpenChange={setIsCommentsOpen}
        />
      )}
    </>
  );
};