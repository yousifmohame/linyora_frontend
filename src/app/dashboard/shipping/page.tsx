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
        // ✅ Added overflow-hidden to prevent background overflow
        <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
            {/* ✅ Smaller, constrained background blobs */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 max-w-full"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10 max-w-full"></div>
            
            <Navigation />

            <header className="mb-5 sm:mb-6 text-center px-1">
                <div className="flex items-center justify-center gap-2 mb-2.5">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-rose-100">
                        <Truck className="h-6 w-6 text-rose-600" />
                    </div>
                    <Sparkles className="h-4 w-4 text-rose-300 hidden sm:block" />
                    <Crown className="h-4 w-4 text-rose-300 hidden sm:block" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-1.5">
                    {t('ShippingPage.title')}
                </h1>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                    {t('ShippingPage.subtitle')}
                </p>
            </header>

            {/* ✅ Responsive Stats Grid (2 cols on mobile) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-5">
                <StatCard value={stats.total} label={t('ShippingPage.stats.total')} color="rose" />
                <StatCard value={stats.active} label={t('ShippingPage.stats.active')} color="green" />
                <StatCard value={stats.averageCost.toFixed(0)} label={t('ShippingPage.stats.averageCost')} color="blue" />
                <StatCard value={stats.totalCost.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')} label={t('ShippingPage.stats.totalCost')} color="purple" />
            </div>

            {/* Controls */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-xl mb-5">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
                            <Input
                                placeholder={t('ShippingPage.search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-3 rtl:pl-3 rtl:pr-10 border border-gray-200 focus:border-purple-500 rounded-lg w-full h-10 text-sm"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                            <Button 
                                variant="outline" 
                                onClick={exportData}
                                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs h-8 px-3"
                            >
                                <Download className="w-3 h-3 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                                {t('ShippingPage.actions.export')}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={fetchCompanies}
                                disabled={refreshing}
                                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-xs h-8 px-3"
                            >
                                <RefreshCw className={`w-3 h-3 mr-1.5 rtl:mr-0 rtl:ml-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                                {t('ShippingPage.actions.refresh')}
                            </Button>
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button 
                                        onClick={() => setCurrentCompany({})}
                                        className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-lg text-xs h-8 px-3"
                                    >
                                        <PlusCircle className="w-3 h-3 mr-1.5 rtl:mr-0 rtl:ml-1.5" />
                                        {t('ShippingPage.actions.addCompany')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg max-w-md mx-2">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-gray-900 text-base">
                                            <Truck className="w-4 h-4" />
                                            {currentCompany.id ? t('ShippingPage.dialog.editTitle') : t('ShippingPage.dialog.createTitle')}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSave} className="space-y-3 mt-2">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name" className="text-gray-800 font-medium text-sm">
                                                {t('ShippingPage.form.name.label')}
                                            </Label>
                                            <Input
                                                id="name"
                                                value={currentCompany.name || ''}
                                                onChange={(e) => setCurrentCompany(p => ({ ...p, name: e.target.value }))}
                                                placeholder={t('ShippingPage.form.name.placeholder')}
                                                required
                                                className="border border-gray-200 focus:border-purple-500 rounded-lg h-9 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="shipping_cost" className="text-gray-800 font-medium text-sm">
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
                                                className="border border-gray-200 focus:border-purple-500 rounded-lg h-9 text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="delivery_time" className="text-gray-800 font-medium text-sm">
                                                {t('ShippingPage.form.deliveryTime.label')}
                                            </Label>
                                            <Input
                                                id="delivery_time"
                                                value={currentCompany.delivery_time || ''}
                                                onChange={(e) => setCurrentCompany(p => ({ ...p, delivery_time: e.target.value }))}
                                                placeholder={t('ShippingPage.form.deliveryTime.placeholder')}
                                                className="border border-gray-200 focus:border-purple-500 rounded-lg h-9 text-sm"
                                            />
                                        </div>
                                        <DialogFooter className="flex gap-2 pt-2">
                                            <Button 
                                                type="button" 
                                                variant="outline" 
                                                onClick={() => setIsDialogOpen(false)}
                                                className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg flex-1 text-xs h-8"
                                            >
                                                {t('common.cancel')}
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white rounded-lg flex-1 text-xs h-8"
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

            {/* Table - ✅ Keep overflow-x-auto for data tables (standard practice) */}
            {/* ✅ Grid Layout - No Horizontal Scroll */}
<Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-xl overflow-hidden">
  <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-3 sm:p-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <CardTitle className="text-base flex items-center gap-2">
          <Truck className="w-4 h-4" />
          {t('ShippingPage.table.title')}
        </CardTitle>
        <CardDescription className="text-purple-100 text-xs mt-0.5">
          {t('ShippingPage.table.subtitle', { count: filteredCompanies.length })}
        </CardDescription>
      </div>
      <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0.5">
        {filteredCompanies.length} {t('ShippingPage.table.companies')}
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="p-0">
    {isLoading ? (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mb-2"></div>
          <p className="text-gray-600 text-xs">{t('ShippingPage.loading')}</p>
        </div>
      </div>
    ) : filteredCompanies.length === 0 ? (
      <div className="p-6 text-center">
        <Truck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <h3 className="font-bold text-gray-900 text-sm mb-1">{t('ShippingPage.empty.title')}</h3>
        <p className="text-gray-600 text-xs max-w-xs mx-auto">
          {searchTerm
            ? t('ShippingPage.empty.noResults')
            : t('ShippingPage.empty.noCompanies')
          }
        </p>
      </div>
    ) : (
      /* ✅ Responsive Grid - No Scroll */
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredCompanies.map((company) => (
            <div 
              key={company.id} 
              className="border border-gray-200/50 rounded-lg p-3 hover:bg-gray-50/30 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Left Section: Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-rose-500 to-purple-600 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                      <Truck className="w-3 h-3" />
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm truncate">{company.name}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                    <div>
                      <span className="font-medium">{t('ShippingPage.table.headers.cost')}:</span>
                      <div className="text-gray-900 font-bold mt-0.5">
                        {company.shipping_cost.toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')} {t('ShippingPage.currency')}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">{t('ShippingPage.table.headers.deliveryTime')}:</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-900">{company.delivery_time}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">{t('ShippingPage.table.headers.dateAdded')}:</span>
                      <div className="text-gray-900 mt-0.5">{formatDate(company.created_at)}</div>
                    </div>
                    <div>
                      <span className="font-medium">{t('ShippingPage.table.headers.status')}:</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Switch
                          checked={company.is_active}
                          onCheckedChange={() => handleStatusToggle(company)}
                          className="data-[state=checked]:bg-green-500"
                        />
                        <Badge 
                          variant="outline" 
                          className={company.is_active 
                            ? "bg-green-100 text-green-800 border-green-200 text-[10px] px-1.5 py-0.5" 
                            : "bg-red-100 text-red-800 border-red-200 text-[10px] px-1.5 py-0.5"
                          }
                        >
                          {company.is_active ? 
                            <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> : 
                            <XCircle className="w-2.5 h-2.5 mr-0.5" />
                          }
                          {company.is_active ? t('ShippingPage.status.active') : t('ShippingPage.status.inactive')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentCompany(company);
                      setIsDialogOpen(true);
                    }}
                    className="text-gray-700 hover:bg-gray-50 border-gray-200 rounded text-[10px] h-7 px-2"
                  >
                    <Edit className="h-2.5 w-2.5 mr-1" />
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCompanyToDelete(company);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-red-600 hover:bg-red-50 border-red-200 rounded text-[10px] h-7 px-2"
                  >
                    <Trash2 className="h-2.5 w-2.5 mr-1" />
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </CardContent>
</Card>

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg mx-2 max-w-[320px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-gray-900 text-base">
                            <Trash2 className="w-4 h-4 text-red-500" />
                            {t('ShippingPage.delete.confirmTitle')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 text-sm">
                            {companyToDelete && t('ShippingPage.delete.confirmMessage', { name: companyToDelete.name })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex gap-2 pt-2">
                        <AlertDialogCancel 
                            onClick={() => setCompanyToDelete(null)}
                            className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-sm h-8 flex-1"
                        >
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-red-500 hover:bg-red-600 text-white rounded text-sm h-8 flex-1"
                        >
                            {t('common.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ✅ Reusable Stat Card
const StatCard = ({ value, label, color }: { value: string | number; label: string; color: 'rose' | 'green' | 'blue' | 'purple' }) => {
  const colorMap = {
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border ${colorMap[color]} shadow-sm rounded-lg text-center`}>
      <CardContent className="p-2.5">
        <div className="text-base font-bold">{value}</div>
        <div className="text-gray-600 text-[10px] mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
};

export default withSubscription(MerchantShippingPage);