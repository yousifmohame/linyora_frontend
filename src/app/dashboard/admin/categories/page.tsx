// frontend/src/app/dashboard/admin/categories/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import api, { AxiosError } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';
import { 
  PlusCircle, Edit, Trash2, Folder, ChevronRight, 
  ChevronDown, FolderTree, Layers, UploadCloud
} from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// --- Moved outside component to avoid useCallback dependency issues ---
const flattenCategories = (categories: Category[], level = 0): FlatCategory[] => {
  let flatList: FlatCategory[] = [];
  for (const category of categories) {
    flatList.push({ id: category.id, name: category.name, level });
    if (category.children && category.children.length > 0) {
      flatList = flatList.concat(flattenCategories(category.children, level + 1));
    }
  }
  return flatList;
};

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  children: Category[];
  product_count?: number;
  is_active?: boolean;
  description?: string;
  image_url?: string;
  sort_order?: number;
}

interface FlatCategory {
  id: number;
  name: string;
  level: number;
}

interface CategoryFormProps {
  category?: Category | null;
  categories: FlatCategory[];
  onSave: (formData: FormData) => Promise<void>;
  onClose: () => void;
}

const CategoryForm = ({ category, categories, onSave, onClose }: CategoryFormProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [parentId, setParentId] = useState<string>(category?.parent_id?.toString() || 'null');
  const [sortOrder, setSortOrder] = useState<string>(category?.sort_order?.toString() || '0');
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t('ManageCategories.form.errors.nameRequired'));
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description || '');
    formData.append('parent_id', parentId);
    formData.append('sort_order', sortOrder);
    formData.append('is_active', String(isActive));
    
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (category?.image_url) {
      formData.append('image_url', category.image_url);
    }

    if (category?.id) {
      formData.append('id', category.id.toString());
    }

    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="category-name" className="text-rose-800 font-medium">
              {t('ManageCategories.form.fields.name.label')} *
            </Label>
            <Input 
              id="category-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder={t('ManageCategories.form.fields.name.placeholder')} 
              className="border-rose-200 focus:border-rose-400 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="parent-category" className="text-rose-800 font-medium">
              {t('ManageCategories.form.fields.parent.label')}
            </Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger id="parent-category" className="border-rose-200 focus:border-rose-400 rounded-xl">
                <SelectValue placeholder={t('ManageCategories.form.fields.parent.placeholder')} />
              </SelectTrigger>
              <SelectContent className="border-rose-200 rounded-xl">
                <SelectItem value="null" className="text-rose-700">
                  {t('ManageCategories.form.fields.parent.root')}
                </SelectItem>
                {categories.map(cat => (
                  cat.id !== category?.id && (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="text-rose-800">
                      <span style={{ paddingRight: `${cat.level * 20}px` }}>{cat.name}</span>
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="category-description" className="text-rose-800 font-medium">
              {t('ManageCategories.form.fields.description.label')}
            </Label>
            <textarea 
              id="category-description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={4} 
              className="w-full p-3 border border-rose-200 rounded-xl focus:border-rose-400 resize-none" 
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-rose-800 font-medium">
              {t('ManageCategories.form.fields.image.label')}
            </Label>
            <div 
              className="w-full h-48 border-2 border-dashed border-rose-200 rounded-xl flex flex-col justify-center items-center cursor-pointer bg-rose-50/50 hover:bg-rose-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              {imagePreview ? (
                <Image src={imagePreview} alt="Preview" width={100} height={100} className="object-contain h-full w-full p-2" />
              ) : (
                <div className="text-center text-rose-500">
                  <UploadCloud className="mx-auto h-10 w-10" />
                  <p>{t('ManageCategories.form.fields.image.uploadPrompt')}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="sort-order" className="text-rose-800 font-medium">
                {t('ManageCategories.form.fields.sortOrder.label')}
              </Label>
              <Input 
                id="sort-order" 
                type="number" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                className="border-rose-200 focus:border-rose-400 rounded-xl"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-rose-800 font-medium">
                {t('ManageCategories.form.fields.status.label')}
              </Label>
              <div className="flex items-center gap-2 border border-rose-200 rounded-xl p-3 h-[40px]">
                <input 
                  type="checkbox" 
                  id="is-active" 
                  checked={isActive} 
                  onChange={(e) => setIsActive(e.target.checked)} 
                  className="w-4 h-4 text-rose-500 border-rose-300 rounded focus:ring-rose-400"
                />
                <Label htmlFor="is-active" className="text-rose-700 cursor-pointer">
                  {isActive ? t('common.active') : t('common.inactive')}
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter className="flex gap-3 pt-4 border-t border-rose-200">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose} 
          className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
        >
          {t('common.cancel')}
        </Button>
        <Button 
          type="submit" 
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium"
        >
          {category 
            ? t('ManageCategories.form.actions.update') 
            : t('ManageCategories.form.actions.create')}
        </Button>
      </DialogFooter>
    </form>
  );
};

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onToggle: (categoryId: number) => void;
  expandedCategories: Set<number>;
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ categories, onEdit, onDelete, onToggle, expandedCategories }) => {
  const { t } = useTranslation();
  
  return (
    <div className="space-y-2">
      {categories.map(category => {
        const isExpanded = expandedCategories.has(category.id);
        const hasChildren = category.children && category.children.length > 0;
        
        return (
          <div key={category.id} className="border border-rose-200 rounded-2xl overflow-hidden">
            <div className={`flex items-center justify-between p-4 ${!category.is_active ? 'bg-gray-50' : 'bg-white'}`}>
              <div className="flex items-center gap-3 flex-1">
                {hasChildren && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onToggle(category.id)} 
                    className="w-6 h-6 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                )}
                {!hasChildren && <div className="w-6 h-6" />}
                
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-rose-50">
                  {category.image_url ? (
                    <Image src={category.image_url} alt={category.name} fill className="object-contain"/>
                  ) : (
                    <Folder className="w-6 h-6 text-rose-400 m-auto"/>
                  )}
                </div>
                
                <div className="flex-1">
                  <span className={`font-medium ${!category.is_active ? 'text-gray-500' : 'text-rose-800'}`}>
                    {category.name}
                  </span>
                  {category.product_count !== undefined && category.product_count > 0 && (
                    <Badge className="bg-rose-500 text-white text-xs mr-2">
                      {t('ManageCategories.tree.productsCount', { count: category.product_count })}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onEdit(category)} 
                  className="text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => onDelete(category)} 
                  className="text-red-500 hover:bg-red-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {hasChildren && isExpanded && (
              <div className="border-t border-rose-100 bg-rose-50/30">
                <div className="pr-6 py-3 pl-12">
                  <CategoryTree 
                    categories={category.children} 
                    onEdit={onEdit} 
                    onDelete={onDelete} 
                    onToggle={onToggle} 
                    expandedCategories={expandedCategories} 
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function ManageCategoriesPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<FlatCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/categories');
      setCategories(response.data);
      setFlatCategories(flattenCategories(response.data));
      if (expandedCategories.size === 0) {
        const mainCategories = new Set(response.data.map((cat: Category) => cat.id));
        setExpandedCategories(mainCategories);
      }
    } catch {
      toast.error(t('ManageCategories.toast.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t]); // flattenCategories is now stable (outside component)

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSave = async (formData: FormData) => {
    const isEditing = !!formData.get('id');
    const url = isEditing ? `/categories/${formData.get('id')}` : '/categories';
    const method = isEditing ? 'put' : 'post';

    toast.promise(api[method](url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }), {
      loading: t('ManageCategories.toast.saving'),
      success: () => {
        fetchCategories();
        setIsDialogOpen(false);
        return t('ManageCategories.toast.saveSuccess', { action: isEditing ? t('common.updated') : t('common.created') });
      },
      error: t('ManageCategories.toast.saveError', { action: isEditing ? t('common.update') : t('common.creation') }),
    });
  };
  
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    
    toast.promise(api.delete(`/categories/${categoryToDelete.id}`), {
      loading: t('ManageCategories.toast.deleting'),
      success: () => {
        fetchCategories();
        return t('ManageCategories.toast.deleteSuccess');
      },
      error: (err: AxiosError<{ message?: string }>) => 
        err.response?.data?.message || t('ManageCategories.toast.deleteError'),
    });
    setCategoryToDelete(null);
  };

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      newSet.has(categoryId) ? newSet.delete(categoryId) : newSet.add(categoryId);
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      <AdminNav />
      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <FolderTree className="h-8 w-8 text-rose-500" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('ManageCategories.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('ManageCategories.subtitle')}
        </p>
      </header>

      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Input 
                placeholder={t('ManageCategories.search.placeholder')} 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl max-w-xs"
              />
              <Button 
                onClick={() => { setCategoryToEdit(null); setIsDialogOpen(true); }} 
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-medium"
              >
                <PlusCircle className="w-4 h-4 ml-2" />
                {t('ManageCategories.actions.addCategory')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Layers className="w-5 h-5" />
              {t('ManageCategories.tree.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <p className="text-center text-rose-700">{t('ManageCategories.loading')}</p>
            ) : (
              <CategoryTree 
                categories={categories}
                onEdit={(cat) => { setCategoryToEdit(cat); setIsDialogOpen(true); }}
                onDelete={(cat) => setCategoryToDelete(cat)}
                onToggle={toggleCategory}
                expandedCategories={expandedCategories}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl max-w-4xl">
          <DialogHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-t-2xl p-6 -m-6 mb-6">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              {categoryToEdit ? (
                <>
                  <Edit className="w-6 h-6" />
                  {t('ManageCategories.dialog.edit.title')}
                </>
              ) : (
                <>
                  <PlusCircle className="w-6 h-6" />
                  {t('ManageCategories.dialog.create.title')}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm 
            category={categoryToEdit} 
            categories={flatCategories} 
            onSave={handleSave} 
            onClose={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-rose-800">
              {t('ManageCategories.dialog.delete.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-600 text-lg">
              {t('ManageCategories.dialog.delete.description', { name: categoryToDelete?.name })}
              <br />
              <span className="font-bold text-rose-700">
                {t('ManageCategories.dialog.delete.warning')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 rounded-2xl px-6 py-2">
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl px-6 py-2 font-bold"
            >
              {t('ManageCategories.dialog.delete.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}