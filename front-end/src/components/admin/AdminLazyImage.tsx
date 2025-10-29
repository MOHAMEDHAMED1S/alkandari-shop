import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, AlertCircle } from 'lucide-react';

interface AdminLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape' | 'auto';
  showStatus?: boolean;
  status?: 'active' | 'inactive' | 'pending' | 'error';
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
  loading?: 'lazy' | 'eager';
  showSkeleton?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const AdminLazyImage: React.FC<AdminLazyImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  size = 'md',
  aspectRatio = 'square',
  showStatus = false,
  status = 'active',
  placeholder,
  fallback,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px',
  loading = 'lazy',
  showSkeleton = true,
  clickable = false,
  onClick,
}) => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: '',
  };

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    pending: 'bg-yellow-500',
    error: 'bg-red-500',
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

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setIsError(true);
    onError?.();
  };

  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-lg',
        aspectRatioClasses[aspectRatio],
        clickable && 'cursor-pointer hover:scale-105 transition-transform duration-200',
        containerClassName
      )}
      onClick={handleClick}
    >
      {/* Status Badge */}
      {showStatus && (
        <div className="absolute top-1 right-1 z-10">
          <div className={cn('w-2 h-2 rounded-full', statusColors[status])} />
        </div>
      )}

      {/* Skeleton Loading */}
      {!isInView && showSkeleton && (
        <Skeleton className={cn('absolute inset-0 w-full h-full', sizeClasses[size])} />
      )}
      
      {isInView && !isLoaded && !isError && showSkeleton && (
        <Skeleton className={cn('absolute inset-0 w-full h-full', sizeClasses[size])} />
      )}
      
      {/* Main Image */}
      {isInView && src && (
        <img
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className
          )}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          decoding="async"
        />
      )}
      
      {/* Fallback */}
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          {fallback || (
            <div className="text-center text-muted-foreground">
              <AlertCircle className="w-4 h-4 mx-auto mb-1" />
              <p className="text-xs">خطأ</p>
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

      {/* No Image Placeholder */}
      {!src && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {/* Loading Indicator */}
      {isInView && !isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};

export default AdminLazyImage;
