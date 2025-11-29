// src/components/reels/ReelsViewerOverlay.tsx
// --- هذا هو الكود المُعدل ---

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios'; // [1] نتأكد من جلب axios
import { Reel } from '@/types';
// 💡 ملاحظة: قد تحتاج إلى استيراد نوع "User" من @/types
// import { Reel, User } from '@/types'; 
import ReelVerticalViewer from '@/components/reels/ReelVerticalViewer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';

// 💡 افترضت أن هذا هو نوع "User" لديك
// إذا كان مختلفاً، قم بتعديله
interface User {
  id: number;
  username: string;
  avatar_url?: string;
}

// --- مكون مساعد لعرض المودلز/التاجرات ---
const UserCard = ({ user, userType = 'models' }: { user: User, userType?: 'models' | 'merchants' }) => (
  <Link 
    // [تعديل] تعديل الرابط ليكون ديناميكياً
    href={`/${userType}/${user.id}`} 
    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
  >
    <Avatar className="w-10 h-10 border">
      <AvatarImage src={user.avatar_url} alt={user.username} />
      <AvatarFallback>{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-sm truncate">{user.username}</h4>
      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
    </div>
    <Button size="sm" variant="outline" className="text-xs h-7 px-3">
      متابعة
    </Button>
  </Link>
);

// --- مكون مساعد لعرض الهيكل العظمي (Skeleton) ---
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

// --- الواجهة المنبثقة الرئيسية ---
interface ReelsViewerOverlayProps {
  reels: Reel[];
  onClose: () => void;
}

export const ReelsViewerOverlay = ({ reels: initialReels, onClose }: ReelsViewerOverlayProps) => {
  const [models, setModels] = useState<User[]>([]);
  const [merchants, setMerchants] = useState<User[]>([]);
  const [loadingSidebars, setLoadingSidebars] = useState(true);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoadingSidebars(true);
        
        // [تعديل] ✨ تم تصحيح المسارات بناءً على server.js
        // نفترض أن axios مُهيأ للتعامل مع /api تلقائياً
        const [modelsRes, merchantsRes] = await Promise.all([
          api.get('/model?limit=10'), // كان '/browse/top-models'
          api.get('/merchants?limit=10') // كان '/browse/top-merchants'
        ]);
        
        // [تعديل] ✨ تأكد من أنك تأخذ البيانات من المكان الصحيح
        // (قد يكون res.data.users أو res.data.models)
        setModels(modelsRes.data.models || modelsRes.data.users || modelsRes.data || []);
        setMerchants(merchantsRes.data.merchants || merchantsRes.data.users || merchantsRes.data || []);

      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
        // في حالة الخطأ، نعرض الجوانب فارغة
        setModels([]);
        setMerchants([]);
      } finally {
        setLoadingSidebars(false);
      }
    };
    fetchSidebarData();
  }, []);

  return (
    // الخلفية والنافذة
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
      <div className="relative w-full h-full bg-white shadow-2xl overflow-hidden">
        
        {/* --- زر الإغلاق --- */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 left-4 z-[60] text-white bg-black/40 hover:bg-black/70 rounded-full"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* --- التصميم ثلاثي الأعمدة --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] h-full max-h-screen">
          
          {/* --- العمود الأيمن: المودلز (للعربية) --- */}
          <aside className="hidden lg:block h-screen overflow-y-auto p-4 border-l bg-white">
            <h3 className="font-bold text-lg mb-4 sticky top-0 bg-white py-2">أشهر المودلز</h3>
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

          {/* --- العمود الأوسط: عارض الريلز --- */}
          <main className="h-screen bg-black relative">
            {initialReels.length > 0 ? (
              <ReelVerticalViewer reels={initialReels} />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                لا توجد ريلز لعرضها
              </div>
            )}
          </main>

          {/* --- العمود الأيسر: التاجرات (للعربية) --- */}
          <aside className="hidden lg:block h-screen overflow-y-auto p-4 border-r bg-white">
            <h3 className="font-bold text-lg mb-4 sticky top-0 bg-white py-2">أشهر التاجرات</h3>
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
    </div>
  );
};