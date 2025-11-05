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
  Truck
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
      <Card className="lg:hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-4 sticky top-2 z-40">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label={isMobileMenuOpen ? t('closeMenu') : t('openMenu')}
              className="w-9 h-9 rounded-xl border border-gray-200"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">لوحة التحكم</span>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </CardContent>

        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="border-t border-gray-200/50 pt-2 pb-3 max-h-[70vh] overflow-y-auto"
          >
            <div className="space-y-1 px-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center w-full px-4 py-3 rounded-xl transition-colors text-sm
                      ${isActive 
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-sm' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className={`h-4.5 w-4.5 text-inherit`} />
                    <span className={getIconMargin() + ' font-medium'}>
                      {t(`Sidebar.nav.${link.key}`)}
                    </span>
                  </Link>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className={getIconMargin() + ' font-medium'}>
                  {t('Sidebar.logout')}
                </span>
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
};

export default Navigation;