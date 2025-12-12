'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Star, 
  Eye, 
  ArrowRight,
  Terminal
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import Navigation from './Navigation';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AgreementModal from './shared/AgreementModal';
import { toast } from "sonner";

// ================== Interfaces ==================
interface RecentOrder {
  id: number;
  customerName: string;
  status: 'pending' | 'completed' | 'cancelled';
  total: number;
}

interface SalesData {
  date: string;
  sales: number;
}

interface DashboardData {
  totalSales: number;
  totalProducts: number;
  activeProducts: number;
  recentOrders: RecentOrder[];
  averageRating: number;
  totalReviews: number;
  monthlyViews: number;
  weeklySales: SalesData[];
  monthlySales: SalesData[];
}

// ================== RecentOrders Component ==================
const RecentOrders = ({ orders, currency, t }: { orders: RecentOrder[], currency: string, t: (key: string) => string }) => {
  const getStatusVariant = (status: RecentOrder['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusLabel = (status: RecentOrder['status']) => {
    switch (status) {
      case 'completed': return t('merchantDashboard.orders.status.completed');
      case 'pending': return t('merchantDashboard.orders.status.pending');
      case 'cancelled': return t('merchantDashboard.orders.status.cancelled');
      default: return status;
    }
  };

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200/60 hover:border-purple-300 hover:shadow transition-all duration-200 group">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-rose-500 rounded-lg shadow-sm">
              <ShoppingCart className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate text-xs">{order.customerName}</p>
            </div>
          </div>
          <div className="text-left ml-2 min-w-[80px]">
            <p className="font-bold text-gray-900 text-sm">{currency} {order.total.toFixed(2)}</p>
            <Badge className={`mt-1 text-[10px] px-2 py-0.5 rounded-md ${getStatusVariant(order.status)}`}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

// ================== SalesChart Component ==================
const SalesChart = ({ data, currency, t }: { data: { name: string; sales: number }[], currency: string, t: (key: string) => string }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          stroke="#666" 
          fontSize={10}
          tickLine={false} 
          axisLine={false}
          tick={{ fill: '#666' }}
          interval="preserveStartEnd"
        />
        <YAxis 
          stroke="#666" 
          fontSize={10}
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`}
          tick={{ fill: '#666' }}
          width={25}
        />
        <Tooltip
          cursor={{ fill: 'rgba(168, 85, 247, 0.1)' }}
          contentStyle={{ 
            background: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: '10px',
            padding: '6px 10px'
          }}
          formatter={(value: number) => [`${currency} ${value.toFixed(2)}`, t('merchantDashboard.chart.sales')]}
          labelFormatter={(label) => label}
        />
        <Bar 
          dataKey="sales" 
          name={t('merchantDashboard.chart.sales')} 
          fill="url(#salesGradient)" 
          radius={[4, 4, 0, 0]}
          barSize={16}
        />
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.3}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

// ================== StatCard Component ==================
const StatCard = ({ title, value, description, icon: Icon }: {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
}) => {
  return (
    <Card className="shadow-sm border border-gray-200/60 bg-white hover:shadow transition-all duration-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-gray-600 truncate">{title}</p>
          <p className="text-base font-bold text-gray-900 mt-0.5 truncate">{value}</p>
          {description && (
            <p className="text-[9px] text-gray-500 mt-0.5 truncate">{description}</p>
          )}
        </div>
        <div className="p-2 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg flex-shrink-0 ml-2">
          <Icon className="h-3.5 w-3.5 text-white" />
        </div>
      </div>
    </Card>
  );
};

// ================== Main MerchantDashboard Component ==================
export default function MerchantDashboard() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, refetchUser } = useAuth();
  const [error, setError] = useState('');
  const [salesPeriod, setSalesPeriod] = useState<'week' | 'month'>('week');
  const [isAgreementModalOpen, setAgreementModalOpen] = useState(false);

  const isRTL = i18n.language === 'ar';
  const isVerified = user?.verification_status === 'approved';
  const currency = i18n.language === 'ar' ? 'ر.س' : 'SAR';

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (!user.has_accepted_agreement) {
        setAgreementModalOpen(true);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/merchants/stats');

        const weeklySales: SalesData[] = (response.data.weeklySales || []).map((item: any) => ({
          date: item.date,
          sales: Number(item.sales),
        }));

        const monthlySales: SalesData[] = (response.data.monthlySales || []).map((item: any) => ({
          date: item.date,
          sales: Number(item.sales),
        }));

        const recentOrders: RecentOrder[] = (response.data.recentOrders || []).map((order: any) => ({
          id: Number(order.id),
          customerName: order.customerName,
          status: order.status,
          total: Number(order.total),
        }));

        const normalizedData: DashboardData = {
          totalSales: Number(response.data.totalSales),
          totalProducts: Number(response.data.totalProducts),
          activeProducts: Number(response.data.activeProducts),
          averageRating: Number(response.data.averageRating),
          totalReviews: Number(response.data.totalReviews),
          monthlyViews: Number(response.data.monthlyViews),
          weeklySales,
          monthlySales,
          recentOrders,
        };

        setData(normalizedData);
      } catch (err) {
        setError(t('merchantDashboard.error.fetchFailed'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, t]);

  const handleAgree = async () => {
    try {
      await api.put('/users/profile/accept-agreement');
      toast.success(t('merchantDashboard.agreement.accepted'));
      if (refetchUser) {
        await refetchUser();
      }
      setAgreementModalOpen(false);
    } catch (err) {
      console.error('Failed to accept agreement:', err);
      toast.error(t('merchantDashboard.agreement.error'));
    }
  };

  if (user && !user.has_accepted_agreement) {
    return (
      <AgreementModal
        agreementKey="merchant_agreement"
        isOpen={isAgreementModalOpen}
        onClose={() => {}} // لا نسمح بالإغلاق حتى تتم الموافقة
        onAgree={handleAgree}
      />
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const chartData = (salesPeriod === 'week' ? data?.weeklySales : data?.monthlySales)?.map(d => ({
    name: formatDate(d.date),
    sales: d.sales
  }));

  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">{t('merchantDashboard.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-red-500 bg-white/90 p-5 rounded-xl shadow max-w-md w-full mx-2">
            <p className="text-sm">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-3 bg-red-500 hover:bg-red-600 text-white text-xs h-8 px-3"
              size="sm"
            >
              {t('merchantDashboard.retry')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navigation />
      
      <main className="space-y-4">
        {!isVerified && user && (
          <Alert variant="default" className="border-yellow-400 bg-yellow-50 text-xs">
            <Terminal className="h-3.5 w-3.5" />
            <AlertTitle className="font-bold text-yellow-800 text-xs">
              {user.verification_status === 'pending' && t('merchantDashboard.verification.pending.title')}
              {user.verification_status === 'rejected' && t('merchantDashboard.verification.rejected.title')}
              {user.verification_status === 'not_submitted' && t('merchantDashboard.verification.notSubmitted.title')}
            </AlertTitle>
            <AlertDescription className="text-yellow-700 text-xs">
              {user.verification_status === 'pending' ? (
                t('merchantDashboard.verification.pending.description')
              ) : (
                <>
                  {t('merchantDashboard.verification.actionRequired')}
                  <Link href="/dashboard/verification" className="font-bold hover:underline mx-0.5">
                    {t('merchantDashboard.verification.goToVerification')}
                  </Link>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        {isVerified && data ? (
          <>
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-2xl p-4 text-white shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h1 className="text-lg font-bold mb-1">
                    {t('merchantDashboard.welcome', { name: user?.name })}
                  </h1>
                  <p className="text-rose-100 text-xs opacity-90">
                    {t('merchantDashboard.welcomeSubtitle')}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <Badge className="bg-white/20 text-white border-0 px-2.5 py-1 text-[10px]">
                    {new Date().toLocaleDateString(i18n.language, { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats Grid — Pure Responsive Grid (NO HORIZONTAL SCROLL) */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard title={t('merchantDashboard.stats.totalSales')} value={`${currency} ${data.totalSales.toFixed(2)}`} icon={DollarSign} />
              <StatCard 
                title={t('merchantDashboard.stats.averageRating')} 
                value={`${data.averageRating.toFixed(1)} / 5.0`} 
                description={t('merchantDashboard.stats.fromReviews', { count: data.totalReviews })} 
                icon={Star} 
              />
              <StatCard title={t('merchantDashboard.stats.monthlyViews')} value={data.monthlyViews.toLocaleString(i18n.language)} icon={Eye} />
              <StatCard title={t('merchantDashboard.stats.activeProducts')} value={`${data.activeProducts} / ${data.totalProducts}`} icon={Package} />
              <StatCard title={t('merchantDashboard.stats.newOrders')} value={`+${data.recentOrders.length}`} icon={ShoppingCart} />
            </div>

            {/* Charts and Orders — Full width on mobile, side-by-side on xl */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Sales Chart */}
              <Card className="xl:col-span-2 shadow-sm border border-gray-200/60 bg-white/90">
                <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm text-gray-900 truncate">
                      {t('merchantDashboard.chart.title')}
                    </CardTitle>
                    <CardDescription className="text-[10px] truncate">
                      {t('merchantDashboard.chart.description')}
                    </CardDescription>
                  </div>
                  <div className="flex bg-gray-100 p-0.5 rounded-lg flex-shrink-0">
                    <Button 
                      size="sm" 
                      variant={salesPeriod === 'week' ? 'default' : 'ghost'} 
                      onClick={() => setSalesPeriod('week')}
                      className="rounded text-[10px] h-6 px-2"
                    >
                      {t('merchantDashboard.chart.thisWeek')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant={salesPeriod === 'month' ? 'default' : 'ghost'} 
                      onClick={() => setSalesPeriod('month')}
                      className="rounded text-[10px] h-6 px-2"
                    >
                      {t('merchantDashboard.chart.thisMonth')}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  {chartData && <SalesChart data={chartData} currency={currency} t={t} />}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="shadow-sm border border-gray-200/60 bg-white/90">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-900">
                    {t('merchantDashboard.orders.title')}
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    {t('merchantDashboard.orders.recent', { count: Math.min(4, data.recentOrders.length) })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recentOrders.length > 0 ? (
                    <RecentOrders orders={data.recentOrders.slice(0, 4)} currency={currency} t={t} />
                  ) : (
                    <div className="text-center py-6">
                      <ShoppingCart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs">{t('merchantDashboard.orders.noRecent')}</p>
                    </div>
                  )}
                </CardContent>
                <div className="p-3 border-t border-gray-200/60 mt-2">
                  <Link href="/dashboard/orders">
                    <Button 
                      variant="ghost" 
                      className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-xs h-9"
                    >
                      <span>{t('merchantDashboard.orders.viewAll')}</span>
                      <ArrowRight className="mr-1.5 h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </>
        ) : (
          !loading && (
            <Card>
              <CardContent className="p-6 text-center">
                <h2 className="text-base font-bold">{t('merchantDashboard.onboarding.title')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('merchantDashboard.onboarding.description')}
                </p>
              </CardContent>
            </Card>
          )
        )}
      </main>
    </div>
  );
}