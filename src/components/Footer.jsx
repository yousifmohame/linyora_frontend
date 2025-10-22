'use client';

import React from 'react';
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

const Footer = () => {
  const { t, i18n } = useTranslation();

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

  const isRTL = i18n.language === 'ar';

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
            {[
              {
                icon: Heart,
                title: t('footer.features.exclusiveFashion.title'),
                description: t('footer.features.exclusiveFashion.description'),
                color: "bg-pink-400"
              },
              {
                icon: ShieldCheck,
                title: t('footer.features.safeEnvironment.title'),
                description: t('footer.features.safeEnvironment.description'),
                color: "bg-rose-400"
              },
              {
                icon: Truck,
                title: t('footer.features.fastDelivery.title'),
                description: t('footer.features.fastDelivery.description'),
                color: "bg-amber-400"
              },
              {
                icon: Sparkles,
                title: t('footer.features.womenSupport.title'),
                description: t('footer.features.womenSupport.description'),
                color: "bg-fuchsia-400"
              }
            ].map((feature, index) => (
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
                  <feature.icon className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </motion.div>
                <h3 className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
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
            <div className="flex items-center gap-3">
              <motion.div 
                className="relative w-20 h-10 md:w-20 md:h-10"
                whileHover={{ scale: 1.05 }}
              >
                <Image 
                  src="/logo3.png" 
                  alt="Linyora Logo" 
                  fill
                  className="object-cover"
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
              {t('footer.company.description')}
            </p>
            <div className={`flex space-x-3 md:space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>
              {[
                { icon: Instagram, href: 'https://instagram.com/linyora', color: 'bg-gradient-to-tr from-pink-500 to-rose-500', name: 'Instagram' },
                { icon: Twitter, href: 'https://twitter.com/linyora', color: 'bg-sky-400', name: 'Twitter' },
                { icon: Facebook, href: 'https://facebook.com/linyora', color: 'bg-blue-600', name: 'Facebook' },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${social.color} text-white p-1.5 md:p-2 rounded-full hover:opacity-90 transition-opacity`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.name}
                  aria-label={social.name}
                >
                  <social.icon className="h-3 w-3 md:h-5 md:w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
            <h4 className="text-lg md:text-xl font-bold text-gray-900">{t('footer.quickLinks.title')}</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { label: t('footer.quickLinks.home'), href: '/' },
                { label: t('footer.quickLinks.shop'), href: '/products' },
                { label: t('footer.quickLinks.about'), href: '/about' },
                { label: t('footer.quickLinks.returnPolicy'), href: '/policy' },
                { label: t('footer.quickLinks.contact'), href: '/contact' },
              ].map((link, index) => (
                <motion.li key={index} whileHover={{ x: isRTL ? -3 : 3 }}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-pink-500 transition-colors text-sm md:text-base"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Platform Sections */}
          <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
            <h4 className="text-lg md:text-xl font-bold text-gray-900">{t('footer.discoverLinyora.title')}</h4>
            <ul className="space-y-2 md:space-y-3">
              {[
                { label: t('footer.discoverLinyora.newArrivals'), href: '/products?sort=newest' },
                { label: t('footer.discoverLinyora.bestSellers'), href: '/products?sort=best-selling' },
                { label: t('footer.discoverLinyora.specialOffers'), href: '/products?filter=on-sale' },
                { label: t('footer.discoverLinyora.browseDesigners'), href: '/designers' }, // Assuming you have a designers page
              ].map((service, index) => (
                <motion.li key={index} whileHover={{ x: isRTL ? -3 : 3 }}>
                  <Link 
                    href={service.href} 
                    className="text-gray-600 hover:text-pink-500 transition-colors text-sm md:text-base"
                  >
                    {service.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div className="space-y-4 md:space-y-6" variants={itemVariants}>
            <h4 className="text-lg md:text-xl font-bold text-gray-900">{t('footer.contact.title')}</h4>
            <div className="space-y-3 md:space-y-4">
              {[
                { 
                  icon: Mail, 
                  text: 'support@linyora.com', 
                  href: 'mailto:support@linyora.com',
                  bg: 'bg-pink-100',
                  iconColor: 'text-pink-500'
                },
                { 
                  icon: Phone, 
                  text: '+966 11 123 4567', 
                  href: 'tel:+966111234567', 
                  dir: 'ltr',
                  bg: 'bg-rose-100',
                  iconColor: 'text-rose-500'
                },
                { 
                  icon: MapPin, 
                  text: t('footer.contact.address'), 
                  href: '#',
                  bg: 'bg-amber-100',
                  iconColor: 'text-amber-500'
                },
              ].map((contact, index) => (
                <motion.a
                  key={index}
                  href={contact.href}
                  className={`flex items-center gap-3 p-2 md:p-3 rounded-lg ${contact.bg} hover:bg-pink-50 transition-colors`}
                  whileHover={{ x: isRTL ? -3 : 3 }}
                >
                  <div className={`p-1.5 md:p-2 rounded-lg ${contact.iconColor}`}>
                    <contact.icon className="h-3 w-3 md:h-5 md:w-5" />
                  </div>
                  <span className="text-gray-700 hover:text-gray-900 text-xs md:text-sm" dir={contact.dir}>
                    {contact.text}
                  </span>
                </motion.a>
              ))}
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
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/policy" className="text-gray-500 hover:text-pink-500 text-xs md:text-sm transition-colors">
              {t('footer.legal.privacyPolicy')}
            </Link>
            <Link href="/policy" className="text-gray-500 hover:text-pink-500 text-xs md:text-sm transition-colors">
              {t('footer.legal.terms')}
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;