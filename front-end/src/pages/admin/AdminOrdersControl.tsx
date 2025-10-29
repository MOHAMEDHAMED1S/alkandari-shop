import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import {
  getAdminOrdersStatus,
  toggleOrders,
  setOrdersStatus as setOrdersStatusAPI,
  OrdersStatus,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ShoppingCart,
  Power,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Lock,
  Unlock,
} from 'lucide-react';
import { toast } from 'sonner';

const AdminOrdersControl: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [ordersStatus, setOrdersStatus] = useState<OrdersStatus | null>(null);

  useEffect(() => {
    if (token) {
      fetchOrdersStatus();
    }
  }, [token]);

  const fetchOrdersStatus = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await getAdminOrdersStatus(token);

      if (response.success) {
        setOrdersStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching orders status:', error);
      toast.error(isRTL ? 'فشل تحميل حالة الطلبات' : 'Failed to load orders status');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrders = async () => {
    if (!token) return;

    try {
      setUpdating(true);
      const response = await toggleOrders(token);

      if (response.success) {
        setOrdersStatus(response.data);
        toast.success(response.message || (isRTL ? 'تم التحديث بنجاح' : 'Updated successfully'));
      }
    } catch (error: any) {
      console.error('Error toggling orders:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setUpdating(false);
    }
  };

  const handleSetOrdersStatus = async (enabled: boolean) => {
    if (!token) return;

    try {
      setUpdating(true);
      const response = await setOrdersStatusAPI(token, enabled);

      if (response.success) {
        setOrdersStatus(response.data);
        toast.success(response.message || (isRTL ? 'تم التحديث بنجاح' : 'Updated successfully'));
      }
    } catch (error: any) {
      console.error('Error setting orders status:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setUpdating(false);
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
                {isRTL ? 'التحكم في الطلبات' : 'Orders Control'}
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </h1>
            </motion.div>
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <Button
                onClick={fetchOrdersStatus}
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
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                {isRTL ? 'التحكم في الطلبات' : 'Orders Control'}
              </h1>
            </motion.div>
            <Button
              onClick={fetchOrdersStatus}
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

      {/* Current Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
          <div className={`absolute top-0 w-20 h-20 rounded-full -translate-y-10 ${ordersStatus?.orders_enabled ? 'bg-green-500/10 right-0 translate-x-10' : 'bg-red-500/10 left-0 -translate-x-10'}`}></div>
          <CardHeader className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
            <CardTitle className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse order-2 justify-end' : 'order-1 justify-start'}`}>
                <Power className={`h-6 w-6 text-blue-600 ${isRTL ? 'order-2' : 'order-1'}`} />
                <span className={`font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'order-1' : 'order-2'}`}>{isRTL ? 'حالة الطلبات الحالية' : 'Current Orders Status'}</span>
              </div>
              <Badge 
                variant={ordersStatus?.orders_enabled ? 'default' : 'secondary'} 
                className={`font-semibold ${ordersStatus?.orders_enabled ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-1 ${isRTL ? 'order-1' : 'order-2'}`}
              >
                {ordersStatus?.orders_enabled 
                  ? (isRTL ? '🟢 مفتوحة' : '🟢 Open') 
                  : (isRTL ? '🔴 مغلقة' : '🔴 Closed')}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL
                ? 'الحالة الحالية لاستقبال الطلبات على الموقع'
                : 'Current status of accepting orders on the website'}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className={`p-4 sm:p-6 rounded-xl ${ordersStatus?.orders_enabled ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/30' : 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30'}`}>
              <div className={`flex items-center pb-2 gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                {ordersStatus?.orders_enabled ? (
                  <CheckCircle className={`h-8 w-8 text-green-600 dark:text-green-400 ${isRTL ? 'order-2' : 'order-1'}`} />
                ) : (
                  <XCircle className={`h-8 w-8 text-red-600 dark:text-red-400 ${isRTL ? 'order-2' : 'order-1'}`} />
                )}
                <div className={`${isRTL ? 'order-1 text-right' : 'order-2 text-left'}`}>
                  <p className={`font-bold text-lg ${ordersStatus?.orders_enabled ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {ordersStatus?.orders_enabled 
                      ? (isRTL ? 'الطلبات مفتوحة' : 'Orders are Open') 
                      : (isRTL ? 'الطلبات مغلقة' : 'Orders are Closed')}
                  </p>
         
                </div>
              </div>

              {/* Quick Toggle */}
              <div className={`flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`text-sm font-medium ${isRTL ? 'text-right order-2' : 'text-left order-1'}`}>{isRTL ? 'التبديل السريع' : 'Quick Toggle'}</span>
                <Switch
                  checked={ordersStatus?.orders_enabled || false}
                  onCheckedChange={handleToggleOrders}
                  disabled={updating}
                  className={isRTL ? 'order-1' : 'order-2'}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alert Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {ordersStatus?.orders_enabled ? (
          <Alert className={`border-l-4 border-l-green-500 bg-gradient-to-r from-green-50/80 to-green-50/40 dark:from-green-950/30 dark:to-green-950/10 rounded-xl ${isRTL ? 'text-right' : 'text-left'}`}>
            <CheckCircle className={`h-5 w-5 text-green-600 ${isRTL ? 'order-2' : 'order-1'}`} />
            <div className={`flex-1 ${isRTL ? 'order-1' : 'order-2'}`}>
              <AlertTitle className="text-green-900 dark:text-green-100 font-semibold" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? 'الطلبات مفتوحة ' : 'Orders are Open '}
              </AlertTitle>
              <AlertDescription className="text-green-800 dark:text-green-200 text-sm" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL
                  ? 'العملاء يمكنهم إتمام الطلبات بشكل طبيعي على الموقع. يمكنك إغلاق الطلبات مؤقتاً إذا كنت بحاجة لذلك.'
                  : 'Customers can complete orders normally on the website. You can close orders temporarily if needed.'}
              </AlertDescription>
            </div>
          </Alert>
        ) : (
          <Alert className={`border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/80 to-red-50/40 dark:from-red-950/30 dark:to-red-950/10 rounded-xl ${isRTL ? 'text-right' : 'text-left'}`}>
            <AlertTriangle className={`h-5 w-5 text-red-600 ${isRTL ? 'order-2' : 'order-1'}`} />
            <div className={`flex-1 ${isRTL ? 'order-1' : 'order-2'}`}>
              <AlertTitle className="text-red-900 dark:text-red-100 font-semibold" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL ? 'الطلبات مغلقة ' : 'Orders are Closed '}
              </AlertTitle>
              <AlertDescription className="text-red-800 dark:text-red-200 text-sm" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                {isRTL
                  ? 'العملاء لا يمكنهم إتمام الطلبات حالياً. سيتم عرض رسالة لهم تفيد بأن الطلبات مغلقة مؤقتاً بسبب ضغط الطلبات.'
                  : 'Customers cannot complete orders currently. A message will be displayed informing them that orders are temporarily closed due to high demand.'}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </motion.div>

      {/* Control Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className={`relative ${isRTL ? 'text-right' : 'text-left'}`}>
            <CardTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'justify-start'}`}>
              <Power className={`h-5 w-5 text-purple-600 ${isRTL ? 'order-2' : 'order-1'}`} />
              <span className={`font-bold text-slate-800 dark:text-slate-200 ${isRTL ? 'order-1' : 'order-2'}`}>{isRTL ? 'خيارات التحكم' : 'Control Options'}</span>
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400" style={{ textAlign: isRTL ? 'right' : 'left' }}>
              {isRTL
                ? 'يمكنك فتح أو إغلاق الطلبات على الموقع'
                : 'You can open or close orders on the website'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Open Orders Button */}
              <Button
                onClick={() => handleSetOrdersStatus(true)}
                disabled={updating || ordersStatus?.orders_enabled}
                className="w-full h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
              
                <div className="text-center">
                  <p className="font-bold text-lg">{isRTL ? 'فتح الطلبات' : 'Open Orders'}</p>
           
                </div>
              </Button>

              {/* Close Orders Button */}
              <Button
                onClick={() => handleSetOrdersStatus(false)}
                disabled={updating || !ordersStatus?.orders_enabled}
                className="w-full h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
             
                <div className="text-center">
                  <p className="font-bold text-lg">{isRTL ? 'إغلاق الطلبات' : 'Close Orders'}</p>
             
                </div>
              </Button>
            </div>

            {/* Info Box */}
            <Alert className={`border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/80 to-blue-50/40 dark:from-blue-950/30 dark:to-blue-950/10 rounded-xl ${isRTL ? 'text-right' : 'text-left'}`}>
              <AlertTriangle className={`h-5 w-5 text-blue-600 ${isRTL ? 'order-2' : 'order-1'}`} />
              <div className={`flex-1 ${isRTL ? 'order-1' : 'order-2'}`}>
                <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL ? 'ملاحظة هامة' : 'Important Note'}
                </AlertTitle>
                <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm" style={{ textAlign: isRTL ? 'right' : 'left' }}>
                  {isRTL
                    ? 'عند إغلاق الطلبات، سيتم عرض رسالة للعملاء تفيد بأن الطلبات مغلقة مؤقتاً بسبب ضغط الطلبات. يمكنك فتح الطلبات مرة أخرى في أي وقت.'
                    : 'When orders are closed, customers will see a message that orders are temporarily closed due to high demand. You can reopen orders at any time.'}
                </AlertDescription>
              </div>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminOrdersControl;
