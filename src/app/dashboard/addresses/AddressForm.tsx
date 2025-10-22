'use client';

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
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Loader2, MapPin, User, Home, Navigation, Phone, Building, Mailbox, Globe } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

// Define the shape of an address object
interface Address {
  id?: number;
  full_name: string;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  state_province_region: string;
  postal_code: string;
  country: string;
  phone_number: string;
}

// Enhanced validation schema with Arabic messages
const addressSchema = z.object({
  full_name: z.string()
    .min(3, { message: 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل' })
    .max(100, { message: 'الاسم الكامل يجب أن لا يتجاوز 100 حرف' }),
  address_line_1: z.string()
    .min(5, { message: 'عنوان الشارع مطلوب (5 أحرف على الأقل)' })
    .max(200, { message: 'عنوان الشارع يجب أن لا يتجاوز 200 حرف' }),
  address_line_2: z.string().optional().nullable(),
  city: z.string()
    .min(2, { message: 'اسم المدينة مطلوب' })
    .max(50, { message: 'اسم المدينة يجب أن لا يتجاوز 50 حرف' }),
  state_province_region: z.string()
    .min(2, { message: 'اسم المنطقة أو المحافظة مطلوب' })
    .max(50, { message: 'اسم المنطقة يجب أن لا يتجاوز 50 حرف' }),
  postal_code: z.string()
    .min(4, { message: 'الرمز البريدي مطلوب (4 أرقام على الأقل)' })
    .max(10, { message: 'الرمز البريدي يجب أن لا يتجاوز 10 أرقام' })
    .regex(/^\d+$/, { message: 'الرمز البريدي يجب أن يحتوي على أرقام فقط' }),
  country: z.string()
    .min(2, { message: 'اسم الدولة مطلوب' })
    .max(50, { message: 'اسم الدولة يجب أن لا يتجاوز 50 حرف' }),
  phone_number: z.string()
    .min(9, { message: 'رقم الهاتف مطلوب (9 أرقام على الأقل)' })
    .max(15, { message: 'رقم الهاتف يجب أن لا يتجاوز 15 رقماً' })
    .regex(/^[\d\s\-\+\(\)]+$/, { message: 'رقم هاتف صحيح مطلوب' }),
});

type AddressFormData = z.infer<typeof addressSchema>;

// Define the component's props
interface AddressFormProps {
  address?: Address | null;
  onSuccess: () => void;
  onCancel: () => void;
}

// Common Saudi cities and regions for better UX
const saudiCities = ['الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الطائف', 'تبوك', 'بريدة', 'حائل'];
const saudiRegions = ['منطقة الرياض', 'منطقة مكة', 'منطقة المدينة', 'المنطقة الشرقية', 'منطقة عسير', 'منطقة تبوك', 'منطقة الجوف'];

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const isEditing = !!address;

  // Initialize the form
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      full_name: address?.full_name || '',
      address_line_1: address?.address_line_1 || '',
      address_line_2: address?.address_line_2 || '',
      city: address?.city || '',
      state_province_region: address?.state_province_region || '',
      postal_code: address?.postal_code || '',
      country: address?.country || 'المملكة العربية السعودية',
      phone_number: address?.phone_number || '',
    },
    mode: 'onChange',
  });

  // Handle form submission
  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEditing) {
        await api.put(`/users/addresses/${address.id}`, {
          ...data,
          state: data.state_province_region,
        });
        toast.success('تم تحديث العنوان بنجاح', {
          description: 'تم تحديث معلومات العنوان الخاص بك'
        });
      } else {
        await api.post('/users/addresses', {
          ...data,
          fullName: data.full_name,
          addressLine1: data.address_line_1,
          addressLine2: data.address_line_2,
          state: data.state_province_region,
          postalCode: data.postal_code,
          phoneNumber: data.phone_number,
        });
        toast.success('تم إضافة العنوان بنجاح', {
          description: 'يمكنك الآن استخدام هذا العنوان للشحن'
        });
      }
      onSuccess();
    } catch (error) {
        console.error('Failed to save address:', error);
        let errorMessage = 'فشل في حفظ العنوان. الرجاء المحاولة مرة أخرى.';

        // Type guard for Axios error
        if (error && typeof error === 'object' && 'response' in error) {
            const err = error as { response?: { data?: { message?: string } } };
            errorMessage = err.response?.data?.message || errorMessage;
        }

        toast.error('خطأ في الحفظ', {
            description: errorMessage
        });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <div className="animate-in fade-in duration-500">
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Personal Information Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  المعلومات الشخصية
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          الاسم الكامل
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="ادخل اسمك الكامل كما في الهوية" 
                            {...field}
                            className="h-11 transition-colors focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          رقم الهاتف
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="مثال: 0551234567" 
                            {...field}
                            className="h-11 transition-colors focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address Details Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Home className="w-4 h-4 text-green-600" />
                  تفاصيل العنوان
                </div>

                <FormField
                  control={form.control}
                  name="address_line_1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-500" />
                        العنوان الرئيسي
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="اسم الشارع، رقم المبنى، الحي" 
                          {...field}
                          className="h-11 transition-colors focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address_line_2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-gray-600">
                        <Home className="w-4 h-4 text-gray-400" />
                        العنوان الإضافي (اختياري)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="رقم الشقة، الطابق، رقم الوحدة" 
                          {...field}
                          value={field.value ?? ''}
                          className="h-11 transition-colors focus:border-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-500" />
                          المدينة
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="اختر المدينة" 
                              {...field}
                              className="h-11 transition-colors focus:border-blue-500"
                              list="cities"
                            />
                            <datalist id="cities">
                              {saudiCities.map(city => (
                                <option key={city} value={city} />
                              ))}
                            </datalist>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state_province_region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-gray-500" />
                          المنطقة
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="اختر المنطقة" 
                              {...field}
                              className="h-11 transition-colors focus:border-blue-500"
                              list="regions"
                            />
                            <datalist id="regions">
                              {saudiRegions.map(region => (
                                <option key={region} value={region} />
                              ))}
                            </datalist>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mailbox className="w-4 h-4 text-gray-500" />
                          الرمز البريدي
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="مثال: 11564" 
                            {...field}
                            className="h-11 transition-colors focus:border-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-500" />
                        الدولة
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="مثال: المملكة العربية السعودية" 
                          {...field}
                          className="h-11 transition-colors focus:border-blue-500 bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="h-11 px-6 flex-1 sm:flex-none"
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !form.formState.isValid}
                  className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <MapPin className="ml-2 h-4 w-4" />
                      {isEditing ? 'تحديث العنوان' : 'إضافة العنوان'}
                    </>
                  )}
                </Button>
              </div>

              {/* Form Status */}
              {form.formState.isValid && !form.formState.errors.root && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 text-center">
                    ✓ جميع الحقول صحيحة وجاهزة للحفظ
                  </p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}