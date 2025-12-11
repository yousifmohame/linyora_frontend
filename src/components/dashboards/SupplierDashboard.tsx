'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import SupplierNav from './SupplierNav';
import {
  Package,
  ShoppingCart,
  Wallet,
  ShieldAlert,
  Clock,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalStock: number;
  totalOrders: number;
  availableBalance: string;
}

export default function SupplierDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.verification_status === 'approved') {
      const fetchStats = async () => {
        try {
          const response = await api.get('/supplier/dashboard');
          setStats(response.data);
        } catch (error) {
          console.error('Failed to fetch supplier dashboard stats:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-blue-700 text-base sm:text-lg font-medium">
            {t('supplierdashboard.loading')}
          </p>
        </div>
      </div>
    );
  }

  if (user?.verification_status !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6">
        <SupplierNav />
        <div className="max-w-xl mx-auto mt-6 sm:mt-8">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
              <CardTitle className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-3">
                <ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6" />
                {t('supplierdashboard.verification.title')}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center p-4 sm:p-6">
              {user?.verification_status === 'pending' ? (
                <Alert className="bg-amber-50 border-amber-200 rounded-xl sm:rounded-2xl p-4">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto sm:mx-0" />
                  <AlertTitle className="text-amber-800 font-bold mt-2">
                    {t('supplierdashboard.verification.pending.title')}
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 mt-1 sm:mt-2 text-sm sm:text-base">
                    {t('supplierdashboard.verification.pending.description')}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl sm:rounded-2xl p-4">
                  <ShieldAlert className="h-5 w-5 text-red-600 mx-auto sm:mx-0" />
                  <AlertTitle className="text-red-800 font-bold mt-2">
                    {t('supplierdashboard.verification.required.title')}
                  </AlertTitle>
                  <AlertDescription className="text-red-700 mt-1 sm:mt-2 text-sm sm:text-base">
                    {t('supplierdashboard.verification.required.description')}
                  </AlertDescription>
                  <Link href="/dashboard/supplier/verification" className="mt-3 inline-block">
                    <Button className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl px-5 py-2 font-bold text-sm sm:text-base">
                      {t('supplierdashboard.verification.required.button')}
                    </Button>
                  </Link>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const safeStats = stats || {
    totalProducts: 0,
    totalStock: 0,
    totalOrders: 0,
    availableBalance: '0.00',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6 relative">
      {/* Background circles */}
      <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      {/* Header */}
      <header className="mb-6 sm:mb-8 text-center relative mt-4 sm:mt-0">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-lg">
            <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          </div>
          <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-blue-300" />
          <Target className="h-4 w-4 sm:h-6 sm:w-6 text-blue-300" />
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3">
          {t('supplierdashboard.welcome', { name: user?.name || '' })}
        </h1>

        <p className="text-blue-700 text-sm sm:text-lg max-w-xl mx-auto px-3">
          {t('supplierdashboard.subtitle')}
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-6 sm:mb-8">

        {/* Balance */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  {t('supplierdashboard.stats.availableBalance')}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900">
                  {parseFloat(safeStats.availableBalance || '0').toFixed(2)}
                  <span className="text-xs sm:text-sm font-medium text-blue-600">
                    {' '}{t('supplierdashboard.currency')}
                  </span>
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl sm:rounded-2xl">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  {t('supplierdashboard.stats.totalProducts')}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900">{safeStats.totalProducts}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  {t('supplierdashboard.stats.totalOrders')}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-amber-900">{safeStats.totalOrders}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl sm:rounded-2xl">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock */}
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-2xl transition-all">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">
                  {t('supplierdashboard.stats.totalStock')}
                </p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900">{safeStats.totalStock}</p>
              </div>
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl sm:rounded-2xl">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-2xl sm:rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold flex gap-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
              {t('supplierdashboard.quickActions.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              
              <Link href="/dashboard/supplier/products">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl py-2.5 sm:py-3 font-bold text-sm sm:text-base">
                  {t('supplierdashboard.quickActions.addProduct')}
                </Button>
              </Link>

              <Link href="/dashboard/supplier/orders">
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl py-2.5 sm:py-3 font-bold text-sm sm:text-base"
                >
                  {t('supplierdashboard.quickActions.viewOrders')}
                </Button>
              </Link>

              <Link href="/dashboard/supplier/products">
                <Button
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 rounded-xl py-2.5 sm:py-3 font-bold text-sm sm:text-base"
                >
                  {t('supplierdashboard.quickActions.manageInventory')}
                </Button>
              </Link>

            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
