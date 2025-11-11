// src/app/merchants/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext'; // <-- 1. إضافة AuthContext
import { Product } from '@/types'; // <-- 2. إضافة نوع المنتج
import ProductCard from '@/components/ProductCard'; // <-- 3. إضافة بطاقة المنتج

// 💡 تم تحديث الـ Interface ليحتوي على المنتجات
interface MerchantProfile {
  id: number;
  name: string; // اسم التاجر
  profile_picture_url?: string; // صورته
  bio?: string; // النبذة التعريفية
  products: Product[]; // <-- 4. إضافة مصفوفة المنتجات
}

/**
 * هذا هو المكون الأساسي لصفحة ملف التاجر
 */
export default function MerchantProfilePage() {
  const params = useParams();
  const id = params.id;
  const { user } = useAuth(); // <-- 5. جلب المستخدم للتحقق من قائمة الأمنيات

  const [merchant, setMerchant] = useState<MerchantProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // <-- 6. إضافة حالة لقائمة الأمنيات
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!id) return;

    const fetchMerchantProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await api.get(`/merchants/public-profile/${id}`);
        const profileData: MerchantProfile = res.data;
        
        setMerchant(profileData);

        // --- 7. إضافة: جلب حالة قائمة الأمنيات لمنتجات التاجر ---
        if (user && profileData.products && profileData.products.length > 0) {
          const productIds = profileData.products.map((p) => p.id);
          try {
            const wishlistRes = await api.post('/customer/wishlist/status', { productIds });
            setWishlistStatus(wishlistRes.data || {});
          } catch (wishlistError) {
            console.error("Failed to fetch wishlist status:", wishlistError);
            // لا نوقف التحميل بسبب هذا الخطأ
          }
        }
        // ----------------------------------------------------

      } catch (err: any) {
        console.error("Failed to fetch merchant profile", err);
        setError("لا يمكن العثور على ملف التاجر المطلوب.");
      } finally {
        setLoading(false);
      }
    };

    fetchMerchantProfile();
  }, [id, user]); // إضافة user كـ dependency

  // --- عرض حالات الصفحة ---

  if (loading) {
    return <MerchantProfileSkeleton />;
  }

  if (error) {
    return <div className="container mx-auto py-10 text-center text-red-500">{error}</div>;
  }

  if (!merchant) {
    return <div className="container mx-auto py-10 text-center">لم يتم العثور على التاجر.</div>;
  }

  // --- عرض الصفحة بعد نجاح جلب البيانات ---
  return (
    <div className="container mx-auto p-4 my-8">
      
      {/* 1. قسم رأس الصفحة (Header) */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 bg-white rounded-lg shadow-md">
        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary/20">
          <AvatarImage src={merchant.profile_picture_url} alt={merchant.name} />
          <AvatarFallback className="text-4xl">
            {merchant.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="text-center sm:text-right">
          <h1 className="text-3xl font-bold">{merchant.name}</h1>
          <p className="text-gray-600 mt-2 max-w-lg">
            {merchant.bio || 'تاجر مسجل في منصة لينيورا.'}
          </p>
        </div>
      </div>
      
      {/* --- 8. تعديل: قسم منتجات التاجر --- */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">منتجات التاجر</h2>
        
        {merchant.products.length > 0 ? (
          // عرض المنتجات في شبكة
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
            {merchant.products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isInitiallyWishlisted={wishlistStatus[product.id] || false}
              />
            ))}
          </div>
        ) : (
          // رسالة في حال عدم وجود منتجات
          <div className="p-8 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-500">هذا التاجر لم يضف أي منتجات بعد.</p>
          </div>
        )}
      </div>
      {/* --------------------------------- */}

    </div>
  );
}

/**
 * مكون الهيكل العظمي (Skeleton) لصفحة التاجر
 * (هذا الكود كما هو من المرة السابقة)
 */
const MerchantProfileSkeleton = () => (
  <div className="container mx-auto p-4 my-8">
    {/* Skeleton Header */}
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 bg-white rounded-lg shadow-md">
      <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-full" />
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-10 w-32 mt-2" />
      </div>
    </div>
    
    {/* Skeleton Products */}
    <div className="mt-10">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full hidden sm:block" />
      </div>
    </div>
  </div>
);