// src/components/layout/MarqueeBar.tsx
'use client'; 

import { useState, useEffect } from 'react';
import api from '@/lib/axios'; //

interface MarqueeMessage {
  id: number;
  message_text: string;
}

export const MarqueeBar = () => {
  const [messages, setMessages] = useState<string[]>([]);
  // --- 1. إضافة حالة للسرعة ---
  const [speed, setSpeed] = useState(20); // (قيمة افتراضية)
  const [loading, setLoading] = useState(true);

  // 2. جلب البيانات (الرسائل والسرعة)
  useEffect(() => {
    const getMarqueeData = async () => {
      try {
        const [msgRes, speedRes] = await Promise.all([
          api.get('/marquee/active'), //
          api.get('/settings/marquee_speed') // (الAPI الجديد)
        ]);

        const activeMessages = msgRes.data.map((msg: MarqueeMessage) => msg.message_text);
        
        if (activeMessages.length > 0) {
          setMessages(activeMessages);
        } else {
          setMessages(["Welcome to Linora!"]); 
        }
        
        setSpeed(parseInt(speedRes.data, 10) || 20);

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
    <div className="bg-primary text-primary-foreground overflow-hidden">
      {/* --- 3. تطبيق السرعة باستخدام Inline Style --- */}
      <div 
        className="animate-marquee whitespace-nowrap py-2 text-sm font-medium"
        style={{ animationDuration: `${speed}s` }}
      >
        {messages.map((msg, i) => (
          <span key={i} className="mx-4">{msg}</span>
        ))}
        {/* نكرر الرسائل لضمان ملء الشاشة أثناء الحركة */}
         {messages.map((msg, i) => (
          <span key={`dup-${i}`} className="mx-4">{msg}</span>
        ))}
      </div>
    </div>
  );
};