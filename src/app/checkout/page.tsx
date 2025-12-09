'use client';

import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

// UI Components
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '../../components/ui/separator';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { CreditCard, Lock, Truck, Shield, ArrowLeft, Loader2, PlusCircle, Store, Package, MapPin } from 'lucide-react';

// Custom Components
import AddressForm from '../dashboard/addresses/AddressForm'; //
import AddCardModal from '../dashboard/payment/AddCardModal'; //

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe (Outside component to avoid recreation)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// --- Types ---
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
  estimated_days?: string;
}

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

interface MerchantGroup {
  merchantId: number | string;
  merchantName: string;
  items: any[];
  shippingOptions: ShippingOption[];
  selectedShippingId: number | null;
}

// --- Internal Form Component ---
function CheckoutForm() {
  const { t } = useTranslation();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // Stripe Hooks
  const stripe = useStripe();
  const elements = useElements();

  // --- State Management ---
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');
  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [merchantGroups, setMerchantGroups] = useState<MerchantGroup[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const isRTL = typeof document !== 'undefined' && document.dir === 'rtl';

  // --- Data Fetching ---
  const fetchAddresses = async () => {
    try {
      const addrRes = await api.get<Address[]>('/users/addresses');
      setAddresses(addrRes.data);
      if (!selectedAddressId) {
          const defaultAddr = addrRes.data.find(a => a.is_default);
          if (defaultAddr) setSelectedAddressId(defaultAddr.id);
          else if (addrRes.data.length > 0) setSelectedAddressId(addrRes.data[0].id);
      }
    } catch (error) { console.error('Address fetch error', error); }
  };

  const fetchCards = async () => {
    try {
      const cardsRes = await api.get('/payments/methods');
      setSavedCards(cardsRes.data);
      if (cardsRes.data.length > 0 && !selectedCardId) {
          setSelectedCardId(cardsRes.data[0].id);
      }
    } catch (e) { console.warn('Failed to fetch cards'); }
  };

  // Initial Data Load
  useEffect(() => {
    const initPage = async () => {
      if (authLoading) return;
      if (!user) {
        router.push('/login?redirect=/checkout');
        return;
      }
      if (cartItems.length === 0) {
        router.push('/');
        return;
      }

      setIsLoading(true);
      try {
        await Promise.all([fetchAddresses(), fetchCards()]);

        // Group items by merchant
        const groups: Record<string, MerchantGroup> = {};
        
        cartItems.forEach(item => {
          // تحديد مفتاح التجميع (Shipping Group ID)
          // إذا كان دروبشيبينغ، نجمع حسب المورد. إذا لا، نجمع حسب التاجر.
          const isDrop = item.isDropshipping && item.supplierId;
          const groupId = isDrop ? `sup-${item.supplierId}` : `mer-${item.merchantId}`;
          
          // تحديد الاسم الذي سيظهر (اسم التاجر أو اسم المورد)
          const groupName = isDrop 
            ? `${item.supplierName} (مورد)` // أو أي نص تفضله
            : item.merchantName || t('checkout.generalStore');

          // المعرف الذي سنرسله للباك إند لجلب شركات الشحن
          // سنرسل كائن يوضح النوع والمعرف
          const backendId = isDrop ? item.supplierId : item.merchantId;
          const ownerType = isDrop ? 'supplier' : 'merchant'; 

          if (!groups[groupId]) {
            groups[groupId] = {
              merchantId: backendId, // سنستخدم هذا الحقل لتخزين معرف الشاحن (سواء تاجر أو مورد)
              merchantName: groupName,
              ownerType: ownerType, // ✨ حقل جديد (سنحتاجه)
              items: [],
              shippingOptions: [],
              selectedShippingId: null
            };
          }
          groups[groupId].items.push(item);
        });

        // Fetch shipping options for each group
        const groupsArray = Object.values(groups);
        const updatedGroups = await Promise.all(groupsArray.map(async (group) => {
          try {
            const productIds = group.items.map(i => i.productId);
            const res = await api.post<ShippingOption[]>('/products/shipping-options-for-cart', { productIds });
            return {
              ...group,
              shippingOptions: res.data,
              selectedShippingId: res.data.length > 0 ? res.data[0].id : null
            };
          } catch (err) { return group; }
        }));

        setMerchantGroups(updatedGroups);

      } catch (error) {
        console.error("Checkout init failed:", error);
        toast.error(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    initPage();
  }, [user, authLoading, cartItems, router, t]);

  // --- Calculations ---
  const totalShippingCost = useMemo(() => {
    return merchantGroups.reduce((total, group) => {
      const selectedOption = group.shippingOptions.find(o => o.id === group.selectedShippingId);
      return total + (selectedOption ? parseFloat(selectedOption.shipping_cost) : 0);
    }, 0);
  }, [merchantGroups]);

  const finalTotal = cartTotal + totalShippingCost;

  // --- Handlers ---
  const handleShippingChange = (merchantId: string | number, shippingId: string) => {
    setMerchantGroups(prev => prev.map(g => {
      if (g.merchantId === merchantId) {
        return { ...g, selectedShippingId: parseInt(shippingId) };
      }
      return g;
    }));
  };

  const handleCardAdded = () => {
      fetchCards();
  };

  const handleProceedToPayment = async () => {
    // 1. Validation
    if (!selectedAddressId) {
      toast.error(t('checkout.selectAddressError'));
      return;
    }

    const missingShipping = merchantGroups.some(g => g.shippingOptions.length > 0 && !g.selectedShippingId);
    if (missingShipping) {
      toast.error(t('checkout.selectShippingError'));
      return;
    }

    if (paymentMethod === 'card' && !selectedCardId) {
        toast.error('الرجاء اختيار بطاقة');
        return;
    }

    setIsProcessing(true);

    // Common Payload
    const orderPayload = {
      cartItems,
      shippingAddressId: selectedAddressId,
      shipping_company_id: merchantGroups[0]?.selectedShippingId, 
      shipping_cost: totalShippingCost,
      total_amount: finalTotal,
      merchant_shipping_selections: merchantGroups.map(g => ({
         merchant_id: g.merchantId,
         shipping_option_id: g.selectedShippingId
      })),
    };

    try {
      if (paymentMethod === 'card') {
        // --- CARD PAYMENT FLOW ---
        if (!stripe || !elements) {
            toast.error("Stripe لم يتم تحميله بعد");
            setIsProcessing(false);
            return;
        }

        const cardCvcElement = elements.getElement(CardCvcElement);
        if (!cardCvcElement) {
            toast.error("الرجاء إدخال رمز التحقق (CVV)");
            setIsProcessing(false);
            return;
        }

        // A. Create Intent (Backend: createPaymentIntent)
        // ملاحظة: لا نرسل off_session: true، والباك إند سيجلب customer_id من قاعدة البيانات
        const { data: intentData } = await api.post('/payments/create-intent', {
            amount: finalTotal,
            currency: 'sar',
            payment_method_id: selectedCardId,
            ...orderPayload
        });

        // B. Confirm Payment (Frontend: stripe.confirmCardPayment)
        const result = await stripe.confirmCardPayment(intentData.clientSecret, {
            payment_method: selectedCardId!,
            payment_method_options: {
                card: {
                    cvc: cardCvcElement, // Link the CVC element
                },
            },
        });

        if (result.error) {
            toast.error(result.error.message || "فشلت عملية الدفع");
            setIsProcessing(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                // C. Create Order (Backend: createOrderFromIntent)
                await api.post('/orders/create-from-intent', {
                    paymentIntentId: result.paymentIntent.id,
                    ...orderPayload
                });
                clearCart();
                toast.success(t('checkout.orderPlacedSuccessfully'));
                router.push('/checkout/success');
            }
        }

      } else if (paymentMethod === 'cod') {
        // --- COD FLOW ---
        await api.post('/orders/create-cod', orderPayload);
        clearCart();
        toast.success(t('checkout.orderPlacedSuccessfully'));
        router.push('/checkout/success');
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || t('checkout.paymentFailed'));
      setIsProcessing(false);
    }
  };

  // --- Render Loading State ---
  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Skeleton className="h-10 w-1/3" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-80 w-full rounded-2xl" />
                </div>
            </div>
        </div>
    );
  }

  // --- Render Main Content ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-32" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-gray-200">
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('checkout.title')}</h1>
            <p className="text-gray-500 text-sm">{t('checkout.subtitle')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Addresses & Items */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Addresses Section */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden">
                 <CardHeader className="bg-white border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        {t('checkout.shippingAddress')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-gray-50/50">
                    <div className="grid gap-4">
                        {addresses.map(addr => (
                            <div 
                                key={addr.id} 
                                onClick={() => setSelectedAddressId(addr.id)}
                                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    selectedAddressId === addr.id 
                                    ? 'border-purple-600 bg-purple-50/50' 
                                    : 'border-white bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900 flex items-center gap-2">
                                            {addr.full_name}
                                            {addr.is_default && <Badge variant="secondary" className="text-[10px] h-5">{t('common.default')}</Badge>}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">{addr.address_line_1}, {addr.city}</p>
                                        <p className="text-xs text-gray-500 mt-1">{addr.phone_number}</p>
                                    </div>
                                    {selectedAddressId === addr.id && (
                                        <div className="h-5 w-5 bg-purple-600 rounded-full flex items-center justify-center">
                                            <div className="h-2 w-2 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <Dialog open={isAddressFormOpen} onOpenChange={setIsAddressFormOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full border-dashed border-gray-300 h-12 text-gray-500 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50">
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    {t('checkout.addNewAddress')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <AddressForm onSuccess={() => { setIsAddressFormOpen(false); fetchAddresses(); }} onCancel={() => setIsAddressFormOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Items & Shipping Section */}
            {merchantGroups.map((group) => (
               <Card key={group.merchantId} className="border-0 shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden">
                   <CardHeader className="bg-white border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-2">
                            <Store className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-gray-900">{group.merchantName}</h3>
                            <Badge variant="outline" className="ml-auto">{group.items.length} {t('common.items')}</Badge>
                        </div>
                   </CardHeader>
                   <CardContent className="p-0">
                       <div className="bg-white p-4 space-y-4">
                           {group.items.map((item) => (
                               <div key={item.id} className="flex gap-4">
                                   <div className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
                                       <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                       <h4 className="font-medium text-sm text-gray-900 truncate">{item.name}</h4>
                                       <p className="text-xs text-gray-500 mt-1">{item.quantity} x {item.price} {t('common.currency')}</p>
                                   </div>
                                   <p className="font-bold text-sm">{(item.price * item.quantity).toFixed(2)}</p>
                               </div>
                           ))}
                       </div>
                       
                       <Separator />

                       {/* Shipping Options */}
                       <div className="p-4 bg-gray-50/50">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                {t('checkout.shippingMethod')}
                            </h4>
                            {group.shippingOptions.length > 0 ? (
                                <RadioGroup 
                                    value={group.selectedShippingId?.toString()} 
                                    onValueChange={(val) => handleShippingChange(group.merchantId, val)}
                                    className="grid gap-3"
                                >
                                    {group.shippingOptions.map((opt) => (
                                        <div key={opt.id} className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${group.selectedShippingId === opt.id ? 'border-blue-500 bg-white' : 'border-transparent bg-white hover:border-gray-200'}`}>
                                            <div className="flex items-center gap-3">
                                                <RadioGroupItem value={opt.id.toString()} id={`ship-${group.merchantId}-${opt.id}`} />
                                                <Label htmlFor={`ship-${group.merchantId}-${opt.id}`} className="cursor-pointer">
                                                    <span className="block font-medium text-gray-900">{opt.name}</span>
                                                    {opt.estimated_days && <span className="text-xs text-gray-500">{opt.estimated_days} {t('days')}</span>}
                                                </Label>
                                            </div>
                                            <span className="font-bold text-sm text-blue-600">{opt.shipping_cost} {t('common.currency')}</span>
                                        </div>
                                    ))}
                                </RadioGroup>
                            ) : (
                                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100">{t('checkout.noShippingOptions')}</p>
                            )}
                       </div>
                   </CardContent>
               </Card>
            ))}

            {/* 3. Payment Method Section */}
            <Card className="border-0 shadow-sm ring-1 ring-gray-200 rounded-2xl overflow-hidden">
                <CardHeader className="bg-white border-b border-gray-100 pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        {t('checkout.paymentMethod')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)} className="space-y-4">
                        
                        {/* Option A: Card Payment */}
                        <div className={`border-2 rounded-xl p-4 transition-all ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <RadioGroupItem value="card" id="pm_card" />
                                <Label htmlFor="pm_card" className="flex-1 cursor-pointer font-bold text-gray-900">{t('checkout.creditCard')}</Label>
                                <div className="flex gap-1">
                                    <div className="w-8 h-5 bg-gray-200 rounded" />
                                    <div className="w-8 h-5 bg-gray-200 rounded" />
                                </div>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="ml-7 space-y-3">
                                    {savedCards.map(card => (
                                        <div 
                                            key={card.id}
                                            onClick={() => setSelectedCardId(card.id)}
                                            className={`relative p-3 border rounded-lg cursor-pointer transition-all bg-white ${
                                                selectedCardId === card.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedCardId === card.id ? 'border-blue-600' : 'border-gray-400'}`}>
                                                        {selectedCardId === card.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm capitalize">{card.brand} •••• {card.last4}</p>
                                                        <p className="text-[10px] text-gray-500">{t('expires')} {card.exp_month}/{card.exp_year}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 🔥 CVV Input Field - Shown only for selected card 🔥 */}
                                            {selectedCardId === card.id && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                                    <Label className="text-xs font-semibold mb-2 block text-gray-700">
                                                        أدخل رمز التحقق (CVV) الموجود خلف البطاقة
                                                    </Label>
                                                    <div className="p-3 border rounded-md bg-white w-32 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                                        <CardCvcElement 
                                                            options={{
                                                                style: {
                                                                    base: {
                                                                        fontSize: '16px',
                                                                        color: '#1f2937',
                                                                        '::placeholder': { color: '#9ca3af' },
                                                                    },
                                                                    invalid: { color: '#ef4444' },
                                                                },
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    
                                    <AddCardModal 
                                        onCardAdded={handleCardAdded}
                                        trigger={
                                            <Button variant="outline" className="w-full border-dashed text-blue-600 border-blue-200 hover:bg-blue-50 h-10 text-sm">
                                                <PlusCircle className="w-4 h-4 mr-2" />
                                                {t('Payment.addNew')}
                                            </Button>
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {/* Option B: COD */}
                        <div className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50/20' : 'border-gray-200'}`}>
                            <RadioGroupItem value="cod" id="pm_cod" />
                            <Label htmlFor="pm_cod" className="flex-1 cursor-pointer">
                                <span className="font-semibold text-gray-900">{t('checkout.cod')}</span>
                                <span className="block text-xs text-gray-500 mt-1">{t('checkout.payOnDeliveryDesc')}</span>
                            </Label>
                            <Package className="w-5 h-5 text-gray-400" />
                        </div>

                    </RadioGroup>
                </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN: Summary */}
          <div className="lg:col-span-1">
             <div className="sticky top-6">
                <Card className="border-0 shadow-lg ring-1 ring-gray-200 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gray-50 border-b border-gray-100">
                        <CardTitle>{t('checkout.orderSummary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('checkout.subtotal')}</span>
                            <span className="font-semibold">{cartTotal.toFixed(2)} {t('common.currency')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{t('checkout.shipping')}</span>
                            <span className="font-semibold">{totalShippingCost.toFixed(2)} {t('common.currency')}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">{t('checkout.total')}</span>
                            <span className="text-2xl font-bold text-purple-600">{finalTotal.toFixed(2)} <span className="text-sm font-normal text-gray-500">{t('common.currency')}</span></span>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-700 mt-4">
                            <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>{t('checkout.secureCheckoutNote', { defaultValue: 'بياناتك محمية بتشفير 256-bit SSL. نحن نضمن تجربة دفع آمنة 100%.' })}</p>
                        </div>

                        <Button 
                            className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200 rounded-xl mt-4"
                            onClick={handleProceedToPayment}
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-2" />{t('checkout.processing')}</>
                            ) : (
                                <><Lock className="w-4 h-4 mr-2" />{t('checkout.payNow')} {finalTotal.toFixed(2)} {t('common.currency')}</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Main Page Wrapper (Providers) ---
export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}