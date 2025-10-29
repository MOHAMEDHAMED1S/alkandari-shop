import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { trackOrder } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  AlertCircle,
  Link as LinkIcon,
  Copy,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

const OrderTracking = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { orderNumber: paramOrderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [error, setError] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  // Function to convert numbers to Arabic numerals
  const toArabicNumerals = (num: string | number | undefined | null): string => {
    if (i18n.language !== 'ar') return num?.toString() || '0';
    
    if (num === undefined || num === null || num === '') return '0';
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  // Function to get localized currency
  const getLocalizedCurrency = (currency: string | undefined | null): string => {
    if (i18n.language === 'ar') {
      return 'د.ك'; // Arabic currency symbol
    }
    return currency || 'KWD'; // English currency with fallback
  };

  // Function to translate timeline status
  const translateTimelineStatus = (status: string): string => {
    const statusKey = `orderTracking.statuses.${status}`;
    return t(statusKey);
  };

  // Function to translate timeline description
  const translateTimelineDescription = (status: string): string => {
    const descriptionKey = `orderTracking.statusDescriptions.${status}`;
    return t(descriptionKey);
  };

  // Auto-load order from URL parameters
  useEffect(() => {
    const orderFromUrl = paramOrderNumber || searchParams.get('order');
    if (orderFromUrl) {
      setOrderNumber(orderFromUrl);
      loadOrderData(orderFromUrl);
    }
  }, [paramOrderNumber, searchParams]);

  const loadOrderData = async (orderNum: string) => {
    if (!orderNum.trim()) return;

    setLoading(true);
    setError('');
    setOrderData(null);

    try {
      const response = await trackOrder(orderNum.trim());
      
      if (response.success) {
        setOrderData(response.data);
        setTrackingUrl(`${window.location.origin}/track-order/${orderNum.trim()}`);
        toast.success(t('orderTracking.orderFound'));
      } else {
        // Check if it's a fake tracking code
        if (orderNum.startsWith('TRK-')) {
          const fakeCodeMessage = t('orderTracking.fakeTrackingCode', 'هذا كود تتبع وهمي. يرجى استخدام رقم الطلب الحقيقي من رسالة التأكيد.');
          setError(fakeCodeMessage);
          toast.error(fakeCodeMessage);
        } else {
          setError(response.message);
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || t('orderTracking.trackingError');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      toast.error(t('orderTracking.fillOrderNumber'));
      return;
    }

    await loadOrderData(orderNumber.trim());
  };

  const copyTrackingUrl = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success(t('orderTracking.urlCopied'));
    } catch (error) {
      toast.error(t('orderTracking.copyFailed'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created':
        return <Package className="w-5 h-5" />;
      case 'paid':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'processing':
        return <Clock className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string, completed: boolean) => {
    if (!completed) return 'text-muted-foreground';
    
    switch (status) {
      case 'created':
      case 'paid':
      case 'delivered':
        return 'text-green-600';
      case 'shipped':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    const locale = i18n.language === 'ar' ? 'ar-KW' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 py-8", isRTL && "text-right")} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('orderTracking.title')}
          </h1>
          <p className="text-gray-600">
            {t('orderTracking.subtitleSimple')}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8 shadow-sm border-2 border-primary/10">
          <CardHeader className="bg-primary/5">
            <CardTitle className={cn("flex items-center gap-2", isRTL && "justify-end")}>
              {isRTL ? (
                <>
                  <span>{t('orderTracking.searchTitle')}</span>
                  <Search className="w-5 h-5" />
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>{t('orderTracking.searchTitle')}</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleTrackOrder} className="space-y-4">
              <div className="max-w-md mx-auto">
                <Input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder={t('orderTracking.orderNumberPlaceholder')}
                  className="w-full text-center text-lg"
                />
              </div>
              <div className="text-center">
                <Button 
                  type="submit" 
                  className="w-full md:w-auto px-8"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className={cn("w-4 h-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                      {t('orderTracking.searching')}
                    </>
                  ) : (
                    <>
                      <Search className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('orderTracking.trackOrder')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Results */}
        {orderData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="shadow-sm overflow-hidden border-2 border-primary/10">
              <CardHeader className="bg-primary/5">
                <CardTitle className={cn("flex items-center justify-between gap-2")}>
                  {isRTL ? (
                    <>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "px-3 py-1 text-sm font-medium rounded-full",
                          orderData.status_info.color === 'green' ? 'border-green-500 text-green-700 bg-green-50' :
                          orderData.status_info.color === 'blue' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                          orderData.status_info.color === 'red' ? 'border-red-500 text-red-700 bg-red-50' :
                          'border-yellow-500 text-yellow-700 bg-yellow-50'
                        )}
                      >
                        {orderData.status_info.title}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {t('orderTracking.orderSummary')}
                        <Package className="w-5 h-5" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {t('orderTracking.orderSummary')}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "px-3 py-1 text-sm font-medium rounded-full",
                          orderData.status_info.color === 'green' ? 'border-green-500 text-green-700 bg-green-50' :
                          orderData.status_info.color === 'blue' ? 'border-blue-500 text-blue-700 bg-blue-50' :
                          orderData.status_info.color === 'red' ? 'border-red-500 text-red-700 bg-red-50' :
                          'border-yellow-500 text-yellow-700 bg-yellow-50'
                        )}
                      >
                        {orderData.status_info.title}
                      </Badge>
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className={cn("flex items-center gap-2 mb-2", isRTL && "justify-end")}>
                      {isRTL ? (
                        <>
                          <p className="text-sm font-medium text-gray-600">{t('orderTracking.orderNumber')}</p>
                          <ShoppingBag className="w-4 h-4 text-primary" />
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-gray-600">{t('orderTracking.orderNumber')}</p>
                        </>
                      )}
                    </div>
                    <p className="font-mono font-semibold">{toArabicNumerals(orderData.order.order_number)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className={cn("flex items-center gap-2 mb-2", isRTL && "justify-end")}>
                      {isRTL ? (
                        <>
                          <p className="text-sm font-medium text-gray-600">{t('orderTracking.totalAmount')}</p>
                          <DollarSign className="w-4 h-4 text-primary" />
                        </>
                      ) : (
                        <>
                          <DollarSign className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-gray-600">{t('orderTracking.totalAmount')}</p>
                        </>
                      )}
                    </div>
                    <p className="font-semibold">{toArabicNumerals(orderData.order.total_amount)} {getLocalizedCurrency(orderData.order.currency)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className={cn("flex items-center gap-2 mb-2", isRTL && "justify-end")}>
                      {isRTL ? (
                        <>
                          <p className="text-sm font-medium text-gray-600">{t('orderTracking.orderDate')}</p>
                          <Calendar className="w-4 h-4 text-primary" />
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-gray-600">{t('orderTracking.orderDate')}</p>
                        </>
                      )}
                    </div>
                    <p className="font-semibold">{formatDate(orderData.order.created_at)}</p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Tracking URL */}
            {trackingUrl && (
              <Card className="shadow-sm border-2 border-primary/10">
                <CardHeader className="bg-primary/5">
                  <CardTitle className={cn("flex items-center gap-2", isRTL && "justify-end")}>
                    {isRTL ? (
                      <>
                        {t('orderTracking.trackingLink')}
                        <LinkIcon className="w-5 h-5" />
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-5 h-5" />
                        {t('orderTracking.trackingLink')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Input
                      value={trackingUrl}
                      readOnly
                      className="flex-1 font-mono text-sm bg-gray-50"
                    />
                    <Button
                      onClick={copyTrackingUrl}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('orderTracking.copy')}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {t('orderTracking.trackingLinkDescription')}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Customer Information */}
            <Card className="shadow-sm border-2 border-primary/10">
              <CardHeader className="bg-primary/5">
                <CardTitle className={cn("flex items-center gap-2", isRTL && "justify-end")}>
                  {isRTL ? (
                    <>
                      {t('orderTracking.customerInfo')}
                      <Phone className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Phone className="w-5 h-5" />
                      {t('orderTracking.customerInfo')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('orderTracking.name')}</p>
                      <p className="font-medium">{orderData.order.customer_name}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('orderTracking.phone')}</p>
                      <p className="font-medium">{orderData.order.customer_phone}</p>
                    </div>
                  </div>
                  {orderData.order.customer_email && (
                    <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{t('orderTracking.email')}</p>
                        <p className="font-medium">{orderData.order.customer_email}</p>
                      </div>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('orderTracking.address')}</p>
                      <p className="font-medium">
                        {orderData.order.shipping_address.street}, {orderData.order.shipping_address.city}, {orderData.order.shipping_address.governorate}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="shadow-sm border-2 border-primary/10">
              <CardHeader className="bg-primary/5">
                <CardTitle className={cn("flex items-center gap-2", isRTL && "justify-end")}>
                  {isRTL ? (
                    <>
                      {t('orderTracking.orderTimeline')}
                      <Clock className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Clock className="w-5 h-5" />
                      {t('orderTracking.orderTimeline')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {orderData.timeline.map((step: any, index: number) => (
                    <div key={index} className="relative">
                      {/* Vertical line connecting timeline items */}
                      {index < orderData.timeline.length - 1 && (
                        <div className={cn(
                          "absolute top-10 bottom-0 left-5 w-0.5",
                          step.completed ? "bg-green-200" : "bg-gray-200"
                        )} />
                      )}
                      
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                          step.completed ? "bg-green-100" : "bg-gray-100"
                        )}>
                          <div className={getStatusColor(step.status, step.completed)}>
                            {getStatusIcon(step.status)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className={cn(
                              "font-medium",
                              step.completed ? "text-gray-900" : "text-gray-500"
                            )}>
                              {translateTimelineStatus(step.status)}
                            </h3>
                            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full border">
                              {formatDate(step.date)}
                            </span>
                          </div>
                          <p className={cn(
                            "text-sm mt-2",
                            step.completed ? "text-gray-600" : "text-gray-400"
                          )}>
                            {translateTimelineDescription(step.status)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="shadow-sm border-2 border-primary/10">
              <CardHeader className="bg-primary/5">
                <CardTitle className={cn("flex items-center gap-2", isRTL && "justify-end")}>
                  {isRTL ? (
                    <>
                      {t('orderTracking.orderItems')}
                      <Package className="w-5 h-5" />
                    </>
                  ) : (
                    <>
                      <Package className="w-5 h-5" />
                      {t('orderTracking.orderItems')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {orderData.order.order_items?.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{item.product_snapshot?.title || item.product?.title}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-white">
                              {t('orderTracking.quantity')}: {item.quantity}
                            </Badge>
                            {item.product_snapshot?.attributes && (
                              <div className="flex flex-wrap gap-2">
                                {Object.entries(item.product_snapshot.attributes).map(([key, value]: [string, any], i: number) => (
                                  <Badge key={i} variant="secondary" className="bg-primary/10 text-primary border-0">
                                    {key}: {value}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{toArabicNumerals(item.product_price)} {getLocalizedCurrency(orderData.order.currency)}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {t('orderTracking.total')}: <span className="font-medium">{toArabicNumerals((parseFloat(item.product_price) * item.quantity).toFixed(2))} {getLocalizedCurrency(orderData.order.currency)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t('orderTracking.subtotal')}</p>
                      <p className="text-sm font-medium text-gray-600 mt-2">{t('orderTracking.shipping')}</p>
                      {orderData.order.discount > 0 && (
                        <p className="text-sm font-medium text-gray-600 mt-2">{t('orderTracking.discount')}</p>
                      )}
                      <p className="text-base font-bold mt-4">{t('orderTracking.total')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{toArabicNumerals(orderData.order.subtotal)} {getLocalizedCurrency(orderData.order.currency)}</p>
                      <p className="text-sm mt-2">{toArabicNumerals(orderData.order.shipping_cost)} {getLocalizedCurrency(orderData.order.currency)}</p>
                      {orderData.order.discount > 0 && (
                        <p className="text-sm text-red-600 mt-2">-{toArabicNumerals(orderData.order.discount)} {getLocalizedCurrency(orderData.order.currency)}</p>
                      )}
                      <p className="text-base font-bold mt-4">{toArabicNumerals(orderData.order.total_amount)} {getLocalizedCurrency(orderData.order.currency)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
