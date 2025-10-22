'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
                        <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">تم الاشتراك بنجاح!</CardTitle>
                    <CardDescription className="text-gray-600 pt-2">
                        لقد تم تفعيل باقة الدروب شوبنق في حسابك. يمكنك الآن البدء في استكشاف واستيراد المنتجات.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard/dropshipping" passHref>
                        <Button size="lg" className="w-full">
                            ابدأ باستيراد المنتجات
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
