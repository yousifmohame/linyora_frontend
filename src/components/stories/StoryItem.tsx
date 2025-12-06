// src/components/stories/StoryItem.tsx
'use client';

import { StoryFeedItem } from '@/types/story';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface StoryItemProps {
  item: StoryFeedItem;
  onClick: () => void;
  isActive?: boolean;
  delay?: number;
}

export default function StoryItem({ 
  item, 
  onClick, 
  isActive = false,
  delay = 0 
}: StoryItemProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  // ✅ تصحيح: تحويل القيمة إلى boolean صراحة لمنع ظهور الصفر
  const isAdmin = Boolean(item.isAdminSection);
  
  const hasNewStories = !item.allViewed;
  
  // ✅ تصحيح: استخدام storyCount المباشر من البيانات
  const storyCount = item.storyCount || 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Animation for story count bubble
  const [countVisible, setCountVisible] = useState(false);
  useEffect(() => {
    if (storyCount > 1 && isMounted) {
      const timer = setTimeout(() => setCountVisible(true), 300 + delay);
      return () => clearTimeout(timer);
    }
  }, [storyCount, isMounted, delay]);

  return (
    <div 
      className="flex flex-col items-center gap-3 cursor-pointer group min-w-[84px] max-w-[84px]"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`${isAdmin ? 'Admin story' : 'User story'} from ${isAdmin ? item.title! : item.userName!}`}
    >
      {/* Main Story Container */}
      <div className="relative">
        {/* Gradient Ring Container with Animation */}
        <div className={cn(
          "relative p-[3px] transition-all duration-300 ease-out",
          "transform-gpu", // Enable GPU acceleration
          isMounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
          isActive ? "scale-105" : "",
          isHovering && !isActive ? "scale-105" : "",
          // Container shape
          isAdmin ? "w-20 h-28 rounded-2xl" : "w-20 h-20 rounded-full",
          // Gradient background
          hasNewStories 
            ? (isAdmin 
                ? "bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500" 
                : "bg-gradient-to-tr from-primary via-indigo-500 to-fuchsia-500")
            : "bg-gradient-to-tr from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700",
          // Pulse animation for new stories
          hasNewStories && "animate-pulse"
        )}>
          
          {/* Inner Glow Effect */}
          {hasNewStories && (
            <div className={cn(
              "absolute inset-0 rounded-[inherit]",
              "bg-gradient-to-tr opacity-20 blur-[2px]",
              isAdmin 
                ? "from-amber-400 to-rose-500" 
                : "from-primary to-fuchsia-500"
            )} />
          )}

          {/* White Inner Container with Smooth Transition */}
          <div className={cn(
            "relative w-full h-full",
            "bg-white dark:bg-gray-900",
            "border-[3px] border-white dark:border-gray-900",
            "transition-all duration-300",
            isHovering ? "border-opacity-90 dark:border-opacity-90" : "border-opacity-100",
            "overflow-hidden",
            isAdmin ? "rounded-[13px]" : "rounded-full"
          )}>
            {/* Image with Blur Effect */}
            <div className="relative w-full h-full">
              <Image
                src={isAdmin 
                  ? (item.cover_image || '/placeholder-story.jpg')
                  : (item.userAvatar || '/placeholder-user.png')
                }
                alt={isAdmin ? (item.title || 'Admin Section') : (item.userName || 'User')}
                fill
                sizes="80px"
                className={cn(
                  "object-cover transition-transform duration-500",
                  isHovering ? "scale-110" : "scale-100"
                )}
                priority={isAdmin} // Prioritize admin stories
              />
              
              {/* Dark Overlay on Hover */}
              <div className={cn(
                "absolute inset-0 bg-black transition-opacity duration-300",
                isHovering ? "opacity-10" : "opacity-0"
              )} />
            </div>
          </div>

          {/* Story Count Badge for Multiple Stories */}
          {storyCount > 1 && (
            <div className={cn(
              "absolute -top-1 -right-1",
              "flex items-center justify-center",
              "min-w-5 h-5 px-1",
              "bg-white dark:bg-gray-800",
              "text-xs font-bold",
              "rounded-full",
              "shadow-lg shadow-black/20",
              "border border-gray-200 dark:border-gray-700",
              "transition-all duration-300 ease-out z-10",
              countVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"
            )}>
              <span className="text-gray-800 dark:text-gray-200">
                {storyCount > 9 ? "9+" : storyCount}
              </span>
            </div>
          )}

          {/* Admin Badge with Improved Design */}
          {isAdmin && (
            <div className={cn(
              "absolute -bottom-2 left-1/2 -translate-x-1/2 z-10",
              "bg-gradient-to-r from-amber-500 to-orange-500",
              "text-white text-[10px] font-semibold",
              "px-2 py-0.5 rounded-full",
              "shadow-lg shadow-amber-500/30",
              "border border-amber-300/30",
              "whitespace-nowrap",
              "transition-all duration-300",
              isHovering ? "scale-110 shadow-xl" : "scale-100"
            )}>
              مميز
            </div>
          )}

          {/* Viewed Indicator (Overlay) */}
          {!hasNewStories && (
            <div className={cn(
              "absolute inset-0 rounded-[inherit] z-20",
              "bg-black/40 dark:bg-black/50",
              "backdrop-blur-[1px]",
              "transition-opacity duration-300",
              isHovering ? "opacity-30" : "opacity-50",
              "flex items-center justify-center"
            )}> 
               <Check className="w-6 h-6 text-white opacity-80" />
            </div>
          )}
        </div>
      </div>

      {/* Username/Title with Improved Typography */}
      <div className="flex flex-col items-center w-full gap-0.5">
        <span className={cn(
          "text-xs sm:text-sm font-medium text-center truncate w-full px-1",
          "text-gray-700 dark:text-gray-300",
          "transition-colors duration-300",
          isHovering ? "text-primary dark:text-primary-light" : "",
          isActive ? "text-primary font-bold" : ""
        )}>
          {isAdmin ? item.title : item.userName}
        </span>
        
        {/* عرض التوقيت */}
        {item.latestStoryTime && !isAdmin && (
          <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate w-full text-center">
             {new Date(item.latestStoryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        )}
      </div>
    </div>
  );
}