// components/dashboards/AdminNav.tsx
'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Users, 
  Settings, 
  Crown,
  LogOut,
  Menu,
  X,
  Handshake,
  Gem,
  Truck,
  Package,
  ShoppingCart,
  Wallet2,
  FileText,
  Megaphone,
  List,
  PickaxeIcon,
  MessageCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function AdminNav() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRTL = i18n.language === 'ar';

  // قائمة الروابط الخاصة بالمشرفة فقط
  const adminLinks = [
    { key: 'overview', href: '/dashboard', icon: Home },
    { key: 'users', href: '/dashboard/admin/users', icon: Users },
    { key: 'main-banners', href: '/dashboard/admin/main-banners', icon: PickaxeIcon },
    { key: 'marquee-bar', href: '/dashboard/admin/marquee-bar', icon: PickaxeIcon },
    { key: 'verification', href: '/dashboard/admin/verifications', icon: Users },
    { key: 'messages', href: '/dashboard/admin/messages', icon: MessageCircle },
    { key: 'products', href: '/dashboard/admin/products', icon: Package },
    { key: 'categories', href: '/dashboard/admin/categories', icon: List },
    { key: 'orders', href: '/dashboard/admin/orders', icon: ShoppingCart },
    { key: 'agreements', href: '/dashboard/admin/agreements', icon: Handshake },
    { key: 'subscriptions', href: '/dashboard/admin/subscriptions', icon: Gem },
    { key: 'shipping', href: '/dashboard/admin/shipping', icon: Truck },
    { key: 'payouts', href: '/dashboard/admin/payouts', icon: Wallet2 },
    { key: 'model payouts', href: '/dashboard/admin/model-payouts', icon: Wallet2 },
    { key: "Promotions", href: "/dashboard/admin/promotions",  icon: Megaphone },
    { key: "Manage-Subscriptions", href: "/dashboard/admin/manage_subscription", icon: Megaphone },
    { key: "Content", href: "/dashboard/admin/content", icon: FileText},
    { key: "Footer", href: "/dashboard/admin/footer-settings", icon: FileText},
    { key: 'settings', href: '/dashboard/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden lg:block shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-5 lg:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {adminLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  className={`
                    group flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-200 text-xs sm:text-sm
                    ${isActive 
                      ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-purple-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-rose-600'
                  }`} />
                  <span className={`font-medium truncate max-w-[100px] sm:max-w-none ${
                    isActive ? 'text-white' : 'group-hover:text-gray-900'
                  }`}>
                    {t(`AdminNav.nav.${link.key}`)}
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Header */}
      <Card className="lg:hidden shadow-lg border-0 bg-white/90 backdrop-blur-sm mb-4 sticky top-2 z-40">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-8 h-8 rounded-lg border border-gray-200"
            >
              {isMobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <Menu className="w-3.5 h-3.5" />}
            </Button>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-1.5`}>
              <div className="p-1 bg-gradient-to-br from-rose-500 to-purple-600 rounded-md">
                <Crown className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[120px]">
                {t('AdminNav.title')}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </CardContent>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <CardContent className="border-t border-gray-200/50 p-2.5 max-h-[70vh] overflow-y-auto">
            <div className="space-y-0.5">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-2.5 rounded-lg transition-all duration-200 text-xs ${
                      isActive 
                        ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className={`font-medium ${isRTL ? 'mr-2' : 'ml-2'} truncate`}>
                      {t(`AdminNav.nav.${link.key}`)}
                    </span>
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center p-2.5 rounded-lg transition-all duration-200 text-xs text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className={`font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {t('Sidebar.logout')}
                </span>
              </button>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}