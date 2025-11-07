'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Handshake, ArrowUpCircle, ShoppingBag, Home } from 'lucide-react';
import { toast } from 'sonner';

// واجهة لرسالة النجاح الديناميكية
interface SuccessMessage {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon: React.ElementType;
}

// مكون لعرض حالة التحميل (أثناء قراءة الرابط)
const LoadingState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <Loader2 className="w-16 h-16 text-rose-500 animate-spin" />
      <h2 className="mt-6 text-2xl font-semibold text-rose-800">
        {t('paymentSuccess.loadingTitle', 'جاري التحقق من الدفع...')}
      </h2>
      <p className="mt-2 text-rose-600">
        {t('paymentSuccess.loadingDesc', 'يرجى الانتظار لحظة، نحن نؤكد معاملتك.')}
      </p>
    </div>
  );
};

// المكون الرئيسي الذي يحتوي على منطق الصفحة
function PaymentSuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const paymentType = searchParams.get('type') || 'default'; // (مثل 'agreement', 'promotion')

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError(t('paymentSuccess.error.noSession', 'رابط الجلسة غير صالح أو مفقود.'));
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        // --- خطوة هامة للخادم ---
        // يجب إنشاء هذا المسار في الخادم
        // يقوم بالتحقق من الجلسة مع Stripe وتأكيد الطلب/الاتفاق في قاعدة البيانات
        await api.post('/payments/verify-session', {
          session_id: sessionId,
          type: paymentType,
        });

        // 2. تحديد رسالة النجاح بناءً على النوع
        let msg: SuccessMessage;
        switch (paymentType) {
          case 'agreement':
            msg = {
              title: t('paymentSuccess.agreement.title', 'تم دفع الاتفاق بنجاح!'),
              description: t('paymentSuccess.agreement.desc', 'تم إرسال طلبك للموديل. يمكنك متابعة الحالة في صفحة الاتفاقيات.'),
              buttonText: t('paymentSuccess.agreement.button', 'الانتقال إلى الاتفاقيات'),
              buttonLink: '/dashboard/agreements',
              icon: Handshake,
            };
            break;
          case 'promotion':
            msg = {
              title: t('paymentSuccess.promotion.title', 'تم ترويج المنتج!'),
              description: t('paymentSuccess.promotion.desc', 'تم تفعيل باقة الترويج لمنتجك بنجاح.'),
              buttonText: t('paymentSuccess.promotion.button', 'العودة للمنتجات'),
              buttonLink: '/dashboard/supplier/products',
              icon: ArrowUpCircle,
            };
            break;
          case 'dropshipping':
            msg = {
              title: t('paymentSuccess.dropshipping.title', 'تم إرسال الطلب بنجاح!'),
              description: t('paymentSuccess.dropshipping.desc', 'شكراً لطلبك. يمكنك متابعة حالة الطلب في صفحة طلباتي.'),
              buttonText: t('paymentSuccess.dropshipping.button', 'الانتقال إلى طلباتي'),
              buttonLink: '/dashboard/my-orders',
              icon: ShoppingBag,
            };
            break;
          default:
            msg = {
              title: t('paymentSuccess.default.title', 'تم الدفع بنجاح!'),
              description: t('paymentSuccess.default.desc', 'شكراً لك، تم استلام مدفوعاتك.'),
              buttonText: t('paymentSuccess.default.button', 'العودة للرئيسية'),
              buttonLink: '/dashboard',
              icon: CheckCircle,
            };
        }
        setSuccessMessage(msg);

      } catch (err) {
        console.error("Verification failed:", err);
        toast.error(t('paymentSuccess.error.verificationFailed', 'فشل التحقق من الدفع.'));
        setError(t('paymentSuccess.error.verificationFailedDesc', 'حدث خطأ أثناء التحقق من معاملتك. إذا تم خصم المبلغ، يرجى التواصل مع الدعم.'));
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId, paymentType, t]);

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-red-200 shadow-2xl rounded-3xl">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-red-100 rounded-full inline-block">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-red-800 pt-4">
              {t('paymentSuccess.error.title', 'فشل الدفع')}
            </CardTitle>
            <CardDescription className="text-red-700 text-lg pt-2">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 rounded-2xl font-bold text-lg shadow-lg">
              <Link href="/dashboard">
                <Home className="mr-2 h-5 w-5" />
                {t('paymentSuccess.error.button', 'العودة للرئيسية')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (successMessage) {
    const Icon = successMessage.icon;
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-lg bg-white/80 backdrop-blur-sm border-green-200 shadow-2xl rounded-3xl">
          <CardHeader className="items-center text-center">
            <div className="p-4 bg-green-100 rounded-full inline-block">
              <Icon className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800 pt-4">
              {successMessage.title}
            </CardTitle>
            <CardDescription className="text-green-700 text-lg pt-2">
              {successMessage.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white py-3 rounded-2xl font-bold text-lg shadow-lg">
              <Link href={successMessage.buttonLink}>
                {successMessage.buttonText}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null; // لن يصل إلى هنا
}

// المكون الذي يتم تصديره
export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8 relative">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      
      <div className="relative z-10">
        <Suspense fallback={<LoadingState />}>
          <PaymentSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}