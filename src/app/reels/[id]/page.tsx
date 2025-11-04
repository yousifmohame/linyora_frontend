// src/app/reels/[id]/page.tsx
import api from '@/lib/axios'; //
import { Reel } from '@/types'; //
import { notFound } from 'next/navigation';
import ReelDisplayClient from './ReelDisplayClient'; // سننشئ هذا المكون

// دالة لجلب البيانات من السيرفر
async function getReelData(id: string): Promise<Reel | null> {
  try {
    console.log(`Fetching data for Reel ID: ${id}`);
    // نمرر الـ cookie يدوياً إذا كان api instance لا يفعل ذلك تلقائياً في Server Components
    // تحتاج لمراجعة إعدادات axios لديك
    const response = await api.get(`/reels/${id}`/*, { headers: { Cookie: cookies().toString() } }*/);
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch reel ${id}:`, error.response?.data || error.message);
    if (error.response?.status === 404) {
      notFound(); // عرض صفحة 404
    }
    // يمكنك التعامل مع أخطاء أخرى هنا
    return null; // إرجاع null في حالة أي خطأ آخر
  }
}

// واجهة خصائص الصفحة
interface ReelPageProps {
  params: { id: string };
}

// مكون الصفحة (Server Component)
export default async function ReelPage({ params }: ReelPageProps) {
  const { id } = params;
  const reelData = await getReelData(id);

  if (!reelData) {
    // يمكنك عرض رسالة خطأ مخصصة هنا إذا لم تكن تستخدم notFound()
    return <div className="text-center py-20">Failed to load reel data.</div>;
  }

  // تمرير البيانات إلى مكون العميل للتفاعل والعرض
  return <ReelDisplayClient initialReelData={reelData} />;
}

// (اختياري) يمكنك إضافة دالة generateMetadata هنا لتحديد عنوان الصفحة
// export async function generateMetadata({ params }: ReelPageProps): Promise<Metadata> {
//   const reelData = await getReelData(params.id);
//   return {
//     title: reelData ? `Reel by ${reelData.userName}` : 'Reel Not Found',
//     description: reelData?.caption || 'Watch this style reel on Linora Platform.',
//   };
// }