'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Mail, Phone, Lock, Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();
  
  // Hardcoded Role ID for "Customer"
  const CUSTOMER_ROLE_ID = 5;

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
      const response = await axios.post(apiUrl, {
        name,
        email,
        password,
        phoneNumber,
        roleId: CUSTOMER_ROLE_ID, // Always register as a customer
      });
      setSuccess(response.data.message);
      router.push(`/verify-email?email=${email}`);
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || t('register.errorDefault'));
      } else {
        setError(t('register.errorDefault'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-amber-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <Card className="w-full max-w-lg relative overflow-hidden border-0 shadow-2xl bg-white/70 backdrop-blur-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-purple-400 to-amber-400"></div>
        
        <CardHeader className="text-center pb-6 pt-8">
          <div className="flex justify-center mb-4">
             <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
               <Crown className="w-10 h-10 text-white" />
             </div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            {t('register.customerTitle')}
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm">{t('register.customerSubtitle')}</p>
        </CardHeader>
        
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Input Fields */}
              <div className="relative">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="h-12 pl-12" placeholder={t('register.fullNamePlaceholder')} />
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12 pl-12" placeholder={t('register.emailPlaceholder')} />
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="h-12 pl-12" placeholder={t('register.phonePlaceholder')} />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-12 pl-12 pr-12" placeholder={t('register.passwordPlaceholder')} />
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {error && <p className="text-red-700 text-sm text-center">{error}</p>}
              {success && <p className="text-green-700 text-sm text-center">{success}</p>}

              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={isLoading}>
                {isLoading ? t('register.loading') : t('register.registerButton')}
              </Button>

              <div className="text-center text-sm text-gray-600 space-y-2">
                 <p>
                    {t('register.areYouAPartner')}{' '}
                    <Link href="/join-us" className="font-semibold text-purple-600 hover:underline">
                      {t('register.joinHere')}
                    </Link>
                 </p>
                 <p>
                    {t('register.alreadyHaveAccount')}{' '}
                    <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                      {t('register.login')}
                    </Link>
                 </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}