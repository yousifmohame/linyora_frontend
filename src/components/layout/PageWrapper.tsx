// src/components/layout/PageWrapper.tsx
'use client'; // 1. تحديد هذا كمكون عميل

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/Footer';
import { MarqueeBar } from '@/components/layout/MarqueeBar';

export function PageWrapper({ children }: { children: React.ReactNode }) {
  // 2. استخدام hook لمعرفة الرابط الحالي
  const pathname = usePathname();
  
  // 3. التحقق إذا كنا في صفحة "ستايلك اليوم"
  //    startsWith أفضل من === لتغطية صفحات مثل /style-today/123
  const isStyleTodayPage = pathname.startsWith('/style-today');

  // 4. تحديد الكلاسات الشرطية
  //    الافتراضي: 'block' (ظاهر)
  //    الشرط: إذا كنا في صفحة ستايلك: 'hidden' (مخفي) على الهاتف، 'sm:block' (ظاهر) على شاشات sm فما فوق
  const layoutClasses = cn(
    "block",
    isStyleTodayPage && "hidden sm:block" 
  );

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 5. تطبيق الكلاسات على الهيدر والشريط العلوي */}
      <div className={layoutClasses}>
        <MarqueeBar />
        <Header />
      </div>

      {/* 6. عرض المحتوى (الصفحة) */}
      <main className="flex-grow">{children}</main>

      {/* 7. تطبيق نفس الكلاسات على الفوتر (لتجربة ملء شاشة كاملة على الهاتف) */}
      <div className={layoutClasses}>
        <Footer />
      </div>
      
    </div>
  );
}
