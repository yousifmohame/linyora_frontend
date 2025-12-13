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
      // ✅ Unified gradient + overflow-hidden
      <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
        {/* ✅ Smaller, safe blobs */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

        <ModelNav />

        <header className="mb-6 text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {t('OffersPage.title')}
          </h1>
          <p className="text-gray-600 text-sm max-w-md mx-auto">
            {t('OffersPage.subtitle')}
          </p>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <Badge variant="secondary" className="bg-rose-100 text-rose-700 px-3 py-1.5 text-xs rounded-lg">
            {t('OffersPage.stats.count', { count: packages.length })}
          </Badge>
          <Button 
            onClick={openCreateDialog} 
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow h-9 px-4 rounded-lg text-sm"
          >
            <PlusCircle className="mr-1.5 w-3.5 h-3.5" />
            {t('OffersPage.actions.create')}
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
            <p className="text-gray-600 text-sm">{t('OffersPage.loading')}</p>
          </div>
        ) : packages.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl text-center py-8 max-w-md mx-auto">
            <CardContent>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{t('OffersPage.empty.title')}</h3>
              <p className="text-gray-600 mb-4 px-2">{t('OffersPage.empty.description')}</p>
              <Button 
                onClick={openCreateDialog} 
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-sm"
              >
                {t('OffersPage.empty.cta')}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* ✅ Responsive Grid - No Horizontal Scroll */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-7xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-200" />
                        <span className="truncate">{pkg.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-1 flex flex-wrap gap-1.5 text-purple-100 text-xs">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0.5">
                          {pkg.status === 'active' 
                            ? t('OffersPage.status.active') 
                            : t('OffersPage.status.paused')}
                        </Badge>
                        {pkg.category && (
                          <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-1.5 py-0.5">
                            {pkg.category}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(pkg)} 
                        className="bg-white/20 hover:bg-white/30 text-white h-7 w-7"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setPackageToDelete(pkg)} 
                        className="bg-white/20 hover:bg-white/30 text-white h-7 w-7"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {pkg.description && (
                    <p className="text-gray-600 mb-4 text-xs leading-relaxed">{pkg.description}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {pkg.tiers.map((tier) => (
                      <div key={tier.id || tier.tier_name} className="p-3 border border-gray-200/50 rounded-lg bg-gray-50/30 flex flex-col">
                        <div className="flex-grow">
                          <h3 className="font-bold text-gray-900 text-sm mb-2">{tier.tier_name}</h3>
                          <p className="text-lg font-bold mb-2 text-rose-600">
                            {new Intl.NumberFormat(locale, {
                              style: 'currency',
                              currency: 'SAR',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2
                            }).format(tier.price)}
                          </p>
                          <ul className="space-y-1 text-[10px] text-gray-700 mb-3">
                            {tier.features.map((feature, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <Check className="w-2.5 h-2.5 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="text-[10px] text-gray-500 border-t border-gray-200/50 pt-2 mt-auto grid grid-cols-2 gap-1.5">
                          <div className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{t('OffersPage.tier.delivery', { days: tier.delivery_days })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <RefreshCw className="w-2.5 h-2.5" />
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
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200/50">
                    <Button 
                      variant="outline" 
                      onClick={() => togglePackageStatus(pkg)} 
                      className={`text-xs h-7 rounded-lg ${
                        pkg.status === 'active' 
                          ? 'border-rose-200 text-rose-700 hover:bg-rose-50' 
                          : 'border-green-200 text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {pkg.status === 'active' 
                        ? t('OffersPage.actions.deactivate') 
                        : t('OffersPage.actions.activate')}
                    </Button>
                    <Badge 
                      variant={pkg.status === 'active' ? 'default' : 'secondary'} 
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        pkg.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}
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

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-6xl w-[95vw] mx-2 max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl">
            <DialogHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 -m-4 mb-4 rounded-t-xl">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Package className="h-4 w-4" />
                {packageToEdit 
                  ? t('OffersPage.dialog.edit.title') 
                  : t('OffersPage.dialog.create.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[70vh] p-1">
              <OfferForm packageToEdit={packageToEdit} onSuccess={handleSuccess} />
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl max-w-[320px] mx-2">
            <AlertDialogHeader className="text-center">
              <AlertDialogTitle className="text-lg font-bold text-gray-900">
                {t('OffersPage.dialog.delete.title')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600 text-sm">
                {t('OffersPage.dialog.delete.description', { title: packageToDelete?.title })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 pt-2">
              <AlertDialogCancel className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-sm h-8">
                {t('common.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded text-sm h-8"
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