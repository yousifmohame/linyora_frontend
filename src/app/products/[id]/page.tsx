// src/app/products/[id]/page.tsx

import { Metadata } from 'next';
import api from '@/lib/axios';
import { Product } from '@/types';
import ProductDetailClient from './ProductDetailClient';

// تعريف النوع الصحيح للـ Props في Next.js 15
type Props = {
  params: Promise<{ id: string }>;
};

// --- 1. البيانات الوصفية (تعمل على الخادم) ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // ✅ يجب انتظار الـ params أولاً
    const { id } = await params;

    const { data: product } = await api.get<Product>(`/products/${id}`);

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'Sorry, this product is no longer available.',
      };
    }

    const description = product.description ? product.description.substring(0, 160) : 'Check out this amazing product on Linora.';

    return {
      title: product.name,
      description: description,
      openGraph: {
        title: product.name,
        description: description,
        images: [
          {
            url: product.variants?.[0]?.images?.[0] || '/logo.png',
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
      },
    };
  } catch (error) {
    console.error('Failed to generate metadata:', error);
    return {
      title: 'Error',
      description: 'There was an error loading the page data.',
    };
  }
}

// --- 2. مكون الصفحة الرئيسي (يعمل على الخادم) ---
export default async function ProductDetailPage({ params }: Props) {
  try {
    // ✅ يجب انتظار الـ params أولاً هنا أيضاً
    const { id } = await params;

    const { data: product } = await api.get<Product>(`/products/${id}`);
    
    return <ProductDetailClient product={product} />;

  } catch (error) {
    return (
        <div className="min-h-screen flex items-center justify-center text-center p-4">
            <div>
                <h1 className="text-2xl font-bold">Product Not Found</h1>
                <p className="text-gray-600">Sorry, we couldn't find the product you're looking for.</p>
            </div>
        </div>
    );
  }
}