// src/app/merchants/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Store,
  MapPin,
  Calendar,
  CheckCircle,
  ShoppingBag,
  Share2,
  MessageCircle,
  Star,
  Grid3X3,
  Info,
  UserPlus,
  UserCheck,
  Loader2,
  Users,
  Instagram,
  Twitter,
  Link as LinkIcon,
} from 'lucide-react';
import Image from 'next/image';

interface MerchantProfile {
  id: number;
  name: string;
  store_name: string;
  profile_picture_url?: string;
  bio?: string;
  products: Product[];
  cover_url?: string;
  location?: string;
  joined_date?: string;
  rating?: number;
  reviews_count?: number;
  isFollowedByMe?: boolean;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  total_sales?: number;
}

export default function MerchantProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const router = useRouter();

  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchMerchantProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/merchants/public-profile/${id}`);
        const profileData: MerchantProfile = res.data;
        setMerchant(profileData);
        setIsFollowing(profileData.isFollowedByMe || false);
        setFollowersCount(profileData.followers_count || 0);
        if (user && profileData.products?.length > 0) {
          const productIds = profileData.products.map((p) => p.id);
          try {
            const wishlistRes = await api.post('/customer/wishlist/status', { productIds });
            setWishlistStatus(wishlistRes.data || {});
          } catch (wishlistError) {
            console.error('Failed to fetch wishlist status');
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch merchant profile', err);
        setError('لا يمكن العثور على ملف التاجر المطلوب.');
      } finally {
        setLoading(false);
      }
    };
    fetchMerchantProfile();
  }, [id, user]);

  const handleFollow = async () => {
    if (!user) {
      toast.error('يرجى تسجيل الدخول لمتابعة المتجر');
      router.push('/login');
      return;
    }
    if (user.id === merchant?.id) {
      toast.info('لا يمكنك متابعة نفسك');
      return;
    }
    if (followLoading || !merchant) return;

    const previousIsFollowing = isFollowing;
    setFollowLoading(true);
    setIsFollowing(!previousIsFollowing);
    setFollowersCount((prev) => (!previousIsFollowing ? prev + 1 : prev - 1));

    try {
      if (previousIsFollowing) {
        await api.delete(`/users/${merchant.id}/follow`);
      } else {
        await api.post(`/users/${merchant.id}/follow`);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      setIsFollowing(previousIsFollowing);
      setFollowersCount((prev) => (previousIsFollowing ? prev + 1 : prev - 1));
      toast.error('حدث خطأ أثناء تنفيذ الطلب');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleShare = async () => {
    if (!merchant) return;
    const shareData = {
      title: merchant.store_name,
      text: `تفضل بزيارة متجر ${merchant.store_name} المميز على منصة لينيورا ✨`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط المتجر للحافظة');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) return <MerchantProfileSkeleton />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <Store className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">عذراً</h2>
        <p className="text-gray-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          إعادة المحاولة
        </Button>
      </div>
    );
  }
  if (!merchant) return null;

  // Mock fallbacks to match static design (if missing in API)
  const followers = merchant.followers_count || 0;
  const following = merchant.following_count || 0;
  const posts = merchant.products.length || 0; // Or use merchant.posts_count
  const rating = merchant.rating ? Number(merchant.rating).toFixed(1) : "0.0";
  const reviews = merchant.reviews_count || 0;
  const sales = merchant.total_sales || 0;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-5 w-5 text-gray-700">
              <path d="m12 19-7-7 7-7"></path>
              <path d="M19 12H5"></path>
            </svg>
          </button>
          <div className="text-center flex-1">
            <h1 className="text-gray-900 font-medium">{merchant.store_name}</h1>
            <p className="text-gray-500 text-sm">@{merchant.name?.toLowerCase()}</p>
          </div>
          <button className="inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis-vertical h-5 w-5 text-gray-700">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>
      </div>

      {/* Cover */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
        {merchant.cover_url ? (
          <Image
            src={merchant.cover_url}
            alt="Cover"
            fill
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Profile Section */}
      <div className="relative px-4 pb-6">
        {/* Avatar with badge */}
        <div className="relative -mt-16 mb-4">
          <div className="inline-block">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
              {merchant.profile_picture_url ? (
                <Image
                  src={merchant.profile_picture_url}
                  alt={merchant.store_name}
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                  {merchant.store_name.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute bottom-2 right-0 h-10 w-10 rounded-full bg-blue-500 border-4 border-white flex items-center justify-center shadow-lg">
              <CheckCircle className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
        </div>

        {/* Store name & badges */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-gray-900 text-2xl font-bold">{merchant.store_name}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 px-2 py-0.5 text-xs font-medium gap-1">
              <Store className="h-4 w-4 ml-0.5" />
              تاجر معتمد
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5 text-xs font-medium">
              أفضل تاجر 2024
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 px-2 py-0.5 text-xs font-medium">
              توصيل سريع
            </Badge>
          </div>
          <p className="text-gray-600 text-sm">@{merchant.name?.toLowerCase()}</p>
        </div>

        {/* Stats: followers, following, posts */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100">
          <button className="text-center group">
            <p className="text-gray-900 text-xl font-bold group-hover:text-purple-600 transition-colors">{formatNumber(followers)}</p>
            <p className="text-gray-500 text-sm">متابع</p>
          </button>
          <button className="text-center group border-x border-gray-200">
            <p className="text-gray-900 text-xl font-bold group-hover:text-purple-600 transition-colors">{following}</p>
            <p className="text-gray-500 text-sm">يتابع</p>
          </button>
          <button className="text-center group">
            <p className="text-gray-900 text-xl font-bold group-hover:text-purple-600 transition-colors">{merchant.products.length}</p>
            <p className="text-gray-500 text-sm">منتجات</p>
          </button>
        </div>

        {/* Rating, reviews, sales */}
        <div className="flex items-center justify-around mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <div>
              <p className="text-gray-900 font-bold">{rating}</p>
              <p className="text-gray-500 text-xs">التقييم</p>
            </div>
          </div>
          <div className="h-8 w-px bg-amber-200"></div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-gray-900 font-bold">{reviews}</p>
              <p className="text-gray-500 text-xs">تقييم</p>
            </div>
          </div>
          <div className="h-8 w-px bg-amber-200"></div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-gray-900 font-bold">{sales >= 1000 ? '15K+' : sales}</p>
              <p className="text-gray-500 text-xs">مبيعات</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-line leading-relaxed">
            {merchant.bio ||
              `🏪 متجر متخصص في الملابس والأحذية الرياضية\n✨ منتجات أصلية 100%\n📦 شحن سريع لجميع المناطق\n💯 ضمان الجودة`}
          </p>
        </div>

        {/* Location & join date */}
        <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{merchant.location || 'الرياض، السعودية'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>انضم {merchant.joined_date ? new Date(merchant.joined_date).toLocaleDateString('ar-SA') : 'يناير 2022'}</span>
          </div>
        </div>

        {/* Social links */}
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="icon" className="size-9 h-9 w-9 rounded-full">
            <Instagram className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-9 h-9 w-9 rounded-full">
            <Twitter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="size-9 h-9 w-9 rounded-full">
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={handleFollow}
            disabled={followLoading}
            className={cn(
              'flex-1 rounded-xl h-11 text-white font-medium',
              isFollowing
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
            )}
          >
            {followLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isFollowing ? (
              <>
                <UserCheck className="h-4 w-4 ml-2" />
                أتابعه
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 ml-2" />
                متابعة
              </>
            )}
          </Button>

          <Button variant="outline" size="icon" className="size-9 h-11 w-11 rounded-xl border-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-100">
            <p className="text-gray-900 text-sm font-medium">{sales} منتج مباع</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-100">
            <p className="text-gray-900 text-sm font-medium">تقييم 5.0 / {rating}</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-100">
            <p className="text-gray-900 text-sm font-medium">شحن مجاني</p>
          </div>
        </div>

        {/* Tabs */}
        <div dir="ltr" className="flex flex-col gap-2 w-full">
          <Tabs defaultValue="products" className="w-full">
           <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 p-0 h-auto gap-6 mb-8 rounded-none">
            <TabsTrigger 
              value="products" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 py-3 px-2 text-base font-medium text-gray-500 hover:text-gray-700 transition-all"
            >
              <Grid3X3 className="w-4 h-4 ml-2" />
              المنتجات ({merchant.products.length})
            </TabsTrigger>
            
          </TabsList>

          <TabsContent value="products" className="mt-0">
            {merchant.products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {merchant.products.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isInitiallyWishlisted={wishlistStatus[product.id] || false}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-200 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">لا توجد منتجات حالياً</h3>
                <p className="text-gray-500">لم يقم التاجر بإضافة أي منتجات للعرض بعد.</p>
              </div>
            )}
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

const MerchantProfileSkeleton = () => (
  <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="h-16"></div>
    </div>
    <Skeleton className="h-48 w-full" />
    <div className="relative px-4 pb-6">
      <Skeleton className="h-32 w-32 rounded-full -mt-16 mb-4" />
      <Skeleton className="h-8 w-48 mb-3" />
      <div className="flex gap-2 mb-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
      <div className="flex gap-4 mb-4 p-3 rounded-xl">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-10 w-1/3" />
      </div>
      <Skeleton className="h-20 w-full mb-4 rounded-xl" />
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-28" />
      </div>
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 flex-1 rounded-xl" />
        <Skeleton className="h-11 w-11 rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl mb-4" />
      <div className="grid grid-cols-2 gap-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);