"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import Navigation from "@/components/dashboards/Navigation";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
  includes_dropshipping: boolean;
}

interface SubscriptionStatus {
  status: string;
  plan: {
    id: number;
    name: string;
  } | null;
  endDate?: string;
}

export default function SubscribePage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<number | null>(null); // لتحديد الزر الذي يتم تحميله
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. جلب الباقات المتاحة
        const plansRes = await api.get<SubscriptionPlan[]>(
          "/subscriptions/plans",
        );
        const normalizedPlans = plansRes.data.map((plan) => ({
          ...plan,
          price: Number(plan.price),
        }));
        setPlans(normalizedPlans);

        // 2. جلب حالة الاشتراك الحالية
        const statusRes = await api.get<SubscriptionStatus>(
          "/subscriptions/status",
        );
        setCurrentSub(statusRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("فشل في جلب البيانات.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubscribe = async (planId: number, isUpgrade: boolean) => {
    setProcessingPlanId(planId);
    const actionText = isUpgrade ? "تغيير الباقة" : "الاشتراك";
    toast.info(`جاري تحضير ${actionText}...`);

    try {
      // إرسال طلب إنشاء الجلسة
      const response = await api.post<{ checkoutUrl: string }>(
        "/subscriptions/create-session",
        { planId },
      );
      const { checkoutUrl } = response.data;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error("لم يتم استلام رابط الدفع.");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "حدث خطأ أثناء المعالجة.");
      setProcessingPlanId(null);
    }
  };

  const getRoleTitle = () => {
    if (user?.role_id === 2) return "التاجرات";
    if (user?.role_id === 3) return "المودلز";
    if (user?.role_id === 4) return "المؤثرات";
    return "";
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center gap-2 text-rose-600">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-lg font-medium">جاري تحميل الباقات...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <Navigation />

      <div className="min-h-screen flex flex-col items-center py-10">
        {/* Header Section */}
        <div className="text-center mb-12 max-w-2xl px-4">
          <div className="bg-rose-100 p-3 rounded-full w-fit mx-auto mb-4">
            <Crown className="h-10 w-10 text-rose-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            خطط اشتراك {getRoleTitle()}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            استثمري في نجاحك مع باقات صممت خصيصاً لتلبية احتياجاتك وتوسيع نطاق
            أعمالك.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl px-4">
          {plans.map((plan) => {
            const isCurrentPlan =
              currentSub?.status === "active" &&
              currentSub?.plan?.id === plan.id;
            const hasActiveSubscription = currentSub?.status === "active";

            return (
              <Card
                key={plan.id}
                className={`flex flex-col relative transition-all duration-300 hover:shadow-2xl 
                  ${isCurrentPlan ? "border-2 border-rose-500 shadow-xl bg-rose-50/30" : "border border-gray-200 hover:-translate-y-1"}
                `}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-0 left-0 flex justify-center">
                    <Badge className="bg-rose-500 text-white px-4 py-1 text-sm shadow-md">
                      باقتك الحالية
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-2 min-h-[40px]">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow">
                  <div className="text-center py-6 border-b border-gray-100 mb-6">
                    <div className="flex items-center justify-center text-gray-900">
                      <span className="text-5xl font-extrabold">
                        {plan.price}
                      </span>
                      <div className="flex flex-col items-start mr-2 text-gray-500 text-sm">
                        <span>ريال</span>
                        <span>شهرياً</span>
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-4">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start text-gray-700"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 ml-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-6">
                  <Button
                    onClick={() =>
                      handleSubscribe(plan.id, hasActiveSubscription)
                    }
                    disabled={isCurrentPlan || processingPlanId !== null}
                    size="lg"
                    className={`w-full font-bold text-lg h-12 shadow-md transition-all
                      ${
                        isCurrentPlan
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed hover:bg-gray-200"
                          : hasActiveSubscription
                            ? "bg-white text-rose-600 border-2 border-rose-600 hover:bg-rose-50"
                            : "bg-rose-600 hover:bg-rose-700 text-white"
                      }
                    `}
                  >
                    {processingPlanId === plan.id ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" /> جاري
                        المعالجة...
                      </>
                    ) : isCurrentPlan ? (
                      "مشترك حالياً"
                    ) : hasActiveSubscription ? (
                      "ترقية / تغيير الباقة"
                    ) : (
                      "اشتركي الآن"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة.</p>
          <p className="mt-1">يمكنك إلغاء الاشتراك في أي وقت من لوحة التحكم.</p>
        </div>
      </div>
    </div>
  );
}
