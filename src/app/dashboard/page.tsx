'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// استيراد مكونات لوحات التحكم
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import MerchantDashboard from '@/components/dashboards/MerchantDashboard';
import ModelDashboard from '@/components/dashboards/ModelDashboard';
import InfluencerDashboard from '@/components/dashboards/InfluencerDashboard';
import SupplierDashboard from '@/components/dashboards/SupplierDashboard';

export default function DashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (user?.role_id === 5) {
      router.push('/'); // تحويل العميلة إلى الصفحة الرئيسية
    }
  }, [user, router]);

  // دالة لعرض المكون المناسب
  const renderDashboard = () => {
    if (!user) return null; // أو عرض شاشة تحميل

    switch (user.role_id) {
      case 1: // المشرفة
        return <AdminDashboard />;
      case 2: // التاجرة
        return <MerchantDashboard />;
      case 3: // العارضة
        return <ModelDashboard />;
      case 4: // المؤثرة
        return <InfluencerDashboard />;
      case 6: // المورد
        return <SupplierDashboard />;
      default:
        return <div>دور غير معروف.</div>;
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* هنا يتم عرض لوحة التحكم المناسبة للدور */}
      {renderDashboard()}
    </div>
  );
}
