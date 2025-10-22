'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Heart,
  Instagram,
  Twitter,
  Facebook,
  MessageSquare,
  Calendar,
  Shield,
  Star,
  MapPin,
  Camera,
  Award,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Crown,
  Zap,
  Eye,
  ShoppingBag,
  Clock,
  RefreshCw,
  ArrowRight,
  Share2,
  Bookmark
} from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Offer {
  id: number;
  title: string;
  type: string;
  description: string;
  price: number;
}

interface ModelProfile {
  id: number;
  name: string;
  role_id: number;
  profile_picture_url?: string;
  bio?: string;
  portfolio?: string[];
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
  };
  stats?: {
    followers?: string;
    engagement?: string;
    avg_response_time?: string;
    completion_rate?: string;
  };
  rating?: number;
  completed_campaigns?: number;
  location?: string;
  categories?: string[];
  experience_years?: number;
  languages?: string[];
  is_verified?: boolean;
  is_featured?: boolean;
}

interface MerchantProduct {
  id: number;
  name: string;
  category?: string;
  image_url?: string;
  price?: number;
}

interface PackageTier {
  id?: number;
  tier_name: string;
  price: number;
  delivery_days: number;
  revisions: number;
  features: string[];
}

interface ServicePackage {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status: 'active' | 'paused';
  tiers: PackageTier[];
}

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function ModelProfilePage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantProducts, setMerchantProducts] = useState<MerchantProduct[]>([]);

  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedProductIdForOffer, setSelectedProductIdForOffer] = useState<string>('');
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);

  const [selectedTier, setSelectedTier] = useState<PackageTier | null>(null);
  const [selectedProductIdForPackage, setSelectedProductIdForPackage] = useState<string>('');
  const [isSubmittingPackage, setIsSubmittingPackage] = useState(false);

  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [activeTab, setActiveTab] = useState('portfolio');

  const fetchData = useCallback(async () => {
    if (typeof id !== 'string') return;
    try {
      const [profileRes, productsRes] = await Promise.all([
        api.get<{ profile: ModelProfile; offers: Offer[]; packages: ServicePackage[] }>(`/browse/models/${id}`),
        api.get<MerchantProduct[]>('/merchants/products'),
      ]);
      setProfile(profileRes.data.profile);
      setOffers(profileRes.data.offers || []);
      setPackages(profileRes.data.packages || []);
      setMerchantProducts(productsRes.data);
    } catch (error) {
      console.error('Failed to fetch profile or products', error);
      toast.error(t('ModelProfile.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRequestSubmit = async () => {
    if (!selectedOffer || !selectedProductIdForOffer) {
      toast.error(t('ModelProfile.toast.offerProductRequired'));
      return;
    }
    setIsSubmittingOffer(true);
    try {
      const { data } = await api.post<{ url?: string }>('/payments/create-agreement-checkout-session', {
        model_id: profile?.id,
        offer_id: selectedOffer.id,
        product_id: selectedProductIdForOffer,
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(t('ModelProfile.toast.paymentFailed'));
      }
    } catch (error) {
      const err = error as ApiError;
      console.error('Failed to initiate checkout', err);
      toast.error(err.response?.data?.message || t('ModelProfile.toast.checkoutError'));
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  const handlePackageRequest = (tier: PackageTier) => {
    setSelectedTier(tier);
  };

  const handlePackageSubmit = async () => {
    if (!selectedTier || !selectedProductIdForPackage) {
      toast.error(t('ModelProfile.toast.packageProductRequired'));
      return;
    }
    setIsSubmittingPackage(true);
    try {
      const { data } = await api.post<{ url?: string }>('/payments/create-agreement-checkout-session', {
        model_id: profile?.id,
        package_tier_id: selectedTier.id,
        product_id: selectedProductIdForPackage,
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(t('ModelProfile.toast.paymentFailed'));
      }
    } catch (error) {
      const err = error as ApiError;
      console.error('Failed to initiate package checkout', err);
      toast.error(err.response?.data?.message || t('ModelProfile.toast.packageCheckoutError'));
    } finally {
      setIsSubmittingPackage(false);
    }
  };

  const handleStartConversation = async () => {
    if (!profile) return;
    setIsCreatingChat(true);
    try {
      const response = await api.post<{ conversationId: string }>('/messages/conversations', {
        participantId: profile.id
      });
      const { conversationId } = response.data;
      router.push(`/dashboard/messages?active=${conversationId}`);
    } catch (error) {
      console.error("Failed to start conversation", error);
      toast.error(t('ModelProfile.toast.conversationError'));
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleBookCampaign = () => {
    toast.info(t('ModelProfile.toast.comingSoon'));
  };

  const handleShareProfile = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile?.name,
          text: profile?.bio,
          url: window.location.href,
        });
      } catch {
        // Sharing cancelled or not supported — no-op
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t('ModelProfile.toast.linkCopied'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">{t('ModelProfile.loading')}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-rose-800 mb-2">{t('ModelProfile.notFound.title')}</h2>
          <p className="text-rose-600">{t('ModelProfile.notFound.description')}</p>
        </div>
      </div>
    );
  }

  const getRoleLabel = (roleId: number) => {
    return roleId === 3 ? t('ModelProfile.role.model') : t('ModelProfile.role.influencer');
  };

  const tierIcons = [
    <Star key="1" className="w-5 h-5 text-amber-400" />,
    <Zap key="2" className="w-5 h-5 text-blue-400" />,
    <Crown key="3" className="w-5 h-5 text-purple-400" />
  ];

  // Format price with currency based on language
  const formatPrice = (price: number): string => {
    const currency = i18n.language === 'ar' ? 'SAR' : 'SAR';
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-4 md:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-rose-200 mb-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-2xl">
                  <AvatarImage src={profile.profile_picture_url || ''} alt={profile.name} />
                  <AvatarFallback className="text-3xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold">
                    {profile.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {profile.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-full shadow-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                )}
                {profile.is_featured && (
                  <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-2 rounded-full shadow-lg">
                    <Crown className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-rose-800">{profile.name}</h1>
                    {profile.rating && (
                      <Badge className="bg-amber-500 text-white px-3 py-1 rounded-full">
                        <Star className="w-3 h-3 fill-current ml-1" />
                        {profile.rating}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 px-4 py-1">
                      {getRoleLabel(profile.role_id)}
                    </Badge>
                    {profile.experience_years && (
                      <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200">
                        <Award className="w-3 h-3 ml-1" />
                        {t('ModelProfile.experience', { years: profile.experience_years })}
                      </Badge>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-1 text-rose-600">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleShareProfile}
                    className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                  >
                    <Bookmark className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <p className="text-rose-700 text-lg leading-relaxed mb-6">
                {profile.bio || t('ModelProfile.defaultBio')}
              </p>
              {profile.categories && profile.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.categories.map((category, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 rounded-lg"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleStartConversation}
                  disabled={isCreatingChat}
                  className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-bold flex-1"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {isCreatingChat ? t('ModelProfile.actions.creatingChat') : t('ModelProfile.actions.startConversation')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBookCampaign}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 px-8 py-3 rounded-2xl font-bold flex-1"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  {t('ModelProfile.actions.bookCampaign')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  {t('ModelProfile.stats.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-rose-50 rounded-xl">
                  <span className="flex items-center gap-2 text-rose-600">
                    <Users className="w-4 h-4" />
                    {t('ModelProfile.stats.followers')}
                  </span>
                  <strong className="text-rose-800 text-lg">{profile.stats?.followers || '0'}</strong>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="flex items-center gap-2 text-purple-600">
                    <Heart className="w-4 h-4" />
                    {t('ModelProfile.stats.engagement')}
                  </span>
                  <strong className="text-purple-800 text-lg">{profile.stats?.engagement || '0%'}</strong>
                </div>
                {profile.stats?.avg_response_time && (
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                    <span className="flex items-center gap-2 text-blue-600">
                      <Clock className="w-4 h-4" />
                      {t('ModelProfile.stats.responseTime')}
                    </span>
                    <strong className="text-blue-800 text-lg">{profile.stats.avg_response_time}</strong>
                  </div>
                )}
                {profile.stats?.completion_rate && (
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      {t('ModelProfile.stats.completionRate')}
                    </span>
                    <strong className="text-green-800 text-lg">{profile.stats.completion_rate}</strong>
                  </div>
                )}
                {profile.completed_campaigns !== undefined && (
                  <div className="flex justify-between items-center p-3 bg-amber-50 rounded-xl">
                    <span className="flex items-center gap-2 text-amber-600">
                      <Award className="w-4 h-4" />
                      {t('ModelProfile.stats.completedCampaigns')}
                    </span>
                    <strong className="text-amber-800 text-lg">{profile.completed_campaigns}</strong>
                  </div>
                )}
              </CardContent>
            </Card>

            {profile.social_links && (
              <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5" />
                    {t('ModelProfile.social.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {profile.social_links.instagram && (
                    <a
                      href={profile.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 text-rose-700 hover:bg-rose-50 rounded-xl transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Instagram className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium group-hover:text-rose-600">Instagram</span>
                    </a>
                  )}
                  {profile.social_links.twitter && (
                    <a
                      href={profile.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg">
                        <Twitter className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium group-hover:text-blue-600">Twitter</span>
                    </a>
                  )}
                  {profile.social_links.facebook && (
                    <a
                      href={profile.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Facebook className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium group-hover:text-blue-700">Facebook</span>
                    </a>
                  )}
                  {profile.social_links.tiktok && (
                    <a
                      href={profile.social_links.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-300 group"
                    >
                      <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.5 6.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z" />
                          <path d="M16.5 6.5v10" />
                          <path d="M16.5 11.5a5 5 0 0 0-5-5" />
                        </svg>
                      </div>
                      <span className="font-medium group-hover:text-gray-800">TikTok</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {profile.languages && profile.languages.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-rose-500" />
                    {t('ModelProfile.languages')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profile.languages.map((language, index) => (
                      <Badge key={index} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm border-rose-200 rounded-2xl p-1">
                <TabsTrigger value="portfolio" className="rounded-xl data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                  <Camera className="w-4 h-4 ml-2" />
                  {t('ModelProfile.tabs.portfolio')}
                </TabsTrigger>
                <TabsTrigger value="packages" className="rounded-xl data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                  <ShoppingBag className="w-4 h-4 ml-2" />
                  {t('ModelProfile.tabs.packages')}
                </TabsTrigger>
                <TabsTrigger value="offers" className="rounded-xl data-[state=active]:bg-rose-500 data-[state=active]:text-white">
                  <Award className="w-4 h-4 ml-2" />
                  {t('ModelProfile.tabs.offers')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="space-y-6">
                {profile.portfolio && profile.portfolio.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {profile.portfolio.map((imgUrl: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105"
                      >
                        <Image
                          src={imgUrl}
                          alt={`${profile.name} portfolio ${index + 1}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl text-center py-16">
                    <CardContent>
                      <Camera className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                      <h3 className="font-bold text-xl text-rose-800 mb-2">{t('ModelProfile.portfolio.empty.title')}</h3>
                      <p className="text-rose-600">{t('ModelProfile.portfolio.empty.description')}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="packages" className="space-y-6">
                {packages.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl text-center py-16">
                    <CardContent>
                      <ShoppingBag className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                      <h3 className="font-bold text-xl text-rose-800 mb-2">{t('ModelProfile.packages.empty.title')}</h3>
                      <p className="text-rose-600">{t('ModelProfile.packages.empty.description')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {packages.map((pkg) => (
                      <Card key={pkg.id} className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                          <CardTitle className="flex items-center gap-3">
                            <Sparkles className="w-6 h-6" />
                            {pkg.title}
                          </CardTitle>
                          {pkg.description && (
                            <CardDescription className="text-pink-100">
                              {pkg.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="grid md:grid-cols-3 gap-6">
                            {pkg.tiers.map((tier, index) => (
                              <div key={tier.id || tier.tier_name} className="p-6 border border-rose-200 rounded-2xl bg-gradient-to-b from-white to-rose-50/50 flex flex-col hover:border-rose-300 transition-all duration-300">
                                <div className="flex-grow">
                                  <div className="flex items-center gap-2 mb-4">
                                    {tierIcons[index]}
                                    <h3 className="font-bold text-lg text-rose-800">{tier.tier_name}</h3>
                                  </div>
                                  <p className="text-3xl font-extrabold my-4 text-rose-900">
                                    {formatPrice(tier.price)}
                                  </p>
                                  <ul className="space-y-2 text-sm text-rose-700 mb-6">
                                    {tier.features.map((feature, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="leading-relaxed">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="text-xs text-rose-500 border-t border-rose-100 pt-4 mt-auto grid grid-cols-2 gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" />
                                    <span>{t('ModelProfile.packages.delivery', { days: tier.delivery_days })}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <RefreshCw className="w-3 h-3" />
                                    <span>
                                      {tier.revisions === -1 
                                        ? t('ModelProfile.packages.unlimitedRevisions') 
                                        : t('ModelProfile.packages.revisions', { count: tier.revisions })
                                      }
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handlePackageRequest(tier)}
                                  className="w-full mt-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
                                >
                                  {t('ModelProfile.packages.select')}
                                  <ArrowRight className="mr-2 w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offers" className="space-y-6">
                {offers.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl text-center py-16">
                    <CardContent>
                      <Award className="w-16 h-16 text-rose-300 mx-auto mb-4" />
                      <h3 className="font-bold text-xl text-rose-800 mb-2">{t('ModelProfile.offers.empty.title')}</h3>
                      <p className="text-rose-600">{t('ModelProfile.offers.empty.description')}</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6">
                    {offers.map((offer) => (
                      <Card
                        key={offer.id}
                        className="p-6 border-0 bg-gradient-to-r from-white to-rose-50/50 shadow-lg hover:shadow-xl transition-all duration-300 border border-rose-200 rounded-2xl"
                      >
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="font-bold text-xl text-rose-800">{offer.title}</h4>
                              <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                                {offer.type}
                              </Badge>
                            </div>
                            <p className="text-rose-600 text-lg leading-relaxed">{offer.description}</p>
                          </div>
                          <div className="text-left lg:text-right">
                            <p className="font-bold text-2xl text-rose-600 mb-3">
                              {formatPrice(offer.price)}
                            </p>
                            <Button
                              size="lg"
                              onClick={() => setSelectedOffer(offer)}
                              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 rounded-xl"
                            >
                              {t('ModelProfile.offers.request')}
                              <ShoppingBag className="mr-2 w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Offer Request Dialog */}
      <Dialog open={!!selectedOffer} onOpenChange={(open) => !open && setSelectedOffer(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-2xl">
          <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="w-6 h-6" />
              {t('ModelProfile.dialog.offer.title')}
            </DialogTitle>
            <DialogDescription className="text-pink-100">
              {selectedOffer?.title} - {selectedOffer && formatPrice(selectedOffer.price)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <Label htmlFor="product-select" className="block text-lg font-bold text-rose-800 mb-3">
                {t('ModelProfile.dialog.offer.productLabel')}
              </Label>
              <Select onValueChange={setSelectedProductIdForOffer} value={selectedProductIdForOffer}>
                <SelectTrigger id="product-select" className="w-full h-12 rounded-xl border-rose-200">
                  <SelectValue placeholder={t('ModelProfile.dialog.offer.productPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="border-rose-200 rounded-xl">
                  {merchantProducts.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)} className="py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          {product.category && (
                            <span className="text-sm text-rose-500">{product.category}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex gap-3">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl py-3">
                  {t('common.cancel')}
                </Button>
              </DialogClose>
              <Button
                onClick={handleRequestSubmit}
                disabled={!selectedProductIdForOffer || isSubmittingOffer}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl py-3 font-bold"
              >
                {isSubmittingOffer ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t('ModelProfile.dialog.offer.processing')}
                  </div>
                ) : (
                  <>
                    {t('ModelProfile.dialog.offer.confirm')}
                    <ArrowRight className="mr-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Package Tier Request Dialog */}
      <Dialog open={!!selectedTier} onOpenChange={(open) => !open && setSelectedTier(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-2xl">
          <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6" />
              {t('ModelProfile.dialog.package.title', { tier: selectedTier?.tier_name })}
            </DialogTitle>
            <DialogDescription className="text-pink-100">
              {t('ModelProfile.dialog.package.description', { amount: selectedTier && formatPrice(selectedTier.price) })}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            <div>
              <Label htmlFor="package-product-select" className="block text-lg font-bold text-rose-800 mb-3">
                {t('ModelProfile.dialog.package.productLabel')}
              </Label>
              <Select onValueChange={setSelectedProductIdForPackage} value={selectedProductIdForPackage}>
                <SelectTrigger id="package-product-select" className="w-full h-12 rounded-xl border-rose-200">
                  <SelectValue placeholder={t('ModelProfile.dialog.package.productPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="border-rose-200 rounded-xl">
                  {merchantProducts.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)} className="py-3">
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          {product.category && (
                            <span className="text-sm text-rose-500">{product.category}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex gap-3">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl py-3">
                  {t('common.cancel')}
                </Button>
              </DialogClose>
              <Button
                onClick={handlePackageSubmit}
                disabled={!selectedProductIdForPackage || isSubmittingPackage}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl py-3 font-bold"
              >
                {isSubmittingPackage ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {t('ModelProfile.dialog.package.processing')}
                  </div>
                ) : (
                  <>
                    {t('ModelProfile.dialog.package.confirm')}
                    <ArrowRight className="mr-2 w-4 h-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}