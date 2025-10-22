'use client';

import { useState, useEffect, useCallback  } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Image as ImageIcon, 
  Package,
  Tag,
  DollarSign,
  Hash,
  Palette,
  Crown,
  Sparkles,
  TrendingUp,
  Eye,
  Megaphone
} from 'lucide-react';
import ProductFormV2 from './ProductForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Navigation from '@/components/dashboards/Navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { withSubscription } from '@/components/auth/withSubscription';

// --- Type Definitions ---
export interface Variant {
  id: number;
  product_id: number;
  color: string;
  price: number;
  compare_at_price?: number | null;
  stock_quantity: number;
  sku: string;
  images?: string[] | null;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  brand?: string | null;
  status: 'draft' | 'active';
  variants: Variant[];
  promotion_ends_at?: string | null; // ✨ أضف هذا الحقل
  promotion_tier_name?: string | null; // ✨ أضف هذا الحقل
  promotion_days_left?: number | null;
  categoryIds: number[];
}

interface RawVariant {
  id: number;
  product_id: number;
  color: string;
  price: string | number;
  compare_at_price: string | number | null;
  stock_quantity: number;
  sku: string;
  images?: string[] | null;
}

interface RawProduct {
  id: number;
  name: string;
  description?: string | null;
  brand?: string | null;
  status: 'draft' | 'active';
  variants: RawVariant[];
  categoryIds?: number[];
}
interface PromotionTier {
    id: number;
    name: string;
    duration_days: number;
    price: number;
}

function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalVariants: 0,
    lowStock: 0
  });

  const [promotionTiers, setPromotionTiers] = useState<PromotionTier[]>([]);
  const [productToPromote, setProductToPromote] = useState<Product | null>(null);
  const [isPromoting, setIsPromoting] = useState(false); // لمنع الضغط المزدوج

  const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [productsResponse, tiersResponse] = await Promise.all([
                api.get<RawProduct[]>('/merchants/products'),
                api.get<PromotionTier[]>('/merchants/promotion-tiers')
            ]);

            // ✅ الشرح: هنا نقوم بتحويل البيانات الخام إلى الشكل الذي نريده
            const normalizedProducts: Product[] = productsResponse.data.map((product) => ({
                ...product,
                categoryIds: product.categoryIds || [], // التأكد من أن `categoryIds` موجودة
                variants: product.variants.map((variant: any) => ({
                    ...variant,
                    price: Number(variant.price) || 0,
                    compare_at_price: variant.compare_at_price ? Number(variant.compare_at_price) : null,
                })),
            }));

            setProducts(normalizedProducts);
            setPromotionTiers(tiersResponse.data);

            // حساب الإحصائيات
            const totalVariants = normalizedProducts.reduce((acc, p) => acc + p.variants.length, 0);
            const activeProducts = normalizedProducts.filter(p => p.status === 'active').length;
            const lowStock = normalizedProducts.reduce((acc, p) => acc + p.variants.filter(v => v.stock_quantity < 10).length, 0);
            setStats({
                totalProducts: normalizedProducts.length,
                activeProducts,
                totalVariants,
                lowStock
            });

        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('فشل في جلب البيانات.');
        } finally {
            setLoading(false);
        }
    }, []); // استخدمنا useCallback لتحسين الأداء

    // --- ✨ 3. تم تبسيط useEffect ---
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSuccess = () => {
        setIsDialogOpen(false);
        setProductToEdit(null);
        fetchData(); // ✅ استدعاء الدالة الموحدة
    };

    const handleDelete = async () => {
        if (!productToDelete) return;
        try {
            await api.delete(`/merchants/products/${productToDelete.id}`);
            setProductToDelete(null);
            toast.success("تم حذف المنتج بنجاح!");
            fetchData(); // ✅ استدعاء الدالة الموحدة
        } catch (error) {
            console.error('Failed to delete product', error);
            toast.error(t('ProductsPage.deleteFailed'));
        }
    };

  const openEditDialog = (product: Product) => {
    setProductToEdit(product);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setProductToEdit(null);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        {t('ProductsPage.status.active')}
      </Badge> :
      <Badge variant="outline">
        {t('ProductsPage.status.draft')}
      </Badge>;
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive">{t('ProductsPage.stock.outOfStock')}</Badge>;
    } else if (quantity < 10) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
        {t('ProductsPage.stock.lowStock')}
      </Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
        {t('ProductsPage.stock.inStock')}
      </Badge>;
    }
  };

  const handleSelectTier = async (tierId: number) => {
    if (!productToPromote || isPromoting) return;
    
    setIsPromoting(true);
    toast.info('جاري تحضير صفحة الدفع...');

    try {
      // 1. طلب رابط الدفع من الواجهة الخلفية
      const response = await api.post(`/merchants/products/${productToPromote.id}/promote`, { tierId });
      const { checkoutUrl } = response.data;

      if (checkoutUrl) {
        // 2. توجيه المستخدم مباشرة إلى الرابط
        window.location.href = checkoutUrl;
      } else {
        throw new Error('لم يتم استلام رابط الدفع.');
      }

    } catch (error) {
      console.error("Failed to create checkout session:", error);
      toast.error("حدث خطأ أثناء بدء عملية الدفع.");
      setIsPromoting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Navigation />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 space-x-reverse mb-4 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                {t('ProductsPage.title')}
              </h1>
              <p className="text-gray-600">{t('ProductsPage.subtitle')}</p>
            </div>
          </div>
          
          <Button 
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 h-12 px-6"
          >
            <PlusCircle className="ml-2 h-5 w-5" />
            {t('ProductsPage.addProduct')}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('ProductsPage.stats.totalProducts')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('ProductsPage.stats.activeProducts')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.activeProducts}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('ProductsPage.stats.variants')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.totalVariants}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Palette className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{t('ProductsPage.stats.lowStock')}</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats.lowStock}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-600">{t('ProductsPage.loading')}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {products.map((product) => (
                <AccordionItem value={`item-${product.id}`} key={product.id} className="border-b border-gray-200/50 last:border-b-0">
                  <AccordionTrigger className="hover:no-underline px-6 py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-purple-100 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-lg text-gray-900">{product.name}</span>
                          <div className="flex items-center space-x-2 space-x-reverse mt-1">
                            {getStatusBadge(product.status)}
                            {/* ✨ --- بداية الجزء المُضاف لعرض شارة الترويج --- ✨ */}
                            {product.promotion_ends_at && (
                                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 flex items-center gap-1.5">
                                        <Megaphone className="w-3.5 h-3.5" />
                                        <span>
                                            {product.promotion_tier_name}
                                            {/* Show remaining days if available */}
                                            {product.promotion_days_left != null && ` - ${t('ProductsPage.promotion.daysLeft', { count: product.promotion_days_left + 1 })}`}
                                        </span>
                                    </Badge>
                                )}
                            {/* ✨ --- نهاية الجزء المُضاف --- ✨ */}
                            {product.brand && (
                              <Badge variant="outline" className="flex items-center space-x-1 space-x-reverse">
                                <Tag className="w-3 h-3" />
                                <span>{product.brand}</span>
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(product);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openEditDialog(product);
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                        >
                          <Edit className="h-4 w-4 ml-2" />
                          {t('common.edit')}
                        </div>
                        {/* زر المعاينة الجديد */}
                        <Link 
                            href={`/products/${product.id}`} 
                            passHref
                            target="_blank" // لفتح الرابط في نافذة جديدة
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()} // لمنع فتح/إغلاق الأكورديون
                        >
                            <div
                                role="button"
                                tabIndex={0}
                                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                            >
                                <Eye className="h-4 w-4 ml-2 text-blue-500" />
                                {t('common.preview')}
                            </div>
                        </Link>
                        {/* ✨ --- نهاية الجزء المُضاف --- ✨ */}

                        <div
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToDelete(product);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setProductToDelete(product);
                            }
                          }}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 ml-2" />
                          {t('common.delete')}
                        </div>
                        <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setProductToPromote(product);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setProductToPromote(product);
                                }
                              }}
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 cursor-pointer"
                            >  
                              <Megaphone className="h-4 w-4 ml-2 text-rose-500" />
                              {t('common.promote')}
                          
                          
                      </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="px-6 pb-4">
                      {product.description && (
                        <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                      )}
                      
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <h4 className="font-semibold mb-3 flex items-center space-x-2 space-x-reverse">
                          <Sparkles className="w-4 h-4 text-rose-500" />
                          <span>{t('ProductsPage.variants')}</span>
                        </h4>
                        <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>{t('ProductsPage.variant.color')}</TableHead>
                                                <TableHead>{t('ProductsPage.variant.price')}</TableHead>
                                                <TableHead>{t('ProductsPage.variant.stock')}</TableHead>
                                                <TableHead>{t('ProductsPage.variant.sku')}</TableHead>
                                                <TableHead>{t('ProductsPage.variant.images')}</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {product.variants.map((variant) => (
                                                <TableRow key={variant.id} className="hover:bg-gray-100/50 transition-colors">
                                                    <TableCell className="font-medium">{variant.color}</TableCell>
                                                    <TableCell>
                                                        <span className="font-bold text-rose-600">{variant.price.toFixed(2)} {t('currency')}</span>
                                                        {variant.compare_at_price && <span className="text-sm text-gray-500 line-through ml-2">{variant.compare_at_price.toFixed(2)} {t('currency')}</span>}
                                                    </TableCell>
                                                    <TableCell>{variant.stock_quantity} {getStockBadge(variant.stock_quantity)}</TableCell>
                                                    <TableCell className="font-mono text-sm">{variant.sku}</TableCell>
                                                    <TableCell>
                                                      <div className="flex items-center gap-2">
                                                          {variant.images && variant.images.length > 0 ? (
                                                              variant.images.slice(0, 3).map((image, index) => (
                                                                  <div key={index} className="relative">
                                                                      <Image src={image} alt={`${variant.color} variant`} width={48} height={48} className="object-cover rounded-xl border-2 border-white shadow-sm" unoptimized/>
                                                                      {index === 2 && variant.images!.length > 3 && (
                                                                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center"><span className="text-white text-xs font-bold">+{variant.images!.length - 3}</span></div>
                                                                      )}
                                                                  </div>
                                                              ))
                                                          ) : <span className="text-xs text-gray-400">{t('ProductsPage.variant.noImages')}</span>}
                                                      </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-3xl flex items-center justify-center">
                <Package className="w-10 h-10 text-rose-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('ProductsPage.empty.title')}</h3>
            <p className="text-gray-600 mb-6">{t('ProductsPage.empty.subtitle')}</p>
            <Button 
              onClick={openCreateDialog}
              className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 h-12 px-8"
            >
              <PlusCircle className="ml-2 h-5 w-5" />
              {t('ProductsPage.empty.createFirst')}
            </Button>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <DialogHeader className="border-b border-gray-200/50 pb-4">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2 space-x-reverse">
                <Crown className="w-6 h-6" />
                <span>
                  {productToEdit ? t('ProductsPage.editProduct') : t('ProductsPage.createProduct')}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 max-h-[80vh] overflow-y-auto">
              <ProductFormV2 product={productToEdit} onSuccess={handleSuccess} />
            </div>
          </DialogContent>
        </Dialog>

        {/* --- ✨ نافذة اختيار باقة الترويج المحدثة --- */}
      <Dialog open={!!productToPromote} onOpenChange={() => setProductToPromote(null)}>
          <DialogContent className="bg-white/95 backdrop-blur-sm sm:max-w-[425px]">
              <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-gray-800">
                      ترويج المنتج: {productToPromote?.name}
                  </DialogTitle>
                  <DialogDescription>
                      اختاري الباقة المناسبة لعرض منتجكِ بشكل مميز في الصفحة الرئيسية.
                  </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  {promotionTiers.length > 0 ? (
                      promotionTiers.map(tier => (
                          <div 
                              key={tier.id} 
                              className="flex items-center justify-between p-4 border rounded-lg hover:border-rose-400 hover:bg-rose-50/50 cursor-pointer transition-all" 
                              onClick={() => handleSelectTier(tier.id)}
                              aria-disabled={isPromoting}
                          >
                              <div>
                                  <h4 className="font-semibold text-gray-900">{tier.name}</h4>
                                  <p className="text-sm text-gray-500">{tier.duration_days} يوم</p>
                              </div>
                              <div className="text-left">
                                  <p className="font-bold text-lg text-green-600">
                                    {Number(tier.price || 0).toFixed(2)} {t('currency')}
                                  </p>

                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="text-center text-gray-500">لا توجد باقات ترويج متاحة حاليًا.</p>
                  )}
              </div>
          </DialogContent>
      </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!productToDelete}
          onOpenChange={(open) => !open && setProductToDelete(null)}
        >
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2 space-x-reverse">
                <Trash2 className="w-5 h-5 text-rose-500" />
                <span>{t('ProductsPage.confirmDelete.title')}</span>
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-600">
                {productToDelete && (
                  <>
                    {t('ProductsPage.confirmDelete.message', { name: productToDelete.name })}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex space-x-3 space-x-reverse">
              <AlertDialogCancel className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors">
                {t('common.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t('ProductsPage.confirmDelete.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}


export default withSubscription(ProductsPage);
