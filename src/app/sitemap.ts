// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import api from '../lib/axios';

// interface مبسط للمنتجات
interface Product {
  id: string;
  updated_at: string; 
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.linyora.com'; // تأكد من أن هذا هو رابط موقعك الصحيح

  // 1. الصفحات الأساسية والثابتة
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];

  // 2. جلب الصفحات الديناميكية (المنتجات) مع معالجة الأخطاء
  try {
    const productsResponse = await api.get<Product[]>('/products');
    
    if (productsResponse.data && Array.isArray(productsResponse.data)) {
        productRoutes = productsResponse.data.map((product) => ({
        url: `${baseUrl}/products/${product.id}`,
        lastModified: new Date(product.updated_at || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
    }
  } catch (error) {
    console.error("❌ Failed to fetch products for sitemap:", error);
    // في حالة حدوث خطأ، سنستمر مع الصفحات الثابتة فقط
  }

  // 3. دمج جميع الروابط وإعادتها
  return [...staticRoutes, ...productRoutes];
}