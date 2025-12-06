'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, UserPlus, CheckCircle2, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface User {
  id: number;
  name: string;
  store_name?: string;
  profile_picture_url?: string;
  followers?: number;
  rating?: string | number;
  isFollowedByMe?: boolean;
}

interface UserCardProps {
  user: User;
  userType?: 'models' | 'merchants';
}

export const UserCard = ({ user, userType = 'models' }: UserCardProps) => {
  const { user: currentUser } = useAuth();
  
  // --- States لإدارة التفاعل الفوري (مثل ModelProfileClient) ---
  const [isFollowing, setIsFollowing] = useState(user.isFollowedByMe || false);
  const [followersCount, setFollowersCount] = useState(user.followers || 0);
  const [followLoading, setFollowLoading] = useState(false);

  const defaultImage = '/shop.jpg';
  const imageUrl = user.profile_picture_url || defaultImage;
  const isMerchant = userType === 'merchants';

  const displayName = isMerchant ? (user.store_name || user.name) : user.name;
  const displayFallback = (displayName || '?').charAt(0).toUpperCase();
  const displayHandle = user.name.replace(/\s+/g, '').toLowerCase();

  const formatNumber = (num?: number): string => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // --- دالة المتابعة (نفس المنطق في ModelProfileClient) ---
  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault(); // منع الانتقال لصفحة البروفايل
    e.stopPropagation();

    if (!currentUser) {
      toast.error('يرجى تسجيل الدخول لمتابعة المستخدمين');
      return;
    }

    if (currentUser.id === user.id) {
        toast.info('لا يمكنك متابعة نفسك');
        return;
    }

    if (followLoading) return;

    // 1. حفظ الحالة القديمة للتراجع عند الخطأ
    const previousIsFollowing = isFollowing;
    const previousFollowersCount = followersCount;

    // 2. تحديث متفائل (Optimistic Update)
    setFollowLoading(true);
    setIsFollowing(!isFollowing);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

    try {
      // 3. إرسال الطلب للسيرفر
      // في الباك إند لديك toggleFollow يتولى الإضافة أو الحذف
      await api.post(`/users/${user.id}/follow`);
      
      // (اختياري) رسالة نجاح
      // toast.success(isFollowing ? 'تم إلغاء المتابعة' : 'تمت المتابعة بنجاح');

    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      
      // 4. التراجع في حالة الخطأ
      setIsFollowing(previousIsFollowing);
      setFollowersCount(previousFollowersCount);
      toast.error('حدث خطأ أثناء تنفيذ الطلب');
    } finally {
      setFollowLoading(false);
    }
  };

  // إخفاء زر المتابعة إذا كان المستخدم هو نفسه صاحب البطاقة
  const showFollowButton = !currentUser || currentUser.id !== user.id;

  return (
    <Link
      href={`/${userType}/${user.id}`}
      className="group relative flex flex-col items-center p-3 rounded-2xl transition-all duration-300 min-w-[130px] snap-start hover:bg-white/50"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/0 to-pink-100/0 rounded-2xl opacity-0 group-hover:from-purple-50/80 group-hover:to-pink-50/80 group-hover:opacity-100 transition-all duration-300 border border-transparent group-hover:border-pink-100" />
      
      <div className="relative z-10 flex flex-col items-center w-full">

        {/* Avatar Section */}
        <div className="relative mb-2">
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 opacity-70 blur-[2px] group-hover:opacity-100 group-hover:blur-[3px] transition-all"></div>
            
            <div className="relative p-[2px] bg-white rounded-full">
                <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-white bg-gray-50">
                    <AvatarImage src={imageUrl} alt={displayName} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600 font-bold text-xl">
                        {displayFallback}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div className="absolute bottom-0 right-0 bg-white rounded-full p-[2px] shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />
            </div>
            
            {user.rating && (
                <div className="absolute -top-1 -left-2 bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 rounded-full px-1.5 py-0.5 flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-[10px] font-bold text-gray-700">{user.rating}</span>
                </div>
            )}
        </div>

        {/* Text Info */}
        <div className="text-center w-full space-y-0.5">
          <h4 className="text-gray-900 font-bold text-sm truncate w-full px-1 group-hover:text-purple-700 transition-colors">
            {displayName}
          </h4>
          
          <p className="text-gray-400 text-[10px] truncate w-full dir-ltr">
            @{displayHandle}
          </p>

          {/* Stats Row (مربوط بالـ State) */}
          <div className="flex items-center justify-center gap-3 mt-2 py-1">
             <div className="flex flex-col items-center transition-all duration-300">
                <span className="text-xs font-bold text-gray-800">{formatNumber(followersCount)}</span>
                <span className="text-[9px] text-gray-400">متابع</span>
             </div>
          </div>

          {/* Follow Button (تفاعلي مثل ModelProfileClient) */}
          {showFollowButton && (
              <Button
                size="sm"
                onClick={handleFollow}
                disabled={followLoading}
                className={cn(
                    "mt-2 w-full h-8 flex items-center justify-center gap-1.5 text-[10px] font-medium rounded-full transition-all shadow-sm transform hover:-translate-y-0.5 active:scale-95",
                    isFollowing 
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200" 
                    : "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-purple-600 hover:to-pink-600 text-white"
                )}
                variant={isFollowing ? "ghost" : "default"}
              >
                {followLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : isFollowing ? (
                    <>
                        <UserCheck className="h-3 w-3 text-green-600" />
                        <span>أتابعه</span>
                    </>
                ) : (
                    <>
                        <UserPlus className="h-3 w-3" />
                        <span>متابعة</span>
                    </>
                )}
              </Button>
          )}
        </div>
      </div>
    </Link>
  );
};