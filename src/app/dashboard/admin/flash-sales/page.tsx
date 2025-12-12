'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { 
  Zap, 
  Calendar, 
  Plus, 
  Search, 
  Trash2, 
  Save, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
interface Product {
  id: number;
  name: string;
  price: number; // Base price
  image_url: string;
}

interface SelectedProduct extends Product {
  discount_percentage: number;
  total_quantity: number;
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
  
  // Product Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  // --- Fetch Data ---
  const fetchSales = async () => {
  try {
    setLoading(true);
    const res = await api.get('/admin/flash-sales'); 

    // Ensure res.data is an array
    if (Array.isArray(res.data)) {
      setSales(res.data);
    } else {
      console.warn("Unexpected API response format:", res.data);
      setSales([]); // fallback to empty array
    }
  } catch (error) {
    console.error("Failed to fetch sales", error);
    setSales([]); // critical: never leave sales as undefined or null
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchSales();
  }, []);

  // --- Product Search ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await api.get(`/products/search?term=${searchQuery}`);
        setSearchResults(res.data);
      } catch (error) {
        console.error(error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- Handlers ---

  const handleAddProduct = (product: Product) => {
    // Prevent duplicates
    if (selectedProducts.find(p => p.id === product.id)) return;

    setSelectedProducts(prev => [
      ...prev, 
      { ...product, discount_percentage: 20, total_quantity: 10 } // Defaults
    ]);
    setSearchQuery(''); // Clear search to show added
  };

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const updateProductSetting = (id: number, field: 'discount_percentage' | 'total_quantity', value: string) => {
    const numValue = parseFloat(value);
    setSelectedProducts(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: isNaN(numValue) ? 0 : numValue } : p
    ));
  };

  const calculateDiscountedPrice = (price: number, discount: number) => {
    return (price - (price * (discount / 100))).toFixed(2);
  };

  const handleSubmit = async () => {
    if (!title || !startTime || !endTime) {
      toast.error("Please fill in all basic details.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product.");
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
        start_time: new Date(startTime).toISOString(), // Convert to MySQL format in backend if needed
        end_time: new Date(endTime).toISOString(),
        products: selectedProducts.map(p => ({
          productId: p.id,
          discount: p.discount_percentage,
          totalQty: p.total_quantity
        }))
      };

      await api.post('/admin/flash-sale', payload);
      
      toast.success("Flash Sale Created Successfully!");
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

  const resetForm = () => {
    setTitle('');
    setStartTime('');
    setEndTime('');
    setSelectedProducts([]);
    setSearchQuery('');
  };

  const handleDeleteSale = async (id: number) => {
    if(!confirm("Are you sure you want to delete this sale?")) return;
    try {
        await api.delete(`/admin/flash-sale/${id}`);
        setSales(prev => prev.filter(s => s.id !== id));
        toast.success("Sale deleted");
    } catch(err) {
        toast.error("Failed to delete");
    }
  }

  // --- Render Helpers ---
  const getStatusBadge = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (now > endDate) return <Badge variant="secondary" className="bg-gray-200 text-gray-600">Expired</Badge>;
    if (now >= startDate && now <= endDate) return <Badge className="bg-rose-500 animate-pulse">Active Now</Badge>;
    return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Scheduled</Badge>;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-8 h-8 text-rose-500 fill-rose-500" />
            Manage Flash Sales
          </h1>
          <p className="text-gray-500 mt-1">Schedule time-limited offers and huge discounts.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gray-900 text-white hover:bg-gray-800 shadow-lg">
              <Plus className="w-4 h-4 mr-2" /> Create Flash Sale
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Flash Sale</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* 1. Basic Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border">
                <div className="space-y-2">
                  <Label>Campaign Title</Label>
                  <Input 
                    placeholder="e.g. Black Friday Deals" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input 
                    type="datetime-local" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              {/* 2. Product Search */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                    <Search className="w-4 h-4" /> Add Products
                </Label>
                <div className="relative">
                    <Input 
                        placeholder="Search products by name..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    
                    {/* Search Results Dropdown */}
                    {searchResults.length > 0 && searchQuery.length >= 2 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                            {searchResults.map(prod => (
                                <div 
                                    key={prod.id}
                                    onClick={() => handleAddProduct(prod)}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                                >
                                    <div className="w-10 h-10 relative rounded overflow-hidden bg-gray-100">
                                        <Image src={prod.image_url || '/placeholder.png'} alt={prod.name} fill className="object-cover"/>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{prod.name}</p>
                                        <p className="text-xs text-gray-500">{prod.price} SAR</p>
                                    </div>
                                    <Plus className="w-4 h-4 text-green-600" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              {/* 3. Selected Products Table */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-100 p-3 font-semibold text-sm border-b flex justify-between">
                    <span>Selected Products ({selectedProducts.length})</span>
                    <span className="text-xs text-gray-500 font-normal">Set discount and quantity allocation</span>
                </div>
                {selectedProducts.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm bg-gray-50/50">
                        No products added yet. Search above to add.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Product</TableHead>
                                <TableHead>Base Price</TableHead>
                                <TableHead>Discount %</TableHead>
                                <TableHead>Flash Price</TableHead>
                                <TableHead>Qty Limit</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedProducts.map((p) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                                <Image src={p.image_url || '/placeholder.png'} alt={p.name} fill className="object-cover"/>
                                            </div>
                                            <span className="truncate max-w-[150px]" title={p.name}>{p.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{p.price}</TableCell>
                                    <TableCell>
                                        <div className="relative w-20">
                                            <Input 
                                                type="number" 
                                                min="1" 
                                                max="99" 
                                                className="h-8 pr-6"
                                                value={p.discount_percentage}
                                                onChange={(e) => updateProductSetting(p.id, 'discount_percentage', e.target.value)}
                                            />
                                            <span className="absolute right-2 top-2 text-xs text-gray-400">%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-rose-600 font-bold">
                                        {calculateDiscountedPrice(p.price, p.discount_percentage)}
                                    </TableCell>
                                    <TableCell>
                                        <Input 
                                            type="number" 
                                            min="1"
                                            className="h-8 w-20"
                                            value={p.total_quantity}
                                            onChange={(e) => updateProductSetting(p.id, 'total_quantity', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleRemoveProduct(p.id)}>
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting || selectedProducts.length === 0}
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                    {isSubmitting ? (
                        <>Saving...</>
                    ) : (
                        <><Save className="w-4 h-4 mr-2" /> Publish Sale</>
                    )}
                </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales List */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Sales History</CardTitle>
                <CardDescription>Manage active and past flash sale campaigns.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}
                    </div>
                // ✅ FIX APPLIED BELOW: Added !sales check
                ) : (!sales || sales.length === 0) ? (
                    <div className="text-center py-10 text-gray-500">No flash sales created yet.</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Campaign</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((sale) => (
                                <TableRow key={sale.id}>
                                    <TableCell className="font-medium text-base">{sale.title}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-gray-600">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {new Date(sale.start_time).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3"/> {new Date(sale.start_time).toLocaleTimeString()} - {new Date(sale.end_time).toLocaleTimeString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(sale.start_time, sale.end_time)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold">{sale.product_count || 0}</span>
                                            <span className="text-xs text-gray-500">items</span>
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
    </div>
  );
}