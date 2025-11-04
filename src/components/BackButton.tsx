// src/components/BackButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  /**
   * النص المعروض على الزر
   */
  label?: string;
  /**
   * حجم الزر
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg';
  /**
   * نمط الزر
   * @default "ghost"
   */
  variant?: 'ghost' | 'outline' | 'link' | 'secondary';
  /**
   * أيقونة الزر
   * @default "arrow"
   */
  icon?: 'arrow' | 'chevron';
  /**
   * إظهار تأثير hover
   * @default true
   */
  showHoverEffect?: boolean;
  /**
   * إمكانية تعطيل الزر
   * @default false
   */
  disabled?: boolean;
  /**
   * مسار الرجوع البديل (اختياري)
   */
  fallbackPath?: string;
  /**
   * كلاسات CSS إضافية
   */
  className?: string;
}

/**
 * زر احترافي للتنقل العكسي مع دعم متعدد اللغات وتجربة مستخدم محسنة
 * 
 * @example
 * // الاستخدام الأساسي
 * <BackButton />
 * 
 * @example
 * // مع خصائص مخصصة
 * <BackButton 
 *   variant="outline"
 *   size="lg"
 *   label="رجوع"
 *   fallbackPath="/dashboard"
 *   className="mb-4"
 * />
 */
export function BackButton({
  label,
  size = 'default',
  variant = 'ghost',
  icon = 'arrow',
  showHoverEffect = true,
  disabled = false,
  fallbackPath,
  className,
}: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();

  /**
   * معالجة عملية الرجوع مع دعم المسار البديل
   */
  const handleNavigation = () => {
    if (fallbackPath) {
      router.push(fallbackPath);
    } else {
      router.back();
    }
  };

  /**
   * اختيار الأيقونة المناسبة بناءً على النوع
   */
  const IconComponent = icon === 'chevron' ? ChevronLeft : ArrowLeft;

  /**
   * أحجام الأيقونة بناءً على حجم الزر
   */
  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  /**
   * تباعد النص بناءً على حجم الزر
   */
  const labelSpacing = {
    sm: 'mr-1',
    default: 'mr-2',
    lg: 'mr-3',
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleNavigation}
      disabled={disabled}
      className={cn(
        'transition-all duration-200 ease-in-out',
        'focus:ring-2 focus:ring-primary focus:ring-offset-2',
        showHoverEffect && 'hover:scale-105 hover:shadow-md',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={label || t('common.back', 'Back')}
      title={label || t('common.back', 'Back to previous page')}
    >
      <IconComponent 
        className={cn(
          iconSizes[size],
          labelSpacing[size],
          'transition-transform duration-200',
          showHoverEffect && 'group-hover:-translate-x-1'
        )} 
      />
      {label || t('common.back', 'Back')}
    </Button>
  );
}

/**
 * نسخة مبسطة من الزر بدون نص (أيقونة فقط)
 */
export function BackButtonIcon({
  size = 'default',
  variant = 'ghost',
  className,
}: Pick<BackButtonProps, 'size' | 'variant' | 'className'>) {
  const router = useRouter();
  const { t } = useTranslation();

  const handleNavigation = () => {
    router.back();
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    default: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleNavigation}
      className={cn(
        'rounded-full bg-white transition-all duration-200',
        'hover:scale-110 focus:ring-2 focus:ring-primary',
        className
      )}
      aria-label={t('common.back', 'Back')}
      title={t('common.back', 'Back to previous page')}
    >
      <ArrowLeft className={iconSizes[size]} />
    </Button>
  );
}