'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  User, 
  Building, 
  CreditCard, 
  Shield, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

// ✅ SAFE SCHEMA: Avoid FileList on server
const verificationSchema = z.object({
  identity_number: z.string()
    .min(10, 'رقم الهوية يجب أن يكون 10 أرقام على الأقل')
    .max(20, 'رقم الهوية يجب ألا يتجاوز 20 رقماً')
    .regex(/^\d+$/, 'رقم الهوية يجب أن يحتوي على أرقام فقط'),
  
  business_name: z.string()
    .min(2, 'اسم المؤسسة يجب أن يكون حرفين على الأقل')
    .max(100, 'اسم المؤسسة يجب ألا يتجاوز 100 حرف')
    .optional()
    .or(z.literal('')),
  
  account_number: z.string()
    .min(1, 'رقم الحساب البنكي مطلوب')
    .max(30, 'رقم الحساب البنكي يجب ألا يتجاوز 30 رقماً')
    .regex(/^\d+$/, 'رقم الحساب البنكي يجب أن يحتوي على أرقام فقط'),
  
  iban: z.string()
    .min(15, 'رقم الآيبان يجب أن يكون 15 حرفاً على الأقل')
    .max(34, 'رقم الآيبان يجب ألا يتجاوز 34 حرفاً')
    .regex(/^[A-Z0-9]+$/, 'رقم الآيبان يجب أن يحتوي على أحرف إنجليزية وأرقام فقط'),
  
  // ✅ Use z.any() — validate manually in onSubmit
  identity_image: z.any(),
  business_license: z.any().optional(),
  iban_certificate: z.any(),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

export default function VerificationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{[key: string]: string}>({});
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema)
  });

  const watchedFiles = watch(['identity_image', 'business_license', 'iban_certificate']);

  const handleFileChange = (fieldName: string, files: FileList) => {
    if (files && files[0]) {
      const fileName = files[0].name;
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: fileName
      }));
    }
  };

  const onSubmit = async (data: VerificationFormData) => {
    // ✅ MANUAL FILE VALIDATION (safe in browser only)
    const fileErrors: string[] = [];

    // Validate identity_image
    if (!data.identity_image || !(data.identity_image instanceof FileList) || data.identity_image.length !== 1) {
      fileErrors.push('صورة الهوية مطلوبة');
    } else {
      const idFile = data.identity_image[0];
      if (idFile.size > 5 * 1024 * 1024) {
        fileErrors.push('حجم صورة الهوية يجب ألا يتجاوز 5MB');
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(idFile.type)) {
        fileErrors.push('يجب أن تكون صورة الهوية بصيغة JPEG, JPG, أو PNG');
      }
    }

    // Validate iban_certificate
    if (!data.iban_certificate || !(data.iban_certificate instanceof FileList) || data.iban_certificate.length !== 1) {
      fileErrors.push('شهادة الآيبان مطلوبة');
    } else {
      const ibanFile = data.iban_certificate[0];
      if (ibanFile.size > 5 * 1024 * 1024) {
        fileErrors.push('حجم شهادة الآيبان يجب ألا يتجاوز 5MB');
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(ibanFile.type)) {
        fileErrors.push('يجب أن تكون شهادة الآيبان بصيغة PDF, JPEG, JPG, أو PNG');
      }
    }

    // Validate business_license (optional)
    if (data.business_license && data.business_license instanceof FileList && data.business_license.length > 0) {
      const licenseFile = data.business_license[0];
      if (licenseFile.size > 5 * 1024 * 1024) {
        fileErrors.push('حجم السجل التجاري يجب ألا يتجاوز 5MB');
      }
      if (!['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(licenseFile.type)) {
        fileErrors.push('يجب أن يكون السجل التجاري بصيغة PDF, JPEG, JPG, أو PNG');
      }
    }

    if (fileErrors.length > 0) {
      fileErrors.forEach(err => {
        toast.error('خطأ في الملفات', { description: err });
      });
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
      const response = await api.post('/merchants/verification', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100;
            setUploadProgress(progress);
          }
        }
      });
      
      toast.success("تم الإرسال بنجاح", { 
        description: response.data.message || 'تم تقديم طلب التوثيق بنجاح وسيتم مراجعته خلال 24-48 ساعة.' 
      });
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      const errorMessage = 
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
        || 'فشل في تقديم الطلب. يرجى المحاولة مرة أخرى.';
      
      toast.error("خطأ في الإرسال", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadField = ({ 
    name, 
    label, 
    required = false,
    description,
    accept = "image/*,.pdf"
  }: {
    name: keyof VerificationFormData;
    label: string;
    required?: boolean;
    description?: string;
    accept?: string;
  }) => {
    return (
      <div className="space-y-3">
        <Label htmlFor={name} className="flex items-center gap-2 text-sm font-medium">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        
        <div className="flex items-center gap-3">
          <Label 
            htmlFor={name}
            className="flex-1 cursor-pointer"
          >
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-purple-400 transition-colors duration-200 group">
              <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-purple-600">
                <Upload className="w-4 h-4" />
                <span className="text-sm">
                  {uploadedFiles[name] || `اختر ملف ${required ? 'مطلوب' : 'اختياري'}`}
                </span>
              </div>
            </div>
            <Input 
              id={name}
              type="file" 
              className="hidden"
              accept={accept}
              {...register(name, {
                onChange: (e) => handleFileChange(name, e.target.files!)
              })}
            />
          </Label>
        </div>
        
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}
        
        {errors[name] && (
          <p className="text-red-500 text-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errors[name]?.message as string}
          </p>
        )}
      </div>
    );
  };

  const steps = [
    { number: 1, title: 'المعلومات الشخصية', icon: User, completed: true },
    { number: 2, title: 'المعلومات البنكية', icon: CreditCard, completed: false },
    { number: 3, title: 'رفع المستندات', icon: FileText, completed: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">توثيق الحساب كتاجر</h1>
              <p className="text-gray-600 mt-2">أكمل عملية التوثيق لبدء البيع على منصتنا</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`font-medium ${
                    step.completed ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 ${
                    step.completed ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building className="w-6 h-6 text-blue-600" />
              نموذج التوثيق
            </CardTitle>
            <CardDescription className="text-gray-600">
              يرجى ملء جميع الحقول المطلوبة بدقة لتسريع عملية المراجعة
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6">
            <Alert className="mb-8 bg-blue-50 border-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-700 text-sm">
                عملية المراجعة تستغرق عادةً من 24 إلى 48 ساعة. سيتم إعلامك عبر البريد الإلكتروني عند اكتمال المراجعة.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  المعلومات الشخصية
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="identity_number" className="flex items-center gap-2">
                      رقم الهوية / الإقامة
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="identity_number"
                      placeholder="أدخل رقم الهوية أو الإقامة"
                      {...register('identity_number')}
                      className={errors.identity_number ? 'border-red-500' : ''}
                    />
                    {errors.identity_number && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.identity_number.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="business_name" className="flex items-center gap-2">
                      اسم المؤسسة (اختياري)
                    </Label>
                    <Input 
                      id="business_name"
                      placeholder="اسم المؤسسة أو المنشأة"
                      {...register('business_name')}
                    />
                    <p className="text-xs text-gray-500">اتركه فارغاً إذا كنت تاجر فردي</p>
                  </div>
                </div>

                <FileUploadField
                  name="identity_image"
                  label="صورة الهوية / الإقامة"
                  required
                  description="يجب أن تكون الصورة واضحة وتظهر جميع البيانات (JPEG, PNG, JPG - بحد أقصى 5MB)"
                />
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2 text-lg font-semibold text-gray-900 border-b pb-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  المعلومات البنكية
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="account_number" className="flex items-center gap-2">
                      رقم الحساب البنكي
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="account_number"
                      placeholder="رقم الحساب البنكي"
                      {...register('account_number')}
                      className={errors.account_number ? 'border-red-500' : ''}
                    />
                    {errors.account_number && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.account_number.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="iban" className="flex items-center gap-2">
                      رقم الآيبان (IBAN)
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="iban"
                      placeholder="SAXXXXXXXXXXXXXXXXXXXXXXXXXX"
                      {...register('iban')}
                      className={errors.iban ? 'border-red-500' : ''}
                    />
                    {errors.iban && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.iban.message}
                      </p>
                    )}
                  </div>
                </div>

                <FileUploadField
                  name="iban_certificate"
                  label="شهادة الآيبان"
                  required
                  description="شهادة الآيبان من البنك (PDF, JPEG, PNG, JPG - بحد أقصى 5MB)"
                  accept=".pdf,image/*"
                />

                <FileUploadField
                  name="business_license"
                  label="السجل التجاري (اختياري)"
                  description="السجل التجاري للمؤسسة (PDF, JPEG, PNG, JPG - بحد أقصى 5MB)"
                  accept=".pdf,image/*"
                />
              </div>

              {isSubmitting && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">جاري رفع الملفات...</span>
                    <span className="font-medium">{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  رجوع
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin ml-2" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      تقديم للتوثيق
                      <ArrowRight className="w-5 h-5 mr-2" />
                    </>
                  )}
                </Button>
              </div>

              <div className="text-center">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Shield className="w-3 h-3 ml-1" />
                  جميع بياناتك محمية ومشفرة
                </Badge>
                <p className="text-xs text-gray-500 mt-2">
                  نلتزم بحماية خصوصيتك وأمان بياناتك وفقاً لسياسة الخصوصية الخاصة بنا
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}