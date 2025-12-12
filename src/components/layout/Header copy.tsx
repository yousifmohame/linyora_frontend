// components/layout/Header.tsx
'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/context/CartContext';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  Sparkles,
  Bell,
  Heart,
  ShoppingBag,
  ShoppingCart,
  X,
  Search,
  Loader2,
  Grid3X3,
  TrendingUp,
  HeartIcon
} from 'lucide-react';
import api from '@/lib/axios';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { i18n as I18nType } from 'i18next';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

// --- Search Component (unchanged) ---
const SearchBar = () => {
  const { i18n } = useTranslation();
  const placeholder = i18n.language === 'ar' ? 'ابحث عن منتجات...' : 'Search for products...';
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useClickOutside<HTMLDivElement>(() => setIsDropdownOpen(false));
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setResults([]);
      setIsDropdownOpen(false);
      return;
    }
    const debounceTimer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/products/search?term=${encodeURIComponent(searchTerm)}`);
        setResults(response.data);
        setIsDropdownOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);
  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Input
          type="search"
          placeholder={placeholder}
          className="h-10 pl-10 w-full rounded-xl bg-gray-100 border-transparent focus:bg-white focus:border-amber-300 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsDropdownOpen(true);
          }}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>
      {isDropdownOpen && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="max-h-60 overflow-y-auto">
              {results.map((product) => (
                <Link
                  href={`/products/${product.id}`}
                  key={product.id}
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setSearchTerm('');
                  }}
                  className="flex items-center p-3 space-x-3 space-x-reverse hover:bg-amber-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                    <p className="text-sm font-bold text-amber-600">
                      {Number(product.price).toFixed(2)} {i18n.language === 'ar' ? 'ر.س' : 'SAR'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              <p>{i18n.language === 'ar' ? 'لا توجد نتائج بحث' : 'No search results'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Notification Interface (unchanged interface) ---
interface Notification {
  id: number;
  link: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// --- Desktop Notifications (unchanged) ---
const DesktopNotifications = ({ i18n }: { i18n: I18nType }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const notificationsRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  const isRTL = i18n.language === 'ar';
  const noNotificationsText = i18n.language === 'ar' ? 'لا توجد إشعارات جديدة' : 'No new notifications';
  const markAsReadText = i18n.language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read';
  const notificationsTitle = i18n.language === 'ar' ? 'الإشعارات' : 'Notifications';

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async () => {
    try {
      await api.post('/notifications/read');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="relative" ref={notificationsRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-gray-100 rounded-xl"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-rose-500 text-white rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
      {isOpen && (
        <div
          className={`absolute top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 ${
            isRTL ? 'left-0' : 'right-0'
          }`}
        >
          <div className="p-4 flex justify-between items-center border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">{notificationsTitle}</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                className="text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                {markAsReadText}
              </Button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <Link
                  href={n.link || '#'}
                  key={n.id}
                  onClick={() => setIsOpen(false)}
                  className={`block border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    !n.is_read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="p-4">
                    <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(n.created_at).toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">{noNotificationsText}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Mobile Notifications (unchanged) ---
const MobileNotifications = ({ onClose, i18n }: { onClose: () => void; i18n: I18nType }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const notificationsTitle = i18n.language === 'ar' ? 'الإشعارات' : 'Notifications';
  const noNotificationsText = i18n.language === 'ar' ? 'لا توجد إشعارات' : 'No notifications';
  const loadingText = i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading...';

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return i18n.language === 'ar' ? `منذ ${diffDays} يوم` : ` ${diffDays}d ago`;
    } else if (diffHours > 0) {
      return i18n.language === 'ar' ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return i18n.language === 'ar' ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    } else {
      return i18n.language === 'ar' ? 'الآن' : 'Now';
    }
  };

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex justify-between items-center px-4 mb-3">
        <h3 className="font-semibold">{notificationsTitle}</h3>
        {unreadCount > 0 && (
          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
            {i18n.language === 'ar' ? `${unreadCount} جديدة` : `${unreadCount} new`}
          </span>
        )}
      </div>
      <div className="max-h-60 overflow-y-auto">
        {loading ? (
          <p className="px-4 py-2 text-sm text-gray-500">{loadingText}</p>
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map((n) => (
            <Link
              key={n.id}
              href={n.link || '#'}
              onClick={onClose}
              className={`block px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                !n.is_read ? 'bg-blue-50 border-l-4 border-blue-400' : ''
              }`}
            >
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm">{n.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">
                      {getRelativeTime(n.created_at)}
                    </p>
                    {!n.is_read && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {i18n.language === 'ar' ? 'جديد' : 'New'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-3 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">{noNotificationsText}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Mobile Bottom Nav (unchanged) ---
const MobileBottomNav = ({ 
  user, 
  cartCount,
  activeTab
}: { 
  user: any; 
  cartCount: number;
  activeTab: string;
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navItems = [
    { 
      id: 'home', 
      label: t('Header.home', 'Home'), 
      href: '/', 
      icon: 'https://img.ltwebstatic.com/v4/p/ccc/2025/10/14/67/17604134587a78001444325bb9e587b8af5317ba9d.png ',
      activeIcon: 'https://img.ltwebstatic.com/v4/p/ccc/2025/10/14/f5/17604134516c546ca43769b1aab98d75262d92b352.png '
    },
    { 
      id: 'categories', 
      label: t('Header.videos', 'videos'), 
      href: '/style-today', 
      icon: '/reels.png',
      activeIcon: '/reels.png'
    },
    { 
      id: 'trends', 
      label: t('Header.trends', 'Trends'), 
      href: '/trends', 
      isCenter: true,
      icon: '//img.ltwebstatic.com/v4/p/ccc/2025/06/05/8e/17490948638b2b1a8aea7380ff49f178638464ac23.webp',
      activeIcon: '//img.ltwebstatic.com/v4/p/ccc/2025/06/05/2a/17490971725e22897110e606da09af2507edd56f40.webp'
    },
    { 
      id: 'cart', 
      label: t('Header.cart', 'Cart'), 
      href: '/cart', 
      icon: 'https://img.ltwebstatic.com/v4/p/ccc/2025/10/14/71/17604135237555cc5692d3e767a2e8ceaaad8c2fd9.png ',
      activeIcon: 'https://img.ltwebstatic.com/v4/p/ccc/2025/10/14/c8/1760413518ea22439647a2f3df915cd40fd3c364b1.png '
    },
    { 
      id: 'profile', 
      label: user ? t('Header.profile', 'Me') : t('Header.login', 'Login'), 
      href: user ? '/dashboard/profile' : '/login', 
      icon: 'https://img.ltwebstatic.com/v4/p/ccc/2025/10/14/65/17604135518e6dd712ea0420fe7a7dadd826b3ba07.png ',
      activeIcon: 'https://img.ltwebstatic.com/v4/p/ccc/2025/10/14/ce/1760413540e2cf98ef8e7f26720937b8e58304db2e.png '
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/50 lg:hidden z-40 backdrop-blur-sm shadow-lg">
      <div className="grid grid-cols-5 items-center py-2 px-1 relative h-16">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          if (item.isCenter) {
            return (
              <div key={item.id} className="relative col-span-1 flex justify-center">
                <Link
                  href={item.href}
                  className={`
                    flex items-center justify-center w-14 h-14 rounded-full
                    bg-amber-600 text-white shadow-lg
                    absolute -bottom-0 z-10
                    ${isActive ? 'scale-105' : 'hover:scale-105'}
                    transition-all duration-200
                  `}
                  style={{
                    backgroundImage: `url(${isActive ? item.activeIcon : item.icon})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              </div>
            );
          }
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 relative
                ${isActive 
                  ? 'text-amber-600 scale-105' 
                  : 'text-gray-500 hover:text-amber-500'
                }
              `}
            >
              <div
                className="w-6 h-6 bg-contain bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url(${isActive ? item.activeIcon : item.icon})`,
                }}
              />
              <span className={`text-[11px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
              {item.id === 'cart' && cartCount > 0 && (
                <span className="absolute -top-0 -right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center min-w-[20px]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Header Component ---
export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const { cartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useClickOutside<HTMLDivElement>(() => setIsUserMenuOpen(false));
  const isRTL = i18n.language === 'ar';

  const getActiveTab = useCallback(() => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/categories')) return 'categories';
    if (pathname.startsWith('/trends')) return 'trends';
    if (pathname.startsWith('/dashboard/my-orders')) return 'orders';
    if (pathname.startsWith('/dashboard/wishlist')) return 'wishlist';
    if (pathname.startsWith('/dashboard/profile')) return 'profile';
    return 'home';
  }, [pathname]);

  const [activeTab, setActiveTab] = useState(getActiveTab());
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [pathname, getActiveTab]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    document.documentElement.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.lang = lng;
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const isCustomer = user?.role_id === 5;
  const shouldShowMobileBottomNav = user === null || user.role_id === 5;

  useEffect(() => {
    const closeMenus = () => {
      setIsMobileMenuOpen(false);
      setIsUserMenuOpen(false);
    };
    window.addEventListener('resize', closeMenus);
    return () => window.removeEventListener('resize', closeMenus);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200 lg:relative">
        <nav className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center h-16">
            <div className="relative w-12 h-12 sm:w-14 sm:h-12 bg-gray-200 rounded-lg" />
          </div>
        </nav>
      </header>
    );
  }

  const loginText = t('Header.login', 'Login');
  const registerText = t('Header.register', 'Register');
  const dashboardText = t('Header.dashboard', 'Dashboard');
  const logoutText = t('Header.logout', 'Logout');

  return (
    <>
      <header dir='ltr' className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200 lg:relative">
        <nav className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center h-20">
            <Link
              href="/"
              className="flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="relative w-30 h-12 sm:w-24 sm:h-20">
                <Image
                  src="/logo7.jpg"
                  alt="Linyora Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {isCustomer && (
              <div className="lg:hidden">
                <Link href="/dashboard/wishlist" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" size="icon" className="relative mx-2 h-10 w-10">
                    <HeartIcon className="h-5 w-5 text-gray-700" />
                  </Button>
                </Link>
              </div>
            )}

            <div className="hidden lg:flex flex-1 justify-center px-8">
              <SearchBar />
            </div>

            <div className="hidden lg:flex items-center space-x-2 space-x-reverse">
              <div className="flex items-center space-x-1 space-x-reverse mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeLanguage('en')}
                  className={`
                    px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm
                    ${i18n.language === 'en'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  EN
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => changeLanguage('ar')}
                  className={`
                    px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm
                    ${i18n.language === 'ar'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  AR
                </Button>
              </div>

              {user ? (
                <>
                  <DesktopNotifications i18n={i18n} />
                  <Link href="/categories" onClick={() => setIsUserMenuOpen(false)}>
                    <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-xl">
                      <Grid3X3 className="w-5 h-5" />
                      <span className="text-sm">
                        {i18n.language === 'ar' ? 'التصنيفات' : 'Categories'}
                      </span>
                    </Button>
                  </Link>
                  <Link href="/trends" onClick={() => setIsUserMenuOpen(false)}>
                    <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm">
                        {i18n.language === 'ar' ? 'الترندات' : 'Trends'}
                      </span>
                    </Button>
                  </Link>

                  {isCustomer ? (
                    <>
                      <Link href="/cart" onClick={() => setIsUserMenuOpen(false)}>
                        <Button variant="outline" size="icon" className="relative">
                          <ShoppingCart className="h-5 w-5" />
                          {cartCount > 0 && (
                            <div className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                              {cartCount > 9 ? '9+' : cartCount}
                            </div>
                          )}
                        </Button>
                      </Link>
                      <Link href="/dashboard/my-orders" onClick={() => setIsUserMenuOpen(false)}>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl">
                          <ShoppingBag className="w-5 h-5 text-gray-600" />
                        </Button>
                      </Link>
                      <Link href="/dashboard/wishlist" onClick={() => setIsUserMenuOpen(false)}>
                        <Button variant="ghost" size="icon" className="hover:bg-gray-100 rounded-xl">
                          <Heart className="w-5 h-5 text-gray-600" />
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href="/dashboard" onClick={() => setIsUserMenuOpen(false)}>
                      <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-xl">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="text-sm">{dashboardText}</span>
                      </Button>
                    </Link>
                  )}

                  <div className="relative" ref={userMenuRef}>
                    <Button
                      variant="ghost"
                      className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-xl"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-sm hidden md:inline">{user.name}</span>
                    </Button>
                    {isUserMenuOpen && (
                      <div
                        className={`absolute top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 ${
                          isRTL ? 'right-0' : 'left-0'
                        }`}
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        {shouldShowMobileBottomNav && (
                          <Link
                            href="/dashboard/profile"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center space-x-3 space-x-reverse p-3 rounded-xl hover:bg-amber-50"
                          >
                            <User className="w-5 h-5 text-gray-600" />
                            <span>{i18n.language === 'ar' ? 'الملف الشخصي' : 'Profile'}</span>
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-2 space-x-reverse w-full px-4 py-3 hover:bg-red-50 text-red-600 border-t border-gray-100"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{logoutText}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/categories">
                    <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-xl">
                      <Grid3X3 className="w-5 h-5" />
                      <span className="text-sm">
                        {i18n.language === 'ar' ? 'التصنيفات' : 'Categories'}
                      </span>
                    </Button>
                  </Link>
                  <Link href="/trends">
                    <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-xl">
                      <TrendingUp className="w-5 h-5" />
                      <span className="text-sm">
                        {i18n.language === 'ar' ? 'الترندات' : 'Trends'}
                      </span>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse hover:bg-gray-100 rounded-xl">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{loginText}</span>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md rounded-xl text-sm px-3 py-2">
                      <Sparkles className="w-4 h-4 ml-1" />
                      {registerText}
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className={`absolute ${isRTL ? 'right-0' : 'left-0'} flex items-center lg:hidden z-50`}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative z-50 h-10 w-10 flex items-center justify-center rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 hover:bg-amber-100 transition-colors"
                aria-label={isMobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* ✨ NEW: Right-side Mobile Drawer (matches second design) */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-50"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="absolute inset-0 bg-black/10" />
              <aside
                className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'} h-full w-80 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col h-full overflow-y-auto">
                  {/* Header */}
                  <div className="flex justify-between items-center px-5 py-5 border-b border-amber-100 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30">
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-amber-100/70 transition-all duration-300 hover:scale-105"
                    >
                      <X className="w-5 h-5 text-gray-700" />
                    </button>

                    {/* Logo */}
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-br from-amber-400/40 via-amber-500/30 to-amber-600/40 blur-xl rounded-full animate-pulse"></div>
                        <div className="absolute -inset-0.5 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full opacity-25"></div>
                        <div className="relative z-10 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="font-bold text-amber-800">L</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-0.5">
                        <h2 className="text-[22px] font-black bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 bg-clip-text text-transparent tracking-wide">
                          LINYORA
                        </h2>
                        <div className="flex items-center gap-1 -mt-0.5">
                          <div className="h-px w-4 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent"></div>
                          <p className="text-[8px] font-bold text-amber-700/70 tracking-[0.15em]">
                            LUXURY
                          </p>
                          <div className="h-px w-4 bg-gradient-to-r from-transparent via-amber-500/60 to-transparent"></div>
                        </div>
                      </div>
                    </div>

                    <button className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-amber-100/70 transition-all duration-300 hover:scale-105">
                      <Search className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>

                  {/* Language Toggle */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex gap-2 bg-gray-100 rounded-full p-1">
                      <button
                        onClick={() => changeLanguage('ar')}
                        className={`flex-1 py-2.5 px-4 rounded-full text-sm transition-all duration-300 ${
                          i18n.language === 'ar'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        العربية
                      </button>
                      <button
                        onClick={() => changeLanguage('en')}
                        className={`flex-1 py-2.5 px-4 rounded-full text-sm transition-all duration-300 ${
                          i18n.language === 'en'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="px-5 pb-5">
                    <SearchBar />
                  </div>

                  {/* User Info */}
                  {user && (
                    <div className="px-5 pb-6 text-center">
                      <div className="relative inline-block">
                        <span className="relative flex size-10 shrink-0 overflow-hidden rounded-full h-24 w-24 mx-auto mb-3 border-4 border-pink-100 shadow-lg ring-4 ring-pink-50">
                          <img
                            className="aspect-square size-full"
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'user'}&backgroundColor=ffdfbf`}
                            alt={user.name}
                          />
                        </span>
                        <div className="absolute bottom-3 right-1/2 translate-x-1/2 translate-y-2 h-4 w-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>
                      </div>
                      <h3 className="text-gray-900 text-lg mb-1">{user.name}</h3>
                      <p className="text-gray-500 text-sm">{user.email}</p>
                    </div>
                  )}

                  {/* Navigation */}
                  <nav className="flex-1 px-5 pb-4">
                    <div className="space-y-1">
                      <Link
                        href="/categories"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <Grid3X3 className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                            {i18n.language === 'ar' ? 'التصنيفات' : 'Categories'}
                          </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4 text-gray-300 group-hover:text-amber-500 transition-all">
                          <path d="m15 18-6-6 6-6"></path>
                        </svg>
                      </Link>

                      <Link
                        href="/trends"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                          <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                            {i18n.language === 'ar' ? 'الترندات' : 'Trends'}
                          </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left h-4 w-4 text-gray-300 group-hover:text-amber-500 transition-all">
                          <path d="m15 18-6-6 6-6"></path>
                        </svg>
                      </Link>

                      {user && isCustomer && (
                        <>
                          <Link
                            href="/dashboard/my-orders"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <ShoppingBag className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                {i18n.language === 'ar' ? 'طلباتي' : 'My Orders'}
                              </span>
                            </div>
                          </Link>

                          <Link
                            href="/dashboard/wishlist"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <Heart className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                {i18n.language === 'ar' ? 'قائمة الأمنيات' : 'Wishlist'}
                              </span>
                            </div>
                          </Link>
                        </>
                      )}

                      {!user && (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
                          >
                            <div className="flex items-center gap-3">
                              <User className="h-5 w-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">
                                {loginText}
                              </span>
                            </div>
                          </Link>

                          <Link
                            href="/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 group"
                          >
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-5 w-5 text-amber-600" />
                              <span className="font-medium">{registerText}</span>
                            </div>
                          </Link>
                        </>
                      )}

                      {user && (
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 text-red-600 hover:from-red-100 hover:to-rose-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          <span className="font-medium">{logoutText}</span>
                        </button>
                      )}
                    </div>
                  </nav>

                  {/* Footer */}
                  <div className="px-5 pb-4 text-center">
                    <p className="text-gray-400 text-xs">LINYORA v1.0.0</p>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </nav>
      </header>

      {shouldShowMobileBottomNav && (
        <MobileBottomNav 
          user={user} 
          cartCount={cartCount}
          activeTab={activeTab}
        />
      )}
    </>
  );
}