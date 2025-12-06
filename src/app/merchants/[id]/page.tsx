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
import { toast } from 'sonner'; // استيراد toast للعرض
import { cn } from '@/lib/utils'; // استيراد cn لدمج الكلاسات
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
  UserPlus,    // أيقونة المتابعة
  UserCheck,   // أيقونة تمت المتابعة
  Loader2,     // أيقونة التحميل
  Users        // أيقونة المتابعين
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
  // الحقول الجديدة للمتابعة
  isFollowedByMe?: boolean;
  followers_count?: number;
}

export default function MerchantProfilePage() {
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();
  const router = useRouter();

  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});

  // --- States لإدارة المتابعة ---
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
        
        // تحديث حالة المتابعة وعدد المتابعين عند جلب البيانات
        setIsFollowing(profileData.isFollowedByMe || false);
        setFollowersCount(profileData.followers_count || 0);

        if (user && profileData.products && profileData.products.length > 0) {
          const productIds = profileData.products.map((p) => p.id);
          try {
            const wishlistRes = await api.post('/customer/wishlist/status', { productIds });
            setWishlistStatus(wishlistRes.data || {});
          } catch (wishlistError) {
            console.error("Failed to fetch wishlist status");
          }
        }

      } catch (err: any) {
        console.error("Failed to fetch merchant profile", err);
        setError("لا يمكن العثور على ملف التاجر المطلوب.");
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantProfile();
  }, [id, user]);

  // --- دالة التعامل مع المتابعة (نفس المنطق من UserCard) ---
  // --- دالة التعامل مع المتابعة ---
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

    // حفظ الحالة القديمة للتراجع عند الخطأ
    const previousIsFollowing = isFollowing;
    
    // تحديث متفائل (Optimistic Update)
    setFollowLoading(true);
    // عكس الحالة
    setIsFollowing(!previousIsFollowing);
    // تحديث العداد
    setFollowersCount(prev => !previousIsFollowing ? prev + 1 : prev - 1);

    try {
      if (previousIsFollowing) {
        // إذا كان يتابع بالفعل -> إرسال طلب حذف (إلغاء متابعة)
        await api.delete(`/users/${merchant.id}/follow`);
      } else {
        // إذا لم يكن يتابع -> إرسال طلب إضافة (متابعة)
        await api.post(`/users/${merchant.id}/follow`);
      }
      
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      
      // التراجع في حالة الخطأ
      setIsFollowing(previousIsFollowing);
      setFollowersCount(prev => previousIsFollowing ? prev + 1 : prev - 1);
      toast.error('حدث خطأ أثناء تنفيذ الطلب');
    } finally {
      setFollowLoading(false);
    }
  };

  // --- دالة المشاركة ---
  const handleShare = async () => {
    if (!merchant) return;

    const shareData = {
      title: merchant.store_name,
      text: `تفضل بزيارة متجر ${merchant.store_name} المميز على منصة لينيورا ✨`,
      url: window.location.href, // الرابط الحالي للصفحة
    };

    try {
      // 1. محاولة استخدام قائمة المشاركة الأصلية (للموبايل والمتصفحات الحديثة)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // 2. البديل: نسخ الرابط للحافظة
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ رابط المتجر للحافظة');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // تجاهل خطأ "AbortError" الذي يحدث عندما يغلق المستخدم نافذة المشاركة بدون مشاركة
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

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      
      {/* 1. منطقة الغلاف */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
        {merchant.cover_url ? (
          <Image 
            src={merchant.cover_url} 
            alt="Cover" 
            fill 
            className="object-cover opacity-90"
          />
        ) : (
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* 2. قسم معلومات التاجر */}
        <div className="relative -mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              
              {/* الصورة الشخصية */}
              <div className="relative shrink-0 mx-auto md:mx-0 -mt-16 md:-mt-12">
                <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white shadow-2xl overflow-hidden bg-white">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={merchant.profile_picture_url} alt={merchant.name} className="object-cover" />
                    <AvatarFallback className="text-4xl bg-gray-100 text-gray-400 rounded-none">
                      {merchant.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute -bottom-3 -right-3 md:bottom-2 md:-right-2 bg-green-500 text-white p-1.5 rounded-full border-4 border-white shadow-sm" title="متجر موثوق">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              {/* المعلومات النصية */}
              <div className="flex-1 text-center md:text-right space-y-2 w-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                      {merchant.store_name}
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100">
                        متجر رسمي
                      </Badge>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 flex items-center justify-center md:justify-start gap-2">
                      <span className="flex items-center gap-1"><Store className="w-3 h-3" /> {merchant.name}</span>
                      {merchant.location && <span className="flex items-center gap-1">• <MapPin className="w-3 h-3" /> {merchant.location}</span>}
                    </p>
                  </div>

                  {/* أزرار الإجراءات */}
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      onClick={handleFollow}
                      disabled={followLoading}
                      className={cn(
                        "rounded-xl px-6 transition-all duration-300 min-w-[140px]",
                        isFollowing 
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200" 
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      )}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 ml-2" />
                          أتابعه
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 ml-2" />
                          متابعة المتجر
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="rounded-xl border-gray-200"
                      onClick={handleShare} // 👈 ربط الدالة هنا
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </Button>
                  </div>
                </div>

                {/* شريط الإحصائيات المصغر */}
                <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 pt-2 text-sm flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{merchant.products.length}</span>
                    <span className="text-gray-500">منتج</span>
                  </div>
                  <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                  
                  {/* إضافة قسم المتابعين هنا */}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-900">{formatNumber(followersCount)}</span>
                    <span className="text-gray-500">متابع</span>
                  </div>

                  <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-gray-900">{merchant.rating || '0.0'}</span>
                    <span className="text-gray-500">({merchant.reviews_count || '0'} تقييم)</span>
                  </div>
                  <div className="hidden md:block w-px h-4 bg-gray-200"></div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">انضم {merchant.joined_date ? new Date(merchant.joined_date).toLocaleDateString('ar-EG') : 'حديثاً'}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* 3. المحتوى (Tabs) */}
        <Tabs defaultValue="products" className="w-full">
           <TabsList className="w-full justify-start bg-transparent border-b border-gray-200 p-0 h-auto gap-6 mb-8 rounded-none">
            <TabsTrigger 
              value="products" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 py-3 px-2 text-base font-medium text-gray-500 hover:text-gray-700 transition-all"
            >
              <Grid3X3 className="w-4 h-4 ml-2" />
              المنتجات ({merchant.products.length})
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-blue-600 py-3 px-2 text-base font-medium text-gray-500 hover:text-gray-700 transition-all"
            >
              <Info className="w-4 h-4 ml-2" />
              نبذة عن المتجر
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

          <TabsContent value="about" className="mt-0">
            <Card>
              <CardContent className="p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">من نحن</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {merchant.bio || 'مرحباً بكم في متجرنا. نحن نسعى لتقديم أفضل المنتجات بجودة عالية وأسعار منافسة.'}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">جودة مضمونة</h4>
                      <p className="text-sm text-gray-500">جميع منتجاتنا أصلية 100%</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">شحن سريع</h4>
                      <p className="text-sm text-gray-500">توصيل لجميع مناطق المملكة</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">دعم فني</h4>
                      <p className="text-sm text-gray-500">خدمة عملاء على مدار الساعة</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}

const MerchantProfileSkeleton = () => (
  <div className="min-h-screen bg-gray-50 pb-12">
    <Skeleton className="h-48 md:h-64 w-full" />
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="relative -mt-20 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row items-end gap-6">
            <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white -mt-16 md:-mt-12" />
            <div className="flex-1 w-full space-y-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-80 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);