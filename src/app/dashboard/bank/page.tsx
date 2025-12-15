'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import Image from 'next/image';
import { 
  Landmark, 
  CreditCard, 
  User, 
  UploadCloud, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navigation from '@/components/dashboards/Navigation';

interface BankDetails {
  bank_name: string;
  account_holder_name: string;
  iban: string;
  account_number: string;
  iban_certificate_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
}

export default function BankSettingsPage() {
  const [formData, setFormData] = useState<BankDetails>({
    bank_name: '',
    account_holder_name: '',
    iban: '',
    account_number: '',
    iban_certificate_url: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const res = await api.get('/bank/details');
      if (res.data) {
        setFormData(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setIsUploading(true);
    
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file); // تأكد أن الباك إند يقبل 'image' أو 'file'

    try {
      const res = await api.post('/upload', uploadData);
      setFormData(prev => ({ ...prev, iban_certificate_url: res.data.imageUrl }));
      toast.success("تم رفع الشهادة بنجاح");
    } catch (error) {
      toast.error("فشل رفع الملف");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/bank/details', formData);
      toast.success("تم حفظ البيانات وإرسالها للمراجعة");
      fetchBankDetails(); // تحديث الحالة
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusAlert = () => {
    if (!formData.iban) return null;
    
    if (formData.status === 'approved') {
      return (
        <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>الحساب موثق</AlertTitle>
          <AlertDescription>بياناتك البنكية موثقة وجاهزة لاستقبال التحويلات.</AlertDescription>
        </Alert>
      );
    }
    if (formData.status === 'rejected') {
      return (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>تم رفض البيانات</AlertTitle>
          <AlertDescription>السبب: {formData.rejection_reason || 'يرجى التأكد من صحة البيانات ووضوح الشهادة.'}</AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert className="bg-amber-50 border-amber-200 text-amber-800 mb-6">
        <ClockIcon className="h-4 w-4" />
        <AlertTitle>قيد المراجعة</AlertTitle>
        <AlertDescription>جاري مراجعة بياناتك البنكية من قبل الإدارة. قد يستغرق ذلك 24 ساعة.</AlertDescription>
      </Alert>
    );
  };

  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      
      <Navigation />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تفاصيل الحساب البنكي</h1>
        <p className="text-gray-500">قم بإدارة حسابك البنكي لاستقبال الأرباح والمدفوعات.</p>
      </div>

      {getStatusAlert()}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-rose-500" />
              المعلومات الأساسية
            </CardTitle>
            <CardDescription>يرجى إدخال البيانات كما هي في شهادة الآيبان</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>اسم البنك</Label>
                <div className="relative">
                  <Landmark className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="مثال: مصرف الراجحي" 
                    className="pr-10"
                    value={formData.bank_name}
                    onChange={e => setFormData({...formData, bank_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>اسم صاحب الحساب</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="الاسم الثلاثي كما في البطاقة" 
                    className="pr-10"
                    value={formData.account_holder_name}
                    onChange={e => setFormData({...formData, account_holder_name: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>رقم الآيبان (IBAN)</Label>
              <div className="relative">
                <CreditCard className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="SA00 0000 0000 0000 0000 0000" 
                  className="pr-10 font-mono text-left" 
                  dir="ltr"
                  value={formData.iban}
                  onChange={e => setFormData({...formData, iban: e.target.value})}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">يجب أن يبدأ بـ SA ويتكون من 24 خانة.</p>
            </div>

            <div className="space-y-2">
              <Label>رقم الحساب (اختياري)</Label>
              <Input 
                placeholder="رقم الحساب المحلي" 
                value={formData.account_number}
                onChange={e => setFormData({...formData, account_number: e.target.value})}
              />
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-500" />
              شهادة الآيبان
            </CardTitle>
            <CardDescription>يرجى رفع صورة واضحة أو ملف PDF لشهادة الآيبان</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors relative">
              <input 
                type="file" 
                accept="image/*,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-3" />
                  <p className="text-sm text-gray-500">جاري الرفع...</p>
                </div>
              ) : formData.iban_certificate_url ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                    <Image 
                      src={formData.iban_certificate_url} 
                      alt="IBAN Certificate" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  <p className="text-green-600 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> تم رفع الملف بنجاح
                  </p>
                  <p className="text-xs text-gray-400 mt-2">انقر للاستبدال</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">انقر للرفع أو اسحب الملف هنا</h3>
                  <p className="text-sm text-gray-500">PNG, JPG, PDF (الحد الأقصى 5MB)</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-end">
          <Button 
            type="submit" 
            size="lg" 
            className="bg-rose-600 hover:bg-rose-700 text-white min-w-[200px]"
            disabled={isSaving || isUploading}
          >
            {isSaving ? (
              <>جاري الحفظ...</>
            ) : (
              <>
                <Save className="w-4 h-4 ml-2" /> حفظ البيانات
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ClockIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}