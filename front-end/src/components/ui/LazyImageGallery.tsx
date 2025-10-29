import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import LazyImageContainer from './LazyImageContainer';

interface LazyImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  showThumbnails?: boolean;
  showFullscreen?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  onImageChange?: (index: number) => void;
}

const LazyImageGallery: React.FC<LazyImageGalleryProps> = ({
  images,
  alt = 'Gallery image',
  className,
  showThumbnails = true,
  showFullscreen = true,
  aspectRatio = 'square',
  onImageChange,
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
      <div className={cn('flex items-center justify-center bg-muted rounded-lg', className)}>
        <div className="text-center text-muted-foreground">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted-foreground/20 flex items-center justify-center">
            <ZoomIn className="w-8 h-8" />
          </div>
          <p className="text-sm">لا توجد صور متاحة</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div ref={galleryRef} className={cn('relative', className)}>
        {/* Main Image */}
        <div className="relative group">
          <LazyImageContainer
            src={images[selectedIndex]}
            alt={`${alt} ${selectedIndex + 1}`}
            aspectRatio={aspectRatio}
            className="w-full h-full object-cover cursor-pointer"
            showSkeleton={true}
            onClick={handleFullscreen}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          {showFullscreen && (
            <button
              onClick={handleFullscreen}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="grid grid-cols-5 gap-2 mt-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={cn(
                  'aspect-square rounded-lg overflow-hidden transition-all',
                  selectedIndex === index
                    ? 'ring-2 ring-primary scale-105'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                )}
              >
                <LazyImageContainer
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  aspectRatio="square"
                  className="w-full h-full object-cover"
                  showSkeleton={false}
                  threshold={0.5}
                />
              </button>
            ))}
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
              <button
                onClick={handleCloseFullscreen}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative">
                <LazyImageContainer
                  src={images[selectedIndex]}
                  alt={`${alt} fullscreen ${selectedIndex + 1}`}
                  aspectRatio="auto"
                  className="max-w-full max-h-[80vh] object-contain"
                  showSkeleton={true}
                />

                {/* Fullscreen Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevious}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Fullscreen Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 justify-center">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={cn(
                        'w-16 h-16 rounded-lg overflow-hidden transition-all',
                        selectedIndex === index
                          ? 'ring-2 ring-white scale-110'
                          : 'opacity-70 hover:opacity-100'
                      )}
                    >
                      <LazyImageContainer
                        src={image}
                        alt={`${alt} fullscreen thumbnail ${index + 1}`}
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                        showSkeleton={false}
                        threshold={0.5}
                      />
                    </button>
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

export default LazyImageGallery;
