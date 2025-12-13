'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { 
  Zap, 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2,
  X,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import AdminNav from '@/components/dashboards/AdminNav';
import { useTranslation } from 'react-i18next';

// --- Types ---
interface Variant {
  id: number;
  color: string;
  price: number;
  stock_quantity: number;
  images: string[];
}

interface Product {
  id: number;
  name: string;
  merchant_id: number;
  merchantName: string;
  image_url?: string;
  variants: Variant[];
}

interface SelectedItem {
  uid: string;
  productId: number;
  variantId: number;
  merchantId: number;
  name: string;
  variantColor: string;
  image: string;
  originalPrice: number;
  discount: number;
  totalQty: number;
  maxStock: number;
}

interface FlashSale {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  product_count?: number;
}

export default function AdminFlashSalesPage() {
  const { t, i18n } = useTranslation();

  // --- State ---
  const [sales, setSales] = useState<FlashSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  // Data Selection State
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // --- Fetch Existing Sales ---
  const fetchSales = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/flash-sales'); 
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch sales", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [i18n.language]);

  // --- Fetch Available Products (Updated) ---
  // --- Fetch Available Products ---
  useEffect(() => {
    // الجلب يتم فقط عند فتح نافذة "إنشاء حملة جديدة"
    if (isCreateOpen) {
      
      const fetchAvailableProducts = async () => {
        setLoadingProducts(true);
        try {
          // ✅ طلب مباشر بدون بارامترات
          const res = await api.get('/admin/flash-sale/products-available');
          
          const productsData = Array.isArray(res.data) ? res.data : [];
          setAllProducts(productsData);
          
        } catch (error) {
          console.error("Failed to load products", error);
          toast.error(t('AdminFlashSales.messages.load_products_error'));
        } finally {
          setLoadingProducts(false);
        }
      };

      fetchAvailableProducts();
    }
  }, [isCreateOpen, t]); // تمت إزالة الاعتماد على التواريخ
  // --- Handlers ---

  const handleAddVariant = (product: Product, variant: Variant) => {
    const uid = `${product.id}-${variant.id}`;
    
    if (selectedItems.find(i => i.uid === uid)) {
      toast.info(t('AdminFlashSales.messages.item_already_selected'));
      return;
    }

    setSelectedItems(prev => [
      ...prev, 
      { 
        uid,
        productId: product.id,
        variantId: variant.id,
        merchantId: product.merchant_id,
        name: product.name,
        variantColor: variant.color || 'Default',
        image: variant.images?.[0] || product.image_url || '/placeholder.png',
        originalPrice: Number(variant.price),
        discount: 20, 
        totalQty: 5,  
        maxStock: variant.stock_quantity 
      }
    ]);
  };

  const handleRemoveItem = (uid: string) => {
    setSelectedItems(prev => prev.filter(item => item.uid !== uid));
  };

  const updateItemSetting = (uid: string, field: 'discount' | 'totalQty', value: string) => {
    const numValue = parseFloat(value);
    
    if (field === 'totalQty') {
      const item = selectedItems.find(i => i.uid === uid);
      if (item && numValue > item.maxStock) {
        toast.warning(t('AdminFlashSales.messages.stock_limit_warning', { stock: item.maxStock }));
        return;
      }
    }

    setSelectedItems(prev => prev.map(item => 
      item.uid === uid ? { ...item, [field]: isNaN(numValue) ? 0 : numValue } : item
    ));
  };

  const calculateFlashPrice = (price: number, discount: number) => {
    return (price - (price * (discount / 100))).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!title || !startTime || !endTime) {
      toast.error(t('AdminFlashSales.messages.fill_fields_error'));
      return;
    }
    if (selectedItems.length === 0) {
      toast.error(t('AdminFlashSales.messages.select_product_error'));
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      toast.error(t('AdminFlashSales.messages.date_error'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        items: selectedItems
      };

      await api.post('/admin/flash-sale', payload);
      
      toast.success(t('AdminFlashSales.messages.success_create'));
      setIsCreateOpen(false);
      resetForm();
      fetchSales();
    } catch (error) {
      console.error(error);
      toast.error(t('AdminFlashSales.messages.error_create'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = async (id: number) => {
    if(!confirm(t('AdminFlashSales.messages.confirm_delete'))) return;
    try {
      await api.delete(`/admin/flash-sale/${id}`);
      setSales(prev => prev.filter(s => s.id !== id));
      toast.success(t('AdminFlashSales.messages.success_delete'));
    } catch(err) {
      toast.error(t('AdminFlashSales.messages.error_delete'));
    }
  };

  const resetForm = () => {
    setTitle('');
    setStartTime('');
    setEndTime('');
    setSelectedItems([]);
  };

  // --- UI Helpers ---
  const getStatusBadge = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now > endDate) return <Badge variant="secondary" className="bg-gray-100 text-gray-600">{t('AdminFlashSales.status_expired')}</Badge>;
    if (now >= startDate && now <= endDate) return <Badge className="bg-amber-100 text-amber-800 border border-amber-200">{t('AdminFlashSales.status_active')}</Badge>;
    return <Badge variant="outline" className="text-blue-700 border-blue-300">{t('AdminFlashSales.status_scheduled')}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 space-y-8">
      <AdminNav />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-600" />
            {t('AdminFlashSales.title')}
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">{t('AdminFlashSales.subtitle')}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
              <Plus className="w-4 h-4 mr-2" /> {t('AdminFlashSales.new_campaign')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl lg:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">{t('AdminFlashSales.create_new_campaign')}</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">{t('AdminFlashSales.campaign_title')}</Label>
                  <Input 
                    placeholder={t('AdminFlashSales.placeholder_title')}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">{t('AdminFlashSales.start_date')}</Label>
                  <Input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">{t('AdminFlashSales.end_date')}</Label>
                  <Input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                {/* Available Products */}
                <div className="border rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {t('AdminFlashSales.available_products')} <span className="text-gray-500">({allProducts.length})</span>
                    </h3>
                  </div>
                  <ScrollArea className="flex-1 p-0">
                    {loadingProducts ? (
                      <div className="p-6 text-center text-gray-500">{t('AdminFlashSales.loading_products')}</div>
                    ) : allProducts.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">{t('AdminFlashSales.no_products')}</div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {allProducts.map(product => (
                          <div key={product.id} className="p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-sm text-gray-900">{product.name}</p>
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Store className="w-3 h-3" /> {product.merchantName}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {product.variants?.map(variant => {
                                const isAdded = selectedItems.some(i => i.uid === `${product.id}-${variant.id}`);
                                return (
                                  <button
                                    key={variant.id}
                                    onClick={() => handleAddVariant(product, variant)}
                                    disabled={isAdded}
                                    className={`text-xs px-2 py-1 rounded-md border font-medium transition-colors flex items-center gap-1 ${
                                      isAdded 
                                        ? 'bg-green-100 text-green-800 border-green-300 cursor-not-allowed' 
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-amber-50 hover:border-amber-300'
                                    }`}
                                  >
                                    {isAdded ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Plus className="w-3 h-3" />}
                                    <span>{variant.color || 'Std'}</span>
                                    <span className="text-gray-500 ml-2">({variant.price} SAR | {variant.stock_quantity} {t('AdminFlashSales.in_stock')})</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Selected Items */}
                <div className="border rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-gray-800">
                      {t('AdminFlashSales.selected_items')} <span className="text-gray-500">({selectedItems.length})</span>
                    </h3>
                    <span className="text-xs text-amber-600 font-medium">{t('AdminFlashSales.configure_discounts')}</span>
                  </div>
                  <ScrollArea className="flex-1">
                    {selectedItems.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <Plus className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-sm">{t('AdminFlashSales.select_variants_instruction')}</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 sticky top-0 z-10">
                            <TableHead className="w-[120px] text-xs font-semibold text-gray-700">{t('AdminFlashSales.item')}</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700">{t('AdminFlashSales.price')}</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700">{t('AdminFlashSales.discount_percent')}</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700">{t('AdminFlashSales.flash_price')}</TableHead>
                            <TableHead className="text-xs font-semibold text-gray-700">{t('AdminFlashSales.sale_qty')}</TableHead>
                            <TableHead className="w-8"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedItems.map((item) => (
                            <TableRow key={item.uid} className="hover:bg-gray-50">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 relative rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                                    <Image src={item.image} alt="" fill className="object-cover" />
                                  </div>
                                  <div className="flex flex-col w-[90px]">
                                    <span className="text-xs font-medium text-gray-900 truncate">{item.name}</span>
                                    <span className="text-[10px] text-gray-500">{item.variantColor}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs text-gray-700">{item.originalPrice.toFixed(2)}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <Input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    className="h-7 w-14 px-1 text-center text-xs border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-200" 
                                    value={item.discount}
                                    onChange={e => updateItemSetting(item.uid, 'discount', e.target.value)}
                                  />
                                  <span className="text-xs ml-1 text-gray-600">%</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs font-bold text-amber-700">
                                {calculateFlashPrice(item.originalPrice, item.discount)}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Input 
                                    type="number" 
                                    min="1"
                                    max={item.maxStock}
                                    className="h-7 w-16 px-1 text-center text-xs border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-200" 
                                    value={item.totalQty}
                                    onChange={e => updateItemSetting(item.uid, 'totalQty', e.target.value)}
                                  />
                                  <span className="text-[10px] text-gray-500">{t('AdminFlashSales.max')}: {item.maxStock}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50" onClick={() => handleRemoveItem(item.uid)}>
                                  <X className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="h-10">
                {t('AdminFlashSales.cancel')}
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || selectedItems.length === 0}
                className="h-10 bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]"
              >
                {isSubmitting ? t('AdminFlashSales.processing') : t('AdminFlashSales.create_action')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales History */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900">{t('AdminFlashSales.campaign_history')}</CardTitle>
          <CardDescription className="text-gray-600">{t('AdminFlashSales.history_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : (!sales || sales.length === 0) ? (
            <div className="text-center py-10 text-gray-500">{t('AdminFlashSales.no_campaigns')}</div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-gray-700 font-medium">{t('AdminFlashSales.table_campaign')}</TableHead>
                    <TableHead className="text-gray-700 font-medium">{t('AdminFlashSales.table_timeframe')}</TableHead>
                    <TableHead className="text-gray-700 font-medium">{t('AdminFlashSales.table_status')}</TableHead>
                    <TableHead className="text-gray-700 font-medium">{t('AdminFlashSales.table_products')}</TableHead>
                    <TableHead className="text-right text-gray-700 font-medium">{t('AdminFlashSales.table_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-medium text-gray-900">{sale.title}</TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1 text-xs">
                            <Calendar className="w-3 h-3" /> {new Date(sale.start_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" /> {new Date(sale.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(sale.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(sale.start_time, sale.end_time)}</TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-900">{sale.product_count || 0}</span>
                        <span className="text-xs text-gray-500 ml-1">{t('AdminFlashSales.variants')}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:bg-red-50 h-8 w-8"
                          onClick={() => handleDeleteSale(sale.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}