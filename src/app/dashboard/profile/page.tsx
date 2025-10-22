// app/dashboard/profile/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Shield,
  Phone,
  Crown,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Camera,
  ShoppingBag,
  Heart,
  CreditCard,
  Save,
  Mail,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AxiosError } from 'axios';

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

// --- AddressForm Component ---
const AddressForm = ({
  address,
  onSave,
  children,
}: {
  address?: Address | null;
  onSave: () => void;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation(); // ✅ Use 'profile' namespace
  const [isOpen, setIsOpen] = useState(false);
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
    if (isOpen) {
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
  }, [address, isOpen, form]);

  const onSubmit = async (values: AddressFormValues) => {
    const promise = values.id
      ? api.put(`/customer/addresses/${values.id}`, values)
      : api.post('/customer/addresses', values);
    toast.promise(promise, {
      loading: t('common.saving'),
      success: () => {
        onSave();
        setIsOpen(false);
        return t('ProfilePage.toasts.addressSaved');
      },
      error: (err) => err.response?.data?.message || t('common.error'),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {address
              ? t('ProfilePage.addressForm.editTitle')
              : t('ProfilePage.addressForm.addTitle')}
          </DialogTitle>
        </DialogHeader>
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
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 cursor-pointer">
                    {t('ProfilePage.addressForm.isDefault')}
                  </FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
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

// --- Main Profile Page Component ---
export default function ProfilePage() {
  const { user, fetchUser, loading: authLoading } = useAuth();
  const { t } = useTranslation(); // ✅ Use 'profile' namespace
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const profileForm = useForm<ProfileFormValues>();

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    try {
      const response = await api.get('/customer/addresses');
      setAddresses(response.data);
    } catch (error) {
      toast.error(t('ProfilePage.toasts.loadAddressesError'));
    }
  }, [t]);

  // Initialize form data
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
      fetchAddresses();
    }
  }, [user, profileForm, fetchAddresses]);

  // Handle profile update (legacy form fallback)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone_number') as string;
    const address = formData.get('address') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password && password !== confirmPassword) {
      setError(t('ProfilePage.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = { name, email, phone, address };
      if (password) payload.password = password;

      const response = await api.put('/users/profile', payload);
      setMessage(response.data.message || t('ProfilePage.updateSuccess'));
      fetchUser(); // Refresh user data
    } catch (error) {
      if (error instanceof AxiosError) {
        setError(error.response?.data?.message || t('ProfilePage.updateError'));
      } else {
        setError(t('ProfilePage.updateError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile picture upload
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
    toast.promise(
      api.post('/users/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      {
        loading: t('ProfilePage.toasts.uploading'),
        success: () => {
          fetchUser();
          return t('ProfilePage.toasts.pictureUpdated');
        },
        error: (err) => err.response?.data?.message || t('common.error'),
      }
    );
  };

  // Confirm delete address
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

  // Role badge mapping
  const getRoleBadge = (roleId: number) => {
    const roles = {
      1: { label: t('roles.supervisor'), color: 'bg-purple-100 text-purple-800' },
      2: { label: t('roles.merchant'), color: 'bg-rose-100 text-rose-800' },
      3: { label: t('roles.model'), color: 'bg-blue-100 text-blue-800' },
      4: { label: t('roles.influencer'), color: 'bg-amber-100 text-amber-800' },
      5: { label: t('roles.customer'), color: 'bg-green-100 text-green-800' },
    };
    return (roles as any)[roleId] || { label: t('roles.user'), color: 'bg-gray-100 text-gray-800' };
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t('common.loading')}...</p>
      </div>
    );
  }

  const roleBadge = getRoleBadge(user.role_id);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{t('ProfilePage.title')}</h1>
          <p className="text-gray-500">{t('ProfilePage.subtitle')}</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl sticky top-24">
              <CardContent className="p-6">
                {/* Profile Picture */}
                <div className="text-center mb-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={user.profile_picture_url || undefined}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white text-3xl font-bold">
                        {user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-purple-600 text-white p-1.5 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
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
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <Badge className={`${roleBadge.color} px-3 py-1 mt-3 border-0`}>
                    <Crown className="w-3 h-3 ml-1" />
                    {roleBadge.label}
                  </Badge>
                </div>

                {/* Navigation Tabs */}
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                      activeTab === 'personal'
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>{t('ProfilePage.tabs.personal')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                      activeTab === 'contact'
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    <span>{t('ProfilePage.tabs.contact')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                      activeTab === 'addresses'
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                    <span>{t('ProfilePage.tabs.addresses')}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 ${
                      activeTab === 'security'
                        ? 'bg-purple-100 text-purple-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    <span>{t('ProfilePage.tabs.security')}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('ProfilePage.tabs.personal')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('ProfilePage.fields.fullName')}</Label>
                      <Input id="name" name="name" defaultValue={user.name} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('ProfilePage.fields.email')}</Label>
                      <Input id="email" name="email" type="email" defaultValue={user.email} required />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Contact Info Tab */}
              {activeTab === 'contact' && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('ProfilePage.tabs.contact')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">{t('ProfilePage.fields.phone')}</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        defaultValue={user.phone || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">{t('ProfilePage.fields.shippingAddress')}</Label>
                      <Input
                        id="address"
                        name="address"
                        defaultValue={user.address || ''}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        {t('ProfilePage.addressList.title')}
                      </CardTitle>
                      <CardDescription>
                        {t('ProfilePage.addressList.description')}
                      </CardDescription>
                    </div>
                    <AddressForm onSave={fetchAddresses}>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" />
                        {t('ProfilePage.addressList.addNew')}
                      </Button>
                    </AddressForm>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {addresses.length > 0 ? (
                      addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex gap-3 flex-1">
                              <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-gray-900">
                                    {addr.address_line1}, {addr.city}
                                  </p>
                                  {addr.is_default && (
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                      {t('ProfilePage.addressList.default')}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {addr.state}, {addr.postal_code}, {addr.country}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1 ml-4">
                              <AddressForm address={addr} onSave={fetchAddresses}>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </AddressForm>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setAddressToDelete(addr)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">{t('ProfilePage.addressList.empty')}</p>
                        <AddressForm onSave={fetchAddresses}>
                          <Button variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            {t('ProfilePage.addressList.addFirst')}
                          </Button>
                        </AddressForm>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-3xl">
                  <CardHeader>
                    <CardTitle>{t('ProfilePage.tabs.security')}</CardTitle>
                    <CardDescription>{t('ProfilePage.passwordInstructions')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">{t('ProfilePage.newPassword')}</Label>
                      <Input id="password" name="password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">{t('ProfilePage.confirmPassword')}</Label>
                      <Input id="confirmPassword" name="confirmPassword" type="password" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Submit & Messages */}
              {(activeTab === 'personal' ||
                activeTab === 'contact' ||
                activeTab === 'security') && (
                <div className="p-6 pt-0">
                  {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
                  {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-700"
                    >
                      {isLoading ? t('ProfilePage.saving') : t('ProfilePage.saveChanges')}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
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
    </div>
  );
}