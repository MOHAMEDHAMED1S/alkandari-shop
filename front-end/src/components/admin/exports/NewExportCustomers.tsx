import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  Database,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Trash2,
  Calendar,
  Users,
  Table
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import { 
  createCustomerExport, 
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

interface NewExportCustomersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewExportCustomers: React.FC<NewExportCustomersProps> = ({ open, onOpenChange }) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';
  
  // Export creation state
  const [format, setFormat] = useState<'json' | 'csv' | 'excel'>('excel');
  const [limit, setLimit] = useState<number>(1000);
  const [createdAfter, setCreatedAfter] = useState<string>('');
  const [createdBefore, setCreatedBefore] = useState<string>('');
  const [hasOrders, setHasOrders] = useState<boolean | null>(null);
  
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
        type: 'customers',
        per_page: 10 
      });
      setExports(response.data || []);
    } catch (error) {
      console.error('Error loading exports:', error);
      toast.error(isRTL ? 'فشل في تحميل تاريخ التصدير' : 'Failed to load export history');
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
      
      if (hasOrders !== null) {
        filters.has_orders = hasOrders;
      }

      const response = await createCustomerExport(token, {
        format,
        limit,
        filters
      });

      toast.success(isRTL ? 'تم بدء التصدير بنجاح' : 'Export started successfully', {
        description: isRTL ? `معرف التصدير: ${response.export_id}` : `Export ID: ${response.export_id}`
      });

      // Reload exports list
      loadExports();
      
      // Reset form
      resetForm();
      
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(isRTL ? 'فشل في التصدير' : 'Export failed', {
        description: error.response?.data?.message || (isRTL ? 'حدث خطأ أثناء التصدير' : 'An error occurred during export')
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
    setHasOrders(null);
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
      
      toast.success(isRTL ? 'تم تحميل الملف بنجاح' : 'File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(isRTL ? 'فشل في تحميل الملف' : 'Failed to download file');
    }
  };

  const handleDelete = async (exportId: string) => {
    if (!token) return;

    try {
      await deleteExport(token, exportId);
      toast.success(isRTL ? 'تم حذف التصدير بنجاح' : 'Export deleted successfully');
      loadExports();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(isRTL ? 'فشل في حذف التصدير' : 'Failed to delete export');
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

  const getCustomerTypeBadge = (hasOrders: boolean) => {
    return hasOrders 
      ? { color: 'bg-green-100 text-green-800', label: isRTL ? 'عملاء لديهم طلبات' : 'Customers with orders' }
      : { color: 'bg-blue-100 text-blue-800', label: isRTL ? 'عملاء بدون طلبات' : 'Customers without orders' };
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
                <span>{isRTL ? 'تصدير العملاء' : 'Export Customers'}</span>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <span>{isRTL ? 'تصدير العملاء' : 'Export Customers'}</span>
              </>
            )}
          </DialogTitle>
          <DialogDescription className={`text-slate-600 dark:text-slate-400 ${isRTL ? 'text-right' : 'text-left'}`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
            {isRTL ? 'تصدير بيانات العملاء بتنسيقات مختلفة مع إمكانية التصفية المتقدمة' : 'Export customer data in different formats with advanced filtering options'}
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
            <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{isRTL ? 'تنسيق التصدير' : 'Export Format'}</Label>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'excel',
                  label: isRTL ? 'Excel' : 'Excel',
                  description: isRTL ? 'ملف Excel قابل للتحرير مع تنسيق متقدم' : 'Editable Excel file with advanced formatting',
                  icon: Table,
                  color: 'green',
                },
                {
                  id: 'csv',
                  label: isRTL ? 'CSV' : 'CSV',
                  description: isRTL ? 'ملف CSV بسيط وسهل الاستيراد' : 'Simple CSV file easy to import',
                  icon: FileText,
                  color: 'blue',
                },
                {
                  id: 'json',
                  label: isRTL ? 'JSON' : 'JSON',
                  description: isRTL ? 'ملف JSON للمطورين والتحليل المتقدم' : 'JSON file for developers and advanced analysis',
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
              <CardTitle className={`flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{isRTL ? 'خيارات التصدير' : 'Export Options'}</CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{isRTL ? 'حد السجلات' : 'Record Limit'}</Label>
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
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>{isRTL ? 'نوع العميل' : 'Customer Type'}</Label>
                  <Select
                    value={hasOrders === null ? 'all' : hasOrders.toString()}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setHasOrders(null);
                      } else {
                        setHasOrders(value === 'true');
                      }
                    }}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <SelectValue placeholder={isRTL ? 'جميع العملاء' : 'All Customers'} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                      <SelectItem value="all" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{isRTL ? 'جميع العملاء' : 'All Customers'}</SelectItem>
                      <SelectItem value="true" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{isRTL ? 'عملاء لديهم طلبات' : 'Customers with orders'}</SelectItem>
                      <SelectItem value="false" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">{isRTL ? 'عملاء بدون طلبات' : 'Customers without orders'}</SelectItem>
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
                {isRTL ? 'المرشحات المتقدمة' : 'Advanced Filters'}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                    
                    {isRTL ? 'تم الإنشاء بعد' : 'Created After'}
                  </Label>
                  <Input
                    type="date"
                    value={createdAfter}
                    onChange={(e) => setCreatedAfter(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                 
                    {isRTL ? 'تم الإنشاء قبل' : 'Created Before'}
                  </Label>
                  <Input
                    type="date"
                    value={createdBefore}
                    onChange={(e) => setCreatedBefore(e.target.value)}
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export History */}
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
            <CardHeader className="relative">
              <CardTitle className={`flex items-center gap-2 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                <Clock className="w-5 h-5" />
                {isRTL ? 'تاريخ التصدير' : 'Export History'}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {isLoadingExports ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-2 text-slate-600 dark:text-slate-400">{isRTL ? 'جاري تحميل التصديرات...' : 'Loading exports...'}</span>
                </div>
              ) : exports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 dark:text-slate-400">{isRTL ? 'لم يتم العثور على تصديرات' : 'No exports found'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exports.map((exportItem) => (
                    <div
                      key={exportItem.id}
                      className="flex items-center justify-between p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        {getFormatIcon(exportItem.format)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white">
                              {exportItem.file_name || `${exportItem.format.toUpperCase()} Export`}
                            </span>
                            {getStatusIcon(exportItem.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                            <span>{exportItem.records_count} {isRTL ? 'سجل' : 'records'}</span>
                            <span>{formatFileSize(exportItem.file_size)}</span>
                            <span>{isRTL ? 'تم الإنشاء' : 'Created'}: {new Date(exportItem.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {exportItem.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(exportItem.id)}
                            className="rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(exportItem.id)}
                          className="rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex-shrink-0 pt-4 relative">
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="min-w-[150px] rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? 'جاري التصدير...' : 'Exporting...'}
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  {isRTL ? 'بدء التصدير' : 'Start Export'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewExportCustomers;