import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import {
  getInventoryProducts,
  getInventoryStatistics,
  toggleProductInventory,
  InventoryProduct,
  InventoryStatistics as InventoryStatsType,
} from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Edit,
  History,
  XCircle,
  CheckCircle,
  Plus,
  Minus,
  RotateCcw,
  Eye,
  Power,
} from 'lucide-react';
import { toast } from 'sonner';
import EditInventoryModal from '../../components/admin/EditInventoryModal';
import InventoryTransactionsDialog from '../../components/admin/InventoryTransactionsDialog';

const AdminInventory: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [statistics, setStatistics] = useState<InventoryStatsType | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<InventoryProduct[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<InventoryProduct[]>([]);

  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');
  const [hasInventory, setHasInventory] = useState<'all' | 'true' | 'false'>('all');
  const [sortBy, setSortBy] = useState<'stock_quantity' | 'title' | 'price' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 20;

  const [editModalProduct, setEditModalProduct] = useState<InventoryProduct | null>(null);
  const [transactionsProduct, setTransactionsProduct] = useState<InventoryProduct | null>(null);
  const [toggleInventoryProduct, setToggleInventoryProduct] = useState<InventoryProduct | null>(null);
  const [toggleInventoryData, setToggleInventoryData] = useState<{
    has_inventory: boolean;
    stock_quantity: number;
    low_stock_threshold: number;
  }>({ has_inventory: true, stock_quantity: 0, low_stock_threshold: 10 });

  const toArabicNumerals = (num: string | number | undefined | null): string => {
    if (i18n.language !== 'ar') return num?.toString() || '0';
    if (num === undefined || num === null || num === '') return '0';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  const getLocalizedCurrency = (currency: string | undefined | null): string => {
    if (i18n.language === 'ar') return 'د.ك';
    return currency || 'KWD';
  };

  useEffect(() => {
    fetchData();
  }, [search, stockStatus, hasInventory, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    if (token) {
      fetchStatistics();
    }
  }, [token]);

  const fetchStatistics = async () => {
    if (!token) return;
    try {
      const response = await getInventoryStatistics(token);
      if (response.success) {
        setStatistics(response.data.statistics);
        setLowStockProducts(response.data.low_stock_products);
        setOutOfStockProducts(response.data.out_of_stock_products);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: perPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      
      if (search) params.search = search;
      if (stockStatus !== 'all') params.stock_status = stockStatus;
      if (hasInventory !== 'all') params.has_inventory = hasInventory === 'true';

      const response = await getInventoryProducts(token, params);
      if (response.success) {
        setProducts(response.data.data);
        setTotalPages(response.data.last_page);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(isRTL ? 'خطأ في جلب البيانات' : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInventory = async () => {
    if (!token || !toggleInventoryProduct) return;
    
    try {
      const response = await toggleProductInventory(token, toggleInventoryProduct.id, toggleInventoryData);
      if (response.success) {
        toast.success(response.message || (isRTL ? 'تم التحديث بنجاح' : 'Updated successfully'));
        fetchData();
        fetchStatistics();
        setToggleInventoryProduct(null);
      }
    } catch (error: any) {
      console.error('Error toggling inventory:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'فشل التحديث' : 'Update failed'));
    }
  };

  const getStockBadge = (product: InventoryProduct) => {
    if (!product.has_inventory) {
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
        {isRTL ? 'بدون مخزون' : 'No Tracking'}
      </Badge>;
    }
    
    if (!product.is_in_stock) {
      return <Badge variant="destructive" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
        {isRTL ? 'نفذ' : 'Out of Stock'}
      </Badge>;
    }
    
    if (product.is_low_stock) {
      return <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
        {isRTL ? 'قليل' : 'Low Stock'}
      </Badge>;
    }
    
    return <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
      {isRTL ? 'متوفر' : 'In Stock'}
    </Badge>;
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-2 space-y-4 sm:space-y-6 mt-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        {isRTL ? (
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-end w-full sm:w-auto order-1 sm:order-2"
            >
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {isRTL ? 'إدارة المخزون' : 'Inventory Management'}
              </h1>
            </motion.div>
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <Button
                onClick={fetchStatistics}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                <RotateCcw className="h-4 w-4 ml-2" />
                <span className="font-semibold">{isRTL ? 'تحديث' : 'Refresh'}</span>
              </Button>
            </div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left"
            >
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {isRTL ? 'إدارة المخزون' : 'Inventory Management'}
              </h1>
            </motion.div>
            <Button
              onClick={fetchStatistics}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              <span className="font-semibold">{isRTL ? 'تحديث' : 'Refresh'}</span>
            </Button>
          </>
        )}
      </motion.div>

      {/* Statistics Cards */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6"
        >
          {/* Products with Inventory */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-4 sm:p-2">
                <div className="flex items-center justify-between">
                  {isRTL ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-7 w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'منتجات بمخزون' : 'With Inventory'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(statistics.total_products_with_inventory)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'منتجات بمخزون' : 'With Inventory'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(statistics.total_products_with_inventory)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-7 w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Out of Stock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-4 sm:p-2">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <XCircle className="h-7 w-7 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'منتجات نفذت' : 'Out of Stock'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(statistics.products_out_of_stock)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'منتجات نفذت' : 'Out of Stock'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(statistics.products_out_of_stock)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <XCircle className="h-7 w-7 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Low Stock */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-4 sm:p-2">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <AlertTriangle className="h-7 w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'منتجات قليلة' : 'Low Stock'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(statistics.products_low_stock)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'منتجات قليلة' : 'Low Stock'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(statistics.products_low_stock)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <AlertTriangle className="h-7 w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stock Value */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-4 sm:p-2">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-7 w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'قيمة المخزون' : 'Stock Value'}
                        </p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(Number(statistics.total_stock_value).toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {toArabicNumerals(statistics.total_stock_quantity)} {isRTL ? 'قطعة' : 'items'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'قيمة المخزون' : 'Stock Value'}
                        </p>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(Number(statistics.total_stock_value).toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {toArabicNumerals(statistics.total_stock_quantity)} {isRTL ? 'قطعة' : 'items'}
                        </p>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-7 w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-3"
        >
          {lowStockProducts.length > 0 && (
            <Alert className="border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50/80 to-orange-50/40 dark:from-orange-950/30 dark:to-orange-950/10 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <AlertTitle className="text-orange-900 dark:text-orange-100 font-semibold">
                {isRTL ? `⚠️ لديك ${toArabicNumerals(lowStockProducts.length)} منتج قليل المخزون` : `⚠️ ${lowStockProducts.length} Low Stock Products`}
              </AlertTitle>
              <AlertDescription className="text-orange-800 dark:text-orange-200 text-sm">
                <ul className="mt-2 space-y-1">
                  {lowStockProducts.slice(0, 3).map((p) => (
                    <li key={p.id}>
                      <strong>{p.title}</strong> - {isRTL ? 'متبقي' : 'Remaining'} {toArabicNumerals(p.stock_quantity || 0)} {isRTL ? 'قطعة' : 'items'}
                    </li>
                  ))}
                  {lowStockProducts.length > 3 && (
                    <li className="text-sm opacity-75">
                      {isRTL ? `و ${toArabicNumerals(lowStockProducts.length - 3)} منتجات أخرى...` : `and ${lowStockProducts.length - 3} more...`}
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {outOfStockProducts.length > 0 && (
            <Alert className="border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/80 to-red-50/40 dark:from-red-950/30 dark:to-red-950/10 shadow-sm">
              <XCircle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-900 dark:text-red-100 font-semibold">
                {isRTL ? `🔴 لديك ${toArabicNumerals(outOfStockProducts.length)} منتج نفذ` : `🔴 ${outOfStockProducts.length} Out of Stock Products`}
              </AlertTitle>
              <AlertDescription className="text-red-800 dark:text-red-200 text-sm">
                <ul className="mt-2 space-y-1">
                  {outOfStockProducts.slice(0, 3).map((p) => (
                    <li key={p.id}>
                      <strong>{p.title}</strong>
                    </li>
                  ))}
                  {outOfStockProducts.length > 3 && (
                    <li className="text-sm opacity-75">
                      {isRTL ? `و ${toArabicNumerals(outOfStockProducts.length - 3)} منتجات أخرى...` : `and ${outOfStockProducts.length - 3} more...`}
                    </li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isRTL ? 'البحث' : 'Search'}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={isRTL ? 'ابحث عن منتج...' : 'Search products...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isRTL ? 'حالة المخزون' : 'Stock Status'}
            </label>
            <Select value={stockStatus} onValueChange={(value: any) => setStockStatus(value)}>
              <SelectTrigger className="rounded-xl border-slate-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="in_stock">{isRTL ? 'متوفر' : 'In Stock'}</SelectItem>
                <SelectItem value="out_of_stock">{isRTL ? 'نفذ' : 'Out of Stock'}</SelectItem>
                <SelectItem value="low_stock">{isRTL ? 'قليل' : 'Low Stock'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isRTL ? 'تتبع المخزون' : 'Inventory Tracking'}
            </label>
            <Select value={hasInventory} onValueChange={(value: any) => setHasInventory(value)}>
              <SelectTrigger className="rounded-xl border-slate-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                <SelectItem value="true">{isRTL ? 'بمخزون' : 'With Tracking'}</SelectItem>
                <SelectItem value="false">{isRTL ? 'بدون مخزون' : 'No Tracking'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isRTL ? 'الترتيب' : 'Sort By'}
            </label>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="rounded-xl border-slate-200 focus:border-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">{isRTL ? 'التاريخ' : 'Date'}</SelectItem>
                <SelectItem value="title">{isRTL ? 'الاسم' : 'Name'}</SelectItem>
                <SelectItem value="stock_quantity">{isRTL ? 'الكمية' : 'Quantity'}</SelectItem>
                <SelectItem value="price">{isRTL ? 'السعر' : 'Price'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="relative overflow-hidden border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 border-b-2 border-slate-200 dark:border-slate-700 hover:from-slate-100 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-800">
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">{isRTL ? 'المنتج' : 'Product'}</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">{isRTL ? 'السعر' : 'Price'}</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200">{isRTL ? 'الكمية' : 'Quantity'}</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-200 text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                          {isRTL ? 'جاري التحميل...' : 'Loading...'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <Package className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          {isRTL ? 'لا توجد منتجات' : 'No products found'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className="group transition-all duration-300 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 hover:shadow-sm"
                    >
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={product.images[0] || '/placeholder.png'}
                              alt={product.title}
                              className="w-14 h-14 rounded-xl object-cover border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-all duration-300 shadow-sm"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                              {product.title}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                                {product.category.name}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                        {toArabicNumerals(Number(product.price).toFixed(2))} {getLocalizedCurrency(product.currency)}
                      </TableCell>
                      <TableCell>{getStockBadge(product)}</TableCell>
                      <TableCell>
                        {!product.has_inventory ? (
                          <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            <Package className="h-3 w-3 mr-1" />
                            {isRTL ? 'غير محدود' : 'Unlimited'}
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span
                              className={`font-bold text-lg ${
                                !product.is_in_stock
                                  ? 'text-red-600 dark:text-red-400'
                                  : product.is_low_stock
                                  ? 'text-orange-600 dark:text-orange-400'
                                  : 'text-green-600 dark:text-green-400'
                              }`}
                            >
                              {toArabicNumerals(product.stock_quantity || 0)}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {isRTL ? 'قطعة' : 'items'}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          {product.has_inventory && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditModalProduct(product)}
                                className="rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-800 dark:hover:text-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                {isRTL ? 'تعديل' : 'Edit'}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setTransactionsProduct(product)}
                                className="rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-800 dark:hover:text-purple-200 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <History className="h-3 w-3 mr-1" />
                                {isRTL ? 'السجل' : 'History'}
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setToggleInventoryProduct(product);
                              setToggleInventoryData({
                                has_inventory: !product.has_inventory,
                                stock_quantity: product.stock_quantity || 0,
                                low_stock_threshold: product.low_stock_threshold || 10,
                              });
                            }}
                            className={`rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                              product.has_inventory
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-800 dark:hover:text-red-200'
                                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-800 dark:hover:text-green-200'
                            }`}
                          >
                            <Power className="h-3 w-3 mr-1" />
                            {product.has_inventory ? (isRTL ? 'تعطيل' : 'Disable') : (isRTL ? 'تفعيل' : 'Enable')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-3 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <Package className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {isRTL ? 'لا توجد منتجات' : 'No products found'}
                </p>
              </div>
            ) : (
              products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
                >
                  {/* Product Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={product.images[0] || '/placeholder.png'}
                      alt={product.title}
                      className="w-16 h-16 rounded-lg object-cover border-2 border-slate-200 dark:border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1 truncate">
                        {product.title}
                      </h3>
                      <Badge variant="outline" className="text-xs bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 mb-1">
                        {product.category.name}
                      </Badge>
                      <div className="mt-1">
                        {getStockBadge(product)}
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {isRTL ? 'السعر' : 'Price'}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {toArabicNumerals(Number(product.price).toFixed(2))} {getLocalizedCurrency(product.currency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        {isRTL ? 'الكمية' : 'Quantity'}
                      </p>
                      {!product.has_inventory ? (
                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          <Package className="h-3 w-3 mr-1" />
                          {isRTL ? 'غير محدود' : 'Unlimited'}
                        </Badge>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-bold text-lg ${
                              !product.is_in_stock
                                ? 'text-red-600 dark:text-red-400'
                                : product.is_low_stock
                                ? 'text-orange-600 dark:text-orange-400'
                                : 'text-green-600 dark:text-green-400'
                            }`}
                          >
                            {toArabicNumerals(product.stock_quantity || 0)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {isRTL ? 'قطعة' : 'items'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {product.has_inventory && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditModalProduct(product)}
                          className="flex-1 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          {isRTL ? 'تعديل' : 'Edit'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setTransactionsProduct(product)}
                          className="flex-1 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs"
                        >
                          <History className="h-3 w-3 mr-1" />
                          {isRTL ? 'السجل' : 'History'}
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setToggleInventoryProduct(product);
                        setToggleInventoryData({
                          has_inventory: !product.has_inventory,
                          stock_quantity: product.stock_quantity || 0,
                          low_stock_threshold: product.low_stock_threshold || 10,
                        });
                      }}
                      className={`flex-1 rounded-xl text-xs ${
                        product.has_inventory
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40'
                          : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/40'
                      }`}
                    >
                      <Power className="h-3 w-3 mr-1" />
                      {product.has_inventory ? (isRTL ? 'تعطيل' : 'Disable') : (isRTL ? 'تفعيل' : 'Enable')}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-4 border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {isRTL ? 'السابق' : 'Previous'}
              </Button>
              <div className="flex items-center gap-2 order-first sm:order-none">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {isRTL ? `صفحة ${toArabicNumerals(currentPage)} من ${toArabicNumerals(totalPages)}` : `Page ${currentPage} of ${totalPages}`}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {isRTL ? 'التالي' : 'Next'}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Edit Modal */}
      {editModalProduct && (
        <EditInventoryModal
          product={editModalProduct}
          onClose={() => setEditModalProduct(null)}
          onSuccess={() => {
            setEditModalProduct(null);
            fetchData();
            fetchStatistics();
          }}
        />
      )}

      {/* Transactions Dialog */}
      {transactionsProduct && (
        <InventoryTransactionsDialog
          product={transactionsProduct}
          onClose={() => setTransactionsProduct(null)}
        />
      )}

      {/* Toggle Inventory Dialog */}
      <AlertDialog open={!!toggleInventoryProduct} onOpenChange={() => setToggleInventoryProduct(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleInventoryData.has_inventory
                ? (isRTL ? 'تفعيل تتبع المخزون' : 'Enable Inventory Tracking')
                : (isRTL ? 'تعطيل تتبع المخزون' : 'Disable Inventory Tracking')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleInventoryData.has_inventory ? (
                <div className="space-y-4 pt-4">
                  <p>{isRTL ? 'أدخل الكمية الابتدائية وحد التنبيه:' : 'Enter initial quantity and low stock threshold:'}</p>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isRTL ? 'الكمية الابتدائية' : 'Initial Quantity'}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={toggleInventoryData.stock_quantity}
                      onChange={(e) =>
                        setToggleInventoryData({
                          ...toggleInventoryData,
                          stock_quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {isRTL ? 'حد التنبيه (المخزون القليل)' : 'Low Stock Threshold'}
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={toggleInventoryData.low_stock_threshold}
                      onChange={(e) =>
                        setToggleInventoryData({
                          ...toggleInventoryData,
                          low_stock_threshold: parseInt(e.target.value) || 10,
                        })
                      }
                      className="rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <p>{isRTL ? 'سيتم تعطيل تتبع المخزون لهذا المنتج. هل أنت متأكد؟' : 'Inventory tracking will be disabled for this product. Are you sure?'}</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">{isRTL ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleInventory} className="rounded-xl bg-blue-600 hover:bg-blue-700">
              {isRTL ? 'تأكيد' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminInventory;

