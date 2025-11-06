'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, ServicePackage, Offer } from '@/types';
import { ReelData } from '@/components/reels/ReelVerticalViewer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Instagram,
  Mail,
  CheckCircle,
  PlayCircle,
  Heart,
  MessageCircle,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ModelProfileData {
  profile: User & {
    role_name: string;
    stats?: { followers?: string; engagement?: string; reelsCount?: number; [key: string]: any };
    social_links?: { instagram?: string; snapchat?: string; [key: string]: any };
    portfolio?: string[];
    is_verified?: boolean;
    isFollowedByMe?: boolean;
  };
  reels: ReelData[];
  services: ServicePackage[];
  offers: Offer[];
}

interface ModelProfileClientProps {
  profileData: ModelProfileData;
}

const ReelGridItem: React.FC<{ reel: ReelData }> = ({ reel }) => {
  const { t } = useTranslation();
  return (
    <Link href={`/reels/${reel.id}`} className="relative aspect-[9/16] block group overflow-hidden rounded-md">
      <Image
        src={reel.thumbnail_url || reel.video_url}
        alt={t('ModelProfilee.reel.alt', { name: reel.userName || 'user' })}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <PlayCircle className="w-10 h-10 text-white/80" />
      </div>
      <div className="absolute bottom-1 right-1 flex items-center gap-2 text-white text-xs bg-black/40 px-1.5 py-0.5 rounded">
        <Heart className="w-3 h-3" /> {reel.likes_count || 0}
        <MessageCircle className="w-3 h-3 ml-1" /> {reel.comments_count || 0}
      </div>
    </Link>
  );
};

const ModelProfileClient: React.FC<ModelProfileClientProps> = ({ profileData }) => {
  const { t } = useTranslation();
  const { profile, reels, services, offers } = profileData;
  const { user } = useAuth();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(profile.isFollowedByMe || false);
  const [followLoading, setFollowLoading] = useState(false);

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
      console.error('Failed to follow/unfollow:', error);
      toast.error(t('ModelProfilee.toast.error'));
      setIsFollowing(originalFollowState);
    } finally {
      setFollowLoading(false);
    }
  };

  const stats = profile.stats || {};
  const socialLinks = profile.social_links || {};
  const portfolio = profile.portfolio || [];

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary shadow-lg">
          <AvatarImage src={profile.profile_picture_url || ''} alt={profile.name} />
          <AvatarFallback className="text-4xl">
            {profile.name ? profile.name.charAt(0).toUpperCase() : 'M'}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold">{profile.name}</h1>
            {profile.is_verified && <CheckCircle className="w-5 h-5 text-blue-500" />}
          </div>
          <p className="text-sm text-gray-500 mb-3">{profile.role_name}</p>

          <div className="flex justify-center sm:justify-start gap-4 mb-4 text-sm">
            {stats.followers && (
              <div>
                <span className="font-semibold">{stats.followers}</span> {t('ModelProfilee.stats.followers')}
              </div>
            )}
            {stats.reelsCount && (
              <div>
                <span className="font-semibold">{stats.reelsCount}</span> {t('ModelProfilee.stats.reels')}
              </div>
            )}
          </div>

          {profile.bio && <p className="text-gray-700 mb-4 text-sm">{profile.bio}</p>}

          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {socialLinks.instagram && (
              <Button variant="outline" size="sm" asChild>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-4 w-4" /> {t('ModelProfilee.social.instagram')}
                </a>
              </Button>
            )}

            {user && user.id !== profile.id && (
              <Button
                size="sm"
                onClick={handleFollow}
                disabled={followLoading}
                className="flex items-center gap-2"
              >
                {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                {isFollowing ? t('ModelProfilee.actions.following') : t('ModelProfilee.actions.follow')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="reels" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="reels">{t('ModelProfilee.tabs.reels', { count: reels.length })}</TabsTrigger>
          <TabsTrigger value="portfolio">{t('ModelProfilee.tabs.portfolio', { count: portfolio.length })}</TabsTrigger>
          <TabsTrigger value="services">{t('ModelProfilee.tabs.services', { count: services.length + offers.length })}</TabsTrigger>
        </TabsList>

        <TabsContent value="reels">
          {reels.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {reels.map((reel) => (
                <ReelGridItem key={reel.id} reel={reel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">{t('ModelProfilee.reel.empty')}</p>
          )}
        </TabsContent>

        <TabsContent value="portfolio">
          {portfolio.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {portfolio.map((itemUrl, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={itemUrl}
                    alt={t('ModelProfilee.portfolio.alt', { index: index + 1 })}
                    fill
                    sizes="(max-width: 640px) 33vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">{t('ModelProfilee.portfolio.empty')}</p>
          )}
        </TabsContent>

        <TabsContent value="services">
          <div className="space-y-4">
            {services.length > 0 &&
              services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    {service.starting_price && (
                      <p className="text-sm text-primary font-semibold">
                        {t('ModelProfilee.services.startsFrom', { price: service.starting_price })}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </CardContent>
                </Card>
              ))}

            {offers.length > 0 &&
              offers.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {offer.title}{' '}
                      <Badge variant="secondary" className="ml-2">
                        {offer.type}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-primary font-semibold">
                      {t('ModelProfilee.offers.price', { price: offer.price })}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{offer.description}</p>
                  </CardContent>
                </Card>
              ))}

            {services.length === 0 && offers.length === 0 && (
              <p className="text-center text-gray-500 py-10">{t('ModelProfilee.services.empty')}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelProfileClient;