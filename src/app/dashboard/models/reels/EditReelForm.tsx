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
        console.error('Failed to fetch data for edit form:', error);
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
      <ScrollArea className="h-[calc(90vh-200px)] pr-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
          {/* Preview Section */}
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Video className="h-5 w-5 text-rose-600" />
                <h3 className="font-bold text-lg text-rose-900">{t('EditReelForm.preview.title')}</h3>
              </div>
              <div className="flex gap-4 items-start">
                <div className="relative flex-shrink-0">
                  <Image
                    src={reel.thumbnail_url || '/placeholder.png'}
                    alt={t('EditReelForm.preview.alt')}
                    width={80}
                    height={120}
                    className="rounded-xl object-cover border-2 border-rose-200 shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 mb-2">
                    {t('EditReelForm.preview.views', { count: reel.views_count || 0 })}
                  </Badge>
                  <p className="text-sm text-rose-700 line-clamp-2">
                    {reel.caption || t('EditReelForm.preview.noCaption')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingData ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-10 w-full bg-rose-100" />
              <Skeleton className="h-24 w-full bg-rose-100" />
              <Skeleton className="h-40 w-full bg-rose-100" />
            </div>
          ) : (
            <>
              {/* Caption Section */}
              <FormField
                control={form.control}
                name="caption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-rose-900 font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-rose-600" />
                      {t('EditReelForm.caption.label')}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={t('EditReelForm.caption.placeholder')} 
                        {...field} 
                        className="min-h-[100px] resize-none border-rose-200 focus:border-rose-300 focus:ring-rose-200 rounded-2xl"
                      />
                    </FormControl>
                    <FormDescription className="text-rose-600">
                      {t('EditReelForm.caption.chars', { current: field.value?.length || 0, max: 1000 })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tagged Products Section */}
              <div>
                <FormLabel className="text-rose-900 font-semibold flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4 text-rose-600" />
                  {t('EditReelForm.taggedProducts.title')}
                  <Badge variant="secondary" className="bg-rose-100 text-rose-700 ml-2">
                    {t('EditReelForm.taggedProducts.count', { count: taggedProducts.length })}
                  </Badge>
                </FormLabel>
                
                {/* Selected Products */}
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

                {/* Add Products Button */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 rounded-2xl h-12"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {taggedProducts.length === 0 
                        ? t('EditReelForm.taggedProducts.tagProducts') 
                        : t('EditReelForm.taggedProducts.manageProducts')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-lg max-w-md max-h-[80vh] flex flex-col">
                    <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-6 shrink-0">
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Tag className="h-5 w-5" />
                        {t('EditReelForm.taggedProducts.tagProducts')}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <ScrollArea className="flex-1 px-6">
                      <div className="space-y-4 py-4">
                        {/* Active Agreements Section */}
                        {activeAgreements.length > 0 && (
                          <div className="mb-6 pb-4 border-b border-rose-100">
                            <h3 className="text-sm font-semibold mb-3 text-rose-800 flex items-center gap-2">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 
                              {t('EditReelForm.taggedProducts.activeAgreements')}
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
                                      id={`edit-agreement-${agreement.agreement_id}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => handleTagProduct(agreement, !!checked)}
                                      disabled={isDisabled}
                                      className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 mt-0.5"
                                    />
                                    <label 
                                      htmlFor={`edit-agreement-${agreement.agreement_id}`} 
                                      className={`flex-1 text-sm leading-tight ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                      <div className="font-medium text-rose-900">{agreement.product_name}</div>
                                      <div className="text-xs text-rose-600 mt-1">
                                        {t('EditReelForm.taggedProducts.fromMerchant', { store: agreement.merchant_store_name })}
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

                        {/* Other Products Section */}
                        <div>
                          <h3 className="text-sm font-semibold mb-3 text-rose-800 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-rose-500" />
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
                                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                                    isDisabled 
                                      ? 'bg-rose-50 border-rose-100 opacity-60' 
                                      : 'bg-white border-rose-100 hover:border-rose-200 hover:shadow-sm'
                                  }`}
                                >
                                  <Checkbox
                                    id={`edit-product-${product.id}`}
                                    checked={isChecked}
                                    onCheckedChange={(checked) => handleTagProduct(product, !!checked)}
                                    disabled={isDisabled}
                                    className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 mt-0.5"
                                  />
                                  <label 
                                    htmlFor={`edit-product-${product.id}`} 
                                    className={`flex-1 text-sm font-medium text-rose-900 leading-tight ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                  >
                                    {product.name}
                                  </label>
                                  {imageUrl && (
                                    <div className="relative w-12 h-12 flex-shrink-0 rounded-xl overflow-hidden border border-rose-200">
                                      <Image 
                                        src={imageUrl} 
                                        alt={product.name} 
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
            </>
          )}
        </form>
      </ScrollArea>

      <div className="pt-4 border-t border-rose-100 mt-4">
        <Button 
          type="submit" 
          disabled={isUpdating || loadingData} 
          onClick={form.handleSubmit(onSubmit)}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg rounded-2xl h-12 font-bold text-base"
        >
          {isUpdating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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