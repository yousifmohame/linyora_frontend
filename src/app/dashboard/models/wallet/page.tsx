'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { ModelWallet } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Send,
  Hourglass,
  Wallet,
  TrendingUp,
  History,
  Shield,
  AlertCircle,
  Download,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  CreditCard,
  Banknote,
  Zap,
  BarChart3,
} from 'lucide-react';
import ModelNav from '@/components/dashboards/ModelNav';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { isAxiosError } from 'axios';
import { useTranslation } from 'react-i18next';

interface Transaction {
  id: number;
  amount: number;
  type: 'earning' | 'payout' | 'refund';
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface PayoutMethod {
  id: string;
  type: 'bank' | 'wallet';
  name: string;
  details: string;
  isDefault: boolean;
}

const ModelWalletPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<ModelWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletRes, transactionsRes, methodsRes] = await Promise.all([
          axios.get('/wallet/model/my-wallet'),
          axios.get('/wallet/model/transactions'),
          axios.get('/wallet/model/payout-methods'),
        ]);

        const normalizedTransactions = transactionsRes.data.map((t: Transaction) => ({
          ...t,
          amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
        }));

        setWallet(walletRes.data);
        setTransactions(normalizedTransactions);
        setPayoutMethods(methodsRes.data);

        const defaultMethod = methodsRes.data.find((method: PayoutMethod) => method.isDefault);
        if (defaultMethod) {
          setSelectedMethod(defaultMethod.id);
        }
      } catch (error) {
        toast.error(t('modelwallet.errors.fetchFailed'));
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWalletData();
    }
  }, [user, t]);

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseFloat(amount);
    if (!amount || numAmount <= 0) {
      toast.error(t('modelwallet.errors.invalidAmount'));
      return;
    }

    if (numAmount < 50) {
      toast.error(t('modelwallet.errors.minAmount', { min: 50 }));
      return;
    }

    const balance = parseFloat(wallet?.balance?.toString() || '0');
    if (numAmount > balance) {
      toast.error(t('modelwallet.errors.insufficientBalance'));
      return;
    }

    if (!selectedMethod) {
      toast.error(t('modelwallet.errors.noMethod'));
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmPayoutRequest = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('/wallet/model/request-payout', {
        amount: parseFloat(amount),
        method_id: selectedMethod,
      });

      toast.success(t('modelwallet.success.payoutRequested'));
      setAmount('');
      setConfirmDialogOpen(false);

      const [walletRes, transactionsRes] = await Promise.all([
        axios.get('/wallet/model/my-wallet'),
        axios.get('/wallet/model/transactions'),
      ]);
      setWallet(walletRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      if (isAxiosError<{ message: string }>(error)) {
        toast.error(error.response?.data?.message || t('modelwallet.errors.payoutFailed'));
      } else {
        toast.error(t('modelwallet.errors.payoutFailed'));
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const now = new Date();

    switch (timeRange) {
      case 'week':
        return transactionDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return transactionDate >= new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return transactionDate >= new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return true;
    }
  });

  const totalEarnings = filteredTransactions
    .filter((t) => t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = filteredTransactions
    .filter((t) => t.type === 'payout')
    .reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
          <p className="text-rose-700 text-lg font-medium">{t('modelwallet.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      <ModelNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Wallet className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('modelwallet.pageTitle')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">{t('modelwallet.pageSubtitle')}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Wallet Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="w-5 h-5" />
                {t('modelwallet.overview.availableBalance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1 h-auto text-green-600 hover:text-green-700"
                >
                  {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <div className="text-3xl lg:text-4xl font-bold text-green-600">
                  {showBalance
                    ? `${Number(wallet?.balance ?? 0).toFixed(2)}`
                    : '••••'}
                </div>
              </div>
              <p className="text-green-700 text-sm">{t('modelwallet.availableNow')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hourglass className="w-5 h-5" />
                {t('modelwallet.overview.pendingEarnings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-amber-600 mb-3">
                {Number(wallet?.pending_clearance ?? 0).toFixed(2)}
              </div>
              <p className="text-amber-700 text-sm">{t('modelwallet.underReview')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5" />
                {t('modelwallet.overview.totalEarnings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-3">
                {(Number(wallet?.balance ?? 0) + Number(wallet?.pending_clearance ?? 0)).toFixed(2)}
              </div>
              <p className="text-blue-700 text-sm">{t('modelwallet.allTimeEarnings')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5" />
                {t('modelwallet.overview.thisMonth')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 text-center">
              <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-3">
                {totalEarnings.toFixed(2)}
              </div>
              <p className="text-purple-700 text-sm">{t('modelwallet.currentMonthEarnings')}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payout Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Send className="h-6 w-6" />
                  {t('modelwallet.payout.title')}
                </CardTitle>
                <CardDescription className="text-pink-100">
                  {t('modelwallet.payout.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handlePayoutRequest} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="amount" className="text-rose-800 font-medium text-lg">
                      {t('modelwallet.payout.amountLabel')}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={t('modelwallet.payout.amountPlaceholder')}
                      min="50"
                      max={wallet?.balance}
                      disabled={isSubmitting}
                      className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-lg"
                    />
                    <div className="flex justify-between text-sm text-rose-600">
                      <span>{t('modelwallet.payout.minAmount', { min: 50 })}</span>
                      <span>
                        {t('modelwallet.payout.available', {
                          balance: Number(wallet?.balance ?? 0).toFixed(2),
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-rose-800 font-medium text-lg">
                      {t('modelwallet.payout.methodLabel')}
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {payoutMethods.map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setSelectedMethod(method.id)}
                          className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                            selectedMethod === method.id
                              ? 'border-rose-500 bg-rose-50 shadow-lg'
                              : 'border-rose-200 bg-white hover:border-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-xl ${
                                method.type === 'bank'
                                  ? 'bg-blue-100 text-blue-600'
                                  : 'bg-green-100 text-green-600'
                              }`}
                            >
                              {method.type === 'bank' ? (
                                <CreditCard className="w-5 h-5" />
                              ) : (
                                <Banknote className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-rose-800">{method.name}</div>
                              <div className="text-sm text-rose-600">{method.details}</div>
                            </div>
                            {method.isDefault && (
                              <Badge className="bg-rose-500 text-white text-xs">
                                {t('modelwallet.default')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-rose-800 font-medium text-sm">
                      {t('modelwallet.payout.quickAmounts')}
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {[100, 250, 500, 1000].map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          type="button"
                          variant="outline"
                          onClick={() => setAmount(quickAmount.toString())}
                          className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                        >
                          {quickAmount} ر.س
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-200">
                    <Shield className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-rose-700">
                      <p className="font-medium">{t('modelwallet.payout.securityNotice.title')}</p>
                      <p>{t('modelwallet.payout.securityNotice.description')}</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !amount ||
                      !selectedMethod ||
                      parseFloat(amount) < 50
                    }
                    className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t('modelwallet.payout.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        {t('modelwallet.payout.submit')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Transactions */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden h-full">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <History className="h-5 w-5" />
                  {t('modelwallet.transactions.title')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select
                    value={timeRange}
                    onValueChange={(value: 'week' | 'month' | 'year') =>
                      setTimeRange(value)
                    }
                  >
                    <SelectTrigger className="w-32 bg-white/20 border-white text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">
                        {t('modelwallet.transactions.timeRange.week')}
                      </SelectItem>
                      <SelectItem value="month">
                        {t('modelwallet.transactions.timeRange.month')}
                      </SelectItem>
                      <SelectItem value="year">
                        {t('modelwallet.transactions.timeRange.year')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {filteredTransactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-white rounded-2xl border border-rose-200 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-xl ${
                            transaction.type === 'earning'
                              ? 'bg-green-100 text-green-600'
                              : transaction.type === 'payout'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {transaction.type === 'earning' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : transaction.type === 'payout' ? (
                            <Send className="w-4 h-4" />
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-rose-900 text-sm">
                            {transaction.description}
                          </p>
                          <p className="text-rose-600 text-xs">
                            {new Date(transaction.date).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-lg ${
                            transaction.type === 'earning'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {transaction.type === 'earning' ? '+' : '-'}
                          {transaction.amount.toFixed(2)} ر.س
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status === 'completed'
                            ? t('modelwallet.transactions.status.completed')
                            : transaction.status === 'pending'
                            ? t('modelwallet.transactions.status.pending')
                            : t('modelwallet.transactions.status.failed')}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-rose-300 mx-auto mb-3" />
                      <p className="text-rose-600">{t('modelwallet.transactions.noTransactions')}</p>
                    </div>
                  )}

                  {filteredTransactions.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {t('modelwallet.transactions.viewAll')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Earnings Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Zap className="h-5 w-5" />
              {t('modelwallet.summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  +{totalEarnings.toFixed(2)}
                </div>
                <div className="text-green-700 text-sm">
                  {t('modelwallet.summary.totalRevenue')}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  -{totalPayouts.toFixed(2)}
                </div>
                <div className="text-blue-700 text-sm">
                  {t('modelwallet.summary.totalPayouts')}
                </div>
              </div>
              <div className="text-center p-4 bg-rose-50 rounded-2xl border border-rose-200">
                <div className="text-2xl font-bold text-rose-600 mb-1">
                  {Number(wallet?.balance ?? 0).toFixed(2)}
                </div>
                <div className="text-rose-700 text-sm">
                  {t('modelwallet.summary.netBalance')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-800">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              {t('modelwallet.payout.confirmDialog.title')}
            </DialogTitle>
            <DialogDescription>
              {t('modelwallet.payout.confirmDialog.description', { amount })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-rose-700">
                  {t('modelwallet.payout.confirmDialog.amount')}
                </span>
                <span className="font-bold text-rose-800">{amount} ر.س</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-rose-700">
                  {t('modelwallet.payout.confirmDialog.method')}
                </span>
                <span className="font-bold text-rose-800">
                  {payoutMethods.find((m) => m.id === selectedMethod)?.name}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              {t('modelwallet.payout.confirmDialog.cancel')}
            </Button>
            <Button
              onClick={confirmPayoutRequest}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('modelwallet.payout.confirmDialog.processing')}
                </div>
              ) : (
                t('modelwallet.payout.confirmDialog.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelWalletPage;