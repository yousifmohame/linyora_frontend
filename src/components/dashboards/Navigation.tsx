'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings, 
  Crown,
  ShieldCheck,
  MessageCircleCode,
  LogOut,
  Menu,
  X,
  Wallet,
  User,
  CreditCard,
  Truck,
  CircleDashed
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRTL = i18n.language === 'ar';

  // ✨ Professional link visibility logic
  const isVerified = user?.verification_status === 'approved';
  const isSubscribed = user?.subscription?.status === 'active';
  const canAccessDropshipping = user?.subscription?.permissions?.hasDropshippingAccess ?? false;

  const subscriptionLink = isSubscribed
    ? { key: 'mySubscription', href: '/dashboard/my-subscription', icon: CreditCard, requiresVerification: true }
    : { key: 'subscribe', href: '/dashboard/subscribe', icon: ShoppingCart, requiresVerification: true };

  const allNavLinks = [
    { key: 'overview', href: '/dashboard', icon: Home },
    { key: 'verification', href: '/dashboard/verification', icon: ShieldCheck, show: !isVerified },
    { key: 'products', href: '/dashboard/products', icon: Package, show: isVerified },
    { key: 'orders', href: '/dashboard/orders', icon: ShoppingCart, show: isVerified },
    { key: 'stories', href: '/dashboard/stories', icon: CircleDashed },
    { key: 'agreements', href: '/dashboard/agreements', icon: User, show: isVerified },
    { key: 'models', href: '/dashboard/models', icon: ShoppingCart, show: isVerified },
    { key: 'shipping', href: '/dashboard/shipping', icon: Truck, show: isVerified }, // ✅ Fixed: was ShoppingCart, now Truck
    { ...subscriptionLink, show: isVerified },
    { key: 'dropshipping', href: '/dashboard/dropshipping', icon: Truck, show: isVerified && canAccessDropshipping },
    { key: 'messages', href: '/dashboard/messages', icon: MessageCircleCode, show: isVerified },
    { key: 'wallet', href: '/dashboard/wallet', icon: Wallet, show: isVerified },
    { key: 'settings', href: '/dashboard/settings', icon: Settings, show: isVerified },
  ];

  const navLinks = allNavLinks.filter(link => link.show !== false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  // Helper to get margin based on direction
  const getIconMargin = () => (isRTL ? 'ml-3' : 'mr-3');

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden lg:block shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6 lg:mb-8">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`
                    group flex items-center px-3.5 py-2.5 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon 
                    className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-rose-600'
                    }`} 
                  />
                  <span className={`font-medium text-sm ${isActive ? 'text-white' : 'group-hover:text-gray-900'}`}>
                    {t(`Sidebar.nav.${link.key}`)}
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Navigation */}
      {/* Mobile Floating Button Navigation */}
      <div className="lg:hidden">
        {/* Floating Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="
            fixed bottom-5 z-50
            bg-gradient-to-br from-rose-500 to-purple-600 
            shadow-xl text-white 
            w-12 h-12 rounded-2xl
            flex items-center justify-center
            backdrop-blur-md
            active:scale-90 transition-transform
            border border-white/20
            right-5
          "
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Drawer Overlay */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
        )}

        {/* Drawer Panel */}
        <div
          className={`
            fixed top-0 ${isRTL ? 'left-0' : 'right-0'}
            h-full w-72 
            bg-white shadow-xl z-50
            transform transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : isRTL ? '-translate-x-full' : 'translate-x-full'}
            rounded-s-3xl
          `}
        >
          <div className="p-4 flex items-center justify-between border-b">
            <h2 className="font-bold text-gray-900">
              {t('Sidebar.title')}
            </h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 active:scale-90"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Links */}
          <div className="py-3 space-y-1 overflow-y-auto max-h-[85vh] px-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.key}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl text-sm transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{t(`Sidebar.nav.${link.key}`)}</span>
                </Link>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-xl text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('Sidebar.logout')}</span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
};

export default Navigation;