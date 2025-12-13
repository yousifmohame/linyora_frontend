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
  status: 'approved' | 'pending' | 'failed' | 'pending_clearance';
  reference?: string;
}

const ModelWalletPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<ModelWallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletRes, transactionsRes] = await Promise.all([
          axios.get('/wallet/model/my-wallet'),
          axios.get('/wallet/model/transactions'),
        ]);

        const normalizedTransactions = transactionsRes.data.map((t: any) => ({
          ...t,
          amount: typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount,
        }));

        setWallet(walletRes.data);
        setTransactions(normalizedTransactions);
        
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

    setConfirmDialogOpen(true);
  };

  const confirmPayoutRequest = async () => {
    setIsSubmitting(true);
    try {
      await axios.post('/wallet/model/request-payout', {
        amount: parseFloat(amount),
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
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return transactionDate >= oneMonthAgo;
      case 'year':
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return transactionDate >= oneYearAgo;
      default:
        return true;
    }
  });

  const totalEarnings = filteredTransactions
    .filter((t) => t.type === 'earning')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  const totalPayouts = filteredTransactions
    .filter((t) => t.type === 'payout')
    .reduce((sum, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : parseFloat(t.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  if (loading || !isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <ModelNav />
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">{t('modelwallet.loading')}</p>
        </div>
      </div>
    );
  }

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
            <Wallet className="h-6 w-6 text-rose-600" />
          </div>
          <Sparkles className="h-4 w-4 text-rose-300" />
          <Crown className="h-4 w-4 text-rose-300" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
          {t('modelwallet.pageTitle')}
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {t('modelwallet.pageSubtitle')}
        </p>
      </header>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ✅ Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <StatCard 
            title={t('modelwallet.overview.availableBalance')}
            value={showBalance ? `${Number(wallet?.balance ?? 0).toFixed(2)}` : '••••'}
            icon={Wallet}
            color="green"
            showToggle
            onToggle={() => setShowBalance(!showBalance)}
            isHidden={!showBalance}
          />
          <StatCard 
            title={t('modelwallet.overview.pendingEarnings')}
            value={Number(wallet?.pending_clearance ?? 0).toFixed(2)}
            icon={Hourglass}
            color="amber"
          />
          <StatCard 
            title={t('modelwallet.overview.totalEarnings')}
            value={(Number(wallet?.balance ?? 0) + Number(wallet?.pending_clearance ?? 0)).toFixed(2)}
            icon={TrendingUp}
            color="blue"
          />
          <StatCard 
            title={t('modelwallet.overview.thisMonth')}
            value={Number(totalEarnings).toFixed(2)}
            icon={BarChart3}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Payout Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Send className="h-4 w-4" />
                  {t('modelwallet.payout.title')}
                </CardTitle>
                <CardDescription className="text-purple-100 text-xs mt-0.5">
                  {t('modelwallet.payout.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <form onSubmit={handlePayoutRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-gray-800 font-medium text-sm">
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
                      className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                    />
                    <div className="flex justify-between text-[10px] text-gray-600">
                      <span>{t('modelwallet.payout.minAmount', { min: 50 })}</span>
                      <span>
                        {t('modelwallet.payout.available', {
                          balance: Number(wallet?.balance ?? 0).toFixed(2),
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-800 font-medium text-[10px]">
                      {t('modelwallet.payout.quickAmounts')}
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[100, 250, 500, 1000].map((quickAmount) => (
                        <Button
                          key={quickAmount}
                          type="button"
                          variant="outline"
                          onClick={() => setAmount(quickAmount.toString())}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-[10px] h-7 px-2"
                        >
                          {quickAmount} ر.س
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 bg-rose-50 rounded-lg border border-rose-200/50">
                    <Shield className="w-3 h-3 text-rose-500 mt-0.5 flex-shrink-0" />
                    <div className="text-[10px] text-rose-600">
                      <p className="font-medium">{t('modelwallet.payout.securityNotice.title')}</p>
                      <p>{t('modelwallet.payout.securityNotice.description')}</p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !amount ||
                      parseFloat(amount) < 50
                    }
                    className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white h-10 rounded-lg text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></div>
                        {t('modelwallet.payout.submitting')}
                      </>
                    ) : (
                      <>
                        <Send className="mr-1.5 h-3 w-3" />
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
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm h-full">
              <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
                <CardTitle className="flex items-center gap-2 text-base">
                  <History className="h-4 w-4" />
                  {t('modelwallet.transactions.title')}
                </CardTitle>
                <Select
                  value={timeRange}
                  onValueChange={(value: 'week' | 'month' | 'year') => setTimeRange(value)}
                >
                  <SelectTrigger className="w-28 bg-white/20 border-white text-white h-7 text-xs mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">{t('modelwallet.transactions.timeRange.week')}</SelectItem>
                    <SelectItem value="month">{t('modelwallet.transactions.timeRange.month')}</SelectItem>
                    <SelectItem value="year">{t('modelwallet.transactions.timeRange.year')}</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3">
                  {filteredTransactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-1.5 rounded-lg ${
                            transaction.type === 'earning'
                              ? 'bg-green-100 text-green-600'
                              : transaction.type === 'payout'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-amber-100 text-amber-600'
                          }`}
                        >
                          {transaction.type === 'earning' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : transaction.type === 'payout' ? (
                            <Send className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-[10px]">
                            {transaction.description}
                          </p>
                          <p className="text-gray-600 text-[9px] mt-0.5">
                            {new Date(transaction.date).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold text-xs ${
                            transaction.type === 'earning'
                              ? 'text-green-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {transaction.type === 'earning' ? '+' : '-'}
                          {Number(transaction.amount).toFixed(2)} ر.س
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-[9px] px-1.5 py-0.5 ${
                            transaction.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : (transaction.status === 'pending' || transaction.status === 'pending_clearance') 
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status === 'approved'
                            ? t('modelwallet.transactions.status.completed')
                            : (transaction.status === 'pending' || transaction.status === 'pending_clearance')
                            ? t('modelwallet.transactions.status.pending')
                            : t('modelwallet.transactions.status.failed')}
                        </Badge>
                      </div>
                    </div>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-6">
                      <History className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-xs">{t('modelwallet.transactions.noTransactions')}</p>
                    </div>
                  )}

                  {filteredTransactions.length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs h-8"
                    >
                      <Download className="w-3 h-3 mr-1.5" />
                      {t('modelwallet.transactions.viewAll')}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="h-4 w-4" />
              {t('modelwallet.summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SummaryItem 
                label={t('modelwallet.summary.totalRevenue')}
                value={`+${Number(totalEarnings).toFixed(2)}`}
                color="green"
              />
              <SummaryItem 
                label={t('modelwallet.summary.totalPayouts')}
                value={`-${Number(totalPayouts).toFixed(2)}`}
                color="blue"
              />
              <SummaryItem 
                label={t('modelwallet.summary.netBalance')}
                value={Number(wallet?.balance ?? 0).toFixed(2)}
                color="rose"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl max-w-[320px] mx-2">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900 text-base">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              {t('modelwallet.payout.confirmDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-600 text-sm">
              {t('modelwallet.payout.confirmDialog.description', { amount })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-3 bg-rose-50 rounded-lg border border-rose-200/50">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-sm">
                {t('modelwallet.payout.confirmDialog.amount')}
              </span>
              <span className="font-bold text-gray-900 text-sm">{amount} ر.س</span>
            </div>
          </div>
          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-sm h-8"
            >
              {t('modelwallet.payout.confirmDialog.cancel')}
            </Button>
            <Button
              onClick={confirmPayoutRequest}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded text-sm h-8"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

// ✅ Reusable Stat Card
const StatCard = ({ title, value, icon: Icon, color, showToggle, onToggle, isHidden }: { 
  title: string; 
  value: string; 
  icon: any; 
  color: 'green' | 'amber' | 'blue' | 'purple' | 'rose';
  showToggle?: boolean;
  onToggle?: () => void;
  isHidden?: boolean;
}) => {
  const colorMap = {
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border ${colorMap[color]} shadow-sm rounded-lg`}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Icon className="w-4 h-4" />
            <span className="text-[10px] font-medium text-gray-600">{title}</span>
          </div>
          {showToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-5 w-5 p-0 text-gray-500 hover:text-gray-700"
            >
              {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          )}
        </div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
      </CardContent>
    </Card>
  );
};

// ✅ Summary Item
const SummaryItem = ({ label, value, color }: { label: string; value: string; color: 'green' | 'blue' | 'rose' }) => {
  const colorMap = {
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
  };

  return (
    <div className={`text-center p-2.5 rounded-lg border ${colorMap[color]}`}>
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[10px] text-gray-700 mt-1">{label}</div>
    </div>
  );
};

export default ModelWalletPage;