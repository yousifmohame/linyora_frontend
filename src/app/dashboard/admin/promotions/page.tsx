'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { 
    PlusCircle, 
    Edit, 
    Trash2, 
    Crown, 
    Zap, 
    Star, 
    Diamond,
    TrendingUp,
    Calendar,
    CreditCard,
    Palette,
    ArrowUpDown,
    Eye,
    EyeOff
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminNav from '@/components/dashboards/AdminNav';

interface PromotionTier {
    id: number;
    name: string;
    duration_days: number;
    price: number | string;
    is_active: boolean;
    priority: number;
    badge_color: string;
    description?: string;
    features?: string[];
    created_at?: string;
    updated_at?: string;
}

const TIER_ICONS = {
    basic: Zap,
    standard: Star,
    premium: Crown,
    vip: Diamond
};

const DEFAULT_COLORS = [
    '#FFC107', // Amber
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#8B5CF6', // Violet
    '#F59E0B', // Orange
    '#EC4899', // Pink
    '#06B6D4', // Cyan
];

const safeNumber = (value: any, defaultValue: number = 0): number => {
    if (value === null || value === undefined || value === '') return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
};

const formatPrice = (price: any, currency: string): string => {
    const num = safeNumber(price, 0);
    return new Intl.NumberFormat('en', { style: 'currency', currency }).format(num);
};

export default function PromotionTiersPage() {
    const { t, i18n } = useTranslation();
    const currency = 'SAR'; // or extract from config

    const [tiers, setTiers] = useState<PromotionTier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [tierToEdit, setTierToEdit] = useState<PromotionTier | null>(null);
    const [tierToDelete, setTierToDelete] = useState<PromotionTier | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [sortBy, setSortBy] = useState<'priority' | 'name' | 'price'>('priority');

    const fetchTiers = useCallback(async () => {
        try {
            const response = await api.get('/admin/promotion-tiers');
            const sortedTiers = response.data.sort((a: PromotionTier, b: PromotionTier) => {
                if (sortBy === 'priority') return safeNumber(b.priority) - safeNumber(a.priority);
                if (sortBy === 'price') return safeNumber(b.price) - safeNumber(a.price);
                return (a.name || '').localeCompare(b.name || '', i18n.language);
            });
            setTiers(sortedTiers);
        } catch (error) {
            toast.error(t('PromotionTiersPage.toast.fetchError'));
        } finally {
            setLoading(false);
        }
    }, [sortBy, t, i18n.language]);

    useEffect(() => {
        fetchTiers();
    }, [fetchTiers]);

    const handleSuccess = () => {
        setIsDialogOpen(false);
        setTierToEdit(null);
        fetchTiers();
    };

    const handleDeleteClick = (tier: PromotionTier) => {
        setTierToDelete(tier);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!tierToDelete) return;
        
        try {
            await api.delete(`/admin/promotion-tiers/${tierToDelete.id}`);
            toast.success(t('PromotionTiersPage.toast.deleteSuccess'));
            fetchTiers();
        } catch (error) {
            toast.error(t('PromotionTiersPage.toast.deleteError'));
        } finally {
            setIsDeleteDialogOpen(false);
            setTierToDelete(null);
        }
    };

    const handleToggleStatus = async (tier: PromotionTier) => {
        try {
            await api.put(`/admin/promotion-tiers/${tier.id}`, {
                ...tier,
                is_active: !tier.is_active
            });
            toast.success(t('PromotionTiersPage.toast.statusUpdated', { status: !tier.is_active ? t('common.active') : t('common.inactive') }));
            fetchTiers();
        } catch (error) {
            toast.error(t('PromotionTiersPage.toast.statusError'));
        }
    };

    const getTierIcon = (tierName: string) => {
        const name = (tierName || '').toLowerCase();
        if (name.includes('basic')) return TIER_ICONS.basic;
        if (name.includes('standard')) return TIER_ICONS.standard;
        if (name.includes('premium')) return TIER_ICONS.premium;
        if (name.includes('vip')) return TIER_ICONS.vip;
        return Crown;
    };

    const totalTiers = tiers.length;
    const activeTiers = tiers.filter(t => t.is_active).length;
    const highestPrice = tiers.length > 0 ? Math.max(...tiers.map(t => safeNumber(t.price, 0))) : 0;
    const maxPriority = tiers.length > 0 ? Math.max(...tiers.map(t => safeNumber(t.priority, 0))) : 0;

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
          <AdminNav />
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {t('PromotionTiersPage.title')}
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {t('PromotionTiersPage.subtitle')}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Select value={sortBy} onValueChange={(value: 'priority' | 'name' | 'price') => setSortBy(value)}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder={t('PromotionTiersPage.sort.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="priority">{t('PromotionTiersPage.sort.priority')}</SelectItem>
                            <SelectItem value="name">{t('PromotionTiersPage.sort.name')}</SelectItem>
                            <SelectItem value="price">{t('PromotionTiersPage.sort.price')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex border rounded-lg p-1">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-9"
                        >
                            {t('PromotionTiersPage.view.grid')}
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('table')}
                            className="h-9"
                        >
                            {t('PromotionTiersPage.view.table')}
                        </Button>
                    </div>

                    <Button 
                        onClick={() => { setTierToEdit(null); setIsDialogOpen(true); }}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> 
                        {t('PromotionTiersPage.actions.createTier')}
                    </Button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('PromotionTiersPage.stats.totalTiers')}</p>
                                <p className="text-2xl font-bold">{totalTiers}</p>
                            </div>
                            <Crown className="h-8 w-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('PromotionTiersPage.stats.activeTiers')}</p>
                                <p className="text-2xl font-bold">{activeTiers}</p>
                            </div>
                            <Eye className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('PromotionTiersPage.stats.highestPrice')}</p>
                                <p className="text-2xl font-bold">
                                    {formatPrice(highestPrice, currency)}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-orange-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{t('PromotionTiersPage.stats.maxPriority')}</p>
                                <p className="text-2xl font-bold">
                                    {maxPriority}
                                </p>
                            </div>
                            <ArrowUpDown className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tiers.map(tier => {
                        const TierIcon = getTierIcon(tier.name);
                        const safePrice = formatPrice(tier.price, currency);
                        const safePriority = safeNumber(tier.priority);
                        const safeDuration = safeNumber(tier.duration_days, 7);

                        return (
                            <Card key={tier.id} className={`flex flex-col transition-all duration-300 hover:shadow-lg ${
                                !tier.is_active ? 'opacity-60 grayscale' : ''
                            }`}>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <TierIcon style={{ color: tier.badge_color }} className="h-5 w-5" />
                                            <span style={{ color: tier.badge_color }}>{tier.name || t('PromotionTiersPage.common.unnamed')}</span>
                                        </CardTitle>
                                        <Badge 
                                            variant={tier.is_active ? "default" : "secondary"}
                                            style={{ backgroundColor: tier.is_active ? tier.badge_color : undefined }}
                                        >
                                            {tier.is_active ? t('common.active') : t('common.inactive')}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        {t('PromotionTiersPage.tier.priority')}: <strong>{safePriority}</strong>
                                        {tier.description && (
                                            <p className="mt-2 text-sm">{tier.description}</p>
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {t('PromotionTiersPage.tier.duration')}:
                                        </span>
                                        <strong>{safeDuration} {t('PromotionTiersPage.tier.days', { count: safeDuration })}</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            {t('PromotionTiersPage.tier.price')}:
                                        </span>
                                        <strong className="text-lg">
                                            {safePrice}
                                        </strong>
                                    </div>
                                    
                                    {tier.features && tier.features.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">{t('PromotionTiersPage.tier.features')}</p>
                                            <ul className="text-xs space-y-1">
                                                {tier.features.map((feature, index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        <div 
                                                            className="w-1 h-1 rounded-full" 
                                                            style={{ backgroundColor: tier.badge_color }}
                                                        />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </CardContent>
                                <div className="p-4 border-t space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor={`toggle-${tier.id}`} className="text-sm">
                                            {tier.is_active ? t('common.active') : t('common.inactive')}
                                        </Label>
                                        <Switch
                                            id={`toggle-${tier.id}`}
                                            checked={tier.is_active}
                                            onCheckedChange={() => handleToggleStatus(tier)}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => { setTierToEdit(tier); setIsDialogOpen(true); }}
                                            className="flex-1"
                                        >
                                            <Edit className="mr-2 h-3 w-3" /> {t('common.edit')}
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => handleDeleteClick(tier)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('PromotionTiersPage.table.name')}</TableHead>
                                <TableHead>{t('PromotionTiersPage.table.status')}</TableHead>
                                <TableHead>{t('PromotionTiersPage.table.duration')}</TableHead>
                                <TableHead>{t('PromotionTiersPage.table.price')}</TableHead>
                                <TableHead>{t('PromotionTiersPage.table.priority')}</TableHead>
                                <TableHead>{t('PromotionTiersPage.table.color')}</TableHead>
                                <TableHead>{t('PromotionTiersPage.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tiers.map(tier => {
                                const TierIcon = getTierIcon(tier.name);
                                const safePrice = formatPrice(tier.price, currency);
                                const safeDuration = safeNumber(tier.duration_days, 7);
                                const safePriority = safeNumber(tier.priority);

                                return (
                                    <TableRow key={tier.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <TierIcon style={{ color: tier.badge_color }} className="h-4 w-4" />
                                                <span className="font-medium">{tier.name || t('PromotionTiersPage.common.unnamed')}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={tier.is_active ? "default" : "secondary"}
                                                style={{ backgroundColor: tier.is_active ? tier.badge_color : undefined }}
                                            >
                                                {tier.is_active ? t('common.active') : t('common.inactive')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{safeDuration} {t('PromotionTiersPage.tier.days', { count: safeDuration })}</TableCell>
                                        <TableCell>
                                            <strong>{safePrice}</strong>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{safePriority}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div 
                                                className="w-6 h-6 rounded border" 
                                                style={{ backgroundColor: tier.badge_color }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={tier.is_active}
                                                    onCheckedChange={() => handleToggleStatus(tier)}
                                                />
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => { setTierToEdit(tier); setIsDialogOpen(true); }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(tier)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}

            <TierFormDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={handleSuccess}
                tier={tierToEdit}
                currency={currency}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('PromotionTiersPage.confirmDelete.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('PromotionTiersPage.confirmDelete.description', { name: tierToDelete?.name || t('PromotionTiersPage.common.unnamed') })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteConfirm}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {t('PromotionTiersPage.confirmDelete.confirm')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Form Component
interface TierFormDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    tier: PromotionTier | null;
    currency: string;
}

function TierFormDialog({ isOpen, onOpenChange, onSuccess, tier, currency }: TierFormDialogProps) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<Partial<PromotionTier>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [featureInput, setFeatureInput] = useState('');

    useEffect(() => {
        if (tier) {
            setFormData({
                ...tier,
                features: tier.features || [],
                price: safeNumber(tier.price, 0),
                duration_days: safeNumber(tier.duration_days, 7),
                priority: safeNumber(tier.priority, 1)
            });
        } else {
            setFormData({ 
                name: '', 
                duration_days: 7, 
                price: 0, 
                priority: 1, 
                is_active: true, 
                badge_color: DEFAULT_COLORS[0],
                description: '',
                features: []
            });
        }
        setFeatureInput('');
    }, [tier, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: value 
        });
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: value === '' ? '' : safeNumber(value, 0)
        });
    };

    const handleAddFeature = () => {
        if (featureInput.trim() && formData.features) {
            setFormData({
                ...formData,
                features: [...formData.features, featureInput.trim()]
            });
            setFeatureInput('');
        }
    };

    const handleRemoveFeature = (index: number) => {
        if (formData.features) {
            setFormData({
                ...formData,
                features: formData.features.filter((_, i) => i !== index)
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const submitData = {
                ...formData,
                price: safeNumber(formData.price, 0),
                duration_days: safeNumber(formData.duration_days, 7),
                priority: safeNumber(formData.priority, 1)
            };

            if (tier) {
                await api.put(`/admin/promotion-tiers/${tier.id}`, submitData);
                toast.success(t('PromotionTiersPage.toast.updateSuccess'));
            } else {
                await api.post('/admin/promotion-tiers', submitData);
                toast.success(t('PromotionTiersPage.toast.createSuccess'));
            }
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('PromotionTiersPage.toast.saveError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {tier ? <Edit className="h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                        {tier ? t('PromotionTiersPage.form.editTitle') : t('PromotionTiersPage.form.createTitle')}
                    </DialogTitle>
                    <DialogDescription>
                        {tier ? t('PromotionTiersPage.form.editSubtitle') : t('PromotionTiersPage.form.createSubtitle')}
                    </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('PromotionTiersPage.form.nameLabel')} *</Label>
                            <Input 
                                id="name" 
                                name="name" 
                                value={formData.name || ''} 
                                onChange={handleChange} 
                                placeholder={t('PromotionTiersPage.form.namePlaceholder')}
                                required 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="duration_days">{t('PromotionTiersPage.form.durationLabel')} *</Label>
                            <Input 
                                id="duration_days" 
                                name="duration_days" 
                                type="number" 
                                min="1"
                                value={formData.duration_days || ''} 
                                onChange={handleNumberChange} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">{t('PromotionTiersPage.form.priceLabel', { currency })} *</Label>
                            <Input 
                                id="price" 
                                name="price" 
                                type="number" 
                                step="0.01" 
                                min="0"
                                value={formData.price || ''} 
                                onChange={handleNumberChange} 
                                required 
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="priority">{t('PromotionTiersPage.form.priorityLabel')} *</Label>
                            <Input 
                                id="priority" 
                                name="priority" 
                                type="number" 
                                min="0"
                                value={formData.priority || 0} 
                                onChange={handleNumberChange} 
                                required 
                            />
                            <p className="text-xs text-muted-foreground">
                                {t('PromotionTiersPage.form.priorityHint')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">{t('PromotionTiersPage.form.descriptionLabel')}</Label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="w-full min-h-[80px] p-3 border rounded-lg resize-none"
                            placeholder={t('PromotionTiersPage.form.descriptionPlaceholder')}
                        />
                    </div>

                    <div className="space-y-3">
                        <Label>{t('PromotionTiersPage.form.featuresLabel')}</Label>
                        <div className="flex gap-2">
                            <Input
                                value={featureInput}
                                onChange={(e) => setFeatureInput(e.target.value)}
                                placeholder={t('PromotionTiersPage.form.featurePlaceholder')}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddFeature();
                                    }
                                }}
                            />
                            <Button type="button" onClick={handleAddFeature} variant="outline">
                                {t('common.add')}
                            </Button>
                        </div>
                        
                        {formData.features && formData.features.length > 0 && (
                            <div className="space-y-2">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                                        <span className="text-sm">{feature}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFeature(index)}
                                            className="h-6 w-6 p-0 text-red-500"
                                        >
                                            ×
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <Label htmlFor="badge_color">{t('PromotionTiersPage.form.badgeColorLabel')}</Label>
                            <div className="flex items-center gap-3">
                                <Input 
                                    id="badge_color" 
                                    name="badge_color" 
                                    type="color" 
                                    value={formData.badge_color || DEFAULT_COLORS[0]} 
                                    onChange={handleChange} 
                                    className="w-16 h-10 p-1"
                                />
                                <div className="flex gap-1">
                                    {DEFAULT_COLORS.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="w-6 h-6 rounded border"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setFormData({...formData, badge_color: color})}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 pt-6">
                            <Switch 
                                id="is_active" 
                                checked={formData.is_active} 
                                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} 
                            />
                            <Label htmlFor="is_active" className="cursor-pointer">
                                {t('PromotionTiersPage.form.activeLabel')}
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="min-w-24">
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    {t('PromotionTiersPage.actions.saving')}
                                </div>
                            ) : (
                                tier ? t('PromotionTiersPage.actions.updateTier') : t('PromotionTiersPage.actions.createTier')
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}