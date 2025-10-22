'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from "@/components/ui/slider";
import { Star, X } from 'lucide-react';

interface FilterOptions {
    brands: string[];
    colors: string[];
    sizes: string[];
}

// مكون لتمثيل فلتر التقييم بالنجوم
const RatingFilter = ({ onSelect, selectedRating }: { onSelect: (rating: number) => void; selectedRating: number | null }) => (
    <div className="flex items-center justify-center gap-1">
        {[5, 4, 3, 2, 1].map(rating => (
            <Button
                key={rating}
                variant={selectedRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => onSelect(rating)}
                className={`flex items-center gap-1 ${selectedRating === rating ? 'bg-amber-400 text-black' : ''}`}
            >
                {rating} <Star className="w-4 h-4 text-amber-500 fill-current" />
            </Button>
        ))}
    </div>
);


export default function FilterSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ brands: [], colors: [], sizes: [] });
    const [priceRange, setPriceRange] = useState<[number, number]>([
        Number(searchParams.get('price_min')) || 0,
        Number(searchParams.get('price_max')) || 5000
    ]);

    // جلب خيارات الفلترة من الـ API عند تحميل المكون
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await api.get('/products/filters');
                setFilterOptions(response.data);
            } catch (error) {
                console.error("Failed to fetch filter options", error);
            }
        };
        fetchOptions();
    }, []);
    
    // دالة عامة لتحديث الرابط
    const updateQuery = useCallback(
        (key: string, value: string | null | number, isMultiSelect = false) => {
            const params = new URLSearchParams(searchParams.toString());

            if (value === null) {
                params.delete(key);
            } else if (isMultiSelect) {
                const currentValues = params.get(key)?.split(',') || [];
                const strValue = String(value);
                const newValues = currentValues.includes(strValue)
                    ? currentValues.filter(v => v !== strValue)
                    : [...currentValues, strValue];
                
                if (newValues.length > 0) {
                    params.set(key, newValues.join(','));
                } else {
                    params.delete(key);
                }
            } else {
                params.set(key, String(value));
            }
            
            router.push(pathname + '?' + params.toString(), { scroll: false });
        },
        [searchParams, pathname, router]
    );
    
    const activeFiltersCount = Array.from(searchParams.keys()).length;

    return (
        <aside className="w-full lg:w-72 space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">الفلاتر</h3>
                {activeFiltersCount > 0 && (
                     <Button variant="ghost" size="sm" onClick={() => router.push(pathname, { scroll: false })} className="text-red-500">
                        <X className="w-4 h-4 ml-1" />
                        مسح الكل ({activeFiltersCount})
                    </Button>
                )}
            </div>
            
            <Accordion type="multiple" defaultValue={['price', 'brands', 'rating']} className="w-full">
                {/* 1. فلتر السعر */}
                <AccordionItem value="price">
                    <AccordionTrigger>السعر</AccordionTrigger>
                    <AccordionContent className="p-4 pt-6 space-y-4">
                        <Slider
                            value={priceRange}
                            max={5000}
                            step={50}
                            onValueChange={(value) => setPriceRange(value as [number, number])}
                            onValueCommit={(value) => {
                                updateQuery('price_min', value[0]);
                                updateQuery('price_max', value[1]);
                            }}
                        />
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>{priceRange[0]} ر.س</span>
                            <span>{priceRange[1]} ر.س</span>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                
                {/* 2. فلتر الماركات */}
                <AccordionItem value="brands">
                    <AccordionTrigger>الماركة</AccordionTrigger>
                    <AccordionContent className="space-y-3 p-4">
                        {filterOptions.brands.map(brand => (
                            <div key={brand} className="flex items-center gap-2">
                                <Checkbox 
                                    id={`brand-${brand}`} 
                                    checked={searchParams.get('brands')?.includes(brand)}
                                    onCheckedChange={() => updateQuery('brands', brand, true)}
                                />
                                <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">{brand}</label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                {/* 3. فلتر التقييم */}
                <AccordionItem value="rating">
                    <AccordionTrigger>التقييم</AccordionTrigger>
                    <AccordionContent className="p-4">
                        <RatingFilter 
                            selectedRating={Number(searchParams.get('rating')) || null}
                            onSelect={(rating) => {
                                const currentRating = searchParams.get('rating');
                                updateQuery('rating', String(rating) === currentRating ? null : rating);
                            }}
                        />
                    </AccordionContent>
                </AccordionItem>

                {/* 4. فلتر اللون */}
                <AccordionItem value="colors">
                    <AccordionTrigger>اللون</AccordionTrigger>
                    <AccordionContent className="p-4 flex flex-wrap gap-3">
                         {filterOptions.colors.map(color => (
                            <Button 
                                key={color}
                                variant={searchParams.get('color') === color ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => updateQuery('color', searchParams.get('color') === color ? null : color)}
                            >
                                {color}
                            </Button>
                        ))}
                    </AccordionContent>
                </AccordionItem>

                 
                
            </Accordion>
        </aside>
    );
}