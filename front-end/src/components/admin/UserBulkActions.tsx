import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  User,
  Mail,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Key,
  Lock,
  Unlock
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

interface UserBulkActionsProps {
  selectedIds: number[];
  onClose: () => void;
  onSuccess: () => void;
}

const UserBulkActions: React.FC<UserBulkActionsProps> = ({ selectedIds, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [actionData, setActionData] = useState<any>({});

  const actions = [
    {
      id: 'activate',
      label: t('admin.users.activate'),
      description: t('admin.users.activateDescription'),
      icon: UserCheck,
      color: 'text-green-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'deactivate',
      label: t('admin.users.deactivate'),
      description: t('admin.users.deactivateDescription'),
      icon: UserX,
      color: 'text-orange-600',
      requiresData: false,
      destructive: false,
    },
    {
      id: 'change_role',
      label: t('admin.users.changeRole'),
      description: t('admin.users.changeRoleDescription'),
      icon: Shield,
      color: 'text-blue-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'change_password',
      label: t('admin.users.changePassword'),
      description: t('admin.users.changePasswordDescription'),
      icon: Key,
      color: 'text-purple-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'send_email',
      label: t('admin.users.sendEmail'),
      description: t('admin.users.sendEmailDescription'),
      icon: Mail,
      color: 'text-blue-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'export',
      label: t('admin.users.export'),
      description: t('admin.users.exportDescription'),
      icon: Download,
      color: 'text-green-600',
      requiresData: true,
      destructive: false,
    },
    {
      id: 'delete',
      label: t('admin.users.delete'),
      description: t('admin.users.deleteDescription'),
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
          response = await bulkActivateUsers(selectedIds);
          break;
        case 'deactivate':
          response = await bulkDeactivateUsers(selectedIds);
          break;
        case 'change_role':
          response = await bulkChangeRole(selectedIds, actionData);
          break;
        case 'change_password':
          response = await bulkChangePassword(selectedIds, actionData);
          break;
        case 'send_email':
          response = await bulkSendEmail(selectedIds, actionData);
          break;
        case 'export':
          response = await bulkExportUsers(selectedIds, actionData);
          break;
        case 'delete':
          response = await bulkDeleteUsers(selectedIds);
          break;
        default:
          throw new Error('Invalid action');
      }

      if (response.success) {
        toast.success(response.message || t('admin.users.bulkActionSuccess'));
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || t('admin.users.bulkActionError'));
      }
    } catch (error) {
      console.error('Error executing bulk action:', error);
      toast.error(t('admin.users.bulkActionError'));
    } finally {
      setLoading(false);
    }
  };

  // Mock API functions - replace with actual API calls
  const bulkActivateUsers = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.users.activatedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDeactivateUsers = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.users.deactivatedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkChangeRole = async (ids: number[], data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.users.roleChangedSuccessfully', { count: ids.length, role: data.role }) });
      }, 1000);
    });
  };

  const bulkChangePassword = async (ids: number[], data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.users.passwordChangedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkSendEmail = async (ids: number[], data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.users.emailSentSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkExportUsers = async (ids: number[], data: any) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.users.exportedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const bulkDeleteUsers = async (ids: number[]) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: t('admin.users.deletedSuccessfully', { count: ids.length }) });
      }, 1000);
    });
  };

  const selectedActionConfig = actions.find(action => action.id === selectedAction);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoreHorizontal className="w-5 h-5" />
            {t('admin.users.bulkActions')}
          </DialogTitle>
          <DialogDescription>
            {t('admin.users.bulkActionsDescription', { count: selectedIds.length })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Action Selection */}
          <div className="space-y-4">
            <Label>{t('admin.users.selectAction')}</Label>
            <div className="grid grid-cols-1 gap-3">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <Card
                    key={action.id}
                    className={`cursor-pointer transition-colors ${
                      selectedAction === action.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleActionSelect(action.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${action.color}`} />
                        <div className="flex-1">
                          <h4 className="font-medium">{action.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        {action.destructive && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Action Data Input */}
          {selectedActionConfig?.requiresData && (
            <div className="space-y-4">
              <Label>{t('admin.users.actionData')}</Label>
              
              {selectedAction === 'change_role' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="newRole">{t('admin.users.newRole')}</Label>
                    <Select
                      value={actionData.role || ''}
                      onValueChange={(value) => setActionData({ ...actionData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.users.selectNewRole')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            {t('admin.users.roles.admin')}
                          </div>
                        </SelectItem>
                        <SelectItem value="customer">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {t('admin.users.roles.customer')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedAction === 'change_password' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="newPassword">{t('admin.users.newPassword')}</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder={t('admin.users.newPasswordPlaceholder')}
                      value={actionData.password || ''}
                      onChange={(e) => setActionData({ ...actionData, password: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">{t('admin.users.confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder={t('admin.users.confirmPasswordPlaceholder')}
                      value={actionData.password_confirmation || ''}
                      onChange={(e) => setActionData({ ...actionData, password_confirmation: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {selectedAction === 'send_email' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="emailSubject">{t('admin.users.emailSubject')}</Label>
                    <Input
                      id="emailSubject"
                      placeholder={t('admin.users.emailSubjectPlaceholder')}
                      value={actionData.subject || ''}
                      onChange={(e) => setActionData({ ...actionData, subject: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailMessage">{t('admin.users.emailMessage')}</Label>
                    <Textarea
                      id="emailMessage"
                      placeholder={t('admin.users.emailMessagePlaceholder')}
                      value={actionData.message || ''}
                      onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emailType">{t('admin.users.emailType')}</Label>
                    <Select
                      value={actionData.type || 'notification'}
                      onValueChange={(value) => setActionData({ ...actionData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.users.selectEmailType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notification">{t('admin.users.notification')}</SelectItem>
                        <SelectItem value="announcement">{t('admin.users.announcement')}</SelectItem>
                        <SelectItem value="custom">{t('admin.users.custom')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedAction === 'export' && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="exportFormat">{t('admin.users.exportFormat')}</Label>
                    <Select
                      value={actionData.format || 'csv'}
                      onValueChange={(value) => setActionData({ ...actionData, format: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.users.selectFormat')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="includePermissions">{t('admin.users.includePermissions')}</Label>
                    <Select
                      value={actionData.includePermissions || 'no'}
                      onValueChange={(value) => setActionData({ ...actionData, includePermissions: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.users.selectIncludePermissions')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no">{t('admin.users.no')}</SelectItem>
                        <SelectItem value="yes">{t('admin.users.yes')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warning for destructive actions */}
          {selectedActionConfig?.destructive && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('admin.users.destructiveActionWarning')}
              </AlertDescription>
            </Alert>
          )}

          {/* Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">{t('admin.users.actionSummary')}</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{t('admin.users.selectedItems', { count: selectedIds.length })}</p>
              <p>{t('admin.users.selectedAction', { action: selectedActionConfig?.label || t('admin.users.noActionSelected') })}</p>
              {selectedActionConfig?.requiresData && actionData && Object.keys(actionData).length > 0 && (
                <p>{t('admin.users.actionDataProvided', { data: JSON.stringify(actionData) })}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleExecute}
              disabled={loading || !selectedAction || (selectedActionConfig?.requiresData && !actionData)}
              variant={selectedActionConfig?.destructive ? 'destructive' : 'default'}
            >
              {loading ? t('common.processing') : t('admin.users.executeAction')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserBulkActions;
