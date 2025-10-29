import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { getInventoryTransactions, InventoryProduct, InventoryTransaction } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, RotateCcw, TrendingUp, TrendingDown, Calendar, User, Package, History } from 'lucide-react';
import { toast } from 'sonner';

interface InventoryTransactionsDialogProps {
  product: InventoryProduct;
  onClose: () => void;
}

const InventoryTransactionsDialog: React.FC<InventoryTransactionsDialogProps> = ({ product, onClose }) => {
  const { i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'increase' | 'decrease' | 'adjustment'>('all');
  const [reasonFilter, setReasonFilter] = useState<'all' | 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const toArabicNumerals = (num: string | number | undefined | null): string => {
    if (i18n.language !== 'ar') return num?.toString() || '0';
    if (num === undefined || num === null || num === '') return '0';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, reasonFilter, currentPage]);

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: 20,
      };
      
      if (typeFilter !== 'all') params.type = typeFilter;
      if (reasonFilter !== 'all') params.reason = reasonFilter;

      const response = await getInventoryTransactions(token, product.id, params);
      if (response.success) {
        setTransactions(response.data.transactions.data);
        setTotalPages(response.data.transactions.last_page);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error(isRTL ? 'خطأ في جلب السجل' : 'Error fetching transactions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'increase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const labels = {
      increase: isRTL ? 'زيادة' : 'Increase',
      decrease: isRTL ? 'نقصان' : 'Decrease',
      adjustment: isRTL ? 'تعديل' : 'Adjustment',
    };
    
    const colors = {
      increase: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      decrease: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      adjustment: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    };

    return (
      <Badge variant="secondary" className={colors[type as keyof typeof colors] || colors.adjustment}>
        {labels[type as keyof typeof labels] || type}
      </Badge>
    );
  };

  const getReasonLabel = (reason: string) => {
    const labels = {
      purchase: isRTL ? 'استلام بضاعة' : 'Purchase',
      sale: isRTL ? 'بيع' : 'Sale',
      return: isRTL ? 'إرجاع' : 'Return',
      adjustment: isRTL ? 'تعديل يدوي' : 'Adjustment',
      damage: isRTL ? 'تلف/فقدان' : 'Damage',
    };
    return labels[reason as keyof typeof labels] || reason;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-12 translate-x-12 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-purple-400/5 rounded-full translate-y-10 -translate-x-10 pointer-events-none"></div>
        
        <DialogHeader className="space-y-3 relative">
          <DialogTitle className={`text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
            {isRTL ? (
              <>
                {isRTL ? 'سجل حركات المخزون' : 'Transaction History'}
                <History className="w-6 h-6 text-purple-600" />
              </>
            ) : (
              <>
                <History className="w-6 h-6 text-purple-600" />
                {isRTL ? 'سجل حركات المخزون' : 'Transaction History'}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {isRTL ? 'عرض تفصيلي لجميع حركات المخزون والتعديلات على هذا المنتج' : 'Detailed view of all inventory movements and adjustments for this product'}
          </DialogDescription>
        </DialogHeader>

        {/* Product Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -translate-y-8 translate-x-8"></div>
            <CardContent className="p-4 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-600" />
                  {isRTL ? 'المنتج:' : 'Product:'}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{product.title}</span>
              </div>
              <div className="flex items-center justify-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isRTL ? 'المخزون الحالي: ' : 'Current Stock: '}
                </span>
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 ml-2">
                  {toArabicNumerals(product.stock_quantity || 0)} {isRTL ? 'قطعة' : 'items'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
            <CardContent className="p-4 relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'نوع الحركة' : 'Type'}
                  </label>
                  <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="rounded-lg">{isRTL ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="increase" className="rounded-lg">{isRTL ? 'زيادة' : 'Increase'}</SelectItem>
                      <SelectItem value="decrease" className="rounded-lg">{isRTL ? 'نقصان' : 'Decrease'}</SelectItem>
                      <SelectItem value="adjustment" className="rounded-lg">{isRTL ? 'تعديل' : 'Adjustment'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {isRTL ? 'السبب' : 'Reason'}
                  </label>
                  <Select value={reasonFilter} onValueChange={(value: any) => setReasonFilter(value)}>
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="rounded-lg">{isRTL ? 'الكل' : 'All'}</SelectItem>
                      <SelectItem value="purchase" className="rounded-lg">{isRTL ? 'استلام بضاعة' : 'Purchase'}</SelectItem>
                      <SelectItem value="sale" className="rounded-lg">{isRTL ? 'بيع' : 'Sale'}</SelectItem>
                      <SelectItem value="return" className="rounded-lg">{isRTL ? 'إرجاع' : 'Return'}</SelectItem>
                      <SelectItem value="adjustment" className="rounded-lg">{isRTL ? 'تعديل يدوي' : 'Adjustment'}</SelectItem>
                      <SelectItem value="damage" className="rounded-lg">{isRTL ? 'تلف/فقدان' : 'Damage'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
            <CardContent className="p-2">
              <ScrollArea className="h-[400px] w-full rounded-xl">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {isRTL ? 'جاري التحميل...' : 'Loading...'}
                    </p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <History className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                      {isRTL ? 'لا توجد حركات' : 'No transactions found'}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 space-y-3">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                        className="p-4 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            {getTypeBadge(transaction.type)}
                          </div>
                          <span
                            className={`text-xl font-bold ${
                              transaction.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {transaction.quantity > 0 ? '+' : ''}
                            {toArabicNumerals(transaction.quantity)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-3">

                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800">
                              {getReasonLabel(transaction.reason)}
                            </Badge>
                            {transaction.order && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {isRTL ? 'طلب' : 'Order'} #{transaction.order.order_number}
                              </Badge>
                            )}
                          </div>

                          {transaction.notes && (
                            <p className="text-slate-600 dark:text-slate-400 italic text-sm p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                              {transaction.notes}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t-2 border-slate-200 dark:border-slate-700">
                            {transaction.user && (
                              <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                <User className="h-3 w-3" />
                                <span>{transaction.user.name}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(transaction.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
            >
              {isRTL ? 'السابق' : 'Previous'}
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isRTL ? `صفحة ${toArabicNumerals(currentPage)} من ${toArabicNumerals(totalPages)}` : `Page ${currentPage} of ${totalPages}`}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
            >
              {isRTL ? 'التالي' : 'Next'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InventoryTransactionsDialog;

