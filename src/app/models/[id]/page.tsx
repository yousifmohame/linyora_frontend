export const dynamic = 'force-dynamic';
import api from '@/lib/axios';
import { User, Reel, ServicePackage, Offer } from '@/types';
import { notFound } from 'next/navigation';
import ModelProfileClient from './ModelProfileClient';
import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

interface ModelProfileData {
  profile: User;
  reels: Reel[];
  services: ServicePackage[];
  offers: Offer[];
}

// 1. تحديث الدالة لتنتظر الكوكيز (Async/Await)
async function getModelProfileData(id: string): Promise<ModelProfileData | null> {
  try {
    const cookieStore = await cookies(); // ✅ يجب استخدام await هنا
    const token = cookieStore.get('token')?.value;

    const headersObj: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (token) headersObj['Authorization'] = `Bearer ${token}`;

    const res = await api.get(`/users/${id}/profile`, { headers: headersObj });
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) notFound();
    return null;
  }
}

// 2. تحديث الدالة لتنتظر الهيدرز (Async/Await)
async function detectLocale(): Promise<'en' | 'ar'> {
  const headersList = await headers(); // ✅ يجب استخدام await هنا
  const acceptLang = headersList.get('accept-language') || '';
  return acceptLang.startsWith('ar') ? 'ar' : 'en';
}

const getTranslations = (locale: 'en' | 'ar') => {
  if (locale === 'ar') {
    return {
      titleSuffix: 'عارضة محترفة | لينورا',
      descriptionFallback: 'عارضة محترفة على منصة لينورا.',
      keywords: ['عارضة', 'بوفوليو', 'رييلات', 'خدمات', 'لينورا'],
    };
  }
  return {
    titleSuffix: 'Professional Model | Linora',
    descriptionFallback: 'Professional model on Linora platform.',
    keywords: ['model', 'portfolio', 'reels', 'services', 'linora'],
  };
};

// 3. تحديث نوع الـ Props لأن params أصبح Promise
interface ModelPageProps {
  params: Promise<{ id: string }>; // ✅ Promise بدلاً من كائن مباشر
}

// 4. تحديث generateMetadata
export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const { id } = await params; // ✅ انتظار الـ params
  const locale = await detectLocale(); // ✅ انتظار اللغة
  
  const t = getTranslations(locale);
  const data = await getModelProfileData(id);

  const baseUrl = 'https://linyora.com';
  const profileUrl = `${baseUrl}/models/${id}`;

  if (!data) {
    return {
      title: locale === 'ar' ? 'الملف غير موجود | لينورا' : 'Profile Not Found | Linora',
      description: locale === 'ar' ? 'لم يتم العثور على الملف المطلوب.' : 'The requested profile could not be found.',
      alternates: { canonical: profileUrl },
    };
  }

  const name = data.profile.name || (locale === 'ar' ? 'عارضة' : 'Model');
  const bio = data.profile.bio || t.descriptionFallback;
  const image = data.profile.profile_picture_url || '/default-avatar.png';

  return {
    title: `${name} | ${t.titleSuffix}`,
    description: bio.substring(0, 155),
    keywords: [...t.keywords, name],
    openGraph: {
      title: `${name} | ${locale === 'ar' ? 'عارضة لينورا' : 'Linora Model'}`,
      description: bio.substring(0, 155),
      url: profileUrl,
      siteName: 'Linora',
      images: [{ url: image, width: 1200, height: 630, alt: `${name} ${locale === 'ar' ? 'صورة الملف' : 'profile picture'}` }],
      type: 'profile',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | ${locale === 'ar' ? 'لينورا' : 'Linora'}`,
      description: bio.substring(0, 155),
      images: [image],
    },
    alternates: { canonical: profileUrl },
  };
}

// 5. تحديث مكون الصفحة الرئيسي
export default async function ModelPage({ params }: ModelPageProps) {
  const { id } = await params; // ✅ انتظار الـ params لفك الـ id
  
  const data = await getModelProfileData(id);
  if (!data) notFound();
  
  return <ModelProfileClient profileData={data} />;
}