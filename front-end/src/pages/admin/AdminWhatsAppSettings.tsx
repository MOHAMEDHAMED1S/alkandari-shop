import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import {
  getWhatsAppSettings,
  updateWhatsAppSetting,
  toggleWhatsAppGlobal,
  toggleWhatsAppAdminNotifications,
  toggleWhatsAppDeliveryNotifications,
  testWhatsAppConnection,
  WhatsAppSetting,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  MessageCircle,
  Phone,
  Users,
  Truck,
  Image,
  Power,
  Bell,
  BellOff,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminWhatsAppSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState<WhatsAppSetting[]>([]);

  // Local state for editing
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [adminPhones, setAdminPhones] = useState<string[]>([]);
  const [deliveryPhones, setDeliveryPhones] = useState<string[]>([]);
  const [adminNotificationEnabled, setAdminNotificationEnabled] = useState(true);
  const [deliveryNotificationEnabled, setDeliveryNotificationEnabled] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [testPhone, setTestPhone] = useState('');

  useEffect(() => {
    if (token) {
      fetchSettings();
    }
  }, [token]);

  const fetchSettings = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getWhatsAppSettings(token);

      if (response.success && response.data) {
        setSettings(response.data);

        // تحديث الحالة المحلية
        response.data.forEach((setting: WhatsAppSetting) => {
          switch (setting.key) {
            case 'whatsapp_enabled':
              setWhatsappEnabled(setting.value as boolean);
              break;
            case 'admin_phones':
              setAdminPhones(Array.isArray(setting.value) ? setting.value : []);
              break;
            case 'delivery_phones':
              setDeliveryPhones(Array.isArray(setting.value) ? setting.value : []);
              break;
            case 'admin_notification_enabled':
              setAdminNotificationEnabled(setting.value as boolean);
              break;
            case 'delivery_notification_enabled':
              setDeliveryNotificationEnabled(setting.value as boolean);
              break;
            case 'logo_url':
              setLogoUrl(setting.value as string);
              break;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      toast.error(isRTL ? 'فشل تحميل الإعدادات' : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGlobal = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const response = await toggleWhatsAppGlobal(token);

      if (response.success) {
        setWhatsappEnabled(response.data.whatsapp_enabled);
        toast.success(response.message || (isRTL ? 'تم التحديث بنجاح' : 'Updated successfully'));
      }
    } catch (error: any) {
      console.error('Error toggling global WhatsApp:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAdminNotifications = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const response = await toggleWhatsAppAdminNotifications(token);

      if (response.success) {
        setAdminNotificationEnabled(response.data.admin_notification_enabled);
        toast.success(response.message || (isRTL ? 'تم التحديث بنجاح' : 'Updated successfully'));
      }
    } catch (error: any) {
      console.error('Error toggling admin notifications:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDeliveryNotifications = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const response = await toggleWhatsAppDeliveryNotifications(token);

      if (response.success) {
        setDeliveryNotificationEnabled(response.data.delivery_notification_enabled);
        toast.success(response.message || (isRTL ? 'تم التحديث بنجاح' : 'Updated successfully'));
      }
    } catch (error: any) {
      console.error('Error toggling delivery notifications:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePhones = async (key: 'admin_phones' | 'delivery_phones', phones: string[]) => {
    if (!token) return;

    try {
      setSaving(true);
      const cleanPhones = phones.filter(p => p.trim() !== '');
      const response = await updateWhatsAppSetting(token, key, {
        value: cleanPhones,
        is_active: true,
      });

      if (response.success) {
        toast.success(response.message || (isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully'));
        fetchSettings();
      }
    } catch (error: any) {
      console.error('Error updating phones:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateLogoUrl = async () => {
    if (!token) return;

    try {
      setSaving(true);
      const response = await updateWhatsAppSetting(token, 'logo_url', {
        value: logoUrl,
        is_active: true,
      });

      if (response.success) {
        toast.success(response.message || (isRTL ? 'تم الحفظ بنجاح' : 'Saved successfully'));
        fetchSettings();
      }
    } catch (error: any) {
      console.error('Error updating logo URL:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل الحفظ' : 'Save failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!token || !testPhone.trim()) {
      toast.error(isRTL ? 'الرجاء إدخال رقم الهاتف' : 'Please enter phone number');
      return;
    }

    try {
      setTesting(true);
      const response = await testWhatsAppConnection(token, testPhone.trim());

      if (response.success) {
        toast.success(isRTL ? '✅ تم إرسال الرسالة بنجاح' : '✅ Message sent successfully');
      } else {
        toast.error(response.error || (isRTL ? 'فشل إرسال الرسالة' : 'Failed to send message'));
      }
    } catch (error: any) {
      console.error('Error testing connection:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل الاختبار' : 'Test failed'));
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-2 space-y-4 sm:space-y-6 mt-4">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        {isRTL ? (
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-end w-full sm:w-auto order-1 sm:order-2"
            >
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
                {isRTL ? 'إعدادات واتساب' : 'WhatsApp Settings'}
                <MessageCircle className="h-8 w-8 text-green-600" />
              </h1>
            </motion.div>
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <Button
                onClick={fetchSettings}
                disabled={loading}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 ml-2" />
                )}
                <span className="font-semibold">{isRTL ? 'تحديث' : 'Refresh'}</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left"
            >
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-green-600" />
                {isRTL ? 'إعدادات واتساب' : 'WhatsApp Settings'}
              </h1>
            </motion.div>
            <Button
              onClick={fetchSettings}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              <span className="font-semibold">{isRTL ? 'تحديث' : 'Refresh'}</span>
            </Button>
          </>
        )}
      </motion.div>

      {/* Global WhatsApp Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        whileHover={{ scale: 1.01, y: -2 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 rounded-2xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
            <CardTitle className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse order-2 justify-end' : 'order-1 justify-start'}`}>
                <Power className={`h-6 w-6 text-green-600 ${isRTL ? 'order-2' : 'order-1'}`} />
                <span className={`font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'order-1' : 'order-2'}`}>{isRTL ? 'حالة واتساب العامة' : 'Global WhatsApp Status'}</span>
              </div>
              <Badge variant={whatsappEnabled ? 'default' : 'secondary'} className={`font-semibold ${whatsappEnabled ? 'bg-green-600 hover:bg-green-700' : ''} ${isRTL ? 'order-1' : 'order-2'}`}>
                {whatsappEnabled ? (isRTL ? 'مفعّل' : 'Enabled') : (isRTL ? 'معطّل' : 'Disabled')}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL
                ? 'تفعيل أو إلغاء تفعيل جميع رسائل واتساب في النظام'
                : 'Enable or disable all WhatsApp messages in the system'}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <div className={`flex items-center justify-between p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse order-2' : 'order-1'}`}>
                {whatsappEnabled ? (
                  <CheckCircle className={`h-6 w-6 text-green-600 ${isRTL ? 'order-2' : 'order-1'}`} />
                ) : (
                  <XCircle className={`h-6 w-6 text-red-600 ${isRTL ? 'order-2' : 'order-1'}`} />
                )}
                <div className={`${isRTL ? 'order-1 text-right' : 'order-2 text-left'}`}>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {whatsappEnabled ? (isRTL ? 'واتساب مفعّل' : 'WhatsApp Enabled') : (isRTL ? 'واتساب معطّل' : 'WhatsApp Disabled')}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {whatsappEnabled
                      ? (isRTL ? 'سيتم إرسال الرسائل' : 'Messages will be sent')
                      : (isRTL ? 'لن يتم إرسال أي رسائل' : 'No messages will be sent')}
                  </p>
                </div>
              </div>
              <Switch
                checked={whatsappEnabled}
                onCheckedChange={handleToggleGlobal}
                disabled={saving}
                className={isRTL ? 'order-1' : 'order-2'}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Admin Phones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          whileHover={{ scale: 1.01, y: -2 }}
          className="group"
        >
          <Card className="h-full relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 rounded-2xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                <Users className={`h-5 w-5 text-blue-600 ${isRTL ? 'order-2' : 'order-1'}`} />
                <span className={`font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'order-1' : 'order-2'}`}>{isRTL ? 'أرقام الأدمن' : 'Admin Phones'}</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? 'أرقام واتساب لاستقبال إشعارات الأدمن' : 'WhatsApp numbers to receive admin notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className={`flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right order-2' : 'text-left order-1'}`}>{isRTL ? 'إشعارات الأدمن' : 'Admin Notifications'}</span>
                <Switch
                  checked={adminNotificationEnabled}
                  onCheckedChange={handleToggleAdminNotifications}
                  disabled={saving}
                  className={isRTL ? 'order-1' : 'order-2'}
                />
              </div>

              <div className="space-y-2">
                {adminPhones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...adminPhones];
                        newPhones[index] = e.target.value;
                        setAdminPhones(newPhones);
                      }}
                      placeholder={isRTL ? 'رقم الهاتف' : 'Phone number'}
                      className="rounded-xl border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-600"
                      dir="ltr"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newPhones = adminPhones.filter((_, i) => i !== index);
                        setAdminPhones(newPhones);
                      }}
                      className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAdminPhones([...adminPhones, ''])}
                  className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="font-semibold">{isRTL ? 'إضافة رقم' : 'Add Number'}</span>
                </Button>
                <Button
                  onClick={() => handleUpdatePhones('admin_phones', adminPhones)}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  <span className="font-semibold">{isRTL ? 'حفظ' : 'Save'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Delivery Phones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ scale: 1.01, y: -2 }}
          className="group"
        >
          <Card className="h-full relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 rounded-2xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <CardHeader className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
              <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
                <Truck className={`h-5 w-5 text-purple-600 ${isRTL ? 'order-2' : 'order-1'}`} />
                <span className={`font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'order-1' : 'order-2'}`}>{isRTL ? 'أرقام المندوبين' : 'Delivery Phones'}</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-600 dark:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? 'أرقام واتساب لاستقبال إشعارات التوصيل' : 'WhatsApp numbers to receive delivery notifications'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <div className={`flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right order-2' : 'text-left order-1'}`}>{isRTL ? 'إشعارات التوصيل' : 'Delivery Notifications'}</span>
                <Switch
                  checked={deliveryNotificationEnabled}
                  onCheckedChange={handleToggleDeliveryNotifications}
                  disabled={saving}
                  className={isRTL ? 'order-1' : 'order-2'}
                />
              </div>

              <div className="space-y-2">
                {deliveryPhones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={phone}
                      onChange={(e) => {
                        const newPhones = [...deliveryPhones];
                        newPhones[index] = e.target.value;
                        setDeliveryPhones(newPhones);
                      }}
                      placeholder={isRTL ? 'رقم الهاتف' : 'Phone number'}
                      className="rounded-xl border-slate-300 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-600"
                      dir="ltr"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newPhones = deliveryPhones.filter((_, i) => i !== index);
                        setDeliveryPhones(newPhones);
                      }}
                      className="rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeliveryPhones([...deliveryPhones, ''])}
                  className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="font-semibold">{isRTL ? 'إضافة رقم' : 'Add Number'}</span>
                </Button>
                <Button
                  onClick={() => handleUpdatePhones('delivery_phones', deliveryPhones)}
                  disabled={saving}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  <span className="font-semibold">{isRTL ? 'حفظ' : 'Save'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Logo URL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 rounded-2xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardHeader className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
              <Image className={`h-5 w-5 text-indigo-600 ${isRTL ? 'order-2' : 'order-1'}`} />
              <span className={`font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'order-1' : 'order-2'}`}>{isRTL ? 'رابط الشعار' : 'Logo URL'}</span>
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL ? 'رابط شعار المتجر المستخدم في رسائل واتساب' : 'Store logo URL used in WhatsApp messages'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <Input
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="rounded-xl border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-600"
              dir="ltr"
            />
            <Button
              onClick={handleUpdateLogoUrl}
              disabled={saving}
              className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              <span className="font-semibold">{isRTL ? 'حفظ رابط الشعار' : 'Save Logo URL'}</span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Test Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        whileHover={{ scale: 1.01, y: -2 }}
        className="group"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 rounded-2xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardHeader className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
              <Send className={`h-5 w-5 text-green-600 ${isRTL ? 'order-2' : 'order-1'}`} />
              <span className={`font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'order-1' : 'order-2'}`}>{isRTL ? 'اختبار الاتصال' : 'Test Connection'}</span>
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL ? 'أرسل رسالة تجريبية للتأكد من عمل واتساب بشكل صحيح' : 'Send a test message to verify WhatsApp is working correctly'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 relative">
            <Alert className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/80 to-amber-50/40 dark:from-amber-950/30 dark:to-amber-950/10 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
                {isRTL ? 'ملاحظة هامة' : 'Important Note'}
              </AlertTitle>
              <AlertDescription className="text-amber-800 dark:text-amber-200 text-sm">
                {isRTL
                  ? 'سيتم إرسال رسالة تجريبية إلى الرقم المحدد. تأكد من كتابة الرقم بشكل صحيح (مثال: 201062532581)'
                  : 'A test message will be sent to the specified number. Make sure to enter the number correctly (example: 201062532581)'}
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder={isRTL ? 'رقم الهاتف (مثال: 201062532581)' : 'Phone number (example: 201062532581)'}
                className="rounded-xl border-slate-300 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-600"
                dir="ltr"
              />
              <Button
                onClick={handleTestConnection}
                disabled={testing || !testPhone.trim()}
                className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap"
              >
                {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                <span className="font-semibold">{isRTL ? 'اختبار' : 'Test'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminWhatsAppSettings;

