import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/contexts/CartContext';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, ArrowLeft, ShoppingBag, Package, CreditCard, Truck, Shield, Tag, Star } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useRTL } from '@/hooks/useRTL';
import { getShippingCost } from '@/lib/api';
import { useEffect, useState } from 'react';
import { StockStatus } from '@/components/Products/StockStatus';

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
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.3
    }
  }
};

const Cart = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart } = useCart();
  const { isRTL } = useRTL();
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(true);

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
  }, []);

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

  const subtotal = cart.reduce((total, item) => {
    const itemPrice = item.has_discount && item.discounted_price
      ? parseFloat(item.discounted_price.toString())
      : parseFloat(item.price.toString());
    return total + itemPrice * item.quantity;
  }, 0);
  const shipping = shippingCost;
  const tax = 0;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (productId: number, delta: number, size?: string) => {
    const item = cart.find(item => item.id === productId && item.selectedSize === size);
    if (!item) return;

    // تحديد الحد الأقصى بناءً على المخزون
    const maxQuantity = item.has_inventory && item.stock_quantity !== null
      ? Math.min(item.stock_quantity, 10)
      : 10;

    const newQuantity = Math.max(1, Math.min(item.quantity + delta, maxQuantity));
    if (newQuantity === item.quantity) {
      // إذا وصلنا للحد الأقصى، نعرض رسالة
      if (newQuantity === maxQuantity && item.has_inventory) {
        toast.warning(
          i18n.language === 'ar'
            ? `الحد الأقصى المتاح: ${item.stock_quantity} قطعة`
            : `Maximum available: ${item.stock_quantity} items`
        );
      }
      return;
    }

    updateQuantity(productId, newQuantity, size);
    toast.success(t('cart.quantityUpdated'));
  };

  const handleRemove = (productId: number, size?: string) => {
    removeFromCart(productId, size);
    toast.success(t('cart.itemRemoved'));
  };


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
              <ShoppingBag className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 text-primary drop-shadow-lg" />
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
                    {t('cart.title')}
                  </h1>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary/70 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent">
                    {t('cart.title')}
                  </h1>
                </>
              )}
            </div>
            <div className={cn("flex items-center gap-2 sm:gap-3", isRTL && "justify-end")}>
              {isRTL ? (
                <>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium">
                    {toArabicNumerals(cart.length)} {cart.length === 1 ? t('cart.item') : t('cart.items')} {isRTL ? 'في سلة التسوق' : 'in your cart'}
                  </p>
                  <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-transparent to-primary rounded-full"></div>
                </>
              ) : (
                <>
                  <div className="h-0.5 sm:h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg font-medium">
                    {toArabicNumerals(cart.length)} {cart.length === 1 ? t('cart.item') : t('cart.items')} {isRTL ? 'في سلة التسوق' : 'in your cart'}
                  </p>
                </>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Cart Items */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={cn("xl:col-span-2 space-y-3 sm:space-y-4 md:space-y-5", isRTL && "xl:order-2")}
            >
              <AnimatePresence mode="popLayout">
                {cart.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.selectedSize || 'no-size'}`}
                    variants={itemVariants}
                    layout
                    exit="exit"
                    className="group bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-500"
                  >
                    <div className="p-3 sm:p-4 md:p-6">
                      <div className={cn("flex gap-3 sm:gap-4 md:gap-6", isRTL && "flex-row-reverse")}>
                        {/* Product Image */}
                        <motion.div
                          whileHover={{ scale: 1.08, rotate: 2 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="relative flex-shrink-0"
                        >
                          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden shadow-lg ring-1 sm:ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary/50 transition-all duration-300">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className={cn("absolute -top-2 sm:-top-3 bg-gradient-to-br from-primary to-primary/80 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg", isRTL ? "-left-2 sm:-left-3" : "-right-2 sm:-right-3")}>
                            ×{toArabicNumerals(item.quantity)}
                          </div>
                        </motion.div>
                        
                        {/* Product Details */}
                        <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                          <div className="flex flex-col h-full justify-between">
                            {/* Title and Remove Button */}
                            <div>
                              <div className={cn("flex items-start justify-between gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-3", isRTL && "flex-row-reverse")}>
                                <div className="flex-1">
                                  <h3 className="font-bold text-sm sm:text-base md:text-xl text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
                                    {item.title || 'منتج بدون اسم'}
                                  </h3>
                                  {item.selectedSize && (
                                    <div className="mt-1">
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-md">
                                        <Tag className="w-3 h-3" />
                                        {i18n.language === 'ar' ? 'المقاس: ' : 'Size: '}{item.selectedSize}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1, rotate: 10 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 flex-shrink-0"
                                  onClick={() => handleRemove(item.id, item.selectedSize)}
                                >
                                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                </motion.button>
                              </div>
                              
                              {/* Price Section */}
                              <div className="mb-2 sm:mb-3 md:mb-4">
                                {item.has_discount ? (
                                  <>
                                    {/* Discounted Price */}
                                    <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                                      <span className="text-lg sm:text-2xl md:text-3xl font-bold text-red-500">
                                        {toArabicNumerals(parseFloat(item.discounted_price?.toString() || item.price.toString()).toFixed(2))}
                                      </span>
                                      <span className="text-sm sm:text-base md:text-lg font-semibold text-red-500">{getLocalizedCurrency('KWD')}</span>
                                    </div>
                                    {/* Original Price & Discount Badge */}
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="text-xs sm:text-sm text-muted-foreground line-through">
                                        {toArabicNumerals(parseFloat(item.price_before_discount?.toString() || item.price.toString()).toFixed(2))} {getLocalizedCurrency('KWD')}
                                      </span>
                                      {item.discount_percentage && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-md">
                                          {Math.round(item.discount_percentage)}% {i18n.language === 'ar' ? 'خصم' : 'OFF'}
                                        </span>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    {/* Regular Price */}
                                    <div className="flex items-baseline gap-1 sm:gap-2 mb-1">
                                      <span className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                        {toArabicNumerals(parseFloat(item.price.toString()).toFixed(2))}
                                      </span>
                                      <span className="text-sm sm:text-base md:text-lg font-semibold text-primary/70">{getLocalizedCurrency('KWD')}</span>
                                    </div>
                                  </>
                                )}
                                <div className={cn("inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 rounded-md sm:rounded-lg", isRTL && "flex-row-reverse")}>
                                  <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                                  <span className="text-xs font-medium text-primary">{t('cart.perPiece')}</span>
                                </div>
                              </div>
                              
                              {/* Stock Status */}
                              <div className="mb-2">
                                <StockStatus product={item} variant="minimal" />
                              </div>
                              
                              {/* Total for this item */}
                              <div className={cn("flex items-center gap-1 sm:gap-2 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-gradient-to-r from-primary/5 to-transparent rounded-lg sm:rounded-xl mb-2 sm:mb-3 md:mb-4", isRTL && "justify-end")}>
                                {(() => {
                                  const itemPrice = item.has_discount && item.discounted_price
                                    ? parseFloat(item.discounted_price.toString())
                                    : parseFloat(item.price.toString());
                                  const itemTotal = (itemPrice * item.quantity).toFixed(2);
                                  
                                  return isRTL ? (
                                    <>
                                      <span className={cn("text-sm sm:text-lg md:text-xl font-bold", item.has_discount ? "text-red-500" : "text-primary")}>
                                        {toArabicNumerals(itemTotal)} {getLocalizedCurrency('KWD')}
                                      </span>
                                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{t('cart.total')}:</span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{t('cart.total')}:</span>
                                      <span className={cn("text-sm sm:text-lg md:text-xl font-bold", item.has_discount ? "text-red-500" : "text-primary")}>
                                        {toArabicNumerals(itemTotal)} {getLocalizedCurrency('KWD')}
                                      </span>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className={cn("flex items-center gap-2 sm:gap-3 md:gap-4", isRTL && "flex-row-reverse justify-end")}>
                              <span className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg">
                                {t('cart.quantity')}
                              </span>
                              <div className={cn("flex items-center gap-1.5 sm:gap-2 md:gap-3 bg-gray-50 dark:bg-gray-700/50 p-1 sm:p-1.5 rounded-lg sm:rounded-xl", isRTL && "flex-row-reverse")}>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-white dark:bg-gray-600 text-primary rounded-md sm:rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  onClick={() => handleQuantityChange(item.id, -1, item.selectedSize)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                                
                                <span className="w-10 sm:w-12 md:w-14 text-center font-bold text-base sm:text-lg md:text-xl text-gray-900 dark:text-white">
                                  {toArabicNumerals(item.quantity)}
                                </span>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-white rounded-md sm:rounded-lg shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                  onClick={() => handleQuantityChange(item.id, 1, item.selectedSize)}
                                  disabled={item.quantity >= 10}
                                >
                                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
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
                        {t('cart.orderSummary')}
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
                        {t('cart.orderSummary')}
                      </h2>
                    </>
                  )}
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
                  
                  <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700">
                    {isRTL ? (
                      <>
                        <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">{toArabicNumerals(tax.toFixed(2))} {getLocalizedCurrency('KWD')}</span>
                        <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.tax')}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{t('cart.tax')}</span>
                        <span className="font-bold text-sm sm:text-base md:text-lg text-gray-900 dark:text-white">{toArabicNumerals(tax.toFixed(2))} {getLocalizedCurrency('KWD')}</span>
                      </>
                    )}
                  </div>
                  
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
                
                {/* Action Buttons */}
                <div className="space-y-3 sm:space-y-4">
                  <AnimatedButton
                    className="w-full py-3 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-bold shadow-xl hover:shadow-2xl bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                    size="lg"
                    onClick={() => navigate('/checkout')}
                  >
                    <Shield className={cn("w-4 h-4 sm:w-5 sm:h-5", isRTL ? "ml-2" : "mr-2")} />
                    {t('cart.checkout')}
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    )}
                  </AnimatedButton>
                  
                  <AnimatedButton
                    variant="outline"
                    className="w-full py-2.5 sm:py-3 md:py-4 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold text-sm sm:text-base"
                    onClick={() => navigate('/products')}
                  >
                    <ShoppingCart className={cn("w-4 h-4 sm:w-5 sm:h-5", isRTL ? "ml-2" : "mr-2")} />
                    {t('cart.continueShopping')}
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
        </div>
      </div>
    </div>
  );
};

export default Cart;