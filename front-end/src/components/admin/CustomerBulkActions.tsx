import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  UserCheck,
  UserX,
  Star,
  Mail,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  UserPlus,
  UserMinus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface CustomerBulkActionsProps {
  selectedIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

const CustomerBulkActions: React.FC<CustomerBulkActionsProps> = ({ selectedIds, onClose, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionData, setActionData] = useState<any>({});

  const actions = [
    {
      id: 'activate',
      label: t('admin.customers.activate'),
      description: t('admin.customers.activateDescription'),
      icon: UserCheck,
      color: 'text-green-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'deactivate',
      label: t('admin.customers.deactivate'),
      description: t('admin.customers.deactivateDescription'),
      icon: UserX,
      color: 'text-orange-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'upgrade_to_vip',
      label: t('admin.customers.upgradeToVip'),
      description: t('admin.customers.upgradeToVipDescription'),
      icon: Star,
      color: 'text-purple-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'downgrade_from_vip',
      label: t('admin.customers.downgradeFromVip'),
      description: t('admin.customers.downgradeFromVipDescription'),
      icon: UserMinus,
      color: 'text-blue-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'send_email',
      label: t('admin.customers.sendEmail'),
      description: t('admin.customers.sendEmailDescription'),
      icon: Mail,
      color: 'text-blue-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'export',
      label: t('admin.customers.export'),
      description: t('admin.customers.exportDescription'),
      icon: Download,
      color: 'text-green-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'delete',
      label: t('admin.customers.delete'),
      description: t('admin.customers.deleteDescription'),
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
      let response;

      switch (selectedAction) {
        case 'activate':
          response = await bulkActivateCustomers(selectedIds);
          break;
        case 'deactivate':
          response = await bulkDeactivateCustomers(selectedIds);
          break;
        case 'upgrade_to_vip':
          response = await bulkUpgradeToVip(selectedIds);
          break;
        case 'downgrade_from_vip':
          response = await bulkDowngradeFromVip(selectedIds);
          break;
        case 'send_email':
          response = await bulkSendEmail(selectedIds, actionData);
          break;
        case 'export':
          response = await bulkExportCustomers(selectedIds, actionData);
          break;
        case 'delete':
          response = await bulkDeleteCustomers(selectedIds);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.success) {
        toast.success(response.message || t('admin.customers.bulkActionSuccess'));
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || t('admin.customers.bulkActionError'));
      }
    } catch (error) {
      console.error('Error executing bulk action:', error);
      toast.error(t('admin.customers.bulkActionError'));
    } finally {
      setLoading(false);
    }
  };

  // Mock API functions - replace with actual API calls
  const bulkActivateCustomers = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.customers.activatedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDeactivateCustomers = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.customers.deactivatedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkUpgradeToVip = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.customers.upgradedToVipSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDowngradeFromVip = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.customers.downgradedFromVipSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkSendEmail = async (ids: number[], data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.customers.emailSentSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkExportCustomers = async (ids: number[], data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.customers.exportedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDeleteCustomers = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.customers.deletedSuccessfully', { count: ids.length }) });
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
                {t('admin.customers.bulkActions')}
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <MoreHorizontal className="w-6 h-6 text-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <MoreHorizontal className="w-6 h-6 text-primary" />
                </div>
                {t('admin.customers.bulkActions')}
              </>
            )}
          </DialogTitle>
          <DialogDescription className={`text-sm sm:text-base text-slate-600 dark:text-slate-400 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
            {t('admin.customers.bulkActionsDescription', { count: selectedIds.length })}
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
            <Label className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                <MoreHorizontal className="w-5 h-5 text-blue-600" />
              </div>
              {t('admin.customers.selectAction')}
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
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        selectedAction === action.id
                          ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg'
                          : 'hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50'
                      } relative overflow-hidden rounded-2xl border-slate-200/50 dark:border-slate-800/30`}
                      onClick={() => handleActionSelect(action.id)}
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-slate-100/50 to-slate-200/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-full -translate-y-8 translate-x-8"></div>
                      <CardContent className="relative p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${action.color} bg-gradient-to-br from-current/20 to-current/10`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200">{action.label}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {action.description}
                            </p>
                          </div>
                          {action.destructive && (
                            <div className="p-2 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-xl">
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            </div>
                          )}
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
            <div className="space-y-4">
              <Label>{t('admin.customers.actionData')}</Label>
              
              {selectedAction === 'send_email' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="emailSubject">{t('admin.customers.emailSubject')}</Label>
                    <Input
                      id="emailSubject"
                      placeholder={t('admin.customers.emailSubjectPlaceholder')}
                      value={actionData.subject || ''}
                      onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailMessage">{t('admin.customers.emailMessage')}</Label>
                    <Textarea
                      id="emailMessage"
                      placeholder={t('admin.customers.emailMessagePlaceholder')}
                      value={actionData.message || ''}
                      onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailType">{t('admin.customers.emailType')}</Label>
                    <Select
                      value={actionData.type || 'promotional'}
                      onValueChange={(value) => setActionData({ ...actionData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.customers.selectEmailType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="promotional">{t('admin.customers.promotional')}</SelectItem>
                        <SelectItem value="newsletter">{t('admin.customers.newsletter')}</SelectItem>
                        <SelectItem value="announcement">{t('admin.customers.announcement')}</SelectItem>
                        <SelectItem value="custom">{t('admin.customers.custom')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedAction === 'export' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="exportFormat">{t('admin.customers.exportFormat')}</Label>
                    <Select
                      value={actionData.format || 'csv'}
                      onValueChange={(value) => setActionData({ ...actionData, format: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.customers.selectFormat')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="includeOrders">{t('admin.customers.includeOrders')}</Label>
                    <Select
                      value={actionData.includeOrders || 'no'}
                      onValueChange={(value) => setActionData({ ...actionData, includeOrders: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.customers.selectIncludeOrders')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">{t('admin.customers.no')}</SelectItem>
                        <SelectItem value="yes">{t('admin.customers.yes')}</SelectItem>
                        <SelectItem value="summary">{t('admin.customers.summaryOnly')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning for destructive actions */}
          {selectedActionConfig?.destructive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Alert className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200/50 dark:border-red-800/30 rounded-2xl shadow-lg">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 rounded-full -translate-y-8 translate-x-8"></div>
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200 font-semibold">
                  {t('admin.customers.destructiveActionWarning')}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
              <CardContent className="relative p-4 sm:p-6">
                <h4 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  {t('admin.customers.actionSummary')}
                </h4>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <p className="font-semibold">{t('admin.customers.selectedItems', { count: selectedIds.length })}</p>
                  <p className="font-semibold">{t('admin.customers.selectedAction', { action: selectedActionConfig?.label || t('admin.customers.noActionSelected') })}</p>
                  {selectedActionConfig?.requiresData && actionData && Object.keys(actionData).length > 0 && (
                    <p className="font-semibold">{t('admin.customers.actionDataProvided', { data: JSON.stringify(actionData) })}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex justify-end gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-700/50"
          >
            <Button 
              variant="outline" 
              onClick={onClose}
              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-md hover:shadow-lg border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500"
            >
              <XCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-semibold">{t('common.cancel')}</span>
            </Button>
            <Button
              onClick={handleExecute}
              disabled={loading || !selectedAction || (selectedActionConfig?.requiresData && !actionData)}
              variant={selectedActionConfig?.destructive ? 'destructive' : 'default'}
              className="group hover:scale-105 transition-all duration-300 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  <span className="font-semibold">{t('common.processing')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-semibold">{t('admin.customers.executeAction')}</span>
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerBulkActions;
