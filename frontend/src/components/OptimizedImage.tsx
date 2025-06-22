import React, { useState, useRef, useCallback, memo } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  compression?: 'high' | 'medium' | 'low';
  format?: 'webp' | 'png' | 'jpg' | 'auto';
}

const OptimizedImage = memo(({
  src,
  alt,
  className = '',
  fallbackSrc,
  placeholder,
  width,
  height,
  lazy = true,
  compression = 'medium',
  format = 'auto'
}: OptimizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fallbackAttempted = useRef(false);

  // Generate optimized image URLs based on format and compression
  const getOptimizedSrc = useCallback((originalSrc: string): string[] => {
    const urls: string[] = [];
    
    // Try WebP first if supported and requested
    if (format === 'webp' || format === 'auto') {
      if (originalSrc.includes('.png') || originalSrc.includes('.jpg') || originalSrc.includes('.jpeg')) {
        urls.push(originalSrc.replace(/\.(png|jpe?g)$/, '.webp'));
      }
    }
    
    // Add original URL
    urls.push(originalSrc);
    
    // Add fallback variations
    if (originalSrc.includes('/images/teams/')) {
      // Try different naming conventions
      const filename = originalSrc.split('/').pop()?.replace(/\.(png|jpe?g|webp)$/, '');
      if (filename) {
        urls.push(`/images/teams/${filename.toLowerCase()}.png`);
        urls.push(`/images/teams/${filename.replace('-', '_')}.png`);
        urls.push(`/images/teams/${filename.replace('_', '-')}.png`);
      }
    }
    
    return urls;
  }, [format]);

  // Intersection Observer for lazy loading
  const setImageRef = useCallback((node: HTMLImageElement | null) => {
    if (imgRef.current && observerRef.current) {
      observerRef.current.unobserve(imgRef.current);
    }

    if (imgRef.current) {
      (imgRef as React.MutableRefObject<HTMLImageElement | null>).current = node;
    }

    if (!node || !lazy) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.unobserve(node);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(node);
  }, [lazy]);

  // Handle image loading with multiple fallbacks
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    if (!fallbackAttempted.current && fallbackSrc) {
      fallbackAttempted.current = true;
      setCurrentSrc(fallbackSrc);
      return;
    }
    
    setIsLoading(false);
    setHasError(true);
  }, [fallbackSrc]);

  // Initialize image loading when in view
  React.useEffect(() => {
    if (!isInView) return;

    const urls = getOptimizedSrc(src);
    
    // Try URLs in order of preference
    const tryLoadImage = async (urlIndex: number = 0): Promise<void> => {
      if (urlIndex >= urls.length) {
        handleError();
        return;
      }

      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          setCurrentSrc(urls[urlIndex]);
          handleLoad();
          resolve();
        };
        img.onerror = () => {
          tryLoadImage(urlIndex + 1).then(resolve);
        };
        img.src = urls[urlIndex];
      });
    };

    tryLoadImage();
  }, [isInView, src, getOptimizedSrc, handleLoad, handleError]);

  // Cleanup observer
  React.useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Generate placeholder with blur effect
  const getPlaceholder = (): string => {
    if (placeholder) return placeholder;
    
    // Generate a simple SVG placeholder
    const placeholderSvg = `
      <svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <rect width="40%" height="40%" x="30%" y="30%" fill="#e5e7eb" rx="8"/>
        <circle cx="42%" cy="42%" r="8%" fill="#d1d5db"/>
        <rect width="20%" height="4%" x="40%" y="58%" fill="#d1d5db" rx="2"/>
        <rect width="30%" height="4%" x="35%" y="66%" fill="#e5e7eb" rx="2"/>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(placeholderSvg)}`;
  };

  // Show placeholder while loading or if lazy loading not triggered
  if (!isInView || isLoading || hasError) {
    return (
      <div
        ref={setImageRef}
        className={`${className} bg-gray-200 animate-pulse flex items-center justify-center overflow-hidden`}
        style={{ width, height }}
      >
        {hasError ? (
          <div className="text-gray-400 text-center p-2">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Image not found</span>
          </div>
        ) : (
          <img
            src={getPlaceholder()}
            alt={`Loading ${alt}`}
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>
    );
  }

  return (
    <img
      ref={setImageRef}
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onLoad={handleLoad}
      onError={handleError}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      style={{
        filter: isLoading ? 'blur(8px)' : 'none',
        transition: 'filter 0.3s ease-in-out'
      }}
    />
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;