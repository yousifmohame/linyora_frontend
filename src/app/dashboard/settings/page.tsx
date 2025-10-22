// app/dashboard/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  UploadCloud, 
  Settings, 
  Building, 
  Share2, 
  Gem, 
  AlertTriangle, 
  Sparkles,
  Globe,
  Bell,
  Shield,
  CreditCard,
  Download,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  Calendar,
  History
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '@/components/dashboards/Navigation';
import { toast } from 'sonner';
import axios from 'axios';

// --- Interfaces ---
interface SocialLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
}

interface SettingsData {
  store_name: string;
  store_description: string;
  store_banner_url?: string | null;
  social_links?: SocialLinks | null;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  privacy: {
    show_email: boolean;
    show_phone: boolean;
  };
}

interface SubscriptionData {
  id: number;
  user_id: number;
  status: 'active' | 'cancelled' | 'inactive';
  start_date: string;
  end_date: string;
  stripe_subscription_id: string;
  plan_name: string;
  price: number | string;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [settingsRes, statusRes, historyRes] = await Promise.all([
          api.get('/merchants/settings'),
          api.get('/subscriptions/status').catch(() => ({ data: null })),
          api.get('/subscriptions/history').catch(() => ({ data: [] }))
        ]);
        
        // التأكد من أن social_links كائن صالح
        settingsRes.data.social_links = settingsRes.data.social_links && typeof settingsRes.data.social_links === 'object' 
            ? settingsRes.data.social_links 
            : {};
        
        setSettings(settingsRes.data);
        
        // معالجة بيانات الاشتراك لضمان أن price يكون رقمًا
        if (statusRes.data) {
          const subscriptionData = {
            ...statusRes.data,
            price: typeof statusRes.data.price === 'string' ? parseFloat(statusRes.data.price) : statusRes.data.price
          };
          setSubscription(subscriptionData);
        }

        // تخزين سجل الاشتراكات
        setSubscriptionHistory(historyRes.data);

      } catch (error) {
        toast.error('فشل في جلب بيانات الإعدادات.');
        console.error('Failed to fetch settings data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };
  
  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    setSettings({
        ...settings,
        social_links: {
            ...(settings.social_links || {}),
            [e.target.name]: e.target.value,
        }
    });
  };

  const handleToggleChange = <S extends 'notifications' | 'privacy'>(
      section: S,
      key: keyof SettingsData[S],
      value: boolean
    ) => {
      if (!settings) return;
      setSettings((prev) => ({
        ...prev!,
        [section]: {
          ...prev![section],
          [key]: value,
        },
      }));
    };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || !settings) return;
      setIsUploading(true);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      try {
          const response = await api.post('/upload', formData);
          setSettings({...settings, store_banner_url: response.data.imageUrl});
          toast.success(t('SettingsPage.upload.success'));
      } catch (error) {
          console.error("Banner upload failed", error);
          toast.error(t('SettingsPage.upload.failed'));
      } finally {
          setIsUploading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    try {
      await api.put('/merchants/settings', settings);
      toast.success(t('StoreSettings.saveSuccess'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(t('StoreSettings.saveError'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancelSubscription = async () => {
  setIsSaving(true);
  try {
    const response = await api.post('/payments/cancel-subscription');
    toast.success(response.data.message);
    const subRes = await api.get('/subscriptions/status');
    if (subRes.data) {
      const subscriptionData = {
        ...subRes.data,
        price: typeof subRes.data.price === 'string' ? parseFloat(subRes.data.price) : subRes.data.price
      };
      setSubscription(subscriptionData);
    }
  } catch (error: unknown) {
    let errorMessage = t('SettingsPage.subscription.cancelFailed');
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.message || errorMessage;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
  } finally {
    setIsSaving(false);
  }
};

  const getSubscriptionStatus = (status: string) => {
    const statusConfig = {
      active: { label: t('common.subscriptionStatus.active'), color: 'bg-green-100 text-green-800' },
      cancelled: { label: t('common.subscriptionStatus.cancelled'), color: 'bg-amber-100 text-amber-800' },
      inactive: { label: t('common.subscriptionStatus.inactive'), color: 'bg-red-100 text-red-800' }
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
  };

  // دالة مساعدة لتحويل السعر إلى التنسيق الصحيح
  const formatPrice = (price: number | string): string => {
    if (typeof price === 'string') {
      return parseFloat(price).toFixed(2);
    }
    return price.toFixed(2);
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">{t('StoreSettings.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <Navigation />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse mb-4 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                {t('StoreSettings.title')}
              </h1>
              <p className="text-gray-600">{t('StoreSettings.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50 rounded-2xl">
              <Download className="w-4 h-4 ml-2" />
              {t('SettingsPage.exportData')}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl sticky top-6">
              <CardContent className="p-6">
                <nav className="space-y-2">
                  {[
                    { id: 'general', icon: Settings, label: t('SettingsPage.tabs.general') },
                    { id: 'store', icon: Building, label: t('SettingsPage.tabs.store') },
                    { id: 'social', icon: Share2, label: t('SettingsPage.tabs.social') },
                    { id: 'notifications', icon: Bell, label: t('SettingsPage.tabs.notifications') },
                    { id: 'privacy', icon: Shield, label: t('SettingsPage.tabs.privacy') },
                    { id: 'subscription', icon: Gem, label: t('SettingsPage.tabs.subscription') }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-2xl transition-all duration-200 ${
                          activeTab === item.id
                            ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
              <CardHeader className="border-b border-gray-200/50">
                <CardTitle className="flex items-center space-x-2 space-x-reverse text-2xl">
                  {activeTab === 'general' && <Settings className="w-6 h-6 text-rose-500" />}
                  {activeTab === 'store' && <Building className="w-6 h-6 text-blue-500" />}
                  {activeTab === 'social' && <Share2 className="w-6 h-6 text-green-500" />}
                  {activeTab === 'notifications' && <Bell className="w-6 h-6 text-amber-500" />}
                  {activeTab === 'privacy' && <Shield className="w-6 h-6 text-purple-500" />}
                  {activeTab === 'subscription' && <Gem className="w-6 h-6 text-cyan-500" />}
                  <span>
                    {activeTab === 'general' && t('SettingsPage.tabs.general')}
                    {activeTab === 'store' && t('SettingsPage.tabs.store')}
                    {activeTab === 'social' && t('SettingsPage.tabs.social')}
                    {activeTab === 'notifications' && t('SettingsPage.tabs.notifications')}
                    {activeTab === 'privacy' && t('SettingsPage.tabs.privacy')}
                    {activeTab === 'subscription' && t('SettingsPage.tabs.subscription')}
                  </span>
                </CardTitle>
                <CardDescription>
                  {activeTab === 'general' && t('SettingsPage.descriptions.general')}
                  {activeTab === 'store' && t('SettingsPage.descriptions.store')}
                  {activeTab === 'social' && t('SettingsPage.descriptions.social')}
                  {activeTab === 'notifications' && t('SettingsPage.descriptions.notifications')}
                  {activeTab === 'privacy' && t('SettingsPage.descriptions.privacy')}
                  {activeTab === 'subscription' && t('SettingsPage.descriptions.subscription')}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6">
                <form onSubmit={handleSubmit}>
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="language" className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                            <Globe className="w-4 h-4 text-blue-500" />
                            <span>{t('SettingsPage.fields.language')}</span>
                          </Label>
                          <select 
                            id="language"
                            className="w-full h-12 bg-white border border-gray-300 rounded-xl px-3 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                          >
                            <option value="ar">{t('SettingsPage.languageOptions.ar')}</option>
                            <option value="en">{t('SettingsPage.languageOptions.en')}</option>
                          </select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="currency" className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                            <CreditCard className="w-4 h-4 text-green-500" />
                            <span>{t('SettingsPage.fields.currency')}</span>
                          </Label>
                          <select 
                            id="currency"
                            className="w-full h-12 bg-white border border-gray-300 rounded-xl px-3 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all duration-200"
                          >
                            <option value="SAR">{t('SettingsPage.currencyOptions.sar')}</option>
                            <option value="USD">{t('SettingsPage.currencyOptions.usd')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Store Settings */}
                  {activeTab === 'store' && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="store_name" className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                          <Building className="w-4 h-4 text-blue-500" />
                          <span>{t('StoreSettings.storeName')}</span>
                        </Label>
                        <Input 
                          id="store_name" 
                          name="store_name" 
                          value={settings.store_name || ''} 
                          onChange={handleChange}
                          className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="store_description" className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <span>{t('StoreSettings.storeDescription')}</span>
                        </Label>
                        <Textarea 
                          id="store_description" 
                          name="store_description" 
                          value={settings.store_description || ''} 
                          onChange={handleChange} 
                          rows={4}
                          className="bg-white border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200 rounded-xl"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                          <UploadCloud className="w-4 h-4 text-rose-500" />
                          <span>{t('SettingsPage.fields.storeBanner')}</span>
                        </Label>
                        <div className="h-48 w-full border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center relative bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden">
                          {settings.store_banner_url ? (
                            <Image 
                              src={settings.store_banner_url} 
                              alt="Store Banner" 
                              fill
                              className="object-cover rounded-2xl"
                              unoptimized 
                            />
                          ) : (
                            <div className="text-center text-gray-400">
                              <UploadCloud className="w-8 h-8 mx-auto mb-2" />
                              <p>{t('SettingsPage.upload.dropOrClick')}</p>
                            </div>
                          )}
                          <label htmlFor="banner-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                            <div className="text-center">
                              <UploadCloud className="w-8 h-8 mx-auto"/>
                              <p>{isUploading ? t('common.uploading') : t('SettingsPage.upload.changeImage')}</p>
                            </div>
                            <input id="banner-upload" type="file" className="hidden" onChange={handleBannerUpload} disabled={isUploading} />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social Settings */}
                  {activeTab === 'social' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="instagram" className="text-sm font-semibold">Instagram</Label>
                          <Input 
                            name="instagram" 
                            value={settings.social_links?.instagram || ''} 
                            onChange={handleSocialChange} 
                            placeholder={t('SettingsPage.socialPlaceholders.instagram')}
                            className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all duration-200 rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="twitter" className="text-sm font-semibold">Twitter (X)</Label>
                          <Input 
                            name="twitter" 
                            value={settings.social_links?.twitter || ''} 
                            onChange={handleSocialChange} 
                            placeholder={t('SettingsPage.socialPlaceholders.twitter')}
                            className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 rounded-xl"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="facebook" className="text-sm font-semibold">Facebook</Label>
                          <Input 
                            name="facebook" 
                            value={settings.social_links?.facebook || ''} 
                            onChange={handleSocialChange} 
                            placeholder={t('SettingsPage.socialPlaceholders.facebook')}
                            className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Mail className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{t('SettingsPage.notifications.email')}</p>
                              <p className="text-sm text-gray-500">{t('SettingsPage.notifications.emailDesc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.notifications.email}
                            onCheckedChange={(checked) => handleToggleChange('notifications', 'email', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Bell className="w-5 h-5 text-amber-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{t('SettingsPage.notifications.push')}</p>
                              <p className="text-sm text-gray-500">{t('SettingsPage.notifications.pushDesc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.notifications.push}
                            onCheckedChange={(checked) => handleToggleChange('notifications', 'push', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <MessageCircle className="w-5 h-5 text-green-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{t('SettingsPage.notifications.sms')}</p>
                              <p className="text-sm text-gray-500">{t('SettingsPage.notifications.smsDesc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.notifications.sms}
                            onCheckedChange={(checked) => handleToggleChange('notifications', 'sms', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Privacy Settings */}
                  {activeTab === 'privacy' && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Mail className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{t('SettingsPage.privacy.showEmail')}</p>
                              <p className="text-sm text-gray-500">{t('SettingsPage.privacy.showEmailDesc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.privacy.show_email}
                            onCheckedChange={(checked) => handleToggleChange('privacy', 'show_email', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <Phone className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="font-semibold text-gray-900">{t('SettingsPage.privacy.showPhone')}</p>
                              <p className="text-sm text-gray-500">{t('SettingsPage.privacy.showPhoneDesc')}</p>
                            </div>
                          </div>
                          <Switch
                            checked={settings.privacy.show_phone}
                            onCheckedChange={(checked) => handleToggleChange('privacy', 'show_phone', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Subscription Settings */}
                  {activeTab === 'subscription' && (
                    <div className="space-y-6">
                      {subscription ? (
                        <div className="space-y-6">
                          <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-gray-900 text-lg">{subscription.plan_name}</h3>
                                <p className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                                  {formatPrice(subscription.price)} {t('common.currency')} / {t('SettingsPage.subscription.month')}
                                </p>
                              </div>
                              <Badge className={getSubscriptionStatus(subscription.status).color}>
                                {getSubscriptionStatus(subscription.status).label}
                              </Badge>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{t('SettingsPage.subscription.startDate')}: {new Date(subscription.start_date).toLocaleDateString('ar-EG')}</span>
                              </div>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{t('SettingsPage.subscription.endDate')}: {new Date(subscription.end_date).toLocaleDateString('ar-EG')}</span>
                              </div>
                            </div>
                          </div>

                          {/* جدول سجل الاشتراكات */}
                          <Card className="bg-white/50">
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" /> 
                                {t('SettingsPage.subscription.history')}
                              </CardTitle>
                              <CardDescription>
                                {t('SettingsPage.subscription.historyDescription')}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>{t('SettingsPage.subscription.planName')}</TableHead>
                                    <TableHead>{t('SettingsPage.subscription.status')}</TableHead>
                                    <TableHead>{t('SettingsPage.subscription.startDate')}</TableHead>
                                    <TableHead>{t('SettingsPage.subscription.endDate')}</TableHead>
                                    <TableHead className="text-left">{t('SettingsPage.subscription.price')}</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {subscriptionHistory.length > 0 ? (
                                    subscriptionHistory.map((sub) => (
                                      <TableRow key={sub.id}>
                                        <TableCell className="font-medium">{sub.plan_name}</TableCell>
                                        <TableCell>
                                          <Badge className={getSubscriptionStatus(sub.status).color}>
                                            {getSubscriptionStatus(sub.status).label}
                                          </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(sub.start_date).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell>{new Date(sub.end_date).toLocaleDateString('ar-EG')}</TableCell>
                                        <TableCell className="text-left font-semibold">{formatPrice(sub.price)} {t('common.currency')}</TableCell>
                                      </TableRow>
                                    ))
                                  ) : (
                                    <TableRow>
                                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                        {t('SettingsPage.subscription.noHistory')}
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </CardContent>
                          </Card>

                          {subscription.status === 'active' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full h-12 rounded-2xl">
                                  <AlertTriangle className="w-4 h-4 ml-2" />
                                  {t('SettingsPage.subscription.cancelButton')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center space-x-2 space-x-reverse text-lg">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    <span>{t('SettingsPage.subscription.cancelConfirm.title')}</span>
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-600">
                                    {t('SettingsPage.subscription.cancelConfirm.description')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex space-x-3 space-x-reverse">
                                  <AlertDialogCancel className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors rounded-2xl">
                                    {t('common.cancel')}
                                  </AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={handleCancelSubscription}
                                    className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                                  >
                                    {t('SettingsPage.subscription.cancelConfirm.confirm')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Gem className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('SettingsPage.subscription.noActive')}</h3>
                          <p className="text-gray-600 mb-6">{t('SettingsPage.subscription.upgradePrompt')}</p>
                          <Link href="/dashboard/dropshipping">
                            <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                              <Sparkles className="w-4 h-4 ml-2" />
                              {t('SettingsPage.subscription.viewPlans')}
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t border-gray-200 mt-8">
                    <Button 
                      type="submit" 
                      disabled={isSaving || isUploading}
                      className="h-12 px-8 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                    >
                      {isSaving ? (
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{t('common.saving')}</span>
                        </div>
                      ) : (
                        t('StoreSettings.saveChanges')
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}