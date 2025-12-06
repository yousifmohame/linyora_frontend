// src/types/story.ts

export type StoryType = 'image' | 'video' | 'text';

// 1. شكل العنصر في شريط القصص (الدائرة الخارجية)
export interface StoryFeedItem {
  id: number;           // إما معرف المستخدم أو معرف القسم
  
  // حقول عامة
  isAdminSection: boolean;
  storyCount: number;
  viewedCount: number;
  allViewed: boolean;
  latestStoryTime?: string;

  // بيانات خاصة بأقسام الأدمن
  title?: string;       
  cover_image?: string | null;

  // بيانات خاصة بالمستخدمين
  userName?: string;    
  userAvatar?: string | null;
  role_id?: number;
}

// 2. تفاصيل القصة الواحدة (عند فتحها)
export interface Story {
  id: number;
  user_id: number;
  section_id?: number | null;
  type: StoryType;
  media_url: string | null;
  text_content: string | null;
  background_color?: string | null; // تم جعله اختياري
  expires_at: string;
  created_at: string;
  views?: number;
  
  // بيانات المنتج المروج له (إن وجدت)
  product_id?: number | null;
  product_name?: string;
  product_price?: number | string; // لدعم الصيغ المختلفة
  product_image?: string;
  
  // حالة المشاهدة
  isViewed: boolean;
}