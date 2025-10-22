'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import StatCard from './shared/StatCard';
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">{t('ModelDashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-16 w-16 text-rose-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-rose-800 mb-2">{t('ModelDashboard.unauthorized.title')}</h2>
          <p className="text-rose-600">{t('ModelDashboard.unauthorized.description')}</p>
        </div>
      </div>
    );
  }

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = 'SAR';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      
      <ModelNav />
      
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Crown className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Target className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('ModelDashboard.welcome', { name: user.name })}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('ModelDashboard.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-green-500 to-emerald-500">
          <div className="bg-white rounded-2xl">
            <StatCard 
              title={t('ModelDashboard.stats.totalEarnings')}
              value={new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(stats?.totalEarnings ?? 0)}
              icon={DollarSign}
              description={t('ModelDashboard.stats.totalEarningsDesc')}
            />
          </div>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-500 to-cyan-500">
          <div className="bg-white rounded-2xl">
            <StatCard 
              title={t('ModelDashboard.stats.monthlyEarnings')}
              value={new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits: 2 }).format(stats?.monthlyEarnings ?? 0)}
              icon={TrendingUp}
              description={t('ModelDashboard.stats.monthlyEarningsDesc')}
            />
          </div>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="bg-white rounded-2xl">
            <StatCard 
              title={t('ModelDashboard.stats.completedAgreements')}
              value={(stats?.completedAgreements ?? 0).toString()}
              icon={CheckCircle}
              description={t('ModelDashboard.stats.completedAgreementsDesc')}
            />
          </div>
        </div>

        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="bg-white rounded-2xl">
            <StatCard 
              title={t('ModelDashboard.stats.pendingRequests')}
              value={(stats?.pendingRequests ?? 0).toString()}
              icon={Clock}
              description={t('ModelDashboard.stats.pendingRequestsDesc')}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 grid grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats?.profileViews || 0}</div>
              <div className="text-blue-700 text-sm">{t('ModelDashboard.secondaryStats.profileViews')}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600 mb-1">{stats?.responseRate || 0}%</div>
              <div className="text-green-700 text-sm">{t('ModelDashboard.secondaryStats.responseRate')}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats?.upcomingCollaborations || 0}</div>
              <div className="text-purple-700 text-sm">{t('ModelDashboard.secondaryStats.upcomingCollaborations')}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-rose-600" />
              </div>
              <div className="text-2xl font-bold text-rose-600 mb-1">4.8</div>
              <div className="text-rose-700 text-sm">{t('ModelDashboard.secondaryStats.rating')}</div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl h-full">
            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Zap className="w-5 h-5" />
                {t('ModelDashboard.quickActions.title')}
              </CardTitle>
              <CardDescription className="text-pink-100">
                {t('ModelDashboard.quickActions.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/requests" className="block">
                  <Button className="w-full h-20 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-200 text-blue-700 rounded-2xl flex flex-col gap-2 transition-all duration-300 hover:shadow-lg">
                    <Bell className="w-6 h-6" />
                    <span className="font-medium">{t('ModelDashboard.quickActions.requests')}</span>
                    <div className="relative">
                      {typeof stats?.pendingRequests === "number" && stats.pendingRequests > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                          {stats.pendingRequests}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/modelsoffers" className="block">
                  <Button className="w-full h-20 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-purple-200 text-purple-700 rounded-2xl flex flex-col gap-2 transition-all duration-300 hover:shadow-lg">
                    <ShoppingBag className="w-6 h-6" />
                    <span className="font-medium">{t('ModelDashboard.quickActions.offers')}</span>
                  </Button>
                </Link>

                <Link href="/dashboard/models/analytics" className="block">
                  <Button className="w-full h-20 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-200 text-green-700 rounded-2xl flex flex-col gap-2 transition-all duration-300 hover:shadow-lg">
                    <BarChart3 className="w-6 h-6" />
                    <span className="font-medium">{t('ModelDashboard.quickActions.analytics')}</span>
                  </Button>
                </Link>

                <Link href="/dashboard/models/wallet" className="block">
                  <Button className="w-full h-20 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-200 text-amber-700 rounded-2xl flex flex-col gap-2 transition-all duration-300 hover:shadow-lg">
                    <Wallet className="w-6 h-6" />
                    <span className="font-medium">{t('ModelDashboard.quickActions.wallet')}</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ActivityIcon className="w-5 h-5" />
              {t('ModelDashboard.recentActivity.title')}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {t('ModelDashboard.recentActivity.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 text-rose-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t('ModelDashboard.recentActivity.empty')}</p>
                </div>
              ) : (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 bg-rose-50 rounded-2xl border border-rose-200">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'request' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'message' ? 'bg-green-100 text-green-600' :
                      activity.type === 'payment' ? 'bg-amber-100 text-amber-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {activity.type === 'request' && <Handshake className="w-5 h-5" />}
                      {activity.type === 'message' && <MessageSquare className="w-5 h-5" />}
                      {activity.type === 'payment' && <DollarSign className="w-5 h-5" />}
                      {activity.type === 'review' && <Star className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-rose-800">{activity.title}</h4>
                        {activity.isNew && (
                          <Badge className="bg-red-500 text-white text-xs">{t('common.new')}</Badge>
                        )}
                      </div>
                      <p className="text-rose-600 text-sm mb-1">{activity.description}</p>
                      <span className="text-rose-500 text-xs">{activity.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5" />
              {t('ModelDashboard.performance.title')}
            </CardTitle>
            <CardDescription className="text-pink-100">
              {t('ModelDashboard.performance.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-rose-700 font-medium">{t('ModelDashboard.performance.completionRate')}</span>
                <span className="text-rose-600 font-bold">85%</span>
              </div>
              <Progress value={85} className="h-2 bg-rose-200" />
              
              <div className="flex justify-between items-center">
                <span className="text-rose-700 font-medium">{t('ModelDashboard.performance.customerSatisfaction')}</span>
                <span className="text-rose-600 font-bold">94%</span>
              </div>
              <Progress value={94} className="h-2 bg-rose-200" />
              
              <div className="flex justify-between items-center">
                <span className="text-rose-700 font-medium">{t('ModelDashboard.performance.deliverySpeed')}</span>
                <span className="text-rose-600 font-bold">78%</span>
              </div>
              <Progress value={78} className="h-2 bg-rose-200" />
            </div>

            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 border border-rose-200">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-amber-500" />
                <div>
                  <h4 className="font-bold text-rose-800">{t('ModelDashboard.performance.encouragement.title')}</h4>
                  <p className="text-rose-600 text-sm">{t('ModelDashboard.performance.encouragement.description')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Card className="bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-2xl rounded-3xl border-0">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold mb-3">{t('ModelDashboard.cta.title')}</h3>
            <p className="text-pink-100 mb-6 text-lg">
              {t('ModelDashboard.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/models/profile">
                <Button className="bg-white text-rose-600 hover:bg-rose-50 px-8 py-3 rounded-2xl font-bold">
                  {t('ModelDashboard.cta.profile')}
                  <Sparkles className="mr-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/modelsoffers">
                <Button variant="outline" className="border-white text-black hover:bg-white/20 px-8 py-3 rounded-2xl font-bold">
                  {t('ModelDashboard.cta.createOffers')}
                  <PlusIcon className="mr-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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