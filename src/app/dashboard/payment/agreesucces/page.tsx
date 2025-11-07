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
                    <CardTitle className="text-2xl font-bold">تم الدفع بنجاح!</CardTitle>
                    <CardDescription className="text-gray-600 pt-2">
                        لقد تم ارسال الاتفاقيه بنجاح و بانتظار المراجعه من الطلب الاخر سيصلك اشعار فور قبول الاتفاقيه
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/dashboard/agreements" passHref>
                        <Button size="lg" className="w-full">
                            رؤيه كل الاتفاقيات
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
