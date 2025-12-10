'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter 
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ArrowLeft, User, Mail, Calendar, Package, DollarSign, Truck,
  CheckCircle, Clock, XCircle, RefreshCw, Eye, Sparkles, Crown,
  ShoppingBag, MapPin, Phone, CreditCard, Wallet, ExternalLink, Copy
} from 'lucide-react';
import Navigation from '@/components/dashboards/Navigation';

// Interfaces
interface OrderDetails {
  id: number;
  status: string;
  created_at: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string; // 👈 رقم الهاتف
  shippingAddress?: string;
  totalAmount: number;
  payment_status: string;
  payment_method: string;
  is_dropshipping?: boolean;
}

interface OrderItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: string;
  image?: string;
  sku?: string;
}

interface OrderData {
  details: OrderDetails;
  items: OrderItem[];
}

export default function MerchantOrderDetailsPage() {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (!orderId) return;

    const fetchOrderDetails = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/merchants/orders/${orderId}`);
        setOrder(data);
        setNewStatus(data.details.status);
      } catch (error) {
        toast.error(t('OrderDetails.toast.fetchError'));
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, t]);

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order?.details.status) {
      toast.info(t('OrderDetails.toast.noChange'));
      return;
    }
    
    setIsUpdating(true);
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(t('OrderDetails.toast.updateSuccess'));

      if (order) {
        setOrder({ 
          ...order, 
          details: { ...order.details, status: newStatus } 
        });
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      if (error.response && error.response.status === 403) {
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="font-bold">⛔ {t('Access Denied', {defaultValue: 'غير مسموح بالتعديل'})}</span>
            <span className="text-sm">
              {t('DropshipError', {
                defaultValue: 'لا يمكنك تغيير حالة هذا الطلب لأنه طلب دروبشيبينغ. المورد هو المسؤول الوحيد عن تحديث حالة الشحن.'
              })}
            </span>
          </div>,
          { duration: 6000 }
        );
      } else {
        toast.error(t('OrderDetails.toast.updateError'));
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('Copied', { defaultValue: 'تم النسخ' }));
  };

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      pending: { label: t('OrderDetails.status.pending'), className: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
      processing: { label: t('OrderDetails.status.processing'), className: 'bg-blue-100 text-blue-700 border-blue-200', icon: RefreshCw },
      shipped: { label: t('OrderDetails.status.shipped'), className: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
      completed: { label: t('OrderDetails.status.completed'), className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
      cancelled: { label: t('OrderDetails.status.cancelled'), className: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getPaymentStatusConfig = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      paid: { label: t('OrderDetails.paymentStatus.paid', { defaultValue: 'مدفوع' }), className: 'text-green-600 bg-green-50 border-green-200' },
      unpaid: { label: t('OrderDetails.paymentStatus.unpaid', { defaultValue: 'غير مدفوع' }), className: 'text-amber-600 bg-amber-50 border-amber-200' },
      refunded: { label: t('OrderDetails.paymentStatus.refunded', { defaultValue: 'مسترجع' }), className: 'text-red-600 bg-red-50 border-red-200' },
    };
    return map[status] || map.unpaid;
  };

  const getPaymentMethodLabel = (method: string) => {
      const map: Record<string, string> = {
          card: t('OrderDetails.paymentMethod.card', { defaultValue: 'بطاقة ائتمان' }),
          cod: t('OrderDetails.paymentMethod.cod', { defaultValue: 'دفع عند الاستلام' }),
          wallet: t('OrderDetails.paymentMethod.wallet', { defaultValue: 'المحفظة' }),
      };
      return map[method] || method;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency', currency: 'SAR', minimumFractionDigits: 2
    }).format(price);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div></div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  const { details, items } = order;
  const currentStatus = getStatusConfig(details.status);
  const StatusIcon = currentStatus.icon;
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const paymentStatusConfig = getPaymentStatusConfig(details.payment_status);

  return (
    <div className={`min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-200/20 rounded-full mix-blend-multiply filter blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200/20 rounded-full mix-blend-multiply filter blur-3xl -z-10"></div>
      
      <Navigation />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-2 pl-0 hover:bg-transparent text-slate-500 hover:text-slate-800">
              <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('OrderDetails.backToOrders')}
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{t('OrderDetails.title', { id: details.id })}</h1>
              {details.is_dropshipping && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">Dropshipping</Badge>
              )}
            </div>
            <p className="text-slate-500 mt-1">{formatDate(details.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Products Card */}
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                  <Package className="w-5 h-5 text-rose-500" />
                  {t('OrderDetails.productsCard.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-start gap-4">
                        <Link href={`/dashboard/products/${item.productId}`} className="shrink-0 relative">
                           <div className="w-20 h-20 rounded-lg border border-slate-200 bg-white overflow-hidden">
                             {item.image ? (
                               <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
                             ) : (
                               <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300">
                                 <Package className="w-8 h-8" />
                               </div>
                             )}
                           </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                                <Link href={`/products/${item.productId}`} className="block">
                                  <h4 className="font-medium text-slate-900 truncate hover:text-rose-600 transition-colors flex items-center gap-2">
                                    {item.name}
                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400"/>
                                  </h4>
                                </Link>
                                <p className="text-sm text-slate-500 mt-1">
                                  {t('OrderDetails.productsCard.quantity', { count: item.quantity })} × {formatPrice(Number(item.price))}
                                </p>
                            </div>
                            <p className="font-semibold text-slate-900">{formatPrice(Number(item.price) * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-600">{t('Total', {defaultValue: 'المجموع الكلي'})}</span>
                 <span className="text-xl font-bold text-rose-600">{formatPrice(totalAmount)}</span>
              </CardFooter>
            </Card>

            {/* Status Card */}
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-800">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  {t('OrderDetails.statusCard.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${currentStatus.className}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">{t('OrderDetails.statusCard.current')}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.className} bg-opacity-10 border`}>
                        {currentStatus.label}
                      </span>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-full sm:w-[200px] h-10 border-slate-200 focus:ring-rose-500">
                        <SelectValue placeholder={t('OrderDetails.statusCard.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t('OrderDetails.status.pending')}</SelectItem>
                        <SelectItem value="processing">{t('OrderDetails.status.processing')}</SelectItem>
                        <SelectItem value="shipped">{t('OrderDetails.status.shipped')}</SelectItem>
                        <SelectItem value="completed">{t('OrderDetails.status.completed')}</SelectItem>
                        <SelectItem value="cancelled">{t('OrderDetails.status.cancelled')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleStatusUpdate} 
                      disabled={isUpdating || newStatus === details.status}
                      className="bg-slate-900 hover:bg-slate-800 text-white min-w-[120px]"
                    >
                      {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : t('OrderDetails.statusCard.update')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            
            {/* Customer Info Card (Updated with Phone) */}
            <Card className="border-none shadow-sm bg-white rounded-2xl">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                  <User className="w-4 h-4 text-slate-500" />
                  {t('OrderDetails.customerCard.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                 <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 bg-slate-100 border border-slate-200">
                        <AvatarFallback className="text-slate-600">{details.customerName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-slate-900">{details.customerName}</p>
                        <p className="text-xs text-slate-500">ID: #{details.id}</p>
                    </div>
                 </div>
                 
                 <div className="h-px bg-slate-100"></div>
                 
                 <div className="space-y-4">
                    {/* Email */}
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400"><Mail className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-400 mb-0.5">{t('Email', {defaultValue: 'البريد الإلكتروني'})}</p>
                            <p className="text-sm font-medium text-slate-700 truncate" title={details.customerEmail}>{details.customerEmail}</p>
                        </div>
                    </div>

                    {/* Phone Number (NEW ✨) */}
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400"><Phone className="w-4 h-4" /></div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 mb-0.5">{t('Phone', {defaultValue: 'رقم الهاتف'})}</p>
                            {details.customerPhone ? (
                                <div className="flex items-center gap-2">
                                  <a 
                                    href={`tel:${details.customerPhone}`} 
                                    className="text-sm font-medium text-rose-600 hover:text-rose-700 hover:underline dir-ltr block"
                                  >
                                    {details.customerPhone}
                                  </a>
                                  <button 
                                    onClick={() => copyToClipboard(details.customerPhone!)} 
                                    className="text-slate-400 hover:text-slate-600"
                                    title={t('Copy', {defaultValue: 'نسخ'})}
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                            ) : (
                                <span className="text-sm text-slate-400 italic">{t('Not provided', {defaultValue: 'غير متوفر'})}</span>
                            )}
                        </div>
                    </div>
                 </div>
              </CardContent>
            </Card>

            {/* Payment & Shipping Summary */}
            <Card className="border-none shadow-sm bg-white rounded-2xl">
               <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-base text-slate-800">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  {t('Payment & Delivery', {defaultValue: 'الدفع والتوصيل'})}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                  {details.shippingAddress && (
                    <div className="flex gap-3">
                        <div className="shrink-0 mt-0.5"><MapPin className="w-5 h-5 text-slate-400" /></div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 mb-1">{t('Shipping Address', {defaultValue: 'عنوان الشحن'})}</p>
                            <p className="text-sm text-slate-500 leading-relaxed">{details.shippingAddress}</p>
                        </div>
                    </div>
                  )}
                  <div className="h-px bg-slate-100"></div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <p className="text-xs text-slate-400 mb-1">{t('Payment Method', {defaultValue: 'طريقة الدفع'})}</p>
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                              <Wallet className="w-4 h-4 text-slate-400" />
                              {getPaymentMethodLabel(details.payment_method)}
                          </div>
                      </div>
                      <div>
                          <p className="text-xs text-slate-400 mb-1">{t('Payment Status', {defaultValue: 'حالة الدفع'})}</p>
                          <Badge variant="outline" className={`${paymentStatusConfig.className} font-normal border-0 px-0 bg-transparent`}>
                             {paymentStatusConfig.label}
                          </Badge>
                      </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}