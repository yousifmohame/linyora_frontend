'use client';

import { useState, useEffect, useRef } from 'react';
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  ImagePlus,
  Type,
  Video,
  Loader2,
  Sparkles,
  Target,
  PlusCircle,
  Palette,
} from 'lucide-react';

import { createStory } from '@/lib/api/stories';
import { useAuth } from '@/context/AuthContext';
import axios from '@/lib/axios';
import { useTranslation } from 'react-i18next';

const storySchema = z.object({
  type: z.enum(['image', 'video', 'text']),
  text_content: z.string().optional(),
  background_color: z.string().default('#000000'),
  product_id: z.string().optional(),
  section_id: z.string().optional(),
});

interface Section {
  id: number;
  title: string;
}

export default function CreateStoryModal() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('image');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(storySchema),
    defaultValues: {
      type: 'image',
      background_color: '#000000',
      text_content: '',
      product_id: '',
      section_id: '',
    },
  });

  useEffect(() => {
    if (isOpen && user?.role_id === 1) {
      const fetchSections = async () => {
        setLoadingSections(true);
        try {
          const { data } = await axios.get('/stories/sections');
          setSections(data);
        } catch (error) {
          console.error('Failed to fetch sections', error);
        } finally {
          setLoadingSections(false);
        }
      };
      fetchSections();
    }
  }, [isOpen, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const onSubmit = async (data: any) => {
    if ((data.type === 'image' || data.type === 'video') && !file) {
      toast.error(t('CreateStoryModal.validation.fileRequired'));
      return;
    }
    if (data.type === 'text' && !data.text_content?.trim()) {
      toast.error(t('CreateStoryModal.validation.textContentRequired'));
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('type', data.type);
    if (file) formData.append('media', file);
    if (data.text_content) formData.append('text_content', data.text_content);
    formData.append('background_color', data.background_color);
    if (data.product_id) formData.append('product_id', data.product_id);
    if (data.section_id && data.section_id !== 'personal') {
      formData.append('section_id', data.section_id);
    }

    try {
      await createStory(formData);
      toast.success(t('CreateStoryModal.toast.createSuccess'));
      setIsOpen(false);
      reset();
      setFile(null);
      setFilePreview(null);
      setActiveTab('image');
      setValue('type', 'image');
    } catch (error) {
      toast.error(t('CreateStoryModal.toast.createError'));
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorOptions = [
    { value: '#000000', label: t('CreateStoryModal.colors.black') },
    { value: '#3B82F6', label: t('CreateStoryModal.colors.blue') },
    { value: '#10B981', label: t('CreateStoryModal.colors.green') },
    { value: '#8B5CF6', label: t('CreateStoryModal.colors.purple') },
    { value: '#EF4444', label: t('CreateStoryModal.colors.red') },
    { value: '#F59E0B', label: t('CreateStoryModal.colors.gold') },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-1 sm:gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-500 hover:from-blue-600 hover:to-blue-600 text-white font-bold text-xs sm:text-sm px-3 py-2 sm:px-4 sm:py-2.5 transition-all duration-200 shadow-md sm:shadow-lg">
          <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />{' '}
          <span className="hidden sm:inline">{t('CreateStoryModal.actions.addStory')}</span>
          <span className="sm:hidden">{t('CreateStoryModal.actions.story')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
        <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-xl sm:rounded-t-2xl p-4 sm:p-6 -m-4 sm:-m-6 mb-4 sm:mb-6">
          <DialogTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
            {t('CreateStoryModal.title')}
          </DialogTitle>
          <DialogDescription className="text-rose-100 text-xs sm:text-sm">
            {t('CreateStoryModal.subtitle')}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="image"
          value={activeTab}
          onValueChange={(val) => {
            setActiveTab(val);
            setValue('type', val as any);
            setFile(null);
            setFilePreview(null);
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-rose-50 to-pink-50 p-1 rounded-xl sm:rounded-2xl mb-4">
            <TabsTrigger
              value="image"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm py-1.5"
            >
              <ImagePlus className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />{' '}
              <span className="hidden xs:inline">{t('CreateStoryModal.type.image')}</span>
              <span className="xs:hidden">{t('CreateStoryModal.type.imageShort')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="video"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm py-1.5"
            >
              <Video className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />{' '}
              <span className="hidden xs:inline">{t('CreateStoryModal.type.video')}</span>
              <span className="xs:hidden">{t('CreateStoryModal.type.videoShort')}</span>
            </TabsTrigger>
            <TabsTrigger
              value="text"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm py-1.5"
            >
              <Type className="w-3 h-3 mr-1 sm:w-4 sm:h-4 sm:mr-2" />{' '}
              <span className="hidden xs:inline">{t('CreateStoryModal.type.text')}</span>
              <span className="xs:hidden">{t('CreateStoryModal.type.textShort')}</span>
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 rounded-xl sm:rounded-2xl overflow-hidden">
              <CardContent className="p-3 sm:p-6">
                {(activeTab === 'image' || activeTab === 'video') && (
                  <div
                    className="border-2 border-dashed border-rose-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center cursor-pointer hover:bg-rose-50/50 transition-colors bg-white/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={activeTab === 'image' ? 'image/*' : 'video/*'}
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {filePreview ? (
                      <div className="space-y-3">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-green-600 bg-green-50 py-1 px-2 sm:py-2 sm:px-3 rounded-lg">
                          ✓ {t('CreateStoryModal.file.selected', { filename: file?.name })}
                        </p>
                      </div>
                    ) : file ? (
                      <p className="text-xs sm:text-sm font-medium text-rose-600 bg-rose-50 py-1 px-2 sm:py-2 sm:px-3 rounded-lg">
                        {t('CreateStoryModal.file.selectedShort', { filename: file.name })}
                      </p>
                    ) : (
                      <div className="flex flex-col items-center text-rose-500">
                        <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl sm:rounded-2xl mb-2">
                          <ImagePlus size={32} className="text-rose-500" />
                        </div>
                        <p className="font-semibold text-rose-700 text-xs sm:text-sm">
                          {t('CreateStoryModal.file.clickToUpload', { type: activeTab === 'image' ? t('CreateStoryModal.type.image') : t('CreateStoryModal.type.video') })}
                        </p>
                        <p className="text-[10px] sm:text-xs text-rose-400 mt-1">
                          {t('CreateStoryModal.file.formats')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2 sm:space-y-3 mt-4">
                  <label className="text-xs sm:text-sm font-medium text-rose-800 flex items-center gap-1.5">
                    <Type className="w-3 h-3 sm:w-4 sm:h-4" />
                    {t('CreateStoryModal.labels.textContent')}
                  </label>
                  <Textarea
                    placeholder={t('CreateStoryModal.placeholders.textContent')}
                    {...register('text_content')}
                    className="border-rose-200 focus:border-rose-400 rounded-lg sm:rounded-xl min-h-[60px] sm:min-h-[80px] text-xs sm:text-sm bg-white/50"
                  />
                </div>

                {activeTab === 'text' && (
                  <div className="space-y-3 mt-4">
                    <label className="text-xs sm:text-sm font-medium text-rose-800 flex items-center gap-1.5">
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4" />
                      {t('CreateStoryModal.labels.backgroundColor')}
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
                      {colorOptions.map((color) => (
                        <button
                          type="button"
                          key={color.value}
                          className={`relative w-full aspect-square rounded-lg sm:rounded-xl border transition-transform duration-200 hover:scale-105 ${
                            watch('background_color') === color.value
                              ? 'border-white ring-2 ring-rose-300 shadow'
                              : 'border-blue-200'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setValue('background_color', color.value)}
                          title={color.label}
                        >
                          {watch('background_color') === color.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div
                        className="w-4 h-4 rounded-md border border-rose-200"
                        style={{ backgroundColor: watch('background_color') }}
                      />
                      <span className="text-xs sm:text-sm text-rose-600">
                        {colorOptions.find((c) => c.value === watch('background_color'))?.label || t('CreateStoryModal.colors.custom')}
                      </span>
                    </div>
                  </div>
                )}

                {user?.role_id === 1 && (
                  <div className="space-y-3 mt-4 pt-4 border-t border-rose-200">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" />
                      <label className="text-xs sm:text-sm font-semibold text-rose-800 uppercase tracking-wide">
                        {t('CreateStoryModal.admin.title')}
                      </label>
                    </div>

                    <Select onValueChange={(val) => setValue('section_id', val)}>
                      <SelectTrigger className="bg-white border-rose-200 focus:border-rose-400 rounded-lg sm:rounded-xl text-xs sm:text-sm">
                        <SelectValue placeholder={t('CreateStoryModal.admin.sectionPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-rose-200 rounded-lg sm:rounded-xl max-h-48">
                        <SelectItem
                          value="personal"
                          className="text-rose-800 hover:bg-blue-50 text-xs sm:text-sm"
                        >
                          {t('CreateStoryModal.admin.personalStory')}
                        </SelectItem>
                        {loadingSections ? (
                          <div className="flex items-center justify-center p-3">
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                            <span className="mr-1.5 text-xs sm:text-sm text-rose-600">
                              {t('common.loading')}
                            </span>
                          </div>
                        ) : sections.length > 0 ? (
                          sections.map((sec) => (
                            <SelectItem
                              key={sec.id}
                              value={String(sec.id)}
                              className="text-rose-800 hover:bg-blue-50 text-xs sm:text-sm"
                            >
                              {sec.title}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-center text-[10px] sm:text-xs text-rose-400">
                            {t('CreateStoryModal.admin.noSections')}
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] sm:text-xs text-rose-500 bg-rose-50 p-1.5 sm:p-2 rounded-lg">
                      {t('CreateStoryModal.admin.helpText')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm sm:text-base py-2.5 sm:py-3 transition-all duration-200 shadow-md sm:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t('CreateStoryModal.actions.publishing')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-4 w-4" /> {t('CreateStoryModal.actions.publishNow')}
                </>
              )}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}