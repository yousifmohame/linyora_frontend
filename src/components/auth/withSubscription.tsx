'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { SubscriptionGate } from './SubscriptionGate';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A Higher-Order Component (HOC) that protects a page,
 * only allowing access to users with an active subscription.
 * @param WrappedComponent The page component to protect.
 */
export function withSubscription<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithSubscriptionComponent = (props: P) => {
    const { user, loading } = useAuth();

    // أثناء تحميل بيانات المستخدم، أظهر هيكلاً عظميًا
    if (loading || !user) {
      return (
        <div className="p-4 md:p-8 space-y-4">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-64 w-full" />
        </div>
      );
    }

    const isSubscribed = user.subscription?.status === 'active';

    // إذا لم يكن المستخدم مشتركًا، أظهر بوابة الاشتراك
    if (!isSubscribed) {
      return <SubscriptionGate />;
    }

    // إذا كان مشتركًا، اعرض الصفحة المحمية
    return <WrappedComponent {...props} />;
  };

  return WithSubscriptionComponent;
}
