import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { createOrder, validateDiscountCode, getShippingCost, getPublicOrdersStatus } from '@/lib/api';
import { facebookPixel } from '@/services/facebookPixel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatedButton } from '@/components/ui/animated-button';
import { toast } from 'sonner';
import { MapPin, Trash2, Save, ShoppingCart, User, CreditCard, Truck, Shield, Tag, Star, ArrowRight, ArrowLeft, Package, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRTL } from '@/hooks/useRTL';
import citiesData from '../../public/cities.json';

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

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cart, getSubtotal, clearCart } = useCart();
  const { isRTL } = useRTL();

  // Email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    street: '',
    city: '',
    governorate: '',
  });

  const [discountCode, setDiscountCode] = useState('');
  const [discountData, setDiscountData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(true);
  
  // Address selection states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [savedAddress, setSavedAddress] = useState<any>(null);
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  
  // UI states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  
  // Orders control states
  const [ordersEnabled, setOrdersEnabled] = useState(true);
  const [checkingOrdersStatus, setCheckingOrdersStatus] = useState(true);
  const [ordersMessage, setOrdersMessage] = useState('');

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

  const subtotal = getSubtotal();
  const shipping = shippingCost;
  const discount = discountData?.order_summary?.discount_amount || 0;
  const total = discountData?.order_summary?.total_amount || (subtotal + shipping - discount);

  // Check orders status on component mount
  useEffect(() => {
    const checkOrdersStatus = async () => {
      try {
        setCheckingOrdersStatus(true);
        const response = await getPublicOrdersStatus();
        if (response.success) {
          setOrdersEnabled(response.data.orders_enabled);
          setOrdersMessage(response.data.message);
        }
      } catch (error) {
        console.error('Error checking orders status:', error);
        // في حالة الخطأ، نفترض أن الطلبات مفتوحة
        setOrdersEnabled(true);
      } finally {
        setCheckingOrdersStatus(false);
      }
    };

    checkOrdersStatus();
  }, []);

  // Fetch shipping cost on component mount
  useEffect(() => {
    const fetchShippingCost = async () => {
      try {
        setIsLoadingShipping(true);
        const response = await getShippingCost();
        if (response.success) {
          setShippingCost(parseFloat(response.data.shipping_cost));
        }
      } catch (error) {
        console.error('Error fetching shipping cost:', error);
        // Fallback to 0 if API fails
        setShippingCost(0);
      } finally {
        setIsLoadingShipping(false);
      }
    };

    fetchShippingCost();
    
    // Track InitiateCheckout event when user reaches checkout page
    if (cart.length > 0) {
      facebookPixel.trackInitiateCheckout({
        value: subtotal,
        currency: 'KWD',
        num_items: cart.reduce((sum, item) => sum + item.quantity, 0),
        content_ids: cart.map(item => item.id.toString())
      });
    }
  }, [cart, subtotal]);

  // Load saved address on component mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_address');
    if (saved) {
      const addressData = JSON.parse(saved);
      setSavedAddress(addressData);
      setFormData(prev => ({
        ...prev,
        customer_name: addressData.customer_name || '',
        customer_email: addressData.customer_email || '',
        customer_phone: addressData.customer_phone || '',
        street: addressData.street || '',
        city: addressData.city || '',
        governorate: addressData.governorate || '',
      }));
      setSelectedCity(addressData.selectedCity || '');
      setSelectedArea(addressData.selectedArea || '');
      setCustomAddress(addressData.customAddress || '');
      setUseCustomAddress(addressData.useCustomAddress || false);
    }
  }, []);

  // Prevent scroll lock when select dropdowns are open
  useEffect(() => {
    const handleBodyScroll = () => {
      // Allow scrolling when select dropdowns are open
      document.body.style.overflow = 'auto';
    };

    // Add event listener for select dropdowns
    const selectElements = document.querySelectorAll('[data-radix-select-content]');
    selectElements.forEach(element => {
      element.addEventListener('focus', handleBodyScroll);
    });

    return () => {
      selectElements.forEach(element => {
        element.removeEventListener('focus', handleBodyScroll);
      });
    };
  }, []);

  // Auto-save data only when user moves to address section or payment
  const saveDataToStorage = () => {
    const hasData = formData.customer_name || formData.customer_phone || formData.street;
    if (hasData) {
      // Validate data before saving
      const isNameValid = formData.customer_name.trim().length >= 4;
      const phoneDigits = formData.customer_phone.replace(/\D/g, '');
      const isPhoneValid = phoneDigits.length >= 8;
      const isEmailValid = !formData.customer_email.trim() || isValidEmail(formData.customer_email.trim());
      
      // Only save if all data is valid
      if (isNameValid && isPhoneValid && isEmailValid) {
        const addressData = {
          ...formData,
          selectedCity,
          selectedArea,
          customAddress,
          useCustomAddress,
        };
        localStorage.setItem('saved_address', JSON.stringify(addressData));
        setSavedAddress(addressData);
      }
    }
  };

  // Get areas for selected city
  const getAreasForCity = (cityId: string) => {
    const city = citiesData.cities.find(c => c.details.city_id === cityId);
    return city ? city.areas : [];
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedArea('');
    setUseCustomAddress(false);
    
    const city = citiesData.cities.find(c => c.details.city_id === cityId);
    if (city) {
      setFormData(prev => ({
        ...prev,
        governorate: city.details.name_ar,
        city: city.details.name_ar,
      }));
    }
  };

  // Handle area selection
  const handleAreaChange = (areaId: string) => {
    setSelectedArea(areaId);
    setUseCustomAddress(false);
    
    const areas = getAreasForCity(selectedCity);
    const area = areas.find(a => a.area_id === areaId);
    if (area) {
      setFormData(prev => ({
        ...prev,
        city: area.name_ar,
      }));
    }
  };

  // Save address to localStorage with validation
  const saveAddress = () => {
    // Validate data before saving
    const isNameValid = formData.customer_name.trim().length >= 4;
    const phoneDigits = formData.customer_phone.replace(/\D/g, '');
    const isPhoneValid = phoneDigits.length >= 8;
    const isEmailValid = !formData.customer_email.trim() || isValidEmail(formData.customer_email.trim());
    
    // Check if all required data is valid
    if (!isNameValid) {
      toast.error(t('checkout.nameMinLength'));
      return;
    }
    
    if (!isPhoneValid) {
      toast.error(t('checkout.phoneMinLength'));
      return;
    }
    
    if (!isEmailValid) {
      toast.error(t('checkout.emailInvalid'));
      return;
    }
    
    const addressData = {
      ...formData,
      selectedCity,
      selectedArea,
      customAddress,
      useCustomAddress,
    };
    
    localStorage.setItem('saved_address', JSON.stringify(addressData));
    setSavedAddress(addressData);
    toast.success(t('checkout.addressSaved'));
  };

  // Clear saved address
  const clearSavedAddress = () => {
    localStorage.removeItem('saved_address');
    setSavedAddress(null);
    setFormData(prev => ({
      ...prev,
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      street: '',
      city: '',
      governorate: '',
    }));
    setSelectedCity('');
    setSelectedArea('');
    setCustomAddress('');
    setUseCustomAddress(false);
    toast.success(t('checkout.addressCleared'));
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    if (!formData.customer_phone) {
      toast.error(t('checkout.phoneRequired'));
      return;
    }

    setLoading(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));

      const response = await validateDiscountCode(
        discountCode, 
        items,
        formData.customer_phone,
        shipping
      );
      
      if (response.success) {
        setDiscountData(response.data);
        toast.success(response.message || t('checkout.discountApplied'));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('checkout.invalidDiscount'));
      setDiscountData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // التحقق من توفر جميع المنتجات في المخزون
    const outOfStockItems = cart.filter(item => !item.is_in_stock);
    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems.map(item => item.title).join(', ');
      toast.error(
        i18n.language === 'ar'
          ? `المنتجات التالية غير متوفرة: ${itemNames}`
          : `The following items are out of stock: ${itemNames}`
      );
      return;
    }

    // التحقق من الكمية المتاحة للمنتجات التي لها مخزون
    const insufficientStockItems = cart.filter(item => 
      item.has_inventory && 
      item.stock_quantity !== null && 
      item.quantity > item.stock_quantity
    );
    
    if (insufficientStockItems.length > 0) {
      const itemDetails = insufficientStockItems.map(item => 
        i18n.language === 'ar'
          ? `${item.title} (متوفر: ${item.stock_quantity})`
          : `${item.title} (available: ${item.stock_quantity})`
      ).join(', ');
      
      toast.error(
        i18n.language === 'ar'
          ? `الكمية المطلوبة غير متوفرة للمنتجات: ${itemDetails}`
          : `Requested quantity not available for: ${itemDetails}`
      );
      return;
    }

    // Validate name length (minimum 4 characters)
    if (formData.customer_name.trim().length < 4) {
      setShowNameError(true);
      toast.error(t('checkout.nameMinLength'));
      return;
    }

    // Validate phone number (minimum 8 digits)
    const phoneDigits = formData.customer_phone.replace(/\D/g, ''); // Remove non-digits
    if (phoneDigits.length < 8) {
      setShowPhoneError(true);
      toast.error(t('checkout.phoneMinLength'));
      return;
    }

    // Validate email if provided (optional but must be valid if entered)
    if (formData.customer_email.trim() && !isValidEmail(formData.customer_email.trim())) {
      setShowEmailError(true);
      toast.error(t('checkout.emailInvalid'));
      return;
    }

    // Only save data after all validation passes
    saveDataToStorage();

    setProcessingOrder(true);
    try {
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        shipping_address: {
          street: formData.street,
          city: formData.city,
          governorate: formData.governorate,
          postal_code: '', // Empty since we removed postal code
        },
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          size: item.selectedSize,
        })),
        discount_code: discountCode || undefined,
        shipping_amount: shippingCost,
      };

      const response = await createOrder(orderData);
      
      if (response.success) {
        const orderId = response.data.order.id;
        const orderNumber = response.data.order.order_number;
        const nextStep = response.data.next_step;
        
        // Save order data for payment page
        localStorage.setItem('current_order', JSON.stringify({
          order_id: orderId,
          order_number: orderNumber,
          total_amount: response.data.total_amount,
          subtotal_amount: response.data.subtotal_amount,
          discount_amount: response.data.discount_amount,
          shipping_amount: response.data.shipping_amount,
          currency: response.data.currency,
          customer_phone: formData.customer_phone,
        }));
        
        if (nextStep === 'payment_required') {
          // Redirect to payment page with order details
          navigate(`/payment?order=${orderNumber}`);
        } else {
          // If payment not required, go to success page
          clearCart();
          localStorage.removeItem('current_order');
          navigate(`/payment/success?order=${orderNumber}`);
        }
      }
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Failed to create order');
      navigate('/payment/failure');
    } finally {
      setProcessingOrder(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // No automatic saving - only save when user proceeds to payment

  // Check if we have saved data
  const hasSavedData = savedAddress && (
    savedAddress.customer_name || 
    savedAddress.customer_phone || 
    savedAddress.street
  );

  // Show orders closed message
  if (!checkingOrdersStatus && !ordersEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            {/* Icon and Title */}
            <div className={cn("text-center mb-8 sm:mb-10", isRTL && "text-center")}>
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="relative inline-block mb-6"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-12 h-12 sm:w-14 sm:h-14 text-slate-600 dark:text-slate-300" />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white"
              >
                {isRTL ? 'الطلبات مغلقة مؤقتاً' : 'Orders Temporarily Closed'}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto"
              >
                {isRTL 
                  ? 'نعمل بجد لخدمتك بأفضل شكل ممكن' 
                  : 'We are working hard to serve you in the best way possible'}
              </motion.p>
            </div>

            {/* Main Message Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  {/* Info Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-5 sm:p-6 mb-6">
                    <div className={cn("flex items-start gap-4", isRTL && "flex-row-reverse")}>
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className={cn("flex-1", isRTL && "text-right")}>
                        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {isRTL ? 'الطلبات مغلقة بسبب ضغط الطلبات' : 'Orders Closed Due to High Demand'}
                        </p>
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {ordersMessage || (isRTL 
                            ? 'نحن نشهد طلباً كبيراً على منتجاتنا حالياً، ونعمل بكل جهد لمعالجة جميع الطلبات الحالية وضمان جودة الخدمة لكم.' 
                            : 'We are experiencing high demand for our products and are working diligently to process all current orders and ensure quality service for you.')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* What You Can Do */}
                  <div className="space-y-4 mb-6">
                    <h3 className={cn("text-lg font-semibold text-gray-900 dark:text-white", isRTL && "text-right")}>
                      {isRTL ? 'ماذا يمكنك أن تفعل؟' : 'What can you do?'}
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Option 1 */}
                      <div className={cn("flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg", isRTL && "flex-row-reverse")}>
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ShoppingCart className="w-4 h-4 text-primary" />
                        </div>
                        <div className={cn("flex-1", isRTL && "text-right")}>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {isRTL 
                              ? 'تصفح منتجاتنا وأضفها إلى سلة التسوق، وعند فتح الطلبات يمكنك إتمام طلبك' 
                              : 'Browse our products and add them to your cart. Complete your order when we reopen'}
                          </p>
                        </div>
                      </div>

                      {/* Option 2 */}
                      <div className={cn("flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg", isRTL && "flex-row-reverse")}>
                        <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <RefreshCw className="w-4 h-4 text-primary" />
                        </div>
                        <div className={cn("flex-1", isRTL && "text-right")}>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {isRTL 
                              ? 'حاول مرة أخرى بعد قليل، سنعاود فتح الطلبات في أقرب وقت ممكن' 
                              : 'Try again shortly. We will reopen orders as soon as possible'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => navigate('/products')}
                      size="lg"
                      className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                      <ShoppingCart className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                      {isRTL ? 'تصفح المنتجات' : 'Browse Products'}
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      size="lg"
                      variant="outline"
                      className="flex-1 border-2 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300 rounded-xl"
                    >
                      {isRTL ? (
                        <>
                          العودة للرئيسية
                          <ArrowLeft className="w-4 h-4 mr-2" />
                        </>
                      ) : (
                        <>
                          Back to Home
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Thank You Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="text-center mt-8"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? '🙏 نشكركم على تفهمكم وصبركم' : '🙏 Thank you for your understanding and patience'}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
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
              <ShoppingCart className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary drop-shadow-lg" />
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
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
          >
            {t('cart.empty')}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground mb-6 sm:mb-8 md:mb-10 text-base sm:text-lg md:text-xl leading-relaxed"
          >
            {t('cart.emptyMessage')}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <AnimatedButton 
              onClick={() => navigate('/products')}
              size="lg"
              className="px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 text-sm sm:text-base md:text-lg font-semibold shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary to-primary/90"
            >
              <ShoppingCart className={cn("w-4 h-4 sm:w-5 sm:h-5", isRTL ? "ml-2 sm:ml-3" : "mr-2 sm:mr-3")} />
              {t('cart.startShopping')}
              {isRTL ? <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> : <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 sm:ml-3" />}
            </AnimatedButton>
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
        <div className="max-w-7xl mx-auto">
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
                    {t('checkout.title')}
                  </h1>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent">
                    {t('checkout.title')}
                  </h1>
                </>
              )}
            </div>
            <div className={cn("flex items-center gap-2 sm:gap-3", isRTL && "justify-end")}>
              {isRTL ? (
                <>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium">
                    {t('checkout.completeOrder')}
                  </p>
                  <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-transparent to-primary rounded-full"></div>
                </>
              ) : (
                <>
                  <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium">
                    {t('checkout.completeOrder')}
                  </p>
                </>
              )}
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Customer Information */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={cn("xl:col-span-2 space-y-3 sm:space-y-4 md:space-y-5", isRTL && "xl:order-2")}
              >
                <motion.div
                  variants={itemVariants}
                  className="group bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
                >
                  <div className="p-3 sm:p-4 md:p-6">
                    <div className={cn("flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6", isRTL && "justify-end")}>
                      {isRTL ? (
                        <>
                          {hasSavedData && !isEditingInfo && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingInfo(true)}
                              className="mr-auto"
                            >
                              {t('checkout.editInfo')}
                            </Button>
                          )}
                          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            {t('checkout.customerInfo')}
                          </h2>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                            <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                            {t('checkout.customerInfo')}
                          </h2>
                          {hasSavedData && !isEditingInfo && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingInfo(true)}
                              className="ml-auto"
                            >
                              {t('checkout.editInfo')}
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                    {/* Saved Data Card */}
                    {hasSavedData && !isEditingInfo ? (
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20 space-y-3">
                        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", isRTL && "justify-end")}>
                          <MapPin className="w-4 h-4" />
                          <span>{t('checkout.savedInfo')}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">{t('checkout.name')}:</span> {formData.customer_name}
                          </div>
                          {formData.customer_email && (
                            <div>
                              <span className="font-medium">{t('checkout.email')}:</span> {formData.customer_email}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">{t('checkout.phone')}:</span> {formData.customer_phone}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="customer_name">{t('checkout.name')}</Label>
                          <Input
                            id="customer_name"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            onBlur={() => setShowNameError(true)}
                            onFocus={() => setShowNameError(false)}
                            required
                            minLength={4}
                            className="focus:ring-primary focus:border-primary"
                          />
                          {showNameError && formData.customer_name && formData.customer_name.trim().length < 4 && (
                            <p className="text-sm text-destructive mt-1">
                              {t('checkout.nameMinLength')}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="customer_email">{t('checkout.email')} <span className="text-muted-foreground text-xs">({t('checkout.optional')})</span></Label>
                          <Input
                            id="customer_email"
                            name="customer_email"
                            type="email"
                            value={formData.customer_email}
                            onChange={handleChange}
                            onBlur={() => setShowEmailError(true)}
                            onFocus={() => setShowEmailError(false)}
                            className="focus:ring-primary focus:border-primary"
                          />
                          {showEmailError && formData.customer_email.trim() && !isValidEmail(formData.customer_email.trim()) && (
                            <p className="text-sm text-destructive mt-1">
                              {t('checkout.emailInvalid')}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="customer_phone">{t('checkout.phone')}</Label>
                          <Input
                            id="customer_phone"
                            name="customer_phone"
                            type="tel"
                            value={formData.customer_phone}
                            onChange={handleChange}
                            onBlur={() => setShowPhoneError(true)}
                            onFocus={() => setShowPhoneError(false)}
                            required
                            className="focus:ring-primary focus:border-primary"
                          />
                          {showPhoneError && formData.customer_phone && formData.customer_phone.replace(/\D/g, '').length < 8 && (
                            <p className="text-sm text-destructive mt-1">
                              {t('checkout.phoneMinLength')}
                            </p>
                          )}
                        </div>
                        {isEditingInfo && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingInfo(false)}
                            >
                              {t('checkout.doneEditing')}
                            </Button>
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={saveAddress}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Save className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                              {t('checkout.saveInfo')}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
                >
                  <div className="p-3 sm:p-4 md:p-6 ">
                  <div className={`flex items-center gap-2 text-sm sm:text-base mb-6 md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
  {isRTL ? (
    <>
      <div className={`flex gap-2   ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
        {hasSavedData && !isEditingAddress && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditingAddress(true)}
          >
            {t('checkout.editAddress')}
          </Button>
        )}
        {savedAddress && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSavedAddress}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t('checkout.clearAddress')}
          </Button>
        )}
      </div>
      <h2 className="text-lg  sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
        {t('checkout.shippingAddress')}
      </h2>
      <div className="w-8  h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
        <MapPin className="w-4  h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
      </div>
    </>
  ) : (
    <>
      <div className="w-8  h-8 sm:w-10 sm:h-10 md:w-12 md:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
      </div>
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
        {t('checkout.shippingAddress')}
      </h2>
      <div className={`flex gap-2  ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
        {hasSavedData && !isEditingAddress && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditingAddress(true)}
          >
            {t('checkout.editAddress')}
          </Button>
        )}
        {savedAddress && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={clearSavedAddress}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            {t('checkout.clearAddress')}
          </Button>
        )}
      </div>
    </>
  )}
</div>

                    {/* Saved Address Card */}
                    {hasSavedData && !isEditingAddress ? (
                      <div className="p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-lg border border-primary/20 space-y-3">
                        <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", isRTL && "justify-end")}>
                          <MapPin className="w-4 h-4" />
                          <span>{t('checkout.savedAddress')}</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">{t('checkout.street')}:</span> {formData.street}
                          </div>
                          <div>
                            <span className="font-medium">{t('checkout.governorate')}:</span> {formData.governorate}
                          </div>
                          <div>
                            <span className="font-medium">{t('checkout.city')}:</span> {formData.city}
                          </div>
                          {useCustomAddress && customAddress && (
                            <div>
                              <span className="font-medium">{t('checkout.customAddress')}:</span> {customAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Street Address */}
                        <div>
                          <Label htmlFor="street">{t('checkout.street')}</Label>
                          <Input
                            id="street"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder={t('checkout.streetPlaceholder')}
                            required
                            className="focus:ring-primary focus:border-primary"
                          />
                        </div>

                  {/* City Selection */}
                  <div>
                    <Label>{t('checkout.selectGovernorate')}</Label>
                    <Select value={selectedCity} onValueChange={handleCityChange}>
                      <SelectTrigger className="focus:ring-primary focus:border-primary">
                        <SelectValue placeholder={t('checkout.selectGovernoratePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent 
                        position="popper"
                        side="bottom"
                        align="start"
                        sideOffset={4}
                        avoidCollisions={true}
                        collisionPadding={8}
                        className="max-h-60 overflow-y-auto"
                      >
                        {citiesData.cities.map((city) => (
                          <SelectItem key={city.details.city_id} value={city.details.city_id}>
                            {city.details.name_ar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Area Selection */}
                  {selectedCity && (
                    <div>
                      <Label>{t('checkout.selectArea')}</Label>
                      <Select value={selectedArea} onValueChange={handleAreaChange}>
                        <SelectTrigger className="focus:ring-primary focus:border-primary">
                          <SelectValue placeholder={t('checkout.selectAreaPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent 
                          position="popper"
                          side="bottom"
                          align="start"
                          sideOffset={4}
                          avoidCollisions={true}
                          collisionPadding={8}
                          className="max-h-60 overflow-y-auto"
                        >
                          {getAreasForCity(selectedCity).map((area) => (
                            <SelectItem key={area.area_id} value={area.area_id}>
                              {area.name_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Custom Address Option */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useCustomAddress"
                      checked={useCustomAddress}
                      onChange={(e) => setUseCustomAddress(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="useCustomAddress" className="text-sm">
                      {t('checkout.useCustomAddress')}
                    </Label>
                  </div>

                  {/* Custom Address Input */}
                  {useCustomAddress && (
                    <div>
                      <Label htmlFor="customAddress">{t('checkout.customAddress')}</Label>
                      <Input
                        id="customAddress"
                        value={customAddress}
                        onChange={(e) => setCustomAddress(e.target.value)}
                        placeholder={t('checkout.customAddressPlaceholder')}
                      />
                    </div>
                  )}

                  {/* Display Selected Address */}
                  {(selectedCity && selectedArea) && !useCustomAddress && (
                    <div className="p-3 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{t('checkout.selectedAddress')}:</span>
                      </div>
                      <div className="mt-1 text-sm">
                        {formData.street && `${formData.street}, `}
                        {formData.city}
                      </div>
                    </div>
                  )}

                    {/* Display Custom Address */}
                    {useCustomAddress && customAddress && (
                      <div className="p-3 bg-muted/50 rounded-lg border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{t('checkout.customAddress')}:</span>
                        </div>
                        <div className="mt-1 text-sm">
                          {formData.street && `${formData.street}, `}
                          {customAddress}
                        </div>
                      </div>
                    )}

                        {isEditingAddress && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditingAddress(false)}
                          >
                            {t('checkout.doneEditing')}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* Order Summary - Enhanced */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={cn("xl:col-span-1", isRTL && "xl:order-1")}
              >
                <div className={cn("bg-gradient-to-br from-white via-white to-gray-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 md:p-8 sticky top-4 md:top-8", isRTL && "text-right")}>
                  {/* Header */}
                  <div className={cn("flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8 pb-3 sm:pb-4 md:pb-6 border-b border-gray-200 dark:border-gray-700", isRTL && "justify-end")}>
                    {isRTL ? (
                      <>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {t('checkout.orderSummary')}
                        </h2>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-10 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                          <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                          {t('checkout.orderSummary')}
                        </h2>
                      </>
                    )}
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-4 sm:mb-6 md:mb-8">
                    {cart.map((item) => {
                      const itemPrice = item.has_discount && item.discounted_price
                        ? Number(item.discounted_price)
                        : Number(item.price);
                      const itemTotal = (itemPrice * Number(item.quantity)).toFixed(2);
                      
                      return (
                        <div key={item.id} className="py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                          {/* Item Title and Quantity */}
                          <div className={cn("flex justify-between items-start mb-1", isRTL && "flex-row-reverse")}>
                            <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                              {item.title} × {toArabicNumerals(item.quantity)}
                            </span>
                            <div className={cn("flex flex-col items-end", isRTL && "items-start")}>
                              {/* Price with discount styling */}
                              <span className={cn("font-bold text-sm sm:text-base md:text-lg", item.has_discount ? "text-red-500" : "text-gray-900 dark:text-white")}>
                                {toArabicNumerals(itemTotal)} {getLocalizedCurrency('KWD')}
                              </span>
                              {/* Show original price and discount badge if discounted */}
                              {item.has_discount && (
                                <div className={cn("flex items-center gap-2 mt-0.5", isRTL && "flex-row-reverse")}>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {toArabicNumerals((Number(item.price_before_discount || item.price) * Number(item.quantity)).toFixed(2))}
                                  </span>
                                  {item.discount_percentage && (
                                    <span className="inline-flex items-center px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded">
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
                  
                  {/* Summary Items */}
                  <div className="space-y-3 sm:space-y-4 md:space-y-5 mb-4 sm:mb-6 md:mb-8">
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                      {isRTL ? (
                        <>
                          <span className="font-bold text-sm sm:text-lg md:text-xl text-gray-900 dark:text-white">{toArabicNumerals(subtotal.toFixed(2))} {getLocalizedCurrency('KWD')}</span>
                          <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.subtotal')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.subtotal')}</span>
                          <span className="font-bold text-sm sm:text-lg md:text-xl text-gray-900 dark:text-white">{toArabicNumerals(subtotal.toFixed(2))} {getLocalizedCurrency('KWD')}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                      {isRTL ? (
                        <>
                          <span className="font-bold text-xs sm:text-base md:text-lg">
                            {shipping === 0 ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">{t('cart.free')}</span>
                            ) : (
                              <span className="text-gray-900 dark:text-white">{toArabicNumerals(shipping.toFixed(2))} {getLocalizedCurrency('KWD')}</span>
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
                            {shipping === 0 ? (
                              <span className="text-green-600 dark:text-green-400 font-bold">{t('cart.free')}</span>
                            ) : (
                              <span className="text-gray-900 dark:text-white">{toArabicNumerals(shipping.toFixed(2))} {getLocalizedCurrency('KWD')}</span>
                            )}
                          </span>
                        </>
                      )}
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                        {isRTL ? (
                          <>
                            <span className="font-bold text-sm sm:text-base md:text-lg text-destructive">
                              -{toArabicNumerals(discount.toFixed(2))} {getLocalizedCurrency('KWD')}
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
                              -{toArabicNumerals(discount.toFixed(2))} {getLocalizedCurrency('KWD')}
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
                              {toArabicNumerals(total.toFixed(2))} {getLocalizedCurrency('KWD')}
                            </span>
                            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('cart.total')}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white">{t('cart.total')}</span>
                            <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                              {toArabicNumerals(total.toFixed(2))} {getLocalizedCurrency('KWD')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Discount Code Section */}
                  <div className="mb-4 sm:mb-6 md:mb-8">
                    <Label htmlFor="discountCode" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {t('checkout.discountCode')}
                    </Label>
                    <div className={cn("flex gap-2 mt-2", isRTL && "flex-row-reverse")}>
                      <Input
                        id="discountCode"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value)}
                        placeholder="SAVE20"
                        className="focus:ring-primary focus:border-primary"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={loading || !discountCode.trim()}
                        className="px-4 py-2"
                      >
                        {t('checkout.applyDiscount')}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Delivery Notice */}
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800/30">
                    <div className={cn("flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-blue-700 dark:text-blue-300", isRTL && "flex-row-reverse text-right")}>
                      <Truck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="font-medium">
                        {isRTL 
                          ? 'سيتم توصيل طلبك خلال 5 أيام عمل من تاريخ الطلب' 
                          : 'Your order will be delivered within 5 business days from the order date'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 sm:space-y-4">
                    <AnimatedButton
                      type="submit"
                      className="w-full py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-bold shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      size="lg"
                      disabled={processingOrder}
                    >
                      <Shield className={cn("w-4 h-4 sm:w-5 sm:h-5", isRTL ? "ml-2" : "mr-2")} />
                      {processingOrder ? t('checkout.processing') : t('checkout.placeOrder')}
                      {isRTL ? (
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      ) : (
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      )}
                    </AnimatedButton>
                  </div>
                  
                  {/* Security Badge */}
                  <div className="mt-4 sm:mt-6 md:mt-8 pt-3 sm:pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className={cn("flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground bg-gray-50 dark:bg-gray-700/50 py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl", isRTL && "flex-row-reverse")}>
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      <span className="font-medium">{isRTL ? 'دفع آمن ومضمون 100%' : 'Secure Payment 100%'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;