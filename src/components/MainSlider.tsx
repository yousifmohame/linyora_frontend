'use client';

import React from 'react';
import Link from 'next/link'; // 1. استيراد Link
import { usePathname } from 'next/navigation'; // 2. استيراد usePathname
import { 
  Zap, 
  Sparkles, 
  Clock, 
  Shirt, 
  Crown, 
  Users, 
  Flame,
  Diamond 
} from 'lucide-react';

// 3. تحديث البيانات لإضافة مسار الرابط (href)
const categories = [
  { id: 'new', label: 'الرئيسيه', icon: Zap, href: '/' }, // مثال: صفحة الجديد
  { id: 'trending', label: 'الرائج', icon: Flame, href: '/trends' },
  { id: 'influencers', label: 'التصنيفات', icon: Sparkles, href: '/categories' },
  { id: 'fashion', label: 'الأزياء', icon: Shirt, href: '/products' },
];

const CategoryFilterBar = () => {
  // 4. الحصول على المسار الحالي لتحديد الزر النشط
  const pathname = usePathname();

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto scrollbar-hide scroll-smooth">
          {categories.map((cat) => {
            const Icon = cat.icon;
            
            // 5. التحقق مما إذا كان الرابط الحالي يطابق رابط الزر
            const isActive = pathname === cat.href;

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`
                  relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ease-out flex-shrink-0 select-none
                  ${isActive 
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-200 scale-105 ring-2 ring-rose-100 ring-offset-1' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-100 hover:border-gray-200'
                  }
                `}
              >
                <Icon 
                  className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} 
                  strokeWidth={2.5}
                />
                
                <span>{cat.label}</span>

                {isActive && (
                  <span className="absolute top-1 left-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterBar;