// src/app/models/[id]/page.tsx
export const dynamic = 'force-dynamic';
import api from '@/lib/axios';
import { User, Reel, ServicePackage, Offer } from '@/types';
import { notFound } from 'next/navigation';
import ModelProfileClient from './ModelProfileClient';
import { Metadata } from 'next';
import { cookies } from 'next/headers';

interface ModelProfileData {
  profile: User;
  reels: Reel[];
  services: ServicePackage[];
  offers: Offer[];
}

async function getModelProfileData(id: string): Promise<ModelProfileData | null> {
  try {
    console.log(`[SERVER] Fetching public profile for User ID: ${id}`);

    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await api.get(`/users/${id}/profile`, {
      headers: headers,
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Failed to fetch profile for user ${id}:`, error.response?.data || error.message);
    if (error.response?.status === 404) {
      notFound(); 
    }
    return null;
  }
}

interface ModelPageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ params }: ModelPageProps): Promise<Metadata> {
  const data = await getModelProfileData(params.id);
  
  if (!data) {
    return {
      title: 'Profile Not Found | Linora',
      description: 'The requested profile could not be found.',
    };
  }

  const profileName = data.profile.name || 'Model';
  const profileBio = data.profile.bio || `${profileName} is a professional model on Linora platform.`;
  const profileImage = data.profile.profile_picture_url || '/default-avatar.png';
  const profileUrl = `https://yourdomain.com/models/${params.id}`;

  return {
    title: `${profileName} | Professional Model | Linora`,
    description: profileBio.substring(0, 155),
    keywords: ['model', 'portfolio', 'reels', 'services', 'linora', profileName],
    authors: [{ name: profileName }],
    openGraph: {
      title: `${profileName} | Linora Model`,
      description: profileBio.substring(0, 155),
      url: profileUrl,
      siteName: 'Linora',
      images: [
        {
          url: profileImage,
          width: 1200,
          height: 630,
          alt: `${profileName} profile picture`,
        },
      ],
      type: 'profile',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${profileName} | Linora Model`,
      description: profileBio.substring( 155),
      images: [profileImage],
    },
    alternates: {
      canonical: profileUrl,
    },
  };
}

export default async function ModelPage({ params, searchParams }: ModelPageProps) {
  const { id } = params;
  
  const data = await getModelProfileData(id);

  if (!data) {
    notFound();
  }

  return <ModelProfileClient profileData={data} />;
}