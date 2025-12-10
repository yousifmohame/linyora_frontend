'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Section } from '@/types/section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Edit, 
  Plus, 
  Trash2, 
  LayoutTemplate, 
  Search,
  Filter,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import SectionForm from './SectionForm';
import { useTranslation } from 'react-i18next';
import AdminNav from '@/components/dashboards/AdminNav';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

export default function SectionsManagementPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft'>('all');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/sections/admin/all');
      setSections(res.data);
      setFilteredSections(res.data);
    } catch (error) {
      console.error('Failed to fetch sections:', error);
      toast.error(t('SectionsManagement.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
    let results = sections;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(section => 
        section.title_en.toLowerCase().includes(query) ||
        section.title_ar.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(section => 
        statusFilter === 'active' ? section.is_active : !section.is_active
      );
    }
    
    setFilteredSections(results);
  }, [searchQuery, statusFilter, sections]);

  const handleDelete = async (id: number) => {
    if (!confirm(t('SectionsManagement.confirm.delete'))) return;
    
    try {
      setDeleteLoading(id);
      await api.delete(`/admin/sections/${id}`);
      toast.success(t('SectionsManagement.toast.deleteSuccess'));
      fetchSections();
    } catch (error) {
      toast.error(t('SectionsManagement.toast.deleteError'));
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleSectionStatus = async (section: Section) => {
    try {
      await api.patch(`/admin/sections/${section.id}`, {
        is_active: !section.is_active
      });
      toast.success(t('SectionsManagement.toast.statusUpdateSuccess', { 
        action: !section.is_active ? t('common.activated') : t('common.deactivated') 
      }));
      fetchSections();
    } catch (error) {
      toast.error(t('SectionsManagement.toast.statusUpdateError'));
    }
  };

  const openCreateDialog = () => {
    setEditingSection(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (section: Section) => {
    setEditingSection(section);
    setIsDialogOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <AdminNav />
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {t('SectionsManagement.title')}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              {t('SectionsManagement.subtitle')}
            </p>
          </div>
          <Button 
            onClick={openCreateDialog} 
            className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 w-full lg:w-auto"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('SectionsManagement.actions.addSection')}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-l-4 border-l-blue-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('SectionsManagement.stats.total')}</p>
                  <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
                </div>
                <LayoutTemplate className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-l-4 border-l-green-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('SectionsManagement.stats.active')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sections.filter(s => s.is_active).length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-l-4 border-l-gray-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('SectionsManagement.stats.draft')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sections.filter(s => !s.is_active).length}
                  </p>
                </div>
                <EyeOff className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-l-4 border-l-purple-500 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{t('SectionsManagement.stats.withSlides')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {sections.filter(s => s.slides && s.slides.length > 0).length}
                  </p>
                </div>
                <LayoutTemplate className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={t('SectionsManagement.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <Button
                    variant={statusFilter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter('all')}
                    className={`text-xs ${statusFilter === 'all' ? 'bg-white shadow-sm' : ''}`}
                  >
                    {t('common.all')}
                  </Button>
                  <Button
                    variant={statusFilter === 'active' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter('active')}
                    className={`text-xs ${statusFilter === 'active' ? 'bg-white shadow-sm' : ''}`}
                  >
                    {t('SectionsManagement.status.active')}
                  </Button>
                  <Button
                    variant={statusFilter === 'draft' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter('draft')}
                    className={`text-xs ${statusFilter === 'draft' ? 'bg-white shadow-sm' : ''}`}
                  >
                    {t('SectionsManagement.status.draft')}
                  </Button>
                </div>
                
                {(searchQuery || statusFilter !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {t('SectionsManagement.actions.clearFilters')}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <LayoutTemplate className="w-5 h-5 text-orange-500" />
              {t('SectionsManagement.manageTitle')}
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700">
                {filteredSections.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">{t('SectionsManagement.table.title')}</TableHead>
                    <TableHead className="font-semibold text-gray-700">{t('SectionsManagement.table.categories')}</TableHead>
                    <TableHead className="font-semibold text-gray-700">{t('SectionsManagement.table.slides')}</TableHead>
                    <TableHead className="font-semibold text-gray-700">{t('SectionsManagement.table.status')}</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">{t('SectionsManagement.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                          <p className="text-gray-500">{t('SectionsManagement.loading')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredSections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                          <LayoutTemplate className="w-12 h-12 text-gray-300" />
                          <div className="text-center">
                            <p className="font-medium">{t('SectionsManagement.empty.title')}</p>
                            <p className="text-sm mt-1">
                              {searchQuery || statusFilter !== 'all' 
                                ? t('SectionsManagement.empty.adjustFilters')
                                : t('SectionsManagement.empty.noSections')
                              }
                            </p>
                          </div>
                          {(searchQuery || statusFilter !== 'all') ? (
                            <Button variant="outline" onClick={clearFilters}>
                              {t('SectionsManagement.actions.clearFilters')}
                            </Button>
                          ) : (
                            <Button onClick={openCreateDialog}>
                              <Plus className="w-4 h-4 mr-2" />
                              {t('SectionsManagement.actions.createSection')}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSections.map((section) => (
                      <TableRow key={section.id} className="group hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium">
                          <div className="flex flex-col space-y-1">
                            <span className="font-semibold text-gray-900">{section.title_en}</span>
                            <span className="text-xs text-gray-500 font-normal">{section.title_ar}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-700">{section.category_ids?.length || 0}</span>
                            <span className="text-xs text-gray-500">{t('SectionsManagement.table.categoriesCount')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-700">{section.slides?.length || 0}</span>
                            <span className="text-xs text-gray-500">{t('SectionsManagement.table.slidesCount')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={section.is_active ? 'default' : 'secondary'} 
                            className={`px-2 py-1 text-xs font-medium ${
                              section.is_active 
                                ? 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            {section.is_active ? (
                              <Eye className="w-3 h-3 mr-1" />
                            ) : (
                              <EyeOff className="w-3 h-3 mr-1" />
                            )}
                            {section.is_active ? t('SectionsManagement.status.active') : t('SectionsManagement.status.draft')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end items-center space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(section)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                              title={t('SectionsManagement.actions.edit')}
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(section.id)}
                              disabled={deleteLoading === section.id}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
                              title={t('SectionsManagement.actions.delete')}
                            >
                              {deleteLoading === section.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[80vw] max-w-[80vw] sm:max-w-[80vw] h-[95vh] max-h-[95vh] p-0 flex flex-col">
            <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <DialogTitle className="text-xl font-semibold">
                {editingSection ? t('SectionsManagement.dialog.editTitle') : t('SectionsManagement.dialog.createTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <SectionForm 
                initialData={editingSection} 
                onSuccess={() => { 
                  setIsDialogOpen(false); 
                  fetchSections(); 
                  toast.success(
                    editingSection 
                      ? t('SectionsManagement.toast.updateSuccess') 
                      : t('SectionsManagement.toast.createSuccess')
                  );
                }}
                onCancel={() => setIsDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}