'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  UploadCloud,
  X,
  ImageIcon,
  Save,
  Sparkles,
  Package,
  Plus,
  Trash2,
  Palette,
  Hash,
  DollarSign,
  ListTree,
  Check,
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SupplierVariant {
  id?: number;
  color: string;
  cost_price: number | string;
  stock_quantity: number | string;
  images: string[];
}

interface SupplierProduct {
  id?: number;
  name: string;
  brand: string;
  description: string;
  variants: SupplierVariant[];
  categoryIds?: number[];
}

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  product?: SupplierProduct | null;
  onSuccess: () => void;
}

const createDefaultVariant = (): SupplierVariant => ({
  color: '',
  cost_price: '',
  stock_quantity: '',
  images: [],
});

export default function SupplierProductForm({ product, onSuccess }: ProductFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SupplierProduct>({
    name: '',
    brand: '',
    description: '',
    variants: [createDefaultVariant()],
    categoryIds: [],
  });
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingVariantIndex, setUploadingVariantIndex] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data } = await api.get('/supplier/form-data/categories');
        setAvailableCategories(data);
      } catch {
        toast.error(t('supplierproductform.toasts.categoriesError'));
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [t]);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        variants: product.variants?.length > 0 ? product.variants : [createDefaultVariant()],
        categoryIds: product.categoryIds || [],
      });
    } else {
      setFormData({
        name: '',
        brand: '',
        description: '',
        variants: [createDefaultVariant()],
        categoryIds: [],
      });
    }
  }, [product]);

  const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [name]: value };
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () =>
    setFormData((prev) => ({ ...prev, variants: [...prev.variants, createDefaultVariant()] }));

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      toast.info(t('supplierproductform.variants.minOne'));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
    if (!e.target.files?.length) return;
    setUploadingVariantIndex(variantIndex);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const response = await api.post('/upload', uploadData);
      const newVariants = [...formData.variants];
      newVariants[variantIndex].images.push(response.data.imageUrl);
      setFormData((prev) => ({ ...prev, variants: newVariants }));
      toast.success(t('supplierproductform.toasts.imageUploadSuccess'));
    } catch {
      toast.error(t('supplierproductform.toasts.imageUploadError'));
    } finally {
      setUploadingVariantIndex(null);
    }
  };

  const removeImage = (variantIndex: number, urlToRemove: string) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].images = newVariants[variantIndex].images.filter(
      (url) => url !== urlToRemove
    );
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleCategorySelect = (categoryId: number) => {
    setFormData((prev) => {
      const newCategoryIds = prev.categoryIds?.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...(prev.categoryIds || []), categoryId];
      return { ...prev, categoryIds: newCategoryIds };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const promise = product?.id
        ? api.put(`/supplier/products/${product.id}`, formData)
        : api.post('/supplier/products', formData);

      await toast.promise(promise, {
        loading: t('supplierproductform.buttons.saving'),
        success: t(
          product?.id
            ? 'supplierproductform.toasts.saveSuccess.edit'
            : 'supplierproductform.toasts.saveSuccess.add'
        ),
        error: (err) =>
          t('supplierproductform.toasts.saveError', {
            message: err.response?.data?.message || 'unknown error',
          }),
      });
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategories = availableCategories.filter((cat) =>
    formData.categoryIds?.includes(cat.id)
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 max-h-[calc(90vh-180px)] overflow-y-auto custom-scrollbar p-1"
    >
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl">
            <Package className="h-6 w-6 text-white" />
          </div>
          <Sparkles className="h-5 w-5 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {product?.id
            ? t('supplierproductform.title.edit')
            : t('supplierproductform.title.add')}
        </h2>
        <p className="text-blue-600 mt-2">
          {product?.id
            ? t('supplierproductform.subtitle.edit')
            : t('supplierproductform.subtitle.add')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-blue-800 font-bold text-lg">
            {t('supplierproductform.labels.name')}
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleMainChange}
            required
            placeholder={t('supplierproductform.placeholders.name')}
            className="bg-white border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 text-lg transition-colors duration-200"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="brand" className="text-blue-800 font-bold text-lg">
            {t('supplierproductform.labels.brand')}
          </Label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleMainChange}
            placeholder={t('supplierproductform.placeholders.brand')}
            className="bg-white border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 text-lg transition-colors duration-200"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-blue-800 font-bold text-lg">
            {t('supplierproductform.labels.description')}
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleMainChange}
            placeholder={t('supplierproductform.placeholders.description')}
            rows={4}
            className="bg-white border-blue-200 focus:border-blue-400 rounded-2xl px-4 py-3 resize-none min-h-[120px] transition-colors duration-200"
          />
        </div>

        <div className="space-y-3">
          <Label className="text-blue-800 font-bold text-lg flex items-center gap-2">
            <ListTree className="w-5 h-5 text-blue-500" />
            {t('supplierproductform.labels.categories')}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-auto min-h-12 border-blue-200 rounded-2xl hover:bg-blue-50 transition-colors duration-200"
                disabled={categoriesLoading}
              >
                {categoriesLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    {t('supplierproductform.buttons.loadingCategories')}
                  </div>
                ) : selectedCategories.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {selectedCategories.map((cat) => (
                      <Badge
                        key={cat.id}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 hover:bg-blue-100 rounded-xl"
                      >
                        {cat.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-blue-600">
                    {t('supplierproductform.category.placeholder')}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[--radix-popover-trigger-width] p-0 border-blue-200 rounded-2xl"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder={t('supplierproductform.placeholders.categorySearch')}
                  className="border-0"
                />
                <CommandList>
                  <CommandEmpty>{t('supplierproductform.category.noResults')}</CommandEmpty>
                  <CommandGroup>
                    {availableCategories.map((cat) => {
                      const isSelected = formData.categoryIds?.includes(cat.id);
                      return (
                        <CommandItem
                          key={cat.id}
                          onSelect={() => handleCategorySelect(cat.id)}
                          className="cursor-pointer transition-colors duration-200 hover:bg-blue-50"
                        >
                          <div
                            className={cn(
                              'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-blue-500',
                              isSelected
                                ? 'bg-blue-500 text-white'
                                : 'opacity-50 [&_svg]:invisible'
                            )}
                          >
                            <Check className="h-4 w-4" />
                          </div>
                          <span
                            className={isSelected ? 'text-blue-700 font-medium' : 'text-blue-600'}
                          >
                            {cat.name}
                          </span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-blue-200">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-blue-800 font-bold text-xl">
            <Sparkles className="w-5 h-5 text-blue-500" />
            {t('supplierproductform.labels.variants')}
          </Label>
          <Button
            type="button"
            size="sm"
            onClick={addVariant}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl transition-colors duration-200"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('supplierproductform.buttons.addVariant')}
          </Button>
        </div>

        {formData.variants.map((variant, index) => (
          <div
            key={index}
            className="p-6 border-2 border-blue-200 rounded-3xl bg-gradient-to-b from-blue-50 to-indigo-50 space-y-5 relative hover:border-blue-300 transition-colors duration-200"
          >
            {formData.variants.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeVariant(index)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
              >
                <X size={16} />
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label htmlFor={`color-${index}`} className="flex items-center gap-2 text-blue-700 font-medium">
                  <Palette className="w-4 h-4" />
                  {t('supplierproductform.labels.color')}
                </Label>
                <Input
                  id={`color-${index}`}
                  name="color"
                  value={variant.color}
                  onChange={(e) => handleVariantChange(index, e)}
                  required
                  placeholder={t('supplierproductform.placeholders.color')}
                  className="bg-white border-blue-200 focus:border-blue-400 rounded-xl transition-colors duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor={`cost_price-${index}`}
                  className="flex items-center gap-2 text-blue-700 font-medium"
                >
                  <DollarSign className="w-4 h-4" />
                  {t('supplierproductform.labels.costPrice')}
                </Label>
                <Input
                  id={`cost_price-${index}`}
                  name="cost_price"
                  type="number"
                  value={variant.cost_price}
                  onChange={(e) => handleVariantChange(index, e)}
                  required
                  placeholder={t('supplierproductform.placeholders.costPrice')}
                  min="0"
                  step="0.01"
                  className="bg-white border-blue-200 focus:border-blue-400 rounded-xl transition-colors duration-200"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor={`stock_quantity-${index}`}
                  className="flex items-center gap-2 text-blue-700 font-medium"
                >
                  <Package className="w-4 h-4" />
                  {t('supplierproductform.labels.quantity')}
                </Label>
                <Input
                  id={`stock_quantity-${index}`}
                  name="stock_quantity"
                  type="number"
                  value={variant.stock_quantity}
                  onChange={(e) => handleVariantChange(index, e)}
                  required
                  placeholder={t('supplierproductform.placeholders.quantity')}
                  min="0"
                  className="bg-white border-blue-200 focus:border-blue-400 rounded-xl transition-colors duration-200"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2 text-blue-700 font-medium">
                <ImageIcon className="w-4 h-4" />
                {t('supplierproductform.labels.images')}
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {variant.images.map((url) => (
                  <div
                    key={url}
                    className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors duration-200"
                  >
                    <Image src={url} alt="Product image" fill className="object-cover" unoptimized />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      onClick={() => removeImage(index, url)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-blue-300 rounded-2xl cursor-pointer bg-white hover:bg-blue-50 hover:border-blue-400 transition-all duration-200">
                  {uploadingVariantIndex === index ? (
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-blue-400 mb-2" />
                      <span className="text-blue-600 text-sm font-medium text-center px-2">
                        {t('supplierproductform.buttons.uploadImage')}
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, index)}
                    disabled={uploadingVariantIndex !== null}
                    accept="image/*"
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-6 border-t border-blue-200">
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-colors duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('supplierproductform.buttons.saving')}
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {product?.id
                ? t('supplierproductform.buttons.submitEdit')
                : t('supplierproductform.buttons.submitAdd')}
            </>
          )}
        </Button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #dbeafe;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3b82f6;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563eb;
        }
      `}</style>
    </form>
  );
}