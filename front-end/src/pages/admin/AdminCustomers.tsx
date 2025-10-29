import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { getAdminCustomers, Customer, CustomersSummary } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Loader2, Search, Users, TrendingUp, UserCheck, UserPlus, Eye, Phone, Mail, MapPin, Download, DollarSign, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import CustomerDetails from '@/components/admin/CustomerDetails';
import NewExportCustomers from '@/components/admin/exports/NewExportCustomers';

const AdminCustomers: React.FC = () => {
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

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<CustomersSummary | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showNewExportDialog, setShowNewExportDialog] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, [search, status, currentPage]);

  const fetchCustomers = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params: any = { page: currentPage, per_page: 15 };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;

      const response = await getAdminCustomers(token, params);
      if (response.success) {
        setCustomers(response.data.customers.data);
        setTotalPages(response.data.customers.last_page);
        setSummary(response.data.summary);
      }
    } catch (error) {
      toast.error(t('admin.customers.fetchError'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (customer: Customer) => {
    if (!customer.is_active) {
      return <Badge variant="destructive">{t('admin.customers.inactive')}</Badge>;
    }
    if (parseFloat(customer.total_spent) > 1000) {
      return <Badge className="bg-yellow-500">{t('admin.customers.vip')}</Badge>;
    }
    if (customer.total_orders === 0) {
      return <Badge variant="secondary">{t('admin.customers.new')}</Badge>;
    }
    return <Badge variant="default">{t('admin.customers.active')}</Badge>;
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetails(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-2 space-y-4 sm:space-y-6 mt-4 ">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-end w-full sm:w-auto order-1 sm:order-2"
            >
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.customers.title')}
              </h1>
            </motion.div>
            <div className="w-full sm:w-auto order-2 sm:order-1">
              <Button
                onClick={() => setShowNewExportDialog(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                <Download className="h-4 w-4 ml-2" />
                <span className="font-semibold">{t('admin.common.export')}</span>
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
                {t('admin.customers.title')}
              </h1>
            </motion.div>
            <div className="w-full sm:w-auto">
              <Button
                onClick={() => setShowNewExportDialog(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                <Download className="h-4 w-4 mr-2" />
                <span className="font-semibold">{t('admin.common.export')}</span>
              </Button>
            </div>
          </>
        )}
      </motion.div>

      {/* Analytics Cards */}
      {summary && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-7 w-7 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.totalCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.total_customers)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.totalCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.total_customers)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Users className="h-7 w-7 text-slate-600 group-hover:text-slate-700 transition-colors duration-300" />
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
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserCheck className="h-7 w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.activeCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.active_customers)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.activeCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.active_customers)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserCheck className="h-7 w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
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
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-7 w-7 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.vipCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.vip_customers)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.vipCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.vip_customers)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingUp className="h-7 w-7 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
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
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserPlus className="h-7 w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.newCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.new_customers)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {t('admin.customers.newCustomers')}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.new_customers)}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <UserPlus className="h-7 w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Total Revenue Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-3">
                  {i18n.language === 'ar' ? (
                    <>
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-7 w-7 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(Number(summary.total_revenue).toFixed(1))} {getLocalizedCurrency('KWD')}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(Number(summary.total_revenue).toFixed(1))} {getLocalizedCurrency('KWD')}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-7 w-7 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                      </div>
                    </>
                  )}
                </div>
            </CardContent>
          </Card>
          </motion.div>

          {/* Average Customer Value Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.6 }}
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
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingDown className="h-7 w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'متوسط قيمة العميل' : 'Avg Customer Value'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.average_customer_value.toFixed(1))} {getLocalizedCurrency('KWD')}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                          {isRTL ? 'متوسط قيمة العميل' : 'Avg Customer Value'}
                        </p>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {toArabicNumerals(summary.average_customer_value.toFixed(1))} {getLocalizedCurrency('KWD')}
                        </div>
                      </div>
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TrendingDown className="h-7 w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
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
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardContent className="relative pt-2 p-2">
            <div className="flex flex-col md:flex-row gap-6">
            {i18n.language === 'ar' ? (
              <>
                {/* Search - Arabic: First (Mobile) */}
                <div className="flex-1 space-y-2 order-1 md:order-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.customers.search')}
                  </label>
                  <div className="relative group">
                    <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 h-4 w-4 left-3" />
                  <Input
                    placeholder={t('admin.customers.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter - Arabic: Second (Mobile) */}
                <div className="space-y-2 order-2 md:order-1">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.customers.status')}
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full md:w-[200px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.allStatuses')}</SelectItem>
                      <SelectItem value="active" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.active')}</SelectItem>
                      <SelectItem value="inactive" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.inactive')}</SelectItem>
                      <SelectItem value="vip" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.vip')}</SelectItem>
                      <SelectItem value="new" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.new')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                {/* Search - English: First */}
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.customers.search')}
                  </label>
                  <div className="relative group">
                    <Search className="absolute top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors duration-300 h-4 w-4 right-3" />
                  <Input
                    placeholder={t('admin.customers.search')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                      className="w-full rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary pr-10"
                  />
                  </div>
                </div>

                {/* Status Filter - English: Last */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {t('admin.customers.status')}
                  </label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="w-full md:w-[200px] rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.allStatuses')}</SelectItem>
                      <SelectItem value="active" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.active')}</SelectItem>
                      <SelectItem value="inactive" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.inactive')}</SelectItem>
                      <SelectItem value="vip" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.vip')}</SelectItem>
                      <SelectItem value="new" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.customers.new')}</SelectItem>
                  </SelectContent>
                </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative p-2 pb-2">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {t('admin.customers.customersList')}
            </CardTitle>
        </CardHeader>
          <CardContent className="relative p-2">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {t('admin.customers.noCustomers')}
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200/50 dark:border-slate-700/50 overflow-x-auto w-full max-w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm" style={{ maxWidth: '92vw' }}>
                <Table className="w-full min-w-[780px] table-fixed lg:w-full lg:table-auto">
                   <TableHeader className="bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50">
                     <TableRow className="hover:bg-transparent">
                       <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[150px] lg:w-auto">{t('admin.customers.name')}</TableHead>
                       <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.customers.contact')}</TableHead>
                       <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.customers.orders')}</TableHead>
                       <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[120px] lg:w-auto">{t('admin.customers.totalSpent')}</TableHead>
                       <TableHead className="font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[100px] lg:w-auto">{t('admin.customers.status')}</TableHead>
                       <TableHead className="w-12 font-semibold text-xs sm:text-sm whitespace-nowrap text-center w-[80px] lg:w-auto">{t('admin.common.actions')}</TableHead>
                     </TableRow>
                   </TableHeader>
                  <TableBody>
                    {customers.map((customer, index) => (
                       <TableRow 
                         key={customer.id}
                         className={`group hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50 transition-all duration-300 ${
                           index % 2 === 0 ? 'bg-white/30 dark:bg-slate-800/30' : 'bg-slate-50/30 dark:bg-slate-700/30'
                         }`}
                       >
                         <TableCell className="text-center text-xs sm:text-sm p-2 sm:p-4 w-[150px] lg:w-auto">
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {customer.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm p-2 sm:p-4 w-[120px] lg:w-auto">
                          <div className="flex flex-col gap-1 text-xs sm:text-sm">
                            <div className="flex items-center justify-center gap-2">
                              <Phone className="h-3 w-3" />
                              <span>{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{customer.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm p-2 sm:p-4 w-[100px] lg:w-auto">{customer.total_orders}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm p-2 sm:p-4 w-[120px] lg:w-auto">
                          {toArabicNumerals(customer.total_spent)} {getLocalizedCurrency(customer.currency)}
                        </TableCell>
                        <TableCell className="text-center text-xs sm:text-sm p-2 sm:p-4 w-[100px] lg:w-auto">{getStatusBadge(customer)}</TableCell>
                        <TableCell className="text-center text-xs sm:text-sm p-2 sm:p-4 w-[80px] lg:w-auto">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 h-8 w-8 p-0 rounded-xl"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                  >
                    <span className="font-semibold">{t('admin.common.previous')}</span>
                  </Button>
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    {t('admin.common.page')} {currentPage} {t('admin.common.of')} {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                  >
                    <span className="font-semibold">{t('admin.common.next')}</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Customer Details Dialog */}
      <Dialog open={showCustomerDetails} onOpenChange={setShowCustomerDetails}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/30 dark:shadow-slate-900/30 rounded-2xl">
          <DialogHeader className="p-2 pb-2">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {t('admin.customers.customerDetails')}
            </DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="px-2 pb-2">
              <CustomerDetails 
                customer={selectedCustomer} 
                onClose={() => setShowCustomerDetails(false)}
                onUpdate={() => {
                  setShowCustomerDetails(false);
                  fetchCustomers();
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Export Dialog */}
      <NewExportCustomers
        open={showNewExportDialog}
        onOpenChange={setShowNewExportDialog}
      />
    </div>
  );
};

export default AdminCustomers;