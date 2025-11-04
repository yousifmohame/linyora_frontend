'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { ReelData } from '@/components/reels/ReelVerticalViewer';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Video, Eye, Heart, Play, Clock, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { EditReelForm } from './EditReelForm';
import ModelNav from '@/components/dashboards/ModelNav';

type ModelReel = ReelData & {
  caption: string;
  is_active: boolean;
  agreement_id?: number;
  tagged_products?: any[];
  created_at?: string;
};

export default function ModelReelsPage() {
  const { t, i18n } = useTranslation();
  const [reels, setReels] = useState<ModelReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [reelToDelete, setReelToDelete] = useState<number | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentReel, setCurrentReel] = useState<ModelReel | null>(null);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reels/my-reels');
      setReels(res.data);
    } catch (error) {
      toast.error(t('ModelReelsPage.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleDeleteClick = (id: number) => {
    setReelToDelete(id);
    setIsAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!reelToDelete) return;
    try {
      await api.delete(`/reels/${reelToDelete}`);
      setReels(reels.filter((reel) => reel.id !== reelToDelete));
      toast.success(t('ModelReelsPage.toast.deleteSuccess'));
    } catch (error) {
      toast.error(t('ModelReelsPage.toast.deleteError'));
    } finally {
      setIsAlertOpen(false);
      setReelToDelete(null);
    }
  };

  const handleEditClick = (reel: ModelReel) => {
    setCurrentReel(reel);
    setIsEditOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.na');
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeReelsCount = reels.filter(reel => reel.is_active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

      <ModelNav />

      {/* Header Section */}
      <header className="mb-8 text-center relative">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('ModelReelsPage.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('ModelReelsPage.subtitle')}
        </p>
      </header>

      {/* Stats and Action Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <Badge variant="secondary" className="bg-rose-100 text-rose-700 px-4 py-2 text-sm">
          {t('ModelReelsPage.stats.totalReels', { count: reels.length })}
        </Badge>
        <Button asChild className="relative bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg py-6 px-6 rounded-2xl font-bold">
          <Link href="/dashboard/models/reels/upload">
            <PlusCircle className="mr-2 h-5 w-5" />
            {t('ModelReelsPage.actions.uploadNew')}
          </Link>
        </Button>
      </div>

      {/* Main Content Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Video className="h-6 w-6 text-pink-200" />
                {t('ModelReelsPage.manage.title')}
              </CardTitle>
              <CardDescription className="mt-2 text-pink-100">
                {t('ModelReelsPage.manage.subtitle')}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 self-start">
              <Sparkles className="h-3 w-3 mr-1" />
              {t('ModelReelsPage.stats.activeReels', { count: activeReelsCount })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500 mb-4"></div>
              <p className="text-rose-700 text-lg font-medium">{t('ModelReelsPage.loading')}</p>
            </div>
          ) : reels.length === 0 ? (
            <div className="text-center py-16">
              <Video className="h-24 w-24 text-rose-300 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-rose-800 mb-2">{t('ModelReelsPage.empty.title')}</h3>
              <p className="text-rose-600 mb-6 max-w-md mx-auto">
                {t('ModelReelsPage.empty.subtitle')}
              </p>
              <Button asChild className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 rounded-2xl font-bold">
                <Link href="/dashboard/models/reels/upload">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  {t('ModelReelsPage.empty.uploadFirst')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden border border-rose-100 bg-white/50">
              <Table>
                <TableHeader className="bg-rose-50/80">
                  <TableRow className="hover:bg-rose-50/80 border-rose-100">
                    <TableHead className="text-rose-900 font-bold py-4">{t('ModelReelsPage.table.preview')}</TableHead>
                    <TableHead className="text-rose-900 font-bold py-4">{t('ModelReelsPage.table.details')}</TableHead>
                    <TableHead className="text-rose-900 font-bold py-4">{t('ModelReelsPage.table.performance')}</TableHead>
                    <TableHead className="text-rose-900 font-bold py-4">{t('ModelReelsPage.table.status')}</TableHead>
                    <TableHead className="text-rose-900 font-bold py-4">{t('ModelReelsPage.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reels.map((reel) => (
                    <TableRow key={reel.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                      <TableCell className="py-4">
                        <div className="relative group">
                          <Image
                            src={reel.thumbnail_url || '/placeholder.png'}
                            alt={reel.caption || t('ModelReelsPage.reel.thumbnailAlt')}
                            width={80}
                            height={120}
                            className="rounded-xl object-cover border-2 border-rose-200 shadow-sm group-hover:border-rose-300 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-6 w-6 text-white" fill="white" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="max-w-[200px]">
                          <p className="font-medium text-rose-900 truncate">
                            {reel.caption || t('ModelReelsPage.reel.noCaption')}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-sm text-rose-600">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(reel.created_at)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Eye className="h-4 w-4 text-rose-500" />
                            <span className="font-medium text-rose-900">{reel.views_count || 0}</span>
                            <span className="text-rose-600">{t('ModelReelsPage.performance.views')}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="h-4 w-4 text-rose-500" fill={reel.likes_count > 0 ? "#f43f5e" : "none"} />
                            <span className="font-medium text-rose-900">{reel.likes_count || 0}</span>
                            <span className="text-rose-600">{t('ModelReelsPage.performance.likes')}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge 
                          variant={reel.is_active ? 'default' : 'secondary'} 
                          className={`px-3 py-1 rounded-full ${
                            reel.is_active 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {reel.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-rose-100 rounded-xl">
                              <MoreHorizontal className="h-4 w-4 text-rose-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-2xl shadow-lg">
                            <DropdownMenuLabel className="text-rose-900 font-bold">
                              {t('common.actions')}
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleEditClick(reel)}
                              className="text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-rose-500" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                              onClick={() => handleDeleteClick(reel.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                              {t('common.delete')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-lg">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-2xl font-bold text-rose-800">
              {t('ModelReelsPage.confirmDelete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-600 text-lg">
              {t('ModelReelsPage.confirmDelete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 rounded-2xl px-6 py-2">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-2xl px-6 py-2 font-bold"
            >
              {t('ModelReelsPage.confirmDelete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Reel Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="w-[90vw] h-[90vh] max-h-none sm:max-w-none bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-lg overflow-hidden">
          <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Edit className="h-6 w-6" />
              {t('ModelReelsPage.editReel.title')}
            </DialogTitle>
          </DialogHeader>
          {currentReel && (
            <EditReelForm
              reel={currentReel}
              setOpen={setIsEditOpen}
              onUpdateSuccess={() => {
                fetchReels();
                toast.success(t('ModelReelsPage.toast.updateSuccess'));
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}