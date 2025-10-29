import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { getAdminUsers, createUser, updateUser, deleteUser, getUserStatistics } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Loader2, Search, UserPlus, Edit2, Trash2, Shield, Users } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsers: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
    is_active: true,
  });

  useEffect(() => {
    fetchUsers();
    fetchStatistics();
  }, [search, roleFilter, currentPage]);

  const fetchUsers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params: any = { page: currentPage, per_page: 15 };
      if (search) params.search = search;
      if (roleFilter !== 'all') params.role = roleFilter;

      const response = await getAdminUsers(token, params);
      if (response.success) {
        setUsers(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      toast.error(t('admin.users.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!token) return;
    try {
      const response = await getUserStatistics(token);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (selectedUser) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          is_active: formData.is_active,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await updateUser(token, selectedUser.id, updateData);
        toast.success(t('admin.users.updateSuccess'));
      } else {
        await createUser(token, formData);
        toast.success(t('admin.users.createSuccess'));
      }
      setIsDialogOpen(false);
      resetForm();
      fetchUsers();
      fetchStatistics();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('admin.users.error'));
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedUser) return;
    try {
      await deleteUser(token, selectedUser.id);
      toast.success(t('admin.users.deleteSuccess'));
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
      fetchStatistics();
    } catch (error) {
      toast.error(t('admin.users.deleteError'));
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      is_active: user.is_active === 1,
    });
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'customer',
      is_active: true,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 mt-4">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-start order-2 sm:order-1"
            >
              <Button 
                onClick={openCreateDialog} 
                className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full sm:w-auto text-sm sm:text-base"
              >
                <UserPlus className="h-4 w-4 ms-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.users.addUser')}</span>
              </Button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-end order-1 sm:order-2 w-full"
            >
              <h1 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.users.title')}
              </h1>
           
            </motion.div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left"
            >
              <h1 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent whitespace-nowrap">
                {t('admin.users.title')}
              </h1>
         
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="w-full sm:ml-auto flex justify-end"
            >
              <Button 
                onClick={openCreateDialog} 
                className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full sm:w-auto text-sm sm:text-base"
              >
                <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.users.addUser')}</span>
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Statistics Cards */}
      {statistics && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.users.totalUsers')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_users}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.active_users} {t('admin.common.active')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.users.totalUsers')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_users}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.active_users} {t('admin.common.active')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.users.admins')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.admin_users}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.total_users - statistics.admin_users} {t('admin.users.customer')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.users.admins')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.admin_users}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.total_users - statistics.admin_users} {t('admin.users.customer')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group col-span-2 sm:col-span-2 lg:col-span-1"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.users.activeUsers')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.active_users}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.total_users - statistics.active_users} {t('admin.common.inactive')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.users.activeUsers')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.active_users}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.total_users - statistics.active_users} {t('admin.common.inactive')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardContent className="relative p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              {i18n.language === 'ar' ? (
                <>
                  {/* Search - Arabic: First on mobile, Second on desktop */}
                  <div className="flex-1 min-w-0 space-y-2 order-1 sm:order-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.users.search')}
                    </label>
                    <div className="relative group">
                      <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 h-4 w-4 right-3" />
                      <Input
                        placeholder={t('admin.users.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 text-right rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        dir="rtl"
                        style={{ 
                          textAlign: 'right', 
                          direction: 'rtl',
                          '--tw-placeholder-color': 'rgb(148 163 184)',
                          '--tw-placeholder-opacity': '1'
                        } as React.CSSProperties & { [key: string]: any }}
                      />
                    </div>
                  </div>

                  {/* Role Filter - Arabic: Second on mobile, First on desktop */}
                  <div className="space-y-2 order-2 sm:order-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.users.role')}
                    </label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                        <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.users.allRoles')}</SelectItem>
                        <SelectItem value="admin" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.users.admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  {/* Search - English: First */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.users.search')}
                    </label>
                    <div className="relative group">
                      <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 h-4 w-4 right-3" />
                      <Input
                        placeholder={t('admin.users.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Role Filter - English: Second */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.users.role')}
                    </label>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                        <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.users.allRoles')}</SelectItem>
                        <SelectItem value="admin" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.users.admin')}</SelectItem>
                        <SelectItem value="customer" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.users.customer')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

       {/* Users Table */}
       <motion.div
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.9, duration: 0.6 }}
         className="max-w-5xl mx-auto"
       >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative px-6 pt-6 pb-4">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {t('admin.users.usersList')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative px-6 pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-6 sm:py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
              <span className="ml-2 text-sm sm:text-base text-muted-foreground">{t('admin.common.loading')}</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-6 sm:py-12 text-muted-foreground text-sm sm:text-base">
              {t('admin.users.noUsers')}
            </div>
          ) : (
            <>
                <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto w-full max-w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" style={{ maxWidth: '88vw' }}>
                  <Table className="min-w-[800px] sm:min-w-[900px] table-fixed lg:w-full lg:table-auto">
                  <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[25%]">{t('admin.users.name')}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[30%]">{t('admin.users.email')}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[20%]">{t('admin.users.phone')}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[10%]">{t('admin.users.role')}</TableHead>
                      <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[10%]">{t('admin.users.status')}</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300 w-[5%]">{t('admin.common.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, index) => (
                      <TableRow 
                        key={user.id}
                        className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 ${
                          index % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30'
                        }`}
                      >
                        <TableCell className="font-medium">
                          <div className="break-words">{user.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="break-words">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <div className="break-words">{user.phone || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                            {t(`admin.users.${user.role}`)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'default' : 'destructive'} className="text-xs">
                            {user.is_active ? t('admin.users.active') : t('admin.users.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(user)}
                              aria-label={t('admin.users.editUserAriaLabel')}
                              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 h-8 w-8 p-0 rounded-xl"
                            >
                              <Edit2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(user)}
                              aria-label={t('admin.users.deleteUserAriaLabel')}
                              className="group hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 h-8 w-8 p-0 rounded-xl"
                            >
                              <Trash2 className="h-4 w-4 text-red-600 group-hover:text-red-700 group-hover:scale-110 transition-all duration-300" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

               {/* Pagination */}
               {totalPages > 1 && (
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 flex-wrap">
                   <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                     {t('admin.common.page')} {currentPage} {t('admin.common.of')} {totalPages}
                   </div>
                   <div className="flex items-center gap-3">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                       disabled={currentPage === 1}
                       className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                       aria-label={t('admin.common.previousAriaLabel')}
                     >
                       <span className="font-semibold">{t('admin.common.previous')}</span>
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                       disabled={currentPage === totalPages}
                       className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                       aria-label={t('admin.common.nextAriaLabel')}
                     >
                       <span className="font-semibold">{t('admin.common.next')}</span>
                     </Button>
                   </div>
                 </div>
               )}
            </>
          )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] mx-auto my-4 w-[98vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            maxHeight: '90vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
            scrollBehavior: 'smooth'
          }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
          <DialogHeader className="relative space-y-3 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {selectedUser ? t('admin.users.editUser') : t('admin.users.createUser')}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {selectedUser ? t('admin.users.editDescription') : t('admin.users.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="relative p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-10 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder={t('admin.users.namePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.email')}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-10 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder={t('admin.users.emailPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.phone')}</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-10 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder={t('admin.users.phonePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('admin.users.password')} {selectedUser && `(${t('admin.users.leaveBlank')})`}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!selectedUser}
                className="h-10 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                placeholder={t('admin.users.passwordPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.role')}</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="h-10 text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                  <SelectItem value="admin" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.users.admin')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20"
              />
              <Label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.active')}</Label>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-md hover:shadow-lg"
              >
                <span className="font-semibold">{t('admin.common.cancel')}</span>
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
              >
                <span className="font-semibold">{selectedUser ? t('admin.common.update') : t('admin.common.create')}</span>
              </Button>
            </div>
          </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent 
          className="max-w-[90%] sm:max-w-md mx-auto my-4 w-[98vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50
          }}
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <AlertDialogHeader className="relative space-y-3 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
            <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
              {t('admin.users.deleteConfirm')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.users.deleteDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="relative p-6">
            <AlertDialogFooter className="space-x-3 pt-4">
              <AlertDialogCancel className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-md hover:shadow-lg">
                <span className="font-semibold">{t('admin.common.cancel')}</span>
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
              >
                <span className="font-semibold">{t('admin.common.delete')}</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;