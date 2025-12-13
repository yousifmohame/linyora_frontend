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
  PackageCheck,
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
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'delivered' | 'completed';
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

  const handleAction = (
    actionPromise: Promise<any>,
    successMessageKey: string,
    loadingMessageKey: string = 'modelrequests.toasts.loading'
  ) => {
    toast.promise(actionPromise, {
      loading: t(loadingMessageKey),
      success: () => {
        fetchRequests();
        setRejectDialogOpen(false);
        setRejectReason('');
        return t(successMessageKey);
      },
      error: (err) => {
        const apiError = err.response?.data?.message;
        return apiError ? t(apiError) : t('modelrequests.toasts.error');
      },
    });
  };

  const handleResponse = (
    id: number,
    status: 'accepted' | 'rejected',
    reason?: string
  ) => {
    const promise = api.put(`/agreements/${id}/respond`, { status, reason });
    const messageKey = status === 'accepted' 
      ? 'modelrequests.toasts.accepted' 
      : 'modelrequests.toasts.rejected';
    handleAction(promise, messageKey);
  };

  const handleStart = (id: number) => {
    const promise = api.put(`/agreements/${id}/start`);
    handleAction(promise, 'modelrequests.toasts.started');
  };

  const handleDeliver = (id: number) => {
    const promise = api.put(`/agreements/${id}/deliver`);
    handleAction(promise, 'modelrequests.toasts.delivered');
  };

  const handleRejectWithReason = (request: AgreementRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const getStatusBadge = (status: AgreementRequest['status']) => {
    const configs = {
      pending: { label: t('modelrequests.status.pending'), className: 'bg-amber-100 text-amber-800', icon: <Clock4 className="w-3 h-3 ml-1" /> },
      accepted: { label: t('modelrequests.status.accepted'), className: 'bg-blue-100 text-blue-800', icon: <CheckCircle2 className="w-3 h-3 ml-1" /> },
      rejected: { label: t('modelrequests.status.rejected'), className: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3 ml-1" /> },
      in_progress: { label: t('modelrequests.status.in_progress'), className: 'bg-purple-100 text-purple-800', icon: <Zap className="w-3 h-3 ml-1" /> },
      delivered: { label: t('modelrequests.status.delivered'), className: 'bg-yellow-100 text-yellow-800', icon: <PackageCheck className="w-3 h-3 ml-1" /> },
      completed: { label: t('modelrequests.status.completed'), className: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="w-3 h-3 ml-1" /> },
    };
    const config = configs[status] || { label: status, className: 'bg-gray-100 text-gray-800', icon: null };
    return (
      <Badge className={`${config.className} flex items-center gap-1 text-[10px] px-2 py-0.5 rounded`}>
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
    return <Badge className={`${config.className} text-[10px] px-2 py-0.5 rounded`}>{config.label}</Badge>;
  };

  const stats = {
    total: requests.length,
    pending: requests.filter((req) => req.status === 'pending').length,
    inProgress: requests.filter((req) => req.status === 'in_progress').length,
    delivered: requests.filter((req) => req.status === 'delivered').length,
    completed: requests.filter((req) => req.status === 'completed').length,
  };

  return (
    // ✅ Unified gradient + overflow-hidden
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      {/* ✅ Smaller, safe blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <ModelNav />

      <header className="mb-6 text-center px-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-rose-100">
            <Handshake className="h-6 w-6 text-rose-600" />
          </div>
          <Sparkles className="h-4 w-4 text-rose-300" />
          <Target className="h-4 w-4 text-rose-300" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
          {t('modelrequests.pageTitle')}
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {t('modelrequests.pageSubtitle')}
        </p>
      </header>

      {/* ✅ Responsive Stats Grid (2 → 5 cols) */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2">
        <StatCard value={stats.total} label={t('modelrequests.stats.total')} color="rose" />
        <StatCard value={stats.pending} label={t('modelrequests.stats.pending')} color="amber" />
        <StatCard value={stats.inProgress} label={t('modelrequests.stats.inProgress')} color="purple" />
        <StatCard value={stats.delivered} label={t('modelrequests.stats.delivered')} color="yellow" />
        <StatCard value={stats.completed} label={t('modelrequests.stats.completed')} color="green" />
      </div>

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm mb-6">
        <CardContent className="p-1 sm:p-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
              <Input
                placeholder={t('modelrequests.filters.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 rtl:pl-3 rtl:pr-10 border border-gray-200 focus:border-purple-500 rounded-lg h-10 text-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border border-gray-200 focus:border-purple-500 rounded-lg h-10 text-sm">
                <FilterIcon className="w-4 h-4 ml-2 text-gray-400" />
                <SelectValue placeholder={t('modelrequests.filters.statusFilter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('modelrequests.status.all')}</SelectItem>
                <SelectItem value="pending">{t('modelrequests.status.pending')}</SelectItem>
                <SelectItem value="accepted">{t('modelrequests.status.accepted')}</SelectItem>
                <SelectItem value="in_progress">{t('modelrequests.status.in_progress')}</SelectItem>
                <SelectItem value="delivered">{t('modelrequests.status.delivered')}</SelectItem>
                <SelectItem value="completed">{t('modelrequests.status.completed')}</SelectItem>
                <SelectItem value="rejected">{t('modelrequests.status.rejected')}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-10 text-sm"
              onClick={() => {
                setStatusFilter('all');
                setSearchTerm('');
              }}
            >
              {t('modelrequests.filters.reset')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">{t('modelrequests.toasts.loading').replace('🔄 ', '')}</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-center py-8 max-w-md mx-auto">
          <CardContent>
            <div className="p-2 bg-rose-100 rounded-xl inline-block mb-2">
              <Handshake className="w-6 h-6 text-rose-600" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              {t('modelrequests.empty.title')}
            </h3>
            <p className="text-gray-600 mb-4 px-2">
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
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-sm"
              >
                {t('modelrequests.empty.showAll')}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* ✅ Responsive Grid - No Horizontal Scroll */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRequests.map((req) => (
            <Card
              key={req.id}
              className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base font-bold truncate">{req.merchantName}</CardTitle>
                      <CardDescription className="text-purple-100 text-xs mt-0.5 flex items-center gap-1">
                        {req.merchantLocation && (
                          <>
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{req.merchantLocation}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(req.status)}
                    {req.priority && <div className="mt-1">{getPriorityBadge(req.priority)}</div>}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                <div className="p-3 bg-rose-50 rounded-lg border border-rose-200/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Package className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-bold text-rose-800 text-xs">{t('modelrequests.card.package')}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{req.packageTitle}</p>
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200 mt-1 text-[10px] px-2 py-0.5">
                    {req.tierName}
                  </Badge>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200/50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
                    <span className="font-bold text-blue-800 text-xs">{t('modelrequests.card.product')}</span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{req.productName}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                    <DollarSign className="w-3 h-3 text-green-500" />
                    <p className="font-bold text-green-600">
                      {typeof req.tierPrice === 'number'
                        ? req.tierPrice.toFixed(2)
                        : parseFloat(req.tierPrice).toFixed(2)}{' '}
                      <span className="text-[10px]">{t('modelrequests.card.priceCurrency')}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                    <Clock className="w-3 h-3 text-amber-500" />
                    <span>{req.deliveryDays} {t('modelrequests.card.days')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                    <MessageSquare className="w-3 h-3 text-blue-500" />
                    <span>
                      {req.revisions === -1
                        ? t('modelrequests.card.unlimited')
                        : req.revisions}{' '}
                      {t('modelrequests.card.reviews')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-3 h-3 text-purple-500" />
                    <span className="text-[10px]">
                      {new Date(req.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                </div>

                {req.features && req.features.length > 0 && (
                  <div className="p-2 bg-gradient-to-r from-rose-50 to-purple-50 rounded-lg border border-rose-200/50">
                    <p className="font-bold text-rose-800 text-[10px] mb-1">
                      {t('modelrequests.card.features')}
                    </p>
                    <ul className="space-y-1 text-[10px] text-rose-700">
                      {req.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-1.5">
                          <Check className="w-2.5 h-2.5 text-green-500" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {req.features.length > 3 && (
                        <li className="text-rose-500 text-[10px]">
                          {t('modelrequests.card.additionalFeatures', { count: req.features.length - 3 })}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </CardContent>

              {/* ✅ Action Footer - Mobile-Optimized */}
              {req.status === 'pending' && (
                <CardFooter className="flex gap-2 p-3 pt-0">
                  <Button
                    onClick={() => handleResponse(req.id, 'accepted')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs h-8"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    {t('modelrequests.actions.accept')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectWithReason(req)}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs h-8"
                  >
                    <X className="w-3 h-3 mr-1" />
                    {t('modelrequests.actions.reject')}
                  </Button>
                </CardFooter>
              )}

              {req.status === 'accepted' && (
                <CardFooter className="p-3 pt-0">
                  <Button
                    onClick={() => handleStart(req.id)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs h-8"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    {t('modelrequests.actions.start')}
                  </Button>
                </CardFooter>
              )}

              {req.status === 'in_progress' && (
                <CardFooter className="p-3 pt-0">
                  <Button
                    onClick={() => handleDeliver(req.id)}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs h-8"
                  >
                    <PackageCheck className="w-3 h-3 mr-1" />
                    {t('modelrequests.actions.deliver')}
                  </Button>
                </CardFooter>
              )}

              {req.status === 'delivered' && (
                <CardFooter className="p-3 pt-0 justify-center">
                  <p className="text-[10px] text-yellow-800 font-medium p-1.5 bg-yellow-50 rounded-lg">
                    {t('modelrequests.actions.waitingForMerchant')}
                  </p>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl max-w-[320px] mx-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 text-base">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              {t('modelrequests.rejectDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              {selectedRequest &&
                t('modelrequests.rejectDialog.description', {
                  merchantName: selectedRequest.merchantName,
                })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
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
                className="w-full p-2.5 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm min-h-[80px]"
                onChange={(e) => setRejectReason(e.target.value)}
              />
            )}
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-sm h-8"
            >
              {t('modelrequests.rejectDialog.cancel')}
            </Button>
            <Button
              onClick={() => selectedRequest && handleResponse(selectedRequest.id, 'rejected', rejectReason)}
              disabled={!rejectReason}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm h-8"
            >
              {t('modelrequests.rejectDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ✅ Reusable Stat Card
const StatCard = ({ value, label, color }: { value: number; label: string; color: 'rose' | 'amber' | 'purple' | 'yellow' | 'green' }) => {
  const colorMap = {
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    green: 'text-green-600 bg-green-50 border-green-200',
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border ${colorMap[color]} shadow-sm rounded-lg text-center`}>
      <CardContent className="p-2.5">
        <div className="text-lg font-bold">{value}</div>
        <div className="text-gray-600 text-[10px] mt-1">{label}</div>
      </CardContent>
    </Card>
  );
};

export default withSubscription(AgreementRequestsPage);