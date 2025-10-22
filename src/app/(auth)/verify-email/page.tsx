// app/(auth)/verify-email/page.tsx
import { Suspense } from 'react';
import VerifyEmailForm from './VerifyEmailForm';
import { Sparkles } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Luxury Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full blur-3xl opacity-20"></div>
        
        {/* Animated Elements */}
        <div className="absolute top-1/4 left-1/4 animate-pulse">
          <Sparkles className="w-6 h-6 text-blue-300 opacity-60" />
        </div>
        <div className="absolute bottom-1/3 right-1/3 animate-pulse delay-300">
          <Sparkles className="w-4 h-4 text-purple-300 opacity-60" />
        </div>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl animate-pulse border border-white">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
            <div className="h-12 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-lg mx-auto w-1/2"></div>
          </div>
        </div>
      }>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}