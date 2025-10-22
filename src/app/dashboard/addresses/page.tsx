'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PlusCircle, 
  Loader2, 
  MapPin, 
  Edit, 
  Trash2, 
  Star, 
  Phone, 
  Building,
  Navigation,
  CheckCircle,
  X
} from 'lucide-react';
import AddressForm from './AddressForm';
import { toast } from 'sonner';

// Address type definition
interface Address {
  id: number;
  full_name: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state_province_region: string;
  postal_code: string;
  country: string;
  phone_number: string;
  is_default: boolean;
}

export default function ManageAddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error('فشل في جلب العناوين', {
        description: 'الرجاء المحاولة مرة أخرى'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedAddress(null);
    fetchAddresses();
    toast.success('تم حفظ العنوان بنجاح', {
      description: 'تم تحديث معلومات العنوان الخاص بك'
    });
  };

  const handleDelete = async (addressId: number) => {
    if (!confirm('هل أنت متأكد من أنك تريد حذف هذا العنوان؟')) return;
    
    setDeletingId(addressId);
    try {
      await api.delete(`/users/addresses/${addressId}`);
      await fetchAddresses();
      toast.success('تم حذف العنوان بنجاح');
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('فشل في حذف العنوان', {
        description: 'الرجاء المحاولة مرة أخرى'
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    setSettingDefaultId(addressId);
    try {
      await api.put(`/users/addresses/${addressId}/default`);
      await fetchAddresses();
      toast.success('تم تعيين العنوان كافتراضي', {
        description: 'سيتم استخدام هذا العنوان للتوصيل'
      });
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error('فشل في تعيين العنوان كافتراضي');
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedAddress(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 py-6 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            إدارة العناوين
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto">
            قم بإدارة عناوين الشحن الخاصة بك لتجربة تسوق أسرع وأسهل
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-4 h-4" />
            <span>العناوين المسجلة: {addresses.length}</span>
          </div>
          
          {!isFormOpen && (
            <Button 
              onClick={() => { setSelectedAddress(null); setIsFormOpen(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2 h-auto"
              size="lg"
            >
              <PlusCircle className="ml-2 h-5 w-5" />
              إضافة عنوان جديد
            </Button>
          )}
        </div>

        {/* Address Form Section */}
        {isFormOpen && (
          <div className="mb-8 animate-in fade-in duration-300">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  {selectedAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseForm}
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                <AddressForm
                  address={selectedAddress}
                  onSuccess={handleFormSuccess}
                  onCancel={handleCloseForm}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, index) => (
              <Card key={index} className="border-0 shadow-sm animate-pulse">
                <CardHeader className="pb-4">
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : addresses.length > 0 ? (
          /* Addresses Grid */
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {addresses
              .sort((a, b) => (b.is_default ? 1 : -1))
              .map((addr) => (
                <Card 
                  key={addr.id} 
                  className={`
                    border-2 transition-all duration-300 hover:shadow-lg group
                    ${addr.is_default 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' 
                      : 'border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Navigation className="w-4 h-4 text-blue-600" />
                        {addr.full_name}
                      </CardTitle>
                      <div className="flex gap-2">
                        {addr.is_default && (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            افتراضي
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4 space-y-3">
                    <div className="space-y-2 text-sm text-gray-700">
                      <p className="font-medium flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-gray-500" />
                        {addr.address_line_1}
                      </p>
                      {addr.address_line_2 && (
                        <p className="text-gray-600">{addr.address_line_2}</p>
                      )}
                      <p className="text-gray-600">
                        {addr.city}, {addr.state_province_region}, {addr.postal_code}
                      </p>
                      <p className="text-gray-600">{addr.country}</p>
                      <p className="flex items-center gap-2 text-gray-600 mt-2">
                        <Phone className="w-3 h-3 text-gray-500" />
                        {addr.phone_number}
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedAddress(addr); setIsFormOpen(true); }}
                      className="flex-1 min-w-[80px]"
                    >
                      <Edit className="ml-1 w-3 h-3" />
                      تعديل
                    </Button>
                    
                    {!addr.is_default && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSetDefault(addr.id)}
                        disabled={settingDefaultId === addr.id}
                        className="flex-1 min-w-[100px]"
                      >
                        {settingDefaultId === addr.id ? (
                          <Loader2 className="ml-1 w-3 h-3 animate-spin" />
                        ) : (
                          <Star className="ml-1 w-3 h-3" />
                        )}
                        تعيين افتراضي
                      </Button>
                    )}
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id || addr.is_default}
                      className="flex-1 min-w-[80px]"
                    >
                      {deletingId === addr.id ? (
                        <Loader2 className="ml-1 w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="ml-1 w-3 h-3" />
                      )}
                      حذف
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        ) : (
          /* Empty State */
          !isFormOpen && (
            <Card className="text-center py-12 border-2 border-dashed border-gray-300 bg-white/50 backdrop-blur-sm">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  لم تقم بإضافة أي عناوين شحن بعد
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto text-sm">
                  قم بإضافة عنوان الشحن الأول الخاص بك لتتمكن من إتمام عمليات الشراء بسهولة
                </p>
                <Button 
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="ml-2 h-4 w-4" />
                  إضافة أول عنوان
                </Button>
              </CardContent>
            </Card>
          )
        )}

        {/* Help Text */}
        {addresses.length > 0 && !isFormOpen && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
              <MapPin className="w-4 h-4" />
              يمكنك إضافة حتى 5 عناوين شحن مختلفة
            </p>
          </div>
        )}
      </div>
    </div>
  );
}