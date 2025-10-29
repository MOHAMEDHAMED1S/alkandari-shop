import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Database,
  Filter,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Trash2,
  Calendar,
  ShoppingCart,
  DollarSign,
  Package,
  Table
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

import { 
  createOrderExport, 
  getExports, 
  downloadExport, 
  deleteExport 
} from '@/lib/api';
import { useAdmin } from '@/contexts/AdminContext';

interface ExportItem {
  id: string;
  type: string;
  format: string;
  status: string;
  file_name: string;
  file_size: number;
  records_count: number;
  download_url: string;
  created_at: string;
  completed_at: string;
}

interface NewExportOrdersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewExportOrders: React.FC<NewExportOrdersProps> = ({ open, onOpenChange }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';
  
  // Local translations
  const translations = {
    ar: {
      exportOptions: 'خيارات التصدير',
      recordLimit: 'حد السجلات',
      orderStatus: 'حالة الطلب',
      allStatuses: 'جميع الحالات',
      advancedFilters: 'المرشحات المتقدمة',
      createdAfter: 'تم الإنشاء بعد',
      createdBefore: 'تم الإنشاء قبل',
      minAmount: 'الحد الأدنى للمبلغ',
      maxAmount: 'الحد الأقصى للمبلغ',
      exportHistory: 'تاريخ التصدير',
      records: 'سجل',
      created: 'تم الإنشاء',
      completed: 'مكتمل',
      pending: 'معلق',
      processing: 'قيد المعالجة',
      shipped: 'تم الشحن',
      delivered: 'تم التسليم',
      cancelled: 'ملغي',
      refunded: 'مسترد'
    },
    en: {
      exportOptions: 'Export Options',
      recordLimit: 'Record Limit',
      orderStatus: 'Order Status',
      allStatuses: 'All Statuses',
      advancedFilters: 'Advanced Filters',
      createdAfter: 'Created After',
      createdBefore: 'Created Before',
      minAmount: 'Minimum Amount',
      maxAmount: 'Maximum Amount',
      exportHistory: 'Export History',
      records: 'records',
      created: 'Created',
      completed: 'Completed',
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    }
  };
  
  const getTranslation = (key: string) => {
    const lang = isRTL ? 'ar' : 'en';
    return translations[lang][key as keyof typeof translations[typeof lang]] || key;
  };
  
  // Export creation state
  const [format, setFormat] = useState<'json' | 'csv' | 'excel'>('excel');
  const [limit, setLimit] = useState<number>(1000);
  const [createdAfter, setCreatedAfter] = useState<string>('');
  const [createdBefore, setCreatedBefore] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  
  // UI state
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [exports, setExports] = useState<ExportItem[]>([]);
  const [isLoadingExports, setIsLoadingExports] = useState(false);

  // Load exports on mount
  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    if (!token) return;
    
    setIsLoadingExports(true);
    try {
      const response = await getExports(token, { 
        type: 'orders',
        per_page: 10 
      });
      setExports(response.data || []);
    } catch (error) {
      console.error('Error loading exports:', error);
      toast.error(t('admin.orders.failedToLoadExportHistory'));
    } finally {
      setIsLoadingExports(false);
    }
  };

  const handleExport = async () => {
    if (!token) return;

    setIsExporting(true);
    try {
      const filters: any = {};
      
      if (createdAfter) {
        filters.created_after = createdAfter;
      }
      
      if (createdBefore) {
        filters.created_before = createdBefore;
      }
      
      if (status) {
        filters.status = status;
      }

      if (minAmount) {
        filters.min_amount = parseFloat(minAmount);
      }

      if (maxAmount) {
        filters.max_amount = parseFloat(maxAmount);
      }

      const response = await createOrderExport(token, {
        format,
        limit,
        filters
      });

      toast.success(t('admin.orders.exportStartedSuccessfully'), {
        description: t(`admin.orders.exportId: ${response.export_id}`)
      });

      // Reload exports list
      loadExports();
      
      // Reset form
      resetForm();
      
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(t('admin.orders.exportFailed'), {
        description: error.response?.data?.message || t('admin.orders.exportErrorOccurred')
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resetForm = () => {
    setFormat('excel');
    setLimit(1000);
    setCreatedAfter('');
    setCreatedBefore('');
    setStatus('');
    setMinAmount('');
    setMaxAmount('');
    setShowFilters(false);
  };

  const handleDownload = async (exportId: string) => {
    if (!token) return;

    try {
      const exportItem = exports.find(exp => exp.id === exportId);
      const response = await downloadExport(token, exportId);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let filename = 'export.xlsx';
      
      if (exportItem && exportItem.file_name) {
        filename = exportItem.file_name;
      } else {
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(t('admin.orders.fileDownloadedSuccessfully'));
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t('admin.orders.failedToDownloadFile'));
    }
  };

  const handleDelete = async (exportId: string) => {
    if (!token) return;

    try {
      await deleteExport(token, exportId);
      toast.success(t('admin.orders.exportDeletedSuccessfully'));
      loadExports();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('admin.orders.failedToDeleteExport'));
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'json':
        return <Database className="w-4 h-4 text-blue-600" />;
      case 'csv':
        return <FileText className="w-4 h-4 text-green-600" />;
      case 'excel':
      case 'xlsx':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-amber-100 text-amber-800', label: getTranslation('pending') },
      processing: { color: 'bg-blue-100 text-blue-800', label: getTranslation('processing') },
      shipped: { color: 'bg-purple-100 text-purple-800', label: getTranslation('shipped') },
      delivered: { color: 'bg-green-100 text-green-800', label: getTranslation('delivered') },
      cancelled: { color: 'bg-red-100 text-red-800', label: getTranslation('cancelled') },
      refunded: { color: 'bg-gray-100 text-gray-800', label: getTranslation('refunded') }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || { color: 'bg-gray-100 text-gray-800', label: status };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl relative overflow-hidden mx-auto my-4 w-[95vw] sm:w-full"
        style={{
          position: 'fixed',
          top: '48%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          maxHeight: '95vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
        onScroll={(e) => {
          // Smooth scrolling behavior
          e.currentTarget.style.scrollBehavior = 'smooth';
        }}
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-500/10 to-blue-500/5 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 left-0 w-16 h-16 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-full -translate-x-8"></div>
        
        <DialogHeader className="flex-shrink-0 pb-4 relative">
          <DialogTitle className={`text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
            {isRTL ? (
              <>
                <span>{t('admin.orders.exportOrders')}</span>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Download className="w-6 h-6 text-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <span>{t('admin.orders.exportOrders')}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className={`text-slate-600 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('admin.orders.exportOrdersDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div 
          className="space-y-4 sm:space-y-6 px-1 relative"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 #f1f5f9',
            scrollBehavior: 'smooth'
          }}
        >
          {/* Export Format */}
          <div className="space-y-4">
            <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{t('admin.orders.exportFormat')}</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'excel',
                  label: t('admin.orders.exportExcel'),
                  description: t('admin.orders.exportExcelDescription'),
                  icon: Table,
                  color: 'green',
                },
                {
                  id: 'csv',
                  label: t('admin.orders.exportCSV'),
                  description: t('admin.orders.exportCSVDescription'),
                  icon: FileText,
                  color: 'blue',
                },
                {
                  id: 'json',
                  label: t('admin.orders.exportJSON'),
                  description: t('admin.orders.exportJSONDescription'),
                  icon: Database,
                  color: 'purple',
                },
              ].map((formatOption) => {
                const Icon = formatOption.icon;
                return (
                  <Card
                    key={formatOption.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl shadow-lg hover:shadow-xl ${
                      format === formatOption.id
                        ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
                        : 'hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/50 dark:hover:to-slate-700/50'
                    }`}
                    onClick={() => setFormat(formatOption.id as any)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${format === formatOption.id ? 'bg-primary/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          <Icon className={`w-5 h-5 ${format === formatOption.id ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 dark:text-white">{formatOption.label}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {formatOption.description}
                          </p>
                        </div>
                        {format === formatOption.id && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Export Options */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative">
              <CardTitle className={`flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{getTranslation('exportOptions')}</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{getTranslation('recordLimit')}</Label>
                  <Input
                    type="number"
                    value={limit}
                    onChange={(e) => setLimit(parseInt(e.target.value) || 1000)}
                    min="1"
                    max="10000"
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{getTranslation('orderStatus')}</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={getTranslation('allStatuses')} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{getTranslation('allStatuses')}</SelectItem>
                      <SelectItem value="pending" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{getTranslation('pending')}</SelectItem>
                      <SelectItem value="processing" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{getTranslation('processing')}</SelectItem>
                      <SelectItem value="shipped" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{getTranslation('shipped')}</SelectItem>
                      <SelectItem value="delivered" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{getTranslation('delivered')}</SelectItem>
                      <SelectItem value="cancelled" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{getTranslation('cancelled')}</SelectItem>
                      <SelectItem value="refunded" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{getTranslation('refunded')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Filters */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative">
              <CardTitle className={`flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                {getTranslation('advancedFilters')}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{getTranslation('createdAfter')}</Label>
                  <Input
                    type="date"
                    value={createdAfter}
                    onChange={(e) => setCreatedAfter(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{getTranslation('createdBefore')}</Label>
                  <Input
                    type="date"
                    value={createdBefore}
                    onChange={(e) => setCreatedBefore(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{getTranslation('minAmount')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="0.00"
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{getTranslation('maxAmount')}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="999999.99"
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Progress */}
          {isExporting && (
            <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200/50 dark:border-blue-800/30 rounded-2xl shadow-lg">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
              <CardContent className="relative pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                      {t('admin.orders.exportingOrders')}
                    </span>
                  </div>
                  <Progress value={50} className="w-full h-2 rounded-full" />
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    50% {t('admin.orders.complete')}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export History */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative">
              <CardTitle className={`flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                {getTranslation('exportHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {isLoadingExports ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('admin.orders.loadingExports')}</p>
                  </div>
                </div>
              ) : exports.length === 0 ? (
                <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800/30 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    {t('admin.orders.noExportsFound')}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {exports.map((exportItem) => (
                    <div
                      key={exportItem.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start gap-3 mb-3 sm:mb-0">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl flex-shrink-0">
                          {getFormatIcon(exportItem.format)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-slate-900 dark:text-white truncate">{exportItem.file_name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {exportItem.records_count} {getTranslation('records')} • {formatFileSize(exportItem.file_size)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {getTranslation('created')}: {new Date(exportItem.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(exportItem.status)}
                          <Badge variant={
                            exportItem.status === 'completed' ? 'default' :
                            exportItem.status === 'failed' ? 'destructive' :
                            exportItem.status === 'processing' ? 'secondary' : 'outline'
                          } className="text-xs">
                            {getTranslation(exportItem.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {exportItem.status === 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(exportItem.id)}
                              className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-200 dark:hover:bg-green-900/20 dark:hover:border-green-800/30 rounded-xl transition-all duration-300"
                            >
                              <Download className="w-3 h-3 text-green-600" />
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(exportItem.id)}
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:border-red-800/30 rounded-xl transition-all duration-300"
                          >
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-end relative">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
            className="w-full sm:w-auto group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
          >
            <span className="font-semibold">{t('common.cancel')}</span>
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full sm:w-auto group hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span className="font-semibold">{t('admin.orders.exporting')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.orders.exportNow')}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewExportOrders;