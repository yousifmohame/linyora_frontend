'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { withSubscription } from '@/components/auth/withSubscription';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Handshake,
  Check,
  X,
  Package,
  ShoppingBag,
  DollarSign,
  Calendar,
  Clock,
  User,
  MapPin,
  MessageSquare,
  Zap,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock4,
  Search as SearchIcon,
  Filter as FilterIcon,
  Sparkles,
  Target,
} from 'lucide-react';
import ModelNav from '@/components/dashboards/ModelNav';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// --- Interface for Package-based Requests ---
interface AgreementRequest {
  id: number;
  merchantName: string;
  merchantAvatar?: string;
  productName: string;
  productImage?: string;
  packageTitle: string;
  tierName: string;
  tierPrice: number;
  deliveryDays: number;
  revisions: number;
  features: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'in_progress';
  created_at: string;
  merchantRating?: number;
  merchantLocation?: string;
  estimatedCompletion?: string;
  priority?: 'low' | 'medium' | 'high';
}

function AgreementRequestsPage() {
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AgreementRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AgreementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AgreementRequest | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/agreements/requests');
      setRequests(response.data);
      setFilteredRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error(t('modelrequests.toasts.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Filter requests based on status and search term
  useEffect(() => {
    let filtered = requests;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.packageTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  }, [requests, statusFilter, searchTerm]);

  const handleStatusUpdate = async (
    id: number,
    status: 'accepted' | 'rejected' | 'in_progress' | 'completed',
    reason?: string
  ) => {
    const promise = api.put(`/agreements/requests/${id}/status`, { status, reason });

    toast.promise(promise, {
      loading: t('modelrequests.toasts.loading'),
      success: () => {
        fetchRequests();
        setRejectDialogOpen(false);
        setRejectReason('');
        return t('modelrequests.toasts.success');
      },
      error: () => t('modelrequests.toasts.error'),
    });
  };

  const handleRejectWithReason = (request: AgreementRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const getStatusBadge = (status: AgreementRequest['status']) => {
    const configs = {
      pending: {
        label: t('modelrequests.status.pending'),
        className: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <Clock4 className="w-3 h-3 ml-1" />,
      },
      accepted: {
        label: t('modelrequests.status.accepted'),
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle2 className="w-3 h-3 ml-1" />,
      },
      rejected: {
        label: t('modelrequests.status.rejected'),
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: <XCircle className="w-3 h-3 ml-1" />,
      },
      in_progress: {
        label: t('modelrequests.status.in_progress'),
        className: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: <Zap className="w-3 h-3 ml-1" />,
      },
      completed: {
        label: t('modelrequests.status.completed'),
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle2 className="w-3 h-3 ml-1" />,
      },
    };
    const config = configs[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
      icon: null,
    };
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: AgreementRequest['priority']) => {
    const configs = {
      low: { label: t('priority.low'), className: 'bg-gray-100 text-gray-700' },
      medium: { label: t('priority.medium'), className: 'bg-amber-100 text-amber-700' },
      high: { label: t('priority.high'), className: 'bg-red-100 text-red-700' },
    };
    const config = configs[priority || 'medium'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((req) => req.status === 'pending').length,
    inProgress: requests.filter((req) => req.status === 'in_progress').length,
    completed: requests.filter((req) => req.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <ModelNav />

      {/* Header Section */}
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Handshake className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Target className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('modelrequests.pageTitle')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('modelrequests.pageSubtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
            <div className="text-rose-700 text-sm">{t('modelrequests.stats.total')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-600 mb-1">{stats.pending}</div>
            <div className="text-amber-700 text-sm">{t('modelrequests.stats.pending')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.inProgress}</div>
            <div className="text-purple-700 text-sm">{t('modelrequests.stats.inProgress')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
            <div className="text-green-700 text-sm">{t('modelrequests.stats.completed')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
              <Input
                placeholder={t('modelrequests.filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-rose-200 focus:border-rose-400 rounded-xl">
                <FilterIcon className="w-4 h-4 ml-2 text-rose-400" />
                <SelectValue placeholder={t('modelrequests.filters.statusFilter')} />
              </SelectTrigger>
              <SelectContent className="border-rose-200 rounded-xl">
                <SelectItem value="all">{t('modelrequests.status.all')}</SelectItem>
                <SelectItem value="pending">{t('modelrequests.status.pending')}</SelectItem>
                <SelectItem value="accepted">{t('modelrequests.status.accepted')}</SelectItem>
                <SelectItem value="in_progress">{t('modelrequests.status.in_progress')}</SelectItem>
                <SelectItem value="completed">{t('modelrequests.status.completed')}</SelectItem>
                <SelectItem value="rejected">{t('modelrequests.status.rejected')}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
              >
                {t('modelrequests.filters.reset')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">
            {t('modelrequests.toasts.loading').replace('🔄 ', '')}
          </p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl text-center py-16 max-w-2xl mx-auto">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-100 to-pink-100 rounded-3xl flex items-center justify-center">
                <Handshake className="w-10 h-10 text-rose-400" />
              </div>
            </div>
            <h3 className="font-bold text-2xl text-rose-800 mb-2">
              {t('modelrequests.empty.title')}
            </h3>
            <p className="text-rose-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all'
                ? t('modelrequests.empty.descriptionFiltered')
                : t('modelrequests.empty.descriptionDefault')}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                onClick={() => {
                  setStatusFilter('all');
                  setSearchTerm('');
                }}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-bold"
              >
                {t('modelrequests.empty.showAll')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <Card
              key={req.id}
              className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden hover:shadow-3xl transition-all duration-300"
            >
              {/* Header with Merchant Info */}
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{req.merchantName}</CardTitle>
                      <CardDescription className="text-pink-100 flex items-center gap-1 text-sm">
                        {req.merchantLocation && (
                          <>
                            <MapPin className="w-3 h-3" />
                            {req.merchantLocation}
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(req.status)}
                    {req.priority && <div className="mt-2">{getPriorityBadge(req.priority)}</div>}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Package Info */}
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-rose-800">
                      {t('modelrequests.card.package')}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-lg">{req.packageTitle}</p>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 mt-1">
                    {req.tierName}
                  </Badge>
                </div>

                {/* Product Info */}
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-blue-800">{t('modelrequests.card.product')}</span>
                  </div>
                  <p className="font-bold text-gray-900">{req.productName}</p>
                </div>

                {/* Package Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <p className="font-bold text-xl text-green-600">
                      {typeof req.tierPrice === 'number'
                        ? req.tierPrice.toFixed(2)
                        : parseFloat(req.tierPrice).toFixed(2)}{' '}
                      <span className="text-sm">{t('modelrequests.card.priceCurrency')}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>
                      {req.deliveryDays} {t('modelrequests.card.days')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>
                      {req.revisions === -1
                        ? t('modelrequests.card.unlimited')
                        : req.revisions}{' '}
                      {t('modelrequests.card.reviews')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-xs">
                      {new Date(req.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                {/* Features */}
                {req.features && req.features.length > 0 && (
                  <div className="p-3 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
                    <p className="font-bold text-rose-800 text-sm mb-2">
                      {t('modelrequests.card.features')}
                    </p>
                    <ul className="space-y-1 text-sm text-rose-700">
                      {req.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {feature}
                        </li>
                      ))}
                      {req.features.length > 3 && (
                        <li className="text-rose-500 text-xs">
                          {t('modelrequests.card.additionalFeatures', {
                            count: req.features.length - 3,
                          })}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>

              {/* Actions */}
              {req.status === 'pending' && (
                <CardFooter className="flex gap-3 p-6 pt-0">
                  <Button
                    onClick={() => handleStatusUpdate(req.id, 'accepted')}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-2"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {t('modelrequests.actions.accept')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectWithReason(req)}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-2"
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('modelrequests.actions.reject')}
                  </Button>
                </CardFooter>
              )}

              {req.status === 'accepted' && (
                <CardFooter className="flex gap-3 p-6 pt-0">
                  <Button
                    onClick={() => handleStatusUpdate(req.id, 'in_progress')}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl py-2"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {t('modelrequests.actions.start')}
                  </Button>
                </CardFooter>
              )}

              {req.status === 'in_progress' && (
                <CardFooter className="flex gap-3 p-6 pt-0">
                  <Button
                    onClick={() => handleStatusUpdate(req.id, 'completed')}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl py-2"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {t('modelrequests.actions.complete')}
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {t('modelrequests.rejectDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest &&
                t('modelrequests.rejectDialog.description', {
                  merchantName: selectedRequest.merchantName,
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border border-rose-200 rounded-xl focus:border-rose-400 focus:ring-1 focus:ring-rose-400"
            >
              <option value="">{t('modelrequests.rejectDialog.reasons.select')}</option>
              <option value="busy">{t('modelrequests.rejectDialog.reasons.busy')}</option>
              <option value="not_suitable">
                {t('modelrequests.rejectDialog.reasons.not_suitable')}
              </option>
              <option value="timing">{t('modelrequests.rejectDialog.reasons.timing')}</option>
              <option value="budget">{t('modelrequests.rejectDialog.reasons.budget')}</option>
              <option value="other">{t('modelrequests.rejectDialog.reasons.other')}</option>
            </select>
            {rejectReason === 'other' && (
              <textarea
                placeholder={t('modelrequests.rejectDialog.placeholderOther')}
                className="w-full p-3 border border-rose-200 rounded-xl focus:border-rose-400 focus:ring-1 focus:ring-rose-400 min-h-[100px]"
                onChange={(e) => setRejectReason(e.target.value)}
              />
            )}
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              {t('modelrequests.rejectDialog.cancel')}
            </Button>
            <Button
              onClick={() =>
                selectedRequest && handleStatusUpdate(selectedRequest.id, 'rejected', rejectReason)
              }
              disabled={!rejectReason}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white"
            >
              {t('modelrequests.rejectDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withSubscription(AgreementRequestsPage);