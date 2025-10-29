import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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
  FolderOpen
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
      handleFileUpload(files[0]); // Only take the first file for single image
    }
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      handleFileUpload(imageFiles[0]); // Only take the first image file
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
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
    <div className={`space-y-4 ${className}`}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">{t('admin.categories.uploadImage')}</TabsTrigger>
          <TabsTrigger value="url">{t('admin.categories.addFromUrl')}</TabsTrigger>
          <TabsTrigger value="gallery">{t('admin.categories.selectFromGallery')}</TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                {uploading ? (
                  <div className="space-y-4">
                    <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">{t('admin.categories.uploading')}...</p>
                      <Progress value={uploadProgress} className="w-full" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium">{t('admin.categories.dragDropImage')}</p>
                      <p className="text-sm text-gray-500">{t('admin.categories.orClickToSelect')}</p>
                    </div>
                    <Button type="button" variant="outline">
                      <Upload className="w-4 h-4 mr-2" />
                      {t('admin.categories.selectImage')}
                    </Button>
                  </div>
                )}
              </div>

              {image && (
                <Alert className="mt-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    {t('admin.categories.imageSelected')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* URL Tab */}
        <TabsContent value="url" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Input
                  placeholder={t('admin.categories.imageUrlPlaceholder')}
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                />
                <Button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!newImageUrl.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Label>{t('admin.categories.selectFolder')}:</Label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="px-3 py-1 border rounded-md"
                  >
                    <option value="categories">Categories</option>
                    {availableFolders.map((folderName) => (
                      <option key={folderName} value={folderName}>
                        {folderName}
                      </option>
                    ))}
                  </select>
                </div>

                {loadingFolderImages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                    {folderImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => handleAddFromFolder(img.url)}
                      >
                        <img
                          src={img.url}
                          alt={img.filename}
                          className="w-full h-20 object-cover rounded-lg hover:opacity-75 transition-opacity"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <Plus className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image Preview */}
      {image && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label>{t('admin.categories.selectedImage')}</Label>
              <div className="relative group inline-block">
                <img
                  src={image}
                  alt="Category Image"
                  className="w-32 h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 p-0"
                  onClick={handleRemoveImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CategoryImageUpload;