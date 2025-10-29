import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { useAuthError } from '@/hooks/useAuthError';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import LazyImageContainer from '@/components/ui/LazyImageContainer';
import AdminDashboardLazyStats from '@/components/admin/AdminDashboardLazyStats';
import { motion } from 'framer-motion';

import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart3,
  RefreshCw,
  Tag,
  Bell,
} from 'lucide-react';
import {
  getDashboardOverview,
  getSalesAnalytics,
} from '@/lib/api';
import { toast } from 'sonner';

interface DashboardData {
  overview: {
    total_orders: number;
    total_products: number;
    total_categories: number;
    total_revenue: string;
    pending_orders: number;
    low_stock_products: number;
    unread_notifications: number;
    total_customers: number;
    active_customers: number;
    total_discount_codes: number;
    active_discount_codes: number;
    average_order_value: string;
    conversion_rate: string;
  };
  period_stats: {
    orders_count: number;
    revenue: string;
    new_products: number;
    completed_orders: number;
  };
  growth: {
    orders_growth: number;
    revenue_growth: number;
  };
  period: number;
  date_range: {
    start: string;
    end: string;
  };
}

interface SalesData {
  sales_data: Array<{
    date: string;
    orders_count: number;
    revenue: string;
  }>;
  summary: {
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
    period: number;
    group_by: string;
  };
}


const AdminDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // Safely get admin context with error handling
  let token = null;
  try {
    const adminContext = useAdmin();
    token = adminContext.token;
  } catch (error) {
    console.error('Error accessing AdminContext in AdminDashboard:', error);
    // Redirect to login if context is not available
    window.location.href = '/admin/login';
    return null;
  }
  
  const { handleApiError } = useAuthError();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    if (!token) return;

    try {
      const [overviewResponse, salesResponse] = await Promise.all([
        getDashboardOverview(token, 30),
        getSalesAnalytics(token, 30, 'day'),
      ]);

      if (overviewResponse.success) {
        setDashboardData(overviewResponse.data);
      }
      if (salesResponse.success) {
        setSalesData(salesResponse.data);
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      
      // Check if it's an authentication error
      if (handleApiError(error)) {
        // Authentication error was handled, don't show additional error
        return;
      }
      
      // Show error for other types of errors
      toast.error(t('admin.dashboard.loadError'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };


  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    const formattedAmount = numericAmount.toFixed(2);
    return i18n.language === 'ar' ? `${formattedAmount} د.ك` : `KWD ${formattedAmount}`;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };


  if (isLoading) {
    return (
      <div className="space-y-8 p-1 ">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Skeleton className="h-10 w-64 rounded-2xl" />
          <Skeleton className="h-12 w-32 rounded-2xl" />
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-1">
                  <Skeleton className="h-5 w-28 rounded-xl" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </CardHeader>
                <CardContent className="p-1 pt-0">
                  <Skeleton className="h-10 w-20 mb-3 rounded-xl" />
                  <Skeleton className="h-4 w-24 rounded-lg" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-1">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-row items-center justify-between gap-6"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-right order-2"
            >
              <h1 className="text-3xl sm:text-4xl pb-2 font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.dashboard.title')}
              </h1>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="order-1 flex items-center gap-3"
            >
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 me-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">{t('admin.common.refresh')}</span>
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
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.dashboard.title')}
              </h1>
          
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 me-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">{t('admin.common.refresh')}</span>
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Main Stats Cards */}
      <AdminDashboardLazyStats
        stats={[
          {
            title: t('admin.dashboard.totalOrders'),
            value: dashboardData?.overview.total_orders || 0,
            change: dashboardData?.growth.orders_growth || 0,
            changeType: dashboardData?.growth.orders_growth > 0 ? 'increase' : 'decrease',
            icon: <ShoppingCart className="h-4 w-4" />,
            color: ' text-slate-600',
            loading: isLoading,
          },
          {
            title: t('admin.dashboard.totalRevenue'),
            value: typeof dashboardData?.overview.total_revenue === 'string' 
              ? parseFloat(dashboardData.overview.total_revenue) 
              : dashboardData?.overview.total_revenue || 0,
            change: dashboardData?.growth.revenue_growth || 0,
            changeType: dashboardData?.growth.revenue_growth > 0 ? 'increase' : 'decrease',
            icon: <DollarSign className="h-4 w-4" />,
            color: ' text-gray-600',
            loading: isLoading,
          },
          {
            title: t('admin.dashboard.totalProducts'),
            value: dashboardData?.overview.total_products || 0,
            change: 0,
            changeType: 'neutral',
            icon: <Package className="h-4 w-4" />,
            color: ' text-zinc-600',
            loading: isLoading,
          },
          {
            title: t('admin.dashboard.totalCustomers'),
            value: dashboardData?.overview.total_customers || 0,
            change: 0,
            changeType: 'neutral',
            icon: <Users className="h-4 w-4" />,
            color: ' text-neutral-600',
            loading: isLoading,
          },
        ]}
        threshold={0.1}
        animationDelay={0.2}
      />

      {/* Secondary Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        {/* Pending Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <CardContent className="p-1">
            <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-7 w-7 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      {t('admin.dashboard.pendingOrders')}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {dashboardData?.overview.pending_orders || 0}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                      {t('admin.dashboard.pendingOrders')}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                      {dashboardData?.overview.pending_orders || 0}
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-7 w-7 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
             <p className={`text-sm text-slate-600/80 dark:text-slate-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
               {t('admin.dashboard.awaitingProcessing')}
             </p>
          </CardContent>
        </Card>
        </motion.div>

         {/* Average Order Value */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.6, duration: 0.6 }}
           whileHover={{ scale: 1.02, y: -5 }}
           className="group"
         >
           <Card className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900/20 dark:to-gray-800/10 border-gray-200/50 dark:border-gray-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl group-hover:shadow-gray-200/30 dark:group-hover:shadow-gray-900/30">
             <div className="absolute top-0 right-0 w-20 h-20 bg-gray-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
             <div className="absolute bottom-0 left-0 w-16 h-16 bg-gray-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
             <CardContent className="p-1" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
             <div className="flex items-center justify-between mb-3">
               {i18n.language === 'ar' ? (
                 <>
                   <div className="w-14 h-14 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                     <BarChart3 className="h-7 w-7 text-gray-600 group-hover:text-gray-700 transition-colors duration-300" />
                   </div>
                   <div className="w-full" dir="rtl">
                     <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                       {t('admin.dashboard.averageOrderValue')}
                     </p>
                     <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300">
                       {formatCurrency(dashboardData?.overview.average_order_value || '0')}
                     </div>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="text-left">
                     <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                       {t('admin.dashboard.averageOrderValue')}
                     </p>
                     <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors duration-300">
                       {formatCurrency(dashboardData?.overview.average_order_value || '0')}
                     </div>
                   </div>
                   <div className="w-14 h-14 bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                     <BarChart3 className="h-7 w-7 text-gray-600 group-hover:text-gray-700 transition-colors duration-300" />
                   </div>
                 </>
               )}
             </div>
             <p className={`text-sm text-gray-600/80 dark:text-gray-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
               {t('admin.dashboard.perOrder')}
             </p>
           </CardContent>
         </Card>
         </motion.div>

        {/* Conversion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900/20 dark:to-zinc-800/10 border-zinc-200/50 dark:border-zinc-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl group-hover:shadow-zinc-200/30 dark:group-hover:shadow-zinc-900/30">
            <div className="absolute top-0 right-0 w-20 h-20 bg-zinc-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-zinc-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <CardContent className="p-1">
            <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-7 w-7 text-zinc-600 group-hover:text-zinc-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      {t('admin.dashboard.conversionRate')}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors duration-300">
                      {dashboardData?.overview.conversion_rate || '0'}%
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-2">
                      {t('admin.dashboard.conversionRate')}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors duration-300">
                      {dashboardData?.overview.conversion_rate || '0'}%
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-zinc-500/20 to-zinc-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-7 w-7 text-zinc-600 group-hover:text-zinc-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
             <p className={`text-sm text-zinc-600/80 dark:text-zinc-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
               {t('admin.dashboard.visitorToCustomer')}
             </p>
          </CardContent>
        </Card>
        </motion.div>

        {/* Discount Codes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="group"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900/20 dark:to-neutral-800/10 border-neutral-200/50 dark:border-neutral-800/30 hover:shadow-2xl transition-all duration-300 rounded-2xl group-hover:shadow-neutral-200/30 dark:group-hover:shadow-neutral-900/30">
            <div className="absolute top-0 right-0 w-20 h-20 bg-neutral-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-neutral-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            <CardContent className="p-1">
            <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-neutral-500/20 to-neutral-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Tag className="h-7 w-7 text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                      {t('admin.dashboard.discountCodes')}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-neutral-800 dark:group-hover:text-neutral-100 transition-colors duration-300">
                      {dashboardData?.overview.total_discount_codes || 0}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
                      {t('admin.dashboard.discountCodes')}
                    </p>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-neutral-800 dark:group-hover:text-neutral-100 transition-colors duration-300">
                      {dashboardData?.overview.total_discount_codes || 0}
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-neutral-500/20 to-neutral-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Tag className="h-7 w-7 text-neutral-600 group-hover:text-neutral-700 transition-colors duration-300" />
                  </div>
                </>
              )}
            </div>
             <p className={`text-sm text-neutral-600/80 dark:text-neutral-400/80 font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
               {dashboardData?.overview.active_discount_codes || 0} {t('admin.common.active')}
             </p>
          </CardContent>
        </Card>
        </motion.div>
      </motion.div>

    </div>
  );
};

export default AdminDashboard;