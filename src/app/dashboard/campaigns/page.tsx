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

// --- Types ---
interface CampaignItem {
  id: number; // flash_sale_product id
  status: 'pending' | 'accepted' | 'rejected';
  discount_percentage: string;
  flash_price: string;
  total_quantity: number;
  sold_quantity: number;
  campaign_title: string;
  start_time: string;
  end_time: string;
  product_name: string;
  product_image: string; // Ensure backend sends this
  variant_color: string;
  original_price: string;
}

export default function MerchantCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // --- Fetch Data ---
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      // Assuming route is /api/flash-sale/merchant based on previous context
      const res = await api.get('/flash-sale/merchant'); 
      setCampaigns(res.data);
    } catch (error) {
      console.error("Failed to load campaigns", error);
      toast.error("Failed to load campaign invitations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // --- Handlers ---
  const handleResponse = async (id: number, status: 'accepted' | 'rejected') => {
    setProcessingId(id);
    try {
      await api.put(`/flash-sale/merchant/${id}/respond`, { status });
      
      // Optimistic Update
      setCampaigns(prev => prev.map(c => 
        c.id === id ? { ...c, status } : c
      ));
      
      if (status === 'accepted') {
        toast.success("Campaign joined successfully!");
      } else {
        toast.info("Campaign invitation rejected.");
      }
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  // --- Helpers ---
  const getCampaignStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now > endDate) return { label: 'Expired', color: 'bg-gray-100 text-gray-500' };
    if (now >= startDate) return { label: 'Live Now', color: 'bg-rose-100 text-rose-600 animate-pulse' };
    return { label: 'Upcoming', color: 'bg-blue-50 text-blue-600' };
  };

  // --- Render Components ---
  const CampaignCard = ({ item }: { item: CampaignItem }) => {
    const campStatus = getCampaignStatus(item.start_time, item.end_time);
    const discount = parseFloat(item.discount_percentage);
    
    return (
      <Card className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row">
          
          {/* Left: Product Image & Basic Info */}
          <div className="w-full sm:w-48 h-48 sm:h-auto relative bg-gray-100 shrink-0">
             <Image 
                src={item.product_image || '/placeholder.png'} 
                alt={item.product_name} 
                fill 
                className="object-cover"
             />
             <div className="absolute top-2 left-2">
                <Badge className={campStatus.color}>{campStatus.label}</Badge>
             </div>
          </div>

          {/* Right: Details & Action */}
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{item.campaign_title}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(item.start_time), 'MMM dd')} - {format(new Date(item.end_time), 'MMM dd, yyyy')}
                    </div>
                </div>
                {item.status === 'pending' && (
                    <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Action Required</Badge>
                )}
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-700 text-sm">{item.product_name} ({item.variant_color})</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <div>
                        <p className="text-xs text-gray-500">Original Price</p>
                        <p className="font-medium line-through text-gray-400">{item.original_price} SAR</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                    <div>
                        <p className="text-xs text-gray-500">Your Discount</p>
                        <p className="font-bold text-rose-600">-{discount}%</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                    <div>
                        <p className="text-xs text-gray-500">Flash Price</p>
                        <p className="font-bold text-gray-900">{item.flash_price} SAR</p>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex gap-4 text-xs text-gray-600">
                    <span><strong>Quantity Commit:</strong> {item.total_quantity} units</span>
                    {item.status === 'accepted' && (
                        <span><strong>Sold:</strong> {item.sold_quantity}</span>
                    )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex justify-end gap-3">
                {item.status === 'pending' ? (
                    <>
                        <Button 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleResponse(item.id, 'rejected')}
                            disabled={processingId === item.id}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleResponse(item.id, 'accepted')}
                            disabled={processingId === item.id}
                        >
                            {processingId === item.id ? 'Processing...' : (
                                <><CheckCircle2 className="w-4 h-4 mr-2" /> Accept & Join</>
                            )}
                        </Button>
                    </>
                ) : item.status === 'accepted' ? (
                    <div className="flex items-center gap-2 text-green-600 font-medium bg-green-50 px-4 py-2 rounded-lg">
                        <CheckCircle2 className="w-5 h-5" /> Joined
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-gray-500 font-medium bg-gray-100 px-4 py-2 rounded-lg">
                        <XCircle className="w-5 h-5" /> Rejected
                    </div>
                )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-8 h-8 text-rose-500 fill-rose-500" />
          Campaign Invitations
        </h1>
        <p className="text-gray-500 mt-1">Review and manage your participation in flash sale campaigns.</p>
      </div>

      {/* Content */}
      <Tabs defaultValue="pending" className="w-full">
        <div className="flex items-center justify-between mb-6">
            <TabsList>
                <TabsTrigger value="pending">Invites ({campaigns.filter(c => c.status === 'pending').length})</TabsTrigger>
                <TabsTrigger value="accepted">Active ({campaigns.filter(c => c.status === 'accepted').length})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
        </div>

        {loading ? (
            <div className="space-y-4">
                {[1, 2].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
            </div>
        ) : (
            <>
                <TabsContent value="pending" className="space-y-4">
                    {campaigns.filter(c => c.status === 'pending').length === 0 ? (
                        <EmptyState text="No pending invitations." />
                    ) : (
                        campaigns.filter(c => c.status === 'pending').map(item => (
                            <CampaignCard key={item.id} item={item} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="accepted" className="space-y-4">
                    {campaigns.filter(c => c.status === 'accepted').length === 0 ? (
                        <EmptyState text="You haven't joined any campaigns yet." />
                    ) : (
                        campaigns.filter(c => c.status === 'accepted').map(item => (
                            <CampaignCard key={item.id} item={item} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="rejected" className="space-y-4">
                    {campaigns.filter(c => c.status === 'rejected').length === 0 ? (
                        <EmptyState text="No rejected campaigns." />
                    ) : (
                        campaigns.filter(c => c.status === 'rejected').map(item => (
                            <CampaignCard key={item.id} item={item} />
                        ))
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
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Filter className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-gray-500 font-medium">{text}</p>
    </div>
);