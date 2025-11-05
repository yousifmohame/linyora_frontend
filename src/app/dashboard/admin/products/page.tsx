// frontend/src/components/dashboards/ManageProductsPage.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  MoreHorizontal,
  Trash2,
  Eye,
  Edit,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  BarChart3,
  Sparkles,
  Calendar
} from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  brand: string;
  merchantName: string;
  status: 'active' | 'draft' | 'archived';
  variantCount: number;
  price: number;
  createdAt: string;
  updatedAt?: string;
  category?: string;
  inventory?: number;
  salesCount?: number;
  rating?: number;
}

interface ProductStats {
  total: number;
  active: number;
  draft: number;
  archived: number;
  lowStock: number;
  outOfStock: number;
}

export default function ManageProductsPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    draft: 0,
    archived: 0,
    lowStock: 0,
    outOfStock: 0
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get<Product[]>('/admin/products');
      setProducts(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
      toast.error(t('ManageProducts.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productsData: Product[]) => {
    const newStats: ProductStats = {
      total: productsData.length,
      active: productsData.filter(p => p.status === 'active').length,
      draft: productsData.filter(p => p.status === 'draft').length,
      archived: productsData.filter(p => p.status === 'archived').length,
      lowStock: productsData.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= 10).length,
      outOfStock: productsData.filter(p => (p.inventory || 0) === 0).length
    };
    setStats(newStats);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStatusUpdate = async (product: Product, newStatus: 'active' | 'draft' | 'archived') => {
    try {
      const promise = api.put(`/admin/products/${product.id}`, { status: newStatus });
      
      toast.promise(promise, {
        loading: t('ManageProducts.toast.updatingStatus'),
        success: () => {
          fetchProducts();
          return t('ManageProducts.toast.updateSuccess', {
            action: t(`ManageProducts.statusActions.${newStatus}`)
          });
        },
        error: t('ManageProducts.toast.updateError'),
      });
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const promise = api.delete(`/admin/products/${productToDelete.id}`);
      
      toast.promise(promise, {
        loading: t('ManageProducts.toast.deleting'),
        success: () => {
          fetchProducts();
          setProductToDelete(null);
          return t('ManageProducts.toast.deleteSuccess');
        },
        error: t('ManageProducts.toast.deleteError'),
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const uniqueCategories = useMemo(() => {
    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    return categories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.merchantName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' || product.status === selectedStatus;

      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchTerm, selectedStatus, selectedCategory]);

  const formatDate = (dateString: string): string => {
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number): string => {
    const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency: 'EGP' }).format(amount);
  };

  const exportProducts = () => {
    toast.info(t('ManageProducts.toast.exportPreparing'));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: CheckCircle, 
        text: t('ManageProducts.status.active') 
      },
      draft: { 
        color: 'bg-amber-100 text-amber-700 border-amber-200', 
        icon: Clock, 
        text: t('ManageProducts.status.draft') 
      },
      archived: { 
        color: 'bg-gray-100 text-gray-700 border-gray-200', 
        icon: XCircle, 
        text: t('ManageProducts.status.archived') 
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1 text-xs px-2 py-1`}>
        <IconComponent className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  const getInventoryBadge = (inventory: number) => {
    if (inventory === 0) {
      return <Badge variant="destructive" className="text-xs px-2 py-1 flex items-center gap-1">
        {t('ManageProducts.inventory.outOfStock')}
      </Badge>;
    } else if (inventory <= 10) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 text-xs px-2 py-1 flex items-center gap-1">
        {t('ManageProducts.inventory.low')}
      </Badge>;
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs px-2 py-1 flex items-center gap-1">
        {t('ManageProducts.inventory.inStock')}
      </Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-4 sm:p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      
      <AdminNav />
      
      <header className="mb-6 text-center relative">
        <div className="flex items-center justify-center gap-2 mb-3 sm:gap-3 sm:mb-4">
          <div className="p-2 bg-white rounded-2xl shadow-lg sm:p-3">
            <Package className="h-6 w-6 text-rose-500 sm:h-8 sm:w-8" />
          </div>
          <Sparkles className="h-4 w-4 text-rose-300 sm:h-6 sm:w-6" />
          <BarChart3 className="h-4 w-4 text-rose-300 sm:h-6 sm:w-6" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2 sm:text-2xl sm:mb-3">
          {t('ManageProducts.title')}
        </h1>
        <p className="text-rose-700 text-base max-w-2xl mx-auto sm:text-lg">
          {t('ManageProducts.subtitle')}
        </p>
        <div className="w-20 h-0.5 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-3 sm:w-24 sm:h-1 sm:mt-4"></div>
      </header>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 sm:gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-xl text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg font-bold text-rose-600 mb-1 sm:text-xl">{stats.total}</div>
              <div className="text-rose-700 text-xs sm:text-sm">{t('ManageProducts.stats.total')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-xl text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg font-bold text-green-600 mb-1 sm:text-xl">{stats.active}</div>
              <div className="text-green-700 text-xs sm:text-sm">{t('ManageProducts.stats.active')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-xl text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg font-bold text-amber-600 mb-1 sm:text-xl">{stats.draft}</div>
              <div className="text-amber-700 text-xs sm:text-sm">{t('ManageProducts.stats.draft')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-xl text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg font-bold text-gray-600 mb-1 sm:text-xl">{stats.archived}</div>
              <div className="text-gray-700 text-xs sm:text-sm">{t('ManageProducts.stats.archived')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-xl text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg font-bold text-red-600 mb-1 sm:text-xl">{stats.outOfStock}</div>
              <div className="text-red-700 text-xs sm:text-sm">{t('ManageProducts.stats.outOfStock')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-orange-200 shadow-lg rounded-xl text-center">
            <CardContent className="p-3 sm:p-4">
              <div className="text-lg font-bold text-orange-600 mb-1 sm:text-xl">{stats.lowStock}</div>
              <div className="text-orange-700 text-xs sm:text-sm">{t('ManageProducts.stats.lowStock')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl rounded-2xl">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                  <Input
                    placeholder={t('ManageProducts.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-9 border-rose-200 focus:border-rose-400 rounded-xl text-sm"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-full sm:w-36 border-rose-200 focus:border-rose-400 rounded-xl text-sm">
                      <Filter className="w-3 h-3 ml-1 text-rose-400" />
                      <SelectValue placeholder={t('ManageProducts.filters.status.all')} />
                    </SelectTrigger>
                    <SelectContent className="border-rose-200 rounded-xl">
                      <SelectItem value="all">{t('ManageProducts.filters.status.all')}</SelectItem>
                      <SelectItem value="active">{t('ManageProducts.filters.status.active')}</SelectItem>
                      <SelectItem value="draft">{t('ManageProducts.filters.status.draft')}</SelectItem>
                      <SelectItem value="archived">{t('ManageProducts.filters.status.archived')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-36 border-rose-200 focus:border-rose-400 rounded-xl text-sm">
                      <SelectValue placeholder={t('ManageProducts.filters.category.all')} />
                    </SelectTrigger>
                    <SelectContent className="border-rose-200 rounded-xl">
                      <SelectItem value="all">{t('ManageProducts.filters.category.all')}</SelectItem>
                      {uniqueCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Button 
                  variant="outline" 
                  onClick={exportProducts}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs sm:text-sm px-3 py-1.5"
                >
                  <Download className="w-3 h-3 ml-1" />
                  {t('ManageProducts.export')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={fetchProducts}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs sm:text-sm px-3 py-1.5"
                >
                  <RefreshCw className="w-3 h-3 ml-1" />
                  {t('common.refresh')}
                </Button>
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl text-xs sm:text-sm px-3 py-1.5">
                  <Plus className="w-3 h-3 ml-1" />
                  {t('ManageProducts.actions.addProduct')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg font-bold sm:text-xl">
                  <Package className="w-5 h-5" />
                  {t('ManageProducts.table.title')}
                </CardTitle>
                <CardDescription className="text-pink-100 text-xs sm:text-sm">
                  {t('ManageProducts.table.subtitle', { count: filteredProducts.length })}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs px-2 py-1">
                {t('ManageProducts.table.count', { count: filteredProducts.length })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.product')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.brand')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.merchant')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.price')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.inventory')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.status')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.date')}</TableHead>
                    <TableHead className="text-rose-800 font-bold text-left text-xs sm:text-sm px-4 py-3">{t('ManageProducts.table.headers.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500 mb-2"></div>
                          <p className="text-rose-700 font-medium text-sm">{t('ManageProducts.loading')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-medium text-rose-900 text-sm">{product.name}</div>
                              {product.category && (
                                <div className="text-rose-600 text-xs">{product.category}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="font-medium text-rose-800 text-sm">{product.brand}</div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 bg-rose-100 rounded-full flex items-center justify-center">
                              <span className="text-[10px] font-bold text-rose-600">{product.merchantName.charAt(0)}</span>
                            </div>
                            <span className="text-rose-700 text-sm">{product.merchantName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="font-bold text-rose-600 text-sm">
                            {formatCurrency(product.price)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {getInventoryBadge(product.inventory || 0)}
                            <div className="text-rose-600 text-xs">
                              {t('ManageProducts.inventory.units', { count: product.inventory || 0 })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          {getStatusBadge(product.status)}
                        </TableCell>
                        <TableCell className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-rose-600 text-xs">
                            <Calendar className="w-3 h-3 text-rose-400" />
                            {formatDate(product.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-3 text-left">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50 rounded-lg w-8 h-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-rose-200 rounded-lg w-44">
                              <DropdownMenuItem className="text-rose-700 text-sm">
                                <Eye className="w-3.5 h-3.5 ml-1.5" />
                                {t('ManageProducts.actions.view')}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setProductToEdit(product)}
                                className="text-rose-700 text-sm"
                              >
                                <Edit className="w-3.5 h-3.5 ml-1.5" />
                                {t('ManageProducts.actions.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-rose-200" />
                              {product.status !== 'active' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(product, 'active')}
                                  className="text-green-600 text-sm"
                                >
                                  <CheckCircle className="w-3.5 h-3.5 ml-1.5" />
                                  {t('ManageProducts.actions.activate')}
                                </DropdownMenuItem>
                              )}
                              {product.status !== 'draft' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(product, 'draft')}
                                  className="text-amber-600 text-sm"
                                >
                                  <Clock className="w-3.5 h-3.5 ml-1.5" />
                                  {t('ManageProducts.actions.toDraft')}
                                </DropdownMenuItem>
                              )}
                              {product.status !== 'archived' && (
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(product, 'archived')}
                                  className="text-gray-600 text-sm"
                                >
                                  <XCircle className="w-3.5 h-3.5 ml-1.5" />
                                  {t('ManageProducts.actions.archive')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator className="bg-rose-200" />
                              <DropdownMenuItem 
                                onClick={() => setProductToDelete(product)}
                                className="text-red-600 focus:text-red-600 text-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5 ml-1.5" />
                                {t('ManageProducts.actions.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="w-12 h-12 text-rose-300 mb-3" />
                          <h3 className="font-bold text-lg text-rose-800 mb-1">
                            {t('ManageProducts.table.noResults.title')}
                          </h3>
                          <p className="text-rose-600 px-4 text-sm">
                            {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                              ? t('ManageProducts.table.noResults.filtered')
                              : t('ManageProducts.table.noResults.empty')
                            }
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={!!productToEdit} onOpenChange={(open) => !open && setProductToEdit(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl shadow-xl max-w-md sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-800 text-lg">
              <Edit className="w-4 h-4" />
              {t('ManageProducts.dialog.edit.title')}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t('ManageProducts.dialog.edit.description', { name: productToEdit?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-rose-800 font-medium text-sm">{t('ManageProducts.fields.name')}</Label>
                <Input 
                  defaultValue={productToEdit?.name}
                  className="border-rose-200 focus:border-rose-400 rounded-lg text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-rose-800 font-medium text-sm">{t('ManageProducts.fields.brand')}</Label>
                <Input 
                  defaultValue={productToEdit?.brand}
                  className="border-rose-200 focus:border-rose-400 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-rose-800 font-medium text-sm">{t('ManageProducts.fields.status')}</Label>
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                {productToEdit && getStatusBadge(productToEdit.status)}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setProductToEdit(null)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 text-sm px-3 py-2"
            >
              {t('common.cancel')}
            </Button>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white text-sm px-3 py-2">
              {t('ManageProducts.dialog.edit.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl shadow-xl">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-lg font-bold text-rose-800">
              {t('ManageProducts.dialog.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-600 text-sm mt-2">
              {t('ManageProducts.dialog.delete.description', { name: productToDelete?.name })}
              <br />
              <span className="font-bold text-rose-700">{t('ManageProducts.dialog.delete.warning')}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <AlertDialogCancel className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 rounded-xl px-4 py-2 text-sm">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-xl px-4 py-2 font-medium text-sm"
            >
              {t('ManageProducts.dialog.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}