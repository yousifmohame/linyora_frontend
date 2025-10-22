// app/dashboard/my-orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next'; 
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  Download,
  Sparkles,
  Crown,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Order {
    id: number;
    orderDate: string;
    status: 'pending' | 'completed' | 'cancelled' | 'shipped' | 'processing';
    totalAmount: number;
    itemsCount: number;
    trackingNumber?: string;
}

export default function MyOrdersPage() {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('/customer/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);
    
    const getStatusConfig = (status: Order['status']) => {
        const configs = {
            pending: { 
                variant: 'bg-amber-100 text-amber-800 border-amber-200',
                icon: Clock,
                label: 'قيد الانتظار'
            },
            processing: { 
                variant: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: Package,
                label: 'قيد التجهيز'
            },
            shipped: { 
                variant: 'bg-purple-100 text-purple-800 border-purple-200',
                icon: Truck,
                label: 'تم الشحن'
            },
            completed: { 
                variant: 'bg-green-100 text-green-800 border-green-200',
                icon: CheckCircle,
                label: 'مكتمل'
            },
            cancelled: { 
                variant: 'bg-red-100 text-red-800 border-red-200',
                icon: XCircle,
                label: 'ملغي'
            }
        };
        return configs[status] || configs.pending;
    };

    const getStatusIcon = (status: Order['status']) => {
        const Icon = getStatusConfig(status).icon;
        return <Icon className="w-3 h-3 ml-1" />;
    };

    const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(t('common.locale'), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString(t('common.locale'))
    };
  };

    // إحصائيات سريعة
    const stats = {
        total: orders.length,
        pending: orders.filter(order => order.status === 'pending').length,
        completed: orders.filter(order => order.status === 'completed').length,
        shipped: orders.filter(order => order.status === 'shipped').length,
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse mb-4 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                {t('MyOrdersPage.title')}
              </h1>
              <p className="text-gray-600">{t('MyOrdersPage.subtitle')}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 space-x-reverse">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="border-gray-300 hover:bg-gray-50 transition-colors rounded-2xl"
            >
              <ArrowLeft className="w-4 h-4 ml-2" />
              {t('MyOrdersPage.back')}
            </Button>
            <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
              <Download className="w-4 h-4 ml-2" />
              {t('MyOrdersPage.exportOrders')}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title={t('MyOrdersPage.stats.total')} 
            value={stats.total} 
            icon={<ShoppingBag className="w-5 h-5 text-white" />} 
            color="from-blue-500 to-cyan-600" 
          />
          <StatCard 
            title={t('MyOrdersPage.stats.pending')} 
            value={stats.pending} 
            icon={<Clock className="w-5 h-5 text-white" />} 
            color="from-amber-500 to-orange-600" 
          />
          <StatCard 
            title={t('MyOrdersPage.stats.shipped')} 
            value={stats.shipped} 
            icon={<Truck className="w-5 h-5 text-white" />} 
            color="from-purple-500 to-indigo-600" 
          />
          <StatCard 
            title={t('MyOrdersPage.stats.completed')} 
            value={stats.completed} 
            icon={<CheckCircle className="w-5 h-5 text-white" />} 
            color="from-green-500 to-emerald-600" 
          />
        </div>

        {/* Orders Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-gray-200/50">
            <CardTitle className="flex items-center space-x-2 space-x-reverse text-xl">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>{t('MyOrdersPage.orderHistory')}</span>
            </CardTitle>
            <CardDescription>
              {t('MyOrdersPage.orderHistoryDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-200/50">
                  <TableHead className="font-semibold text-gray-900 py-4">{t('MyOrdersPage.table.orderId')}</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">{t('MyOrdersPage.table.orderDate')}</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">{t('MyOrdersPage.table.status')}</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">{t('MyOrdersPage.table.itemsCount')}</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4">{t('MyOrdersPage.table.total')}</TableHead>
                  <TableHead className="font-semibold text-gray-900 py-4 text-center">{t('MyOrdersPage.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-gray-600">{t('common.loadingOrders')}</p>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('MyOrdersPage.noOrders.title')}</h3>
                      <p className="text-gray-600 mb-6">{t('MyOrdersPage.noOrders.description')}</p>
                      <Link href="/products">
                        <Button className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                          <Sparkles className="w-4 h-4 ml-2" />
                          {t('MyOrdersPage.noOrders.browseProducts')}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const { date, time } = formatDate(order.orderDate);
                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-200/50 last:border-b-0">
                        <TableCell className="py-4">
                          <div className="font-semibold text-gray-900">#{order.id}</div>
                          {order.trackingNumber && (
                            <div className="text-xs text-gray-500 mt-1">
                              {t('MyOrdersPage.tracking')}: {order.trackingNumber}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="text-gray-900">{date}</div>
                          <div className="text-xs text-gray-500 mt-1">{time}</div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`${statusConfig.variant} px-3 py-1.5 rounded-full flex items-center w-fit`}>
                            {getStatusIcon(order.status)}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2 space-x-reverse text-gray-700">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span>{t('MyOrdersPage.itemsCount', { count: order.itemsCount })}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="font-bold text-lg bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                            {Number(order.totalAmount).toFixed(2)} {t('common.currency')}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <Link href={`/dashboard/my-orders/${order.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-xl"
                            >
                              <Eye className="w-4 h-4 ml-2" />
                              {t('MyOrdersPage.viewDetails')}
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Status Legend */}
        <Card className="mt-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2 space-x-reverse">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{t('MyOrdersPage.statusLegend.title')}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {(['pending', 'processing', 'shipped', 'completed', 'cancelled'] as const).map((status) => {
                const config = getStatusConfig(status);
                const Icon = config.icon;
                return (
                  <div key={status} className="flex items-center space-x-2 space-x-reverse p-3 bg-gray-50 rounded-2xl">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{config.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Extract StatCard as a helper component (optional but cleaner)
const StatCard = ({ title, value, icon, color }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string 
}) => (
  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);



