'use client';

import React, { useState } from 'react';
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

// تعريف البيانات بشكل منفصل لسهولة التعديل
const categories = [
  { id: 'new', label: 'الجديد', icon: Zap },
  { id: 'trending', label: 'الرائج', icon: Flame },
  { id: 'influencers', label: 'المؤثرات', icon: Sparkles },
  { id: 'latest', label: 'الأخيرة', icon: Clock },
  { id: 'fashion', label: 'الأزياء', icon: Shirt },
  { id: 'premium', label: 'البريميوم', icon: Crown },
  { id: 'exclusive', label: 'حصري', icon: Diamond },
  { id: 'private', label: 'الخاص', icon: Users },
];

const CategoryFilterBar = () => {
  const [activeId, setActiveId] = useState('new');

  return (
    // الخلفية مثبتة في الأعلى مع تأثير ضبابي خفيف (Glass Effect)
    <div className=" z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="container mx-auto">
        {/* حاوية التمرير الأفقي */}
        <div className="flex items-center gap-3 px-4 py-3 overflow-x-auto scrollbar-hide scroll-smooth">
          {categories.map((cat) => {
            const isActive = activeId === cat.id;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveId(cat.id)}
                className={`
                  relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-300 ease-out flex-shrink-0 select-none
                  ${isActive 
                    ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow-lg shadow-rose-200 scale-105 ring-2 ring-rose-100 ring-offset-1' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-gray-100 hover:border-gray-200'
                  }
                `}
              >
                {/* الأيقونة */}
                <Icon 
                  className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} 
                  strokeWidth={2.5}
                />
                
                {/* النص */}
                <span>{cat.label}</span>

                {/* نقطة مضيئة للعنصر النشط */}
                {isActive && (
                  <span className="absolute top-1 left-2 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterBar;