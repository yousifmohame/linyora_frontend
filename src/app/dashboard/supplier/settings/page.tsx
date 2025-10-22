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
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  Settings,
  Building,
  Share2,
  Gem,
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
} from 'lucide-react';
import Image from 'next/image';
import Navigation from '@/components/dashboards/Navigation';
import { toast } from 'sonner';
import SupplierNav from '@/components/dashboards/SupplierNav';

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

export default function SettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        setLoading(true);
        const settingsRes = await api.get('/supplier/settings');
        
        // Ensure social_links is a valid object
        settingsRes.data.social_links = settingsRes.data.social_links && typeof settingsRes.data.social_links === 'object' 
            ? settingsRes.data.social_links 
            : {};
        
        setSettings(settingsRes.data);

      } catch (error) {
        toast.error('Failed to fetch settings data.');
        console.error('Failed to fetch settings data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsData();
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
      await api.put('/supplier/settings', settings);
      toast.success(t('StoreSettings.saveSuccess'));
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(t('StoreSettings.saveError'));
    } finally {
      setIsSaving(false);
    }
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
      <SupplierNav />
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
                  
                  {/* ✨ --- START: Updated Subscription Tab --- ✨ */}
                  {activeTab === 'subscription' && (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <Gem className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                          عرض خاص لفترة محدودة!
                      </h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          استمتع بجميع مزايا الباقة المتقدمة مجانًا. ابدأ البيع، ووسّع نطاق عملك دون أي تكاليف اشتراك.
                      </p>
                      <Badge className="bg-green-100 text-green-800 text-lg py-2 px-4 mb-6">
                          اشتراك مجاني
                      </Badge>
                      <div>
                          <Button 
                              type="button" // Use type="button" to prevent form submission
                              className="h-12 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                              onClick={() => toast.success('تم تفعيل اشتراكك المجاني بنجاح!')}
                          >
                              <Sparkles className="w-4 h-4 ml-2" />
                              فعّل اشتراكك المجاني الآن
                          </Button>
                      </div>
                    </div>
                  )}
                  {/* ✨ --- END: Updated Subscription Tab --- ✨ */}

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