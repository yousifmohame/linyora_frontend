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
  Megaphone,
  ChevronDown,
  ChevronUp
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
  promotion_ends_at?: string | null;
  promotion_tier_name?: string | null;
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
  const [isPromoting, setIsPromoting] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsResponse, tiersResponse] = await Promise.all([
        api.get<RawProduct[]>('/merchants/products'),
        api.get<PromotionTier[]>('/merchants/promotion-tiers')
      ]);

      const normalizedProducts: Product[] = productsResponse.data.map((product) => ({
        ...product,
        categoryIds: product.categoryIds || [],
        variants: product.variants.map((variant: any) => ({
          ...variant,
          price: Number(variant.price) || 0,
          compare_at_price: variant.compare_at_price ? Number(variant.compare_at_price) : null,
        })),
      }));

      setProducts(normalizedProducts);
      setPromotionTiers(tiersResponse.data);

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setProductToEdit(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/merchants/products/${productToDelete.id}`);
      setProductToDelete(null);
      toast.success("تم حذف المنتج بنجاح!");
      fetchData();
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

  const toggleProductExpand = (productId: number) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
        {t('ProductsPage.status.active')}
      </Badge> :
      <Badge variant="outline" className="text-xs">
        {t('ProductsPage.status.draft')}
      </Badge>;
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge variant="destructive" className="text-xs">{t('ProductsPage.stock.outOfStock')}</Badge>;
    } else if (quantity < 10) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs">
        {t('ProductsPage.stock.lowStock')}
      </Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
        {t('ProductsPage.stock.inStock')}
      </Badge>;
    }
  };

  const handleSelectTier = async (tierId: number) => {
    if (!productToPromote || isPromoting) return;
    
    setIsPromoting(true);
    toast.info('جاري تحضير صفحة الدفع...');

    try {
      const response = await api.post(`/merchants/products/${productToPromote.id}/promote`, { tierId });
      const { checkoutUrl } = response.data;

      if (checkoutUrl) {
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

  // Mobile-friendly product card component
  const MobileProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 space-x-reverse flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
            <Package className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
              {product.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {getStatusBadge(product.status)}
              {product.promotion_ends_at && (
                <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 text-xs flex items-center gap-1 max-w-[140px]">
                  <Megaphone className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">
                    {product.promotion_tier_name}
                    {product.promotion_days_left != null && ` - ${product.promotion_days_left + 1} يوم`}
                  </span>
                </Badge>
              )}
              {product.brand && (
                <Badge variant="outline" className="text-xs flex items-center gap-1 max-w-[120px]">
                  <Tag className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{product.brand}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleProductExpand(product.id)}
          className="flex-shrink-0 ml-2"
        >
          {expandedProduct === product.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => openEditDialog(product)}
          className="h-8 text-xs flex-1 min-w-[80px]"
        >
          <Edit className="h-3 w-3 ml-1" />
          تعديل
        </Button>
        
        <Link href={`/products/${product.id}`} passHref target="_blank">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs flex-1 min-w-[80px]"
          >
            <Eye className="h-3 w-3 ml-1 text-blue-500" />
            معاينة
          </Button>
        </Link>
        
        <Button
          size="sm"
          variant="outline"
          onClick={() => setProductToPromote(product)}
          className="h-8 text-xs flex-1 min-w-[80px]"
        >
          <Megaphone className="h-3 w-3 ml-1 text-rose-500" />
          ترويج
        </Button>
        
        <Button
          size="sm"
          variant="destructive"
          onClick={() => setProductToDelete(product)}
          className="h-8 text-xs flex-1 min-w-[80px]"
        >
          <Trash2 className="h-3 w-3 ml-1" />
          حذف
        </Button>
      </div>

      {/* Expanded Content */}
      {expandedProduct === product.id && (
        <div className="border-t pt-3 space-y-3">
          {product.description && (
            <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
          )}
          
          <div className="bg-gray-50 rounded-xl p-3">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-500" />
              المتغيرات ({product.variants.length})
            </h4>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {product.variants.map((variant) => (
                <div key={variant.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">اللون:</span>
                      <div className="text-gray-900 mt-1 truncate">{variant.color}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">السعر:</span>
                      <div className="mt-1">
                        <span className="font-bold text-rose-600">{variant.price.toFixed(2)} {t('currency')}</span>
                        {variant.compare_at_price && (
                          <span className="text-xs text-gray-500 line-through mr-2">
                            {variant.compare_at_price.toFixed(2)} {t('currency')}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">المخزون:</span>
                      <div className="mt-1">
                        {variant.stock_quantity} 
                        <span className="mr-2">{getStockBadge(variant.stock_quantity)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">SKU:</span>
                      <div className="font-mono text-xs mt-1 truncate">{variant.sku}</div>
                    </div>
                  </div>
                  
                  {/* Variant Images */}
                  <div className="mt-3">
                    <span className="font-medium text-gray-700 text-sm">الصور:</span>
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                      {variant.images && variant.images.length > 0 ? (
                        variant.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="flex-shrink-0">
                            <Image 
                              src={image} 
                              alt={`${variant.color} variant`} 
                              width={60} 
                              height={60} 
                              className="object-cover rounded-lg border border-gray-200"
                              unoptimized
                            />
                          </div>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">لا توجد صور</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 overflow-hidden">
      <Navigation />
      
      {/* Main Content Container with Scroll */}
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 space-x-reverse mb-4 lg:mb-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent truncate">
                {t('ProductsPage.title')}
              </h1>
              <p className="text-gray-600 text-sm sm:text-base truncate">{t('ProductsPage.subtitle')}</p>
            </div>
          </div>
          
          <Button 
            onClick={openCreateDialog}
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11 sm:h-12 px-4 sm:px-6 text-sm sm:text-base w-full lg:w-auto"
          >
            <PlusCircle className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            {t('ProductsPage.addProduct')}
          </Button>
        </div>

        {/* Stats Cards - Horizontal Scroll on Mobile */}
        {/* Stats Cards — Pure Responsive Grid (NO HORIZONTAL SCROLL) */}
<div className="mb-6 sm:mb-8">
  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{t('ProductsPage.stats.totalProducts')}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.totalProducts}</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center">
          <Package className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{t('ProductsPage.stats.activeProducts')}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.activeProducts}</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-50 rounded-xl flex items-center justify-center">
          <Eye className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{t('ProductsPage.stats.variants')}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.totalVariants}</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-50 rounded-xl flex items-center justify-center">
          <Palette className="w-4 h-4 sm:w-6 sm:h-6 text-purple-500" />
        </div>
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{t('ProductsPage.stats.lowStock')}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1 sm:mt-2">{stats.lowStock}</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-50 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" />
        </div>
      </div>
    </div>
  </div>
</div>

        {/* Products List - Scrollable Area */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center animate-pulse">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600">{t('ProductsPage.loading')}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="h-full flex flex-col">
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden flex-1 min-h-0">
                <div className="h-full overflow-auto">
                  <Accordion type="single" collapsible className="w-full">
                    {products.map((product) => (
                      <AccordionItem value={`item-${product.id}`} key={product.id} className="border-b border-gray-200/50 last:border-b-0">
                        <AccordionTrigger className="hover:no-underline px-6 py-4">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center space-x-4 space-x-reverse flex-1 min-w-0">
                              <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-rose-600" />
                              </div>
                              <div className="text-right min-w-0 flex-1">
                                <span className="font-semibold text-lg text-gray-900 truncate block">{product.name}</span>
                                <div className="flex items-center space-x-2 space-x-reverse mt-1 flex-wrap">
                                  {getStatusBadge(product.status)}
                                  {product.promotion_ends_at && (
                                    <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 flex items-center gap-1.5 max-w-[200px]">
                                      <Megaphone className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span className="truncate">
                                        {product.promotion_tier_name}
                                        {product.promotion_days_left != null && ` - ${product.promotion_days_left + 1} يوم`}
                                      </span>
                                    </Badge>
                                  )}
                                  {product.brand && (
                                    <Badge variant="outline" className="flex items-center space-x-1 space-x-reverse max-w-[150px]">
                                      <Tag className="w-3 h-3 flex-shrink-0" />
                                      <span className="truncate">{product.brand}</span>
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
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
                              
                              <Link 
                                href={`/products/${product.id}`} 
                                passHref
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
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
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden flex-1 overflow-auto">
                <div className="space-y-4 pb-4">
                  {products.map((product) => (
                    <MobileProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8 sm:p-12 text-center">
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-3xl flex items-center justify-center">
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-rose-600" />
                </div>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{t('ProductsPage.empty.title')}</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">{t('ProductsPage.empty.subtitle')}</p>
              <Button 
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
              >
                <PlusCircle className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                {t('ProductsPage.empty.createFirst')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* باقي الكود (النوافذ المنبثقة) يبقى كما هو */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl w-[95vw] max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b border-gray-200/50 pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent flex items-center space-x-2 space-x-reverse">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>
                {productToEdit ? t('ProductsPage.editProduct') : t('ProductsPage.createProduct')}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 sm:py-6 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto">
            <ProductFormV2 product={productToEdit} onSuccess={handleSuccess} />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!productToPromote} onOpenChange={() => setProductToPromote(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm sm:max-w-[425px] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800">
              ترويج المنتج: {productToPromote?.name}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              اختاري الباقة المناسبة لعرض منتجكِ بشكل مميز في الصفحة الرئيسية.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4 py-4">
            {promotionTiers.length > 0 ? (
              promotionTiers.map(tier => (
                <div 
                  key={tier.id} 
                  className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:border-rose-400 hover:bg-rose-50/50 cursor-pointer transition-all"
                  onClick={() => handleSelectTier(tier.id)}
                  aria-disabled={isPromoting}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{tier.name}</h4>
                    <p className="text-xs sm:text-sm text-gray-500">{tier.duration_days} يوم</p>
                  </div>
                  <div className="text-left flex-shrink-0 ml-3">
                    <p className="font-bold text-base sm:text-lg text-green-600">
                      {Number(tier.price || 0).toFixed(2)} {t('currency')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm sm:text-base">لا توجد باقات ترويج متاحة حاليًا.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-3xl w-[95vw] max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-gray-900 flex items-center space-x-2 space-x-reverse">
              <Trash2 className="w-5 h-5 text-rose-500" />
              <span>{t('ProductsPage.confirmDelete.title')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-sm sm:text-base">
              {productToDelete && (
                <>
                  {t('ProductsPage.confirmDelete.message', { name: productToDelete.name })}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 space-x-reverse">
            <AlertDialogCancel className="flex-1 border-gray-300 hover:bg-gray-50 transition-colors w-full sm:w-auto">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
            >
              {t('ProductsPage.confirmDelete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withSubscription(ProductsPage);