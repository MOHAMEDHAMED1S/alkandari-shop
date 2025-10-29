import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  X,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Clock,
  Percent,
  DollarSign,
  Gift,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import DiscountForm from './DiscountForm';
import { deleteDiscountCode, getDiscountCodeUsage } from '@/lib/api';
import { useAdmin } from '@/contexts/AdminContext';

interface DiscountDetailsProps {
  discount: {
    id: number;
    code: string;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
    value: string;
    minimum_order_amount?: string;
    maximum_discount_amount?: string;
    usage_limit?: number;
    usage_count: number;
    is_active: boolean;
    starts_at?: string;
    expires_at?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    usage_percentage: number;
    remaining_uses?: number;
  };
  onClose: () => void;
  onUpdate: () => void;
}

const DiscountDetails: React.FC<DiscountDetailsProps> = ({ discount, onClose, onUpdate }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usageHistory, setUsageHistory] = useState<any[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed_amount': return DollarSign;
      case 'free_shipping': return Gift;
      default: return Gift;
    }
  };

  const getStatusBadgeVariant = () => {
    if (!discount.is_active) return 'secondary';
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) return 'destructive';
    if (discount.remaining_uses === 0) return 'destructive';
    return 'default';
  };

  const getStatusText = () => {
    if (!discount.is_active) return t('admin.discounts.inactive');
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) return t('admin.discounts.expired');
    if (discount.remaining_uses === 0) return t('admin.discounts.fullyUsed');
    return t('admin.discounts.active');
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteDiscountCode(token, discount.id);
      toast.success('تم حذف كود الخصم بنجاح');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error('حدث خطأ أثناء حذف كود الخصم');
    } finally {
      setLoading(false);
    }
  };

  const loadUsageHistory = async () => {
    setLoadingUsage(true);
    try {
      const data = await getDiscountCodeUsage(token, discount.id);
      setUsageHistory(data.data || []);
    } catch (error) {
      console.error('Error loading usage history:', error);
      toast.error('فشل في تحميل تاريخ الاستخدام');
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(discount.code);
    toast.success(t('admin.discounts.codeCopied'));
  };

  const TypeIcon = getTypeIcon(discount.type);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-2xl">
        <DialogHeader className="relative pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
          <DialogTitle className={`text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
            {i18n.language === 'ar' ? (
              <>
                <span>{discount.code}</span>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <TypeIcon className="w-6 h-6 text-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <TypeIcon className="w-6 h-6 text-primary" />
                </div>
                <span>{discount.code}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className={`text-slate-600 dark:text-slate-400 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
            {discount.description || t('admin.discounts.discountCodeDetails')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-4"
          >
            {/* Status and Type Row */}
            <div className="flex items-center gap-2">
              <Badge variant={getStatusBadgeVariant()} className="rounded-full px-3 py-1 text-sm font-semibold shadow-lg">
                {getStatusText()}
              </Badge>
              {discount.is_active && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-sm font-semibold bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700">
                  {t('admin.discounts.types.' + discount.type)}
                </Badge>
              )}
            </div>
            
            {/* Separator */}
            <div className="border-t border-slate-200/50 dark:border-slate-700/50 my-6"></div>
            
            {/* Action Buttons Row */}
            <div className="flex flex-row items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg flex-1"
              >
                <Copy className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.discounts.copyCode')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditForm(true)}
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg flex-1"
              >
                <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('common.edit')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="group hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2 text-red-600 group-hover:text-red-700 group-hover:scale-110 transition-all duration-300" />
                <span className="font-semibold text-red-600 group-hover:text-red-700">{t('common.delete')}</span>
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
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
                </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.code')}
                  </Label>
                  <p className={`text-lg font-mono ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{discount.code}</p>
                </div>

                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.type')}
                  </Label>
                  <div className={`flex items-center gap-2 mt-1 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                    <TypeIcon className="w-4 h-4" />
                    <span className="capitalize">
                      {t(`admin.discounts.types.${discount.type}`)}
                    </span>
                  </div>
                </div>

                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.value')}
                  </Label>
                  <p className={`text-lg font-semibold ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {discount.type === 'percentage' 
                      ? `${discount.value}%`
                      : `${discount.value} ${t('common.currency')}`
                    }
                  </p>
                </div>

                {discount.description && (
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.description')}
                    </Label>
                    <p className={`text-sm mt-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{discount.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>

            {/* Usage Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    {i18n.language === 'ar' ? (
                      <>
                        <span>{t('admin.discounts.usageStatistics')}</span>
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <span>{t('admin.discounts.usageStatistics')}</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.usage')}
                    </Label>
                    <span className="text-sm font-medium">
                      {discount.usage_count} / {discount.usage_limit || '∞'}
                    </span>
                  </div>
                  <Progress value={discount.usage_percentage} className="h-2" />
                  <p className={`text-xs text-muted-foreground mt-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {discount.usage_percentage}% {t('admin.discounts.used')}
                  </p>
                </div>

                {discount.remaining_uses !== undefined && (
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.remainingUses')}
                    </Label>
                    <p className={`text-lg font-semibold ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{discount.remaining_uses}</p>
                  </div>
                )}

                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.createdAt')}
                  </Label>
                  <p className={`text-sm ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {new Date(discount.created_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.lastUpdated')}
                  </Label>
                  <p className={`text-sm ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {new Date(discount.updated_at).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            {/* Conditions and Schedule Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Conditions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'justify-end' : 'justify-start'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                    {i18n.language === 'ar' ? (
                      <>
                        <span>{t('admin.discounts.conditions')}</span>
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <span>{t('admin.discounts.conditions')}</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
              <CardContent className="relative space-y-4">
                {discount.minimum_order_amount && (
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.minimumOrderAmount')}
                    </Label>
                    <p className={`text-sm ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {discount.minimum_order_amount} {t('common.currency')}
                    </p>
                  </div>
                )}

                {discount.maximum_discount_amount && (
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.maximumDiscountAmount')}
                    </Label>
                    <p className={`text-sm ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {discount.maximum_discount_amount} {t('common.currency')}
                    </p>
                  </div>
                )}

                {discount.usage_limit && (
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.usageLimit')}
                    </Label>
                    <p className={`text-sm ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{discount.usage_limit}</p>
                  </div>
                )}

                {!discount.minimum_order_amount && !discount.maximum_discount_amount && !discount.usage_limit && (
                  <p className={`text-sm text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.noConditions')}
                  </p>
                )}
              </CardContent>
            </Card>
            </motion.div>

            {/* Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
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
              </CardHeader>
              <CardContent className="relative space-y-4">
                {discount.starts_at && (
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.startsAt')}
                    </Label>
                    <p className={`text-sm ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {new Date(discount.starts_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {discount.expires_at && (
                  <div>
                    <Label className={`text-sm font-medium text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {t('admin.discounts.expiresAt')}
                    </Label>
                    <p className={`text-sm ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                      {new Date(discount.expires_at).toLocaleString()}
                    </p>
                    {new Date(discount.expires_at) < new Date() && (
                      <Badge variant="destructive" className={`mt-1 ${i18n.language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                        {t('admin.discounts.expired')}
                      </Badge>
                    )}
                  </div>
                )}

                {!discount.starts_at && !discount.expires_at && (
                  <p className={`text-sm text-muted-foreground ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {t('admin.discounts.noSchedule')}
                  </p>
                )}
              </CardContent>
            </Card>
            </motion.div>
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex justify-end gap-3 pt-6 border-t border-slate-200/50 dark:border-slate-700/50"
          >
            <Button 
              variant="outline" 
              onClick={onClose}
              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-md hover:shadow-lg border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold">{t('common.close')}</span>
            </Button>
          </motion.div>
        </div>

        {/* Edit Form Modal */}
        {showEditForm && (
          <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('admin.discounts.editCode')}</DialogTitle>
                <DialogDescription>
                  {t('admin.discounts.editCodeDescription')}
                </DialogDescription>
              </DialogHeader>
              <DiscountForm
                discount={discount}
                onSuccess={() => {
                  setShowEditForm(false);
                  onUpdate();
                }}
                onCancel={() => setShowEditForm(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('admin.discounts.deleteCode')}</DialogTitle>
                <DialogDescription>
                  {t('admin.discounts.deleteCodeConfirmation', { code: discount.code })}
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
      </DialogContent>
    </Dialog>
  );
};

export default DiscountDetails;
