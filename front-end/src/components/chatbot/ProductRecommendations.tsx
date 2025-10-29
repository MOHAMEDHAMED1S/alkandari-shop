import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ShoppingCart, ChevronDown, Package } from 'lucide-react';
import { RecommendedProduct } from '../../services/chatbotService';
import { Button } from '../ui/button';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../lib/api';
import { toast } from 'sonner';
import { canAddToCart } from '../Products/StockStatus';
import facebookPixel from '../../services/facebookPixel';

interface ProductRecommendationsProps {
  products: RecommendedProduct[];
}

export function ProductRecommendations({ products }: ProductRecommendationsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { addToCart } = useCart();
  
  if (!products || products.length === 0) return null;

  const handleProductClick = (product: RecommendedProduct) => {
    window.open(product.url, '_blank');
  };

  const handleAddToCart = (product: RecommendedProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // تحويل RecommendedProduct إلى Product format
    const productForCart: Product = {
      id: product.id,
      title: product.name || product.slug.replace(/-/g, ' '),
      slug: product.slug,
      description: '',
      short_description: '',
      price: product.price,
      currency: 'KWD',
      is_available: true,
      is_in_stock: true,
      has_inventory: false,
      stock_quantity: null,
      is_low_stock: false,
      has_discount: false,
      discounted_price: null,
      price_before_discount: null,
      discount_percentage: null,
      category_id: 0,
      images: product.image ? [product.image] : [],
      created_at: '',
      updated_at: '',
      category: {
        id: 0,
        name: '',
        slug: '',
      },
      name: product.name || product.slug.replace(/-/g, ' '),
    };
    
    // التحقق من المخزون قبل الإضافة
    const validation = canAddToCart(productForCart, 1);
    if (!validation.canAdd) {
      toast.error(validation.reason || 'لا يمكن إضافة المنتج');
      return;
    }

    // إضافة المنتج للسلة بدون معامل الكمية (مثل ProductCard)
    addToCart(productForCart);
    toast.success('تم إضافة المنتج للسلة بنجاح', {
      description: product.name || product.slug.replace(/-/g, ' '),
      duration: 3000,
    });

    // Track AddToCart event for Facebook Pixel
    facebookPixel.trackAddToCart({
      content_name: product.name || product.slug.replace(/-/g, ' '),
      content_category: undefined,
      content_ids: [product.id.toString()],
      value: parseFloat(product.price),
      currency: 'KWD'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      dir="rtl"
    >
      {/* Header مع زر Expand/Collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="bg-gray-800 rounded-lg p-1.5">
            <Package className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="text-right">
            <h4 className="text-xs font-semibold text-gray-900">منتجات مقترحة</h4>
            <p className="text-[10px] text-gray-500">{products.length} منتج</p>
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
      </button>

      {/* المنتجات */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-gray-200"
          >
            <div className="p-2 space-y-2">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="group bg-gray-50 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden border border-gray-100 hover:border-gray-200"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="p-2.5">
                    <div className="flex gap-2.5">
                      {/* صورة المنتج */}
                      {product.image && (
                        <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-white border border-gray-200">
                          <img
                            src={product.image}
                            alt={product.name || product.slug}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                            loading="lazy"
                          />
                        </div>
                      )}
                      
                      {/* معلومات المنتج */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <h5 className="text-xs font-medium text-gray-900 line-clamp-2 leading-tight mb-1">
                          {product.name || product.slug.replace(/-/g, ' ')}
                        </h5>
                        
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm font-bold text-gray-900">
                              {Number(product.price).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-gray-500">د.ك</span>
                          </div>
                          
                          {/* الأزرار */}
                          <div className="flex gap-1.5">
                            <Button
                              onClick={(e) => handleAddToCart(product, e)}
                              size="sm"
                              className="bg-gray-800 hover:bg-gray-900 text-white h-7 px-3 text-[11px] rounded-full"
                            >
                              <ShoppingCart className="h-3 w-3 ml-1" />
                              أضف
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 w-7 p-0 border-gray-200 hover:border-gray-300 hover:bg-white rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProductClick(product);
                              }}
                            >
                              <ExternalLink className="h-3 w-3 text-gray-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}