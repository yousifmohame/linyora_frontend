'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import ModelNav from '@/components/dashboards/ModelNav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { BarChart2, DollarSign, CheckCircle, Handshake, TrendingUp, Users, Eye, Star, Crown, Sparkles, Target, Award } from 'lucide-react';

interface TopOffer {
  title: string;
  price: number;
  requestCount: number;
}

interface AnalyticsData {
  totalEarnings: number;
  completedAgreements: number;
  averageDealPrice: number;
  topOffers: TopOffer[];
  requestsOverTime: { month: string; count: number }[];
  performanceMetrics?: {
    engagementRate: number;
    profileViews: number;
    satisfactionScore: number;
  };
}

const COLORS = ['#ec4899', '#f472b6', '#fb7185', '#fda4af', '#fecdd3'];

export default function ModelAnalyticsPage() {
  const { t, i18n } = useTranslation();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/model/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = 'SAR';

  const chartData = analytics?.requestsOverTime.map((item) => {
    const date = new Date(item.month + '-01');
    const monthName = date.toLocaleDateString(locale, { month: 'short' });
    return {
      name: monthName,
      requests: item.count,
    };
  }) || [];

  const performanceData = [
    { 
      name: t('ModelAnalytics.performance.engagement'), 
      value: analytics?.performanceMetrics?.engagementRate || 0, 
      color: '#ec4899' 
    },
    { 
      name: t('ModelAnalytics.performance.profileViews'), 
      value: analytics?.performanceMetrics?.profileViews || 0, 
      color: '#f472b6' 
    },
    { 
      name: t('ModelAnalytics.performance.satisfaction'), 
      value: analytics?.performanceMetrics?.satisfactionScore || 0, 
      color: '#fb7185' 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <ModelNav />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">{t('ModelAnalytics.loading')}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <ModelNav />
        <div className="text-center">
          <BarChart2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t('ModelAnalytics.error.title')}</h2>
          <p className="text-gray-600 text-sm">{t('ModelAnalytics.error.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <ModelNav />

      <header className="mb-6 text-center px-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-rose-100">
            <Award className="h-6 w-6 text-rose-600" />
          </div>
          <Sparkles className="h-4 w-4 text-rose-300" />
          <Target className="h-4 w-4 text-rose-300" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
          {t('ModelAnalytics.title')}
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {t('ModelAnalytics.subtitle')}
        </p>
      </header>

      <div className="flex justify-center mb-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-200/50">
          <div className="flex gap-1.5">
            {(['month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {t(`ModelAnalytics.timeRange.${range}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ✅ Stats Grid - Unified styling */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <StatCard 
          title={t('ModelAnalytics.stats.totalEarnings')}
          value={new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(analytics.totalEarnings)}
          icon={DollarSign}
          color="green"
        />
        <StatCard 
          title={t('ModelAnalytics.stats.completedAgreements')}
          value={analytics.completedAgreements.toString()}
          icon={CheckCircle}
          color="blue"
        />
        <StatCard 
          title={t('ModelAnalytics.stats.averageDealPrice')}
          value={new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(analytics.averageDealPrice)}
          icon={Handshake}
          color="purple"
        />
        <StatCard 
          title={t('ModelAnalytics.stats.engagementRate')}
          value={`${analytics.performanceMetrics?.engagementRate || 0}%`}
          icon={TrendingUp}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="h-4 w-4" />
                {t('ModelAnalytics.chart.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    stroke="#666"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#666"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '10px',
                      padding: '6px 10px'
                    }}
                    formatter={(value) => [`طلبات: ${value}`, '']}
                    labelFormatter={(label) => `شهر: ${label}`}
                  />
                  <Bar dataKey="requests" radius={[4, 4, 0, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance */}
        <div className="lg:col-span-1">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" />
                {t('ModelAnalytics.performance.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3">
                {performanceData.map((metric, index) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-lg border border-gray-200/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: metric.color }}></div>
                      <span className="text-[10px] text-gray-800 font-medium">{metric.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">{metric.value}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Offers */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-base">
              <Crown className="h-4 w-4" />
              {t('ModelAnalytics.topOffers.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead className="text-gray-800 font-bold text-[10px] sm:text-xs">{t('ModelAnalytics.topOffers.headers.offer')}</TableHead>
                  <TableHead className="text-gray-800 font-bold text-[10px] sm:text-xs">{t('ModelAnalytics.topOffers.headers.price')}</TableHead>
                  <TableHead className="text-gray-800 font-bold text-[10px] sm:text-xs text-left">{t('ModelAnalytics.topOffers.headers.requests')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topOffers.map((offer, index) => (
                  <TableRow key={index} className="border-b border-gray-200/50 hover:bg-gray-50/30">
                    <TableCell className="font-medium text-gray-900 text-[10px] sm:text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="truncate max-w-[100px]">{offer.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700 text-[10px] sm:text-xs">
                      {new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(offer.price)}
                    </TableCell>
                    <TableCell className="text-left text-[10px] sm:text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900">{offer.requestCount}</span>
                        <Users className="w-3 h-3 text-gray-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              {t('ModelAnalytics.insights.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-lg border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <Eye className="w-3 h-3 text-rose-500" />
                  <span className="text-[10px] text-gray-800 font-medium">{t('ModelAnalytics.insights.profileViews')}</span>
                </div>
                <div className="text-sm font-bold text-gray-900">
                  {(analytics.performanceMetrics?.profileViews || 0).toLocaleString(locale)}
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-lg border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <Star className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-gray-800 font-medium">{t('ModelAnalytics.insights.rating')}</span>
                </div>
                <div className="text-sm font-bold text-amber-600">4.8/5</div>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-gray-50/50 rounded-lg border border-gray-200/50">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-gray-800 font-medium">{t('ModelAnalytics.insights.completionRate')}</span>
                </div>
                <div className="text-sm font-bold text-green-600">94%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ✅ Reusable Stat Card
const StatCard = ({ title, value, icon: Icon, color }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: 'green' | 'blue' | 'purple' | 'rose';
}) => {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border ${colorMap[color]} shadow-sm rounded-xl`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-gray-600">{title}</p>
            <div className="text-sm font-bold text-gray-900 mt-0.5">{value}</div>
          </div>
          <div className={`p-2 rounded-lg ${colorMap[color].split(' ')[0]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};