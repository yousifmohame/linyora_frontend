// linora-platform/frontend/src/app/dashboard/subscribe/page.tsx

'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { CheckCircle, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/dashboards/Navigation';
import ModelNav from '@/components/dashboards/ModelNav';

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
  includes_dropshipping: boolean;
}

export default function SubscribePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
  const fetchPlans = async () => {
    setLoading(true); // Moved up to ensure it's always set
    try {
      // The API returns the array directly, so we expect SubscriptionPlan[]
      const response = await api.get<SubscriptionPlan[]>('/subscriptions/plans');

      // ✨ FIX: Call .map directly on response.data instead of response.data.plans
      const normalizedPlans = response.data.map((plan) => ({
        ...plan,
        price: Number(plan.price), // Ensure price is a number
      }));

      setPlans(normalizedPlans);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      toast.error('فشل في جلب باقات الاشتراك.');
    } finally {
      setLoading(false);
    }
  };

  fetchPlans();
}, []);
  const handleSubscribe = async (planId: number) => {
    setSelectedPlan(planId);
    toast.info('جاري تحضير صفحة الدفع الآمنة...');
    try {
      const response = await api.post<{ checkoutUrl: string }>('/subscriptions/create-session', { planId });
      const { checkoutUrl } = response.data;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('لم يتم استلام رابط الدفع.');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('حدث خطأ أثناء إنشاء جلسة الدفع.');
      setSelectedPlan(null);
    }
  };

  const getRoleTitle = () => {
    if (user?.role_id === 2) return 'التاجرات';
    if (user?.role_id === 3) return 'المودلز';
    if (user?.role_id === 4) return 'المؤثرات';
    return '';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        جاري تحميل الباقات...
      </div>
    );
  }

  return (
    <div className="p-8">
      <ModelNav />
      <div
        className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
        dir="rtl"
      >
        <div className="text-center mb-10">
          <Crown className="mx-auto h-12 w-12 text-rose-500" />
          <h1 className="text-4xl font-bold mt-4">اختاري باقتكِ</h1>
          <p className="text-lg text-gray-600 mt-2">
            انضمي إلى مجتمع لينورا وابدئي رحلتكِ بالاشتراك في إحدى باقات{' '}
            {getRoleTitle()} المميزة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="text-center my-4">
                  <span className="text-4xl font-bold">
                    {plan.price.toFixed(2)}
                  </span>
                  <span className="text-gray-500"> ريال/شهريًا</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 ml-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={selectedPlan === plan.id}
                  size="lg"
                  className="w-full mt-auto bg-rose-500 hover:bg-rose-600"
                >
                  {selectedPlan === plan.id ? 'جاري التوجيه...' : 'اشتركي الآن'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}