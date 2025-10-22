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
  Image as ImageIcon,
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
    width="20"
    height="20"
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
    width="20"
    height="20"
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
    width="20"
    height="20"
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'portfolio') => {
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
      icon: <Instagram className="w-5 h-5 text-pink-500" />,
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
      icon: <Twitter className="w-5 h-5 text-blue-400" />,
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
      icon: <Facebook className="w-5 h-5 text-blue-600" />,
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">{t('modelprofile.toasts.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <ModelNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Crown className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Heart className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('modelprofile.pageTitle')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">{t('modelprofile.pageSubtitle')}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto">
        {/* Basic Info */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <User className="h-6 w-6" />
              </div>
              {t('modelprofile.basicInfo.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-rose-800 font-medium text-lg">
                  {t('modelprofile.basicInfo.fullName')}
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleChange}
                  className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 transition-all duration-300"
                  placeholder={t('modelprofile.basicInfo.fullNamePlaceholder')}
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-rose-800 font-medium text-lg">
                  {t('modelprofile.basicInfo.bio')}
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleChange}
                  placeholder={t('modelprofile.basicInfo.bioPlaceholder')}
                  rows={5}
                  className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 resize-none transition-all duration-300 min-h-[120px]"
                />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <Label className="text-rose-800 font-medium text-lg">
                {t('modelprofile.basicInfo.profilePicture')}
              </Label>
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <AvatarImage src={profile.profile_picture_url || ''} />
                  <AvatarFallback className="text-4xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold">
                    {profile.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-pic-upload"
                  className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-rose-50 transition-all duration-300 hover:scale-110 border border-rose-200"
                >
                  <Camera className="w-5 h-5 text-rose-600" />
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
              <p className="text-rose-600 text-sm text-center">{t('modelprofile.basicInfo.profilePictureTip')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <ImageIcon className="h-6 w-6" />
              </div>
              {t('modelprofile.portfolio.title')}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {t('modelprofile.portfolio.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {(profile.portfolio || []).map((url, index) => (
                <div key={url} className="relative group aspect-square">
                  <Image
                    src={url}
                    alt={`Portfolio item ${index + 1}`}
                    fill
                    className="object-cover rounded-2xl border-2 border-white shadow-lg transition-all duration-300 group-hover:scale-105"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removePortfolioImage(url)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg transform hover:scale-110"
                    aria-label={t('modelprofile.portfolio.removeImage')}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {(profile.portfolio?.length || 0) < 10 && (
                <label
                  className={`flex flex-col items-center justify-center aspect-square rounded-2xl cursor-pointer transition-all duration-300 border-2 border-dashed ${
                    isUploading === 'portfolio'
                      ? 'bg-blue-50 border-blue-300 shadow-inner'
                      : 'bg-rose-50 border-rose-300 hover:bg-rose-100 hover:border-rose-400 hover:shadow-lg'
                  }`}
                >
                  {isUploading === 'portfolio' ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <span className="text-sm text-rose-600 font-medium">{t('modelprofile.portfolio.uploading')}</span>
                    </div>
                  ) : (
                    <div className="text-center text-rose-400">
                      <UploadCloud className="mx-auto h-10 w-10 mb-3" />
                      <p className="font-medium text-rose-500">{t('modelprofile.portfolio.addImage')}</p>
                      <p className="text-xs mt-1 text-rose-400">{t('modelprofile.portfolio.uploadPrompt')}</p>
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Stats */}
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-xl">
                  <BarChart className="h-6 w-6" />
                </div>
                {t('modelprofile.stats.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label className="text-rose-800 font-medium flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {t('modelprofile.stats.followers')}
                </Label>
                <Input
                  value={profile.stats?.followers || ''}
                  onChange={(e) => handleJsonChange('stats', 'followers', e.target.value)}
                  placeholder={t('modelprofile.stats.followersPlaceholder')}
                  className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 transition-all duration-300"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-rose-800 font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {t('modelprofile.stats.engagement')}
                </Label>
                <Input
                  value={profile.stats?.engagement || ''}
                  onChange={(e) => handleJsonChange('stats', 'engagement', e.target.value)}
                  placeholder={t('modelprofile.stats.engagementPlaceholder')}
                  className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 transition-all duration-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Link2 className="h-6 w-6" />
                </div>
                {t('modelprofile.social.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {socialPlatforms.map((platform) => (
                <div key={platform.id} className="space-y-3">
                  <Label htmlFor={platform.id} className="text-rose-800 font-medium">
                    {platform.label}
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {platform.icon}
                    </div>
                    <Input
                      id={platform.id}
                      value={profile.social_links?.[platform.id] || ''}
                      onChange={(e) => handleJsonChange('social_links', platform.id, e.target.value)}
                      placeholder={platform.placeholder}
                      className="pl-12 bg-white border-rose-200 focus:border-rose-400 rounded-2xl transition-all duration-300"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-8">
          <Button
            type="submit"
            size="lg"
            disabled={isSaving || !!isUploading}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-12 py-6 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none min-w-[200px]"
          >
            {isSaving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('modelprofile.actions.saving')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('modelprofile.actions.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}