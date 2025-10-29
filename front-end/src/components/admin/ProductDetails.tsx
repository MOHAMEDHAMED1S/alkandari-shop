import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Package,
  Calendar,
  DollarSign,
  Tag,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  currency: string;
  is_available: boolean;
  images: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
  created_at: string;
  updated_at: string;
  meta?: any;
}

interface ProductDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({
  open,
  onOpenChange,
  product,
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  if (!product) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-2xl sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          maxHeight: '90vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
        onScroll={(e) => {
          e.currentTarget.style.scrollBehavior = 'smooth';
        }}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className={`text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
            {i18n.language === 'ar' ? (
              <>
                {product.title}
                <Package className="w-6 h-6 text-primary" />
              </>
            ) : (
              <>
                <Package className="w-6 h-6 text-primary" />
                {product.title}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {t('admin.products.productDetailsDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Images */}
          {product.images && product.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                    {i18n.language === 'ar' ? (
                      <>
                        {t('admin.products.productImages')}
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                        {t('admin.products.productImages')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {product.images.map((image, index) => (
                      <motion.div 
                        key={index} 
                        className="relative group"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={image}
                          alt={`${product.title} - Image ${index + 1}`}
                          className="w-full h-24 sm:h-32 object-cover rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-all duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                    {i18n.language === 'ar' ? (
                      <>
                        {t('admin.products.basicInformation')}
                        <Info className="w-5 h-5 text-primary" />
                      </>
                    ) : (
                      <>
                        <Info className="w-5 h-5 text-primary" />
                        {t('admin.products.basicInformation')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 pt-0">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.products.productTitle')}
                    </label>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-1">{product.title}</p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.products.slug')}
                    </label>
                    <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl mt-1 border border-slate-200 dark:border-slate-700">
                      {product.slug}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.products.category')}
                    </label>
                    <Badge variant="secondary" className="mt-2 text-sm px-3 py-1 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700">
                      {product.category.name}
                    </Badge>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.products.price')}
                    </label>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                      {product.price} {product.currency}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.products.status')}
                    </label>
                    <div className="mt-2">
                      <Badge 
                        variant={product.is_available ? 'default' : 'secondary'} 
                        className={`text-sm px-3 py-1 rounded-xl ${
                          product.is_available 
                            ? 'bg-gradient-to-r from-green-100 to-green-50 text-green-700 dark:from-green-900/20 dark:to-green-800/20 dark:text-green-400' 
                            : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 dark:from-gray-800 dark:to-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {product.is_available ? (
                          <><CheckCircle className="w-4 h-4 mr-2" />{t('admin.products.available')}</>
                        ) : (
                          <><XCircle className="w-4 h-4 mr-2" />{t('admin.products.unavailable')}</>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Descriptions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                    {i18n.language === 'ar' ? (
                      <>
                        {t('admin.products.descriptions')}
                        <Tag className="w-5 h-5 text-blue-600" />
                      </>
                    ) : (
                      <>
                        <Tag className="w-5 h-5 text-blue-600" />
                        {t('admin.products.descriptions')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4 pt-0">
                  {product.short_description && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('admin.products.shortDescription')}
                      </label>
                      <p className="text-sm text-slate-900 dark:text-slate-100 mt-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                        {product.short_description}
                      </p>
                    </div>
                  )}

                  {product.description && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {t('admin.products.productDescription')}
                      </label>
                      <p className="text-sm text-slate-900 dark:text-slate-100 mt-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                        {product.description}
                      </p>
                    </div>
                  )}

                  {(!product.short_description && !product.description) && (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Info className="w-8 h-8 mx-auto mb-3 text-slate-400 dark:text-slate-500" />
                      <p className="text-sm">{t('admin.products.noDescriptions')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Timestamps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
              <CardHeader className="relative pb-3">
                <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                  {i18n.language === 'ar' ? (
                    <>
                      {t('admin.products.timestamps')}
                      <Calendar className="w-5 h-5 text-green-600" />
                    </>
                  ) : (
                    <>
                      <Calendar className="w-5 h-5 text-green-600" />
                      {t('admin.products.timestamps')}
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.products.createdAt')}
                    </label>
                    <p className="text-sm text-slate-900 dark:text-slate-100 mt-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      {formatDate(product.created_at)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {t('admin.products.updatedAt')}
                    </label>
                    <p className="text-sm text-slate-900 dark:text-slate-100 mt-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      {formatDate(product.updated_at)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetails;

