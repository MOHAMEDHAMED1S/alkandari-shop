import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageContainerProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  loading?: 'lazy' | 'eager';
  showSkeleton?: boolean;
  quality?: 'low' | 'medium' | 'high' | 'original';
  blurDataURL?: string;
}

const LazyImageContainer: React.FC<LazyImageContainerProps> = ({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  placeholder,
  fallback,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  loading = 'lazy',
  showSkeleton = true,
  quality = 'medium',
  blurDataURL,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [imageLoading, setImageLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: '',
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, loading]);

  // Preload image when in view
  useEffect(() => {
    if (isInView && !isLoaded && !isError && !imageLoading) {
      setImageLoading(true);
      
      const img = new Image();
      img.onload = () => {
        setIsLoaded(true);
        setImageLoading(false);
        onLoad?.();
      };
      img.onerror = () => {
        setIsError(true);
        setImageLoading(false);
        onError?.();
      };
      img.src = src;
    }
  }, [isInView, src, isLoaded, isError, imageLoading, onLoad, onError]);

  const getOptimizedSrc = (originalSrc: string) => {
    // If it's already optimized or external URL, return as is
    if (originalSrc.includes('?') || originalSrc.startsWith('http')) {
      return originalSrc;
    }
    
    // Add quality parameter for local images
    const qualityMap = {
      low: 30,
      medium: 60,
      high: 80,
      original: 100
    };
    
    return `${originalSrc}?quality=${qualityMap[quality]}`;
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden bg-muted/30',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-sm scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Loading skeleton */}
      {!isInView && showSkeleton && (
        <Skeleton className="absolute inset-0 w-full h-full animate-pulse" />
      )}
      
      {isInView && imageLoading && showSkeleton && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-full h-full animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}
      
      {/* Main image */}
      {isInView && isLoaded && !isError && (
        <img
          ref={imageRef}
          src={getOptimizedSrc(src)}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-all duration-700 ease-out',
            'opacity-100 scale-100',
            className
          )}
          loading={loading}
          decoding="async"
          draggable={false}
        />
      )}
      
      {/* Error fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
          {fallback || (
            <div className="text-center text-muted-foreground p-4">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs">فشل في تحميل الصورة</p>
            </div>
          )}
        </div>
      )}
      
      {/* Custom placeholder */}
      {placeholder && !isInView && (
        <div className="absolute inset-0">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default LazyImageContainer;
