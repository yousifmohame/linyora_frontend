// frontend/src/app/dashboard/admin/model-payouts/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '@/lib/axios';
import { ModelPayoutRequest } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import AdminNav from '@/components/dashboards/AdminNav';
import { 
  User, 
  Mail, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Sparkles, 
  Crown,
  TrendingUp,
  Filter,
  Search,
  Download,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const AdminModelPayoutsPage = () => {
    const { t, i18n } = useTranslation();
    const [requests, setRequests] = useState<ModelPayoutRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ModelPayoutRequest | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchPayouts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/admin/model-payouts');
            setRequests(response.data);
        } catch (error) {
            toast.error(t('AdminModelPayouts.toast.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, []);

    const handleUpdateRequest = async (id: number, status: 'approved' | 'rejected') => {
        try {
            // Note: In production, use a proper form/modal for notes instead of `prompt`
            const notes = status === 'rejected' 
                ? prompt(t('PayoutsPage.prompt.rejectionReason')) || t('PayoutsPage.notes.rejectedNoReason')
                : t('PayoutsPage.notes.approved');
            
            const promise = axios.put(`/admin/model-payouts/${id}`, { status, notes });
            
            toast.promise(promise, {
                loading: t('common.saving'),
                success: () => {
                    fetchPayouts();
                    setIsModalOpen(false);
                    return t('AdminModelPayouts.toast.updateSuccess');
                },
                error: t('AdminModelPayouts.toast.updateError'),
            });
        } catch (error) {
            console.error("Failed to update request:", error);
        }
    };

    const handleViewDetails = (request: ModelPayoutRequest) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
        setNotes('');
    };

    const filteredRequests = requests.filter(request => 
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: requests.length,
        pending: requests.filter(r => !r.status || r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        totalAmount: requests.reduce((sum, r) => sum + r.amount, 0),
        pendingAmount: requests.filter(r => !r.status || r.status === 'pending').reduce((sum, r) => sum + r.amount, 0),
    };

    const getStatusBadge = (status?: string) => {
        const statusMap = {
            pending: { 
                icon: <Clock className="w-3 h-3" />, 
                label: t('AdminModelPayouts.status.pending'),
                className: "bg-amber-100 text-amber-700 border-amber-200" 
            },
            approved: { 
                icon: <CheckCircle className="w-3 h-3" />, 
                label: t('AdminModelPayouts.status.approved'), 
                className: "bg-green-100 text-green-700 border-green-200" 
            },
            rejected: { 
                icon: <XCircle className="w-3 h-3" />, 
                label: t('AdminModelPayouts.status.rejected'),
                className: "bg-red-100 text-red-700 border-red-200" 
            },
        };
        
        const actualStatus = status || 'pending';
        const config = statusMap[actualStatus as keyof typeof statusMap] || { 
            icon: <Clock className="w-3 h-3" />, 
            label: "قيد الانتظار", 
            className: "bg-amber-100 text-amber-700 border-amber-200" 
        };
        
        return <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>{config.icon}{config.label}</Badge>;
    };

    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    const currency = i18n.language === 'ar' ? t('common.currency') : 'SAR';

    const exportPayouts = () => {
        toast.info(t('common.system'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            
            <AdminNav />
            
            <header className="mb-8 text-center relative">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                        <User className="h-8 w-8 text-rose-500" />
                    </div>
                    <Sparkles className="h-6 w-6 text-rose-300" />
                    <Crown className="h-6 w-6 text-rose-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {t('AdminModelPayouts.title')}
                </h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                    {t('AdminModelPayouts.subtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
                        <div className="text-rose-700 text-sm">{t('AdminModelPayouts.stats.totalRequests')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</div>
                        <div className="text-amber-700 text-sm">{t('AdminModelPayouts.stats.pendingRequests')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">{stats.approved}</div>
                        <div className="text-green-700 text-sm">{t('AdminModelPayouts.stats.approvedRequests')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
                        <div className="text-red-700 text-sm">{t('AdminModelPayouts.stats.rejectedRequests')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-purple-600 mb-1">
                            {stats.pendingAmount.toLocaleString(locale)}
                        </div>
                        <div className="text-purple-700 text-sm">{t('AdminModelPayouts.stats.pendingAmount')}</div>
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
                                    placeholder={t('AdminModelPayouts.search.placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                onClick={exportPayouts}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                            >
                                <Download className="w-4 h-4 ml-2" />
                                {t('AdminModelPayouts.actions.exportData')}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={fetchPayouts}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                            >
                                <RefreshCw className="w-4 h-4 ml-2" />
                                {t('AdminModelPayouts.actions.refresh')}
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
                                <User className="w-6 h-6" />
                                {t('AdminModelPayouts.title')}
                            </CardTitle>
                            <CardDescription className="text-pink-100">
                                {t('PayoutsPage.table.empty').replace('لا توجد طلبات سحب معلقة حاليًا.', `${filteredRequests.length} ${t('common.users')}`)}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {filteredRequests.length} {t('common.users')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                                <TableHead className="text-rose-800 font-bold">{t('AdminModelPayouts.table.model')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminModelPayouts.table.email')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminModelPayouts.table.amount')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminModelPayouts.table.status')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminModelPayouts.table.date')}</TableHead>
                                <TableHead className="text-rose-800 font-bold text-left">{t('AdminModelPayouts.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
                                            <p className="text-rose-700 font-medium">{t('AdminModelPayouts.loading')}</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center">
                                            <User className="w-16 h-16 text-rose-300 mb-4" />
                                            <h3 className="font-bold text-xl text-rose-800 mb-2">{t('AdminModelPayouts.empty.noRequests')}</h3>
                                            <p className="text-rose-600">
                                                {searchTerm
                                                    ? t('AdminModelPayouts.empty.noResults')
                                                    : t('AdminModelPayouts.empty.noRequests')
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredRequests.map((req) => (
                                    <TableRow key={req.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div className="font-medium text-rose-900">{req.userName}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-rose-600 text-sm">{req.userEmail}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-bold text-rose-600 text-lg">
                                                {req.amount.toLocaleString(locale)} {currency}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(req.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-rose-600 text-sm">
                                                {new Date(req.created_at).toLocaleDateString(locale, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => handleViewDetails(req)}
                                                    className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                                                >
                                                    <Eye className="w-4 h-4 ml-2" />
                                                    {t('AdminModelPayouts.table.viewDetails')}
                                                </Button>
                                                {(!req.status || req.status === 'pending') && (
                                                    <>
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleUpdateRequest(req.id, 'approved')}
                                                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
                                                        >
                                                            <CheckCircle className="w-4 h-4 ml-2" />
                                                            {t('AdminModelPayouts.table.approve')}
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive" 
                                                            onClick={() => handleUpdateRequest(req.id, 'rejected')}
                                                            className="rounded-xl"
                                                        >
                                                            <XCircle className="w-4 h-4 ml-2" />
                                                            {t('AdminModelPayouts.table.reject')}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-md">
                    {selectedRequest && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-rose-800 text-2xl">
                                    <Eye className="w-6 h-6" />
                                    {t('AdminModelPayouts.dialog.title')}
                                </DialogTitle>
                                <DialogDescription className="text-rose-600 text-lg">
                                    {t('AdminModelPayouts.dialog.requestAmount', { 
                                        amount: selectedRequest.amount.toLocaleString(locale), 
                                        currency 
                                    })}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <p className="font-semibold text-rose-800">{t('PayoutsPage.dialog.name')}:</p>
                                        <p className="text-rose-600">{selectedRequest.userName}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-semibold text-rose-800">{t('PayoutsPage.dialog.email')}:</p>
                                        <p className="text-rose-600">{selectedRequest.userEmail}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-semibold text-rose-800">{t('AdminModelPayouts.table.amount')}:</p>
                                        <p className="text-rose-600 font-bold">{selectedRequest.amount.toLocaleString(locale)} {currency}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-semibold text-rose-800">{t('AdminModelPayouts.dialog.requestDate')}:</p>
                                        <p className="text-rose-600">
                                            {new Date(selectedRequest.created_at).toLocaleDateString(locale)}
                                        </p>
                                    </div>
                                </div>
                                
                                {(!selectedRequest.status || selectedRequest.status === 'pending') && (
                                    <div className="pt-4 border-t border-rose-200">
                                        <h4 className="font-semibold text-rose-800 mb-3">{t('PayoutsPage.prompt.rejectionReason')}</h4>
                                        <div className="flex gap-3">
                                            <Button 
                                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl"
                                                onClick={() => handleUpdateRequest(selectedRequest.id, 'approved')}
                                            >
                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                {t('AdminModelPayouts.table.approve')}
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                className="flex-1 rounded-xl"
                                                onClick={() => handleUpdateRequest(selectedRequest.id, 'rejected')}
                                            >
                                                <XCircle className="w-4 h-4 ml-2" />
                                                {t('AdminModelPayouts.table.reject')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminModelPayoutsPage;