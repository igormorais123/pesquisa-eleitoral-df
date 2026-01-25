'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src' | 'onError'> {
  src: string;
  fallbackSrc?: string;
  fallbackElement?: React.ReactNode;
}

export function ImageWithFallback({
  src,
  fallbackSrc,
  fallbackElement,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setUsedFallback(false);
  }, [src]);

  const handleError = () => {
    if (!usedFallback && fallbackSrc) {
      setImgSrc(fallbackSrc);
      setUsedFallback(true);
    } else {
      setHasError(true);
    }
  };

  if (hasError && fallbackElement) {
    return <>{fallbackElement}</>;
  }

  if (hasError) {
    return null;
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
    />
  );
}
