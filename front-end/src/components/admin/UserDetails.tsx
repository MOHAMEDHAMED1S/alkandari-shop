import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  X,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  User,
  Calendar,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Key,
  Lock,
  Clock,
  Eye,
  Copy,
  Download
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import UserForm from './UserForm';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  login_count: number;
  permissions?: string[];
  notes?: string;
}

interface UserDetailsProps {
  user: User;
  onClose: () => void;
  onUpdate: () => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get user initials
  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'customer': return 'secondary';
      default: return 'secondary';
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary';
  };

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'customer': return User;
      default: return User;
    }
  };

  // Get status icon
  const getStatusIcon = (isActive: boolean) => {
    return isActive ? CheckCircle : XCircle;
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await deleteUser(user.id);
      
      // if (response.success) {
      //   toast.success(t('admin.users.deletedSuccessfully'));
      //   onUpdate();
      //   onClose();
      // } else {
      //   toast.error(response.message || t('admin.users.errorOccurred'));
      // }

      // Mock success for now
      setTimeout(() => {
        toast.success(t('admin.users.deletedSuccessfully'));
        onUpdate();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(t('admin.users.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('admin.users.copiedToClipboard', { item: label }));
  };

  const RoleIcon = getRoleIcon(user.role);
  const StatusIcon = getStatusIcon(user.is_active);

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent 
          className="w-[95vw] sm:w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-auto my-4 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            maxHeight: '90vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9'
          }}
          onScroll={(e) => {
            e.currentTarget.style.scrollBehavior = 'smooth';
          }}
        >
          <DialogHeader className="relative pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    {t('admin.users.userDetails')}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    {t('admin.users.userDetailsDescription')}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                >
                  <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">{t('common.edit')}</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="group hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-4 h-4 mr-2 text-red-600 group-hover:text-red-700 group-hover:scale-110 transition-all duration-300" />
                  <span className="font-semibold text-red-600 group-hover:text-red-700">{t('common.delete')}</span>
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(95vh-120px)] pr-1">
            <div className="space-y-4 sm:space-y-6">
              {/* User Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-sm">
                        {getUserInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base font-semibold truncate">{user.name}</h3>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs px-1 py-0.5">
                          <RoleIcon className="w-2 h-2 mr-1" />
                          {t(`admin.users.roles.${user.role}`)}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.is_active)} className="text-xs px-1 py-0.5">
                          <StatusIcon className="w-2 h-2 mr-1" />
                          {user.is_active ? t('admin.users.active') : t('admin.users.inactive')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Contact Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    {t('admin.users.contactInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('admin.users.email')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{user.email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user.email, t('admin.users.email'))}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t('admin.users.phone')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{user.phone}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(user.phone!, t('admin.users.phone'))}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    {t('admin.users.accountInformation')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('admin.users.role')}</span>
                    </div>
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs px-1 py-0.5">
                      <RoleIcon className="w-2 h-2 mr-1" />
                      {t(`admin.users.roles.${user.role}`)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('admin.users.loginCount')}</span>
                    </div>
                    <span className="text-xs font-medium">{user.login_count}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t('admin.users.registrationDate')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {user.last_login && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{t('admin.users.lastLogin')}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(user.last_login).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Permissions (Admin only) */}
              {user.role === 'admin' && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Lock className="w-4 h-4" />
                      {t('admin.users.permissions')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 p-3">
                    {user.permissions && user.permissions.length > 0 ? (
                      user.permissions.map((permission) => (
                        <div key={permission} className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-xs">{t(`admin.users.permissions.${permission}`)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        {t('admin.users.noPermissions')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Notes */}
            {user.notes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    {t('admin.users.notes')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="text-xs">{user.notes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('admin.users.editUser')}</DialogTitle>
              <DialogDescription>
                {t('admin.users.editUserDescription')}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              user={user}
              onSuccess={() => {
                setShowEditDialog(false);
                onUpdate();
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t('admin.users.deleteUser')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.users.deleteUserConfirmation', { name: user.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default UserDetails;
