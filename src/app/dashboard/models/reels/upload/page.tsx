'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axios';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { UploadCloud, PlusCircle, Star, Video, Tag, Sparkles, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import ModelNav from '@/components/dashboards/ModelNav';

interface ActiveAgreement {
    agreement_id: number;
    agreement_status: string;
    product_id: number;
    product_name: string;
    product_image_url: string | null;
    merchant_id: number;
    merchant_store_name: string;
}

interface TaggedProductInfo {
    id: number;
    name: string;
    image_url: string | null;
}

const reelFormSchema = (t: (key: string) => string) => z.object({
  video: z.any().refine((files) => files?.length === 1, t('UploadReelPage.validation.videoRequired')),
  caption: z.string().max(1000, t('UploadReelPage.validation.maxCaption')).optional(),
});

export default function UploadReelPage() {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeAgreements, setActiveAgreements] = useState<ActiveAgreement[]>([]);
  const [taggedProducts, setTaggedProducts] = useState<TaggedProductInfo[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const form = useForm<z.infer<ReturnType<typeof reelFormSchema>>>({
    resolver: zodResolver(reelFormSchema(t)),
    defaultValues: {
        caption: "",
        video: undefined,
    }
  });

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    return files;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, agreementsResponse] = await Promise.all([
          api.get('/browse/all-products'),
          api.get('/agreements/active-for-user')
        ]);
        
        setAllProducts(productsResponse.data || []);
        setActiveAgreements(agreementsResponse.data || []);

      } catch (error) {
        console.error('Failed to fetch initial data for upload page:', error);
        toast.error(t('UploadReelPage.toast.fetchError'));
      }
    };
    fetchData();
  }, [t]);

  const handleTagProduct = (
    product: Product | ActiveAgreement, 
    checked: boolean
  ) => {
    let productInfo: TaggedProductInfo;
    let isAgreementProduct = 'agreement_id' in product;

    if (isAgreementProduct) {
      const agreement = product as ActiveAgreement;
      productInfo = {
        id: agreement.product_id,
        name: agreement.product_name,
        image_url: agreement.product_image_url,
      };
    } else {
      const standardProduct = product as Product;
      productInfo = {
        id: standardProduct.id,
        name: standardProduct.name,
        image_url: standardProduct.variants?.[0]?.images?.[0] || null,
      };
    }

    setTaggedProducts((prev) =>
      checked
        ? [...prev, productInfo]
        : prev.filter((p) => p.id !== productInfo.id)
    );

    if (isAgreementProduct) {
      const agreement = product as ActiveAgreement;
      if (checked) {
        setSelectedAgreementId(agreement.agreement_id);
        setTaggedProducts([productInfo]);
      } else {
        if (selectedAgreementId === agreement.agreement_id) {
          setSelectedAgreementId(null);
        }
      }
    }
  };

  const onSubmit = async (values: z.infer<ReturnType<typeof reelFormSchema>>) => {
    setIsUploading(true);
    const formData = new FormData();

    formData.append('video', values.video[0]);
    formData.append('caption', values.caption || '');

    const productIds = taggedProducts.map(p => p.id);
    formData.append('tagged_products', JSON.stringify(productIds));

    if (selectedAgreementId) {
        formData.append('agreement_id', selectedAgreementId.toString());
    }

    try {
      await api.post('/reels', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(t('UploadReelPage.toast.uploadSuccess'));
      form.reset();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTaggedProducts([]);
      setSelectedAgreementId(null);
      setPreviewUrl(null);
      setIsModalOpen(false);
      
      setTimeout(() => {
        router.push('/dashboard/models/reels');
      }, 1500);

    } catch (error: any) {
      console.error("Upload failed:", error);
      const errorMessage = error.response?.data?.message || 'فشل الرفع. حاول مجدداً.';
    
    // إذا كان الخطأ بسبب الحجم (من Multer أو Express)
      if (error.response?.status === 413) {
        toast.error('فشل الرفع: الفيديو كبير جداً!');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const agreementProductIds = new Set(activeAgreements.map(a => a.product_id));
  const otherProducts = allProducts.filter(p => !agreementProductIds.has(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <ModelNav />

      {/* Header Section */}
      <header className="mb-8 text-center relative">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('UploadReelPage.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('UploadReelPage.subtitle')}
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
            <div className="flex items-center gap-3">
              <Video className="h-6 w-6 text-pink-200" />
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold">{t('UploadReelPage.form.title')}</CardTitle>
                <CardDescription className="text-pink-100 mt-1">
                  {t('UploadReelPage.form.subtitle')}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {t('UploadReelPage.taggedProducts.count', { count: taggedProducts.length })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Video Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Upload Area */}
                  <FormField
                    control={form.control}
                    name="video"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-rose-900 font-semibold flex items-center gap-2">
                          <UploadCloud className="h-4 w-4 text-rose-600" />
                          {t('UploadReelPage.video.label')}
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input
                              type="file"
                              accept="video/mp4,video/quicktime,video/x-matroska,video/avi"
                              onChange={(e) => {
                                const files = handleFileChange(e.target.files);
                                field.onChange(files);
                              }}
                              ref={fileInputRef}
                              className="border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-2xl"
                            />
                            {!previewUrl && (
                              <div className="border-2 border-dashed border-rose-200 rounded-2xl p-8 text-center bg-rose-50/50">
                                <Video className="h-12 w-12 text-rose-300 mx-auto mb-3" />
                                <p className="text-rose-700 font-medium">{t('UploadReelPage.video.selectPrompt')}</p>
                                <p className="text-rose-600 text-sm mt-1">{t('UploadReelPage.video.supportedFormats')}</p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Preview Area */}
                  <div>
                    <FormLabel className="text-rose-900 font-semibold flex items-center gap-2 mb-4">
                      <Sparkles className="h-4 w-4 text-rose-600" />
                      {t('UploadReelPage.preview.title')}
                    </FormLabel>
                    {previewUrl ? (
                    <div className="border-2 border-rose-200 rounded-2xl overflow-hidden bg-black aspect-[9/16]">
                        <video 
                        src={previewUrl} 
                        controls 
                        className="w-full h-full object-cover"
                        />
                    </div>
                    ) : (
                    <div className="border-2 border-dashed border-rose-200 rounded-2xl p-8 text-center bg-rose-50/50 aspect-[9/16] flex flex-col items-center justify-center">
                        <div className="text-rose-400">
                        <Video className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-rose-600 text-sm">{t('UploadReelPage.preview.placeholder')}</p>
                        </div>
                    </div>
                    )}
                  </div>
                </div>

                {/* Caption Section */}
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-900 font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-rose-600" />
                        {t('UploadReelPage.caption.label')}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('UploadReelPage.caption.placeholder')} 
                          {...field} 
                          className="min-h-[100px] resize-none border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-2xl"
                        />
                      </FormControl>
                      <FormDescription className="text-rose-600">
                        {t('UploadReelPage.caption.chars', { current: field.value?.length || 0, max: 1000 })}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tagged Products Section */}
                <div>
                  <FormLabel className="text-rose-900 font-semibold flex items-center gap-2 mb-4">
                    <Tag className="h-4 w-4 text-rose-600" />
                    {t('UploadReelPage.taggedProducts.title')}
                    <Badge variant="secondary" className="bg-rose-100 text-rose-700 ml-2">
                      {t('UploadReelPage.taggedProducts.count', { count: taggedProducts.length })}
                    </Badge>
                  </FormLabel>
                  
                  {taggedProducts.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {taggedProducts.map(p => (
                          <Badge 
                            key={p.id} 
                            variant="secondary" 
                            className="bg-gradient-to-r from-rose-500 to-pink-500 text-white border-0 pl-2 pr-1 py-1 rounded-full flex items-center gap-1"
                          >
                            <span className="max-w-[120px] truncate text-xs">{p.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const originalItem = activeAgreements.find(a => a.product_id === p.id) || allProducts.find(prod => prod.id === p.id);
                                if (originalItem) handleTagProduct(originalItem, false);
                              }}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <span className="text-xs">×</span>
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-12"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {taggedProducts.length === 0 
                          ? t('UploadReelPage.taggedProducts.tagProducts') 
                          : t('UploadReelPage.taggedProducts.manageProducts')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-lg max-w-md max-h-[80vh] flex flex-col">
                      <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-6 shrink-0">
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          {t('UploadReelPage.taggedProducts.tagProducts')}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <ScrollArea className="flex-1 px-6">
                        <div className="space-y-4 py-4">
                          {activeAgreements.length > 0 && (
                            <div className="mb-6 pb-4 border-b border-rose-100">
                              <h3 className="text-sm font-semibold mb-3 text-rose-800 flex items-center gap-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 
                                {t('UploadReelPage.taggedProducts.activeAgreements')}
                              </h3>
                              <div className="space-y-2">
                                {activeAgreements.map(agreement => {
                                  const isChecked = taggedProducts.some(p => p.id === agreement.product_id);
                                  const isDisabled = selectedAgreementId !== null && selectedAgreementId !== agreement.agreement_id;
                                  return (
                                    <div 
                                      key={agreement.agreement_id} 
                                      className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                                        isDisabled 
                                          ? 'bg-rose-50 border-rose-100 opacity-60' 
                                          : 'bg-white border-rose-100 hover:border-rose-200 hover:shadow-sm'
                                      }`}
                                    >
                                      <Checkbox
                                        id={`agreement-${agreement.agreement_id}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => handleTagProduct(agreement, !!checked)}
                                        disabled={isDisabled}
                                        className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 mt-0.5"
                                      />
                                      <label 
                                        htmlFor={`agreement-${agreement.agreement_id}`} 
                                        className={`flex-1 text-sm leading-tight ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                      >
                                        <div className="font-medium text-rose-900">{agreement.product_name}</div>
                                        <div className="text-xs text-rose-600 mt-1">
                                          {t('UploadReelPage.taggedProducts.fromMerchant', { store: agreement.merchant_store_name })}
                                        </div>
                                      </label>
                                      {agreement.product_image_url && (
                                        <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border border-rose-200">
                                          <Image 
                                            src={agreement.product_image_url} 
                                            alt={agreement.product_name} 
                                            fill 
                                            sizes="48px" 
                                            className="object-cover"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          
                        </div>
                      </ScrollArea>

                      <div className="p-6 border-t border-rose-100 shrink-0">
                        <Button 
                          type="button" 
                          onClick={() => setIsModalOpen(false)}
                          className="w-full bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 rounded-2xl"
                        >
                          {t('common.done')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {selectedAgreementId && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Star className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{t('UploadReelPage.agreement.linked')}</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      {t('UploadReelPage.agreement.id', { id: selectedAgreementId })}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isUploading} 
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg rounded-2xl h-12 font-bold text-base"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('UploadReelPage.actions.uploading')}
                    </>
                  ) : (
                    t('UploadReelPage.actions.uploadReel')
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}