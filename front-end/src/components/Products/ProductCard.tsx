import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Product } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import LazyImageContainer from '@/components/ui/LazyImageContainer';
import facebookPixel from '@/services/facebookPixel';
import { StockStatus, canAddToCart } from './StockStatus';
import { SizeSelector } from './SizeSelector';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeSelector, setShowSizeSelector] = useState(false);

  // Function to convert numbers to Arabic numerals
  const toArabicNumerals = (num: string | number): string => {
    if (i18n.language !== 'ar') return num.toString();
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // التحقق من المخزون قبل الإضافة
    const validation = canAddToCart(product, 1);
    if (!validation.canAdd) {
      toast.error(validation.reason || (i18n.language === 'ar' ? 'لا يمكن إضافة المنتج' : 'Cannot add product'));
      return;
    }

    // إذا كان المنتج يحتاج مقاس، افتح selector
    if (product.has_sizes && product.sizes && product.sizes.length > 0) {
      setShowSizeSelector(true);
      return;
    }

    // إضافة بدون مقاس
    addToCart(product);
    toast.success(t('products.addToCart'));

    // Track AddToCart event for Facebook Pixel
    facebookPixel.trackAddToCart({
      content_name: product.title || product.name,
      content_category: product.category?.name,
      content_ids: [product.id.toString()],
      value: parseFloat(product.price),
      currency: 'KWD'
    });
  };

  const handleSelectSize = (size: string) => {
    addToCart(product, size);
    toast.success(t('products.addToCart'));

    // Track AddToCart event for Facebook Pixel
    facebookPixel.trackAddToCart({
      content_name: product.title || product.name,
      content_category: product.category?.name,
      content_ids: [product.id.toString()],
      value: parseFloat(product.price),
      currency: 'KWD'
    });
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? t('products.removedFromWishlist', 'Removed from wishlist') : t('products.addedToWishlist'));
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group relative bg-card rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-border/30 hover:border-primary/20"
    >
      <Link to={`/product/${product.slug}`} className="block">
        {/* Stock Status Badge */}
        <div className="absolute top-1.5 start-1.5 z-10">
          <StockStatus product={product} variant="minimal" />
        </div>

        {/* Quick Actions - Show on hover */}
        <div className="absolute top-1.5 end-1.5 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-1 rounded-full bg-white/90 backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground shadow-sm transition-colors"
          >
            <Eye className="w-3 h-3" />
          </motion.div>
        </div>

        {/* Product Image - Square aspect ratio */}
        <div className="aspect-square bg-muted/20 overflow-hidden relative">
          {product.images && product.images[0] ? (
            <LazyImageContainer
               src={product.images[0] || '/placeholder-product.jpg'}
               alt={product.title}
               aspectRatio="square"
               className="group-hover:scale-105 transition-transform duration-300 ease-out"
               showSkeleton={true}
               quality="medium"
               threshold={0.2}
               rootMargin="50px"
              fallback={
                <div className="flex items-center justify-center h-full bg-muted/30">
                  <div className="text-center text-muted-foreground">
                    <div className="w-4 h-4 mx-auto mb-1 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs">لا توجد صورة</p>
                  </div>
                </div>
              }
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingCart className="w-6 h-6 mb-1 opacity-20" />
              <span className="text-xs">{t('products.noImage')}</span>
            </div>
          )}
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </div>
      </Link>

      {/* Product Info - Compact spacing */}
      <div className="p-2.5 space-y-2">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium leading-none">
            {product.category.name}
          </p>
        )}

        {/* Title */}
        <h3 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 leading-tight min-h-[2rem]">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex items-center justify-between py-0.5">
          {product.has_discount ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-red-500">
                {toArabicNumerals(parseFloat(product.discounted_price || product.price).toFixed(2))} 
                <span className="text-xs font-medium text-red-500 ms-1">
                  {i18n.language === 'ar' ? 'د.ك' : product.currency}
                </span>
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {toArabicNumerals(parseFloat(product.price_before_discount || product.price).toFixed(2))}
              </span>
              <Badge className="bg-red-500 text-white text-[10px] px-1 py-0">
                {Math.round(product.discount_percentage || 0)}% {i18n.language === 'ar' ? 'خصم' : 'OFF'}
              </Badge>
            </div>
          ) : (
            <span className="text-sm font-bold text-primary">
              {toArabicNumerals(parseFloat(product.price).toFixed(2))} 
              <span className="text-xs font-medium text-muted-foreground ms-1">
                {i18n.language === 'ar' ? 'د.ك' : product.currency}
              </span>
            </span>
          )}
        </div>

        {/* Action Button - Based on inventory status */}
        <Button
          size="sm"
          variant={product.is_in_stock ? "default" : "outline"}
          className="w-full gap-1 h-7 text-xs font-medium hover:scale-[1.01] transition-transform shadow-sm rounded-3xl"
          onClick={handleAddToCart}
          disabled={!product.is_in_stock}
        >
          <ShoppingCart className="w-3 h-3" />
          {product.is_in_stock 
            ? (i18n.language === 'ar' ? 'أضف للسلة' : 'Add to Cart')
            : (i18n.language === 'ar' ? 'نفذت الكمية' : 'Out of Stock')}
        </Button>
      </div>

      {/* Size Selector Dialog */}
      {product.has_sizes && product.sizes && (
        <SizeSelector
          sizes={product.sizes}
          open={showSizeSelector}
          onClose={() => setShowSizeSelector(false)}
          onSelectSize={handleSelectSize}
          productTitle={product.title}
        />
      )}
    </motion.div>
  );
};
