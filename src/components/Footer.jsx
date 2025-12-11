'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Facebook
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '@/lib/axios';
import { Skeleton } from '@/components/ui/skeleton';

const ICONS = {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Twitter,
  Facebook
};

// Newsletter Skeleton
const NewsletterSectionSkeleton = () => (
  <section className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 py-12 md:py-16 text-center px-4">
    <Skeleton className="h-10 w-48 mx-auto mb-4" />
    <Skeleton className="h-6 w-64 mx-auto mb-6" />
    <div className="flex justify-center gap-3 max-w-md mx-auto">
      <Skeleton className="h-10 w-2/3 rounded-full" />
      <Skeleton className="h-10 w-24 rounded-full" />
    </div>
  </section>
);

// Footer Skeleton (updated style)
const FooterSkeleton = () => {
  return (
    <footer className="bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 py-12 md:py-16 px-4 md:px-16 text-white">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Skeleton className="h-4 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto mt-2" />
      </div>
    </footer>
  );
};

const Footer = () => {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    const fetchFooterContent = async () => {
      try {
        setLoading(true);
        const response = await api.get('/content/footer');
        if (response.data?.content) {
          setContent(JSON.parse(response.data.content));
        } else {
          setContent(getDefaultFooterContent(t));
        }
      } catch (error) {
        console.error("Failed to fetch footer content:", error);
        setContent(getDefaultFooterContent(t));
      } finally {
        setLoading(false);
      }
    };

    fetchFooterContent();
  }, [t]);

  

  if (loading || !content) {
    return (
      <>
        <NewsletterSectionSkeleton />
        <FooterSkeleton />
      </>
    );
  }

  const GetIcon = ({ name, ...props }) => {
    const IconComponent = ICONS[name] || Mail;
    return <IconComponent {...props} />;
  };

  return (
    <>
      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 py-12 md:py-16 text-center px-4 text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">LINYORA</h1>
        <p className="text-sm opacity-90 mb-6">
          {isRTL
            ? 'حيث يلمع الأسلوب... ويتكلم الثقة ✨'
            : "Where style sparkles... and confidence speaks ✨"}
        </p>

        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          {isRTL ? 'اشتركي في النشرة البريدية' : 'Subscribe to Newsletter'}
        </h2>
        <p className="text-sm mb-6">
          {isRTL
            ? '🔥 احصلي على آخر الترندات والعروض الحصرية'
            : '🔥 Get the latest trends & exclusive offers'}
        </p>

        <form onSubmit={''} className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isRTL ? 'أدخلي بريدك الإلكتروني' : 'Enter your email'}
            className="w-full sm:w-2/3 px-4 py-2 rounded-full text-gray-900 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-white text-pink-600 font-bold px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
          >
            {isRTL ? 'اشترك' : 'Subscribe'}
          </button>
        </form>
      </section>

      {/* Main Footer */}
      <footer className="bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-700 py-12 md:py-16 px-4 md:px-16 text-white">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>

          {/* Column 1: Company */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>LINYORA</span>
              <span className="text-pink-300">❤️</span>
            </h3>
            <p className="text-sm opacity-90 leading-relaxed mb-4">
              {isRTL ? content.company.desc_ar : content.company.desc_en}
            </p>
            
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {isRTL ? 'المساعدة' : 'Quick Links'}
            </h3>
            <ul className="space-y-3 text-sm opacity-90">
              {content.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {isRTL ? link.label_ar : link.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Discover */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {isRTL ? 'السياسات' : 'Discover Linyora'}
            </h3>
            <ul className="space-y-3 text-sm opacity-90">
              {content.discoverLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="hover:opacity-80 transition-opacity"
                  >
                    {isRTL ? link.label_ar : link.label_en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">
              {isRTL ? 'تواصلي معنا' : 'Contact Us'}
            </h3>
            <ul className="space-y-3 text-sm opacity-90">
              <li className="flex items-start gap-2">
                <GetIcon name="MapPin" className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {isRTL ? content.contact.address_ar : content.contact.address_en}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <GetIcon name="Phone" className="h-4 w-4" />
                <span dir="ltr">{content.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <GetIcon name="Mail" className="h-4 w-4" />
                <span>{content.contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full border-b border-white/20 my-10"></div>

        {/* Payment + Social + Copyright */}
        <div dir='ltr' className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Payment Methods Icons */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex gap-3">
              {/* Apple Pay */}
              <div className="bg-white/10 px-4 py-2 rounded-lg text-lg flex items-center justify-center">
                <img 
                  src="/icons/apple-pay.svg" 
                  alt="Apple Pay" 
                  className="h-6 w-auto"
                />
              </div>

              {/* Mada */}
              <div className="bg-white/10 px-4 py-2 rounded-lg text-lg flex items-center justify-center">
                <img 
                  src="/icons/mada.svg" 
                  alt="Mada" 
                  className="h-6 w-auto"
                />
              </div>

              {/* Visa */}
              <div className="bg-white/10 px-4 py-2 rounded-lg text-lg flex items-center justify-center">
                <img 
                  src="/icons/visa.svg" 
                  alt="Visa" 
                  className="h-6 w-auto"
                />
              </div>

              {/* Mastercard */}
              <div className="bg-white/10 px-4 py-2 rounded-lg text-lg flex items-center justify-center">
                <img 
                  src="/icons/mastercard.svg" 
                  alt="Mastercard" 
                  className="h-6 w-auto"
                />
              </div>
            </div>
          </div>

          <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'} gap-3 mt-2`}>
              {content.socials.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} p-1.5 rounded-full text-white hover:opacity-90`}
                  aria-label={social.name}
                >
                  <GetIcon name={social.icon} className="h-5 w-5" />
                </a>
              ))}
            </div>
        </div>

        <div className="text-center mt-8 text-sm opacity-80">
          <p>😎 &quot;{isRTL ? 'لأن البساطة ليست ستايلك' : 'Because basic isn\'t your vibe'}&quot;</p>
          <p>
            {' '}❤️ {isRTL ? 'صُنع بـ 💖' : 'Made with 💖'}
            {isRTL ? content.legal.copyright_ar : content.legal.copyright_en}
            © {new Date().getFullYear()}{' '}
          </p>
        </div>
      </footer>
    </>
  );
};

export default Footer;

// Keep getDefaultFooterContent as before (no changes needed)
const getDefaultFooterContent = (t) => ({
  company: {
    desc_ar: t('footer.company.description') || 'لينيورا منصة عصرية...',
    desc_en: 'Linyora is a modern fashion platform...',
  },
  socials: [
    { name: 'Instagram', icon: 'Instagram', href: 'https://instagram.com/linyora', color: 'bg-gradient-to-tr from-pink-500 to-rose-500' },
    { name: 'Twitter', icon: 'Twitter', href: 'https://twitter.com/linyora', color: 'bg-sky-400' },
    { name: 'Facebook', icon: 'Facebook', href: 'https://facebook.com/linyora', color: 'bg-blue-600' }
  ],
  quickLinks: [
    { label_ar: 'الرئيسية', label_en: 'Home', href: '/' },
    { label_ar: 'المتجر', label_en: 'Shop', href: '/products' },
    { label_ar: 'من نحن', label_en: 'About Us', href: '/about' },
    { label_ar: 'سياسة الإرجاع', label_en: 'Return Policy', href: '/policy' },
    { label_ar: 'اتصل بنا', label_en: 'Contact', href: '/contact' }
  ],
  discoverLinks: [
    { label_ar: ' arrivals جديدة', label_en: 'New Arrivals', href: '/products?sort=newest' },
    { label_ar: 'الأكثر مبيعاً', label_en: 'Best Sellers', href: '/products?sort=best-selling' },
    { label_ar: 'عروض خاصة', label_en: 'Special Offers', href: '/products?filter=on-sale' },
    { label_ar: 'تصفح المصممين', label_en: 'Browse Designers', href: '/designers' }
  ],
  contact: {
    email: 'support@linyora.com',
    phone: '+966 11 123 4567',
    address_ar: 'الرياض، المملكة العربية السعودية',
    address_en: 'Riyadh, Saudi Arabia'
  },
  legal: {
    copyright_ar: 'لينيورا. جميع الحقوق محفوظة.',
    copyright_en: 'Linyora. All rights reserved.',
    privacyHref: '/policy',
    termsHref: '/policy'
  }
});