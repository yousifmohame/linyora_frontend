'use client';

// 1. إضافة import اللازمة
import React, { useState, useEffect } from 'react'; 
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Twitter, 
  Facebook,
  Globe 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios'; // 2. إضافة axios
import { Skeleton } from '@/components/ui/skeleton'; // 3. إضافة Skeleton للتحميل

// واجهة (interface) اختيارية لتنظيم البيانات
/*
interface FooterContent {
  features: { id: string, title_ar: string, title_en: string, desc_ar: string, desc_en: string, icon: string, color: string }[];
  company: { desc_ar: string, desc_en: string };
  socials: { name: string, icon: string, href: string, color: string }[];
  quickLinks: { label_ar: string, label_en: string, href: string }[];
  discoverLinks: { label_ar: string, label_en: string, href: string }[];
  contact: { email: string, phone: string, address_ar: string, address_en: string };
  legal: { copyright_ar: string, copyright_en: string, privacyHref: string, termsHref: string };
}
*/

// أيقونات للمطابقة مع البيانات القادمة من الـ API
const ICONS = {
  Heart,
  Sparkles,
  ShieldCheck,
  Truck,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Facebook,
  Globe
};

// Footer Skeleton Component (لإظهاره أثناء التحميل)
const FooterSkeleton = () => {
  return (
    <footer className="bg-[#FFF8F6] text-gray-800 rtl">
      <div className="border-b border-pink-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center p-4 md:p-6">
                <Skeleton className="w-14 h-14 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Col 1 */}
          <div className="space-y-4 md:space-y-6">
            <Skeleton className="h-10 w-32 mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="flex space-x-3 md:space-x-4">
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </div>
          </div>
          {/* Col 2 */}
          <div className="space-y-4 md:space-y-6">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
          </div>
          {/* Col 3 */}
          <div className="space-y-4 md:space-y-6">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
          </div>
          {/* Col 4 */}
          <div className="space-y-4 md:space-y-6">
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
            <Skeleton className="h-10 w-full mb-2" />
          </div>
        </div>
      </div>
    </footer>
  );
};


const Footer = () => {
  const { t, i18n } = useTranslation();
  // 4. إضافة state لحفظ البيانات والتحميل
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  const isRTL = i18n.language === 'ar';

  // 5. جلب البيانات عند تحميل المكون
  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        setLoading(true);
        // نفترض أنك ستستخدم 'footer' كـ slug
        const response = await api.get('/content/footer');
        if (response.data && response.data.content) {
          // البيانات مخزنة كـ JSON string في قاعدة البيانات
          setContent(JSON.parse(response.data.content));
        } else {
          // بيانات افتراضية في حال لم يتم إعدادها بعد
          setContent(getDefaultFooterContent(t));
        }
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
        // استخدام بيانات افتراضية في حال حدوث خطأ
        setContent(getDefaultFooterContent(t));
      } finally {
        setLoading(false);
      }
    };

    fetchFooterContent();
  }, [t]); // الاعتماد على 't' لضمان تحديث البيانات الافتراضية عند تغيير اللغة

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };
  // 6. إظهار هيكل التحميل (Skeleton)
  if (loading || !content) {
    return <FooterSkeleton />;
  }

  // دالة للحصول على الأيقونة بناءً على اسمها
  const GetIcon = ({ name, ...props }) => {
    const IconComponent = ICONS[name] || Globe; // Globe كأيقونة افتراضية
    return <IconComponent {...props} />;
  };

  // 7. عرض البيانات الديناميكية
  return (
    <footer className={`bg-[#FFF8F6] text-gray-800 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Features Section */}
      <div className="border-b border-pink-100 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {content.features.map((feature, index) => {
              const title = isRTL ? feature.title_ar : feature.title_en;
              const description = isRTL ? feature.desc_ar : feature.desc_en;
              return (
                <motion.div 
                  key={index} 
                  className="flex flex-col items-center text-center p-4 md:p-6 rounded-xl hover:bg-pink-50/50 transition-all duration-300"
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                >
                  <motion.div 
                    className={`${feature.color} w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-3 md:mb-4`}
                    whileHover={{ rotate: 10, scale: 1.05 }}
                  >
                    <GetIcon name={feature.icon} className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </motion.div>
                  <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-900">{title}</h3>
                  <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {/* Company Info */}
          <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
            {/* (الشعار ثابت) */}
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative w-30 h-20 md:w-20 md:h-10"
                whileHover={{ scale: 1.05 }}
              >
                <Image 
                  src="/logo5.jpg" 
                  alt="Linyora Logo" 
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 40px, 48px"
                />
              </motion.div>
              <motion.h3 
                className="text-xl md:text-3xl font-bold text-pink-500"
                whileHover={{ scale: 1.02 }}
              >
                Linyora
              </motion.h3>
            </div>
            
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              {isRTL ? content.company.desc_ar : content.company.desc_en}
            </p>
            <div className={`flex space-x-3 md:space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              {content.socials.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} text-white p-1.5 md:p-2 rounded-full hover:opacity-90 transition-opacity`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  title={social.name}
                  aria-label={social.name}
                >
                  <GetIcon name={social.icon} className="h-3 w-3 md:h-5 md:w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
            <h4 className="text-lg md:text-xl font-bold text-gray-900">{t('footer.quickLinks.title')}</h4>
            <ul className="space-y-2 md:space-y-3">
              {content.quickLinks.map((link, index) => (
                <motion.li key={index} whileHover={{ x: isRTL ? -3 : 3 }}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-pink-500 transition-colors text-sm md:text-base"
                  >
                    {isRTL ? link.label_ar : link.label_en}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Platform Sections */}
          <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
            <h4 className="text-lg md:text-xl font-bold text-gray-900">{t('footer.discoverLinyora.title')}</h4>
            <ul className="space-y-2 md:space-y-3">
              {content.discoverLinks.map((service, index) => (
                <motion.li key={index} whileHover={{ x: isRTL ? -3 : 3 }}>
                  <Link 
                    href={service.href} 
                    className="text-gray-600 hover:text-pink-500 transition-colors text-sm md:text-base"
                  >
                    {isRTL ? service.label_ar : service.label_en}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
            <h4 className="text-lg md:text-xl font-bold text-gray-900">{t('footer.contact.title')}</h4>
            <div className="space-y-3 md:space-y-4">
              {/* Email */}
              <motion.a
                href={`mailto:${content.contact.email}`}
                className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-pink-100 hover:bg-pink-50 transition-colors"
                whileHover={{ x: isRTL ? -3 : 3 }}
              >
                <div className="p-1.5 md:p-2 rounded-lg text-pink-500">
                  <Mail className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-gray-700 hover:text-gray-900 text-xs md:text-sm">
                  {content.contact.email}
                </span>
              </motion.a>
              {/* Phone */}
              <motion.a
                href={`tel:${content.contact.phone}`}
                className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-rose-100 hover:bg-pink-50 transition-colors"
                whileHover={{ x: isRTL ? -3 : 3 }}
              >
                <div className="p-1.5 md:p-2 rounded-lg text-rose-500">
                  <Phone className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-gray-700 hover:text-gray-900 text-xs md:text-sm" dir="ltr">
                  {content.contact.phone}
                </span>
              </motion.a>
              {/* Address */}
              <motion.a
                href="#"
                className="flex items-center gap-3 p-2 md:p-3 rounded-lg bg-amber-100 hover:bg-pink-50 transition-colors"
                whileHover={{ x: isRTL ? -3 : 3 }}
              >
                <div className="p-1.5 md:p-2 rounded-lg text-amber-500">
                  <MapPin className="h-3 w-3 md:h-5 md:w-5" />
                </div>
                <span className="text-gray-700 hover:text-gray-900 text-xs md:text-sm">
                  {isRTL ? content.contact.address_ar : content.contact.address_en}
                </span>
              </motion.a>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-pink-100 mt-8 md:mt-16 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <p className="text-gray-500 text-xs md:text-sm text-center md:text-left">
            © {new Date().getFullYear()} {isRTL ? content.legal.copyright_ar : content.legal.copyright_en}
          </p>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href={content.legal.privacyHref} className="text-gray-500 hover:text-pink-500 text-xs md:text-sm transition-colors">
              {t('footer.legal.privacyPolicy')}
            </Link>
            <Link href={content.legal.termsHref} className="text-gray-500 hover:text-pink-500 text-xs md:text-sm transition-colors">
              {t('footer.legal.terms')}
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;

// دالة مساعدة لإنشاء بيانات افتراضية (لضمان عدم تعطل الموقع قبل أن يقوم الأدمن بالحفظ)
const getDefaultFooterContent = (t) => ({
  features: [
    { icon: 'Heart', color: 'bg-pink-400', title_ar: t('footer.features.exclusiveFashion.title'), title_en: 'Exclusive Fashion', desc_ar: t('footer.features.exclusiveFashion.description'), desc_en: 'Exclusive selection of...' },
    { icon: 'ShieldCheck', color: 'bg-rose-400', title_ar: t('footer.features.safeEnvironment.title'), title_en: 'Safe Environment', desc_ar: t('footer.features.safeEnvironment.description'), desc_en: '100% secure payment...' },
    { icon: 'Truck', color: 'bg-amber-400', title_ar: t('footer.features.fastDelivery.title'), title_en: 'Fast Delivery', desc_ar: t('footer.features.fastDelivery.description'), desc_en: 'Fast and reliable...' },
    { icon: 'Sparkles', color: 'bg-fuchsia-400', title_ar: t('footer.features.womenSupport.title'), title_en: 'Women Support', desc_ar: t('footer.features.womenSupport.description'), desc_en: 'Supporting women...' }
  ],
  company: {
    desc_ar: t('footer.company.description'),
    desc_en: 'Linyora is a platform...'
  },
  socials: [
    { name: 'Instagram', icon: 'Instagram', href: 'https://instagram.com/linyora', color: 'bg-gradient-to-tr from-pink-500 to-rose-500' },
    { name: 'Twitter', icon: 'Twitter', href: 'https://twitter.com/linyora', color: 'bg-sky-400' },
    { name: 'Facebook', icon: 'Facebook', href: 'https://facebook.com/linyora', color: 'bg-blue-600' }
  ],
  quickLinks: [
    { label_ar: t('footer.quickLinks.home'), label_en: 'Home', href: '/' },
    { label_ar: t('footer.quickLinks.shop'), label_en: 'Shop', href: '/products' },
    { label_ar: t('footer.quickLinks.about'), label_en: 'About Us', href: '/about' },
    { label_ar: t('footer.quickLinks.returnPolicy'), label_en: 'Return Policy', href: '/policy' },
    { label_ar: t('footer.quickLinks.contact'), label_en: 'Contact', href: '/contact' }
  ],
  discoverLinks: [
    { label_ar: t('footer.discoverLinyora.newArrivals'), label_en: 'New Arrivals', href: '/products?sort=newest' },
    { label_ar: t('footer.discoverLinyora.bestSellers'), label_en: 'Best Sellers', href: '/products?sort=best-selling' },
    { label_ar: t('footer.discoverLinyora.specialOffers'), label_en: 'Special Offers', href: '/products?filter=on-sale' },
    { label_ar: t('footer.discoverLinyora.browseDesigners'), label_en: 'Browse Designers', href: '/designers' }
  ],
  contact: {
    email: 'support@linyora.com',
    phone: '+966 11 123 4567',
    address_ar: t('footer.contact.address'),
    address_en: 'Riyadh, Saudi Arabia'
  },
  legal: {
    copyright_ar: t('footer.copyright'),
    copyright_en: 'Linyora. All rights reserved.',
    privacyHref: '/policy',
    termsHref: '/policy'
  }
});