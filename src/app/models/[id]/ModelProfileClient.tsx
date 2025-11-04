'use client';

import React, { useState, useEffect } from 'react';
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

const ReelGridItem: React.FC<{ reel: ReelData }> = ({ reel }) => (
  <Link href={`/reels/${reel.id}`} className="relative aspect-[9/16] block group overflow-hidden rounded-md">
    <Image
      src={reel.thumbnail_url || reel.video_url}
      alt={`Reel by ${reel.userName || 'user'}`}
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

const ModelProfileClient: React.FC<ModelProfileClientProps> = ({ profileData }) => {
  const { profile, reels, services, offers } = profileData;
  const { user } = useAuth();
  const router = useRouter();

  // الحالة المحلية لمتابعة الزر
  const [isFollowing, setIsFollowing] = useState(profile.isFollowedByMe || false);
  const [followLoading, setFollowLoading] = useState(false);

  // ✅ مزامنة الحالة مع profileData عند التغيير (مهم جدًا لإعادة التحميل)
  useEffect(() => {
    setIsFollowing(profile.isFollowedByMe || false);
  }, [profile.isFollowedByMe]);

  const handleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow users.');
      router.push('/login');
      return;
    }

    if (user.id === profile.id) {
      toast.info("You cannot follow yourself.");
      return;
    }

    setFollowLoading(true);
    const originalFollowState = isFollowing;
    setIsFollowing(!originalFollowState); // تحديث فوري (Optimistic UI)

    try {
      if (originalFollowState) {
        await api.delete(`/users/${profile.id}/follow`);
        toast.success(`Unfollowed ${profile.name}`);
      } else {
        await api.post(`/users/${profile.id}/follow`);
        toast.success(`Started following ${profile.name}`);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow:', error);
      toast.error('Something went wrong.');
      setIsFollowing(originalFollowState); // التراجع عند الفشل
    } finally {
      setFollowLoading(false);
    }
  };

  const stats = profile.stats || {};
  const socialLinks = profile.social_links || {};
  const portfolio = profile.portfolio || [];

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* --- Header Profile --- */}
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
              <div><span className="font-semibold">{stats.followers}</span> Followers</div>
            )}
            {stats.reelsCount && (
              <div><span className="font-semibold">{stats.reelsCount}</span> Reels</div>
            )}
          </div>

          {profile.bio && <p className="text-gray-700 mb-4 text-sm">{profile.bio}</p>}

          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {socialLinks.instagram && (
              <Button variant="outline" size="sm" asChild>
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 h-4 w-4" /> Instagram
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
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* --- Tabs --- */}
      <Tabs defaultValue="reels" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="reels">Reels ({reels.length})</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio ({portfolio.length})</TabsTrigger>
          <TabsTrigger value="services">Services ({services.length + offers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reels">
          {reels.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {reels.map((reel) => (
                <ReelGridItem key={reel.id} reel={reel} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No reels posted yet.</p>
          )}
        </TabsContent>

        <TabsContent value="portfolio">
          {portfolio.length > 0 ? (
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {portfolio.map((itemUrl, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={itemUrl}
                    alt={`Portfolio item ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 33vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">Portfolio is empty.</p>
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
                        Starts from {service.starting_price} SAR
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
                    <p className="text-sm text-primary font-semibold">{offer.price} SAR</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{offer.description}</p>
                  </CardContent>
                </Card>
              ))}

            {services.length === 0 && offers.length === 0 && (
              <p className="text-center text-gray-500 py-10">No services or offers available.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelProfileClient;