// app/dashboard/admin/subscriptions/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Gem, DollarSign, Users, XCircle, Search, MoreHorizontal, Ban, Trash2, Sparkles, Crown, TrendingUp, Filter, RefreshCw, Download } from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import { toast } from 'sonner';

interface Subscription {
    id: number;
    userName: string;
    userEmail: string;
    plan_type: string;
    status: 'active' | 'cancelled';
    start_date: string;
    end_date: string;
    price: number;
}

export default function AdminSubscriptionsPage() {
    const { t, i18n } = useTranslation();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [subToCancel, setSubToCancel] = useState<Subscription | null>(null);
    const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);

    const fetchSubscriptions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/subscriptions');
            setSubscriptions(response.data);
        } catch (error) {
            console.error("Failed to fetch subscriptions", error);
            toast.error(t('AdminSubscriptions.toast.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleCancel = async () => {
        if (!subToCancel) return;
        try {
            const promise = api.post(`/admin/subscriptions/${subToCancel.id}/cancel`);
            
            toast.promise(promise, {
                loading: t('AdminSubscriptions.toast.cancelling'),
                success: () => {
                    fetchSubscriptions();
                    setSubToCancel(null);
                    return t('AdminSubscriptions.toast.cancelSuccess');
                },
                error: t('AdminSubscriptions.toast.cancelError'),
            });
        } catch (error) {
            console.error("Failed to cancel subscription", error);
        }
    };

    const handleDelete = async () => {
        if (!subToDelete) return;
        try {
            const promise = api.delete(`/admin/subscriptions/${subToDelete.id}`);
            
            toast.promise(promise, {
                loading: t('AdminSubscriptions.toast.deleting'),
                success: () => {
                    fetchSubscriptions();
                    setSubToDelete(null);
                    return t('AdminSubscriptions.toast.deleteSuccess');
                },
                error: t('AdminSubscriptions.toast.deleteError'),
            });
        } catch (error) {
            console.error("Failed to delete subscription", error);
        }
    };

    const filteredSubscriptions = useMemo(() => {
        return subscriptions
            .filter(sub => statusFilter === 'all' || sub.status === statusFilter)
            .filter(sub => 
                sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [subscriptions, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === 'active');
        return {
            total: subscriptions.length,
            active: activeSubs.length,
            cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
            mrr: activeSubs.reduce((sum, sub) => sum + (sub.price || 99), 0)
        };
    }, [subscriptions]);

    const getStatusConfig = (status: Subscription['status']) => {
        return {
            active: { 
                label: t('AdminSubscriptions.status.active'), 
                color: 'bg-green-100 text-green-700 border-green-200',
                icon: <Gem className="w-3 h-3 ml-1" />
            },
            cancelled: { 
                label: t('AdminSubscriptions.status.cancelled'), 
                color: 'bg-amber-100 text-amber-700 border-amber-200',
                icon: <XCircle className="w-3 h-3 ml-1" />
            }
        }[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: null };
    };

    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const exportSubscriptions = () => {
        toast.info(t('AdminSubscriptions.toast.exportPreparing'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            
            <AdminNav />
            
            <header className="mb-8 text-center relative">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                        <Gem className="h-8 w-8 text-rose-500" />
                    </div>
                    <Sparkles className="h-6 w-6 text-rose-300" />
                    <Crown className="h-6 w-6 text-rose-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {t('AdminSubscriptions.title')}
                </h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                    {t('AdminSubscriptions.subtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
                        <div className="text-rose-700 text-sm">{t('AdminSubscriptions.stats.total')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
                        <div className="text-green-700 text-sm">{t('AdminSubscriptions.stats.active')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-amber-600 mb-1">{stats.cancelled}</div>
                        <div className="text-amber-700 text-sm">{t('AdminSubscriptions.stats.cancelled')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', minimumFractionDigits: 0 }).format(stats.mrr)}
                        </div>
                        <div className="text-purple-700 text-sm">{t('AdminSubscriptions.stats.mrr')}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl mb-8">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                                <Input
                                    placeholder={t('AdminSubscriptions.search.placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                                />
                            </div>
                            
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl">
                                        <Filter className="w-4 h-4 ml-2" />
                                        {statusFilter === 'all' ? t('AdminSubscriptions.filters.status.all') : 
                                         statusFilter === 'active' ? t('AdminSubscriptions.filters.status.active') : t('AdminSubscriptions.filters.status.cancelled')}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="border-rose-200 rounded-xl">
                                    <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-rose-700">
                                        {t('AdminSubscriptions.filters.status.all')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('active')} className="text-green-600">
                                        {t('AdminSubscriptions.filters.status.active')}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="text-amber-600">
                                        {t('AdminSubscriptions.filters.status.cancelled')}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                onClick={exportSubscriptions}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                            >
                                <Download className="w-4 h-4 ml-2" />
                                {t('AdminSubscriptions.export')}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={fetchSubscriptions}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4 ml-2" />
                                {t('common.refresh')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Gem className="w-6 h-6" />
                                {t('AdminSubscriptions.table.title')}
                            </CardTitle>
                            <CardDescription className="text-pink-100">
                                {t('AdminSubscriptions.table.subtitle', { count: filteredSubscriptions.length })}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {t('AdminSubscriptions.table.count', { count: filteredSubscriptions.length })}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptions.table.headers.user')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptions.table.headers.plan')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptions.table.headers.status')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptions.table.headers.startDate')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptions.table.headers.endDate')}</TableHead>
                                <TableHead className="text-rose-800 font-bold text-left">{t('AdminSubscriptions.table.headers.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
                                            <p className="text-rose-700 font-medium">{t('AdminSubscriptions.loading')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredSubscriptions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <Gem className="w-16 h-16 text-rose-300 mb-4" />
                                            <h3 className="font-bold text-xl text-rose-800 mb-2">
                                                {t('AdminSubscriptions.table.empty.title')}
                                            </h3>
                                            <p className="text-rose-600">
                                                {searchTerm || statusFilter !== 'all'
                                                    ? t('AdminSubscriptions.table.empty.filtered')
                                                    : t('AdminSubscriptions.table.empty.noData')
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSubscriptions.map(sub => {
                                    const statusConfig = getStatusConfig(sub.status);
                                    return (
                                        <TableRow key={sub.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-rose-900">{sub.userName}</div>
                                                        <div className="text-rose-600 text-sm">{sub.userEmail}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-rose-800">{sub.plan_type}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${statusConfig.color} flex items-center gap-1`}>
                                                    {statusConfig.icon}
                                                    {statusConfig.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-rose-600 text-sm">
                                                    {formatDate(sub.start_date)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-rose-600 text-sm">
                                                    {formatDate(sub.end_date)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-left">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50 rounded-xl">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="border-rose-200 rounded-xl w-48">
                                                        {sub.status === 'active' && (
                                                            <DropdownMenuItem 
                                                                onClick={() => setSubToCancel(sub)}
                                                                className="text-amber-600"
                                                            >
                                                                <Ban className="w-4 h-4 ml-2" />
                                                                {t('AdminSubscriptions.actions.cancelRenewal')}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem 
                                                            onClick={() => setSubToDelete(sub)} 
                                                            className="text-red-600 focus:text-red-600"
                                                        >
                                                            <Trash2 className="w-4 h-4 ml-2" />
                                                            {t('AdminSubscriptions.actions.deleteRecord')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Cancel Confirmation Dialog */}
            <AlertDialog open={!!subToCancel} onOpenChange={(open) => !open && setSubToCancel(null)}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
                    <AlertDialogHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            <Ban className="h-6 w-6 text-amber-600" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold text-rose-800">
                            {t('AdminSubscriptions.dialog.cancel.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-rose-600 text-lg">
                            {t('AdminSubscriptions.dialog.cancel.description', { name: subToCancel?.userName })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 rounded-2xl px-6 py-2">
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleCancel}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-2xl px-6 py-2 font-bold"
                        >
                            {t('AdminSubscriptions.dialog.cancel.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!subToDelete} onOpenChange={(open) => !open && setSubToDelete(null)}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
                    <AlertDialogHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold text-rose-800">
                            {t('AdminSubscriptions.dialog.delete.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-rose-600 text-lg">
                            {t('AdminSubscriptions.dialog.delete.description', { name: subToDelete?.userName })}
                            <br />
                            <span className="font-bold text-rose-700">
                                {t('AdminSubscriptions.dialog.delete.warning')}
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 rounded-2xl px-6 py-2">
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl px-6 py-2 font-bold"
                        >
                            {t('AdminSubscriptions.dialog.delete.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}