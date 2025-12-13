'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import SupplierNav from '@/components/dashboards/SupplierNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  <Card className="bg-white/80 backdrop-blur-sm border border-blue-200 shadow-md rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-blue-600 text-xs font-medium mb-1">{title}</p>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
        <div
          className={`p-2 rounded-xl ${
            color.includes('blue')
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
              : color.includes('indigo')
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
              : 'bg-gradient-to-r from-amber-500 to-orange-500'
          }`}
        >
          <Icon className="w-5 h-5 text-white" />
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
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 rounded-lg px-2 py-0.5 text-xs">
          {t('supplierproducts.stock.outOfStock')}
        </Badge>
      );
    if (quantity < 10)
      return (
        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 rounded-lg px-2 py-0.5 text-xs">
          {t('supplierproducts.stock.lowStock')}
        </Badge>
      );
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 rounded-lg px-2 py-0.5 text-xs">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4 max-w-full overflow-x-hidden relative">
      {/* Background blur circles — smaller on mobile */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <SupplierNav />

      <header className="mb-6 text-center relative mt-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-2 bg-white rounded-xl shadow-md">
            <Package className="h-6 w-6 text-blue-500" />
          </div>
          <Sparkles className="h-4 w-4 text-blue-300" />
          <Target className="h-4 w-4 text-blue-300" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          {t('supplierproducts.pageTitle')}
        </h1>
        <p className="text-blue-700 text-sm sm:text-base max-w-md mx-auto px-2">
          {t('supplierproducts.pageSubtitle')}
        </p>
      </header>

      {/* Stats — stack on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-7xl mx-auto mb-6 min-w-0">
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

      {/* Search & Actions */}
      <div className="flex flex-col gap-4 mb-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-4 h-4" />
            <Input
              placeholder={t('supplierproducts.actions.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/80 border-blue-200 rounded-xl pl-4 pr-10 py-2 text-sm focus:border-blue-400"
            />
          </div>
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl text-sm h-10">
            <Filter className="w-4 h-4 ml-1" />
            {t('supplierproducts.actions.filter')}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1 text-xs">
            {t('supplierproducts.badges.productCount', { count: filteredProducts.length })}
          </Badge>
          <Button
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow h-10 px-4 rounded-xl font-bold text-sm"
          >
            <PlusCircle className="mr-1 h-4 w-4" />
            {t('supplierproducts.actions.addProduct')}
          </Button>
        </div>
      </div>

      {/* Loading / Empty / Product List */}
      {isLoading ? (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow rounded-xl max-w-7xl mx-auto">
          <CardContent className="p-6 text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-blue-700 text-sm">{t('supplierproducts.table.loading')}</p>
          </CardContent>
        </Card>
      ) : filteredProducts.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow rounded-xl text-center py-12 max-w-md mx-auto">
          <CardContent>
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Package className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg text-blue-800 mb-1">
              {t('supplierproducts.table.empty.title')}
            </h3>
            <p className="text-blue-600 text-sm mb-4 px-2">
              {t('supplierproducts.table.empty.description')}
            </p>
            <Button
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-xl text-sm"
            >
              {t('supplierproducts.actions.addFirstProduct')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow rounded-xl max-w-7xl mx-auto overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('supplierproducts.pageTitle')}
            </CardTitle>
            <CardDescription className="text-blue-100 text-sm">
              {t('supplierproducts.table.found', { count: filteredProducts.length })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {filteredProducts.map((product) => (
                <AccordionItem value={`product-${product.id}`} key={product.id} className="border-blue-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-4 gap-3">
                    <AccordionTrigger className="flex-1 p-0 hover:no-underline min-w-0 [&[data-state=open]>div>div]:rotate-180">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-blue-200 flex-shrink-0">
                          <Image
                            src={product.variants?.[0]?.images?.[0] || '/placeholder.png'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-blue-900 text-sm truncate">{product.name}</h4>
                          <p className="text-xs text-blue-600 truncate">{product.brand}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg h-8 px-2 text-xs"
                      >
                        <Edit className="w-3 h-3 ml-1" />
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-8 px-2 text-xs"
                      >
                        <Trash2 className="w-3 h-3 ml-1" />
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>

                  {/* ✅ TABLE-FREE VARIANT DISPLAY */}
                  <AccordionContent className="px-4 pb-4 bg-blue-50/30 border-t border-blue-100">
                    <div className="space-y-4">
                      {product.variants?.map((variant) => (
                        <div
                          key={variant.id}
                          className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-white rounded-lg border border-blue-200"
                        >
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-blue-600 mb-1">{t('supplierproducts.table.headers.color')}</p>
                            <p className="font-medium text-blue-900 text-sm truncate">{variant.color}</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-blue-600 mb-1">{t('supplierproducts.table.headers.costPrice')}</p>
                            <p className="text-blue-700 text-sm">
                              {Number(variant.cost_price).toFixed(2)} {t('supplierdashboard.currency') || 'ر.س'}
                            </p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-blue-600 mb-1">{t('supplierproducts.table.headers.quantity')}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="text-blue-700 text-sm font-medium">{variant.stock_quantity}</span>
                              {getStockBadge(variant.stock_quantity)}
                            </div>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-xs text-blue-600 mb-1">{t('supplierproducts.table.headers.images')}</p>
                            <div className="flex gap-1.5">
                              {variant.images?.slice(0, 2).map((url) => (
                                <div
                                  key={url}
                                  className="w-8 h-8 relative rounded overflow-hidden border border-blue-200 flex-shrink-0"
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
                              {variant.images.length > 2 && (
                                <div className="w-8 h-8 flex items-center justify-center rounded border border-blue-200 bg-blue-50 text-blue-500 text-xs font-bold">
                                  +{variant.images.length - 2}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}

      {/* Dialog - Mobile Optimized */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-none h-[85vh] bg-white/95 backdrop-blur-sm border-blue-200 rounded-xl shadow-lg overflow-hidden p-0">
          <DialogHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5" />
              {productToEdit
                ? t('supplierproducts.dialogs.editTitle')
                : t('supplierproducts.dialogs.addTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 max-h-[calc(85vh-80px)] overflow-y-auto">
            <SupplierProductForm product={productToEdit} onSuccess={handleFormSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!productToDelete} onOpenChange={() => setProductToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-blue-200 rounded-xl shadow-lg p-6 max-w-md mx-4">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-blue-800">
              {t('supplierproducts.dialogs.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-600 text-sm mt-2">
              {t('supplierproducts.dialogs.delete.description', {
                name: productToDelete?.name || '',
              })}
              <br />
              <span className="font-bold text-blue-700">
                {t('supplierproducts.dialogs.delete.warning')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
            <AlertDialogCancel className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 rounded-lg px-4 py-2 text-sm">
              {t('supplierproducts.dialogs.delete.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-lg px-4 py-2 font-bold text-sm"
            >
              {t('supplierproducts.dialogs.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}