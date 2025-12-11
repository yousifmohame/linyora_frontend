'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product, Variant } from '@/types';
import Image from 'next/image';
import { Star, Heart, ShoppingBag, Sparkles, ShoppingCart } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  isInitiallyWishlisted: boolean;
}

// Skeleton Loader Component
export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col gap-0 py-0 overflow-hidden bg-white border border-gray-100 shadow-sm rounded-lg max-w-[370px] animate-pulse">
      <CardHeader className="p-0 relative">
        <div className="relative h-[140px] w-full bg-gradient-to-br from-pink-50 to-purple-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-shimmer" />
        </div>
      </CardHeader>

      <CardContent className="p-2 flex-1 flex flex-col space-y-2">
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded-full w-1/2"></div>
        </div>
        
        <div className="h-2.5 bg-gray-200 rounded-full w-1/4"></div>
        
        <div className="flex space-x-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <div key={star} className="w-3 h-3 bg-gray-200 rounded-full"></div>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-2.5 bg-gray-200 rounded w-1/4"></div>
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <div className="w-full h-8 bg-gray-200 rounded-lg"></div>
      </CardFooter>
    </Card>
  );
}

export default function ProductCard({ product, isInitiallyWishlisted }: ProductCardProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(isInitiallyWishlisted);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    setIsWishlisted(isInitiallyWishlisted);
  }, [isInitiallyWishlisted]);

  const getCheapestVariant = (variants: Variant[] | undefined): Variant | null => {
    if (!variants || variants.length === 0) return null;
    return variants.reduce((minVariant, currentVariant) =>
      Number(currentVariant.price) < Number(minVariant.price) ? currentVariant : minVariant
    );
  };

  const cheapestVariant = getCheapestVariant(product.variants);
  const price = cheapestVariant ? Number(cheapestVariant.price) : 0;
  const comparePrice = cheapestVariant?.compare_at_price ? Number(cheapestVariant.compare_at_price) : null;
  const currency = i18n.language === 'ar' ? 'ر.س' : 'SAR';
  const imageUrl = imageError || !cheapestVariant?.images?.[0] ? '/placeholder-fashion.png' : cheapestVariant.images[0];
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercentage = hasDiscount ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return router.push('/login');

    const original = isWishlisted;
    setIsWishlisted(!original);
    setIsAddingToWishlist(true);

    try {
      original
        ? await api.delete(`/customer/wishlist/${product.id}`)
        : await api.post('/customer/wishlist', { productId: product.id });
    } catch (err) {
      setIsWishlisted(original);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <Card className="flex flex-col gap-0 py-0 overflow-hidden group bg-white border border-transparent shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 rounded-lg max-w-[320px] font-sans">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} className="block relative">
          <div className="relative h-[220px] md:h-[280] sm:h-[240px] w-full overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
            {/* Loading shimmer effect */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-shimmer z-10" />
            )}
            
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 25vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              unoptimized
              onLoad={() => setImageLoaded(true)}
              onError={handleImageError}
              priority
            />

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
              disabled={isAddingToWishlist}
              className={`absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full w-8 h-8 min-h-8 shadow-md transition-all duration-200 ${
                isWishlisted 
                  ? 'text-rose-500 scale-105' 
                  : 'text-gray-400 hover:text-rose-500 hover:scale-105'
              } ${isAddingToWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart 
                className={`w-4 h-4 transition-all duration-200 ${
                  isWishlisted ? 'fill-current scale-105' : ''
                }`} 
              />
            </Button>

            {/* Premium Badge */}
            
              <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                <p className="text-[10px] font-medium text-rose-500 mb-1 uppercase tracking-wide">
          {product.merchantName}
        </p>
              </div>
            
          </div>
        </Link>
      </CardHeader>

      <CardContent className="p-2 flex-1 justify-center items-center flex flex-col">
        {/* Product Name */}
        <CardTitle className="text-[13px] font-semibold text-gray-900 leading-tight line-clamp-2 mb-2 font-serif">
          {product.name}
        </CardTitle>
        
        

        {/* Price */}
        <div className="mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-[12px] font-bold text-gray-900">
              {price.toFixed(2)} {currency}
            </span>
            {hasDiscount && (
              <span className="text-[11px] text-gray-500 line-through">
                {comparePrice?.toFixed(2)} {currency}
              </span>
            )}
          </div>

          {product?.variants?.length > 1 && (
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              +{product?.variants?.length - 1} {t("ProductCard.variants", "variants")}
            </p>
          )}
        </div>


        <div className="w-full flex items-center justify-between mt-2">
          {/* Add to Cart */}
          <Button
            size="icon"
            className="h-8 w-8 flex items-center justify-center 
                      rounded-full bg-[#00A500] hover:bg-[#009000] 
                      text-white transition-colors duration-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (cheapestVariant) {
                addToCart(product, cheapestVariant, 1);
                toast.success(t('productDetail.toast.addToCartSuccess', 'Added to cart!'));
              }
            }}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>


          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-3 h-3 ${
                    star <= (product.rating || 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-medium text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
