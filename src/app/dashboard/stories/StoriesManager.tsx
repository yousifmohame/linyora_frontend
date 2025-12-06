'use client';

import { useEffect, useState } from 'react';
import {
  Trash2,
  Eye,
  Clock,
  AlertCircle,
  ImageIcon,
  Video,
  Type,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import Image from 'next/image';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

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
} from '@/components/ui/alert-dialog';
import CreateStoryModal from './CreateStoryModal';

interface Story {
  id: number;
  type: 'image' | 'video' | 'text';
  media_url: string | null;
  text_content: string | null;
  views: number;
  created_at: string;
  expires_at: string;
  product_id?: number;
  product_name?: string;
}

export default function StoriesManager() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const locale = isRTL ? require('date-fns/locale/ar').default : undefined;

  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/stories/my-stories');
      setStories(data);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error(t('StoriesManager.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDeleteStory = async (id: number) => {
    try {
      setDeleteLoading(id);
      await axios.delete(`/stories/${id}`);
      toast.success(t('StoriesManager.toast.deleteSuccess'));
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      toast.error(t('StoriesManager.toast.deleteError'));
    } finally {
      setDeleteLoading(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'text':
        return <Type className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeMap = {
      image: { label: t('StoriesManager.type.image'), className: 'bg-blue-100 text-blue-800' },
      video: { label: t('StoriesManager.type.video'), className: 'bg-purple-100 text-purple-800' },
      text: { label: t('StoriesManager.type.text'), className: 'bg-green-100 text-green-800' },
    };
    const { label, className } =
      typeMap[type as keyof typeof typeMap] || {
        label: type,
        className: 'bg-gray-100 text-gray-800',
      };
    return (
      <Badge
        className={`${className} rounded-xl px-2 py-1 font-medium flex items-center gap-1 text-xs sm:text-sm`}
      >
        {getTypeIcon(type)} {label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            {t('StoriesManager.activeStories')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3 sm:space-x-4">
                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-1/4 sm:h-4" />
                  <Skeleton className="h-3 w-1/2 sm:h-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            {t('StoriesManager.title')}
          </CardTitle>
          <CreateStoryModal />
        </div>
        <p className="text-rose-100 text-xs sm:text-sm mt-2">
          {t('StoriesManager.description')}
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {stories.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center justify-center text-rose-600">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50" />
              <h3 className="text-base sm:text-xl font-semibold text-rose-800">
                {t('StoriesManager.empty.title')}
              </h3>
              <p className="text-xs sm:text-sm text-rose-600 mt-1 sm:mt-2">
                {t('StoriesManager.empty.subtitle')}
              </p>
            </div>
          </div>
        ) : isMobile ? (
          <div className="p-3 sm:p-4 space-y-3">
            {stories.map((story) => (
              <div
                key={story.id}
                className="border border-rose-200 rounded-xl p-3 bg-blue-50/30"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 overflow-hidden relative border border-rose-200">
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
                    {getTypeBadge(story.type)}
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
                          {deleteLoading === story.id && (
                            <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin ml-1" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl p-4">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-rose-800 text-lg">
                            {t('StoriesManager.delete.confirmTitle')}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-rose-600 text-sm">
                            {t('StoriesManager.delete.confirmMessage')}
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
                            {deleteLoading === story.id ? (
                              <>
                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                {t('StoriesManager.delete.deleting')}
                              </>
                            ) : (
                              t('StoriesManager.delete.delete')
                            )}
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
                <TableRow className="border-blue-100 hover:bg-transparent">
                  <TableHead className={`text-rose-800 font-bold whitespace-nowrap ${isRTL ? 'text-right' : 'text-left'}`}>
                    <ImageIcon className="inline-block ml-1 h-4 w-4" />
                    {t('StoriesManager.table.preview')}
                  </TableHead>
                  <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('StoriesManager.table.type')}
                  </TableHead>
                  <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Eye className="inline-block ml-1 h-4 w-4" />
                    {t('StoriesManager.table.views')}
                  </TableHead>
                  <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                    <Clock className="inline-block ml-1 h-4 w-4" />
                    {t('StoriesManager.table.publishedAt')}
                  </TableHead>
                  <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('StoriesManager.table.expiresAt')}
                  </TableHead>
                  <TableHead className={`text-rose-800 font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('StoriesManager.table.actions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow
                    key={story.id}
                    className="border-rose-100 hover:bg-rose-50/50 transition-colors"
                  >
                    <TableCell className="p-3 sm:p-4">
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
                      {getTypeBadge(story.type)}
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
                      <Badge className="bg-amber-100 text-amber-800 rounded-xl px-2 py-0.5 text-sm">
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
                            {deleteLoading === story.id && (
                              <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin ml-2" />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-rose-800">
                              {t('StoriesManager.delete.confirmTitle')}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-rose-600">
                              {t('StoriesManager.delete.confirmMessage')}
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
                              {deleteLoading === story.id ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                  {t('StoriesManager.delete.deleting')}
                                </>
                              ) : (
                                t('StoriesManager.delete.delete')
                              )}
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
  );
}