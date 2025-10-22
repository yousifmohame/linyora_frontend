'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

export default function HomePageClient() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistStatus, setWishlistStatus] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const productResponse = await api.get('/products');
        const fetchedProducts: Product[] = productResponse.data.products || productResponse.data;
        setProducts(fetchedProducts);

        if (user && user.role_id === 5 && fetchedProducts.length > 0) {
          const productIds = fetchedProducts.map(p => p.id);
          try {
            const wishlistResponse = await api.post('/customer/wishlist/status', { productIds });
            setWishlistStatus(wishlistResponse.data);
          } catch (wishlistError) {
            console.error("Failed to fetch wishlist status:", wishlistError);
          }
        }
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [user]);

  if (loading) {
    return <div className="text-center">{t('HomePage.loading')}</div>;
  }

  return (
    <>
      <h2 className="text-3xl font-bold mb-8 text-center">{t('HomePage.title')}</h2>
      {products.length === 0 ? (
        <p className="text-center text-gray-500">{t('HomePage.noProducts')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isInitiallyWishlisted={wishlistStatus[product.id] || false} 
            />
          ))}
        </div>
      )}
    </>
  );
}