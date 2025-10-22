// app/dashboard/admin/orders/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Eye, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Truck,
  Package,
  Sparkles,
  MoreHorizontal,
  User,
  Calendar,
  Mail
} from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import Image from 'next/image';
import { toast } from 'sonner';

interface Order {
    id: number;
    customerName: string;
    created_at: string;
    status: 'pending' | 'completed' | 'cancelled' | 'shipped' | 'processing';
    totalAmount: number;
    customerEmail?: string;
    itemsCount?: number;
}

interface OrderItem {
    productName: string;
    color: string;
    images: string; // JSON string
    quantity: number;
    price: number;
}

interface OrderDetails {
    details: {
        id: number;
        status: Order['status'];
        created_at: string;
        customerName: string;
        customerEmail: string;
        totalAmount: number;
        shippingAddress?: string;
        phoneNumber?: string;
    };
    items: OrderItem[];
}

export default function AdminOrdersPage() {
    const { t, i18n } = useTranslation();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await api.get<Order[]>('/admin/orders');
            const normalizedOrders = response.data.map((order) => ({
                ...order,
                totalAmount:
                    typeof order.totalAmount === 'number'
                        ? order.totalAmount
                        : parseFloat(order.totalAmount) || 0,
            }));
            setOrders(normalizedOrders);
        } catch (error) {
            console.error('Failed to fetch orders', error);
            toast.error(t('AdminOrdersPage.detailsLoadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleViewDetails = async (orderId: number) => {
        setIsDetailsLoading(true);
        setSelectedOrder(null);
        try {
            const response = await api.get<OrderDetails>(`/admin/orders/${orderId}`);
            const data = response.data;
            if (typeof data.details.totalAmount !== 'number') {
                data.details.totalAmount = parseFloat(data.details.totalAmount as unknown as string) || 0;
            }
            setSelectedOrder(data);
        } catch (error) {
            console.error('Failed to fetch order details', error);
            toast.error(t('AdminOrdersPage.detailsLoadFailed'));
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId: number, newStatus: Order['status']) => {
        try {
            const promise = api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            
            toast.promise(promise, {
                loading: t('common.saving'),
                success: () => {
                    fetchOrders();
                    return t('common.system');
                },
                error: t('AdminOrdersPage.detailsLoadFailed'),
            });
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders
            .filter((order) => statusFilter === 'all' || order.status === statusFilter)
            .filter((order) =>
                order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `#${order.id}`.includes(searchTerm) ||
                order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [orders, searchTerm, statusFilter]);

    const stats = useMemo(() => {
        return {
            total: orders.length,
            pending: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
            completed: orders.filter((o) => o.status === 'completed').length,
            shipped: orders.filter((o) => o.status === 'shipped').length,
            revenue: orders.reduce((sum, o) => {
                return o.status === 'completed' ? sum + o.totalAmount : sum;
            }, 0),
            cancelled: orders.filter((o) => o.status === 'cancelled').length,
        };
    }, [orders]);

    const getStatusConfig = (status: Order['status']) => {
        return {
            pending: { 
                label: t('AdminOrdersPage.status.pending'), 
                variant: 'bg-amber-100 text-amber-700 border-amber-200',
                icon: Clock
            },
            processing: { 
                label: t('AdminOrdersPage.status.processing'), 
                variant: 'bg-blue-100 text-blue-700 border-blue-200',
                icon: Package
            },
            shipped: { 
                label: t('AdminOrdersPage.status.shipped'), 
                variant: 'bg-purple-100 text-purple-700 border-purple-200',
                icon: Truck
            },
            completed: { 
                label: t('AdminOrdersPage.status.completed'), 
                variant: 'bg-green-100 text-green-700 border-green-200',
                icon: CheckCircle
            },
            cancelled: { 
                label: t('AdminOrdersPage.status.cancelled'), 
                variant: 'bg-red-100 text-red-700 border-red-200',
                icon: Clock
            },
        }[status] || { 
            label: t('AdminOrdersPage.status.pending'), 
            variant: 'bg-amber-100 text-amber-700 border-amber-200',
            icon: Clock
        };
    };

    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    const currency = i18n.language === 'ar' ? t('common.currency') : 'SAR';

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString(locale, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportOrders = () => {
        toast.info(t('common.system'));
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
                        <ShoppingCart className="h-8 w-8 text-rose-500" />
                    </div>
                    <Sparkles className="h-6 w-6 text-rose-300" />
                    <Package className="h-6 w-6 text-rose-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {t('AdminOrdersPage.title')}
                </h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                    {t('AdminOrdersPage.subtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
            </header>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
                            <div className="text-rose-700 text-sm">{t('AdminOrdersPage.stats.totalOrders')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
                            <div className="text-green-700 text-sm">{t('AdminOrdersPage.stats.completedOrders')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</div>
                            <div className="text-amber-700 text-sm">{t('AdminOrdersPage.stats.pendingOrders')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.shipped}</div>
                            <div className="text-purple-700 text-sm">{t('AdminOrdersPage.status.shipped')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-red-600 mb-1">{stats.cancelled}</div>
                            <div className="text-red-700 text-sm">{t('AdminOrdersPage.status.cancelled')}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl text-center">
                        <CardContent className="p-4">
                            <div className="text-2xl font-bold text-blue-600 mb-1">
                                {stats.revenue.toLocaleString(locale, { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-blue-700 text-sm">{t('AdminOrdersPage.stats.totalRevenue')}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Actions */}
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
                    <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div className="flex flex-col sm:flex-row gap-4 flex-1">
                                <div className="relative flex-1">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                                    <Input
                                        placeholder={t('AdminOrdersPage.searchPlaceholder')}
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                                    />
                                </div>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl">
                                            <Filter className="w-4 h-4 ml-2" />
                                            {statusFilter === 'all' ? t('AdminOrdersPage.status.all') : 
                                             statusFilter === 'pending' ? t('AdminOrdersPage.status.pending') :
                                             statusFilter === 'processing' ? t('AdminOrdersPage.status.processing') :
                                             statusFilter === 'shipped' ? t('AdminOrdersPage.status.shipped') : 
                                             statusFilter === 'completed' ? t('AdminOrdersPage.status.completed') : 
                                             t('AdminOrdersPage.status.cancelled')}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="border-rose-200 rounded-xl">
                                        <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-rose-700">
                                            {t('AdminOrdersPage.status.all')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('pending')} className="text-amber-600">
                                            {t('AdminOrdersPage.status.pending')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('processing')} className="text-blue-600">
                                            {t('AdminOrdersPage.status.processing')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('shipped')} className="text-purple-600">
                                            {t('AdminOrdersPage.status.shipped')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('completed')} className="text-green-600">
                                            {t('AdminOrdersPage.status.completed')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="text-red-600">
                                            {t('AdminOrdersPage.status.cancelled')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <Button 
                                    variant="outline" 
                                    onClick={exportOrders}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                                >
                                    <Download className="w-4 h-4 ml-2" />
                                    {t('common.exportData')}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={fetchOrders}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                                >
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    {t('common.refresh')}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Table */}
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-2xl">
                                    <ShoppingCart className="w-6 h-6" />
                                    {t('AdminOrdersPage.orderList')}
                                </CardTitle>
                                <CardDescription className="text-pink-100">
                                    {t('AdminOrdersPage.foundOrders', { count: filteredOrders.length })}
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                {filteredOrders.length} {t('common.users')}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                                    <TableHead className="text-rose-800 font-bold">{t('AdminOrdersPage.table.orderNumber')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold">{t('AdminOrdersPage.table.customer')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold">{t('AdminOrdersPage.table.date')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold">{t('AdminOrdersPage.table.status')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold">{t('AdminOrdersPage.table.total')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold text-left">{t('AdminOrdersPage.table.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
                                                <p className="text-rose-700 font-medium">{t('AdminOrdersPage.loading')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => {
                                        const statusConfig = getStatusConfig(order.status);
                                        const StatusIcon = statusConfig.icon;
                                        
                                        return (
                                            <TableRow key={order.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                                                <TableCell>
                                                    <div className="font-bold text-rose-900">#{order.id}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-rose-900">{order.customerName}</div>
                                                            {order.customerEmail && (
                                                                <div className="text-rose-600 text-sm flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {order.customerEmail}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2 text-rose-600 text-sm">
                                                        <Calendar className="w-4 h-4 text-rose-400" />
                                                        {formatDate(order.created_at)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${statusConfig.variant} flex items-center gap-1`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {statusConfig.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-bold text-rose-600">
                                                        {order.totalAmount.toLocaleString(locale, { 
                                                            minimumFractionDigits: 2, 
                                                            maximumFractionDigits: 2 
                                                        })} {currency}
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
                                                            <DropdownMenuItem 
                                                                onClick={() => handleViewDetails(order.id)}
                                                                className="text-rose-700"
                                                            >
                                                                <Eye className="w-4 h-4 ml-2" />
                                                                {t('common.viewDetails')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusUpdate(order.id, 'processing')}
                                                                className="text-blue-600"
                                                            >
                                                                <Package className="w-4 h-4 ml-2" />
                                                                {t('AdminOrdersPage.status.processing')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusUpdate(order.id, 'shipped')}
                                                                className="text-purple-600"
                                                            >
                                                                <Truck className="w-4 h-4 ml-2" />
                                                                {t('AdminOrdersPage.status.shipped')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusUpdate(order.id, 'completed')}
                                                                className="text-green-600"
                                                            >
                                                                <CheckCircle className="w-4 h-4 ml-2" />
                                                                {t('AdminOrdersPage.status.completed')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                                                                className="text-red-600"
                                                            >
                                                                <Clock className="w-4 h-4 ml-2" />
                                                                {t('AdminOrdersPage.status.cancelled')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center">
                                                <ShoppingCart className="w-16 h-16 text-rose-300 mb-4" />
                                                <h3 className="font-bold text-xl text-rose-800 mb-2">{t('AdminOrdersPage.noOrders')}</h3>
                                                <p className="text-rose-600 max-w-md">
                                                    {searchTerm || statusFilter !== 'all'
                                                        ? t('AdminOrdersPage.noOrders')
                                                        : t('AdminOrdersPage.noOrders')
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            {/* Order Details Dialog */}
            <Dialog open={!!selectedOrder || isDetailsLoading} onOpenChange={() => setSelectedOrder(null)}>
                <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-4xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-800 text-2xl">
                            <ShoppingCart className="w-6 h-6" />
                            {t('AdminOrdersPage.orderDetails', { id: selectedOrder?.details.id || '' })}
                        </DialogTitle>
                        {selectedOrder && (
                            <DialogDescription className="text-rose-600">
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-rose-500" />
                                        <span>{selectedOrder.details.customerName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-rose-500" />
                                        <span>{selectedOrder.details.customerEmail}</span>
                                    </div>
                                    {selectedOrder.details.phoneNumber && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-rose-500">📱</span>
                                            <span>{selectedOrder.details.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>
                            </DialogDescription>
                        )}
                    </DialogHeader>
                    <div className="py-4 max-h-[60vh] overflow-y-auto">
                        {isDetailsLoading ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
                                <p className="text-rose-700 font-medium">{t('AdminOrdersPage.loadingDetails')}</p>
                            </div>
                        ) : selectedOrder ? (
                            <div className="space-y-6">
                                {/* Order Items */}
                                <div>
                                    <h4 className="font-semibold text-rose-800 mb-4 text-lg">{t('AdminOrdersPage.products')}</h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item, index) => {
                                            let images: string[] = [];
                                            try {
                                                images = item.images ? JSON.parse(item.images) : [];
                                            } catch (e) {
                                                console.warn('Failed to parse images JSON', item.images);
                                                images = [];
                                            }
                                            const imageUrl = images[0] || '/placeholder.png';
                                            return (
                                                <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-rose-50 border border-rose-200">
                                                    <Image
                                                        src={imageUrl}
                                                        alt={item.productName}
                                                        width={60}
                                                        height={60}
                                                        className="rounded-lg object-cover"
                                                        unoptimized
                                                    />
                                                    <div className="flex-grow">
                                                        <p className="font-medium text-rose-900">{item.productName}</p>
                                                        <p className="text-rose-600 text-sm">
                                                            {t('ProductDetail.stockQuantity')}: {item.color} | {t('OrderDetails.quantity')}: {item.quantity}
                                                        </p>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-rose-700">
                                                            {Number(item.price).toLocaleString(locale, { minimumFractionDigits: 2 })} {currency}
                                                        </p>
                                                        <p className="text-rose-600 text-sm">
                                                            {t('CartPage.total')}: {(item.quantity * Number(item.price)).toLocaleString(locale, { minimumFractionDigits: 2 })} {currency}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="border-t border-rose-200 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-rose-700">{t('AdminOrdersPage.total')}:</span>
                                        <span className="font-bold text-rose-900">
                                            {selectedOrder.details.totalAmount.toLocaleString(locale, { minimumFractionDigits: 2 })} {currency}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm text-rose-600">
                                        <span>{t('OrderDetails.orderDate')}:</span>
                                        <span>{formatDateTime(selectedOrder.details.created_at)}</span>
                                    </div>
                                    {selectedOrder.details.shippingAddress && (
                                        <div className="mt-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
                                            <h5 className="font-medium text-rose-800 mb-1">{t('OrderDetailsPage.shipping.title')}:</h5>
                                            <p className="text-rose-600 text-sm">{selectedOrder.details.shippingAddress}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}