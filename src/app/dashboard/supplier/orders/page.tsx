'use client';

import { useState, useEffect, Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import SupplierNav from '@/components/dashboards/SupplierNav';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Hash,
  User,
  Store,
  Tag,
  DollarSign,
  Calendar,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Target,
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// Interfaces
interface SupplierOrder {
  order_id: number;
  order_date: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  product_name: string;
  quantity: number;
  cost_price: number;
  customer_name: string;
  merchant_store_name: string;
  total_cost: number;
}

interface OrderDetails {
  order_id: number;
  order_date: string;
  order_status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  shipping_cost: number;
  total_amount: number;
  payment_method: string;
  customer: {
    name: string;
    email: string;
  };
  shipping_address: {
    name: string;
    address: string;
    city: string;
    country: string;
    phone: string;
  };
  items: {
    name: string;
    color: string;
    quantity: number;
    cost_price: number;
    total_cost: number;
  }[];
}

// Normalization helpers
const normalizeOrder = (order: any): SupplierOrder => {
  if (typeof order !== 'object' || order === null) {
    throw new Error('Invalid order data');
  }

  const getString = (key: string): string => {
    const val = order[key];
    return typeof val === 'string' ? val : String(val ?? '');
  };

  const getNumber = (key: string): number => {
    const val = order[key];
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  return {
    order_id: getNumber('order_id'),
    order_date: getString('order_date'),
    order_status: getString('order_status') as any,
    product_name: getString('product_name'),
    quantity: getNumber('quantity'),
    cost_price: getNumber('cost_price'),
    customer_name: getString('customer_name'),
    merchant_store_name: getString('merchant_store_name'),
    total_cost: getNumber('total_cost'),
  };
};

const normalizeOrderDetails = (data: any): OrderDetails => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid order details data');
  }

  const getString = (obj: any, key: string): string => {
    const val = obj?.[key];
    return typeof val === 'string' ? val : String(val ?? '');
  };

  const getNumber = (obj: any, key: string): number => {
    const val = obj?.[key];
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  return {
    order_id: getNumber(data, 'order_id'),
    order_date: getString(data, 'order_date'),
    order_status: getString(data, 'order_status') as any,
    shipping_cost: getNumber(data, 'shipping_cost'),
    total_amount: getNumber(data, 'total_amount'),
    payment_method: getString(data, 'payment_method'),
    customer: {
      name: getString(data.customer, 'name'),
      email: getString(data.customer, 'email'),
    },
    shipping_address: {
      name: getString(data.shipping_address, 'name'),
      address: getString(data.shipping_address, 'address'),
      city: getString(data.shipping_address, 'city'),
      country: getString(data.shipping_address, 'country'),
      phone: getString(data.shipping_address, 'phone'),
    },
    items: Array.isArray(data.items)
      ? data.items.map((item: any) => ({
          name: getString(item, 'name'),
          color: getString(item, 'color'),
          quantity: getNumber(item, 'quantity'),
          cost_price: getNumber(item, 'cost_price'),
          total_cost: getNumber(item, 'total_cost'),
        }))
      : [],
  };
};

export default function SupplierOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get<any[]>('/supplier/orders');
      const normalizedOrders = response.data.map(normalizeOrder);
      setOrders(normalizedOrders);
    } catch (error) {
      console.error('Failed to fetch supplier orders:', error);
      toast.error(t('supplierorders.toasts.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [t]);

  const handleRowClick = async (order: SupplierOrder) => {
    try {
      const response = await api.get<any>(`/supplier/orders/${order.order_id}`);
      const normalizedDetails = normalizeOrderDetails(response.data);
      setSelectedOrder(normalizedDetails);
      setNewStatus(normalizedDetails.order_status);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error(t('supplierorders.toasts.detailsError'));
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      await api.put(`/supplier/orders/${selectedOrder.order_id}/status`, { status: newStatus });
      toast.success(t('supplierorders.toasts.updateSuccess'));
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error(t('supplierorders.toasts.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: SupplierOrder['order_status']) => {
    const statusMap = {
      pending: { label: t('supplierorders.status.pending'), className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
      processing: { label: t('supplierorders.status.processing'), className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      shipped: { label: t('supplierorders.status.shipped'), className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-100' },
      completed: { label: t('supplierorders.status.completed'), className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      cancelled: { label: t('supplierorders.status.cancelled'), className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };
    const { label, className } = statusMap[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };
    return <Badge className={`${className} rounded-xl px-3 py-1 font-medium`}>{label}</Badge>;
  };

  const statusOptions = [
    { value: 'pending', label: t('supplierorders.status.pending'), icon: <Clock className="w-4 h-4" /> },
    { value: 'processing', label: t('supplierorders.status.processing'), icon: <Clock className="w-4 h-4" /> },
    { value: 'shipped', label: t('supplierorders.status.shipped'), icon: <Truck className="w-4 h-4" /> },
    { value: 'completed', label: t('supplierorders.status.completed'), icon: <CheckCircle className="w-4 h-4" /> },
    { value: 'cancelled', label: t('supplierorders.status.cancelled'), icon: <XCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
          <Sparkles className="h-6 w-6 text-blue-300" />
          <Target className="h-6 w-6 text-blue-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {t('supplierorders.pageTitle')}
        </h1>
        <p className="text-blue-700 text-lg max-w-2xl mx-auto">{t('supplierorders.pageSubtitle')}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full mt-4"></div>
      </header>

      <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden max-w-7xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Package className="h-6 w-6" />
            {t('supplierorders.table.headers.product')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-blue-700">{t('supplierorders.table.loading')}</p>
              </div>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100 hover:bg-transparent">
                    <TableHead className="text-blue-800 font-bold text-right">
                      <Hash className="inline-block ml-1 h-4 w-4" />
                      {t('supplierorders.table.headers.orderId')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      <User className="inline-block ml-1 h-4 w-4" />
                      {t('supplierorders.table.headers.customer')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      <Store className="inline-block ml-1 h-4 w-4" />
                      {t('supplierorders.table.headers.store')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      <Tag className="inline-block ml-1 h-4 w-4" />
                      {t('supplierorders.table.headers.product')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      <DollarSign className="inline-block ml-1 h-4 w-4" />
                      {t('supplierorders.table.headers.earnings')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      <Calendar className="inline-block ml-1 h-4 w-4" />
                      {t('supplierorders.table.headers.date')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      {t('supplierorders.table.headers.status')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.order_id}
                      onClick={() => handleRowClick(order)}
                      className="cursor-pointer border-blue-100 hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <TableCell className="font-bold text-blue-900 text-right">
                        #{order.order_id}
                      </TableCell>
                      <TableCell className="text-right font-medium text-blue-800">
                        {order.customer_name}
                      </TableCell>
                      <TableCell className="text-right text-blue-700">
                        {order.merchant_store_name}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-semibold text-blue-900">{order.product_name}</div>
                        <div className="text-xs text-blue-600">
                          {t('supplierorders.table.quantity', { quantity: order.quantity })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-green-600">
                          {t('supplierorders.table.totalEarnings', { total: order.total_cost.toFixed(2) })}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-blue-700">
                        {new Date(order.order_date).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell className="text-right">{getStatusBadge(order.order_status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center text-blue-600">
                <Package className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-blue-800">{t('supplierorders.table.empty.title')}</h3>
                <p className="text-blue-600 mt-2">{t('supplierorders.table.empty.description')}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[90vw] max-w-none sm:max-w-none h-[90vh] max-h-none bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-lg overflow-hidden">
          {selectedOrder && (
            <Fragment>
              <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <ShoppingCart className="h-6 w-6" />
                  {t('supplierorders.modal.title', { orderId: selectedOrder.order_id })}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  {t('supplierorders.modal.date', {
                    date: new Date(selectedOrder.order_date).toLocaleString('ar-EG'),
                  })}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-4 max-h-[calc(90vh-180px)] overflow-y-auto">
                {/* Customer & Shipping */}
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('supplierorders.modal.customerInfo')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-blue-600">
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {selectedOrder.customer.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {selectedOrder.customer.email}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-blue-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {t('supplierorders.modal.shippingAddress')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-blue-600">
                      <p className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {selectedOrder.shipping_address.name}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedOrder.shipping_address.address}
                      </p>
                      <p>{`${selectedOrder.shipping_address.city}, ${selectedOrder.shipping_address.country}`}</p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {selectedOrder.shipping_address.phone}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Items, Payment & Status */}
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-green-800 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {t('supplierorders.modal.itemsInOrder')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="divide-y divide-green-200">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="py-3">
                            <p className="font-semibold text-green-800">{item.name} ({item.color})</p>
                            <div className="text-sm text-green-700 flex justify-between mt-1">
                              <span>{t('supplierorders.modal.quantity')}: {item.quantity}</span>
                              <span>
                                {t('supplierorders.modal.totalCost')}: {item.total_cost.toFixed(2)}{' '}
                                {t('common.currency')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-amber-800 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        {t('supplierorders.modal.paymentDetails')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between font-medium text-amber-800">
                        <span>{t('supplierorders.modal.paymentMethod')}:</span>
                        <Badge
                          variant={selectedOrder.payment_method === 'card' ? 'default' : 'secondary'}
                          className="bg-white text-amber-800 border-amber-300"
                        >
                          {selectedOrder.payment_method === 'card'
                            ? t('payment.card')
                            : t('payment.cod')}
                        </Badge>
                      </div>
                      <div className="flex justify-between font-medium text-amber-800">
                        <span>{t('supplierorders.modal.shippingCost')}:</span>
                        <span>
                          {selectedOrder.shipping_cost.toFixed(2)} {t('common.currency')}
                        </span>
                      </div>
                      <Separator className="bg-amber-200" />
                      <div className="flex justify-between font-bold text-lg text-amber-700">
                        <span>{t('supplierorders.modal.orderTotal')}:</span>
                        <span>
                          {selectedOrder.total_amount.toFixed(2)} {t('common.currency')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-amber-800 flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        {t('supplierorders.modal.updateStatus')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-white border-amber-200 focus:border-amber-400 rounded-xl">
                          <SelectValue placeholder={t('supplierorders.modal.statusPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-amber-200 rounded-xl">
                          {statusOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                              className="text-amber-800 hover:bg-amber-50"
                            >
                              <span className="flex items-center gap-2">
                                {option.icon} {option.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleStatusUpdate}
                        disabled={isUpdating}
                        className="w-full mt-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold transition-colors duration-200"
                      >
                        {isUpdating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            {t('supplierorders.modal.updating')}
                          </>
                        ) : (
                          t('supplierorders.modal.saveChanges')
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </Fragment>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}