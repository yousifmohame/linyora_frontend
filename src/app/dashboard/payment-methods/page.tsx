'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { 
  CreditCard, 
  Trash2, 
  Star, 
  ShieldCheck, 
  Loader2, 
  AlertCircle 
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AddCardModal from '../payment/AddCardModal';

// Types
interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export default function PaymentMethodsPage() {
  const { t, i18n } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // --- Fetch Payment Methods ---
  const fetchMethods = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/methods'); 
      setMethods(response.data);
    } catch (error) {
      console.error("Failed to fetch payment methods", error);
      toast.error('فشل في تحميل طرق الدفع');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  // --- Actions ---
  const handleDelete = async (id: string) => {
    if(!confirm(t('common.confirmDelete', { defaultValue: 'هل أنت متأكد من حذف هذه البطاقة؟' }))) return;
    
    setProcessingId(id);
    try {
      await api.delete(`/payments/methods/${id}`);
      setMethods(prev => prev.filter(m => m.id !== id));
      toast.success(t('Payment.cardDeleted', { defaultValue: 'تم حذف البطاقة بنجاح' }));
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    setProcessingId(id);
    try {
      await api.put(`/payments/methods/${id}/default`);
      setMethods(prev => prev.map(m => ({
        ...m,
        is_default: m.id === id
      })));
      toast.success(t('Payment.defaultUpdated', { defaultValue: 'تم تعيين البطاقة كافتراضية' }));
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setProcessingId(null);
    }
  };

  // Helper for Brand Icons
  const getBrandBadgeColor = (brand: string) => {
    switch (brand.toLowerCase()) {
        case 'visa': return 'bg-blue-100 text-blue-800';
        case 'mastercard': return 'bg-red-100 text-red-800';
        case 'amex': return 'bg-sky-100 text-sky-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-1/3 rounded-xl" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
             <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 pb-20">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-green-600" />
              {t('Payment.title', { defaultValue: 'طرق الدفع' })}
            </h1>
            <p className="text-gray-500 mt-1">
              {t('Payment.subtitle', { defaultValue: 'إدارة بطاقات الائتمان وطرق الدفع الخاصة بك بأمان تام.' })}
            </p>
          </div>
          
          <AddCardModal onCardAdded={fetchMethods} />
        </div>

        {/* Security Alert */}
        <Alert className="bg-blue-50/50 border-blue-200">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">بياناتك محمية ومشفرة</AlertTitle>
          <AlertDescription className="text-blue-600 text-xs mt-1">
            يتم تخزين جميع بيانات الدفع بشكل آمن لدى مزود الخدمة (Stripe). نحن لا نحتفظ بأي أرقام بطاقات كاملة على خوادمنا لضمان أقصى درجات الحماية لبياناتك المالية.
          </AlertDescription>
        </Alert>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {methods.length > 0 ? (
            methods.map((method) => (
              <Card key={method.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 ${method.is_default ? 'border-purple-500 bg-purple-50/5' : 'border-gray-100 bg-white'}`}>
                
                {/* Background Decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-gray-100 to-transparent rounded-full opacity-50 pointer-events-none" />

                <CardHeader className="flex flex-row items-start justify-between pb-2 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white border border-gray-100 shadow-sm rounded-xl">
                        <CreditCard className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold capitalize flex items-center gap-2">
                            {method.brand}
                        </CardTitle>
                        <CardDescription className="font-mono text-sm tracking-wider text-gray-600">
                            •••• {method.last4}
                        </CardDescription>
                    </div>
                  </div>
                  {method.is_default && (
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 shadow-none">
                      {t('Payment.default', { defaultValue: 'الافتراضي' })}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100/50">
                    <div className="text-sm text-gray-500">
                      <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">{t('Payment.expires', { defaultValue: 'EXP' })}</p>
                      <p className="font-semibold text-gray-700 font-mono">{method.exp_month.toString().padStart(2, '0')} / {method.exp_year}</p>
                    </div>

                    <div className="flex gap-2">
                        {!method.is_default && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleSetDefault(method.id)}
                                disabled={!!processingId}
                                className="h-8 text-xs hover:bg-purple-50 hover:text-purple-700 rounded-lg"
                            >
                                {processingId === method.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Star className="w-4 h-4 mr-1" />}
                                {t('Payment.setDefault', { defaultValue: 'تعيين' })}
                            </Button>
                        )}
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(method.id)}
                            disabled={!!processingId}
                            className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                            {processingId === method.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center">
                <div className="bg-white p-5 rounded-full shadow-sm mb-4">
                    <CreditCard className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('Payment.noCards', { defaultValue: 'لا توجد بطاقات محفوظة' })}
                </h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                    {t('Payment.noCardsDesc', { defaultValue: 'أضف بطاقة ائتمان لتسهيل عملية الدفع في طلباتك القادمة. جميع البيانات مشفرة وآمنة.' })}
                </p>
                <AddCardModal 
                  onCardAdded={fetchMethods} 
                  trigger={
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-300 text-gray-700 hover:bg-white hover:text-purple-600 hover:border-purple-200 transition-all">
                      {t('Payment.addNew', { defaultValue: 'إضافة بطاقة جديدة' })}
                    </Button>
                  }
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}