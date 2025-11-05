'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Settings, 
  Crown,
  LogOut,
  Menu,
  X,
  Handshake,
  Package,
  User,
  BarChart2,
  MessageCircleCode,
  Wallet,
  ShoppingCart,
  CreditCard,
  ShieldCheck,
  Video
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ModelNav() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isRTL = i18n.language === 'ar';

  // --- Verification & Subscription Logic ---
  const isVerified = user?.verification_status === 'approved';
  const isSubscribed = user?.subscription?.status === 'active';

  const baseLinks = [
    { key: 'overview', href: '/dashboard', icon: Home },
  ];

  const subscriptionLink = isSubscribed
    ? { key: 'mySubscription', href: '/dashboard/models/my-subscription', icon: CreditCard }
    : { key: 'subscribe', href: '/dashboard/models/subscribe', icon: ShoppingCart };

  const verifiedOnlyLinks = [
    { key: 'offers', href: '/dashboard/models/modelsoffers', icon: Package },
    { key: 'requests', href: '/dashboard/models/requests', icon: Handshake },
    { key: 'wallet', href: '/dashboard/models/wallet', icon: Wallet },
    { key: 'reels', href: '/dashboard/models/reels', icon: Video },
    { key: 'analytics', href: '/dashboard/models/analytics', icon: BarChart2 },
    { key: 'messages', href: '/dashboard/models/messages', icon: MessageCircleCode },
    { key: 'profile', href: '/dashboard/models/profile-settings', icon: User },
  ];

  const verificationLink = { key: 'verification', href: '/dashboard/models/verification', icon: ShieldCheck };

  let modelLinks = [];
  if (isVerified) {
    modelLinks = [...baseLinks, ...verifiedOnlyLinks, subscriptionLink];
  } else {
    modelLinks = [...baseLinks, verificationLink, subscriptionLink];
  }

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Verification Banner */}
      {!isVerified && (
        <Card className="mb-4 sm:mb-6 bg-amber-50 border-amber-200">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm font-semibold text-amber-800">
              {t('verification.banner.message')}{' '}
              <Link 
                href="/dashboard/models/verification" 
                className="font-bold underline hover:text-amber-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('verification.banner.link')}
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Desktop Navigation - Hidden on mobile */}
      <Card className="hidden lg:block shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6 lg:mb-8">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-center gap-1">
            {modelLinks.map((link) => {
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
                  <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-600 group-hover:text-rose-600'
                  }`} />
                  <span className={`mr-2 font-medium text-sm ${isActive ? 'text-white' : 'group-hover:text-gray-900'}`}>
                    {t(`ModelNav.nav.${link.key}`)}
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mobile Navigation */}
      <Card 
        className="lg:hidden shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-4 sticky top-2 z-40"
        aria-label="Mobile navigation menu"
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
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
                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
          </div>
        </CardContent>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div 
            id="mobile-menu"
            className="border-t border-gray-200/50 pt-2 pb-3 max-h-[70vh] overflow-y-auto"
          >
            <div className="space-y-1 px-3">
              {modelLinks.map((link) => {
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
                    <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    <span className="mr-3 font-medium">{t(`ModelNav.nav.${link.key}`)}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors text-right"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span className="mr-3 font-medium">{t('Sidebar.logout')}</span>
              </button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}