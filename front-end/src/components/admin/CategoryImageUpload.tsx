import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Camera,
  Link,
  Grid3X3
} from 'lucide-react';
import { uploadImage, getImageFolders, getImagesByFolder } from '@/lib/api';
import { toast } from 'sonner';

interface CategoryImageUploadProps {
  token: string;
  image: string;
  onImageChange: (image: string) => void;
  folder?: string;
  className?: string;
}

interface UploadedImage {
  url: string;
  path: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: number;
}

const CategoryImageUpload: React.FC<CategoryImageUploadProps> = ({
  token,
  image,
  onImageChange,
  folder = 'categories',
  className = ''
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [availableFolders, setAvailableFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState(folder || 'categories');
  const [folderImages, setFolderImages] = useState<UploadedImage[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [loadingFolderImages, setLoadingFolderImages] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const dragVariants = {
    idle: { 
      scale: 1,
      borderColor: 'rgb(209 213 219)',
      backgroundColor: 'rgb(249 250 251)'
    },
    hover: { 
      scale: 1.02,
      borderColor: 'rgb(59 130 246)',
      backgroundColor: 'rgb(239 246 255)',
      transition: { duration: 0.2 }
    },
    drag: { 
      scale: 1.05,
      borderColor: 'rgb(34 197 94)',
      backgroundColor: 'rgb(240 253 244)',
      transition: { duration: 0.2 }
    }
  };

  // Load available folders
  const loadFolders = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoadingFolders(true);
      const response = await getImageFolders(token);
      if (response.success) {
        setAvailableFolders(Array.isArray(response.data) ? response.data.map((folder: any) => folder.name) : []);
      } else {
        setAvailableFolders([]);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    } finally {
      setLoadingFolders(false);
    }
  }, [token]);

  // Load images from selected folder
  const loadFolderImages = useCallback(async (folderName: string) => {
    if (!token) return;
    
    try {
      setLoadingFolderImages(true);
      const response = await getImagesByFolder(token, folderName);
      if (response.success) {
        setFolderImages(Array.isArray(response.data) ? response.data : []);
      } else {
        setFolderImages([]);
      }
    } catch (error) {
      console.error('Error loading folder images:', error);
    } finally {
      setLoadingFolderImages(false);
    }
  }, [token]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  // Upload file
  const handleFileUpload = async (file: File) => {
    if (!token) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error(t('admin.categories.noImageFile'));
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadImage(token, file, selectedFolder || folder || 'categories');

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        onImageChange(response.data.url);
        toast.success(t('admin.categories.imageUploaded'));
        
        // Refresh folder images
        loadFolderImages(selectedFolder || folder || 'categories');
      } else {
        toast.error(response.message || t('admin.categories.uploadError'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('admin.categories.uploadError'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add image from URL
  const handleAddUrl = () => {
    if (newImageUrl.trim()) {
      onImageChange(newImageUrl.trim());
      setNewImageUrl('');
      toast.success(t('admin.categories.imageAdded'));
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    onImageChange('');
    toast.success(t('admin.categories.imageRemoved'));
  };

  // Add image from folder
  const handleAddFromFolder = (imageUrl: string) => {
    onImageChange(imageUrl);
    toast.success(t('admin.categories.imageAdded'));
  };

  // Load folders on mount
  React.useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  // Load folder images when folder changes
  React.useEffect(() => {
    if (selectedFolder) {
      loadFolderImages(selectedFolder);
    }
  }, [selectedFolder, loadFolderImages]);

  return (
    <motion.div 
      className={`space-y-6 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-xl p-1">
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.categories.uploadImage')}</span>
              <span className="sm:hidden">رفع</span>
            </TabsTrigger>
            <TabsTrigger 
              value="url"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 rounded-lg transition-all duration-200"
            >
              <Link className="w-4 h-4" />
              <span className="hidden sm:inline">{t('admin.categories.addFromUrl')}</span>
              <span className="sm:hidden">رابط</span>
            </TabsTrigger>

          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 mt-6">
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
                <CardContent className="p-6">
                  <motion.div
                    className="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer overflow-hidden"
                    variants={dragVariants}
                    animate={isDragOver ? 'drag' : uploading ? 'idle' : 'idle'}
                    whileHover={!uploading ? 'hover' : 'idle'}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600"></div>
                    </div>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <AnimatePresence mode="wait">
                      {uploading ? (
                        <motion.div 
                          key="uploading"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="space-y-6"
                        >
                          <div className="relative">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="w-16 h-16 mx-auto text-blue-500" />
                            </motion.div>
                          </div>
                          <div className="space-y-3">
                            <p className="text-lg font-medium text-gray-700">{t('admin.categories.uploading')}...</p>
                            <div className="max-w-xs mx-auto">
                              <Progress 
                                value={uploadProgress} 
                                className="h-2 bg-gray-200"
                              />
                              <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="idle"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <motion.div
                            animate={{ 
                              y: [0, -10, 0],
                              scale: isDragOver ? 1.1 : 1
                            }}
                            transition={{ 
                              y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                              scale: { duration: 0.2 }
                            }}
                          >
                            <Upload className={`w-16 h-16 mx-auto transition-colors duration-200 ${
                              isDragOver ? 'text-green-500' : 'text-blue-400'
                            }`} />
                          </motion.div>
                          <div className="space-y-2">
                            <p className="text-xl font-semibold text-gray-800">
                              {isDragOver ? 'أفلت الصورة هنا' : t('admin.categories.dragDropImage')}
                            </p>
                            <p className="text-sm text-gray-500">{t('admin.categories.orClickToSelect')}</p>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="bg-white/80 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {t('admin.categories.selectImage')}
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <AnimatePresence>
                    {image && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <Alert className="border-green-200 bg-green-50/50 backdrop-blur-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700">
                            {t('admin.categories.imageSelected')}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* URL Tab */}
          <TabsContent value="url" className="space-y-4 mt-6">
            <motion.div variants={itemVariants}>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1">
                        <Input
                          placeholder={t('admin.categories.imageUrlPlaceholder')}
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                          className="border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
                        />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="button"
                          onClick={handleAddUrl}
                          disabled={!newImageUrl.trim()}
                          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          إضافة
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          
        </Tabs>
      </motion.div>

      {/* Image Preview */}
      <AnimatePresence>
        {image && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {t('admin.categories.selectedImage')}
                  </Label>
                  <div className="relative group inline-block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="relative overflow-hidden rounded-xl bg-gray-100"
                    >
                      <img
                        src={image}
                        alt="Category Image"
                        className="w-40 h-40 object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-8 h-8 p-0 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm shadow-lg"
                        onClick={handleRemoveImage}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>


    </motion.div>
  );
};

export default CategoryImageUpload;