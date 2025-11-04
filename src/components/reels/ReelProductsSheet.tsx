// linora-platform/frontend/src/components/reels/ReelProductsSheet.tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReelProductsSheetProps {
  reelId: number;
  modelId: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="w-full aspect-square rounded-lg" />
      <Skeleton className="w-3/4 h-4 rounded" />
      <Skeleton className="w-1/2 h-4 rounded" />
    </div>
  );
}

export function ReelProductsSheet({ reelId, modelId, isOpen, setIsOpen }: ReelProductsSheetProps) {
  // ⭐️ ملاحظة: النوع 'Product' من 'types.ts' قد لا يتطابق مع ما تتوقعه هنا.
  // قمت بتعديل الـ Backend ليرسل (id, name, price, discount_price, image_url)
  // لذلك، قمت بتغيير 'Product[]' إلى 'any[]' ليعمل الكود
  const [products, setProducts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await api.get(`/reels/${reelId}/products`);
          setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error("Failed to fetch reel products:", error);
          setError("Failed to load products");
          setProducts([]);
        }
        setLoading(false);
      };
      fetchProducts();
    }
  }, [isOpen, reelId]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="flex-row items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-left">Shop This Look</SheetTitle>
              <p className="text-sm text-gray-500">
                {products.length} {products.length === 1 ? 'product' : 'products'} available
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-9 w-9"
          >
            <X className="w-4 h-4" />
          </Button>
        </SheetHeader>

        <div className="mt-6 h-full overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 mb-2">{error}</p>
              <Button variant="outline" onClick={() => {
                  // إعادة جلب البيانات
                  const fetchProducts = async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const { data } = await api.get(`/reels/${reelId}/products`);
                      setProducts(Array.isArray(data) ? data : []);
                    } catch (error) {
                      console.error("Failed to fetch reel products:", error);
                      setError("Failed to load products");
                      setProducts([]);
                    }
                    setLoading(false);
                  };
                  fetchProducts();
              }}>
                Try Again
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No products found for this reel</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-primary/30 transition-all duration-200 hover:shadow-lg overflow-hidden"
                  // ⭐️ فتح الرابط في نافذة جديدة
                  onClick={() => {
                    const affiliateUrl = `/products/${product.id}?ref_model=${modelId}`;
                    window.open(affiliateUrl, '_blank');
                  }}
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url || 'https://placehold.co/400x400/f1f5f9/a1a1aa?text=No+Image'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x400/f1f5f9/a1a1aa?text=Error'; }}
                    />
                    {/* ⭐️ استخدام 'discount_price' (الذي هو compare_at_price) */}
                    {product.discount_price && product.discount_price > product.price && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white border-0 text-xs">
                        Sale
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* ⭐️ استخدام 'discount_price' */}
                      {product.discount_price && product.discount_price > product.price ? (
                        <>
                          <span className="text-primary font-bold text-sm">
                            ${product.price} {/* ⭐️ السعر المخفض هو 'price' */}
                          </span>
                          <span className="text-gray-400 text-xs line-through">
                            ${product.discount_price} {/* ⭐️ السعر الأصلي هو 'discount_price' */}
                          </span>
                        </>
                      ) : (
                        <span className="text-primary font-bold text-sm">
                          ${product.price}
                        </span>
                      )}
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full mt-2 bg-primary hover:bg-primary/90"
                    >
                      View Product
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
