'use client';

import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, Clock, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface PageContent {
    title: string;
    content: string;
}

const PolicyPage = () => {
    const [pageContent, setPageContent] = useState<PageContent | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await api.get('/content/return_policy');
                setPageContent(response.data);
            } catch (error) {
                console.error("Failed to fetch content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mx-auto mb-4"></div>
                    <p className="text-rose-700 text-lg font-medium">جاري تحميل سياسة الإرجاع...</p>
                    <div className="flex justify-center space-x-1 mt-4">
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!pageContent) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center">
                <div className="text-center">
                    <FileText className="h-16 w-16 text-rose-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-rose-800 mb-2">لم يتم العثور على المحتوى</h2>
                    <p className="text-rose-600">عفواً، لا يمكن تحميل سياسة الإرجاع حالياً.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 py-12">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <div className="p-4 bg-white rounded-2xl shadow-lg">
                            <Shield className="h-8 w-8 text-rose-500" />
                        </div>
                        <RefreshCw className="h-6 w-6 text-rose-300" />
                        <FileText className="h-6 w-6 text-rose-300" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-6">
                        {pageContent.title}
                    </h1>
                    <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mb-4"></div>
                    <p className="text-rose-700 text-lg max-w-2xl mx-auto">
                        نضمن لك تجربة تسوق آمنة ومريحة مع سياسة إرجاع شفافة وعادلة
                    </p>
                </div>

                {/* Main Content Card */}
                <div className="max-w-6xl mx-auto">
                    <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
                        <CardHeader className="text-center pb-8 pt-12 bg-gradient-to-r from-rose-500 to-pink-500 text-white relative">
                            {/* Decorative Elements */}
                            <div className="absolute top-4 left-8">
                                <CheckCircle className="h-6 w-6 text-white/30" />
                            </div>
                            <div className="absolute top-4 right-8">
                                <XCircle className="h-6 w-6 text-white/30" />
                            </div>
                            
                            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-4">
                                <div className="p-3 bg-white/20 rounded-2xl">
                                    <Shield className="h-8 w-8" />
                                </div>
                                سياسة الإرجاع والاستبدال
                            </CardTitle>
                            <p className="text-pink-100 text-lg mt-4 max-w-2xl mx-auto">
                                شروط وأحكام واضحة لضمان حقوقك كعميلة
                            </p>
                        </CardHeader>
                        
                        <CardContent className="p-8 lg:p-12">
                            <div 
                                className="prose prose-lg max-w-none text-right leading-relaxed
                                         prose-headings:bg-gradient-to-r prose-headings:from-rose-600 prose-headings:to-pink-600 prose-headings:bg-clip-text prose-headings:text-transparent
                                         prose-p:text-rose-800 prose-p:leading-loose
                                         prose-strong:text-rose-700 prose-strong:font-bold
                                         prose-ul:text-rose-800 prose-ol:text-rose-800
                                         prose-li:marker:text-rose-400
                                         prose-blockquote:border-rose-300 prose-blockquote:bg-rose-50 prose-blockquote:text-rose-700
                                         prose-a:text-rose-500 prose-a:no-underline hover:prose-a:underline
                                         prose-hr:border-rose-200"
                                dangerouslySetInnerHTML={{ 
                                    __html: pageContent.content
                                        .replace(/\n/g, '<br />')
                                        .replace(/<h1/g, '<h1 class="text-3xl font-bold mt-12 mb-8 pb-4 border-b-2 border-rose-100"')
                                        .replace(/<h2/g, '<h2 class="text-2xl font-semibold mt-10 mb-6"')
                                        .replace(/<h3/g, '<h3 class="text-xl font-medium mt-8 mb-4"')
                                        .replace(/<p/g, '<p class="text-base mb-6"')
                                        .replace(/<ul/g, '<ul class="list-disc list-inside space-y-3 mb-6"')
                                        .replace(/<ol/g, '<ol class="list-decimal list-inside space-y-3 mb-6"')
                                        .replace(/<li/g, '<li class="text-base"')
                                        .replace(/<blockquote/g, '<blockquote class="border-r-4 bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-2xl my-6"')
                                }} 
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Key Points Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-200 p-6 text-center shadow-lg">
                        <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-rose-800 mb-2">إرجاع خلال 14 يوم</h3>
                        <p className="text-rose-600 text-sm">مهلة مريحة لاتخاذ القرار</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-200 p-6 text-center shadow-lg">
                        <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <RefreshCw className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-rose-800 mb-2">استبدال مجاني</h3>
                        <p className="text-rose-600 text-sm">في حال وجود عيوب تصنيع</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-200 p-6 text-center shadow-lg">
                        <div className="p-3 bg-amber-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <AlertTriangle className="h-8 w-8 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-rose-800 mb-2">شروط واضحة</h3>
                        <p className="text-rose-600 text-sm">لضمان حقوق جميع الأطراف</p>
                    </div>
                    
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-200 p-6 text-center shadow-lg">
                        <div className="p-3 bg-rose-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <Clock className="h-8 w-8 text-rose-600" />
                        </div>
                        <h3 className="text-lg font-bold text-rose-800 mb-2">معالجة سريعة</h3>
                        <p className="text-rose-600 text-sm">خلال 3-5 أيام عمل</p>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="max-w-4xl mx-auto mt-16">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                            <div className="text-right">
                                <h3 className="text-lg font-bold text-amber-800 mb-2">ملاحظات هامة</h3>
                                <ul className="text-amber-700 space-y-2 text-sm list-disc list-inside">
                                    <li>يجب أن تكون المنتجات في حالتها الأصلية مع جميع الملصقات</li>
                                    <li>لا يمكن إرجاع المنتجات الشخصية أو المستهلكة</li>
                                    <li>سيتم خصم مصاريف الشحن من مبلغ الإرجاع في بعض الحالات</li>
                                    <li>للاستفسارات، يرجى التواصل مع خدمة العملاء</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="text-center mt-12">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white p-8 rounded-3xl shadow-2xl max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold mb-4">هل تحتاجين مساعدة؟</h3>
                        <p className="text-pink-100 text-lg mb-6">
                            فريق دعم العملاء جاهز لمساعدتك في أي استفسار بخصوص الإرجاع أو الاستبدال
                        </p>
                        <Link href="/contact">
                        <button className="bg-white text-rose-600 px-8 py-3 rounded-2xl font-bold hover:bg-rose-50 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            تواصلي مع الدعم
                        </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyPage;