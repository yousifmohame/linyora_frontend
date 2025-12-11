'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, ServicePackage, Offer, Reel } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"; 
import {
  Instagram, CheckCircle, PlayCircle, Heart, MessageCircle, UserPlus, Youtube, Send,
  Twitter, Facebook, Music, MapPin, Share2, Sparkles, Grid3X3, ShoppingBag, 
  Image as ImageIcon, VideoIcon, X, Play
} from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// تعريف الأنواع
interface ReelData extends Reel {
  userAvatar?: string | null;
  userName?: string;
}

interface ModelProfileData {
  profile: User & {
    role_name: string;
    stats?: {
      followers?: string;
      engagement?: string;
      reelsCount?: number;
      inAppFollowers?: number;
      [key: string]: any;
    };
    social_links?: {
      instagram?: string;
      snapchat?: string;
      youtube?: string;
      tiktok?: string;
      twitter?: string;
      facebook?: string;
      [key: string]: any;
    };
    portfolio?: string[];
    is_verified?: boolean;
    isFollowedByMe?: boolean;
    cover_url?: string;
    bio?: string;
    location?: string;
    joined_date?: string;
  };
  reels: ReelData[];
  services: ServicePackage[];
  offers: Offer[];
}

interface ModelProfileClientProps {
  profileData: ModelProfileData;
}

// ✅ 1. مكون ReelViewer (عارض الفيديو)
const ReelViewerModal = ({ reel, isOpen, onClose }: { reel: ReelData | null, isOpen: boolean, onClose: () => void }) => {
    if (!reel) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-full p-0 overflow-hidden bg-black border-none sm:max-w-lg md:max-w-xl h-[80vh] sm:h-[90vh] flex flex-col items-center justify-center [&>button]:text-white [&>button]:top-4 [&>button]:right-4 [&>button]:z-50">
                <DialogHeader className="sr-only">
                    <DialogTitle>مشاهدة الريلز</DialogTitle>
                </DialogHeader>

                <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video 
                        src={reel.video_url} 
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        loop
                        playsInline
                    />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white pointer-events-none">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-10 h-10 border border-white/20">
                            <AvatarImage src={reel.userAvatar || ''} />
                            <AvatarFallback>{reel.userName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{reel.userName}</span>
                    </div>
                    {reel.caption && (
                        <p className="text-sm line-clamp-3 mb-4 text-gray-100 leading-relaxed dir-auto">
                            {reel.caption}
                        </p>
                    )}
                    <div className="flex items-center gap-6 text-sm pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <Heart className="w-6 h-6 text-white" /> 
                            <span className="font-medium">{reel.likes_count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-6 h-6 text-white" /> 
                            <span className="font-medium">{reel.comments_count}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

// ✅ 2. مكون PortfolioViewer (عارض الصور الجديد)
const PortfolioViewerModal = ({ url, isOpen, onClose }: { url: string | null, isOpen: boolean, onClose: () => void }) => {
    if (!url) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl w-full p-0 overflow-hidden bg-black/95 border-none h-auto min-h-[50vh] max-h-[90vh] flex flex-col items-center justify-center [&>button]:text-white [&>button]:top-4 [&>button]:right-4 [&>button]:z-50 [&>button]:bg-black/50 [&>button]:rounded-full [&>button]:p-1">
                <DialogHeader className="sr-only">
                    <DialogTitle>عرض الصورة</DialogTitle>
                </DialogHeader>
                
                <div className="relative w-full h-full min-h-[50vh] flex items-center justify-center p-4">
                    <Image 
                        src={url} 
                        alt="Portfolio Full View" 
                        fill 
                        className="object-contain" 
                        priority
                        sizes="90vw"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};

// عنصر ريلز في الشبكة
const ReelGridItem: React.FC<{ reel: ReelData, onClick: (reel: ReelData) => void }> = ({ reel, onClick }) => {
  return (
    <div 
        onClick={() => onClick(reel)}
        className="relative aspect-[9/16] group overflow-hidden rounded-xl bg-gray-900 cursor-pointer shadow-sm hover:shadow-md transition-all"
    >
      {reel.thumbnail_url ? (
          <Image
            src={reel.thumbnail_url}
            alt="Reel thumbnail"
            fill
            sizes="(max-width: 640px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
      ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
             <VideoIcon className="w-8 h-8 text-gray-600" />
          </div>
      )}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <PlayCircle className="w-12 h-12 text-white/90 drop-shadow-xl transform scale-90 group-hover:scale-100 transition-transform" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-3 text-white">
        <div className="flex items-center gap-1 text-xs font-bold shadow-sm">
          <Play className="w-3 h-3 fill-white" /> {reel.views_count || 0}
        </div>
      </div>
    </div>
  );
};

const ModelProfileClient: React.FC<ModelProfileClientProps> = ({ profileData }) => {
  const { t } = useTranslation();
  const { profile, reels, services, offers } = profileData;
  const { user } = useAuth();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(profile.isFollowedByMe || false);
  const [followLoading, setFollowLoading] = useState(false);
  
  // State for Modals
  const [selectedReel, setSelectedReel] = useState<ReelData | null>(null);
  const [isReelModalOpen, setIsReelModalOpen] = useState(false);
  
  // ✅ 3. حالة جديدة لمودال الصور
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<string | null>(null);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);

  useEffect(() => {
    setIsFollowing(profile.isFollowedByMe || false);
  }, [profile.isFollowedByMe]);

  const handleFollow = async () => {
    if (!user) {
      toast.error(t('ModelProfilee.toast.loginToFollow'));
      router.push('/login');
      return;
    }
    if (user.id === profile.id) {
      toast.info(t('ModelProfilee.toast.cannotFollowSelf'));
      return;
    }
    setFollowLoading(true);
    const originalFollowState = isFollowing;
    setIsFollowing(!originalFollowState);
    try {
      if (originalFollowState) {
        await api.delete(`/users/${profile.id}/follow`);
        toast.success(t('ModelProfilee.toast.unfollowed', { name: profile.name }));
      } else {
        await api.post(`/users/${profile.id}/follow`);
        toast.success(t('ModelProfilee.toast.followed', { name: profile.name }));
      }
    } catch (error) {
      toast.error(t('ModelProfilee.toast.error'));
      setIsFollowing(originalFollowState);
    } finally {
      setFollowLoading(false);
    }
  };

  const openReelModal = (reel: ReelData) => {
      const reelWithUser = {
          ...reel,
          userAvatar: reel.userAvatar || profile.profile_picture_url,
          userName: reel.userName || profile.name
      };
      setSelectedReel(reelWithUser);
      setIsReelModalOpen(true);
  };

  // ✅ 4. دالة فتح مودال الصور
  const openPortfolioModal = (url: string) => {
      setSelectedPortfolioItem(url);
      setIsPortfolioModalOpen(true);
  };

  const stats = profile.stats || {};
  const socialLinks = profile.social_links || {};
  const portfolio = profile.portfolio || [];

  const SocialButton = ({ href, icon: Icon, colorClass }: { href: string; icon: any; colorClass?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button variant="outline" size="icon" className={`rounded-full w-10 h-10 border-gray-200 hover:bg-gray-50 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </Button>
    </a>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Cover & Header */}
      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
        {profile.cover_url ? (
          <Image src={profile.cover_url} alt="Cover" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-100 to-white opacity-80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="relative -mt-16 mb-6">
          <div className="inline-block relative">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white">
              <Avatar className="h-full w-full">
                <AvatarImage src={profile.profile_picture_url || ''} alt={profile.name} className="object-cover" />
                <AvatarFallback className="text-4xl bg-gray-100 text-gray-400">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            {profile.is_verified && (
              <div className="absolute bottom-2 right-0 h-8 w-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mb-6">
          <div className="flex flex-col gap-2 mb-3">
            <h1 className="text-gray-900 text-2xl font-bold">{profile.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                {profile.role_name || t('common.influencer')}
              </span>
              {profile.is_verified && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-transparent font-medium">
                  {t('common.verified_account')}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mb-4">@{profile.name?.toLowerCase().replace(/\s+/g, '_')}</p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-100/50">
              <p className="text-gray-900 text-lg font-bold text-purple-900">
                {stats.inAppFollowers || stats.followers || '0'}
              </p>
              <p className="text-purple-700/70 text-xs font-medium">{t('ModelProfilee.stats.followers', {defaultValue: 'Followers'})}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-100/50">
              <p className="text-gray-900 text-lg font-bold text-purple-900">{stats.reelsCount || reels.length}</p>
              <p className="text-purple-700/70 text-xs font-medium">{t('ModelProfilee.stats.reels', {defaultValue: 'Posts'})}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center border border-purple-100/50">
              <p className="text-gray-900 text-lg font-bold text-purple-900">{services.length + offers.length}</p>
              <p className="text-purple-700/70 text-xs font-medium">{t('ModelProfilee.tabs.services', {defaultValue: 'Services'})}</p>
            </div>
          </div>

          {profile.bio && (
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm">
                {profile.bio}
              </p>
            </div>
          )}

          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
             {socialLinks.instagram && <SocialButton href={socialLinks.instagram} icon={Instagram} colorClass="text-pink-600" />}
             {socialLinks.twitter && <SocialButton href={socialLinks.twitter} icon={Twitter} colorClass="text-blue-400" />}
             {socialLinks.youtube && <SocialButton href={socialLinks.youtube} icon={Youtube} colorClass="text-red-600" />}
             {socialLinks.tiktok && <SocialButton href={socialLinks.tiktok} icon={Music} colorClass="text-black" />}
             {socialLinks.snapchat && <SocialButton href={socialLinks.snapchat} icon={Send} colorClass="text-yellow-500" />}
             {socialLinks.facebook && <SocialButton href={socialLinks.facebook} icon={Facebook} colorClass="text-blue-700" />}
          </div>

          <div className="flex gap-3 mb-8">
            {user && user.id !== profile.id && (
                <Button 
                    onClick={handleFollow} 
                    disabled={followLoading}
                    className="flex-1 rounded-xl h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-md transition-all hover:shadow-lg"
                >
                    {followLoading ? (
                        <span className="animate-spin">...</span>
                    ) : isFollowing ? (
                        <>{t('ModelProfilee.actions.following')} <CheckCircle className="ml-2 h-4 w-4" /></>
                    ) : (
                        <>{t('ModelProfilee.actions.follow')} <UserPlus className="ml-2 h-4 w-4" /></>
                    )}
                </Button>
            )}
            <Button variant="outline" size="icon" className="w-11 h-11 rounded-xl border-2 border-gray-100 hover:bg-gray-50 text-gray-700 shrink-0">
               <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="portfolio" className="w-full">
          <TabsList className="w-full h-12 bg-gray-50 p-1 rounded-xl mb-6 grid grid-cols-3 z-40 border border-gray-100">
            <TabsTrigger value="portfolio" className="rounded-lg h-full data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all">
                <Grid3X3 className="w-4 h-4 mr-2" />
                {t('ModelProfilee.tabs.portfolio')}
            </TabsTrigger>
            <TabsTrigger value="reels" className="rounded-lg h-full data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all">
                <VideoIcon className="w-4 h-4 mr-2" />
                {t('ModelProfilee.tabs.reels')}
            </TabsTrigger>
            <TabsTrigger value="services" className="rounded-lg h-full data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all">
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t('ModelProfilee.tabs.services')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reels" className="mt-0">
            {reels.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {reels.map((reel) => (
                  <ReelGridItem 
                    key={reel.id} 
                    reel={reel} 
                    onClick={openReelModal} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <VideoIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>{t('ModelProfilee.reel.empty')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="portfolio" className="mt-0">
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-3 gap-1 md:gap-2">
                {portfolio.map((itemUrl, index) => (
                  // ✅ 5. تفعيل النقر على الصور
                  <div 
                    key={index} 
                    onClick={() => openPortfolioModal(itemUrl)}
                    className="relative aspect-square bg-gray-100 overflow-hidden group cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Image
                      src={itemUrl}
                      alt={t('ModelProfilee.portfolio.alt', { index: index + 1 })}
                      fill
                      sizes="(max-width: 640px) 33vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>{t('ModelProfilee.portfolio.empty')}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="mt-0">
            <div className="space-y-4">
              {services.map((service) => (
                <Card key={service.id} className="border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-3">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{service.title}</CardTitle>
                        {service.starting_price && (
                            <Badge variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                                {t('ModelProfilee.services.startsFrom', { price: service.starting_price })}
                            </Badge>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-600 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              ))}

              {offers.map((offer) => (
                  <Card key={offer.id} className="border-purple-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-purple-100 to-transparent -mr-8 -mt-8 rounded-bl-full" />
                   <CardHeader className="pb-3">
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-lg font-bold text-gray-900">{offer.title}</CardTitle>
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0">
                                {offer.type}
                            </Badge>
                        </div>
                       <p className="text-lg font-bold text-purple-600">
                         {t('ModelProfilee.offers.price', { price: offer.price })}
                       </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <p className="text-sm text-gray-600">{offer.description}</p>
                    </CardContent>
                  </Card>
               ))}

              {services.length === 0 && offers.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <ShoppingBag className="w-12 h-12 mb-2 opacity-20" />
                    <p>{t('ModelProfilee.services.empty')}</p>
               </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Render Modals */}
      <ReelViewerModal 
        reel={selectedReel} 
        isOpen={isReelModalOpen} 
        onClose={() => setIsReelModalOpen(false)} 
      />
      
      {/* ✅ 6. عرض مودال الصور */}
      <PortfolioViewerModal
        url={selectedPortfolioItem}
        isOpen={isPortfolioModalOpen}
        onClose={() => setIsPortfolioModalOpen(false)}
      />
    </div>
  );
};

export default ModelProfileClient;