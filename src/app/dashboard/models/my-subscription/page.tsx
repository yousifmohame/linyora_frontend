'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, CheckCircle, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ModelNav from '@/components/dashboards/ModelNav';

const MySubscriptionPage = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    // دالة لتنسيق التاريخ بشكل أنيق
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // 1. حالة التحميل
    if (loading) {
        return <LoadingSkeleton />;
    }

    // 2. حالة الاشتراك الفعال
    if (user?.subscription?.status === 'active' && user.subscription.plan) {
        const { plan, endDate } = user.subscription;
        return (
            <div className="p-4 md:p-8">
                <ModelNav />
                <Card className="shadow-lg animate-fade-in border-t-4 border-purple-600">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-rose-500 to-purple-600 rounded-lg">
                                <Crown className="text-white h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <CardDescription>أنت مشترك حاليًا في هذه الباقة.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-gray-500" />
                                <span className="font-medium">تاريخ التجديد القادم</span>
                            </div>
                            <span className="font-bold text-gray-800">{formatDate(endDate)}</span>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-3 text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-purple-600" />
                                ميزات باقتك
                            </h3>
                            <ul className="space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button 
                            className="w-full"
                            variant="outline"
                            onClick={() => router.push('/dashboard/subscribe')}
                        >
                            تغيير الباقة أو عرض الباقات الأخرى
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // 3. حالة عدم وجود اشتراك
    return <NotSubscribedGate />;
};

// مكون الهيكل العظمي لحالة التحميل
const LoadingSkeleton = () => (
    <div className="p-4 md:p-8">
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    </div>
);

// مكون لحالة عدم وجود اشتراك
const NotSubscribedGate = () => {
    const router = useRouter();
    return (
        <div className="flex items-center justify-center p-4 min-h-[60vh]">
            <Card className="w-full max-w-lg text-center shadow-lg animate-fade-in">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Crown className="text-gray-500 h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold">أنت غير مشترك حاليًا</CardTitle>
                    <CardDescription>
                        استفد من كامل إمكانيات المنصة عبر الاشتراك في إحدى باقاتنا المميزة.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button 
                        className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold"
                        onClick={() => router.push('/dashboard/subscribe')}
                        size="lg"
                    >
                        <span>عرض باقات الاشتراك</span>
                        <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default MySubscriptionPage;

