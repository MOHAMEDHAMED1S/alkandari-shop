import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  CreditCard, 
  Shield, 
  Bell, 
  Zap,
  ChevronRight,
  Palette,
  Globe,
  Database,
  RefreshCw,
  Truck,
  MessageCircle,
  ShoppingCart
} from 'lucide-react';

const AdminSettings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const settingsCategories = [
    {
      id: 'payment-methods',
      title: i18n.language === 'ar' ? 'طرق الدفع' : 'Payment Methods',
      description: i18n.language === 'ar' ? 'إدارة طرق الدفع المتاحة في المتجر' : 'Manage available payment methods in the store',
      icon: CreditCard,
      href: '/admin/settings/payment-methods',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'shipping-costs',
      title: i18n.language === 'ar' ? 'مصاريف الشحن' : 'Shipping Costs',
      description: i18n.language === 'ar' ? 'إدارة مصاريف الشحن الموحدة للمتجر' : 'Manage unified shipping costs for the store',
      icon: Truck,
      href: '/admin/settings/shipping',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'whatsapp-settings',
      title: i18n.language === 'ar' ? 'إعدادات واتساب' : 'WhatsApp Settings',
      description: i18n.language === 'ar' ? 'إدارة أرقام واتساب والإشعارات وإعدادات الرسائل' : 'Manage WhatsApp numbers, notifications and message settings',
      icon: MessageCircle,
      href: '/admin/whatsapp-settings',
      color: 'bg-emerald-500',
      available: true
    },
    {
      id: 'orders-control',
      title: i18n.language === 'ar' ? 'التحكم في الطلبات' : 'Orders Control',
      description: i18n.language === 'ar' ? 'فتح أو إغلاق الطلبات على الموقع بسبب ضغط الطلبات' : 'Open or close orders on the website due to high demand',
      icon: ShoppingCart,
      href: '/admin/orders-control',
      color: 'bg-orange-500',
      available: true
    }
  ];

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`flex justify-${i18n.language === 'ar' ? 'end' : 'start'} items-center`}
      >
        <motion.div 
          initial={{ opacity: 0, x: i18n.language === 'ar' ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className={`${i18n.language === 'ar' ? 'text-right' : 'text-left'}`}
        >
          <h1 className="text-3xl pb-2 sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            {i18n.language === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
        </motion.div>
      </motion.div>

      {/* Settings Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
      >
        {settingsCategories.map((category, index) => {
          const IconComponent = category.icon;
          
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group"
            >
              <Card className={`relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl group-hover:shadow-slate-200/30 dark:group-hover:shadow-slate-900/30 h-full flex flex-col ${
                category.available 
                  ? 'cursor-pointer' 
                  : 'opacity-60 cursor-not-allowed'
              }`}>
                <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-20 h-20 ${category.color}/10 rounded-full ${isRTL ? '-translate-y-10 -translate-x-10' : '-translate-y-10 translate-x-10'} group-hover:scale-110 transition-transform duration-300`}></div>
                <div className={`absolute bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-16 h-16 ${category.color}/5 rounded-full ${isRTL ? 'translate-y-8 translate-x-8' : 'translate-y-8 -translate-x-8'} group-hover:scale-110 transition-transform duration-300`}></div>
                
                <CardHeader className="relative pb-4">
                  <div className={`flex items-start mb-4 justify-between`}>
                    {isRTL ? (
                      <>
                        {category.available && (
                          <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-primary transition-colors rotate-180`} />
                        )}
                        <div className={`w-12 h-12 bg-gradient-to-br ${category.color}/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`w-6 h-6 ${category.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={`w-12 h-12 bg-gradient-to-br ${category.color}/20 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className={`w-6 h-6 ${category.color.replace('bg-', 'text-')} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                        {category.available && (
                          <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-primary transition-colors`} />
                        )}
                      </>
                    )}
                  </div>
                  
                  <CardTitle className={`text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 ${
                    isRTL ? 'text-right' : 'text-left'
                  }`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {category.title}
                  </CardTitle>
                  <CardDescription className={`text-sm text-slate-600 dark:text-slate-400 ${
                    isRTL ? 'text-right' : 'text-left'
                  }`} style={{ textAlign: isRTL ? 'right' : 'left' }}>
                    {category.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="relative pt-0 flex-grow flex flex-col justify-end">
                  {category.available ? (
                    <Link to={category.href}>
                      <Button 
                        variant="outline" 
                        className="w-full bg-gradient-to-r from-slate-50 to-slate-100/80 dark:from-slate-800/50 dark:to-slate-700/30 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:text-white text-slate-700 dark:text-slate-300 transition-all duration-300 hover:scale-105 rounded-xl shadow-sm hover:shadow-xl border-slate-300/60 dark:border-slate-600/40 hover:border-blue-400/60 font-medium"
                      >
                        {isRTL ? 'فتح الإعدادات' : 'Open Settings'}
                      </Button>
                    </Link>
                  ) : (
                    <Button 
                      variant="outline" 
                      disabled
                      className="w-full rounded-xl shadow-sm border-slate-200/50 dark:border-slate-700/50 font-medium bg-slate-100/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-500"
                    >
                      {isRTL ? 'قريباً' : 'Coming Soon'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

     
    </div>
  );
};

export default AdminSettings;