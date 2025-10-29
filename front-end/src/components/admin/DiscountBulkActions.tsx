import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Copy,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toggleDiscountCodeStatus, deleteDiscountCode, duplicateDiscountCode } from '@/lib/api';
import { useAdmin } from '@/contexts/AdminContext';

interface DiscountBulkActionsProps {
  selectedIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

const DiscountBulkActions: React.FC<DiscountBulkActionsProps> = ({ selectedIds, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionData, setActionData] = useState<any>({});

  const actions = [
    {
      id: 'activate',
      label: t('admin.discounts.activate'),
      description: t('admin.discounts.activateDescription'),
      icon: ToggleRight,
      color: 'text-green-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'deactivate',
      label: t('admin.discounts.deactivate'),
      description: t('admin.discounts.deactivateDescription'),
      icon: ToggleLeft,
      color: 'text-orange-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'duplicate',
      label: t('admin.discounts.duplicate'),
      description: t('admin.discounts.duplicateDescription'),
      icon: Copy,
      color: 'text-blue-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'extend',
      label: t('admin.discounts.extendExpiry'),
      description: t('admin.discounts.extendExpiryDescription'),
      icon: Calendar,
      color: 'text-purple-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'delete',
      label: t('admin.discounts.delete'),
      description: t('admin.discounts.deleteDescription'),
      icon: Trash2,
      color: 'text-red-600',
      requiresData: false,
      destructive: true,
    },
  ];

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
    setActionData({});
  };

  const handleExecute = async () => {
    if (!selectedAction) return;

    setLoading(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      switch (selectedAction) {
        case 'activate':
        case 'deactivate':
          for (const id of selectedIds) {
            try {
              await toggleDiscountCodeStatus(token, id);
              successCount++;
            } catch (error) {
              errorCount++;
              console.error(`Error toggling status for discount ${id}:`, error);
            }
          }
          break;
        case 'duplicate':
          for (const id of selectedIds) {
            try {
              await duplicateDiscountCode(token, id);
              successCount++;
            } catch (error) {
              errorCount++;
              console.error(`Error duplicating discount ${id}:`, error);
            }
          }
          break;
        case 'delete':
          for (const id of selectedIds) {
            try {
              await deleteDiscountCode(token, id);
              successCount++;
            } catch (error) {
              errorCount++;
              console.error(`Error deleting discount ${id}:`, error);
            }
          }
          break;
        default:
          throw new Error('Invalid action');
      }

      if (successCount > 0) {
        toast.success(`تم تنفيذ العملية بنجاح على ${successCount} من أكواد الخصم`);
        onSuccess();
        onClose();
      }
      
      if (errorCount > 0) {
        toast.error(`فشل في تنفيذ العملية على ${errorCount} من أكواد الخصم`);
      }
    } catch (error) {
      console.error('Error executing bulk action:', error);
      toast.error('حدث خطأ أثناء تنفيذ العملية المجمعة');
    } finally {
      setLoading(false);
    }
  };

  // Mock API functions - replace with actual API calls
  const bulkActivateDiscounts = async (ids: number[]) => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.discounts.activatedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDeactivateDiscounts = async (ids: number[]) => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.discounts.deactivatedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDuplicateDiscounts = async (ids: number[], data: any) => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.discounts.duplicatedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkExtendDiscounts = async (ids: number[], data: any) => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.discounts.extendedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDeleteDiscounts = async (ids: number[]) => {
    // TODO: Replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.discounts.deletedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const selectedActionConfig = actions.find(action => action.id === selectedAction);

  return (
    <Dialog open={true} onOpenChange={onClose}>
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
                {t('admin.discounts.bulkActions')}
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <MoreHorizontal className="w-6 h-6 text-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <MoreHorizontal className="w-6 h-6 text-primary" />
                </div>
                {t('admin.discounts.bulkActions')}
              </>
            )}
          </DialogTitle>
          <DialogDescription className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
            {t('admin.discounts.bulkActionsDescription', { count: selectedIds.length })}
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
                  {t('admin.discounts.selectAction')}
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                    <MoreHorizontal className="w-5 h-5 text-blue-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                    <MoreHorizontal className="w-5 h-5 text-blue-600" />
                  </div>
                  {t('admin.discounts.selectAction')}
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
                            : `${action.color} bg-gradient-to-br from-current/20 to-current/10`
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
          {selectedActionConfig?.requiresData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="space-y-4"
            >
              <Label className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                {i18n.language === 'ar' ? (
                  <>
                    {t('admin.discounts.actionData')}
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    {t('admin.discounts.actionData')}
                  </>
                )}
              </Label>
              
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardContent className="relative p-4 sm:p-6">
                  {selectedAction === 'duplicate' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="newCode" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.discounts.newCodePrefix')}</Label>
                        <Input
                          id="newCode"
                          placeholder="COPY"
                          value={actionData.codePrefix || ''}
                          onChange={(e) => setActionData({ ...actionData, codePrefix: e.target.value })}
                          className="mt-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {t('admin.discounts.newCodePrefixHelp')}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.discounts.duplicateQuantity')}</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max="10"
                          value={actionData.quantity || 1}
                          onChange={(e) => setActionData({ ...actionData, quantity: parseInt(e.target.value) || 1 })}
                          className="mt-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>
                    </div>
                  )}

                  {selectedAction === 'extend' && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="extendDays" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.discounts.extendByDays')}</Label>
                        <Input
                          id="extendDays"
                          type="number"
                          min="1"
                          value={actionData.extendDays || ''}
                          onChange={(e) => setActionData({ ...actionData, extendDays: parseInt(e.target.value) || 0 })}
                          className="mt-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {t('admin.discounts.extendByDaysHelp')}
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="newExpiryDate" className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.discounts.newExpiryDate')}</Label>
                        <Input
                          id="newExpiryDate"
                          type="datetime-local"
                          value={actionData.newExpiryDate || ''}
                          onChange={(e) => setActionData({ ...actionData, newExpiryDate: e.target.value })}
                          className="mt-2 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                          {t('admin.discounts.newExpiryDateHelp')}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Warning for destructive actions */}
          {selectedActionConfig?.destructive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
               <Alert className={`relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200/50 dark:border-red-800/30 rounded-2xl shadow-lg ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                 <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -translate-y-8 translate-x-8"></div>
                 <AlertDescription className={`text-red-800 dark:text-red-200 font-semibold flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                   <div className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
                     <p className="font-semibold">{t('admin.discounts.destructiveActionWarning')}</p>
                     <AlertTriangle className="h-5 w-5 text-red-600" />
                   </div>
                 </AlertDescription>
               </Alert>
            </motion.div>
          )}


          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className={`pt-4 border-t border-slate-200/50 dark:border-slate-700/50 ${i18n.language === 'ar' ? 'space-y-3' : 'flex flex-col sm:flex-row sm:justify-end gap-3'}`}
          >
            <Button
              variant="outline"
              onClick={onClose}
              className={`group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-md hover:shadow-lg border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 ${i18n.language === 'ar' ? 'w-full' : 'w-full sm:w-auto'}`}
            >
              <XCircle className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-300`} />
              <span className="font-semibold">{t('common.cancel')}</span>
            </Button>
            <Button
              onClick={handleExecute}
              disabled={loading || !selectedAction || (selectedActionConfig?.requiresData && !actionData)}
              variant={selectedActionConfig?.destructive ? 'destructive' : 'default'}
              className={`group hover:scale-105 transition-all duration-300 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl ${i18n.language === 'ar' ? 'w-full' : 'w-full sm:w-auto'}`}
            >
              {loading ? (
                <>
                  <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'}`}></div>
                  <span className="font-semibold">{t('common.processing')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className={`w-4 h-4 ${i18n.language === 'ar' ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-300`} />
                  <span className="font-semibold">{t('admin.discounts.executeAction')}</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountBulkActions;
