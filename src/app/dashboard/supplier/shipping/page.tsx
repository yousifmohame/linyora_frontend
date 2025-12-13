'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import SupplierNav from '@/components/dashboards/SupplierNav';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Truck,
  PlusCircle,
  Edit,
  Trash2,
  Sparkles,
  Target,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ShippingCompany {
  id: number;
  name: string;
  shipping_cost: number;
}

type CompanyFormData = {
  name: string;
  shipping_cost: number | string;
};

export default function SupplierShippingPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyToEdit, setCompanyToEdit] = useState<ShippingCompany | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<ShippingCompany | null>(null);

  const form = useForm<CompanyFormData>({
    defaultValues: { name: '', shipping_cost: '' },
  });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await api.get<ShippingCompany[]>('/supplier/shipping');
      const parsedCompanies = response.data.map((company) => ({
        ...company,
        shipping_cost: Number(company.shipping_cost),
      }));
      setCompanies(parsedCompanies);
    } catch (error) {
      toast.error(t('suppliershipping.toasts.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [t]);

  const openDialog = (company: ShippingCompany | null = null) => {
    setCompanyToEdit(company);
    if (company) {
      form.reset({ name: company.name, shipping_cost: String(company.shipping_cost) });
    } else {
      form.reset({ name: '', shipping_cost: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit: SubmitHandler<CompanyFormData> = async (data) => {
    if (!data.name.trim()) {
      toast.error(t('suppliershipping.form.errors.nameRequired'));
      return;
    }

    const cost = parseFloat(String(data.shipping_cost));
    if (isNaN(cost) || cost < 0) {
      toast.error(t('suppliershipping.form.errors.invalidCost'));
      return;
    }

    const payload = {
      name: data.name.trim(),
      shipping_cost: cost,
    };

    try {
      if (companyToEdit) {
        await api.put(`/supplier/shipping/${companyToEdit.id}`, payload);
        toast.success(t('suppliershipping.toasts.saveSuccess.update'));
      } else {
        await api.post('/supplier/shipping', payload);
        toast.success(t('suppliershipping.toasts.saveSuccess.add'));
      }
      setIsDialogOpen(false);
      fetchCompanies();
    } catch (error) {
      toast.error(t('suppliershipping.toasts.genericError'));
    }
  };

  const handleDelete = async () => {
    if (!companyToDelete) return;
    try {
      await api.delete(`/supplier/shipping/${companyToDelete.id}`);
      toast.success(t('suppliershipping.toasts.deleteSuccess'));
      setCompanyToDelete(null);
      fetchCompanies();
    } catch (error) {
      toast.error(t('suppliershipping.toasts.deleteError'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 sm:p-6 max-w-full overflow-x-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-0 h-0 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      <header className="mb-6 sm:mb-8 text-center relative mt-2">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-white rounded-xl sm:rounded-2xl shadow-lg">
            <Truck className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
          </div>
          <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-blue-300" />
          <Target className="h-4 w-4 sm:h-6 sm:w-6 text-blue-300" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-3">
          {t('suppliershipping.pageTitle')}
        </h1>
        <p className="text-blue-700 text-sm sm:text-base max-w-xl mx-auto px-2">
          {t('suppliershipping.pageSubtitle')}
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 max-w-7xl mx-auto">
        <div className="text-center sm:text-left">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1 text-xs sm:text-sm">
            {t('suppliershipping.badges.companyCount', { count: companies.length })}
          </Badge>
        </div>
        <Button
          onClick={() => openDialog()}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow h-10 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base"
        >
          <PlusCircle className="mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
          {t('suppliershipping.actions.addCompany')}
        </Button>
      </div>

      {loading ? (
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-7 w-7 sm:h-8 sm:w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-blue-700 text-sm sm:text-base">{t('suppliershipping.table.loading')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : companies.length === 0 ? (
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="flex flex-col items-center justify-center text-blue-600">
                <Truck className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
                <h3 className="text-lg sm:text-xl font-semibold text-blue-800">
                  {t('suppliershipping.table.empty.title')}
                </h3>
                <p className="text-blue-600 mt-1 sm:mt-2 text-sm sm:text-base px-2">
                  {t('suppliershipping.table.empty.description')}
                </p>
                <Button
                  onClick={() => openDialog()}
                  className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2 rounded-lg text-sm"
                >
                  {t('suppliershipping.actions.addCompany')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-200 flex flex-col"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                    <Truck className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 truncate">{company.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-blue-700 text-sm">{t('suppliershipping.table.headers.cost')}</p>
                    <Badge className="mt-1 bg-green-100 text-green-800 rounded-xl px-3 py-1 font-medium text-sm">
                      {company.shipping_cost.toFixed(2)} {t('supplierdashboard.currency') || 'ر.س'}
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(company)}
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg text-xs sm:text-sm h-9"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      {t('suppliershipping.actions.edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setCompanyToDelete(company)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm h-9"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      {t('suppliershipping.actions.delete')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-full w-[95vw] sm:w-[90vw] sm:max-w-md bg-white/95 backdrop-blur-sm border-blue-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-5 sm:p-6 rounded-t-2xl -m-5 sm:-m-6 mb-5 sm:mb-6">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center gap-2.5">
              <Truck className="h-5 w-5 sm:h-6 sm:w-6" />
              {companyToEdit
                ? t('suppliershipping.form.title.edit')
                : t('suppliershipping.form.title.add')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 font-bold text-sm sm:text-base">
                      {t('suppliershipping.form.labels.name')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('suppliershipping.form.placeholders.name')}
                        {...field}
                        value={field.value ?? ''}
                        className="bg-white border-blue-200 focus:border-blue-400 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 font-bold text-sm sm:text-base">
                      {t('suppliershipping.form.labels.cost')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={t('suppliershipping.form.placeholders.cost')}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="bg-white border-blue-200 focus:border-blue-400 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-blue-200 px-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg sm:rounded-xl px-4 py-2 text-xs sm:text-sm"
                  >
                    {t('suppliershipping.actions.cancel')}
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg sm:rounded-xl px-4 py-2 font-bold text-xs sm:text-sm"
                >
                  {companyToEdit
                    ? t('suppliershipping.actions.saveChanges')
                    : t('suppliershipping.actions.addCompanyButton')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-blue-200 rounded-2xl sm:rounded-3xl shadow-lg max-w-md mx-4">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-blue-800">
              {t('suppliershipping.dialogs.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-600 text-sm mt-1">
              {t('suppliershipping.dialogs.delete.description', {
                name: companyToDelete?.name || '',
              })}
              <br />
              <span className="font-bold text-blue-700">
                {t('suppliershipping.dialogs.delete.warning')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 rounded-lg px-4 py-2 text-xs sm:text-sm">
              {t('suppliershipping.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg px-4 py-2 font-bold text-xs sm:text-sm"
            >
              {t('suppliershipping.dialogs.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}