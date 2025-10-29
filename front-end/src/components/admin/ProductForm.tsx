import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Package, Info, Image as ImageIcon, Ruler, X, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  createProduct,
  updateProduct,
  getAdminCategories,
} from '@/lib/api';
import ImageUpload from './ImageUpload';
import { toast } from 'sonner';

interface Product {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  currency: string;
  is_available: boolean;
  has_sizes?: boolean;
  sizes?: string[];
  images: string[];
  category: {
    id: number;
    name: string;
    slug: string;
  };
  meta?: any;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, 'Price must be a valid positive number'),
  currency: z.string().default('KWD'),
  is_available: z.boolean().default(true),
  has_sizes: z.boolean().default(false),
  sizes: z.array(z.string()).default([]),
  category_id: z.number().min(1, 'Category is required'),
  images: z.array(z.string()).default([]),
  meta: z.object({
    ingredients: z.string().nullable().optional(),
    skin_type: z.string().nullable().optional(),
    weight: z.string().nullable().optional(),
    dimensions: z.string().nullable().optional(),
  }).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newSize, setNewSize] = useState('');

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      short_description: '',
      price: '',
      currency: 'KWD',
      is_available: true,
      has_sizes: false,
      sizes: [],
      category_id: 0,
      images: [],
      meta: {
        ingredients: null,
        skin_type: null,
        weight: null,
        dimensions: null,
      },
    },
  });

  // Load categories
  const loadCategories = async () => {
    if (!token) return;

    try {
      setCategoriesLoading(true);
      const response = await getAdminCategories(token);
      if (response.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load product data when editing
  useEffect(() => {
    if (product) {
      console.log('📦 Loading product data for editing:', product);
      
      // Ensure meta is always an object, not an array
      const metaData = product.meta && typeof product.meta === 'object' && !Array.isArray(product.meta)
        ? product.meta
        : {
            ingredients: null,
            skin_type: null,
            weight: null,
            dimensions: null,
          };
      
      form.reset({
        title: product.title,
        description: product.description,
        short_description: product.short_description,
        price: product.price,
        currency: product.currency,
        is_available: product.is_available,
        has_sizes: product.has_sizes || false,
        sizes: product.sizes || [],
        category_id: product.category?.id || 0,
        images: product.images || [],
        meta: metaData,
      });
      setImageUrls(product.images || []);
    } else {
      console.log('🆕 Resetting form for new product');
      form.reset();
      setImageUrls([]);
    }
  }, [product, form]);

  // Load categories on mount
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, token]);

  // Clear sizes when has_sizes is disabled
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'has_sizes' && !value.has_sizes) {
        form.setValue('sizes', []);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const handleSubmit = async (data: ProductFormData) => {
    console.log('🚀 handleSubmit called with data:', data);
    console.log('🔑 Token exists:', !!token);
    
    if (!token) {
      toast.error('Authentication token is missing');
      return;
    }

    // Validate form data before submission
    const formErrors = form.formState.errors;
    if (Object.keys(formErrors).length > 0) {
      console.log('❌ Form validation errors:', formErrors);
      toast.error('يرجى تصحيح الأخطاء في النموذج قبل الإرسال');
      return;
    }

    // Additional validation for required fields
    if (!data.title || !data.title.trim()) {
      toast.error('عنوان المنتج مطلوب');
      return;
    }

    if (!data.price || parseFloat(data.price) <= 0) {
      toast.error('سعر المنتج مطلوب ويجب أن يكون أكبر من صفر');
      return;
    }

    if (!data.category_id || data.category_id <= 0) {
      toast.error('فئة المنتج مطلوبة');
      return;
    }

    // Validate sizes if has_sizes is enabled
    if (data.has_sizes && (!data.sizes || data.sizes.length === 0)) {
      toast.error(isRTL 
        ? 'يرجى إضافة مقاس واحد على الأقل للمنتج' 
        : 'Please add at least one size for the product'
      );
      return;
    }

    console.log('✅ All validations passed, proceeding with submission');

    try {
      setLoading(true);
      
      // Ensure meta is always an object, never an array
      const metaData = data.meta && typeof data.meta === 'object' && !Array.isArray(data.meta)
        ? data.meta
        : {
            ingredients: null,
            skin_type: null,
            weight: null,
            dimensions: null,
          };
      
      const productData = {
        title: data.title!,
        description: data.description || '',
        short_description: data.short_description || '',
        price: parseFloat(data.price).toString(),
        currency: data.currency,
        is_available: data.is_available,
        has_sizes: data.has_sizes,
        sizes: data.has_sizes ? data.sizes : [],
        category_id: data.category_id!,
        images: imageUrls,
        meta: metaData,
      };

      console.log('📦 Submitting product data:', productData);
      console.log('🔍 Has sizes:', productData.has_sizes);
      console.log('📏 Sizes:', productData.sizes);

      let response;
      if (product) {
        console.log('Updating product with ID:', product.id);
        response = await updateProduct(token, product.id, productData);
      } else {
        console.log('Creating new product');
        response = await createProduct(token, productData);
      }

      console.log('API Response:', response);

      if (response.success) {
        toast.success(
          product 
            ? t('admin.products.productUpdated')
            : t('admin.products.productCreated')
        );
        onSuccess();
        onOpenChange(false);
      } else {
        console.error('API Error:', response.message);
        toast.error(response.message || t('admin.products.saveError'));
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(t('admin.products.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const handleImagesChange = (images: string[]) => {
    setImageUrls(images);
    form.setValue('images', images);
  };

  const handleAddSize = () => {
    if (!newSize.trim()) return;
    
    const currentSizes = form.getValues('sizes');
    if (!currentSizes.includes(newSize.trim())) {
      form.setValue('sizes', [...currentSizes, newSize.trim()]);
      setNewSize('');
    } else {
      toast.error(isRTL ? 'هذا المقاس موجود بالفعل' : 'This size already exists');
    }
  };

  const handleRemoveSize = (index: number) => {
    const currentSizes = form.getValues('sizes');
    form.setValue('sizes', currentSizes.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-3xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
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
                {product ? t('admin.products.editProduct') : t('admin.products.addProduct')}
                <Package className="w-6 h-6 text-primary" />
              </>
            ) : (
              <>
                <Package className="w-6 h-6 text-primary" />
                {product ? t('admin.products.editProduct') : t('admin.products.addProduct')}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            {product 
              ? t('admin.products.editProductDescription')
              : t('admin.products.addProductDescription')
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form 
            onSubmit={(e) => {
              console.log('📋 Form submit event triggered');
              e.preventDefault();
              form.handleSubmit(handleSubmit)(e);
            }} 
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative pb-3">
                    <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
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
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.products.productTitle')} *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder={t('admin.products.productTitlePlaceholder')} 
                              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="short_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.products.shortDescription')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t('admin.products.shortDescriptionPlaceholder')}
                              rows={2}
                              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-slate-600 dark:text-slate-400">
                            {t('admin.products.shortDescriptionHelp')}
                          </FormDescription>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.products.productDescription')}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder={t('admin.products.productDescriptionPlaceholder')}
                              rows={3}
                              className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.products.productPrice')} *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="0.001"
                                placeholder="0.000"
                                className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.products.productCurrency')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                  <SelectValue placeholder={t('admin.products.selectCurrency')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                                <SelectItem value="KWD" className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">KWD</SelectItem>

                              </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.products.productCategory')} *</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                <SelectValue placeholder={t('admin.products.selectCategory')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm">
                              {categoriesLoading ? (
                                <SelectItem value="loading" disabled className="rounded-lg">
                                  {t('admin.common.loading')}...
                                </SelectItem>
                              ) : (
                                categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()} className="rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_available"
                      render={({ field }) => (
                        <FormItem className={`flex items-start space-y-0 ${isRTL ? 'flex-row justify-end space-x-2' : 'flex-row-reverse justify-end space-x-reverse'}`}>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('admin.products.isAvailable')}</FormLabel>
                            <FormDescription className="text-xs text-slate-600 dark:text-slate-400">
                              {t('admin.products.isAvailableDescription')}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 data-[state=checked]:text-white transition-all duration-300 hover:border-green-400 hover:scale-110 focus:ring-2 focus:ring-green-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-green-200 dark:data-[state=checked]:shadow-green-900/30 mt-0.5"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="has_sizes"
                      render={({ field }) => (
                        <FormItem className={`flex items-start space-y-0 ${isRTL ? 'flex-row justify-end space-x-2' : 'flex-row-reverse justify-end space-x-reverse'}`}>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {isRTL ? 'المنتج له مقاسات' : 'Product has sizes'}
                            </FormLabel>
                            <FormDescription className="text-xs text-slate-600 dark:text-slate-400">
                              {isRTL ? 'فعّل إذا كان المنتج يحتوي على مقاسات مختلفة' : 'Enable if product has different sizes'}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 data-[state=checked]:text-white transition-all duration-300 hover:border-blue-400 hover:scale-110 focus:ring-2 focus:ring-blue-500/20 shadow-sm hover:shadow-md data-[state=checked]:shadow-blue-200 dark:data-[state=checked]:shadow-blue-900/30 mt-0.5"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {form.watch('has_sizes') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                      >
                        <FormLabel className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                          <Ruler className="w-4 h-4 text-primary" />
                          {isRTL ? 'المقاسات' : 'Sizes'}
                        </FormLabel>
                        
                        <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                          <Input
                            value={newSize}
                            onChange={(e) => setNewSize(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSize();
                              }
                            }}
                            placeholder={isRTL ? 'مثال: مقاس صغير' : 'e.g., Small size'}
                            className="flex-1 rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                          <Button
                            type="button"
                            onClick={handleAddSize}
                            size="sm"
                            className="rounded-xl px-4"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {form.watch('sizes').length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {form.watch('sizes').map((size, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="px-3 py-1.5 rounded-xl flex items-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors"
                              >
                                <span className="font-medium">{size}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSize(index)}
                                  className="hover:bg-red-500/20 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}

                        {form.watch('sizes').length === 0 && (
                          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
                            <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                              {isRTL 
                                ? 'لم يتم إضافة مقاسات بعد. قم بإضافة المقاسات المتاحة للمنتج.'
                                : 'No sizes added yet. Add available sizes for this product.'
                              }
                            </AlertDescription>
                          </Alert>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Images */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                  <CardHeader className="relative pb-3">
                    <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-2 ${i18n.language === 'ar' ? 'text-right justify-end' : 'text-left'}`}>
                      {i18n.language === 'ar' ? (
                        <>
                          {t('admin.products.productImages')}
                          <ImageIcon className="w-5 h-5 text-primary" />
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-primary" />
                          {t('admin.products.productImages')}
                        </>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative pt-0">
                    {token && (
                      <ImageUpload
                        token={token}
                        images={imageUrls}
                        onImagesChange={handleImagesChange}
                        maxImages={10}
                        folder="products"
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <DialogFooter className="space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2"
              >
                <span className="font-semibold">{t('admin.common.cancel')}</span>
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                onClick={() => {
                  console.log('🔘 Save button clicked');
                  console.log('📝 Form data:', form.getValues());
                  console.log('✅ Form valid:', form.formState.isValid);
                  console.log('❌ Form errors:', form.formState.errors);
                }}
                className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <span className="font-semibold">
                  {loading 
                    ? t('admin.common.saving') 
                    : product 
                      ? t('admin.common.save') 
                      : t('admin.products.createProduct')
                  }
                </span>
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;

