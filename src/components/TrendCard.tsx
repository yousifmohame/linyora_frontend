// components/TrendCard.tsx
'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, ShoppingBag, Sparkles, Zap, Crown, Flame, ArrowUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PromotedProduct {
  id: number;
  name: string;
  brand: string | null;
  price: number;
  image: string | null;
  promotion_tier_name: string;
  badge_color: string;
  original_price?: number;
  discount_percentage?: number;
  is_new?: boolean;
  rating?: number;
  review_count?: number;
  category?: string;
  trend_score: number;
  rank: number;
}

interface TrendCardProps {
  product: PromotedProduct;
  compact?: boolean;
}

const getSafePrice = (price: number): number => price;

const getRankColor = (rank: number): string => {
  if (rank === 1) return 'from-yellow-400 to-orange-500';
  if (rank === 2) return 'from-gray-300 to-gray-400';
  if (rank === 3) return 'from-orange-400 to-orange-600';
  return 'from-purple-400 to-pink-500';
};

const getTrendIcon = (score: number) => {
  if (score >= 95) return Flame;
  if (score >= 85) return Star;
  if (score >= 75) return ArrowUp;
  return Sparkles;
};

const TrendCard = ({ product }: { product: PromotedProduct }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const Icon = getTrendIcon(product.trend_score);
  const rankColor = getRankColor(product.rank);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  // Format price without decimals (e.g., 599 ر.س)
  const formatPrice = (price: number): string => {
    return `${Math.round(price)} ر.س`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200">
      <div className="flex gap-4 p-4">
        <div className="flex-shrink-0 relative">
          {/* Rank Badge */}
          <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-lg z-10 bg-gradient-to-br ${rankColor}`}>
            #{product.rank}
          </div>
          {/* Image */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md">
            {product.image && !imageError ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className={`${imageLoaded ? 'opacity-100' : 'opacity-0'} object-cover transition-opacity duration-300`}
                onLoad={() => setImageLoaded(true)}
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-gray-900 line-clamp-2 text-sm md:text-base">{product.name}</h3>
              <div className="flex-shrink-0 flex items-center gap-1 bg-gradient-to-r from-purple-100 to-pink-100 px-2 py-1 rounded-full">
                <Sparkles className="h-3 w-3 text-purple-600" />
                <span className="text-xs text-purple-700">{product.trend_score}</span>
              </div>
            </div>
            {product.category && (
              <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs mb-2">
                {product.category}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-lg font-bold">
              {formatPrice(product.price)}
            </p>
            <Link href={`/products/${product.id}`}>
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl text-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
                عرض
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Trend Score Progress Bar */}
      <div className="px-4 pb-3">
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full transition-all duration-1000"
            style={{ width: `${product.trend_score}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendCard;