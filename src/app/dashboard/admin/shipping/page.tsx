// app/dashboard/admin/shipping/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Truck, PlusCircle, Edit, Search, Filter, RefreshCw, Download, Sparkles, Package, CheckCircle, XCircle } from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ShippingCompany {
    id: number;
    name: string;
    api_key: string | null;
    is_active: boolean | number;
}

const CompanyForm = ({ company, onSuccess }: { company: ShippingCompany | null, onSuccess: () => void }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({ name: '', api_key: '', is_active: true });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (company) {
            setFormData({
                name: company.name,
                api_key: company.api_key || '',
                is_active: !!company.is_active
            });
        } else {
            setFormData({ name: '', api_key: '', is_active: true });
        }
    }, [company]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const promise = company 
                ? api.put(`/admin/shipping/${company.id}`, formData)
                : api.post('/admin/shipping', formData);
            
            toast.promise(promise, {
                loading: t('common.saving'),
                success: () => {
                    onSuccess();
                    return company 
                        ? t('AdminShipping.toast.updateSuccess.title') 
                        : t('AdminShipping.toast.addSuccess.title');
                },
                error: t('AdminShipping.toast.saveError.title'),
            });
        } catch (error) {
            console.error("Failed to save company", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
                <Label htmlFor="name" className="text-rose-800 font-semibold">
                    {t('AdminShipping.form.name')}
                </Label>
                <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    required
                    className="border-rose-200 focus:border-rose-400 rounded-xl"
                    placeholder={t('AdminShipping.form.name')}
                />
            </div>
            <div className="space-y-3">
                <Label htmlFor="api_key" className="text-rose-800 font-semibold">
                    {t('AdminShipping.form.apiKey')}
                </Label>
                <Input 
                    id="api_key" 
                    value={formData.api_key} 
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })} 
                    className="border-rose-200 focus:border-rose-400 rounded-xl"
                    placeholder={t('AdminShipping.form.apiKey')}
                />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-rose-200 p-4 bg-rose-50/50">
                <Label htmlFor="is_active" className="text-rose-800 font-semibold flex items-center gap-2">
                    {formData.is_active ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-gray-500" />}
                    {t('AdminShipping.form.active')}
                </Label>
                <Switch 
                    id="is_active" 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} 
                    className="data-[state=checked]:bg-rose-500"
                />
            </div>
            <DialogFooter className="flex gap-3 pt-4">
                <DialogClose asChild>
                    <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-2xl">
                        {t('common.cancel')}
                    </Button>
                </DialogClose>
                <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl px-6"
                >
                    {isSaving 
                        ? t('common.saving') 
                        : company 
                            ? t('common.update') 
                            : t('AdminShipping.actions.addCompany')}
                </Button>
            </DialogFooter>
        </form>
    );
};

export default function AdminShippingPage() {
    const { t } = useTranslation();
    const [companies, setCompanies] = useState<ShippingCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [companyToEdit, setCompanyToEdit] = useState<ShippingCompany | null>(null);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/shipping');
            setCompanies(response.data);
        } catch (error) {
            console.error("Failed to fetch shipping companies", error);
            toast.error(t('AdminShipping.toast.fetchError.title'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, []);
    
    const handleStatusToggle = async (company: ShippingCompany) => {
        try {
            const newStatus = !company.is_active;
            const promise = api.put(`/admin/shipping/${company.id}`, { ...company, is_active: newStatus });
            
            toast.promise(promise, {
                loading: t('common.saving'),
                success: () => {
                    fetchCompanies();
                    return newStatus 
                        ? t('AdminShipping.status.active') 
                        : t('AdminShipping.status.inactive');
                },
                error: t('AdminShipping.toast.statusUpdateFailed'),
            });
        } catch (error) {
            console.error("Failed to toggle company status", error);
        }
    };
    
    const openAddDialog = () => {
        setCompanyToEdit(null);
        setDialogOpen(true);
    };

    const openEditDialog = (company: ShippingCompany) => {
        setCompanyToEdit(company);
        setDialogOpen(true);
    };

    const filteredCompanies = useMemo(() => {
        let filtered = companies.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        if (statusFilter === 'active') {
            filtered = filtered.filter(c => c.is_active);
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(c => !c.is_active);
        }
        
        return filtered;
    }, [companies, searchTerm, statusFilter]);

    const stats = useMemo(() => ({
        total: companies.length,
        active: companies.filter(c => c.is_active).length,
        inactive: companies.filter(c => !c.is_active).length,
    }), [companies]);

    const exportCompanies = () => {
        toast.info(t('common.system'));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            
            <AdminNav />
            
            <header className="mb-8 text-center relative">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-white rounded-2xl shadow-lg">
                        <Truck className="h-8 w-8 text-rose-500" />
                    </div>
                    <Sparkles className="h-6 w-6 text-rose-300" />
                    <Package className="h-6 w-6 text-rose-300" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {t('AdminShipping.title')}
                </h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                    {t('AdminShipping.subtitle')}
                </p>
                <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
                        <div className="text-rose-700 text-sm">{t('AdminShipping.stats.totalCompanies')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
                        <div className="text-green-700 text-sm">{t('AdminShipping.stats.activeCompanies')}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-2xl text-center">
                    <CardContent className="p-4">
                        <div className="text-2xl font-bold text-gray-600 mb-1">{stats.inactive}</div>
                        <div className="text-gray-700 text-sm">{t('AdminShipping.status.inactive')}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl mb-8">
                <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-4 flex-1">
                            <div className="relative flex-1">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                                <Input
                                    placeholder={t('AdminShipping.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                                />
                            </div>
                            
                            <div className="flex gap-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl">
                                            <Filter className="w-4 h-4 ml-2" />
                                            {statusFilter === 'all' ? t('AdminShipping.filters.all') : 
                                             statusFilter === 'active' ? t('AdminShipping.status.active') : 
                                             t('AdminShipping.status.inactive')}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="border-rose-200 rounded-xl">
                                        <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-rose-700">
                                            {t('AdminShipping.filters.all')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('active')} className="text-green-600">
                                            {t('AdminShipping.status.active')}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setStatusFilter('inactive')} className="text-gray-600">
                                            {t('AdminShipping.status.inactive')}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <Button 
                                    variant="outline" 
                                    onClick={fetchCompanies}
                                    className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                                >
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                    {t('AdminShipping.actions.refresh')}
                                </Button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="outline" 
                                onClick={exportCompanies}
                                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                            >
                                <Download className="w-4 h-4 ml-2" />
                                {t('AdminShipping.actions.export')}
                            </Button>
                            <Button 
                                onClick={openAddDialog}
                                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
                            >
                                <PlusCircle className="w-4 h-4 ml-2" />
                                {t('AdminShipping.actions.addCompany')}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Truck className="w-6 h-6" />
                                {t('AdminShipping.shippingCompanies')}
                            </CardTitle>
                            <CardDescription className="text-pink-100">
                                {t('AdminShipping.foundCompanies', { count: filteredCompanies.length })}
                            </CardDescription>
                        </div>
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                            {filteredCompanies.length} {t('common.users')}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                                <TableHead className="text-rose-800 font-bold">{t('AdminShipping.table.companyName')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminShipping.form.apiKey')}</TableHead>
                                <TableHead className="text-rose-800 font-bold">{t('AdminShipping.table.status')}</TableHead>
                                <TableHead className="text-rose-800 font-bold text-left">{t('AdminShipping.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {loading ? (
                               <TableRow>
                                   <TableCell colSpan={4} className="text-center py-12">
                                       <div className="flex flex-col items-center justify-center">
                                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
                                           <p className="text-rose-700 font-medium">{t('AdminShipping.loading')}</p>
                                       </div>
                                   </TableCell>
                               </TableRow>
                           ) : filteredCompanies.length === 0 ? (
                               <TableRow>
                                   <TableCell colSpan={4} className="text-center py-12">
                                       <div className="flex flex-col items-center justify-center">
                                           <Truck className="w-16 h-16 text-rose-300 mb-4" />
                                           <h3 className="font-bold text-xl text-rose-800 mb-2">{t('AdminShipping.noCompanies')}</h3>
                                           <p className="text-rose-600">
                                               {searchTerm || statusFilter !== 'all'
                                                   ? t('AdminShipping.table.noResults')
                                                   : t('AdminShipping.table.empty')
                                               }
                                           </p>
                                       </div>
                                   </TableCell>
                               </TableRow>
                           ) : (
                               filteredCompanies.map(company => (
                                   <TableRow key={company.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                                       <TableCell>
                                           <div className="font-medium text-rose-900">{company.name}</div>
                                       </TableCell>
                                       <TableCell>
                                           <div className="text-rose-600 text-sm font-mono">
                                               {company.api_key ? '••••••••' : t('AdminShipping.table.notAvailable')}
                                           </div>
                                       </TableCell>
                                       <TableCell>
                                           <div className="flex items-center gap-3">
                                               <Switch 
                                                   checked={!!company.is_active} 
                                                   onCheckedChange={() => handleStatusToggle(company)}
                                                   className="data-[state=checked]:bg-rose-500"
                                               />
                                               <Badge 
                                                   variant="outline" 
                                                   className={company.is_active 
                                                       ? "bg-green-100 text-green-700 border-green-200 flex items-center gap-1" 
                                                       : "bg-gray-100 text-gray-600 border-gray-200 flex items-center gap-1"
                                                   }
                                               >
                                                   {company.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                   {company.is_active ? t('AdminShipping.status.active') : t('AdminShipping.status.inactive')}
                                               </Badge>
                                           </div>
                                       </TableCell>
                                       <TableCell className="text-left">
                                           <Button 
                                               variant="outline" 
                                               size="sm" 
                                               onClick={() => openEditDialog(company)}
                                               className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                                           >
                                               <Edit className="w-4 h-4 ml-2" />
                                               {t('common.edit')}
                                           </Button>
                                       </TableCell>
                                   </TableRow>
                               ))
                           )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-rose-800 text-2xl">
                            {companyToEdit ? <Edit className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
                            {companyToEdit 
                                ? t('AdminShipping.editCompany') 
                                : t('AdminShipping.addNewCompany')}
                        </DialogTitle>
                    </DialogHeader>
                    <CompanyForm 
                        company={companyToEdit} 
                        onSuccess={() => { 
                            setDialogOpen(false); 
                            fetchCompanies(); 
                        }} 
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}