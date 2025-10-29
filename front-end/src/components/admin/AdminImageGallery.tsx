import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn, Plus, Trash2, Edit } from 'lucide-react';
import AdminLazyImage from './AdminLazyImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AdminImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  showThumbnails?: boolean;
  showFullscreen?: boolean;
  showControls?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  onImageChange?: (index: number) => void;
  onAddImage?: () => void;
  onDeleteImage?: (index: number) => void;
  onEditImage?: (index: number) => void;
  maxImages?: number;
  editable?: boolean;
}

const AdminImageGallery: React.FC<AdminImageGalleryProps> = ({
  images,
  alt = 'Gallery image',
  className,
  showThumbnails = true,
  showFullscreen = true,
  showControls = true,
  aspectRatio = 'square',
  onImageChange,
  onAddImage,
  onDeleteImage,
  onEditImage,
  maxImages = 10,
  editable = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleImageChange = (index: number) => {
    setSelectedIndex(index);
    onImageChange?.(index);
  };

  const handlePrevious = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    handleImageChange(newIndex);
  };

  const handleNext = () => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    handleImageChange(newIndex);
  };

  const handleFullscreen = () => {
    if (showFullscreen) {
      setIsFullscreen(true);
    }
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
  };

  const handleDeleteImage = (index: number) => {
    if (onDeleteImage) {
      onDeleteImage(index);
      if (selectedIndex >= index && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
      }
    }
  };

  const handleEditImage = (index: number) => {
    if (onEditImage) {
      onEditImage(index);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'Escape':
            handleCloseFullscreen();
            break;
          case 'ArrowLeft':
            handlePrevious();
            break;
          case 'ArrowRight':
            handleNext();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selectedIndex, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className={cn('flex items-center justify-center bg-muted rounded-lg p-8', className)}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted-foreground/20 flex items-center justify-center">
            <ZoomIn className="w-8 h-8" />
          </div>
          <p className="text-sm mb-4">لا توجد صور متاحة</p>
          {editable && onAddImage && (
            <Button onClick={onAddImage} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              إضافة صورة
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={galleryRef} className={cn('relative', className)}>
        {/* Main Image */}
        <div className="relative group">
          <AdminLazyImage
            src={images[selectedIndex]}
            alt={`${alt} ${selectedIndex + 1}`}
            aspectRatio={aspectRatio}
            className="w-full h-full object-cover cursor-pointer"
            showSkeleton={true}
            onClick={handleFullscreen}
            size="xl"
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && showControls && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Fullscreen Button */}
          {showFullscreen && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFullscreen}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <Badge className="absolute bottom-2 right-2 bg-black/50 text-white">
              {selectedIndex + 1} / {images.length}
            </Badge>
          )}

          {/* Edit Controls */}
          {editable && (
            <div className="absolute top-2 left-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleEditImage(selectedIndex)}
                className="bg-blue-500/80 hover:bg-blue-600/80 text-white"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDeleteImage(selectedIndex)}
                className="bg-red-500/80 hover:bg-red-600/80 text-white"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && (
          <div className="grid grid-cols-5 gap-2 mt-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleImageChange(index)}
                  className={cn(
                    'aspect-square p-0 rounded-lg overflow-hidden transition-all',
                    selectedIndex === index
                      ? 'ring-2 ring-primary scale-105'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  )}
                >
                  <AdminLazyImage
                    src={image}
                    alt={`${alt} thumbnail ${index + 1}`}
                    aspectRatio="square"
                    className="w-full h-full object-cover"
                    showSkeleton={false}
                    threshold={0.5}
                    size="sm"
                  />
                </Button>

                {/* Thumbnail Controls */}
                {editable && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditImage(index)}
                      className="bg-blue-500/80 hover:bg-blue-600/80 text-white p-1"
                    >
                      <Edit className="w-2 h-2" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteImage(index)}
                      className="bg-red-500/80 hover:bg-red-600/80 text-white p-1"
                    >
                      <Trash2 className="w-2 h-2" />
                    </Button>
                  </div>
                )}
              </div>
            ))}

            {/* Add Image Button */}
            {editable && onAddImage && images.length < maxImages && (
              <Button
                variant="outline"
                size="sm"
                onClick={onAddImage}
                className="aspect-square p-0 rounded-lg border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Plus className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={handleCloseFullscreen}
          >
            <div className="relative max-w-7xl max-h-full p-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCloseFullscreen}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="w-6 h-6" />
              </Button>

              <div className="relative">
                <AdminLazyImage
                  src={images[selectedIndex]}
                  alt={`${alt} fullscreen ${selectedIndex + 1}`}
                  aspectRatio="auto"
                  className="max-w-full max-h-[80vh] object-contain"
                  showSkeleton={true}
                  size="xl"
                />

                {/* Fullscreen Navigation */}
                {images.length > 1 && (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>

              {/* Fullscreen Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  {images.map((image, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleImageChange(index)}
                      className={cn(
                        'w-16 h-16 rounded-lg overflow-hidden transition-all',
                        selectedIndex === index
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-70 hover:opacity-100'
                      )}
                    >
                      <AdminLazyImage
                        src={image}
                        alt={`${alt} fullscreen thumbnail ${index + 1}`}
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                        showSkeleton={false}
                        threshold={0.5}
                        size="sm"
                      />
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminImageGallery;
