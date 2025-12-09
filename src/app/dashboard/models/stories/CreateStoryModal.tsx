'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ImagePlus,
  Type,
  Video,
  Loader2,
  Sparkles,
  Target,
  PlusCircle,
  Palette,
  ShoppingBag,
  Lock,
  Tag,
} from 'lucide-react';
import { createStory } from '@/lib/api/stories';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';

const storySchema = z.object({
  type: z.enum(['image', 'video', 'text', 'product']),
  text_content: z.string().optional(),
  background_color: z.string().default('#000000'),
  product_id: z.string().optional(),
  section_id: z.string().optional(),
});

interface Section {
  id: number;
  title: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image_url?: string;
  merchant_name?: string;
}

export default function CreateStoryModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('image');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [canPromote, setCanPromote] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(storySchema),
    defaultValues: {
      type: 'image',
      background_color: '#000000',
      text_content: '',
      product_id: '',
      section_id: '',
    },
  });

  const currentBgColor = watch('background_color');

  const checkPromotionEligibility = async () => {
    try {
      setLoadingProducts(true);
      const { data: subscription } = await axios.get('/subscriptions/my-current');
      if (subscription?.plan?.allows_promotion_in_stories) {
        setCanPromote(true);
        const { data: myProducts } = await axios.get('/products/model-promotable');
        setProducts(myProducts);
      } else {
        setCanPromote(false);
      }
    } catch (error) {
      console.error('Failed to check promotion eligibility', error);
      setCanPromote(false);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (user?.role_id === 1) {
        const fetchSections = async () => {
          setLoadingSections(true);
          try {
            const { data } = await axios.get('/stories/sections');
            setSections(data);
          } catch (error) {
            console.error('Failed to fetch sections', error);
          } finally {
            setLoadingSections(false);
          }
        };
        fetchSections();
      }
      if (user?.role_id === 2 || user?.role_id === 3) {
        checkPromotionEligibility();
      }
    } else {
      reset();
      setFile(null);
      setFilePreview(null);
      setSelectedProduct(null);
      setActiveTab('image');
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleProductSelect = (val: string) => {
    setValue('product_id', val);
    const product = products.find((p) => String(p.id) === val);
    setSelectedProduct(product || null);
  };

  const onSubmit = async (data: any) => {
    if ((data.type === 'image' || data.type === 'video') && !file) {
      toast.error(t('CreateStoryModal.validation.fileRequired'));
      return;
    }
    if (data.type === 'text' && !data.text_content?.trim()) {
      toast.error(t('CreateStoryModal.validation.textContentRequired'));
      return;
    }
    if (data.type === 'product' && (!data.product_id || data.product_id === 'none')) {
      toast.error(t('CreateStoryModal.validation.productRequired', { defaultValue: 'الرجاء اختيار منتج' }));
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('type', data.type);
    if (file) formData.append('media', file);
    if (data.text_content?.trim()) formData.append('text_content', data.text_content.trim());
    formData.append('background_color', data.background_color);
    if (data.product_id && data.product_id !== 'none') {
      formData.append('product_id', data.product_id);
    }
    if (data.section_id && data.section_id !== 'personal') {
      formData.append('section_id', data.section_id);
    }

    try {
      await createStory(formData);
      toast.success(t('CreateStoryModal.toast.createSuccess'));
      setIsOpen(false);
    } catch (error) {
      toast.error(t('CreateStoryModal.toast.createError'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    { value: '#000000', label: t('CreateStoryModal.colors.black') },
    { value: '#1F2937', label: 'Dark Gray' },
    { value: '#991B1B', label: 'Deep Red' },
    { value: '#064E3B', label: 'Deep Green' },
    { value: '#1E3A8A', label: 'Deep Blue' },
    { value: '#4C1D95', label: 'Deep Purple' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 sm:gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-bold text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-200 shadow-md sm:shadow-lg">
          <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />{' '}
          <span className="hidden sm:inline">{t('CreateStoryModal.actions.addStory')}</span>
          <span className="sm:hidden">{t('CreateStoryModal.actions.story')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px] bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden p-0">
        <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-4 sm:p-6">
          <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            {t('CreateStoryModal.title')}
          </DialogTitle>
          <DialogDescription className="text-rose-100 text-xs sm:text-sm">
            {t('CreateStoryModal.subtitle')}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="overflow-y-auto max-h-[70vh] p-4 sm:p-6">
          <Tabs
            value={activeTab}
            onValueChange={(val) => {
              setActiveTab(val);
              setValue('type', val as any);
              setFile(null);
              setFilePreview(null);
              if (val !== 'product') setSelectedProduct(null);
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-rose-50 to-pink-50 p-1 rounded-xl mb-4">
              <TabsTrigger
                value="image"
                className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm py-1.5"
              >
                <ImagePlus className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />{' '}
                <span className="hidden xs:inline">{t('CreateStoryModal.type.image')}</span>
                <span className="xs:hidden">{t('CreateStoryModal.type.imageShort')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="video"
                className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm py-1.5"
              >
                <Video className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />{' '}
                <span className="hidden xs:inline">{t('CreateStoryModal.type.video')}</span>
                <span className="xs:hidden">{t('CreateStoryModal.type.videoShort')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="text"
                className="data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm py-1.5"
              >
                <Type className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />{' '}
                <span className="hidden xs:inline">{t('CreateStoryModal.type.text')}</span>
                <span className="xs:hidden">{t('CreateStoryModal.type.textShort')}</span>
              </TabsTrigger>
              <TabsTrigger
                value="product"
                className="data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm py-1.5"
              >
                <ShoppingBag className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />{' '}
                <span className="hidden xs:inline">{t('CreateStoryModal.type.product')}</span>
                <span className="xs:hidden">{t('CreateStoryModal.type.productShort')}</span>
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 rounded-xl overflow-hidden">
                <CardContent className="p-3 sm:p-6 space-y-4">
                  {/* Image / Video Upload */}
                  {(activeTab === 'image' || activeTab === 'video') && (
                    <div
                      className="border-2 border-dashed border-rose-300 rounded-xl p-4 text-center cursor-pointer hover:bg-rose-50/50 transition-colors bg-white/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      {filePreview ? (
                        <div className="space-y-3">
                          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-xl overflow-hidden border-2 border-white shadow">
                            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 py-1 px-2 rounded-lg">
                            ✓ {t('CreateStoryModal.file.selected', { filename: file?.name })}
                          </p>
                        </div>
                      ) : file ? (
                        <p className="text-xs sm:text-sm font-medium text-rose-600 bg-rose-50 py-1 px-2 rounded-lg">
                          {t('CreateStoryModal.file.selectedShort', { filename: file.name })}
                        </p>
                      ) : (
                        <div className="flex flex-col items-center text-rose-500">
                          <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl mb-2">
                            {activeTab === 'image' ? <ImagePlus size={32} /> : <Video size={32} />}
                          </div>
                          <p className="font-semibold text-rose-700 text-xs sm:text-sm">
                            {t('CreateStoryModal.file.clickToUpload', {
                              type: activeTab === 'image'
                                ? t('CreateStoryModal.type.image')
                                : t('CreateStoryModal.type.video'),
                            })}
                          </p>
                          <p className="text-[10px] sm:text-xs text-rose-400 mt-1">{t('CreateStoryModal.file.formats')}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* === وصف القصة: يظهر في جميع التبويبات ما عدا "المنتج" === */}
                  {activeTab !== 'product' && (
                    <div className="space-y-2">
                      <label className="text-xs sm:text-sm font-medium text-rose-800 flex items-center gap-1.5">
                        <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('CreateStoryModal.labels.textContent')}
                      </label>
                      <Textarea
                        placeholder={t('CreateStoryModal.placeholders.textContent')}
                        {...register('text_content')}
                        className="border-rose-200 focus:border-rose-400 rounded-lg sm:rounded-xl min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm bg-white/50"
                      />
                    </div>
                  )}

                  {/* Text Content Preview & Background Color */}
                  {activeTab === 'text' && (
                    <div className="space-y-3 pt-2">
                      <div
                        className="min-h-[80px] sm:min-h-[100px] px-4 py-3 rounded-lg border border-rose-200 bg-white/50"
                        style={{ backgroundColor: currentBgColor, color: '#fff' }}
                      >
                        {watch('text_content')?.trim() || t('CreateStoryModal.preview.emptyText')}
                      </div>
                    </div>
                  )}

                  {/* Product Promotion */}
                  {activeTab === 'product' && (
                    <div className="space-y-6 pt-2">
                      {!canPromote && !loadingProducts ? (
                        <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 border border-gray-200 rounded-xl">
                          <Lock className="w-8 h-8 text-gray-400 mb-3" />
                          <h3 className="font-bold text-gray-900 text-sm mb-1">
                            {t('CreateStoryModal.product.upgradeRequired')}
                          </h3>
                          <p className="text-xs text-gray-500 mb-3">
                            {t('CreateStoryModal.product.upgradePrompt')}
                          </p>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => (window.location.href = '/dashboard/subscribe')}
                          >
                            {t('CreateStoryModal.product.upgradeNow')}
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-medium text-indigo-800 flex items-center gap-1.5">
                              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
                              {t('CreateStoryModal.product.selectProduct')}
                            </label>
                            <Select onValueChange={handleProductSelect}>
                              <SelectTrigger className="bg-white border-rose-200 focus:border-indigo-400 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                                <SelectValue placeholder={t('CreateStoryModal.product.placeholder')} />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-rose-200 rounded-lg max-h-48">
                                {loadingProducts ? (
                                  <div className="flex items-center justify-center p-2">
                                    <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                    {t('common.loading')}
                                  </div>
                                ) : products.length > 0 ? (
                                  products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={String(product.id)}
                                      className="text-indigo-800 hover:bg-indigo-50 text-xs sm:text-sm"
                                    >
                                      <div className="flex justify-between w-full">
                                        <span>{product.name}</span>
                                        <Badge variant="secondary" className="text-xs">
                                          {product.price} ر.س
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-center text-xs text-rose-400">
                                    {t('CreateStoryModal.product.noProducts')}
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Live Preview */}
                          <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-rose-200">
                            <div
                              className="absolute inset-0 transition-colors duration-500"
                              style={{ backgroundColor: currentBgColor }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                              {selectedProduct ? (
                                <div className="bg-white p-3 rounded-xl shadow-lg w-full max-w-[200px]">
                                  <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-gray-100">
                                    <img
                                      src={selectedProduct.image_url || '/placeholder.png'}
                                      alt={selectedProduct.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="text-center">
                                    <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{selectedProduct.name}</h4>
                                    <p className="text-indigo-600 font-bold text-sm">
                                      {selectedProduct.price} <span className="text-[8px] font-normal text-gray-500">ر.س</span>
                                    </p>
                                    <div className="w-full bg-black text-white text-[10px] py-1 rounded mt-1 font-medium">
                                      {t('CreateStoryModal.product.buyNow')}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-white/50 text-center">
                                  <ShoppingBag className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                  <p className="text-xs">{t('CreateStoryModal.product.previewPlaceholder')}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Background Color Picker (for text & product) */}
                  {(activeTab === 'text' || activeTab === 'product') && (
                    <div className="space-y-3 pt-4 border-t border-rose-200">
                      <label className="text-xs sm:text-sm font-medium text-rose-800 flex items-center gap-1.5">
                        <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('CreateStoryModal.labels.backgroundColor')}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map((color) => (
                          <button
                            type="button"
                            key={color.value}
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 transition-transform duration-200 hover:scale-110 ${
                              currentBgColor === color.value
                                ? 'border-white ring-2 ring-rose-300 shadow'
                                : 'border-rose-200'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setValue('background_color', color.value)}
                            title={color.label}
                          >
                            {currentBgColor === color.value && (
                              <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white m-auto" />
                            )}
                          </button>
                        ))}
                        <div className="relative w-6 h-6 sm:w-8 sm:h-8">
                          <input
                            type="color"
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            onChange={(e) => setValue('background_color', e.target.value)}
                          />
                          <div className="w-full h-full rounded-full border-2 border-rose-200 flex items-center justify-center bg-gradient-conic from-red-500 via-yellow-500 to-blue-500" />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-3 h-3 rounded-sm border border-rose-200" style={{ backgroundColor: currentBgColor }} />
                        <span className="text-[10px] sm:text-xs text-rose-600">
                          {colorOptions.find((c) => c.value === currentBgColor)?.label ||
                            t('CreateStoryModal.colors.custom')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Admin Section Selector */}
                  {user?.role_id === 1 && (
                    <div className="space-y-3 pt-4 border-t border-rose-200">
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" />
                        <label className="text-xs sm:text-sm font-semibold text-rose-800 uppercase tracking-wide">
                          {t('CreateStoryModal.admin.title')}
                        </label>
                      </div>
                      <Select onValueChange={(val) => setValue('section_id', val)}>
                        <SelectTrigger className="bg-white border-rose-200 focus:border-rose-400 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                          <SelectValue placeholder={t('CreateStoryModal.admin.sectionPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-rose-200 rounded-lg max-h-48">
                          <SelectItem value="personal" className="text-rose-800 hover:bg-blue-50 text-xs sm:text-sm">
                            {t('CreateStoryModal.admin.personalStory')}
                          </SelectItem>
                          {loadingSections ? (
                            <div className="flex items-center justify-center p-2">
                              <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                              {t('common.loading')}
                            </div>
                          ) : sections.length > 0 ? (
                            sections.map((sec) => (
                              <SelectItem
                                key={sec.id}
                                value={String(sec.id)}
                                className="text-rose-800 hover:bg-blue-50 text-xs sm:text-sm"
                              >
                                {sec.title}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-center text-[10px] text-rose-400">
                              {t('CreateStoryModal.admin.noSections')}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] sm:text-xs text-rose-500 bg-rose-50 p-1.5 rounded-lg">
                        {t('CreateStoryModal.admin.helpText')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Button
                type="submit"
                className={`w-full rounded-xl text-sm sm:text-base py-2.5 sm:py-3 font-bold shadow-md transition-all duration-200 ${
                  activeTab === 'product'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white'
                    : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white'
                }`}
                disabled={isSubmitting || (activeTab === 'product' && !canPromote)}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{' '}
                    {t('CreateStoryModal.actions.publishing')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-4 w-4" />{' '}
                    {t('CreateStoryModal.actions.publishNow')}
                  </>
                )}
              </Button>
            </form>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}