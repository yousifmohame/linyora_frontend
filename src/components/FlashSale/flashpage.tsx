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

// --- Types ---
interface FlashProduct {
  id: number;
  name: string;
  originalPrice: number;
  discountPrice: number;
  sold: number;
  total: number;
  image: string;
  alt: string;
  variant_id: number; 
  merchant_id: number;
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
  
  // ✅ تحديث حالة الوقت لتشمل الأيام
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [wishlist, setWishlist] = useState<number[]>([]);
  
  const { addToCart } = useCart();
  const { user } = useAuth();

  // --- Fetch Data ---
  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const { data } = await api.get('/flash-sale/active');
        setFlashSale(data);
        
        if (user && data?.products?.length > 0) {
            const productIds = data.products.map((p: any) => p.id);
            try {
                const wishRes = await api.post('/customer/wishlist/status', { productIds });
                const wishIds = Object.keys(wishRes.data)
                    .filter(k => wishRes.data[k])
                    .map(Number);
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

  // --- Countdown Timer (Updated) ---
  useEffect(() => {
    if (!flashSale) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(flashSale.endTime).getTime(); // تأكد أن الباك إند يرسل توقيت ISO UTC صحيح
      const distance = end - now;

      if (distance < 0) {
        setFlashSale(null); // انتهى العرض
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      };
    };

    // حساب أولي فوري
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [flashSale]);

  // --- Handlers ---
  const handleAddToCart = (e: React.MouseEvent, product: FlashProduct) => {
    e.preventDefault(); 
    e.stopPropagation();

    const cartItemProduct = {
        id: product.id,
        name: product.name,
        merchant_id: product.merchant_id, 
        price: product.discountPrice,
        image_url: product.image
    };

    const variant = {
        id: product.variant_id, 
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

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  // --- Render ---

  if (loading) return (
    <div className="py-10 text-center">
        <Skeleton className="h-48 w-full max-w-6xl mx-auto rounded-xl" />
    </div>
  );
  
  if (!flashSale || flashSale.products.length === 0) return null; // لا تظهر القسم إذا لم يكن هناك منتجات مقبولة

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 py-6">
        <div className="container mx-auto px-4">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Flame className="h-8 w-8 text-orange-500 animate-pulse fill-orange-500" />
                <div className="absolute inset-0 bg-orange-400 blur-xl opacity-50 animate-pulse"></div>
              </div>
              <div className="text-center sm:text-right">
                <h2 className="text-2xl font-bold text-gray-900">{flashSale.title}</h2>
                <p className="text-gray-600 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ينتهي خلال
                </p>
              </div>
            </div>

            {/* Timer Badge (Updated with Days) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg shadow-orange-200">
                <div className="flex items-center gap-1 font-mono text-lg font-bold" dir="ltr">
                  {timeLeft.days > 0 && (
                    <>
                      <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm min-w-[30px] text-center">{timeLeft.days}d</span>
                      <span className="text-orange-100">:</span>
                    </>
                  )}
                  <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm min-w-[30px] text-center">{formatTime(timeLeft.hours)}h</span>
                  <span className="text-orange-100">:</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm min-w-[30px] text-center">{formatTime(timeLeft.minutes)}m</span>
                  <span className="text-orange-100">:</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded backdrop-blur-sm min-w-[30px] text-center">{formatTime(timeLeft.seconds)}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Carousel */}
          <div className="relative group/carousel">
            <button 
                onClick={() => scrollContainer('right')}
                className="absolute top-1/2 -translate-y-1/2 right-0 z-10 hidden sm:flex size-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 text-gray-700 opacity-0 group-hover/carousel:opacity-100 transition-opacity border border-gray-100"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <button 
                onClick={() => scrollContainer('left')}
                className="absolute top-1/2 -translate-y-1/2 left-0 z-10 hidden sm:flex size-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50 text-gray-700 opacity-0 group-hover/carousel:opacity-100 transition-opacity border border-gray-100"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <div 
                id="flash-products-container"
                className="flex gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide scroll-smooth snap-x snap-mandatory"
            >
              {flashSale.products.map((product) => {
                const soldPercentage = Math.min(100, (product.sold / product.total) * 100);
                const discountPercent = Math.round(((product.originalPrice - product.discountPrice) / product.originalPrice) * 100);
                const isWishlisted = wishlist.includes(product.id);

                return (
                  <Link 
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group flex flex-col gap-3 rounded-2xl bg-white min-w-[200px] sm:min-w-[220px] overflow-hidden border border-gray-100 hover:shadow-xl transition-all flex-shrink-0 relative snap-start"
                  >
                    {/* Image Area */}
                    <div className="relative w-3xs h-96 overflow-hidden bg-gray-100">
                      <img
                        src={product.image || '/placeholder.png'}
                        alt={product.alt || product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Discount Badge */}
                      <span className="absolute top-2 right-2 inline-flex items-center justify-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-xs font-bold text-white shadow-md z-10">
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
                      <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-20">
                        <Button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="w-full bg-white/95 hover:bg-white text-gray-900 hover:text-rose-600 shadow-lg font-bold h-10 text-xs rounded-xl flex items-center justify-center gap-2 backdrop-blur-sm transition-colors border border-gray-100"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            أضف للسلة
                        </Button>
                      </div>
                    </div>
                    
                    {/* Details Area */}
                    <div className="p-3 pt-0 flex flex-col gap-1">
                      <h4 className="line-clamp-1 text-sm font-medium text-gray-900 group-hover:text-rose-600 transition-colors" title={product.name}>
                        {product.name}
                      </h4>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-rose-600">{product.discountPrice} <span className="text-xs">ر.س</span></span>
                        <span className="text-xs text-gray-400 line-through decoration-rose-200">{product.originalPrice}</span>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="space-y-1.5 mt-2">
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 w-full relative">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-rose-500 transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
                            style={{ width: `${soldPercentage}%` }}
                          >
                             <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]"></div>
                          </div>
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