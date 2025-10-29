import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  RotateCcw, 
  Settings, 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Filter,
  Eye,
  EyeOff,
  ArrowLeft,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  PaymentMethod,
  getPaymentMethods,
  togglePaymentMethod,
  syncPaymentMethods,
  handlePaymentMethodError
} from '@/lib/paymentMethodsApi';

const AdminPaymentMethods = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  // State management
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    method: PaymentMethod | null;
    action: 'enable' | 'disable';
  }>({ open: false, method: null, action: 'enable' });

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await getPaymentMethods(token);
      if (response.success) {
        // API returns a keyed object; convert to array for state
        setPaymentMethods(Object.values(response.data));
      } else {
        toast.error(t('admin.paymentMethods.fetchError'));
      }
    } catch (error) {
      const errorMessage = handlePaymentMethodError(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sync payment methods from MyFatoorah
  const handleSyncPaymentMethods = async () => {
    if (!token) return;
    
    try {
      setSyncing(true);
      const response = await syncPaymentMethods(token);
      if (response.success) {
        toast.success(t('admin.paymentMethods.syncSuccess'));
        await fetchPaymentMethods(); // Refresh the list
      } else {
        toast.error(t('admin.paymentMethods.syncError'));
      }
    } catch (error) {
      const errorMessage = handlePaymentMethodError(error);
      toast.error(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  // Toggle payment method status
  const handleTogglePaymentMethod = async (method: PaymentMethod) => {
    if (!token) return;
    
    try {
      const response = await togglePaymentMethod(token, method.PaymentMethodCode);
      if (response.success) {
        toast.success(t('admin.paymentMethods.toggleSuccess'));
        await fetchPaymentMethods(); // Refresh the list
      } else {
        toast.error(t('admin.paymentMethods.toggleError'));
      }
    } catch (error) {
      const errorMessage = handlePaymentMethodError(error);
      toast.error(errorMessage);
    }
  };

  // Handle confirmation dialog
  const handleConfirmToggle = () => {
    if (confirmDialog.method) {
      handleTogglePaymentMethod(confirmDialog.method);
      setConfirmDialog({ open: false, method: null, action: 'enable' });
    }
  };

  // Filter payment methods
  const filteredMethods = paymentMethods.filter(method => {
    const matchesSearch = method.PaymentMethodEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         method.PaymentMethodAr.includes(searchTerm) ||
                         method.PaymentMethodCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'enabled' && method.is_enabled) ||
      (filterStatus === 'disabled' && !method.is_enabled);
    
    return matchesSearch && matchesFilter;
  });

  // Statistics
  const stats = {
    total: paymentMethods.length,
    active: paymentMethods.filter(m => m.is_enabled).length,
    inactive: paymentMethods.filter(m => !m.is_enabled).length,
  };

  useEffect(() => {
    if (token) {
      fetchPaymentMethods();
    }
  }, [token]);

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
              <div className="flex items-center gap-3 mb-4">
                <Link to="/admin/settings">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-xl hover:scale-105 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    العودة للإعدادات
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                طرق الدفع
              </h1>
            
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full lg:w-auto order-2 sm:order-1"
            >
              {/* Refresh Button */}
              <Button
                onClick={fetchPaymentMethods}
                disabled={loading}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ms-3 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">تحديث</span>
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
              <div className="flex items-center gap-3 mb-4">
                <Link to="/admin/settings">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 rounded-xl hover:scale-105 transition-all duration-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md font-medium"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Settings
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Payment Methods
              </h1>
          
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3 w-full lg:w-auto"
            >
              {/* Refresh Button */}
              <Button
                onClick={fetchPaymentMethods}
                disabled={loading}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 me-3 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Refresh</span>
              </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Statistics Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
      >
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
            
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                {!isRTL && (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                )}
                <div className="flex-1">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {stats.total}
                  </p>
                   <p className={`text-sm text-slate-600 dark:text-slate-400 flex items-center ${
                     isRTL ? 'text-right justify-end' : 'text-left'
                  }`}>
                     {i18n.language === 'ar' ? 'إجمالي طرق الدفع المتاحة' : 'Total Available Payment Methods'}
                  </p>
                </div>
                {isRTL && (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
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
            
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                {!isRTL && (
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                )}
                <div className="flex-1">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {stats.active}
                  </p>
                   <p className={`text-sm text-slate-600 dark:text-slate-400 flex items-center ${
                     isRTL ? 'text-right justify-end' : 'text-left'
                  }`}>
                     {i18n.language === 'ar' ? 'طرق الدفع المفعلة' : 'Enabled Payment Methods'}
                  </p>
                </div>
                {isRTL && (
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
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
          className="group col-span-2 md:col-span-1"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-red-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
            
            <CardContent className="relative p-6">
              <div className="flex items-center gap-4">
                {!isRTL && (
                <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                </div>
                )}
                <div className="flex-1">
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                    {stats.inactive}
                  </p>
                   <p className={`text-sm text-slate-600 dark:text-slate-400 flex items-center ${
                     isRTL ? 'text-right justify-end' : 'text-left'
                  }`}>
                     {i18n.language === 'ar' ? 'طرق الدفع المعطلة' : 'Disabled Payment Methods'}
                  </p>
                </div>
                {isRTL && (
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <XCircle className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-900/20 dark:to-slate-800/10 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/30 shadow-sm">
          <div className={`flex flex-col lg:flex-row gap-6 items-start lg:items-center ${
            isRTL ? 'justify-between' : 'justify-between'
          }`}>
            {isRTL ? (
              <>
                {/* Arabic Layout: Mobile - Search at top, Sync Button and Filter below */}
                <div className="flex flex-col lg:flex-row gap-4 w-full">
                  {/* Mobile: Search Input at the top */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="relative w-full lg:hidden"
                  >
                    <div className="relative">
                      <Search className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 right-4" />
                      <Input
                        placeholder="البحث في طرق الدفع..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-12 h-10 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 text-base"
                      />
                    </div>
                  </motion.div>

                  {/* Mobile: Filter Dropdown */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="w-full lg:hidden"
                  >
                    <Select value={filterStatus} onValueChange={(value: 'all' | 'enabled' | 'disabled') => setFilterStatus(value)}>
                      <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="فلترة طرق الدفع" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            الكل
                          </div>
                        </SelectItem>
                        <SelectItem value="enabled" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            نشطة
                          </div>
                        </SelectItem>
                        <SelectItem value="disabled" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            غير نشطة
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Mobile: Sync Button */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="w-full lg:hidden"
                  >
                    <Button
                      onClick={handleSyncPaymentMethods}
                      disabled={syncing}
                      className="group relative overflow-hidden gap-3 rounded-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 shadow-xl hover:shadow-2xl text-white font-bold px-6 py-2 w-full border border-emerald-400/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <RotateCcw className={`w-5 h-5 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                        <span className="text-sm font-bold tracking-wide">
                          {syncing ? 'جاري المزامنة...' : 'مزامنة من MyFatoorah'}
                        </span>
                      </div>
                    </Button>
                  </motion.div>

                  {/* Desktop Layout: Sync Button on far left */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="hidden lg:flex gap-3"
                >
                  <Button
                    onClick={handleSyncPaymentMethods}
                    disabled={syncing}
                    className="group relative overflow-hidden gap-3 rounded-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 shadow-xl hover:shadow-2xl text-white font-bold px-8 py-4 min-w-[220px] border border-emerald-400/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <RotateCcw className={`w-5 h-5 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                      <span className="text-base font-bold tracking-wide">
                        {syncing ? 'جاري المزامنة...' : 'مزامنة من MyFatoorah'}
                      </span>
                    </div>
                  </Button>
                </motion.div>

                  {/* Desktop: Search and Filter on the right */}
                  <div className="hidden lg:flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto justify-end">
                  {/* Filter Dropdown */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="min-w-[180px]"
                  >
                    <Select value={filterStatus} onValueChange={(value: 'all' | 'enabled' | 'disabled') => setFilterStatus(value)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="فلترة طرق الدفع" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            الكل
                          </div>
                        </SelectItem>
                        <SelectItem value="enabled" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            نشطة
                          </div>
                        </SelectItem>
                        <SelectItem value="disabled" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            غير نشطة
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>

                  {/* Search Input */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    className="relative flex-1 max-w-md"
                  >
                    <div className="relative">
                      <Search className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 right-4" />
                      <Input
                        placeholder="البحث في طرق الدفع..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-12 h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 text-base"
                      />
                    </div>
                  </motion.div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* English Layout: Mobile - Search and Filter in same row, Sync Button below */}
                <div className="flex flex-col lg:flex-row gap-4 w-full">
                  {/* Mobile: Search and Filter in same row */}
                  <div className="flex flex-col sm:flex-row gap-4 lg:hidden">
                    {/* Search Input */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.6 }}
                      className="relative flex-1"
                    >
                      <div className="relative">
                        <Search className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 left-4" />
                        <Input
                          placeholder="Search payment methods..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-12 h-10 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 text-base"
                        />
                      </div>
                    </motion.div>
                    
                    {/* Filter Dropdown */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.0, duration: 0.6 }}
                      className="min-w-[140px]"
                    >
                      <Select value={filterStatus} onValueChange={(value: 'all' | 'enabled' | 'disabled') => setFilterStatus(value)}>
                        <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                          <SelectValue placeholder="Filter payment methods" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                              All
                            </div>
                          </SelectItem>
                          <SelectItem value="enabled" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              Active
                            </div>
                          </SelectItem>
                          <SelectItem value="disabled" className="rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              Inactive
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>

                  {/* Mobile: Sync Button on its own row */}
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1, duration: 0.6 }}
                    className="w-full lg:hidden"
                  >
                    <Button
                      onClick={handleSyncPaymentMethods}
                      disabled={syncing}
                      className="group relative overflow-hidden gap-3 rounded-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 shadow-xl hover:shadow-2xl text-white font-bold px-6 py-2 w-full border border-emerald-400/30"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <span className="text-sm font-bold tracking-wide">
                          {syncing ? 'Syncing...' : 'Sync from MyFatoorah'}
                        </span>
                        <RotateCcw className={`w-5 h-5 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                      </div>
                    </Button>
                  </motion.div>

                  {/* Desktop Layout: Search and Filter on left */}
                  <div className="hidden lg:flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
              {/* Search Input */}
              <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="relative flex-1 max-w-md"
              >
                <div className="relative">
                      <Search className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 left-4" />
                  <Input
                        placeholder="Search payment methods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 text-base"
                  />
                </div>
              </motion.div>
              
                  {/* Filter Dropdown */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
                    className="min-w-[180px]"
                  >
                    <Select value={filterStatus} onValueChange={(value: 'all' | 'enabled' | 'disabled') => setFilterStatus(value)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                        <SelectValue placeholder="Filter payment methods" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                            All
                          </div>
                        </SelectItem>
                        <SelectItem value="enabled" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="disabled" className="rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            Inactive
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
              </motion.div>
            </div>

                  {/* Desktop: Sync Button on right */}
            <motion.div 
                  initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
                    className="hidden lg:flex gap-3"
            >
              <Button
                onClick={handleSyncPaymentMethods}
                disabled={syncing}
                    className="group relative overflow-hidden gap-3 rounded-2xl hover:scale-105 transition-all duration-300 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 shadow-xl hover:shadow-2xl text-white font-bold px-8 py-4 min-w-[220px] border border-emerald-400/30"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-3">
                      <span className="text-base font-bold tracking-wide">
                        {syncing ? 'Syncing...' : 'Sync from MyFatoorah'}
                      </span>
                      <RotateCcw className={`w-5 h-5 ${syncing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-500`} />
                    </div>
              </Button>
            </motion.div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Payment Methods Grid */}
      {loading ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center justify-center py-12"
        >
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {i18n.language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
            </p>
          </div>
        </motion.div>
      ) : filteredMethods.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl">
            <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
            
            <CardContent className="relative p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                {i18n.language === 'ar' ? 'لا توجد طرق دفع' : 'No Payment Methods'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {i18n.language === 'ar' ? 'لم يتم العثور على طرق دفع. قم بمزامنة طرق الدفع من MyFatoorah.' : 'No payment methods found. Sync payment methods from MyFatoorah.'}
              </p>
              <Button 
                onClick={handleSyncPaymentMethods} 
                disabled={syncing} 
                className="gap-2 rounded-lg hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              >
                <RotateCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {i18n.language === 'ar' ? 'مزامنة من MyFatoorah' : 'Sync from MyFatoorah'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
        >
          {filteredMethods.map((method, index) => (
            <motion.div
              key={method.PaymentMethodId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className={`relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 ${
                method.is_enabled 
                  ? 'bg-gradient-to-br from-green-50/50 to-green-100/30 dark:from-green-900/10 dark:to-green-800/5 border-green-200/50 dark:border-green-800/30' 
                  : 'bg-gradient-to-br from-red-50/50 to-red-100/30 dark:from-red-900/10 dark:to-red-800/5 border-red-200/50 dark:border-red-800/30'
              }`}>
                <div className={`absolute top-0 right-0 w-20 h-20 ${
                  method.is_enabled ? 'bg-green-500/10' : 'bg-red-500/10'
                } rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300`}></div>
                <div className={`absolute bottom-0 left-0 w-16 h-16 ${
                  method.is_enabled ? 'bg-green-400/5' : 'bg-red-400/5'
                } rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300`}></div>
                
                <CardHeader className="relative pb-4">
                  <div className={`flex items-start justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    {!isRTL && (
                    <div className="flex items-center gap-3">
                      {method.ImageUrl ? (
                        <img
                          src={method.ImageUrl}
                            alt={method.PaymentMethodEn}
                          className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <CreditCard className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                      <div>
                          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 text-left">
                            {method.PaymentMethodEn}
                        </CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {method.PaymentMethodCode}
                        </p>
                      </div>
                    </div>
                    )}
                    
                    <Badge 
                      variant={method.is_enabled ? 'default' : 'secondary'}
                      className={`${
                        method.is_enabled 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      } rounded-lg shadow-sm`}
                    >
                      {method.is_enabled 
                        ? (i18n.language === 'ar' ? 'نشط' : 'Active')
                        : (i18n.language === 'ar' ? 'غير نشط' : 'Inactive')
                      }
                    </Badge>

                    {isRTL && (
                      <div className="flex items-center gap-3 flex-row-reverse">
                        <div>
                          <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1 text-right">
                            {method.PaymentMethodAr}
                          </CardTitle>
                          <p className="text-sm text-slate-500 dark:text-slate-400 text-right">
                            {method.PaymentMethodCode}
                          </p>
                        </div>
                        {method.ImageUrl ? (
                          <img
                            src={method.ImageUrl}
                            alt={method.PaymentMethodAr}
                            className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-slate-200 shadow-lg group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <CreditCard className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="relative space-y-4">
                  {/* Method Details */}
                  <div className="space-y-2 text-sm">
                    {isRTL ? (
                      <>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {method.ServiceCharge}%
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            رسوم الخدمة:
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {method.IsDirectPayment ? 'نعم' : 'لا'}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            دفع مباشر:
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {method.CurrencyIso}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            العملة:
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Service Fee:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {method.ServiceCharge}%
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Direct Payment:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {method.IsDirectPayment ? 'Yes' : 'No'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">
                            Currency:
                          </span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {method.CurrencyIso}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Toggle Switch */}
                  {isRTL ? (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700 flex-row-reverse">
                      <Switch
                        checked={method.is_enabled}
                        onCheckedChange={() => {
                          setConfirmDialog({
                            open: true,
                            method,
                            action: method.is_enabled ? 'disable' : 'enable'
                          });
                        }}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700 rounded-full transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2"
                      />
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {method.is_enabled ? 'نشط' : 'غير نشط'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {method.is_enabled ? 'Active' : 'Inactive'}
                      </span>
                      <Switch
                        checked={method.is_enabled}
                        onCheckedChange={() => {
                          setConfirmDialog({
                            open: true,
                            method,
                            action: method.is_enabled ? 'disable' : 'enable'
                          });
                        }}
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700 rounded-full transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-green-500/20 focus:ring-offset-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => 
        setConfirmDialog({ ...confirmDialog, open })
      }>
        <AlertDialogContent className="relative overflow-hidden rounded-3xl border-0 shadow-2xl bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 backdrop-blur-xl w-full max-w-sm mx-auto" style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          height: 'auto',
          maxHeight: '80vh'
        }}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          <AlertDialogHeader className="relative pb-6">
            {isRTL ? (
              <div className="flex items-center gap-4 mb-4 justify-end">
                <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 text-right">
                  {confirmDialog.action === 'enable' ? 'تأكيد التفعيل' : 'تأكيد الإلغاء'}
                </AlertDialogTitle>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  confirmDialog.action === 'enable' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {confirmDialog.action === 'enable' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  confirmDialog.action === 'enable' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-red-100 dark:bg-red-900/30'
                }`}>
                  {confirmDialog.action === 'enable' ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 text-left">
                  {confirmDialog.action === 'enable' ? 'Confirm Enable' : 'Confirm Disable'}
                </AlertDialogTitle>
              </div>
            )}
            
            <AlertDialogDescription className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {confirmDialog.method && (
                <div className="space-y-3">
                  <p>
                    {confirmDialog.action === 'enable' 
                      ? (isRTL ? 'هل أنت متأكد من تفعيل' : 'Are you sure you want to enable') + ' '
                      : (isRTL ? 'هل أنت متأكد من إلغاء تفعيل' : 'Are you sure you want to disable') + ' '
                    }
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      "{isRTL ? confirmDialog.method.PaymentMethodAr : confirmDialog.method.PaymentMethodEn}"
                    </span>
                    ؟
                  </p>
                  
                  {/* Payment method details */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-3">
                      {confirmDialog.method.ImageUrl ? (
                        <img
                          src={confirmDialog.method.ImageUrl}
                          alt={isRTL ? confirmDialog.method.PaymentMethodAr : confirmDialog.method.PaymentMethodEn}
                          className="w-8 h-8 rounded-lg object-contain bg-white p-1 border border-slate-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-slate-500" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {isRTL ? confirmDialog.method.PaymentMethodAr : confirmDialog.method.PaymentMethodEn}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {confirmDialog.method.PaymentMethodCode}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        confirmDialog.method.is_enabled ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {confirmDialog.method.is_enabled 
                          ? (isRTL ? 'حالياً نشط' : 'Currently Active')
                          : (isRTL ? 'حالياً غير نشط' : 'Currently Inactive')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="relative flex gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 font-medium px-6 py-3">
              {i18n.language === 'ar' ? 'إلغاء' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmToggle}
              className={`rounded-2xl font-medium px-6 py-3 transition-all duration-200 ${
                confirmDialog.action === 'enable'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {confirmDialog.action === 'enable' 
                ? (i18n.language === 'ar' ? 'تفعيل' : 'Enable')
                : (i18n.language === 'ar' ? 'إلغاء التفعيل' : 'Disable')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPaymentMethods;