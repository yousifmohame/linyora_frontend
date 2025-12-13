'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';


// --- Types ---
interface CampaignItem {
  id: number;
  status: 'pending' | 'accepted' | 'rejected';
  discount_percentage: string;
  flash_price: string;
  total_quantity: number;
  sold_quantity: number;
  campaign_title: string;
  start_time: string;
  end_time: string;
  product_name: string;
  image: string;
  variant_color: string;
  original_price: string;
}

export default function MerchantCampaignsPage() {
  const { t, i18n } = useTranslation();
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Handle RTL direction if needed (optional but recommended)
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';

  // --- Fetch Data ---
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await api.get('/flash-sale/merchant'); 
      setCampaigns(res.data || []);
    } catch (error) {
      console.error("Failed to load campaigns", error);
      toast.error(t('MerchantCampaigns.errors.load_failed'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [i18n.language]);

  // --- Handlers ---
  const handleResponse = async (id: number, status: 'accepted' | 'rejected') => {
    setProcessingId(id);
    try {
      await api.put(`/flash-sale/merchant/${id}/respond`, { status });
      
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, status } : c
      ));
      
      if (status === 'accepted') {
        toast.success(t('MerchantCampaigns.toasts.joined_success'));
      } else {
        toast.info(t('MerchantCampaigns.toasts.rejected'));
      }
    } catch (error) {
      toast.error(t('MerchantCampaigns.toasts.update_failed'));
    } finally {
      setProcessingId(null);
    }
  };

  // --- Helpers ---
  const getCampaignStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now > endDate) {
      return { 
        label: t('MerchantCampaigns.status.expired'), 
        color: 'bg-gray-100 text-gray-600' 
      };
    }
    if (now >= startDate) {
      return { 
        label: t('MerchantCampaigns.status.live_now'), 
        color: 'bg-amber-100 text-amber-700' 
      };
    }
    return { 
      label: t('MerchantCampaigns.status.upcoming'), 
      color: 'bg-blue-100 text-blue-700' 
    };
  };

  // --- Render Components ---
  const CampaignCard = ({ item }: { item: CampaignItem }) => {
    const campStatus = getCampaignStatus(item.start_time, item.end_time);
    const discount = parseFloat(item.discount_percentage);
    
    return (
      <Card 
        className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
        dir={dir}
      >
        <div className={`flex flex-col ${isRTL ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
          
          {/* Product Image */}
          <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-gray-100 shrink-0">
            <Image 
              src={item.image || '/placeholder.png'} 
              alt={item.product_name} 
              fill 
              className="object-cover"
            />
            <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'}`}>
              <Badge className={`${campStatus.color} px-2 py-1 text-xs font-medium`}>
                {campStatus.label}
              </Badge>
            </div>
          </div>

          {/* Details & Actions */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.campaign_title}</h3>
                  <div className={`flex items-center gap-2 text-sm text-gray-500 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    {format(new Date(item.start_time), 'MMM dd')} – {format(new Date(item.end_time), 'MMM dd, yyyy')}
                  </div>
                </div>
                {item.status === 'pending' && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {t('MerchantCampaigns.action_required')}
                  </Badge>
                )}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700 text-sm">
                    {item.product_name} ({item.variant_color})
                  </span>
                </div>
                <div className={`flex items-center gap-3 mt-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="text-center min-w-[80px]">
                    <p className="text-xs text-gray-500">{t('MerchantCampaigns.original_price')}</p>
                    <p className="font-medium line-through text-gray-400">{item.original_price} SAR</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                  <div className="text-center min-w-[80px]">
                    <p className="text-xs text-gray-500">{t('MerchantCampaigns.your_discount')}</p>
                    <p className="font-bold text-amber-700">-{discount}%</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-gray-300 ${isRTL ? 'rotate-180' : ''}`} />
                  <div className="text-center min-w-[80px]">
                    <p className="text-xs text-gray-500">{t('MerchantCampaigns.flash_price')}</p>
                    <p className="font-bold text-gray-900">{item.flash_price} SAR</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span><strong>{t('MerchantCampaigns.quantity_commit')}:</strong> {item.total_quantity} {t('MerchantCampaigns.units')}</span>
                  {item.status === 'accepted' && (
                    <span><strong>{t('MerchantCampaigns.sold')}:</strong> {item.sold_quantity}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`mt-6 flex ${isRTL ? 'justify-start' : 'justify-end'} gap-3 flex-wrap`}>
              {item.status === 'pending' ? (
                <>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => handleResponse(item.id, 'rejected')}
                    disabled={processingId === item.id}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    {t('MerchantCampaigns.reject')}
                  </Button>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => handleResponse(item.id, 'accepted')}
                    disabled={processingId === item.id}
                  >
                    {processingId === item.id ? t('MerchantCampaigns.processing') : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        {t('MerchantCampaigns.accept_join')}
                      </>
                    )}
                  </Button>
                </>
              ) : item.status === 'accepted' ? (
                <div className="flex items-center gap-2 text-amber-700 font-medium bg-amber-50 px-4 py-2 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                  {t('MerchantCampaigns.joined')}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  {t('MerchantCampaigns.rejected_status')}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div 
      className="p-4 sm:p-6 max-w-5xl mx-auto space-y-8" 
      dir={dir}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-7 h-7 text-amber-600" />
          {t('MerchantCampaigns.title')}
        </h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">
          {t('MerchantCampaigns.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <TabsList className={isRTL ? 'flex-row-reverse' : ''}>
            <TabsTrigger value="pending">
              {t('MerchantCampaigns.tabs.pending')} ({campaigns.filter(c => c.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              {t('MerchantCampaigns.tabs.accepted')} ({campaigns.filter(c => c.status === 'accepted').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t('MerchantCampaigns.tabs.rejected')}
            </TabsTrigger>
          </TabsList>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
          </div>
        ) : (
          <>
            <TabsContent value="pending" className="space-y-4 mt-0">
              {campaigns.filter(c => c.status === 'pending').length === 0 ? (
                <EmptyState text={t('MerchantCampaigns.empty.pending')} />
              ) : (
                campaigns
                  .filter(c => c.status === 'pending')
                  .map(item => <CampaignCard key={item.id} item={item} />)
              )}
            </TabsContent>

            <TabsContent value="accepted" className="space-y-4 mt-0">
              {campaigns.filter(c => c.status === 'accepted').length === 0 ? (
                <EmptyState text={t('MerchantCampaigns.empty.accepted')} />
              ) : (
                campaigns
                  .filter(c => c.status === 'accepted')
                  .map(item => <CampaignCard key={item.id} item={item} />)
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4 mt-0">
              {campaigns.filter(c => c.status === 'rejected').length === 0 ? (
                <EmptyState text={t('MerchantCampaigns.empty.rejected')} />
              ) : (
                campaigns
                  .filter(c => c.status === 'rejected')
                  .map(item => <CampaignCard key={item.id} item={item} />)
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

const EmptyState = ({ text }: { text: string }) => (
  <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
      <Filter className="w-7 h-7 text-gray-300" />
    </div>
    <p className="text-gray-500 font-medium text-center px-4">{text}</p>
  </div>
);