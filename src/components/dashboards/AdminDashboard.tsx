// frontend/src/components/dashboards/AdminDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { 
  Users, Package, ShoppingCart, Handshake, BarChart2, TrendingUp, DollarSign,
  RefreshCw, Activity, Zap, Bell, Sparkles, Crown, Eye, Download,
  UserCheck, Store, Target, ArrowUpRight, Calendar
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import AdminNav from './AdminNav';
import { toast } from 'sonner';
import type { PieLabelRenderProps } from 'recharts';

// Types
interface ChartDataItem {
  name: string;
  sales: number;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

interface AnalyticsData {
  userCounts: {
    merchants: number;
    models: number;
    influencers: number;
    customers: number;
  };
  generalCounts: {
    totalProducts: number;
    totalOrders: number;
    totalShipping: number;
    totalAgreements: number;
  };
  weeklySales: { date: string; sales: number | string }[];
  monthlySales: { date: string; sales: number | string }[];
  platformRevenue?: number | string;
  platformEarnings?: number | string;
  recentActivity?: RecentActivity[];
  activeUsers: number;
  pendingOrders: number;
}

// Chart Components
const SalesBarChart = ({ data, currency }: { data: ChartDataItem[]; currency: string }) => {
  const { t } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#fecdd3" />
        <XAxis 
          dataKey="name" 
          stroke="#881337" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#881337" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value} ${currency}`} 
        />
        <Tooltip 
          cursor={{ fill: 'rgba(251, 113, 133, 0.1)' }} 
          contentStyle={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            border: '1px solid #fecdd3',
            boxShadow: '0 10px 25px rgba(190, 18, 60, 0.1)'
          }}
          formatter={(value) => [`${value} ${currency}`, t('AdminDashboard.charts.sales')]}
          labelFormatter={(label) => label} 
        />
        <Legend formatter={() => t('AdminDashboard.charts.sales')} iconType="circle" />
        <Bar 
          dataKey="sales" 
          name={t('AdminDashboard.charts.sales')} 
          radius={[8, 8, 0, 0]} 
          fill="url(#barGradient)"
        />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
};

const SalesAreaChart = ({ data, currency }: { data: ChartDataItem[]; currency: string }) => {
  const { t } = useTranslation();
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#fecdd3" />
        <XAxis 
          dataKey="name" 
          stroke="#881337" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#881337" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value} ${currency}`} 
        />
        <Tooltip 
          cursor={{ fill: 'rgba(251, 113, 133, 0.1)' }} 
          contentStyle={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            border: '1px solid #fecdd3',
            boxShadow: '0 10px 25px rgba(190, 18, 60, 0.1)'
          }}
          formatter={(value) => [`${value} ${currency}`, t('AdminDashboard.charts.sales')]} 
        />
        <Area 
          type="monotone" 
          dataKey="sales" 
          stroke="url(#areaStroke)" 
          fill="url(#areaGradient)" 
          strokeWidth={3}
        />
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05}/>
          </linearGradient>
          <linearGradient id="areaStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
};

const UserDistributionPie = ({ data }: { data: { name: string; value: number }[] }) => {
  const COLORS = ['#ec4899', '#f97316', '#8b5cf6', '#06b6d4'];
  const { t } = useTranslation();

  const renderLabel = (props: PieLabelRenderProps) => {
    const name = String(props.name ?? '');
    const percentNumber = typeof props.percent === 'number' ? props.percent : 0;
    const percentText = Math.round(percentNumber * 100);
    return `${name}: ${percentText}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={60}
          dataKey="value"
          label={renderLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [value, t('AdminDashboard.charts.users')]} 
          contentStyle={{ 
            background: 'white', 
            borderRadius: '0.75rem', 
            border: '1px solid #fecdd3'
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Skeletons
const StatCardSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <Skeleton className="h-4 w-24" />
    </div>
    <Skeleton className="h-8 w-20 mb-2" />
    <Skeleton className="h-3 w-32" />
  </Card>
);

const ChartSkeleton = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl h-[400px]">
    <CardHeader>
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-64 mt-2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="w-full h-full rounded-xl" />
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month'>('week');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');
  const [refreshing, setRefreshing] = useState(false);

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = i18n.language === 'ar' ? 'ر.س' : 'SAR';

  const toNumber = (val: number | string | undefined | null): number => {
    if (val == null) return 0;
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return isNaN(num) ? 0 : num;
  };

  const formatCurrency = (value: number | string | undefined | null): string => {
    return `${toNumber(value).toLocaleString(locale)} ${currency}`;
  };

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(false);
    try {
      const response = await api.get('/admin/dashboard-analytics');
      setAnalytics(response.data);
      if (isRefresh) {
        toast.success(t('AdminDashboard.toast.refreshSuccess'));
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setError(true);
      toast.error(t('AdminDashboard.toast.refreshError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRetry = () => fetchData();
  const handleRefresh = () => fetchData(true);
  const exportReport = () => {
    toast.info(t('AdminDashboard.toast.preparingReport'));
  };

  const chartData = (
    (chartPeriod === 'week' ? analytics?.weeklySales : analytics?.monthlySales) ?? []
  ).map(d => ({
    name: new Date(d.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
    sales: toNumber(d.sales)
  }));

  const userDistData = analytics ? [
    { name: t('AdminDashboard.roles.merchants'), value: toNumber(analytics.userCounts.merchants) },
    { name: t('AdminDashboard.roles.models'), value: toNumber(analytics.userCounts.models) },
    { name: t('AdminDashboard.roles.influencers'), value: toNumber(analytics.userCounts.influencers) },
    { name: t('AdminDashboard.roles.customers'), value: toNumber(analytics.userCounts.customers) },
  ] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
        <AdminNav />
        <header className="mb-8 text-center">
          <Skeleton className="h-12 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </header>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
        <AdminNav />
        <div className="flex flex-col items-center justify-center h-96 text-center">
          <div className="p-4 bg-rose-100 rounded-2xl mb-4">
            <Bell className="h-12 w-12 text-rose-500" />
          </div>
          <h3 className="text-2xl font-bold text-rose-800 mb-2">{t('AdminDashboard.error.title')}</h3>
          <p className="text-rose-600 mb-6">{t('AdminDashboard.error.message')}</p>
          <Button 
            onClick={handleRetry}
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
          >
            {t('AdminDashboard.error.retry')}
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const totalUsers = Object.values(analytics.userCounts).reduce((sum, count) => sum + toNumber(count), 0);

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    description,
    className = '' 
  }: { 
    title: string; 
    value: string; 
    icon: any; 
    trend?: string;
    description?: string;
    className?: string;
  }) => (
    <Card className={`bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white`}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
              <TrendingUp className="h-3 w-3 ml-1" />
              {trend}
            </Badge>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-rose-700 text-sm font-medium">{title}</h3>
          <div className="text-2xl font-bold text-rose-900">{value}</div>
          {description && (
            <p className="text-rose-600 text-xs">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <AdminNav />
      
      {/* Header Section */}
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <BarChart2 className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('AdminDashboard.header.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('AdminDashboard.header.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      {/* Quick Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-xl">
                <Activity className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-rose-800">{t('AdminDashboard.actions.liveView')}</h3>
                <p className="text-rose-600 text-sm">{t('AdminDashboard.actions.lastUpdate')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={exportReport}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <Download className="w-4 h-4 ml-2" />
                {t('AdminDashboard.actions.exportReport')}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />
                {t('AdminDashboard.actions.refreshData')}
              </Button>
              <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl">
                <Eye className="w-4 h-4 ml-2" />
                {t('AdminDashboard.actions.viewDetails')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title={t('AdminDashboard.stats.platformRevenue')}
          value={formatCurrency(analytics.platformRevenue)}
          icon={TrendingUp}
          trend="+12%"
          description={t('AdminDashboard.stats.totalRevenue')}
        />
        <StatCard
          title={t('AdminDashboard.stats.platformEarnings')}
          value={formatCurrency(analytics.platformEarnings)}
          icon={DollarSign}
          trend="+8%"
          description={t('AdminDashboard.stats.netProfit')}
        />
        <StatCard
          title={t('AdminDashboard.stats.totalUsers')}
          value={totalUsers.toLocaleString(locale)}
          icon={Users}
          trend="+15%"
          description={t('AdminDashboard.stats.activeUsers', { count: analytics.activeUsers })}
        />
        <StatCard
          title={t('AdminDashboard.stats.products')}
          value={analytics.generalCounts.totalProducts.toLocaleString(locale)}
          icon={Package}
          trend="+20%"
          description={t('AdminDashboard.stats.activeProducts')}
        />
        <StatCard
          title={t('AdminDashboard.stats.orders')}
          value={analytics.generalCounts.totalOrders.toLocaleString(locale)}
          icon={ShoppingCart}
          trend="+18%"
          description={t('AdminDashboard.stats.pendingOrders', { count: analytics.pendingOrders })}
        />
        <StatCard
          title={t('AdminDashboard.stats.agreements')}
          value={analytics.generalCounts.totalAgreements.toLocaleString(locale)}
          icon={Handshake}
          trend="+25%"
          description={t('AdminDashboard.stats.successfulCollabs')}
        />
        <StatCard
          title={t('AdminDashboard.stats.merchants')}
          value={analytics.userCounts.merchants.toLocaleString(locale)}
          icon={Store}
          description={t('AdminDashboard.stats.registeredMerchants')}
        />
        <StatCard
          title={t('AdminDashboard.stats.customers')}
          value={analytics.userCounts.customers.toLocaleString(locale)}
          icon={UserCheck}
          description={t('AdminDashboard.stats.activeCustomers')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales Chart */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BarChart2 className="w-5 h-5" /> {t('AdminDashboard.charts.salesTitle')}
                </CardTitle>
                <CardDescription className="text-pink-100">
                  {t('AdminDashboard.charts.salesSubtitle')}
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex bg-white/20 p-1 rounded-lg">
                  <Button 
                    size="sm" 
                    variant={chartType === 'bar' ? 'default' : 'ghost'} 
                    onClick={() => setChartType('bar')}
                    className="text-white hover:text-white"
                  >
                    {t('AdminDashboard.charts.bar')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant={chartType === 'area' ? 'default' : 'ghost'} 
                    onClick={() => setChartType('area')}
                    className="text-white hover:text-white"
                  >
                    {t('AdminDashboard.charts.area')}
                  </Button>
                </div>
                <div className="flex bg-white/20 p-1 rounded-lg">
                  <Button 
                    size="sm" 
                    variant={chartPeriod === 'week' ? 'default' : 'ghost'} 
                    onClick={() => setChartPeriod('week')}
                    className="text-white hover:text-white"
                  >
                    {t('AdminDashboard.charts.last7Days')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant={chartPeriod === 'month' ? 'default' : 'ghost'} 
                    onClick={() => setChartPeriod('month')}
                    className="text-white hover:text-white"
                  >
                    {t('AdminDashboard.charts.last30Days')}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {chartType === 'bar' ? (
              <SalesBarChart data={chartData} currency={currency} />
            ) : (
              <SalesAreaChart data={chartData} currency={currency} />
            )}
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-3xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5" /> {t('AdminDashboard.charts.userDistribution')}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {t('AdminDashboard.charts.userDistributionSubtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <UserDistributionPie data={userDistData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-3xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="w-5 h-5" /> {t('AdminDashboard.activity.title')}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {t('AdminDashboard.activity.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {(analytics.recentActivity || [
                { id: '1', user: 'أحمد محمد', action: 'قام بتسجيل الدخول', time: 'منذ 5 دقائق', type: 'info' as const },
                { id: '2', user: 'شركة الأمل', action: 'أنشأت منتج جديد', time: 'منذ 15 دقيقة', type: 'success' as const },
                { id: '3', user: 'سارة أحمد', action: 'أكملت طلب شراء', time: 'منذ ساعة', type: 'success' as const },
                { id: '4', user: 'محمد علي', action: 'طلب يحتاج مراجعة', time: 'منذ ساعتين', type: 'warning' as const },
              ]).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-4 bg-rose-50 rounded-xl border border-rose-200">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 
                    activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-rose-800 font-medium text-sm">{activity.user}</p>
                    <p className="text-rose-600 text-xs">{activity.action}</p>
                    <p className="text-rose-500 text-xs mt-1">{activity.time}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-rose-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Goals */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-3xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-5 h-5" /> {t('AdminDashboard.goals.title')}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {t('AdminDashboard.goals.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                { goal: t('AdminDashboard.goals.userGrowth'), progress: 75, target: '1000 مستخدم' },
                { goal: t('AdminDashboard.goals.orderCompletion'), progress: 85, target: '95%' },
                { goal: t('AdminDashboard.goals.merchantSatisfaction'), progress: 90, target: '95%' },
                { goal: t('AdminDashboard.goals.revenueGrowth'), progress: 65, target: '100%' },
              ].map((item, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-rose-800 font-medium text-sm">{item.goal}</span>
                    <span className="text-rose-600 text-xs">{item.target}</span>
                  </div>
                  <div className="w-full bg-rose-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-600">{t('AdminDashboard.goals.progress')}</span>
                    <span className="text-rose-700 font-medium">{item.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}