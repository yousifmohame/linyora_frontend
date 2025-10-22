// frontend/src/app/checkout/Success/page.tsx
'use client';

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SuccessPage() {
  const { t } = useTranslation();
  const { clearCart } = useCart();

  // ✨ الحل: استخدام useEffect مع مصفوفة تبعيات فارغة
  // هذا يضمن أن دالة clearCart ستُستدعى مرة واحدة فقط بعد عرض المكون لأول مرة.
  useEffect(() => {
    clearCart();
  }, []); // <-- المصفوفة الفارغة تمنع إعادة التشغيل

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-80px)] items-center justify-center text-center">
      <div className="max-w-md">
        <CheckCircle className="mx-auto h-24 w-24 text-green-500" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          {t('SuccessPage.title')}
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          {t('SuccessPage.description')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link href="/dashboard/my-orders">
            <Button size="lg">{t('SuccessPage.viewOrdersButton')}</Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline">
              {t('SuccessPage.continueShoppingButton')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}