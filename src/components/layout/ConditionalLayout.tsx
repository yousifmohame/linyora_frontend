// linora-platform/frontend/src/components/layout/ConditionalLayout.tsx
'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header'; //
import Footer from '@/components/Footer'; //
import {MarqueeBar} from '@/components/layout/MarqueeBar'; //
import {PageWrapper} from '@/components/layout/PageWrapper'; //

// (!!!) أضف هنا أي مسار تريده أن يكون بملء الشاشة
const FULL_SCREEN_PATHS = [
  '/reels',
  '/style-today',
];

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // التحقق إذا كان المسار الحالي يبدأ بأحد مسارات ملء الشاشة
  // (استخدام startsWith ضروري لصفحات مثل /reels/123)
  const isFullScreen = FULL_SCREEN_PATHS.some(path => pathname.startsWith(path));

  // إذا كانت الصفحة بملء الشاشة، اعرض المحتوى فقط
  if (isFullScreen) {
    return <>{children}</>;
  }

  // إذا كانت صفحة عادية، اعرض التصميم الافتراضي
  return (
    <>
      {/* يمكنك تعديل النص هنا أو حذفه إذا أردت */}
      <MarqueeBar />
      <Header />
      <PageWrapper>
        {children}
      </PageWrapper>
      <Footer />
    </>
  );
}