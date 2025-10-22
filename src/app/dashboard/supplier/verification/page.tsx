'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  User,
  CreditCard,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import SupplierNav from '@/components/dashboards/SupplierNav';

// ✅ Safe Zod schema: avoid FileList on server
const verificationSchema = z.object({
  identity_number: z.string().min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل'),
  business_name: z
    .string()
    .min(2, 'اسم المؤسسة يجب أن يكون حرفين على الأقل')
    .optional()
    .or(z.literal('')),
  account_number: z.string().min(1, 'رقم الحساب البنكي مطلوب'),
  iban: z.string().min(15, 'رقم الآيبان مطلوب'),
  // ✅ Use z.any() — validate files manually in onSubmit
  identity_image: z.any(),
  business_license: z.any().optional(),
  iban_certificate: z.any(),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function SupplierVerificationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const watchedFiles = watch(['identity_image', 'business_license', 'iban_certificate']);

  const onSubmit = async (data: VerificationFormData) => {
    // ✅ Manual file validation (safe for SSR)
    if (!data.identity_image || !(data.identity_image instanceof FileList) || data.identity_image.length !== 1) {
      toast.error('خطأ في الإرسال', { description: 'صورة الهوية مطلوبة.' });
      return;
    }
    if (!data.iban_certificate || !(data.iban_certificate instanceof FileList) || data.iban_certificate.length !== 1) {
      toast.error('خطأ في الإرسال', { description: 'شهادة الآيبان مطلوبة.' });
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('identity_number', data.identity_number);
    formData.append('business_name', data.business_name || '');
    formData.append('account_number', data.account_number);
    formData.append('iban', data.iban);
    formData.append('identity_image', data.identity_image[0]);
    formData.append('iban_certificate', data.iban_certificate[0]);

    if (data.business_license && data.business_license instanceof FileList && data.business_license.length > 0) {
      formData.append('business_license', data.business_license[0]);
    }

    try {
      const response = await api.post('/supplier/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            setUploadProgress(progress);
          }
        },
      });

      toast.success('تم الإرسال بنجاح', {
        description: response.data.message || 'سيتم مراجعة طلبك وإعلامك قريباً.',
      });

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (error) {
      let errorMessage = 'فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.';
      if (error instanceof Error) {
        if ('response' in error && error.response) {
          const axiosError = error as { response?: { data?: { message?: string } } };
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
      }
      toast.error('خطأ في الإرسال', { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadField = ({
    name,
    label,
    required = false,
  }: {
    name: keyof VerificationFormData;
    label: string;
    required?: boolean;
  }) => (
    <div>
      <Label htmlFor={name} className="font-medium">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="mt-2 flex items-center gap-4">
        <Input
          id={name}
          type="file"
          className="hidden"
          {...register(name)}
        />
        <Label htmlFor={name} className="cursor-pointer flex-grow">
          <div className="border-2 border-dashed rounded-md p-3 text-center text-sm text-gray-500 hover:bg-gray-50">
            {watchedFiles[
              name === 'identity_image' ? 0 : name === 'business_license' ? 1 : 2
            ]?.[0]?.name || 'انقر لاختيار ملف'}
          </div>
        </Label>
      </div>
      {errors[name] && (
        <p className="text-red-500 text-xs mt-1">
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <SupplierNav />
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center bg-gray-100 p-6">
            <Shield className="mx-auto h-12 w-12 text-purple-600" />
            <CardTitle className="text-2xl font-bold mt-2">
              توثيق حساب المورد
            </CardTitle>
            <CardDescription>
              يرجى تقديم المعلومات والمستندات التالية لبدء العمل كمورد دروبشيبينغ على منصتنا.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Section 1: Personal/Business Info */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User /> معلومات الهوية والعمل
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="رقم الهوية / الإقامة*"
                    {...register('identity_number')}
                  />
                  <Input
                    placeholder="اسم المؤسسة (اختياري)"
                    {...register('business_name')}
                  />
                </div>
                {errors.identity_number && (
                  <p className="text-red-500 text-xs">
                    {errors.identity_number.message}
                  </p>
                )}
                <FileUploadField
                  name="identity_image"
                  label="صورة الهوية / الإقامة"
                  required
                />
                <FileUploadField
                  name="business_license"
                  label="السجل التجاري (اختياري)"
                />
              </section>

              {/* Section 2: Bank Info */}
              <section className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <CreditCard /> المعلومات البنكية
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    placeholder="رقم الحساب البنكي*"
                    {...register('account_number')}
                  />
                  <Input
                    placeholder="رقم الآيبان (IBAN)*"
                    {...register('iban')}
                  />
                </div>
                {errors.account_number && (
                  <p className="text-red-500 text-xs">
                    {errors.account_number.message}
                  </p>
                )}
                {errors.iban && (
                  <p className="text-red-500 text-xs">{errors.iban.message}</p>
                )}
                <FileUploadField
                  name="iban_certificate"
                  label="شهادة الآيبان"
                  required
                />
              </section>

              {/* Submission Section */}
              {isSubmitting && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-center text-gray-600">
                    جاري رفع المستندات...
                  </p>
                </div>
              )}

              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>ملاحظة هامة</AlertTitle>
                <AlertDescription>
                  سيتم مراجعة طلبك خلال 24-48 ساعة عمل. تأكد من أن جميع المستندات واضحة وصحيحة لتجنب التأخير.
                </AlertDescription>
              </Alert>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <ArrowRight className="mr-2 h-5 w-5" />
                    إرسال طلب التوثيق
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}