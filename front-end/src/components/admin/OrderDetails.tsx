import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Info,
  AlertTriangle,
} from 'lucide-react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: string;
  payment_status: string;
  total_amount: string;
  currency: string;
  shipping_address: {
    street: string;
    city: string;
    governorate: string;
    postal_code?: string;
  };
  created_at: string;
  updated_at: string;
  payment?: {
    payment_method: string;
    invoice_reference: string;
  };
  order_items?: Array<{
    id: number;
    order_id: number;
    product_id: number;
    product_price: string;
    quantity: number;
    size?: string;
    product_snapshot: {
      title: string;
      slug: string;
      description: string;
      short_description: string;
      price: string;
      currency: string;
      images: string[];
      meta: any;
      category: string;
    };
    product: {
      id: number;
      title: string;
      slug: string;
      description: string;
      short_description: string;
      price: string;
      currency: string;
      is_available: boolean;
      category_id: number;
      images: string[];
      meta: any;
      created_at: string;
      updated_at: string;
    };
  }>;
  admin_notes?: string;
  tracking_number?: string;
  shipping_date?: string;
  delivery_date?: string;
  discount_code?: string;
  discount_amount?: string;
  subtotal_amount?: string;
  shipping_amount?: string;
  free_shipping?: boolean;
}

interface OrderDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  open,
  onOpenChange,
  order,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'awaiting_payment': return AlertTriangle;
      case 'paid': return CheckCircle;
      case 'shipped': return Truck;
      case 'delivered': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'awaiting_payment': return 'red';
      case 'paid': return 'green';
      case 'shipped': return 'blue';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const StatusIcon = getStatusIcon(order.status);
  const statusColor = getStatusColor(order.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/50 dark:border-slate-700/50 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-2xl [&>button]:hidden"
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
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            {isRTL ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </Button>
                <DialogTitle className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 text-right justify-end`}>
                  {t('admin.orders.orderDetails')} - #{order.order_number}
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                </DialogTitle>
              </>
            ) : (
              <>
                <DialogTitle className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 text-left`}>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  {t('admin.orders.orderDetails')} - #{order.order_number}
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
          <DialogDescription className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
            {t('admin.orders.orderDetailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="relative p-4 sm:p-6 space-y-6">
          {/* Order Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
              <CardHeader className="relative pb-3">
                <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  {isRTL ? (
                    <>
                      {t('admin.orders.orderStatus')}
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                        <StatusIcon className={`w-5 h-5 text-${statusColor}-600`} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                        <StatusIcon className={`w-5 h-5 text-${statusColor}-600`} />
                      </div>
                      {t('admin.orders.orderStatus')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-4 sm:p-6">
                <div className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  {isRTL ? (
                    <>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t('admin.orders.lastUpdated')}: {formatDate(order.updated_at)}
                      </p>
                      <Badge variant="default" className={`bg-${statusColor}-100 text-${statusColor}-800`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {t(`admin.orders.statuses.${order.status}`)}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Badge variant="default" className={`bg-${statusColor}-100 text-${statusColor}-800`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {t(`admin.orders.statuses.${order.status}`)}
                      </Badge>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {t('admin.orders.lastUpdated')}: {formatDate(order.updated_at)}
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
          </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                    {isRTL ? (
                      <>
                        {t('admin.orders.customerInformation')}
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        {t('admin.orders.customerInformation')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-4 sm:p-6 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.orders.customerName')}
                    </label>
                    <p className="text-sm font-medium">{order.customer_name}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.orders.customerPhone')}
                    </label>
                    <p className="text-sm font-medium">{order.customer_phone}</p>
                  </div>

                  {order.customer_email && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('admin.orders.customerEmail')}
                      </label>
                      <p className="text-sm font-medium">{order.customer_email}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping Address */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                    {isRTL ? (
                      <>
                        {t('admin.orders.shippingAddress')}
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                          <MapPin className="w-5 h-5 text-green-600" />
                        </div>
                        {t('admin.orders.shippingAddress')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-4 sm:p-6 space-y-2">
                  <p className="text-sm">{order.shipping_address.street}</p>
                  <p className="text-sm">{order.shipping_address.city}</p>
                  <p className="text-sm">{order.shipping_address.governorate}</p>
                  {order.shipping_address.postal_code && (
                    <p className="text-sm">{order.shipping_address.postal_code}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Items */}
          {order.order_items && order.order_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  {isRTL ? (
                    <>
                      {t('admin.orders.orderItems')}
                      <Package className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      {t('admin.orders.orderItems')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items.map((item, index) => (
                    <div key={item.id} className="flex-rtl items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.product_snapshot.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('admin.orders.quantity')}: {item.quantity}
                        </p>
                        {item.size && (
                          <p className="text-sm text-primary font-medium">
                            {isRTL ? 'المقاس' : 'Size'}: {item.size}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {item.product_snapshot.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.product_price} {i18n.language === 'ar' ? 'د.ك' : order.currency}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('admin.orders.total')}: {(parseFloat(item.product_price) * item.quantity).toFixed(2)} {i18n.language === 'ar' ? 'د.ك' : order.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Information */}
          {order.payment && (
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  {isRTL ? (
                    <>
                      {t('admin.orders.paymentInformation')}
                      <CreditCard className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {t('admin.orders.paymentInformation')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    {t('admin.orders.paymentMethod')}
                  </label>
                  <p className="text-sm font-medium">
                    {order.payment.payment_method === 'kn' ? t('admin.orders.knet') :
                     order.payment.payment_method === 'md' ? t('admin.orders.creditCard') :
                     order.payment.payment_method === 'visa' ? t('admin.orders.creditCard') :
                     order.payment.payment_method === 'mastercard' ? t('admin.orders.creditCard') :
                     order.payment.payment_method}
                  </p>
                </div>

                {order.payment.invoice_reference && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {t('admin.orders.invoiceReference')}
                    </label>
                    <p className="text-sm font-mono">{order.payment.invoice_reference}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
              <CardHeader className="relative pb-3">
                <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  {isRTL ? (
                    <>
                      {t('admin.orders.orderSummary')}
                      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                      </div>
                      {t('admin.orders.orderSummary')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-4 sm:p-6">
                <div className="space-y-3">
                  {order.subtotal_amount && (
                    <div className={`flex justify-between ${isRTL ? 'flex-row' : 'flex-row'}`}>
                      {isRTL ? (
                        <>
                          <span className="text-sm font-medium">
                            {order.subtotal_amount} {i18n.language === 'ar' ? 'د.ك' : order.currency}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.orders.subtotal')}:</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.orders.subtotal')}:</span>
                          <span className="text-sm font-medium">
                            {order.subtotal_amount} {i18n.language === 'ar' ? 'د.ك' : order.currency}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {order.shipping_amount && parseFloat(order.shipping_amount) > 0 && (
                    <div className={`flex justify-between ${isRTL ? 'flex-row' : 'flex-row'}`}>
                      {isRTL ? (
                        <>
                          <span className="text-sm font-medium">
                            {order.free_shipping ? t('admin.orders.free') : `${order.shipping_amount} ${i18n.language === 'ar' ? 'د.ك' : order.currency}`}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {order.free_shipping ? t('admin.orders.shipping') : t('admin.orders.shippingFees')}:
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {order.free_shipping ? t('admin.orders.shipping') : t('admin.orders.shippingFees')}:
                          </span>
                          <span className="text-sm font-medium">
                            {order.free_shipping ? t('admin.orders.free') : `${order.shipping_amount} ${i18n.language === 'ar' ? 'د.ك' : order.currency}`}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {order.discount_amount && parseFloat(order.discount_amount) > 0 && (
                    <div className={`flex justify-between ${isRTL ? 'flex-row' : 'flex-row'}`}>
                      {isRTL ? (
                        <>
                          <span className="text-sm font-medium text-green-600">
                            -{order.discount_amount} {i18n.language === 'ar' ? 'د.ك' : order.currency}
                          </span>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('admin.orders.discount')} {order.discount_code && `(${order.discount_code})`}:
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {t('admin.orders.discount')} {order.discount_code && `(${order.discount_code})`}:
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            -{order.discount_amount} {i18n.language === 'ar' ? 'د.ك' : order.currency}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className={`flex justify-between text-lg font-bold ${isRTL ? 'flex-row' : 'flex-row'}`}>
                    {isRTL ? (
                      <>
                        <span className="text-primary font-bold">{order.total_amount} {i18n.language === 'ar' ? 'د.ك' : order.currency}</span>
                        <span className="text-slate-800 dark:text-slate-200">{t('admin.orders.total')}:</span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-800 dark:text-slate-200">{t('admin.orders.total')}:</span>
                        <span className="text-primary font-bold">{order.total_amount} {i18n.language === 'ar' ? 'د.ك' : order.currency}</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

         

          {/* Admin Notes */}
          {order.admin_notes && (
            <Card>
              <CardHeader>
                <CardTitle className={`text-lg flex items-center gap-2 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  {isRTL ? (
                    <>
                      {t('admin.orders.adminNotes')}
                      <FileText className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      {t('admin.orders.adminNotes')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{order.admin_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Order Timestamps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8"></div>
              <CardHeader className="relative pb-3">
                <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  {isRTL ? (
                    <>
                      {t('admin.orders.orderTimestamps')}
                      <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl">
                        <Calendar className="w-5 h-5 text-orange-600" />
                      </div>
                      {t('admin.orders.orderTimestamps')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.orders.orderDate')}
                    </label>
                    <p className="text-sm font-medium">{formatDate(order.created_at)}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.orders.lastUpdated')}
                    </label>
                    <p className="text-sm font-medium">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetails;
