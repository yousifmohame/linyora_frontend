'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">تم إلغاء العملية</CardTitle>
                    <CardDescription className="text-gray-600 pt-2">
                        لم يتم تفعيل الاشتراك. يمكنك المحاولة مرة أخرى أو اختيار خطة مختلفة.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/pricing" passHref>
                        <Button size="lg" variant="outline" className="w-full">
                            عُد إلى صفحة الباقات
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
