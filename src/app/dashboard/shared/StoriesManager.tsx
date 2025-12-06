'use client';

import { useEffect, useState } from 'react';
import { Trash2, Eye, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from '@/lib/axios';
import Image from 'next/image';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب القصص
  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/stories/my-stories');
      setStories(data);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast.error("فشل جلب القصص");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  // حذف قصة
  const handleDeleteStory = async (id: number) => {
    try {
      await axios.delete(`/stories/${id}`);
      toast.success('تم حذف القصة');
      setStories(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      toast.error('فشل حذف القصة');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
           <Skeleton className="h-8 w-1/4 mb-2" />
           <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
           <div className="space-y-2">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
           </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-primary" />
                قصصي النشطة (Stories)
            </CardTitle>
            <CardDescription>
                القصص تظهر لمدة 24 ساعة فقط. يمكنك متابعة المشاهدات أو حذف القصة قبل انتهائها.
            </CardDescription>
        </div>
        <CreateStoryModal />
      </CardHeader>
      
      <CardContent>
         <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[80px]">المعاينة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>ترويج لـ</TableHead>
                    <TableHead>المشاهدات</TableHead>
                    <TableHead>تاريخ النشر</TableHead>
                    <TableHead>تنتهي في</TableHead>
                    <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {stories.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={7} className="text-center py-10">
                            <div className="flex flex-col items-center justify-center text-muted-foreground space-y-3">
                                <AlertCircle size={40} />
                                <p>لا توجد قصص نشطة حالياً.</p>
                                <p className="text-sm">شارك لحظاتك أو روج لمنتجاتك الآن!</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    stories.map((story) => (
                        <TableRow key={story.id}>
                            <TableCell>
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative border shadow-sm group cursor-pointer">
                                    {story.type === 'text' ? (
                                        <div className="w-full h-full flex items-center justify-center text-[6px] text-center p-1 bg-black text-white leading-tight">
                                            {story.text_content?.substring(0, 20)}
                                        </div>
                                    ) : (
                                        <Image 
                                            src={story.media_url || '/placeholder-story.jpg'} 
                                            alt="story" 
                                            fill 
                                            className="object-cover transition-transform group-hover:scale-110" 
                                        />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={
                                    story.type === 'video' ? "border-blue-200 bg-blue-50 text-blue-700" : 
                                    story.type === 'text' ? "border-gray-200 bg-gray-50 text-gray-700" : ""
                                }>
                                    {story.type === 'image' && 'صورة'}
                                    {story.type === 'video' && 'فيديو'}
                                    {story.type === 'text' && 'نص'}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {story.product_id ? (
                                    <div className="flex items-center gap-1 text-primary text-sm font-medium">
                                        🛍️ {story.product_name || 'منتج'}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground text-xs">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 font-semibold">
                                    <Eye size={14} className="text-muted-foreground" />
                                    {story.views}
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">
                                {format(new Date(story.created_at), 'h:mm a', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-orange-600 font-medium text-xs">
                                {format(new Date(story.expires_at), 'h:mm a', { locale: ar })}
                            </TableCell>
                            <TableCell className="text-left">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>حذف القصة؟</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                هل أنت متأكد من رغبتك في حذف هذه القصة؟ سيتم إزالتها فوراً من الصفحة الرئيسية ولن يتمكن أحد من مشاهدتها.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteStory(story.id)} className="bg-red-600 hover:bg-red-700">
                                                حذف
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
         </Table>
      </CardContent>
    </Card>
  );
}