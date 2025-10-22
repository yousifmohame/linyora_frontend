// src/app/layout.tsx
import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import TranslationsProvider from '@/components/layout/TranslationsProvider';
import { SocketProvider } from '@/context/SocketContext';
import Header from "@/components/layout/Header";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

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
    // سنبدأ دائمًا باللغة العربية كافتراضي في الـ HTML
    // وسيقوم الكود من جهة العميل بتصحيحه إذا كانت اللغة مختلفة
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-sans`}>
        <TranslationsProvider>
          <AuthProvider>
            <SocketProvider>
              <CartProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <Toaster richColors position="top-right" />
              </CartProvider>
            </SocketProvider>
          </AuthProvider>
        </TranslationsProvider>
      </body>
    </html>
  );
}
