import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Calendar, Clock, Percent, DollarSign, Gift, Users, Minus, Coins } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { createDiscountCode, updateDiscountCode } from '@/lib/api';
import { useAdmin } from '@/contexts/AdminContext';

interface DiscountFormProps {
  discount?: any;
  onSuccess: () => void;
  onCancel?: () => void;
}

const discountSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters').max(50, 'Code must be less than 50 characters'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['percentage', 'fixed_amount', 'free_shipping']),
  value: z.number().min(0.01, 'Value must be greater than 0'),
  minimum_order_amount: z.number().optional(),
  maximum_discount_amount: z.number().optional(),
  usage_limit: z.number().optional(),
  is_active: z.boolean().default(true),
  starts_at: z.string().optional(),
  expires_at: z.string().optional(),
  description: z.string().optional(),
});

type DiscountFormData = z.infer<typeof discountSchema>;

const DiscountForm: React.FC<DiscountFormProps> = ({ discount, onSuccess, onCancel }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const [loading, setLoading] = useState(false);

  // Function to get localized currency symbol
  const getLocalizedCurrencySymbol = (): string => {
    if (i18n.language === 'ar') {
      return 'د.ك'; // Arabic currency symbol
    }
    return 'KWD'; // English currency
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: discount?.code || '',
      name: discount?.name || '',
      type: discount?.type || 'percentage',
      value: discount?.value || 0,
      minimum_order_amount: discount?.minimum_order_amount || undefined,
      maximum_discount_amount: discount?.maximum_discount_amount || undefined,
      usage_limit: discount?.usage_limit || undefined,
      is_active: discount?.is_active ?? true,
      starts_at: discount?.starts_at ? new Date(discount.starts_at).toISOString().slice(0, 16) : '',
      expires_at: discount?.expires_at ? new Date(discount.expires_at).toISOString().slice(0, 16) : '',
      description: discount?.description || '',
    },
  });

  const watchedType = watch('type');
  const watchedValue = watch('value');

  const onSubmit = async (data: DiscountFormData) => {
    setLoading(true);
    try {
      // Format data for API
      const formattedData = {
        code: data.code,
        name: data.name,
        description: data.description,
        type: data.type,
        value: data.value,
        minimum_order_amount: data.minimum_order_amount,
        maximum_discount_amount: data.maximum_discount_amount,
        usage_limit: data.usage_limit,
        is_active: data.is_active,
        start_date: data.starts_at ? new Date(data.starts_at).toISOString() : undefined,
        end_date: data.expires_at ? new Date(data.expires_at).toISOString() : undefined,
      };

      if (discount) {
        await updateDiscountCode(token, discount.id, formattedData);
        toast.success('تم تحديث كود الخصم بنجاح');
      } else {
        await createDiscountCode(token, formattedData);
        toast.success('تم إنشاء كود الخصم بنجاح');
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error('حدث خطأ أثناء حفظ كود الخصم');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed_amount': return Coins;
      case 'free_shipping': return Gift;
      default: return Gift;
    }
  };

  const TypeIcon = getTypeIcon(watchedType);

  return (
    <div className="max-h-[80vh]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4 p-1">
        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <CardHeader className="relative pb-3">
              <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                {i18n.language === 'ar' ? (
                  <>
                    <span>{t('admin.discounts.basicInformation')}</span>
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                      <Gift className="w-5 h-5 text-primary" />
                    </div>
                    <span>{t('admin.discounts.basicInformation')}</span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {t('admin.discounts.basicInformationDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-2 sm:space-y-3 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="code" className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('admin.discounts.code')} *</Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="WELCOME20"
                  className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.code ? 'border-red-500' : ''}`}
                />
                {errors.code && (
                  <p className="text-xs text-red-500">{errors.code.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.discounts.name')} *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Welcome Discount"
                  className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${errors.name ? 'border-red-500' : ''}`}
                />
                {errors.name && (
                  <p className={`text-xs text-red-500 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.discounts.type')} *</Label>
                <Select
                  value={watchedType}
                  onValueChange={(value) => setValue('type', value as any)}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue placeholder={t('admin.discounts.selectType')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                    <SelectItem value="percentage" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5" />
                        {t('admin.discounts.types.percentage')}
                      </div>
                    </SelectItem>
                    <SelectItem value="fixed_amount" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <Coins className="w-3.5 h-3.5" />
                        {t('admin.discounts.types.fixed_amount')}
                      </div>
                    </SelectItem>
                    <SelectItem value="free_shipping" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <Gift className="w-3.5 h-3.5" />
                        {t('admin.discounts.types.free_shipping')}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="value" className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('admin.discounts.value')} * 
                  {watchedType === 'percentage' && ' (%)'}
                  {watchedType === 'fixed_amount' && ` (${getLocalizedCurrencySymbol()})`}
                </Label>
                <div className="relative">
                  <TypeIcon className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  <Input
                    id="value"
                    {...register('value', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder={watchedType === 'percentage' ? '20' : '10.00'}
                    className={`pl-8 h-8 text-xs ${errors.value ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.value && (
                  <p className={`text-xs text-red-500 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{errors.value.message}</p>
                )}
                {watchedType === 'percentage' && (
                  <p className="text-xs text-muted-foreground">
                    {t('admin.discounts.percentageHelp')}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">{t('admin.discounts.description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t('admin.discounts.descriptionPlaceholder')}
                rows={3}
                className="text-xs resize-none"
              />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Conditions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <CardHeader className="relative pb-3">
              <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                {i18n.language === 'ar' ? (
                  <>
                    <span>{t('admin.discounts.conditions')}</span>
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl">
                      <Coins className="w-5 h-5 text-orange-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl">
                      <Coins className="w-5 h-5 text-orange-600" />
                    </div>
                    <span>{t('admin.discounts.conditions')}</span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {t('admin.discounts.conditionsDescription')}
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="minimum_order_amount" className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('admin.discounts.minimumOrderAmount')}
                </Label>
                <div className="relative">
                  {i18n.language === 'ar' ? (
                    <Coins className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  ) : (
                    <Coins className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  )}
                  <Input
                    id="minimum_order_amount"
                    {...register('minimum_order_amount', { valueAsNumber: true })}
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder="50.000"
                    className={`${i18n.language === 'ar' ? 'pr-8 text-right placeholder:text-right' : 'pl-8 text-left placeholder:text-left'} h-8 text-xs`}
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <p className={`text-xs text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('admin.discounts.minimumOrderAmountHelp')}
                </p>
              </div>

              {watchedType === 'percentage' && (
                <div className="space-y-1.5">
                  <Label htmlFor="maximum_discount_amount" className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.maximumDiscountAmount')}
                  </Label>
                  <div className="relative">
                    {i18n.language === 'ar' ? (
                      <Coins className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                    ) : (
                      <Coins className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                    )}
                    <Input
                      id="maximum_discount_amount"
                      {...register('maximum_discount_amount', { valueAsNumber: true })}
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="100.000"
                      className={`${i18n.language === 'ar' ? 'pr-8 text-right placeholder:text-right' : 'pl-8 text-left placeholder:text-left'} h-8 text-xs`}
                      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                  <p className={`text-xs text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.maximumDiscountAmountHelp')}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="usage_limit" className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('admin.discounts.usageLimit')}</Label>
              <div className="relative">
                {i18n.language === 'ar' ? (
                  <Users className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                ) : (
                  <Users className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                )}
                <Input
                  id="usage_limit"
                  {...register('usage_limit', { valueAsNumber: true })}
                  type="number"
                  min="1"
                  placeholder="100"
                  className={`${i18n.language === 'ar' ? 'pr-8 text-right placeholder:text-right' : 'pl-8 text-left placeholder:text-left'} h-8 text-xs`}
                  dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                />
              </div>
              <p className={`text-xs text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                {t('admin.discounts.usageLimitHelp')}
              </p>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <CardHeader className="relative pb-3">
              <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                {i18n.language === 'ar' ? (
                  <>
                    <span>{t('admin.discounts.schedule')}</span>
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <span>{t('admin.discounts.schedule')}</span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {t('admin.discounts.scheduleDescription')}
              </CardDescription>
            </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="starts_at" className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('admin.discounts.startsAt')}</Label>
                <div className="relative">
                  {i18n.language === 'ar' ? (
                    <Calendar className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  ) : (
                    <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  )}
                  <Input
                    id="starts_at"
                    {...register('starts_at')}
                    type="datetime-local"
                    className={`${i18n.language === 'ar' ? 'pr-8 text-right' : 'pl-8 text-left'} h-8 text-xs`}
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <p className={`text-xs text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('admin.discounts.startsAtHelp')}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="expires_at" className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('admin.discounts.expiresAt')}</Label>
                <div className="relative">
                  {i18n.language === 'ar' ? (
                    <Clock className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  ) : (
                    <Clock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                  )}
                  <Input
                    id="expires_at"
                    {...register('expires_at')}
                    type="datetime-local"
                    className={`${i18n.language === 'ar' ? 'pr-8 text-right' : 'pl-8 text-left'} h-8 text-xs`}
                    dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>
                <p className={`text-xs text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('admin.discounts.expiresAtHelp')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            {/* Decorative background circles */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <CardHeader className="relative pb-3">
              <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                {i18n.language === 'ar' ? (
                  <>
                    <span>{t('admin.discounts.status')}</span>
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>{t('admin.discounts.status')}</span>
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {t('admin.discounts.statusDescription')}
              </CardDescription>
            </CardHeader>
          <CardContent className="relative pt-0">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                className="scale-75"
              />
              <Label htmlFor="is_active" className="text-xs">
                {watch('is_active') ? t('admin.discounts.active') : t('admin.discounts.inactive')}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('admin.discounts.statusHelp')}
            </p>
          </CardContent>
        </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-end gap-3 "
        >
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 text-xs sm:text-sm w-full sm:w-auto">
              {t('admin.common.cancel')}
            </Button>
          )}
          <Button type="submit" disabled={loading} className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-lg hover:shadow-xl text-xs sm:text-sm w-full sm:w-auto">
            {loading ? t('admin.common.saving') : (discount ? t('admin.common.update') : t('admin.common.create'))}
          </Button>
        </motion.div>
      </form>
    </div>
  );
};

export default DiscountForm;
