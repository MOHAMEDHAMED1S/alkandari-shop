import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Phone, User, Shield, Key, Lock, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

interface UserFormProps {
  user?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  password_confirmation: z.string().optional(),
  role: z.enum(['admin', 'customer']).default('customer'),
  is_active: z.boolean().default(true),
  permissions: z.array(z.string()).optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password !== data.password_confirmation) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["password_confirmation"],
});

type UserFormData = z.infer<typeof userSchema>;

const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      password_confirmation: '',
      role: user?.role || 'customer',
      is_active: user?.is_active ?? true,
      permissions: user?.permissions || [],
      notes: user?.notes || '',
    },
  });

  const watchedRole = watch('role');
  const watchedPassword = watch('password');

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    try {
      // Format data
      const formattedData = {
        ...data,
        phone: data.phone || null,
        password: data.password || undefined,
        password_confirmation: data.password_confirmation || undefined,
        permissions: data.permissions || [],
      };

      // Remove password fields if not provided for existing users
      if (user && !data.password) {
        delete formattedData.password;
        delete formattedData.password_confirmation;
      }

      // TODO: Replace with actual API call
      // const response = user 
      //   ? await updateUser(user.id, formattedData)
      //   : await createUser(formattedData);

      // if (response.success) {
      //   toast.success(user ? t('admin.users.updatedSuccessfully') : t('admin.users.createdSuccessfully'));
      //   onSuccess();
      // } else {
      //   toast.error(response.message || t('admin.users.errorOccurred'));
      // }

      // Mock success for now
      setTimeout(() => {
        toast.success(user ? t('admin.users.updatedSuccessfully') : t('admin.users.createdSuccessfully'));
        onSuccess();
      }, 1000);

    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(t('admin.users.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'customer': return User;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon(watchedRole);

  const permissionOptions = [
    { id: 'dashboard', label: t('admin.users.permissions.dashboard') },
    { id: 'users', label: t('admin.users.permissions.users') },
    { id: 'orders', label: t('admin.users.permissions.orders') },
    { id: 'products', label: t('admin.users.permissions.products') },
    { id: 'customers', label: t('admin.users.permissions.customers') },
    { id: 'categories', label: t('admin.users.permissions.categories') },
    { id: 'discounts', label: t('admin.users.permissions.discounts') },
    { id: 'reports', label: t('admin.users.permissions.reports') },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              {t('admin.users.basicInformation')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.users.basicInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.name')} *</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4" />
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="أحمد محمد"
                    className={`pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.email')} *</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4" />
                  <Input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder="ahmed@example.com"
                    className={`pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.phone')}</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4" />
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+96512345678"
                  className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('admin.users.phoneOptional')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.role')}</Label>
              <Select
                value={watchedRole}
                onValueChange={(value) => setValue('role', value as any)}
              >
                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <SelectValue placeholder={t('admin.users.selectRole')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                  <SelectItem value="customer" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t('admin.users.roles.customer')}
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t('admin.users.roles.admin')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
              <Key className="w-5 h-5 text-blue-600" />
              {t('admin.users.password')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {user ? t('admin.users.passwordDescription') : t('admin.users.passwordDescriptionNew')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.password')} {user ? '' : '*'}</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4" />
                <Input
                  id="password"
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder={user ? t('admin.users.passwordPlaceholder') : t('admin.users.passwordPlaceholderNew')}
                  className={`pl-10 pr-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.password ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {watchedPassword && (
              <div className="space-y-2">
                <Label htmlFor="password_confirmation" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.confirmPassword')} *</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4" />
                  <Input
                    id="password_confirmation"
                    {...register('password_confirmation')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('admin.users.confirmPasswordPlaceholder')}
                    className={`pl-10 pr-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.password_confirmation ? 'border-red-500' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password_confirmation && (
                  <p className="text-xs text-red-500">{errors.password_confirmation.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Permissions (Admin only) */}
      {watchedRole === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative pb-3">
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                {t('admin.users.permissions')}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {t('admin.users.permissionsDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {permissionOptions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300">
                    <Checkbox
                      id={permission.id}
                      checked={watch('permissions')?.includes(permission.id) || false}
                      onCheckedChange={(checked) => {
                        const currentPermissions = watch('permissions') || [];
                        if (checked) {
                          setValue('permissions', [...currentPermissions, permission.id]);
                        } else {
                          setValue('permissions', currentPermissions.filter(p => p !== permission.id));
                        }
                      }}
                      className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                    />
                    <Label htmlFor={permission.id} className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative pb-3">
            <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              {t('admin.users.additionalInformation')}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.users.additionalInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-4 pt-0">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.users.notes')}</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder={t('admin.users.notesPlaceholder')}
                rows={3}
                className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t('admin.users.notesHelp')}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center space-x-3">
                <Switch
                  id="is_active"
                  checked={watch('is_active')}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <Label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {watch('is_active') ? t('admin.users.active') : t('admin.users.inactive')}
                </Label>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('admin.users.statusHelp')}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex justify-end gap-3"
      >
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2"
          >
            <span className="font-semibold">{t('common.cancel')}</span>
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={loading} 
          className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
        >
          <span className="font-semibold">{loading ? t('common.saving') : (user ? t('common.update') : t('common.create'))}</span>
        </Button>
      </motion.div>
    </form>
  );
};

export default UserForm;
