import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/AdminContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Search,
  Target,
  Sparkles,
  Globe,
  FileText,
  CreditCard,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';
import {
  getReportsDashboardOverview,
  getBusinessIntelligence,
  getReportsSalesAnalytics,
  getReportsCustomerAnalytics,
  getReportsProductAnalytics,
  getReportsOrderAnalytics,
  getFinancialOverview
} from '@/lib/api';

// Color palette for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

interface DashboardOverview {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  processing_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  low_stock_products: number;
  out_of_stock_products: number;
  completed_orders?: number; // Added for backward compatibility
}

interface BusinessIntelligence {
  kpis: {
    conversion_rate: number;
    customer_lifetime_value: number;
    average_order_value: number;
    repeat_customer_rate: number;
    cart_abandonment_rate: number;
  };
  growth_metrics: {
    revenue_growth: number;
    current_period_revenue: number;
    previous_period_revenue: number;
  };
  seasonal_trends: Array<{
    month: number;
    revenue: number;
    orders: number;
  }>;
}

interface SalesAnalytics {
  sales_over_time: Array<{
    date: string;
    total_sales: number;
    order_count: number;
  }>;
  top_selling_products: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
    revenue: number;
  }>;
  sales_by_category: Array<{
    category_name: string;
    total_sales: number;
    percentage: number;
  }>;
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  // Legacy properties for backward compatibility
  top_products?: Array<{
    id: number;
    title: string;
    price: string;
    total_sold: string;
    total_revenue: string;
  }>;
  payment_methods?: Array<{
    method: string;
    count: number;
    total_amount: number;
  }>;
}

interface CustomerAnalytics {
  customer_acquisition: Array<{
    date: string;
    new_customers: number;
  }>;
  top_customers: Array<{
    customer_id: number;
    customer_name: string;
    total_orders: number;
    total_spent: number;
  }>;
  top_customers_by_orders?: Array<{
    id: number;
    name: string;
    email: string;
    orders_count: number;
  }>;
  top_customers_by_revenue?: Array<{
    id: number;
    name: string;
    email: string;
    total_spent: number;
  }>;
  customers_by_city: Array<{
    city: string;
    customer_count: number;
    percentage: number;
  }>;
  total_customers: number;
  new_customers_this_period: number;
  repeat_customers: number;
}

interface ProductAnalytics {
  product_performance: Array<{
    product_id: number;
    product_name: string;
    total_sold: number;
    revenue: number;
    stock_quantity: number;
  }>;
  low_stock_alerts: Array<{
    product_id: number;
    product_name: string;
    current_stock: number;
    minimum_stock: number;
  }>;
  out_of_stock_products: Array<{
    product_id: number;
    product_name: string;
  }>;
  products_by_category: Array<{
    category_name: string;
    product_count: number;
    percentage: number;
  }>;
  total_products: number;
  active_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

interface OrderAnalytics {
  orders_by_status: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  orders_by_payment_status: Array<{
    payment_status: string;
    count: number;
    percentage: number;
  }>;
  average_processing_time: {
    hours: number;
    minutes: number;
  };
  orders_over_time: Array<{
    date: string;
    order_count: number;
    total_amount: number;
  }>;
  recent_orders: Array<{
    order_id: number;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
  }>;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
}

const AdminReports: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardOverview | null>(null);
  const [businessIntelligence, setBusinessIntelligence] = useState<BusinessIntelligence | null>(null);
  const [salesAnalytics, setSalesAnalytics] = useState<SalesAnalytics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics | null>(null);
  const [orderAnalytics, setOrderAnalytics] = useState<OrderAnalytics | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);

  // Add console log to check token
  console.log('Admin Token:', token ? 'Token exists' : 'No token found');

  // Fetch data functions
  const fetchDashboardOverview = async () => {
    try {
      if (!token) {
        console.error('No admin token found');
        toast.error('لم يتم العثور على رمز المصادقة');
        return;
      }
      console.log('Fetching dashboard overview...');
      const response = await getReportsDashboardOverview(token, {
        date_from: dateRange.from,
        date_to: dateRange.to
      });
      console.log('Dashboard overview response:', response);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      toast.error('فشل في تحميل نظرة عامة على لوحة التحكم');
    }
  };

  const fetchBusinessIntelligence = async () => {
    try {
      if (!token) return;
      console.log('Fetching business intelligence...');
      const response = await getBusinessIntelligence(token, {
        date_from: dateRange.from,
        date_to: dateRange.to
      });
      console.log('Business intelligence response:', response);
      setBusinessIntelligence(response.data);
    } catch (error) {
      console.error('Error fetching business intelligence:', error);
      toast.error('فشل في تحميل ذكاء الأعمال');
    }
  };

  const fetchSalesAnalytics = async () => {
    try {
      if (!token) return;
      console.log('Fetching sales analytics...');
      const response = await getReportsSalesAnalytics(token, {
        date_from: dateRange.from,
        date_to: dateRange.to,
        period: 'day'
      });
      console.log('Sales analytics response:', response);
      setSalesAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      toast.error('فشل في تحميل تحليلات المبيعات');
    }
  };

  const fetchCustomerAnalytics = async () => {
    try {
      if (!token) return;
      console.log('Fetching customer analytics...');
      const response = await getReportsCustomerAnalytics(token, {
        date_from: dateRange.from,
        date_to: dateRange.to
      });
      console.log('Customer analytics response:', response);
      setCustomerAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching customer analytics:', error);
      toast.error('فشل في تحميل تحليلات العملاء');
    }
  };

  const fetchProductAnalytics = async () => {
    try {
      if (!token) return;
      console.log('Fetching product analytics...');
      const response = await getReportsProductAnalytics(token, {
        date_from: dateRange.from,
        date_to: dateRange.to
      });
      console.log('Product analytics response:', response);
      setProductAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      toast.error('فشل في تحميل تحليلات المنتجات');
    }
  };

  const fetchOrderAnalytics = async () => {
    try {
      if (!token) return;
      console.log('Fetching order analytics...');
      const response = await getReportsOrderAnalytics(token, {
        date_from: dateRange.from,
        date_to: dateRange.to
      });
      console.log('Order analytics response:', response);
      setOrderAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching order analytics:', error);
      toast.error('فشل في تحميل تحليلات الطلبات');
    }
  };

  const fetchFinancialData = async () => {
    try {
      if (!token) return;
      console.log('Fetching financial data...');
      const response = await getFinancialOverview(token, {
        date_from: dateRange.from,
        date_to: dateRange.to
      });
      console.log('Financial data response:', response);
      setFinancialData(response.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('فشل في تحميل البيانات المالية');
    }
  };

  const fetchAllData = async () => {
    console.log('Starting to fetch all data...');
    setLoading(true);
    setIsRefreshing(true);
    try {
      await Promise.all([
        fetchDashboardOverview(),
        fetchBusinessIntelligence(),
        fetchSalesAnalytics(),
        fetchCustomerAnalytics(),
        fetchProductAnalytics(),
        fetchOrderAnalytics(),
        fetchFinancialData()
      ]);
      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAllData().finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    console.log('useEffect triggered, token:', token ? 'exists' : 'missing');
    if (token) {
      fetchAllData();
    } else {
      toast.error('يجب تسجيل الدخول أولاً');
    }
  }, [token, dateRange]);

  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (i18n.language === 'ar') {
      const formatted = new Intl.NumberFormat('ar-EG', {
        style: 'currency',
        currency: 'KWD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(numAmount);
      // استبدال "د.ك." بـ "د.ك"
      return formatted.replace('د.ك.', 'د.ك');
    } else {
      // للصفحة الإنجليزية: السعر أولاً ثم العملة
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(numAmount);
      return `${formatted} KWD`;
    }
  };

  const formatNumber = (num: number) => {
    if (i18n.language === 'ar') {
      return new Intl.NumberFormat('ar-EG').format(num);
    } else {
      return new Intl.NumberFormat('en-US').format(num);
    }
  };

  const formatPercentage = (num: number) => {
    if (i18n.language === 'ar') {
      return new Intl.NumberFormat('ar-EG', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(num / 100);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(num / 100);
    }
  };

  const translateOrderStatus = (status: string) => {
    if (i18n.language === 'ar') {
      const statusMap: { [key: string]: string } = {
        'shipped': 'تم الشحن',
        'paid': 'مدفوع',
        'pending': 'في الانتظار',
        'cancelled': 'ملغي',
        'awaiting_payment': 'في انتظار الدفع',
        'delivered': 'تم التسليم',
        'processing': 'قيد المعالجة',
        'completed': 'مكتمل',
        'initiated': 'تم البدء',
        'null': 'غير محدد'
      };
      return statusMap[status] || status;
    }
    return status;
  };

  const translatePaymentStatus = (status: string) => {
    if (i18n.language === 'ar') {
      const statusMap: { [key: string]: string } = {
        'paid': 'مدفوع',
        'pending': 'في الانتظار',
        'failed': 'فشل',
        'refunded': 'مسترد',
        'partially_paid': 'مدفوع جزئياً',
        'cancelled': 'ملغي',
        'awaiting_payment': 'في انتظار الدفع',
        'processing': 'قيد المعالجة',
        'completed': 'مكتمل',
        'initiated': 'تم البدء',
        'null': 'غير محدد'
      };
      return statusMap[status] || status;
    }
    return status;
  };

  // Overview Cards Component
  const OverviewCards = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {dashboardData ? formatNumber(dashboardData.total_products) : '0'}
          </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {dashboardData ? formatNumber(dashboardData.total_products) : '0'}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
            <p className={`text-xs text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
            {i18n.language === 'ar' ? 'منتج نشط في المتجر' : 'Active products in store'}
          </p>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {dashboardData ? formatNumber(dashboardData.total_customers) : '0'}
          </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي العملاء' : 'Total Customers'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {dashboardData ? formatNumber(dashboardData.total_customers) : '0'}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
            <p className={`text-xs text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
            {i18n.language === 'ar' ? 'عميل مسجل' : 'Registered customers'}
          </p>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {dashboardData ? formatNumber(dashboardData.total_orders) : '0'}
          </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {dashboardData ? formatNumber(dashboardData.total_orders) : '0'}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
            <p className={`text-xs text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
            {i18n.language === 'ar' ? 'طلب تم تسجيله' : 'Orders placed'}
          </p>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {dashboardData ? formatCurrency(dashboardData.total_revenue) : formatCurrency(0)}
          </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {dashboardData ? formatCurrency(dashboardData.total_revenue) : formatCurrency(0)}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
            <p className={`text-xs text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
            {i18n.language === 'ar' ? 'إجمالي المبيعات' : 'Total sales'}
          </p>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );

  // KPI Cards Component
  const KPICards = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {businessIntelligence ? formatPercentage(businessIntelligence.kpis.conversion_rate) : '0%'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'معدل التحويل' : 'Conversion Rate'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {businessIntelligence ? formatPercentage(businessIntelligence.kpis.conversion_rate) : '0%'}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
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
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'قيمة العميل مدى الحياة' : 'Customer Lifetime Value'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {businessIntelligence ? formatCurrency(businessIntelligence.kpis.customer_lifetime_value) : formatCurrency(0)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'قيمة العميل مدى الحياة' : 'Customer Lifetime Value'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {businessIntelligence ? formatCurrency(businessIntelligence.kpis.customer_lifetime_value) : formatCurrency(0)}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
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
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {businessIntelligence ? formatCurrency(businessIntelligence.kpis.average_order_value) : formatCurrency(0)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {businessIntelligence ? formatCurrency(businessIntelligence.kpis.average_order_value) : formatCurrency(0)}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
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
        transition={{ delay: 0.9, duration: 0.6 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-32"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'معدل العملاء المتكررين' : 'Repeat Customer Rate'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
            {businessIntelligence ? formatPercentage(businessIntelligence.kpis.repeat_customer_rate) : '0%'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'معدل العملاء المتكررين' : 'Repeat Customer Rate'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {businessIntelligence ? formatPercentage(businessIntelligence.kpis.repeat_customer_rate) : '0%'}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUpIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
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
        transition={{ delay: 1.0, duration: 0.6 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="group h-32 col-span-2 md:col-span-1 lg:col-span-1"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'معدل هجر السلة' : 'Cart Abandonment Rate'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors duration-300">
                      {businessIntelligence ? formatPercentage(businessIntelligence.kpis.cart_abandonment_rate) : '0%'}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      {i18n.language === 'ar' ? 'معدل هجر السلة' : 'Cart Abandonment Rate'}
                    </p>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 group-hover:text-red-700 transition-colors duration-300">
                      {businessIntelligence ? formatPercentage(businessIntelligence.kpis.cart_abandonment_rate) : '0%'}
                    </div>
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-red-600 group-hover:text-red-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  if (loading && !dashboardData) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2 p-1">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      <Card>
          <CardHeader className="p-1">
            <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-right order-1 sm:order-2"
            >
              <h1 className={`flex items-center text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                التقارير والتحليلات
              </h1>
  </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full lg:w-auto order-2 sm:order-1"
            >
              {/* Refresh Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-5 h-5 ms-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">تحديث </span>
                </Button>
              </motion.div>
              
              {/* Date Range Filters Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-700/60 backdrop-blur-sm rounded-xl p-3 border border-slate-200/60 dark:border-slate-600/40 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                     <div className="relative min-w-[140px]">
                    <Label htmlFor="date-to" className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1 block flex items-center justify-end gap-2">
                      إلى تاريخ
                      <div className="w-5 h-5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-3 w-3 text-green-600" />
                      </div>
                    </Label>
                    <div className="relative">
                      <Input
                        id="date-to"
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => handleDateRangeChange('to', e.target.value)}
                        className="w-full pl-3 pr-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-600/40 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-sm hover:shadow-md text-sm"
                      />
                    </div>
                  </div> 
                  <div className="relative min-w-[140px]">
                    <Label htmlFor="date-from" className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1 block flex items-center justify-end gap-2">
                      من تاريخ
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-3 w-3 text-blue-600" />
                      </div>
                    </Label>
                    <div className="relative">
                      <Input
                        id="date-from"
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => handleDateRangeChange('from', e.target.value)}
                        className="w-full pl-3 pr-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-600/40 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm hover:shadow-md text-sm"
                      />
                    </div>
                  </div>
              
                </div>
              </motion.div>
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
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Reports & Analytics
              </h1>
      </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full lg:w-auto"
            >
              {/* Refresh Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  size="sm"
                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className={`w-5 h-5 me-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="font-semibold">Refresh </span>
                </Button>
              </motion.div>
              
              {/* Date Range Filters Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-800/80 dark:to-slate-700/60 backdrop-blur-sm rounded-xl p-3 border border-slate-200/60 dark:border-slate-600/40 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative min-w-[140px]">
                    <Label htmlFor="date-from" className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1 block flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-3 w-3 text-blue-600" />
                      </div>
                      From Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="date-from"
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => handleDateRangeChange('from', e.target.value)}
                        className="w-full pl-3 pr-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-600/40 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-sm hover:shadow-md text-sm"
                      />
        </div>
      </div>
                  <div className="relative min-w-[140px]">
                    <Label htmlFor="date-to" className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1 block flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center">
                        <Calendar className="h-3 w-3 text-green-600" />
                      </div>
                      To Date
                    </Label>
                    <div className="relative">
                      <Input
                        id="date-to"
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => handleDateRangeChange('to', e.target.value)}
                        className="w-full pl-3 pr-3 py-2 rounded-lg border border-slate-200/60 dark:border-slate-600/40 bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-green-500/30 focus:border-green-500 shadow-sm hover:shadow-md text-sm"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/30 rounded-2xl p-1 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <TabsTrigger 
              value="overview" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary font-semibold transition-all duration-300"
            >
              {i18n.language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger 
              value="sales" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary font-semibold transition-all duration-300"
            >
              {i18n.language === 'ar' ? 'المبيعات' : 'Sales'}
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary font-semibold transition-all duration-300"
            >
              {i18n.language === 'ar' ? 'العملاء' : 'Customers'}
            </TabsTrigger>
            <TabsTrigger 
              value="products" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary font-semibold transition-all duration-300"
            >
              {i18n.language === 'ar' ? 'المنتجات' : 'Products'}
            </TabsTrigger>
            <TabsTrigger 
              value="orders" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary font-semibold transition-all duration-300"
            >
              {i18n.language === 'ar' ? 'الطلبات' : 'Orders'}
            </TabsTrigger>
            <TabsTrigger 
              value="financial" 
              className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary font-semibold transition-all duration-300"
            >
              {i18n.language === 'ar' ? 'المالية' : 'Financial'}
            </TabsTrigger>
        </TabsList>
        </motion.div>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewCards />
          <KPICards />
          
          {/* Growth Metrics */}
          {businessIntelligence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                    {i18n.language === 'ar' ? 'مؤشرات النمو' : 'Growth Metrics'}
                </CardTitle>
              </CardHeader>
                <CardContent className="relative">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.6 }}
                      className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200/50 dark:border-green-700/30"
                    >
                    <div className="text-2xl font-bold text-green-600">
                      {businessIntelligence.growth_metrics.revenue_growth.toFixed(1)}%
                    </div>
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">{i18n.language === 'ar' ? 'نمو الإيرادات' : 'Revenue Growth'}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-700/30"
                    >
                      <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(businessIntelligence.growth_metrics.current_period_revenue)}
                    </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{i18n.language === 'ar' ? 'إيرادات الفترة الحالية' : 'Current Period Revenue'}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/20 dark:to-slate-700/10 rounded-xl border border-slate-200/50 dark:border-slate-600/30"
                    >
                      <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                      {formatCurrency(businessIntelligence.growth_metrics.previous_period_revenue)}
                    </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{i18n.language === 'ar' ? 'إيرادات الفترة السابقة' : 'Previous Period Revenue'}</p>
                    </motion.div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}

          {/* Order Status Distribution */}
          {dashboardData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    {i18n.language === 'ar' ? 'توزيع حالات الطلبات' : 'Order Status Distribution'}
                  </CardTitle>
              </CardHeader>
                <CardContent className="relative">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30 hover:shadow-lg transition-all duration-300"
                    >
                    <div className="text-2xl font-bold text-yellow-600">
                      {formatNumber(dashboardData.pending_orders || 0)}
                    </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">{i18n.language === 'ar' ? 'في الانتظار' : 'Pending'}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                      className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300"
                    >
                    <div className="text-2xl font-bold text-blue-600">
                        {formatNumber(dashboardData.completed_orders || dashboardData.delivered_orders || 0)}
                    </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{i18n.language === 'ar' ? 'مكتملة' : 'Completed'}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1, duration: 0.6 }}
                      className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200/50 dark:border-green-700/30 hover:shadow-lg transition-all duration-300"
                    >
                    <div className="text-2xl font-bold text-green-600">
                        {formatNumber(dashboardData.delivered_orders || 0)}
                    </div>
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">{i18n.language === 'ar' ? 'تم التسليم' : 'Delivered'}</p>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2, duration: 0.6 }}
                      className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl border border-red-200/50 dark:border-red-700/30 hover:shadow-lg transition-all duration-300"
                    >
                    <div className="text-2xl font-bold text-red-600">
                      {formatNumber(dashboardData.cancelled_orders || 0)}
                    </div>
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">{i18n.language === 'ar' ? 'ملغية' : 'Cancelled'}</p>
                    </motion.div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )}
        </TabsContent>

        {/* Sales Analytics Tab */}
        <TabsContent value="sales" className="space-y-6">
          {salesAnalytics && (
            <>
              {/* Sales Over Time Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      {i18n.language === 'ar' ? 'المبيعات عبر الزمن' : 'Sales Over Time'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesAnalytics.sales_over_time}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                        <Line type="monotone" dataKey="total" stroke="#8884d8" name={i18n.language === 'ar' ? 'المبيعات' : 'Sales'} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </motion.div>

              {/* Top Selling Products */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-green-600" />
                      </div>
                      {i18n.language === 'ar' ? 'أفضل المنتجات مبيعاً' : 'Top Selling Products'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <div className="space-y-4">
                    {salesAnalytics.top_products?.slice(0, 5).map((product, index: number) => (
                        <motion.div 
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-semibold">
                              {index + 1}
                            </Badge>
                          <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-300">{product.title}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{i18n.language === 'ar' ? `تم بيع ${formatNumber(Number(product.total_sold))} قطعة` : `${formatNumber(Number(product.total_sold))} units sold`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(Number(product.total_revenue))}</p>
                        </div>
                        </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </motion.div>

             
            </>
          )}
        </TabsContent>

        {/* Customer Analytics Tab */}
        <TabsContent value="customers" className="space-y-6">
          {customerAnalytics && (
            <>
              {/* Customer Acquisition */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      {i18n.language === 'ar' ? 'اكتساب العملاء الجدد' : 'Customer Acquisition'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={customerAnalytics.customer_acquisition}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#82ca9d" fill="#82ca9d" name={i18n.language === 'ar' ? 'عملاء جدد' : 'New Customers'} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </motion.div>

              {/* Top Customers */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        {i18n.language === 'ar' ? (
                          <>
                            <span className="text-right flex-1">{'أفضل العملاء (حسب عدد الطلبات)'}</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-blue-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-blue-600" />
                            </div>
                            <span>{'Top Customers (by Orders)'}</span>
                          </>
                        )}
                      </CardTitle>
                  </CardHeader>
                    <CardContent className="relative">
                    <div className="space-y-3">
                      {customerAnalytics.top_customers_by_orders?.slice(0, 5).map((customer: any, index: number) => (
                          <motion.div 
                            key={customer.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                          >
                          {i18n.language === 'ar' ? (
                            <>
                              <div className="text-right">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{`${formatNumber(customer.orders_count)} طلب`}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-1 justify-end">
                                <div className="text-right">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{customer.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{customer.email}</p>
                                </div>
                                <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-semibold">
                                  {index + 1}
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-semibold">
                                    {index + 1}
                                  </Badge>
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{customer.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{customer.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{`${formatNumber(customer.orders_count)} orders`}</p>
                              </div>
                            </>
                          )}
                          </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        {i18n.language === 'ar' ? (
                          <>
                            <span className="text-right flex-1">{'أفضل العملاء (حسب الإنفاق)'}</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-green-600" />
                            </div>
                            <span>{'Top Customers (by Spending)'}</span>
                          </>
                        )}
                      </CardTitle>
                  </CardHeader>
                    <CardContent className="relative">
                    <div className="space-y-3">
                      {customerAnalytics.top_customers_by_revenue?.slice(0, 5).map((customer: any, index: number) => (
                          <motion.div 
                            key={customer.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                          >
                          {i18n.language === 'ar' ? (
                            <>
                              <div className="text-right">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(customer.total_spent)}</p>
                              </div>
                              <div className="flex items-center gap-3 flex-1 justify-end">
                                <div className="text-right">
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{customer.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{customer.email}</p>
                                </div>
                                <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-semibold">
                                  {index + 1}
                                </Badge>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                  <Badge variant="secondary" className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-semibold">
                                    {index + 1}
                                  </Badge>
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-300">{customer.name}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{customer.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                  <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(customer.total_spent)}</p>
                              </div>
                            </>
                          )}
                          </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              </motion.div>

              {/* Customers by City */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      {i18n.language === 'ar' ? 'العملاء حسب المدينة' : 'Customers by City'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={customerAnalytics.customers_by_city}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="city" />
                      <YAxis />
                      <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" name={i18n.language === 'ar' ? 'عدد العملاء' : 'Number of Customers'} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </motion.div>
            </>
          )}
        </TabsContent>

        {/* Products Analytics Tab */}
        <TabsContent value="products" className="space-y-6">
          {productAnalytics && (
            <>
              {/* Product Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      {i18n.language === 'ar' ? 'أداء المنتجات' : 'Product Performance'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <div className="space-y-4">
                    {productAnalytics.product_performance?.slice(0, 10).map((product: any, index: number) => (
                        <motion.div 
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-semibold border-primary/30">
                              {index + 1}
                            </Badge>
                          <div>
                              <p className="font-semibold text-slate-700 dark:text-slate-300">{product.title}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {i18n.language === 'ar' ? `السعر: ${formatCurrency(product.price)} | المخزون: ${formatNumber(product.stock_quantity || 0)}` : `Price: ${formatCurrency(product.price)} | Stock: ${formatNumber(product.stock_quantity || 0)}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(product.total_revenue)}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{i18n.language === 'ar' ? `تم بيع ${formatNumber(Number(product.total_sold))} قطعة` : `${formatNumber(Number(product.total_sold))} units sold`}</p>
                        </div>
                        </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </motion.div>

             

              {/* Products by Category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      {i18n.language === 'ar' ? 'المنتجات حسب الفئة' : 'Products by Category'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productAnalytics.products_by_category}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                        <Bar dataKey="products_count" fill="#82ca9d" name={i18n.language === 'ar' ? 'عدد المنتجات' : 'Number of Products'} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </motion.div>
            </>
          )}
        </TabsContent>

        {/* Orders Analytics Tab */}
        <TabsContent value="orders" className="space-y-6">
          {orderAnalytics && (
            <>
              {/* Orders by Status */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        {i18n.language === 'ar' ? (
                          <>
                            <span className="text-right flex-1">{'الطلبات حسب الحالة'}</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                              <PieChartIcon className="h-5 w-5 text-blue-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                              <PieChartIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <span>{'Orders by Status'}</span>
                          </>
                        )}
                      </CardTitle>
                  </CardHeader>
                    <CardContent className="relative">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={orderAnalytics.orders_by_status}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ status, percent }) => i18n.language === 'ar' ? `${(percent * 100).toFixed(0)}% ${translateOrderStatus(status)}` : `${translateOrderStatus(status)} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {orderAnalytics.orders_by_status?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          labelFormatter={(value) => translateOrderStatus(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative">
                      <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        {i18n.language === 'ar' ? (
                          <>
                            <span className="text-right flex-1">{'الطلبات حسب حالة الدفع'}</span>
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <span>{'Orders by Payment Status'}</span>
                          </>
                        )}
                      </CardTitle>
                  </CardHeader>
                    <CardContent className="relative">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={orderAnalytics.orders_by_payment_status}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ payment_status, percent }) => i18n.language === 'ar' ? `${(percent * 100).toFixed(0)}% ${translatePaymentStatus(payment_status)}` : `${translatePaymentStatus(payment_status)} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#82ca9d"
                          dataKey="count"
                        >
                          {orderAnalytics.orders_by_payment_status?.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          labelFormatter={(value) => translatePaymentStatus(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                </motion.div>
              </motion.div>

              {/* Processing Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-purple-600" />
                      </div>
                      {i18n.language === 'ar' ? 'متوسط وقت معالجة الطلبات' : 'Average Order Processing Time'}
                  </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                    <div className="text-center p-6">
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-4xl font-bold text-purple-600 mb-2"
                      >
                        {i18n.language === 'ar' ? `${orderAnalytics.average_processing_time?.hours?.toFixed(1) || '0'} ساعة` : `${orderAnalytics.average_processing_time?.hours?.toFixed(1) || '0'} hours`}
                      </motion.div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">{i18n.language === 'ar' ? 'متوسط الوقت من الطلب إلى التسليم' : 'Average time from order to delivery'}</p>
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              {/* Orders Over Time */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      {i18n.language === 'ar' ? 'الطلبات عبر الزمن' : 'Orders Over Time'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={orderAnalytics.orders_over_time}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" name={i18n.language === 'ar' ? 'عدد الطلبات' : 'Number of Orders'} />
                      <Line type="monotone" dataKey="total_amount" stroke="#82ca9d" name={i18n.language === 'ar' ? 'قيمة الطلبات' : 'Order Value'} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </motion.div>

              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                        <Activity className="h-5 w-5 text-green-600" />
                      </div>
                      {i18n.language === 'ar' ? 'الطلبات الحديثة' : 'Recent Orders'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <div className="space-y-4">
                      {orderAnalytics.recent_orders?.slice(0, 5).map((order: any, index: number) => (
                        <motion.div 
                          key={order.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                        >
                        <div>
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{order.order_number}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{order.customer_name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                            {new Date(order.created_at).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(Number(order.total_amount))}</p>
                          <div className="flex gap-2 mt-1">
                              <Badge 
                                variant={order.status === 'delivered' ? 'default' : 'secondary'}
                                className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary border-primary/30"
                              >
                              {translateOrderStatus(order.status)}
                            </Badge>
                          </div>
                        </div>
                        </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </>
          )}
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {financialData && (
            <>
              {/* Revenue Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        {i18n.language === 'ar' ? 'تفصيل الإيرادات - الفترة المحددة' : 'Revenue Breakdown - Selected Period'}
                      </div>
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {i18n.language === 'ar' ? 'الفترة الحالية' : 'Current Period'}
                      </Badge>
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(financialData.revenue_breakdown.period.total_subtotal)}
                      </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{i18n.language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-xl border border-green-200/50 dark:border-green-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(financialData.revenue_breakdown.period.total_tax)}
                      </div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">{i18n.language === 'ar' ? 'الضرائب' : 'Taxes'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-lg font-bold text-yellow-600">
                        {formatCurrency(financialData.revenue_breakdown.period.total_shipping)}
                      </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">{i18n.language === 'ar' ? 'الشحن' : 'Shipping'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl border border-red-200/50 dark:border-red-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-lg font-bold text-red-600">
                        -{formatCurrency(financialData.revenue_breakdown.period.total_discount)}
                      </div>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{i18n.language === 'ar' ? 'الخصومات' : 'Discounts'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-xl border border-purple-200/50 dark:border-purple-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-lg font-bold text-purple-600">
                        {formatCurrency(financialData.revenue_breakdown.period.total_revenue)}
                      </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">{i18n.language === 'ar' ? 'صافي الإيرادات' : 'Net Revenue'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/20 dark:to-slate-700/10 rounded-xl border border-slate-200/50 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                        {formatNumber(financialData.revenue_breakdown.period.total_orders)}
                      </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{i18n.language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</p>
                      </motion.div>
                  </div>
                  
                  {/* Period Label */}
                  <div className="mt-4 px-4 pb-2">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {i18n.language === 'ar' 
                          ? `الفترة: ${financialData.date_range.applied_from} إلى ${financialData.date_range.applied_to}`
                          : `Period: ${financialData.date_range.applied_from} to ${financialData.date_range.applied_to}`
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>

              {/* All Time Statistics */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 border-indigo-200/50 dark:border-indigo-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-indigo-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center justify-between text-indigo-700 dark:text-indigo-300">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-indigo-600" />
                        </div>
                        {i18n.language === 'ar' ? 'إحصائيات كل الوقت' : 'All Time Statistics'}
                      </div>
                      <Badge variant="outline" className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800">
                        {i18n.language === 'ar' ? 'منذ البداية' : 'Since Beginning'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-lg font-bold text-blue-600">
                          {formatCurrency(financialData.revenue_breakdown.all_time.total_subtotal)}
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">{i18n.language === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-700/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(financialData.revenue_breakdown.all_time.total_tax)}
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300 font-medium">{i18n.language === 'ar' ? 'الضرائب' : 'Taxes'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/30 dark:to-yellow-800/20 rounded-xl border border-yellow-200/50 dark:border-yellow-700/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-lg font-bold text-yellow-600">
                          {formatCurrency(financialData.revenue_breakdown.all_time.total_shipping)}
                        </div>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 font-medium">{i18n.language === 'ar' ? 'الشحن' : 'Shipping'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20 rounded-xl border border-red-200/50 dark:border-red-700/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-lg font-bold text-red-600">
                          -{formatCurrency(financialData.revenue_breakdown.all_time.total_discount)}
                        </div>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{i18n.language === 'ar' ? 'الخصومات' : 'Discounts'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl border border-purple-200/50 dark:border-purple-700/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-lg font-bold text-purple-600">
                          {formatCurrency(financialData.revenue_breakdown.all_time.total_revenue)}
                        </div>
                        <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">{i18n.language === 'ar' ? 'صافي الإيرادات' : 'Net Revenue'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/30 dark:to-slate-700/20 rounded-xl border border-slate-200/50 dark:border-slate-600/30 hover:shadow-lg transition-all duration-300"
                      >
                        <div className="text-lg font-bold text-slate-600 dark:text-slate-400">
                          {formatNumber(financialData.revenue_breakdown.all_time.total_orders)}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{i18n.language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</p>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Revenue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-green-600" />
                      </div>
                      {i18n.language === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={financialData.monthly_revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                        <Bar dataKey="revenue" fill="#8884d8" name={i18n.language === 'ar' ? 'الإيرادات' : 'Revenue'} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              </motion.div>

              {/* Refunds and Cancellations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative">
                    <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      {i18n.language === 'ar' ? 'المرتجعات والإلغاءات' : 'Refunds and Cancellations'}
                    </CardTitle>
                </CardHeader>
                  <CardContent className="relative">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl border border-red-200/50 dark:border-red-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-2xl font-bold text-red-600">
                        {formatNumber(financialData.refunds_and_cancellations.cancelled_orders)}
                      </div>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{i18n.language === 'ar' ? 'طلبات ملغية' : 'Cancelled Orders'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-xl border border-red-200/50 dark:border-red-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-2xl font-bold text-red-600">
                        {formatCurrency(financialData.refunds_and_cancellations.cancelled_revenue)}
                      </div>
                        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{i18n.language === 'ar' ? 'قيمة الطلبات الملغية' : 'Cancelled Orders Value'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.1, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl border border-orange-200/50 dark:border-orange-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-2xl font-bold text-orange-600">
                        {formatNumber(financialData.refunds_and_cancellations.refunded_orders)}
                      </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">{i18n.language === 'ar' ? 'طلبات مرتجعة' : 'Refunded Orders'}</p>
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.2, duration: 0.6 }}
                        className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 rounded-xl border border-orange-200/50 dark:border-orange-700/30 hover:shadow-lg transition-all duration-300"
                      >
                      <div className="text-2xl font-bold text-orange-600">
                        {formatCurrency(financialData.refunds_and_cancellations.refunded_amount)}
                      </div>
                        <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">{i18n.language === 'ar' ? 'قيمة المرتجعات' : 'Refunded Amount'}</p>
                      </motion.div>
                  </div>
                </CardContent>
              </Card>
              </motion.div>
            </>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default AdminReports;