// src/app/dashboard/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Order, RawOrder } from '@/types'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import Navigation from '@/components/dashboards/Navigation';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Calendar,
  User,
  DollarSign,
  Package,
  Sparkles,
  Crown,
  Download,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  ShoppingCart
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const statusStyles = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const getStatusTranslation = (status: Order['orderStatus'], t: (key: string) => string): string => {
  switch (status) {
    case 'completed': return t('Orders.status.completed');
    case 'pending': return t('Orders.status.pending');
    case 'cancelled': return t('Orders.status.cancelled');
    default: return status;
  }
};

// Mobile Order Card Component
const MobileOrderCard = ({ order, t, currency, formatDate }: { 
  order: Order; 
  t: (key: string) => string;
  currency: string;
  formatDate: (date: string) => string;
}) => {
  return (
    <Card className="mb-3 bg-white/80 backdrop-blur-sm border-rose-200 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="font-bold text-rose-900 text-base">#{order.orderId}</p>
            <p className="text-rose-600 text-xs mt-1 flex items-center">
              <Calendar className="w-3 h-3 ml-1.5" />
              {formatDate(order.orderDate)}
            </p>
          </div>
          <Badge className={`${statusStyles[order.orderStatus]} text-[10px] px-2 py-1 rounded-lg font-medium`}>
            {getStatusTranslation(order.orderStatus, t)}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg">
            <User className="w-3 h-3 ml-1.5 text-rose-500" />
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex items-center text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg">
            <Package className="w-3 h-3 ml-1.5 text-rose-500" />
            <span>{order.products}</span>
          </div>
          <div className="flex items-center text-base font-bold text-rose-900 bg-gradient-to-r from-rose-50 to-pink-50 p-2.5 rounded-lg">
            <DollarSign className="w-4 h-4 ml-1.5 text-rose-600" />
            <span>{order.totalAmount.toFixed(2)} {currency}</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-rose-100">
          <Link href={`/dashboard/orders/${order.orderId}`} className="block">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs h-9 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg"
            >
              <Eye className="w-3 h-3 ml-1.5" />
              {t('Orders.viewDetails')}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrdersPage() {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<RawOrder[]>('/merchants/orders');

      const ordersData: Order[] = response.data.map(order => ({
        ...order,
        totalAmount: typeof order.totalAmount === 'string'
          ? parseFloat(order.totalAmount) || 0
          : order.totalAmount,
      }));

      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to fetch orders', error);
      toast.error(t('Orders.toast.fetchError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const exportOrders = () => {
    toast.info(t('Orders.toast.exportPreparing'));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const currency = i18n.language === 'ar' ? 'ر.س' : 'SAR';

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.orderId.toString().includes(searchTerm) ||
                         order.products.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === 'pending').length,
    completed: orders.filter(o => o.orderStatus === 'completed').length,
    cancelled: orders.filter(o => o.orderStatus === 'cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.totalAmount, 0),
  };

  const isRTL = i18n.language === 'ar';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-rose-50 to-white p-3 sm:p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <Navigation />
      
      <header className="mb-5 text-center relative">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-2 bg-white rounded-xl shadow-lg">
            <ShoppingCart className="h-6 w-6 text-rose-500" />
          </div>
          <Sparkles className="h-4 w-4 text-rose-300" />
          <Crown className="h-4 w-4 text-rose-300" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
          {t('Orders.title')}
        </h1>
        <p className="text-rose-700 text-sm sm:text-base max-w-md mx-auto px-2">
          {t('Orders.subtitle')}
        </p>
        <div className="w-20 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-3"></div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-md rounded-xl text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-rose-600 mb-0.5">{stats.total}</div>
            <div className="text-rose-700 text-xs">{t('Orders.stats.total')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-md rounded-xl text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-amber-600 mb-0.5">{stats.pending}</div>
            <div className="text-amber-700 text-xs">{t('Orders.stats.pending')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-md rounded-xl text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-green-600 mb-0.5">{stats.completed}</div>
            <div className="text-green-700 text-xs">{t('Orders.stats.completed')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-md rounded-xl text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-red-600 mb-0.5">{stats.cancelled}</div>
            <div className="text-red-700 text-xs">{t('Orders.stats.cancelled')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-md rounded-xl text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-purple-600 mb-0.5">
              {new Intl.NumberFormat(i18n.language, {
                style: 'currency',
                currency: 'SAR',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }).format(stats.totalRevenue)}
            </div>
            <div className="text-purple-700 text-xs">{t('Orders.stats.totalRevenue')}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-xl mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-rose-400" />
              <Input
                placeholder={t('Orders.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 border-rose-200 focus:border-rose-400 rounded-lg bg-rose-50/50 text-sm h-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:hidden">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg bg-rose-50 border-rose-200 text-xs py-2 px-2.5 focus:border-rose-400 h-9"
                >
                  <option value="all">{t('Orders.filters.all')}</option>
                  <option value="pending">{t('Orders.status.pending')}</option>
                  <option value="completed">{t('Orders.status.completed')}</option>
                  <option value="cancelled">{t('Orders.status.cancelled')}</option>
                </select>
              </div>
              
              <div className="hidden sm:flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg">
                <Button 
                  size="sm" 
                  variant={statusFilter === 'all' ? 'default' : 'ghost'} 
                  onClick={() => setStatusFilter('all')}
                  className="rounded-md text-xs h-8 px-2"
                >
                  {t('Orders.filters.allOrders')}
                </Button>
                <Button 
                  size="sm" 
                  variant={statusFilter === 'pending' ? 'default' : 'ghost'} 
                  onClick={() => setStatusFilter('pending')}
                  className="rounded-md text-xs h-8 px-2"
                >
                  {t('Orders.status.pending')}
                </Button>
                <Button 
                  size="sm" 
                  variant={statusFilter === 'completed' ? 'default' : 'ghost'} 
                  onClick={() => setStatusFilter('completed')}
                  className="rounded-md text-xs h-8 px-2"
                >
                  {t('Orders.status.completed')}
                </Button>
                <Button 
                  size="sm" 
                  variant={statusFilter === 'cancelled' ? 'default' : 'ghost'} 
                  onClick={() => setStatusFilter('cancelled')}
                  className="rounded-md text-xs h-8 px-2"
                >
                  {t('Orders.status.cancelled')}
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-1.5">
              <Button 
                variant="outline" 
                onClick={exportOrders}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs px-2.5 py-1.5 h-8"
              >
                <Download className="w-3 h-3 ml-1" />
                {t('Orders.actions.export')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs px-2.5 py-1.5 h-8"
              >
                <RefreshCw className={`w-3 h-3 ml-1 ${refreshing ? 'animate-spin' : ''}`} />
                {t('Orders.actions.refresh')}
              </Button>
              <Link href="/dashboard/orders/new">
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg text-xs px-2.5 py-1.5 h-8">
                  <PlusCircle className="w-3 h-3 ml-1" />
                  {t('Orders.actions.newOrder')}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="block lg:hidden">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500 mx-auto mb-2"></div>
            <p className="text-rose-700 font-medium text-xs">{t('Orders.loading')}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-xl text-center py-8">
            <CardContent>
              <div className="p-2 bg-rose-100 rounded-xl inline-block mb-2">
                <Package className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-base font-bold text-rose-800 mb-1">{t('Orders.noOrders')}</h3>
              <p className="text-rose-600 text-xs px-4 mb-3">
                {searchTerm || statusFilter !== 'all' 
                  ? t('Orders.noResults')
                  : t('Orders.empty')
                }
              </p>
              {(searchTerm || statusFilter !== 'all') && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs px-3 py-1.5 h-8"
                >
                  {t('Orders.clearFilters')}
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div>
            {filteredOrders.map((order) => (
              <MobileOrderCard
                key={order.orderId}
                order={order}
                t={t}
                currency={currency}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>

      <Card className="hidden lg:block bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-1.5 text-base font-bold">
                <ShoppingCart className="w-4 h-4" />
                {t('Orders.table.title')}
              </CardTitle>
              <CardDescription className="text-pink-100 text-xs">
                {t('Orders.table.description', { count: filteredOrders.length })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-2 py-0.5">
              {t('Orders.common.orders', { count: filteredOrders.length })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                  <TableHead className="text-rose-800 font-bold text-xs px-3 py-2.5">{t('Orders.table.orderId')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-xs px-3 py-2.5">{t('Orders.table.customer')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-xs px-3 py-2.5">{t('Orders.table.date')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-xs px-3 py-2.5">{t('Orders.table.status')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-xs px-3 py-2.5">{t('Orders.table.amount')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-left text-xs px-3 py-2.5">{t('Orders.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-500 mb-2"></div>
                        <p className="text-rose-700 font-medium text-xs">{t('Orders.loading')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <Package className="w-12 h-12 text-rose-300 mb-2.5" />
                        <h3 className="font-bold text-base text-rose-800 mb-1">{t('Orders.noOrders')}</h3>
                        <p className="text-rose-600 text-xs max-w-[200px] px-2 mb-3">
                          {searchTerm || statusFilter !== 'all' 
                            ? t('Orders.noResults')
                            : t('Orders.empty')
                          }
                        </p>
                        {(searchTerm || statusFilter !== 'all') && (
                          <Button 
                            variant="outline" 
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('all');
                            }}
                            className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs px-3 py-1.5 h-8"
                          >
                            {t('Orders.clearFilters')}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.orderId} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                      <TableCell className="px-3 py-2.5">
                        <div className="font-bold text-rose-900 text-sm">#{order.orderId}</div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                            <User className="w-3 h-3" />
                          </div>
                          <div className="font-medium text-rose-900 text-sm">{order.customerName}</div>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="text-rose-600 text-xs flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.orderDate)}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <Badge className={`${statusStyles[order.orderStatus]} flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-lg font-medium`}>
                          {getStatusTranslation(order.orderStatus, t)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="font-bold text-rose-600 text-sm">
                          {new Intl.NumberFormat(i18n.language, {
                            style: 'currency',
                            currency: 'SAR',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          }).format(order.totalAmount)}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-left">
                        <Link href={`/dashboard/orders/${order.orderId}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-lg text-[10px] h-7 px-2"
                          >
                            <Eye className="w-2.5 h-2.5 ml-1" />
                            {t('Orders.viewDetails')}
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}