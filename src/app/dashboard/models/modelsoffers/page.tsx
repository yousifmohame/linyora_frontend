'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PlusCircle, Edit, Trash2, Package, Sparkles, Check, Clock, RefreshCw, Heart, Target } from 'lucide-react';
import OfferForm from '@/components/dashboards/offers/OfferForm';
import ModelNav from '@/components/dashboards/ModelNav';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { withSubscription } from '@/components/auth/withSubscription';

export interface PackageTier {
    id?: number;
    tier_name: string;
    price: number;
    delivery_days: number;
    revisions: number;
    features: string[];
}

export interface ServicePackage {
    id: number;
    title: string;
    description?: string;
    category?: string;
    status: 'active' | 'paused';
    tiers: PackageTier[];
}

const normalizePackageData = (data: unknown): ServicePackage => {
    const extractFeatures = (featuresValue: unknown): string[] => {
        if (Array.isArray(featuresValue)) return featuresValue.map(String);
        if (typeof featuresValue === 'string') return featuresValue.split(',').map(f => f.trim()).filter(Boolean);
        return [];
    };

    const safeData = typeof data === 'object' && data !== null ? data : {};
    const dataRecord = safeData as Record<string, unknown>;

    const tiersData = dataRecord.tiers;
    const tiers: PackageTier[] = Array.isArray(tiersData)
        ? tiersData.map(tier => {
            const safeTier = typeof tier === 'object' && tier !== null ? tier : {};
            const tierRecord = safeTier as Record<string, unknown>;

            return {
                id: typeof tierRecord.id === 'number' ? tierRecord.id : undefined,
                tier_name: typeof tierRecord.tier_name === 'string' ? tierRecord.tier_name : 'Basic',
                price: Number(tierRecord.price) || 0,
                delivery_days: Number(tierRecord.delivery_days) || 1,
                revisions: Number(tierRecord.revisions) ?? -1,
                features: extractFeatures(tierRecord.features),
            };
        })
        : [];

    const statusRaw = dataRecord.status;

    return {
        id: Number(dataRecord.id) || 0,
        title: String(dataRecord.title || 'Untitled Package'),
        description: String(dataRecord.description || undefined),
        category: String(dataRecord.category || undefined),
        status: ['active', 'paused'].includes(statusRaw as string) ? (statusRaw as 'active' | 'paused') : 'active',
        tiers,
    };
};

function OffersPage() {
    const { t, i18n } = useTranslation();
    const [packages, setPackages] = useState<ServicePackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [packageToEdit, setPackageToEdit] = useState<ServicePackage | null>(null);
    const [packageToDelete, setPackageToDelete] = useState<ServicePackage | null>(null);

    const fetchPackages = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/offers');
            const normalizedData = Array.isArray(response.data) ? response.data.map(normalizePackageData) : [];
            setPackages(normalizedData);
        } catch (error) {
            console.error('Failed to fetch packages', error);
            toast.error(t('OffersPage.toast.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleSuccess = () => {
        fetchPackages();
        setIsDialogOpen(false);
        setPackageToEdit(null);
        toast.success(t('OffersPage.toast.saveSuccess'));
    };

    const handleDelete = async () => {
        if (!packageToDelete) return;
        const promise = api.delete(`/offers/${packageToDelete.id}`);
        toast.promise(promise, {
            loading: t('OffersPage.toast.deleting'),
            success: () => {
                fetchPackages();
                setPackageToDelete(null);
                return t('OffersPage.toast.deleteSuccess');
            },
            error: t('OffersPage.toast.deleteError'),
        });
    };

    const openEditDialog = (pkg: ServicePackage) => {
        setPackageToEdit(pkg);
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setPackageToEdit(null);
        setIsDialogOpen(true);
    };
    
    const togglePackageStatus = async (pkg: ServicePackage) => {
        const newStatus = pkg.status === 'active' ? 'paused' : 'active';
        const payload = {
            title: pkg.title,
            description: pkg.description,
            category: pkg.category,
            status: newStatus,
            tiers: pkg.tiers,
        };
        const promise = api.put(`/offers/${pkg.id}`, payload);

        toast.promise(promise, {
            loading: t('OffersPage.toast.updatingStatus'),
            success: () => {
                fetchPackages();
                return t('OffersPage.toast.updateStatusSuccess', { action: newStatus === 'active' ? t('common.activated') : t('common.paused') });
            },
            error: t('OffersPage.toast.updateStatusError'),
        });
    };

    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
            <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

            <ModelNav />

            <header className="mb-8 text-center relative">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
                    {t('OffersPage.title')}
                </h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                    {t('OffersPage.subtitle')}
                </p>
            </header>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <Badge variant="secondary" className="bg-rose-100 text-rose-700 px-4 py-2 text-sm">
                    {t('OffersPage.stats.count', { count: packages.length })}
                </Badge>
                <Button onClick={openCreateDialog} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg h-12 px-6 rounded-2xl font-bold">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    {t('OffersPage.actions.create')}
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mb-4"></div>
                    <p className="text-rose-700 text-lg font-medium">{t('OffersPage.loading')}</p>
                </div>
            ) : packages.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl text-center py-16 max-w-2xl mx-auto">
                    <CardContent>
                        <h3 className="font-bold text-2xl text-rose-800 mb-2">{t('OffersPage.empty.title')}</h3>
                        <p className="text-rose-600 mb-6 max-w-md mx-auto">{t('OffersPage.empty.description')}</p>
                        <Button onClick={openCreateDialog} className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-bold">
                            {t('OffersPage.empty.cta')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                                            <Heart className="h-6 w-6 text-pink-200" />
                                            {pkg.title}
                                        </CardTitle>
                                        <CardDescription className="mt-2 flex items-center gap-2 text-pink-100">
                                            <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                                {pkg.status === 'active' 
                                                    ? t('OffersPage.status.active') 
                                                    : t('OffersPage.status.paused')}
                                            </Badge>
                                            {pkg.category && (
                                                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                                    {pkg.category}
                                                </Badge>
                                            )}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(pkg)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => setPackageToDelete(pkg)} className="bg-white/20 hover:bg-white/30 text-white border-0">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {pkg.description && (
                                    <p className="text-rose-700 mb-6 text-sm leading-relaxed">{pkg.description}</p>
                                )}
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {pkg.tiers.map((tier, index) => (
                                        <div key={tier.id || tier.tier_name} className="p-4 border border-rose-200 rounded-2xl bg-gradient-to-b from-white to-rose-50/50 flex flex-col">
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-lg text-rose-800">{tier.tier_name}</h3>
                                                <p className="text-3xl font-extrabold my-3 text-rose-900">
                                                    {new Intl.NumberFormat(locale, {
                                                        style: 'currency',
                                                        currency: 'SAR',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 2
                                                    }).format(tier.price)}
                                                </p>
                                                <ul className="space-y-2 text-sm text-rose-700 mb-4">
                                                    {tier.features.map((feature, i) => (
                                                        <li key={i} className="flex items-start gap-2">
                                                            <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                                            <span className="leading-relaxed">{feature}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="text-xs text-rose-500 border-t border-rose-100 pt-3 mt-auto grid grid-cols-2 gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" />
                                                    <span>{t('OffersPage.tier.delivery', { days: tier.delivery_days })}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <RefreshCw className="w-3 h-3" />
                                                    <span>
                                                        {tier.revisions === -1 
                                                            ? t('OffersPage.tier.unlimitedRevisions') 
                                                            : t('OffersPage.tier.revisions', { count: tier.revisions })
                                                        }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-rose-100">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => togglePackageStatus(pkg)} 
                                        className={`border-2 ${pkg.status === 'active' ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 'border-green-200 text-green-700 hover:bg-green-50'} rounded-2xl`}
                                    >
                                        {pkg.status === 'active' 
                                            ? t('OffersPage.actions.deactivate') 
                                            : t('OffersPage.actions.activate')}
                                    </Button>
                                    <Badge 
                                        variant={pkg.status === 'active' ? 'default' : 'secondary'} 
                                        className={`px-3 py-1 rounded-full ${pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
                                    >
                                        {pkg.status === 'active' 
                                            ? t('OffersPage.status.activeBadge') 
                                            : t('OffersPage.status.pausedBadge')}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[90vw] h-[90vh] max-h-none sm:max-w-none bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-lg overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                            <Package className="h-6 w-6" />
                            {packageToEdit 
                                ? t('OffersPage.dialog.edit.title') 
                                : t('OffersPage.dialog.create.title')}
                        </DialogTitle>
                    </DialogHeader>
                    <OfferForm packageToEdit={packageToEdit} onSuccess={handleSuccess} />
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
                <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-lg">
                    <AlertDialogHeader className="text-center">
                        <AlertDialogTitle className="text-2xl font-bold text-rose-800">
                            {t('OffersPage.dialog.delete.title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-rose-600 text-lg">
                            {t('OffersPage.dialog.delete.description', { title: packageToDelete?.title })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
                        <AlertDialogCancel className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 rounded-2xl px-6 py-2">
                            {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDelete} 
                            className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl px-6 py-2 font-bold"
                        >
                            {t('OffersPage.dialog.delete.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default withSubscription(OffersPage);