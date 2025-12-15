'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Reel } from '@/types';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { ReelCommentsSheet } from './ReelCommentsSheet';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// استيراد المكونات التي فصلناها
import { UserCard } from './UserCard';
import { RadioTower, Share2Icon, TrendingUp } from 'lucide-react';
import { ReelSection } from './ReelSection2';

interface User {
  id: number;
  name: string;
  store_name: string;
  profile_picture_url?: string;
}

interface ReelsSliderProps {
  reels: Reel[];
}

export const ReelsSlider: React.FC<ReelsSliderProps> = ({ reels: initialReels }) => {
  const { user } = useAuth();
  
  // State
  const [reels, setReels] = useState<Reel[]>([]);
  const [models, setModels] = useState<User[]>([]);
  const [merchants, setMerchants] = useState<User[]>([]);
  const [loadingSidebars, setLoadingSidebars] = useState(true);
  

  // --- 1. Fetch Sidebar Data ---
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
      } finally {
        setLoadingSidebars(false);
      }
    };
    fetchSidebarData();
  }, []);

  // --- 3. Fetch Like Status ---
  useEffect(() => {
    if (!user || reels.length === 0) {
      return;
    }
    const fetchLikeStatus = async () => {
      try {
        const reelIds = reels.map(r => r.id);
        const response = await api.post('/reels/like-status', { reelIds });
      } catch (error) {
        console.error("Failed to fetch like status:", error);
      }
    };
    fetchLikeStatus();
  }, [user, reels]);


  return (
    <>
      <section className="bg-rose-50 py-2 mb-4">
        <div className="container mx-auto px-4 space-y-12">
          
          {/* ================= القسم الأول: أشهر المودلز ================= */}
          <div className="space-y-4 mb-2 bg-white py-2 px-8 rounded-2xl animate-fade-in-up">
            <div className="flex items-center gap-3">
                <div className='relative'>
                  <TrendingUp className='h-7 w-7 text-purple-500' />
                  <div className='absolute inset-0 bg-purple-400 blur-lg opacity-50'></div>
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900">أشهر المودلز</h2>
                  <p className="text-gray-600 text-sm">تابعي أفضل المودلز</p>
                </div>
            </div>
            
            <ScrollArea dir='rtl' className="w-full whitespace-nowrap rounded-xl p-2">
                <div className="flex w-max space-x-4 space-x-reverse pb-2">
                    {loadingSidebars ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 min-w-[100px]">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))
                    ) : models.length > 0 ? (
                        models.map(user => (
                            <UserCard key={user.id} user={user} userType="models" />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 w-full text-center py-4">لا يوجد مودلز حالياً</p>
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <ReelSection />
          
          {/* ================= القسم الثالث: أشهر التاجرات ================= */}
          <div className="space-y-4 bg-white py-2 rounded-2xl px-8 animate-fade-in-up delay-200">
            <div className="flex items-center gap-3">
                <div className='relative'>
                  <TrendingUp className='h-7 w-7 text-purple-500' />
                  <div className='absolute inset-0 bg-purple-400 blur-lg opacity-50'></div>
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900">أشهر التاجرات</h2>
                  <p className="text-gray-600 text-sm">تابعي أفضل البائعات</p>
                </div>
            </div>

            <ScrollArea dir='rtl' className="w-full whitespace-nowrap rounded-xl p-2">
                <div className="flex w-max space-x-4 space-x-reverse pb-2">
                    {loadingSidebars ? (
                        [...Array(6)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center gap-1 min-w-[100px]">
                                <Skeleton className="h-20 w-20 rounded-full" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))
                    ) : merchants.length > 0 ? (
                        merchants.map(user => (
                            <UserCard key={user.id} user={user} userType="merchants" />
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 w-full text-center py-4">لا يوجد تاجرات حالياً</p>
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

        </div>
      </section>
    </>
  );
};