import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Calendar,
  Package,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getAdminOrders } from '@/lib/api';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: string;
  currency: string;
  status: string;
  created_at: string;
}

const AdminPaymentVerification = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAwaitingPaymentOrders, setTotalAwaitingPaymentOrders] = useState(0);

  const toArabicNumerals = (num: string | number | undefined | null): string => {
    if (i18n.language !== 'ar') return num?.toString() || '0';
    if (num === undefined || num === null || num === '') return '0';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  const getLocalizedCurrency = (currency: string | undefined | null): string => {
    if (i18n.language === 'ar') return 'د.ك';
    return currency || 'KWD';
  };

  useEffect(() => {
    fetchAwaitingPaymentOrders();
  }, [currentPage]);

  const fetchAwaitingPaymentOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error(isRTL ? 'الرجاء تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      const response = await getAdminOrders(token, {
        status: 'awaiting_payment',
        per_page: 20,
        page: currentPage
      });

      if (response.success) {
        setOrders(response.data.orders.data || []);
        setTotalPages(response.data.orders.last_page || 1);
        setTotalAwaitingPaymentOrders(response.data.summary?.awaiting_payment_orders || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(
        isRTL 
          ? 'حدث خطأ أثناء جلب الطلبات' 
          : 'Error fetching orders'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFixOrder = (orderId: number) => {
    const fixUrl = `https://api.expo-alkandari.com/api/v1/payments/success?order_id=${orderId}`;
    window.open(fixUrl, '_blank');
    toast.success(isRTL ? 'تم فتح رابط التصحيح' : 'Fix link opened');
  };

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
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {isRTL ? 'تصحيح حالة الدفع' : 'Payment Status Correction'}
              </h1>
            </motion.div>
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <Button
                onClick={fetchAwaitingPaymentOrders}
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
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {isRTL ? 'تصحيح حالة الدفع' : 'Payment Status Correction'}
              </h1>
            </motion.div>
            <Button
              onClick={fetchAwaitingPaymentOrders}
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

      {/* Info Alert */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <Alert className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/80 to-blue-50/40 dark:from-blue-950/30 dark:to-blue-950/10 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">
            {isRTL ? 'معلومات هامة' : 'Important Information'}
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200 text-sm">
            {isRTL 
              ? 'هذه الصفحة تعرض جميع الطلبات التي حالتها "في انتظار الدفع". استخدم زر التصحيح لتحديث حالة الدفع للطلبات المدفوعة.'
              : 'This page displays all orders with "awaiting payment" status. Use the fix button to update the payment status for paid orders.'
            }
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="group"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 sm:p-2">
            <div className="flex items-center justify-between">
              {isRTL ? (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-7 w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      {isRTL ? 'طلبات في انتظار الدفع' : 'Orders Awaiting Payment'}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {toArabicNumerals(totalAwaitingPaymentOrders)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      {isRTL ? 'طلبات في انتظار الدفع' : 'Orders Awaiting Payment'}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {toArabicNumerals(totalAwaitingPaymentOrders)}
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-7 w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700 hover:from-slate-100 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-800">
                  <TableHead className={`font-bold text-slate-700 dark:text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'رقم الطلب' : 'Order #'}</TableHead>
                  <TableHead className={`font-bold text-slate-700 dark:text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'العميل' : 'Customer'}</TableHead>
                  <TableHead className={`font-bold text-slate-700 dark:text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'المبلغ' : 'Amount'}</TableHead>
                  <TableHead className={`font-bold text-slate-700 dark:text-slate-200 ${isRTL ? 'text-right' : 'text-left'}`}>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200 text-center">{isRTL ? 'الإجراء' : 'Action'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {isRTL ? 'جاري التحميل...' : 'Loading...'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          {isRTL ? '✅ لا توجد طلبات في انتظار الدفع' : '✅ No orders awaiting payment'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, index) => (
                    <TableRow
                      key={order.id}
                      className="group transition-all duration-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 hover:shadow-sm"
                    >
                      <TableCell className="py-4">
                        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Package className="h-4 w-4 text-orange-600" />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">
                            #{order.order_number}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <User className="h-3 w-3 text-slate-500" />
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {order.customer_name}
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <Phone className="h-3 w-3 text-slate-500" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {order.customer_phone}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                            {toArabicNumerals(Number(order.total_amount).toFixed(2))}
                          </span>
                          <span className="text-sm text-slate-500">
                            {getLocalizedCurrency(order.currency)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(order.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            size="sm"
                            onClick={() => handleFixOrder(order.id)}
                            className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <ExternalLink className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {isRTL ? 'تصحيح' : 'Fix'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-3 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {isRTL ? '✅ لا توجد طلبات في انتظار الدفع' : '✅ No orders awaiting payment'}
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-orange-600" />
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        #{order.order_number}
                      </span>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
                      {isRTL ? 'في انتظار الدفع' : 'Awaiting Payment'}
                    </Badge>
                  </div>

                  {/* Customer Info */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-500" />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {order.customer_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-slate-500" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {order.customer_phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-slate-500" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg mb-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isRTL ? 'المبلغ' : 'Amount'}
                    </span>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {toArabicNumerals(Number(order.total_amount).toFixed(2))}
                      </span>
                      <span className="text-sm text-slate-500">
                        {getLocalizedCurrency(order.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Fix Button */}
                  <Button
                    size="sm"
                    onClick={() => handleFixOrder(order.id)}
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <ExternalLink className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {isRTL ? 'تصحيح حالة الدفع' : 'Fix Payment Status'}
                  </Button>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-4 border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {isRTL ? 'السابق' : 'Previous'}
              </Button>
              <div className="flex items-center gap-2 order-first sm:order-none">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isRTL ? `صفحة ${toArabicNumerals(currentPage)} من ${toArabicNumerals(totalPages)}` : `Page ${currentPage} of ${totalPages}`}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {isRTL ? 'التالي' : 'Next'}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminPaymentVerification;
