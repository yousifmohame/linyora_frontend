// components/dashboards/CustomerDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { ShoppingBag, Star, Heart, ArrowLeft, Package, Calendar, PersonStanding } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface LatestOrder {
    id: number;
    status: 'pending' | 'completed' | 'cancelled';
    totalAmount: number;
    created_at: string;
}

interface DashboardStats {
    totalOrders: number;
    reviewedProducts: number;
    wishlistItems: number;
    latestOrder: LatestOrder | null;
}

export default function CustomerDashboard() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/customer/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch customer dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchStats();
    }, [user]);

    const getStatusVariant = (status: LatestOrder['status']) => {
        switch (status) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'cancelled': return 'bg-rose-50 text-rose-700 border-rose-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    const getStatusTranslation = (status: LatestOrder['status']): string => {
        return t(`common.orderStatus.${status}`);
    };

    // Replace formatDate to use user's locale
    const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(
        t('common.locale'), 
        { year: 'numeric', month: 'long', day: 'numeric' }
    );


    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 flex items-center justify-center">
                <div className="animate-pulse w-full max-w-5xl space-y-6">
                    <div className="h-8 bg-slate-300 rounded w-64"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-slate-300 rounded-2xl"></div>
                        ))}
                    </div>
                    <div className="h-64 bg-slate-300 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
  <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-4 sm:p-6 lg:p-10">
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <header className="text-center lg:text-right">
        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-l from-slate-800 to-slate-600 bg-clip-text text-transparent">
          {t('CustomerDashboard.welcome', { name: user?.name })}
        </h1>
        <p className="text-slate-600 text-lg mt-2">
          {t('CustomerDashboard.subtitle')}
        </p>
      </header>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Latest Order */}
        <Card className="lg:col-span-2 shadow-2xl border-0 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden transition-transform hover:scale-[1.01] duration-300">
          <CardHeader className="bg-gradient-to-l from-slate-800 to-slate-700 text-white p-6">
            <CardTitle className="text-xl flex items-center gap-3">
              <Package className="h-6 w-6" />
              {t('CustomerDashboard.latestOrder.title')}
            </CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            {stats?.latestOrder ? (
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDate(stats.latestOrder.created_at)}</span>
                    </div>
                    <Badge className={`px-3 py-1.5 border ${getStatusVariant(stats.latestOrder.status)} text-sm font-medium`}>
                      {getStatusTranslation(stats.latestOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <CardDescription className="text-base mb-2">
                      {t('CustomerDashboard.latestOrder.orderId', { id: stats.latestOrder.id })}
                    </CardDescription>
                    <p className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-l from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      {Number(stats.latestOrder.totalAmount).toFixed(2)} {t('common.currency')}
                    </p>
                  </div>
                </div>

                <Link href={`/dashboard/my-orders/${stats.latestOrder.id}`} className="w-full lg:w-auto">
                  <Button className="w-full bg-gradient-to-l from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 hover:shadow-xl">
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    {t('CustomerDashboard.viewDetails')}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 text-lg">{t('CustomerDashboard.latestOrder.noOrders')}</p>
                <Link href="/" className="inline-block cursor-pointer">
                  <Button className="bg-gradient-to-l cursor-pointer from-slate-800 to-slate-700 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all">
                    <ArrowLeft className="ml-2 h-5 w-5" />
                    {t('CustomerDashboard.latestOrder.shopNow')}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Actions */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden h-fit transition-transform hover:scale-[1.01] duration-300">
          <CardHeader className="bg-gradient-to-l from-slate-800 to-slate-700 text-white p-6">
            <CardTitle className="text-xl">{t('CustomerDashboard.quickActions.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { href: '/dashboard/my-orders', label: t('CustomerDashboard.quickActions.myOrders'), icon: ShoppingBag },
              { href: '/dashboard/wishlist', label: t('CustomerDashboard.quickActions.wishlist'), icon: Heart },
              { href: '/dashboard/profile', label: t('CustomerDashboard.quickActions.profile'), icon: PersonStanding },
            ].map((item, idx) => (
              <Link key={idx} href={item.href}>
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 text-right border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all duration-200"
                >
                  <item.icon className="ml-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
}
