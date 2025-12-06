'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { Section } from '@/types/section';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  ShoppingBag, 
  Star,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';

interface SectionDisplayProps {
  section: Section;
  wishlistStatus?: Record<number, boolean>; // optional
}

export default function SectionDisplay({ section }: SectionDisplayProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!section.is_active) return null;

/**
 * تعديل لون HEX عبر تغيير قنوات R/G/B بشكل منفصل
 * 
 * @param color - لون HEX (مثل: '#00bba7' أو '#abc')
 * @param adjustments - كائن يحتوي على تعديلات لكل قناة:
 *   - يمكن أن تكون قيمة رقمية (مثل: +30 أو -20)
 *   - أو سلسلة بنسبة مئوية (مثل: '+10%' أو '-20%')
 * @returns لون HEX معدل، أو اللون الأصلي إذا كان غير صالح
 */
function adjustHexColor(
  color: string,
  adjustments: {
    r?: number | string;
    g?: number | string;
    b?: number | string;
  }
): string {
  // التحقق من صحة التنسيق
  if (!color.startsWith('#')) {
    console.warn('Invalid HEX color (missing #):', color);
    return color;
  }

  // تحويل الألوان القصيرة #abc → #aabbcc
  let hex = color.slice(1);
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) {
    console.warn('Invalid HEX length:', color);
    return color;
  }

  // استخراج القيم العددية
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    console.warn('Invalid HEX values:', color);
    return color;
  }

  // دالة مساعدة لتطبيق التعديل (قيمة أو نسبة مئوية)
  const applyAdjustment = (value: number, adjustment: number | string): number => {
    let delta = 0;
    if (typeof adjustment === 'string') {
      const match = adjustment.trim().match(/^([+-]?)(\d+(?:\.\d+)?)%$/);
      if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const percent = parseFloat(match[2]) / 100;
        delta = Math.round(value * percent * sign);
      } else {
        console.warn('Invalid percentage format:', adjustment);
        return value;
      }
    } else {
      delta = adjustment;
    }
    return Math.min(255, Math.max(0, Math.round(value + delta)));
  };

  // تطبيق التعديلات
  if (adjustments.r !== undefined) r = applyAdjustment(r, adjustments.r);
  if (adjustments.g !== undefined) g = applyAdjustment(g, adjustments.g);
  if (adjustments.b !== undefined) b = applyAdjustment(b, adjustments.b);

  // إعادة التجميع إلى HEX
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}


  const sectionTitle = isRTL ? section.title_ar : section.title_en;
  const sectionDesc = isRTL ? section.description_ar : section.description_en;
  const themeColor = section.theme_color || '#ea580c';

  const secondColor = adjustHexColor(themeColor, {
  g: -3,   // نقص 3 من الأخضر
  b: +110,  // زد 52 على الأزرق
}); // -0.2 = أغمق 20%


  return (
    <div className="container mx-auto px-4 py-12">

      {/* === Banner with Circles and Content === */}
      <div className="relative overflow-hidden rounded-3xl mb-8">

        {/* Banner background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `linear-gradient(to left, ${themeColor}, ${secondColor})`,
          }}

        />

        {/* Circles */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Left Circle */}
          <div className="absolute -left-32 top-3/4 -translate-y-1/2 w-60 h-60">
            <div
              className="w-full h-full rounded-full opacity-40 bg-white"
              style={{ boxShadow: "0 0 50px 20px rgba(255,255,255,0.3)" }}
            />
          </div>

          {/* Right Circle */}
          <div className="absolute -right-32 top-[2/3] -translate-y-1/2 w-80 h-80">
            <div
              className="w-full h-full rounded-full opacity-40 bg-white"
              style={{ boxShadow: "0 0 50px 20px rgba(255,255,255,0.3)" }}
            />
          </div>
        </div>

        {/* Banner content */}
        <div className="relative z-20 flex flex-col p-8 lg:flex-row justify-between items-start lg:items-center text-white">
          
          <div className="flex-1 mb-6 lg:mb-0">
            <div className="flex items-center gap-3 mb-3">
              {section.icon && (
                <img 
                  src={section.icon} 
                  alt="" 
                  className="w-20 h-20 rounded-2xl object-contain"
                />
              )}
              <div>
                <h2 className="text-[20px] md:text-[35px] mb-3 font-stretch-75% leading-tight">
                  {sectionTitle}
                </h2>
                <p className="text-white text-lg max-w-2xl font-stretch-75% leading-relaxed opacity-90">
                  {sectionDesc}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Explore Button */}
            <Link href={`/sections/${section.id}`}>
              <Button 
                className="bg-white hover:bg-gray-100 rounded-2xl px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                style={{ color: themeColor }}
              >
                {t('ExploreSection', 'تصفح القسم')}
                {isRTL ? (
                  <ArrowLeft className="w-5 h-5 mr-2" />
                ) : (
                  <ArrowRight className="w-5 h-5 ml-2" />
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* === Main Content Card === */}
      <Card className="overflow-hidden p-0 border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 hover:shadow-2xl transition-all duration-500 rounded-3xl">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row">

            {/* Left: Categories */}
            <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
              <div className="mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {section.categories && section.categories.length > 0 ? (
                    section.categories.map((cat: any) => (
                      <Link key={cat.id} href={`/categories/${cat.name}`} className="group">
                        <div style={{ color: themeColor, backgroundColor : themeColor+'10', border:themeColor }} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group-hover:scale-105">
                          <div  className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 mb-3 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                              <img
                                src={cat.image_url || '/placeholder-category.svg'}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="px-3 py-1 hover:bg-orange-100 font-medium"
                              style={{ color: themeColor, backgroundColor : themeColor+'10', border:themeColor }}
                            >
                              {cat.name}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-400">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>{t('NoCategories', 'لا توجد تصنيفات')}</p>
                    </div>
                  )}
                </div>
              </div>
              
            </div>

            {/* Right: Featured Product / Slides */}
            <div className="lg:w-2/5 xl:w-1/3 relative min-h-[400px]">
              {section.featured_product_id ? (
                <Link
                  href={`/products/${section.featured_product_id}`}
                  className="block col-span-2 row-span-2 group cursor-pointer rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all"
                >
                  <div className="relative h-full min-h-[400px]">

                    {/* Product Image */}
                    <img
                      src={
                        section.product_image ||
                        "https://via.placeholder.com/400x600?text=No+Image"
                      }
                      alt={isRTL ? section.product_name_ar : section.product_name_en}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent"></div>

                    {/* Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <Badge
                        className="px-4 py-2 text-white text-base font-medium shadow-xl rounded-md border-0"
                        style={{
                          background: `linear-gradient(to right, ${themeColor}cc, ${themeColor})`
                        }}
                      >
                        <Star className="w-4 h-4 mr-1 fill-white" />
                        {t('Featured', 'مميز')}
                      </Badge>
                    </div>

                    {/* Bottom Info Area */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <h3 className="text-2xl text-white font-bold mb-3 line-clamp-1">
                        {isRTL ? section.product_name_ar : section.product_name_en}
                      </h3>

                      <p className="text-white/90 text-lg mb-5">
                        {section.product_description || t("DiscoverNow", "تعرف على التفاصيل")}
                      </p>

                      <div className="flex items-center justify-between">
                        <span
                          className="text-xl font-bold"
                          style={{ color: themeColor }}
                        >
                          {section.product_price} EGP
                        </span>

                        <Button
                          className="rounded-md shadow-xl border-0 text-white font-medium px-6 py-2"
                          style={{
                            background: `linear-gradient(to right, ${themeColor}cc, ${themeColor})`
                          }}
                        >
                          {t("ShopNow", "تسوق الآن")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative h-full min-h-[400px] bg-gray-100">
                  {section.slides && section.slides.length > 0 ? (
                    <>
                      {section.slides[currentSlide]?.media_type === 'video' ? (
                        <video 
                          src={section.slides[currentSlide].image_url} 
                          className="w-full h-full object-cover"
                          muted autoPlay loop playsInline
                        />
                      ) : (
                        <img 
                          src={section.slides[currentSlide].image_url} 
                          className="w-full h-full object-cover"
                          alt="Section slide"
                        />
                      )}

                      {/* Slide Indicators */}
                      {section.slides.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {section.slides.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Slide Caption */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                        <div className="text-white">
                          <h3 className="text-xl font-bold mb-1">
                            {isRTL ? section.slides[currentSlide]?.title_ar : section.slides[currentSlide]?.title_en}
                          </h3>
                          <p className="text-white/90 line-clamp-2">
                            {isRTL ? section.slides[currentSlide]?.description_ar : section.slides[currentSlide]?.description_en}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag className="w-20 h-20" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}