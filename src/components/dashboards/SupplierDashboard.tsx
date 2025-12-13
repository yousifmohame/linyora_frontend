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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-2"></div>
          <p className="text-blue-700 text-sm font-medium">{t('supplierdashboard.loading')}</p>
        </div>
      </div>
    );
  }

  if (user?.verification_status !== 'approved') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 max-w-full overflow-x-hidden">
        <SupplierNav />
        <div className="max-w-md mx-auto mt-6">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-3">
              <CardTitle className="text-lg font-bold flex items-center justify-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                {t('supplierdashboard.verification.title')}
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center p-4">
              {user?.verification_status === 'pending' ? (
                <Alert className="bg-amber-50 border-amber-200 rounded-xl p-3">
                  <Clock className="h-5 w-5 text-amber-600 mx-auto" />
                  <AlertTitle className="text-amber-800 font-bold mt-2">
                    {t('supplierdashboard.verification.pending.title')}
                  </AlertTitle>
                  <AlertDescription className="text-amber-700 mt-1 text-sm">
                    {t('supplierdashboard.verification.pending.description')}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive" className="bg-red-50 border-red-200 rounded-xl p-3">
                  <ShieldAlert className="h-5 w-5 text-red-600 mx-auto" />
                  <AlertTitle className="text-red-800 font-bold mt-2">
                    {t('supplierdashboard.verification.required.title')}
                  </AlertTitle>
                  <AlertDescription className="text-red-700 mt-1 text-sm">
                    {t('supplierdashboard.verification.required.description')}
                  </AlertDescription>
                  <Link href="/dashboard/supplier/verification" className="mt-2 inline-block">
                    <Button className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg px-4 py-1.5 font-bold text-sm">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 max-w-full overflow-x-hidden relative">
      {/* Background circles */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      {/* Header */}
      <header className="mb-6 text-center relative mt-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-white rounded-lg shadow-md">
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <Sparkles className="h-3 w-3 text-blue-300" />
          <Target className="h-3 w-3 text-blue-300" />
        </div>

        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
          {t('supplierdashboard.welcome', { name: user?.name || '' })}
        </h1>

        <p className="text-blue-700 text-xs max-w-xs mx-auto px-2">
          {t('supplierdashboard.subtitle')}
        </p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-7xl mx-auto mb-6 min-w-0">
        {[
          {
            title: t('supplierdashboard.stats.availableBalance'),
            value: `${parseFloat(safeStats.availableBalance || '0').toFixed(2)} ${t('supplierdashboard.currency')}`,
            icon: Wallet,
            color: 'blue',
            gradient: 'from-blue-500 to-indigo-500',
          },
          {
            title: t('supplierdashboard.stats.totalProducts'),
            value: safeStats.totalProducts.toString(),
            icon: Package,
            color: 'green',
            gradient: 'from-green-500 to-emerald-500',
          },
          {
            title: t('supplierdashboard.stats.totalOrders'),
            value: safeStats.totalOrders.toString(),
            icon: ShoppingCart,
            color: 'amber',
            gradient: 'from-amber-500 to-orange-500',
          },
          
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <Card
              key={idx}
              className="bg-white/80 backdrop-blur-sm border border-opacity-50 shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow min-w-0"
              style={{ borderColor: `rgba(125, 125, 125, 0.3)` }}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="overflow-hidden">
                    <p className={`text-${item.color}-600 text-xs font-medium mb-1`}>
                      {item.title}
                    </p>
                    <p className={`text-sm font-bold text-${item.color}-900 truncate`}>
                      {item.value}
                    </p>
                  </div>
                  <div className={`p-2 bg-gradient-to-r ${item.gradient} rounded-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-3">
            <CardTitle className="text-lg font-bold flex gap-2">
              <Users className="h-4 w-4" />
              {t('supplierdashboard.quickActions.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="grid grid-cols-1 gap-2">
              <Link href="/dashboard/supplier/products" className="w-full">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg py-2 font-bold text-xs">
                  {t('supplierdashboard.quickActions.addProduct')}
                </Button>
              </Link>

              <Link href="/dashboard/supplier/orders" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg py-2 font-bold text-xs"
                >
                  {t('supplierdashboard.quickActions.viewOrders')}
                </Button>
              </Link>

              <Link href="/dashboard/supplier/products" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 rounded-lg py-2 font-bold text-xs"
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