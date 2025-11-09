'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/axios';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  MoreHorizontal,
  Trash2,
  Ban,
  Shield,
  Mail,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  RefreshCw,
  Download,
  UserCheck,
  UserX,
  Crown,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  Briefcase,
} from 'lucide-react';
import AdminNav from '@/components/dashboards/AdminNav';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  created_at: string;
  last_login?: string;
  is_banned: boolean | number;
  email_verified?: boolean;
  profile_picture_url?: string;
  phone?: string;
  login_count?: number;
}

interface UserStats {
  total: number;
  active: number;
  banned: number;
  models: number;
  influencers: number;
  merchants: number;
  suppliers: number;
  customers: number;
  admins: number;
}

export default function ManageUsersPage() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [stats, setStats] = useState<UserStats>({
    total: 0,
    active: 0,
    banned: 0,
    models: 0,
    influencers: 0,
    merchants: 0,
    suppliers: 0,
    customers: 0,
    admins: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get<User[]>('/admin/users');
      setUsers(response.data);
      calculateStats(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error(t('AdminUsers.toasts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData: User[]) => {
    const newStats: UserStats = {
      total: usersData.length,
      active: usersData.filter(u => !u.is_banned).length,
      banned: usersData.filter(u => u.is_banned).length,
      admins: usersData.filter(u => u.roleId === 1).length,
      merchants: usersData.filter(u => u.roleId === 2).length,
      models: usersData.filter(u => u.roleId === 3).length,
      influencers: usersData.filter(u => u.roleId === 4).length,
      customers: usersData.filter(u => u.roleId === 5).length,
      suppliers: usersData.filter(u => u.roleId === 6).length,
    };
    setStats(newStats);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusUpdate = async (
    user: User,
    field: 'is_banned' | 'role_id',
    value: boolean | number
  ) => {
    try {
      const payload = {
        role_id: user.roleId,
        is_banned: Boolean(user.is_banned),
        [field]: value,
      };

      const promise = api.put(`/admin/users/${user.id}`, payload);

      toast.promise(promise, {
        loading: t('common.saving'),
        success: () => {
          fetchUsers();
          return field === 'is_banned'
            ? t(value ? 'AdminUsers.toasts.banSuccess' : 'AdminUsers.toasts.unbanSuccess')
            : t('AdminUsers.toasts.roleUpdateSuccess');
        },
        error: t('AdminUsers.toasts.updateError'),
      });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleRoleUpdate = async (user: User, newRoleId: number) => {
    try {
      const payload = {
        role_id: newRoleId,
        is_banned: Boolean(user.is_banned),
      };

      const promise = api.put(`/admin/users/${user.id}`, payload);

      toast.promise(promise, {
        loading: t('common.saving'),
        success: () => {
          fetchUsers();
          setUserToEdit(null);
          return t('AdminUsers.toasts.roleUpdateSuccess');
        },
        error: t('AdminUsers.toasts.updateError'),
      });
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const promise = api.delete(`/admin/users/${userToDelete.id}`);

      toast.promise(promise, {
        loading: t('common.saving'),
        success: () => {
          fetchUsers();
          setUserToDelete(null);
          return t('AdminUsers.toasts.deleteSuccess');
        },
        error: err => {
          const message = err.response?.data?.message || t('AdminUsers.toasts.deleteError');
          return message;
        },
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const uniqueRoles = useMemo(() => {
    const roles = Array.from(new Set(users.map(u => u.roleName))).filter(Boolean);
    return roles;
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm));

      const matchesRole =
        selectedRole === 'all' || user.roleName.toLowerCase() === selectedRole.toLowerCase();

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !user.is_banned) ||
        (statusFilter === 'banned' && user.is_banned);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, selectedRole, statusFilter]);

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formatDateTime = (dateString: string): string =>
    new Date(dateString).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const exportUsers = () => {
    toast.info(t('AdminUsers.toasts.exportPreparing'));
  };

  const getRoleDisplay = (roleId: number): string => {
    switch (roleId) {
      case 1: return t('AdminUsers.roles.Admin', 'مشرف');
      case 2: return t('AdminUsers.roles.Merchant', 'تاجر');
      case 3: return t('AdminUsers.roles.Model', 'موديل');
      case 4: return t('AdminUsers.roles.Influencer', 'مؤثر');
      case 5: return t('AdminUsers.roles.Customer', 'عميل');
      case 6: return t('AdminUsers.roles.Supplier', 'مورد');
      default: return t('AdminUsers.roles.Customer', 'عميل');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-6 sm:p-8">
      <div className="absolute top-0 right-0 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" />

      <AdminNav />

      <header className="mb-8 text-center relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg">
            <Users className="h-8 w-8 text-rose-500" />
          </div>
          <Sparkles className="h-6 w-6 text-rose-300" />
          <Shield className="h-6 w-6 text-rose-300" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-3">
          {t('AdminUsers.title')}
        </h1>
        <p className="text-rose-700 text-lg max-w-2xl mx-auto">
          {t('AdminUsers.subtitle')}
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-rose-400 to-pink-400 mx-auto rounded-full mt-4" />
      </header>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-rose-600 mb-1">{stats.total}</div>
              <div className="text-rose-700 text-sm">{t('AdminUsers.stats.total')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-green-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.active}</div>
              <div className="text-green-700 text-sm">{t('AdminUsers.stats.active')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600 mb-1">{stats.banned}</div>
              <div className="text-red-700 text-sm">{t('AdminUsers.stats.banned')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-amber-600 mb-1">{stats.admins}</div>
              <div className="text-amber-700 text-sm">{t('AdminUsers.stats.admins')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.merchants}</div>
              <div className="text-blue-700 text-sm">{t('AdminUsers.stats.merchants')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-purple-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600 mb-1">{stats.models}</div>
              <div className="text-purple-700 text-sm">{t('AdminUsers.stats.models')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-cyan-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-cyan-600 mb-1">{stats.suppliers}</div>
              <div className="text-cyan-700 text-sm">{t('AdminUsers.roles.Supplier', 'الموردين')}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-2xl text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600 mb-1">{stats.customers}</div>
              <div className="text-gray-700 text-sm">{t('AdminUsers.roles.Customer', 'العملاء')}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-400" />
                  <Input
                    placeholder={t('AdminUsers.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pr-10 border-rose-200 focus:border-rose-400 rounded-xl"
                  />
                </div>

                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-40 border-rose-200 focus:border-rose-400 rounded-xl">
                    <Filter className="w-4 h-4 ml-2 text-rose-400" />
                    <SelectValue placeholder={t('AdminUsers.allRoles')} />
                  </SelectTrigger>
                  <SelectContent className="border-rose-200 rounded-xl">
                    <SelectItem value="all">{t('AdminUsers.allRoles')}</SelectItem>
                    {uniqueRoles.map(role => (
                      <SelectItem key={role} value={role.toLowerCase()}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 border-rose-200 focus:border-rose-400 rounded-xl">
                    <SelectValue placeholder={t('AdminUsers.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent className="border-rose-200 rounded-xl">
                    <SelectItem value="all">{t('AdminUsers.allStatuses')}</SelectItem>
                    <SelectItem value="active">{t('AdminUsers.activeOnly')}</SelectItem>
                    <SelectItem value="banned">{t('AdminUsers.bannedOnly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={exportUsers}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                >
                  <Download className="w-4 h-4 ml-2" />
                  {t('AdminUsers.exportData')}
                </Button>
                <Button
                  variant="outline"
                  onClick={fetchUsers}
                  className="border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 ml-2" />
                  {t('AdminUsers.refresh')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-rose-200 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Users className="w-6 h-6" />
                  {t('AdminUsers.userList')}
                </CardTitle>
                <CardDescription className="text-pink-100">
                  {t('AdminUsers.totalUsers', { count: filteredUsers.length })}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                {filteredUsers.length} {t('common.users')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-rose-50/50 hover:bg-rose-50/70">
                  <TableHead className="text-rose-800 font-bold">{t('AdminUsers.name')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminUsers.role')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminUsers.statuss')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminUsers.email')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminUsers.registrationDate')}</TableHead>
                  <TableHead className="text-rose-800 font-bold">{t('AdminUsers.lastLogin')}</TableHead>
                  <TableHead className="text-rose-800 font-bold text-left">{t('AdminUsers.actionss')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mb-3" />
                        <p className="text-rose-700 font-medium">{t('AdminUsers.loading')}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <TableRow key={user.id} className="border-rose-100 hover:bg-rose-50/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-rose-900">{user.name}</div>
                            {user.phone && <div className="text-rose-600 text-sm">{user.phone}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`
                            ${user.roleId === 1 ? 'bg-amber-100 text-amber-700 border-amber-200' : ''}
                            ${user.roleId === 2 ? 'bg-blue-100 text-blue-700 border-blue-200' : ''}
                            ${user.roleId === 3 ? 'bg-purple-100 text-purple-700 border-purple-200' : ''}
                            ${user.roleId === 4 ? 'bg-pink-100 text-pink-700 border-pink-200' : ''}
                            ${user.roleId === 5 ? 'bg-gray-100 text-gray-700 border-gray-200' : ''}
                            ${user.roleId === 6 ? 'bg-cyan-100 text-cyan-700 border-cyan-200' : ''}
                          `}
                        >
                          {user.roleId === 1 && <Crown className="w-3 h-3 ml-1" />}
                          {getRoleDisplay(user.roleId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.is_banned ? 'destructive' : 'secondary'} className="flex items-center gap-1">
                            {user.is_banned ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {user.is_banned ? t('AdminUsers.status.banned') : t('AdminUsers.status.active')}
                          </Badge>
                          {user.email_verified && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <CheckCircle className="w-3 h-3 ml-1" />
                              {t('AdminUsers.status.verified')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-rose-700">
                          <Mail className="w-4 h-4 text-rose-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-rose-600 text-sm">
                          <Calendar className="w-4 h-4 text-rose-400" />
                          {formatDate(user.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <div className="text-rose-600 text-sm">{formatDateTime(user.last_login)}</div>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                            <Clock className="w-3 h-3 ml-1" />
                            {t('AdminUsers.neverLoggedIn')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-left">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50 rounded-xl">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-rose-200 rounded-xl w-48">
                            <DropdownMenuItem onClick={() => setUserToEdit(user)} className="text-rose-700">
                              <Edit className="w-4 h-4 ml-2" />
                              {t('AdminUsers.actions.editRole')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(user, 'is_banned', !user.is_banned)}
                              className={user.is_banned ? 'text-green-600' : 'text-amber-600'}
                            >
                              {user.is_banned ? (
                                <UserCheck className="w-4 h-4 ml-2" />
                              ) : (
                                <Ban className="w-4 h-4 ml-2" />
                              )}
                              {user.is_banned
                                ? t('AdminUsers.actions.unbanUser')
                                : t('AdminUsers.actions.banUser')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-rose-200" />
                            <DropdownMenuItem
                              onClick={() => setUserToDelete(user)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              {t('AdminUsers.actions.deleteUser')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="w-16 h-16 text-rose-300 mb-4" />
                        <h3 className="font-bold text-xl text-rose-800 mb-2">{t('AdminUsers.noUsers')}</h3>
                        <p className="text-rose-600 max-w-md">
                          {searchTerm || selectedRole !== 'all' || statusFilter !== 'all'
                            ? t('AdminUsers.filters.noResults')
                            : t('AdminUsers.filters.empty')}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={!!userToEdit} onOpenChange={open => !open && setUserToEdit(null)}>
        <DialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-800">
              <Edit className="w-5 h-5" />
              {t('AdminUsers.dialogs.editRole.title')}
            </DialogTitle>
            <DialogDescription>
              {t('AdminUsers.dialogs.editRole.description', { name: userToEdit?.name })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-rose-800 font-medium">{t('AdminUsers.dialogs.editRole.currentRole')}</Label>
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                <Badge variant="outline" className="bg-rose-100 text-rose-700">
                  {userToEdit && getRoleDisplay(userToEdit.roleId)}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role" className="text-rose-800 font-medium">
                {t('AdminUsers.dialogs.editRole.newRole')}
              </Label>
              <Select
                defaultValue={userToEdit?.roleId.toString()}
                onValueChange={value => userToEdit && handleRoleUpdate(userToEdit, parseInt(value))}
              >
                <SelectTrigger id="new-role" className="border-rose-200 focus:border-rose-400 rounded-xl">
                  <SelectValue placeholder={t('AdminUsers.dialogs.editRole.newRole')} />
                </SelectTrigger>
                <SelectContent className="border-rose-200 rounded-xl">
                  <SelectItem value="1">{getRoleDisplay(1)}</SelectItem>
                  <SelectItem value="2">{getRoleDisplay(2)}</SelectItem>
                  <SelectItem value="3">{getRoleDisplay(3)}</SelectItem>
                  <SelectItem value="4">{getRoleDisplay(4)}</SelectItem>
                  <SelectItem value="5">{getRoleDisplay(5)}</SelectItem>
                  <SelectItem value="6">{getRoleDisplay(6)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserToEdit(null)}
              className="border-rose-200 text-rose-700 hover:bg-rose-50"
            >
              {t('common.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={open => !open && setUserToDelete(null)}>
        <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-rose-200 rounded-3xl shadow-2xl">
          <AlertDialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-rose-800">
              {t('AdminUsers.dialogs.deleteUser.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-rose-600 text-lg">
              {t('AdminUsers.dialogs.deleteUser.description', { name: userToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <AlertDialogCancel className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 rounded-2xl px-6 py-2">
              {t('AdminUsers.dialogs.deleteUser.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl px-6 py-2 font-bold"
            >
              {t('AdminUsers.dialogs.deleteUser.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}