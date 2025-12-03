export interface SectionSlide {
  id?: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  image_url: string; // يستخدم للصورة أو الفيديو URL
  media_type: 'image' | 'video'; // <-- نوع الوسائط
  button_text_en: string;
  button_text_ar: string;
  button_link: string;
  sort_order?: number;
}

export interface Section {
  id: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon?: string;
  theme_color?: string; // <-- لون القسم
  featured_product_id?: number | null;
  is_active: boolean;
  sort_order: number;
  slides: SectionSlide[];
  category_ids: number[];
  product_name_en?: string;
  product_name_ar?: string;
  product_image?: string;
  product_price?: number;
  categories?: any[];
}