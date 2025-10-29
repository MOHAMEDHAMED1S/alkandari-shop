import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
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
  Users, 
  TrendingUp,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  Share2,
  Facebook,
  Instagram,
  Twitter,
  MessageCircle,
  Globe,
  Eye,
  UserCheck,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  socialVisitsService,
  SocialVisitsResponse,
  SocialVisitsFilters,
  SocialVisitResult,
  SocialVisitsSummary,
  SOCIAL_PLATFORMS
} from '@/services/socialVisitsService';

// Color palette for social platforms
const PLATFORM_COLORS = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  snapchat: '#FFFC00',
  other: '#6B7280'
};

// Platform icons mapping
const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform.toLowerCase()) {
    case 'facebook':
      return <Facebook className="h-5 w-5" style={{ color: PLATFORM_COLORS.facebook }} />;
    case 'instagram':
      return <Instagram className="h-5 w-5" style={{ color: PLATFORM_COLORS.instagram }} />;
    case 'twitter':
      return <Twitter className="h-5 w-5" style={{ color: PLATFORM_COLORS.twitter }} />;
    case 'snapchat':
      return <MessageCircle className="h-5 w-5" style={{ color: PLATFORM_COLORS.snapchat }} />;
    default:
      return <Globe className="h-5 w-5" style={{ color: PLATFORM_COLORS.other }} />;
  }
};

const SocialVisitsAnalytics: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Function to convert numbers to Arabic numerals
  const toArabicNumerals = (num: string | number | undefined | null): string => {
    if (i18n.language !== 'ar') return num?.toString() || '0';
    
    if (num === undefined || num === null || num === '') return '0';
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  const [socialVisitsData, setSocialVisitsData] = useState<SocialVisitsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState<SocialVisitsFilters>({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    platforms: [],
    group_by: undefined
  });

  // Fetch social visits data
  const fetchSocialVisits = async () => {
    setLoading(true);
    try {
      const data = await socialVisitsService.getSocialVisits(filters);
      setSocialVisitsData(data);
    } catch (error) {
      console.error('Error fetching social visits:', error);
      toast.error('خطأ في جلب بيانات مصادر الزيارات');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and filter changes
  useEffect(() => {
    fetchSocialVisits();
  }, [filters]);

  // Handle filter changes
  const handleDateRangeChange = (field: 'start_date' | 'end_date', value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const handleGroupByChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      group_by: value === 'none' ? undefined : value as 'date' | 'both'
    }));
  };

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'م';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num.toString();
  };

  // Calculate percentage
  const calculatePercentage = (value: number, total: number): number => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!socialVisitsData?.results) return [];
    
    return socialVisitsData.results.map(result => ({
      platform: result.platform,
      visits: result.visits,
      unique_visitors: result.unique_visitors,
      percentage: calculatePercentage(result.visits, socialVisitsData.summary.total_visits),
      color: PLATFORM_COLORS[result.platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.other
    }));
  };

  const chartData = prepareChartData();

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
      >
        {i18n.language === 'ar' ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-right order-1 lg:order-1"
            >
              <h1 className="pb-2 text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {t('admin.socialVisits.title', 'مصادر الزيارات')}
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSocialVisits}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto"
              >
                <RefreshCw className={`w-4 h-4 ms-2 group-hover:scale-110 transition-transform duration-300 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">{t('admin.common.refresh', 'تحديث')}</span>
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
                {t('admin.socialVisits.title', 'Social Visits Analytics')}
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSocialVisits}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto"
              >
                <RefreshCw className={`w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">{t('admin.common.refresh', 'Refresh')}</span>
              </Button>
           
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Filters */}
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
                  {/* Date Range - Arabic: First */}
                  <div className="col-span-2 space-y-2 order-1 sm:order-1">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-right block">
                      {t('admin.socialVisits.dateRange', 'نطاق التاريخ')}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        dir="rtl"
                      />
                      <Input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        dir="rtl"
                      />
                    </div>
                  </div>

                  {/* Group By - Arabic: Second */}
                  <div className="space-y-2 order-2 sm:order-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-right block">
                      {t('admin.socialVisits.groupBy', 'تجميع البيانات')}
                    </label>
                    <Select value={filters.group_by || 'none'} onValueChange={handleGroupByChange}>
                      <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue placeholder={t('admin.socialVisits.selectGroupBy', 'اختر طريقة التجميع')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                        <SelectItem value="none" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.socialVisits.noGrouping', 'بدون تجميع')}</SelectItem>
                        <SelectItem value="date" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.socialVisits.groupByDate', 'حسب التاريخ')}</SelectItem>
                        <SelectItem value="both" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.socialVisits.groupByBoth', 'حسب المنصة والتاريخ')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Platform Filters - Arabic: Third */}
                  <div className="col-span-2 space-y-2 order-3 sm:order-3">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 text-right block">
                      {t('admin.socialVisits.platforms', 'المنصات')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
                        <div key={key} className="flex items-center space-x-2 space-x-reverse">
                          <Checkbox
                            id={key}
                            checked={filters.platforms.includes(key)}
                            onCheckedChange={(checked) => 
                              handlePlatformToggle(key, checked as boolean)
                            }
                            className="rounded border-slate-300 dark:border-slate-600"
                          />
                          <Label htmlFor={key} className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                            <PlatformIcon platform={key} />
                            {platform.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Date Range - English: First */}
                  <div className="col-span-2 sm:flex-1 sm:min-w-0 space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.socialVisits.dateRange', 'Date Range')}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleDateRangeChange('start_date', e.target.value)}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary date-input-english"
                      />
                      <Input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => handleDateRangeChange('end_date', e.target.value)}
                        className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary date-input-english"
                      />
                    </div>
                  </div>

                  {/* Group By - English: Second */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.socialVisits.groupBy', 'Group By')}
                    </label>
                    <Select value={filters.group_by || 'none'} onValueChange={handleGroupByChange}>
                      <SelectTrigger className="w-full lg:w-48 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <SelectValue placeholder={t('admin.socialVisits.selectGroupBy', 'Select grouping')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                        <SelectItem value="none" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.socialVisits.noGrouping', 'No grouping')}</SelectItem>
                        <SelectItem value="date" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.socialVisits.groupByDate', 'By date')}</SelectItem>
                        <SelectItem value="both" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{t('admin.socialVisits.groupByBoth', 'By platform and date')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Platform Filters - English: Third */}
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.socialVisits.platforms', 'Platforms')}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(SOCIAL_PLATFORMS).map(([key, platform]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <Checkbox
                            id={key}
                            checked={filters.platforms.includes(key)}
                            onCheckedChange={(checked) => 
                              handlePlatformToggle(key, checked as boolean)
                            }
                            className="rounded border-slate-300 dark:border-slate-600"
                          />
                          <Label htmlFor={key} className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                            <PlatformIcon platform={key} />
                            {platform.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Main Content */}
      {!loading && socialVisitsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardContent className="relative p-1">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full grid-cols-3 mb-6 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-xl p-1 shadow-inner ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {i18n.language === 'ar' ? (
                    <>
                      <TabsTrigger value="trends" className="rounded-lg font-semibold transition-all duration-300 hover:bg-white dark:hover:bg-slate-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md">
                        {t('admin.socialVisits.trends', 'الاتجاهات')}
                      </TabsTrigger>
                      <TabsTrigger value="platforms" className="rounded-lg font-semibold transition-all duration-300 hover:bg-white dark:hover:bg-slate-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md">
                        {t('admin.socialVisits.platforms', 'المنصات')}
                      </TabsTrigger>
                      <TabsTrigger value="overview" className="rounded-lg font-semibold transition-all duration-300 hover:bg-white dark:hover:bg-slate-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md">
                        {t('admin.socialVisits.overview', 'نظرة عامة')}
                      </TabsTrigger>
                    </>
                  ) : (
                    <>
                      <TabsTrigger value="overview" className="rounded-lg font-semibold transition-all duration-300 hover:bg-white dark:hover:bg-slate-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md">
                        {t('admin.socialVisits.overview', 'Overview')}
                      </TabsTrigger>
                      <TabsTrigger value="platforms" className="rounded-lg font-semibold transition-all duration-300 hover:bg-white dark:hover:bg-slate-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md">
                        {t('admin.socialVisits.platforms', 'Platforms')}
                      </TabsTrigger>
                      <TabsTrigger value="trends" className="rounded-lg font-semibold transition-all duration-300 hover:bg-white dark:hover:bg-slate-600 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600 data-[state=active]:shadow-md">
                        {t('admin.socialVisits.trends', 'Trends')}
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
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
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                  <CardContent className="p-1">
                    <div className="flex items-center justify-between mb-3">
                      {i18n.language === 'ar' ? (
                        <>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.totalVisits', 'إجمالي الزيارات')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {toArabicNumerals(formatNumber(socialVisitsData.summary.total_visits))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.totalVisits', 'Total Visits')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {formatNumber(socialVisitsData.summary.total_visits)}
                            </div>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
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
                            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.uniqueVisitors', 'الزوار الفريدون')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {toArabicNumerals(formatNumber(socialVisitsData.summary.unique_visitors))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.uniqueVisitors', 'Unique Visitors')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {formatNumber(socialVisitsData.summary.unique_visitors)}
                            </div>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
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
                  <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                  <CardContent className="p-1">
                    <div className="flex items-center justify-between mb-3">
                      {i18n.language === 'ar' ? (
                        <>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.activePlatforms', 'المنصات النشطة')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {toArabicNumerals(socialVisitsData.results.length)}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.activePlatforms', 'Active Platforms')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {socialVisitsData.results.length}
                            </div>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Share2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
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
                  <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
                  <CardContent className="p-1">
                    <div className="flex items-center justify-between mb-3">
                      {i18n.language === 'ar' ? (
                        <>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.averageVisits', 'متوسط الزيارات')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {toArabicNumerals(socialVisitsData.results.length > 0 
                                ? formatNumber(Math.round(socialVisitsData.summary.total_visits / socialVisitsData.results.length))
                                : '0'
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-left">
                            <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                              {t('admin.socialVisits.averageVisits', 'Average Visits')}
                            </p>
                            <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                              {socialVisitsData.results.length > 0 
                                ? formatNumber(Math.round(socialVisitsData.summary.total_visits / socialVisitsData.results.length))
                                : '0'
                              }
                            </div>
                          </div>
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-orange-600 group-hover:text-orange-700 transition-colors duration-300" />
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                      {i18n.language === 'ar' ? (
                        <>
                          {t('admin.socialVisits.visitsByPlatform', 'توزيع الزيارات حسب المنصة')}
                          <BarChart3 className="h-5 w-5" />
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-5 w-5" />
                          {t('admin.socialVisits.visitsByPlatform', 'توزيع الزيارات حسب المنصة')}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ platform, percentage }) => `${platform} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="visits"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                      {i18n.language === 'ar' ? (
                        <>
                          {t('admin.socialVisits.visitsComparison', 'مقارنة الزيارات والزوار الفريدون')}
                          <BarChart3 className="h-5 w-5" />
                        </>
                      ) : (
                        <>
                          <BarChart3 className="h-5 w-5" />
                          {t('admin.socialVisits.visitsComparison', 'مقارنة الزيارات والزوار الفريدون')}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="platform" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="visits" fill="#8884d8" name={t('admin.socialVisits.visits', 'الزيارات')} />
                        <Bar dataKey="unique_visitors" fill="#82ca9d" name={t('admin.socialVisits.uniqueVisitors', 'الزوار الفريدون')} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Platforms Tab */}
          <TabsContent value="platforms" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialVisitsData.results.map((result, index) => (
                <motion.div
                  key={result.platform}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <PlatformIcon platform={result.platform} />
                        {socialVisitsService.getPlatformInfo(result.platform).name}
                      </CardTitle>
                      <Badge variant="secondary">
                        {calculatePercentage(result.visits, socialVisitsData.summary.total_visits)}%
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('admin.socialVisits.visits', 'الزيارات')}:</span>
                          <span className="font-medium">{formatNumber(result.visits)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{t('admin.socialVisits.uniqueVisitors', 'الزوار الفريدون')}:</span>
                          <span className="font-medium">{formatNumber(result.unique_visitors)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${calculatePercentage(result.visits, socialVisitsData.summary.total_visits)}%`,
                              backgroundColor: PLATFORM_COLORS[result.platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.other
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader className={`text-sm text-slate-600 dark:text-slate-400 flex items-center ${
                     isRTL ? 'text-right justify-end' : 'text-left'
                   }`}>
                <CardTitle>{t('admin.socialVisits.visitTrends', 'اتجاهات الزيارات')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>{t('admin.socialVisits.trendsPlaceholder', 'سيتم عرض اتجاهات الزيارات هنا عند توفر بيانات مجمعة حسب التاريخ')}</p>
                  <p className="text-sm mt-2">{t('admin.socialVisits.trendsFilterHint', 'استخدم فلتر "تجميع البيانات" لعرض الاتجاهات')}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  </motion.div>
)}

      {/* Empty State */}
      {!loading && (!socialVisitsData || socialVisitsData.results.length === 0) && (
        <Card>
          <CardContent className="text-center py-8">
            <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t('admin.socialVisits.noData', 'لا توجد بيانات')}</h3>
            <p className="text-muted-foreground">
              {t('admin.socialVisits.noDataDescription', 'لا توجد زيارات من منصات التواصل الاجتماعي في الفترة المحددة')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialVisitsAnalytics;