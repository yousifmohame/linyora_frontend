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
  CreditCard, // ✨ أيقونة جديدة لرابط "اشتراكي"
  Truck // ✨ أيقونة جديدة لرابط "دروبشيبينغ"
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ================== ✨ منطق عرض الروابط الاحترافي ==================
  const isVerified = user?.verification_status === 'approved';
  const isSubscribed = user?.subscription?.status === 'active';
  const canAccessDropshipping = user?.subscription?.permissions.hasDropshippingAccess ?? false;

  // الرابط الذكي للاشتراك
  const subscriptionLink = isSubscribed
    ? { key: 'mySubscription', href: '/dashboard/my-subscription', icon: CreditCard, requiresVerification: true }
    : { key: 'subscribe', href: '/dashboard/subscribe', icon: ShoppingCart, requiresVerification: true };

  // تعريف جميع الروابط الممكنة مع شروط عرضها
  const allNavLinks = [
    { key: 'overview', href: '/dashboard', icon: Home },
    // عرض رابط التوثيق فقط إذا لم يكن المستخدم موثقًا
    { key: 'verification', href: '/dashboard/verification', icon: ShieldCheck, show: !isVerified },
    // الروابط التالية تتطلب أن يكون المستخدم موثقًا
    { key: 'products', href: '/dashboard/products', icon: Package, show: isVerified },
    { key: 'orders', href: '/dashboard/orders', icon: ShoppingCart, show: isVerified },
    { key: 'agreements', href: '/dashboard/agreements', icon: User, show: isVerified },
    { key: 'models', href: '/dashboard/models', icon: ShoppingCart, show: isVerified },
    { key: 'shipping', href: '/dashboard/shipping', icon: ShoppingCart, show: isVerified },
    // إضافة الرابط الذكي للاشتراك
    { ...subscriptionLink, show: isVerified },
    // عرض رابط الدروبشيبينغ فقط إذا كان موثقًا ولديه الصلاحية من الاشتراك
    { key: 'dropshipping', href: '/dashboard/dropshipping', icon: Truck, show: isVerified && canAccessDropshipping },
    { key: 'messages', href: '/dashboard/messages', icon: MessageCircleCode, show: isVerified },
    { key: 'wallet', href: '/dashboard/wallet', icon: Wallet, show: isVerified },
    { key: 'settings', href: '/dashboard/settings', icon: Settings, show: isVerified },
  ];

  // تصفية الروابط النهائية التي سيتم عرضها
  const navLinks = allNavLinks.filter(link => link.show !== false); // عرض الرابط إذا كان show غير محدد أو true

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden lg:block shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6 lg:mb-8">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1 space-x-reverse flex-wrap justify-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    className={`
                      group flex items-center space-x-2 space-x-reverse p-3 rounded-2xl transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-gray-600 group-hover:text-rose-600'
                    }`} />
                    <span className={`font-medium text-sm ${
                      isActive ? 'text-white' : 'group-hover:text-gray-900'
                    }`}>
                      {t(`Sidebar.nav.${link.key}`)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Header & Menu */}
      <Card className="lg:hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-4 sticky top-2 z-40">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 rounded-xl border border-gray-200"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <div className="p-1.5 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">لوحة التحكم</span>
            </div>
            
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </CardContent>

        {isMobileMenuOpen && (
          <CardContent className="border-t border-gray-200/50 pt-3">
            <div className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center p-3 rounded-xl transition-all duration-200 text-sm
                      ${isActive 
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className="mr-2 font-medium">{t(`Sidebar.nav.${link.key}`)}</span>
                  </Link>
                );
              })}
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center p-3 rounded-xl transition-all duration-200 text-sm text-red-600 hover:bg-red-50 w-full text-right"
              >
                <LogOut className="h-4 w-4" />
                <span className="mr-2 font-medium">{t('Sidebar.logout')}</span>
              </button>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
};

export default Navigation;
