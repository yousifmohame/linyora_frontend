"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from '@/lib/axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Shield,
  Heart,
  Sparkles
} from 'lucide-react';

interface AgreementModalProps {
  agreementKey: string;
  isOpen: boolean;
  onClose: () => void;
  onAgree: () => void;
}

const AgreementModal = ({ agreementKey, isOpen, onClose, onAgree }: AgreementModalProps) => {
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState<boolean>(false);

  // refs للمحتوى ومنطقة التمرير
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollAreaViewportRef = useRef<HTMLDivElement>(null);

  // إعادة تعيين عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setHasScrolledToBottom(false);
      fetchAgreement();
    }
  }, [isOpen, agreementKey]);

  const fetchAgreement = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/content/${agreementKey}`);
      const data = response.data;
      setTitle(data.title || "الاتفاقية");
      setContent(data.content || "");
    } catch (error) {
      console.error("Failed to fetch agreement:", error);
      toast.error("❌ لا يمكن تحميل الاتفاقية حاليًا");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ التحقق التلقائي من الحاجة للتمرير بعد تحميل المحتوى
  useEffect(() => {
    if (isLoading || !content) return;

    // نستخدم setTimeout صغير لضمان أن DOM قد تم تحديثه
    const timer = setTimeout(() => {
      const viewport = scrollAreaViewportRef.current;
      const contentDiv = contentRef.current;

      if (!viewport || !contentDiv) {
        setHasScrolledToBottom(false);
        return;
      }

      // ارتفاع المحتوى الفعلي
      const contentHeight = contentDiv.scrollHeight;
      // ارتفاع منطقة العرض (المرئي)
      const viewportHeight = viewport.clientHeight;

      // إذا كان المحتوى أصغر من أو يساوي منطقة العرض → لا حاجة للتمرير
      if (contentHeight <= viewportHeight) {
        setHasScrolledToBottom(true);
      } else {
        // إذا كان المحتوى أطول، فالمستخدم لم يقرأه بعد (حتى يُطلب منه التمرير يدويًا)
        // لكننا لا نطلب تمريرًا هنا — فقط نبقي الزر معطّلًا حتى يتم التمرير
        // لكن بما أننا لا نستخدم onScroll، فلن نعرف إذا مرّر!
        // ❗ لذا: في هذا النموذج، نفترض أن المحتوى القصير = مقروء، والطويل = يجب أن يُطلب من المستخدم التمرير
        // لكن بدون onScroll، لا يمكن تتبع التمرير الطويل!
        // ⚠️ لذلك: هذا النموذج مناسب فقط إذا كنت **تعتمد على أن المحتوى دائمًا قصير** أو تريد تفعيل الزر دائمًا.
        // لكنك طلبت إزالة handleScroll، لذا الخيار الآمن هو: **تفعيل الزر دائمًا بعد التحميل**
        // لأن المستخدم لا يستطيع التمرير يدويًا دون حدث scroll!
        //
        // 🔥 الحل الواقعي: إذا أزلت handleScroll، فالمنطق الوحيد الآمن هو اعتبار المحتوى "مقروءًا" بعد التحميل.
        // وهذا مقبول في حالات مثل "إشعار بسيط" أو "شروط قصيرة".
        //
        // ✅ لذلك: نُفعّل الزر دائمًا بعد التحميل.
        setHasScrolledToBottom(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [content, isLoading]);

  const handleAgree = () => {
    toast.success("✨ شكرًا لموافقتك على الشروط والأحكام");
    onAgree();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden bg-gradient-to-br from-white to-pink-50/30 border-2 border-rose-200 rounded-3xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 to-rose-400 rounded-t-3xl" />
        
        <DialogHeader className="relative pt-6 pb-4 px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl border border-rose-200">
              {isLoading ? (
                <Loader2 className="h-6 w-6 text-rose-500 animate-spin" />
              ) : (
                <Shield className="h-6 w-6 text-rose-500" />
              )}
            </div>
            <Sparkles className="h-5 w-5 text-rose-300" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-center text-rose-900">
            {isLoading ? "جاري التحميل..." : title}
          </DialogTitle>
          
          <DialogDescription className="text-center text-rose-700 mt-2">
            <span className="flex items-center justify-center gap-2">
              <Heart className="h-4 w-4 text-rose-400 flex-shrink-0" />
              <span>يرجى قراءة البنود التالية بعناية والموافقة عليها للمتابعة</span>
              <Heart className="h-4 w-4 text-rose-400 flex-shrink-0" />
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="relative px-4">
          <ScrollArea className="h-80 w-full rounded-2xl border border-rose-200 bg-white/50 backdrop-blur-sm">
            <div className="p-6 min-h-[200px]" ref={scrollAreaViewportRef}>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-4">
                  <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
                  <p className="text-rose-700 font-medium">جاري تحميل الاتفاقية...</p>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              ) : content ? (
                <div 
                  ref={contentRef}
                  className="text-rose-900 leading-relaxed text-justify prose prose-rose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: content
                      .replace(/\n/g, '<br />')
                      .replace(/<h1/g, '<h1 class="text-rose-800 font-bold text-xl mt-6 mb-4"')
                      .replace(/<h2/g, '<h2 class="text-rose-700 font-semibold text-lg mt-5 mb-3"')
                      .replace(/<h3/g, '<h3 class="text-rose-600 font-medium mt-4 mb-2"')
                      .replace(/<p/g, '<p class="mb-4 text-rose-800"')
                      .replace(/<ul/g, '<ul class="list-disc list-inside mb-4 text-rose-800"')
                      .replace(/<ol/g, '<ol class="list-decimal list-inside mb-4 text-rose-800"')
                      .replace(/<li/g, '<li class="mb-1"')
                      .replace(/<strong/g, '<strong class="text-rose-900 font-semibold"')
                  }} 
                />
              ) : (
                <div className="flex items-center justify-center h-40 text-rose-600">
                  لا يوجد محتوى للعرض.
                </div>
              )}
            </div>
          </ScrollArea>

          {/* لن نعرض "استمر في التمرير" لأننا لا نتبع التمرير */}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4 px-4 border-t border-rose-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 gap-2 py-3 rounded-2xl border-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-all duration-300 font-medium"
          >
            <XCircle className="h-4 w-4" />
            إغلاق
          </Button>
          
          <Button
            onClick={handleAgree}
            disabled={isLoading}
            className="flex-1 gap-2 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            أوافق على الشروط
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgreementModal;