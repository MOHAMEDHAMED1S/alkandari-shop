import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyImageOptimizedProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  quality?: 'low' | 'medium' | 'high' | 'original';
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  placeholder?: string;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  loading?: 'lazy' | 'eager';
  showSkeleton?: boolean;
  blurDataURL?: string;
}

const LazyImageOptimized: React.FC<LazyImageOptimizedProps> = ({
  src,
  alt,
  className,
  containerClassName,
  aspectRatio = 'auto',
  quality = 'medium',
  format = 'auto',
  placeholder,
  fallback,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  loading = 'lazy',
  showSkeleton = true,
  blurDataURL,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: '',
  };

  // Generate optimized image URL
  const generateOptimizedSrc = (originalSrc: string) => {
    if (!originalSrc) return originalSrc;
    
    // If it's already an optimized URL or external URL, return as is
    if (originalSrc.includes('data:') || originalSrc.startsWith('http')) {
      return originalSrc;
    }

    // Add optimization parameters
    const url = new URL(originalSrc, window.location.origin);
    
    // Quality settings
    const qualityMap = {
      low: 30,
      medium: 60,
      high: 80,
      original: 100,
    };
    
    url.searchParams.set('q', qualityMap[quality].toString());
    
    // Format settings
    if (format !== 'auto') {
      url.searchParams.set('f', format);
    }
    
    // Add WebP support detection
    if (format === 'auto' && window.navigator.userAgent.includes('Chrome')) {
      url.searchParams.set('f', 'webp');
    }
    
    return url.toString();
  };

  useEffect(() => {
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
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (isInView && src) {
      const optimized = generateOptimizedSrc(src);
      setOptimizedSrc(optimized);
    }
  }, [isInView, src, quality, format]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        containerClassName
      )}
    >
      {/* Skeleton Loading */}
      {!isInView && showSkeleton && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {isInView && !isLoaded && !isError && showSkeleton && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {/* Blur Placeholder */}
      {blurDataURL && !isLoaded && (
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-sm scale-110"
          style={{ backgroundImage: `url(${blurDataURL})` }}
        />
      )}
      
      {/* Main Image */}
      {isInView && optimizedSrc && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-500',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
          fetchPriority={loading === 'eager' ? 'high' : 'low'}
        />
      )}
      
      {/* Fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {fallback || (
            <div className="text-center text-muted-foreground">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm">فشل في تحميل الصورة</p>
            </div>
          )}
        </div>
      )}
      
      {/* Custom Placeholder */}
      {placeholder && !isInView && (
        <div className="absolute inset-0">
          {placeholder}
        </div>
      )}
    </div>
  );
};

export default LazyImageOptimized;
