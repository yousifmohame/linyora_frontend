'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Package, 
  DollarSign, 
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Eye,
  Sparkles,
  Crown,
  ShoppingBag,
  MapPin,
  Phone,
  CreditCard, // ✨ أيقونة البطاقة
  Wallet // ✨ أيقونة المحفظة/الدفع
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/dashboards/Navigation';

// Interfaces
interface OrderDetails {
  id: number;
  status: string;
  created_at: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  totalAmount: number;
  payment_status: string; // ✨ حالة الدفع
  payment_method: string; // ✨ طريقة الدفع
}

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
  image?: string;
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
    } catch (error) {
      toast.error(t('OrderDetails.toast.updateError'));
      console.error("Error updating order status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const statusMap: Record<string, { label: string; className: string; icon: any }> = {
      pending: { 
        label: t('OrderDetails.status.pending'), 
        className: 'bg-amber-100 text-amber-700 border-amber-200',
        icon: Clock
      },
      processing: { 
        label: t('OrderDetails.status.processing'), 
        className: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: RefreshCw
      },
      shipped: { 
        label: t('OrderDetails.status.shipped'), 
        className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Truck
      },
      completed: { 
        label: t('OrderDetails.status.completed'), 
        className: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle
      },
      cancelled: { 
        label: t('OrderDetails.status.cancelled'), 
        className: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // ✨ دالة مساعدة لتنسيق حالة الدفع
  const getPaymentStatusConfig = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
        paid: { label: t('OrderDetails.paymentStatus.paid', { defaultValue: 'مدفوع' }), className: 'text-green-600 bg-green-50 border-green-200' },
        unpaid: { label: t('OrderDetails.paymentStatus.unpaid', { defaultValue: 'غير مدفوع' }), className: 'text-amber-600 bg-amber-50 border-amber-200' },
        refunded: { label: t('OrderDetails.paymentStatus.refunded', { defaultValue: 'مسترجع' }), className: 'text-red-600 bg-red-50 border-red-200' },
    };
    return map[status] || map.unpaid;
  };

  // ✨ دالة مساعدة لتنسيق طريقة الدفع
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 font-medium">{t('OrderDetails.loading')}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-rose-50 to-white flex items-center justify-center ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="text-center">
          <div className="p-4 bg-rose-100 rounded-2xl inline-block mb-4">
            <Package className="w-12 h-12 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-rose-800 mb-2">{t('OrderDetails.notFound.title')}</h3>
          <p className="text-rose-600 mb-6">{t('OrderDetails.notFound.description')}</p>
          <Button 
            onClick={() => router.back()}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
          >
            {t('OrderDetails.backToOrders')}
          </Button>
        </div>
      </div>
    );
  }

  const { details, items } = order;
  const currentStatus = getStatusConfig(details.status);
  const StatusIcon = currentStatus.icon;
  const totalAmount = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const paymentStatusConfig = getPaymentStatusConfig(details.payment_status);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-rose-50 to-white p-4 sm:p-6 lg:p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <Navigation />
      
      <div className="mb-8">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
        >
          <ArrowLeft className="ml-2 h-4 w-4" />
          {t('OrderDetails.backToOrders')}
        </Button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
              <ShoppingBag className="h-8 w-8 text-rose-500" />
            </div>
            <Sparkles className="h-6 w-6 text-rose-300" />
            <Crown className="h-6 w-6 text-rose-300" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
            {t('OrderDetails.title', { id: details.id })}
          </h1>
          <p className="text-rose-700 text-lg max-w-2xl mx-auto">
            {t('OrderDetails.subtitle')}
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-3xl">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="w-6 h-6" />
                {t('OrderDetails.statusCard.title')}
              </CardTitle>
              <CardDescription className="text-pink-100">
                {t('OrderDetails.statusCard.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${currentStatus.className}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-rose-800 font-semibold">{t('OrderDetails.statusCard.current')}</p>
                    <Badge className={`${currentStatus.className} text-sm px-3 py-1.5 rounded-xl mt-1`}>
                      {currentStatus.label}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-48 border-rose-200 focus:border-rose-400 rounded-xl">
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
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
                  >
                    {isUpdating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin ml-2" />
                        {t('OrderDetails.statusCard.updating')}
                      </>
                    ) : (
                      t('OrderDetails.statusCard.update')
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-3xl">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Package className="w-6 h-6" />
                {t('OrderDetails.productsCard.title')}
              </CardTitle>
              <CardDescription className="text-pink-100">
                {t('OrderDetails.productsCard.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-rose-900">{item.name}</p>
                        <p className="text-rose-600 text-sm">{t('OrderDetails.productsCard.quantity', { count: item.quantity })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-900 text-lg">
                        {formatPrice(Number(item.price) * item.quantity)}
                      </p>
                      <p className="text-rose-600 text-sm">
                        {t('OrderDetails.productsCard.unitPrice', { price: formatPrice(Number(item.price)) })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-3xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <User className="w-5 h-5" />
                {t('OrderDetails.customerCard.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">{details.customerName}</p>
                    <p className="text-blue-600 text-sm">{t('OrderDetails.customerCard.name')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">{details.customerEmail}</p>
                    <p className="text-green-600 text-sm">{t('OrderDetails.customerCard.email')}</p>
                  </div>
                </div>
                {details.customerPhone && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <Phone className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="font-semibold text-purple-900">{details.customerPhone}</p>
                      <p className="text-purple-600 text-sm">{t('OrderDetails.customerCard.phone')}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary & Payment */}
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-3xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <DollarSign className="w-5 h-5" />
                {t('OrderDetails.summaryCard.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* التاريخ */}
                <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
                  <Calendar className="w-5 h-5 text-rose-600" />
                  <div>
                    <p className="font-semibold text-rose-900">{formatDate(details.created_at)}</p>
                    <p className="text-rose-600 text-sm">{t('OrderDetails.summaryCard.orderDate')}</p>
                  </div>
                </div>

                {/* عدد العناصر */}
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="font-semibold text-amber-900">
                      {t('OrderDetails.summaryCard.totalItems', { count: items.length })}
                    </p>
                    <p className="text-amber-600 text-sm">{t('OrderDetails.summaryCard.items')}</p>
                  </div>
                </div>

                {/* ✨ طريقة الدفع */}
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-indigo-900">
                      {getPaymentMethodLabel(details.payment_method)}
                    </p>
                    <p className="text-indigo-600 text-sm">
                      {t('OrderDetails.summaryCard.paymentMethod', {defaultValue: 'طريقة الدفع'})}
                    </p>
                  </div>
                </div>

                {/* ✨ حالة الدفع */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Wallet className="w-5 h-5 text-gray-600" />
                  <div>
                    <Badge variant="outline" className={`${paymentStatusConfig.className} mb-1 border`}>
                      {paymentStatusConfig.label}
                    </Badge>
                    <p className="text-gray-600 text-sm">
                      {t('OrderDetails.summaryCard.paymentStatus', {defaultValue: 'حالة الدفع'})}
                    </p>
                  </div>
                </div>

                {/* الإجمالي */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                  <DollarSign className="w-5 h-5 text-rose-600" />
                  <div>
                    <p className="font-bold text-rose-900 text-lg">
                      {formatPrice(totalAmount)}
                    </p>
                    <p className="text-rose-600 text-sm">{t('OrderDetails.summaryCard.totalAmount')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {details.shippingAddress && (
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-3xl">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5" />
                  {t('OrderDetails.shippingCard.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">{details.shippingAddress}</p>
                    <p className="text-orange-600 text-sm">{t('OrderDetails.shippingCard.address')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}