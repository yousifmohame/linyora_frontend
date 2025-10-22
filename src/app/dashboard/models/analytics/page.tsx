'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import ModelNav from '@/components/dashboards/ModelNav';
import StatCard from '@/components/dashboards/shared/StatCard';
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

  // Prepare chart data with localized month names
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">{t('ModelAnalytics.loading')}</p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="h-16 w-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-rose-800 mb-2">{t('ModelAnalytics.error.title')}</h2>
          <p className="text-rose-600">{t('ModelAnalytics.error.description')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8 relative">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <ModelNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Award className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Target className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('ModelAnalytics.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('ModelAnalytics.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="flex justify-center mb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-rose-200">
          <div className="flex space-x-2">
            {(['month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                {t(`ModelAnalytics.timeRange.${range}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-green-500 to-emerald-500">
          <div className="bg-white rounded-2xl">
            <StatCard
              title={t('ModelAnalytics.stats.totalEarnings')}
              value={new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(analytics.totalEarnings)}
              icon={DollarSign}
              description={t('ModelAnalytics.stats.totalEarningsGrowth')}
            />
          </div>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 to-cyan-500">
          <div className="bg-white rounded-2xl">
            <StatCard
              title={t('ModelAnalytics.stats.completedAgreements')}
              value={analytics.completedAgreements.toString()}
              icon={CheckCircle}
              description={t('ModelAnalytics.stats.completedAgreementsGrowth')}
            />
          </div>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="bg-white rounded-2xl">
            <StatCard
              title={t('ModelAnalytics.stats.averageDealPrice')}
              value={new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(analytics.averageDealPrice)}
              icon={Handshake}
              description={t('ModelAnalytics.stats.averageDealPriceGrowth')}
            />
          </div>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-rose-500 to-pink-500">
          <div className="bg-white rounded-2xl">
            <StatCard
              title={t('ModelAnalytics.stats.engagementRate')}
              value={`${analytics.performanceMetrics?.engagementRate || 0}%`}
              icon={TrendingUp}
              description={t('ModelAnalytics.stats.engagementRateGrowth')}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start mb-8">
        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-xl">
                  <BarChart2 className="h-6 w-6" />
                </div>
                {t('ModelAnalytics.chart.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} stroke="#fecdd3" />
                  <XAxis
                    dataKey="name"
                    stroke="#9d174d"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9d174d"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #fbcfe8',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Bar dataKey="requests" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden h-full">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Star className="h-6 w-6" />
                </div>
                {t('ModelAnalytics.performance.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {performanceData.map((metric, index) => (
                  <div
                    key={metric.name}
                    className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }}></div>
                      <span className="text-rose-800 font-medium">{metric.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-rose-600">{metric.value}%</div>
                      <div className="text-xs text-rose-500 mt-1">
                        {t('ModelAnalytics.performance.growth', { percent: 5 + index * 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <Crown className="h-6 w-6" />
              </div>
              {t('ModelAnalytics.topOffers.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow className="border-rose-200 hover:bg-rose-50/50">
                  <TableHead className="text-rose-800 font-bold">{t('ModelAnalytics.topOffers.headers.offer')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('ModelAnalytics.topOffers.headers.price')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-left">{t('ModelAnalytics.topOffers.headers.requests')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topOffers.map((offer, index) => (
                  <TableRow
                    key={`${offer.title}-${index}`}
                    className="border-rose-100 hover:bg-rose-50/30 transition-colors"
                  >
                    <TableCell className="font-medium text-rose-900">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        {offer.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-rose-700">
                      {new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 0 }).format(offer.price)}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-600">{offer.requestCount}</span>
                        <Users className="w-4 h-4 text-rose-400" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              {t('ModelAnalytics.insights.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-rose-500" />
                  <span className="text-rose-800 font-medium">{t('ModelAnalytics.insights.profileViews')}</span>
                </div>
                <div className="text-2xl font-bold text-rose-600">
                  {(analytics.performanceMetrics?.profileViews || 0).toLocaleString(locale)}
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-500" />
                  <span className="text-rose-800 font-medium">{t('ModelAnalytics.insights.rating')}</span>
                </div>
                <div className="text-2xl font-bold text-amber-600">4.8/5</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-rose-800 font-medium">{t('ModelAnalytics.insights.completionRate')}</span>
                </div>
                <div className="text-2xl font-bold text-green-600">94%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}