'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ShieldCheck,
  UserCheck,
  Loader2,
  Clock,
  Instagram,
  Users,
  Twitter,
  MessageCircle,
  Facebook,
  Globe,
  Sparkles,
  Target,
} from 'lucide-react';
import Navigation from '@/components/dashboards/Navigation';
import { Badge } from '@/components/ui/badge';
import ModelNav from '@/components/dashboards/ModelNav';

// ✅ Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84 0 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.46.08-2.92-.32-4.04-1.26-2.04-1.72-2.93-4.57-2.31-7.2.39-1.64 1.29-3.12 2.66-4.12 1.07-.75 2.34-1.17 3.61-1.28V4.17c-.01.14-.02.27-.02.41-.02.93-.32 1.85-.9 2.54-.95 1.13-2.5 1.44-3.89.78-.02-.01-.04-.02-.06-.03-.31-.15-.61-.32-.89-.51-.02-.01-.04-.03-.06-.04-.59-.4-.94-1.05-.94-1.75 0-.21.02-.42.05-.63.13-.78.7-1.47 1.53-1.84C8.37 3.1 9.3 3 10.22 3c.01 0 .02 0 .03 0v4.83c-1.24.3-2.54.23-3.72-.22-1.18-.45-2.16-1.37-2.67-2.6-.02-.05-.04-.1-.05-.15-.01-.05-.02-.1-.03-.15-.1-.56-.02-1.14.24-1.66.26-.52.68-.94 1.2-1.2.52-.26 1.1-.4 1.67-.41.05 0 .1 0 .15-.01.99-.01 1.97.01 2.96 0 .05 0 .1 0 .15.01z" />
  </svg>
);

// ✅ Custom Snapchat Icon
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.547 16.594c-.328.703-1.016 1.172-1.828 1.172-.422 0-.828-.14-1.14-.39-.328.25-.734.39-1.156.39-.812 0-1.5-.469-1.828-1.172-.328-.703-.328-1.547 0-2.25.14-.313.39-.563.672-.75.281-.188.609-.281.938-.281.328 0 .656.094.938.281.281.188.531.438.672.75.328.703.328 1.547 0 2.25zm-9.094 0c-.328.703-1.016 1.172-1.828 1.172-.422 0-.828-.14-1.14-.39-.328.25-.734.39-1.156.39-.812 0-1.5-.469-1.828-1.172-.328-.703-.328-1.547 0-2.25.14-.313.39-.563.672-.75.281-.188.609-.281.938-.281.328 0 .656.094.938.281.281.188.531.438.672.75.328.703.328 1.547 0 2.25zm3.547-9.516c1.875 0 3.375 1.5 3.375 3.375S13.875 13.83 12 13.83s-3.375-1.5-3.375-3.375S10.125 7.078 12 7.078z" />
  </svg>
);

// ✅ Social Platforms with Custom Icons
const SOCIAL_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { id: 'snapchat', name: 'Snapchat', icon: SnapchatIcon, placeholder: 'your_username' },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon, placeholder: 'https://tiktok.com/@username' },
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/username' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, placeholder: '+966501234567' },
];

export default function VerificationPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [identityNumber, setIdentityNumber] = useState('');
  const [identityImage, setIdentityImage] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [followers, setFollowers] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({
      ...prev,
      [platform]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAnyLink = Object.values(socialLinks).some((link) => link.trim() !== '');
    if (!identityNumber || !identityImage || !hasAnyLink || !followers) {
      toast.error(t('verification.errorAllFields'));
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('identity_number', identityNumber);
    formData.append('identity_image', identityImage);
    formData.append('social_links', JSON.stringify(socialLinks));
    formData.append('stats', JSON.stringify({ followers }));

    try {
      const response = await api.post('/users/submit-verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('verification.successTitle'), {
        description: response.data.message || t('verification.successMessage'),
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('verification.errorDefault');
      toast.error(t('verification.errorTitle'), {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Verified UI
  if (user?.verification_status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 p-6">
        <ModelNav />
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-xl rounded-3xl overflow-hidden text-center">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white pb-4">
              <UserCheck className="w-16 h-16 mx-auto text-white mb-4" />
              <CardTitle className="text-2xl font-bold">{t('verification.verifiedTitle')}</CardTitle>
              <CardDescription className="text-green-100">
                {t('verification.verifiedSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-xl px-4 py-2 text-lg">
                ✅ {t('verification.accountActive')}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Pending UI
  if (user?.verification_status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
        <Navigation />
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden text-center">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
              <Clock className="w-16 h-16 mx-auto text-white mb-4" />
              <CardTitle className="text-2xl font-bold">{t('verification.pendingTitle')}</CardTitle>
              <CardDescription className="text-blue-100">
                {t('verification.pendingSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 rounded-xl px-4 py-2 text-lg">
                ⏳ {t('verification.reviewPending')}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ✅ Form UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100 p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <Navigation />

      <div className="max-w-2xl mx-auto mt-8">
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center pb-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="h-6 w-6 text-purple-200" />
              <Target className="h-6 w-6 text-purple-200" />
            </div>
            <CardTitle className="text-3xl font-bold">{t('verification.pageTitle')}</CardTitle>
            <CardDescription className="text-purple-100 text-lg">
              {t('verification.pageSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4 pb-6 border-b border-purple-200">
                <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  {t('verification.personalInfo')}
                </h3>

                <div className="space-y-3">
                  <Label htmlFor="identityNumber" className="text-purple-700 font-medium">
                    {t('verification.idNumber')}
                  </Label>
                  <Input
                    id="identityNumber"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    required
                    className="bg-white border-purple-200 focus:border-purple-400 rounded-2xl px-4 py-3"
                    placeholder={t('verification.idPlaceholder')}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="identityImage" className="text-purple-700 font-medium">
                    {t('verification.idImage')}
                  </Label>
                  <Input
                    id="identityImage"
                    type="file"
                    onChange={(e) => e.target.files && setIdentityImage(e.target.files[0])}
                    accept="image/png, image/jpeg, image/jpg"
                    required
                    className="bg-white border-purple-200 focus:border-purple-400 rounded-2xl px-4 py-3"
                  />
                </div>
              </div>

              {/* Social Media - ALL PLATFORMS */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-800 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {t('verification.socialMedia')}
                </h3>

                {SOCIAL_PLATFORMS.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <div key={platform.id} className="space-y-2">
                      <Label htmlFor={`social-${platform.id}`} className="text-purple-700 font-medium flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {t(`social.${platform.id}`) || platform.name}
                      </Label>
                      <Input
                        id={`social-${platform.id}`}
                        type="text"
                        value={socialLinks[platform.id] || ''}
                        onChange={(e) => handleSocialLinkChange(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        className="bg-white border-purple-200 focus:border-purple-400 rounded-2xl px-4 py-3"
                      />
                    </div>
                  );
                })}

                {/* Followers */}
                <div className="space-y-3 pt-4">
                  <Label htmlFor="followers" className="text-purple-700 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('verification.followers')}
                  </Label>
                  <Input
                    id="followers"
                    type="text"
                    placeholder={t('verification.followersPlaceholder')}
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    required
                    className="bg-white border-purple-200 focus:border-purple-400 rounded-2xl px-4 py-3"
                  />
                </div>

                {/* Badges for filled platforms */}
                {Object.keys(socialLinks).some((k) => socialLinks[k]) && (
                  <div className="pt-4">
                    <Label className="text-purple-700 font-medium">{t('verification.addedPlatforms')}:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {SOCIAL_PLATFORMS.map((platform) => {
                        if (!socialLinks[platform.id]?.trim()) return null;
                        const IconComponent = platform.icon;
                        return (
                          <Badge
                            key={platform.id}
                            className="bg-purple-100 text-purple-800 hover:bg-purple-100 rounded-xl px-3 py-1"
                          >
                            <IconComponent className="w-3 h-3 ml-1 inline" />
                            {t(`social.${platform.id}`) || platform.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 rounded-2xl font-bold text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('verification.submitting')}
                  </>
                ) : (
                  t('verification.submitButton')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}