import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Settings,
  CheckCircle,
  XCircle,
  Trash2,
  DollarSign,
  Tag,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminCategories } from '@/lib/api';

interface BulkActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onAction,
}) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [selectedAction, setSelectedAction] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionData, setActionData] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open && token) {
      fetchCategories();
    }
  }, [open, token]);

  const fetchCategories = async () => {
    if (!token) return;
    
    try {
      setLoadingCategories(true);
      const response = await getAdminCategories(token, {
        page: 1,
        per_page: 100,
        is_active: true
      });
      
      if (response.success && response.data) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(t('admin.products.errorFetchingCategories') || 'Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const actions = [
    {
      id: 'activate',
      label: t('admin.products.activate'),
      description: t('admin.products.activateDescription'),
      icon: CheckCircle,
      color: 'green',
      requiresData: false,
    },
    {
      id: 'deactivate',
      label: t('admin.products.deactivate'),
      description: t('admin.products.deactivateDescription'),
      icon: XCircle,
      color: 'red',
      requiresData: false,
    },
    {
      id: 'update_price',
      label: t('admin.products.updatePrice'),
      description: t('admin.products.updatePriceDescription'),
      icon: DollarSign,
      color: 'blue',
      requiresData: true,
      dataType: 'price',
    },
    {
      id: 'update_category',
      label: t('admin.products.updateCategory'),
      description: t('admin.products.updateCategoryDescription'),
      icon: Tag,
      color: 'purple',
      requiresData: true,
      dataType: 'category',
    },
    {
      id: 'delete',
      label: t('admin.products.deleteSelected'),
      description: t('admin.products.deleteSelectedDescription'),
      icon: Trash2,
      color: 'red',
      requiresData: false,
      destructive: true,
    },
  ];

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setActionData({});
  };

  const handleDataChange = (field: string, value: any) => {
    setActionData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExecuteAction = () => {
    const action = actions.find(a => a.id === selectedAction);
    if (!action) return;

    if (action.requiresData && action.dataType) {
      if (action.dataType === 'price' && !actionData.price) {
        toast.error(t('admin.products.priceRequired'));
        return;
      }
      if (action.dataType === 'category' && !actionData.category_id) {
        toast.error(t('admin.products.categoryRequired'));
        return;
      }
    }

    if (action.destructive) {
      setShowConfirmDialog(true);
    } else {
      executeAction();
    }
  };

  const executeAction = async () => {
    try {
      setLoading(true);
      await onAction(selectedAction, actionData);
      setSelectedAction('');
      setActionData({});
      onOpenChange(false);
    } catch (error) {
      console.error('Error executing bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmExecuteAction = async () => {
    setShowConfirmDialog(false);
    await executeAction();
  };

  const selectedActionData = actions.find(a => a.id === selectedAction);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
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
          <DialogHeader className="relative space-y-3 pb-3 border-b border-slate-200/50 dark:border-slate-700/50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
            <DialogTitle className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
              {i18n.language === 'ar' ? (
                <>
                  {t('admin.products.bulkActions')}
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  {t('admin.products.bulkActions')}
                </>
              )}
            </DialogTitle>
            <DialogDescription className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
              {t('admin.products.bulkActionsDescription', { count: selectedCount })}
            </DialogDescription>
          </DialogHeader>

          <div className="relative p-4 sm:p-6 space-y-6">
            {/* Action Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="space-y-4"
            >
              <Label className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                {i18n.language === 'ar' ? (
                  <>
                    {t('admin.products.selectAction')}
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                      <Settings className="w-5 h-5 text-blue-600" />
                    </div>
                    {t('admin.products.selectAction')}
                  </>
                )}
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
                      className="h-full"
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg h-24 ${
                          selectedAction === action.id
                            ? action.destructive 
                              ? 'ring-2 ring-red-500 bg-gradient-to-br from-red-900 to-red-800 text-white shadow-lg border-red-700'
                              : 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg border-blue-600'
                            : 'hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50'
                        } relative overflow-hidden rounded-2xl border-slate-200/50 dark:border-slate-800/30`}
                        onClick={() => handleActionSelect(action.id)}
                      >
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100/50 to-slate-200/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-full -translate-y-8 translate-x-8"></div>
                        <CardContent className="relative p-4 h-full flex items-center">
                          <div className={`flex items-center gap-3 w-full ${i18n.language === 'ar' ? 'justify-end' : ''}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
                            <div className={`p-2 rounded-xl flex-shrink-0 ${selectedAction === action.id
                              ? 'bg-white/20 text-white'
                              : action.destructive
                                ? 'bg-red-100 text-red-600'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className={`flex-1 min-w-0 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                              <h4 className={`font-semibold text-sm leading-tight ${selectedAction === action.id ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{action.label}</h4>
                              <p className={`text-xs leading-tight mt-1 ${selectedAction === action.id ? 'text-white/90' : 'text-slate-600 dark:text-slate-400'}`}>
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Data Input */}
            {selectedActionData && selectedActionData.requiresData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-4"
              >
                <Label className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                  {i18n.language === 'ar' ? (
                    <>
                      {t('admin.products.actionData')}
                      <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                        <Settings className="w-5 h-5 text-green-600" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                        <Settings className="w-5 h-5 text-green-600" />
                      </div>
                      {t('admin.products.actionData')}
                    </>
                  )}
                </Label>
                
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-4 sm:p-6">
                  {selectedActionData.dataType === 'price' && (
                    <div className="space-y-3">
                      <Label htmlFor="price" className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('admin.products.newPrice')}
                      </Label>
                      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                        <Input
                          id="price"
                          type="number"
                          step="0.001"
                          placeholder={i18n.language === 'ar' ? '0.000' : '0.000'}
                          value={actionData.price || ''}
                          onChange={(e) => handleDataChange('price', e.target.value)}
                          className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <Select
                          value={actionData.currency || 'KWD'}
                          onValueChange={(value) => handleDataChange('currency', value)}
                        >
                          <SelectTrigger className="w-24 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="KWD" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                              {i18n.language === 'ar' ? 'د.ك' : 'KWD'}
                            </SelectItem>
                            <SelectItem value="USD" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                              {i18n.language === 'ar' ? 'دولار' : 'USD'}
                            </SelectItem>
                            <SelectItem value="EUR" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                              {i18n.language === 'ar' ? 'يورو' : 'EUR'}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {selectedActionData.dataType === 'category' && (
                    <div className="space-y-3">
                      <Label htmlFor="category" className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('admin.products.newCategory')}
                      </Label>
                      <Select
                        value={actionData.category_id?.toString() || ''}
                        onValueChange={(value) => handleDataChange('category_id', parseInt(value))}
                        disabled={loadingCategories}
                      >
                        <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                          <SelectValue placeholder={loadingCategories ? (isRTL ? 'جاري التحميل...' : 'Loading...') : t('admin.products.selectCategory')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                          {loadingCategories ? (
                            <div className="flex items-center justify-center p-4">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                              <span className="ml-2 text-sm">{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                            </div>
                          ) : categories.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                              {isRTL ? 'لا توجد تصنيفات' : 'No categories found'}
                            </div>
                          ) : (
                            categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id.toString()} 
                                className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                {isRTL ? category.name_ar || category.name : category.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Warning for destructive actions */}
            {selectedActionData && selectedActionData.destructive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="space-y-4"
              >
                <Alert className="relative overflow-hidden bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200/50 dark:border-red-800/30 rounded-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-red-400/5 rounded-full translate-y-6 -translate-x-6"></div>
                  <div className={`relative flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                    {isRTL ? (
                      <>
                        <AlertDescription className="flex-1 text-right">
                          <div className="flex items-center gap-2 flex-row-reverse justify-end">
                            <p className="font-bold text-red-800 dark:text-red-200">{t('admin.products.destructiveActionWarning')}</p>
                          </div>
                          <p className={`flex items-center font-bold text-red-800 dark:text-red-200 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                            {t('admin.products.destructiveActionDescription', { count: selectedCount })}
                          </p>
                        </AlertDescription>
                        <div className="relative p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <AlertDescription className="flex-1 text-left">
                          <div className="flex items-center gap-2 flex-row">
                            <p className="font-bold text-red-800 dark:text-red-200">{t('admin.products.destructiveActionWarning')}</p>
                          </div>
                          <p className={`flex items-center font-bold text-red-800 dark:text-red-200 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                            {t('admin.products.destructiveActionDescription', { count: selectedCount })}
                          </p>
                        </AlertDescription>
                      </>
                    )}
                  </div>
                </Alert>
              </motion.div>
            )}
          </div>

          <DialogFooter className={`pt-6 border-t border-slate-200/50 dark:border-slate-700/50 ${isRTL ? 'space-y-3' : 'flex flex-col sm:flex-row sm:justify-end gap-3'}`}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="w-full sm:w-auto group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl"
            >
              <span className="font-semibold">{t('admin.common.cancel')}</span>
            </Button>
            <Button
              onClick={handleExecuteAction}
              disabled={loading || !selectedAction}
              variant={selectedActionData?.destructive ? 'destructive' : 'default'}
              className={`w-full sm:w-auto group transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl ${
                selectedActionData?.destructive 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white' 
                  : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white'
              }`}
            >
              {loading && <Loader2 className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />}
              <span className="font-semibold">{t('admin.products.executeAction')}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-2xl">
          <AlertDialogHeader className={`pb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <AlertDialogTitle className={`text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : 'flex-row'}`}>
              {isRTL ? (
                <>
                  {t('admin.products.confirmBulkAction')}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full blur-sm"></div>
                    <AlertTriangle className="relative w-6 h-6 text-red-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full blur-sm"></div>
                    <AlertTriangle className="relative w-6 h-6 text-red-600" />
                  </div>
                  {t('admin.products.confirmBulkAction')}
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription className={`text-slate-600 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t('admin.products.confirmBulkActionDescription', { 
                action: selectedActionData?.label,
                count: selectedCount 
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={`pt-6 border-t border-slate-200/50 dark:border-slate-700/50 ${isRTL ? 'space-y-3' : 'flex flex-col sm:flex-row sm:justify-end gap-3'}`}>
            <AlertDialogCancel className="w-full sm:w-auto group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl">
              <span className="font-semibold">{t('admin.common.cancel')}</span>
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmExecuteAction}
              className="w-full sm:w-auto group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all duration-300 hover:scale-105 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl"
            >
              <span className="font-semibold">{t('admin.products.confirmAction')}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkActions;

