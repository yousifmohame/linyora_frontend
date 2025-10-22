// app/(auth)/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [roleId, setRoleId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, i18n } = useTranslation();

  // تحديث اتجاه الصفحة عند تغيير اللغة
  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  setIsLoading(true);

  if (!roleId) {
    setError(t('Register.errorNoRole'));
    setIsLoading(false);
    return;
  }

  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/register`;
    const response = await axios.post(apiUrl, {
      name,
      email,
      password,
      phoneNumber,
      roleId: parseInt(roleId),
    });
    setSuccess(response.data.message);

    const userId = response.data.userId;
    router.push(`/verify-email?userId=${userId}`);
    
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      setError(err.response?.data?.message || t('Register.errorDefault'));
    } else {
      setError(t('Register.errorDefault'));
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-amber-50 flex items-center justify-center p-4">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-rose-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-amber-200 to-yellow-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-200 to-indigo-200 rounded-full blur-3xl opacity-20"></div>
      </div>

      <Card className="w-full max-w-lg relative overflow-hidden border-0 shadow-2xl bg-white/70 backdrop-blur-sm">
        {/* Luxury Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-400 via-purple-400 to-amber-400"></div>
        
        <CardHeader className="text-center pb-6 pt-8">
          {/* Luxury Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
            {t('Register.title')}
          </CardTitle>
          <p className="text-gray-600 mt-2 text-sm">{t('Register.subtitle')}</p>
        </CardHeader>
        
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Account Type Selection */}
              <div className="space-y-3">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                  {t('Register.accountTypeLabel')}
                </Label>
                <Select onValueChange={setRoleId} value={roleId}>
                  <SelectTrigger className="h-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200">
                    <SelectValue placeholder={t('Register.accountTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                    <SelectItem value="2" className="py-3 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                        <span>{t('Register.merchant')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="3" className="py-3 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>{t('Register.model')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="4" className="py-3 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        <span>{t('Register.influencer')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="5" className="py-3 hover:bg-purple-50 transition-colors">
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>{t('Register.customer')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="6">مورد (دروبشيبينغ)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name Field */}
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  {t('Register.fullNameLabel')}
                </Label>
                <div className="relative">
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    className="h-12 pl-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                    placeholder={t('Register.fullNamePlaceholder')}
                  />
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  {t('Register.emailLabel')}
                </Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    className="h-12 pl-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                    placeholder={t('Register.emailPlaceholder')}
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Phone Number Field */}
              <div className="space-y-3">
                <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                  {t('Register.phoneLabel')}
                </Label>
                <div className="relative">
                  <Input 
                    id="phoneNumber" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    className="h-12 pl-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                    placeholder={t('Register.phonePlaceholder')}
                  />
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  {t('Register.passwordLabel')}
                </Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    className="h-12 pl-12 pr-12 bg-white/50 border-gray-200 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                    placeholder={t('Register.passwordPlaceholder')}
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Messages */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm text-center">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 text-sm text-center">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('Register.loading')}</span>
                  </div>
                ) : (
                  t('Register.registerButton')
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-gray-600 text-sm">
                  {t('Register.alreadyHaveAccount')}{' '}
                  <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold transition-colors">
                    {t('Register.login')}
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