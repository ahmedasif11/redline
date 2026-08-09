'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Star, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Product, useApp } from '@/components/context/AppContext';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { useEscapeKey, useFocusTrap } from '@/hooks/useFocusTrap';
import { toast } from 'sonner';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const { state, dispatch } = useApp();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const panelRef = useFocusTrap(isOpen && !!product);
  const handleClose = useCallback(() => onClose(), [onClose]);
  useEscapeKey(isOpen && !!product, handleClose);

  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || '');
      setSelectedSize(null);
    }
  }, [product]);

  if (!product) return null;

  const isInWishlist = state.wishlist.includes(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, size: selectedSize, color: selectedColor }
    });

    toast.success('Added to cart! 🛒');
    dispatch({ type: 'TOGGLE_CART' });
    onClose();
  };

  const handleToggleWishlist = () => {
    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: product.id });
      toast.success('Removed from wishlist');
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product.id });
      toast.success('Added to wishlist! ❤️');
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={product.name}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2 gap-8 p-8">
                {/* Product Image */}
                <div className="relative">
                  <motion.button
                    type="button"
                    aria-label="Close product details"
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 bg-white/80 rounded-full z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X size={20} />
                  </motion.button>

                  {/* Badges */}
                  <div className="absolute top-0 left-0 z-10 flex flex-col gap-2">
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

                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <h1 className="text-3xl font-bold text-black mb-2">
                      {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl font-bold text-black">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xl text-gray-400 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3">Colors</h3>
                    <div className="flex flex-wrap gap-3">
                      {product.colors.map((color) => (
                        <motion.button
                          key={color}
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

                  {/* Size Selection */}
                  <div>
                    <h3 className="text-lg font-bold text-black mb-3">Size (US)</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {product.sizes.map((size) => (
                        <motion.button
                          key={size}
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
                      <p className="text-sm text-gray-500 mt-2">
                        Please select a size
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <motion.button
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
                        onClick={handleToggleWishlist}
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
                      <p>✓ Free shipping on orders over $50</p>
                      <p>✓ 30-day returns</p>
                      <p>✓ Authentic REDLINE guarantee</p>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="block text-center text-sm font-bold tracking-wide text-[#E3002C] hover:underline"
                    >
                      VIEW FULL DETAILS →
                    </Link>
                  </div>

                  {/* Category */}
                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Category:{' '}
                      <span className="font-medium text-black">
                        {product.category.replace(/-/g, ' ').toUpperCase()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}