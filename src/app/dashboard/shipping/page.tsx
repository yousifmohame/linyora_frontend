// frontend/src/app/dashboard/shipping/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
    PlusCircle, 
    Edit, 
    Trash2, 
    Truck, 
    Package, 
    DollarSign,
    Search,
    RefreshCw,
    Sparkles,
    Crown,
    Download,
    MapPin,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Navigation from '@/components/dashboards/Navigation';
import { withSubscription } from '@/components/auth/withSubscription';
import { Switch } from '@/components/ui/switch';

interface RawShippingCompany {
  id: number;
  name: string;
  shipping_cost: number | string;
  is_active: boolean;
  delivery_time?: string;
  created_at: string;
}

interface ShippingCompany {
  id: number;
  name: string;
  shipping_cost: number;
  is_active: boolean;
  delivery_time?: string;
  created_at: string;
}

const parseShippingCompany = (raw: RawShippingCompany, t: (key: string) => string): ShippingCompany => ({
    id: raw.id,
    name: raw.name || '',
    shipping_cost: typeof raw.shipping_cost === 'number'
        ? raw.shipping_cost
        : parseFloat(String(raw.shipping_cost)) || 0,
    is_active: raw.is_active !== false,
    delivery_time: raw.delivery_time || t('ShippingPage.defaults.deliveryTime'),
    created_at: raw.created_at || new Date().toISOString(),
});

function MerchantShippingPage() {
    const { t, i18n } = useTranslation();
    const [companies, setCompanies] = useState<ShippingCompany[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<ShippingCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentCompany, setCurrentCompany] = useState<Partial<ShippingCompany>>({});
    const [companyToDelete, setCompanyToDelete] = useState<ShippingCompany | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    const fetchCompanies = useCallback(async () => {
        setRefreshing(true);
        try {
            const response = await api.get<RawShippingCompany[]>('/merchants/shipping');
            const parsed = response.data.map(raw => parseShippingCompany(raw, t));
            setCompanies(parsed);
            setFilteredCompanies(parsed);
        } catch (_error) {
            toast.error(t('ShippingPage.errors.fetchFailed'));
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);

    useEffect(() => {
        const filtered = companies.filter(company =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.delivery_time?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCompanies(filtered);
    }, [searchTerm, companies]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const { id, name, shipping_cost, delivery_time } = currentCompany;

        if (!name || shipping_cost === undefined || isNaN(shipping_cost)) {
            toast.error(t('ShippingPage.errors.missingFields'));
            return;
        }

        try {
            if (id) {
                await api.put(`/merchants/shipping/${id}`, { 
                    name, 
                    shipping_cost,
                    delivery_time 
                });
                toast.success(t('ShippingPage.success.update'));
            } else {
                await api.post('/merchants/shipping', { 
                    name, 
                    shipping_cost,
                    delivery_time: delivery_time || t('ShippingPage.defaults.deliveryTime'),
                    is_active: true 
                });
                toast.success(t('ShippingPage.success.create'));
            }
            setIsDialogOpen(false);
            setCurrentCompany({});
            fetchCompanies();
        } catch (_error) {
            toast.error(t('ShippingPage.errors.saveFailed'));
        }
    };

    const handleDelete = async () => {
        if (!companyToDelete) return;
        
        try {
            await api.delete(`/merchants/shipping/${companyToDelete.id}`);
            toast.success(t('ShippingPage.success.delete'));
            setIsDeleteDialogOpen(false);
            setCompanyToDelete(null);
            fetchCompanies();
        } catch (_error) {
            toast.error(t('ShippingPage.errors.deleteFailed'));
        }
    };

    const handleStatusToggle = async (company: ShippingCompany) => {
        try {
            await api.put(`/merchants/shipping/${company.id}`, {
                ...company,
                is_active: !company.is_active
            });
            toast.success(t('ShippingPage.success.toggleStatus', { action: company.is_active ? t('ShippingPage.status.deactivated') : t('ShippingPage.status.activated') }));
            fetchCompanies();
        } catch (_error) {
            toast.error(t('ShippingPage.errors.toggleFailed'));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
            style: 'currency',
            currency: 'SAR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const exportData = () => {
        toast.info(t('ShippingPage.info.exporting'));
    };

    const stats = {
        total: companies.length,
        active: companies.filter(c => c.is_active).length,
        totalCost: companies.reduce((sum, company) => sum + company.shipping_cost, 0),
        averageCost: companies.length > 0 ? companies.reduce((sum, company) => sum + company.shipping_cost, 0) / companies.length : 0
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-4 sm:p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            
            <Navigation />

            <header className="mb-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2.5 bg-white rounded-xl shadow-md">
                        <Truck className="h-7 w-7 text-rose-500" />
                    </div>
                    <Sparkles className="h-5 w-5 text-rose-300" />
                    <Crown className="h-5 w-5 text-rose-300" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {t('ShippingPage.title')}
                </h1>
                <p className="text-rose-700 text-base max-w-xl mx-auto px-2">
                    {t('ShippingPage.subtitle')}
                </p>
                <div className="w-20 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-3"></div>
            </header>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow rounded-xl text-center">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-rose-600">{stats.total}</div>
                        <div className="text-rose-700 text-xs">{t('ShippingPage.stats.total')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow rounded-xl text-center">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-green-600">{stats.active}</div>
                        <div className="text-green-700 text-xs">{t('ShippingPage.stats.active')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow rounded-xl text-center">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-blue-600">
                            {stats.averageCost.toFixed(0)}
                        </div>
                        <div className="text-blue-700 text-xs">{t('ShippingPage.stats.averageCost')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow rounded-xl text-center">
                    <CardContent className="p-3">
                        <div className="text-xl font-bold text-purple-600">
                            {stats.totalCost.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}
                        </div>
                        <div className="text-purple-700 text-xs">{t('ShippingPage.stats.totalCost')}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Controls */}
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow rounded-2xl mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                            <Input
                                placeholder={t('ShippingPage.search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl w-full"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button 
                                variant="outline" 
                                onClick={exportData}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-sm px-3 h-9"
                            >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                {t('ShippingPage.actions.export')}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={fetchCompanies}
                                disabled={refreshing}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-sm px-3 h-9"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                                {t('ShippingPage.actions.refresh')}
                            </Button>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        onClick={() => setCurrentCompany({})}
                                        className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-sm px-3 h-9"
                                    >
                                        <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                                        {t('ShippingPage.actions.addCompany')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl shadow-lg max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-rose-800">
                                            <Truck className="w-5 h-5" />
                                            {currentCompany.id ? t('ShippingPage.dialog.editTitle') : t('ShippingPage.dialog.createTitle')}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSave} className="space-y-4 mt-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-rose-800 font-medium">
                                                {t('ShippingPage.form.name.label')}
                                            </Label>
                                            <Input
                                                id="name"
                                                value={currentCompany.name || ''}
                                                onChange={(e) => setCurrentCompany(p => ({ ...p, name: e.target.value }))}
                                                placeholder={t('ShippingPage.form.name.placeholder')}
                                                required
                                                className="border-rose-200 focus:border-rose-400 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="shipping_cost" className="text-rose-800 font-medium">
                                                {t('ShippingPage.form.cost.label')}
                                            </Label>
                                            <Input
                                                id="shipping_cost"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={currentCompany.shipping_cost ?? ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCurrentCompany(prev => ({
                                                        ...prev,
                                                        shipping_cost: val === '' ? undefined : parseFloat(val)
                                                    }));
                                                }}
                                                placeholder="0.00"
                                                required
                                                className="border-rose-200 focus:border-rose-400 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="delivery_time" className="text-rose-800 font-medium">
                                                {t('ShippingPage.form.deliveryTime.label')}
                                            </Label>
                                            <Input
                                                id="delivery_time"
                                                value={currentCompany.delivery_time || ''}
                                                onChange={(e) => setCurrentCompany(p => ({ ...p, delivery_time: e.target.value }))}
                                                placeholder={t('ShippingPage.form.deliveryTime.placeholder')}
                                                className="border-rose-200 focus:border-rose-400 rounded-xl"
                                            />
                                        </div>
                                        <DialogFooter className="flex gap-2 pt-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsDialogOpen(false)}
                                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl flex-1 text-sm"
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl flex-1 text-sm"
                                            >
                                                {currentCompany.id ? t('common.update') : t('common.add')}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Truck className="w-5 h-5" />
                                {t('ShippingPage.table.title')}
                            </CardTitle>
                            <CardDescription className="text-pink-100 text-sm">
                                {t('ShippingPage.table.subtitle', { count: filteredCompanies.length })}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs px-2 py-1">
                            {filteredCompanies.length} {t('ShippingPage.table.companies')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm whitespace-nowrap">{t('ShippingPage.table.headers.company')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm whitespace-nowrap">{t('ShippingPage.table.headers.cost')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm whitespace-nowrap">{t('ShippingPage.table.headers.deliveryTime')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm whitespace-nowrap">{t('ShippingPage.table.headers.status')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm whitespace-nowrap">{t('ShippingPage.table.headers.dateAdded')}</TableHead>
                                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm text-left whitespace-nowrap">{t('ShippingPage.table.headers.actions')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mb-2"></div>
                                                <p className="text-rose-700 text-sm">{t('ShippingPage.loading')}</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredCompanies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 px-2">
                                            <div className="flex flex-col items-center justify-center">
                                                <Truck className="w-12 h-12 text-rose-300 mb-2" />
                                                <h3 className="font-bold text-lg text-rose-800 mb-1">{t('ShippingPage.empty.title')}</h3>
                                                <p className="text-rose-600 text-sm px-2">
                                                    {searchTerm
                                                        ? t('ShippingPage.empty.noResults')
                                                        : t('ShippingPage.empty.noCompanies')
                                                    }
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredCompanies.map((company) => (
                                        <TableRow key={company.id} className="border-rose-100 hover:bg-rose-50/30">
                                            <TableCell className="font-medium text-rose-900 text-sm py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-7 h-7 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                                        <Truck className="w-3 h-3" />
                                                    </div>
                                                    {company.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-rose-600 font-bold text-sm py-3 px-3">
                                                {company.shipping_cost.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')} {t('ShippingPage.currency')}
                                            </TableCell>
                                            <TableCell className="text-rose-600 text-sm py-3 px-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-xs sm:text-sm">{company.delivery_time}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 px-3">
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={company.is_active}
                                                        onCheckedChange={() => handleStatusToggle(company)}
                                                        className="data-[state=checked]:bg-green-500"
                                                    />
                                                    <Badge 
                                                        variant="outline" 
                                                        className={company.is_active 
                                                            ? "bg-green-100 text-green-700 border-green-200 text-xs px-2 py-0.5" 
                                                            : "bg-red-100 text-red-700 border-red-200 text-xs px-2 py-0.5"
                                                        }
                                                    >
                                                        {company.is_active ? 
                                                            <CheckCircle className="w-3 h-3 mr-1" /> : 
                                                            <XCircle className="w-3 h-3 mr-1" />
                                                        }
                                                        {company.is_active ? t('ShippingPage.status.active') : t('ShippingPage.status.inactive')}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-rose-600 text-xs sm:text-sm py-3 px-3">
                                                {formatDate(company.created_at)}
                                            </TableCell>
                                            <TableCell className="py-3 px-3">
                                                <div className="flex flex-col sm:flex-row gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCurrentCompany(company);
                                                            setIsDialogOpen(true);
                                                        }}
                                                        className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-lg text-xs h-8"
                                                    >
                                                        <Edit className="h-3 w-3 mr-1" />
                                                        {t('common.edit')}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCompanyToDelete(company);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                        className="text-red-600 hover:bg-red-50 border-red-200 rounded-lg text-xs h-8"
                                                    >
                                                        <Trash2 className="h-3 w-3 mr-1" />
                                                        {t('common.delete')}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl shadow-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-rose-800">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            {t('ShippingPage.delete.confirmTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-rose-600">
                            {companyToDelete && t('ShippingPage.delete.confirmMessage', { name: companyToDelete.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-2">
                        <AlertDialogCancel 
                            onClick={() => setCompanyToDelete(null)}
                            className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-sm"
                        >
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default withSubscription(MerchantShippingPage);