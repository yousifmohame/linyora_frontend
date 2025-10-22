'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '../../components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CreditCard, Lock, Truck, Shield, ArrowLeft, Loader2, Home, PlusCircle } from 'lucide-react';
import AddressForm from '../dashboard/addresses/AddressForm';

// Type Definitions
interface Address {
  id: number;
  full_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state_province_region: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
}

interface ShippingOption {
  id: number;
  name: string;
  shipping_cost: string;
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { cartItems, cartTotal, cartCount, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State Management
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // States for shipping
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [finalTotal, setFinalTotal] = useState(cartTotal);

  // Initial page load effect
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      if (cartCount === 0) {
        router.push('/');
        return;
      }
      fetchAddresses();
      setPageLoading(false);
    }
  }, [user, authLoading, cartCount, router]);

  // Fetch shipping options based on cart items
  useEffect(() => {
    const fetchShippingOptions = async () => {
      if (cartItems.length === 0) {
        setShippingOptions([]);
        return;
      }

      try {
        const productIds = cartItems.map(item => item.productId);
        const response = await api.post<ShippingOption[]>('/products/shipping-options-for-cart', { productIds });
        
        setShippingOptions(response.data);
        if (response.data.length > 0) {
          setSelectedShipping(response.data[0]);
        } else {
          setSelectedShipping(null);
        }
      } catch (error) {
        console.error('Failed to fetch shipping options:', error);
        toast.error(t('errors.fetchShippingFailed'));
      }
    };

    fetchShippingOptions();
  }, [cartItems, t]);

  // Calculate final total
  useEffect(() => {
    const shippingCost = selectedShipping ? parseFloat(selectedShipping.shipping_cost) : 0;
    setFinalTotal(cartTotal + shippingCost);
  }, [cartTotal, selectedShipping]);

  const fetchAddresses = async () => {
    setIsAddressLoading(true);
    try {
      const response = await api.get<Address[]>('/users/addresses');
      setAddresses(response.data);
      const defaultAddress = response.data.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (response.data.length > 0) {
        setSelectedAddressId(response.data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error(t('errors.fetchAddressesFailed'),{ description: t('errors.fetchAddressesFailed') });
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedAddressId) {
      toast.error(t('checkout.selectAddressError'),{
        description: t('checkout.selectAddressErrorDesc'),
      });
      return;
    }
    if (!selectedShipping) {
      toast.error(t('checkout.selectShippingError'), {
        description: t('checkout.selectShippingErrorDesc'),
      });
      return;
    }

    setIsProcessing(true);

    const orderPayload = {
      cartItems,
      shippingAddressId: selectedAddressId,
      shipping_company_id: selectedShipping.id,
      shipping_cost: selectedShipping.shipping_cost,
    };

    try {
      if (paymentMethod === 'stripe') {
        const response = await api.post('/payments/create-checkout-session', orderPayload);
        const { checkoutUrl } = response.data;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      } else if (paymentMethod === 'cod') {
        await api.post('/orders/create-cod', orderPayload);
        clearCart();
        toast.success(t('checkout.orderPlacedSuccessfully'));
        router.push('/checkout/success');
      }
    } catch (error) {
      console.error("Payment processing failed:", error);
      toast.error(t('checkout.paymentFailed'));
      setIsProcessing(false);
    }
  };

  const handleAddressFormSuccess = () => {
    setIsAddressFormOpen(false);
    fetchAddresses();
  };

  if (pageLoading || authLoading || isAddressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-48 sm:w-64 mx-auto mb-6 sm:mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <Skeleton className="h-32 sm:h-48 w-full rounded-xl" />
                <Skeleton className="h-32 sm:h-48 w-full rounded-xl" />
                <Skeleton className="h-32 sm:h-48 w-full rounded-xl" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <Skeleton className="h-48 sm:h-64 w-full rounded-xl" />
                <Skeleton className="h-20 sm:h-24 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-3 sm:py-6 lg:py-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Header - Mobile Optimized */}
        <div className="max-w-6xl mx-auto mb-4 sm:mb-6 lg:mb-8">
          <Button
            variant="ghost"
            className="mb-3 sm:mb-4 hover:bg-gray-100 transition-colors h-8 sm:h-9 text-xs sm:text-sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
            {t('common.back')}
          </Button>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
              {t('checkout.title')}
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base max-w-2xl mx-auto px-2">
              {t('checkout.subtitle')}
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4 lg:space-y-6">
              {/* Shipping Address Card - Mobile Optimized */}
              <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow rounded-xl sm:rounded-2xl">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                    <Home className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    {t('checkout.shippingAddress')}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {t('checkout.selectShippingAddress')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                  <div className="grid grid-cols-1 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-semibold text-sm sm:text-base truncate">{addr.full_name}</p>
                          {addr.is_default && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5">
                              {t('common.default')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                          {addr.address_line_1}
                          {addr.address_line_2 && `, ${addr.address_line_2}`}, {addr.city}, {addr.country}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{addr.phone_number}</p>
                      </div>
                    ))}
                  </div>
                  
                  <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="mt-3 sm:mt-4 w-full h-9 sm:h-10 text-xs sm:text-sm">
                        <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        {t('checkout.addNewAddress')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">
                          {t('checkout.addNewAddress')}
                        </DialogTitle>
                      </DialogHeader>
                      <AddressForm
                        onSuccess={handleAddressFormSuccess}
                        onCancel={() => setIsAddressFormOpen(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Shipping Method Card - Mobile Optimized */}
              <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow rounded-xl sm:rounded-2xl">
                <CardHeader className="p-3 sm:p-4 lg:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
                    {t('checkout.shippingMethod')}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {t('checkout.selectShippingMethod')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-0">
                  {shippingOptions.length > 0 ? (
                    <RadioGroup
                      value={selectedShipping?.id.toString()}
                      onValueChange={(value) => {
                        const selected = shippingOptions.find(opt => opt.id.toString() === value);
                        setSelectedShipping(selected || null);
                      }}
                      className="space-y-3"
                    >
                      {shippingOptions.map((option) => (
                        <Label
                          key={option.id}
                          htmlFor={`shipping-${option.id}`}
                          className={`flex items-center justify-between border-2 rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                            selectedShipping?.id === option.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <RadioGroupItem 
                              value={option.id.toString()} 
                              id={`shipping-${option.id}`}
                              className="w-4 h-4 sm:w-5 sm:h-5"
                            />
                            <span className="font-semibold text-sm sm:text-base truncate">{option.name}</span>
                          </div>
                          <span className="font-bold text-blue-600 text-sm sm:text-base whitespace-nowrap ml-2">
                            {parseFloat(option.shipping_cost).toFixed(2)} {t('common.currency')}
                          </span>
                        </Label>
                      ))}
                    </RadioGroup>
                  ) : (
                    <p className="text-gray-500 text-sm sm:text-base text-center py-4">
                      {t('checkout.noShippingOptions')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Order Summary Card - Mobile Optimized */}
              <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow rounded-xl sm:rounded-2xl">
                <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-xl sm:rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                    <div className="p-1 sm:p-1.5 bg-purple-100 rounded-lg">
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                    </div>
                    {t('checkout.orderSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-3 sm:pt-4">
                  <div className="space-y-2 sm:space-y-3">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between py-2 sm:py-3 ${
                          index !== cartItems.length - 1 ? 'border-b border-gray-100' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <Image
                              src={item.image || '/placeholder.png'}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover border border-gray-200"
                              unoptimized
                            />
                            <Badge
                              variant="secondary"
                              className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-5 h-5 flex items-center justify-center p-0"
                            >
                              {item.quantity}
                            </Badge>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-900 truncate text-xs sm:text-sm lg:text-base">
                              {item.name}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {item.quantity} × {item.price.toFixed(2)} {t('common.currency')}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base whitespace-nowrap ml-2">
                          {(item.quantity * item.price).toFixed(2)} {t('common.currency')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods Card - Mobile Optimized */}
              <Card className="shadow-sm border-gray-200 hover:shadow-md transition-shadow rounded-xl sm:rounded-2xl">
                <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl sm:rounded-t-2xl">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                    <div className="p-1 sm:p-1.5 bg-green-100 rounded-lg">
                      <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    {t('checkout.paymentMethod')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-3 sm:pt-4">
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-3"
                  >
                    {/* Stripe Option */}
                    <div
                      className={`border-2 rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                        paymentMethod === 'stripe'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <RadioGroupItem 
                          value="stripe" 
                          id="stripe" 
                          className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <div className="flex-1 min-w-0">
                          <Label htmlFor="stripe" className="cursor-pointer font-semibold text-gray-900 text-sm sm:text-base">
                            {t('checkout.creditCard')}
                          </Label>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Shield className="w-3 h-3 text-green-600" />
                              {t('checkout.securePayment')}
                            </div>
                            <div className="flex gap-1">
                              <div className="w-4 h-3 sm:w-5 sm:h-3.5 bg-blue-600 rounded-sm"></div>
                              <div className="w-4 h-3 sm:w-5 sm:h-3.5 bg-red-500 rounded-sm"></div>
                              <div className="w-4 h-3 sm:w-5 sm:h-3.5 bg-yellow-400 rounded-sm"></div>
                              <div className="w-4 h-3 sm:w-5 sm:h-3.5 bg-purple-600 rounded-sm"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* COD Option */}
                    <div
                      className={`border-2 rounded-lg p-3 sm:p-4 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3">
                        <RadioGroupItem 
                          value="cod" 
                          id="cod" 
                          className="text-green-600 w-4 h-4 sm:w-5 sm:h-5"
                        />
                        <div className="flex-1">
                          <Label htmlFor="cod" className="cursor-pointer font-semibold text-gray-900 text-sm sm:text-base">
                            {t('checkout.cod')}
                          </Label>
                          <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                            <Truck className="w-3 h-3 text-green-600" />
                            {t('checkout.payOnDelivery')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Total & Payment - Mobile Optimized */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <Card className="shadow-lg border-gray-200 sticky top-4 sm:top-6 rounded-xl sm:rounded-2xl">
                <CardHeader className="p-3 sm:p-4 lg:p-6 pb-2 sm:pb-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl sm:rounded-t-2xl">
                  <CardTitle className="text-base sm:text-lg lg:text-xl">
                    {t('checkout.paymentSummary')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 lg:p-6 pt-3 sm:pt-4 space-y-3 sm:space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">{t('checkout.subtotal')}</span>
                      <span className="font-medium text-sm sm:text-base">
                        {cartTotal.toFixed(2)} {t('common.currency')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">{t('checkout.shipping')}</span>
                      <span className="font-medium text-sm sm:text-base">
                        {selectedShipping 
                          ? `${parseFloat(selectedShipping.shipping_cost).toFixed(2)} ${t('common.currency')}`
                          : t('checkout.calculating')
                        }
                      </span>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Total */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-bold text-base sm:text-lg">
                      {t('checkout.total')}
                    </span>
                    <span className="text-xl sm:text-2xl lg:text-2xl text-blue-600 font-bold">
                      {finalTotal.toFixed(2)} {t('common.currency')}
                    </span>
                  </div>

                  {/* Security Badges */}
                  <div className="flex items-center justify-center gap-3 sm:gap-4 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Shield className="w-3 h-3 text-green-600" />
                      <span className="hidden xs:inline">{t('checkout.secure')}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300"></div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Lock className="w-3 h-3 text-blue-600" />
                      <span className="hidden xs:inline">{t('checkout.encrypted')}</span>
                    </div>
                  </div>

                  {/* Payment Button */}
                  <Button
                    size="lg"
                    className="w-full h-11 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                    onClick={handleProceedToPayment}
                    disabled={isProcessing || !selectedAddressId || !selectedShipping}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        {t('checkout.processing')}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 ml-2" />
                        {paymentMethod === 'stripe'
                          ? t('checkout.proceedToPayment')
                          : t('checkout.placeOrder')}
                      </>
                    )}
                  </Button>
                  
                  {/* Payment Provider */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {paymentMethod === 'stripe'
                        ? t('checkout.poweredByStripe')
                        : t('checkout.cashOnDelivery')}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Trust Indicators - Mobile Optimized */}
              <Card className="bg-gray-50 border-gray-200 rounded-xl sm:rounded-2xl">
                <CardContent className="p-3 sm:p-4">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                    <div>
                      <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 leading-tight">{t('checkout.freeShipping')}</p>
                    </div>
                    <div>
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 leading-tight">{t('checkout.secureCheckout')}</p>
                    </div>
                    <div>
                      <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600 leading-tight">{t('checkout.guarantee')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}