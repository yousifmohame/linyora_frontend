'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  Flame, 
  ShoppingCart, 
  Heart, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface FlashProduct {
  id: number;
  name: string;
  originalPrice: number;
  discountPrice: number;
  sold: number;
  total: number;
  image: string;
  alt: string;
  // نحتاج هذه الحقول لإضافتها للسلة
  variants?: any[];
  merchant_id?: number;
}

interface FlashSaleData {
  id: number;
  title: string;
  endTime: string;
  products: FlashProduct[];
}

const FlashPage = () => {
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [wishlist, setWishlist] = useState<number[]>([]);
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  // جلب البيانات
  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const { data } = await api.get('/flash-sale/active');
        setFlashSale(data);
        
        // جلب حالة المفضلة إذا كان المستخدم مسجلاً
        if (user && data?.products) {
            const productIds = data.products.map((p: any) => p.id);
            try {
                const wishRes = await api.post('/customer/wishlist/status', { productIds });
                // تحويل الكائن {1: true, 2: false} إلى مصفوفة [1]
                const wishIds = Object.keys(wishRes.data).filter(k => wishRes.data[k]).map(Number);
                setWishlist(wishIds);
            } catch (e) {
                console.error("Wishlist check failed", e);
            }
        }
      } catch (error) {
        console.error("Failed to load flash sale", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSale();
  }, [user]);

  // المؤقت التنازلي
  useEffect(() => {
    if (!flashSale) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(flashSale.endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setFlashSale(null); // انتهى العرض
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSale]);

  // --- Handlers ---

  const handleAddToCart = (e: React.MouseEvent, product: FlashProduct) => {
    e.preventDefault(); // منع الانتقال لصفحة المنتج
    e.stopPropagation();

    // تجهيز كائن المنتج ليتوافق مع دالة السلة
    // نفترض أن المنتج لديه variants أو ننشئ واحداً وهمياً للسعر المخفض
    const cartItemProduct = {
        id: product.id,
        name: product.name,
        merchant_id: product.merchant_id || 0, // تأكد من أن الباك إند يعيد هذا
        price: product.discountPrice,
        image_url: product.image
    };

    const variant = {
        id: 0, // أو آيدي الفاريانت الحقيقي
        price: product.discountPrice,
        images: [product.image]
    };

    addToCart(cartItemProduct as any, variant as any, 1);
    toast.success("تمت الإضافة للسلة!");
  };

  const handleToggleWishlist = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
        toast.error("يرجى تسجيل الدخول أولاً");
        return;
    }

    const isWishlisted = wishlist.includes(productId);
    
    // تحديث واجهة المستخدم فوراً (Optimistic UI)
    if (isWishlisted) {
        setWishlist(prev => prev.filter(id => id !== productId));
    } else {
        setWishlist(prev => [...prev, productId]);
    }

    try {
        if (isWishlisted) {
            await api.delete(`/customer/wishlist/${productId}`);
            toast.success("تم الحذف من المفضلة");
        } else {
            await api.post('/customer/wishlist', { productId });
            toast.success("تمت الإضافة للمفضلة");
        }
    } catch (error) {
        // تراجع في حال الخطأ
        if (isWishlisted) setWishlist(prev => [...prev, productId]);
        else setWishlist(prev => prev.filter(id => id !== productId));
        toast.error("حدث خطأ ما");
    }
  };

  const scrollContainer = (direction: 'left' | 'right') => {
    const container = document.getElementById('flash-products-container');
    if (container) {
        const scrollAmount = 300;
        container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (loading) return <div className="py-10 text-center"><Skeleton className="h-48 w-full max-w-4xl mx-auto rounded-xl" /></div>;
  if (!flashSale) return null;

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-6">
        <div className="container mx-auto px-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Flame className="h-8 w-8 text-orange-500 animate-pulse" />
                <div className="absolute inset-0 bg-orange-400 blur-xl opacity-50 animate-pulse"></div>
              </div>
              <div className="text-center sm:text-right">
                <h2 className="text-2xl font-bold text-gray-900">{flashSale.title}</h2>
                <p className="text-gray-600 text-sm">تنتهي قريباً!</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg">
                <Clock className="h-4 w-4" />
                <div className="flex items-center gap-1 font-mono text-lg font-bold" dir="ltr">
                  <span className="bg-white/20 px-2 py-0.5 rounded">{formatTime(timeLeft.hours)}</span>
                  <span>:</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">{formatTime(timeLeft.minutes)}</span>
                  <span>:</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">{formatTime(timeLeft.seconds)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Carousel */}
          <div className="relative group/carousel">
            <button 
                onClick={() => scrollContainer('right')}
                className="absolute top-1/2 -translate-y-1/2 right-0 z-10 hidden sm:flex size-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 text-gray-700 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <button 
                onClick={() => scrollContainer('left')}
                className="absolute top-1/2 -translate-y-1/2 left-0 z-10 hidden sm:flex size-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 text-gray-700 opacity-0 group-hover/carousel:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div 
                id="flash-products-container"
                className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide scroll-smooth"
            >
              {flashSale.products.map((product) => {
                const soldPercentage = Math.min(100, (product.sold / product.total) * 100);
                const discountPercent = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);
                const isWishlisted = wishlist.includes(product.id);

                return (
                  <Link 
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group flex flex-col gap-3 rounded-2xl bg-white min-w-[180px] sm:min-w-[220px] overflow-hidden border border-gray-100 hover:shadow-xl transition-all flex-shrink-0 relative"
                  >
                    <div className="relative w-3xs h-96 overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.alt}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <span className="absolute top-2 right-2 inline-flex items-center justify-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white shadow-md z-10">
                        -{discountPercent}%
                      </span>

                      {/* Wishlist Button */}
                      <button
                        onClick={(e) => handleToggleWishlist(e, product.id)}
                        className={`absolute top-2 left-2 z-20 p-2 rounded-full shadow-md transition-all hover:scale-110 ${
                            isWishlisted 
                            ? 'bg-rose-50 text-rose-500' 
                            : 'bg-white/90 text-gray-400 hover:text-rose-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>

                      {/* Add to Cart Overlay Button */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <Button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-white/95 hover:bg-white text-gray-900 shadow-lg font-bold h-9 text-xs rounded-full flex items-center justify-center gap-2 backdrop-blur-sm"
                        >
                            <ShoppingCart className="w-3 h-3" />
                            أضف للسلة
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-3 pt-0 flex flex-col gap-1">
                      <h4 className="line-clamp-1 text-sm font-medium text-gray-900" title={product.name}>{product.name}</h4>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-rose-600">{product.discountPrice} <span className="text-xs">ر.س</span></span>
                        <span className="text-xs text-gray-400 line-through decoration-rose-200">{product.originalPrice}</span>
                      </div>
                      
                      <div className="space-y-1.5 mt-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 w-full">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-500 rounded-full"
                            style={{ width: `${soldPercentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                            <span className="text-rose-600 font-bold">{soldPercentage.toFixed(0)}% تم بيعه</span>
                            <span>{soldPercentage >= 90 ? '🔥 الأخيرة' : `${product.total - product.sold} متبقي`}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashPage;