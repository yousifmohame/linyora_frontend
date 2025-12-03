'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import api from '../../../../lib/axios'; 
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Video, 
  Palette,
  Upload,
  Globe,
  Type,
  Layers,
  Sliders,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Section } from '@/types/section';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';

type FormValues = {
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  icon: string;
  theme_color: string;
  featured_product_id: string; 
  is_active: boolean;
  category_ids: number[];
  slides: {
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    image_url: string;
    media_type: 'image' | 'video';
    button_text_en: string;
    button_text_ar: string;
    button_link: string;
  }[];
};

interface SectionFormProps {
  initialData?: Section | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProductOption {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  brand: string;
}

export default function SectionForm({ initialData, onSuccess, onCancel }: SectionFormProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [submitting, setSubmitting] = useState(false);
  const [isDataReady, setIsDataReady] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState<number | null>(null);

  const form = useForm<FormValues>({
    defaultValues: {
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      icon: '',
      theme_color: '#3b82f6',
      featured_product_id: 'no_product',
      is_active: true,
      category_ids: [],
      slides: [{ 
        title_en: '', 
        title_ar: '', 
        description_en: '', 
        description_ar: '', 
        image_url: '', 
        media_type: 'image', 
        button_text_en: t('common.shopNow.en'), 
        button_text_ar: t('common.shopNow.ar'), 
        button_link: '' 
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "slides",
  });

  const watchedColor = form.watch('theme_color');
  const watchedProductId = form.watch('featured_product_id');
  const watchedSlides = form.watch('slides');

  useEffect(() => {
    const initForm = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        const fetchedCats = catRes.data;
        let fetchedProds: ProductOption[] = Array.isArray(prodRes.data) ? prodRes.data : prodRes.data.products || [];

        if (initialData) {
          if (initialData.featured_product_id) {
            const currentId = Number(initialData.featured_product_id);
            const exists = fetchedProds.find(p => p.id === currentId);
            if (!exists) {
              fetchedProds = [{
                id: currentId,
                name: initialData.product_name_en || initialData.product_name_ar || `Selected Product (#${currentId})`,
                price: initialData.product_price || 0,
                brand: 'Selected',
                image_url: initialData.product_image
              }, ...fetchedProds];
            }
          }
          form.reset({
            title_en: initialData.title_en || '',
            title_ar: initialData.title_ar || '',
            description_en: initialData.description_en || '',
            description_ar: initialData.description_ar || '',
            icon: initialData.icon || '',
            theme_color: initialData.theme_color || '#3b82f6',
            featured_product_id: initialData.featured_product_id ? String(initialData.featured_product_id) : 'no_product',
            is_active: initialData.is_active ?? true,
            category_ids: initialData.category_ids || [],
            slides: initialData.slides && initialData.slides.length > 0 ? initialData.slides.map(s => ({
              title_en: s.title_en || '',
              title_ar: s.title_ar || '',
              description_en: s.description_en || '',
              description_ar: s.description_ar || '',
              image_url: s.image_url || '',
              media_type: s.media_type || 'image',
              button_text_en: s.button_text_en || t('common.shopNow.en'),
              button_text_ar: s.button_text_ar || t('common.shopNow.ar'),
              button_link: s.button_link || '',
            })) : [{ 
              title_en: '', 
              title_ar: '', 
              description_en: '', 
              description_ar: '', 
              image_url: '', 
              media_type: 'image', 
              button_text_en: t('common.shopNow.en'), 
              button_text_ar: t('common.shopNow.ar'), 
              button_link: '' 
            }]
          });
        }
        setCategories(fetchedCats);
        setProducts(fetchedProds);
        setIsDataReady(true);
      } catch (error) {
        console.error('Error initializing form:', error);
        toast.error(t('SectionForm.toast.initError'));
      }
    };
    initForm();
  }, [initialData, form, t]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const currentMediaType = index >= 0 ? form.getValues(`slides.${index}.media_type`) : 'image';

    if (index >= 0 && currentMediaType === 'image' && isVideo && !file.type.includes('gif')) {
       toast.warning(t('SectionForm.media.videoTypeWarning'));
       return;
    }

    setUploadingMedia(index);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const mediaUrl = res.data.imageUrl || res.data.url;
      if (index === -1) {
        form.setValue('icon', mediaUrl);
      } else {
        form.setValue(`slides.${index}.image_url`, mediaUrl);
      }
      toast.success(t('SectionForm.toast.uploadSuccess'));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('SectionForm.toast.uploadError'));
    } finally {
      setUploadingMedia(null);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      const productId = data.featured_product_id === 'no_product' || !data.featured_product_id 
        ? null 
        : parseInt(data.featured_product_id);
      const payload = { ...data, featured_product_id: productId };

      if (initialData) {
        await api.put(`/sections/${initialData.id}`, payload);
        toast.success(t('SectionForm.toast.updateSuccess'));
      } else {
        await api.post('/sections', payload);
        toast.success(t('SectionForm.toast.createSuccess'));
      }
      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(t('SectionForm.toast.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isDataReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-full blur-xl"></div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-gray-700 font-medium">{t('SectionForm.loading.title')}</p>
          <p className="text-gray-500 text-sm">{t('SectionForm.loading.subtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto p-4 lg:p-6">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {initialData ? t('SectionForm.title.edit') : t('SectionForm.title.create')}
              </h1>
              <p className="text-gray-600 mt-1">
                {initialData ? t('SectionForm.subtitle.edit') : t('SectionForm.subtitle.create')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-300"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
          <Separator />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-3">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 lg:w-auto">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('SectionForm.tabs.basic')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('SectionForm.tabs.content')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('SectionForm.tabs.appearance')}</span>
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('SectionForm.tabs.advanced')}</span>
                  </TabsTrigger>
                </TabsList>

                <div className="overflow-y-auto max-h-[60vh] pb-28 pr-2 mt-4">
                  {/* Basic Tab */}
                  <TabsContent value="basic" className="space-y-6 animate-in fade-in">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Type className="w-5 h-5 text-primary" />
                          {t('SectionForm.basic.title')}
                        </CardTitle>
                        <CardDescription>{t('SectionForm.basic.description')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Icon */}
                        <div className="space-y-4">
                          <Label className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            {t('SectionForm.basic.icon')}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-3 h-3 text-gray-400" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('SectionForm.basic.iconTooltip')}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-xl bg-gradient-to-r from-gray-50/50 to-white">
                            <div className="relative w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden transition-all hover:border-primary group">
                              {form.watch('icon') ? (
                                <>
                                  <img src={form.watch('icon')} alt="Icon" className="w-20 h-20 object-contain p-2" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-white" />
                                  </div>
                                </>
                              ) : (
                                <div className="text-center">
                                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-xs text-gray-500">{t('SectionForm.basic.uploadIcon')}</p>
                                </div>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleMediaUpload(e, -1)}
                                disabled={uploadingMedia === -1}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              />
                            </div>
                            <div className="flex-1 space-y-2">
                              <p className="text-sm text-gray-600">
                                {t('SectionForm.basic.iconHelp')}
                              </p>
                              {uploadingMedia === -1 && (
                                <div className="flex items-center gap-2 text-primary">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-sm">{t('SectionForm.basic.uploading')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Titles */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              {t('SectionForm.basic.titleEn')}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              {...form.register('title_en', { required: t('SectionForm.validation.titleEnRequired') })}
                              placeholder={t('SectionForm.basic.titleEnPlaceholder')}
                              className="h-12"
                            />
                            {form.formState.errors.title_en && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                {form.formState.errors.title_en.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              {t('SectionForm.basic.titleAr')}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              {...form.register('title_ar', { required: t('SectionForm.validation.titleArRequired') })}
                              placeholder={t('SectionForm.basic.titleArPlaceholder')}
                              dir="rtl"
                              className="h-12"
                            />
                            {form.formState.errors.title_ar && (
                              <p className="text-red-500 text-sm flex items-center gap-1">
                                {form.formState.errors.title_ar.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Descriptions */}
                        <div className="space-y-4">
                          <Label>{t('SectionForm.basic.descriptions')}</Label>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Textarea
                                {...form.register('description_en')}
                                placeholder={t('SectionForm.basic.descEnPlaceholder')}
                                className="min-h-[100px]"
                              />
                            </div>
                            <div className="space-y-2">
                              <Textarea
                                {...form.register('description_ar')}
                                placeholder={t('SectionForm.basic.descArPlaceholder')}
                                dir="rtl"
                                className="min-h-[100px]"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Content Tab */}
                  <TabsContent value="content" className="space-y-6 animate-in fade-in">
                    <Card className="border shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="w-5 h-5 text-primary" />
                          {t('SectionForm.content.title')}
                        </CardTitle>
                        <CardDescription>{t('SectionForm.content.description')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <Alert>
                          <Info className="w-4 h-4" />
                          <AlertDescription>
                            {t('SectionForm.content.alert')}
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-6">
                          {fields.map((field, index) => (
                            <Card key={field.id} className="border overflow-hidden">
                              <CardHeader className="bg-gradient-to-r from-gray-50 to-white pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                                      {index + 1}
                                    </div>
                                    {t('SectionForm.content.slide')} {index + 1}
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    {index > 0 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => remove(index)}
                                      >
                                        <X className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">{t('common.remove')}</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-6">
                                <div className="space-y-6">
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <Label>{t('SectionForm.content.media')}</Label>
                                      <RadioGroup
                                        value={form.watch(`slides.${index}.media_type`)}
                                        onValueChange={(val) => form.setValue(`slides.${index}.media_type`, val as 'image' | 'video')}
                                        className="flex gap-4"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="image" id={`img-${index}`} />
                                          <Label htmlFor={`img-${index}`} className="flex items-center gap-2 cursor-pointer">
                                            <ImageIcon className="w-4 h-4" />
                                            <span>{t('SectionForm.content.imageGif')}</span>
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem value="video" id={`vid-${index}`} />
                                          <Label htmlFor={`vid-${index}`} className="flex items-center gap-2 cursor-pointer">
                                            <Video className="w-4 h-4" />
                                            <span>{t('SectionForm.content.video')}</span>
                                          </Label>
                                        </div>
                                      </RadioGroup>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                      <div className="space-y-3">
                                        <Label>{t('SectionForm.content.uploadMedia')}</Label>
                                        <div className="relative">
                                          <div className={`border-2 border-dashed rounded-xl p-4 transition-all ${form.watch(`slides.${index}.image_url`) ? 'border-green-200 bg-green-50/50' : 'border-gray-300 hover:border-primary'}`}>
                                            <div className="flex flex-col items-center justify-center text-center p-4">
                                              {form.watch(`slides.${index}.image_url`) ? (
                                                <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3">
                                                  {form.watch(`slides.${index}.media_type`) === 'video' ? (
                                                    <video
                                                      src={form.watch(`slides.${index}.image_url`)}
                                                      className="w-full h-full object-cover"
                                                      muted
                                                      playsInline
                                                    />
                                                  ) : (
                                                    <img
                                                      src={form.watch(`slides.${index}.image_url`)}
                                                      alt="Preview"
                                                      className="w-full h-full object-cover"
                                                    />
                                                  )}
                                                  <div className="absolute inset-0 bg-black/20"></div>
                                                  <Check className="absolute top-2 right-2 w-5 h-5 text-white bg-green-500 rounded-full p-1" />
                                                </div>
                                              ) : (
                                                <>
                                                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                                  <p className="text-sm text-gray-600 mb-1">
                                                    {form.watch(`slides.${index}.media_type`) === 'video' 
                                                      ? t('SectionForm.content.dropVideo') 
                                                      : t('SectionForm.content.dropImage')}
                                                  </p>
                                                  <p className="text-xs text-gray-500">
                                                    {form.watch(`slides.${index}.media_type`) === 'video' 
                                                      ? t('SectionForm.content.videoFormats') 
                                                      : t('SectionForm.content.imageFormats')}
                                                  </p>
                                                </>
                                              )}
                                            </div>
                                            <Input
                                              type="file"
                                              accept={form.watch(`slides.${index}.media_type`) === 'video' ? "video/mp4,video/webm" : "image/*"}
                                              onChange={(e) => handleMediaUpload(e, index)}
                                              disabled={uploadingMedia === index}
                                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                          </div>
                                          {uploadingMedia === index && (
                                            <div className="flex items-center gap-2 mt-2 text-primary">
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              <span className="text-sm">{t('SectionForm.basic.uploading')}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <Label>{t('SectionForm.content.titleEn')}</Label>
                                            <Input {...form.register(`slides.${index}.title_en`)} placeholder={t('SectionForm.content.titleEnPlaceholder')} />
                                          </div>
                                          <div className="space-y-2">
                                            <Label>{t('SectionForm.content.titleAr')}</Label>
                                            <Input {...form.register(`slides.${index}.title_ar`)} placeholder={t('SectionForm.content.titleArPlaceholder')} dir="rtl" />
                                          </div>
                                        </div>
                                        <div className="space-y-2">
                                          <Label>{t('SectionForm.content.buttonConfig')}</Label>
                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <Input {...form.register(`slides.${index}.button_text_en`)} placeholder={t('SectionForm.content.buttonEnPlaceholder')} />
                                            <Input {...form.register(`slides.${index}.button_text_ar`)} placeholder={t('SectionForm.content.buttonArPlaceholder')} dir="rtl" />
                                            <Input {...form.register(`slides.${index}.button_link`)} placeholder="https://example.com" />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <Button
                          type="button"
                          onClick={() => append({
                            title_en: '',
                            title_ar: '',
                            description_en: '',
                            description_ar: '',
                            image_url: '',
                            media_type: 'image',
                            button_text_en: t('common.shopNow.en'),
                            button_text_ar: t('common.shopNow.ar'),
                            button_link: ''
                          })}
                          variant="outline"
                          className="w-full border-dashed hover:border-primary"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('SectionForm.content.addSlide')}
                        </Button>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Appearance Tab */}
                  <TabsContent value="appearance" className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-primary" />
                            {t('SectionForm.appearance.theme')}
                          </CardTitle>
                          <CardDescription>{t('SectionForm.appearance.themeDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <Label className="flex items-center gap-2">
                              <Palette className="w-4 h-4" />
                              {t('SectionForm.appearance.color')}
                            </Label>
                            <div className="space-y-3">
                              <div className="flex items-center gap-4">
                                <div
                                  className="w-12 h-12 rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer"
                                  style={{ backgroundColor: watchedColor || '#3b82f6' }}
                                >
                                  <Input
                                    type="color"
                                    value={watchedColor || '#3b82f6'}
                                    onChange={(e) => form.setValue('theme_color', e.target.value)}
                                    className="w-full h-full opacity-0 cursor-pointer"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Input
                                    value={watchedColor || '#3b82f6'}
                                    onChange={(e) => form.setValue('theme_color', e.target.value)}
                                    className="font-mono text-sm"
                                    placeholder="#3b82f6"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-5 gap-2">
                                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map((color) => (
                                  <button
                                    key={color}
                                    type="button"
                                    className="w-8 h-8 rounded-full border-2 border-gray-200 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: color }}
                                    onClick={() => form.setValue('theme_color', color)}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2">
                            <Layers className="w-5 h-5 text-primary" />
                            {t('SectionForm.appearance.categories')}
                          </CardTitle>
                          <CardDescription>{t('SectionForm.appearance.categoriesDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {categories.map((cat) => (
                                <div
                                  key={cat.id}
                                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:border-primary ${form.watch('category_ids').includes(cat.id) ? 'border-primary bg-primary/5' : ''}`}
                                  onClick={() => {
                                    const current = form.getValues('category_ids');
                                    if (current.includes(cat.id)) {
                                      form.setValue('category_ids', current.filter(id => id !== cat.id));
                                    } else {
                                      form.setValue('category_ids', [...current, cat.id]);
                                    }
                                  }}
                                >
                                  <Label className="cursor-pointer flex-1">{cat.name}</Label>
                                  {form.watch('category_ids').includes(cat.id) && (
                                    <Check className="w-4 h-4 text-primary" />
                                  )}
                                </div>
                              ))}
                            </div>
                            {form.watch('category_ids').length > 0 && (
                              <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">{t('SectionForm.appearance.selectedCategories')}</p>
                                <div className="flex flex-wrap gap-2">
                                  {form.watch('category_ids').map(id => {
                                    const category = categories.find(c => c.id === id);
                                    return category ? (
                                      <Badge key={id} variant="secondary" className="px-3 py-1">
                                        {category.name}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Advanced Tab */}
                  <TabsContent value="advanced" className="space-y-6 animate-in fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2">
                            <Sliders className="w-5 h-5 text-primary" />
                            {t('SectionForm.advanced.title')}
                          </CardTitle>
                          <CardDescription>{t('SectionForm.advanced.description')}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-4">
                            <Label className="text-base">{t('SectionForm.advanced.featuredProduct')}</Label>
                            <div className="space-y-3">
                              <Select
                                value={watchedProductId}
                                onValueChange={(value) => form.setValue('featured_product_id', value)}
                              >
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder={t('SectionForm.advanced.productPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="no_product">{t('SectionForm.advanced.noProduct')}</SelectItem>
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      <div className="flex items-center gap-3">
                                        {product.image_url && (
                                          <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-8 h-8 rounded object-cover"
                                          />
                                        )}
                                        <div>
                                          <div className="font-medium">{product.name}</div>
                                          <div className="text-xs text-gray-500">
                                            {product.brand} • ${product.price}
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-gray-500">
                                {t('SectionForm.advanced.productHelp')}
                              </p>
                            </div>
                          </div>
                          <Separator />
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <Label className="text-base">{t('SectionForm.advanced.status')}</Label>
                                <p className="text-sm text-gray-500">
                                  {t('SectionForm.advanced.statusHelp')}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                {form.watch('is_active') ? (
                                  <Badge variant="default" className="px-3 py-1">
                                    {t('common.active')}
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="px-3 py-1">
                                    {t('common.inactive')}
                                  </Badge>
                                )}
                                <Switch
                                  checked={form.watch('is_active')}
                                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>

              <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t py-4 mt-8 -mx-4 px-4 lg:-mx-6 lg:px-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-500">
                    {initialData ? t('SectionForm.actions.updatePrompt') : t('SectionForm.actions.createPrompt')}
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      className="flex-1 sm:flex-none border-gray-300 hover:bg-gray-50"
                      disabled={submitting || uploadingMedia !== null}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 sm:flex-none"
                      disabled={submitting || uploadingMedia !== null}
                    >
                      {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {initialData ? t('SectionForm.actions.update') : t('SectionForm.actions.create')}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}