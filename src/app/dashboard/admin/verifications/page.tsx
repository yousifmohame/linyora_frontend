'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { 
    Search, 
    Filter, 
    MoreHorizontal, 
    UserCheck, 
    Clock, 
    Download,
    RefreshCw,
    Users,
    Building,
    Shield,
    Sparkles,
    Crown,
    Target,
    Zap,
    Eye,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Mail,
    Calendar,
    Phone,
    MapPin,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface VerificationRequest {
    id: number;
    name: string;
    email: string;
    phone?: string;
    business_name: string;
    business_type?: string;
    status: 'pending' | 'approved' | 'rejected';
    submitted_at: string;
    user_type: 'individual' | 'business';
    documents_count: number;
    review_notes?: string;
    estimated_duration?: string;
    priority: 'low' | 'medium' | 'high';
    location?: string;
}

export default function VerificationsPage() {
    const { t, i18n } = useTranslation();
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [filteredRequests, setFilteredRequests] = useState<VerificationRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'individual' | 'business'>('all');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [quickActionDialog, setQuickActionDialog] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | ''>('');
    const [rejectionReason, setRejectionReason] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        filterRequests();
    }, [requests, searchTerm, statusFilter, typeFilter, priorityFilter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/verifications');
            setRequests(response.data);
            toast.success(t('Verifications.toast.fetchSuccess'));
        } catch (error) {
            console.error("Failed to fetch verification requests", error);
            toast.error(t('Verifications.toast.fetchError'));
        } finally {
            setLoading(false);
        }
    };

    const filterRequests = () => {
        let filtered = requests;
        if (searchTerm) {
            filtered = filtered.filter(request =>
                request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                request.phone?.includes(searchTerm)
            );
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(request => request.status === statusFilter);
        }
        if (typeFilter !== 'all') {
            filtered = filtered.filter(request => request.user_type === typeFilter);
        }
        if (priorityFilter !== 'all') {
            filtered = filtered.filter(request => request.priority === priorityFilter);
        }
        setFilteredRequests(filtered);
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { 
                label: t('Verifications.status.pending'), 
                variant: 'secondary' as const,
                icon: <Clock className="w-3 h-3 ml-1" />
            },
            approved: { 
                label: t('Verifications.status.approved'), 
                variant: 'default' as const,
                icon: <CheckCircle className="w-3 h-3 ml-1" />
            },
            rejected: { 
                label: t('Verifications.status.rejected'), 
                variant: 'destructive' as const,
                icon: <XCircle className="w-3 h-3 ml-1" />
            }
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: { label: t('Verifications.priority.low'), className: 'bg-gray-100 text-gray-700' },
            medium: { label: t('Verifications.priority.medium'), className: 'bg-amber-100 text-amber-700' },
            high: { label: t('Verifications.priority.high'), className: 'bg-red-100 text-red-700' }
        };
        const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const getUserTypeIcon = (userType: string) => {
        return userType === 'business' ? 
            <Building className="w-4 h-4 text-blue-500" /> : 
            <UserCheck className="w-4 h-4 text-green-500" />;
    };

    const handleReview = (id: number) => {
        router.push(`/dashboard/admin/verifications/${id}`);
    };

    const handleQuickAction = (request: VerificationRequest, action: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setActionType(action);
        setQuickActionDialog(true);
    };

    const confirmQuickAction = async () => {
        if (!selectedRequest) return;
        try {
            const payload = {
                status: actionType === 'approve' ? 'approved' : 'rejected',
                review_notes: actionType === 'reject' ? rejectionReason : undefined
            };
            const promise = api.put(`/admin/verifications/${selectedRequest.id}`, payload);
            toast.promise(promise, {
                loading: t('Verifications.toast.updating', { action: actionType === 'approve' ? t('common.approve') : t('common.reject') }),
                success: () => {
                    fetchRequests();
                    setQuickActionDialog(false);
                    setRejectionReason('');
                    return t('Verifications.toast.updateSuccess', { action: actionType === 'approve' ? t('common.approved') : t('common.rejected') });
                },
                error: t('Verifications.toast.updateError', { action: actionType === 'approve' ? t('common.approve') : t('common.reject') }),
            });
        } catch (error) {
            console.error('Failed to update verification status', error);
        }
    };

    const exportData = (format: string) => {
        toast.info(t('Verifications.toast.exportPreparing', { format }));
        // Implementation for export functionality
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(req => req.status === 'pending').length,
        approved: requests.filter(req => req.status === 'approved').length,
        rejected: requests.filter(req => req.status === 'rejected').length,
        business: requests.filter(req => req.user_type === 'business').length,
        individual: requests.filter(req => req.user_type === 'individual').length,
    };

    const pendingPriorityCount = {
        high: requests.filter(req => req.status === 'pending' && req.priority === 'high').length,
        medium: requests.filter(req => req.status === 'pending' && req.priority === 'medium').length,
        low: requests.filter(req => req.status === 'pending' && req.priority === 'low').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <AdminNav />
            
            {/* Header Section */}
            <header className="mb-8 text-center relative">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                        <Shield className="h-8 w-8 text-rose-500" />
                    </div>
                    <Sparkles className="h-6 w-6 text-rose-300" />
                    <Target className="h-6 w-6 text-rose-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {t('Verifications.title')}
                </h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                    {t('Verifications.subtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
            </header>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
                            <div className="text-rose-700 text-sm">{t('Verifications.stats.total')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</div>
                            <div className="text-amber-700 text-sm">{t('Verifications.stats.pending')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600 mb-1">{stats.approved}</div>
                            <div className="text-green-700 text-sm">{t('Verifications.stats.approved')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
                            <div className="text-red-700 text-sm">{t('Verifications.stats.rejected')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.business}</div>
                            <div className="text-blue-700 text-sm">{t('Verifications.stats.business')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.individual}</div>
                            <div className="text-purple-700 text-sm">{t('Verifications.stats.individual')}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Priority Overview */}
                {stats.pending > 0 && (
                    <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
                        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-2xl">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <AlertCircle className="w-5 h-5" />
                                {t('Verifications.priorityOverview.title')}
                                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                    {t('Verifications.priorityOverview.count', { count: stats.pending })}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-200">
                                    <div className="text-2xl font-bold text-red-600 mb-1">{pendingPriorityCount.high}</div>
                                    <div className="text-red-700 text-sm">{t('Verifications.priority.high')}</div>
                                </div>
                                <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-200">
                                    <div className="text-2xl font-bold text-amber-600 mb-1">{pendingPriorityCount.medium}</div>
                                    <div className="text-amber-700 text-sm">{t('Verifications.priority.medium')}</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-2xl border border-gray-200">
                                    <div className="text-2xl font-bold text-gray-600 mb-1">{pendingPriorityCount.low}</div>
                                    <div className="text-gray-700 text-sm">{t('Verifications.priority.low')}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters and Actions */}
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative flex-1">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                                    <Input
                                        placeholder={t('Verifications.search.placeholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                                    <SelectTrigger className="w-40 border-rose-200 focus:border-rose-400 rounded-xl">
                                        <SelectValue placeholder={t('Verifications.filters.status.all')} />
                                    </SelectTrigger>
                                    <SelectContent className="border-rose-200 rounded-xl">
                                        <SelectItem value="all">{t('Verifications.filters.status.all')}</SelectItem>
                                        <SelectItem value="pending">{t('Verifications.filters.status.pending')}</SelectItem>
                                        <SelectItem value="approved">{t('Verifications.filters.status.approved')}</SelectItem>
                                        <SelectItem value="rejected">{t('Verifications.filters.status.rejected')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                                    <SelectTrigger className="w-32 border-rose-200 focus:border-rose-400 rounded-xl">
                                        <SelectValue placeholder={t('Verifications.filters.type.all')} />
                                    </SelectTrigger>
                                    <SelectContent className="border-rose-200 rounded-xl">
                                        <SelectItem value="all">{t('Verifications.filters.type.all')}</SelectItem>
                                        <SelectItem value="individual">{t('Verifications.filters.type.individual')}</SelectItem>
                                        <SelectItem value="business">{t('Verifications.filters.type.business')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                                    <SelectTrigger className="w-32 border-rose-200 focus:border-rose-400 rounded-xl">
                                        <SelectValue placeholder={t('Verifications.filters.priority.all')} />
                                    </SelectTrigger>
                                    <SelectContent className="border-rose-200 rounded-xl">
                                        <SelectItem value="all">{t('Verifications.filters.priority.all')}</SelectItem>
                                        <SelectItem value="high">{t('Verifications.filters.priority.high')}</SelectItem>
                                        <SelectItem value="medium">{t('Verifications.filters.priority.medium')}</SelectItem>
                                        <SelectItem value="low">{t('Verifications.filters.priority.low')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={fetchRequests}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                                >
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    {t('common.refresh')}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl">
                                            <Download className="w-4 h-4 ml-2" />
                                            {t('Verifications.export.title')}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="border-rose-200 rounded-xl">
                                        <DropdownMenuItem onClick={() => exportData('PDF')}>PDF</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => exportData('Excel')}>Excel</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => exportData('CSV')}>CSV</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <Shield className="w-6 h-6" />
                                    {t('Verifications.table.title')}
                                </CardTitle>
                                <CardDescription className="text-pink-100">
                                    {t('Verifications.table.subtitle', { count: filteredRequests.length })}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                {t('Verifications.table.count', { count: filteredRequests.length })}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                                        <TableHead className="text-rose-800 font-bold">{t('Verifications.table.headers.user')}</TableHead>
                                        <TableHead className="text-rose-800 font-bold">{t('Verifications.table.headers.business')}</TableHead>
                                        <TableHead className="text-rose-800 font-bold">{t('Verifications.table.headers.type')}</TableHead>
                                        <TableHead className="text-rose-800 font-bold">{t('Verifications.table.headers.status')}</TableHead>
                                        <TableHead className="text-rose-800 font-bold">{t('Verifications.table.headers.priority')}</TableHead>
                                        <TableHead className="text-rose-800 font-bold">{t('Verifications.table.headers.date')}</TableHead>
                                        <TableHead className="text-rose-800 font-bold">{t('Verifications.table.headers.documents')}</TableHead>
                                        <TableHead className="text-rose-800 font-bold text-left">{t('Verifications.table.headers.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, index) => (
                                            <TableRow key={index} className="border-rose-100">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="w-10 h-10 rounded-full" />
                                                        <div className="space-y-2">
                                                            <Skeleton className="h-4 w-32" />
                                                            <Skeleton className="h-3 w-24" />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                                <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                                                <TableCell><Skeleton className="h-9 w-28 ml-auto" /></TableCell>
                                            </TableRow>
                                        ))
                                    ) : filteredRequests.length > 0 ? (
                                        filteredRequests.map((request) => (
                                            <TableRow key={request.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                            {request.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-rose-900">{request.name}</div>
                                                            <div className="flex items-center gap-2 text-rose-600 text-sm">
                                                                <Mail className="w-3 h-3" />
                                                                {request.email}
                                                            </div>
                                                            {request.phone && (
                                                                <div className="flex items-center gap-2 text-rose-600 text-sm">
                                                                    <Phone className="w-3 h-3" />
                                                                    {request.phone}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-rose-800">{request.business_name}</div>
                                                    {request.business_type && (
                                                        <div className="text-rose-600 text-sm">{request.business_type}</div>
                                                    )}
                                                    {request.location && (
                                                        <div className="flex items-center gap-1 text-rose-500 text-xs">
                                                            <MapPin className="w-3 h-3" />
                                                            {request.location}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {getUserTypeIcon(request.user_type)}
                                                        <span className="text-sm font-medium">
                                                            {request.user_type === 'business' ? t('Verifications.type.business') : t('Verifications.type.individual')}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(request.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {getPriorityBadge(request.priority)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm text-rose-600">
                                                        {formatDate(request.submitted_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        <FileText className="w-3 h-3 ml-1" />
                                                        {t('Verifications.documents.count', { count: request.documents_count })}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 justify-end">
                                                        <Button 
                                                            size="sm"
                                                            onClick={() => handleReview(request.id)}
                                                            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
                                                        >
                                                            <Eye className="w-4 h-4 ml-2" />
                                                            {t('Verifications.actions.review')}
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-600 hover:bg-rose-50 rounded-xl">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="border-rose-200 rounded-xl w-48">
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleQuickAction(request, 'approve')}
                                                                    disabled={request.status === 'approved'}
                                                                    className="text-green-600"
                                                                >
                                                                    <CheckCircle className="w-4 h-4 ml-2" />
                                                                    {t('Verifications.actions.quickApprove')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleQuickAction(request, 'reject')}
                                                                    disabled={request.status === 'rejected'}
                                                                    className="text-red-600"
                                                                >
                                                                    <XCircle className="w-4 h-4 ml-2" />
                                                                    {t('Verifications.actions.quickReject')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator className="bg-rose-200" />
                                                                <DropdownMenuItem>
                                                                    <FileText className="w-4 h-4 ml-2" />
                                                                    {t('Verifications.actions.downloadDocs')}
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Mail className="w-4 h-4 ml-2" />
                                                                    {t('Verifications.actions.sendEmail')}
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="h-32 text-center">
                                                <div className="flex flex-col items-center justify-center space-y-4">
                                                    <Shield className="w-16 h-16 text-rose-300" />
                                                    <div className="text-rose-600 text-lg">
                                                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all'
                                                            ? t('Verifications.table.noResultsFiltered')
                                                            : t('Verifications.table.noResults')
                                                        }
                                                    </div>
                                                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || priorityFilter !== 'all') && (
                                                        <Button 
                                                            variant="outline" 
                                                            onClick={() => {
                                                                setSearchTerm('');
                                                                setStatusFilter('all');
                                                                setTypeFilter('all');
                                                                setPriorityFilter('all');
                                                            }}
                                                            className="border-rose-200 text-rose-700 hover:bg-rose-50"
                                                        >
                                                            {t('Verifications.filters.reset')}
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Action Dialog */}
            <Dialog open={quickActionDialog} onOpenChange={setQuickActionDialog}>
                <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-800">
                            {actionType === 'approve' ? 
                                <CheckCircle className="w-5 h-5 text-green-500" /> : 
                                <XCircle className="w-5 h-5 text-red-500" />
                            }
                            {actionType === 'approve' 
                                ? t('Verifications.dialog.approve.title') 
                                : t('Verifications.dialog.reject.title')}
                        </DialogTitle>
                        <DialogDescription>
                            {actionType === 'approve' 
                                ? t('Verifications.dialog.approve.description', { name: selectedRequest?.name })
                                : t('Verifications.dialog.reject.description', { name: selectedRequest?.name })
                            }
                        </DialogDescription>
                    </DialogHeader>
                    {actionType === 'reject' && (
                        <div className="space-y-4">
                            <Label htmlFor="rejection-reason" className="text-rose-800 font-medium">
                                {t('Verifications.dialog.reject.reasonLabel')}
                            </Label>
                            <Textarea
                                id="rejection-reason"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={t('Verifications.dialog.reject.reasonPlaceholder')}
                                className="border-rose-200 focus:border-rose-400 rounded-xl min-h-[100px]"
                            />
                        </div>
                    )}
                    <DialogFooter className="flex gap-3">
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setQuickActionDialog(false);
                                setRejectionReason('');
                            }}
                            className="border-rose-200 text-rose-700 hover:bg-rose-50"
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button 
                            onClick={confirmQuickAction}
                            disabled={actionType === 'reject' && !rejectionReason}
                            className={
                                actionType === 'approve' 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                            }
                        >
                            {actionType === 'approve' 
                                ? t('Verifications.dialog.approve.confirm') 
                                : t('Verifications.dialog.reject.confirm')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}