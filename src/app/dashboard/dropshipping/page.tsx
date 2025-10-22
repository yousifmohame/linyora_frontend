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
            <Card className="w-full max-w-2xl text-center shadow-2xl rounded-3xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="py-12">
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 flex items-center justify-center mb-4">
                        <Lock className="text-rose-500 h-10 w-10" />
                    </div>
                    <CardTitle className="text-3xl font-bold">{t('DropshippingPage.gate.title')}</CardTitle>
                    <CardDescription className="text-pink-900 text-lg">{t('DropshippingPage.gate.description')}</CardDescription>
                </CardHeader>
                <CardFooter className="p-8">
                    <Button size="lg" className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-lg py-3 rounded-2xl" asChild>
                        <Link href="/dashboard/my-subscription">
                            <Sparkles className="ml-2 h-5 w-5" />{t('DropshippingPage.gate.action')}
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
            const response = await api.get('/dropshipping/supplier-products'); // Updated endpoint based on our new controller
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
            // Note: You need to decide how to get `salePrice` and `compareAtPrice`.
            // Here, we'll just use the cost_price as the salePrice for the example.
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
            <div className="min-h-screen p-4 sm:p-6 lg:p-8"><Navigation /><div className="mt-8 space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-4 w-1/2" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}</div></div></div>
        );
    }

    if (!user?.subscription?.permissions.hasDropshippingAccess) {
        return (
            <div className="min-h-screen"><Navigation /><SubscriptionGate /></div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-4 sm:p-6 lg:p-8">
            <Navigation />
            
            <header className="mb-8 text-center relative">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">{t('DropshippingPage.title')}</h1>
                <p className="text-rose-700 text-lg max-w-2xl mx-auto">{t('DropshippingPage.subtitle')}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card className="bg-white/80"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-rose-600">{stats.total}</div><div className="text-rose-700 text-sm">{t('DropshippingPage.stats.totalProducts')}</div></CardContent></Card>
                <Card className="bg-white/80"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-purple-600">{stats.featured}</div><div className="text-purple-700 text-sm">{t('DropshippingPage.stats.featured')}</div></CardContent></Card>
                <Card className="bg-white/80"><CardContent className="p-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.suppliers}</div><div className="text-blue-700 text-sm">{t('DropshippingPage.stats.suppliers')}</div></CardContent></Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl mb-8">
                <CardContent className="p-4 lg:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" /><Input placeholder={t('DropshippingPage.search.placeholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pr-10 border-rose-200 rounded-xl"/></div>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full lg:w-auto rounded-xl bg-rose-50 border-rose-200 text-sm py-2 px-3"><option value="all">{t('DropshippingPage.filters.allCategories')}</option>{categories.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <Button variant="outline" onClick={fetchProducts} disabled={refreshing} className="border-rose-200 text-rose-700 rounded-xl"><RefreshCw className={`w-4 h-4 ml-2 ${refreshing ? 'animate-spin' : ''}`} />{t('DropshippingPage.actions.refresh')}</Button>
                    </div>
                </CardContent>
            </Card>
            
            {loadingProducts ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-80 w-full rounded-2xl" />)}</div>
            ) : (
                <>
                    <div className="text-sm text-rose-700 mb-4">{t('DropshippingPage.results.product', { count: filteredProducts.length })}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map(product => {
                            // ✅ FIX 2: Safely access the first variant's data
                            const firstVariant = product.variants?.[0];
                            const imageUrl = firstVariant?.images?.[0] || '/placeholder.png';
                            const price = firstVariant?.cost_price;

                            return (
                                <Card key={product.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl rounded-2xl bg-white/80 group">
                                    <CardHeader className="p-0 relative">
                                        <div className="relative h-48 w-full">
                                            <Image src={imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" unoptimized/>
                                            {product.is_featured && <Badge className="absolute top-2 left-2"><Star className="w-3 h-3 ml-1" />{t('DropshippingPage.badge.featured')}</Badge>}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <Badge variant="outline">{product.brand}</Badge>
                                            <span className="text-xs text-rose-600 truncate">{product.categories}</span>
                                        </div>
                                        <CardTitle className="text-md mt-1 line-clamp-2 flex-grow text-rose-900">{product.name}</CardTitle>
                                        {product.supplier_name && <p className="text-xs text-rose-600 mt-1">{t('DropshippingPage.product.supplier')}: {product.supplier_name}</p>}
                                        <div className="flex items-center justify-between mt-3">
                                            {/* ✅ FIX 3: Display the price only if it exists, and use it */}
                                            {price !== undefined ? (
                                                <p className="font-bold text-lg text-rose-600">{price.toFixed(2)} {t('DropshippingPage.currency')}</p>
                                            ) : (
                                                <p className="text-sm text-gray-500">{t('DropshippingPage.noPrice')}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2">
                                        <Button 
                                            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white" 
                                            onClick={() => handleImport(product.id, price || 0)} 
                                            disabled={importingId === product.id || price === undefined}>
                                            <Rocket className="ml-2 h-4 w-4" />
                                            {importingId === product.id ? t('DropshippingPage.actions.importing') : t('DropshippingPage.actions.addToStore')}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                    {filteredProducts.length === 0 && (
                        <Card className="text-center py-12"><CardContent><h3 className="text-2xl font-bold text-rose-800 mb-2">{t('DropshippingPage.empty.title')}</h3><p className="text-rose-600 mb-6">{searchTerm || selectedCategory !== 'all' ? t('DropshippingPage.empty.noResults') : t('DropshippingPage.empty.noProducts')}</p></CardContent></Card>
                    )}
                </>
            )}
        </div>
    );
}