// src/app/products/[id]/ProductDetailClient.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ShoppingCart, 
  Star, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw, 
  Check,
  ArrowLeft,
  Package,
  Users,
  Calendar,
  Minus,
  Plus
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Product, Variant, Review } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import RelatedProductsSection from '@/components/products/RelatedProductsSection';

// --- Star Rating Component ---
const StarRating = ({ 
  rating, 
  totalReviews, 
  size = 'default',
  t 
}: { 
  rating: number; 
  totalReviews?: number; 
  size?: 'sm' | 'default' | 'lg';
  t: (key: string) => string;
}) => {
  const starSize = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5'
  }[size];
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      {totalReviews !== undefined && (
        <span className="text-gray-600 text-xs">
          {rating.toFixed(1)} ({totalReviews})
        </span>
      )}
    </div>
  );
};

// --- Image Thumbnails ---
const ImageThumbnails = ({ 
  images, 
  selectedImage, 
  onSelect 
}: { 
  images: string[]; 
  selectedImage: string; 
  onSelect: (image: string) => void 
}) => (
  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
    {images.map((image, index) => (
      <button
        key={index}
        onClick={() => onSelect(image)}
        className={`flex-shrink-0 w-12 h-12 rounded-lg border overflow-hidden transition-all duration-200 ${
          selectedImage === image 
            ? 'border-rose-500 ring-1 ring-rose-200' 
            : 'border-gray-200 hover:border-rose-300'
        }`}
      >
        <Image
          src={image}
          alt={`Product thumbnail ${index + 1}`}
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </button>
    ))}
  </div>
);

// --- Product Reviews ---
const ProductReviews = ({ 
  reviews, 
  averageRating,
  t,
  i18n
}: { 
  reviews: Review[]; 
  averageRating: number;
  t: (key: string, options?: any) => string;
  i18n: { language: string };
}) => {
  if (!reviews || reviews.length === 0) {
    return (
      <Card className="mt-8 bg-white border-rose-200 rounded-2xl shadow-lg">
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{t('productDetail.reviews.noReviews.title')}</h3>
          <p className="text-gray-600 text-sm">{t('productDetail.reviews.noReviews.description')}</p>
        </CardContent>
      </Card>
    );
  }

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <Card className="mt-8 bg-white border-rose-200 rounded-2xl shadow-lg">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Star className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('productDetail.reviews.title')}</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="flex flex-col items-center justify-center lg:border-r lg:border-rose-200 lg:pr-6">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-1">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="lg" t={t} />
          </div>
          
          <div className="lg:col-span-2 space-y-2">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-amber-600 font-semibold">{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <Progress value={percentage} className="flex-1 h-2 bg-rose-100 [&>div]:bg-gradient-to-r [&>div]:from-amber-500 [&>div]:to-orange-500" />
                <span className="text-gray-500 w-8 text-right">({count})</span>
              </div>
            ))}
          </div>
        </div>
        
        <Separator className="my-6 bg-rose-200" />
        
        <div className="space-y-6">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="border-b border-rose-100 last:border-b-0 pb-6 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {review.userName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{review.userName || t('productDetail.reviews.anonymous')}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(review.created_at).toLocaleDateString(i18n.language, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
                <StarRating rating={review.rating} size="sm" t={t} />
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Not Found Component ---
function ProductNotFound({ t }: { t: (key: string) => string }) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">{t('productDetail.notFound.title')}</h2>
          <p className="text-gray-600 text-sm mb-6">{t('productDetail.notFound.description')}</p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-sm"
            >
              <ArrowLeft className="w-3 h-3 ml-1" />
              {t('common.back')}
            </Button>
            <Button 
              asChild
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm"
            >
              <Link href="/products">{t('productDetail.notFound.browseProducts')}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

// --- Main Client Component ---
export default function ProductDetailClient({ product: initialProduct }: { product: Product }) {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (initialProduct.variants && initialProduct.variants.length > 0) {
      const defaultVariant = initialProduct.variants[0];
      setSelectedVariant(defaultVariant);
      if (defaultVariant.images && defaultVariant.images.length > 0) {
        setSelectedImage(defaultVariant.images[0]);
      }
    }
  }, [initialProduct]);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (user && product) {
        try {
          const res = await api.post('/customer/wishlist/status', { productIds: [product.id] });
          if (res.data[product.id]) {
            setIsWishlisted(true);
          }
        } catch (err) {
          console.error("Failed to fetch wishlist status", err);
        }
      }
    };
    checkWishlistStatus();
  }, [user, product]);


  const handleAddToCart = () => {
    if (product && selectedVariant) {
      addToCart(product, selectedVariant, quantity);
      toast.success(t('productDetail.toast.addToCartSuccess'));
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!product) return;

    const originalState = isWishlisted;
    setIsWishlisted(!originalState);

    try {
      if (originalState) {
        await api.delete(`/customer/wishlist/${product.id}`);
        toast.success(t('productDetail.toast.removeFromWishlist'));
      } else {
        await api.post('/customer/wishlist', { productId: product.id });
        toast.success(t('productDetail.toast.addToWishlist'));
      }
    } catch (error) {
      setIsWishlisted(originalState);
      toast.error(t('productDetail.toast.wishlistError'));
      console.error('Wishlist error:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
        toast.success(t('productDetail.toast.shareSuccess'));
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success(t('productDetail.toast.copyLinkSuccess'));
    }
  };

  if (!product || !selectedVariant) {
    return <ProductNotFound t={t} />;
  }
  
  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  const allImages = selectedVariant.images || [];
  const hasDiscount = selectedVariant.compare_at_price && selectedVariant.compare_at_price > selectedVariant.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((selectedVariant.compare_at_price! - selectedVariant.price) / selectedVariant.compare_at_price!) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-rose-50 to-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto px-3 py-4 relative">
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
            <Link href="/" className="hover:text-rose-600 transition-colors">{t('common.home', 'Home')}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-rose-600 transition-colors">{t('productDetail.breadcrumb.products', 'Products')}</Link>
            <span>/</span>
            <span className="text-rose-600 font-medium truncate">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="bg-white border-rose-200 rounded-2xl shadow-lg overflow-hidden">
              <CardContent className="p-3">
                <div className="relative bg-white aspect-square rounded-xl flex items-center justify-center overflow-hidden border border-rose-100">
                  {selectedImage ? (
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <Package className="w-12 h-12 text-rose-300" />
                  )}
                  
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {hasDiscount && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 px-2 py-1 text-xs font-bold">
                        {t('productDetail.discount', { percent: discountPercentage })}
                      </Badge>
                    )}
                  </div>
                </div>
                
                {allImages.length > 1 && (
                  <ImageThumbnails
                    images={allImages}
                    selectedImage={selectedImage}
                    onSelect={setSelectedImage}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mb-3">
                {product.reviews && (
                  <StarRating rating={averageRating} totalReviews={product.reviews.length} t={t} />
                )}
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-1 text-gray-600 text-xs">
                  <Users className="w-3 h-3" />
                  <span>{product.merchantName}</span>
                </div>
                
              </div>

              <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>

            <Separator className="bg-rose-200" />

            {product.variants.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('productDetail.selectColor')}: <span className="text-rose-600 font-normal">{selectedVariant.color}</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedVariant(variant);
                        if (variant.images && variant.images.length > 0) {
                          setSelectedImage(variant.images[0]);
                        }
                      }}
                      className={`group relative p-2 rounded-xl border transition-all duration-200 ${
                        selectedVariant.id === variant.id
                          ? 'border-rose-500 bg-rose-50 ring-1 ring-rose-200'
                          : 'border-gray-200 hover:border-rose-300'
                      }`}
                    >
                      <div 
                        className="w-6 h-6 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: variant.color.toLowerCase() }}
                        title={variant.color}
                      />
                      {selectedVariant.id === variant.id && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-rose-200" />

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                  {formatPrice(selectedVariant.price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(selectedVariant.compare_at_price!)}
                  </span>
                )}
              </div>
              
              {hasDiscount && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-2 py-0.5 text-xs">
                  {t('productDetail.saveAmount', { amount: formatPrice((selectedVariant.compare_at_price! - selectedVariant.price) * quantity) })}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              {selectedVariant.stock_quantity > 0 ? (
                <Badge className="bg-green-100 text-green-700 border-green-200 px-2 py-1 text-xs">
                  <Check className="w-3 h-3 ml-1" />
                  {t('productDetail.inStock', { count: selectedVariant.stock_quantity })}
                </Badge>
              ) : (
                <Badge variant="destructive" className="px-2 py-1 text-xs">
                  {t('productDetail.outOfStock')}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-900">{t('productDetail.quantity')}</span>
              <div className="flex items-center gap-2 bg-rose-50 rounded-xl p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-100"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center font-bold text-sm">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(selectedVariant.stock_quantity, quantity + 1))}
                  className="w-8 h-8 rounded-lg text-rose-600 hover:bg-rose-100"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-3">
              <Button
                size="lg"
                className="h-12 text-base bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-200"
                onClick={handleAddToCart}
                disabled={selectedVariant.stock_quantity === 0}
              >
                <ShoppingCart className="ml-2 h-4 w-4" />
                {t('productDetail.addToCart')}
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-5 h-5 transition-colors ${
                    isWishlisted ? 'text-red-500 fill-red-500' : 'text-gray-500'
                  }`} />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="h-12 flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Truck className="w-4 h-4 text-rose-500" />
                <span>{t('productDetail.features.fastShipping')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <RotateCcw className="w-4 h-4 text-rose-500" />
                <span>{t('productDetail.features.freeReturn')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Shield className="w-4 h-4 text-rose-500" />
                <span>{t('productDetail.features.qualityGuarantee')}</span>
              </div>
            </div>
          </div>
        </div>

          <RelatedProductsSection 
          categoryId={product.category_id} 
          merchantId={product.merchant_id}
          currentProductId={product.id} 
          title="قد يعجبك ايضا"
        />

        {product.reviews && (
          <ProductReviews 
            reviews={product.reviews} 
            averageRating={averageRating}
            t={t}
            i18n={i18n}
          />
        )}
      </div>
    </div>
  );
}