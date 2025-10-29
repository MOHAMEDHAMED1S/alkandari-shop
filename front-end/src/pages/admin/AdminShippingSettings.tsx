import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Truck, Save, RefreshCw, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveShippingCost, updateShippingCost } from '@/lib/api';

const AdminShippingSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [shippingCost, setShippingCost] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [currentShippingData, setCurrentShippingData] = useState<any>(null);

  // Function to convert numbers to Arabic numerals
  const toArabicNumerals = (num: string | number): string => {
    if (i18n.language !== 'ar') return num.toString();
    
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
  };

  // Function to get localized currency
  const getLocalizedCurrency = (currency: string): string => {
    if (i18n.language === 'ar') {
      return 'د.ك'; // Arabic currency symbol
    }
    return currency; // English currency
  };

  // Fetch current shipping cost
  const fetchShippingCost = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      const response = await getActiveShippingCost(token);
      if (response.success) {
        setCurrentShippingData(response.data);
        setShippingCost(response.data.cost);
      }
    } catch (error: any) {
      console.error('Error fetching shipping cost:', error);
      if (error.response?.status === 404) {
        // No active shipping cost found, start with empty
        setShippingCost('0');
      } else {
        toast.error(isRTL ? 'خطأ في جلب مصاريف الشحن' : 'Error fetching shipping cost');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update shipping cost
  const handleUpdateShippingCost = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        toast.error(isRTL ? 'يجب تسجيل الدخول أولاً' : 'Please login first');
        return;
      }

      const costValue = parseFloat(shippingCost);
      if (isNaN(costValue) || costValue < 0) {
        toast.error(isRTL ? 'يجب إدخال قيمة صحيحة لمصاريف الشحن' : 'Please enter a valid shipping cost');
        return;
      }

      const response = await updateShippingCost(token, costValue);
      if (response.success) {
        setCurrentShippingData(response.data);
        toast.success(isRTL ? 'تم تحديث مصاريف الشحن بنجاح' : 'Shipping cost updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating shipping cost:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat();
        toast.error(errorMessages[0] as string);
      } else {
        toast.error(isRTL ? 'خطأ في تحديث مصاريف الشحن' : 'Error updating shipping cost');
      }
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchShippingCost();
  }, []);

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6"
      >
        {isRTL ? (
          <>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex justify-end order-1 lg:order-2"
            >
              <h1 className="pb-2 text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                {isRTL ? 'إعدادات مصاريف الشحن' : 'Shipping Cost Settings'}
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-1"
            >
              <Link to="/admin/settings">
                <Button variant="outline" className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto">
       
                  <span className="font-semibold">{isRTL ? 'العودة للإعدادات' : 'Back to Settings'}</span>
                </Button>
              </Link>
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
                {isRTL ? 'إعدادات مصاريف الشحن' : 'Shipping Cost Settings'}
              </h1>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex flex-col lg:flex-row gap-2 w-full lg:w-auto order-2 lg:order-2"
            >
              <Link to="/admin/settings">
                <Button variant="outline" className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl w-full lg:w-auto">
                  
                  <span className="font-semibold">{isRTL ? 'العودة للإعدادات' : 'Back to Settings'}</span>
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Current Shipping Cost Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border-green-200/50 dark:border-green-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          
          <CardHeader className="relative p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              {isRTL ? (
                <>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <CardTitle className="text-xl font-semibold text-green-900 dark:text-green-100">
                      {isRTL ? 'مصاريف الشحن الحالية' : 'Current Shipping Cost'}
                    </CardTitle>
                
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg">
                    <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center shadow-lg">
                    <Truck className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <CardTitle className="text-xl font-semibold text-green-900 dark:text-green-100">
                      {isRTL ? 'مصاريف الشحن الحالية' : 'Current Shipping Cost'}
                    </CardTitle>
          
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative p-6 pt-0">
            {loading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className={`text-3xl font-bold text-green-800 dark:text-green-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                {currentShippingData ? (
                  <>
                    {toArabicNumerals(currentShippingData.cost)} {getLocalizedCurrency('KWD')}
                  </>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 text-lg">
                    {isRTL ? 'لم يتم تحديد مصاريف شحن' : 'No shipping cost set'}
                  </span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Update Shipping Cost Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-slate-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          
          <CardHeader className="relative p-6">
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              {isRTL ? (
                <>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {isRTL ? 'تحديث مصاريف الشحن' : 'Update Shipping Cost'}
                    </CardTitle>
                
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center shadow-lg">
                    <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className={`${isRTL ? 'text-right' : 'text-left'}`}>
                    <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                      {isRTL ? 'تحديث مصاريف الشحن' : 'Update Shipping Cost'}
                    </CardTitle>
               
                  </div>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="relative p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shipping-cost" className={`text-sm font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                {isRTL ? 'مصاريف الشحن (د.ك)' : 'Shipping Cost (KWD)'}
              </Label>
              <Input
                id="shipping-cost"
                type="number"
                step="0.01"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(e.target.value)}
                placeholder={isRTL ? 'أدخل مصاريف الشحن' : 'Enter shipping cost'}
                className={`rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary ${isRTL ? 'text-right' : 'text-left'}`}
                disabled={loading}
              />
            </div>

            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Button
                onClick={handleUpdateShippingCost}
                disabled={saving || loading}
                className="group hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving 
                  ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                  : (isRTL ? 'حفظ التغييرات' : 'Save Changes')
                }
              </Button>

              <Button
                variant="outline"
                onClick={fetchShippingCost}
                disabled={loading}
                className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {isRTL ? 'تحديث' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 border-amber-200/50 dark:border-amber-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-400/5 rounded-full translate-y-8 -translate-x-8"></div>
          
          <CardContent className="relative p-6">
            <div className={`text-sm text-amber-800 dark:text-amber-200 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="font-medium mb-2">
                {isRTL ? 'ملاحظات مهمة:' : 'Important Notes:'}
              </p>
              <ul className={`space-y-1 ${isRTL ? 'list-disc list-inside' : 'list-disc list-inside'}`}>
                <li>
                  {isRTL 
                    ? 'مصاريف الشحن موحدة لجميع الطلبات بغض النظر عن الموقع أو المسافة'
                    : 'Shipping costs are unified for all orders regardless of location or distance'
                  }
                </li>
                <li>
                  {isRTL 
                    ? 'سيتم تطبيق مصاريف الشحن الجديدة على جميع الطلبات الجديدة فوراً'
                    : 'New shipping costs will be applied to all new orders immediately'
                  }
                </li>
                <li>
                  {isRTL 
                    ? 'يمكن تحديد مصاريف الشحن بقيمة صفر للشحن المجاني'
                    : 'You can set shipping cost to zero for free shipping'
                  }
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminShippingSettings;