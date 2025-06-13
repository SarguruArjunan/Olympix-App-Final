import React, { useRef, memo } from 'react';

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
  const hasErrorRef = useRef(false);
  
  const handleImageError = () => {
    if (!hasErrorRef.current && imgRef.current) {
      hasErrorRef.current = true;
      imgRef.current.src = DEFAULT_ICON;
    }
  };

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className={className}
      onError={handleImageError}
      loading="lazy"
    />
  );
});

IconImage.displayName = 'IconImage';

export default IconImage;