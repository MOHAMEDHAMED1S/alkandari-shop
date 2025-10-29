import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SizeSelectorProps {
  sizes: string[];
  open: boolean;
  onClose: () => void;
  onSelectSize: (size: string) => void;
  productTitle: string;
}

export const SizeSelector = ({
  sizes,
  open,
  onClose,
  onSelectSize,
  productTitle,
}: SizeSelectorProps) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedSize) {
      onSelectSize(selectedSize);
      onClose();
      setSelectedSize(null);
    }
  };

  const handleCancel = () => {
    setSelectedSize(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent 
        className="sm:max-w-lg rounded-3xl border-2 border-border/50 bg-gradient-to-br from-background via-background to-muted/20 backdrop-blur-xl shadow-2xl"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <DialogHeader className="space-y-4 pb-2">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20">
              <Ruler className="w-6 h-6 text-primary" />
            </div>
          </div>
          <DialogTitle className={cn(
            "text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent",
            isRTL ? "text-right" : "text-left"
          )}>
            {t('product.selectSize', 'اختر المقاس')}
          </DialogTitle>
          <DialogDescription className={cn(
            "text-base text-muted-foreground font-medium",
            isRTL ? "text-right" : "text-left"
          )}>
            {productTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-6">
          <AnimatePresence mode="wait">
            {sizes.map((size, index) => (
              <motion.button
                key={size}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'group relative flex items-center justify-between rounded-2xl border-2 p-5 transition-all duration-300',
                  'hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:scale-[1.02]',
                  isRTL ? 'text-right' : 'text-left',
                  selectedSize === size
                    ? 'border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-md scale-[1.02]'
                    : 'border-border/50 bg-background/50 backdrop-blur-sm'
                )}
              >
                <span className={cn(
                  "font-semibold text-lg transition-colors duration-300",
                  selectedSize === size ? "text-primary" : "text-foreground"
                )}>
                  {size}
                </span>
                
                <div className={cn(
                  "flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300",
                  selectedSize === size 
                    ? "bg-primary scale-100" 
                    : "bg-border/20 scale-90 group-hover:scale-100"
                )}>
                  {selectedSize === size && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className={cn(
          "flex gap-3 pt-4 border-t border-border/50",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="flex-1 h-12 rounded-xl border-2 hover:bg-muted/50 transition-all duration-300"
          >
            {t('common.cancel', 'إلغاء')}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedSize}
            className={cn(
              "flex-1 h-12 rounded-xl shadow-lg transition-all duration-300",
              selectedSize 
                ? "hover:shadow-xl hover:scale-105" 
                : "opacity-50 cursor-not-allowed"
            )}
          >
            {t('common.confirm', 'تأكيد')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

