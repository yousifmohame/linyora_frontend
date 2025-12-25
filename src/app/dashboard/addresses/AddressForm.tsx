'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, MapPin, User, Building, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

// Dynamically import MapPicker (SSR disabled)
const MapPicker = dynamic(
  () => import('@/components/ui/MapPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-gray-400 text-sm">
        جاري تحميل الخريطة...
      </div>
    ),
  }
);

// Form Schema (matches your frontend inputs)
const addressSchema = z.object({
  full_name: z.string().min(3, 'الاسم قصير جداً'),
  address_line_1: z.string().min(5, 'العنوان مطلوب'),
  address_line_2: z.string().optional().nullable(),
  city: z.string().min(2, 'المدينة مطلوبة'),
  state_province_region: z.string().min(2, 'المنطقة مطلوبة'),
  postal_code: z.string().min(4, 'الرمز البريدي غير صحيح'),
  country: z.string().min(2, 'الدولة مطلوبة'),
  phone_number: z.string().min(9, 'رقم الهاتف مطلوب'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const isEditing = !!address;
  const [isGeocoding, setIsGeocoding] = useState(false);

  // 1. Setup Form with intelligent default values (Handling snake_case vs camelCase)
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: address?.fullName || address?.full_name || '',
      address_line_1: address?.addressLine1 || address?.address_line_1 || '',
      address_line_2: address?.addressLine2 || address?.address_line_2 || '',
      city: address?.city || '',
      state_province_region: address?.state || address?.state_province_region || '',
      postal_code: address?.postalCode || address?.postal_code || '',
      country: address?.country || 'المملكة العربية السعودية',
      phone_number: address?.phoneNumber || address?.phone_number || '',
      latitude: address?.latitude ? Number(address.latitude) : 24.7136,
      longitude: address?.longitude ? Number(address.longitude) : 46.6753,
    },
  });

  const handleLocationSelect = async (lat: number, lng: number) => {
    form.setValue('latitude', lat);
    form.setValue('longitude', lng);
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      if (data?.address) {
        const addr = data.address;
        form.setValue('country', addr.country || 'المملكة العربية السعودية');
        form.setValue('city', addr.city || addr.town || addr.village || addr.county || '');
        form.setValue('state_province_region', addr.state || addr.region || '');
        form.setValue('postal_code', addr.postcode || '');
        
        const street = addr.road || addr.pedestrian || addr.street || '';
        const house = addr.house_number ? `مبنى ${addr.house_number}` : '';
        const district = addr.suburb || addr.neighbourhood || '';
        
        const fullAddress = [street, house, district].filter(Boolean).join('، ');
        form.setValue('address_line_1', fullAddress || 'تم تحديد الموقع على الخريطة');
        
        toast.success('تم ملء العنوان تلقائياً من الخريطة');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      toast.error('فشل في جلب تفاصيل العنوان من الخريطة');
    } finally {
      setIsGeocoding(false);
    }
  };

  // 2. Submit Logic with Conversion (snake_case -> camelCase)
  const onSubmit = async (data: AddressFormData) => {
    try {
      // Convert to Backend Format
      const payload = {
        fullName: data.full_name,
        addressLine1: data.address_line_1,
        addressLine2: data.address_line_2,
        city: data.city,
        state: data.state_province_region,
        postalCode: data.postal_code,
        country: data.country,
        phoneNumber: data.phone_number,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: address?.isDefault || false // Maintain existing status
      };

      if (isEditing && address?.id) {
        await api.put(`/users/addresses/${address.id}`, payload);
      } else {
        await api.post('/users/addresses', payload);
      }
      
      toast.success(isEditing ? 'تم تحديث العنوان' : 'تم إضافة العنوان بنجاح');
      onSuccess();
    } catch (error: any) {
      console.error("Save Address Error:", error);
      const msg = error.response?.data?.message || 'حدث خطأ أثناء الحفظ';
      toast.error(msg);
    }
  };

  return (
    <Card className="w-full max-w-5xl mx-auto border-none shadow-xl bg-white/95 backdrop-blur overflow-hidden flex flex-col h-full md:h-auto">
      <CardHeader className="bg-slate-50 border-b border-gray-100 pb-4 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
              <MapPin className="text-blue-600 h-5 w-5" />
              {isEditing ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
            </CardTitle>
            <CardDescription className="mt-1">
              حدد موقعك على الخريطة أو أدخل البيانات يدوياً
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-hidden">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col lg:flex-row h-full">
            
            {/* LEFT SIDE: Form Inputs */}
            {/* On Mobile: Order 2 (Below Map). On Desktop: Order 1 (Left) */}
            <div className="w-full lg:w-7/12 p-6 space-y-6 overflow-y-auto order-2 lg:order-1 max-h-[60vh] lg:max-h-[70vh]">
              
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <User className="w-4 h-4 text-slate-500" />
                  بيانات المستلم
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم كما في الهوية" {...field} className="bg-slate-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input placeholder="05xxxxxxxx" {...field} className="bg-slate-50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Building className="w-4 h-4 text-slate-500" />
                  تفاصيل الموقع
                </h3>
                
                {isGeocoding && (
                  <div className="text-xs text-blue-600 flex items-center gap-2 animate-pulse mb-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    جاري ملء البيانات من الخريطة...
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="address_line_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم الشارع / الحي</FormLabel>
                      <FormControl>
                        <Input placeholder="سيتم تعبئته تلقائياً من الخريطة" {...field} className="bg-slate-50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المدينة</FormLabel>
                        <FormControl>
                          <Input placeholder="الرياض" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الرمز البريدي</FormLabel>
                        <FormControl>
                          <Input placeholder="11543" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address_line_2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تفاصيل إضافية (اختياري)</FormLabel>
                      <FormControl>
                        <Input placeholder="رقم الشقة، الدور، علامة مميزة..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="state_province_region"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>المنطقة / المحافظة</FormLabel>
                        <FormControl>
                            <Input placeholder="الرياض" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>الدولة</FormLabel>
                        <FormControl>
                            <Input placeholder="المملكة العربية السعودية" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: Map */}
            {/* On Mobile: Order 1 (Top). On Desktop: Order 2 (Right) */}
            <div className="w-full lg:w-5/12 bg-slate-100 border-b lg:border-b-0 lg:border-l border-gray-200 order-1 lg:order-2 h-[300px] lg:h-auto shrink-0 relative">
              <div className="absolute inset-0 p-4 flex flex-col">
                <div className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1 shrink-0">
                  <MapPin className="w-4 h-4" />
                  حدد موقعك على الخريطة
                </div>
                <div className="flex-1 rounded-xl overflow-hidden shadow-sm border border-white/50 relative z-0">
                  {/* Provide lat/lng to MapPicker if editing */}
                  <MapPicker 
                    onLocationSelect={handleLocationSelect} 
                    initialLat={address?.latitude ? Number(address.latitude) : undefined}
                    initialLng={address?.longitude ? Number(address.longitude) : undefined}
                  />
                </div>
              </div>
            </div>

          </form>
        </Form>
      </CardContent>

      {/* Footer Buttons */}
      <div className="p-6 bg-slate-50 border-t flex flex-col-reverse sm:flex-row justify-between items-center gap-3 shrink-0">
        <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="w-full sm:w-auto"
        >
          إلغاء
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          type="button"
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white min-w-[150px]"
          disabled={form.formState.isSubmitting || isGeocoding}
        >
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin ml-2" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 ml-2" />
              {isEditing ? 'تحديث العنوان' : 'حفظ العنوان'}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}