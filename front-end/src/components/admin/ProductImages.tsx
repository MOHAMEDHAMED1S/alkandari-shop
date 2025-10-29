import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Image as ImageIcon,
  Plus,
  X,
  Trash2,
  Upload,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { updateProductImages } from '@/lib/api';
import { toast } from 'sonner';

interface Product {
  id: number;
  title: string;
  images: string[];
}

interface ProductImagesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

const ProductImages: React.FC<ProductImagesProps> = ({
  open,
  onOpenChange,
  product,
  onSuccess,
}) => {
  const { t, i18n } = useTranslation();
  const { token } = useAdmin();
  const isRTL = i18n.language === 'ar';

  const [images, setImages] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<number | null>(null);

  // Initialize images when product changes
  useEffect(() => {
    if (product) {
      setImages([...product.images]);
    } else {
      setImages([]);
    }
  }, [product]);

  const handleAddImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages(prev => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    } else if (images.includes(newImageUrl.trim())) {
      toast.error(t('admin.products.imageAlreadyExists'));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageToDelete(index);
    setShowDeleteDialog(true);
  };

  const confirmRemoveImage = () => {
    if (imageToDelete !== null) {
      setImages(prev => prev.filter((_, i) => i !== imageToDelete));
      setImageToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  const handleSaveImages = async () => {
    if (!product || !token) return;

    try {
      setSaving(true);
      const response = await updateProductImages(token, product.id, images);
      
      if (response.success) {
        toast.success(t('admin.products.imagesUpdated'));
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(response.message || t('admin.products.imagesUpdateError'));
      }
    } catch (error) {
      console.error('Error updating images:', error);
      toast.error(t('admin.products.imagesUpdateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (product) {
      setImages([...product.images]);
    }
    onOpenChange(false);
  };

  const hasChanges = () => {
    if (!product) return false;
    return JSON.stringify(images) !== JSON.stringify(product.images);
  };

  if (!product) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto mx-auto my-4 w-[95vw] sm:w-full relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-2xl"
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
          <DialogHeader className="relative pb-3 border-b border-slate-200/50 dark:border-slate-700/50">
            <DialogTitle className={`text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
              {isRTL ? (
                <>
                  <span>{t('admin.products.manageImages')} - {product.title}</span>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <span>{t('admin.products.manageImages')} - {product.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              {t('admin.products.manageImagesDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Add New Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                    {isRTL ? (
                      <>
                        {t('admin.products.addNewImage')}
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                          <Plus className="w-5 h-5 text-primary" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                          <Plus className="w-5 h-5 text-primary" />
                        </div>
                        {t('admin.products.addNewImage')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-3 pt-0">
                <div className="flex gap-3">
                  <Input
                    placeholder={t('admin.products.imageUrlPlaceholder')}
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddImage()}
                    className="rounded-xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                  <Button
                    onClick={handleAddImage}
                    disabled={!newImageUrl.trim() || loading}
                    className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  {t('admin.products.imageUrlHelp')}
                </p>
              </CardContent>
            </Card>
            </motion.div>

            {/* Current Images */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center justify-between ${isRTL ? 'text-right' : 'text-left'}`}>
                    {isRTL ? (
                      <>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700">
                          {images.length} {t('admin.products.images')}
                        </Badge>
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <span>{t('admin.products.currentImages')}</span>
                          <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                            <ImageIcon className="w-5 h-5 text-green-600" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                            <ImageIcon className="w-5 h-5 text-green-600" />
                          </div>
                          <span>{t('admin.products.currentImages')}</span>
                        </div>
                        <Badge variant="secondary" className="rounded-full px-3 py-1 text-sm font-semibold bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700">
                          {images.length} {t('admin.products.images')}
                        </Badge>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
              <CardContent>
                {images.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-lg">{t('admin.products.noImages')}</p>
                    <p className="text-sm">{t('admin.products.addFirstImage')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg border overflow-hidden">
                          <img
                            src={image}
                            alt={`${product.title} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-full bg-muted flex items-center justify-center">
                            <div className="text-center">
                              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {t('admin.products.imageLoadError')}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Image Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Image Info */}
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground truncate">
                            {t('admin.products.image')} {index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {image.length > 30 ? `${image.substring(0, 30)}...` : image}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            </motion.div>

            {/* Image Guidelines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/20 dark:to-slate-800/10 border-slate-200/50 dark:border-slate-800/30 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-orange-400/5 rounded-full translate-y-8 -translate-x-8"></div>
                <CardHeader className="relative pb-3">
                  <CardTitle className={`text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent flex items-center gap-3 ${isRTL ? 'text-right justify-end' : 'text-left'}`}>
                    {isRTL ? (
                      <>
                        {t('admin.products.imageGuidelines')}
                        <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-orange-600" />
                        </div>
                        {t('admin.products.imageGuidelines')}
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <ul className="text-sm space-y-1 list-disc list-inside text-slate-700 dark:text-slate-300">
                    <li>{t('admin.products.imageGuideline1')}</li>
                    <li>{t('admin.products.imageGuideline2')}</li>
                    <li>{t('admin.products.imageGuideline3')}</li>
                    <li>{t('admin.products.imageGuideline4')}</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <DialogFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2"
            >
              {t('admin.common.cancel')}
            </Button>
            <Button
              onClick={handleSaveImages}
              disabled={saving || !hasChanges()}
              className="hover:bg-gradient-to-r hover:from-primary hover:to-primary/90 transition-all duration-300 hover:scale-105 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('admin.common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.products.deleteImage')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.products.deleteImageConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveImage}>
              {t('admin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductImages;

