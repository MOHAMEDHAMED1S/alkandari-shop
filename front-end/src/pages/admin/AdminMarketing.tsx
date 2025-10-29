import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAdmin } from '@/contexts/AdminContext';
import {
  Copy,
  ExternalLink,
  Facebook,
  Share2,
  Code,
  Eye,
  RefreshCw,
  CheckCircle,
  Globe,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag,
  DollarSign,
  Info,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Zap,
  Sparkles
} from 'lucide-react';

interface ProductItem {
  id: string;
  title: string;
  description: string;
  link: string;
  image_link: string;
  brand: string;
  condition: string;
  availability: string;
  price: string;
}

interface ParsedXMLData {
  channel: {
    title: string;
    description: string;
    link: string;
    atomLink: string;
  };
  items: ProductItem[];
}

const AdminMarketing: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const [isCopied, setIsCopied] = useState(false);
  const [isResponseCopied, setIsResponseCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiData, setApiData] = useState<string>('');
  const [parsedData, setParsedData] = useState<ParsedXMLData | null>(null);
  const [error, setError] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const API_URL = 'https://api.expo-alkandari.com/api/v1/products/feed';

  const parseXMLData = (xmlString: string): ParsedXMLData | null => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const channel = xmlDoc.querySelector('channel');
      if (!channel) return null;

      const channelData = {
        title: channel.querySelector('title')?.textContent || '',
        description: channel.querySelector('description')?.textContent || '',
        link: channel.querySelector('link')?.textContent || '',
        atomLink: channel.querySelector('atom\\:link, link[rel="self"]')?.getAttribute('href') || ''
      };

      const items = Array.from(xmlDoc.querySelectorAll('item')).map(item => ({
        id: item.querySelector('g\\:id, id')?.textContent || '',
        title: item.querySelector('g\\:title, title')?.textContent || '',
        description: item.querySelector('g\\:description, description')?.textContent || '',
        link: item.querySelector('g\\:link, link')?.textContent || '',
        image_link: item.querySelector('g\\:image_link, image_link')?.textContent || '',
        brand: item.querySelector('g\\:brand, brand')?.textContent || '',
        condition: item.querySelector('g\\:condition, condition')?.textContent || '',
        availability: item.querySelector('g\\:availability, availability')?.textContent || '',
        price: item.querySelector('g\\:price, price')?.textContent || ''
      }));

      return { channel: channelData, items };
    } catch (err) {
      console.error('Error parsing XML:', err);
      return null;
    }
  };

  const fetchApiData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.text();
      setApiData(data);
      
      const parsed = parseXMLData(data);
      setParsedData(parsed);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير معروف';
      setError(`فشل في تحميل البيانات: ${errorMessage}`);
      toast.error('فشل في تحميل بيانات API');
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchApiData().finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    fetchApiData();
  }, []);

  const copyToClipboard = async (text: string, type: 'url' | 'response') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'url') {
        setIsCopied(true);
        toast.success('تم نسخ رابط API بنجاح!');
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        setIsResponseCopied(true);
        toast.success('تم نسخ الاستجابة بنجاح!');
        setTimeout(() => setIsResponseCopied(false), 2000);
      }
    } catch (err) {
      toast.error('فشل في نسخ النص');
    }
  };

  const copyResponseData = async () => {
    if (apiData) {
      await copyToClipboard(apiData, 'response');
    } else {
      toast.error('لا توجد بيانات للنسخ');
    }
  };

  const openInNewTab = () => {
    window.open(API_URL, '_blank');
  };

  const toggleItemExpansion = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability.toLowerCase()) {
      case 'in stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out of stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'used':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading && isInitialLoad) {
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
              className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'} order-1 sm:order-2`}
            >
              <h1 className={`flex items-center text-3xl pb-2 sm:text-4xl font-bold  ${i18n ? 'text-right justify-end' : 'text-left'} order-1 sm:order-2`}>
                التسويق
              </h1>
        </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto order-2 sm:order-1"
            >
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 ms-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
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
              className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
            >
              <h1 className="text-3xl sm:text-4xl pb-2 font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Marketing
              </h1>
       </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end"
            >
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl"
              >
                <RefreshCw className={`w-5 h-5 me-3 transition-transform duration-300 group-hover:rotate-180 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Refresh</span>
              </Button>
          
            </motion.div>
          </>
        )}
      </motion.div>

    

    

      {/* Facebook Product Feed Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative">
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {i18n.language === 'ar' ? (
                <>
            تغذية المنتجات لفيسبوك
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </div>
                  Facebook Product Feed
                </>
              )}
          </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {i18n.language === 'ar' 
                ? 'رابط API لتغذية المنتجات المخصص لإعلانات فيسبوك والكتالوج'
                : 'API endpoint for product feeds designed for Facebook ads and catalog'
              }
          </CardDescription>
        </CardHeader>
          <CardContent className="relative space-y-6 pt-0">
          {/* API URL Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="space-y-3"
            >
              <Label htmlFor="api-url" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {i18n.language === 'ar' ? 'رابط API' : 'API URL'}
            </Label>
            {i18n.language === 'ar' ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => copyToClipboard(API_URL, 'url')}
                  variant="outline"
                  size="sm"
                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                >
                  {isCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-600 ms-2 transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <Copy className="h-4 w-4 ms-2 transition-transform duration-300 group-hover:scale-110" />
                  )}
                  <span className="font-semibold">{isCopied ? 'تم النسخ' : 'نسخ'}</span>
                </Button>
                <Button
                  onClick={openInNewTab}
                  variant="outline"
                  size="sm"
                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="h-4 w-4 ms-2 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold">فتح</span>
                </Button>
                <div className="relative group flex-1">
                  <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                  <Input
                    id="api-url"
                    value={API_URL}
                    readOnly
                    className="pr-10 font-mono text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative group flex-1">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-hover:text-primary transition-colors duration-300" />
                  <Input
                    id="api-url"
                    value={API_URL}
                    readOnly
                    className="pl-10 font-mono text-sm rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={() => copyToClipboard(API_URL, 'url')}
                  variant="outline"
                  size="sm"
                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                >
                  {isCopied ? (
                    <CheckCircle className="h-4 w-4 text-green-600 me-2 transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <Copy className="h-4 w-4 me-2 transition-transform duration-300 group-hover:scale-110" />
                  )}
                  <span className="font-semibold">{isCopied ? 'Copied' : 'Copy'}</span>
                </Button>
                <Button
                  onClick={openInNewTab}
                  variant="outline"
                  size="sm"
                  className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="h-4 w-4 me-2 transition-transform duration-300 group-hover:scale-110" />
                  <span className="font-semibold">Open</span>
                </Button>
              </div>
            )}
            </motion.div>

          {/* API Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-6 rounded-2xl border border-blue-200/50 dark:border-blue-800/30"
            >
              {i18n.language === 'ar' ? (
                <>
                  <div className="flex items-center justify-end gap-2 mb-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">معلومات API</h3>
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span>يعرض جميع المنتجات المتاحة بتنسيق XML</span>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span>متوافق مع متطلبات كتالوج فيسبوك</span>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span>يتم تحديث البيانات تلقائياً</span>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span>يشمل الصور والأسعار والأوصاف</span>
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">API Information</h3>
                  </div>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2 text-left">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Displays all available products in XML format
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Compatible with Facebook catalog requirements
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Data is updated automatically
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      Includes images, prices, and descriptions
                    </li>
                  </ul>
                </>
              )}
            </motion.div>
        </CardContent>
      </Card>
      </motion.div>

      {/* API Response Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative">
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {i18n.language === 'ar' ? (
                <>
            معاينة البيانات التفاعلية
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                    <Eye className="w-5 h-5 text-green-600" />
                  </div>
                  Interactive Data Preview
                </>
              )}
          </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {i18n.language === 'ar' 
                ? 'عرض تفاعلي واحترافي لبيانات المنتجات'
                : 'Interactive and professional display of product data'
              }
          </CardDescription>
        </CardHeader>
          <CardContent className="relative space-y-4 pt-0">
          {/* Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className={`flex gap-2 ${i18n.language === 'ar' ? 'justify-end' : ''}`}
            >
            <Button
              onClick={copyResponseData}
              variant="outline"
              size="sm"
              disabled={isLoading || !apiData}
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
            >
              {isResponseCopied ? (
                  <CheckCircle className="h-4 w-4 text-green-600 me-2 transition-transform duration-300 group-hover:scale-110" />
              ) : (
                  <Copy className="h-4 w-4 me-2 transition-transform duration-300 group-hover:scale-110" />
              )}
                <span className="font-semibold">{isResponseCopied ? (i18n.language === 'ar' ? 'تم النسخ' : 'Copied') : (i18n.language === 'ar' ? 'نسخ XML' : 'Copy XML')}</span>
            </Button>
            <Button
              onClick={fetchApiData}
              variant="outline"
              size="sm"
              disabled={isLoading}
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
            >
              {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : (
                  <RefreshCw className="h-4 w-4 me-2 transition-transform duration-300 group-hover:rotate-180" />
              )}
                <span className="font-semibold">{isLoading ? (i18n.language === 'ar' ? 'جاري التحديث...' : 'Updating...') : (i18n.language === 'ar' ? 'تحديث' : 'Update')}</span>
            </Button>
            </motion.div>

          {/* Response Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
            >
            {isInitialLoad && isLoading ? (
                <div className="flex items-center justify-center h-96 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-800/20">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center"
                  >
                  <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">{i18n.language === 'ar' ? 'جاري تحميل البيانات...' : 'Loading data...'}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">{i18n.language === 'ar' ? 'يرجى الانتظار' : 'Please wait'}</p>
                  </motion.div>
              </div>
            ) : error ? (
                <div className="flex items-center justify-center h-96 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-800/20">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="text-center"
                  >
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
                    <p className="text-red-600 dark:text-red-400 font-semibold text-lg">{i18n.language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}</p>
                    <p className="text-red-500 dark:text-red-500 text-sm mt-2 max-w-md">{error}</p>
                  <Button 
                    onClick={fetchApiData} 
                    variant="outline" 
                    size="sm" 
                      className="mt-4 group hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin me-2" />
                    ) : (
                        <RefreshCw className="h-4 w-4 me-2 transition-transform duration-300 group-hover:rotate-180" />
                    )}
                      <span className="font-semibold">{i18n.language === 'ar' ? 'إعادة المحاولة' : 'Retry'}</span>
                  </Button>
                  </motion.div>
              </div>
            ) : parsedData ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/20 dark:to-blue-900/20 p-6"
                >
                {/* Channel Information */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mb-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50"
                  >
                  <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl shadow-lg">
                      <Globe className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{parsedData.channel.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{parsedData.channel.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {i18n.language === 'ar' ? (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <Code className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">عدد المنتجات: {parsedData.items.length}</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <LinkIcon className="h-4 w-4 text-slate-500" />
                          <a 
                            href={parsedData.channel.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-300"
                          >
                            {parsedData.channel.link}
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <LinkIcon className="h-4 w-4 text-slate-500" />
                          <a 
                            href={parsedData.channel.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors duration-300"
                          >
                            {parsedData.channel.link}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                          <Code className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-semibold">Number of products: {parsedData.items.length}</span>
                        </div>
                      </>
                    )}
                  </div>
                  </motion.div>

                {/* Products */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="space-y-4"
                  >
                    {i18n.language === 'ar' ? (
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-end gap-2">
                        <span>المنتجات ({parsedData.items.length})</span>
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                      </h4>
                    ) : (
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        Products ({parsedData.items.length})
                      </h4>
                    )}
                  
                  {parsedData.items.map((item, index) => (
                      <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index, duration: 0.4 }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
                      >
                      {/* Product Header */}
                      <div 
                          className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300"
                        onClick={() => toggleItemExpansion(item.id || index.toString())}
                      >
                        {i18n.language === 'ar' ? (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {expandedItems.has(item.id || index.toString()) ? (
                                <ChevronDown className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:scale-110" />
                              ) : (
                                <ChevronLeft className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:scale-110" />
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-row-reverse">
                              <div className="text-right">
                                <h5 className={`flex items-center font-bold  ${i18n ? 'text-right justify-end' : 'text-left'} order-1 sm:order-2`}>{item.title}</h5>
                                <div className="flex items-center gap-2 mt-1 flex-row-reverse">
                                  <Badge variant="outline" className={`${getAvailabilityColor(item.availability)} rounded-xl px-3 py-1 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                                    {item.availability}
                                  </Badge>
                                  <Badge variant="outline" className={`${getConditionColor(item.condition)} rounded-xl px-3 py-1 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                                    {item.condition}
                                  </Badge>
                                  <span className="text-lg font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-xl">{item.price}</span>
                                </div>
                              </div>
                              {item.image_link && (
                                <div className="relative group">
                                  <img 
                                    src={item.image_link} 
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-md group-hover:shadow-lg transition-all duration-300"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {item.image_link && (
                                <div className="relative group">
                                  <img 
                                    src={item.image_link} 
                                    alt={item.title}
                                    className="w-12 h-12 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-md group-hover:shadow-lg transition-all duration-300"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                              )}
                              <div>
                                <h5 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors duration-300">{item.title}</h5>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`${getAvailabilityColor(item.availability)} rounded-xl px-3 py-1 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                                    {item.availability}
                                  </Badge>
                                  <Badge variant="outline" className={`${getConditionColor(item.condition)} rounded-xl px-3 py-1 font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105`}>
                                    {item.condition}
                                  </Badge>
                                  <span className="text-lg font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-xl">{item.price}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {expandedItems.has(item.id || index.toString()) ? (
                                <ChevronDown className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:scale-110" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-slate-500 transition-transform duration-300 group-hover:scale-110" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Expanded Content */}
                      {expandedItems.has(item.id || index.toString()) && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-slate-200/50 dark:border-slate-700/50 p-4 bg-slate-50/50 dark:bg-slate-700/30"
                          >
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Product Details */}
                            <div className="space-y-4">
                              <div>
                                  <h6 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                                      <Info className="h-4 w-4 text-blue-600" />
                                    </div>
                                  {i18n.language === 'ar' ? 'تفاصيل المنتج' : 'Product Details'}
                                </h6>
                                  <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-md">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {item.description.length > 200 
                                      ? `${item.description.substring(0, 200)}...` 
                                      : item.description
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">{i18n.language === 'ar' ? 'المعرف' : 'ID'}</label>
                                    <p className="text-sm font-mono text-slate-900 dark:text-slate-100 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-md">{item.id}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">{i18n.language === 'ar' ? 'العلامة التجارية' : 'Brand'}</label>
                                    <p className="text-sm text-slate-900 dark:text-slate-100 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-md">{item.brand}</p>
                                </div>
                              </div>
                            </div>

                            {/* Links and Actions */}
                            <div className="space-y-4">
                              <div>
                                  <h6 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                    <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                                      <LinkIcon className="h-4 w-4 text-green-600" />
                                    </div>
                                  {i18n.language === 'ar' ? 'الروابط والإجراءات' : 'Links & Actions'}
                                </h6>
                                <div className="space-y-2">
                                  <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 group shadow-md hover:shadow-lg hover:scale-[1.02]"
                                  >
                                      <ExternalLink className="h-4 w-4 text-slate-500 group-hover:text-blue-600 transition-colors duration-300" />
                                      <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-blue-700 font-semibold">{i18n.language === 'ar' ? 'عرض المنتج' : 'View Product'}</span>
                                  </a>
                                  
                                  {item.image_link && (
                                    <a 
                                      href={item.image_link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 group shadow-md hover:shadow-lg hover:scale-[1.02]"
                                    >
                                        <ImageIcon className="h-4 w-4 text-slate-500 group-hover:text-green-600 transition-colors duration-300" />
                                        <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-green-700 font-semibold">{i18n.language === 'ar' ? 'عرض الصورة' : 'View Image'}</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Product Image Preview */}
                              {item.image_link && (
                                <div>
                                    <h6 className="font-semibold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                                      <div className="p-1.5 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
                                        <ImageIcon className="h-4 w-4 text-purple-600" />
                                      </div>
                                    {i18n.language === 'ar' ? 'معاينة الصورة' : 'Image Preview'}
                                  </h6>
                                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-3 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-md">
                                    <img 
                                      src={item.image_link} 
                                      alt={item.title}
                                        className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDIwMCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTI4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04NyA0OEg5M1Y1NEg4N1Y0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+CjwvcGF0aD4KPC9zdmc+';
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800/20 dark:to-blue-900/20"
                >
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center">
                      <Eye className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                </div>
                    <p className="text-slate-600 dark:text-slate-400 text-lg font-semibold">{i18n.language === 'ar' ? 'لا توجد بيانات للعرض' : 'No data to display'}</p>
                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">{i18n.language === 'ar' ? 'قم بتحديث البيانات لعرض المنتجات' : 'Update data to view products'}</p>
              </div>
                </motion.div>
            )}
            </motion.div>
        </CardContent>
      </Card>
      </motion.div>

      {/* Usage Instructions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          <CardHeader className="relative">
            <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
              {i18n.language === 'ar' ? (
                <>
            تعليمات الاستخدام
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <Code className="w-5 h-5 text-purple-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <Code className="w-5 h-5 text-purple-600" />
                  </div>
                  Usage Instructions
                </>
              )}
          </CardTitle>
        </CardHeader>
          <CardContent className="relative space-y-6 pt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="space-y-4"
            >
            {i18n.language === 'ar' ? (
              <div>
                <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100 flex items-center justify-end gap-2">
                  <span>لإعداد كتالوج فيسبوك:</span>
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                </h3>
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300 text-right">
                    <div className="flex items-start justify-end gap-2">
                      <span>انتقل إلى Facebook Business Manager</span>
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                    </div>
                    <div className="flex items-start justify-end gap-2">
                      <span>اختر "كتالوج المنتجات" من القائمة</span>
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                    </div>
                    <div className="flex items-start justify-end gap-2">
                      <span>انقر على "إضافة منتجات" ثم "استخدام تغذية البيانات"</span>
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                    </div>
                    <div className="flex items-start justify-end gap-2">
                      <span>الصق رابط API في حقل "رابط التغذية"</span>
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                    </div>
                    <div className="flex items-start justify-end gap-2">
                      <span>اختر "XML" كتنسيق التغذية</span>
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                    </div>
                    <div className="flex items-start justify-end gap-2">
                      <span>احفظ الإعدادات وانتظر المزامنة</span>
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">6</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  To set up Facebook catalog:
                </h3>
                <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                  <ol className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                      <span>Go to Facebook Business Manager</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                      <span>Select "Product Catalog" from the menu</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                      <span>Click "Add Products" then "Use Data Feed"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                      <span>Paste the API URL in the "Feed URL" field</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">5</span>
                      <span>Select "XML" as the feed format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-semibold">6</span>
                      <span>Save settings and wait for synchronization</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}
            
              <Separator className="bg-slate-200/50 dark:bg-slate-700/50" />
            
            {i18n.language === 'ar' ? (
              <div>
                <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100 flex items-center justify-end gap-2">
                  <span>الميزات المتاحة:</span>
                  <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex items-start justify-end gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-800/30"
                  >
                    <div className="text-right">
                      <p className={`flex items-center font-bold  ${i18n ? 'text-right justify-end' : 'text-left'} order-1 sm:order-2`}>تحديث تلقائي</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">البيانات محدثة دائماً</p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                      <Globe className="h-4 w-4 text-green-600" />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex items-start justify-end gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30"
                  >
                    <div className="text-right">
                      <p className={`flex items-center font-bold  ${i18n ? 'text-right justify-end' : 'text-left'} order-1 sm:order-2`}>سهولة المشاركة</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">رابط ثابت قابل للمشاركة</p>
                    </div>
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                      <Share2 className="h-4 w-4 text-blue-600" />
                    </div>
                  </motion.div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                  Available Features:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200/50 dark:border-green-800/30"
                  >
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
                      <Globe className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Auto Update</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Data is always up to date</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
                      <Share2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Easy Sharing</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Fixed shareable link</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
            </motion.div>
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
};

export default AdminMarketing;