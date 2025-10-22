// linora-platform/frontend/src/app/dashboard/admin/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Settings, 
  DollarSign, 
  Gem, 
  Key, 
  CreditCard, 
  Mail, 
  ImageIcon, 
  Truck, 
  Users, 
  Timer,
  Sparkles,
  Crown,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Shield,
  Cloud,
  MessageCircle,
  Globe
} from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface PlatformSettings {
  commission_rate: string;
  dropshipping_price: string;
  agreement_commission_rate: string;
  payout_clearing_days: string;
  stripe_secret_key: string;
  stripe_publishable_key: string;
  resend_api_key: string;
  cloudinary_cloud_name: string;
  cloudinary_api_key: string;
  cloudinary_api_secret: string;
  shipping_commission_rate: string;
  platform_name: string;
  platform_description: string;
  maintenance_mode: boolean;
}

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<PlatformSettings>({
    commission_rate: '0',
    dropshipping_price: '0',
    agreement_commission_rate: '0',
    payout_clearing_days: '0',
    stripe_secret_key: '',
    stripe_publishable_key: '',
    resend_api_key: '',
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: '',
    shipping_commission_rate: '0',
    platform_name: 'Linora',
    platform_description: 'Your all-in-one e-commerce platform',
    maintenance_mode: false,
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('financial');
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/admin/settings');
        setSettings(prev => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Failed to fetch settings', error);
        toast.error(t('AdminSettings.toast.fetchError'));
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings({ ...settings, [name]: checked });
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success(t('AdminSettings.toast.saveSuccess'));
    } catch (error) {
      toast.error(t('AdminSettings.toast.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 font-medium">{t('AdminSettings.loading')}</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'financial', icon: DollarSign, label: t('AdminSettings.nav.financial'), color: 'from-blue-500 to-cyan-500' },
    { id: 'payments', icon: CreditCard, label: t('AdminSettings.nav.payments'), color: 'from-purple-500 to-pink-500' },
    { id: 'apis', icon: Key, label: t('AdminSettings.nav.apis'), color: 'from-green-500 to-emerald-500' },
    { id: 'general', icon: Settings, label: t('AdminSettings.nav.general'), color: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <AdminNav />
      
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Settings className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('AdminSettings.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('AdminSettings.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid lg:grid-cols-4 gap-8 items-start max-w-7xl mx-auto">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl sticky top-24">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-3xl pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-5 h-5" />
                {t('AdminSettings.sections')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 text-sm font-medium group ${
                      activeTab === item.id
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                        : 'text-rose-700 bg-rose-50 hover:bg-rose-100 hover:shadow-md'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-rose-500'}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <form onSubmit={handleSubmit}>
              {/* Financial Settings */}
              {activeTab === 'financial' && (
                <>
                  <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <DollarSign className="w-6 h-6" />
                      {t('AdminSettings.financial.title')}
                    </CardTitle>
                    <CardDescription className="text-pink-100">
                      {t('AdminSettings.financial.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Commission Rate */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl">
                      <Label htmlFor="commission_rate" className="flex items-center gap-2 font-semibold text-blue-800 text-lg mb-3">
                        <Gem className="w-5 h-5" />
                        <span>{t('AdminSettings.financial.commissionRate.label')}</span>
                      </Label>
                      <p className="text-blue-600 text-sm mb-4">
                        {t('AdminSettings.financial.commissionRate.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="commission_rate" 
                          name="commission_rate" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="100" 
                          value={settings.commission_rate} 
                          onChange={handleChange}
                          className="bg-white border-blue-300 focus:border-blue-500 rounded-xl pl-12 text-lg"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">%</div>
                      </div>
                    </div>

                    {/* Shipping Commission */}
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl">
                      <Label htmlFor="shipping_commission_rate" className="flex items-center gap-2 font-semibold text-purple-800 text-lg mb-3">
                        <Truck className="w-5 h-5" />
                        <span>{t('AdminSettings.financial.shippingCommission.label')}</span>
                      </Label>
                      <p className="text-purple-600 text-sm mb-4">
                        {t('AdminSettings.financial.shippingCommission.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="shipping_commission_rate" 
                          name="shipping_commission_rate" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="100" 
                          value={settings.shipping_commission_rate} 
                          onChange={handleChange}
                          className="bg-white border-purple-300 focus:border-purple-500 rounded-xl pl-12 text-lg"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 font-bold">%</div>
                      </div>
                    </div>

                    {/* Agreement Commission */}
                    <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl">
                      <Label htmlFor="agreement_commission_rate" className="flex items-center gap-2 font-semibold text-teal-800 text-lg mb-3">
                        <Users className="w-5 h-5" />
                        <span>{t('AdminSettings.financial.agreementCommission.label')}</span>
                      </Label>
                      <p className="text-teal-600 text-sm mb-4">
                        {t('AdminSettings.financial.agreementCommission.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="agreement_commission_rate" 
                          name="agreement_commission_rate" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          max="100" 
                          value={settings.agreement_commission_rate} 
                          onChange={handleChange}
                          className="bg-white border-teal-300 focus:border-teal-500 rounded-xl pl-12 text-lg"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 font-bold">%</div>
                      </div>
                    </div>

                    {/* Dropshipping Price */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-lime-50 border border-green-200 rounded-2xl">
                      <Label htmlFor="dropshipping_price" className="flex items-center gap-2 font-semibold text-green-800 text-lg mb-3">
                        <DollarSign className="w-5 h-5" />
                        <span>{t('AdminSettings.financial.dropshippingPrice.label')}</span>
                      </Label>
                      <p className="text-green-600 text-sm mb-4">
                        {t('AdminSettings.financial.dropshippingPrice.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="dropshipping_price" 
                          name="dropshipping_price" 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          value={settings.dropshipping_price} 
                          onChange={handleChange}
                          className="bg-white border-green-300 focus:border-green-500 rounded-xl pl-12 text-lg"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold">SAR</div>
                      </div>
                    </div>

                    {/* Payout Clearing Days */}
                    <div className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-2xl">
                      <Label htmlFor="payout_clearing_days" className="flex items-center gap-2 font-semibold text-orange-800 text-lg mb-3">
                        <Timer className="w-5 h-5" />
                        <span>{t('AdminSettings.financial.payoutClearingDays.label')}</span>
                      </Label>
                      <p className="text-orange-600 text-sm mb-4">
                        {t('AdminSettings.financial.payoutClearingDays.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="payout_clearing_days" 
                          name="payout_clearing_days" 
                          type="number" 
                          step="1" 
                          min="0" 
                          value={settings.payout_clearing_days} 
                          onChange={handleChange}
                          className="bg-white border-orange-300 focus:border-orange-500 rounded-xl pl-12 text-lg"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-600 font-bold">
                          {t('AdminSettings.financial.payoutClearingDays.unit')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* Payment Gateways */}
              {activeTab === 'payments' && (
                <>
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <CreditCard className="w-6 h-6" />
                      {t('AdminSettings.payments.title')}
                    </CardTitle>
                    <CardDescription className="text-pink-100">
                      {t('AdminSettings.payments.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl">
                      <Label htmlFor="stripe_publishable_key" className="flex items-center gap-2 font-semibold text-indigo-800 text-lg mb-3">
                        <Key className="w-5 h-5" />
                        <span>{t('AdminSettings.payments.stripePublishable.label')}</span>
                      </Label>
                      <p className="text-indigo-600 text-sm mb-4">
                        {t('AdminSettings.payments.stripePublishable.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="stripe_publishable_key" 
                          name="stripe_publishable_key" 
                          type={showSecrets.stripe_public ? 'text' : 'password'}
                          placeholder="pk_test_..." 
                          value={settings.stripe_publishable_key} 
                          onChange={handleChange}
                          className="bg-white border-indigo-300 focus:border-indigo-500 rounded-xl pr-12 text-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-700"
                          onClick={() => toggleSecretVisibility('stripe_public')}
                        >
                          {showSecrets.stripe_public ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl">
                      <Label htmlFor="stripe_secret_key" className="flex items-center gap-2 font-semibold text-violet-800 text-lg mb-3">
                        <Shield className="w-5 h-5" />
                        <span>{t('AdminSettings.payments.stripeSecret.label')}</span>
                      </Label>
                      <p className="text-violet-600 text-sm mb-4">
                        {t('AdminSettings.payments.stripeSecret.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="stripe_secret_key" 
                          name="stripe_secret_key" 
                          type={showSecrets.stripe_secret ? 'text' : 'password'}
                          placeholder="sk_test_..." 
                          value={settings.stripe_secret_key} 
                          onChange={handleChange}
                          className="bg-white border-violet-300 focus:border-violet-500 rounded-xl pr-12 text-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-600 hover:text-violet-700"
                          onClick={() => toggleSecretVisibility('stripe_secret')}
                        >
                          {showSecrets.stripe_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* API Keys */}
              {activeTab === 'apis' && (
                <>
                  <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Key className="w-6 h-6" />
                      {t('AdminSettings.apis.title')}
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      {t('AdminSettings.apis.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Resend API Key */}
                    <div className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-2xl">
                      <Label htmlFor="resend_api_key" className="flex items-center gap-2 font-semibold text-gray-800 text-lg mb-3">
                        <Mail className="w-5 h-5" />
                        <span>{t('AdminSettings.apis.resend.label')}</span>
                      </Label>
                      <p className="text-gray-600 text-sm mb-4">
                        {t('AdminSettings.apis.resend.description')}
                      </p>
                      <div className="relative">
                        <Input 
                          id="resend_api_key" 
                          name="resend_api_key" 
                          type={showSecrets.resend ? 'text' : 'password'}
                          placeholder="re_..." 
                          value={settings.resend_api_key} 
                          onChange={handleChange}
                          className="bg-white border-gray-300 focus:border-gray-500 rounded-xl pr-12 text-lg"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-700"
                          onClick={() => toggleSecretVisibility('resend')}
                        >
                          {showSecrets.resend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Cloudinary Settings */}
                    <div className="p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl">
                      <Label className="flex items-center gap-2 font-semibold text-cyan-800 text-lg mb-3">
                        <Cloud className="w-5 h-5" />
                        <span>{t('AdminSettings.apis.cloudinary.label')}</span>
                      </Label>
                      <p className="text-cyan-600 text-sm mb-4">
                        {t('AdminSettings.apis.cloudinary.description')}
                      </p>
                      
                      <div className="space-y-4">
                        <Input 
                          id="cloudinary_cloud_name" 
                          name="cloudinary_cloud_name" 
                          type="text" 
                          placeholder={t('AdminSettings.apis.cloudinary.cloudNamePlaceholder')} 
                          value={settings.cloudinary_cloud_name} 
                          onChange={handleChange}
                          className="bg-white border-cyan-300 focus:border-cyan-500 rounded-xl text-lg"
                        />
                        
                        <Input 
                          id="cloudinary_api_key" 
                          name="cloudinary_api_key" 
                          type={showSecrets.cloudinary_key ? 'text' : 'password'}
                          placeholder={t('AdminSettings.apis.cloudinary.apiKeyPlaceholder')} 
                          value={settings.cloudinary_api_key} 
                          onChange={handleChange}
                          className="bg-white border-cyan-300 focus:border-cyan-500 rounded-xl pr-12 text-lg"
                        />
                        
                        <div className="relative">
                          <Input 
                            id="cloudinary_api_secret" 
                            name="cloudinary_api_secret" 
                            type={showSecrets.cloudinary_secret ? 'text' : 'password'}
                            placeholder={t('AdminSettings.apis.cloudinary.apiSecretPlaceholder')} 
                            value={settings.cloudinary_api_secret} 
                            onChange={handleChange}
                            className="bg-white border-cyan-300 focus:border-cyan-500 rounded-xl pr-12 text-lg"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-600 hover:text-cyan-700"
                            onClick={() => toggleSecretVisibility('cloudinary_secret')}
                          >
                            {showSecrets.cloudinary_secret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </>
              )}

              {/* General Settings */}
              {activeTab === 'general' && (
                <>
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Settings className="w-6 h-6" />
                      {t('AdminSettings.general.title')}
                    </CardTitle>
                    <CardDescription className="text-red-100">
                      {t('AdminSettings.general.description')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Platform Name */}
                    <div className="p-6 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-2xl">
                      <Label htmlFor="platform_name" className="flex items-center gap-2 font-semibold text-rose-800 text-lg mb-3">
                        <Globe className="w-5 h-5" />
                        <span>{t('AdminSettings.general.platformName.label')}</span>
                      </Label>
                      <p className="text-rose-600 text-sm mb-4">
                        {t('AdminSettings.general.platformName.description')}
                      </p>
                      <Input 
                        id="platform_name" 
                        name="platform_name" 
                        type="text" 
                        value={settings.platform_name} 
                        onChange={handleChange}
                        className="bg-white border-rose-300 focus:border-rose-500 rounded-xl text-lg"
                      />
                    </div>

                    {/* Platform Description */}
                    <div className="p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl">
                      <Label htmlFor="platform_description" className="flex items-center gap-2 font-semibold text-amber-800 text-lg mb-3">
                        <MessageCircle className="w-5 h-5" />
                        <span>{t('AdminSettings.general.platformDescription.label')}</span>
                      </Label>
                      <p className="text-amber-600 text-sm mb-4">
                        {t('AdminSettings.general.platformDescription.description')}
                      </p>
                      <Input 
                        id="platform_description" 
                        name="platform_description" 
                        type="text" 
                        value={settings.platform_description} 
                        onChange={handleChange}
                        className="bg-white border-amber-300 focus:border-amber-500 rounded-xl text-lg"
                      />
                    </div>

                    {/* Maintenance Mode */}
                    <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="flex items-center gap-2 font-semibold text-slate-800 text-lg mb-2">
                            <Shield className="w-5 h-5" />
                            <span>{t('AdminSettings.general.maintenanceMode.label')}</span>
                          </Label>
                          <p className="text-slate-600 text-sm">
                            {t('AdminSettings.general.maintenanceMode.description')}
                          </p>
                        </div>
                        <Switch
                          checked={settings.maintenance_mode}
                          onCheckedChange={(checked) => handleSwitchChange('maintenance_mode', checked)}
                          className="data-[state=checked]:bg-rose-500"
                        />
                      </div>
                      {settings.maintenance_mode && (
                        <Badge variant="destructive" className="mt-3">
                          ⚠️ {t('AdminSettings.general.maintenanceMode.activeBadge')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </>
              )}
              
              {/* Save Button */}
              <div className="p-6 pt-0 mt-6">
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 px-8 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin ml-2" />
                        {t('AdminSettings.actions.saving')}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 ml-2" />
                        {t('AdminSettings.actions.save')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}