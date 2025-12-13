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
  Landmark,
} from 'lucide-react';
import ModelNav from '@/components/dashboards/ModelNav';
import { Badge } from '@/components/ui/badge';

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84 0 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.46.08-2.92-.32-4.04-1.26-2.04-1.72-2.93-4.57-2.31-7.2.39-1.64 1.29-3.12 2.66-4.12 1.07-.75 2.34-1.17 3.61-1.28V4.17c-.01.14-.02.27-.02.41-.02.93-.32 1.85-.9 2.54-.95 1.13-2.5 1.44-3.89.78-.02-.01-.04-.02-.06-.03-.31-.15-.61-.32-.89-.51-.02-.01-.04-.03-.06-.04-.59-.4-.94-1.05-.94-1.75 0-.21.02-.42.05-.63.13-.78.7-1.47 1.53-1.84C8.37 3.1 9.3 3 10.22 3c.01 0 .02 0 .03 0v4.83c-1.24.3-2.54.23-3.72-.22-1.18-.45-2.16-1.37-2.67-2.6-.02-.05-.04-.1-.05-.15-.01-.05-.02-.1-.03-.15-.1-.56-.02-1.14.24-1.66.26-.52.68-.94 1.2-1.2.52-.26 1.1-.4 1.67-.41.05 0 .1 0 .15-.01.99-.01 1.97.01 2.96 0 .05 0 .1 0 .15.01z" />
  </svg>
);

// Custom Snapchat Icon
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.547 16.594c-.328.703-1.016 1.172-1.828 1.172-.422 0-.828-.14-1.14-.39-.328.25-.734.39-1.156.39-.812 0-1.5-.469-1.828-1.172-.328-.703-.328-1.547 0-2.25.14-.313.39-.563.672-.75.281-.188.609-.281.938-.281.328 0 .656.094.938.281.281.188.531.438.672.75.328.703.328 1.547 0 2.25zm-9.094 0c-.328.703-1.016 1.172-1.828 1.172-.422 0-.828-.14-1.14-.39-.328.25-.734.39-1.156.39-.812 0-1.5-.469-1.828-1.172-.328-.703-.328-1.547 0-2.25.14-.313.39-.563.672-.75.281-.188.609-.281.938-.281.328 0 .656.094.938.281.281.188.531.438.672.75.328.703.328 1.547 0 2.25zm3.547-9.516c1.875 0 3.375 1.5 3.375 3.375S13.875 13.83 12 13.83s-3.375-1.5-3.375-3.375S10.125 7.078 12 7.078z" />
  </svg>
);

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [identityNumber, setIdentityNumber] = useState('');
  const [identityImage, setIdentityImage] = useState<File | null>(null);
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({});
  const [followers, setFollowers] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [ibanCertificate, setIbanCertificate] = useState<File | null>(null);

  const handleSocialLinkChange = (platform: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasAnyLink = Object.values(socialLinks).some((link) => link.trim() !== '');

    if (!identityNumber || !identityImage || !hasAnyLink || !followers || !iban || !ibanCertificate) {
      toast.error(t('verification.errorAllFields', 'الرجاء ملء جميع الحقول الإجبارية (الهوية، المتابعين، الآيبان، وشهادة الآيبان).'));
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('identity_number', identityNumber);
    if (identityImage) formData.append('identity_image', identityImage);
    formData.append('social_links', JSON.stringify(socialLinks));
    formData.append('stats', JSON.stringify({ followers }));
    formData.append('account_number', accountNumber);
    formData.append('iban', iban);
    if (ibanCertificate) formData.append('iban_certificate', ibanCertificate);

    try {
      const response = await api.post('/users/submit-verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('verification.successTitle'), {
        description: response.data.message || t('verification.successMessage'),
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('verification.errorDefault');
      toast.error(t('verification.errorTitle'), { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verified UI
  if (user?.verification_status === 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <ModelNav />
        <div className="max-w-md mx-auto mt-6">
          <Card className="bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-2xl shadow-sm text-center">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-t-2xl">
              <UserCheck className="w-8 h-8 mx-auto text-white mb-2" />
              <CardTitle className="text-lg font-bold">{t('verification.verifiedTitle')}</CardTitle>
              <CardDescription className="text-green-100 text-xs mt-0.5">
                {t('verification.verifiedSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Badge className="bg-green-100 text-green-800 border-green-200 text-sm px-3 py-1 rounded-lg">
                ✅ {t('verification.accountActive')}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Pending UI
  if (user?.verification_status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <ModelNav />
        <div className="max-w-md mx-auto mt-6">
          <Card className="bg-white/90 backdrop-blur-sm border border-blue-200/50 rounded-2xl shadow-sm text-center">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 rounded-t-2xl">
              <Clock className="w-8 h-8 mx-auto text-white mb-2" />
              <CardTitle className="text-lg font-bold">{t('verification.pendingTitle')}</CardTitle>
              <CardDescription className="text-blue-100 text-xs mt-0.5">
                {t('verification.pendingSubtitle')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm px-3 py-1 rounded-lg">
                ⏳ {t('verification.reviewPending')}
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Form UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <ModelNav />

      <div className="max-w-2xl mx-auto mt-6">
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 text-center rounded-t-2xl">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="h-4 w-4 text-rose-200" />
              <Target className="h-4 w-4 text-rose-200" />
            </div>
            <CardTitle className="text-xl font-bold">{t('verification.pageTitle')}</CardTitle>
            <CardDescription className="text-purple-100 text-sm mt-0.5">
              {t('verification.pageSubtitle')}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="space-y-3 pb-4 border-b border-gray-200/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  {t('verification.personalInfo')}
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="identityNumber" className="text-gray-800 font-medium text-sm">
                    {t('verification.idNumber')} (إجباري)
                  </Label>
                  <Input
                    id="identityNumber"
                    value={identityNumber}
                    onChange={(e) => setIdentityNumber(e.target.value)}
                    required
                    className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                    placeholder={t('verification.idPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="identityImage" className="text-gray-800 font-medium text-sm">
                    {t('verification.idImage')} (إجباري)
                  </Label>
                  <Input
                    id="identityImage"
                    type="file"
                    onChange={(e) => e.target.files && setIdentityImage(e.target.files[0])}
                    accept="image/png, image/jpeg, image/jpg"
                    required
                    className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-3 pb-4 border-b border-gray-200/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {t('verification.socialMedia')}
                </h3>

                {SOCIAL_PLATFORMS.map((platform) => {
                  const IconComponent = platform.icon;
                  return (
                    <div key={platform.id} className="space-y-2">
                      <Label htmlFor={`social-${platform.id}`} className="text-gray-800 font-medium text-sm flex items-center gap-1.5">
                        <IconComponent className="w-3.5 h-3.5" />
                        {t(`social.${platform.id}`) || platform.name}
                      </Label>
                      <Input
                        id={`social-${platform.id}`}
                        type="text"
                        value={socialLinks[platform.id] || ''}
                        onChange={(e) => handleSocialLinkChange(platform.id, e.target.value)}
                        placeholder={platform.placeholder}
                        className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                      />
                    </div>
                  );
                })}

                <div className="space-y-2 pt-3">
                  <Label htmlFor="followers" className="text-gray-800 font-medium text-sm flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {t('verification.followers')} (إجباري)
                  </Label>
                  <Input
                    id="followers"
                    type="text"
                    placeholder={t('verification.followersPlaceholder')}
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    required
                    className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Bank Information */}
              <div className="space-y-3 pb-4 border-b border-gray-200/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4" />
                  {t('verification.bankInfo', 'معلومات الحساب البنكي')}
                </h3>
                <p className="text-[10px] text-gray-600">
                  {t('verification.bankInfoDesc', 'تُستخدم هذه المعلومات لتحويل أرباحك. يرجى التأكد من دقتها.')}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber" className="text-gray-800 font-medium text-sm">
                    {t('verification.accountNumber', 'رقم الحساب (اجباري)')}
                  </Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                    placeholder={t('verification.accountNumberPlaceholder', 'رقم الحساب')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iban" className="text-gray-800 font-medium text-sm">
                    {t('verification.iban', 'رقم الآيبان (IBAN)')} (إجباري)
                  </Label>
                  <Input
                    id="iban"
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    required
                    className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                    placeholder="SAXXXXXXXXXXXXXXXXXXXXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ibanCertificate" className="text-gray-800 font-medium text-sm">
                    {t('verification.ibanCertificate', 'شهادة الآيبان')} (إجباري)
                  </Label>
                  <Input
                    id="ibanCertificate"
                    type="file"
                    onChange={(e) => e.target.files && setIbanCertificate(e.target.files[0])}
                    accept="image/png, image/jpeg, image/jpg, application/pdf"
                    required
                    className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white h-10 rounded-lg text-sm font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
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