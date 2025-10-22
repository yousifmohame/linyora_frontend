'use client';

import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import SupplierNav from '@/components/dashboards/SupplierNav';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Truck className="h-8 w-8 text-blue-500" />
          </div>
          <Sparkles className="h-6 w-6 text-blue-300" />
          <Target className="h-6 w-6 text-blue-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {t('suppliershipping.pageTitle')}
        </h1>
        <p className="text-blue-700 text-lg max-w-2xl mx-auto">{t('suppliershipping.pageSubtitle')}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 max-w-7xl mx-auto">
        <div className="text-center md:text-right">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
            {t('suppliershipping.badges.companyCount', { count: companies.length })}
          </Badge>
        </div>
        <Button
          onClick={() => openDialog()}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl h-12 px-6 rounded-2xl font-bold transition-colors duration-200"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          {t('suppliershipping.actions.addCompany')}
        </Button>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden max-w-7xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <Package className="h-6 w-6" />
            {t('suppliershipping.table.headers.name')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-blue-700">{t('suppliershipping.table.loading')}</p>
              </div>
            </div>
          ) : companies.length === 0 ? (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center justify-center text-blue-600">
                <Truck className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-blue-800">
                  {t('suppliershipping.table.empty.title')}
                </h3>
                <p className="text-blue-600 mt-2">{t('suppliershipping.table.empty.description')}</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-blue-100 hover:bg-transparent">
                    <TableHead className="text-blue-800 font-bold text-right">
                      {t('suppliershipping.table.headers.name')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      {t('suppliershipping.table.headers.cost')}
                    </TableHead>
                    <TableHead className="text-blue-800 font-bold text-right">
                      {t('suppliershipping.table.headers.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow
                      key={company.id}
                      className="border-blue-100 hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <TableCell className="font-bold text-blue-900 text-right">
                        {company.name}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-xl px-3 py-1 font-medium">
                          {company.shipping_cost.toFixed(2)}{' '}
                          {t('supplierdashboard.currency', { ns: 'supplierdashboard' }) || 'ر.س'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDialog(company)}
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-xl transition-colors duration-200"
                          >
                            <Edit className="w-4 h-4 ml-1" />
                            {t('suppliershipping.actions.edit')}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setCompanyToDelete(company)}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4 ml-1" />
                            {t('suppliershipping.actions.delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90vw] max-w-none max-h-none bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-lg overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Truck className="h-6 w-6" />
              {companyToEdit
                ? t('suppliershipping.form.title.edit')
                : t('suppliershipping.form.title.add')}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 font-bold text-lg">
                      {t('suppliershipping.form.labels.name')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('suppliershipping.form.placeholders.name')}
                        {...field}
                        value={field.value ?? ''}
                        className="bg-white border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 text-lg transition-colors duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shipping_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-800 font-bold text-lg">
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
                        className="bg-white border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 text-lg transition-colors duration-200"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-blue-200">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl px-6 py-2"
                  >
                    {t('suppliershipping.actions.cancel')}
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl px-6 py-2 font-bold transition-colors duration-200"
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

      <AlertDialog open={!!companyToDelete} onOpenChange={() => setCompanyToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-lg">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-blue-800">
              {t('suppliershipping.dialogs.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-600 text-lg">
              {t('suppliershipping.dialogs.delete.description', {
                name: companyToDelete?.name || '',
              })}
              <br />
              <span className="font-bold text-blue-700">
                {t('suppliershipping.dialogs.delete.warning')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 rounded-2xl px-6 py-2">
              {t('suppliershipping.actions.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl px-6 py-2 font-bold"
            >
              {t('suppliershipping.dialogs.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}