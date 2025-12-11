'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/axios';
import { toast } from 'sonner';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Trash2, 
  Edit, 
  UploadCloud, 
  ImageIcon,
  Plus,
  Eye,
  EyeOff,
  Sparkles,
  Palette,
  Link as LinkIcon,
  TextCursor,
  Badge as BadgeIcon,
  Video, // ✨ أيقونة الفيديو
  PlayCircle // ✨ أيقونة التشغيل
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import AdminNav from '@/components/dashboards/AdminNav';
import { useTranslation } from 'react-i18next';

type PromotionFormValues = {
  title: string;
  subtitle?: string;
  link_url: string;
  button_text: string;
  badge_text?: string;
  is_active: boolean;
  image?: File;
};

interface Promotion extends Omit<PromotionFormValues, 'image'> {
  id: number;
  image_url: string;
  media_type: 'image' | 'video'; // ✨ حقل جديد لتحديد النوع (اختياري إذا كان الباك إند يكتشفه)
  created_at?: string;
  updated_at?: string;
}

// ✨ دالة مساعدة للتحقق مما إذا كان الرابط فيديو
const isVideoUrl = (url: string) => {
  return url?.match(/\.(mp4|webm|ogg)$/i);
};

export default function ManageMainBannersPage() {
  const { t, i18n } = useTranslation();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaPreview, setMediaPreview] = useState<{ url: string, type: 'image' | 'video' } | null>(null); // ✨ تحديث نوع المعاينة
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<PromotionFormValues>({
    defaultValues: {
      title: '',
      subtitle: '',
      link_url: '/products',
      button_text: 'Shop Now',
      badge_text: 'Featured',
      is_active: true,
    },
  });

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/main-banners');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error(t('AdminBanners.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, [i18n.language]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // ✨ التحقق من النوع (صور + فيديو)
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        toast.error(t('AdminBanners.validation.fileType', { defaultValue: 'Only images and videos are allowed' }));
        return;
      }

      // ✨ التحقق من الحجم (مثلاً 20MB للفيديو، 5MB للصور)
      const maxSize = isVideo ? 20 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) { 
        toast.error(t('AdminBanners.validation.fileSize', { defaultValue: 'File is too large' }));
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setMediaPreview({ url: previewUrl, type: isVideo ? 'video' : 'image' }); // ✨ تعيين نوع المعاينة
      form.setValue('image', file);
    }
  };

  const onSubmit = async (values: PromotionFormValues) => {
    try {
      const formData = new FormData();
      
      Object.entries(values).forEach(([key, value]) => {
        if (key !== 'image' && value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      
      if (values.image instanceof File) {
        formData.append('image', values.image);
      } else if (editingPromotion) {
        // Keep existing
      } else {
        toast.error(t('AdminBanners.validation.imageRequired'));
        return;
      }

      const url = editingPromotion 
        ? `/admin/main-banners/${editingPromotion.id}` 
        : '/admin/main-banners';
      const method = editingPromotion ? 'put' : 'post';

      const promise = api[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.promise(promise, {
        loading: t('common.saving'),
        success: () => {
          fetchPromotions();
          resetForm();
          return editingPromotion 
            ? t('AdminBanners.toasts.updateSuccess') 
            : t('AdminBanners.toasts.saveSuccess');
        },
        error: (err) => {
            const message = err.response?.data?.message || t('AdminBanners.toasts.saveError');
            return message;
        }
      });
    } catch (error) {
      console.error('Unexpected error in onSubmit:', error);
      toast.error(t('AdminBanners.toasts.saveError'));
    }
  };

  const handleDelete = (promotion: Promotion) => {
    setPromotionToDelete(promotion);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!promotionToDelete) return;
    
    try {
      const promise = api.delete(`/admin/main-banners/${promotionToDelete.id}`);
      
      toast.promise(promise, {
        loading: t('common.saving'),
        success: () => {
          fetchPromotions();
          setDeleteDialogOpen(false);
          setPromotionToDelete(null);
          return t('AdminBanners.toasts.deleteSuccess');
        },
        error: t('AdminBanners.toasts.deleteError'),
      });
    } catch (error) {
      toast.error(t('AdminBanners.toasts.deleteError'));
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    form.reset({
      title: promotion.title,
      subtitle: promotion.subtitle || '',
      link_url: promotion.link_url,
      button_text: promotion.button_text,
      badge_text: promotion.badge_text || '',
      is_active: Boolean(promotion.is_active),
    });
    
    // ✨ تحديد نوع الوسائط للمعاينة عند التعديل
    const isVideo = isVideoUrl(promotion.image_url);
    setMediaPreview({ 
        url: promotion.image_url, 
        type: isVideo ? 'video' : 'image' 
    });
    
    document.getElementById('banner-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingPromotion(null);
    form.reset();
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateString?: string) => {
    if(!dateString) return '—';
    return new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 p-4 md:p-8 space-y-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <AdminNav />
      
      <div className="relative text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-2xl shadow-lg">
                {/* ✨ تغيير الأيقونة لتدل على الوسائط المتعددة */}
                <Sparkles className="h-8 w-8 text-rose-500" />
            </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
            {t('AdminBanners.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
            {t('AdminBanners.subtitle')}
        </p>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <Card id="banner-form" className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              {editingPromotion ? (
                <>
                  <Edit className="w-6 h-6" />
                  <CardTitle className="text-2xl">{t('AdminBanners.form.editTitle')}</CardTitle>
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  <CardTitle className="text-2xl">{t('AdminBanners.form.addTitle')}</CardTitle>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    {/* All Text Fields (Same as before) */}
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-rose-800 font-semibold"><TextCursor className="w-4 h-4" />{t('AdminBanners.fields.title')}</FormLabel>
                        <FormControl><Input {...field} placeholder={t('AdminBanners.placeholders.title')} className="border-rose-200 focus:border-rose-400 rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="subtitle" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-rose-800 font-semibold">{t('AdminBanners.fields.subtitle')}</FormLabel>
                        <FormControl><Textarea {...field} placeholder={t('AdminBanners.placeholders.subtitle')} className="border-rose-200 focus:border-rose-400 rounded-xl min-h-[80px]" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="badge_text" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-rose-800 font-semibold"><BadgeIcon className="w-4 h-4" />{t('AdminBanners.fields.badgeText')}</FormLabel>
                        <FormControl><Input {...field} placeholder={t('AdminBanners.placeholders.badgeText')} className="border-rose-200 focus:border-rose-400 rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="button_text" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-rose-800 font-semibold">{t('AdminBanners.fields.buttonText')}</FormLabel>
                        <FormControl><Input {...field} placeholder={t('AdminBanners.placeholders.buttonText')} className="border-rose-200 focus:border-rose-400 rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                    <FormField control={form.control} name="link_url" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2 text-rose-800 font-semibold"><LinkIcon className="w-4 h-4" />{t('AdminBanners.fields.linkUrl')}</FormLabel>
                        <FormControl><Input {...field} placeholder={t('AdminBanners.placeholders.linkUrl')} className="border-rose-200 focus:border-rose-400 rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    
                  </div>

                  <div className="space-y-6">
                    {/* Media Upload (Images & Videos) */}
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-rose-800 font-semibold">
                        <ImageIcon className="w-4 h-4" />
                        {/* ✨ تغيير النص ليشمل الفيديو */}
                        {t('AdminBanners.fields.media', { defaultValue: 'Media (Image/Video)' })}
                      </FormLabel>
                      {/* ✨ السماح بملفات الفيديو */}
                      <FormControl><Input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" ref={fileInputRef} /></FormControl>
                      <div 
                        className="w-full h-80 border-2 border-dashed border-rose-300 rounded-2xl flex flex-col justify-center items-center cursor-pointer bg-rose-50/50 hover:bg-rose-100/50 transition-all duration-300 group relative"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {mediaPreview ? (
                          <div className="relative w-full h-full rounded-2xl overflow-hidden bg-black/5">
                            {/* ✨ عرض مشغل الفيديو إذا كان النوع فيديو */}
                            {mediaPreview.type === 'video' ? (
                                <video 
                                    src={mediaPreview.url} 
                                    className="w-full h-full object-contain" 
                                    controls 
                                    autoPlay 
                                    muted 
                                    loop 
                                />
                            ) : (
                                <Image src={mediaPreview.url} alt="Preview" fill className="object-cover" />
                            )}
                            
                            {/* زر تغيير الميديا */}
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white/90 p-2 rounded-full">
                                    <UploadCloud className="w-6 h-6 text-rose-600" />
                                </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-rose-600 p-6">
                            <div className="flex justify-center gap-2 mb-4">
                                <ImageIcon className="h-12 w-12 text-rose-400" />
                                <Video className="h-12 w-12 text-rose-400 opacity-50" />
                            </div>
                            <p className="font-semibold mb-2">{t('common.uploading')}</p>
                            <p className="text-sm text-rose-500">Images (PNG, JPG) or Videos (MP4, WebM)</p>
                          </div>
                        )}
                      </div>
                    </FormItem>
                      <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-rose-200 p-4 bg-rose-50/50">
                            <FormLabel className="flex items-center gap-2 text-rose-800 font-semibold">
                                {field.value ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                                {t('AdminBanners.fields.isActive')}
                            </FormLabel>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-rose-500" /></FormControl>
                        </FormItem>
                    )} />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-6 border-t border-rose-200">
                  <Button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl px-8 font-bold">
                    {editingPromotion ? t('AdminBanners.form.updateButton') : t('AdminBanners.form.saveButton')}
                  </Button>
                  {editingPromotion && (
                    <Button type="button" variant="outline" onClick={resetForm} className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl">
                      {t('AdminBanners.form.cancelEdit')}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader><CardTitle>{t('AdminBanners.list.title')}</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                  <TableHead className="text-rose-800 font-bold">{t('AdminBanners.list.image')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminBanners.list.title')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminBanners.list.status')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminBanners.list.dateAdded')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-left">{t('AdminBanners.list.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">{t('AdminBanners.list.loading')}</TableCell></TableRow>
                ) : promotions.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12">{t('AdminBanners.list.empty')}</TableCell></TableRow>
                ) : (
                  promotions.map((promo) => {
                    // ✨ تحديد النوع للعرض في القائمة
                    const isVideo = isVideoUrl(promo.image_url);
                    
                    return (
                    <TableRow key={promo.id} className="border-rose-100">
                      <TableCell>
                        <div className="relative w-24 h-14 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center group">
                          {/* ✨ عرض مصغر للفيديو أو الصورة */}
                          {isVideo ? (
                            <>
                                <video src={promo.image_url} className="w-full h-full object-cover" muted />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <PlayCircle className="w-6 h-6 text-white opacity-80" />
                                </div>
                            </>
                          ) : (
                            <Image src={promo.image_url} alt={promo.title} fill className="object-cover" />
                          )}
                        </div>
                      </TableCell>
                        <TableCell className="font-semibold text-gray-700">{promo.title}</TableCell>
                      <TableCell>
                        <Badge variant={promo.is_active ? "default" : "outline"} className={promo.is_active ? "bg-green-100 text-green-700" : ""}>
                          {promo.is_active ? t('AdminBanners.status.active') : t('AdminBanners.status.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(promo.created_at)}</TableCell>
                      <TableCell className="text-left">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(promo)} className="text-rose-600"><Edit className="w-4 h-4" /></Button>
                          <Button variant="destructive" size="icon" onClick={() => handleDelete(promo)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )})
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('AdminBanners.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('AdminBanners.deleteDialog.description', { title: promotionToDelete?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('AdminBanners.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('AdminBanners.deleteDialog.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}