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
import { useRTL } from '@/hooks/useRTL';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Eye, 
  Users, 
  Globe, 
  Smartphone, 
  Monitor, 
  Clock, 
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  UserCheck,
  Share2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { 
  analyticsService,
  GeneralStats, 
  RealTimeStats, 
  DeviceStats,
  AnalyticsFilters 
} from '@/services/analyticsService';
import SocialVisitsAnalytics from '@/components/admin/SocialVisitsAnalytics';

const AdminVisitAnalytics: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeStats | null>(null);
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    limit: 10
  });

  // Fetch data functions
  const fetchGeneralStats = async () => {
    try {
      const data = await analyticsService.getGeneralStats(filters);
      setGeneralStats(data);
    } catch (error) {
      console.error('Error fetching general stats:', error);
    }
  };

  const fetchRealTimeStats = async () => {
    try {
      const data = await analyticsService.getRealTimeStats();
      setRealTimeStats(data);
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
    }
  };

  const fetchDeviceStats = async () => {
    try {
      const data = await analyticsService.getDeviceStats(filters);
      setDeviceStats(data);
    } catch (error) {
      console.error('Error fetching device stats:', error);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [general, realTime, devices] = await Promise.all([
        analyticsService.getGeneralStats(filters),
        analyticsService.getRealTimeStats(),
        analyticsService.getDeviceStats(filters)
      ]);

      setGeneralStats(general);
      setRealTimeStats(realTime);
      setDeviceStats(devices);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  const handleFilterChange = (key: keyof AnalyticsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar-SA' : 'en-US').format(num);
  };

  // Enhanced URL handling functions
  const truncateUrl = (url: string, maxLength: number = 40) => {
    if (url.length <= maxLength) return url;
    const start = url.substring(0, Math.floor(maxLength * 0.6));
    const end = url.substring(url.length - Math.floor(maxLength * 0.3));
    return `${start}...${end}`;
  };

  // Mobile-specific URL truncation
  const truncateUrlMobile = (url: string) => {
    if (window.innerWidth < 640) { // sm breakpoint
      return truncateUrl(url, 20);
    }
    return truncateUrl(url, 40);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(text);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openUrl = (url: string) => {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${window.location.host}${url}`;
    window.open(fullUrl, '_blank', 'noopener,noreferrer');
  };

  // Enhanced URL component
  const UrlDisplay: React.FC<{ url: string; className?: string }> = ({ url, className = "" }) => (
    <TooltipProvider>
      <div className={`flex items-center gap-1 sm:gap-2 min-w-0 ${className}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => openUrl(url)}
              className="flex-1 min-w-0 text-right hover:text-primary transition-colors duration-200 group"
            >
              <span className="block truncate font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary text-xs sm:text-sm">
                {truncateUrlMobile(url)}
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs break-all">
            <p className="text-sm">{url}</p>
          </TooltipContent>
        </Tooltip>
        
        <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(url)}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copiedUrl === url ? (
                  <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600" />
                ) : (
                  <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copiedUrl === url ? t('admin.analytics.copied', 'تم النسخ!') : t('admin.analytics.copyLink', 'نسخ الرابط')}</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openUrl(url)}
                className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('admin.analytics.openLink', 'فتح الرابط')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className={`container mx-auto p-1 sm:p-4 lg:p-6 space-y-3 sm:space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4"
      >
        {isRTL ? (
          <>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-right order-1 sm:order-2"
            >
              <h1 className="text-xl sm:text-2xl pb-2 lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.analytics.title', 'إحصائيات الزيارات')}
              </h1>
        
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <Button 
                onClick={fetchAllData} 
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl flex-1 sm:flex-none"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ml-2 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold text-sm sm:text-base">{t('admin.analytics.refresh', 'تحديث')}</span>
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-left order-1 sm:order-1"
            >
              <h1 className="text-xl sm:text-2xl pb-2 lg:text-3xl xl:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.analytics.title', 'Visit Analytics')}
              </h1>
          
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex gap-2 w-full sm:w-auto order-2 sm:order-2"
            >
              <Button 
                onClick={fetchAllData} 
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl flex-1 sm:flex-none"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold text-sm sm:text-base">{t('admin.analytics.refresh', 'Refresh')}</span>
          </Button>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-slate-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-slate-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8"></div>
          
          <CardHeader className="relative p-3 sm:p-6">
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent  ${
                     isRTL ? 'text-right justify-end' : 'text-left'
                   }`}>
              {isRTL ? (
                <>
                  {t('admin.analytics.filters', 'الفلاتر')}
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                  </div>
                  {t('admin.analytics.filters', 'الفلاتر')}
                </>
              )}
            </CardTitle>
        </CardHeader>
          
          <CardContent className="relative p-3 sm:p-6 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.analytics.startDate', 'تاريخ البداية')}
                </Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className={`rounded-lg sm:rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${!isRTL ? 'date-input-english' : ''}`}
              />
            </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t('admin.analytics.endDate', 'تاريخ النهاية')}
                </Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className={`rounded-lg sm:rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm ${!isRTL ? 'date-input-english' : ''}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl">
            <TabsTrigger 
              value="overview" 
              className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary data-[state=active]:rounded-2xl font-semibold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
            >
              {t('admin.analytics.tabs.overview', 'نظرة عامة')}
            </TabsTrigger>
            <TabsTrigger 
              value="realtime" 
              className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary data-[state=active]:rounded-2xl font-semibold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
            >
              {t('admin.analytics.tabs.realtime', 'الوقت الفعلي')}
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary data-[state=active]:rounded-2xl font-semibold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
            >
              {t('admin.analytics.tabs.social', 'مصادر الزيارات')}
            </TabsTrigger>
            <TabsTrigger 
              value="devices" 
              className="rounded-lg sm:rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-primary data-[state=active]:rounded-2xl font-semibold transition-all duration-300 text-xs sm:text-sm px-2 sm:px-4 py-2"
            >
              {t('admin.analytics.tabs.devices', 'الأجهزة')}
            </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {generalStats && (
            <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      <CardContent className="p-2 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                          <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Users className="h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('admin.analytics.totalVisits', 'إجمالي الزيارات')}
                            </p>
                            <div className="text-sm sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 truncate">
                              {formatNumber(generalStats.total_visits)}
                            </div>
                          </div>
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
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-green-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      <CardContent className="p-2 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                          <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <UserCheck className="h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('admin.analytics.uniqueVisitors', 'الزوار الفريدون')}
                            </p>
                            <div className="text-sm sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 truncate">
                              {formatNumber(generalStats.unique_visitors)}
                            </div>
                          </div>
                        </div>
                  </CardContent>
                </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-purple-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-purple-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      <CardContent className="p-2 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                          <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Eye className="h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('admin.analytics.pageViews', 'مشاهدات الصفحات')}
                            </p>
                            <div className="text-sm sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 truncate">
                              {formatNumber(generalStats.popular_pages.reduce((sum, page) => sum + page.visits, 0))}
                            </div>
                          </div>
                        </div>
                  </CardContent>
                </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-orange-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-orange-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      <CardContent className="p-2 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                          <div className="w-6 h-6 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Clock className="h-3 w-3 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('admin.analytics.avgSessionDuration', 'متوسط مدة الجلسة')}
                            </p>
                            <div className="text-sm sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 truncate">
                      {generalStats.daily_visits.length > 0 
                        ? Math.round(generalStats.daily_visits.reduce((sum, day) => sum + day.visits, 0) / generalStats.daily_visits.length / 60)
                        : 0}{isRTL ? 'م.ث' : 'm.s'}
                            </div>
                          </div>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>
                </motion.div>

              {/* Top Pages */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-slate-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-slate-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8"></div>
                    
                    <CardHeader className="relative p-3 sm:p-6">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        {isRTL ? (
                          <>
                            {t('admin.analytics.topPages', 'أهم الصفحات')}
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            </div>
                            {t('admin.analytics.topPages', 'أهم الصفحات')}
                          </>
                        )}
                      </CardTitle>
                </CardHeader>
                    
                    <CardContent className="relative p-2 sm:p-6 pt-0">
                      <div className="space-y-1.5 sm:space-y-3">
                    {generalStats.popular_pages.map((page, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.2 + index * 0.1, duration: 0.6 }}
                            className="flex items-center justify-between p-1.5 sm:p-3 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-lg sm:rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] gap-1 sm:gap-3"
                          >
                            <div className="flex items-center gap-1 sm:gap-3 min-w-0 flex-1">
                              <Badge 
                                variant="outline" 
                                className="bg-gradient-to-r from-primary/20 to-primary/30 text-primary font-semibold border-primary/30 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-xl text-xs flex-shrink-0"
                              >
                                {index + 1}
                              </Badge>
                              <UrlDisplay url={page.page_url} className="flex-1 min-w-0" />
                        </div>
                            <div className={`text-xs font-semibold text-slate-600 dark:text-slate-400 flex-shrink-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                              {formatNumber(page.visits)} {t('admin.analytics.visits', 'زيارة')}
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

        {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {realTimeStats && (
            <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-green-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-green-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      <CardContent className="p-2 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('admin.analytics.activeUsers', 'المستخدمون النشطون')}
                            </p>
                            <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300 truncate">
                      {formatNumber(realTimeStats.unique_visitors_24h)}
                            </div>
                          </div>
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
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      <CardContent className="p-2 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('admin.analytics.currentPageViews', 'مشاهدات الصفحات الحالية')}
                            </p>
                            <div className="text-sm sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 truncate">
                      {formatNumber(realTimeStats.total_visits_24h)}
                            </div>
                          </div>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-orange-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-orange-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      <CardContent className="p-2 sm:p-4 lg:p-6">
                        <div className="flex items-center justify-between mb-1 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                          </div>
                          <div className={`${isRTL ? 'text-right' : 'text-left'} flex-1 min-w-0`}>
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                              {t('admin.analytics.bounceRate', 'معدل الارتداد')}
                            </p>
                            <div className="text-sm sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 truncate">
                      {((generalStats?.visits_by_referer_type.direct / (generalStats?.total_visits || 1)) * 100).toFixed(1)}%
                            </div>
                          </div>
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>
                </motion.div>

              {/* Recent Visits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-slate-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-slate-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8"></div>
                    
                    <CardHeader className="relative p-3 sm:p-6">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        {isRTL ? (
                          <>
                            {t('admin.analytics.topPages24h', 'أهم الصفحات خلال 24 ساعة')}
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                            </div>
                            {t('admin.analytics.topPages24h', 'أهم الصفحات خلال 24 ساعة')}
                          </>
                        )}
                      </CardTitle>
                </CardHeader>
                    
                    <CardContent className="relative p-3 sm:p-6 pt-0">
                      <div className="space-y-2 sm:space-y-3">
                    {realTimeStats.top_pages_24h.map((page, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.1 + index * 0.1, duration: 0.6 }}
                            className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-lg sm:rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] gap-2 sm:gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <UrlDisplay url={page.page_url} />
                              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                {page.page_title || t('admin.analytics.noTitle', 'بدون عنوان')}
                          </div>
                        </div>
                            <div className={`${isRTL ? 'text-right ml-3' : 'text-left mr-3'} flex-shrink-0`}>
                              <div className={`text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {formatNumber(page.visits)} {t('admin.analytics.visits', 'زيارة')}
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

        {/* Social Visits Tab */}
          <TabsContent value="social" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <SocialVisitsAnalytics />
        </TabsContent>

        {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {deviceStats && (
            <>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="group"
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-xl sm:rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-blue-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                      
                      <CardHeader className="relative p-3 sm:p-6">
                        <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          {isRTL ? (
                            <>
                              {t('admin.analytics.devices', 'الأجهزة')}
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl">
                                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg sm:rounded-xl">
                                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                              </div>
                              {t('admin.analytics.devices', 'الأجهزة')}
                            </>
                          )}
                        </CardTitle>
                  </CardHeader>
                      
                      <CardContent className="relative p-3 sm:p-6 pt-0">
                        <div className="space-y-2 sm:space-y-3">
                      {deviceStats.devices.map((device, index) => (
                            <motion.div 
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                              className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-800/30 dark:to-slate-700/20 rounded-lg sm:rounded-xl border border-slate-200/50 dark:border-slate-700/30 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                {device.device_type === 'mobile' && <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
                                {device.device_type === 'desktop' && <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />}
                                {device.device_type === 'tablet' && <Monitor className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base">
                                  {device.device_type === 'mobile' ? t('admin.analytics.mobile', 'الهاتف المحمول') : 
                                   device.device_type === 'desktop' ? t('admin.analytics.desktop', 'سطح المكتب') : 
                                   device.device_type === 'tablet' ? t('admin.analytics.tablet', 'الجهاز اللوحي') : device.device_type}
                          </span>
                        </div>
                              <div className={`text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`}>
                                {formatNumber(device.visits)}
                              </div>
                            </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="lg:col-span-2"
                  >
                    <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-slate-500/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-slate-400/5 rounded-full translate-y-6 sm:translate-y-8 -translate-x-6 sm:-translate-x-8"></div>
                      
                      <CardHeader className="relative p-3 sm:p-6">
                        <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                          {isRTL ? (
                            <>
                              {t('admin.analytics.deviceDistribution', 'توزيع الأجهزة')}
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                                <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-slate-500/20 to-slate-600/20 rounded-lg sm:rounded-xl">
                                <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                              </div>
                              {t('admin.analytics.deviceDistribution', 'توزيع الأجهزة')}
                            </>
                          )}
                        </CardTitle>
                  </CardHeader>
                      
                      <CardContent className="relative p-3 sm:p-6 pt-0">
                        <div className="h-64 sm:h-80">
                          <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                                data={deviceStats.devices.map((device) => ({
                                  name: device.device_type === 'mobile' ? t('admin.analytics.mobile', 'الهاتف المحمول') : 
                                        device.device_type === 'desktop' ? t('admin.analytics.desktop', 'سطح المكتب') : 
                                        device.device_type === 'tablet' ? t('admin.analytics.tablet', 'الجهاز اللوحي') : device.device_type,
                                  value: device.visits
                                }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                                dataKey="value"
                        >
                          {deviceStats.devices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                              <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                        </div>
                  </CardContent>
                </Card>
                  </motion.div>
                </motion.div>
            </>
          )}
        </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  );
};

export default AdminVisitAnalytics;