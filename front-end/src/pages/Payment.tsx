import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { initiatePayment, getPaymentMethods, PaymentMethod, verifyPayment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { AnimatedButton } from '@/components/ui/animated-button';
import { toast } from 'sonner';
import { Loader2, CreditCard, Shield, Clock, ArrowRight, ArrowLeft, Package, Truck, Tag, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRTL } from '@/hooks/useRTL';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
};

const Payment = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isRTL } = useRTL();
  const orderNumber = searchParams.get('order');
  const [loading, setLoading] = useState(false);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Function to convert numbers to Arabic numerals
  const toArabicNumerals = (num: string | number): string => {
    if (i18n.language !== 'ar') return num.toString();
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  // Function to get localized currency
  const getLocalizedCurrency = (currency: string): string => {
    if (i18n.language === 'ar') {
      return 'د.ك'; // Arabic currency symbol
    }
    return currency; // English currency
  };

  useEffect(() => {
    const loadData = async () => {
      // Get order data from localStorage
      const savedOrderData = localStorage.getItem('current_order');
      if (savedOrderData) {
        setOrderData(JSON.parse(savedOrderData));
      } else if (!orderNumber) {
        navigate('/cart');
        return;
      }

      // Get cart items from localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }

      // Fetch payment methods
      try {
        const response = await getPaymentMethods();
        if (response.success) {
          // Convert object to array for display
          const methodsArray = Object.values(response.data);
          setPaymentMethods(methodsArray);
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error);
        toast.error(t('payment.methodsLoadError'));
      } finally {
        setLoadingMethods(false);
      }
    };

    loadData();
  }, [orderNumber, navigate]); // Removed 't' from dependencies

  // Get customer IP
  const getCustomerIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get IP:', error);
      return '0.0.0.0';
    }
  };

  const handlePayment = async (paymentMethodCode: string) => {
    if (!orderNumber || !orderData || !orderData.order_id) {
      toast.error(t('payment.orderNotFound'));
      return;
    }

    setSelectedMethod(paymentMethodCode);
    setLoading(true);
    
    try {
      const customerIP = await getCustomerIP();
      const userAgent = navigator.userAgent;

      const response = await initiatePayment({
        order_id: orderData.order_id,
        payment_method: paymentMethodCode,
        customer_ip: customerIP,
        user_agent: userAgent,
      });

      if (response.success && response.data) {
        // Save payment data for verification
        localStorage.setItem('payment_data', JSON.stringify({
          payment_id: response.data.payment_id,
          invoice_id: response.data.invoice_id,
          order_id: orderData.order_id,
          order_number: orderNumber
        }));
        
        // Redirect to MyFatoorah payment page
        if (response.data.payment_url || response.data.redirect_url) {
          const redirectUrl = response.data.payment_url || response.data.redirect_url;
          
          // Show loading state
          setPaymentStatus('redirecting');
          toast.info(t('payment.redirecting'));
          
          // Small delay to show the loading state
          setTimeout(() => {
            window.location.href = redirectUrl;
          }, 1000);
        } else {
          // Payment completed directly
          toast.success(response.message || t('payment.success'));
          localStorage.removeItem('current_order');
          localStorage.removeItem('payment_data');
          navigate(`/payment/success?order=${orderNumber}`);
        }
      } else {
        toast.error(response.message || t('payment.failed'));
        navigate(`/payment/failure?order=${orderNumber}&error=initiation_failed`);
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || error.message || t('payment.failed');
      toast.error(errorMessage);
      navigate(`/payment/failure?order=${orderNumber}&error=network_error`);
    } finally {
      setLoading(false);
    }
  };

  if (!orderData || loadingMethods) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex items-center justify-center px-4"
      >
        <div className={cn("text-center max-w-lg mx-auto", isRTL && "text-right")}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative mb-6 sm:mb-8 md:mb-10"
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-2xl">
              <Loader2 className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary drop-shadow-lg animate-spin" />
            </div>
            <motion.div 
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
              className={cn("absolute -bottom-3 sm:-bottom-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl", isRTL ? "-left-3 sm:-left-4" : "-right-3 sm:-right-4")}
            >
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            {t('payment.loading')}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6 sm:mb-8 md:mb-10 text-base sm:text-lg md:text-xl leading-relaxed"
          >
            {t('payment.loadingMessage')}
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (paymentStatus === 'redirecting') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex items-center justify-center px-4"
      >
        <div className={cn("text-center max-w-lg mx-auto", isRTL && "text-right")}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="relative mb-6 sm:mb-8 md:mb-10"
          >
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 mx-auto bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-2xl sm:rounded-3xl flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-2xl">
              <CreditCard className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary drop-shadow-lg" />
          </div>
            <motion.div 
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
              className={cn("absolute -bottom-3 sm:-bottom-4 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl", isRTL ? "-left-3 sm:-left-4" : "-right-3 sm:-right-4")}
            >
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl Pb-2 sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            {t('payment.redirecting')}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6 pb-2 sm:mb-8 md:mb-10 text-base sm:text-lg md:text-xl leading-relaxed"
          >
            {t('payment.redirectingMessage')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={cn("flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground bg-gray-50 dark:bg-gray-700/50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl", isRTL && "flex-row-reverse")}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <span className="font-medium">{t('payment.securePayment')}</span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800" 
      style={{ 
        overflow: 'auto',
        position: 'relative'
      }}
    >
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-10">
        <div className="max-w-4xl mx-auto">
          {/* Header with gradient */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("mb-6 sm:mb-8 md:mb-10", isRTL && "text-right")}
          >
            <div className={cn("flex items-center gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3", isRTL && "justify-end")}>
              {isRTL ? (
                <>
                  <h1 className="text-2xl pb-2 sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent">
                    {t('payment.title')}
                  </h1>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent">
                    {t('payment.title')}
                  </h1>
                </>
              )}
            </div>
            <div className={cn("flex items-center gap-2 sm:gap-3", isRTL && "justify-end")}>
              {isRTL ? (
                <>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium">
                    {t('payment.subtitle')}
                  </p>
                  <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-transparent to-primary rounded-full"></div>
                </>
              ) : (
                <>
                  <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium">
                    {t('payment.subtitle')}
                  </p>
                </>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Order Summary */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <motion.div
                variants={itemVariants}
                className="group bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className={cn("flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6", isRTL && "justify-end")}>
                    {isRTL ? (
                      <>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {t('payment.orderSummary')}
                        </h2>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <Package className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {t('payment.orderSummary')}
            </h2>
                      </>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4 md:space-y-5">
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                      {isRTL ? (
                        <>
                          <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white font-mono">
                            {toArabicNumerals(orderNumber || '')}
                          </span>
                          <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('payment.orderNumber')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('payment.orderNumber')}</span>
                          <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white font-mono">
                            {toArabicNumerals(orderNumber || '')}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Cart Items */}
                    {cartItems.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <h3 className={cn("text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-right", isRTL && "text-left")}>
                          {isRTL ? 'المنتجات' : 'Items'}
                        </h3>
                        {cartItems.map((item) => {
                          const itemPrice = item.has_discount && item.discounted_price
                            ? Number(item.discounted_price)
                            : Number(item.price);
                          const itemTotal = (itemPrice * Number(item.quantity)).toFixed(2);
                          
                          return (
                            <div key={item.id} className="py-2 border-b border-gray-50 dark:border-gray-800">
                              <div className={cn("flex justify-between items-start", isRTL && "flex-row-reverse")}>
                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                  {item.title} × {toArabicNumerals(item.quantity)}
                                </span>
                                <div className={cn("flex flex-col items-end", isRTL && "items-start")}>
                                  <span className={cn("font-semibold text-xs sm:text-sm", item.has_discount ? "text-red-500" : "text-gray-900 dark:text-white")}>
                                    {toArabicNumerals(itemTotal)} {getLocalizedCurrency(orderData.currency)}
                                  </span>
                                  {item.has_discount && (
                                    <div className={cn("flex items-center gap-1.5 mt-0.5", isRTL && "flex-row-reverse")}>
                                      <span className="text-[10px] text-muted-foreground line-through">
                                        {toArabicNumerals((Number(item.price_before_discount || item.price) * Number(item.quantity)).toFixed(2))}
                                      </span>
                                      {item.discount_percentage && (
                                        <span className="inline-flex items-center px-1 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded">
                                          {Math.round(item.discount_percentage)}% {i18n.language === 'ar' ? 'خصم' : 'OFF'}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                      {isRTL ? (
                        <>
                          <span className="font-bold text-sm sm:text-lg md:text-xl text-gray-900 dark:text-white">{toArabicNumerals(orderData.subtotal_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}</span>
                          <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.subtotal')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.subtotal')}</span>
                          <span className="font-bold text-sm sm:text-lg md:text-xl text-gray-900 dark:text-white">{toArabicNumerals(orderData.subtotal_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                      {isRTL ? (
                        <>
                          <span className="font-bold text-xs sm:text-base md:text-lg">
                            {orderData.shipping_amount === 0 ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">{t('cart.free')}</span>
                            ) : (
                              <span className="text-gray-900 dark:text-white">{toArabicNumerals(orderData.shipping_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}</span>
                            )}
                          </span>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.shipping')}</span>
                            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green-600 dark:text-green-400" />
              </div>
                            <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.shipping')}</span>
              </div>
                          <span className="font-bold text-xs sm:text-base md:text-lg">
                            {orderData.shipping_amount === 0 ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">{t('cart.free')}</span>
                            ) : (
                              <span className="text-gray-900 dark:text-white">{toArabicNumerals(orderData.shipping_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}</span>
                            )}
                          </span>
                        </>
                      )}
              </div>

              {orderData.discount_amount > 0 && (
                      <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                        {isRTL ? (
                          <>
                            <span className="font-bold text-sm sm:text-base md:text-lg text-destructive">
                              -{toArabicNumerals(orderData.discount_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}
                            </span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.discount')}</span>
                              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-red-600 dark:text-red-400" />
                              </div>
                              <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.discount')}</span>
                            </div>
                            <span className="font-bold text-sm sm:text-base md:text-lg text-destructive">
                              -{toArabicNumerals(orderData.discount_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}
                            </span>
                          </>
                        )}
                </div>
              )}
                    
                    {/* Total */}
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 mt-4 sm:mt-5 md:mt-6">
                      <div className="flex justify-between items-center">
                        {isRTL ? (
                          <>
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {toArabicNumerals(orderData.total_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}
                            </span>
                            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('cart.total')}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('cart.total')}</span>
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {toArabicNumerals(orderData.total_amount?.toFixed(2) || '0')} {getLocalizedCurrency(orderData.currency)}
                            </span>
                          </>
                        )}
                      </div>
              </div>
            </div>
          </div>
              </motion.div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-1"
            >
              <motion.div
                variants={itemVariants}
                className="group bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
              >
                <div className="p-3 sm:p-4 md:p-6">
                  <div className={cn("flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6", isRTL && "justify-end")}>
                    {isRTL ? (
                      <>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {t('payment.selectMethod')}
                        </h2>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              {t('payment.selectMethod')}
            </h2>
                      </>
                    )}
                  </div>

            {paymentMethods.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      <AnimatePresence mode="popLayout">
                        {paymentMethods.map((method, index) => (
                          <motion.div
                    key={method.PaymentMethodId}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ delay: index * 0.1 }}
                          >
                            <AnimatedButton
                    size="lg"
                    variant="outline"
                              className="w-full justify-between p-4 sm:p-6 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                    onClick={() => handlePayment(method.PaymentMethodCode)}
                    disabled={loading}
                  >
                              <span className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                      {method.ImageUrl && (
                        <img 
                          src={method.ImageUrl} 
                          alt={i18n.language === 'ar' ? method.PaymentMethodAr : method.PaymentMethodEn}
                                    className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg"
                        />
                      )}
                                <span className="font-semibold text-sm sm:text-base">
                        {i18n.language === 'ar' ? method.PaymentMethodAr : method.PaymentMethodEn}
                      </span>
                    </span>

                            </AnimatedButton>
                          </motion.div>
                ))}
                      </AnimatePresence>
              </div>
            ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-sm sm:text-base">{t('payment.noMethodsAvailable')}</p>
                    </motion.div>
                  )}

                  <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700 mt-4 sm:mt-6">
                    <AnimatedButton
                size="lg"
                variant="outline"
                      className="w-full hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => navigate('/cart')}
                disabled={loading}
              >
                  
                {t('payment.cancel')}
                    </AnimatedButton>
                  </div>
                  
                  {/* Security Badge */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className={cn("flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground bg-gray-50 dark:bg-gray-700/50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl", isRTL && "flex-row-reverse")}>
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="font-medium">{isRTL ? 'دفع آمن ومضمون 100%' : 'Secure Payment 100%'}</span>
                    </div>
                  </div>
            </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
