'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Home,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
  ShoppingCart,
  Truck,
  Wallet,
  CircleDashed,
  Banknote,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

export default function SupplierNav() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', icon: Home, key: 'Overview' },
    { href: '/dashboard/supplier/stories', icon: CircleDashed, key: 'stories' },
    { href: '/dashboard/supplier/products', icon: Package, key: 'Products' },
    { href: '/dashboard/supplier/orders', icon: ShoppingCart, key: 'Orders' },
    { href: '/dashboard/supplier/shipping', icon: Truck, key: 'Shipping' },
    { href: '/dashboard/supplier/wallet', icon: Wallet, key: 'Wallet' },
    { href: '/dashboard/supplier/bank', icon: Banknote, key: 'bank'},
    { href: '/dashboard/supplier/settings', icon: Settings, key: 'Settings' },
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
                    <Icon
                      className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-gray-600 group-hover:text-rose-600'
                      }`}
                    />
                    <span
                      className={`font-medium text-sm ${
                        isActive ? 'text-white' : 'group-hover:text-gray-900'
                      }`}
                    >
                      {t(`suppliernav.nav.${link.key}`)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Floating Navigation */}
      <div className="lg:hidden">

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`
            fixed bottom-5 z-50
            bg-gradient-to-br from-rose-500 to-purple-600
            shadow-xl text-white 
            w-12 h-12 rounded-2xl
            flex items-center justify-center
            backdrop-blur-md
            active:scale-90 transition-transform
            border border-white/20
            right-5
          `}
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sliding Drawer */}
        <div
          className={`
            fixed top-0 right-0
            w-72 h-full 
            bg-white shadow-xl z-50
            transform transition-transform duration-300
            ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            rounded-l-3xl
          `}
        >

          {/* Drawer Header */}
          <div className="p-4 flex items-center justify-between border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-rose-500 to-purple-600 rounded-lg">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-sm">
                لوحة تحكم المورد
              </span>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 active:scale-90"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Drawer Links */}
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
                  <span className="font-medium">{t(`suppliernav.nav.${link.key}`)}</span>
                </Link>
              );
            })}

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 p-3 rounded-xl text-sm text-red-600 hover:bg-red-50 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t('Sidebar.logout')}</span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
}