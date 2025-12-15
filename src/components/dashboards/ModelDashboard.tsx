'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Handshake, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  ArrowRight, 
  TrendingUp, 
  Users, 
  Star, 
  Calendar,
  Eye,
  MessageSquare,
  ShoppingBag,
  Award,
  Sparkles,
  Crown,
  Target,
  BarChart3,
  Wallet,
  Settings,
  Bell,
  Heart,
  Zap
} from 'lucide-react';
import ModelNav from './ModelNav';
import AgreementModal from './shared/AgreementModal';
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedAgreements: number;
  totalEarnings: number;
  monthlyEarnings: number;
  profileViews: number;
  responseRate: number;
  upcomingCollaborations: number;
}

interface RecentActivity {
  id: number;
  type: 'request' | 'message' | 'payment' | 'review';
  title: string;
  description: string;
  time: string;
  isNew?: boolean;
}

export default function ModelDashboard() {
  const { t, i18n } = useTranslation();
  const { user, refetchUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAgreementModalOpen, setAgreementModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (user.has_accepted_agreement) {
      const fetchDashboardData = async () => {
        try {
          const [statsResponse, activityResponse] = await Promise.all([
            api.get('/model/dashboard'),
            api.get('/model/recent-activity')
          ]);

          const data = statsResponse.data;
          setStats({
            totalRequests: data.totalRequests || 0,
            pendingRequests: data.pendingRequests || 0,
            completedAgreements: data.completedAgreements || 0,
            totalEarnings: typeof data.totalEarnings === 'number'
              ? data.totalEarnings
              : parseFloat(data.totalEarnings) || 0,
            monthlyEarnings: data.monthlyEarnings || 0,
            profileViews: data.profileViews || 0,
            responseRate: data.responseRate || 0,
            upcomingCollaborations: data.upcomingCollaborations || 0,
          });

          setRecentActivity(activityResponse.data || []);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          toast.error(t('ModelDashboard.toast.fetchError'));
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    } else {
      setAgreementModalOpen(true);
      setLoading(false);
    }
  }, [user, t]);

  const handleAgree = async () => {
    try {
      await api.put('/users/profile/accept-agreement');
      toast.success(t('ModelDashboard.toast.agreementAccepted'));
      
      if (refetchUser) {
        await refetchUser();
      }
    } catch (error) {
      console.error("Agreement acceptance failed:", error);
      toast.error(t('ModelDashboard.toast.agreementError'));
    }
  };

  if (user && !user.has_accepted_agreement) {
    return (
      <AgreementModal
        agreementKey="model_agreement"
        isOpen={isAgreementModalOpen}
        onClose={() => {}}
        onAgree={handleAgree}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 flex items-center justify-center p-4 overflow-hidden">
        <NavigationPlaceholder />
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto mb-3"></div>
          <p className="text-gray-600">{t('ModelDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 flex items-center justify-center p-4 overflow-hidden">
        <NavigationPlaceholder />
        <div className="text-center">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-gray-800 mb-1">{t('ModelDashboard.unauthorized.title')}</h2>
          <p className="text-gray-600">{t('ModelDashboard.unauthorized.description')}</p>
        </div>
      </div>
    );
  }

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = 'SAR';

  // ✅ Helper: Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount);
  };

  return (
    // ✅ Unified gradient + overflow-hidden
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      {/* ✅ Smaller, safe blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      
      <ModelNav />
      
      <header className="mb-6 text-center px-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-rose-100">
            <Crown className="h-6 w-6 text-rose-600" />
          </div>
          <Sparkles className="h-4 w-4 text-rose-300" />
          <Target className="h-4 w-4 text-rose-300" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
          {t('ModelDashboard.welcome', { name: user.name })}
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {t('ModelDashboard.subtitle')}
        </p>
      </header>

      {/* ✅ Stats Grid - Unified styling */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <StatCard 
          title={t('ModelDashboard.stats.totalEarnings')}
          value={formatCurrency(stats?.totalEarnings ?? 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard 
          title={t('ModelDashboard.stats.monthlyEarnings')}
          value={formatCurrency(stats?.monthlyEarnings ?? 0)}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard 
          title={t('ModelDashboard.stats.completedAgreements')}
          value={(stats?.completedAgreements ?? 0).toString()}
          icon={CheckCircle}
          color="purple"
        />
        <StatCard 
          title={t('ModelDashboard.stats.pendingRequests')}
          value={(stats?.pendingRequests ?? 0).toString()}
          icon={Clock}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Secondary Stats */}
        <div className="lg:col-span-1 grid grid-cols-2 gap-3">
          <MiniStatCard value={stats?.profileViews || 0} label={t('ModelDashboard.secondaryStats.profileViews')} icon={Eye} color="blue" />
          <MiniStatCard value={`${stats?.responseRate || 0}%`} label={t('ModelDashboard.secondaryStats.responseRate')} icon={MessageSquare} color="green" />
          <MiniStatCard value={stats?.upcomingCollaborations || 0} label={t('ModelDashboard.secondaryStats.upcomingCollaborations')} icon={Calendar} color="purple" />
          <MiniStatCard value="4.8" label={t('ModelDashboard.secondaryStats.rating')} icon={Star} color="rose" />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-3 sm:p-4 rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-4 h-4" />
                {t('ModelDashboard.quickActions.title')}
              </CardTitle>
              <CardDescription className="text-purple-100 text-xs mt-0.5">
                {t('ModelDashboard.quickActions.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-2 gap-3">
                <QuickActionCard 
                  href="/dashboard/models/requests"
                  icon={Bell}
                  label={t('ModelDashboard.quickActions.requests')}
                  badgeCount={stats?.pendingRequests}
                />
                <QuickActionCard 
                  href="/dashboard/models/modelsoffers"
                  icon={ShoppingBag}
                  label={t('ModelDashboard.quickActions.offers')}
                />
                <QuickActionCard 
                  href="/dashboard/models/analytics"
                  icon={BarChart3}
                  label={t('ModelDashboard.quickActions.analytics')}
                />
                <QuickActionCard 
                  href="/dashboard/models/wallet"
                  icon={Wallet}
                  label={t('ModelDashboard.quickActions.wallet')}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Recent Activity */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-3 sm:p-4 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-base">
              <ActivityIcon className="w-4 h-4" />
              {t('ModelDashboard.recentActivity.title')}
            </CardTitle>
            <CardDescription className="text-purple-100 text-xs mt-0.5">
              {t('ModelDashboard.recentActivity.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            {recentActivity.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{t('ModelDashboard.recentActivity.empty')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-3 sm:p-4 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              {t('ModelDashboard.performance.title')}
            </CardTitle>
            <CardDescription className="text-purple-100 text-xs mt-0.5">
              {t('ModelDashboard.performance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 space-y-4">
            <PerformanceMetric label={t('ModelDashboard.performance.completionRate')} value={85} />
            <PerformanceMetric label={t('ModelDashboard.performance.customerSatisfaction')} value={94} />
            <PerformanceMetric label={t('ModelDashboard.performance.deliverySpeed')} value={78} />
            
            <div className="bg-gradient-to-r from-rose-50 to-purple-50 rounded-xl p-3 border border-rose-200/50">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="font-bold text-gray-800 text-xs">{t('ModelDashboard.performance.encouragement.title')}</h4>
                  <p className="text-gray-600 text-[10px]">{t('ModelDashboard.performance.encouragement.description')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="mt-6 text-center">
        <Card className="bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm rounded-2xl border-0">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-2">{t('ModelDashboard.cta.title')}</h3>
            <p className="text-purple-100 mb-4 text-sm">
              {t('ModelDashboard.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/dashboard/models/profile-settings">
                <Button className="bg-white text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium">
                  <Sparkles className="mr-1.5 w-3 h-3" />
                  {t('ModelDashboard.cta.profile')}
                </Button>
              </Link>
              <Link href="/dashboard/models/modelsoffers">
                <Button variant="outline" className="border-white text-white hover:bg-white/20 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium">
                  <PlusIcon className="mr-1.5 w-3 h-3" />
                  {t('ModelDashboard.cta.createOffers')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ✅ Navigation Placeholder for loading states
const NavigationPlaceholder = () => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm h-14 border-b border-gray-200/50"></div>
);

// ✅ Reusable Stat Card
const StatCard = ({ title, value, icon: Icon, color }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: 'green' | 'blue' | 'purple' | 'amber' | 'rose';
}) => {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
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

// ✅ Mini Stat Card
const MiniStatCard = ({ value, label, icon: Icon, color }: { 
  value: string | number; 
  label: string; 
  icon: any; 
  color: 'blue' | 'green' | 'purple' | 'rose';
}) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    rose: 'bg-rose-100 text-rose-600',
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-sm">
      <CardContent className="p-3 text-center">
        <div className={`w-8 h-8 ${colorMap[color]} rounded-lg flex items-center justify-center mx-auto mb-2`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-lg font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-[10px] text-gray-600">{label}</div>
      </CardContent>
    </Card>
  );
};

// ✅ Quick Action Card
const QuickActionCard = ({ href, icon: Icon, label, badgeCount }: { 
  href: string; 
  icon: any; 
  label: string; 
  badgeCount?: number;
}) => (
  <Link href={href} className="block">
    <Button className="w-full h-16 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl flex flex-col gap-1.5 transition-colors">
      <div className="relative">
        <Icon className="w-5 h-5" />
        {badgeCount && badgeCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] h-4 min-w-4 p-0 flex items-center justify-center">
            {badgeCount > 99 ? '99+' : badgeCount}
          </Badge>
        )}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Button>
  </Link>
);

// ✅ Activity Item
const ActivityItem = ({ activity }: { activity: RecentActivity }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'request': return <Handshake className="w-4 h-4 text-blue-600" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'payment': return <DollarSign className="w-4 h-4 text-amber-600" />;
      case 'review': return <Star className="w-4 h-4 text-purple-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-2.5 bg-gray-50/50 rounded-lg border border-gray-200/50">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-100">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <h4 className="font-medium text-gray-900 text-sm truncate">{activity.title}</h4>
          {activity.isNew && (
            <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded">NEW</Badge>
          )}
        </div>
        <p className="text-gray-600 text-[10px] mb-0.5">{activity.description}</p>
        <span className="text-gray-500 text-[10px]">{activity.time}</span>
      </div>
    </div>
  );
};

// ✅ Performance Metric
const PerformanceMetric = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-gray-700 font-medium text-xs">{label}</span>
      <span className="text-gray-900 font-bold text-xs">{value}%</span>
    </div>
    <Progress value={value} className="h-1.5 bg-gray-200" />
  </div>
);

// ✅ Icons
const ActivityIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);