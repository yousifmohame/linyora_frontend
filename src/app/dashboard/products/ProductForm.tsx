'use client';

import { useState, useEffect, JSX } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  PlusCircle, 
  Trash2, 
  UploadCloud, 
  X, 
  Palette,
  DollarSign,
  Package,
  Image as ImageIcon,
  Crown,
  Sparkles,
  TrendingUp,
  Eye,
  Hash
} from 'lucide-react';
import { Product } from './page';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface VariantState {
    id: number;
    color: string;
    price: string;
    compare_at_price: string;
    stock_quantity: string;
    images: string[];
    sku: string;
}

interface ProductFormProps {
    product?: Product | null;
    onSuccess: () => void;
}

interface Category {
    id: number;
    name: string;
    children: Category[];
}

export default function ProductFormV2({ product, onSuccess }: ProductFormProps) {
    const { t } = useTranslation();

    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [status, setStatus] = useState<'draft' | 'active'>('active');
    
    const [variants, setVariants] = useState<VariantState[]>([
        { 
            id: Date.now(), 
            color: '', 
            price: '', 
            compare_at_price: '', 
            stock_quantity: '', 
            images: [],
            sku: ''
        }
    ]);

    const [isUploading, setIsUploading] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();

        if (product) {
            setProductName(product.name);
            setDescription(product.description || '');
            setBrand(product.brand || '');
            setStatus(product.status);
            setVariants(product.variants.map(v => ({
                id: v.id,
                color: v.color,
                price: String(v.price),
                compare_at_price: v.compare_at_price ? String(v.compare_at_price) : '',
                stock_quantity: String(v.stock_quantity),
                images: v.images || [],
                sku: v.sku || ''
            })));
            // ✅ السطر المضاف الذي يحل المشكلة
            setSelectedCategories(product.categoryIds || []);
        } else {
            // إعادة تعيين الحقول عند فتح نافذة "إنشاء منتج جديد"
            setProductName('');
            setDescription('');
            setBrand('');
            setStatus('active');
            setSelectedCategories([]);
            setVariants([{ 
                id: Date.now(), color: '', price: '', compare_at_price: '', 
                stock_quantity: '', images: [], sku: ''
            }]);
        }
    }, [product]);

    const handleVariantChange = (index: number, field: keyof Omit<VariantState, 'id' | 'images'>, value: string) => {
        const updatedVariants = [...variants];
        updatedVariants[index] = { ...updatedVariants[index], [field]: value };
        setVariants(updatedVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { 
            id: Date.now(), 
            color: '', 
            price: '', 
            compare_at_price: '', 
            stock_quantity: '', 
            images: [],
            sku: ''
        }]);
    };
    
    const removeVariant = (id: number) => {
        if (variants.length <= 1) return;
        setVariants(variants.filter(v => v.id !== id));
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, variantId: number) => {
        if (!event.target.files) return;
        setIsUploading(variantId);
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        try {
            const response = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            const updatedVariants = variants.map(v => 
                v.id === variantId ? { ...v, images: [...v.images, response.data.imageUrl] } : v
            );
            setVariants(updatedVariants);
        } catch (error) {
            console.error("Image upload failed", error);
            alert(t('ProductForm.uploadFailed'));
        } finally {
            setIsUploading(null);
        }
    };

    const removeImage = (variantId: number, urlToRemove: string) => {
        const updatedVariants = variants.map(v => 
            v.id === variantId ? { ...v, images: v.images.filter(url => url !== urlToRemove) } : v
        );
        setVariants(updatedVariants);
    };

    const generateSKU = (variantIndex: number) => {
        const baseSKU = productName.replace(/\s+/g, '').toUpperCase().substring(0, 6) || 'PROD';
        const colorCode = variants[variantIndex].color.substring(0, 3).toUpperCase() || 'CLR';
        return `${baseSKU}-${colorCode}-${variantIndex + 1}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const preparedVariants = variants.map(variant => {
            const baseVariant = {
                color: variant.color,
                images: variant.images,
                sku: variant.sku || generateSKU(variants.indexOf(variant)),
                price: parseFloat(variant.price) || 0,
                compare_at_price: variant.compare_at_price ? parseFloat(variant.compare_at_price) : null,
                stock_quantity: parseInt(variant.stock_quantity) || 0,
            };

            // إذا كنا نُعدّل منتجًا (product exists) وكان variant.id رقمًا صحيحًا (ليس مؤقتًا)، أرسله
            if (product && typeof variant.id === 'number' && variant.id > 0) {
                return { ...baseVariant, id: variant.id };
            }

            // وإلا (منتج جديد أو id مؤقت)، لا تُرسل id
            return baseVariant;
        });

        const apiData = { 
            name: productName, 
            description, 
            brand, 
            status,
            variants: preparedVariants,
            categoryIds: selectedCategories, // ✅ صحيح: إضافة الفئات هنا في الكائن الرئيسي
        };
        
        try {
            if (product) {
                await api.put(`/merchants/products/${product.id}`, apiData);
            } else {
                await api.post('/merchants/products', apiData);
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert(t('ProductForm.saveFailed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- ✨ تم تحسين هذه الدالة لإضافة مسافات بادئة ---
    const renderCategoryOptions = (cats: Category[], level = 0): JSX.Element[] => {
        let options: JSX.Element[] = [];
        const prefix = '\u00A0\u00A0'.repeat(level); // إضافة مسافتين لكل مستوى
        cats.forEach(cat => {
            options.push(<option key={cat.id} value={cat.id}>{prefix}{cat.name}</option>);
            if (cat.children && cat.children.length > 0) {
                options = options.concat(renderCategoryOptions(cat.children, level + 1));
            }
        });
        return options;
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 space-x-reverse text-2xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                        <Crown className="w-6 h-6" />
                        <span>{t('ProductForm.basicInfo.title')}</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {t('ProductForm.basicInfo.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label htmlFor="productName" className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                <Sparkles className="w-4 h-4 text-rose-500" />
                                <span>{t('ProductForm.fields.productName')}</span>
                            </Label>
                            <Input 
                                id="productName" 
                                value={productName} 
                                onChange={e => setProductName(e.target.value)} 
                                required
                                className="h-12 bg-white/80 border-gray-300 focus:ring-2 focus:ring-rose-200 focus:border-rose-400 transition-all duration-200"
                                placeholder={t('ProductForm.placeholders.productName')}
                            />
                        </div>
                         <div className="space-y-3">
                            <Label htmlFor="brand" className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                <TrendingUp className="w-4 h-4 text-purple-500" />
                                <span>{t('ProductForm.fields.brand')}</span>
                            </Label>
                            <Input 
                                id="brand" 
                                value={brand} 
                                onChange={e => setBrand(e.target.value)} 
                                className="h-12 bg-white/80 border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                                placeholder={t('ProductForm.placeholders.brand')}
                            />
                        </div>
                    </div>
                    
                    <div>
                        <Label htmlFor="categories">الفئات</Label>
                        <select
                            id="categories"
                            multiple
                            value={selectedCategories.map(String)}
                            onChange={(e) => {
                                const selected = Array.from(e.target.options)
                                    .filter(option => option.selected)
                                    .map(option => Number(option.value));
                                setSelectedCategories(selected);
                            }}
                            className="w-full h-32 border rounded-md"
                        >
                            {renderCategoryOptions(categories)}
                        </select>
                        <p className="text-sm text-gray-500">يمكنك اختيار أكثر من فئة بالضغط على Ctrl (أو Cmd).</p>
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="description" className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span>{t('ProductForm.fields.description')}</span>
                        </Label>
                        <Textarea 
                            id="description" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            className="min-h-24 bg-white/80 border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                            placeholder={t('ProductForm.placeholders.description')}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-purple-50 rounded-2xl border border-rose-100">
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <Sparkles className="w-5 h-5 text-rose-500" />
                            </div>
                            <div>
                                <Label className="text-sm font-semibold text-gray-900">
                                    {t('ProductForm.fields.status')}
                                </Label>
                                <p className="text-sm text-gray-600">
                                    {t('ProductForm.statusDescription')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 space-x-reverse">
                            <Switch
                                checked={status === 'active'}
                                onCheckedChange={(checked) => setStatus(checked ? 'active' : 'draft')}
                                className="data-[state=checked]:bg-rose-500"
                            />
                            <Badge className={status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {status === 'active' ? t('ProductForm.status.active') : t('ProductForm.status.draft')}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Variants Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-2 space-x-reverse text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        <Palette className="w-6 h-6" />
                        <span>{t('ProductForm.variants.title')}</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        {t('ProductForm.variants.subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {variants.map((variant, index) => (
                        <div key={variant.id} className="p-6 bg-white rounded-2xl border border-gray-200/50 shadow-sm relative space-y-6">
                            {variants.length > 1 && (
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    className="absolute top-4 left-4 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={() => removeVariant(variant.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                            
                            <div className="text-center">
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
                                    {t('ProductForm.variants.variantNumber', { number: index + 1 })}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                        <Palette className="w-4 h-4 text-amber-500" />
                                        <span>{t('ProductForm.variantFields.color')}</span>
                                    </Label>
                                    <Input 
                                        placeholder={t('ProductForm.placeholders.color')}
                                        value={variant.color} 
                                        onChange={e => handleVariantChange(index, 'color', e.target.value)} 
                                        required 
                                        className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                        <Hash className="w-4 h-4 text-gray-500" />
                                        <span>{t('ProductForm.variantFields.sku')}</span>
                                    </Label>
                                    <Input 
                                        placeholder={t('ProductForm.placeholders.sku')}
                                        value={variant.sku} 
                                        disabled={true}
                                        onChange={e => handleVariantChange(index, 'sku', e.target.value)} 
                                        className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                        <DollarSign className="w-4 h-4 text-green-500" />
                                        <span>{t('ProductForm.variantFields.price', { currency: t('currency') })}</span>
                                    </Label>
                                    <Input 
                                        type="number" 
                                        placeholder={t('ProductForm.placeholders.price')}
                                        value={variant.price} 
                                        onChange={e => handleVariantChange(index, 'price', e.target.value)} 
                                        required 
                                        className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition-all duration-200"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                        <DollarSign className="w-4 h-4 text-blue-500" />
                                        <span>{t('ProductForm.variantFields.comparePrice', { currency: t('currency') })}</span>
                                    </Label>
                                    <Input 
                                        type="number" 
                                        placeholder={t('ProductForm.placeholders.comparePrice')}
                                        value={variant.compare_at_price} 
                                        onChange={e => handleVariantChange(index, 'compare_at_price', e.target.value)} 
                                        className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                    <Package className="w-4 h-4 text-purple-500" />
                                    <span>{t('ProductForm.variantFields.stock')}</span>
                                </Label>
                                <Input 
                                    type="number" 
                                    placeholder={t('ProductForm.placeholders.stock')}
                                    value={variant.stock_quantity} 
                                    onChange={e => handleVariantChange(index, 'stock_quantity', e.target.value)} 
                                    required 
                                    className="h-12 bg-white border-gray-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="flex items-center space-x-2 space-x-reverse text-sm font-semibold">
                                    <ImageIcon className="w-4 h-4 text-rose-500" />
                                    <span>{t('ProductForm.variantFields.images')}</span>
                                </Label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {variant.images.map(url => (
                                        <div key={url} className="relative group">
                                            <img 
                                                src={url} 
                                                alt={t('ProductForm.variantFields.variantImageAlt')}
                                                className="h-28 w-full object-cover rounded-xl border-2 border-white shadow-md transition-all duration-300 group-hover:shadow-lg" 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => removeImage(variant.id, url)} 
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                        isUploading === variant.id 
                                            ? 'bg-blue-50 border-blue-300' 
                                            : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                                    }`}>
                                        {isUploading === variant.id ? (
                                            <div className="text-center">
                                                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                <span className="text-xs text-blue-600">{t('ProductForm.uploading')}</span>
                                            </div>
                                        ) : (
                                            <>
                                                <UploadCloud className="text-gray-400 mb-2" />
                                                <span className="text-xs text-gray-500">{t('ProductForm.addImage')}</span>
                                            </>
                                        )}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            onChange={(e) => handleImageUpload(e, variant.id)} 
                                            disabled={isUploading !== null} 
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addVariant} 
                        className="w-full h-14 border-2 border-dashed border-gray-300 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 rounded-2xl"
                    >
                        <PlusCircle className="ml-2 h-5 w-5 text-amber-500" />
                        {t('ProductForm.addVariant')}
                    </Button>
                </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 space-x-reverse">
                <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 px-8 rounded-2xl border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    onClick={() => window.history.back()}
                >
                    {t('common.cancel')}
                </Button>
                <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="h-12 px-8 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none disabled:hover:shadow-lg rounded-2xl"
                >
                    {isSubmitting ? (
                        <div className="flex items-center space-x-2 space-x-reverse">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('ProductForm.saving')}</span>
                        </div>
                    ) : product ? (
                        t('ProductForm.updateProduct')
                    ) : (
                        t('ProductForm.createProduct')
                    )}
                </Button>
            </div>
        </form>
    );
}