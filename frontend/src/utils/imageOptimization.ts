// Image optimization utilities
export interface ImageOptimizationConfig {
  quality?: number;
  format?: 'webp' | 'png' | 'jpg' | 'auto';
  maxWidth?: number;
  maxHeight?: number;
  lazy?: boolean;
}

// Service Worker registration for image caching
export const registerServiceWorker = (): void => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Preload critical images
export const preloadCriticalImages = (imageUrls: string[]): Promise<void[]> => {
  const preloadPromises = imageUrls.map(url => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload ${url}`));
      img.src = url;
    });
  });

  return Promise.allSettled(preloadPromises).then(results => {
    const fulfilled = results.filter(result => result.status === 'fulfilled') as PromiseFulfilledResult<void>[];
    console.log(`Preloaded ${fulfilled.length}/${imageUrls.length} critical images`);
    return fulfilled.map(result => result.value);
  });
};

// Generate WebP version URL if supported
export const getOptimizedImageUrl = (originalUrl: string, config: ImageOptimizationConfig = {}): string => {
  const { format = 'auto' } = config;
  
  // Check WebP support
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  // Return WebP URL if supported and requested
  if ((format === 'webp' || format === 'auto') && supportsWebP) {
    if (originalUrl.match(/\.(png|jpe?g)$/i)) {
      return originalUrl.replace(/\.(png|jpe?g)$/i, '.webp');
    }
  }

  return originalUrl;
};

// Generate fallback placeholder image
export const generatePlaceholder = (width: number, height: number, color = '#f3f4f6'): string => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${color}"/>
      <rect width="40%" height="40%" x="30%" y="30%" fill="#e5e7eb" rx="8"/>
      <circle cx="42%" cy="42%" r="8%" fill="#d1d5db"/>
      <rect width="20%" height="4%" x="40%" y="58%" fill="#d1d5db" rx="2"/>
      <rect width="30%" height="4%" x="35%" y="66%" fill="#e5e7eb" rx="2"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Image compression utility (for user uploads)
export const compressImage = (
  file: File, 
  maxWidth: number = 800, 
  maxHeight: number = 600, 
  quality: number = 0.8
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Performance monitoring for images
export const monitorImagePerformance = (): void => {
  // Monitor image loading performance
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const resourceEntry = entry as PerformanceResourceTiming;
      if (resourceEntry.initiatorType === 'img') {
        console.log(`Image loaded: ${entry.name} in ${entry.duration.toFixed(2)}ms`);
        
        // Log slow loading images
        if (entry.duration > 1000) {
          console.warn(`Slow image load detected: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
        }
      }
    }
  });

  observer.observe({ entryTypes: ['resource'] });
};

// Intersection Observer for advanced lazy loading
export const createLazyLoadObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Cache management utilities
export const clearImageCache = (): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    return Promise.resolve();
  }
  return Promise.reject(new Error('Service Worker not available'));
};

// Progressive image loading with blur effect
export const loadImageWithBlur = (
  imgElement: HTMLImageElement,
  src: string,
  placeholderSrc?: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Set placeholder if provided
    if (placeholderSrc) {
      imgElement.src = placeholderSrc;
      imgElement.style.filter = 'blur(8px)';
    }

    // Create new image for loading
    const img = new Image();
    
    img.onload = () => {
      imgElement.src = src;
      imgElement.style.filter = 'none';
      imgElement.style.transition = 'filter 0.3s ease-in-out';
      resolve();
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};