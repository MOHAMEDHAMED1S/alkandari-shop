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
  Package,
  DollarSign,
  Tag,
  BarChart3,
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
  createProductExport, 
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

interface NewExportProductsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewExportProducts: React.FC<NewExportProductsProps> = ({ open, onOpenChange }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';
  
  // Export creation state
  const [format, setFormat] = useState<'json' | 'csv' | 'excel'>('excel');
  const [limit, setLimit] = useState<number>(1000);
  const [createdAfter, setCreatedAfter] = useState<string>('');
  const [createdBefore, setCreatedBefore] = useState<string>('');
  const [status, setStatus] = useState<string>('all');
  const [category, setCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minStock, setMinStock] = useState<string>('');
  const [maxStock, setMaxStock] = useState<string>('');
  
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
        type: 'products',
        per_page: 10 
      });
      setExports(response.data || []);
    } catch (error) {
      console.error('Error loading exports:', error);
      toast.error(t('Failed to load export history'));
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
      
      if (status && status !== 'all') {
        filters.status = status;
      }

      if (category) {
        filters.category = category;
      }

      if (minPrice) {
        filters.min_price = parseFloat(minPrice);
      }

      if (maxPrice) {
        filters.max_price = parseFloat(maxPrice);
      }

      if (minStock) {
        filters.min_stock = parseInt(minStock);
      }

      if (maxStock) {
        filters.max_stock = parseInt(maxStock);
      }

      const response = await createProductExport(token, {
        format,
        limit,
        filters
      });

      toast.success(t('Export started successfully'), {
        description: t(`Export ID: ${response.export_id}`)
      });

      // Reload exports list
      loadExports();
      
      // Reset form
      resetForm();
      
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(t('Export failed'), {
        description: error.response?.data?.message || t('An error occurred during export')
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
    setStatus('all');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinStock('');
    setMaxStock('');
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
      
      toast.success(t('admin.products.fileDownloadedSuccessfully'));
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t('admin.products.failedToDownloadFile'));
    }
  };

  const handleDelete = async (exportId: string) => {
    if (!token) return;

    try {
      await deleteExport(token, exportId);
      toast.success(t('admin.products.exportDeletedSuccessfully'));
      loadExports();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('admin.products.failedToDeleteExport'));
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

  const getProductStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: t('Active') },
      inactive: { color: 'bg-gray-100 text-gray-800', label: t('Inactive') },
      draft: { color: 'bg-amber-100 text-amber-800', label: t('Draft') },
      archived: { color: 'bg-red-100 text-red-800', label: t('Archived') },
      out_of_stock: { color: 'bg-orange-100 text-orange-800', label: t('Out of Stock') }
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
                <span>{t('admin.products.exportProducts')}</span>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Download className="w-6 h-6 text-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <span>{t('admin.products.exportProducts')}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className={`text-slate-600 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {t('admin.products.exportProductsDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6 px-1">
          {/* Format Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="space-y-4"
          >
            <Label className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
              {isRTL ? (
                <>
                  <span>{t('admin.products.exportFormat')}</span>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span>{t('admin.products.exportFormat')}</span>
                </>
              )}
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'excel',
                  label: t('admin.products.exportExcel'),
                  description: t('admin.products.exportExcelDescription'),
                  icon: Table,
                  color: 'green',
                },
                {
                  id: 'csv',
                  label: t('admin.products.exportCSV'),
                  description: t('admin.products.exportCSVDescription'),
                  icon: FileText,
                  color: 'blue',
                },
                {
                  id: 'json',
                  label: t('admin.products.exportJSON'),
                  description: t('admin.products.exportJSONDescription'),
                  icon: Database,
                  color: 'purple',
                },
              ].map((formatOption) => {
                const Icon = formatOption.icon;
                return (
                  <motion.div
                    key={formatOption.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${
                        format === formatOption.id
                          ? 'ring-2 ring-primary bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20'
                          : 'hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100/50 dark:hover:from-slate-800/20 dark:hover:to-slate-700/10'
                      } rounded-2xl shadow-lg hover:shadow-xl`}
                      onClick={() => setFormat(formatOption.id as any)}
                    >
                      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -translate-y-10 translate-x-10"></div>
                      <CardContent className="relative p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${formatOption.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100">{formatOption.label}</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {formatOption.description}
                            </p>
                          </div>
                          {format === formatOption.id && (
                            <div className="p-2 bg-primary/20 rounded-xl">
                              <CheckCircle className="w-5 h-5 text-primary" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <Separator className="my-6" />

          {/* Export Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-4"
          >
            <Label className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
              {isRTL ? (
                <>
                  <span>{t('admin.products.exportOptions')}</span>
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                    <Filter className="w-5 h-5 text-blue-600" />
                  </div>
                  <span>{t('admin.products.exportOptions')}</span>
                </>
              )}
            </Label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recordLimit" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.recordLimit')}</Label>
                <Input
                  id="recordLimit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value) || 1000)}
                  min="1"
                  max="10000"
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60"
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.filterByCategory')}</Label>
                <Input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={t('admin.products.enterCategoryName')}
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60"
                />
              </div>
            </div>
          </motion.div>

          <Separator className="my-6" />

          {/* Advanced Filters */}
          <div className="space-y-4">
            <Label className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
              {isRTL ? (
                <>
                  <span>{t('admin.products.advancedFilters')}</span>
                  <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl">
                    <Filter className="w-5 h-5 text-emerald-600" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl">
                    <Filter className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span>{t('admin.products.advancedFilters')}</span>
                </>
              )}
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productStatus" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.productStatus')}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60">
                    <SelectValue placeholder={t('admin.products.allStatuses')} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2">
                    <SelectItem value="all" className="rounded-lg">{t('admin.products.allStatuses')}</SelectItem>
                    <SelectItem value="active" className="rounded-lg">{t('admin.products.active')}</SelectItem>
                    <SelectItem value="inactive" className="rounded-lg">{t('admin.products.inactive')}</SelectItem>
                    <SelectItem value="draft" className="rounded-lg">{t('admin.products.draft')}</SelectItem>
                    <SelectItem value="archived" className="rounded-lg">{t('admin.products.archived')}</SelectItem>
                    <SelectItem value="out_of_stock" className="rounded-lg">{t('admin.products.outOfStock')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="createdAfter" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.createdAfter')}</Label>
                <Input
                  id="createdAfter"
                  type="date"
                  value={createdAfter}
                  onChange={(e) => setCreatedAfter(e.target.value)}
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.minPrice')}</Label>
                <Input
                  id="minPrice"
                  type="number"
                  step="0.01"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60"
                />
              </div>
              <div>
                <Label htmlFor="maxPrice" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.maxPrice')}</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  step="0.01"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="999999.99"
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStock" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.minStock')}</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={minStock}
                  onChange={(e) => setMinStock(e.target.value)}
                  placeholder="0"
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60"
                />
              </div>
              <div>
                <Label htmlFor="maxStock" className="text-sm font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">{t('admin.products.maxStock')}</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={maxStock}
                  onChange={(e) => setMaxStock(e.target.value)}
                  placeholder="9999"
                  className="h-11 border-slate-200 focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-300 hover:border-primary/60"
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{t('admin.products.exportingProducts')}</span>
                <span className="text-slate-600 dark:text-slate-400">50%</span>
              </div>
              <Progress value={50} className="h-2 bg-slate-200 dark:bg-slate-700" />
            </div>
          )}

          {/* Export History */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative">
              <CardTitle className={`flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                {t('admin.products.exportHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {isLoadingExports ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">{t('admin.products.loadingExports')}</p>
                  </div>
                </div>
              ) : exports.length === 0 ? (
                <Alert className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-800/30 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    {t('admin.products.noExportsFound')}
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
                            {exportItem.records_count} {t('admin.products.records')} • {formatFileSize(exportItem.file_size)}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                            {t('admin.products.created')}: {new Date(exportItem.created_at).toLocaleString()}
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
                            {t(`admin.products.${exportItem.status}`)}
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
                <span className="font-semibold">{t('admin.products.exporting')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-semibold">{t('admin.products.exportNow')}</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewExportProducts;