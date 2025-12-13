'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '@/lib/axios';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { PlusCircle, Star, Tag, ImageIcon, Video, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { ReelData } from '@/components/reels/ReelVerticalViewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ActiveAgreement {
    agreement_id: number;
    product_id: number;
    product_name: string;
    product_image_url: string | null;
    merchant_store_name: string;
}

interface TaggedProductInfo {
    id: number;
    name: string;
    image_url: string | null;
}

const editReelSchema = (t: (key: string) => string) => z.object({
  caption: z.string().max(1000, t('EditReelForm.validation.maxCaption')).optional(),
});

type EditableReel = ReelData & {
  caption: string;
  is_active: boolean;
  agreement_id?: number;
  tagged_products?: TaggedProductInfo[];
};

interface EditReelFormProps {
  reel: EditableReel;
  onUpdateSuccess: () => void;
  setOpen: (open: boolean) => void;
}

export function EditReelForm({ reel, onUpdateSuccess, setOpen }: EditReelFormProps) {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [activeAgreements, setActiveAgreements] = useState<ActiveAgreement[]>([]);
  const [taggedProducts, setTaggedProducts] = useState<TaggedProductInfo[]>([]);
  const [selectedAgreementId, setSelectedAgreementId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<z.infer<ReturnType<typeof editReelSchema>>>({
    resolver: zodResolver(editReelSchema(t)),
    defaultValues: {
      caption: reel.caption || "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        const [productsResponse, agreementsResponse, reelDetailsResponse] = await Promise.all([
          api.get('/browse/all-products'),
          api.get('/agreements/active-for-user'),
          api.get(`/reels/${reel.id}`)
        ]);
        setAllProducts(productsResponse.data || []);
        setActiveAgreements(agreementsResponse.data || []);
        const reelDetails = reelDetailsResponse.data;
        setTaggedProducts(reelDetails.tagged_products || []);
        setSelectedAgreementId(reelDetails.agreement_id || null);
        form.setValue('caption', reelDetails.caption || "");
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error(t('EditReelForm.toast.fetchError'));
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [reel.id, form, t]);

  const handleTagProduct = (product: Product | ActiveAgreement, checked: boolean) => {
    let productInfo: TaggedProductInfo;
    let isAgreementProduct = 'agreement_id' in product;

    if (isAgreementProduct) {
      const agreement = product as ActiveAgreement;
      productInfo = { id: agreement.product_id, name: agreement.product_name, image_url: agreement.product_image_url };
    } else {
      const standardProduct = product as Product;
      productInfo = { id: standardProduct.id, name: standardProduct.name, image_url: standardProduct.variants?.[0]?.images?.[0] || null };
    }

    setTaggedProducts((prev) => checked ? [...prev, productInfo] : prev.filter((p) => p.id !== productInfo.id));

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

  const onSubmit = async (values: z.infer<ReturnType<typeof editReelSchema>>) => {
    setIsUpdating(true);
    const productIds = taggedProducts.map(p => p.id);
    const payload = {
      caption: values.caption || '',
      tagged_products: JSON.stringify(productIds),
      agreement_id: selectedAgreementId || null,
    };

    try {
      await api.put(`/reels/${reel.id}`, payload);
      toast.success(t('EditReelForm.toast.updateSuccess'));
      onUpdateSuccess();
      setOpen(false);
    } catch (error: any) {
      toast.error(t('EditReelForm.toast.updateError'), {
        description: error.response?.data?.message || t('common.tryAgain'),
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const agreementProductIds = new Set(activeAgreements.map(a => a.product_id));
  const otherProducts = allProducts.filter(p => !agreementProductIds.has(p.id));

  return (
    <Form {...form}>
      <ScrollArea className="h-[calc(90vh-200px)] pr-2">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pb-4">
          {/* Preview Card — ✅ Unified styling */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <Video className="h-4 w-4 text-rose-500" />
                <h3 className="font-bold text-gray-900 text-sm">{t('EditReelForm.preview.title')}</h3>
              </div>
              <div className="flex gap-3 items-start">
                <div className="relative w-16 h-24 flex-shrink-0">
                  <Image
                    src={reel.thumbnail_url || '/placeholder.png'}
                    alt={t('EditReelForm.preview.alt')}
                    fill
                    className="rounded-lg object-cover border-2 border-gray-200"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                    <Video className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 mb-2">
                    {t('EditReelForm.preview.views', { count: reel.views_count || 0 })}
                  </Badge>
                  <p className="text-[10px] text-gray-700 line-clamp-2">
                    {reel.caption || t('EditReelForm.preview.noCaption')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingData ? (
            <div className="space-y-3 py-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              {/* Caption */}
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-800 font-medium flex items-center gap-1.5 text-sm">
                      <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                      {t('EditReelForm.caption.label')}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('EditReelForm.caption.placeholder')} 
                        {...field} 
                        className="min-h-[80px] text-sm border border-gray-200 focus:border-purple-500 rounded-lg"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-600 text-[10px]">
                      {t('EditReelForm.caption.chars', { current: field.value?.length || 0, max: 1000 })}
                    </FormDescription>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              {/* Tagged Products */}
              <div>
                <FormLabel className="text-gray-800 font-medium flex items-center gap-1.5 text-sm mb-3">
                  <Tag className="h-3.5 w-3.5 text-rose-500" />
                  {t('EditReelForm.taggedProducts.title')}
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 ml-1.5">
                    {t('EditReelForm.taggedProducts.count', { count: taggedProducts.length })}
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
                        ? t('EditReelForm.taggedProducts.tagProducts') 
                        : t('EditReelForm.taggedProducts.manageProducts')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl max-w-md max-h-[80vh] flex flex-col mx-2">
                    <DialogHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 rounded-t-xl">
                      <DialogTitle className="text-base font-bold flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {t('EditReelForm.taggedProducts.tagProducts')}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 px-4 py-2">
                      <div className="space-y-3 py-2">
                        {activeAgreements.length > 0 && (
                          <div className="pb-3 border-b border-gray-200/50">
                            <h3 className="text-[10px] font-bold mb-2 text-gray-800 flex items-center gap-1.5">
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 
                              {t('EditReelForm.taggedProducts.activeAgreements')}
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
                                      id={`edit-agreement-${agreement.agreement_id}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => handleTagProduct(agreement, !!checked)}
                                      disabled={isDisabled}
                                      className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 mt-0.5 h-4 w-4"
                                    />
                                    <label 
                                      htmlFor={`edit-agreement-${agreement.agreement_id}`} 
                                      className={`flex-1 text-[10px] leading-tight ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                      <div className="font-medium text-gray-900">{agreement.product_name}</div>
                                      <div className="text-gray-600 mt-0.5">
                                        {t('EditReelForm.taggedProducts.fromMerchant', { store: agreement.merchant_store_name })}
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

                        <div>
                          <h3 className="text-[10px] font-bold mb-2 text-gray-800 flex items-center gap-1.5">
                            <ImageIcon className="w-3 h-3 text-rose-500" />
                            {t('EditReelForm.taggedProducts.allProducts')}
                          </h3>
                          <div className="space-y-2">
                            {otherProducts.map(product => {
                              const isChecked = taggedProducts.some(p => p.id === product.id);
                              const isDisabled = selectedAgreementId !== null;
                              const imageUrl = product.variants?.[0]?.images?.[0];
                              return (
                                <div 
                                  key={product.id} 
                                  className={`flex items-start gap-2.5 p-2.5 rounded-lg border ${
                                    isDisabled 
                                      ? 'bg-rose-50 border-rose-200/50 opacity-60' 
                                      : 'bg-white border-gray-200/50 hover:border-gray-300'
                                  }`}
                                >
                                  <Checkbox
                                    id={`edit-product-${product.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => handleTagProduct(product, !!checked)}
                                    disabled={isDisabled}
                                    className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 mt-0.5 h-4 w-4"
                                  />
                                  <label 
                                    htmlFor={`edit-product-${product.id}`} 
                                    className={`flex-1 text-[10px] font-medium text-gray-900 leading-tight ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                  >
                                    {product.name}
                                  </label>
                                  {imageUrl && (
                                    <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                                      <Image 
                                        src={imageUrl} 
                                        alt={product.name} 
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
            </>
          )}
        </form>
      </ScrollArea>

      <div className="pt-3 border-t border-gray-200/50 mt-3">
        <Button 
          type="submit" 
          disabled={isUpdating || loadingData} 
          onClick={form.handleSubmit(onSubmit)}
          className="w-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white h-10 rounded-lg text-sm font-medium"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-1.5"></div>
              {t('EditReelForm.actions.saving')}
            </>
          ) : (
            t('EditReelForm.actions.saveChanges')
          )}
        </Button>
      </div>
    </Form>
  );
}