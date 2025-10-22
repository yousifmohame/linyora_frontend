'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import SupplierNav from '@/components/dashboards/SupplierNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  PlusCircle,
  Edit,
  Trash2,
  Package,
  Sparkles,
  ImageIcon,
  Palette,
  DollarSign,
  TrendingUp,
  Target,
  Search,
  Filter,
} from 'lucide-react';
import Image from 'next/image';
import SupplierProductForm from './ProductForm';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface SupplierVariant {
  id: number;
  color: string;
  cost_price: number;
  stock_quantity: number;
  images: string[];
}

interface SupplierProduct {
  id: number;
  name: string;
  brand: string;
  description: string;
  variants: SupplierVariant[];
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) => (
  <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow duration-200">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-blue-600 text-sm font-medium mb-2">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div
          className={`p-3 rounded-2xl ${
            color.includes('blue')
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
              : color.includes('indigo')
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
              : 'bg-gradient-to-r from-amber-500 to-orange-500'
          }`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function SupplierProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<SupplierProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<SupplierProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<SupplierProduct | null>(null);
  const [stats, setStats] = useState({ totalProducts: 0, totalVariants: 0, lowStock: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get<SupplierProduct[]>('/supplier/products');
      setProducts(data);
      const totalVariants = data.reduce((acc, p) => acc + (p.variants?.length || 0), 0);
      const lowStock = data.reduce(
        (acc, p) => acc + (p.variants?.filter((v) => v.stock_quantity < 10).length || 0),
        0
      );
      setStats({ totalProducts: data.length, totalVariants, lowStock });
    } catch {
      toast.error(t('supplierproducts.toasts.fetchError'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
    setProductToEdit(null);
    fetchProducts();
    toast.success(t('supplierproducts.toasts.saveSuccess'));
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/supplier/products/${productToDelete.id}`);
      toast.success(t('supplierproducts.toasts.deleteSuccess'));
      setProductToDelete(null);
      fetchProducts();
    } catch {
      toast.error(t('supplierproducts.toasts.deleteError'));
    }
  };

  const openCreateDialog = () => {
    setProductToEdit(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: SupplierProduct) => {
    setProductToEdit(product);
    setIsDialogOpen(true);
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0)
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 rounded-xl px-3 py-1">
          {t('supplierproducts.stock.outOfStock')}
        </Badge>
      );
    if (quantity < 10)
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 rounded-xl px-3 py-1">
          {t('supplierproducts.stock.lowStock')}
        </Badge>
      );
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-xl px-3 py-1">
        {t('supplierproducts.stock.available')}
      </Badge>
    );
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Package className="h-8 w-8 text-blue-500" />
          </div>
          <Sparkles className="h-6 w-6 text-blue-300" />
          <Target className="h-6 w-6 text-blue-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
          {t('supplierproducts.pageTitle')}
        </h1>
        <p className="text-blue-700 text-lg max-w-2xl mx-auto">{t('supplierproducts.pageSubtitle')}</p>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-7xl mx-auto">
        <StatCard
          title={t('supplierproducts.stats.totalProducts')}
          value={stats.totalProducts}
          icon={Package}
          color="text-blue-900"
        />
        <StatCard
          title={t('supplierproducts.stats.totalVariants')}
          value={stats.totalVariants}
          icon={Sparkles}
          color="text-indigo-900"
        />
        <StatCard
          title={t('supplierproducts.stats.lowStock')}
          value={stats.lowStock}
          icon={TrendingUp}
          color="text-amber-900"
        />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
            <Input
              placeholder={t('supplierproducts.actions.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/80 border-blue-200 rounded-2xl pl-4 pr-10 py-2 focus:border-blue-400 transition-colors duration-200"
            />
          </div>
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-2xl">
            <Filter className="w-4 h-4 ml-2" />
            {t('supplierproducts.actions.filter')}
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-4 py-2 text-sm">
            {t('supplierproducts.badges.productCount', { count: filteredProducts.length })}
          </Badge>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl h-12 px-6 rounded-2xl font-bold transition-colors duration-200"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            {t('supplierproducts.actions.addProduct')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden max-w-7xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-blue-700 text-lg">{t('supplierproducts.table.loading')}</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden text-center py-16 max-w-2xl mx-auto">
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center">
                <Package className="w-10 h-10 text-blue-400" />
              </div>
            </div>
            <h3 className="font-bold text-2xl text-blue-800 mb-2">
              {t('supplierproducts.table.empty.title')}
            </h3>
            <p className="text-blue-600 mb-6 max-w-md mx-auto">
              {t('supplierproducts.table.empty.description')}
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold"
            >
              {t('supplierproducts.actions.addFirstProduct')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-xl rounded-3xl overflow-hidden max-w-7xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Package className="h-6 w-6" />
              {t('supplierproducts.pageTitle')}
            </CardTitle>
            <CardDescription className="text-blue-100">
              {t('supplierproducts.table.found', { count: filteredProducts.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {filteredProducts.map((product) => (
                <AccordionItem value={`product-${product.id}`} key={product.id} className="border-blue-100">
                  <div className="flex items-center justify-between w-full px-6 py-4 hover:bg-blue-50/50 transition-colors duration-200">
                    <AccordionTrigger className="flex-1 p-0 hover:no-underline [&[data-state=open]>div>div]:rotate-180">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 relative rounded-xl overflow-hidden border-2 border-blue-200">
                          <Image
                            src={product.variants?.[0]?.images?.[0] || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="text-right">
                          <h4 className="font-bold text-lg text-blue-900">{product.name}</h4>
                          <p className="text-sm text-blue-600">{product.brand}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2 pr-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-xl transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4 ml-1" />
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="px-6 py-4 bg-blue-50/30 border-t border-blue-100">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-blue-100 hover:bg-transparent">
                          <TableHead className="text-blue-800 font-bold text-right">
                            {t('supplierproducts.table.headers.color')}
                          </TableHead>
                          <TableHead className="text-blue-800 font-bold text-right">
                            {t('supplierproducts.table.headers.costPrice')}
                          </TableHead>
                          <TableHead className="text-blue-800 font-bold text-right">
                            {t('supplierproducts.table.headers.quantity')}
                          </TableHead>
                          <TableHead className="text-blue-800 font-bold text-right">
                            {t('supplierproducts.table.headers.images')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants?.map((variant) => (
                          <TableRow
                            key={variant.id}
                            className="border-blue-100 hover:bg-blue-50/50 transition-colors duration-200"
                          >
                            <TableCell className="font-bold text-blue-900 text-right">
                              {variant.color}
                            </TableCell>
                            <TableCell className="text-blue-700 font-medium text-right">
                              {Number(variant.cost_price).toFixed(2)}{' '}
                              {t('supplierdashboard.currency', { ns: 'supplierdashboard' }) || 'ر.س'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-blue-700">{variant.stock_quantity}</span>
                                {getStockBadge(variant.stock_quantity)}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {variant.images?.map((url) => (
                                  <div
                                    key={url}
                                    className="w-10 h-10 relative rounded-lg overflow-hidden border border-blue-200"
                                  >
                                    <Image
                                      src={url}
                                      alt={variant.color}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[90vw] max-w-none h-[90vh] max-h-none bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-lg overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Package className="h-6 w-6" />
              {productToEdit
                ? t('supplierproducts.dialogs.editTitle')
                : t('supplierproducts.dialogs.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[calc(90vh-120px)] overflow-y-auto">
            <SupplierProductForm product={productToEdit} onSuccess={handleFormSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-blue-200 rounded-3xl shadow-lg">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-blue-800">
              {t('supplierproducts.dialogs.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-600 text-lg">
              {t('supplierproducts.dialogs.delete.description', {
                name: productToDelete?.name || '',
              })}
              <br />
              <span className="font-bold text-blue-700">
                {t('supplierproducts.dialogs.delete.warning')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 rounded-2xl px-6 py-2">
              {t('supplierproducts.dialogs.delete.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl px-6 py-2 font-bold"
            >
              {t('supplierproducts.dialogs.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}