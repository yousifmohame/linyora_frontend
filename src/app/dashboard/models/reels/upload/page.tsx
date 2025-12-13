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
        console.error('Failed to fetch data:', error);
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
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('UploadReelPage.toast.uploadSuccess'));
      form.reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTaggedProducts([]);
      setSelectedAgreementId(null);
      setPreviewUrl(null);
      setIsModalOpen(false);
      setTimeout(() => router.push('/dashboard/models/reels'), 1500);
    } catch (error: any) {
      console.error("Upload failed:", error);
      if (error.response?.status === 413) {
        toast.error('فشل الرفع: الفيديو كبير جداً!');
      } else {
        toast.error(error.response?.data?.message || 'فشل الرفع. حاول مجدداً.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const agreementProductIds = new Set(activeAgreements.map(a => a.product_id));
  const otherProducts = allProducts.filter(p => !agreementProductIds.has(p.id));

  return (
    // ✅ Unified gradient + overflow-hidden
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      {/* ✅ Smaller, safe blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <ModelNav />

      <header className="mb-6 text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {t('UploadReelPage.title')}
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {t('UploadReelPage.subtitle')}
        </p>
      </header>

      <div className="max-w-4xl mx-auto">
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4">
            <div className="flex items-center gap-2.5">
              <Video className="h-4 w-4 text-pink-200" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold truncate">{t('UploadReelPage.form.title')}</CardTitle>
                <CardDescription className="text-purple-100 text-xs mt-0.5">
                  {t('UploadReelPage.form.subtitle')}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-2 py-0.5">
                {t('UploadReelPage.taggedProducts.count', { count: taggedProducts.length })}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* Video Upload & Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="video"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-800 font-medium flex items-center gap-1.5 text-sm">
                          <UploadCloud className="h-3.5 w-3.5 text-rose-500" />
                          {t('UploadReelPage.video.label')}
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Input
                              type="file"
                              accept="video/mp4,video/quicktime,video/x-matroska,video/avi"
                              onChange={(e) => {
                                const files = handleFileChange(e.target.files);
                                field.onChange(files);
                              }}
                              ref={fileInputRef}
                              className="h-10 border border-gray-200 focus:border-purple-500 rounded-lg text-sm"
                            />
                            {!previewUrl && (
                              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50/30">
                                <Video className="h-6 w-6 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-600 text-xs">{t('UploadReelPage.video.selectPrompt')}</p>
                                <p className="text-gray-500 text-[10px] mt-1">{t('UploadReelPage.video.supportedFormats')}</p>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel className="text-gray-800 font-medium flex items-center gap-1.5 text-sm mb-3">
                      <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                      {t('UploadReelPage.preview.title')}
                    </FormLabel>
                    {previewUrl ? (
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-black aspect-[9/16]">
                        <video src={previewUrl} controls className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center bg-gray-50/30 aspect-[9/16] flex items-center justify-center">
                        <div className="text-gray-400">
                          <Video className="h-6 w-6 mx-auto mb-1" />
                          <p className="text-gray-500 text-[10px]">{t('UploadReelPage.preview.placeholder')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Caption */}
                <FormField
                  control={form.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-800 font-medium flex items-center gap-1.5 text-sm">
                        <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                        {t('UploadReelPage.caption.label')}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={t('UploadReelPage.caption.placeholder')} 
                          {...field} 
                          className="min-h-[80px] text-sm border border-gray-200 focus:border-purple-500 rounded-lg"
                        />
                      </FormControl>
                      <FormDescription className="text-gray-600 text-[10px]">
                        {t('UploadReelPage.caption.chars', { current: field.value?.length || 0, max: 1000 })}
                      </FormDescription>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                {/* Tagged Products */}
                <div>
                  <FormLabel className="text-gray-800 font-medium flex items-center gap-1.5 text-sm mb-3">
                    <Tag className="h-3.5 w-3.5 text-rose-500" />
                    {t('UploadReelPage.taggedProducts.title')}
                    <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 ml-1.5">
                      {t('UploadReelPage.taggedProducts.count', { count: taggedProducts.length })}
                    </Badge>
                  </FormLabel>
                  
                  {taggedProducts.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        {taggedProducts.map(p => (
                          <Badge 
                            key={p.id} 
                            variant="secondary" 
                            className="bg-gradient-to-r from-rose-500 to-purple-500 text-white border-0 pl-2 pr-1 py-0.5 rounded-full flex items-center gap-1 text-[10px]"
                          >
                            <span className="max-w-[100px] truncate">{p.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const originalItem = activeAgreements.find(a => a.product_id === p.id) || allProducts.find(prod => prod.id === p.id);
                                if (originalItem) handleTagProduct(originalItem, false);
                              }}
                              className="hover:bg-white/20 rounded-full p-0.5"
                            >
                              <span className="text-[10px]">×</span>
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
                        className="w-full border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg h-9 text-sm"
                      >
                        <PlusCircle className="mr-1.5 w-3.5 h-3.5" />
                        {taggedProducts.length === 0 
                          ? t('UploadReelPage.taggedProducts.tagProducts') 
                          : t('UploadReelPage.taggedProducts.manageProducts')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl max-w-md max-h-[80vh] flex flex-col mx-2">
                      <DialogHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-xl">
                        <DialogTitle className="text-base font-bold flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          {t('UploadReelPage.taggedProducts.tagProducts')}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <ScrollArea className="flex-1 px-4 py-2">
                        <div className="space-y-3 py-2">
                          {activeAgreements.length > 0 && (
                            <div className="pb-3 border-b border-gray-200/50">
                              <h3 className="text-[10px] font-bold mb-2 text-gray-800 flex items-center gap-1.5">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 
                                {t('UploadReelPage.taggedProducts.activeAgreements')}
                              </h3>
                              <div className="space-y-2">
                                {activeAgreements.map(agreement => {
                                  const isChecked = taggedProducts.some(p => p.id === agreement.product_id);
                                  const isDisabled = selectedAgreementId !== null && selectedAgreementId !== agreement.agreement_id;
                                  return (
                                    <div 
                                      key={agreement.agreement_id} 
                                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                                        isDisabled 
                                          ? 'bg-rose-50 border-rose-200/50 opacity-60' 
                                          : 'bg-white border-gray-200/50 hover:border-gray-300'
                                      }`}
                                    >
                                      <Checkbox
                                        id={`agreement-${agreement.agreement_id}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) => handleTagProduct(agreement, !!checked)}
                                        disabled={isDisabled}
                                        className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 mt-0.5 h-4 w-4"
                                      />
                                      <label 
                                        htmlFor={`agreement-${agreement.agreement_id}`} 
                                        className={`flex-1 text-[10px] leading-tight ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                      >
                                        <div className="font-medium text-gray-900">{agreement.product_name}</div>
                                        <div className="text-gray-600 mt-0.5">
                                          {t('UploadReelPage.taggedProducts.fromMerchant', { store: agreement.merchant_store_name })}
                                        </div>
                                      </label>
                                      {agreement.product_image_url && (
                                        <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                                          <Image 
                                            src={agreement.product_image_url} 
                                            alt={agreement.product_name} 
                                            fill 
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

                      <div className="p-4 border-t border-gray-200/50">
                        <Button 
                          type="button" 
                          onClick={() => setIsModalOpen(false)}
                          className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200 rounded-lg text-sm h-9"
                        >
                          {t('common.done')}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {selectedAgreementId && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-green-800 text-sm">
                      <Star className="h-3.5 w-3.5 text-green-600" />
                      <span className="font-medium">{t('UploadReelPage.agreement.linked')}</span>
                    </div>
                    <p className="text-green-700 text-[10px] mt-0.5">
                      {t('UploadReelPage.agreement.id', { id: selectedAgreementId })}
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isUploading} 
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white h-10 rounded-lg text-sm font-medium"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
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