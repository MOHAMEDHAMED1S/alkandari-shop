import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getProduct, Product } from '@/lib/api';
import { AnimatedButton } from '@/components/ui/animated-button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Minus, Plus, ShoppingCart, ArrowLeft, Star, Tag, Box, Truck, Shield, RotateCcw, Zap, Award, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import LazyImageContainer from '@/components/ui/LazyImageContainer';
import LazyImageGallery from '@/components/ui/LazyImageGallery';
import facebookPixel from '@/services/facebookPixel';
import { StockStatus, canAddToCart } from '@/components/Products/StockStatus';
import { SizeSelector } from '@/components/Products/SizeSelector';

const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const isRTL = i18n.language === 'ar';

  const toArabicNumerals = (num: string | number): string => {
    if (i18n.language !== 'ar') return num.toString();
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (!slug) return;
        
        const data = await getProduct(slug);
        setProduct(data.data);
        setQuantity(1);
        setSelectedImage(0);

        // Track ViewContent event when product is loaded
        if (data.data) {
          facebookPixel.trackViewContent({
            content_name: data.data.title || data.data.name,
            content_category: data.data.category?.name,
            content_ids: [data.data.id.toString()],
            content_type: 'product',
            value: parseFloat(data.data.price),
            currency: 'KWD'
          });
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error(t('products.errorLoading'));
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug, t]);

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    
    // تحديد الحد الأقصى للكمية بناءً على المخزون
    const maxQuantity = product.has_inventory && product.stock_quantity !== null
      ? Math.min(product.stock_quantity, 10)
      : 10;
    
    setQuantity(prev => Math.max(1, Math.min(prev + delta, maxQuantity)));
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    // التحقق من المخزون قبل الإضافة
    const validation = canAddToCart(product, quantity);
    if (!validation.canAdd) {
      toast.error(validation.reason || (isRTL ? 'لا يمكن إضافة المنتج' : 'Cannot add product'));
      return;
    }

    // إذا كان المنتج يحتاج مقاس ولم يتم اختياره
    if (product.has_sizes && product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error(isRTL ? 'الرجاء اختيار المقاس' : 'Please select a size');
      return;
    }

    addToCart(product, selectedSize || undefined, quantity);
    toast.success(t('cart.addedToCart'));

    // Track AddToCart event
    facebookPixel.trackAddToCart({
      content_name: product.title || product.name,
      content_category: product.category?.name,
      content_ids: [product.id.toString()],
      value: parseFloat(product.price) * quantity,
      currency: 'KWD'
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <Skeleton className="h-10 w-32 mb-8 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            <div className="space-y-6">
              <Skeleton className="aspect-square rounded-3xl" />
              <div className="grid grid-cols-5 gap-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="space-y-8">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <Box className="w-12 h-12 text-muted-foreground" />
              </div>
            </div>
            <h2 className="text-3xl font-bold mb-4">{t('products.notFound')}</h2>
            <p className="text-muted-foreground text-lg mb-10">{t('products.notFoundDesc')}</p>
            <AnimatedButton 
              onClick={() => navigate('/products')} 
              size="lg"
              className="w-full h-14 text-base font-semibold transition-colors hover:bg-primary hover:text-white"
            >
              <ArrowLeft className={cn("w-5 h-5", isRTL ? "ml-2 rotate-180" : "mr-2")} />
              {t('common.backToProducts')}
            </AnimatedButton>
          </motion.div>
        </Card>
      </div>
    );
  }

  const discountPercentage = product.oldPrice 
    ? Math.round(((parseFloat(product.oldPrice.toString()) - parseFloat(product.price.toString())) / parseFloat(product.oldPrice.toString())) * 100)
    : 0;

  return (
    <>
      <Helmet>
        <title>{product.title || product.name} - Expo Alkandaris</title>
        <meta name="description" content={product.description || `${product.title || product.name} - منتج عالي الجودة من Expo Alkandaris`} />
        <meta name="keywords" content={`${product.title || product.name}, ${product.category}, صابون, منتجات العناية, Expo Alkandaris`} />
        
        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={`${product.title || product.name} - Expo Alkandaris`} />
        <meta property="og:description" content={product.description || `${product.title || product.name} - منتج عالي الجودة من Expo Alkandaris`} />
        <meta property="og:image" content={product.images?.[0] || ''} />
        <meta property="og:url" content={`${window.location.origin}/products/${slug}`} />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content="Expo Alkandaris" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.title || product.name} - Expo Alkandaris`} />
        <meta name="twitter:description" content={product.description || `${product.title || product.name} - منتج عالي الجودة من Expo Alkandaris`} />
        <meta name="twitter:image" content={product.images?.[0] || ''} />
        
        {/* Product Schema */}
        <meta property="product:price:amount" content={Number(product.price).toFixed(2).toString()} />
        <meta property="product:price:currency" content="KWD" />
        <meta property="product:availability" content="in stock"  />
        <meta property="product:condition" content="new" />
        <meta property="product:brand" content="Expo Alkandaris" />
        
        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Expo Alkandaris" />
        <link rel="canonical" href={`${window.location.origin}/products/${slug}`} />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <AnimatedButton
            variant="ghost"
            onClick={() => navigate('/products')}
            className="gap-2 hover:bg-muted rounded-2xl px-4 py-2"
          >
            <ArrowLeft className={cn("w-4 h-4", isRTL && "rotate-180")} />
            {t('common.backToProducts')}
          </AnimatedButton>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Product Images Section */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="space-y-4"
          >
            <div className="relative">
              <Card className="overflow-hidden shadow-lg rounded-2xl">
                <div className="relative group">
                  {/* Stock Badge */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.2 }}
                  >

                  </motion.div>

                  {/* Discount Badge */}
                  {product.oldPrice && (
                    <motion.div
                      initial={{ scale: 0, rotate: 180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", delay: 0.3 }}
                    >
                      <Badge 
                        className={cn(
                          "absolute top-4 z-20 bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 shadow-lg font-bold rounded-xl",
                          isRTL ? "right-4" : "left-4"
                        )}
                      >
                        <Zap className={cn("w-3 h-3", isRTL ? "ml-1" : "mr-1")} />
                        {toArabicNumerals(discountPercentage)}% {t('products.off')}
                      </Badge>
                    </motion.div>
                  )}
                  
                  <div className="relative">
                    <LazyImageGallery
                      images={product.images}
                      alt={product.name}
                      aspectRatio="square"
                      className="rounded-none"
                      showThumbnails={true}
                      showFullscreen={false}
                      onImageChange={setSelectedImage}
                    />
                  </div>
                </div>
              </Card>

              {/* Trust Badges - Hidden on mobile, shown on larger screens */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="hidden sm:grid grid-cols-3 gap-2 mt-4"
              >
                {[
                  { icon: Truck, label: t('products.freeShipping') },
                  { icon: Shield, label: t('products.securePayment') },
                  { icon: RotateCcw, label: t('products.easyReturns') }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="p-3 text-center hover:shadow-lg transition-all duration-300 group rounded-xl">
                      <item.icon className="w-4 h-4 mx-auto mb-1 text-primary group-hover:scale-110 transition-transform" />
                      <p className="text-xs font-semibold">{item.label}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Product Info Section */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring", delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="p-4 sm:p-6 shadow-lg rounded-2xl">
              <div className="space-y-4">
                {/* Category */}
                {product.category && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge variant="outline" className="text-xs px-3 py-1.5 border-2 rounded-xl">
                      <Tag className={cn("w-3 h-3", isRTL ? "ml-1.5" : "mr-1.5")} />
                      {product.category.name}
                    </Badge>
                  </motion.div>
                )}
                
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <h1
                    className={cn(
                      "text-xl sm:text-2xl lg:text-3xl font-bold leading-tight",
                      isRTL && "text-right"
                    )}
                    style={{ 
                      direction: isRTL ? 'rtl' : 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {product?.name || product?.title || 'Product Name'}
                  </h1>
                </motion.div>



                {/* Price */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="relative"
                >
                  <div className={cn("flex items-baseline gap-2 p-4 rounded-xl bg-muted/50 border-2", isRTL && "flex-row-reverse justify-end")}>
                    <div className={cn("flex items-baseline gap-1", isRTL && "flex-row-reverse")}>
                      {isRTL ? (
                        // RTL: Currency first, then price
                        <>
                          <span 
                            className={cn("text-sm font-bold", product.has_discount ? "text-red-500" : "text-muted-foreground", isRTL && "text-right")} 
                            style={{ 
                              direction: isRTL ? 'rtl' : 'ltr',
                              textAlign: isRTL ? 'right' : 'left'
                            }}
                          >
                            {i18n.language === 'ar' ? 'د.ك' : 'KWD'}
                          </span>
                          <span 
                            className={cn("text-2xl sm:text-3xl lg:text-4xl font-black", product.has_discount ? "text-red-500" : "text-primary", isRTL && "text-right")} 
                            style={{ 
                              direction: isRTL ? 'rtl' : 'ltr',
                              textAlign: isRTL ? 'right' : 'left'
                            }}
                          >
                            {toArabicNumerals(parseFloat((product.has_discount ? product.discounted_price : product.price).toString()).toFixed(2))}
                          </span>
                        </>
                      ) : (
                        // LTR: Price first, then currency
                        <>
                          <span 
                            className={cn("text-2xl sm:text-3xl lg:text-4xl font-black", product.has_discount ? "text-red-500" : "text-primary", isRTL && "text-right")} 
                            style={{ 
                              direction: isRTL ? 'rtl' : 'ltr',
                              textAlign: isRTL ? 'right' : 'left'
                            }}
                          >
                            {toArabicNumerals(parseFloat((product.has_discount ? product.discounted_price : product.price).toString()).toFixed(2))}
                          </span>
                          <span 
                            className={cn("text-sm font-bold", product.has_discount ? "text-red-500" : "text-muted-foreground", isRTL && "text-right")} 
                            style={{ 
                              direction: isRTL ? 'rtl' : 'ltr',
                              textAlign: isRTL ? 'right' : 'left'
                            }}
                          >
                            {i18n.language === 'ar' ? 'د.ك' : 'KWD'}
                          </span>
                        </>
                      )}
                    </div>
                    {(product.has_discount || product.oldPrice) && (
                      <div className={cn("flex flex-col gap-1", isRTL && "text-right")}>
                        <span 
                          className={cn("text-sm text-muted-foreground line-through", isRTL && "text-right")} 
                          style={{ 
                            direction: isRTL ? 'rtl' : 'ltr',
                            textAlign: isRTL ? 'right' : 'left'
                          }}
                        >
                          {toArabicNumerals(parseFloat((product.has_discount ? product.price_before_discount : product.oldPrice)?.toString() || '0').toFixed(2))}
                        </span>
                        {product.has_discount && product.discount_percentage && (
                          <Badge className="bg-red-500 text-white w-fit">
                            {Math.round(product.discount_percentage)}% {i18n.language === 'ar' ? 'خصم' : 'OFF'}
                          </Badge>
                        )}
                        <span 
                          className={cn("text-xs font-semibold text-green-600", isRTL && "text-right")} 
                          style={{ 
                            direction: isRTL ? 'rtl' : 'ltr',
                            textAlign: isRTL ? 'right' : 'left'
                          }}
                        >
                          {t('products.save')} {toArabicNumerals(parseFloat((
                            product.has_discount 
                              ? (parseFloat(product.price_before_discount || '0') - parseFloat(product.discounted_price || '0'))
                              : (parseFloat(product.oldPrice?.toString() || '0') - parseFloat(product.price.toString()))
                          ).toFixed(2)))} {i18n.language === 'ar' ? 'د.ك' : 'KWD'}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>

                <Separator className="my-4" />

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-2"
                >
                  <h3 
                    className={cn("font-bold text-base", isRTL && "text-right")} 
                    style={{ 
                      direction: isRTL ? 'rtl' : 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {t('products.description')}
                  </h3>
                  <p 
                    className={cn("text-muted-foreground leading-relaxed text-sm", isRTL && "text-right")} 
                    style={{ 
                      direction: isRTL ? 'rtl' : 'ltr',
                      textAlign: isRTL ? 'right' : 'left'
                    }}
                  >
                    {product?.description || product?.short_description || 'No description available'}
                  </p>
                </motion.div>

                <Separator className="my-4" />

                {/* Stock Status */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="mb-4"
                >
                  <StockStatus product={product} variant="detailed" />
                </motion.div>

                {/* Size Selector */}
                {product.has_sizes && product.sizes && product.sizes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.77 }}
                    className="space-y-3 mb-4"
                  >
                    <h3 
                      className={cn("font-bold text-base", isRTL && "text-right")} 
                      style={{ 
                        direction: isRTL ? 'rtl' : 'ltr',
                        textAlign: isRTL ? 'right' : 'left'
                      }}
                    >
                      {t('product.availableSizes', 'المقاسات المتاحة')}:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {product.sizes.map((size) => (
                        <motion.button
                          key={size}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "relative p-3 rounded-xl border-2 text-sm font-medium transition-all w-full text-center flex items-center justify-center",
                            "hover:border-primary/50",
                            selectedSize === size
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background",
                            isRTL && "text-right"
                          )}
                        >
                          {size}
                          {selectedSize === size && (
                            <motion.div
                              layoutId="selectedSize"
                              className="absolute inset-0 bg-primary/5 rounded-xl"
                              initial={false}
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>
                    {selectedSize && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn("text-sm text-muted-foreground", isRTL && "text-right")}
                      >
                        {t('product.size', 'المقاس')}: <span className="font-bold text-primary">{selectedSize}</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Quantity Selector */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between w-full">
                    <span 
                      className={cn("font-bold text-base", isRTL ? "order-2 text-right" : "order-1 text-left")} 
                      style={{ 
                        direction: isRTL ? 'rtl' : 'ltr',
                        textAlign: isRTL ? 'right' : 'left'
                      }}
                    >
                      {t('products.quantity')}:
                    </span>
                    <div className={cn("flex items-center gap-2 bg-muted/50 p-1 rounded-xl border-2", isRTL ? "order-1 flex-row-reverse" : "order-2")}>
                      {isRTL ? (
                        // RTL: Plus button first, then quantity, then minus button
                        <>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <AnimatedButton
                              size="icon"
                              variant="outline"
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantity >= 10}
                              className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </AnimatedButton>
                          </motion.div>
                          <span 
                            className={cn("w-12 text-center font-black text-lg", isRTL && "text-right")}
                            style={{ 
                              direction: isRTL ? 'rtl' : 'ltr',
                              textAlign: isRTL ? 'right' : 'left'
                            }}
                          >
                            {quantity}
                          </span>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <AnimatedButton
                              size="icon"
                              variant="outline"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1}
                              className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </AnimatedButton>
                          </motion.div>
                        </>
                      ) : (
                        // LTR: Minus button first, then quantity, then plus button
                        <>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <AnimatedButton
                              size="icon"
                              variant="outline"
                              onClick={() => handleQuantityChange(-1)}
                              disabled={quantity <= 1}
                              className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </AnimatedButton>
                          </motion.div>
                          <span 
                            className={cn("w-12 text-center font-black text-lg", isRTL && "text-right")}
                            style={{ 
                              direction: isRTL ? 'rtl' : 'ltr',
                              textAlign: isRTL ? 'right' : 'left'
                            }}
                          >
                            {quantity}
                          </span>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <AnimatedButton
                              size="icon"
                              variant="outline"
                              onClick={() => handleQuantityChange(1)}
                              disabled={quantity >= 10}
                              className="h-8 w-8 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </AnimatedButton>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <AnimatedButton
                        size="lg"
                        className="w-full h-12 text-base font-bold shadow-lg relative overflow-hidden group rounded-xl"
                        onClick={handleAddToCart}
                        disabled={!product.is_in_stock}
                      >
                        <motion.div
                          animate={{
                            x: [-1000, 1000],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute inset-0 w-1/2 bg-white/20 skew-x-12"
                        />
                        <ShoppingCart className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                        {product.is_in_stock 
                          ? (isRTL ? 'أضف للسلة' : 'Add to Cart')
                          : (isRTL ? 'نفذت الكمية' : 'Out of Stock')}
                      </AnimatedButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <AnimatedButton
                        variant="outline"
                        size="lg"
                        className="w-full h-10 text-sm font-semibold border-2 hover:bg-muted transition-all rounded-xl hover:text-primary"
                        onClick={handleShare}
                      >
                        <Share2 className={cn("w-4 h-4", isRTL ? "ml-1" : "mr-1")} />
                        {t('products.share')}
                      </AnimatedButton>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </Card>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Card className="p-4 sm:p-6 shadow-lg rounded-2xl">
                  <h3 className={cn("font-bold text-lg mb-3", isRTL && "text-right")}>
                    {t('products.features')}
                  </h3>
                  <div className="space-y-2">
                    {product.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1 }}
                        whileHover={{ scale: 1.02, x: isRTL ? -5 : 5 }}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 hover:shadow-lg transition-all duration-300",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 shadow-md">
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        </div>
                        <p className={cn("flex-1 leading-relaxed font-medium text-sm pt-0.5", isRTL && "text-right")}>
                          {feature}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
            
            {/* Product Specifications */}
            {product.specifications && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <Card className="p-4 sm:p-6 shadow-lg rounded-2xl">
                  <h3 className={cn("font-bold text-lg mb-3", isRTL && "text-right")}>
                    {t('products.specifications')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 + index * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 hover:shadow-lg transition-all duration-300",
                          isRTL && "flex-row-reverse"
                        )}
                      >
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center shadow-md">
                            <Box className="w-2.5 h-2.5 text-primary" />
                          </div>
                          <span className="font-bold text-xs">{key}</span>
                        </div>
                        <span className="text-muted-foreground font-medium text-xs">{value}</span>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Trust Badges - Mobile only, shown at bottom */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, type: "spring" }}
              className="sm:hidden grid grid-cols-3 gap-2 mt-4"
            >
              {[
                { icon: Truck, label: t('products.freeShipping') },
                { icon: Shield, label: t('products.securePayment') },
                { icon: RotateCcw, label: t('products.easyReturns') }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="p-2 text-center hover:shadow-lg transition-all duration-300 group rounded-xl">
                    <item.icon className="w-4 h-4 mx-auto mb-1 text-primary group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-semibold">{item.label}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
};

export default ProductDetail;