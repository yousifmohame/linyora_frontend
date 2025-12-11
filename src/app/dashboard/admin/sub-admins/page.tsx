'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Plus, Edit, Trash2, Eye, PenTool, Lock } from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';

// List of resources matches AdminNav links
const RESOURCES = [
  'users',
  'stories',
  'main-banners',
  'marquee-bar',
  'verification',
  'messages',
  'products',
  'categories',
  'sections',
  'orders',
  'agreements',
  'subscriptions',
  'shipping',
  'payouts',
  'model payouts',
  'Promotions',
  'Manage-Subscriptions',
  'Content',
  'Footer',
  'settings'
];

interface Permission {
  [key: string]: 'none' | 'read' | 'write';
}

interface SubAdmin {
  id: number;
  name: string;
  email: string;
  permissions: Permission;
}

export default function SubAdminsPage() {
  const { t, i18n } = useTranslation();
  const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: RESOURCES.reduce((acc, res) => ({ ...acc, [res]: 'none' }), {} as Permission),
  });

  const isRTL = i18n.language === 'ar';

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/sub-admins');
      setSubAdmins(data);
    } catch (err) {
      console.error(err);
      toast.error(t('SubAdmins.toasts.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handlePermissionChange = (resource: string, level: 'none' | 'read' | 'write') => {
    setFormData((prev) => ({
      ...prev,
      permissions: { ...prev.permissions, [resource]: level },
    }));
  };

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      permissions: RESOURCES.reduce((acc, res) => ({ ...acc, [res]: 'none' }), {} as Permission),
    });
    setIsEditing(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (admin: SubAdmin) => {
    setFormData({
      name: admin.name,
      email: admin.email,
      password: '', // Leave empty to keep unchanged
      permissions: {
        ...RESOURCES.reduce((acc, res) => ({ ...acc, [res]: 'none' }), {} as Permission),
        ...admin.permissions,
      },
    });
    setSelectedId(admin.id);
    setIsEditing(true);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && selectedId) {
        await api.put(`/admin/sub-admins/${selectedId}`, {
          permissions: formData.permissions,
        });
        toast.success(t('SubAdmins.toasts.updateSuccess'));
      } else {
        if (!formData.password) {
          toast.error(t('SubAdmins.toasts.passwordRequired'));
          return;
        }
        await api.post('/admin/sub-admins', formData);
        toast.success(t('SubAdmins.toasts.createSuccess'));
      }
      setIsOpen(false);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('SubAdmins.toasts.genericError'));
    }
  };

  return (
    <div className={`p-4 md:p-8 space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
        <AdminNav />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-purple-600" />
            {t('SubAdmins.title')}
          </h1>
          <p className="text-gray-500 mt-1">{t('SubAdmins.subtitle')}</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenCreate} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {t('SubAdmins.addButton')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{isEditing ? t('SubAdmins.dialog.editTitle') : t('SubAdmins.dialog.createTitle')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('SubAdmins.form.name')}</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('SubAdmins.form.email')}</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="admin@example.com"
                    disabled={isEditing}
                  />
                </div>
                {!isEditing && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium mb-1 block">{t('SubAdmins.form.password')}</label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>

              {/* Permissions Matrix */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
                  <h3 className="font-bold text-gray-700">{t('SubAdmins.form.permissionsTitle')}</h3>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {t('SubAdmins.permissions.none')}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {t('SubAdmins.permissions.read')}</span>
                    <span className="flex items-center gap-1"><PenTool className="w-3 h-3" /> {t('SubAdmins.permissions.write')}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 divide-y">
                  {RESOURCES.map((res) => (
                    <div key={res} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                      <span className="capitalize font-medium text-gray-700 mb-2 sm:mb-0">
                        {t(`AdminNav.nav.${res}`, { defaultValue: res })}
                      </span>
                      <div className="flex gap-1 bg-gray-200 p-1 rounded-lg w-fit">
                        <button
                          onClick={() => handlePermissionChange(res, 'none')}
                          className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                            formData.permissions[res] === 'none'
                              ? 'bg-white text-red-600 shadow-sm font-bold'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {t('SubAdmins.permissions.buttons.none')}
                        </button>
                        <button
                          onClick={() => handlePermissionChange(res, 'read')}
                          className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                            formData.permissions[res] === 'read'
                              ? 'bg-white text-amber-600 shadow-sm font-bold'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {t('SubAdmins.permissions.buttons.view')}
                        </button>
                        <button
                          onClick={() => handlePermissionChange(res, 'write')}
                          className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                            formData.permissions[res] === 'write'
                              ? 'bg-white text-green-600 shadow-sm font-bold'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {t('SubAdmins.permissions.buttons.edit')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSubmit} className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-lg">
                {isEditing ? t('SubAdmins.form.updateButton') : t('SubAdmins.form.createButton')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('SubAdmins.table.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('SubAdmins.table.headers.name')}</TableHead>
                <TableHead>{t('SubAdmins.table.headers.email')}</TableHead>
                <TableHead>{t('SubAdmins.table.headers.accessLevel')}</TableHead>
                <TableHead className="text-right">{t('SubAdmins.table.headers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {t('SubAdmins.table.loading')}
                  </TableCell>
                </TableRow>
              ) : subAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    {t('SubAdmins.table.empty')}
                  </TableCell>
                </TableRow>
              ) : (
                subAdmins.map((admin) => {
                  const writeCount = Object.values(admin.permissions || {}).filter((p) => p === 'write').length;
                  const readCount = Object.values(admin.permissions || {}).filter((p) => p === 'read').length;

                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {writeCount} {t('SubAdmins.table.badges.edit')}
                          </Badge>
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {readCount} {t('SubAdmins.table.badges.view')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(admin)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}