'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star, ShoppingCart, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { useApp } from '@/components/context/AppContext';
import type { Product } from '@/features/catalog';
import { BRAND } from '@/lib/brand';
import { buildShopHref } from '@/features/catalog';

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
  const { state, dispatch } = useApp();
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? '');

  const isInWishlist = state.wishlist.includes(product.id);
  const images = product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        product,
        size: selectedSize,
        color: selectedColor,
      },
    });

    toast.success('Added to cart!');
    dispatch({ type: 'SET_CART_OPEN', payload: true });
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
      toast.success('Removed from wishlist');
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product.id });
      toast.success('Added to wishlist!');
    }
  };

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }
      />
    ));

  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <Link
          href={buildShopHref()}
          className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-gray-600 hover:text-[#E3002C] transition-colors mb-8"
        >
          <ChevronLeft size={16} />
          BACK TO SHOP
        </Link>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-4">
            <div className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
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

              <AnimatePresence mode="wait">
                <motion.div
                  key={images[activeImage]}
                  className="h-full w-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <ImageWithFallback
                    src={images[activeImage]}
                    alt={`${product.name} view ${activeImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === index
                        ? 'border-[#E3002C]'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                    aria-label={`Show image ${index + 1}`}
                  >
                    <ImageWithFallback
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div>
              <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-2">
                {BRAND.name}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-black">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed max-w-xl">
                {product.description}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-bold text-black mb-3">Colors</h2>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <motion.button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                      selectedColor === color
                        ? 'border-[#E3002C] bg-[#E3002C] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {color}
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-black mb-3">Size (US)</h2>
              <div className="grid grid-cols-6 gap-2 max-w-md">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 border-2 rounded-lg font-medium transition-all ${
                      selectedSize === size
                        ? 'border-[#E3002C] bg-[#E3002C] text-white'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-sm text-gray-500 mt-2">Please select a size</p>
              )}
              <Link
                href="/size-guide"
                className="inline-block mt-3 text-sm font-medium text-[#E3002C] hover:underline"
              >
                Size guide
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3">
                <motion.button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                  className="flex-1 bg-[#E3002C] hover:bg-[#C5001F] disabled:bg-gray-400 text-white py-4 px-6 font-bold tracking-wide flex items-center justify-center gap-2 transition-colors"
                  whileHover={{ scale: selectedSize ? 1.02 : 1 }}
                  whileTap={{ scale: selectedSize ? 0.98 : 1 }}
                >
                  <ShoppingCart size={20} />
                  ADD TO CART
                </motion.button>

                <motion.button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label={
                    isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
                  }
                  className={`p-4 border-2 rounded-lg transition-all ${
                    isInWishlist
                      ? 'border-red-500 bg-red-500 text-white'
                      : 'border-gray-300 hover:border-red-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart
                    size={20}
                    className={isInWishlist ? 'fill-current' : ''}
                  />
                </motion.button>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>✓ Free shipping on orders over ${BRAND.freeShippingThreshold}</p>
                <p>✓ 30-day returns</p>
                <p>✓ Authentic {BRAND.name} guarantee</p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Category:{' '}
                <Link
                  href={buildShopHref({ category: product.category })}
                  className="font-medium text-black hover:text-[#E3002C]"
                >
                  {product.category.replace(/-/g, ' ').toUpperCase()}
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                YOU MAY ALSO LIKE
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                Complete the look with related {BRAND.name} silhouettes.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="group block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-black group-hover:text-[#E3002C] transition-colors mb-2">
                        {item.name}
                      </h3>
                      <p className="text-lg font-bold">${item.price}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
