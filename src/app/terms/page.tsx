// src/app/terms/page.tsx
"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Shield, 
  Scale, 
  Mail,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function TermsPage() {
  const lastUpdated = "10 ديسمبر 2024";

  const sections = [
    {
      title: "1. مقدمة",
      icon: <FileText className="w-5 h-5" />,
      content: `مرحباً بكم في منصة لينيورا (Linyora). باستخداكم للموقع، فإنكم توافقون على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل البدء في استخدام خدماتنا. إذا كنت لا توافق على أي جزء من هذه الشروط، فلا يحق لك استخدام خدماتنا.`
    },
    {
      title: "2. الحسابات والتسجيل",
      icon: <Shield className="w-5 h-5" />,
      content: `للاستفادة من بعض خدماتنا، قد تحتاج إلى إنشاء حساب. أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور، وعن تقييد الوصول إلى جهازك. أنت توافق على قبول المسؤولية عن جميع الأنشطة التي تحدث تحت حسابك.`
    },
    {
      title: "3. المشتريات والدفع",
      icon: <CheckCircle className="w-5 h-5" />,
      content: `نحن نوفر طرق دفع آمنة ومتعددة. عند إجراء عملية شراء، فإنك توافق على تقديم معلومات دقيقة وكاملة. نحتفظ بالحق في رفض أو إلغاء أي طلب لأي سبب، بما في ذلك عدم توفر المنتج، أو أخطاء في التسعير، أو الاشتباه في الاحتيال.`
    },
    {
      title: "4. حقوق الملكية الفكرية",
      icon: <Scale className="w-5 h-5" />,
      content: `جميع المحتويات الموجودة على الموقع، بما في ذلك النصوص، الرسومات، الشعارات، الصور، ومقاطع الفيديو، هي ملك لشركة لينيورا أو المرخصين لها ومحمية بموجب قوانين حقوق النشر والعلامات التجارية. يمنع نسخ أو إعادة استخدام أي جزء دون إذن كتابي مسبق.`
    },
    {
      title: "5. سياسة الاستخدام المقبول",
      icon: <AlertCircle className="w-5 h-5" />,
      content: `يجب استخدام الموقع لأغراض قانونية فقط. يُحظر استخدام الموقع لنشر أي محتوى مسيء، تشهيري، أو ينتهك حقوق الآخرين. كما يُمنع محاولة اختراق الموقع أو نشر فيروسات أو برمجيات خبيثة.`
    },
    {
      title: "6. التعديلات على الشروط",
      icon: <FileText className="w-5 h-5" />,
      content: `نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم نشر التغييرات على هذه الصفحة مع تحديث تاريخ "آخر تحديث". استمرارك في استخدام الموقع بعد التغييرات يعني قبولك للشروط الجديدة.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20" dir="rtl">
      
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-20 lg:py-28 overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">الشروط والأحكام</h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              تحدد هذه الاتفاقية القواعد واللوائح لاستخدام موقع ومنصة لينيورا.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-200 border border-white/10">
              <span>آخر تحديث:</span>
              <span className="font-bold text-white">{lastUpdated}</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 relative z-20 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* 2. Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
              <CardContent className="p-8">
                <div className="space-y-10">
                  {sections.map((section, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                          {section.icon}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                      </div>
                      <p className="text-gray-600 leading-relaxed pr-14 text-justify">
                        {section.content}
                      </p>
                      {index < sections.length - 1 && (
                        <Separator className="mt-8 bg-gray-100" />
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-blue-900 mb-1">هل لديك أسئلة أخرى؟</h3>
                <p className="text-sm text-blue-700">فريقنا القانوني جاهز للإجابة على استفساراتك.</p>
              </div>
              <Link href="/contact">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                  <Mail className="w-4 h-4 ml-2" />
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>

          {/* 3. Sidebar (Quick Navigation) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                روابط ذات صلة
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/policy" className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm">
                    <Shield className="w-4 h-4" />
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm">
                    <AlertCircle className="w-4 h-4" />
                    مركز المساعدة
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    اتصل بنا
                  </Link>
                </li>
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <Link href="/">
                  <Button variant="ghost" className="w-full justify-start text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-4 h-4 ml-2" />
                    العودة للرئيسية
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}