'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import api from '@/lib/axios';
import { Mail, Clock, CheckCircle2, Crown, RotateCcw } from 'lucide-react';
import { AxiosError } from 'axios';

function VerifyEmailCore() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ FIX: The component now relies solely on the email from the URL.
  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
        setError("Email not found in URL. Please register again.");
        setTimeout(() => router.push('/register'), 3000);
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || code.length < 6) {
      setError('الرجاء إدخال الكود المكون من 6 أرقام.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // ✅ FIX: Send 'email' instead of 'userId'
      await api.post('/auth/verify-email', { email, code });
      setSuccess('تم التحقق من بريدك الإلكتروني بنجاح! سيتم توجيهك لتسجيل الدخول.');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'فشل التحقق. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || !email) return;
    setIsResending(true);
    setError('');
    try {
      // ✅ FIX: Send 'email' instead of 'userId'
      await api.post('/auth/resend-verification', { email });
      setSuccess('تم إرسال كود التحقق مرة أخرى إلى بريدك الإلكتروني.');
      setCountdown(60);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'فشل إعادة إرسال الكود.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md relative overflow-hidden border-0 shadow-2xl bg-white/70 backdrop-blur-sm">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400"></div>
      <CardHeader className="text-center pb-6 pt-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
              <Crown className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          التحقق من البريد الإلكتروني
        </CardTitle>
        <CardDescription className="text-gray-600 mt-2 text-sm">
          لقد أرسلنا كود التحقق إلى بريدك الإلكتروني
        </CardDescription>
        {email && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-blue-700 font-medium text-sm">{email}</p>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={(value) => { setCode(value); setError(''); }}>
                <InputOTPGroup>
                  {[...Array(6)].map((_, index) => <InputOTPSlot key={index} index={index} className="w-12 h-12 text-lg rounded-xl" />)}
                </InputOTPGroup>
              </InputOTP>
            </div>
            {error && <p className="text-red-700 text-sm text-center">{error}</p>}
            {success && <p className="text-green-700 text-sm text-center">{success}</p>}
            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading || code.length < 6}>
              {isLoading ? 'جاري التحقق...' : 'تحقق'}
            </Button>
            <div className="text-center pt-4 border-t">
              <Button type="button" variant="link" onClick={handleResendCode} disabled={isResending || countdown > 0}>
                {isResending ? 'جاري الإرسال...' : (countdown > 0 ? `إعادة الإرسال بعد ${countdown} ثانية` : 'إعادة إرسال الكود')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Wrapper component to ensure useSearchParams is used correctly
export default function VerifyEmailForm() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailCore />
        </Suspense>
    );
}