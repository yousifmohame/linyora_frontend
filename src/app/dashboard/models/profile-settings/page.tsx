'use client';

import { useState, useEffect, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  User,
  ImageIcon,
  Link2,
  BarChart,
  UploadCloud,
  X,
  Camera,
  Sparkles,
  Instagram,
  Twitter,
  Facebook,
  Heart,
  Crown,
  Users,
  Zap,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ModelNav from '@/components/dashboards/ModelNav';
import Image from 'next/image';
import { toast } from 'sonner';

interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  tiktok?: string;
  snapchat?: string;
  whatsapp?: string;
}

interface ProfileData {
  name: string;
  email: string;
  bio: string;
  profile_picture_url: string | null;
  store_banner_url: string | null;
  portfolio: string[];
  social_links: SocialLinks;
  stats: {
    followers?: string;
    engagement?: string;
  };
}

const TikTokIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-pink-500"
  >
    <path d="M16.5 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
    <path d="M16.5 6.5v10" />
    <path d="M16.5 11.5a5 5 0 0 0-5-5" />
  </svg>
);
const SnapchatIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-yellow-500"
  >
    <path d="M12 4.5C7 4.5 2.7 7.6 2 12c.7 4.4 5 7.5 10 7.5s9.3-3.1 10-7.5c-.7-4.4-5-7.5-10-7.5Z" />
    <path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-green-500"
  >
    <path d="M21 10c0 5.5-4.5 10-10 10-1.8 0-3.5-.5-5-1.4l-5.4 1.4 1.4-5.4C1.5 12.5 1 10.8 1 9c0-5.5 4.5-10 10-10s10 4.5 10 10Z" />
    <path d="m8 10 2 2" />
    <path d="m14 10-4 4" />
    <path d="m14 14 2-2" />
  </svg>
);

export default function ProfileSettingsPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/model/profile')
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch profile', err);
        toast.error(t('modelprofile.toasts.saveError'));
        setLoading(false);
      });
  }, [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleJsonChange = (section: 'stats' | 'social_links', key: string, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), [key]: value },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'portfolio' | 'cover') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(type);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await api.post('/upload', formData);
      const imageUrl = response.data.imageUrl;
      if (type === 'profile') {
        setProfile((prev) => ({ ...prev, profile_picture_url: imageUrl }));
        toast.success(t('modelprofile.toasts.profilePicSuccess'));
      } else if (type === 'cover') {
        setProfile((prev) => ({ ...prev, store_banner_url: imageUrl }));
        toast.success(t('modelprofile.toasts.coverPicSuccess', {defaultValue: 'Cover photo updated!'}));
      } else {
        setProfile((prev) => ({
          ...prev,
          portfolio: [...(prev.portfolio || []), imageUrl],
        }));
        toast.success(t('modelprofile.toasts.portfolioAddSuccess'));
      }
    } catch (error) {
      console.error('Image upload failed', error);
      toast.error(t('modelprofile.toasts.uploadError'));
    } finally {
      setIsUploading(null);
    }
  };

  const removePortfolioImage = (urlToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      portfolio: (prev.portfolio || []).filter((url) => url !== urlToRemove),
    }));
    toast.info(t('modelprofile.toasts.portfolioRemove'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const promise = api.put('/model/profile', profile);
    toast.promise(promise, {
      loading: t('modelprofile.toasts.saving'),
      success: t('modelprofile.toasts.saveSuccess'),
      error: t('modelprofile.toasts.saveError'),
    });
    try {
      await promise;
    } catch (error) {
      // Handled by toast
    } finally {
      setIsSaving(false);
    }
  };

  const socialPlatforms: { id: keyof SocialLinks; label: string; placeholder: string; icon: JSX.Element }[] = [
    {
      id: 'instagram',
      label: t('modelprofile.social.instagram'),
      placeholder: t('modelprofile.social.instagramPlaceholder'),
      icon: <Instagram className="w-4 h-4 text-pink-500" />,
    },
    {
      id: 'tiktok',
      label: t('modelprofile.social.tiktok'),
      placeholder: t('modelprofile.social.tiktokPlaceholder'),
      icon: <TikTokIcon />,
    },
    {
      id: 'twitter',
      label: t('modelprofile.social.twitter'),
      placeholder: t('modelprofile.social.twitterPlaceholder'),
      icon: <Twitter className="w-4 h-4 text-blue-400" />,
    },
    {
      id: 'snapchat',
      label: t('modelprofile.social.snapchat'),
      placeholder: t('modelprofile.social.snapchatPlaceholder'),
      icon: <SnapchatIcon />,
    },
    {
      id: 'facebook',
      label: t('modelprofile.social.facebook'),
      placeholder: t('modelprofile.social.facebookPlaceholder'),
      icon: <Facebook className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'whatsapp',
      label: t('modelprofile.social.whatsapp'),
      placeholder: t('modelprofile.social.whatsappPlaceholder'),
      icon: <WhatsAppIcon />,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <ModelNav />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">{t('modelprofile.toasts.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <ModelNav />

      <header className="mb-6 text-center px-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-rose-100">
            <Crown className="h-6 w-6 text-rose-600" />
          </div>
          <Sparkles className="h-4 w-4 text-rose-300" />
          <Heart className="h-4 w-4 text-rose-300" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
          {t('modelprofile.pageTitle')}
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {t('modelprofile.pageSubtitle')}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto">
        {/* Basic Info */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              {t('modelprofile.basicInfo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-800 font-medium text-sm">
                    {t('modelprofile.basicInfo.fullName')}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={profile.name || ''}
                    onChange={handleChange}
                    className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg"
                    placeholder={t('modelprofile.basicInfo.fullNamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-gray-800 font-medium text-sm">
                    {t('modelprofile.basicInfo.bio')}
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profile.bio || ''}
                    onChange={handleChange}
                    placeholder={t('modelprofile.basicInfo.bioPlaceholder')}
                    rows={4}
                    className="min-h-[100px] border border-gray-200 focus:border-purple-500 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Cover Photo */}
                <div className="space-y-2">
                  <Label className="text-gray-800 font-medium text-sm">
                    {t('modelprofile.basicInfo.coverPhoto', {defaultValue: 'صورة الغلاف'})}
                  </Label>
                  <div className="w-full relative h-24 rounded-lg overflow-hidden bg-gray-100 group border border-gray-200/50">
                    {profile.store_banner_url ? (
                      <Image src={profile.store_banner_url} alt="Cover" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-[10px]">
                        {t('modelprofile.basicInfo.coverPhoto', {defaultValue: 'أضف صورة غلاف'})}
                      </div>
                    )}
                    <label 
                      htmlFor="cover-upload" 
                      className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="text-white w-4 h-4" />
                      <input
                        id="cover-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'cover')}
                        disabled={isUploading === 'cover'}
                      />
                    </label>
                    {isUploading === 'cover' && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-800 font-medium text-sm">
                    {t('modelprofile.basicInfo.profilePicture')}
                  </Label>
                  <div className="relative group w-24 h-24 mx-auto">
                    <Avatar className="w-full h-full border-2 border-white shadow-sm">
                      <AvatarImage src={profile.profile_picture_url || ''} />
                      <AvatarFallback className="text-lg bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold">
                        {profile.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-pic-upload"
                      className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow cursor-pointer hover:bg-rose-50 transition-colors border border-gray-200"
                    >
                      <Camera className="w-3 h-3 text-rose-600" />
                      <input
                        id="profile-pic-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, 'profile')}
                        disabled={isUploading === 'profile'}
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-600 text-center mt-1">
                    {t('modelprofile.basicInfo.profilePictureTip')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ImageIcon className="h-4 w-4" />
              {t('modelprofile.portfolio.title')}
            </CardTitle>
            <CardDescription className="text-purple-100 text-xs mt-0.5">
              {t('modelprofile.portfolio.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(profile.portfolio || []).map((url, index) => (
                <div key={url} className="relative group aspect-square">
                  <Image
                    src={url}
                    alt={`Portfolio item ${index + 1}`}
                    fill
                    className="object-cover rounded-lg border border-white shadow"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removePortfolioImage(url)}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow"
                    aria-label={t('modelprofile.portfolio.removeImage')}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(profile.portfolio?.length || 0) < 10 && (
                <label
                  className={`flex flex-col items-center justify-center aspect-square rounded-lg cursor-pointer transition-colors border-2 border-dashed ${
                    isUploading === 'portfolio'
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-rose-50 border-rose-200 hover:bg-rose-100 hover:border-rose-300'
                  }`}
                >
                  {isUploading === 'portfolio' ? (
                    <div className="text-center">
                      <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-1.5"></div>
                      <span className="text-[10px] text-rose-600">{t('modelprofile.portfolio.uploading')}</span>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <UploadCloud className="mx-auto h-5 w-5 mb-1" />
                      <p className="text-[10px] font-medium text-gray-600">{t('modelprofile.portfolio.addImage')}</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'portfolio')}
                    disabled={isUploading !== null}
                  />
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stats */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart className="h-4 w-4" />
                {t('modelprofile.stats.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <Label className="text-gray-800 font-medium flex items-center gap-1.5 text-[10px]">
                  <Users className="w-3 h-3" />
                  {t('modelprofile.stats.followers')}
                </Label>
                <Input
                  value={profile.stats?.followers || ''}
                  onChange={(e) => handleJsonChange('stats', 'followers', e.target.value)}
                  placeholder={t('modelprofile.stats.followersPlaceholder')}
                  className="h-9 text-sm border border-gray-200 focus:border-purple-500 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-800 font-medium flex items-center gap-1.5 text-[10px]">
                  <Zap className="w-3 h-3" />
                  {t('modelprofile.stats.engagement')}
                </Label>
                <Input
                  value={profile.stats?.engagement || ''}
                  onChange={(e) => handleJsonChange('stats', 'engagement', e.target.value)}
                  placeholder={t('modelprofile.stats.engagementPlaceholder')}
                  className="h-9 text-sm border border-gray-200 focus:border-purple-500 rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4" />
                {t('modelprofile.social.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {socialPlatforms.map((platform) => (
                <div key={platform.id} className="space-y-2">
                  <Label htmlFor={platform.id} className="text-gray-800 font-medium text-[10px]">
                    {platform.label}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-3 top-0 bottom-0 flex items-center pointer-events-none">
                      {platform.icon}
                    </div>
                    <Input
                      id={platform.id}
                      value={profile.social_links?.[platform.id] || ''}
                      onChange={(e) => handleJsonChange('social_links', platform.id, e.target.value)}
                      placeholder={platform.placeholder}
                      className="pl-10 h-9 text-sm border border-gray-200 focus:border-purple-500 rounded-lg"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            disabled={isSaving || !!isUploading}
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white h-10 px-6 rounded-lg text-sm font-medium"
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                {t('modelprofile.actions.saving')}
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1.5" />
                {t('modelprofile.actions.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}