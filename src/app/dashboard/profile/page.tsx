'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Icons
import {
  Shield,
  MapPin,
  Plus,
  Settings,
  Heart,
  ShoppingBag,
  Award,
  HelpCircle,
  Share2,
  LogOut,
  Camera,
  CreditCard,
  Bell,
  Edit,
  Trash2,
  Check,
  Loader2
} from 'lucide-react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import dynamic from 'next/dynamic';

// Types
type ProfileFormValues = { name: string; email: string; phone?: string };
type AddressFormValues = {
  id?: number;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};
interface Address extends AddressFormValues {
  id: number;
}
interface UserStats {
  orders: number;
  points: number;
  favorites: number;
  notifications: number;
  membership: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  progress: number;
  nextLevelPoints: number;
}

const MapPicker = dynamic(() => import('@/components/ui/MapPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 flex items-center justify-center">Loading Map...</div>
});

// ========== AddressForm ==========
const AddressForm = ({
  address,
  onSave,
  open,
  onOpenChange,
}: {
  address?: Address | null;
  onSave: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const { t } = useTranslation();
  const [isLoadingLocation, setIsLoadingLocation] = useState(false); // حالة تحميل العنوان

  const form = useForm<AddressFormValues>({
    defaultValues: address || {
      country: 'Saudi Arabia',
      is_default: false,
      address_line1: '',
      city: '',
      state: '',
      postal_code: '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        address || {
          country: 'Saudi Arabia',
          is_default: false,
          address_line1: '',
          city: '',
          state: '',
          postal_code: '',
        }
      );
    }
  }, [address, open, form]);

  // 👈 دالة التعامل مع اختيار الموقع من الخريطة
  const handleLocationSelect = async (lat: number, lng: number) => {
    setIsLoadingLocation(true);
    try {
      // استخدام خدمة OpenStreetMap المجانية لجلب العنوان من الإحداثيات (Reverse Geocoding)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      
      if (data && data.address) {
        // تعبئة الحقول تلقائياً
        form.setValue('city', data.address.city || data.address.town || data.address.state || '');
        form.setValue('state', data.address.state || data.address.region || '');
        form.setValue('postal_code', data.address.postcode || '');
        form.setValue('country', data.address.country || 'Saudi Arabia');
        
        // تجميع العنوان الكامل
        const fullAddress = [
            data.address.road,
            data.address.suburb,
            data.address.neighbourhood
        ].filter(Boolean).join(', ');
        
        form.setValue('address_line1', fullAddress || t('ProfilePage.addressForm.addressPlaceholder'));
        
        toast.success(t('Address updated from map'));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      toast.error(t('Failed to get address details'));
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const onSubmit = async (values: AddressFormValues) => {
    const promise = values.id
      ? api.put(`/customer/addresses/${values.id}`, values)
      : api.post('/customer/addresses', values);
    toast.promise(promise, {
      loading: t('common.saving'),
      success: () => {
        onSave();
        onOpenChange?.(false);
        return t('ProfilePage.toasts.addressSaved');
      },
      error: (err) => err.response?.data?.message || t('common.error'),
    });
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {address
              ? t('ProfilePage.addressForm.editTitle')
              : t('ProfilePage.addressForm.addTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">
            {t('Select location on map to auto-fill')}
          </p>
          <MapPicker onLocationSelect={handleLocationSelect} />
          {isLoadingLocation && (
            <div className="text-xs text-purple-600 flex items-center gap-1 mt-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {t('Fetching address details...')}
            </div>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address_line1"
              rules={{ required: t('ProfilePage.addressForm.addressRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ProfilePage.addressForm.address')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('ProfilePage.addressForm.addressPlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="city"
                rules={{ required: t('ProfilePage.addressForm.cityRequired') }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ProfilePage.addressForm.city')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                rules={{ required: t('ProfilePage.addressForm.stateRequired') }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ProfilePage.addressForm.state')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="postal_code"
                rules={{ required: t('ProfilePage.addressForm.postalCodeRequired') }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ProfilePage.addressForm.postalCode')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="country"
                rules={{ required: t('ProfilePage.addressForm.countryRequired') }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('ProfilePage.addressForm.country')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="is_default"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer" htmlFor="is_default">
                    {t('ProfilePage.addressForm.isDefault')}
                  </FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ========== EditProfileModal ==========
const EditProfileModal = ({ user, onSave, open, onOpenChange }: { user: any; onSave: () => void; open: boolean; onOpenChange: (open: boolean) => void; }) => {
  const { t } = useTranslation();
  const form = useForm<ProfileFormValues>({
    defaultValues: { name: user.name, email: user.email, phone: user.phone_number || '' },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    toast.promise(api.put('/users/profile', data), {
      loading: t('common.saving'),
      success: () => {
        onSave();
        onOpenChange(false);
        return t('ProfilePage.updateSuccess');
      },
      error: (err) => err.response?.data?.message || t('common.error'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ProfilePage.tabs.personal')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ProfilePage.fields.fullName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ProfilePage.fields.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ProfilePage.fields.phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ========== ChangePasswordModal ==========
const ChangePasswordModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const { t } = useTranslation();
  const form = useForm<{ password: string; confirmPassword: string }>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: { password: string; confirmPassword: string }) => {
    if (data.password !== data.confirmPassword) {
      toast.error(t('ProfilePage.passwordMismatch'));
      return;
    }
    toast.promise(api.put('/users/profile', { password: data.password }), {
      loading: t('common.saving'),
      success: () => {
        onOpenChange(false);
        return t('ProfilePage.passwordUpdated');
      },
      error: (err) => err.response?.data?.message || t('common.error'),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('ProfilePage.tabs.security')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ProfilePage.newPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('ProfilePage.confirmPassword')}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ========== ChevronIcon ==========
const ChevronIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-chevron-left h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform"
    aria-hidden="true"
  >
    <path d="m15 18-6-6 6-6"></path>
  </svg>
);

// ========== Main ProfilePage ==========
export default function ProfilePage() {
  const { user, refetchUser, loading: authLoading } = useAuth();
  const { t, i18n } = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [showAddressesSheet, setShowAddressesSheet] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [cardsCount, setCardsCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<UserStats>({
    orders: 0,
    points: 0,
    favorites: 0,
    notifications: 0,
    membership: 'Bronze',
    progress: 0,
    nextLevelPoints: 100,
  });

  const fetchAddresses = useCallback(async () => {
    try {
      const response = await api.get('/customer/addresses');
      setAddresses(response.data);
    } catch (error) {
      toast.error(t('ProfilePage.toasts.loadAddressesError'));
    }
  }, [t]);

  const fetchCardsCount = useCallback(async () => {
    try {
      const response = await api.get('/payments/methods');
      if (Array.isArray(response.data)) {
        setCardsCount(response.data.length);
      }
    } catch (error) {
      console.warn('Failed to fetch cards count');
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/users/stats');
      setStats(response.data);
    } catch (error) {
      console.warn('Failed to fetch stats, using defaults');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAddresses();
      fetchStats();
      fetchCardsCount();
    }
  }, [user, fetchAddresses, fetchStats, fetchCardsCount]);

  const handlePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('ProfilePage.toasts.invalidImage'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('ProfilePage.toasts.fileTooLarge'));
      return;
    }
    const formData = new FormData();
    formData.append('profilePicture', file);
    toast.promise(api.post('/users/profile/picture', formData), {
      loading: t('ProfilePage.toasts.uploading'),
      success: () => {
        refetchUser();
        return t('ProfilePage.toasts.pictureUpdated');
      },
      error: (err) => err.response?.data?.message || t('common.error'),
    });
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    toast.promise(api.delete(`/customer/addresses/${addressToDelete.id}`), {
      loading: t('common.deleting'),
      success: () => {
        fetchAddresses();
        setAddressToDelete(null);
        return t('ProfilePage.toasts.addressDeleted');
      },
      error: (err) => err.response?.data?.message || t('common.error'),
    });
  };

  const handleEditAddress = (addr: Address) => {
    setAddressToEdit(addr);
    setShowAddressForm(true);
    setShowAddressesSheet(false);
  };

  const handleAddAddress = () => {
    setAddressToEdit(null);
    setShowAddressForm(true);
    setShowAddressesSheet(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t('common.loading')}...</p>
      </div>
    );
  }

  const lang = i18n.language.startsWith('ar') ? 'ar' : 'en';
  const isRTL = lang === 'ar';

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-gray-50 p-4 md:p-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <div className="relative rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
                  <AvatarImage src={user.profile_picture_url || ''} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-2 border-white"></div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -left-2 bg-white text-purple-600 p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePictureUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-white text-2xl mb-1">{user.name}</h2>
                <p className="text-white/90 text-sm">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white bg-white/20 hover:bg-white/30 size-9 h-10 w-10 rounded-full"
                onClick={() => setEditProfileOpen(true)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-1">{stats.orders}</div>
                <div className="text-white/80 text-sm">{isRTL ? 'الطلبات' : 'Orders'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">{stats.points.toLocaleString()}</div>
                <div className="text-white/80 text-sm">{isRTL ? 'النقاط' : 'Points'}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">{stats.favorites}</div>
                <div className="text-white/80 text-sm">{isRTL ? 'المفضلة' : 'Favorites'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* VIP Membership Card */}
        <div className="rounded-xl border bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-900 font-bold">
                    {isRTL
                      ? stats.membership === 'Bronze'
                        ? 'عضوية برونزية'
                        : stats.membership === 'Silver'
                        ? 'عضوية فضية'
                        : stats.membership === 'Gold'
                        ? 'عضوية ذهبية'
                        : 'عضوية بلاتينية'
                      : `${stats.membership} Membership`}
                  </span>
                  <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2 py-0.5">
                    VIP
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm">
                  {isRTL
                    ? `${stats.points.toLocaleString()} نقطة متاحة`
                    : `${stats.points.toLocaleString()} points available`}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {isRTL ? 'التقدم نحو المستوى التالي' : 'Progress to next level'}
              </span>
              <span className="text-gray-900">{stats.progress}%</span>
            </div>
            <div className="h-2 bg-amber-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${stats.progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {isRTL
                ? stats.nextLevelPoints === 0
                  ? 'لقد وصلت لأعلى مستوى!'
                  : `${stats.nextLevelPoints} نقطة للوصول للمستوى التالي`
                : stats.nextLevelPoints === 0
                ? 'You reached the top level!'
                : `${stats.nextLevelPoints} points to next level`}
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="space-y-3">
          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => (window.location.href = '/dashboard/my-orders')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{isRTL ? 'طلباتي' : 'My Orders'}</span>
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs h-5 min-w-[20px] px-1.5">
                        {stats.orders}
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">{isRTL ? 'تتبع طلباتك' : 'Track your orders'}</p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => (window.location.href = '/dashboard/wishlist')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{isRTL ? 'المفضلة' : 'Favorites'}</span>
                      <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs h-5 min-w-[20px] px-1.5">
                        {stats.favorites}
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {isRTL ? 'منتجاتك المفضلة' : 'Your favorite products'}
                    </p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setShowAddressesSheet(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{isRTL ? 'العناوين' : 'Addresses'}</span>
                      <Badge className="bg-gray-100 text-gray-600 text-xs h-5 min-w-[20px] px-1.5">
                        {addresses.length}
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {isRTL ? 'إدارة عناوين الشحن' : 'Manage shipping addresses'}
                    </p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => (window.location.href = '/dashboard/payment-methods')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{isRTL ? 'طرق الدفع' : 'Payment Methods'}</span>
                      {cardsCount > 0 && (
                        <Badge className="bg-gray-100 text-gray-600 text-xs h-5 min-w-[20px] px-1.5">
                          {cardsCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">{isRTL ? 'إدارة بطاقاتك' : 'Manage your cards'}</p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => (window.location.href = '/dashboard/notifications')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                    <Bell className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-900">{isRTL ? 'الإشعارات' : 'Notifications'}</span>
                      {stats.notifications > 0 && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs h-5 min-w-[20px] px-1.5">
                          {stats.notifications}
                        </Badge>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm">
                      {isRTL ? 'إعدادات التنبيهات' : 'Notification settings'}
                    </p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setChangePasswordOpen(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-pink-500" />
                  </div>
                  <div>
                    <span className="text-gray-900 mb-1 block">{isRTL ? 'الأمان' : 'Security'}</span>
                    <p className="text-gray-500 text-sm">{isRTL ? 'تغيير كلمة المرور' : 'Change your password'}</p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* More Section */}
        <div className="space-y-3">
          <h3 className="text-gray-900 text-lg px-2">{isRTL ? 'المزيد' : 'More'}</h3>
          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setEditProfileOpen(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 mb-1 block">{isRTL ? 'الإعدادات' : 'Settings'}</span>
                    <p className="text-gray-500 text-sm">{isRTL ? 'إعدادات الحساب' : 'Account settings'}</p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>
          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => (window.location.href = '/help')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 mb-1 block">
                      {isRTL ? 'المساعدة والدعم' : 'Help & Support'}
                    </span>
                    <p className="text-gray-500 text-sm">{isRTL ? 'مركز المساعدة' : 'Help center'}</p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>
          <Card
            className="rounded-xl border bg-white border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => console.log('Invite friends')}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center">
                    <Share2 className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <span className="text-gray-900 mb-1 block">{isRTL ? 'دعوة الأصدقاء' : 'Invite Friends'}</span>
                    <p className="text-gray-500 text-sm">{isRTL ? 'احصل على مكافآت' : 'Get rewards'}</p>
                  </div>
                </div>
                <ChevronIcon />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 h-12 text-base"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 ml-2" />
          {isRTL ? 'تسجيل الخروج' : 'Logout'}
        </Button>

        <p className="text-center text-gray-400 text-sm pb-4">LINYORA v1.0.0</p>
      </div>

      {/* Addresses Sheet - Mobile Bottom Drawer, Desktop Side Panel */}
      <Sheet open={showAddressesSheet} onOpenChange={setShowAddressesSheet}>
        <SheetContent
          side={isRTL ? 'right' : 'left'}
          className={`${
            typeof window !== 'undefined' && window.innerWidth < 768
              ? 'h-[90vh] rounded-t-3xl'
              : 'sm:max-w-lg'
          } p-0 bg-gray-50`}
        >
          <SheetHeader className="p-6 bg-white border-b sticky top-0 z-10">
            <SheetTitle>{isRTL ? 'عناوين الشحن' : 'Shipping Addresses'}</SheetTitle>
            <SheetDescription>
              {isRTL ? 'قم بإدارة عناوين التوصيل الخاصة بك هنا.' : 'Manage your delivery addresses here.'}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-180px)] sm:h-[calc(100vh-140px)] p-6">
            <div className="space-y-4 pb-20">
              {addresses.length > 0 ? (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-purple-200 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="mt-1 bg-purple-50 p-2 rounded-full">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{addr.city}</p>
                            {addr.is_default && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700 text-xs flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                {isRTL ? 'الافتراضي' : 'Default'}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {addr.address_line1}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {addr.state}, {addr.postal_code}, {addr.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                          onClick={() => handleEditAddress(addr)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setAddressToDelete(addr)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    {isRTL ? 'لا توجد عناوين محفوظة' : 'No addresses saved'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-base rounded-xl shadow-lg shadow-purple-200"
              onClick={handleAddAddress}
            >
              <Plus className="w-5 h-5 mr-2" />
              {isRTL ? 'إضافة عنوان جديد' : 'Add New Address'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modals */}
      <EditProfileModal
        user={user}
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        onSave={refetchUser}
      />
      <ChangePasswordModal open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
      <AddressForm
        address={addressToEdit}
        open={showAddressForm}
        onOpenChange={setShowAddressForm}
        onSave={() => {
          fetchAddresses();
        }}
      />
      <AlertDialog open={!!addressToDelete} onOpenChange={() => setAddressToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ProfilePage.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('ProfilePage.deleteDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteAddress}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}