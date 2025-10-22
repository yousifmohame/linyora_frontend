'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SubscriptionGate = () => {
    const router = useRouter();

    return (
        <div className="flex items-center justify-center p-4 min-h-[60vh]">
            <Card className="w-full max-w-md text-center shadow-lg animate-fade-in">
                <CardHeader>
                    <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 flex items-center justify-center mb-4">
                        <Crown className="text-white h-6 w-6" />
                    </div>
                    <CardTitle>الوصول إلى هذه الميزة يتطلب اشتراكًا</CardTitle>
                    <CardDescription>
                        يبدو أنك غير مشترك في أي باقة. قم بالترقية الآن لفتح جميع الميزات الحصرية والمتابعة.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button 
                        className="w-full bg-gradient-to-r from-rose-500 to-purple-600 text-white"
                        onClick={() => router.push('/dashboard/subscribe')}
                    >
                        عرض باقات الاشتراك
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
