import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
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
  Clock,
  Truck,
  Package,
  Trash2,
  AlertTriangle,
  Loader2,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';

interface OrderBulkActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onAction: (action: string, data?: any) => void;
}

const OrderBulkActions: React.FC<OrderBulkActionsProps> = ({
  open,
  onOpenChange,
  selectedCount,
  onAction,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [selectedAction, setSelectedAction] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionData, setActionData] = useState<any>({});

  const actions = [
    {
      id: 'update_status',
      label: t('admin.orders.updateStatus'),
      description: t('admin.orders.updateStatusDescription'),
      icon: Settings,
      color: 'blue',
      requiresData: true,
      dataType: 'status',
    },
    {
      id: 'print_invoices',
      label: isRTL ? 'طباعة الفواتير' : 'Print Invoices',
      description: isRTL ? 'طباعة فواتير الطلبات المحددة' : 'Print invoices for selected orders',
      icon: Printer,
      color: 'green',
      requiresData: false,
    },
  ];

  const statusOptions = [
    { value: 'pending', label: t('admin.orders.statuses.pending'), icon: Clock },
    { value: 'awaiting_payment', label: t('admin.orders.statuses.awaiting_payment'), icon: AlertTriangle },
    { value: 'paid', label: t('admin.orders.statuses.paid'), icon: CheckCircle },
    { value: 'shipped', label: t('admin.orders.statuses.shipped'), icon: Truck },
    { value: 'delivered', label: t('admin.orders.statuses.delivered'), icon: Package },
    { value: 'cancelled', label: t('admin.orders.statuses.cancelled'), icon: XCircle },
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
      if (action.dataType === 'status' && !actionData.status) {
        toast.error(t('admin.orders.statusRequired'));
        return;
      }
    }

    // معالجة الطباعة فوراً
    if (selectedAction === 'print_invoices') {
      executeAction();
      return;
    }

    if (false) {
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
          <DialogHeader className="relative space-y-3 pb-3 border-b border-slate-200/50 dark:border-slate-700/50" dir={isRTL ? 'rtl' : 'ltr'}>
            <DialogTitle className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
              {isRTL ? (
                <>
                  {t('admin.orders.bulkActions')}
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Settings className="w-6 h-6 text-primary" />
                  </div>
                  {t('admin.orders.bulkActions')}
                </>
              )}
            </DialogTitle>
            <DialogDescription className={`flex items-center gap-2  ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
              {t('admin.orders.bulkActionsDescription', { count: selectedCount })}
            </DialogDescription>
          </DialogHeader>

          <div className="relative p-4 sm:p-6 space-y-6">
            {/* Action Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                    {isRTL ? (
                      <>
                        {t('admin.orders.selectAction')}
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                          <Settings className="w-5 h-5 text-blue-600" />
                        </div>
                        {t('admin.orders.selectAction')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
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
                                ? false
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
                                  : false
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Action Data Input */}
            {selectedActionData && selectedActionData.requiresData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                      {isRTL ? (
                        <>
                          {t('admin.orders.actionData')}
                          <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                            <Settings className="w-5 h-5 text-green-600" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                            <Settings className="w-5 h-5 text-green-600" />
                          </div>
                          {t('admin.orders.actionData')}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative space-y-4">
                    {selectedActionData.dataType === 'status' && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t('admin.orders.newStatus')}
                        </label>
                        <Select
                          value={actionData.status || ''}
                          onValueChange={(value) => handleDataChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('admin.orders.selectStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => {
                              const Icon = option.icon;
                              return (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    {/* Admin Notes Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t('admin.orders.adminNotes')}
                      </label>
                      <textarea
                        className="w-full min-h-[80px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-800 dark:text-white"
                        placeholder={t('admin.orders.adminNotesPlaceholder')}
                        value={actionData.admin_notes || ''}
                        onChange={(e) => handleDataChange('admin_notes', e.target.value)}
                      />
                    </div>
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
              >
                 <Alert className={`relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200/50 dark:border-red-800/30 rounded-2xl shadow-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                   <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -translate-y-8 translate-x-8"></div>
                   <AlertDescription className={`text-red-800 dark:text-red-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                     <div className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                       <p className="font-semibold text-sm sm:text-base md:text-lg">{t('admin.orders.destructiveActionWarning')}</p>
                       <AlertTriangle className="h-5 w-5 text-red-600" />
                     </div>
                     <p className={`flex items-center gap-2 text-sm sm:text-base  ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                       {t('admin.orders.destructiveActionDescription', { count: selectedCount })}
                     </p>
                   </AlertDescription>
                 </Alert>
              </motion.div>
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className={`pt-4 border-t border-slate-200/50 dark:border-slate-700/50 ${isRTL ? 'space-y-3' : 'flex flex-col sm:flex-row sm:justify-end gap-3'}`}
          >
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className={`group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-md hover:shadow-lg border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500 ${isRTL ? 'w-full' : 'w-full sm:w-auto'}`}
            >
              <XCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-300`} />
              <span className="font-semibold">{t('admin.common.cancel')}</span>
            </Button>
            <Button
              onClick={handleExecuteAction}
              disabled={loading || !selectedAction}
              variant={selectedActionData?.destructive ? 'destructive' : 'default'}
              className={`group hover:scale-105 transition-all duration-300 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl ${isRTL ? 'w-full' : 'w-full sm:w-auto'}`}
            >
              {loading ? (
                <>
                  <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                  <span className="font-semibold">{t('common.processing')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} group-hover:scale-110 transition-transform duration-300`} />
                  <span className="font-semibold">{t('admin.orders.executeAction')}</span>
                </>
              )}
            </Button>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.orders.confirmBulkAction')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.orders.confirmBulkActionDescription', { 
                action: selectedActionData?.label,
                count: selectedCount 
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExecuteAction}>
              {t('admin.orders.confirmAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrderBulkActions;
