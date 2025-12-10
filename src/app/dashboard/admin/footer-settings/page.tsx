'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Loader2,
  Save,
  Trash2,
  PlusCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Heart,
  Sparkles,
  Link,
  Users,
  Mail,
  Phone,
  MapPin,
  Copyright,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import AdminNav from '@/components/dashboards/AdminNav';
import { Badge } from '@/components/ui/badge';

// --- 1. تعريف هياكل البيانات ---

interface FeatureItem {
  id: number;
  icon: string;
  color: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

interface LinkItem {
  id: number;
  label_ar: string;
  label_en: string;
  href: string;
}

interface SocialLink {
  id: number;
  name: string;
  icon: string;
  href: string;
  color: string;
}

interface FooterContent {
  features: FeatureItem[];
  company: {
    desc_ar: string;
    desc_en: string;
  };
  socials: SocialLink[];
  quickLinks: LinkItem[];
  discoverLinks: LinkItem[];
  contact: {
    email: string;
    phone: string;
    address_ar: string;
    address_en: string;
  };
  legal: {
    copyright_ar: string;
    copyright_en: string;
    privacyHref: string;
    termsHref: string;
  };
}

// --- 2. البيانات الافتراضية (Fallback) ---

const defaultFooterContent: FooterContent = {
  features: [
    {
      id: 1,
      icon: 'Heart',
      color: 'bg-pink-400',
      title_ar: 'أزياء حصرية',
      title_en: 'Exclusive Fashion',
      desc_ar: 'تشكيلة منتقاة من أحدث التصاميم.',
      desc_en: 'Exclusive selection of the latest designs.',
    },
  ],
  company: {
    desc_ar: 'لينورا هي منصة تجمع المصممات السعوديات المبدعات.',
    desc_en: 'Linyora is a platform connecting creative Saudi designers.',
  },
  socials: [
    {
      id: 1,
      name: 'Instagram',
      icon: 'Instagram',
      href: 'https://instagram.com/linyora',
      color: 'bg-gradient-to-tr from-pink-500 to-rose-500',
    },
  ],
  quickLinks: [
    { id: 1, label_ar: 'الرئيسية', label_en: 'Home', href: '/' },
    { id: 2, label_ar: 'المتجر', label_en: 'Shop', href: '/products' },
  ],
  discoverLinks: [
    {
      id: 1,
      label_ar: 'وصل حديثاً',
      label_en: 'New Arrivals',
      href: '/products?sort=newest',
    },
  ],
  contact: {
    email: 'support@linyora.com',
    phone: '+966 11 123 4567',
    address_ar: 'الرياض، المملكة العربية السعودية',
    address_en: 'Riyadh, Saudi Arabia',
  },
  legal: {
    copyright_ar: 'لينورا. جميع الحقوق محفوظة.',
    copyright_en: 'Linyora. All rights reserved.',
    privacyHref: '/policy',
    termsHref: '/policy',
  },
};

// --- 3. المكون الرئيسي للصفحة ---

export default function FooterSettingsPage() {
  const [content, setContent] = useState<FooterContent>(defaultFooterContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['features']));

  // --- 4. جلب البيانات عند تحميل الصفحة ---
  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const response = await api.get('/admin/content/footer');
        if (response.data && response.data.content) {
          setContent(JSON.parse(response.data.content));
        } else {
          setContent(defaultFooterContent);
        }
      } catch (error) {
        toast.error('فشل في جلب إعدادات الفوتر.');
        setContent(defaultFooterContent);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // --- 5. دوال مساعدة لإدارة الحالة ---

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // دالة عامة لتحديث الحقول البسيطة (مثل contact, legal, company)
  const handleTextChange = (
    section: 'contact' | 'legal' | 'company',
    key: string,
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // دالة عامة لتحديث حقل في عنصر داخل مصفوفة
  const handleArrayChange = (
    arrayName: 'features' | 'quickLinks' | 'discoverLinks' | 'socials',
    index: number,
    field: string,
    value: string
  ) => {
    const newArray = [...content[arrayName]];
    (newArray[index] as any)[field] = value;
    setContent((prev) => ({
      ...prev,
      [arrayName]: newArray,
    }));
  };

  // دالة عامة لإضافة عنصر جديد لمصفوفة
  const addArrayItem = (
    arrayName: 'features' | 'quickLinks' | 'discoverLinks' | 'socials'
  ) => {
    let newItem: any;
    const newId = Date.now();
    switch (arrayName) {
      case 'features':
        newItem = {
          id: newId,
          icon: 'Sparkles',
          color: 'bg-pink-400',
          title_ar: 'ميزة جديدة',
          title_en: 'New Feature',
          desc_ar: '',
          desc_en: '',
        };
        break;
      case 'quickLinks':
      case 'discoverLinks':
        newItem = {
          id: newId,
          label_ar: 'رابط جديد',
          label_en: 'New Link',
          href: '/',
        };
        break;
      case 'socials':
        newItem = {
          id: newId,
          name: 'Twitter',
          icon: 'Twitter',
          href: 'https://',
          color: 'bg-sky-400',
        };
        break;
    }
    setContent((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem],
    }));
  };

  // دالة عامة لحذف عنصر من مصفوفة
  const removeArrayItem = (
    arrayName: 'features' | 'quickLinks' | 'discoverLinks' | 'socials',
    id: number
  ) => {
    setContent((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((item) => item.id !== id),
    }));
  };

  // --- 6. دالة حفظ البيانات ---
  const handleSubmit = async () => {
    setSaving(true);
    try {
      const key = 'footer'; 
      const payload = {
        content: JSON.stringify(content),
      };

      await api.put(`/admin/content/${key}`, payload);
      toast.success('تم حفظ إعدادات الفوتر بنجاح!');
    } catch (error) {
      console.error('Failed to save footer settings:', error);
      toast.error('حدث خطأ أثناء حفظ الإعدادات.');
    } finally {
      setSaving(false);
    }
  };

  // --- 7. واجهة التحميل ---
  if (loading) {
    return <LoadingSkeleton />;
  }

  // --- 8. واجهة الصفحة الرئيسية ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-3 sm:p-4 lg:p-6">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 relative">
        <AdminNav />
        
        {/* Header Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl lg:text-2xl">
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-pink-200" />
                  إدارة محتوى الفوتر
                </CardTitle>
                <CardDescription className="text-pink-100 text-sm">
                  تحكم في جميع العناصر التي تظهر في الفوتر الخاص بالموقع
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 self-start sm:self-center">
                {content.features.length + content.quickLinks.length + content.discoverLinks.length} عنصر
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 sm:p-6">
            {/* Mobile Accordion View */}
            <div className="lg:hidden space-y-4">
              {/* Features Section */}
              <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                <CardHeader 
                  className="p-4 cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg"
                  onClick={() => toggleSection('features')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-rose-900">
                      <Sparkles className="h-4 w-4 text-rose-600" />
                      المزايا
                    </CardTitle>
                    {expandedSections.has('features') ? 
                      <ChevronUp className="h-4 w-4 text-rose-600" /> : 
                      <ChevronDown className="h-4 w-4 text-rose-600" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.has('features') && (
                  <CardContent className="p-4 pt-0 space-y-4">
                    {content.features.map((feature, index) => (
                      <FeatureEditor
                        key={feature.id}
                        item={feature}
                        onChange={(field, value) =>
                          handleArrayChange('features', index, field, value)
                        }
                        onDelete={() => removeArrayItem('features', feature.id)}
                      />
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-10"
                      onClick={() => addArrayItem('features')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> إضافة ميزة جديدة
                    </Button>
                  </CardContent>
                )}
              </Card>

              {/* Quick Links Section */}
              <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                <CardHeader 
                  className="p-4 cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg"
                  onClick={() => toggleSection('quickLinks')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-rose-900">
                      <Link className="h-4 w-4 text-rose-600" />
                      الروابط السريعة
                    </CardTitle>
                    {expandedSections.has('quickLinks') ? 
                      <ChevronUp className="h-4 w-4 text-rose-600" /> : 
                      <ChevronDown className="h-4 w-4 text-rose-600" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.has('quickLinks') && (
                  <CardContent className="p-4 pt-0 space-y-4">
                    {content.quickLinks.map((link, index) => (
                      <LinkEditor
                        key={link.id}
                        item={link}
                        onChange={(field, value) =>
                          handleArrayChange('quickLinks', index, field, value)
                        }
                        onDelete={() => removeArrayItem('quickLinks', link.id)}
                      />
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-10"
                      onClick={() => addArrayItem('quickLinks')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> إضافة رابط سريع
                    </Button>
                  </CardContent>
                )}
              </Card>

              {/* Discover Links Section */}
              <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                <CardHeader 
                  className="p-4 cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg"
                  onClick={() => toggleSection('discoverLinks')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-rose-900">
                      <Heart className="h-4 w-4 text-rose-600" />
                      روابط الاكتشاف
                    </CardTitle>
                    {expandedSections.has('discoverLinks') ? 
                      <ChevronUp className="h-4 w-4 text-rose-600" /> : 
                      <ChevronDown className="h-4 w-4 text-rose-600" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.has('discoverLinks') && (
                  <CardContent className="p-4 pt-0 space-y-4">
                    {content.discoverLinks.map((link, index) => (
                      <LinkEditor
                        key={link.id}
                        item={link}
                        onChange={(field, value) =>
                          handleArrayChange('discoverLinks', index, field, value)
                        }
                        onDelete={() => removeArrayItem('discoverLinks', link.id)}
                      />
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-10"
                      onClick={() => addArrayItem('discoverLinks')}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> إضافة رابط اكتشاف
                    </Button>
                  </CardContent>
                )}
              </Card>

              {/* Contact & Social Section */}
              <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                <CardHeader 
                  className="p-4 cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg"
                  onClick={() => toggleSection('contact')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-rose-900">
                      <Users className="h-4 w-4 text-rose-600" />
                      التواصل والاجتماعي
                    </CardTitle>
                    {expandedSections.has('contact') ? 
                      <ChevronUp className="h-4 w-4 text-rose-600" /> : 
                      <ChevronDown className="h-4 w-4 text-rose-600" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.has('contact') && (
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-rose-900">البريد الإلكتروني</Label>
                      <Input
                        value={content.contact.email}
                        onChange={(e) => handleTextChange('contact', 'email', e.target.value)}
                        className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-rose-900">رقم الهاتف</Label>
                      <Input
                        value={content.contact.phone}
                        onChange={(e) => handleTextChange('contact', 'phone', e.target.value)}
                        className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-rose-900">العنوان (عربي)</Label>
                      <Input
                        value={content.contact.address_ar}
                        onChange={(e) => handleTextChange('contact', 'address_ar', e.target.value)}
                        className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-rose-900">العنوان (إنجليزي)</Label>
                      <Input
                        value={content.contact.address_en}
                        onChange={(e) => handleTextChange('contact', 'address_en', e.target.value)}
                        className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                      />
                    </div>

                    <div className="pt-4 border-t border-rose-100">
                      <h4 className="font-semibold mb-3 text-rose-900 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        روابط التواصل الاجتماعي
                      </h4>
                      {content.socials.map((social, index) => (
                        <SocialEditor
                          key={social.id}
                          item={social}
                          onChange={(field, value) =>
                            handleArrayChange('socials', index, field, value)
                          }
                          onDelete={() => removeArrayItem('socials', social.id)}
                        />
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-10 mt-2"
                        onClick={() => addArrayItem('socials')}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> إضافة رابط اجتماعي
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Company & Legal Section */}
              <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                <CardHeader 
                  className="p-4 cursor-pointer bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg"
                  onClick={() => toggleSection('company')}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-rose-900">
                      <Copyright className="h-4 w-4 text-rose-600" />
                      الشركة والقانونية
                    </CardTitle>
                    {expandedSections.has('company') ? 
                      <ChevronUp className="h-4 w-4 text-rose-600" /> : 
                      <ChevronDown className="h-4 w-4 text-rose-600" />
                    }
                  </div>
                </CardHeader>
                {expandedSections.has('company') && (
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="space-y-3">
                      <Label className="text-rose-900">الوصف (عربي)</Label>
                      <Textarea
                        value={content.company.desc_ar}
                        onChange={(e) => handleTextChange('company', 'desc_ar', e.target.value)}
                        className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl min-h-20"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-rose-900">الوصف (إنجليزي)</Label>
                      <Textarea
                        value={content.company.desc_en}
                        onChange={(e) => handleTextChange('company', 'desc_en', e.target.value)}
                        className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl min-h-20"
                      />
                    </div>

                    <div className="pt-4 border-t border-rose-100">
                      <h4 className="font-semibold mb-3 text-rose-900 flex items-center gap-2">
                        <Copyright className="h-4 w-4" />
                        المعلومات القانونية
                      </h4>
                      <div className="space-y-3">
                        <Label className="text-rose-900">نص الحقوق (عربي)</Label>
                        <Input
                          value={content.legal.copyright_ar}
                          onChange={(e) => handleTextChange('legal', 'copyright_ar', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-rose-900">نص الحقوق (إنجليزي)</Label>
                        <Input
                          value={content.legal.copyright_en}
                          onChange={(e) => handleTextChange('legal', 'copyright_en', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-rose-900">رابط سياسة الخصوصية</Label>
                        <Input
                          value={content.legal.privacyHref}
                          onChange={(e) => handleTextChange('legal', 'privacyHref', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-rose-900">رابط الشروط والأحكام</Label>
                        <Input
                          value={content.legal.termsHref}
                          onChange={(e) => handleTextChange('legal', 'termsHref', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Desktop Tabs View */}
            <div className="hidden lg:block">
              <Tabs defaultValue="features" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-rose-50/50 border border-rose-200 rounded-2xl p-1">
                  <TabsTrigger value="features" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
                    <Sparkles className="h-4 w-4" />
                    المزايا
                  </TabsTrigger>
                  <TabsTrigger value="links" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
                    <Link className="h-4 w-4" />
                    الروابط
                  </TabsTrigger>
                  <TabsTrigger value="discover" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
                    <Heart className="h-4 w-4" />
                    الاكتشاف
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
                    <Users className="h-4 w-4" />
                    التواصل
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-xl">
                    <Copyright className="h-4 w-4" />
                    الشركة
                  </TabsTrigger>
                </TabsList>

                {/* تبويب المزايا */}
                <TabsContent value="features" className="space-y-4 pt-4">
                  {content.features.map((feature, index) => (
                    <FeatureEditor
                      key={feature.id}
                      item={feature}
                      onChange={(field, value) =>
                        handleArrayChange('features', index, field, value)
                      }
                      onDelete={() => removeArrayItem('features', feature.id)}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-12"
                    onClick={() => addArrayItem('features')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> إضافة ميزة جديدة
                  </Button>
                </TabsContent>

                {/* تبويب الروابط السريعة */}
                <TabsContent value="links" className="space-y-4 pt-4">
                  {content.quickLinks.map((link, index) => (
                    <LinkEditor
                      key={link.id}
                      item={link}
                      onChange={(field, value) =>
                        handleArrayChange('quickLinks', index, field, value)
                      }
                      onDelete={() => removeArrayItem('quickLinks', link.id)}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-12"
                    onClick={() => addArrayItem('quickLinks')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> إضافة رابط سريع
                  </Button>
                </TabsContent>

                {/* تبويب روابط الاكتشاف */}
                <TabsContent value="discover" className="space-y-4 pt-4">
                  {content.discoverLinks.map((link, index) => (
                    <LinkEditor
                      key={link.id}
                      item={link}
                      onChange={(field, value) =>
                        handleArrayChange('discoverLinks', index, field, value)
                      }
                      onDelete={() => removeArrayItem('discoverLinks', link.id)}
                    />
                  ))}
                  <Button
                    variant="outline"
                    className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-12"
                    onClick={() => addArrayItem('discoverLinks')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> إضافة رابط اكتشاف
                  </Button>
                </TabsContent>

                {/* تبويب التواصل والاجتماعي */}
                <TabsContent value="contact" className="space-y-6 pt-4">
                  <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2 text-rose-900">
                        <Mail className="h-5 w-5 text-rose-600" />
                        معلومات التواصل
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 p-6">
                      <div className="space-y-2">
                        <Label className="text-rose-900">البريد الإلكتروني</Label>
                        <Input
                          value={content.contact.email}
                          onChange={(e) => handleTextChange('contact', 'email', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-rose-900">رقم الهاتف</Label>
                        <Input
                          value={content.contact.phone}
                          onChange={(e) => handleTextChange('contact', 'phone', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-rose-900">العنوان (عربي)</Label>
                        <Input
                          value={content.contact.address_ar}
                          onChange={(e) => handleTextChange('contact', 'address_ar', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-rose-900">العنوان (إنجليزي)</Label>
                        <Input
                          value={content.contact.address_en}
                          onChange={(e) => handleTextChange('contact', 'address_en', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2 text-rose-900">
                        <Users className="h-5 w-5 text-rose-600" />
                        روابط التواصل الاجتماعي
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      {content.socials.map((social, index) => (
                        <SocialEditor
                          key={social.id}
                          item={social}
                          onChange={(field, value) =>
                            handleArrayChange('socials', index, field, value)
                          }
                          onDelete={() => removeArrayItem('socials', social.id)}
                        />
                      ))}
                      <Button
                        variant="outline"
                        className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-12"
                        onClick={() => addArrayItem('socials')}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> إضافة رابط اجتماعي
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* تبويب الشركة والقانونية */}
                <TabsContent value="company" className="space-y-6 pt-4">
                  <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2 text-rose-900">
                        <Users className="h-5 w-5 text-rose-600" />
                        عن الشركة
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 p-6">
                      <div className="space-y-2">
                        <Label className="text-rose-900">الوصف (عربي)</Label>
                        <Textarea
                          value={content.company.desc_ar}
                          onChange={(e) => handleTextChange('company', 'desc_ar', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl min-h-24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-rose-900">الوصف (إنجليزي)</Label>
                        <Textarea
                          value={content.company.desc_en}
                          onChange={(e) => handleTextChange('company', 'desc_en', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl min-h-24"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-rose-200 bg-white/60 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-lg">
                      <CardTitle className="text-lg flex items-center gap-2 text-rose-900">
                        <Copyright className="h-5 w-5 text-rose-600" />
                        المعلومات القانونية
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4 p-6">
                      <div className="space-y-2">
                        <Label className="text-rose-900">نص الحقوق (عربي)</Label>
                        <Input
                          value={content.legal.copyright_ar}
                          onChange={(e) => handleTextChange('legal', 'copyright_ar', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-rose-900">نص الحقوق (إنجليزي)</Label>
                        <Input
                          value={content.legal.copyright_en}
                          onChange={(e) => handleTextChange('legal', 'copyright_en', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-rose-900">رابط سياسة الخصوصية</Label>
                        <Input
                          value={content.legal.privacyHref}
                          onChange={(e) => handleTextChange('legal', 'privacyHref', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-rose-900">رابط الشروط والأحكام</Label>
                        <Input
                          value={content.legal.termsHref}
                          onChange={(e) => handleTextChange('legal', 'termsHref', e.target.value)}
                          className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end p-4 sm:p-6 border-t border-rose-100">
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg rounded-2xl h-12 px-8 font-bold"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  حفظ التغييرات
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// --- 9. مكونات فرعية لتحرير العناصر ---

// محرر المزايا
function FeatureEditor({
  item,
  onChange,
  onDelete,
}: {
  item: FeatureItem;
  onChange: (field: string, value: string) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 rounded-2xl">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <div className="space-y-2">
              <Label className="text-rose-900 text-sm">اسم الأيقونة</Label>
              <Input
                value={item.icon}
                onChange={(e) => onChange('icon', e.target.value)}
                className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
                placeholder="مثال: Heart"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-rose-900 text-sm">كلاس اللون</Label>
              <Input
                value={item.color}
                onChange={(e) => onChange('color', e.target.value)}
                className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
                placeholder="مثال: bg-pink-400"
              />
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete} 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 self-end sm:self-center h-9 w-9 p-0 rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">العنوان (عربي)</Label>
            <Input
              value={item.title_ar}
              onChange={(e) => onChange('title_ar', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">العنوان (إنجليزي)</Label>
            <Input
              value={item.title_en}
              onChange={(e) => onChange('title_en', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-rose-900 text-sm">الوصف (عربي)</Label>
            <Textarea
              value={item.desc_ar}
              onChange={(e) => onChange('desc_ar', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl min-h-16 text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-rose-900 text-sm">الوصف (إنجليزي)</Label>
            <Textarea
              value={item.desc_en}
              onChange={(e) => onChange('desc_en', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl min-h-16 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// محرر الروابط
function LinkEditor({
  item,
  onChange,
  onDelete,
}: {
  item: LinkItem;
  onChange: (field: string, value: string) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 rounded-2xl">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">النص (عربي)</Label>
            <Input
              value={item.label_ar}
              onChange={(e) => onChange('label_ar', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">النص (إنجليزي)</Label>
            <Input
              value={item.label_en}
              onChange={(e) => onChange('label_en', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">الرابط</Label>
            <Input
              value={item.href}
              onChange={(e) => onChange('href', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
            />
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete} 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 self-end sm:self-center h-9 w-9 p-0 rounded-xl mt-2 sm:mt-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// محرر روابط التواصل الاجتماعي
function SocialEditor({
  item,
  onChange,
  onDelete,
}: {
  item: SocialLink;
  onChange: (field: string, value: string) => void;
  onDelete: () => void;
}) {
  return (
    <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 rounded-2xl">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 w-full">
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">الاسم</Label>
            <Input
              value={item.name}
              onChange={(e) => onChange('name', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
              placeholder="مثال: Instagram"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">الأيقونة</Label>
            <Input
              value={item.icon}
              onChange={(e) => onChange('icon', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
              placeholder="مثال: Instagram"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">الرابط</Label>
            <Input
              value={item.href}
              onChange={(e) => onChange('href', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-rose-900 text-sm">كلاس اللون</Label>
            <Input
              value={item.color}
              onChange={(e) => onChange('color', e.target.value)}
              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-xl h-9 text-sm"
              placeholder="مثال: bg-pink-400"
            />
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onDelete} 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 self-end sm:self-center h-9 w-9 p-0 rounded-xl mt-2 sm:mt-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// --- 10. مكون واجهة التحميل ---
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 rounded-3xl">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 p-4 sm:p-6">
            <div className="space-y-2">
              <Skeleton className="h-7 w-64 bg-rose-100" />
              <Skeleton className="h-4 w-96 bg-rose-100" />
            </div>
            <Skeleton className="h-10 w-32 bg-rose-100" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-10 w-full bg-rose-100 mb-4" />
            <div className="space-y-4 pt-4">
              <Skeleton className="h-24 w-full bg-rose-100" />
              <Skeleton className="h-24 w-full bg-rose-100" />
              <Skeleton className="h-10 w-full bg-rose-100" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}