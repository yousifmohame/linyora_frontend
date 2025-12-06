// src/lib/api/stories.ts
import api from '@/lib/axios';
import { Story, StoryFeedItem } from '@/types/story';

// جلب شريط القصص للصفحة الرئيسية
export const fetchStoriesFeed = async (): Promise<StoryFeedItem[]> => {
  const { data } = await api.get('/stories/feed');
  return data;
};

// جلب تفاصيل القصص عند النقر (سواء لمستخدم أو لقسم أدمن)
export const fetchStoriesById = async (id: number, type: 'user' | 'section'): Promise<Story[]> => {
  const { data } = await api.get(`/stories/${id}/view?type=${type}`);
  return data;
};

// تسجيل مشاهدة لقصة
export const markStoryViewed = async (storyId: number) => {
  await api.post('/stories/view', { storyId });
};

// رفع قصة جديدة (سنستخدمها لاحقاً)
export const createStory = async (formData: FormData) => {
  const { data } = await api.post('/stories', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};