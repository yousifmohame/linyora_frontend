"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Handshake, CheckCircle, Clock, XCircle, Hourglass, User, Package, ShoppingBag, DollarSign, Calendar, Sparkles, Users } from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';

interface Agreement {
    id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'completed';
    merchantName: string;
    modelName: string;
    productName: string;
    packageTitle: string;
    tierName: string;
    tierPrice: number;
    created_at: string;
}

const AdminAgreementsPage = () => {
    const { t, i18n } = useTranslation();
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAgreements = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/agreements');
            setAgreements(response.data);
        } catch (error) {
            toast.error(t('AdminAgreements.toast.fetchError'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchAgreements();
    }, [fetchAgreements]);

    const getStatusBadge = (status: Agreement['status']) => {
        const statusMap = {
            pending: { 
                icon: <Hourglass className="h-3 w-3 ml-1" />, 
                label: t('AdminAgreements.status.pending'), 
                className: "bg-amber-100 text-amber-800 border-amber-200" 
            },
            accepted: { 
                icon: <Clock className="h-3 w-3 ml-1" />, 
                label: t('AdminAgreements.status.accepted'), 
                className: "bg-blue-100 text-blue-800 border-blue-200" 
            },
            rejected: { 
                icon: <XCircle className="h-3 w-3 ml-1" />, 
                label: t('AdminAgreements.status.rejected'), 
                className: "bg-red-100 text-red-800 border-red-200" 
            },
            completed: { 
                icon: <CheckCircle className="h-3 w-3 ml-1" />, 
                label: t('AdminAgreements.status.completed'), 
                className: "bg-green-100 text-green-800 border-green-200" 
            },
        };
        const config = statusMap[status] || { icon: <Clock />, label: status, className: "bg-gray-100 text-gray-800" };
        return <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>{config.icon}{config.label}</Badge>;
    };

    const stats = {
        total: agreements.length,
        pending: agreements.filter(a => a.status === 'pending').length,
        accepted: agreements.filter(a => a.status === 'accepted').length,
        completed: agreements.filter(a => a.status === 'completed').length,
        revenue: agreements.reduce((sum, a) => {
            const price = parseFloat(String(a.tierPrice).replace(/[^0-9.-]+/g, '')) || 0;
            return sum + price;
        }, 0)
    };

    const formatDate = (dateString: string): string => {
        const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
        return new Date(dateString).toLocaleDateString(locale, {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            
            <AdminNav />
            
            <header className="mb-8 text-center relative">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                        <Handshake className="h-8 w-8 text-rose-500" />
                    </div>
                    <Sparkles className="h-6 w-6 text-rose-300" />
                    <Users className="h-6 w-6 text-rose-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {t('AdminAgreements.title')}
                </h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                    {t('AdminAgreements.subtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
                        <div className="text-rose-700 text-sm">{t('AdminAgreements.stats.total')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</div>
                        <div className="text-amber-700 text-sm">{t('AdminAgreements.stats.pending')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600 mb-1">{stats.accepted}</div>
                        <div className="text-blue-700 text-sm">{t('AdminAgreements.stats.accepted')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
                        <div className="text-green-700 text-sm">{t('AdminAgreements.stats.completed')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
                                style: 'currency',
                                currency: 'SAR',
                                minimumFractionDigits: 0
                            }).format(stats.revenue)}
                        </div>
                        <div className="text-purple-700 text-sm">{t('AdminAgreements.stats.revenue')}</div>
                    </CardContent>
                </Card>
            </div>

            {agreements.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 rounded-3xl shadow-xl">
                    <CardContent className="p-12 text-center">
                        <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Handshake className="w-12 h-12 text-rose-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            {t('AdminAgreements.empty.title')}
                        </h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                            {t('AdminAgreements.empty.description')}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {agreements.map((agreement) => (
                        <Card key={agreement.id} className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-rose-300 rounded-3xl overflow-hidden group">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
                                            <User className="w-4 h-4 text-rose-500" />
                                            <span className="flex-1">
                                                {agreement.merchantName} 
                                                <span className="text-gray-400 mx-2">→</span> 
                                                {agreement.modelName}
                                            </span>
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4"/>
                                            {formatDate(agreement.created_at)}
                                        </CardDescription>
                                    </div>
                                    {getStatusBadge(agreement.status)}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200">
                                    <p className="text-sm font-semibold text-rose-700 flex items-center gap-2 mb-2">
                                        <Package className="w-4 h-4"/>
                                        {t('AdminAgreements.card.package')}
                                    </p>
                                    <p className="font-bold text-gray-900">
                                        {agreement.packageTitle} - 
                                        <span className="text-rose-600"> {agreement.tierName}</span>
                                    </p>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                                    <p className="text-sm font-semibold text-blue-700 flex items-center gap-2 mb-2">
                                        <ShoppingBag className="w-4 h-4"/>
                                        {t('AdminAgreements.card.product')}
                                    </p>
                                    <p className="font-bold text-gray-900">{agreement.productName}</p>
                                </div>

                                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                                    <p className="text-sm font-semibold text-green-700 flex items-center gap-2 mb-2">
                                        <DollarSign className="w-4 h-4"/>
                                        {t('AdminAgreements.card.price')}
                                    </p>
                                    <p className="font-bold text-2xl text-green-800">
                                        {new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
                                            style: 'currency',
                                            currency: 'SAR',
                                            minimumFractionDigits: 0
                                        }).format(agreement.tierPrice)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAgreementsPage;