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
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function AdminNav() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // قائمة الروابط الخاصة بالمشرفة فقط
  const adminLinks = [
    { key: 'overview', href: '/dashboard', icon: Home },
    { key: 'users', href: '/dashboard/admin/users', icon: Users },
    { key: 'main-banners', href: '/dashboard/admin/main-banners', icon: PickaxeIcon },
    { key: 'verification', href: '/dashboard/admin/verifications', icon: Users },
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
      <Card className="hidden lg:block shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6 lg:mb-8">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-1 space-x-reverse flex-wrap justify-center gap-1">
              {adminLinks.map((link) => {
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
                      {t(`AdminNav.nav.${link.key}`)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Header */}
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
              <span className="font-bold text-gray-900 text-sm">لوحة تحكم المشرفة</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </CardContent>
        {isMobileMenuOpen && (
          <CardContent className="border-t border-gray-200/50 pt-3">
            <div className="space-y-1">
              {adminLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.key}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 text-sm ${isActive ? 'bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-lg' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className="mr-2 font-medium">{t(`AdminNav.nav.${link.key}`)}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
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