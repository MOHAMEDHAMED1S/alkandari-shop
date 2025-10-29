import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  X,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Star,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  BarChart3,
  Activity,
  Eye,
  Copy,
  Download,
  ShieldCheck,
  Globe
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Customer } from '@/lib/api';

import CustomerForm from './CustomerForm';

interface CustomerDetailsProps {
  customer: Customer;
  onClose: () => void;
  onUpdate: () => void;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, onClose, onUpdate }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Calculate customer status based on data
  const getCustomerStatus = (): 'active' | 'inactive' | 'vip' | 'new' => {
    if (!customer.is_active) return 'inactive';
    if (parseFloat(customer.total_spent) > 1000) return 'vip';
    if (customer.total_orders === 0) return 'new';
    return 'active';
  };

  const getCustomerType = (): 'regular' | 'vip' | 'new' => {
    if (parseFloat(customer.total_spent) > 1000) return 'vip';
    if (customer.total_orders === 0) return 'new';
    return 'regular';
  };

  const customerStatus = getCustomerStatus();
  const customerType = getCustomerType();

  // Get customer initials
  const getCustomerInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'vip': return 'default';
      case 'new': return 'default';
      default: return 'secondary';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'vip': return Star;
      case 'new': return Clock;
      default: return User;
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vip': return Star;
      case 'new': return Calendar;
      case 'regular': return User;
      default: return User;
    }
  };

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

  const handleDelete = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await deleteCustomer(customer.id);
      
      // if (response.success) {
      //   toast.success(t('admin.customers.deletedSuccessfully'));
      //   onUpdate();
      //   onClose();
      // } else {
      //   toast.error(response.message || t('admin.customers.errorOccurred'));
      // }

      // Mock success for now
      setTimeout(() => {
        toast.success(t('admin.customers.deletedSuccessfully'));
        onUpdate();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error(t('admin.customers.errorOccurred'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t('admin.customers.copiedToClipboard', { item: label }));
  };

  const StatusIcon = getStatusIcon(customerStatus);
  const TypeIcon = getTypeIcon(customerType);

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-4xl sm:max-w-6xl max-h-[90vh] mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50
          }}
        >
           <DialogHeader className="relative pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
             <div className="flex items-center justify-between" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
               {i18n.language === 'ar' ? (
                 <>
                   <div className="flex items-center gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowEditDialog(true)}
                       className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                     >
                       <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                       <span className="font-semibold">{t('common.edit')}</span>
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowDeleteDialog(true)}
                       className="group hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                     >
                       <Trash2 className="w-4 h-4 mr-2 text-red-600 group-hover:text-red-700 group-hover:scale-110 transition-all duration-300" />
                       <span className="font-semibold text-red-600 group-hover:text-red-700">{t('common.delete')}</span>
                     </Button>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className={`flex flex-col ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                       <DialogTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                         {i18n.language === 'ar' ? (
                           <>
                             {t('admin.customers.customerDetails')}
                             <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                               <User className="w-5 h-5 text-primary" />
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                               <User className="w-5 h-5 text-primary" />
                             </div>
                             {t('admin.customers.customerDetails')}
                           </>
                         )}
                       </DialogTitle>
                       <DialogDescription className="text-slate-600 dark:text-slate-400">
                         {t('admin.customers.customerDetailsDescription')}
                       </DialogDescription>
                     </div>
                   </div>
                 </>
               ) : (
                 <>
                   <div className="flex items-center gap-3">
                     <div className={`flex flex-col ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                       <DialogTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                         {i18n.language === 'ar' ? (
                           <>
                             {t('admin.customers.customerDetails')}
                             <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                               <User className="w-5 h-5 text-primary" />
                             </div>
                           </>
                         ) : (
                           <>
                             <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                               <User className="w-5 h-5 text-primary" />
                             </div>
                             {t('admin.customers.customerDetails')}
                           </>
                         )}
                       </DialogTitle>
                       <DialogDescription className="text-slate-600 dark:text-slate-400">
                         {t('admin.customers.customerDetailsDescription')}
                       </DialogDescription>
                     </div>
                   </div>
                   <div className="flex items-center gap-2">
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowEditDialog(true)}
                       className="group hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                     >
                       <Edit className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                       <span className="font-semibold">{t('common.edit')}</span>
                     </Button>
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setShowDeleteDialog(true)}
                       className="group hover:bg-gradient-to-r hover:from-red-100 hover:to-red-50 dark:hover:from-red-900/20 dark:hover:to-red-800/20 transition-all duration-300 hover:scale-105 rounded-xl px-4 py-2 shadow-md hover:shadow-lg"
                     >
                       <Trash2 className="w-4 h-4 mr-2 text-red-600 group-hover:text-red-700 group-hover:scale-110 transition-all duration-300" />
                       <span className="font-semibold text-red-600 group-hover:text-red-700">{t('common.delete')}</span>
                     </Button>
                   </div>
                 </>
               )}
             </div>
           </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(95vh-100px)] pr-1 sm:pr-2">
            <div className="space-y-4 sm:space-y-6 pb-8 sm:pb-12">
              {/* Customer Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardContent className="relative p-2 sm:p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-6">
                    <div className="relative">
                      <Avatar className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 border-2 sm:border-4 border-white shadow-2xl ring-2 sm:ring-4 ring-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-br from-primary to-primary/80 text-white">
                          {getCustomerInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2">
                        <Badge 
                          variant={getStatusBadgeVariant(customerStatus)}
                          className="rounded-full px-1 sm:px-2 md:px-3 py-0.5 sm:py-1 text-xs font-semibold shadow-lg"
                        >
                          <StatusIcon className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
                          {t(`admin.customers.statuses.${customerStatus}`)}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent mb-1 sm:mb-2 md:mb-3">{customer.name}</h2>
                      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                        <Badge variant="outline" className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-semibold bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                          <TypeIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          {t(`admin.customers.types.${customerType}`)}
                        </Badge>
                        <div className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-0.5 sm:py-1 rounded-xl">
                          ID: #{customer.id}
                        </div>
                      </div>
                      {customer.last_order_at && (
                        <div className="flex items-center gap-2 justify-center sm:justify-start p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-slate-600 dark:text-slate-400 font-semibold">{t('admin.customers.lastActivity')}:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{new Date(customer.last_order_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {/* Verification Badges */}
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mt-2">
                        {customer.email_verified && (
                          <Badge variant="outline" className="px-2 py-1 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {isRTL ? 'البريد موثق' : 'Email Verified'}
                          </Badge>
                        )}
                        {customer.phone_verified && (
                          <Badge variant="outline" className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            {isRTL ? 'الهاتف موثق' : 'Phone Verified'}
                          </Badge>
                        )}
                        {customer.preferred_language && (
                          <Badge variant="outline" className="px-2 py-1 text-xs font-semibold bg-purple-50 text-purple-700 border-purple-200">
                            <Globe className="w-3 h-3 mr-1" />
                            {customer.preferred_language.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 gap-6">
                {/* Contact Information */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden w-full border-r-4 border-r-blue-500 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative pb-3">
                              <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                                {i18n.language === 'ar' ? (
                                  <>
                                    {t('admin.customers.contactInformation')}
                                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                                      <Phone className="w-5 h-5 text-blue-600" />
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                                      <Phone className="w-5 h-5 text-blue-600" />
                                    </div>
                                    {t('admin.customers.contactInformation')}
                                  </>
                                )}
                              </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-0">
                      {customer.email && (
                        <div className="group p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-blue-600" />
                              <div>
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.email')}</div>
                                <div className="text-sm text-slate-900 dark:text-slate-100 font-medium">{customer.email}</div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(customer.email!, t('admin.customers.email'))}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-xl"
                            >
                              <Copy className="w-4 h-4 text-blue-600" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="group p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 hover:from-blue-100 hover:to-blue-200/50 dark:hover:from-blue-800/30 dark:hover:to-blue-700/20 transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50 shadow-md hover:shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <div className={`flex flex-col ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                              <div className={`text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('admin.customers.phone')}</div>
                              <div className={`text-sm sm:text-base text-blue-900 dark:text-blue-100 font-bold ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{customer.phone}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(customer.phone, t('admin.customers.phone'))}
                            className="opacity-0 group-hover:opacity-100 transition-all duration-300 h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-xl"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                          </Button>
                        </div>
                      </div>

                      {customer.address && (
                        <div className="group p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 hover:from-green-100 hover:to-green-200/50 dark:hover:from-green-800/30 dark:hover:to-green-700/20 transition-all duration-300 border border-green-200/50 dark:border-green-700/50 shadow-md hover:shadow-lg">
                          <div className={`flex items-center gap-2 sm:gap-3 mb-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                            {i18n.language === 'ar' ? (
                              <>
                                <span className={`text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('admin.customers.address')}</span>
                                <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                </div>
                                <span className={`text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}>{t('admin.customers.address')}</span>
                              </>
                            )}
                          </div>
                          <div className={`text-xs sm:text-sm text-green-900 dark:text-green-100 space-y-1 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>
                            {customer.address.street && <div className={`font-bold ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>{customer.address.street}</div>}
                            {customer.address.city && <div className={`font-medium ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>{customer.address.city}</div>}
                            {customer.address.governorate && <div className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>{customer.address.governorate}</div>}
                            {customer.address.postal_code && <div className={`text-xs text-green-600 dark:text-green-400 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} style={{ textAlign: i18n.language === 'ar' ? 'right' : 'left' }}>{customer.address.postal_code}</div>}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Statistics */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden w-full border-r-4 border-r-green-500 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative pb-3">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                        {i18n.language === 'ar' ? (
                          <>
                            {t('admin.customers.statistics')}
                            <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                              <BarChart3 className="w-5 h-5 text-green-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                              <BarChart3 className="w-5 h-5 text-green-600" />
                            </div>
                            {t('admin.customers.statistics')}
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Total Orders Card */}
                        <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="p-1 sm:p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                              <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-blue-600" />
                            </div>
                            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">
                              {toArabicNumerals(customer.total_orders || 0)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-blue-900 mb-1">
                              {t('admin.customers.totalOrders')}
                            </div>
                            <div className="text-xs text-blue-700">
                              {t('admin.customers.totalOrdersDescription')}
                            </div>
                          </div>
                        </div>

                        {/* Total Spent Card */}
                        <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="p-1 sm:p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-600" />
                            </div>
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-900">
                              {toArabicNumerals(parseFloat(customer.total_spent || '0').toFixed(1))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-green-900 mb-1">
                              {t('admin.customers.totalSpent')}
                            </div>
                            <div className="text-xs text-green-700">
                              {t('admin.customers.totalSpentDescription')}
                            </div>
                            <div className="text-xs text-green-600 font-medium mt-1">
                              {getLocalizedCurrency('KWD')}
                            </div>
                          </div>
                        </div>

                        {/* Average Order Value Card */}
                        <div className="p-2 sm:p-3 md:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <div className="p-1 sm:p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
                              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-600" />
                            </div>
                            <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900">
                              {toArabicNumerals(parseFloat(customer.average_order_value || '0').toFixed(1))}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-semibold text-purple-900 mb-1">
                              {t('admin.customers.averageOrderValue')}
                            </div>
                            <div className="text-xs text-purple-700">
                              {t('admin.customers.averageOrderValueDescription')}
                            </div>
                            <div className="text-xs text-purple-600 font-medium mt-1">
                              {getLocalizedCurrency('KWD')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-6" />

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {customer.last_order_at && (
                            <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.customers.lastOrderDate')}</span>
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                                {new Date(customer.last_order_at).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                              <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{isRTL ? 'تاريخ التسجيل' : 'Registration Date'}</span>
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                              {new Date(customer.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {customer.date_of_birth && (
                            <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-800/30 transition-all duration-300">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                                <span className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">{isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}</span>
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-purple-900 dark:text-purple-100">
                                {new Date(customer.date_of_birth).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          {customer.gender && (
                            <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-800/30 transition-all duration-300">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                                <span className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300">{isRTL ? 'الجنس' : 'Gender'}</span>
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-indigo-900 dark:text-indigo-100">
                                {customer.gender}
                              </span>
                            </div>
                          )}
                          
                          {customer.nationality && (
                            <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-800/30 transition-all duration-300">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600" />
                                <span className="text-xs sm:text-sm font-semibold text-pink-700 dark:text-pink-300">{isRTL ? 'الجنسية' : 'Nationality'}</span>
                              </div>
                              <span className="text-xs sm:text-sm font-bold text-pink-900 dark:text-pink-100">
                                {customer.nationality}
                              </span>
                            </div>
                          )}
                        </div>
                    </CardContent>
                  </Card>
                </motion.div>

              </div>

              {/* Latest Order Section */}
              {customer.latest_order && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Card className="relative overflow-hidden w-full border-r-4 border-r-amber-500 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-amber-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                    <CardHeader className="relative pb-3">
                      <CardTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                        {i18n.language === 'ar' ? (
                          <>
                            {isRTL ? 'آخر طلب' : 'Latest Order'}
                            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
                              <ShoppingBag className="w-5 h-5 text-amber-600" />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-xl">
                              <ShoppingBag className="w-5 h-5 text-amber-600" />
                            </div>
                            {isRTL ? 'آخر طلب' : 'Latest Order'}
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative space-y-4 pt-0">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Order Number */}
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border border-blue-200/50 dark:border-blue-700/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300">
                              {isRTL ? 'رقم الطلب' : 'Order Number'}
                            </span>
                          </div>
                          <div className="text-sm sm:text-base font-bold text-blue-900 dark:text-blue-100">
                            #{customer.latest_order.order_number}
                          </div>
                        </div>

                        {/* Order Status */}
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 border border-green-200/50 dark:border-green-700/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300">
                              {isRTL ? 'الحالة' : 'Status'}
                            </span>
                          </div>
                          <Badge 
                            variant={
                              customer.latest_order.status === 'paid' ? 'default' :
                              customer.latest_order.status === 'delivered' ? 'default' :
                              customer.latest_order.status === 'pending' ? 'secondary' :
                              'outline'
                            }
                            className={`
                              ${customer.latest_order.status === 'paid' ? 'bg-green-500 text-white' : ''}
                              ${customer.latest_order.status === 'delivered' ? 'bg-purple-500 text-white' : ''}
                              ${customer.latest_order.status === 'pending' ? 'bg-yellow-500 text-white' : ''}
                              ${customer.latest_order.status === 'awaiting_payment' ? 'bg-orange-500 text-white' : ''}
                            `}
                          >
                            {isRTL ? 
                              (customer.latest_order.status === 'paid' ? 'مدفوع' :
                               customer.latest_order.status === 'delivered' ? 'تم التوصيل' :
                               customer.latest_order.status === 'pending' ? 'قيد الانتظار' :
                               customer.latest_order.status === 'awaiting_payment' ? 'بانتظار الدفع' :
                               customer.latest_order.status) :
                              customer.latest_order.status.replace('_', ' ').toUpperCase()
                            }
                          </Badge>
                        </div>

                        {/* Total Amount */}
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200/50 dark:border-purple-700/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-xl">
                              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">
                              {isRTL ? 'المبلغ الإجمالي' : 'Total Amount'}
                            </span>
                          </div>
                          <div className="text-sm sm:text-base font-bold text-purple-900 dark:text-purple-100">
                            {toArabicNumerals(parseFloat(customer.latest_order.total_amount).toFixed(1))} {getLocalizedCurrency(customer.latest_order.currency)}
                          </div>
                        </div>

                        {/* Order Date */}
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/10 border border-indigo-200/50 dark:border-indigo-700/50 shadow-md hover:shadow-lg transition-all duration-300">
                          <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl">
                              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                              {isRTL ? 'تاريخ الطلب' : 'Order Date'}
                            </span>
                          </div>
                          <div className="text-sm sm:text-base font-bold text-indigo-900 dark:text-indigo-100">
                            {new Date(customer.latest_order.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                          </div>
                        </div>
                      </div>

                      {/* Tracking Number */}
                      {customer.latest_order.tracking_number && (
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 border border-slate-200/50 dark:border-slate-700/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="p-2 bg-gradient-to-br from-slate-500/20 to-slate-500/10 rounded-xl">
                                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
                              </div>
                              <div>
                                <div className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                                  {isRTL ? 'رقم التتبع' : 'Tracking Number'}
                                </div>
                                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                                {customer.latest_order.order_number}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(customer.latest_order!.order_number, isRTL ? 'رقم الطلب' : 'Order Number')}
                              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                            >
                              <Copy className="w-4 h-4 text-slate-600" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Shipping Address */}
                      {customer.latest_order.shipping_address && (
                        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100/50 dark:from-teal-900/20 dark:to-teal-800/10 border border-teal-200/50 dark:border-teal-700/50">
                          <div className="flex items-center gap-2 sm:gap-3 mb-3">
                            <div className="p-2 bg-gradient-to-br from-teal-500/20 to-teal-500/10 rounded-xl">
                              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300">
                              {isRTL ? 'عنوان الشحن' : 'Shipping Address'}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm text-teal-900 dark:text-teal-100 space-y-1">
                            {customer.latest_order.shipping_address.street && (
                              <div className="font-bold">{customer.latest_order.shipping_address.street}</div>
                            )}
                            {customer.latest_order.shipping_address.city && (
                              <div className="font-medium">{customer.latest_order.shipping_address.city}</div>
                            )}
                            {customer.latest_order.shipping_address.governorate && (
                              <div>{customer.latest_order.shipping_address.governorate}</div>
                            )}
                            {customer.latest_order.shipping_address.postal_code && (
                              <div className="text-xs text-teal-600 dark:text-teal-400">
                                {customer.latest_order.shipping_address.postal_code}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              
              {/* Extra spacing for better visibility */}
              <div className="h-4 sm:h-6"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {showEditDialog && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="relative pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
              <div className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                <div className={`flex flex-col ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                  <DialogTitle className={`flex items-center gap-2 text-sm sm:text-base md:text-lg ${isRTL ? 'text-right justify-end' : 'text-left'} font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent`}>
                    {i18n.language === 'ar' ? (
                      <>
                        {t('admin.customers.editCustomer')}
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        {t('admin.customers.editCustomer')}
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 dark:text-slate-400">
                    {t('admin.customers.editCustomerDescription')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <CustomerForm
              customer={customer}
              onSuccess={() => {
                setShowEditDialog(false);
                onUpdate();
              }}
              onCancel={() => setShowEditDialog(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t('admin.customers.deleteCustomer')}
              </DialogTitle>
              <DialogDescription>
                {t('admin.customers.deleteCustomerConfirmation', { name: customer.name })}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CustomerDetails;
