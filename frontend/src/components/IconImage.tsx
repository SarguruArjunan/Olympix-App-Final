import React, { useRef, memo, useState } from 'react';
import { getOptimizedImageUrl, generatePlaceholder } from '../utils/imageOptimization';

const DEFAULT_ICON = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 6v12"/>
  <path d="M6 12h12"/>
</svg>
`)}`;

interface IconImageProps {
  src: string;
  alt: string;
  className?: string;
}

const IconImage = memo(({ src, alt, className }: IconImageProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const optimizedSrc = getOptimizedImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(optimizedSrc);
  const hasTriedFallbackRef = useRef(false);
  
  const handleImageError = () => {
    if (imgRef.current) {
      // First try: if URL contains '/icons/', try '/Icons/' (case fix)
      if (currentSrc.includes('/icons/') && !hasTriedFallbackRef.current) {
        hasTriedFallbackRef.current = true;
        const fallbackSrc = currentSrc.replace('/icons/', '/Icons/');
        setCurrentSrc(fallbackSrc);
        imgRef.current.src = fallbackSrc;
        return;
      }
      
      // Second try: if URL contains '/Icons/', try '/icons/' (reverse case)
      if (currentSrc.includes('/Icons/') && !hasTriedFallbackRef.current) {
        hasTriedFallbackRef.current = true;
        const fallbackSrc = currentSrc.replace('/Icons/', '/icons/');
        setCurrentSrc(fallbackSrc);
        imgRef.current.src = fallbackSrc;
        return;
      }
      
      // Final fallback: use default icon
      imgRef.current.src = DEFAULT_ICON;
    }
  };

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
});

IconImage.displayName = 'IconImage';

export default IconImage;