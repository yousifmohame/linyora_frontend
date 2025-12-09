// src/app/help/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ShoppingBag,
  User,
  CreditCard,
  Truck,
  MessageCircle,
  Mail,
  FileText,
  ChevronLeft, // استخدمنا ChevronLeft لأن الاتجاه RTL
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: "الطلبات والمشتريات",
      description: "تتبع طلباتك، التعديل، والإلغاء.",
      link: "#orders"
    },
    {
      icon: <User className="w-6 h-6" />,
      title: "الحساب والملف الشخصي",
      description: "إدارة إعدادات حسابك والأمان.",
      link: "#account"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "المدفوعات والمحفظة",
      description: "طرق الدفع، الاسترداد، والرصيد.",
      link: "#payments"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "الشحن والتوصيل",
      description: "سياسات الشحن ومواعيد التسليم.",
      link: "#shipping"
    }
  ];

  const faqs = [
    {
      question: "كيف يمكنني تتبع طلبي؟",
      answer: "يمكنك تتبع طلبك بسهولة من خلال الذهاب إلى صفحة 'طلباتي' في لوحة التحكم، حيث ستجد رقم التتبع وحالة الطلب الحالية."
    },
    {
      question: "ما هي طرق الدفع المتاحة؟",
      answer: "نقبل جميع البطاقات الائتمانية (Visa, MasterCard)، بالإضافة إلى Apple Pay و Google Pay، والدفع عند الاستلام في بعض المناطق."
    },
    {
      question: "هل يمكنني إرجاع المنتج؟",
      answer: "نعم، يمكنك طلب إرجاع المنتج خلال 14 يوماً من تاريخ الاستلام، بشرط أن يكون المنتج في حالته الأصلية وغير مستخدم."
    },
    {
      question: "كيف يمكنني تغيير كلمة المرور؟",
      answer: "اذهب إلى 'الإعدادات' في ملفك الشخصي، ثم اختر 'الأمان' وقم باتباع الخطوات لتغيير كلمة المرور."
    },
    {
      question: "هل الشحن الدولي متاح؟",
      answer: "حالياً نقوم بالتوصيل داخل المملكة العربية السعودية ودول الخليج، ونعمل على توسيع نطاق خدماتنا قريباً."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20" dir="rtl">
      
      {/* 1. Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 text-white py-20 lg:py-28 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">كيف يمكننا مساعدتك؟</h1>
            <p className="text-lg md:text-xl text-rose-100 mb-8 max-w-2xl mx-auto">
              ابحث عن إجابات لاستفساراتك أو تصفح المواضيع الشائعة أدناه.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400 group-focus-within:text-rose-500 transition-colors" />
              </div>
              <Input 
                type="text" 
                placeholder="ابحث عن سؤال، موضوع، أو كلمة مفتاحية..." 
                className="w-full h-14 pr-12 pl-4 rounded-2xl border-0 shadow-lg text-gray-900 placeholder:text-gray-400 focus-visible:ring-4 focus-visible:ring-white/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        
        {/* 2. Topic Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {categories.map((cat, index) => (
            <Link href={cat.link} key={index} className="block group">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-rose-100 transition-all duration-300 h-full flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors duration-300">
                  {cat.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{cat.title}</h3>
                <p className="text-sm text-gray-500">{cat.description}</p>
              </div>
            </Link>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* 3. FAQ Section (Main Content) */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-rose-500" />
                الأسئلة الأكثر شيوعاً
              </h2>
              <p className="text-gray-500 mt-2">إجابات سريعة لأهم تساؤلات العملاء.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-100 last:border-0">
                    <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 hover:no-underline text-right text-gray-800 font-medium transition-colors data-[state=open]:text-rose-600">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 text-gray-600 leading-relaxed bg-gray-50/50">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* 4. Sidebar (Contact & Info) */}
          <div className="space-y-6">
            
            {/* Still Need Help Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">لم تجد إجابتك؟</h3>
                <p className="text-indigo-100 mb-6 text-sm">
                  فريق الدعم لدينا متاح لمساعدتك في أي وقت. لا تتردد في التواصل معنا.
                </p>
                <Link href="/contact">
                  <Button className="w-full bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-xl h-11">
                    تواصل معنا
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">روابط سريعة</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/policy" className="flex items-center justify-between text-gray-600 hover:text-rose-600 group text-sm">
                    <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        سياسة الخصوصية
                    </span>
                    <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="flex items-center justify-between text-gray-600 hover:text-rose-600 group text-sm">
                    <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        الشروط والأحكام
                    </span>
                    <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </li>
                <li>
                  <Link href="mailto:support@linyora.com" className="flex items-center justify-between text-gray-600 hover:text-rose-600 group text-sm">
                    <span className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        support@linyora.com
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}