'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
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
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Wallet,
  Landmark,
  Hourglass,
  CheckCircle,
  XCircle,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface Payout {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}

interface WalletData {
  balance: number;
  pending_clearance: number;
  payouts: Payout[];
}

interface RawPayout {
  id: string | number;
  amount: string | number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes?: string;
}

interface RawWalletData {
  balance: string | number;
  pending_clearance: string | number;
  payouts: RawPayout[];
}

const normalizeWalletData = (data: unknown): WalletData => {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid wallet data format');
  }

  const rawData = data as RawWalletData;

  const payouts = (rawData.payouts || []).map((p) => ({
    id: Number(p.id),
    amount: Number(p.amount),
    status: p.status,
    created_at: p.created_at,
    notes: p.notes,
  }));

  return {
    balance: Number(rawData.balance),
    pending_clearance: Number(rawData.pending_clearance),
    payouts,
  };
};

type PayoutFormData = {
  amount: string;
};

export default function SupplierWalletPage() {
  const { t } = useTranslation();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<PayoutFormData>({
    defaultValues: { amount: '' },
  });

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await api.get<RawWalletData>('/supplier/wallet');
      const normalizedData = normalizeWalletData(response.data);
      setWalletData(normalizedData);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      toast.error(t('supplierwallet.toasts.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [t]);

  const onSubmit: SubmitHandler<PayoutFormData> = async (data) => {
    const amountNum = parseFloat(data.amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(t('supplierwallet.toasts.invalidAmount'));
      return;
    }

    if (amountNum > (walletData?.balance ?? 0)) {
      toast.error(t('supplierwallet.toasts.insufficientBalance'));
      return;
    }

    try {
      await api.post('/supplier/payout-request', { amount: amountNum });
      toast.success(t('supplierwallet.toasts.submitSuccess'));
      form.reset({ amount: '' });
      fetchWalletData();
    } catch (error) {
      let errorMessage = t('supplierwallet.toasts.submitError');
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: Payout['status']) => {
    const statusMap = {
      pending: {
        label: t('supplierwallet.status.pending'),
        icon: <Clock className="h-4 w-4" />,
        className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
      },
      approved: {
        label: t('supplierwallet.status.approved'),
        icon: <CheckCircle className="h-4 w-4" />,
        className: 'bg-green-100 text-green-800 hover:bg-green-100',
      },
      rejected: {
        label: t('supplierwallet.status.rejected'),
        icon: <XCircle className="h-4 w-4" />,
        className: 'bg-red-100 text-red-800 hover:bg-red-100',
      },
    };
    const { label, icon, className } = statusMap[status];
    return (
      <Badge className={`${className} rounded-xl px-3 py-1 font-medium`}>
        <span className="flex items-center gap-1">
          {icon}
          {label}
        </span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-blue-700 text-lg font-medium">{t('supplierwallet.toasts.fetchError').replace('❌ ', '')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Wallet className="h-8 w-8 text-blue-500" />
          </div>
          <Sparkles className="h-6 w-6 text-blue-300" />
          <Target className="h-6 w-6 text-blue-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {t('supplierwallet.pageTitle')}
        </h1>
        <p className="text-blue-700 text-lg max-w-2xl mx-auto">{t('supplierwallet.pageSubtitle')}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium mb-2">
                      {t('supplierwallet.stats.availableBalance')}
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {Number(walletData?.balance ?? 0).toFixed(2)}
                      <span className="text-sm font-medium text-green-600">
                        {' '}
                        {t('supplierwallet.currency')}
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
                    <Landmark className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-600 text-sm font-medium mb-2">
                      {t('supplierwallet.stats.pendingEarnings')}
                    </p>
                    <p className="text-3xl font-bold text-amber-900">
                      {Number(walletData?.pending_clearance ?? 0).toFixed(2)}
                      <span className="text-sm font-medium text-amber-600">
                        {' '}
                        {t('supplierwallet.currency')}
                      </span>
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl">
                    <Hourglass className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <TrendingUp className="h-6 w-6" />
                {t('supplierwallet.payoutHistory.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {walletData?.payouts && walletData.payouts.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-blue-100 hover:bg-transparent">
                        <TableHead className="text-blue-800 font-bold text-right">
                          {t('supplierwallet.payoutHistory.headers.amount')}
                        </TableHead>
                        <TableHead className="text-blue-800 font-bold text-right">
                          {t('supplierwallet.payoutHistory.headers.date')}
                        </TableHead>
                        <TableHead className="text-blue-800 font-bold text-right">
                          {t('supplierwallet.payoutHistory.headers.status')}
                        </TableHead>
                        <TableHead className="text-blue-800 font-bold text-right">
                          {t('supplierwallet.payoutHistory.headers.notes')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {walletData.payouts.map((payout) => (
                        <TableRow
                          key={payout.id}
                          className="border-blue-100 hover:bg-blue-50/50 transition-colors duration-200"
                        >
                          <TableCell className="font-bold text-blue-900 text-right">
                            {payout.amount.toFixed(2)} {t('supplierwallet.currency')}
                          </TableCell>
                          <TableCell className="text-blue-700 text-right">
                            {new Date(payout.created_at).toLocaleDateString('ar-EG')}
                          </TableCell>
                          <TableCell className="text-right">{getStatusBadge(payout.status)}</TableCell>
                          <TableCell className="text-blue-600 text-right">
                            {payout.notes || '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="flex flex-col items-center justify-center text-blue-600">
                    <Wallet className="w-16 h-16 mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold text-blue-800">
                      {t('supplierwallet.payoutHistory.empty.title')}
                    </h3>
                    <p className="text-blue-600 mt-2">
                      {t('supplierwallet.payoutHistory.empty.description')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden sticky top-6">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Send className="h-6 w-6" />
                {t('supplierwallet.payoutForm.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-800 font-bold text-lg">
                          {t('supplierwallet.payoutForm.label')}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={t('supplierwallet.payoutForm.placeholder')}
                              {...field}
                              className="bg-white border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 text-lg pr-12 transition-colors duration-200"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-blue-600 font-medium">
                              {t('supplierwallet.currency')}
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white h-12 rounded-2xl font-bold text-lg transition-colors duration-200"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t('supplierwallet.payoutForm.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        {t('supplierwallet.payoutForm.submit')}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-amber-700 text-sm">
                    <p className="font-medium mb-1">{t('supplierwallet.payoutForm.infoTitle')}</p>
                    <p>{t('supplierwallet.payoutForm.infoDescription')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}