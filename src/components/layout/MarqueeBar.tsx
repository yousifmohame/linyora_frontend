// src/components/layout/MarqueeBar.tsx
'use client'; 

import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface MarqueeMessage {
  id: number;
  message_text: string;
}

export const MarqueeBar = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [speed, setSpeed] = useState(20);
  // 1. إضافة حالة للون الخلفية (القيمة الافتراضية أسود أو لون الهوية)
  const [bgColor, setBgColor] = useState('#000000'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMarqueeData = async () => {
      try {
        // 2. جلب الرسائل، السرعة، واللون في طلب واحد
        const [msgRes, speedRes, colorRes] = await Promise.all([
          api.get('/marquee/active'),
          api.get('/settings/marquee_speed'),
          api.get('/settings/marquee_bg_color') // جلب إعداد اللون
        ]);

        const activeMessages = msgRes.data.map((msg: MarqueeMessage) => msg.message_text);
        
        if (activeMessages.length > 0) {
          setMessages(activeMessages);
        } else {
          setMessages(["Welcome to Linora!"]); 
        }
        
        setSpeed(parseInt(speedRes.data, 10) || 20);
        
        // تعيين اللون إذا وجد، وإلا استخدام الافتراضي
        if (colorRes.data) {
            setBgColor(colorRes.data);
        }

      } catch (error) {
        console.error("Failed to fetch marquee data:", error);
        setMessages(["Welcome to Linora!", "Check out our latest offers."]);
      } finally {
        setLoading(false);
      }
    };

    getMarqueeData();
  }, []); 

  if (loading || messages.length === 0) {
    return null; 
  }

  return (
    // 3. تطبيق لون الخلفية ديناميكياً هنا
    // قمنا بإزالة bg-primary واستبدالها بـ style={{ backgroundColor: bgColor }}
    // أضفنا text-white لضمان ظهور النص (يمكنك تغييره حسب الحاجة)
    <div 
      className="overflow-hidden text-white transition-colors duration-500" 
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="animate-marquee whitespace-nowrap py-2 text-sm font-medium flex"
        style={{ animationDuration: `${speed}s` }}
      >
        {/* المجموعة الأصلية */}
        {messages.map((msg, i) => (
          <span key={i} className="mx-8 inline-block">{msg}</span>
        ))}
        
        {/* المجموعة المكررة لضمان استمرارية الحركة بدون انقطاع */}
        {messages.map((msg, i) => (
          <span key={`dup-${i}`} className="mx-8 inline-block">{msg}</span>
        ))}
        
        {/* تكرار إضافي للشاشات العريضة جداً لضمان عدم وجود فراغ */}
        {messages.map((msg, i) => (
          <span key={`dup2-${i}`} className="mx-8 inline-block">{msg}</span>
        ))}
      </div>
    </div>
  );
};