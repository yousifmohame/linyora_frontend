'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CartPage() {
  const { t } = useTranslation();
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?redirect=/cart');
      return;
    }
    if (cartItems.length === 0) return;
    router.push('/checkout');
  };

  // During SSR or initial render, show a neutral loader to avoid mismatch
  if (!isClient) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{t('CartPage.title')}</h1>
            <p className="text-gray-500 mt-2">Loading...</p>
          </header>
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
            <p className="mt-4 text-gray-500">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // After hydration, render actual cart state
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{t('CartPage.title')}</h1>
          <p className="text-gray-500 mt-2">
            {t('CartPage.itemsCount', { count: cartCount })}
          </p>
        </header>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow-md">
            <ShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
            <h2 className="mt-6 text-2xl font-semibold">{t('CartPage.emptyTitle')}</h2>
            <p className="mt-2 text-gray-500">{t('CartPage.emptyDescription')}</p>
            <Link href="/">
              <Button className="mt-6">
                {t('CartPage.continueShopping')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product List */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-6 flex items-start sm:items-center flex-col sm:flex-row gap-4"
                      >
                        <div className="relative w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {t('CartPage.byMerchant', { merchant: item.merchantName })}
                          </p>
                          <p className="text-md font-bold text-purple-600 mt-1">
                            {item.price.toFixed(2)} {t('common.currency')}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border rounded-md">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.id, parseInt(e.target.value) || 1)
                              }
                              className="w-12 h-9 text-center border-l border-r rounded-none focus-visible:ring-0"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0 sticky top-24">
                <CardHeader>
                  <CardTitle>{t('CartPage.orderSummary')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>{t('CartPage.subtotal')}</span>
                    <span>{cartTotal.toFixed(2)} {t('common.currency')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{t('CartPage.shipping')}</span>
                    <span>{t('CartPage.shippingTBD')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold">
                    <span>{t('CartPage.total')}</span>
                    <span>{cartTotal.toFixed(2)} {t('common.currency')}</span>
                  </div>
                  <Button
                    size="lg"
                    className="w-full h-12 text-lg"
                    onClick={handleCheckout}
                  >
                    {t('CartPage.checkoutButton')}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}