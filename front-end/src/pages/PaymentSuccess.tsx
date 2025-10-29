import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { getOrderDetails } from '@/lib/api';
import { facebookPixel } from '@/services/facebookPixel';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, CreditCard, Package, Mail, Link, Copy } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'verified' | 'failed'>('verifying');
  const [loadingMessage, setLoadingMessage] = useState(isRTL ? 'جاري التحقق من الدفع...' : 'Verifying payment...');
  const hasInitialized = useRef<string | null>(null);
  const isFromPaymentFlow = useRef(false);

  // Check if user came from payment flow
  useEffect(() => {
    const fromPayment = location.state?.fromPayment || 
                       sessionStorage.getItem('payment_in_progress') === 'true' ||
                       localStorage.getItem('current_order') !== null;
    isFromPaymentFlow.current = fromPayment;
    
    console.log('📍 Payment Success Page - fromPayment:', fromPayment);
    console.log('📍 Order Number:', orderNumber);
    
    // Clear payment flow indicator
    sessionStorage.removeItem('payment_in_progress');
  }, [location.state, orderNumber]);

  // Memoize clearCart to prevent unnecessary re-renders
  const clearCartCallback = useCallback(() => {
    clearCart();
  }, [clearCart]);

  const copyTrackingUrl = async () => {
    if (!orderNumber) return;
    
    const trackingUrl = `${window.location.origin}/track-order/${orderNumber}`;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success(isRTL ? 'تم نسخ رابط التتبع' : 'Tracking link copied');
    } catch (error) {
      toast.error(isRTL ? 'فشل النسخ' : 'Copy failed');
    }
  };

  useEffect(() => {
    // Prevent multiple initializations for the same order
    if (hasInitialized.current === orderNumber) {
      console.log('Already initialized for this order:', orderNumber);
      return;
    }
    
    if (!orderNumber) {
      setLoading(false);
      setVerificationStatus('failed');
      return;
    }

    hasInitialized.current = orderNumber;
    let isMounted = true;
    
    const loadOrderDetails = async () => {
      console.log('=== Loading order details for:', orderNumber, '===');
      console.log('isFromPaymentFlow:', isFromPaymentFlow.current);

      try {
        setLoadingMessage(isRTL ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...');
        
        // Make API call to get order details (no phone number required)
        console.log('🔥 Calling API for order details:', orderNumber);
        const response = await getOrderDetails(orderNumber);
        console.log('✅ API Response:', response);
          
          if (isMounted) {
            if (response.success) {
              console.log('Got order details from API:', response.data);
              setOrderDetails(response.data);
              setVerificationStatus('verified');
            toast.success(isRTL ? 'تم التحقق من الدفع بنجاح' : 'Payment verified successfully');
              
              // Track Purchase event for successful payment
              if (response.data.order_items && response.data.total_amount) {
                facebookPixel.trackPurchase({
                  value: parseFloat(response.data.total_amount),
                  currency: response.data.currency || 'KWD',
                  content_ids: response.data.order_items.map((item: any) => 
                    (item.product_snapshot?.id || item.product?.id || item.product_id).toString()
                  ),
                  num_items: response.data.order_items.reduce((sum: number, item: any) => sum + item.quantity, 0)
                });
              }
            } else {
            console.error('❌ API call failed:', response);
            setVerificationStatus('failed');
          }
        }
      } catch (error) {
        console.error('❌ Failed to load order details:', error);
        console.error('Error details:', error);
        if (isMounted) {
          setVerificationStatus('failed');
        }
      } finally {
        if (isMounted) {
          // Clean up only if coming from payment flow
          if (isFromPaymentFlow.current) {
            localStorage.removeItem('current_order');
            localStorage.removeItem('payment_data');
            clearCartCallback();
          }
          setLoading(false);
        }
      }
    };

    loadOrderDetails();
    
    return () => {
      isMounted = false;
    };
  }, [orderNumber, isRTL, clearCartCallback]);


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <h1 className="text-2xl mb-2">{isRTL ? 'جاري التحقق من الدفع' : 'Verifying payment'}</h1>
          <p className="text-muted-foreground">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <CreditCard className="w-16 h-16 mx-auto mb-6 text-destructive" />
          <h1 className="text-2xl mb-4">{isRTL ? 'فشل التحقق من الدفع' : 'Payment Verification Failed'}</h1>
          <p className="text-muted-foreground mb-6">
            {isRTL 
              ? 'نعتذر، لم نتمكن من التحقق من دفعتك. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.' 
              : 'Sorry, we couldn\'t verify your payment. Please try again or contact support.'}
          </p>
          <Button onClick={() => navigate('/cart')} size="lg">
            {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full mx-auto px-4 text-center">
        <CheckCircle2 className="w-20 h-20 mx-auto mb-6 text-green-500" />
        <h1 className="text-3xl mb-4">{isRTL ? 'تم الدفع بنجاح!' : 'Payment Successful!'}</h1>
        <p className="text-muted-foreground mb-6">
          {isRTL 
            ? 'شكراً لك! تم استلام طلبك وسيتم معالجته قريباً.' 
            : 'Thank you! Your order has been received and will be processed soon.'}
        </p>
        
        {orderNumber && (
          <div className="mb-8 p-6 border border-border rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">{isRTL ? 'رقم الطلب' : 'Order Number'}</span>
            </div>
            <p className="font-mono text-xl font-bold">{orderNumber}</p>
            
            {orderDetails && (
              <div className="mt-6 space-y-4">
                {/* Order Summary */}
                <div className="pt-4 border-t border-border text-left space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'الإجمالي' : 'Total'}</span>
                    <span className="font-medium">
                      {orderDetails.total_amount} {orderDetails.currency}
                    </span>
                  </div>
                  {orderDetails.subtotal_amount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <span className="font-medium">
                        {orderDetails.subtotal_amount} {orderDetails.currency}
                      </span>
                    </div>
                  )}
                  {orderDetails.shipping_amount && orderDetails.shipping_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'رسوم الشحن' : 'Shipping Fees'}</span>
                      <span className="font-medium">
                        {orderDetails.shipping_amount} {orderDetails.currency}
                      </span>
                    </div>
                  )}
                  {orderDetails.discount_amount && orderDetails.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'الخصم' : 'Discount'}</span>
                      <span className="font-medium text-green-600">
                        -{orderDetails.discount_amount} {orderDetails.currency}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Information */}
                {orderDetails.payment && (
                  <div className="pt-4 border-t border-border text-left space-y-3 text-sm">
                    <h3 className="font-medium text-foreground mb-2">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</h3>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'طريقة الدفع' : 'Payment Method'}</span>
                      <span className="font-medium">
                        {orderDetails.payment.payment_method === 'kn' ? (isRTL ? 'كي نت' : 'KNET') : 
                         orderDetails.payment.payment_method === 'md' ? (isRTL ? 'بطاقة ائتمان' : 'Credit Card') : 
                         orderDetails.payment.payment_method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'الحالة' : 'Status'}</span>
                      <span className="font-medium text-green-600">
                        {orderDetails.payment.status === 'paid' ? (isRTL ? 'مدفوع' : 'Paid') : orderDetails.payment.status}
                      </span>
                    </div>
                    {orderDetails.payment.invoice_reference && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isRTL ? 'مرجع الفاتورة' : 'Invoice Reference'}</span>
                        <span className="font-medium font-mono">
                          {orderDetails.payment.invoice_reference}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Information */}
                <div className="pt-4 border-t border-border text-left space-y-3 text-sm">
                  <h3 className="font-medium text-foreground mb-2">{isRTL ? 'معلومات العميل' : 'Customer Information'}</h3>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'الاسم' : 'Name'}</span>
                    <span className="font-medium">{orderDetails.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isRTL ? 'الهاتف' : 'Phone'}</span>
                    <span className="font-medium">{orderDetails.customer_phone}</span>
                  </div>
                  {orderDetails.customer_email && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{isRTL ? 'البريد الإلكتروني' : 'Email'}</span>
                      <span className="font-medium">{orderDetails.customer_email}</span>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                {orderDetails.shipping_address && (
                  <div className="pt-4 border-t border-border text-left space-y-3 text-sm">
                    <h3 className="font-medium text-foreground mb-2">{isRTL ? 'عنوان الشحن' : 'Shipping Address'}</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isRTL ? 'الشارع' : 'Street'}</span>
                        <span className="font-medium">{orderDetails.shipping_address.street}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isRTL ? 'المدينة' : 'City'}</span>
                        <span className="font-medium">{orderDetails.shipping_address.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{isRTL ? 'المحافظة' : 'Governorate'}</span>
                        <span className="font-medium">{orderDetails.shipping_address.governorate}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                {orderDetails.order_items && orderDetails.order_items.length > 0 && (
                  <div className="pt-4 border-t border-border text-left space-y-3 text-sm">
                    <h3 className="font-medium text-foreground mb-2">{isRTL ? 'المنتجات' : 'Products'}</h3>
                    <div className="flex flex-col gap-2">
                      {orderDetails.order_items.map((item: any, index: number) => {
                        const hasDiscount = item.product_snapshot?.has_discount;
                        const discountPercentage = item.product_snapshot?.discount_percentage;
                        const originalPrice = item.product_snapshot?.price;
                        const discountedPrice = item.product_snapshot?.discounted_price || item.product_price;
                        
                        return (
                        <div
                          key={index}
                            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 p-3 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-medium text-sm truncate">
                              {item.product_snapshot?.title || item.product?.title}
                            </span>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">
                                  {isRTL ? 'الكمية' : 'Quantity'}: {item.quantity}
                                </span>
                                {item.size && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded">
                                    {isRTL ? 'المقاس' : 'Size'}: {item.size}
                                  </span>
                                )}
                                {hasDiscount && discountPercentage && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
                                    {Math.round(discountPercentage)}% {isRTL ? 'خصم' : 'OFF'}
                            </span>
                                )}
                              </div>
                          </div>
                            <div className="sm:text-right flex flex-col items-end">
                              {hasDiscount ? (
                                <>
                                  <span className="font-medium whitespace-nowrap text-red-500">
                                    {discountedPrice} {orderDetails.currency}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {originalPrice} {orderDetails.currency}
                                  </span>
                                  <span className="text-xs text-green-600 mt-0.5">
                                    {isRTL ? 'المجموع الفرعي' : 'Subtotal'}: {item.subtotal} {orderDetails.currency}
                                  </span>
                                </>
                              ) : (
                                <>
                            <span className="font-medium whitespace-nowrap">
                              {item.product_price} {orderDetails.currency}
                            </span>
                                  {item.subtotal && (
                                    <span className="text-xs text-muted-foreground mt-0.5">
                                      {isRTL ? 'المجموع الفرعي' : 'Subtotal'}: {item.subtotal} {orderDetails.currency}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => {
              // Set navigation state to indicate user is leaving payment success
              navigate('/products', { state: { fromPaymentSuccess: true } });
            }}
          >
            {isRTL ? 'مواصلة التسوق' : 'Continue Shopping'}
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="w-full"
            onClick={() => {
              // Set navigation state to indicate user is leaving payment success
              navigate('/', { state: { fromPaymentSuccess: true } });
            }}
          >
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </div>

        {/* Tracking Link */}
        {orderNumber && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 mb-3">
              <Link className="w-4 h-4" />
              <span>{isRTL ? 'رابط التتبع' : 'Tracking Link'}</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${window.location.origin}/track-order/${orderNumber}`}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white font-mono"
              />
              <Button
                onClick={copyTrackingUrl}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                {isRTL ? 'نسخ' : 'Copy'}
              </Button>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              {isRTL 
                ? 'استخدم هذا الرابط لتتبع طلبك في أي وقت' 
                : 'Use this link to track your order at any time'}
            </p>
          </div>
        )}

        {/* Delivery Notice */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
          <div className={`flex items-center justify-center gap-2 text-sm text-blue-700 dark:text-blue-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Package className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">
              {isRTL 
                ? 'سيتم توصيل طلبك خلال 5 أيام عمل من تاريخ الطلب' 
                : 'Your order will be delivered within 5 business days from the order date'}
            </span>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
            <Mail className="w-4 h-4" />
            <span>{isRTL ? 'تم إرسال تأكيد الطلب إلى بريدك الإلكتروني' : 'Order confirmation has been sent to your email'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;