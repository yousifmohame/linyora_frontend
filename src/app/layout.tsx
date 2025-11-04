import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import TranslationsProvider from '@/components/layout/TranslationsProvider';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from "sonner";
// 1. استيراد المكون الجديد
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ReelAudioProvider } from "@/context/ReelAudioContext";

export const metadata: Metadata = {
  title: {
    default: 'Linyora | منصة الموضة الفاخرة في السعودية',
    template: '%s | Linyora',
  },
  description: "اكتشفي أحدث صيحات الموضة والأزياء الفاخرة. منصة لينورا تجمع بين أشهر التجار والمودلز والمؤثرات في مكان واحد.",
  keywords: ['أزياء', 'موضة', 'ملابس نسائية', 'ماركات فاخرة', 'تسوق أونلاين السعودية', 'لينيورا'],
};

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-tajawal",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-sans`}>
        <TranslationsProvider>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                
                {/* 2. استخدام المكون الجديد ليقوم بلف المحتوى */}
                {/* هو الذي سيتولى إظهار/إخفاء الهيدر والفوتر */}
                <ReelAudioProvider>
                <PageWrapper>
                  {children}
                </PageWrapper>
                </ReelAudioProvider>
                {/* 3. إبقاء Toaster في الخارج ليعمل دائماً */}
                <Toaster richColors position="top-right" />

              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}