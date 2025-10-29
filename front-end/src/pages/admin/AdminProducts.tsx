import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import LazyImageContainer from '@/components/ui/LazyImageContainer';
import AdminLazyImage from '@/components/admin/AdminLazyImage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Image as ImageIcon,
  TrendingUp,
  TrendingDown,
  Download,
  Upload,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import {
  getAdminProducts,
  getProductStatistics,
  deleteProduct,
  duplicateProduct,
  bulkUpdateProducts,
} from '@/lib/api';
import { toast } from 'sonner';
import ProductForm from '@/components/admin/ProductForm';
import ProductDetails from '@/components/admin/ProductDetails';
import ProductImages from '@/components/admin/ProductImages';
import BulkActions from '@/components/admin/BulkActions';
import NewExportProducts from '@/components/admin/exports/NewExportProducts';

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  currency: string;
  is_available: boolean;
  images: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
  created_at: string;
  updated_at: string;
  meta?: any;
}

interface ProductStatistics {
  total_products: number;
  available_products: number;
  unavailable_products: number;
  low_stock_products: number;
  out_of_stock_products: number;
  average_price: string;
  total_value: string;
  categories_with_products: number;
  products_this_month: number;
  products_this_year: number;
}

const AdminProducts: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';
  const [isDesktop, setIsDesktop] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Function to convert numbers to Arabic numerals
  const toArabicNumerals = (num: string | number | undefined | null): string => {
    if (i18n.language !== 'ar') return num?.toString() || '0';
    
    if (num === undefined || num === null || num === '') return '0';
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  // Function to get localized currency
  const getLocalizedCurrency = (currency: string | undefined | null): string => {
    if (i18n.language === 'ar') {
      return 'د.ك'; // Arabic currency symbol
    }
    return currency || 'KWD'; // English currency with fallback
  };

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [statistics, setStatistics] = useState<ProductStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  // Dialog states
  const [showProductForm, setShowProductForm] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [showProductImages, setShowProductImages] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showNewExportDialog, setShowNewExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Load products
  const loadProducts = async () => {
    if (!token) {
      console.log('No token available for loadProducts');
      return;
    }

    console.log('Loading products with token:', token.substring(0, 20) + '...');

    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category_id: categoryFilter !== 'all' ? parseInt(categoryFilter) : undefined,
        is_available: statusFilter !== 'all' ? statusFilter === 'available' : undefined,
        sort_by: sortBy,
        sort_direction: sortDirection,
        page: currentPage,
        per_page: perPage,
      };

      const response = await getAdminProducts(token, params);
      
      if (response.success) {
        setProducts(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setTotalProducts(response.data.total || 0);
      } else {
        toast.error(t('admin.products.loadError'));
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        console.log('Token expired or invalid, redirecting to login');
        toast.error('Session expired. Please login again.');
        // The AdminLayout will handle redirecting to login
        return;
      }
      
      toast.error(t('admin.products.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    if (!token) {
      console.log('No token available for loadStatistics');
      return;
    }

    console.log('Loading statistics with token:', token.substring(0, 20) + '...');

    try {
      setStatisticsLoading(true);
      const response = await getProductStatistics(token);
      
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error: any) {
      console.error('Error loading statistics:', error);
      
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        console.log('Token expired or invalid for statistics');
        return;
      }
      
      // Handle 500 Internal Server Error
      if (error.response?.status === 500) {
        console.log('Server error loading statistics, skipping for now');
        toast.error('Unable to load statistics. Please try again later.');
        return;
      }
    } finally {
      setStatisticsLoading(false);
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadProducts();
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortDirection, currentPage, perPage, token]);

  useEffect(() => {
    loadStatistics();
  }, [token]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle product actions
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const handleManageImages = (product: Product) => {
    setSelectedProduct(product);
    setShowProductImages(true);
  };

  const handleDuplicateProduct = async (product: Product) => {
    if (!token) return;

    try {
      const response = await duplicateProduct(token, product.id);
      if (response.success) {
        toast.success(t('admin.products.productDuplicated'));
        loadProducts();
      } else {
        toast.error(response.message || t('admin.products.duplicateError'));
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error(t('admin.products.duplicateError'));
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteDialog(true);
  };

  const confirmDeleteProduct = async () => {
    if (!selectedProduct || !token) return;

    try {
      const response = await deleteProduct(token, selectedProduct.id);
      if (response.success) {
        toast.success(t('admin.products.productDeleted'));
        loadProducts();
        loadStatistics();
      } else {
        toast.error(response.message || t('admin.products.deleteError'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('admin.products.deleteError'));
    } finally {
      setShowDeleteDialog(false);
      setSelectedProduct(null);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, data?: any) => {
    if (!token || selectedProducts.length === 0) return;

    try {
      const response = await bulkUpdateProducts(token, {
        product_ids: selectedProducts,
        action,
        ...data,
      });

      if (response.success) {
        toast.success(t('admin.products.bulkUpdateCompleted'));
        setSelectedProducts([]);
        loadProducts();
        loadStatistics();
      } else {
        toast.error(response.message || t('admin.products.bulkUpdateError'));
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(t('admin.products.bulkUpdateError'));
    }
  };

  // Handle product form
  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    loadProducts();
    loadStatistics();
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products;
  }, [products]);

  // Statistics cards
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg sm:text-xl font-bold mt-1">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center text-xs mt-1 ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                 trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={`p-2 sm:p-3 rounded-full bg-${color}-100 flex-shrink-0`}>
            <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );


  return (
    <div className="space-y-6 p-1 ">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col  lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-end order-1 lg:order-2 "
            >
              <h1 className="pb-2 text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.products.title')}
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-1"
            >
              <Button
                onClick={() => setShowNewExportDialog(true)}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto bg-blue-600 text-white"
              >
                <Download className="w-4 h-4 ms-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.common.export')}</span>
              </Button>
              <Button
                onClick={() => setShowProductForm(true)}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto"
              >
                <Plus className="w-4 h-4 ms-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.products.addProduct')}</span>
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left order-1 lg:order-1"
            >
              <h1 className="pb-2 text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.products.title')}
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-2"
            >
              <Button
                onClick={() => setShowNewExportDialog(true)}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto bg-blue-600 text-white"
              >
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.common.export')}</span>
              </Button>
              <Button
                onClick={() => setShowProductForm(true)}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.products.addProduct')}</span>
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Statistics */}
      {statisticsLoading && !statistics ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6"
        >
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </motion.div>
      ) : statistics ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.totalProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_products}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.available_products} {t('admin.products.available')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.totalProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_products}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.available_products} {t('admin.products.available')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.availableProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.available_products}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.unavailable_products} {t('admin.products.unavailable')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.availableProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.available_products}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.unavailable_products} {t('admin.products.unavailable')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.unavailableProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.unavailable_products}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.low_stock_products || 0} {t('admin.products.lowStock')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.unavailableProducts')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.unavailable_products}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.low_stock_products || 0} {t('admin.products.lowStock')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-1">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.averagePrice')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(parseFloat(statistics.average_price).toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {toArabicNumerals(parseFloat(statistics.total_value).toFixed(2))} {t('admin.products.totalValue')}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {t('admin.products.averagePrice')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(parseFloat(statistics.average_price).toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {toArabicNumerals(parseFloat(statistics.total_value).toFixed(2))} {t('admin.products.totalValue')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : null}

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardContent className="relative p-1">
            <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 sm:gap-6">
            {i18n.language === 'ar' ? (
              <>
                {/* Category Filter - Arabic: Second */}
                <div className="col-span-2 space-y-2 order-2 sm:order-3">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-left block">
                    {t('admin.products.category')}
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.products.filterByCategory')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.allCategories')}</SelectItem>
                      {/* Add category options here */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter - Arabic: Third */}
                <div className="space-y-2 order-3 sm:order-4">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-left block">
                    {t('admin.products.status')}
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.products.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.allStatuses')}</SelectItem>
                      <SelectItem value="available" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.available')}</SelectItem>
                      <SelectItem value="unavailable" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.unavailable')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort - Arabic: Fourth */}
                <div className="space-y-2 order-4 sm:order-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-left block">
                    {t('admin.products.sortBy')}
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.products.sortBy')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="created_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.sortByDate')}</SelectItem>
                      <SelectItem value="title" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.sortByName')}</SelectItem>
                      <SelectItem value="price" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.sortByPrice')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Search - Arabic: First */}
                <div className="col-span-2 sm:flex-1 sm:min-w-0 space-y-2 order-1 sm:order-5">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-left block">
                    {t('admin.products.search')}
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 py-2 shadow-md hover:shadow-lg"
                    >
                      <span className="font-semibold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    </Button>
                    <div className="relative group flex-1">
                      <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4 left-3" />
                      <Input
                        placeholder={t('admin.products.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 text-right rtl-placeholder placeholder-right rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        dir="rtl"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Search - English: First */}
                <div className="col-span-2 sm:flex-1 sm:min-w-0 space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.products.search')}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4 right-3" />
                      <Input
                        placeholder={t('admin.products.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pr-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 py-2 shadow-md hover:shadow-lg"
                    >
                      <span className="font-semibold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    </Button>
                  </div>
                </div>

                {/* Category Filter - English: Second */}
                <div className="col-span-2 space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.products.category')}
                  </label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.products.filterByCategory')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.allCategories')}</SelectItem>
                      {/* Add category options here */}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter - English: Third */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.products.status')}
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.products.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.allStatuses')}</SelectItem>
                      <SelectItem value="available" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.available')}</SelectItem>
                      <SelectItem value="unavailable" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.unavailable')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort - English: Fourth */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.products.sortBy')}
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.products.sortBy')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="created_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.sortByDate')}</SelectItem>
                      <SelectItem value="title" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.sortByName')}</SelectItem>
                      <SelectItem value="price" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.products.sortByPrice')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </>
            )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg">
            <CardContent className="p-1">
              {i18n.language === 'ar' ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(true)}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                    >
                      <Settings className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 ms-2" />
                      <span className="font-semibold">{t('admin.products.bulkActions')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProducts([])}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                    >
                      <span className="font-semibold">{t('admin.common.clearSelection')}</span>
                    </Button>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    تم تحديد {selectedProducts.length} منتج
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {selectedProducts.length} products selected
                  </span>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkActions(true)}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                    >
                      <Settings className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 mr-2" />
                      <span className="font-semibold">{t('admin.products.bulkActions')}</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProducts([])}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                    >
                      <span className="font-semibold">{t('admin.common.clearSelection')}</span>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative pb-3 p-1">
            <CardTitle className={`text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
              {i18n.language === 'ar' ? (
                <>
                  <div className="flex items-center justify-between w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(!(selectedProducts.length === products.length && products.length > 0))}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                    >
                      <span className="font-semibold">
                        {selectedProducts.length === products.length ? t('admin.products.deselectAll') : t('admin.products.selectAll')}
                      </span>
                    </Button>
                    <div className="flex items-center gap-2">
                      {t('admin.products.productsList')}
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Package className="w-5 h-5 text-primary" />
                  {t('admin.products.productsList')}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAll(!(selectedProducts.length === products.length && products.length > 0))}
                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg ml-auto"
                  >
                    <span className="font-semibold">
                      {selectedProducts.length === products.length ? t('admin.products.deselectAll') : t('admin.products.selectAll')}
                    </span>
                  </Button>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-1">
            <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto w-full max-w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" style={{ maxWidth: isDesktop ? '70vw' : '90vw' }}>
              <Table className="w-full min-w-[780px] table-fixed lg:w-full lg:table-auto">
                <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50">
              <TableRow>
                {i18n.language === 'ar' ? (
                  <>
                    <TableHead className="w-12 text-center w-[50px] lg:w-auto">
                      <Checkbox
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[200px] lg:w-auto">{t('admin.products.product')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.products.category')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.products.price')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.products.status')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.products.createdAt')}</TableHead>
                    <TableHead className="w-12 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[80px] lg:w-auto"></TableHead>
                  </>
                ) : (
                  <>
                    <TableHead className="w-12 font-semibold text-center w-[50px] lg:w-auto">
                      <Checkbox
                        checked={selectedProducts.length === products.length && products.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[200px] lg:w-auto">{t('admin.products.product')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.products.category')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.products.price')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.products.status')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.products.createdAt')}</TableHead>
                    <TableHead className="w-12 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[80px] lg:w-auto"></TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
                <TableBody>
                  {loading && products.length === 0 && !statistics ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i} className={`${i % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30'} group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300`}>
                        <TableCell className="text-center w-[50px] lg:w-auto"><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell className="text-center w-[200px] lg:w-auto"><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell className="text-center w-[120px] lg:w-auto"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-center w-[100px] lg:w-auto"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="text-center w-[100px] lg:w-auto"><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-center w-[120px] lg:w-auto"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-center w-[80px] lg:w-auto"><Skeleton className="h-4 w-4" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">{t('admin.products.noProducts')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <TableRow 
                        key={product.id} 
                        className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 ${
                          index % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30'
                        }`}
                      >
                        {i18n.language === 'ar' ? (
                          <>
                            <TableCell className="text-center w-[50px] lg:w-auto">
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                                className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                              />
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[200px] lg:w-auto text-right">
                              <div className="flex items-center gap-2 justify-end w-full flex-row-reverse">
                                <div className="text-right" style={{ textAlign: 'right' }}>
                                  <p className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{product.title}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[80px] sm:max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                                      {product.short_description || (product.description && product.description.length > 30 ? product.description.substring(0, 30) + '...' : product.description)}
                                    </p>
                                  <div className="sm:hidden text-xs text-gray-500 mt-1 truncate">
                                    {product.category.name} - {toArabicNumerals(parseFloat(product.price).toFixed(2))} {getLocalizedCurrency(product.currency)}
                                  </div>
                                </div>
                                {product.images && product.images.length > 0 ? (
                                  <AdminLazyImage
                                    src={product.images[0]}
                                    alt={product.title}
                                    aspectRatio="square"
                                    className="w-8 h-8 rounded-lg object-cover"
                                    size="sm"
                                    showSkeleton={false}
                                    threshold={0.5}
                                    showStatus={true}
                                    status={product.is_available ? 'active' : 'inactive'}
                                    fallback={
                                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                      </div>
                                    }
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[120px] lg:w-auto text-center">
                              <Badge className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-900 hover:border-blue-300 transition-all duration-300 text-xs px-1 py-0.5">{product.category.name}</Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[100px] lg:w-auto text-center">
                              <span className="font-semibold text-xs">
                                {toArabicNumerals(parseFloat(product.price).toFixed(2))} {getLocalizedCurrency(product.currency)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[100px] lg:w-auto text-center">
                              <Badge 
                                className={`text-xs px-1 py-0.5 ${product.is_available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {product.is_available ? t('admin.products.available') : t('admin.products.unavailable')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[120px] lg:w-auto text-center">
                              <span className="text-xs text-muted-foreground">
                                {new Date(product.created_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[80px] lg:w-auto">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-2 h-10 w-10 rounded-xl"
                                  >
                                    <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start">
                                  <DropdownMenuLabel className="text-right">
                                    {t('admin.common.actions')}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 ms-1 sm:ms-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.common.view')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 ms-1 sm:ms-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.common.edit')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleManageImages(product)}>
                                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 ms-1 sm:ms-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.products.manageImages')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 ms-1 sm:ms-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.products.duplicateProduct')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteProduct(product)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 ms-1 sm:ms-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.common.delete')}</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-center w-[50px] lg:w-auto">
                              <Checkbox
                                checked={selectedProducts.includes(product.id)}
                                onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                                className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                              />
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[200px] lg:w-auto text-right">
                              <div className="flex items-center gap-2 justify-end w-full">
                                {product.images && product.images.length > 0 ? (
                                  <AdminLazyImage
                                    src={product.images[0]}
                                    alt={product.title}
                                    aspectRatio="square"
                                    className="w-8 h-8 rounded-lg object-cover"
                                    size="sm"
                                    showSkeleton={false}
                                    threshold={0.5}
                                    showStatus={true}
                                    status={product.is_available ? 'active' : 'inactive'}
                                    fallback={
                                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                      </div>
                                    }
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <ImageIcon className="w-3 h-3 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="text-left" style={{ textAlign: 'left' }}>
                                  <p className="font-semibold text-foreground text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{product.title}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[100px] sm:max-w-none">
                                      {product.short_description || (product.description && product.description.length > 30 ? product.description.substring(0, 20) + '...' : product.description)}
                                    </p>
                                  <div className="sm:hidden text-xs text-gray-500 mt-1 truncate">
                                    {product.category.name} - {toArabicNumerals(parseFloat(product.price).toFixed(2))} {getLocalizedCurrency(product.currency)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[120px] lg:w-auto text-center">
                              <Badge className="bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-900 hover:border-blue-300 transition-all duration-300 text-xs px-1 py-0.5">{product.category.name}</Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[100px] lg:w-auto text-center">
                              <span className="font-semibold text-xs">
                                {toArabicNumerals(parseFloat(product.price).toFixed(2))} {getLocalizedCurrency(product.currency)}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[100px] lg:w-auto text-center">
                              <Badge 
                                className={`text-xs px-1 py-0.5 ${product.is_available 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {product.is_available ? t('admin.products.available') : t('admin.products.unavailable')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 w-[120px] lg:w-auto text-center">
                              <span className="text-xs text-muted-foreground">
                                {new Date(product.created_at).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm p-1 sm:p-2 text-center w-[80px] lg:w-auto">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-2 h-10 w-10 rounded-xl"
                                  >
                                    <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel className="text-left">
                                    {t('admin.common.actions')}
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                                    <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.common.view')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                                    <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.common.edit')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleManageImages(product)}>
                                    <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.products.manageImages')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                                    <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.products.duplicateProduct')}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteProduct(product)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    <span className="text-xs sm:text-sm">{t('admin.common.delete')}</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
              )}
            </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 flex-wrap">
                <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 sm:px-4 py-1 sm:py-2 rounded-xl">
                  {t('admin.common.showing')} {((currentPage - 1) * perPage) + 1} {t('admin.common.to')} {Math.min(currentPage * perPage, totalProducts)} {t('admin.common.of')} {totalProducts} {t('admin.common.results')}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                  >
                    <span className="font-semibold">{t('admin.common.previous')}</span>
                  </Button>
                  <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 sm:px-4 py-1 sm:py-2 rounded-xl">
                    {t('admin.common.page')} {currentPage} {t('admin.common.of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                  >
                    <span className="font-semibold">{t('admin.common.next')}</span>
                  </Button>
                </div>
              </div>
            )}

      {/* Dialogs */}
      <ProductForm
        open={showProductForm}
        onOpenChange={setShowProductForm}
        product={editingProduct}
        onSuccess={handleProductFormSuccess}
      />

      <ProductDetails
        open={showProductDetails}
        onOpenChange={setShowProductDetails}
        product={selectedProduct}
      />

      <ProductImages
        open={showProductImages}
        onOpenChange={setShowProductImages}
        product={selectedProduct}
        onSuccess={loadProducts}
      />

      <BulkActions
        open={showBulkActions}
        onOpenChange={setShowBulkActions}
        selectedCount={selectedProducts.length}
        onAction={handleBulkAction}
      />

      <NewExportProducts
        open={showNewExportDialog}
        onOpenChange={setShowNewExportDialog}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.products.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.products.deleteConfirmationMessage', { name: selectedProduct?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct}>
              {t('admin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
