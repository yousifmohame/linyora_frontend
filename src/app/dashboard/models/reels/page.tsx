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
    // ✅ Unified background + overflow-hidden
    <div className="min-h-screen bg-gradient-to-br from-rose-50/20 to-purple-50/20 p-3 sm:p-4 overflow-hidden">
      {/* ✅ Smaller, safe blobs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -z-10"></div>

      <ModelNav />

      <header className="mb-6 text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {t('ModelReelsPage.title')}
        </h1>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {t('ModelReelsPage.subtitle')}
        </p>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <Badge variant="secondary" className="bg-rose-100 text-rose-700 px-3 py-1.5 text-xs rounded-lg">
          {t('ModelReelsPage.stats.totalReels', { count: reels.length })}
        </Badge>
        <Button 
          asChild 
          className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white shadow h-9 px-4 rounded-lg text-sm"
        >
          <Link href="/dashboard/models/reels/upload">
            <PlusCircle className="mr-1.5 w-3.5 h-3.5" />
            {t('ModelReelsPage.actions.uploadNew')}
          </Link>
        </Button>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-sm overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Video className="h-4 w-4 text-pink-200" />
                {t('ModelReelsPage.manage.title')}
              </CardTitle>
              <CardDescription className="text-purple-100 text-xs mt-0.5">
                {t('ModelReelsPage.manage.subtitle')}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 text-[10px] px-2 py-0.5 flex items-center gap-1">
              <Sparkles className="h-2.5 w-2.5" />
              {t('ModelReelsPage.stats.activeReels', { count: activeReelsCount })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-2"></div>
              <p className="text-gray-600 text-sm">{t('ModelReelsPage.loading')}</p>
            </div>
          ) : reels.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <h3 className="font-bold text-lg text-gray-900 mb-2">{t('ModelReelsPage.empty.title')}</h3>
              <p className="text-gray-600 mb-4 px-2">{t('ModelReelsPage.empty.subtitle')}</p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-sm"
              >
                <Link href="/dashboard/models/reels/upload">
                  <PlusCircle className="mr-1.5 w-3 h-3" />
                  {t('ModelReelsPage.empty.uploadFirst')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-lg overflow-hidden border border-gray-200/50 bg-gray-50/30">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="hover:bg-gray-50/70 border-gray-200/50">
                    <TableHead className="text-gray-800 font-bold py-3 text-[10px] sm:text-xs">{t('ModelReelsPage.table.preview')}</TableHead>
                    <TableHead className="text-gray-800 font-bold py-3 text-[10px] sm:text-xs">{t('ModelReelsPage.table.details')}</TableHead>
                    <TableHead className="text-gray-800 font-bold py-3 text-[10px] sm:text-xs">{t('ModelReelsPage.table.performance')}</TableHead>
                    <TableHead className="text-gray-800 font-bold py-3 text-[10px] sm:text-xs">{t('ModelReelsPage.table.status')}</TableHead>
                    <TableHead className="text-gray-800 font-bold py-3 text-[10px] sm:text-xs">{t('ModelReelsPage.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reels.map((reel) => (
                    <TableRow key={reel.id} className="border-b border-gray-200/50 hover:bg-gray-50/30">
                      <TableCell className="py-3">
                        <div className="relative group w-16 h-24">
                          <Image
                            src={reel.thumbnail_url || '/placeholder.png'}
                            alt={reel.caption || t('ModelReelsPage.reel.thumbnailAlt')}
                            fill
                            className="rounded-lg object-cover border-2 border-gray-200 group-hover:border-gray-300"
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="max-w-[150px]">
                          <p className="font-medium text-gray-900 text-[10px] sm:text-xs truncate">
                            {reel.caption || t('ModelReelsPage.reel.noCaption')}
                          </p>
                          <div className="flex items-center gap-1 mt-1 text-[9px] text-gray-600">
                            <Clock className="h-2.5 w-2.5" />
                            <span>{formatDate(reel.created_at)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[9px]">
                            <Eye className="h-3 w-3 text-gray-500" />
                            <span className="font-medium text-gray-900">{reel.views_count || 0}</span>
                            <span className="text-gray-600">{t('ModelReelsPage.performance.views')}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[9px]">
                            <Heart className="h-3 w-3 text-gray-500" />
                            <span className="font-medium text-gray-900">{reel.likes_count || 0}</span>
                            <span className="text-gray-600">{t('ModelReelsPage.performance.likes')}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge 
                          variant="outline"
                          className={`text-[9px] px-2 py-0.5 rounded ${
                            reel.is_active 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {reel.is_active ? t('common.active') : t('common.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0 hover:bg-gray-100 rounded">
                              <MoreHorizontal className="h-3 w-3 text-gray-600" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-lg shadow-lg w-40">
                            <DropdownMenuLabel className="text-gray-900 font-bold text-xs">
                              {t('common.actions')}
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleEditClick(reel)}
                              className="text-gray-700 hover:bg-gray-50 rounded text-xs"
                            >
                              <Edit className="mr-2 h-3 w-3 text-gray-500" />
                              {t('common.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600 hover:bg-red-50 rounded text-xs"
                              onClick={() => handleDeleteClick(reel.id)}
                            >
                              <Trash2 className="mr-2 h-3 w-3 text-red-500" />
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

      {/* Delete Alert */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl max-w-[320px] mx-2">
          <AlertDialogHeader className="text-center">
            <AlertDialogTitle className="text-lg font-bold text-gray-900">
              {t('ModelReelsPage.confirmDelete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 text-sm">
              {t('ModelReelsPage.confirmDelete.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 pt-2">
            <AlertDialogCancel className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded text-sm h-8">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded text-sm h-8"
            >
              {t('ModelReelsPage.confirmDelete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl w-[95vw] mx-2 max-h-[90vh] overflow-hidden bg-white/95 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-xl">
          <DialogHeader className="bg-gradient-to-r from-rose-500 to-purple-600 text-white p-4 -m-4 mb-4 rounded-t-xl">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit className="h-4 w-4" />
              {t('ModelReelsPage.editReel.title')}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[70vh] p-1">
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
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}