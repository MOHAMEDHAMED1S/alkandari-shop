import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
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
  ShoppingCart,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  Loader2,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  RefreshCw,
  Printer,
  MessageCircle,
} from 'lucide-react';
import {
  getAdminOrders,
  getOrderStatistics,
  updateOrderStatus,
  bulkUpdateOrders,
} from '@/lib/api';
import { toast } from 'sonner';
import OrderDetails from '@/components/admin/OrderDetails';
import OrderStatusUpdate from '@/components/admin/OrderStatusUpdate';
import OrderBulkActions from '@/components/admin/OrderBulkActions';
import NewExportOrders from '@/components/admin/exports/NewExportOrders';
import Invoice from '@/components/admin/Invoice';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  status: string;
  payment_status?: string; // This might not exist in backend, will be derived from status
  total_amount: string;
  currency: string;
  shipping_address: {
    street: string;
    city: string;
    governorate: string;
    postal_code?: string;
  };
  created_at: string;
  updated_at: string;
  payment?: {
    payment_method: string;
    invoice_reference: string;
  };
  order_items?: Array<{
    id: number;
    order_id: number;
    product_id: number;
    product_price: string;
    quantity: number;
    size?: string;
    product_snapshot: {
      title: string;
      slug: string;
      description: string;
      short_description: string;
      price: string;
      currency: string;
      images: string[];
      meta: any;
      category: string;
    };
    product: {
      id: number;
      title: string;
      slug: string;
      description: string;
      short_description: string;
      price: string;
      currency: string;
      is_available: boolean;
      category_id: number;
      images: string[];
      meta: any;
      created_at: string;
      updated_at: string;
    };
  }>;
  admin_notes?: string;
  tracking_number?: string;
  shipping_date?: string;
  delivery_date?: string;
  // Additional fields from backend
  discount_code?: string;
  discount_amount?: string;
  subtotal_amount?: string;
  shipping_amount?: string;
  free_shipping?: boolean;
  notes?: string; // Customer notes
}

interface OrderStatistics {
  total_orders: number;
  pending_orders: number;
  paid_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: string;
  average_order_value: string;
  orders_by_status: {
    paid?: number;
    awaiting_payment?: number;
    pending?: number;
    delivered?: number;
    shipped?: number;
    cancelled?: number;
  };
}

const AdminOrders: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statisticsLoading, setStatisticsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(30);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Debounce search term to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Dialog states
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showNewExportDialog, setShowNewExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);


  // Load orders with useCallback to prevent unnecessary re-renders
  const loadOrders = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = {
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort_by: sortBy,
        sort_direction: sortDirection,
        page: currentPage,
        per_page: perPage,
        start_date: dateFilter !== 'all' ? getDateRange(dateFilter).start : undefined,
        end_date: dateFilter !== 'all' ? getDateRange(dateFilter).end : undefined,
      };


      const response = await getAdminOrders(token, params);
      
      if (response.success) {
        setOrders(response.data.orders.data || []);
        setTotalPages(response.data.orders.last_page || 1);
        setTotalOrders(response.data.orders.total || 0);
      } else {
        toast.error(t('admin.orders.loadError'));
        setOrders([]);
        setTotalPages(1);
        setTotalOrders(0);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error(t('admin.orders.loadError'));
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setLoading(false);
    }
  }, [token, debouncedSearchTerm, statusFilter, sortBy, sortDirection, currentPage, perPage, dateFilter, t]);

  // Load statistics with useCallback - now respects current filters
  const loadStatistics = useCallback(async () => {
    if (!token) return;

    try {
      setStatisticsLoading(true);
      
      // Build params similar to loadOrders to respect current filters
      const params = {
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        start_date: dateFilter !== 'all' ? getDateRange(dateFilter).start : undefined,
        end_date: dateFilter !== 'all' ? getDateRange(dateFilter).end : undefined,
      };

      const response = await getOrderStatistics(token, params);

      if (response.success) {
        setStatistics(response.data);
      } else {
        setStatistics(null);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatistics(null);
    } finally {
      setStatisticsLoading(false);
    }
  }, [token, debouncedSearchTerm, statusFilter, dateFilter]);

  // Get date range for filtering - Fixed to handle local timezone correctly
  const getDateRange = (filter: string) => {
    // Use local timezone instead of UTC to avoid date shifting issues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Helper function to format date in local timezone
    const formatLocalDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    switch (filter) {
      case 'today':
        const todayStr = formatLocalDate(today);
        return {
          start: todayStr,
          end: todayStr
        };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        return {
          start: formatLocalDate(weekStart),
          end: formatLocalDate(today)
        };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        return {
          start: formatLocalDate(monthStart),
          end: formatLocalDate(today)
        };
      default:
        return { start: '', end: '' };
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadOrders(), loadStatistics()]);
      toast.success(t('refreshed', 'تم التحديث بنجاح'));
    } catch (error) {
      toast.error(t('refreshError', 'حدث خطأ أثناء التحديث'));
    } finally {
      setRefreshing(false);
    }
  }, [loadOrders, loadStatistics, t]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders();
      loadStatistics();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loadOrders, loadStatistics]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'payment_status':
        setPaymentStatusFilter(value);
        break;
      case 'date':
        setDateFilter(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
    }
    setCurrentPage(1);
  };

  // Handle sort direction change
  const handleSortDirectionChange = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  // Handle search with useCallback to prevent unnecessary re-renders
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  // Handle order actions
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleViewInvoice = (order: Order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setShowStatusUpdate(true);
  };

  // New inline status update function
  const handleInlineStatusUpdate = async (orderId: number, newStatus: string) => {
    if (!token) return;

    try {
      const response = await updateOrderStatus(token, orderId, {
        status: newStatus,
        admin_notes: `تم تحديث الحالة إلى ${newStatus}`
      });

      if (response.success) {
        toast.success(t('admin.orders.statusUpdated'));
        loadOrders();
        loadStatistics();
      } else {
        toast.error(response.message || t('admin.orders.updateError'));
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(t('admin.orders.updateError'));
    }
  };

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDeleteDialog(true);
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder || !token) return;

    try {
      // Note: This would need a delete order API endpoint
      toast.success(t('admin.orders.orderDeleted'));
      loadOrders();
      loadStatistics();
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error(t('admin.orders.deleteError'));
    } finally {
      setShowDeleteDialog(false);
      setSelectedOrder(null);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, data?: any) => {
    if (!token || selectedOrders.length === 0) return;

    try {
      // Handle print invoices action
      if (action === 'print_invoices') {
        // Get order numbers for selected orders
        const selectedOrdersData = orders.filter(order => selectedOrders.includes(order.id));
        const orderNumbers = selectedOrdersData.map(order => order.order_number).join(',');
        
        // Open bulk print page in new tab
        const printUrl = `/admin/orders/bulk-invoice?ids=${orderNumbers}`;
        window.open(printUrl, '_blank');
        
        toast.success(isRTL ? 'تم فتح صفحة الطباعة' : 'Print page opened');
        return;
      }
      
      // Only support status updates now
      if (action === 'update_status' && data?.status) {
        const response = await bulkUpdateOrders(token, {
          order_ids: selectedOrders,
          status: data.status,
          admin_notes: data.admin_notes || '',
        });

        if (response.success) {
          toast.success(t('admin.orders.bulkUpdateCompleted'));
          setSelectedOrders([]);
          loadOrders();
          loadStatistics();
        } else {
          toast.error(response.message || t('admin.orders.bulkUpdateError'));
        }
      } else {
        toast.error(t('admin.orders.unsupportedAction'));
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast.error(t('admin.orders.bulkUpdateError'));
    }
  };

  // Handle status update
  const handleStatusUpdateSuccess = () => {
    setShowStatusUpdate(false);
    setSelectedOrder(null);
    loadOrders();
    loadStatistics();
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map(o => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: number, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'awaiting_payment': return 'destructive';
      case 'paid': return 'default';
      case 'shipped': return 'default';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'awaiting_payment': return AlertTriangle;
      case 'paid': return CheckCircle;
      case 'shipped': return Truck;
      case 'delivered': return Package;
      case 'cancelled': return XCircle;
      default: return Clock;
    }
  };

  // Statistics cards
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }) => (
    <Card className="border-r-4 border-r-primary hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-1">
        {i18n.language === 'ar' ? (
          <>
            <Icon className="h-3 w-3 text-primary flex-shrink-0" />
            <CardTitle className="text-xs font-medium truncate max-w-[90%]">
              {title}
            </CardTitle>
          </>
        ) : (
          <>
            <CardTitle className="text-xs font-medium truncate max-w-[90%]">
              {title}
            </CardTitle>
            <Icon className="h-3 w-3 text-primary flex-shrink-0" />
          </>
        )}
      </CardHeader>
      <CardContent className="p-1">
        <div className="text-sm font-bold">{value}</div>
        {trend && trendValue && (
          <p className="text-xs text-muted-foreground truncate">
            {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto px-4 sm:px-6 mt-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-right order-1 sm:order-2"
            >
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.orders.title')}
              </h1>

            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <Button
                onClick={() => setShowNewExportDialog(true)}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-lg hover:shadow-xl bg-blue-600 text-white"
              >
                <Download className="w-4 h-4 ms-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="truncate font-semibold">{t('admin.common.export')}</span>
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="group hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-lg hover:shadow-xl bg-green-600 text-white"
              >
                <RefreshCw className={`w-4 h-4 ms-2 group-hover:scale-110 transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="truncate font-semibold">{t('refresh', 'تحديث')}</span>
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left"
            >
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.orders.title')}
              </h1>
          
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto"
            >
              <Button
                onClick={() => setShowNewExportDialog(true)}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-lg hover:shadow-xl bg-blue-600 text-white"
              >
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="truncate font-semibold">{t('admin.common.export')}</span>
              </Button>
              <Button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="group hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-lg hover:shadow-xl bg-green-600 text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="truncate font-semibold">{t('refresh', 'تحديث')}</span>
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Statistics */}
      {statisticsLoading ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6"
        >
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </motion.div>
      ) : statistics ? (
        <>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6"
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
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.totalOrders')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_orders}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.pending_orders} {t('admin.orders.pending')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.totalOrders')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_orders}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.pending_orders} {t('admin.orders.pending')}
              </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
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
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-yellow-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.pendingOrders')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.pending_orders}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.paid_orders || 0} {t('admin.orders.paid')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.pendingOrders')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.pending_orders}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.paid_orders || 0} {t('admin.orders.paid')}
              </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300" />
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
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.totalRevenue')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(parseFloat(statistics.total_revenue).toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.delivered_orders || 0} {t('admin.orders.delivered')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.totalRevenue')}
                        </p>
                        <div className="text-xl sm:text-xl lg:text-1xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(parseFloat(statistics.total_revenue).toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.delivered_orders || 0} {t('admin.orders.delivered')}
              </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
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
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.deliveredOrders')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.delivered_orders || 0}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.shipped_orders || 0} {t('admin.orders.shipped')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.orders.deliveredOrders')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.delivered_orders || 0}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.shipped_orders || 0} {t('admin.orders.shipped')}
              </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* New Statistics Cards */}
          {/* Average Order Value Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(parseFloat(statistics.average_order_value || '0').toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.orders_by_status?.awaiting_payment || 0} {isRTL ? 'بانتظار الدفع' : 'Awaiting Payment'}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                        </p>
                        <div className="text-xl sm:text-xl lg:text-1xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(parseFloat(statistics.average_order_value || '0').toFixed(2))} {getLocalizedCurrency('KWD')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.orders_by_status?.awaiting_payment || 0} {isRTL ? 'بانتظار الدفع' : 'Awaiting Payment'}
              </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Cancelled Orders Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'الطلبات الملغاة' : 'Cancelled Orders'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.cancelled_orders || 0}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {((statistics.cancelled_orders || 0) / (statistics.total_orders || 1) * 100).toFixed(1)}% {isRTL ? 'من الإجمالي' : 'of Total'}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'الطلبات الملغاة' : 'Cancelled Orders'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.cancelled_orders || 0}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {((statistics.cancelled_orders || 0) / (statistics.total_orders || 1) * 100).toFixed(1)}% {isRTL ? 'من الإجمالي' : 'of Total'}
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
        </motion.div>

        {/* Orders by Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mb-4 sm:mb-6"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative pb-3">
              <CardTitle className={`text-base sm:text-lg font-bold text-slate-800 dark:text-slate-200 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'تفصيل الطلبات حسب الحالة' : 'Orders Breakdown by Status'}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {/* Paid */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">
                      {isRTL ? 'مدفوع' : 'Paid'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {statistics.orders_by_status?.paid || 0}
                  </p>
                </div>

                {/* Awaiting Payment */}
                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                      {isRTL ? 'بانتظار الدفع' : 'Awaiting'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                    {statistics.orders_by_status?.awaiting_payment || 0}
                  </p>
                </div>

                {/* Pending */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                      {isRTL ? 'قيد الانتظار' : 'Pending'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {statistics.orders_by_status?.pending || 0}
                  </p>
                </div>

                {/* Shipped */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {isRTL ? 'قيد الشحن' : 'Shipped'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {statistics.orders_by_status?.shipped || 0}
                  </p>
                </div>

                {/* Delivered */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                      {isRTL ? 'تم التوصيل' : 'Delivered'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    {statistics.orders_by_status?.delivered || 0}
                  </p>
                </div>

                {/* Cancelled */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <p className="text-xs font-semibold text-red-700 dark:text-red-400">
                      {isRTL ? 'ملغى' : 'Cancelled'}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {statistics.orders_by_status?.cancelled || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </>
      ) : null}

      {/* Filters and Content */}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="w-full space-y-4 sm:space-y-6"
      >
          {/* Filters and Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="w-full"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardContent className="relative p-2">
                  <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 sm:gap-6">
                  {i18n.language === 'ar' ? (
                    <>
                      {/* Search - Arabic: First (appears on right) */}
                      <div className="col-span-2 sm:flex-1 sm:min-w-0 space-y-2 order-1 sm:order-5">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                          {t('admin.orders.search')}
                        </label>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSortDirectionChange}
                            className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 py-2 shadow-md hover:shadow-lg"
                          >
                            <span className="font-semibold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          </Button>
                          <div className="relative group flex-1">
                            <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4 left-3" />
                            <Input
                              placeholder={t('admin.orders.searchPlaceholder')}
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="pl-10 text-right rtl-placeholder placeholder-right rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              dir="rtl"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Status Filter - Arabic: Second */}
                      <div className="space-y-2 order-2 sm:order-4">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                          {t('admin.orders.status')}
                        </label>
                        <Select value={statusFilter} onValueChange={(value) => {
                          setStatusFilter(value);
                          setCurrentPage(1);
                        }}>
                          <SelectTrigger className="w-full sm:w-40 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <SelectValue placeholder={t('admin.orders.filterByStatus')} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.allStatuses')}</SelectItem>
                            <SelectItem value="pending" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.pending')}</SelectItem>
                            <SelectItem value="awaiting_payment" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.awaiting_payment')}</SelectItem>
                            <SelectItem value="paid" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.paid')}</SelectItem>
                            <SelectItem value="shipped" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.shipped')}</SelectItem>
                            <SelectItem value="delivered" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.delivered')}</SelectItem>
                            <SelectItem value="cancelled" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Status Filter - Arabic: Third */}
                      <div className="space-y-2 order-3 sm:order-3">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                          {t('admin.orders.paymentStatus')}
                        </label>
                        <Select value={paymentStatusFilter} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                          <SelectTrigger className="w-full sm:w-40 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <SelectValue placeholder={t('admin.orders.filterByPaymentStatus')} />
                        </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.allPaymentStatuses')}</SelectItem>
                            <SelectItem value="pending" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.paymentStatuses.pending')}</SelectItem>
                            <SelectItem value="paid" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.paymentStatuses.paid')}</SelectItem>
                            <SelectItem value="failed" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.paymentStatuses.failed')}</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>

                      {/* Date Filter - Arabic: Fourth */}
                      <div className="space-y-2 order-4 sm:order-2">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                          {t('admin.orders.date')}
                        </label>
                      <Select value={dateFilter} onValueChange={(value) => handleFilterChange('date', value)}>
                          <SelectTrigger className="w-full sm:w-32 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                          <SelectValue placeholder={t('admin.orders.filterByDate')} />
                        </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.allDates')}</SelectItem>
                            <SelectItem value="today" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.today')}</SelectItem>
                            <SelectItem value="week" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.thisWeek')}</SelectItem>
                            <SelectItem value="month" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.thisMonth')}</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>

                      {/* Sort - Arabic: Fifth */}
                      <div className="space-y-2 order-5 sm:order-1">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                          {t('admin.orders.sortBy')}
                        </label>
                        <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                          <SelectTrigger className="w-full sm:w-32 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <SelectValue placeholder={t('admin.orders.sortBy')} />
                        </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="created_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.sortByDate')}</SelectItem>
                            <SelectItem value="total_amount" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.sortByAmount')}</SelectItem>
                            <SelectItem value="customer_name" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.sortByCustomer')}</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>

                    </>
                  ) : (
                    <>
                      {/* Search - English: First */}
                      <div className="col-span-2 sm:flex-1 sm:min-w-0 space-y-2">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-right block' : 'text-left'}`}>
                          {t('admin.orders.search')}
                        </label>
                        <div className="flex gap-2">
                          <div className="relative group flex-1">
                            <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4 right-3" />
                            <Input
                              placeholder={t('admin.orders.searchPlaceholder')}
                              value={searchTerm}
                              onChange={(e) => handleSearch(e.target.value)}
                              className="pr-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSortDirectionChange}
                            className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 py-2 shadow-md hover:shadow-lg"
                          >
                            <span className="font-semibold">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Status Filter - English: Second */}
                      <div className="space-y-2">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-right block' : 'text-left'}`}>
                          {t('admin.orders.status')}
                        </label>
                        <Select value={statusFilter} onValueChange={(value) => {
                          setStatusFilter(value);
                          setCurrentPage(1);
                        }}>
                          <SelectTrigger className="w-full sm:w-40 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                            <SelectValue placeholder={t('admin.orders.filterByStatus')} />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.allStatuses')}</SelectItem>
                            <SelectItem value="pending" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.pending')}</SelectItem>
                            <SelectItem value="awaiting_payment" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.awaiting_payment')}</SelectItem>
                            <SelectItem value="paid" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.paid')}</SelectItem>
                            <SelectItem value="shipped" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.shipped')}</SelectItem>
                            <SelectItem value="delivered" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.delivered')}</SelectItem>
                            <SelectItem value="cancelled" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.statuses.cancelled')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Payment Status Filter - English: Third */}
                      <div className="space-y-2">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-right block' : 'text-left'}`}>
                          {t('admin.orders.paymentStatus')}
                        </label>
                      <Select value={paymentStatusFilter} onValueChange={(value) => handleFilterChange('payment_status', value)}>
                          <SelectTrigger className="w-full sm:w-40 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                          <SelectValue placeholder={t('admin.orders.filterByPaymentStatus')} />
                        </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.allPaymentStatuses')}</SelectItem>
                            <SelectItem value="pending" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.paymentStatuses.pending')}</SelectItem>
                            <SelectItem value="paid" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.paymentStatuses.paid')}</SelectItem>
                            <SelectItem value="failed" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.paymentStatuses.failed')}</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>

                      {/* Date Filter - English: Third */}
                      <div className="space-y-2">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-right block' : 'text-left'}`}>
                          {t('admin.orders.date')}
                        </label>
                      <Select value={dateFilter} onValueChange={(value) => handleFilterChange('date', value)}>
                          <SelectTrigger className="w-full sm:w-32 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                          <SelectValue placeholder={t('admin.orders.filterByDate')} />
                        </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.allDates')}</SelectItem>
                            <SelectItem value="today" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.today')}</SelectItem>
                            <SelectItem value="week" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.thisWeek')}</SelectItem>
                            <SelectItem value="month" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.thisMonth')}</SelectItem>
                        </SelectContent>
                      </Select>
                      </div>

                      {/* Sort - English: Fourth */}
                      <div className="space-y-2">
                        <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-right block' : 'text-left'}`}>
                          {t('admin.orders.sortBy')}
                        </label>
                      <Select value={sortBy} onValueChange={(value) => handleFilterChange('sort', value)}>
                          <SelectTrigger className="w-full sm:w-32 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                          <SelectValue placeholder={t('admin.orders.sortBy')} />
                        </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                            <SelectItem value="created_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.sortByDate')}</SelectItem>
                            <SelectItem value="total_amount" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.sortByAmount')}</SelectItem>
                            <SelectItem value="customer_name" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.orders.sortByCustomer')}</SelectItem>
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
          {selectedOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="w-full"
              >
                <Card className="relative overflow-hidden bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg">
                  <CardContent className="p-2">
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
                            <span className="font-semibold">{t('admin.orders.bulkActions')}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrders([])}
                            className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                          >
                            <span className="font-semibold">{t('admin.common.clearSelection')}</span>
                          </Button>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          تم تحديد {selectedOrders.length} طلب
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {selectedOrders.length} orders selected
                        </span>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowBulkActions(true)}
                            className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                          >
                            <Settings className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 mr-2" />
                            <span className="font-semibold">{t('admin.orders.bulkActions')}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrders([])}
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

          {/* Orders Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="w-full"
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                    {i18n.language === 'ar' ? (
                      <>
                        <div className="flex items-center justify-between w-full">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSelectAll(!(selectedOrders.length === orders.length && orders.length > 0))}
                            className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                          >
                            <span className="font-semibold">
                              {selectedOrders.length === orders.length ? t('admin.orders.deselectAll') : t('admin.orders.selectAll')}
                            </span>
                          </Button>
                          <div className="flex items-center gap-2">
                            {t('admin.orders.ordersList')}
                            <ShoppingCart className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        {t('admin.orders.ordersList')}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(!(selectedOrders.length === orders.length && orders.length > 0))}
                          className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg ml-auto"
                        >
                          <span className="font-semibold">
                            {selectedOrders.length === orders.length ? t('admin.orders.deselectAll') : t('admin.orders.selectAll')}
                          </span>
                        </Button>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative p-2">
                  <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto w-full max-w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" style={{ maxWidth: '90vw' }}>
            <Table className={`w-full min-w-[780px] table-fixed lg:w-full lg:table-auto ${i18n.language === 'ar' ? 'pr-4' : ''}`}>
                      <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50">
                        <TableRow className="hover:bg-transparent">
                          {i18n.language === 'ar' ? (
                            <>
                    <TableHead className={`w-12 text-center w-[50px] lg:w-auto`}>
                      <Checkbox
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onCheckedChange={handleSelectAll}
                                  className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                                />
                              </TableHead>
                              <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[150px] lg:w-auto`}>{t('admin.orders.orderNumber')}</TableHead>
                              <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[180px] lg:w-auto`}>{t('admin.orders.customerName')}</TableHead>
                              <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{t('admin.orders.orderStatus')}</TableHead>
                              <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{t('admin.orders.totalAmount')}</TableHead>
                              <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{t('admin.orders.orderDate')}</TableHead>
                              <TableHead className={`w-12 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                            </>
                          ) : (
                            <>
                    <TableHead className={`w-12 text-center w-[50px] lg:w-auto`}>
                      <Checkbox
                        checked={selectedOrders.length === orders.length && orders.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                      />
                    </TableHead>
                    <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[150px] lg:w-auto`}>{t('admin.orders.orderNumber')}</TableHead>
                    <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[180px] lg:w-auto`}>{t('admin.orders.customerName')}</TableHead>
                    <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{t('admin.orders.orderStatus')}</TableHead>
                    <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{t('admin.orders.totalAmount')}</TableHead>
                    <TableHead className={`font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{t('admin.orders.orderDate')}</TableHead>
                    <TableHead className={`w-12 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto`}>{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                            </>
                          )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                            <TableRow key={i} className={`${i % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30'} group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300`}>
                              {i18n.language === 'ar' ? (
                                <>
                                  <TableCell className="text-center p-2 w-[80px] lg:w-auto"><Skeleton className="h-4 w-4" /></TableCell>
                                  <TableCell className="text-center p-2 w-[120px] lg:w-auto"><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell className="text-center p-2 w-[120px] lg:w-auto"><Skeleton className="h-4 w-16" /></TableCell>
                                  <TableCell className="text-center p-2 w-[120px] lg:w-auto"><Skeleton className="h-4 w-20" /></TableCell>
                                  <TableCell className="text-center p-2 w-[180px] lg:w-auto"><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell className="text-center p-2 w-[150px] lg:w-auto"><Skeleton className="h-4 w-32" /></TableCell>
                                  <TableCell className="text-center p-2 w-[50px] lg:w-auto"><Skeleton className="h-4 w-4" /></TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="text-center p-2 w-[50px] lg:w-auto"><Skeleton className="h-4 w-4" /></TableCell>
                                  <TableCell className="text-center p-2 w-[150px] lg:w-auto"><Skeleton className="h-4 w-32" /></TableCell>
                                  <TableCell className="text-center p-2 w-[180px] lg:w-auto"><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell className="text-center p-2 w-[120px] lg:w-auto"><Skeleton className="h-4 w-20" /></TableCell>
                                  <TableCell className="text-center p-2 w-[120px] lg:w-auto"><Skeleton className="h-4 w-16" /></TableCell>
                                  <TableCell className="text-center p-2 w-[120px] lg:w-auto"><Skeleton className="h-4 w-24" /></TableCell>
                                  <TableCell className="text-center p-2 w-[80px] lg:w-auto"><Skeleton className="h-4 w-4" /></TableCell>
                                </>
                              )}
                      </TableRow>
                    ))
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                          <p className="text-muted-foreground">{t('admin.orders.noOrders')}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order, index) => {
                      const StatusIcon = getStatusIcon(order.status);
                      
                      // Get row colors based on status
                      const getRowColors = () => {
                        switch (order.status) {
                          case 'paid':
                            return 'bg-green-50/50 dark:bg-green-900/20 hover:from-green-100/50 hover:to-green-50/50 dark:hover:from-green-800/30 dark:hover:to-green-900/30';
                          case 'awaiting_payment':
                            return 'bg-orange-50/50 dark:bg-orange-900/20 hover:from-orange-100/50 hover:to-orange-50/50 dark:hover:from-orange-800/30 dark:hover:to-orange-900/30';
                          case 'pending':
                            return 'bg-yellow-50/50 dark:bg-yellow-900/20 hover:from-yellow-100/50 hover:to-yellow-50/50 dark:hover:from-yellow-800/30 dark:hover:to-yellow-900/30';
                          case 'shipped':
                            return 'bg-blue-50/50 dark:bg-blue-900/20 hover:from-blue-100/50 hover:to-blue-50/50 dark:hover:from-blue-800/30 dark:hover:to-blue-900/30';
                          case 'delivered':
                            return 'bg-purple-50/50 dark:bg-purple-900/20 hover:from-purple-100/50 hover:to-purple-50/50 dark:hover:from-purple-800/30 dark:hover:to-purple-900/30';
                          case 'cancelled':
                            return 'bg-red-50/50 dark:bg-red-900/20 hover:from-red-100/50 hover:to-red-50/50 dark:hover:from-red-800/30 dark:hover:to-red-900/30';
                          default:
                            return index % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30';
                        }
                      };
                      
                      return (
                        <TableRow 
                          key={order.id}
                                className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 ${getRowColors()}`}
                              >
                                    <TableCell className="text-center p-2 w-[50px] lg:w-auto">
                                      <Checkbox
                                        checked={selectedOrders.includes(order.id)}
                                        onCheckedChange={(checked) => handleSelectOrder(order.id, checked as boolean)}
                                        className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                                      />
                                    </TableCell>
                                    <TableCell className={`text-xs sm:text-sm p-2 w-[150px] lg:w-auto text-center`}>
                            <div className="font-mono text-xs">
                              #{order.order_number}
                            </div>
                          </TableCell>
                                    <TableCell className="text-xs sm:text-sm p-2 text-center w-[180px] lg:w-auto">
                            <div>
                              <p className="font-medium text-xs">{order.customer_name}</p>
                              <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                            </div>
                          </TableCell>
                                    <TableCell className="text-xs sm:text-sm p-2 text-center w-[120px] lg:w-auto">
                            <Select 
                              value={order.status} 
                              onValueChange={(newStatus) => handleInlineStatusUpdate(order.id, newStatus)}
                            >
                              <SelectTrigger className="w-full h-8 text-xs rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                <SelectValue>
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const StatusIcon = getStatusIcon(order.status);
                                      return <StatusIcon className="w-3 h-3" />;
                                    })()}
                                    <span className="truncate font-medium">{t(`admin.orders.statuses.${order.status}`)}</span>
                                  </div>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg">
                                <SelectItem value="paid" className="rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="font-medium">{t('admin.orders.statuses.paid')}</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="shipped" className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200">
                                  <div className="flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-blue-600" />
                                    <span className="font-medium">{t('admin.orders.statuses.shipped')}</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="delivered" className="rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-purple-600" />
                                    <span className="font-medium">{t('admin.orders.statuses.delivered')}</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="cancelled" className="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-600" />
                                    <span className="font-medium">{t('admin.orders.statuses.cancelled')}</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                                    <TableCell className="text-xs sm:text-sm p-2 text-center w-[120px] lg:w-auto">
                            <span className="font-medium text-xs">
                              {toArabicNumerals(order.total_amount)} {getLocalizedCurrency(order.currency)}
                            </span>
                          </TableCell>
                                    <TableCell className="text-xs sm:text-sm p-2 text-center w-[120px] lg:w-auto">
                            <span className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                                    <TableCell className="text-xs sm:text-sm p-2 text-center w-[120px] lg:w-auto">
                              <div className="flex items-center justify-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-1 h-8 w-8 rounded-xl"
                                  onClick={() => handleViewOrder(order)}
                                  title={isRTL ? 'عرض التفاصيل' : 'View Details'}
                                >
                                  <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="group hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-50 dark:hover:from-blue-700 dark:hover:to-blue-600 transition-all duration-300 p-1 h-8 w-8 rounded-xl"
                                  onClick={() => handleViewInvoice(order)}
                                  title={isRTL ? 'طباعة الفاتورة' : 'Print Invoice'}
                                >
                                  <Printer className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 text-blue-600 dark:text-blue-400" />
                                </Button>
                              </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 flex-wrap">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                {t('admin.common.showing')} {((currentPage - 1) * perPage) + 1} {t('admin.common.to')} {Math.min(currentPage * perPage, totalOrders)} {t('admin.common.of')} {totalOrders} {t('admin.common.results')}
                      </div>
                      <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                          className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                >
                          <span className="font-semibold">{t('admin.common.previous')}</span>
                </Button>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                  {t('admin.common.page')} {currentPage} {t('admin.common.of')} {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                          className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                >
                          <span className="font-semibold">{t('admin.common.next')}</span>
                </Button>
              </div>
            </div>
          )}
                </CardContent>
              </Card>
            </motion.div>
      </motion.div>

      {/* Dialogs */}
      <OrderDetails
        open={showOrderDetails}
        onOpenChange={setShowOrderDetails}
        order={selectedOrder as any}
      />

      <OrderStatusUpdate
        open={showStatusUpdate}
        onOpenChange={setShowStatusUpdate}
        order={selectedOrder}
        onSuccess={handleStatusUpdateSuccess}
      />

      <OrderBulkActions
        open={showBulkActions}
        onOpenChange={setShowBulkActions}
        selectedCount={selectedOrders.length}
        onAction={handleBulkAction}
      />

      <NewExportOrders
        open={showNewExportDialog}
        onOpenChange={setShowNewExportDialog}
      />

      <Invoice
        open={showInvoice}
        onOpenChange={setShowInvoice}
        order={selectedOrder}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.orders.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.orders.deleteConfirmationMessage', { orderNumber: selectedOrder?.order_number })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOrder}>
              {t('admin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;