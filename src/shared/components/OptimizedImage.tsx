"use client";

import { useMemo } from "react";
import {
  getOptimizedImageUrl,
  getOptimizedSrcSet,
  IMAGE_PRESETS,
  type ImagePreset,
} from "@/lib/cloudinary-image";

export interface OptimizedImageProps {
  src: string | null | undefined;
  alt?: string;
  preset?: ImagePreset;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  crop?: string;
}

export default function OptimizedImage({
  src,
  alt = "",
  preset,
  width,
  height,
  sizes,
  className,
  loading = "lazy",
  priority = false,
  crop,
}: OptimizedImageProps) {
  const options = useMemo(() => {
    const base: { width?: number; height?: number; crop?: string } = preset
      ? { ...IMAGE_PRESETS[preset] }
      : {};
    if (width) base.width = width;
    if (height) base.height = height;
    if (crop) base.crop = crop;
    return base;
  }, [preset, width, height, crop]);

  const optimizedSrc = useMemo(
    () => (src ? getOptimizedImageUrl(src, options) : null),
    [src, options],
  );

  const srcSet = useMemo(() => {
    const w = options.width;
    if (!src || !w) return undefined;
    return getOptimizedSrcSet(src, w, options);
  }, [src, options]);

  if (!optimizedSrc) {
    return null;
  }

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? "eager" : loading}
      decoding="async"
      width={width}
      height={height}
    />
  );
}
