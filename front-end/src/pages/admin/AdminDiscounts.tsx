import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from 'sonner';
import { getAdminDiscountCodes, getDiscountCodeStatistics, deleteDiscountCode, toggleDiscountCodeStatus } from '@/lib/api';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  Copy,
  Percent,
  DollarSign,
  Gift,
  Users,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

import DiscountForm from '@/components/admin/DiscountForm';
import DiscountDetails from '@/components/admin/DiscountDetails';
import DiscountBulkActions from '@/components/admin/DiscountBulkActions';

interface DiscountCode {
  id: number;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: string;
  minimum_order_amount?: string;
  maximum_discount_amount?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  starts_at?: string;
  expires_at?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  usage_percentage: number;
  remaining_uses?: number;
}

interface DiscountStatistics {
  total_discount_codes: number;
  active_discount_codes: number;
  inactive_discount_codes: number;
  total_usage_count: number;
  total_discount_amount: string;
  average_discount_value: string;
  most_used_code: {
    id: number;
    code: string;
    usage_count: number;
  };
  expiring_soon: number;
  expired_codes: number;
}

const AdminDiscounts: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [statistics, setStatistics] = useState<DiscountStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDiscounts, setTotalDiscounts] = useState(0);
  const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountCode | null>(null);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort_by') || 'created_at');
  const [sortDirection, setSortDirection] = useState(searchParams.get('sort_direction') || 'desc');
  const [perPage, setPerPage] = useState(parseInt(searchParams.get('per_page') || '10'));
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1'));

  // Load discounts
  const loadDiscounts = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Handle special status filters with frontend filtering
      let statusFilterValue = statusFilter;

      if (statusFilter === 'expiring_soon' || statusFilter === 'expired') {
        // For these special filters, we'll filter on frontend after getting all data
        statusFilterValue = 'all';
      }

      const params = {
        page: currentPage,
        per_page: perPage,
        search: search || undefined,
        is_active: statusFilterValue === 'active' ? true : statusFilterValue === 'inactive' ? false : undefined,
        sort_by: sortBy,
        sort_direction: sortDirection,
      };

      const response = await getAdminDiscountCodes(token, params);

      if (response.success) {
        let discountData = response.data;
        let filteredDiscounts = discountData.data || [];

        // Apply frontend filtering for all status filters to ensure accuracy
        if (statusFilter === 'active') {
          filteredDiscounts = filteredDiscounts.filter((discount: DiscountCode) => discount.is_active === true);
        } else if (statusFilter === 'inactive') {
          filteredDiscounts = filteredDiscounts.filter((discount: DiscountCode) => discount.is_active === false);
        } else if (statusFilter === 'expiring_soon') {
          const sevenDaysFromNow = new Date();
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

          filteredDiscounts = filteredDiscounts.filter((discount: DiscountCode) => {
            if (!discount.expires_at) return false;
            const expiryDate = new Date(discount.expires_at);
            return expiryDate >= new Date() && expiryDate <= sevenDaysFromNow && discount.is_active === true;
          });
        } else if (statusFilter === 'expired') {
          filteredDiscounts = filteredDiscounts.filter((discount: DiscountCode) => {
            if (!discount.expires_at) return false;
            return new Date(discount.expires_at) < new Date();
          });
        }

        // Apply pagination to filtered results
        const totalFiltered = filteredDiscounts.length;
        const totalPagesFiltered = Math.ceil(totalFiltered / perPage);

        // For all filtered results, calculate pagination manually to ensure accuracy
        setTotalPages(totalPagesFiltered);
        setTotalDiscounts(totalFiltered);

        // Apply pagination to filtered results
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const paginatedDiscounts = filteredDiscounts.slice(startIndex, endIndex);
        setDiscounts(paginatedDiscounts);
      } else {
        toast.error(t('admin.discounts.loadError'));
      }
    } catch (error) {
      console.error('Error loading discounts:', error);
      toast.error(t('admin.discounts.loadError'));
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStatistics = async () => {
    if (!token) return;

    try {
      const response = await getDiscountCodeStatistics(token);
      
      if (response.success) {
        const statsData = response.data;
        setStatistics({
          total_discount_codes: statsData.overview.total_codes,
          active_discount_codes: statsData.overview.active_codes,
          inactive_discount_codes: statsData.overview.total_codes - statsData.overview.active_codes,
          total_usage_count: statsData.period_stats.total_usage,
          total_discount_amount: statsData.period_stats.total_discount_amount,
          average_discount_value: statsData.period_stats.average_discount_per_usage.toString(),
          most_used_code: statsData.most_used_codes.length > 0 ? {
            id: statsData.most_used_codes[0].id,
            code: statsData.most_used_codes[0].code,
            usage_count: statsData.most_used_codes[0].usage_count
          } : { id: 0, code: '', usage_count: 0 },
          expiring_soon: statsData.overview.expired_codes,
          expired_codes: statsData.overview.expired_codes
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteDiscountCode(token, id);
      toast.success("تم حذف كود الخصم بنجاح");
      loadDiscounts();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error("فشل في حذف كود الخصم");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await toggleDiscountCodeStatus(token, id);
      toast.success("تم تحديث حالة كود الخصم بنجاح");
      loadDiscounts();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error("فشل في تحديث حالة كود الخصم");
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      toast.success("تم نسخ كود الخصم بنجاح");
      loadDiscounts();
    } catch (error) {
      console.error('Error duplicating discount:', error);
      toast.error("فشل في نسخ كود الخصم");
    }
  };

  // Load data on mount and when filters change
  useEffect(() => {
    loadDiscounts();
    loadStatistics();
  }, [currentPage, perPage, search, typeFilter, statusFilter, sortBy, sortDirection, token]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (typeFilter !== 'all') params.set('type', typeFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sortBy !== 'created_at') params.set('sort_by', sortBy);
    if (sortDirection !== 'desc') params.set('sort_direction', sortDirection);
    if (perPage !== 10) params.set('per_page', perPage.toString());
    if (currentPage !== 1) params.set('page', currentPage.toString());

    setSearchParams(params);
  }, [search, typeFilter, statusFilter, sortBy, sortDirection, perPage, currentPage, setSearchParams]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const handleSelectDiscount = (discountId: number) => {
    if (selectedDiscounts.includes(discountId)) {
      setSelectedDiscounts(prev => prev.filter(id => id !== discountId));
    } else {
      setSelectedDiscounts(prev => [...prev, discountId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDiscounts.length === discounts.length) {
      setSelectedDiscounts([]);
    } else {
      setSelectedDiscounts(discounts.map(d => d.id));
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed_amount': return DollarSign;
      case 'free_shipping': return Gift;
      default: return Gift;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (discount: DiscountCode) => {
    if (!discount.is_active) return 'secondary';
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) return 'destructive';
    if (discount.remaining_uses === 0) return 'destructive';
    return 'default';
  };

  // Get status text
  const getStatusText = (discount: DiscountCode) => {
    if (!discount.is_active) return t('admin.discounts.inactive');
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) return t('admin.discounts.expired');
    if (discount.remaining_uses === 0) return t('admin.discounts.fullyUsed');
    return t('admin.discounts.active');
  };

  // Statistics cards
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "blue" }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50',
      orange: 'text-orange-600 bg-orange-50',
      purple: 'text-purple-600 bg-purple-50',
      red: 'text-red-600 bg-red-50',
    };

    return (
      <Card>
        <CardContent className="p-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground truncate max-w-[90%]">{title}</p>
              <p className="text-sm font-bold">{value}</p>
              {trend && trendValue && (
                <div className={`flex items-center text-xs ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {trendValue}
                </div>
              )}
            </div>
            <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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
                <h1 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  {t('admin.discounts.title')}
                </h1>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto order-2 sm:order-1"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5 ms-3 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">{t('admin.discounts.createCode')}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="max-w-2xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
                    style={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 50,
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 #f1f5f9',
                      scrollBehavior: 'smooth'
                    }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <DialogHeader className="relative space-y-3 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                      <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                        {t('admin.discounts.createCode')}
                      </DialogTitle>
                      <DialogDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        {t('admin.discounts.createCodeDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative p-4 sm:p-6">
                      <DiscountForm onSuccess={() => {
                        loadDiscounts();
                        loadStatistics();
                      }} />
                    </div>
                  </DialogContent>
                </Dialog>
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
                <h1 className="text-2xl pb-2 sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                  {t('admin.discounts.title')}
                </h1>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto"
              >
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
                    >
                      <Plus className="w-5 h-5 me-3 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">{t('admin.discounts.createCode')}</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent 
                    className="max-w-2xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
                    style={{
                      position: 'fixed',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 50,
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#cbd5e1 #f1f5f9',
                      scrollBehavior: 'smooth'
                    }}
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <DialogHeader className="relative space-y-3 pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
                      <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                        {t('admin.discounts.createCode')}
                      </DialogTitle>
                      <DialogDescription className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                        {t('admin.discounts.createCodeDescription')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative p-4 sm:p-6">
                      <DiscountForm onSuccess={() => {
                        loadDiscounts();
                        loadStatistics();
                      }} />
                    </div>
                  </DialogContent>
                </Dialog>
          
              </motion.div>
            </>
          )}
        </motion.div>

      {/* Statistics */}
      {statistics && (
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
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Gift className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.totalCodes')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_discount_codes}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.active_discount_codes} {t('admin.discounts.active')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.totalCodes')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_discount_codes}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.active_discount_codes} {t('admin.discounts.active')}
              </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Gift className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-primary group-hover:text-primary/80 transition-colors duration-300" />
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
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.activeCodes')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.active_discount_codes}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.inactive_discount_codes} {t('admin.discounts.inactive')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.activeCodes')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.active_discount_codes}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.inactive_discount_codes} {t('admin.discounts.inactive')}
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
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.totalUsage')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_usage_count}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {statistics.most_used_code.usage_count} {t('admin.discounts.mostUsed')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.totalUsage')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_usage_count}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                {statistics.most_used_code.usage_count} {t('admin.discounts.mostUsed')}
              </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
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
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3">
              {i18n.language === 'ar' ? (
                <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.totalDiscount')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {parseFloat(statistics.total_discount_amount).toFixed(2)} {i18n.language === 'ar' ? 'د.ك' : t('common.currency')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {parseFloat(statistics.average_discount_value).toFixed(2)} {i18n.language === 'ar' ? 'د.ك' : t('common.currency')} {t('admin.discounts.average')}
                        </p>
                      </div>
                </>
              ) : (
                <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                    {t('admin.discounts.totalDiscount')}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {parseFloat(statistics.total_discount_amount).toFixed(2)} {i18n.language === 'ar' ? 'د.ك' : t('common.currency')}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600/80 dark:text-slate-400/80 font-medium mt-1">
                          {parseFloat(statistics.average_discount_value).toFixed(2)} {i18n.language === 'ar' ? 'د.ك' : t('common.currency')} {t('admin.discounts.average')}
                        </p>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                </>
              )}
                </div>
            </CardContent>
          </Card>
          </motion.div>
        </motion.div>
      )}



      {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-2 sm:p-4"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
              
              {/* Mobile Layout */}
              <div className="block sm:hidden space-y-4">
                <div className="space-y-2">
                  <label className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                    {t('admin.discounts.search')}
                  </label>
                  <div className="relative group">
                    <Search className={`absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4 ${i18n.language === 'ar' ? 'left-3' : 'right-3'}`} />
                    <Input
                      placeholder={t('admin.discounts.searchPlaceholder')}
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className={`${i18n.language === 'ar' ? 'pl-10 text-right rtl-placeholder placeholder-right' : 'pr-10 text-left placeholder:text-left'} rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full`}
                      dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                    {t('admin.discounts.type')}
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.discounts.filterByType')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.allTypes')}</SelectItem>
                      <SelectItem value="percentage" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.percentage')}</SelectItem>
                      <SelectItem value="fixed_amount" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.fixedAmount')}</SelectItem>
                      <SelectItem value="free_shipping" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.freeShipping')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                      {t('admin.discounts.status')}
                    </label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue placeholder={t('admin.discounts.filterByStatus')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                        <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.allStatuses')}</SelectItem>
                        <SelectItem value="active" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.activeCodes')}</SelectItem>
                        <SelectItem value="inactive" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.inactiveCodes')}</SelectItem>
                        <SelectItem value="expiring_soon" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiringSoon')}</SelectItem>
                        <SelectItem value="expired" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiredCodes')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className={`text-xs font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                      {t('admin.discounts.sortBy')}
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue placeholder={t('admin.discounts.sortBy')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                        <SelectItem value="created_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.createdAt')}</SelectItem>
                        <SelectItem value="code" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.code')}</SelectItem>
                        <SelectItem value="usage_count" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.usageCount')}</SelectItem>
                        <SelectItem value="expires_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiresAt')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex flex-col gap-3 sm:gap-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            {i18n.language === 'ar' ? (
              <>
                {/* Search - Arabic: First (Mobile) */}
                <div className="flex-1 space-y-2 order-1 sm:order-4">
                  <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                    {t('admin.discounts.search')}
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4" />
                    <Input
                      placeholder={t('admin.discounts.searchPlaceholder')}
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="pl-10 text-right rtl-placeholder placeholder-right rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full"
                      dir="rtl"
                    />
                  </div>
                </div>

                {/* Type Filter - Arabic: Second (Mobile) */}
                <div className="space-y-2 order-2 sm:order-3">
                  <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                    {t('admin.discounts.type')}
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.discounts.filterByType')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.allTypes')}</SelectItem>
                      <SelectItem value="percentage" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.percentage')}</SelectItem>
                      <SelectItem value="fixed_amount" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.fixedAmount')}</SelectItem>
                      <SelectItem value="free_shipping" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.freeShipping')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter - Arabic: Third (Mobile) */}
                <div className="space-y-2 order-3 sm:order-2">
                  <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                    {t('admin.discounts.status')}
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.discounts.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.allStatuses')}</SelectItem>
                      <SelectItem value="active" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.activeCodes')}</SelectItem>
                      <SelectItem value="inactive" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.inactiveCodes')}</SelectItem>
                      <SelectItem value="expiring_soon" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiringSoon')}</SelectItem>
                      <SelectItem value="expired" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiredCodes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter - Arabic: Fourth (Mobile) */}
                <div className="space-y-2 order-4 sm:order-1">
                  <label className={`text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 ${i18n.language === 'ar' ? 'text-left block' : 'text-left'}`}>
                    {t('admin.discounts.sortBy')}
                  </label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.discounts.sortBy')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="created_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.createdAt')}</SelectItem>
                      <SelectItem value="code" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.code')}</SelectItem>
                      <SelectItem value="usage_count" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.usageCount')}</SelectItem>
                      <SelectItem value="expires_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiresAt')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                {/* Search - English: First */}
                <div className="flex-1 space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.discounts.search')}
                  </label>
                  <div className="relative group">
                    <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 w-4 h-4 right-3" />
                    <Input
                      placeholder={t('admin.discounts.searchPlaceholder')}
                      value={search}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="text-left placeholder:text-left rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary w-full pr-10"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Type Filter - English: Second */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.discounts.type')}
                  </label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.discounts.filterByType')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.allTypes')}</SelectItem>
                      <SelectItem value="percentage" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.percentage')}</SelectItem>
                      <SelectItem value="fixed_amount" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.fixedAmount')}</SelectItem>
                      <SelectItem value="free_shipping" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.freeShipping')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter - English: Combined with Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.discounts.status')}
                  </label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={t('admin.discounts.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.allStatuses')}</SelectItem>
                      <SelectItem value="active" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.activeCodes')}</SelectItem>
                      <SelectItem value="inactive" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.inactiveCodes')}</SelectItem>
                      <SelectItem value="expiring_soon" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiringSoon')}</SelectItem>
                      <SelectItem value="expired" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiredCodes')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Filter - English: Combined with Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.discounts.sortBy')}
                  </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue placeholder={t('admin.discounts.sortBy')} />
                  </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="created_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.createdAt')}</SelectItem>
                      <SelectItem value="code" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.code')}</SelectItem>
                      <SelectItem value="usage_count" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.usageCount')}</SelectItem>
                      <SelectItem value="expires_at" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.discounts.expiresAt')}</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </>
            )}
          </div>
        </div>
              </div>
            </motion.div>

        {/* Bulk Actions */}
        {selectedDiscounts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="w-full"
              >
                <Card className="relative overflow-hidden bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg">
                  <CardContent className="p-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {i18n.language === 'ar' ? (
                        <>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowBulkActions(true)}
                              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                            >
                              <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 ms-2" />
                              <span className="font-semibold">{t('admin.discounts.bulkActions')}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDiscounts([])}
                              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                            >
                              <span className="font-semibold">{t('admin.discounts.clearSelection')}</span>
                            </Button>
                          </div>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            تم تحديد {selectedDiscounts.length} كود خصم
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {selectedDiscounts.length} discount codes selected
                          </span>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setShowBulkActions(true)}
                              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                            >
                              <MoreHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform duration-300 mr-2" />
                              <span className="font-semibold">{t('admin.discounts.bulkActions')}</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDiscounts([])}
                              className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                            >
                              <span className="font-semibold">{t('admin.discounts.clearSelection')}</span>
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
        )}

        {/* Discounts Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
        <Card className="mt-6 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative p-2">
            <CardTitle className="flex items-center justify-between">
              {i18n.language === 'ar' ? (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                    >
                      <span className="font-semibold">
                        {selectedDiscounts.length === discounts.length ? t('admin.discounts.deselectAll') : t('admin.discounts.selectAll')}
                      </span>
                    </Button>
                  </div>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    {t('admin.discounts.discountCodes')}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                    {t('admin.discounts.discountCodes')}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                    >
                      <span className="font-semibold">
                        {selectedDiscounts.length === discounts.length ? t('admin.discounts.deselectAll') : t('admin.discounts.selectAll')}
                      </span>
                    </Button>
                  </div>
                </>
              )}
            </CardTitle>
          </CardHeader>
                <CardContent className="relative p-2">
                  <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto w-full max-w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" style={{ maxWidth: '88vw' }}>
              <Table className={`w-full min-w-[780px] table-fixed lg:w-full lg:table-auto ${i18n.language === 'ar' ? 'pr-4' : ''}`}>
                      <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50">
                        <TableRow className="hover:bg-transparent">
                    {i18n.language === 'ar' ? (
                      <>
                    <TableHead className="w-12 text-center w-[50px] lg:w-auto">
                      <Checkbox
                        checked={selectedDiscounts.length === discounts.length && discounts.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                      />
                    </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[150px] lg:w-auto"
                          onClick={() => handleSort('code')}
                        >
                          {t('admin.discounts.code')}
                          {sortBy === 'code' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.discounts.type')}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.discounts.value')}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.discounts.usage')}</TableHead>
                        <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.discounts.status')}</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-muted/50 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto"
                          onClick={() => handleSort('expires_at')}
                        >
                          {t('admin.discounts.expiresAt')}
                          {sortBy === 'expires_at' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </TableHead>
                        <TableHead className="w-12 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[80px] lg:w-auto"></TableHead>
                      </>
                    ) : (
                      <>
                    <TableHead className="w-12 text-center w-[50px] lg:w-auto">
                      <Checkbox
                        checked={selectedDiscounts.length === discounts.length && discounts.length > 0}
                        onCheckedChange={handleSelectAll}
                        className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                      />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[150px] lg:w-auto"
                      onClick={() => handleSort('code')}
                    >
                      {t('admin.discounts.code')}
                      {sortBy === 'code' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.discounts.type')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.discounts.value')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.discounts.usage')}</TableHead>
                    <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.discounts.status')}</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-muted/50 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto"
                      onClick={() => handleSort('expires_at')}
                    >
                      {t('admin.discounts.expiresAt')}
                      {sortBy === 'expires_at' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </TableHead>
                    <TableHead className="w-12 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[80px] lg:w-auto"></TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                          <span className="ml-2">{t('common.loading')}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : discounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        {t('admin.discounts.noDiscounts')}
                      </TableCell>
                    </TableRow>
                  ) : (
                          discounts.map((discount, index) => {
                      const TypeIcon = getTypeIcon(discount.type);
                      return (
                              <TableRow 
                                key={discount.id}
                                className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 ${
                                  index % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30'
                                }`}
                              >
                          {i18n.language === 'ar' ? (
                            <>
                          <TableCell>
                            <Checkbox
                              checked={selectedDiscounts.includes(discount.id)}
                              onCheckedChange={() => handleSelectDiscount(discount.id)}
                              className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                            />
                          </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 text-center">
                                <div className="font-medium text-xs">{discount.code}</div>
                                {discount.description && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {discount.description}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <TypeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="capitalize text-xs">
                                    {t(`admin.discounts.types.${discount.type}`)}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 text-center">
                                <div className="font-medium text-xs">
                                  {discount.type === 'percentage' 
                                    ? `${discount.value}%`
                                    : `${discount.value} ${i18n.language === 'ar' ? 'د.ك' : t('common.currency')}`
                                  }
                                </div>
                                {discount.minimum_order_amount && (
                                  <div className="text-xs text-muted-foreground">
                                    {t('admin.discounts.minOrder')}: {discount.minimum_order_amount} {i18n.language === 'ar' ? 'د.ك' : t('common.currency')}
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 text-center">
                                <div className="space-y-1">
                                  <div className="text-xs">
                                    {discount.usage_count} / {discount.usage_limit || '∞'}
                                  </div>
                                  <Progress value={discount.usage_percentage} className="h-1" />
                                </div>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 text-center">
                                <Badge variant={getStatusBadgeVariant(discount)} className="text-xs px-1 py-0.5">
                                  {getStatusText(discount)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 text-center">
                                {discount.expires_at ? (
                                  <div className="text-xs">
                                    {new Date(discount.expires_at).toLocaleDateString()}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-xs">{t('admin.discounts.noExpiry')}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-xs sm:text-sm p-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDiscount(discount)}
                                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-2 h-10 w-10 rounded-xl"
                                  >
                                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDiscount(discount)}
                                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-2 h-10 w-10 rounded-xl"
                                  >
                                    <Copy className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                          <TableCell>
                            <Checkbox
                              checked={selectedDiscounts.includes(discount.id)}
                              onCheckedChange={() => handleSelectDiscount(discount.id)}
                              className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30"
                            />
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm p-2 text-center">
                            <div className="font-medium text-xs">{discount.code}</div>
                            {discount.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {discount.description}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm p-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <TypeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="capitalize text-xs">
                                {t(`admin.discounts.types.${discount.type}`)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm p-2 text-center">
                            <div className="font-medium text-xs">
                              {discount.type === 'percentage' 
                                ? `${discount.value}%`
                                    : `${discount.value} ${i18n.language === 'ar' ? 'د.ك' : t('common.currency')}`
                              }
                            </div>
                            {discount.minimum_order_amount && (
                              <div className="text-xs text-muted-foreground">
                                    {t('admin.discounts.minOrder')}: {discount.minimum_order_amount} {i18n.language === 'ar' ? 'د.ك' : t('common.currency')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm p-2 text-center">
                            <div className="space-y-1">
                              <div className="text-xs">
                                {discount.usage_count} / {discount.usage_limit || '∞'}
                              </div>
                              <Progress value={discount.usage_percentage} className="h-1" />
                            </div>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm p-2 text-center">
                            <Badge variant={getStatusBadgeVariant(discount)} className="text-xs px-1 py-0.5">
                              {getStatusText(discount)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm p-2 text-center">
                            {discount.expires_at ? (
                              <div className="text-xs">
                                {new Date(discount.expires_at).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">{t('admin.discounts.noExpiry')}</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm p-2 text-center">
                                <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDiscount(discount)}
                                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-2 h-10 w-10 rounded-xl"
                              >
                                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedDiscount(discount)}
                                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 p-2 h-10 w-10 rounded-xl"
                              >
                                    <Copy className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                              </Button>
                            </div>
                          </TableCell>
                            </>
                          )}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
                      <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                  {t('admin.discounts.showingResults', {
                    from: ((currentPage - 1) * perPage) + 1,
                    to: Math.min(currentPage * perPage, totalDiscounts),
                    total: totalDiscounts
                  })}
                </div>
                      <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                          className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                  >
                          <span className="font-semibold">{t('common.previous')}</span>
                  </Button>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    {t('common.pageOf', { page: currentPage, total: totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                          className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-3 sm:px-6 py-1 sm:py-2 shadow-md hover:shadow-lg"
                  >
                          <span className="font-semibold">{t('common.next')}</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </motion.div>

      {/* Modals */}
      {selectedDiscount && (
        <DiscountDetails
          discount={selectedDiscount}
          onClose={() => setSelectedDiscount(null)}
          onUpdate={() => {
            loadDiscounts();
            loadStatistics();
          }}
        />
      )}

      {showBulkActions && (
        <DiscountBulkActions
          selectedIds={selectedDiscounts}
          onClose={() => setShowBulkActions(false)}
          onSuccess={() => {
            setSelectedDiscounts([]);
            loadDiscounts();
            loadStatistics();
          }}
        />
      )}
    </div>
  );
};

export default AdminDiscounts;