'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { 
  Zap, 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
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

// --- Types ---
interface Variant {
  id: number;
  color: string;
  price: number;
  stock_quantity: number; // المخزون المتوفر
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
  totalQty: number; // الكمية التي يحددها الأدمن للعرض
  maxStock: number; // المخزون الأصلي للمرجع
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
  }, []);

  // --- Fetch All Products ---
  useEffect(() => {
    if (isCreateOpen) {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const res = await api.get('/products?limit=100&include_variants=true'); 
                const productsData = Array.isArray(res.data) ? res.data : (res.data.products || []);
                setAllProducts(productsData);
            } catch (error) {
                console.error("Failed to load products", error);
                toast.error("Could not load products list");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }
  }, [isCreateOpen]);

  // --- Handlers ---

  const handleAddVariant = (product: Product, variant: Variant) => {
    const uid = `${product.id}-${variant.id}`;
    
    if (selectedItems.find(i => i.uid === uid)) {
        toast.info("This item is already selected.");
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
        discount: 20, // Default discount %
        totalQty: 5,  // Default quantity for flash sale
        maxStock: variant.stock_quantity // Store max stock for validation
      }
    ]);
  };

  const handleRemoveItem = (uid: string) => {
    setSelectedItems(prev => prev.filter(item => item.uid !== uid));
  };

  const updateItemSetting = (uid: string, field: 'discount' | 'totalQty', value: string) => {
    const numValue = parseFloat(value);
    
    // Check stock limit if updating quantity
    if (field === 'totalQty') {
       const item = selectedItems.find(i => i.uid === uid);
       if (item && numValue > item.maxStock) {
           toast.warning(`Cannot exceed available stock (${item.maxStock})`);
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
      toast.error("Please fill in the Campaign Title and Dates.");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      toast.error("End time must be after start time.");
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
      
      toast.success("Flash Sale Created & Merchants Invited!");
      setIsCreateOpen(false);
      resetForm();
      fetchSales();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create flash sale.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSale = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    try {
        await api.delete(`/admin/flash-sale/${id}`);
        setSales(prev => prev.filter(s => s.id !== id));
        toast.success("Campaign deleted");
    } catch(err) {
        toast.error("Failed to delete campaign");
    }
  }

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

    if (now > endDate) return <Badge variant="secondary" className="bg-gray-200 text-gray-600">Expired</Badge>;
    if (now >= startDate && now <= endDate) return <Badge className="bg-rose-500 animate-pulse">Active</Badge>;
    return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Scheduled</Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
            Flash Campaigns
          </h1>
          <p className="text-gray-500 mt-1">Create campaigns, select products, and invite merchants.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl lg:max-w-7xl max-h-[90vh] overflow-y-auto flex flex-col">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 space-y-6 py-4">
              {/* 1. Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border">
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input 
                    placeholder="e.g. Super Friday Sale" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                {/* 2. Available Products List (Left) */}
                <div className="border rounded-xl flex flex-col overflow-hidden">
                    <div className="bg-gray-100 p-3 font-semibold text-sm border-b">
                        Available Products ({allProducts.length})
                    </div>
                    <ScrollArea className="flex-1 p-0">
                        {loadingProducts ? (
                            <div className="p-8 text-center text-gray-500">Loading products...</div>
                        ) : allProducts.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">No products found.</div>
                        ) : (
                            <div className="divide-y">
                                {allProducts.map(product => (
                                    <div key={product.id} className="p-3 hover:bg-gray-50">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Store className="w-3 h-3" /> {product.merchantName}
                                                </p>
                                            </div>
                                        </div>
                                        {/* Variants Grid */}
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants?.map(variant => {
                                                const isAdded = selectedItems.some(i => i.uid === `${product.id}-${variant.id}`);
                                                return (
                                                    <button
                                                        key={variant.id}
                                                        onClick={() => handleAddVariant(product, variant)}
                                                        disabled={isAdded}
                                                        className={`flex items-center gap-2 text-xs border rounded-lg px-2 py-1.5 transition-all ${
                                                            isAdded 
                                                            ? 'bg-green-50 border-green-200 text-green-700 opacity-70 cursor-not-allowed' 
                                                            : 'bg-white hover:bg-rose-50 hover:border-rose-200'
                                                        }`}
                                                    >
                                                        {isAdded ? <CheckCircle2 className="w-3 h-3"/> : <Plus className="w-3 h-3"/>}
                                                        <span className="font-medium">{variant.color || 'Std'}</span>
                                                        <span className="text-gray-500 border-l pl-2 ml-1">
                                                            {variant.price} SAR | <span className="text-blue-600 font-bold">{variant.stock_quantity} in stock</span>
                                                        </span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* 3. Selected Items Configuration (Right) - ✅ الجزء المعدل للكميات */}
                <div className="border rounded-xl flex flex-col overflow-hidden">
                    <div className="bg-gray-100 p-3 font-semibold text-sm border-b flex justify-between items-center">
                        <span>Selected Items ({selectedItems.length})</span>
                        <span className="text-xs text-rose-600">Configure Discounts & Quantities</span>
                    </div>
                    <ScrollArea className="flex-1">
                        {selectedItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                <Plus className="w-8 h-8 mb-2 opacity-50" />
                                <p>Select variants from the left list.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-white sticky top-0 z-10 shadow-sm">
                                        <TableHead className="w-[150px]">Item</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Discount %</TableHead>
                                        <TableHead>Flash $</TableHead>
                                        <TableHead>Sale Qty</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedItems.map((item) => (
                                        <TableRow key={item.uid}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 relative rounded bg-gray-100 flex-shrink-0">
                                                        <Image src={item.image} alt="" fill className="object-cover rounded"/>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium truncate w-[80px]">{item.name}</span>
                                                        <span className="text-[10px] text-gray-500">{item.variantColor}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">{item.originalPrice}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Input 
                                                        type="number" 
                                                        className="h-7 w-12 px-1 text-center text-xs" 
                                                        value={item.discount}
                                                        onChange={e => updateItemSetting(item.uid, 'discount', e.target.value)}
                                                    />
                                                    <span className="text-xs ml-1">%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-rose-600">
                                                {calculateFlashPrice(item.originalPrice, item.discount)}
                                            </TableCell>
                                            {/* ✅ هنا خانة الكمية أصبحت أوضح */}
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <Input 
                                                        type="number" 
                                                        className="h-7 w-16 px-1 text-center text-xs border-blue-200 focus:border-blue-500" 
                                                        value={item.totalQty}
                                                        onChange={e => updateItemSetting(item.uid, 'totalQty', e.target.value)}
                                                    />
                                                    <span className="text-[10px] text-gray-400">Max: {item.maxStock}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => handleRemoveItem(item.uid)}>
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

            <DialogFooter className="gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || selectedItems.length === 0}
                    className="bg-rose-600 hover:bg-rose-700 text-white min-w-[150px]"
                >
                    {isSubmitting ? 'Processing...' : 'Create Campaign'}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales History List */}
      <Card>
        <CardHeader>
            <CardTitle>Campaign History</CardTitle>
            <CardDescription>View status of active and past flash sales.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
                </div>
            ) : (!sales || sales.length === 0) ? (
                <div className="text-center py-10 text-gray-500">No campaigns created yet.</div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Campaign</TableHead>
                            <TableHead>Timeframe</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sales.map((sale) => (
                            <TableRow key={sale.id}>
                                <TableCell className="font-medium">{sale.title}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm text-gray-600">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(sale.start_time).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3"/> {new Date(sale.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(sale.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(sale.start_time, sale.end_time)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold">{sale.product_count || 0}</span>
                                        <span className="text-xs text-gray-500">variants</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-red-500 hover:bg-red-50"
                                        onClick={() => handleDeleteSale(sale.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}