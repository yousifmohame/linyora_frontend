'use client';

import React, { useState, useEffect, useCallback, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '@/lib/axios';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

import { 
  PlusCircle, 
  Edit, 
  Sparkles, 
  Crown,
  Users,
  ShoppingBag,
  TrendingUp,
  Search,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  DollarSign,
  Zap,
  Star,
  Shield,
  Rocket
} from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';

// Define the shape of a subscription plan
interface Plan {
  id: number;
  role: 'merchant' | 'model' | 'influencer';
  name: string;
  description: string;
  price: number;
  features: string[];
  includes_dropshipping: boolean;
  is_active: boolean;
}

const ManageSubscriptionPlansPage = () => {
  const { t, i18n } = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: 'merchant' as 'merchant' | 'model' | 'influencer',
    description: '',
    price: '',
    features: '',
    includes_dropshipping: false,
    is_active: true,
  });

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/admin/subscription-plans');
      const formattedPlans = response.data.map((plan: any) => {
        let price = plan.price;
        if (typeof price === 'string') {
          price = parseFloat(price);
          if (isNaN(price)) price = 0;
        } else if (typeof price !== 'number') {
          price = 0;
        }

        let features: string[] = [];
        if (typeof plan.features === 'string') {
          try {
            features = JSON.parse(plan.features);
          } catch {
            features = plan.features.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        } else if (Array.isArray(plan.features)) {
          features = plan.features;
        }

        return {
          ...plan,
          price,
          features,
          includes_dropshipping: Boolean(plan.includes_dropshipping),
          is_active: Boolean(plan.is_active),
        };
      });
      setPlans(formattedPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error(t('AdminSubscriptionPlans.toast.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleOpenDialog = (plan: Plan | null = null) => {
    setEditingPlan(plan);
    if (plan) {
      setFormData({
        name: plan.name,
        role: plan.role,
        description: plan.description || '',
        price: plan.price.toString(),
        features: plan.features.join(', '),
        includes_dropshipping: plan.includes_dropshipping,
        is_active: plan.is_active,
      });
    } else {
      setFormData({
        name: '',
        role: 'merchant',
        description: '',
        price: '',
        features: '',
        includes_dropshipping: false,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      role: value as 'merchant' | 'model' | 'influencer',
    }));
  };

  const handleCheckboxChange = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || formData.name.length < 3) {
      toast.error(t('AdminSubscriptionPlans.toast.nameTooShort'));
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error(t('AdminSubscriptionPlans.toast.invalidPrice'));
      return;
    }

    const features = formData.features
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name.trim(),
      role: formData.role,
      description: formData.description.trim(),
      price: priceNum,
      features,
      includes_dropshipping: formData.includes_dropshipping,
      is_active: formData.is_active,
    };

    const apiPromise = editingPlan
      ? axios.put(`/admin/subscription-plans/${editingPlan.id}`, payload)
      : axios.post('/admin/subscription-plans', payload);

    toast.promise(apiPromise, {
      loading: editingPlan 
        ? t('AdminSubscriptionPlans.toast.updating') 
        : t('AdminSubscriptionPlans.toast.creating'),
      success: () => {
        fetchPlans();
        setIsDialogOpen(false);
        return editingPlan 
          ? t('AdminSubscriptionPlans.toast.updateSuccess') 
          : t('AdminSubscriptionPlans.toast.createSuccess');
      },
      error: t('AdminSubscriptionPlans.toast.saveError'),
    });
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { icon: JSX.Element; label: string; className: string }> = {
      merchant: { 
        icon: <ShoppingBag className="w-3 h-3" />, 
        label: t('AdminSubscriptionPlans.roles.merchant'), 
        className: "bg-blue-100 text-blue-700 border-blue-200" 
      },
      model: { 
        icon: <Users className="w-3 h-3" />, 
        label: t('AdminSubscriptionPlans.roles.model'), 
        className: "bg-pink-100 text-pink-700 border-pink-200" 
      },
      influencer: { 
        icon: <TrendingUp className="w-3 h-3" />, 
        label: t('AdminSubscriptionPlans.roles.influencer'), 
        className: "bg-purple-100 text-purple-700 border-purple-200" 
      },
    };
    
    const config = roleMap[role] || { 
      icon: <Users className="w-3 h-3" />, 
      label: role, 
      className: "bg-gray-100 text-gray-700 border-gray-200" 
    };
    
    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        {config.icon}{config.label}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" /> {t('AdminSubscriptionPlans.status.active')}
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 flex items-center gap-1">
        <XCircle className="w-3 h-3" /> {t('AdminSubscriptionPlans.status.inactive')}
      </Badge>
    );
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: plans.length,
    active: plans.filter(p => p.is_active).length,
    merchants: plans.filter(p => p.role === 'merchant').length,
    models: plans.filter(p => p.role === 'model').length,
    influencers: plans.filter(p => p.role === 'influencer').length,
    totalRevenue: plans.reduce((sum, p) => sum + p.price, 0),
  };

  const exportPlans = () => {
    toast.info(t('AdminSubscriptionPlans.toast.exportPreparing'));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'merchant': return <ShoppingBag className="w-5 h-5" />;
      case 'model': return <Users className="w-5 h-5" />;
      case 'influencer': return <TrendingUp className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  };

  // Format price with locale
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-6 sm:p-8">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <AdminNav />
      
      {/* Header Section */}
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Rocket className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Crown className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('AdminSubscriptionPlans.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('AdminSubscriptionPlans.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
            <div className="text-rose-700 text-sm">{t('AdminSubscriptionPlans.stats.totalPlans')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
            <div className="text-green-700 text-sm">{t('AdminSubscriptionPlans.stats.activePlans')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600 mb-1">{stats.merchants}</div>
            <div className="text-blue-700 text-sm">{t('AdminSubscriptionPlans.stats.merchantPlans')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-pink-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-pink-600 mb-1">{stats.models}</div>
            <div className="text-pink-700 text-sm">{t('AdminSubscriptionPlans.stats.modelPlans')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600 mb-1">{stats.influencers}</div>
            <div className="text-purple-700 text-sm">{t('AdminSubscriptionPlans.stats.influencerPlans')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-emerald-200 shadow-lg rounded-2xl text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-emerald-600 mb-1">
              {formatPrice(stats.totalRevenue)}
            </div>
            <div className="text-emerald-700 text-sm">{t('AdminSubscriptionPlans.stats.totalValue')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                <Input
                  placeholder={t('AdminSubscriptionPlans.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={exportPlans}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <Download className="w-4 h-4 ml-2" />
                {t('AdminSubscriptionPlans.actions.export')}
              </Button>
              <Button 
                variant="outline" 
                onClick={fetchPlans}
                className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                {t('AdminSubscriptionPlans.actions.refresh')}
              </Button>
              <Button 
                onClick={() => handleOpenDialog()}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
              >
                <PlusCircle className="w-4 h-4 ml-2" />
                {t('AdminSubscriptionPlans.actions.newPlan')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Rocket className="w-6 h-6" />
                {t('AdminSubscriptionPlans.plans.title')}
              </CardTitle>
              <CardDescription className="text-pink-100">
                {t('AdminSubscriptionPlans.plans.description', { count: filteredPlans.length })}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              {t('AdminSubscriptionPlans.common.plans', { count: filteredPlans.length })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptionPlans.table.planName')}</TableHead>
                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptionPlans.table.role')}</TableHead>
                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptionPlans.table.price')}</TableHead>
                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptionPlans.table.features')}</TableHead>
                <TableHead className="text-rose-800 font-bold">{t('AdminSubscriptionPlans.table.status')}</TableHead>
                <TableHead className="text-rose-800 font-bold text-left">{t('AdminSubscriptionPlans.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3"></div>
                      <p className="text-rose-700 font-medium">{t('AdminSubscriptionPlans.plans.loading')}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPlans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Rocket className="w-16 h-16 text-rose-300 mb-4" />
                      <h3 className="font-bold text-xl text-rose-800 mb-2">{t('AdminSubscriptionPlans.plans.noPlans')}</h3>
                      <p className="text-rose-600">
                        {searchTerm
                          ? t('AdminSubscriptionPlans.plans.noResults')
                          : t('AdminSubscriptionPlans.plans.empty')
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlans.map((plan) => (
                  <TableRow key={plan.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {getRoleIcon(plan.role)}
                        </div>
                        <div>
                          <div className="font-medium text-rose-900">{plan.name}</div>
                          {plan.description && (
                            <div className="text-rose-600 text-sm mt-1">{plan.description}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(plan.role)}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-rose-600 text-lg">
                        {formatPrice(plan.price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {plan.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {plan.features.length > 3 && (
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                              {t('AdminSubscriptionPlans.table.moreFeatures', { count: plan.features.length - 3 })}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(plan.is_active)}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenDialog(plan)}
                          className="text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl"
                        >
                          <Edit className="w-4 h-4 ml-2" />
                          {t('common.edit')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-800 text-2xl">
              {editingPlan ? <Edit className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
              {editingPlan 
                ? t('AdminSubscriptionPlans.dialog.editTitle') 
                : t('AdminSubscriptionPlans.dialog.createTitle')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-rose-800 font-medium text-sm">{t('AdminSubscriptionPlans.form.planName')}</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('AdminSubscriptionPlans.form.planNamePlaceholder')}
                required
                className="border-rose-200 focus:border-rose-400 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-rose-800 font-medium text-sm">{t('AdminSubscriptionPlans.form.role')}</label>
              <Select value={formData.role} onValueChange={handleRoleChange}>
                <SelectTrigger className="border-rose-200 focus:border-rose-400 rounded-xl">
                  <SelectValue placeholder={t('AdminSubscriptionPlans.form.rolePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="merchant" className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> {t('AdminSubscriptionPlans.roles.merchant')}
                  </SelectItem>
                  <SelectItem value="model" className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> {t('AdminSubscriptionPlans.roles.model')}
                  </SelectItem>
                  <SelectItem value="influencer" className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> {t('AdminSubscriptionPlans.roles.influencer')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-rose-800 font-medium text-sm">{t('AdminSubscriptionPlans.form.price')}</label>
              <Input
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder={t('AdminSubscriptionPlans.form.pricePlaceholder')}
                required
                className="border-rose-200 focus:border-rose-400 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-rose-800 font-medium text-sm">{t('AdminSubscriptionPlans.form.description')}</label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('AdminSubscriptionPlans.form.descriptionPlaceholder')}
                className="border-rose-200 focus:border-rose-400 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-rose-800 font-medium text-sm">{t('AdminSubscriptionPlans.form.features')}</label>
              <Input
                name="features"
                value={formData.features}
                onChange={handleChange}
                placeholder={t('AdminSubscriptionPlans.form.featuresPlaceholder')}
                className="border-rose-200 focus:border-rose-400 rounded-xl"
              />
              <p className="text-xs text-rose-600">
                {t('AdminSubscriptionPlans.form.featuresHint')}
              </p>
            </div>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-start space-x-3 rounded-xl border border-rose-200 p-4 bg-rose-50/50">
                <Checkbox
                  id="includes_dropshipping"
                  checked={formData.includes_dropshipping}
                  onCheckedChange={() => handleCheckboxChange('includes_dropshipping')}
                  className="data-[state=checked]:bg-rose-500 border-rose-300"
                />
                <div className="space-y-1 leading-none">
                  <label htmlFor="includes_dropshipping" className="text-rose-800 font-medium text-sm">
                    {t('AdminSubscriptionPlans.form.includesDropshipping')}
                  </label>
                </div>
              </div>

              <div className="flex items-start space-x-3 rounded-xl border border-rose-200 p-4 bg-rose-50/50">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={() => handleCheckboxChange('is_active')}
                  className="data-[state=checked]:bg-rose-500 border-rose-300"
                />
                <div className="space-y-1 leading-none">
                  <label htmlFor="is_active" className="text-rose-800 font-medium text-sm">
                    {t('AdminSubscriptionPlans.form.isActive')}
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button 
                type="submit"
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl"
              >
                {editingPlan 
                  ? t('AdminSubscriptionPlans.actions.saveChanges') 
                  : t('AdminSubscriptionPlans.actions.createPlan')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageSubscriptionPlansPage;