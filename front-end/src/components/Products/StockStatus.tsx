import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/api';
import { useTranslation } from 'react-i18next';

interface StockStatusProps {
  product: Product;
  variant?: 'default' | 'detailed' | 'minimal';
  className?: string;
}

export const StockStatus = ({ product, variant = 'default', className }: StockStatusProps) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // منتج نفذ
  if (!product.is_in_stock) {
    return (
      <Badge 
        variant="destructive" 
        className={cn(
          "flex items-center gap-1.5 bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
          variant === 'minimal' && "text-xs px-2 py-0.5",
          className
        )}
      >
        <XCircle className={cn("w-3.5 h-3.5", variant === 'minimal' && "w-3 h-3")} />
        <span>{isRTL ? 'نفذت الكمية' : 'Out of Stock'}</span>
      </Badge>
    );
  }

  // منتج متاح (سواء كان له مخزون أو بدون تتبع مخزون)
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "flex items-center gap-1.5 bg-black-50 text-white-700 border-green-200 hover:bg-green-100",
        variant === 'minimal' && "text-xs px-2 py-0.5",
        className
      )}
    >
      <CheckCircle2 className={cn("w-3.5 h-3.5", variant === 'minimal' && "w-3 h-3")} />
      <span>{isRTL ? 'متوفر' : 'In Stock'}</span>
    </Badge>
  );
};

// Helper function to check if product can be added to cart
export const canAddToCart = (product: Product, requestedQuantity: number = 1): {
  canAdd: boolean;
  reason?: string;
} => {
  const isRTL = typeof window !== 'undefined' && 
    localStorage.getItem('i18nextLng') === 'ar';

  // التحقق من التوفر
  if (!product.is_in_stock) {
    return {
      canAdd: false,
      reason: isRTL 
        ? 'عذراً، هذا المنتج غير متوفر حالياً' 
        : 'Sorry, this product is currently unavailable'
    };
  }

  // التحقق من الكمية إذا كان له مخزون
  if (product.has_inventory && product.stock_quantity !== null) {
    if (product.stock_quantity < requestedQuantity) {
      return {
        canAdd: false,
        reason: isRTL 
          ? `عذراً، المتوفر فقط ${product.stock_quantity} قطعة` 
          : `Sorry, only ${product.stock_quantity} items available`
      };
    }
  }

  return { canAdd: true };
};

