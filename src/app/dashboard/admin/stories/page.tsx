'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2, Eye, Calendar, LayoutGrid, Sparkles, Target, Package, Users, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import Image from 'next/image';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';

// Custom Components
import CreateSectionModal from './CreateSectionModal';
import CreateStoryModal from '../../shared/CreateStoryModal';
import AdminNav from '@/components/dashboards/AdminNav';

interface StorySection {
  id: number;
  title: string;
  cover_image: string | null;
  storyCount: number;
  created_at: string;
  is_active: boolean;
}

interface AdminStory {
  id: number;
  type: 'image' | 'video' | 'text';
  media_url: string | null;
  text_content: string | null;
  views: number;
  created_at: string;
  expires_at: string;
  section_title?: string;
}

export default function AdminStoriesPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const locale = isRTL ? require('date-fns/locale/ar').default : undefined;

  const [sections, setSections] = useState<StorySection[]>([]);
  const [activeStories, setActiveStories] = useState<AdminStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<{ type: 'section' | 'story', id: number } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, storiesRes] = await Promise.all([
        axios.get('/admin/my-stories/sections'),
        axios.get('/admin/my-stories')
      ]);

      setSections(sectionsRes.data);
      setActiveStories(storiesRes.data);
    } catch (error) {
      console.error("Error fetching stories data:", error);
      toast.error(t('AdminStories.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteSection = async (id: number) => {
    try {
      setDeleteLoading({ type: 'section', id });
      await axios.delete(`/admin/my-stories/sections/${id}`);
      toast.success(t('AdminStories.toast.sectionDeleted'));
      setSections(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error(t('AdminStories.toast.sectionDeleteError'));
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleDeleteStory = async (id: number) => {
    try {
      setDeleteLoading({ type: 'story', id });
      await axios.delete(`/admin/my-stories/${id}`);
      toast.success(t('AdminStories.toast.storyDeleted'));
      setActiveStories(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error(t('AdminStories.toast.storyDeleteError'));
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStoryTypeBadge = (type: string) => {
    const typeMap = {
      image: { label: t('AdminStories.type.image'), className: 'bg-rose-100 text-rose-800' },
      video: { label: t('AdminStories.type.video'), className: 'bg-purple-100 text-purple-800' },
      text: { label: t('AdminStories.type.text'), className: 'bg-green-100 text-green-800' },
    };
    const { label, className } = typeMap[type as keyof typeof typeMap] || {
      label: type,
      className: 'bg-gray-100 text-gray-800',
    };
    return <Badge className={`${className} rounded-xl px-3 py-1 font-medium text-sm`}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 p-6">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <AdminNav />
        
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-1/3 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 p-6">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      
      <AdminNav />
      
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Sparkles className="h-8 w-8 text-rose-500" />
          </div>
          <Target className="h-6 w-6 text-rose-300" />
          <Users className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('AdminStories.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('AdminStories.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4"></div>
      </header>

      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-rose-100 to-pink-100 rounded-xl">
                    <LayoutGrid className="w-6 h-6 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-rose-800">{t('AdminStories.dashboard.title')}</h2>
                    <p className="text-rose-600 text-sm">
                      {t('AdminStories.dashboard.stats', {
                        sections: sections.length,
                        stories: activeStories.length
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <CreateSectionModal />
                <CreateStoryModal />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Sections */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Package className="h-6 w-6" />
              {t('AdminStories.sections.title')}
            </CardTitle>
            <p className="text-pink-100 mt-2">
              {t('AdminStories.sections.subtitle')}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {sections.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center text-rose-600">
                  <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-rose-800">{t('AdminStories.sections.empty.title')}</h3>
                  <p className="text-rose-600 mt-2">{t('AdminStories.sections.empty.subtitle')}</p>
                </div>
              </div>
            ) : isMobile ? (
              <div className="space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="border border-rose-200 rounded-2xl p-4 bg-gradient-to-br from-rose-50/50 to-pink-50/50">
                    <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                        {section.cover_image ? (
                          <Image 
                            src={section.cover_image} 
                            alt={section.title} 
                            fill 
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                            <LayoutGrid className="w-6 h-6 text-rose-500" />
                          </div>
                        )}
                      </div>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'} space-y-1`}>
                        <h3 className="font-bold text-rose-900">{section.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-rose-600">
                          <Badge className="bg-rose-100 text-rose-800 rounded-lg px-2 py-0.5">
                            {t('AdminStories.sections.storyCount', { count: section.storyCount })}
                          </Badge>
                          <span>•</span>
                          <span>{format(new Date(section.created_at), 'd MMM', { locale })}</span>
                        </div>
                        <div className="pt-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg px-3"
                              >
                                <Trash2 size={16} />
                                {deleteLoading?.type === 'section' && deleteLoading.id === section.id && (
                                  <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-1" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-rose-800">{t('AdminStories.sections.delete.confirmTitle')}</AlertDialogTitle>
                                <AlertDialogDescription className="text-rose-600">
                                  {t('AdminStories.sections.delete.confirmMessage', { title: section.title })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg bg-white border-rose-200 text-rose-700 hover:bg-rose-50">
                                  {t('common.cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSection(section.id)}
                                  className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                >
                                  {t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sections.map((section) => (
                  <Card key={section.id} className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="relative w-full h-40 rounded-xl overflow-hidden border-2 border-white shadow-lg mb-4">
                        {section.cover_image ? (
                          <Image 
                            src={section.cover_image} 
                            alt={section.title} 
                            fill 
                            className="object-cover hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
                            <LayoutGrid className="w-12 h-12 text-rose-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-bold text-xl text-rose-900 text-center">{section.title}</h3>
                        
                        <div className="flex items-center justify-center gap-2 text-sm text-rose-600">
                          <Badge className="bg-rose-100 text-rose-800 rounded-xl px-3 py-1 font-medium">
                            {t('AdminStories.sections.storyCount', { count: section.storyCount })}
                          </Badge>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(section.created_at), 'd MMM', { locale })}
                          </span>
                        </div>
                        
                        <Separator className="bg-rose-200" />
                        
                        <div className="flex justify-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                              >
                                <Trash2 size={18} />
                                {deleteLoading?.type === 'section' && deleteLoading.id === section.id ? (
                                  <>
                                    <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2" />
                                    {t('AdminStories.deleting')}
                                  </>
                                ) : t('AdminStories.sections.delete.delete')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-rose-800">{t('AdminStories.sections.delete.confirmTitle')}</AlertDialogTitle>
                                <AlertDialogDescription className="text-rose-600">
                                  {t('AdminStories.sections.delete.confirmMessage', { title: section.title })}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl bg-white border-rose-200 text-rose-700 hover:bg-rose-50">
                                  {t('common.cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSection(section.id)}
                                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                >
                                  {t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Stories */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Eye className="h-6 w-6" />
              {t('AdminStories.stories.activeTitle')}
            </CardTitle>
            <p className="text-pink-100 mt-2">
              {t('AdminStories.stories.subtitle')}
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {activeStories.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center text-rose-600">
                  <AlertCircle className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-rose-800">{t('AdminStories.stories.empty.title')}</h3>
                  <p className="text-rose-600 mt-2">{t('AdminStories.stories.empty.subtitle')}</p>
                </div>
              </div>
            ) : isMobile ? (
              <div className="p-4 space-y-3">
                {activeStories.map((story) => (
                  <div key={story.id} className="border border-rose-200 rounded-2xl p-3 bg-rose-50/30">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden relative border border-rose-200">
                        {story.type === 'text' ? (
                          <div className="w-full h-full flex items-center justify-center text-[6px] text-center p-1 bg-gradient-to-br from-rose-500 to-pink-500 text-white leading-tight">
                            {story.text_content?.substring(0, 20) || ''}
                          </div>
                        ) : (
                          <Image
                            src={story.media_url || '/placeholder-story.jpg'}
                            alt="story"
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'} space-y-1`}>
                        {getStoryTypeBadge(story.type)}
                        <div className="flex items-center gap-1 text-rose-900 text-sm">
                          <Eye size={14} className="text-rose-600" />
                          {story.views.toLocaleString()}
                        </div>
                        <div className="text-xs text-rose-700">
                          {format(new Date(story.created_at), 'h:mm a', { locale })}
                        </div>
                        <Badge className="bg-amber-100 text-amber-800 rounded-lg text-xs px-2 py-0.5">
                          {format(new Date(story.expires_at), 'h:mm a', { locale })}
                        </Badge>
                      </div>
                      <div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1.5"
                            >
                              <Trash2 size={16} />
                              {deleteLoading?.type === 'story' && deleteLoading.id === story.id && (
                                <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin ml-1" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl p-4">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-rose-800 text-lg">
                                {t('AdminStories.stories.delete.confirmTitle')}
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-rose-600 text-sm">
                                {t('AdminStories.stories.delete.confirmMessage')}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2 pt-2">
                              <AlertDialogCancel className="rounded-lg bg-white border-rose-200 text-rose-700 hover:bg-rose-50 text-sm">
                                {t('common.cancel')}
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStory(story.id)}
                                className="rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm"
                              >
                                {deleteLoading?.type === 'story' && deleteLoading.id === story.id ? (
                                  <>
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                    {t('AdminStories.deleting')}
                                  </>
                                ) : t('common.delete')}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-rose-100 hover:bg-transparent">
                      <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('AdminStories.stories.table.preview')}
                      </TableHead>
                      <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('AdminStories.stories.table.type')}
                      </TableHead>
                      <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('AdminStories.stories.table.section')}
                      </TableHead>
                      <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                        <Eye className="inline-block ml-1 h-4 w-4" />
                        {t('AdminStories.stories.table.views')}
                      </TableHead>
                      <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                        <Clock className="inline-block ml-1 h-4 w-4" />
                        {t('AdminStories.stories.table.publishedAt')}
                      </TableHead>
                      <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('AdminStories.stories.table.expiresAt')}
                      </TableHead>
                      <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('AdminStories.stories.table.actions')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeStories.map((story) => (
                      <TableRow
                        key={story.id}
                        className="border-rose-100 hover:bg-rose-50/50 transition-colors duration-200"
                      >
                        <TableCell className="p-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden relative border border-rose-200 shadow-sm">
                            {story.type === 'text' ? (
                              <div className="w-full h-full flex items-center justify-center text-[6px] text-center p-1 bg-gradient-to-br from-rose-500 to-pink-500 text-white leading-tight">
                                {story.text_content?.substring(0, 20) || ''}
                              </div>
                            ) : (
                              <Image
                                src={story.media_url || '/placeholder-story.jpg'}
                                alt="story"
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          {getStoryTypeBadge(story.type)}
                        </TableCell>
                        <TableCell className={`text-rose-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                          {story.section_title || t('AdminStories.stories.personal')}
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="flex items-center justify-start gap-1 font-semibold text-rose-900">
                            <Eye size={16} className="text-rose-600" />
                            {story.views.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className={`text-rose-700 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                          {format(new Date(story.created_at), 'h:mm a', { locale })}
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <Badge className="bg-amber-100 text-amber-800 rounded-xl px-3 py-1 font-medium text-sm">
                            {format(new Date(story.expires_at), 'h:mm a', { locale })}
                          </Badge>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                              >
                                <Trash2 size={18} />
                                {deleteLoading?.type === 'story' && deleteLoading.id === story.id && (
                                  <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin ml-2" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-rose-800">
                                  {t('AdminStories.stories.delete.confirmTitle')}
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-rose-600">
                                  {t('AdminStories.stories.delete.confirmMessage')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl bg-white border-rose-200 text-rose-700 hover:bg-rose-50">
                                  {t('common.cancel')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteStory(story.id)}
                                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                >
                                  {deleteLoading?.type === 'story' && deleteLoading.id === story.id ? (
                                    <>
                                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                      {t('AdminStories.deleting')}
                                    </>
                                  ) : t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}