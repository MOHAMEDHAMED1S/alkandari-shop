import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, User, Star, Calendar, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface CustomerFormProps {
  customer?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone must be at least 10 characters').max(20, 'Phone must be less than 20 characters'),
  is_active: z.boolean().default(true),
  customer_type: z.enum(['regular', 'vip', 'new']).default('regular'),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    governorate: z.string().optional(),
    postal_code: z.string().optional(),
  }).optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const CustomerForm: React.FC<CustomerFormProps> = ({ customer, onSuccess, onCancel }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      is_active: customer?.is_active ?? true,
      customer_type: customer?.customer_type || 'regular',
      notes: customer?.notes || '',
      address: {
        street: customer?.address?.street || '',
        city: customer?.address?.city || '',
        governorate: customer?.address?.governorate || '',
        postal_code: customer?.address?.postal_code || '',
      },
    },
  });

  const watchedType = watch('customer_type');

  const onSubmit = async (data: CustomerFormData) => {
    setLoading(true);
    try {
      // Format data
      const formattedData = {
        ...data,
        email: data.email || null,
        address: data.address?.street || data.address?.city || data.address?.governorate || data.address?.postal_code 
          ? data.address 
          : null,
      };

      // TODO: Replace with actual API call
      // const response = customer 
      //   ? await updateCustomer(customer.id, formattedData)
      //   : await createCustomer(formattedData);

      // if (response.success) {
      //   toast.success(customer ? t('admin.customers.updatedSuccessfully') : t('admin.customers.createdSuccessfully'));
      //   onSuccess();
      // } else {
      //   toast.error(response.message || t('admin.customers.errorOccurred'));
      // }

      // Mock success for now
      setTimeout(() => {
        toast.success(customer ? t('admin.customers.updatedSuccessfully') : t('admin.customers.createdSuccessfully'));
        onSuccess();
      }, 1000);

    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error(t('admin.customers.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vip': return Star;
      case 'new': return Calendar;
      case 'regular': return User;
      default: return User;
    }
  };

  const TypeIcon = getTypeIcon(watchedType);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {i18n.language === 'ar' ? (
                <>
                  {t('admin.customers.basicInformation')}
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  {t('admin.customers.basicInformation')}
                </>
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.customers.basicInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.name')} *</Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
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

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.phone')} *</Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="+96512345678"
                  className={`pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.phone ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.email')}</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
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
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('admin.customers.emailOptional')}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="customer_type" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.customerType')}</Label>
            <div className="relative group">
              <TypeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
              <Select
                value={watchedType}
                onValueChange={(value) => setValue('customer_type', value as any)}
              >
                <SelectTrigger className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <SelectValue placeholder={t('admin.customers.selectType')} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg">
                  <SelectItem value="regular" className="text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 transition-all duration-200">
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      </div>
                      <span className="font-medium">{t('admin.customers.types.regular')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="vip" className="text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 transition-all duration-200">
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <span className="font-medium">{t('admin.customers.types.vip')}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="new" className="text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 focus:bg-slate-50 dark:focus:bg-slate-700 transition-all duration-200">
                    <div className="flex items-center gap-3 py-1">
                      <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium">{t('admin.customers.types.new')}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Spacer */}
      <div className="h-2"></div>

      {/* Address Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200/50 dark:border-blue-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-500/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative pb-3">
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {i18n.language === 'ar' ? (
                <>
                  {t('admin.customers.addressInformation')}
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  {t('admin.customers.addressInformation')}
                </>
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.customers.addressInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="street" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.street')}</Label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-blue-600 transition-colors duration-300" />
                <Input
                  id="street"
                  {...register('address.street')}
                  placeholder={t('admin.customers.streetPlaceholder')}
                  className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.city')}</Label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-blue-600 transition-colors duration-300" />
                  <Input
                    id="city"
                    {...register('address.city')}
                    placeholder={t('admin.customers.cityPlaceholder')}
                    className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="governorate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.governorate')}</Label>
                <div className="relative group">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-blue-600 transition-colors duration-300" />
                  <Input
                    id="governorate"
                    {...register('address.governorate')}
                    placeholder={t('admin.customers.governoratePlaceholder')}
                    className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="postal_code" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.postalCode')}</Label>
              <div className="relative group">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-blue-600 transition-colors duration-300" />
                <Input
                  id="postal_code"
                  {...register('address.postal_code')}
                  placeholder={t('admin.customers.postalCodePlaceholder')}
                  className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Spacer */}
      <div className="h-2"></div>

      {/* Additional Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border-purple-200/50 dark:border-purple-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-500/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative pb-3">
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {i18n.language === 'ar' ? (
                <>
                  {t('admin.customers.additionalInformation')}
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  {t('admin.customers.additionalInformation')}
                </>
              )}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.customers.additionalInformationDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-3 pt-0">
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.notes')}</Label>
              <div className="relative group">
                <FileText className="absolute left-3 top-3 text-slate-500 w-4 h-4 group-hover:text-purple-600 transition-colors duration-300" />
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder={t('admin.customers.notesPlaceholder')}
                  rows={3}
                  className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('admin.customers.notesHelp')}
              </p>
            </div>

            <div className="flex items-center space-x-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                className="scale-90"
              />
              <Label htmlFor="is_active" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {watch('is_active') ? t('admin.customers.active') : t('admin.customers.inactive')}
              </Label>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('admin.customers.statusHelp')}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Spacer */}
      <div className="h-3"></div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6 }}
        className="flex justify-end gap-3"
      >
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel} 
            className="relative overflow-hidden bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-slate-200 dark:border-slate-600 hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-md hover:shadow-lg"
          >
            <span className="relative z-10">{t('common.cancel')}</span>
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={loading} 
          className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
        >
          <span className="relative z-10">
            {loading ? t('common.saving') : (customer ? t('common.update') : t('common.create'))}
          </span>
        </Button>
      </motion.div>
    </form>
  );
};

export default CustomerForm;
