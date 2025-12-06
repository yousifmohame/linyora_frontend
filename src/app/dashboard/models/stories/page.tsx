'use client';

import SupplierNav from '@/components/dashboards/SupplierNav';
import StoriesManager from './StoriesManager';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Target, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModelNav from '@/components/dashboards/ModelNav';

export default function StoriesPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
    
      <ModelNav />
      
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Clock className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Target className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('StoriesPage.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('StoriesPage.welcome', { name: user?.name || t('common.guest') })}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="max-w-7xl mx-auto">
        <StoriesManager />
      </div>
    </div>
  );
}