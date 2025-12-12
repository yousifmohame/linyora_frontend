'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Rocket, Sparkles, Star, Search, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Navigation from '@/components/dashboards/Navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ✅ FIX 1: Updated the interface to match the backend's data structure
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
    supplier_name?: string;
    is_featured?: boolean;
    categories: string; // Comes as a comma-separated string
    variants: SupplierVariant[];
}

const SubscriptionGate = () => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl text-center shadow-lg rounded-2xl bg-white/90 backdrop-blur-sm border border-gray-200/50">
                <CardHeader className="py-8">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-rose-100 to-purple-100 flex items-center justify-center mb-3">
                        <Lock className="text-rose-600 h-8 w-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{t('DropshippingPage.gate.title')}</CardTitle>
                    <CardDescription className="text-gray-600 text-base mt-1">
                        {t('DropshippingPage.gate.description')}
                    </CardDescription>
                </CardHeader>
                <CardFooter className="p-6">
                    <Button 
                        size="lg" 
                        className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold py-3 rounded-xl text-base"
                        asChild
                    >
                        <Link href="/dashboard/my-subscription">
                            <Sparkles className="ml-2 h-4 w-4" />
                            {t('DropshippingPage.gate.action')}
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default function DropshippingPage() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    
    const [products, setProducts] = useState<SupplierProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<SupplierProduct[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [importingId, setImportingId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchProducts = useCallback(async () => {
        setRefreshing(true);
        setLoadingProducts(true);
        try {
            const response = await api.get('/dropshipping/supplier-products');
            setProducts(response.data);
            setFilteredProducts(response.data);
        } catch (error) {
            toast.error(t('DropshippingPage.errors.fetchFailed'));
        } finally {
            setLoadingProducts(false);
            setRefreshing(false);
        }
    }, [t]);

    useEffect(() => {
        if (!authLoading && user?.subscription?.permissions.hasDropshippingAccess) {
            fetchProducts();
        } else if (!authLoading) {
            setLoadingProducts(false);
        }
    }, [user, authLoading, fetchProducts]);

    useEffect(() => {
        let filtered = products.filter(product =>
            (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (product.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product => (product.categories || '').includes(selectedCategory));
        }
        setFilteredProducts(filtered);
    }, [searchTerm, selectedCategory, products]);

    const handleImport = async (supplierProductId: number, salePrice: number) => {
        setImportingId(supplierProductId);
        try {
            await api.post('/dropshipping/import-product', { supplierProductId, salePrice });
            toast.success(t('DropshippingPage.success.import'));
        } catch (_error) {
            toast.error(t('DropshippingPage.errors.importFailed'));
        } finally {
            setImportingId(null);
        }
    };

    const categories = ['all', ...Array.from(new Set(products.flatMap(p => p.categories ? p.categories.split(', ') : [])))];
    const stats = {
        total: products.length,
        featured: products.filter(p => p.is_featured).length,
        suppliers: new Set(products.map(p => p.supplier_name)).size
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
                <Navigation />
                <div className="max-w-7xl mx-auto mt-6 space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} className="h-64 w-full rounded-xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!user?.subscription?.permissions.hasDropshippingAccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
                <Navigation />
                <div className="max-w-7xl mx-auto mt-8">
                    <SubscriptionGate />
                </div>
            </div>
        );
    }

    return (
        // ✅ Unified gradient background + overflow-hidden
        <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
            <Navigation />
            
            <header className="mb-6 text-center px-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    {t('DropshippingPage.title')}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto">
                    {t('DropshippingPage.subtitle')}
                </p>
            </header>

            {/* ✅ Responsive Stats Grid (2 cols on mobile) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                <StatCard value={stats.total} label={t('DropshippingPage.stats.totalProducts')} color="rose" />
                <StatCard value={stats.featured} label={t('DropshippingPage.stats.featured')} color="purple" />
                <StatCard value={stats.suppliers} label={t('DropshippingPage.stats.suppliers')} color="blue" />
            </div>

            {/* ✅ Responsive Controls */}
            <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-sm rounded-xl mb-6">
                <CardContent className="p-3 sm:p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
                            <Input
                                placeholder={t('DropshippingPage.search.placeholder')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-3 rtl:pl-3 rtl:pr-10 border border-gray-200 focus:border-purple-500 rounded-lg h-10 text-sm"
                            />
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full sm:w-48 h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm">
                                <SelectValue placeholder={t('DropshippingPage.filters.allCategories')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('DropshippingPage.filters.allCategories')}</SelectItem>
                                {categories.filter(c => c !== 'all').map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button 
                            variant="outline" 
                            onClick={fetchProducts} 
                            disabled={refreshing}
                            className="w-full sm:w-auto h-10 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm"
                        >
                            <RefreshCw className={`w-4 h-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
                            {t('DropshippingPage.actions.refresh')}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            
            {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-xl" />
                    ))}
                </div>
            ) : (
                <>
                    <div className="text-sm text-gray-600 mb-4">
                        {t('DropshippingPage.results.product', { count: filteredProducts.length })}
                    </div>
                    {/* ✅ Responsive Grid - No Horizontal Scroll */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map(product => {
                            const firstVariant = product.variants?.[0];
                            const imageUrl = firstVariant?.images?.[0] || '/placeholder.png';
                            const price = firstVariant?.cost_price;

                            return (
                                <Card 
                                    key={product.id} 
                                    className="flex flex-col overflow-hidden shadow-sm hover:shadow-md rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200/50 transition-shadow"
                                >
                                    <CardHeader className="p-0 relative">
                                        <div className="relative h-40 w-full">
                                            <Image 
                                                src={imageUrl} 
                                                alt={product.name} 
                                                fill 
                                                className="object-cover" 
                                                unoptimized
                                            />
                                            {product.is_featured && (
                                                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold">
                                                    <Star className="w-2.5 h-2.5 mr-0.5" />
                                                    {t('DropshippingPage.badge.featured')}
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-3 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline" className="bg-rose-100 text-rose-700 border-rose-200 text-[10px] px-1.5 py-0.5">
                                                {product.brand}
                                            </Badge>
                                            <span className="text-[10px] text-gray-500 truncate max-w-[100px]">
                                                {product.categories}
                                            </span>
                                        </div>
                                        <CardTitle className="text-sm font-bold mt-1 line-clamp-2 text-gray-900 flex-grow">
                                            {product.name}
                                        </CardTitle>
                                        {product.supplier_name && (
                                            <p className="text-[10px] text-gray-600 mt-1">
                                                {t('DropshippingPage.product.supplier')}: {product.supplier_name}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            {price !== undefined ? (
                                                <p className="font-bold text-sm text-rose-600">
                                                    {price.toFixed(2)} {t('DropshippingPage.currency')}
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-gray-500">
                                                    {t('DropshippingPage.noPrice')}
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        <Button 
                                            className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-lg text-sm h-9"
                                            onClick={() => handleImport(product.id, price || 0)} 
                                            disabled={importingId === product.id || price === undefined}
                                        >
                                            <Rocket className="ml-1.5 w-3.5 h-3.5" />
                                            {importingId === product.id 
                                                ? t('DropshippingPage.actions.importing') 
                                                : t('DropshippingPage.actions.addToStore')
                                            }
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                    {filteredProducts.length === 0 && (
                        <Card className="text-center py-8 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl mt-6">
                            <CardContent>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    {t('DropshippingPage.empty.title')}
                                </h3>
                                <p className="text-gray-600">
                                    {searchTerm || selectedCategory !== 'all' 
                                        ? t('DropshippingPage.empty.noResults') 
                                        : t('DropshippingPage.empty.noProducts')
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}

// ✅ Reusable Stat Card
const StatCard = ({ value, label, color }: { value: number; label: string; color: 'rose' | 'purple' | 'blue' }) => {
  const colorMap = {
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    purple: 'text-purple-600 bg-purple-50 border-purple-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border ${colorMap[color]} shadow-sm rounded-lg text-center`}>
      <CardContent className="p-3">
        <div className="text-lg font-bold">{value}</div>
        <div className="text-gray-600 text-[10px] mt-1">{label}</div>
      </CardContent>
    </Card>
  );
};