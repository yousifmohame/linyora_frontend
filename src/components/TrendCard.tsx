// components/TrendCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingBag, Sparkles, Zap, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface PromotedProduct {
  id: number;
  name: string;
  brand: string | null;
  price: number | string;
  image: string | null;
  promotion_tier_name: string;
  badge_color: string;
  original_price?: number | string;
  discount_percentage?: number;
  is_new?: boolean;
  rating?: number;
  review_count?: number;
  merchantName?: string;
  variants?: any[];
}

interface TrendCardProps {
  product: PromotedProduct;
  compact?: boolean;
}

// دالة مساعدة لتحويل السعر إلى رقم بشكل آمن
const getSafePrice = (price: number | string): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    const parsed = parseFloat(price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// دالة مساعدة لتنسيق السعر
const formatPrice = (price: number | string): string => {
  const safePrice = getSafePrice(price);
  return safePrice.toFixed(2);
};

export default function TrendCard({ product, compact = false }: TrendCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // استخدام الدوال المساعدة للحصول على الأسعار بشكل آمن
  const safePrice = getSafePrice(product.price);
  const safeOriginalPrice = product.original_price ? getSafePrice(product.original_price) : undefined;
  
  const hasDiscount = safeOriginalPrice && safeOriginalPrice > safePrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((safeOriginalPrice - safePrice) / safeOriginalPrice) * 100)
    : 0;

  const getTierIcon = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('trending') || name.includes('hot')) return Zap;
    if (name.includes('premium') || name.includes('vip')) return Crown;
    return Sparkles;
  };

  const TierIcon = getTierIcon(product.promotion_tier_name);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  if (compact) {
    return (
      <Card className="flex flex-col gap-0 py-0 overflow-hidden group bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-lg max-w-[320px] font-sans">
        <CardHeader className="p-0 relative">
          <Link href={`/products/${product.id}`} className="block relative">
            <div className="relative h-[140px] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-shimmer z-10" />
              )}
              
              {product.image && !imageError ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 25vw"
                  className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Discount Badge */}
              {hasDiscount && (
                <Badge className="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md">
                  {discountPercentage}%
                </Badge>
              )}

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleWishlistToggle}
                className={`absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 min-h-8 shadow-md transition-all duration-200 ${
                  isWishlisted 
                    ? 'text-rose-500 scale-105' 
                    : 'text-gray-400 hover:text-rose-500 hover:scale-105'
                }`}
              >
                <Heart 
                  className={`w-4 h-4 transition-all duration-200 ${
                    isWishlisted ? 'fill-current scale-105' : ''
                  }`} 
                />
              </Button>

              {/* Promotion Tier Badge */}
              <div className="absolute bottom-2 left-2">
                <Badge 
                  style={{ 
                    backgroundColor: product.badge_color,
                    color: 'white'
                  }}
                  className="border-0 text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md"
                >
                  <TierIcon className="w-3 h-3" />
                  {product.promotion_tier_name}
                </Badge>
              </div>

              {/* Rating Stars in Image */}
              {product.rating && (
                <div className="absolute bottom-2 right-2">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <span className="text-[10px] font-medium text-white">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </Link>
        </CardHeader>

        <CardContent className="p-2 flex-1 flex flex-col">
          {/* Brand/Merchant Name */}
          <p className="text-[10px] font-medium text-rose-500 mb-1 uppercase tracking-wide">
            {product.brand || product.merchantName || 'Trending'}
          </p>

          {/* Product Name */}
          <h3 className="text-[13px] font-semibold text-gray-900 leading-tight line-clamp-2 mb-1 min-h-[36px]">
            {product.name}
          </h3>

          {/* Price Section */}
          <div className="mt-auto">
            <div className="flex items-baseline gap-1 mb-0.5">
              <span className="text-[14px] font-bold text-gray-900">
                {formatPrice(safePrice)} ر.س
              </span>
              {hasDiscount && (
                <span className="text-[12px] text-gray-500 line-through">
                  {formatPrice(safeOriginalPrice!)} ر.س
                </span>
              )}
            </div>
            
            {product.review_count && product.review_count > 0 && (
              <p className="text-[10px] text-gray-500 font-medium">
                ({product.review_count} reviews)
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-2 pt-0">
          <Link href={`/products/${product.id}`} className="w-full">
            <Button 
              size="sm" 
              className="w-full h-9 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-[12px] rounded-lg transition-all duration-200 hover:scale-[1.02] group/btn"
            >
              <ShoppingBag className="w-3 h-3 ml-1 transition-transform duration-200 group-hover/btn:scale-105" />
              View Details
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  // Default Grid View
  return (
    <Card className="flex flex-col gap-0 py-0 overflow-hidden group bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-lg max-w-[320px] font-sans">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block relative">
          <div className="relative h-[220px] md:h-[280] sm:h-[240px] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-shimmer z-10" />
            )}
            
            {product.image && !imageError ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 25vw"
                className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-400" />
              </div>
            )}

            {/* Top Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.is_new && (
                <Badge className="bg-green-500 text-white border-0 text-[10px] px-1.5 py-0.5 rounded-full">
                  NEW
                </Badge>
              )}
              {hasDiscount && (
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 text-[10px] px-1.5 py-0.5 rounded-full">
                  {discountPercentage}%
                </Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleWishlistToggle}
              className={`absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-7 h-7 min-h-7 shadow-sm transition-all duration-200 ${
                isWishlisted 
                  ? 'text-rose-500 scale-105' 
                  : 'text-gray-400 hover:text-rose-500 hover:scale-105'
              }`}
            >
              <Heart 
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  isWishlisted ? 'fill-current scale-105' : ''
                }`} 
              />
            </Button>

            {/* Promotion Tier Badge */}
            <div className="absolute bottom-2 left-2">
              <Badge 
                style={{ 
                  backgroundColor: product.badge_color,
                  color: 'white'
                }}
                className="border-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm"
              >
                <TierIcon className="w-2.5 h-2.5" />
              </Badge>
            </div>
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-2 flex-1 flex flex-col">
        {/* Brand/Merchant Name */}
        <p className="text-[9px] font-medium text-rose-500 mb-0.5 uppercase tracking-wide truncate">
          {product.brand || product.merchantName || 'Trending'}
        </p>

        {/* Product Name */}
        <h3 className="text-[11px] font-semibold text-gray-900 leading-tight line-clamp-2 mb-2">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-medium text-gray-600">
                {product.rating.toFixed(1)}
              </span>
            </div>
            {product.review_count && (
              <span className="text-[9px] text-gray-500">
                ({product.review_count})
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-[12px] font-bold text-gray-900">
              {formatPrice(safePrice)} ر.س
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-500 line-through">
                {formatPrice(safeOriginalPrice!)} ر.س
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* <CardFooter className="p-2 pt-0">
        <Link href={`/products/${product.id}`} className="w-full">
          <Button 
            size="sm" 
            className="w-full h-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold text-[11px] rounded-md transition-all duration-200 hover:scale-[1.02]"
          >
            <ShoppingBag className="w-3 h-3 ml-1" />
            View
          </Button>
        </Link>
      </CardFooter> */}
    </Card>
  );
}