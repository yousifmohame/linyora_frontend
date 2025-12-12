// frontend/src/app/dashboard/wallet/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
// ✅ Removed unused: useAuth
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
    Wallet, 
    DollarSign, 
    Hourglass, 
    Send, 
    Download, 
    History, 
    TrendingUp,
    Shield,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import Navigation from '@/components/dashboards/Navigation';
import { Label } from '@/components/ui/label';

interface WalletData {
    balance: string;
    pending_clearance: string;
    total_earnings?: string;
    last_payout?: string;
}

interface Transaction {
    id: number;
    amount: string;
    type: 'payout' | 'earning' | 'refund';
    status: 'completed' | 'pending' | 'failed';
    description: string;
    created_at: string;
    reference_id?: string;
}

export default function WalletPage() {
    const { t, i18n } = useTranslation();
    // ✅ Removed: const { user } = useAuth();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchWalletData = async () => {
            try {
                const { data } = await api.get<WalletData>('/wallet/my-wallet');
                setWallet(data);
            } catch (_error) { // ✅ unused → _error
                toast.error(t('WalletPage.toast.fetchWalletError.title'), {
                    description: t('WalletPage.toast.fetchWalletError.description')
                });
            } finally {
                setIsLoading(false);
            }
        };

        const fetchTransactions = async () => {
            setTransactionsLoading(true);
            try {
                const { data } = await api.get<Transaction[]>('/wallet/transactions');
                setTransactions(data);
            } catch (_error) { // ✅ unused → _error
                console.error('Failed to fetch transactions:', _error);
            } finally {
                setTransactionsLoading(false);
            }
        };

        fetchWalletData();
        fetchTransactions();
    }, [t]); // t is used in toast messages

    const handlePayoutRequest = async () => {
        const amount = Number(payoutAmount);
        const availableBalance = wallet ? parseFloat(wallet.balance) : 0;

        if (amount <= 0) {
            toast.warning(t('WalletPage.toast.invalidAmount.title'), {
                description: t('WalletPage.toast.invalidAmount.description')
            });
            return;
        }

        if (amount > availableBalance) {
            toast.error(t('WalletPage.toast.insufficientBalance.title'), {
                description: t('WalletPage.toast.insufficientBalance.description')
            });
            return;
        }

        if (amount < 50) {
            toast.warning(t('WalletPage.toast.minPayout.title'), {
                description: t('WalletPage.toast.minPayout.description', { minAmount: 50 })
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post('/wallet/request-payout', { amount: payoutAmount });
            toast.success(t('WalletPage.toast.payoutSuccess.title'), {
                description: response.data.message || t('WalletPage.toast.payoutSuccess.description')
            });
            setPayoutAmount('');
            // Refetch data
            const { data: walletData } = await api.get<WalletData>('/wallet/my-wallet');
            const { data: transactionData } = await api.get<Transaction[]>('/wallet/transactions');
            setWallet(walletData);
            setTransactions(transactionData);
        } catch (error) { // ✅ No `any` — safe error handling
            let errorMessage = t('WalletPage.toast.payoutError.description');
            if (error instanceof Error) {
                if ('response' in error && error.response) {
                    const axiosError = error as { response?: { data?: { message?: string } } };
                    errorMessage = axiosError.response?.data?.message || errorMessage;
                }
            }
            toast.error(t('WalletPage.toast.payoutError.title'), {
                description: errorMessage
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatCurrency = (amount: string | number) => {
        const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: t('common.currencyCode', { defaultValue: 'SAR' }),
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(numAmount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'payout': return <Send className="w-4 h-4 text-red-500" />;
            case 'earning': return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'refund': return <History className="w-4 h-4 text-orange-500" />;
            default: return <DollarSign className="w-4 h-4 text-gray-500" />;
        }
    };

    const getTransactionStatus = (status: string) => {
        const statusConfig = {
            completed: { 
                label: t('WalletPage.transactionStatus.completed'), 
                variant: 'default' as const, 
                className: 'bg-green-100 text-green-800' 
            },
            pending: { 
                label: t('WalletPage.transactionStatus.pending'), 
                variant: 'secondary' as const, 
                className: 'bg-yellow-100 text-yellow-800' 
            },
            failed: { 
                label: t('WalletPage.transactionStatus.failed'), 
                variant: 'destructive' as const, 
                className: 'bg-red-100 text-red-800' 
            }
        };
        return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    };

    const getTransactionTypeLabel = (type: string) => {
        const typeLabels = {
            payout: t('WalletPage.transactionType.payout'),
            earning: t('WalletPage.transactionType.earning'),
            refund: t('WalletPage.transactionType.refund')
        };
        return typeLabels[type as keyof typeof typeLabels] || type;
    };

    return (
        <div className="min-h-screen bg-gray-50/30 p-4 md:p-6">
            <Navigation />
            
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-purple-600" />
                            {t('WalletPage.title')}
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base">
                            {t('WalletPage.description')}
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4 lg:mt-0">
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            {t('WalletPage.actions.downloadStatement')}
                        </Button>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            {t('WalletPage.tabs.overview')}
                        </TabsTrigger>
                        <TabsTrigger value="transactions" className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            {t('WalletPage.tabs.transactions')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Wallet Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                            <Card className="bg-white border">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{t('WalletPage.stats.availableBalance')}</p>
                                            <div className="text-2xl font-bold text-green-600">
                                                {isLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(wallet?.balance || 0)}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <DollarSign className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t('WalletPage.stats.availableBalanceDesc')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{t('WalletPage.stats.pendingEarnings')}</p>
                                            <div className="text-2xl font-bold text-orange-600">
                                                {isLoading ? (
                                                    <Skeleton className="h-8 w-24" />
                                                ) : (
                                                    formatCurrency(wallet?.pending_clearance || 0)
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-orange-50 rounded-lg">
                                            <Hourglass className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t('WalletPage.stats.pendingEarningsDesc')}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-white border">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">{t('WalletPage.stats.totalEarnings')}</p>
                                            <div className="text-2xl font-bold text-blue-600">
                                                {isLoading ? (
                                                    <Skeleton className="h-8 w-24" />
                                                ) : (
                                                    formatCurrency(wallet?.total_earnings || 0)
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <TrendingUp className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {t('WalletPage.stats.totalEarningsDesc')}
                                    </p>
                                </CardContent>
                            </Card>

                            
                        </div>

                        {/* Payout Request Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 bg-white border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Send className="w-5 h-5" />
                                        {t('WalletPage.payout.title')}
                                    </CardTitle>
                                    <CardDescription>
                                        {t('WalletPage.payout.description')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert className="bg-blue-50 border-blue-200">
                                        <Shield className="w-4 h-4 text-blue-600" />
                                        <AlertDescription className="text-blue-800">
                                            {t('WalletPage.payout.minAmountNotice', { minAmount: 50 })}
                                        </AlertDescription>
                                    </Alert>
                                    
                                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                                        <div className="flex-1 space-y-2">
                                            <Label htmlFor="payoutAmount" className="text-sm font-medium">
                                                {t('WalletPage.payout.amountLabel')}
                                            </Label>
                                            <Input
                                                id="payoutAmount"
                                                type="number"
                                                placeholder={t('WalletPage.payout.amountPlaceholder')}
                                                value={payoutAmount}
                                                onChange={(e) => setPayoutAmount(e.target.value)}
                                                disabled={isSubmitting}
                                                min="50"
                                                step="0.01"
                                                className="text-lg"
                                            />
                                        </div>
                                        <Button 
                                            onClick={handlePayoutRequest} 
                                            disabled={isSubmitting || !payoutAmount}
                                            className="flex items-center gap-2 w-full sm:w-auto"
                                            size="lg"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Clock className="w-4 h-4 animate-spin" />
                                                    {t('WalletPage.payout.processing')}
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    {t('WalletPage.payout.confirmButton')}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    
                                    {payoutAmount && (
                                        <div className="p-3 bg-gray-50 rounded-lg border">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600">{t('WalletPage.payout.availableBalance')}:</span>
                                                <span className="font-medium">{formatCurrency(wallet?.balance || 0)}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm mt-1">
                                                <span className="text-gray-600">{t('WalletPage.payout.requestedAmount')}:</span>
                                                <span className="font-medium">{formatCurrency(payoutAmount)}</span>
                                            </div>
                                            {Number(payoutAmount) > (wallet ? parseFloat(wallet.balance) : 0) && (
                                                <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {t('WalletPage.payout.insufficientBalance')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Info Card */}
                            <Card className="bg-white border">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        {t('WalletPage.info.title')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div className="font-medium">{t('WalletPage.info.security.title')}</div>
                                            <div className="text-gray-600">{t('WalletPage.info.security.description')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div className="font-medium">{t('WalletPage.info.processingTime.title')}</div>
                                            <div className="text-gray-600">{t('WalletPage.info.processingTime.description')}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                                        <div className="text-sm">
                                            <div className="font-medium">{t('WalletPage.info.minAmount.title', { minAmount: 50 })}</div>
                                            <div className="text-gray-600">{t('WalletPage.info.minAmount.description')}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Transactions Tab */}
                    <TabsContent value="transactions" className="space-y-6">
                        <Card className="bg-white border">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    {t('WalletPage.transactions.title')}
                                </CardTitle>
                                <CardDescription>
                                    {t('WalletPage.transactions.description')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {transactionsLoading ? (
                                    <div className="space-y-4">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="w-10 h-10 rounded-full" />
                                                    <div className="space-y-2">
                                                        <Skeleton className="h-4 w-32" />
                                                        <Skeleton className="h-3 w-24" />
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-2">
                                                    <Skeleton className="h-4 w-16 ml-auto" />
                                                    <Skeleton className="h-3 w-20 ml-auto" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <div className="text-gray-500">{t('WalletPage.transactions.empty')}</div>
                                        <div className="text-sm text-gray-400 mt-1">
                                            {t('WalletPage.transactions.emptyDescription')}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {transactions.map((transaction) => {
                                            const statusConfig = getTransactionStatus(transaction.status);
                                            return (
                                                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50/50">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gray-100 rounded-lg">
                                                            {getTransactionIcon(transaction.type)}
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {getTransactionTypeLabel(transaction.type)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {transaction.description}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {formatDate(transaction.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`font-bold text-lg ${
                                                            transaction.type === 'payout' ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                            {transaction.type === 'payout' ? '-' : '+'}{formatCurrency(transaction.amount)}
                                                        </div>
                                                        <Badge 
                                                            variant={statusConfig.variant}
                                                            className={`mt-1 ${statusConfig.className}`}
                                                        >
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}