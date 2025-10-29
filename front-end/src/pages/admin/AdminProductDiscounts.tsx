import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import {
  getProductDiscounts,
  getProductDiscountStatistics,
  createProductDiscount,
  updateProductDiscount,
  deleteProductDiscount,
  toggleProductDiscountStatus,
  duplicateProductDiscount,
  getAffectedProductsByDiscount,
  getProducts,
  ProductDiscount,
  ProductDiscountStatistics,
  Product
} from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Loader2, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  Power,
  Calendar,
  Percent,
  DollarSign,
  Package,
  TrendingUp,
  Filter,
  ArrowLeft,
  RefreshCw,
  Tag as TagIcon
} from 'lucide-react';
import { toast } from 'sonner';

const AdminProductDiscounts: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  // State
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<ProductDiscount[]>([]);
  const [statistics, setStatistics] = useState<ProductDiscountStatistics | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [applyToFilter, setApplyToFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAffectedProductsDialog, setShowAffectedProductsDialog] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<ProductDiscount | null>(null);
  const [affectedProducts, setAffectedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    apply_to: 'all_products' as 'all_products' | 'specific_products',
    product_ids: [] as number[],
    is_active: true,
    starts_at: '',
    expires_at: '',
    priority: 0,
  });

  useEffect(() => {
    if (token) {
      fetchDiscounts();
      fetchStatistics();
      fetchAllProducts();
    }
  }, [token, search, statusFilter, typeFilter, applyToFilter, currentPage]);

  const fetchDiscounts = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await getProductDiscounts(token, {
        page: currentPage,
        per_page: 15,
        search: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        discount_type: typeFilter !== 'all' ? typeFilter : undefined,
        apply_to: applyToFilter !== 'all' ? applyToFilter : undefined,
      });
      
      if (response.success) {
        setDiscounts(response.data.discounts.data);
        setTotalPages(response.data.discounts.last_page);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
      toast.error(isRTL ? 'خطأ في تحميل الخصومات' : 'Error loading discounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!token) return;
    try {
      const response = await getProductDiscountStatistics(token);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchAllProducts = async () => {
    if (!token) return;
    try {
      const response = await getProducts({ per_page: 1000 });
      if (response.success) {
        // API returns { success, data: { current_page, data: [...], ... } }
        const products = (response.data as any)?.data || response.data?.products || [];
        setAllProducts(products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]); // Set empty array on error
    }
  };

  const fetchAffectedProducts = async (id: number) => {
    if (!token) return;
    try {
      const response = await getAffectedProductsByDiscount(token, id);
      if (response.success) {
        setAffectedProducts(response.data.products.data);
      }
    } catch (error) {
      console.error('Error fetching affected products:', error);
    }
  };

  const handleCreate = () => {
    setSelectedDiscount(null);
    setFormData({
      name: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      apply_to: 'all_products',
      product_ids: [],
      is_active: true,
      starts_at: '',
      expires_at: '',
      priority: 0,
    });
    setShowFormDialog(true);
  };

  const handleEdit = (discount: ProductDiscount) => {
    setSelectedDiscount(discount);
    setFormData({
      name: discount.name,
      description: discount.description || '',
      discount_type: discount.discount_type,
      discount_value: parseFloat(discount.discount_value),
      apply_to: discount.apply_to,
      product_ids: discount.products.map(p => p.id),
      is_active: discount.is_active,
      starts_at: discount.starts_at ? discount.starts_at.slice(0, 16) : '',
      expires_at: discount.expires_at ? discount.expires_at.slice(0, 16) : '',
      priority: discount.priority,
    });
    setShowFormDialog(true);
  };

  const handleSubmit = async () => {
    if (!token) return;
    
    if (!formData.name) {
      toast.error(isRTL ? 'يرجى إدخال اسم الخصم' : 'Please enter discount name');
      return;
    }
    
    if (formData.discount_value <= 0) {
      toast.error(isRTL ? 'قيمة الخصم يجب أن تكون أكبر من صفر' : 'Discount value must be greater than zero');
      return;
    }
    
    if (formData.apply_to === 'specific_products' && formData.product_ids.length === 0) {
      toast.error(isRTL ? 'يرجى اختيار منتج واحد على الأقل' : 'Please select at least one product');
      return;
    }

    try {
      const data = {
        ...formData,
        starts_at: formData.starts_at || null,
        expires_at: formData.expires_at || null,
      };

      if (selectedDiscount) {
        await updateProductDiscount(token, selectedDiscount.id, data);
        toast.success(isRTL ? 'تم تحديث الخصم بنجاح' : 'Discount updated successfully');
      } else {
        await createProductDiscount(token, data);
        toast.success(isRTL ? 'تم إنشاء الخصم بنجاح' : 'Discount created successfully');
      }
      
      setShowFormDialog(false);
      fetchDiscounts();
      fetchStatistics();
    } catch (error: any) {
      console.error('Error saving discount:', error);
      toast.error(error.response?.data?.message || (isRTL ? 'خطأ في حفظ الخصم' : 'Error saving discount'));
    }
  };

  const handleDelete = async () => {
    if (!token || !selectedDiscount) return;
    try {
      await deleteProductDiscount(token, selectedDiscount.id);
      toast.success(isRTL ? 'تم حذف الخصم بنجاح' : 'Discount deleted successfully');
      setShowDeleteDialog(false);
      fetchDiscounts();
      fetchStatistics();
    } catch (error) {
      console.error('Error deleting discount:', error);
      toast.error(isRTL ? 'خطأ في حذف الخصم' : 'Error deleting discount');
    }
  };

  const handleToggleStatus = async (discount: ProductDiscount) => {
    if (!token) return;
    try {
      await toggleProductDiscountStatus(token, discount.id);
      toast.success(isRTL ? 'تم تحديث حالة الخصم' : 'Discount status updated');
      fetchDiscounts();
      fetchStatistics();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(isRTL ? 'خطأ في تحديث الحالة' : 'Error updating status');
    }
  };

  const handleDuplicate = async (discount: ProductDiscount) => {
    if (!token) return;
    try {
      await duplicateProductDiscount(token, discount.id);
      toast.success(isRTL ? 'تم نسخ الخصم بنجاح' : 'Discount duplicated successfully');
      fetchDiscounts();
      fetchStatistics();
    } catch (error) {
      console.error('Error duplicating discount:', error);
      toast.error(isRTL ? 'خطأ في نسخ الخصم' : 'Error duplicating discount');
    }
  };

  const handleViewAffectedProducts = async (discount: ProductDiscount) => {
    setSelectedDiscount(discount);
    await fetchAffectedProducts(discount.id);
    setShowAffectedProductsDialog(true);
  };

  const getStatusBadge = (discount: ProductDiscount) => {
    if (!discount.is_active) {
      return <Badge variant="secondary">{isRTL ? 'غير نشط' : 'Inactive'}</Badge>;
    }
    
    const now = new Date();
    const startsAt = discount.starts_at ? new Date(discount.starts_at) : null;
    const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;
    
    if (startsAt && now < startsAt) {
      return <Badge className="bg-blue-500">{isRTL ? 'قادم' : 'Upcoming'}</Badge>;
    }
    
    if (expiresAt && now > expiresAt) {
      return <Badge variant="destructive">{isRTL ? 'منتهي' : 'Expired'}</Badge>;
    }
    
    return <Badge className="bg-green-500">{isRTL ? 'نشط' : 'Active'}</Badge>;
  };

  return (
    <div className="space-y-6 p-1">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        {isRTL ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-right order-1 sm:order-2"
            >
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                إدارة خصومات المنتجات
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row lg:flex-row items-stretch lg:items-end gap-2 sm:gap-3 w-full lg:w-auto order-2 sm:order-1"
            >
              <Button
                onClick={fetchDiscounts}
                disabled={loading}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 sm:w-5 h-4 sm:h-5 ms-2 sm:ms-3 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">تحديث</span>
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                <Plus className="h-4 sm:h-5 w-4 sm:w-5 ms-2" />
                <span className="hidden sm:inline">إضافة خصم جديد</span>
                <span className="sm:hidden">إضافة خصم</span>
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
              <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Product Discounts Management
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row lg:flex-row items-stretch lg:items-end gap-2 sm:gap-3 w-full lg:w-auto"
            >
              <Button
                onClick={fetchDiscounts}
                disabled={loading}
                variant="outline"
                size="sm"
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <RefreshCw className={`w-4 sm:w-5 h-4 sm:h-5 me-2 sm:me-3 transition-transform duration-300 group-hover:rotate-180 ${loading ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Refresh</span>
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white shadow-xl hover:shadow-2xl rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 hover:scale-105 transition-all duration-300 text-sm sm:text-base"
              >
                <Plus className="h-4 sm:h-5 w-4 sm:w-5 me-2" />
                <span className="hidden sm:inline">Add New Discount</span>
                <span className="sm:hidden">Add Discount</span>
              </Button>
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
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
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
              
              <CardContent className="relative p-1">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 text-right">
                          {isRTL ? 'إجمالي الخصومات' : 'Total Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 text-right">
                          {statistics.total_discounts}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'إجمالي الخصومات' : 'Total Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.total_discounts}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <TagIcon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
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
              
              <CardContent className="relative p-1">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Power className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 text-right">
                          {isRTL ? 'الخصومات النشطة' : 'Active Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 text-right">
                          {statistics.active_discounts}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'الخصومات النشطة' : 'Active Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.active_discounts}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Power className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
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
              
              <CardContent className="relative p-1">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Percent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 text-right">
                          {isRTL ? 'خصم نسبة مئوية' : 'Percentage Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 text-right">
                          {statistics.percentage_discounts}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'خصم نسبة مئوية' : 'Percentage Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.percentage_discounts}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Percent className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
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
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              
              <CardContent className="relative p-1">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 text-right">
                          {isRTL ? 'خصم مبلغ ثابت' : 'Fixed Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 text-right">
                          {statistics.fixed_discounts}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'خصم مبلغ ثابت' : 'Fixed Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.fixed_discounts}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
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
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group col-span-2 md:col-span-1"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-emerald-400/5 rounded-full translate-y-8 -translate-x-8 group-hover:scale-110 transition-transform duration-300"></div>
              
              <CardContent className="relative p-1">
                <div className="flex items-center justify-between mb-3">
                  {isRTL ? (
                    <>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
                      </div>
                      <div className="text-right flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2 text-right">
                          {isRTL ? 'منتجات لديها خصم' : 'Products with Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300 text-right">
                          {statistics.products_with_discounts}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-left">
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1 sm:mb-2">
                          {isRTL ? 'منتجات لديها خصم' : 'Products with Discounts'}
                        </p>
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                          {statistics.products_with_discounts}
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-7 lg:w-7 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300" />
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
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-slate-50/50 to-slate-100/30 dark:from-slate-900/20 dark:to-slate-800/10 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/30 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="relative"
            >
              <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <Input
                placeholder={isRTL ? 'البحث في الخصومات...' : 'Search discounts...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${isRTL ? 'pr-12' : 'pl-12'} h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 text-base`}
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
            >
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder={isRTL ? 'فلترة حسب الحالة' : 'Filter by status'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      {isRTL ? 'الكل' : 'All'}
                    </div>
                  </SelectItem>
                  <SelectItem value="active" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      {isRTL ? 'نشط' : 'Active'}
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </div>
                  </SelectItem>
                  <SelectItem value="expired" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      {isRTL ? 'منتهي' : 'Expired'}
                    </div>
                  </SelectItem>
                  <SelectItem value="upcoming" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      {isRTL ? 'قادم' : 'Upcoming'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
            >
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder={isRTL ? 'فلترة حسب النوع' : 'Filter by type'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      {isRTL ? 'الكل' : 'All'}
                    </div>
                  </SelectItem>
                  <SelectItem value="percentage" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="w-3 h-3 text-purple-500" />
                      {isRTL ? 'نسبة مئوية' : 'Percentage'}
                    </div>
                  </SelectItem>
                  <SelectItem value="fixed" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-amber-500" />
                      {isRTL ? 'مبلغ ثابت' : 'Fixed Amount'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
            >
              <Select value={applyToFilter} onValueChange={setApplyToFilter}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300">
                  <SelectValue placeholder={isRTL ? 'فلترة حسب التطبيق' : 'Filter by application'} />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                      {isRTL ? 'الكل' : 'All'}
                    </div>
                  </SelectItem>
                  <SelectItem value="all_products" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="w-3 h-3 text-blue-500" />
                      {isRTL ? 'جميع المنتجات' : 'All Products'}
                    </div>
                  </SelectItem>
                  <SelectItem value="specific_products" className="rounded-lg">
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-3 h-3 text-green-500" />
                      {isRTL ? 'منتجات محددة' : 'Specific Products'}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Discounts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          
          <CardHeader className="relative">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {isRTL ? 'قائمة الخصومات' : 'Discounts List'}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </p>
              </div>
            ) : discounts.length === 0 ? (
              <div className="text-center py-12">
                <TagIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {isRTL ? 'لا توجد خصومات' : 'No Discounts Found'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {isRTL ? 'لم يتم العثور على أي خصومات. أضف خصمًا جديدًا للبدء.' : 'No discounts found. Add a new discount to get started.'}
                </p>
                <Button onClick={handleCreate} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {isRTL ? 'إضافة خصم جديد' : 'Add New Discount'}
                </Button>
              </div>
            ) : (
            <>
              {/* Desktop Table View - Hidden on Mobile */}
              <div className="hidden md:block rounded-xl border border-slate-200/50 dark:border-slate-800/30 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-100 hover:to-slate-100 dark:hover:from-slate-800 dark:hover:to-slate-800">
                      <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">{isRTL ? 'الاسم' : 'Name'}</TableHead>
                      <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">{isRTL ? 'النوع' : 'Type'}</TableHead>
                      <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">{isRTL ? 'القيمة' : 'Value'}</TableHead>
                      <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">{isRTL ? 'التطبيق' : 'Apply To'}</TableHead>
                      <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">{isRTL ? 'الحالة' : 'Status'}</TableHead>
                      <TableHead className="text-center font-bold text-slate-900 dark:text-slate-100">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {discounts.map((discount, index) => (
                      <TableRow 
                        key={discount.id}
                        className="hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent dark:hover:from-slate-800/50 dark:hover:to-transparent transition-all duration-200"
                      >
                        <TableCell className="text-center font-medium text-slate-900 dark:text-slate-100">{discount.name}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {discount.discount_type === 'percentage' 
                              ? <Percent className="h-3 w-3 mr-1" />
                              : <DollarSign className="h-3 w-3 mr-1" />
                            }
                            {isRTL 
                              ? (discount.discount_type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت')
                              : (discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-bold">{Number(discount.discount_value).toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={discount.apply_to === 'all_products' ? 'default' : 'secondary'}>
                            {isRTL 
                              ? (discount.apply_to === 'all_products' ? 'جميع المنتجات' : `${discount.products.length} منتج`)
                              : (discount.apply_to === 'all_products' ? 'All Products' : `${discount.products.length} Products`)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">{getStatusBadge(discount)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(discount)}
                              title={isRTL ? 'تفعيل/تعطيل' : 'Toggle Status'}
                              className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-200 rounded-lg"
                            >
                              <Power className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewAffectedProducts(discount)}
                              title={isRTL ? 'المنتجات المتأثرة' : 'Affected Products'}
                              className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200 rounded-lg"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(discount)}
                              title={isRTL ? 'تعديل' : 'Edit'}
                              className="hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all duration-200 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDuplicate(discount)}
                              title={isRTL ? 'نسخ' : 'Duplicate'}
                              className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-all duration-200 rounded-lg"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDiscount(discount);
                                setShowDeleteDialog(true);
                              }}
                              title={isRTL ? 'حذف' : 'Delete'}
                              className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View - Hidden on Desktop */}
              <div className="md:hidden space-y-4">
                {discounts.map((discount) => (
                  <motion.div
                    key={discount.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-800/30 bg-white dark:bg-slate-900/50 p-4 shadow-sm"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 text-base">
                          {discount.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(discount)}
                          <Badge variant="outline" className="text-xs">
                            {discount.discount_type === 'percentage' 
                              ? <Percent className="h-3 w-3 mr-1" />
                              : <DollarSign className="h-3 w-3 mr-1" />
                            }
                            {isRTL 
                              ? (discount.discount_type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت')
                              : (discount.discount_type === 'percentage' ? 'Percentage' : 'Fixed')}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {isRTL ? 'القيمة' : 'Value'}
                        </span>
                        <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {Number(discount.discount_value).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {isRTL ? 'التطبيق' : 'Apply To'}
                        </span>
                        <Badge variant={discount.apply_to === 'all_products' ? 'default' : 'secondary'} className="text-xs">
                          {isRTL 
                            ? (discount.apply_to === 'all_products' ? 'جميع المنتجات' : `${discount.products.length} منتج`)
                            : (discount.apply_to === 'all_products' ? 'All Products' : `${discount.products.length} Products`)}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-5 gap-1 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(discount)}
                        className="hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all duration-200 rounded-lg h-10"
                        title={isRTL ? 'تفعيل/تعطيل' : 'Toggle'}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAffectedProducts(discount)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all duration-200 rounded-lg h-10"
                        title={isRTL ? 'المنتجات' : 'Products'}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(discount)}
                        className="hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all duration-200 rounded-lg h-10"
                        title={isRTL ? 'تعديل' : 'Edit'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicate(discount)}
                        className="hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 transition-all duration-200 rounded-lg h-10"
                        title={isRTL ? 'نسخ' : 'Copy'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedDiscount(discount);
                          setShowDeleteDialog(true);
                        }}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-all duration-200 rounded-lg h-10"
                        title={isRTL ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/30">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium px-4 py-2 rounded-lg bg-primary/10 text-primary">
                      {isRTL ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-xl hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {isRTL ? 'التالي' : 'Next'}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
        </Card>
      </motion.div>

      {/* Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-3xl sm:rounded-3xl rounded-t-3xl border-slate-200/50 dark:border-slate-800/30 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {selectedDiscount 
                ? (isRTL ? 'تعديل الخصم' : 'Edit Discount')
                : (isRTL ? 'إضافة خصم جديد' : 'Add New Discount')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 ltr">
            {/* Basic Information Section */}
            <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TagIcon className="w-5 h-5 text-primary" />
                {isRTL ? 'معلومات أساسية' : 'Basic Information'}
              </h3>
              
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  {isRTL ? 'اسم الخصم' : 'Discount Name'}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={isRTL ? 'مثال: خصم الجمعة البيضاء' : 'e.g., Black Friday Sale'}
                  className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  {isRTL ? 'الوصف' : 'Description'}
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {isRTL ? 'اختياري' : 'Optional'}
                  </span>
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder={isRTL ? 'وصف الخصم (اختياري)' : 'Discount description (optional)'}
                  className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300 min-h-[80px]"
                />
              </div>
            </div>
            
            {/* Discount Details Section */}
            <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Percent className="w-5 h-5 text-purple-500" />
                {isRTL ? 'تفاصيل الخصم' : 'Discount Details'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    {isRTL ? 'نوع الخصم' : 'Discount Type'}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select 
                    value={formData.discount_type}
                    onValueChange={(value: 'percentage' | 'fixed') => setFormData({...formData, discount_type: value})}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="percentage" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <Percent className="w-4 h-4 text-purple-500" />
                          {isRTL ? 'نسبة مئوية (%)' : 'Percentage (%)'}
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed" className="rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-500" />
                          {isRTL ? 'مبلغ ثابت (د.ك)' : 'Fixed Amount (KWD)'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    {isRTL ? 'قيمة الخصم' : 'Discount Value'}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})}
                    placeholder={formData.discount_type === 'percentage' ? '50' : '5.000'}
                    className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300"
                  />
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    {formData.discount_type === 'percentage' 
                      ? (isRTL ? 'أدخل نسبة من 0 إلى 100' : 'Enter value from 0 to 100')
                      : (isRTL ? 'أدخل المبلغ بالدينار الكويتي' : 'Enter amount in KWD')}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Product Application Section */}
            <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                {isRTL ? 'تطبيق الخصم' : 'Apply Discount'}
              </h3>
              
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  {isRTL ? 'التطبيق على' : 'Apply To'}
                  <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.apply_to}
                  onValueChange={(value: 'all_products' | 'specific_products') => setFormData({...formData, apply_to: value})}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all_products" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        {isRTL ? 'جميع المنتجات' : 'All Products'}
                      </div>
                    </SelectItem>
                    <SelectItem value="specific_products" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-green-500" />
                        {isRTL ? 'منتجات محددة' : 'Specific Products'}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.apply_to === 'specific_products' && (
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    {isRTL ? 'اختر المنتجات' : 'Select Products'}
                    <span className="text-red-500">*</span>
                  </Label>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 max-h-60 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-900/50">
                    {Array.isArray(allProducts) && allProducts.length > 0 ? allProducts.map((product) => (
                      <label 
                        key={product.id} 
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData.product_ids.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, product_ids: [...formData.product_ids, product.id]});
                            } else {
                              setFormData({...formData, product_ids: formData.product_ids.filter(id => id !== product.id)});
                            }
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">
                          {product.title}
                        </span>
                        <span className="text-xs text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md">
                          {product.price} {product.currency}
                        </span>
                      </label>
                    )) : (
                      <div className="text-center text-sm text-slate-500 py-8">
                        <Package className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                        {isRTL ? 'لا توجد منتجات متاحة' : 'No products available'}
                      </div>
                    )}
                  </div>
                  {formData.product_ids.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2">
                      {isRTL ? `تم اختيار ${formData.product_ids.length} منتج` : `${formData.product_ids.length} product(s) selected`}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {/* Schedule Section */}
            <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                {isRTL ? 'جدولة الخصم' : 'Discount Schedule'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    {isRTL ? 'تاريخ البداية' : 'Start Date'}
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {isRTL ? 'اختياري' : 'Optional'}
                    </span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({...formData, starts_at: e.target.value})}
                    className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {isRTL ? 'اترك فارغاً للبدء فوراً' : 'Leave empty to start immediately'}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    {isRTL ? 'تاريخ الانتهاء' : 'End Date'}
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {isRTL ? 'اختياري' : 'Optional'}
                    </span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {isRTL ? 'اترك فارغاً لعدم انتهاء الصلاحية' : 'Leave empty for no expiration'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Advanced Settings Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter className="w-5 h-5 text-slate-500" />
                {isRTL ? 'إعدادات متقدمة' : 'Advanced Settings'}
              </h3>
              
              <div>
                <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  {isRTL ? 'الأولوية' : 'Priority'}
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {isRTL ? 'اختياري' : 'Optional'}
                  </span>
                </Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value) || 0})}
                  placeholder="0"
                  className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-primary/20 bg-white/80 dark:bg-slate-800/80 transition-all duration-300"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {isRTL ? 'الخصم ذو الأولوية الأعلى سيتم تطبيقه أولاً (القيمة الافتراضية: 0)' : 'Higher priority discounts will be applied first (Default: 0)'}
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <Power className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                      {isRTL ? 'تفعيل الخصم' : 'Activate Discount'}
                    </Label>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {isRTL ? 'تفعيل/إلغاء تفعيل الخصم فوراً' : 'Enable/disable discount immediately'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowFormDialog(false)}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSubmit}
              className="rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isRTL ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-3xl border-slate-200/50 dark:border-slate-800/30 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-500" />
              {isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              {isRTL 
                ? `هل أنت متأكد من حذف الخصم "${selectedDiscount?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete the discount "${selectedDiscount?.name}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isRTL ? 'حذف' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Affected Products Dialog */}
      <Dialog open={showAffectedProductsDialog} onOpenChange={setShowAffectedProductsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto rounded-3xl sm:rounded-3xl rounded-t-3xl border-slate-200/50 dark:border-slate-800/30 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/50 w-[95vw] sm:w-full p-4 sm:p-6">
          <DialogHeader className="pb-3 sm:pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
              {isRTL ? 'المنتجات المتأثرة بالخصم' : 'Affected Products'}
            </DialogTitle>
            <DialogDescription className="text-base pt-2 font-medium text-slate-600 dark:text-slate-400">
              {selectedDiscount?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 ltr">
            {/* Products Section */}
            <div className="space-y-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {isRTL ? 'قائمة المنتجات' : 'Products List'}
              </h3>
              
              {affectedProducts.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {isRTL ? 'لا توجد منتجات' : 'No Products Found'}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {isRTL ? 'لم يتم العثور على منتجات متأثرة بهذا الخصم' : 'No products found for this discount'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {affectedProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="relative overflow-hidden rounded-xl border border-slate-200/50 dark:border-slate-800/30 bg-white dark:bg-slate-900/50 p-4 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex gap-4">
                        {product.images[0] ? (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                            <Package className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                            {product.title}
                          </h3>
                          <div className="space-y-2">
                            {product.has_discount ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-lg font-bold text-red-500">
                                    {product.discounted_price} {product.currency}
                                  </span>
                                  <span className="text-sm text-slate-500 line-through">
                                    {product.price_before_discount} {product.currency}
                                  </span>
                                </div>
                                <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm text-xs">
                                  {Math.round(product.discount_percentage || 0)}% {isRTL ? 'خصم' : 'OFF'}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                {product.price} {product.currency}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Summary Section */}
            {affectedProducts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  {isRTL ? 'ملخص الخصم' : 'Discount Summary'}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                        <Package className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {isRTL ? 'إجمالي المنتجات' : 'Total Products'}
                        </p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                          {affectedProducts.length}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                        <Percent className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {isRTL ? 'نوع الخصم' : 'Discount Type'}
                        </p>
                        <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {selectedDiscount?.discount_type === 'percentage' 
                            ? (isRTL ? 'نسبة مئوية' : 'Percentage')
                            : (isRTL ? 'مبلغ ثابت' : 'Fixed Amount')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowAffectedProductsDialog(false)}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              {isRTL ? 'إغلاق' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProductDiscounts;

