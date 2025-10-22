'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PackageTier, ServicePackage } from '@/app/dashboard/models/modelsoffers/page';
import { toast } from 'sonner';
import { X, Plus, Star, Zap, Crown, Sparkles, Target } from 'lucide-react';

interface OfferFormProps {
    packageToEdit: ServicePackage | null;
    onSuccess: () => void;
}

const defaultTiers: PackageTier[] = [
    { tier_name: 'الباقة الأساسية', price: 0, delivery_days: 3, revisions: 1, features: [''] },
    { tier_name: 'الباقة المتقدمة', price: 0, delivery_days: 5, revisions: 2, features: [''] },
    { tier_name: 'الباقة المميزة', price: 0, delivery_days: 7, revisions: 3, features: [''] },
];

// ✨ --- INTELLIGENT PARSING HELPER --- ✨
// This function recursively parses a string until it's a clean array of strings.
const parseFeaturesArray = (features: unknown): string[] => {
    if (Array.isArray(features)) {
        // If it's already an array, ensure all items are strings.
        return features.map(String).filter(f => f.trim() !== '');
    }
    if (typeof features === 'string') {
        try {
            // Attempt to parse the string as JSON.
            const parsed = JSON.parse(features);
            // If parsing is successful, run the result through this function again
            // to handle multi-layered stringified JSON.
            return parseFeaturesArray(parsed);
        } catch (e) {
            // If it's a non-JSON string (like a single feature), split by comma as a fallback.
            return features.split(',').map(f => f.trim()).filter(f => f.trim() !== '');
        }
    }
    // Return an empty array for any other invalid type.
    return [];
};


export default function OfferForm({ packageToEdit, onSuccess }: OfferFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<'active' | 'paused'>('active');
    const [tiers, setTiers] = useState<PackageTier[]>(defaultTiers);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (packageToEdit) {
            setTitle(packageToEdit.title);
            setDescription(packageToEdit.description || '');
            setStatus(packageToEdit.status);
            
            // Use the original defaultTiers as a template
            const filledTiers = defaultTiers.map((defaultTier, index) => {
                const existingTier = packageToEdit.tiers[index];
                if (existingTier) {
                    // ✨ Use the intelligent parser to clean up corrupted data
                    const cleanedFeatures = parseFeaturesArray(existingTier.features);
                    return {
                        ...existingTier,
                        features: cleanedFeatures.length > 0 ? cleanedFeatures : [''] // Ensure at least one input field
                    };
                }
                return defaultTier;
            });
            setTiers(filledTiers);

        } else {
            // Reset form for creating a new package
            setTitle('');
            setDescription('');
            setStatus('active');
            setTiers(defaultTiers.map(t => ({...t, features: ['']})));
        }
    }, [packageToEdit]);

    const handleTierChange = <K extends keyof PackageTier>(
        index: number,
        field: K,
        value: PackageTier[K]
    ) => {
        const newTiers = [...tiers];
        newTiers[index][field] = value;
        setTiers(newTiers);
    };

    const handleFeatureChange = (tierIndex: number, featureIndex: number, value: string) => {
        const newTiers = [...tiers];
        if (newTiers[tierIndex] && newTiers[tierIndex].features) {
            newTiers[tierIndex].features[featureIndex] = value;
            setTiers(newTiers);
        }
    };

    const addFeature = (tierIndex: number) => {
        const newTiers = [...tiers];
        newTiers[tierIndex].features.push('');
        setTiers(newTiers);
    };
    
    const removeFeature = (tierIndex: number, featureIndex: number) => {
        const newTiers = [...tiers];
        if (newTiers[tierIndex].features.length > 1) {
            newTiers[tierIndex].features.splice(featureIndex, 1);
            setTiers(newTiers);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        const payload = {
            title,
            description,
            status,
            tiers: tiers.map(tier => ({
                ...tier,
                // Ensure only non-empty features are sent to the backend
                features: tier.features.filter(f => f.trim() !== '')
            }))
        };
        
        const promise = packageToEdit
            ? api.put(`/offers/${packageToEdit.id}`, payload)
            : api.post('/offers', payload);

        toast.promise(promise, {
            loading: '🔄 جاري حفظ الباقة...',
            success: () => {
                onSuccess();
                setIsSaving(false);
                return `✨ تم ${packageToEdit ? 'تحديث' : 'إنشاء'} الباقة بنجاح!`;
            },
            error: (err) => {
                setIsSaving(false);
                return `❌ فشل الحفظ: ${err.response?.data?.message || 'خطأ غير معروف'}`;
            }
        });
    };
    
    const tierIcons = [
        { icon: <Star className="w-5 h-5 text-amber-500" />, color: 'from-amber-50 to-amber-100' },
        { icon: <Zap className="w-5 h-5 text-purple-500" />, color: 'from-purple-50 to-purple-100' },
        { icon: <Crown className="w-5 h-5 text-rose-500" />, color: 'from-rose-50 to-rose-100' }
    ];

    return (
        <form onSubmit={handleSubmit} className="p-2 space-y-8 h-full overflow-y-auto custom-scrollbar">
            {/* Main Service Info */}
            <div className="space-y-6">
                <div className="space-y-3">
                    <Label htmlFor="title" className="text-lg font-bold text-rose-800">عنوان الخدمة الرئيسي</Label>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: حملة تسويقية متكاملة على انستقرام" required className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 text-lg"/>
                </div>
                <div className="space-y-3">
                    <Label htmlFor="description" className="text-lg font-bold text-rose-800">وصف الخدمة</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اشرحي بالتفصيل ماذا تقدمين في هذه الخدمة..." rows={4} className="bg-white border-rose-200 focus:border-rose-400 rounded-2xl px-4 py-3 resize-none min-h-[120px]"/>
                </div>
            </div>

            {/* Package Tiers */}
            <div className="space-y-6">
                <div className="flex items-center gap-3"><Target className="w-6 h-6 text-rose-500" /><Label className="text-xl font-bold text-rose-800">مستويات الباقة</Label></div>
                <div className="grid md:grid-cols-3 gap-6">
                    {tiers.map((tier, index) => (
                        <div key={index} className={`p-6 border-2 border-rose-200 rounded-3xl bg-gradient-to-b ${tierIcons[index].color} space-y-5`}>
                            <div className="flex items-center gap-3">{tierIcons[index].icon}<Input value={tier.tier_name} onChange={(e) => handleTierChange(index, 'tier_name', e.target.value)} className="bg-transparent border-0 font-bold text-lg p-0 h-auto focus-visible:ring-0 text-rose-800" placeholder="اسم المستوى"/></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label className="text-rose-700 font-medium">السعر (ر.س)</Label><Input type="number" value={tier.price} onChange={(e) => handleTierChange(index, 'price', parseFloat(e.target.value) || 0)} required className="bg-white border-rose-200 rounded-xl"/></div>
                                <div className="space-y-2"><Label className="text-rose-700 font-medium">مدة التسليم</Label><Input type="number" value={tier.delivery_days} onChange={(e) => handleTierChange(index, 'delivery_days', parseInt(e.target.value) || 1)} required className="bg-white border-rose-200 rounded-xl"/></div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-rose-700 font-medium">عدد المراجعات</Label>
                                <Select value={String(tier.revisions)} onValueChange={(val) => handleTierChange(index, 'revisions', parseInt(val))}>
                                    <SelectTrigger className="bg-white border-rose-200 rounded-xl"><SelectValue/></SelectTrigger>
                                    <SelectContent>{[0, 1, 2, 3, 4, 5, -1].map(num => <SelectItem key={num} value={String(num)}>{num === -1 ? 'غير محدود' : num}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-rose-700 font-medium">الميزات المضمنة</Label>
                                <div className="space-y-2">
                                    {tier.features.map((feature, fIndex) => (
                                        <div key={fIndex} className="flex items-center gap-2">
                                            <Input value={feature} onChange={(e) => handleFeatureChange(index, fIndex, e.target.value)} placeholder="مثال: 1 فيديو ريلز احترافي" className="bg-white border-rose-200 rounded-xl"/>
                                            {tier.features.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index, fIndex)} className="text-red-500 hover:bg-red-50 rounded-xl"><X className="w-4 h-4" /></Button>}
                                        </div>
                                    ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => addFeature(index)} className="w-full border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"><Plus className="w-4 h-4 mr-2" /> إضافة ميزة جديدة</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between p-6 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200">
                <div className="space-y-1">
                    <Label htmlFor="status" className="font-bold text-rose-800 text-lg">حالة الباقة</Label>
                    <p className="text-rose-600 text-sm">{status === 'active' ? 'ستظهر الباقة للتجار' : 'ستكون الباقة مخفية'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Switch id="status" checked={status === 'active'} onCheckedChange={(checked) => setStatus(checked ? 'active' : 'paused')} className="data-[state=checked]:bg-rose-500"/>
                    <span className={`font-semibold ${status === 'active' ? 'text-green-600' : 'text-amber-600'}`}>{status === 'active' ? 'نشطة' : 'متوقفة'}</span>
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-rose-200">
                <Button type="submit" size="lg" disabled={isSaving} className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-3 rounded-2xl font-bold text-lg">
                    {isSaving ? 'جاري الحفظ...' : <><Sparkles className="mr-2 h-5 w-5" />{packageToEdit ? 'حفظ التعديلات' : 'إنشاء الباقة'}</>}
                </Button>
            </div>

            <style jsx>{`.custom-scrollbar::-webkit-scrollbar{width:6px;}.custom-scrollbar::-webkit-scrollbar-track{background:#fecdd3;border-radius:10px;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#fb7185;border-radius:10px;}.custom-scrollbar::-webkit-scrollbar-thumb:hover{background:#e11d48;}`}</style>
        </form>
    );
}
