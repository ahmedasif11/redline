'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { getProductImages } from '@/features/catalog';

type GalleryProduct = {
  name: string;
  image: string;
  images?: string[] | null;
  isNew?: boolean;
  onSale?: boolean;
};

interface ProductImageGalleryProps {
  product: GalleryProduct;
  activeImage: number;
  onActiveImageChange: (index: number) => void;
  showBadges?: boolean;
}

export default function ProductImageGallery({
  product,
  activeImage,
  onActiveImageChange,
  showBadges = true,
}: ProductImageGalleryProps) {
  const images = getProductImages(product);
  const count = images.length;
  const index = count === 0 ? 0 : ((activeImage % count) + count) % count;
  const src = images[index] ?? '';

  const canGoPrev = index > 0;
  const canGoNext = index < count - 1;

  const go = (delta: number) => {
    const next = index + delta;
    if (next < 0 || next >= count) return;
    onActiveImageChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
        {showBadges && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-[#E3002C] text-white px-3 py-1 text-xs font-bold tracking-wide">
                NEW
              </span>
            )}
            {product.onSale && (
              <span className="bg-black text-white px-3 py-1 text-xs font-bold tracking-wide">
                SALE
              </span>
            )}
          </div>
        )}

        <ImageWithFallback
          src={src}
          alt={`${product.name} view ${index + 1}`}
          className="w-full h-full object-cover"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={!canGoPrev}
              className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 text-black shadow-sm hover:bg-white disabled:pointer-events-none disabled:opacity-40"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              disabled={!canGoNext}
              className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/90 p-2 text-black shadow-sm hover:bg-white disabled:pointer-events-none disabled:opacity-40"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((thumb, thumbIndex) => (
            <button
              key={`${thumb}-${thumbIndex}`}
              type="button"
              onClick={() => onActiveImageChange(thumbIndex)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                index === thumbIndex
                  ? 'border-[#E3002C]'
                  : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`Show image ${thumbIndex + 1}`}
              aria-current={index === thumbIndex}
            >
              <ImageWithFallback
                src={thumb}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
