import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { adjustInventory, InventoryProduct } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Minus, RotateCcw, AlertCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditInventoryModalProps {
  product: InventoryProduct;
  onClose: () => void;
  onSuccess: () => void;
}

const EditInventoryModal: React.FC<EditInventoryModalProps> = ({ product, onClose, onSuccess }) => {
  const { i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [action, setAction] = useState<'set' | 'increase' | 'decrease'>('set');
  const [quantity, setQuantity] = useState<number>(product.stock_quantity || 0);
  const [reason, setReason] = useState<'purchase' | 'return' | 'adjustment' | 'damage'>('adjustment');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const toArabicNumerals = (num: string | number | undefined | null): string => {
    if (i18n.language !== 'ar') return num?.toString() || '0';
    if (num === undefined || num === null || num === '') return '0';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  const getNewQuantity = () => {
    const currentStock = product.stock_quantity || 0;
    if (action === 'set') return quantity;
    if (action === 'increase') return currentStock + quantity;
    if (action === 'decrease') return Math.max(0, currentStock - quantity);
    return currentStock;
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (quantity <= 0) {
      toast.error(isRTL ? 'الكمية يجب أن تكون أكبر من صفر' : 'Quantity must be greater than zero');
      return;
    }

    setLoading(true);
    try {
      const response = await adjustInventory(token, product.id, {
        action,
        quantity,
        reason,
        notes: notes || undefined,
      });

      if (response.success) {
        toast.success(response.message || (isRTL ? 'تم تحديث المخزون بنجاح' : 'Inventory updated successfully'));
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error adjusting inventory:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل تحديث المخزون' : 'Failed to update inventory'));
    } finally {
      setLoading(false);
    }
  };

  const actionLabels = {
    set: isRTL ? 'تحديد الكمية' : 'Set Quantity',
    increase: isRTL ? 'زيادة المخزون' : 'Increase Stock',
    decrease: isRTL ? 'تقليل المخزون' : 'Decrease Stock',
  };

  const reasonLabels = {
    purchase: isRTL ? 'استلام بضاعة' : 'Purchase/Received',
    return: isRTL ? 'إرجاع من عميل' : 'Customer Return',
    adjustment: isRTL ? 'تعديل يدوي/جرد' : 'Manual Adjustment',
    damage: isRTL ? 'تلف/فقدان' : 'Damage/Loss',
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[600px] max-h-[90vh] overflow-y-auto">
        
        <DialogHeader className="space-y-3">
          <DialogTitle className={`text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
            {isRTL ? (
              <>
                {isRTL ? 'تعديل مخزون المنتج' : 'Edit Product Inventory'}
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </>
            ) : (
              <>
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                {isRTL ? 'تعديل مخزون المنتج' : 'Edit Product Inventory'}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600 dark:text-slate-400">
            {isRTL ? 'قم بتحديث كمية المخزون وتسجيل سبب التعديل للرجوع إليها لاحقاً' : 'Update the stock quantity and record the reason for future reference'}
          </DialogDescription>
        </DialogHeader>

        {/* Product Info Card */}
        <div className="mb-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isRTL ? 'المنتج:' : 'Product:'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                  {product.title}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg sm:rounded-xl border border-blue-200 dark:border-blue-800">
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Package className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                  {isRTL ? 'المخزون الحالي:' : 'Current Stock:'}
                </span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {toArabicNumerals(product.stock_quantity || 0)} {isRTL ? 'قطعة' : 'items'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Card */}
        <div className="mb-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Action Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{isRTL ? 'نوع الإجراء' : 'Action Type'}</Label>
                <Select value={action} onValueChange={(value: any) => setAction(value)}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="set" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <RotateCcw className="h-4 w-4 text-slate-600" />
                        {actionLabels.set}
                      </div>
                    </SelectItem>
                    <SelectItem value="increase" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-green-600" />
                        {actionLabels.increase}
                      </div>
                    </SelectItem>
                    <SelectItem value="decrease" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Minus className="h-4 w-4 text-red-600" />
                        {actionLabels.decrease}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {action === 'set'
                    ? (isRTL ? 'الكمية الجديدة' : 'New Quantity')
                    : (isRTL ? 'الكمية' : 'Quantity')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="rounded-xl text-lg font-semibold border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder={isRTL ? 'أدخل الكمية' : 'Enter quantity'}
                />
                {action !== 'set' && (
                  <Alert className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/80 to-blue-50/40 dark:from-blue-950/30 dark:to-blue-950/10 shadow-sm rounded-xl">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                      {isRTL ? 'المخزون بعد التعديل: ' : 'Stock after adjustment: '}
                      <strong className="font-bold text-blue-900 dark:text-blue-100">{toArabicNumerals(getNewQuantity())} {isRTL ? 'قطعة' : 'items'}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{isRTL ? 'السبب' : 'Reason'}</Label>
                <Select value={reason} onValueChange={(value: any) => setReason(value)}>
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="purchase" className="rounded-lg">{reasonLabels.purchase}</SelectItem>
                    <SelectItem value="return" className="rounded-lg">{reasonLabels.return}</SelectItem>
                    <SelectItem value="adjustment" className="rounded-lg">{reasonLabels.adjustment}</SelectItem>
                    <SelectItem value="damage" className="rounded-lg">{reasonLabels.damage}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isRTL ? 'أضف ملاحظات إن وجدت...' : 'Add notes if any...'}
                  rows={3}
                  className="rounded-xl resize-none border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={loading}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isRTL ? 'جاري التحديث...' : 'Updating...'}
              </>
            ) : (
              <>
                {isRTL ? 'حفظ التعديلات' : 'Save Changes'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryModal;

