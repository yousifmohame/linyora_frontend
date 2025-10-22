'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AgreementModal from './shared/AgreementModal'; // ✅ مسار موحد
import { toast } from "sonner";
import api from '@/lib/axios';

// استيراد مكونات لوحات التحكم
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import MerchantDashboard from '@/components/dashboards/MerchantDashboard';
import ModelDashboard from '@/components/dashboards/ModelDashboard';
import CustomerDashboard from '@/components/dashboards/CustomerDashboard';

export default function DashboardPage() {
  const { user, token, loading, refetchUser } = useAuth();
  const router = useRouter();
  const [isAgreementModalOpen, setAgreementModalOpen] = useState(false);
  const [agreementKey, setAgreementKey] = useState<string>(''); // مفتاح الاتفاقية حسب الدور

  // إعادة توجيه غير المصرح لهم
  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  // تحديد نوع الاتفاقية المطلوبة وعرض النافذة عند الحاجة
  useEffect(() => {
    if (user && !user.has_accepted_agreement) {
      let key = '';
      switch (user.role_id) {
        case 2:
          key = 'merchant_agreement';
          break;
        case 3:
        case 4:
          key = 'influencer_agreement'; // أو 'model_agreement' حسب ما تفضله
          break;
        case 5:
          key = 'customer_agreement';
          break;
        default:
          key = 'general_agreement';
      }
      setAgreementKey(key);
      setAgreementModalOpen(true);
    } else {
      setAgreementModalOpen(false);
    }
  }, [user]);

  // معالجة الموافقة على الاتفاقية
  const handleAgree = async () => {
    try {
      await api.put('/users/profile/accept-agreement');
      toast.success("شكرًا لموافقتك على الاتفاقية");
      if (refetchUser) {
        await refetchUser(); // تحديث بيانات المستخدم
      }
      setAgreementModalOpen(false);
    } catch (error) {
      console.error("Agreement acceptance failed:", error);
      toast.error("حدث خطأ ما، يرجى المحاولة مرة أخرى");
    }
  };

  // عرض نافذة الاتفاقية إذا لم يوافق المستخدم
  if (user && !user.has_accepted_agreement) {
    return (
      <AgreementModal
        agreementKey={agreementKey}
        isOpen={isAgreementModalOpen}
        onClose={() => {}} // لا نسمح بالإغلاق حتى تتم الموافقة
        onAgree={handleAgree}
      />
    );
  }

  // دالة لعرض المكون المناسب
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role_id) {
      case 1: // المشرفة
        return <AdminDashboard />;
      case 2: // التاجرة
        return <MerchantDashboard />;
      case 3: // العارضة
      case 4: // المؤثرة
        return <ModelDashboard />; // أو <InfluencerDashboard /> إذا فصلتها
      case 5: // العميلة
        return <CustomerDashboard />;
      default:
        return <div className="p-8 text-center text-red-500">دور غير معروف.</div>;
    }
  };

  // شاشة التحميل
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {renderDashboard()}
    </div>
  );
}