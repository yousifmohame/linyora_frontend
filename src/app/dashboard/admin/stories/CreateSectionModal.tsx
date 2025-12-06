'use client';

import { useState, useRef, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  FolderPlus,
  ImagePlus,
  Loader2,
  Sparkles,
  Target,
  X,
  PlusCircle,
} from 'lucide-react';
import axios from '@/lib/axios';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

const sectionSchema = z.object({
  title: z.string().min(2, {
    message: "titleMinLength",
  }).optional(), // We'll handle validation via t()
});

// Override message with translation key placeholder
const sectionSchemaI18n = (t: (key: string) => string) =>
  z.object({
    title: z.string().min(2, t('CreateSectionModal.validation.titleMinLength')),
    description: z.string().optional(),
  });

export default function CreateSectionModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(sectionSchemaI18n(t)),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        toast.error(t('CreateSectionModal.validation.imageOnly'));
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: any) => {
    if (!file) {
      toast.error(t('CreateSectionModal.validation.coverImageRequired'));
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('cover_image', file);

    try {
      await axios.post('/stories/sections', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(t('CreateSectionModal.toast.createSuccess'));
      setIsOpen(false);
      reset();
      setFile(null);
      setFilePreview(null);
      window.dispatchEvent(new Event('sectionCreated'));
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error(t('CreateSectionModal.toast.createError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-xs sm:text-sm py-2 px-2.5 sm:px-4 transition-all duration-200 shadow-md sm:shadow-lg">
          <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          {isMobile ? t('CreateSectionModal.actions.newSectionMobile') : t('CreateSectionModal.actions.newSection')}
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-green-200 rounded-xl sm:rounded-3xl shadow-xl p-0 overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 sm:p-6">
          <DialogTitle className="text-base sm:text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            {t('CreateSectionModal.title')}
          </DialogTitle>
          <DialogDescription className="text-green-100 text-xs sm:text-sm mt-1">
            {t('CreateSectionModal.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 rounded-xl overflow-hidden">
              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-green-800 flex items-center gap-1.5">
                    <FolderPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {t('CreateSectionModal.form.title.label')}
                  </label>
                  <Input
                    placeholder={t('CreateSectionModal.form.title.placeholder')}
                    {...register('title')}
                    className="border-green-200 focus:border-green-400 rounded-lg sm:rounded-xl text-sm bg-white/50 h-10"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-medium text-green-800">
                    {t('CreateSectionModal.form.description.label')}
                  </label>
                  <Textarea
                    placeholder={t('CreateSectionModal.form.description.placeholder')}
                    {...register('description')}
                    className="border-green-200 focus:border-green-400 rounded-lg sm:rounded-xl text-sm bg-white/50 min-h-[70px]"
                  />
                </div>

                {/* Cover Image */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-green-800 flex items-center gap-1.5">
                    <ImagePlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {t('CreateSectionModal.form.coverImage.label')}
                  </label>

                  {filePreview ? (
                    <div className="relative border-2 border-green-300 rounded-xl overflow-hidden">
                      <div className="relative w-full h-40 sm:h-56">
                        <Image
                          src={filePreview}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="p-2.5 bg-gradient-to-r from-green-100 to-emerald-100">
                        <p className="text-xs sm:text-sm font-medium text-green-700">
                          ✓ {t('CreateSectionModal.form.file.selected', { filename: file?.name })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed border-green-300 rounded-xl p-4 text-center cursor-pointer hover:bg-green-50/50 transition-colors bg-white/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="flex flex-col items-center text-green-500">
                        <div className="p-2.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl mb-2">
                          <ImagePlus size={32} className="text-green-500" />
                        </div>
                        <p className="font-medium text-green-700 text-sm">
                          {t('CreateSectionModal.form.file.clickToUpload')}
                        </p>
                        <p className="text-[10px] sm:text-xs text-green-400 mt-1">
                          {t('CreateSectionModal.form.file.formats')}
                        </p>
                        <p className="text-[10px] sm:text-xs text-green-300 mt-1">
                          {t('CreateSectionModal.form.file.displayNote')}
                        </p>
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] sm:text-xs text-green-500 bg-green-50 p-2 rounded-lg">
                    {t('CreateSectionModal.form.file.tip')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-sm sm:text-base py-3 sm:py-4 transition-all duration-200 shadow-md sm:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t('CreateSectionModal.actions.creating')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" /> {t('CreateSectionModal.actions.create')}
                </>
              )}
            </Button>

            <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl text-xs sm:text-sm">
              <div className="flex gap-2">
                <Target className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-blue-700">
                  <p className="font-medium mb-1">{t('CreateSectionModal.info.title')}</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>{t('CreateSectionModal.info.visible')}</li>
                    <li>{t('CreateSectionModal.info.addStories')}</li>
                    <li>{t('CreateSectionModal.info.squareImage')}</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}