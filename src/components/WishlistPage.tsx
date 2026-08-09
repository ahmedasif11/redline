'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShoppingCart, X } from 'lucide-react';
import { useApp, type Product } from '@/components/context/AppContext';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { useEscapeKey, useFocusTrap } from '@/hooks/useFocusTrap';
import { BRAND } from '@/lib/brand';
import { springSidebar } from '@/lib/motion';
import { toast } from 'sonner';

export default function WishlistPage() {
  const { state, dispatch } = useApp();
  const isOpen = state.isWishlistOpen;
  const close = useCallback(
    () => dispatch({ type: 'SET_WISHLIST_OPEN', payload: false }),
    [dispatch]
  );
  const panelRef = useFocusTrap(isOpen);
  useEscapeKey(isOpen, close);

  const wishlistProducts = state.products.filter((product) =>
    state.wishlist.includes(product.id)
  );

  const handleAddToCart = (product: Product) => {
    const defaultSize = product.sizes[0];
    const defaultColor = product.colors[0];
    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, size: defaultSize, color: defaultColor },
    });
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    toast.success(`${productName} removed from wishlist`);
  };

  const handleClearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    toast.success('Wishlist cleared');
    close();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Wishlist"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-40 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={springSidebar}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Heart size={24} className="text-[#E3002C]" aria-hidden />
                  <h2 className="text-xl font-bold text-black">
                    Wishlist ({wishlistProducts.length})
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close wishlist"
                  onClick={close}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-4">
                <AnimatePresence>
                  {wishlistProducts.length === 0 ? (
                    <motion.div
                      className="flex flex-col items-center justify-center h-full text-center space-y-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart size={64} className="text-gray-300" aria-hidden />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Your wishlist is empty
                        </h3>
                        <p className="text-gray-500">
                          Add some {BRAND.name} sneakers to get started!
                        </p>
                      </div>
                      <motion.button
                        type="button"
                        onClick={close}
                        className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-6 py-3 font-bold tracking-wide transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        CONTINUE SHOPPING
                      </motion.button>
                    </motion.div>
                  ) : (
                    wishlistProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        layout
                      >
                        <div className="w-20 h-20 bg-white rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-black text-sm truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.colors[0]} | {product.sizes[0]}
                          </p>
                          <p className="font-bold text-[#E3002C] mt-1">
                            ${product.price}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <motion.button
                            type="button"
                            aria-label={`Add ${product.name} to cart`}
                            onClick={() => handleAddToCart(product)}
                            className="bg-[#E3002C] hover:bg-[#C5001F] text-white p-2 rounded-lg shadow-md shadow-red-500/20"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <ShoppingCart size={18} />
                          </motion.button>
                          <motion.button
                            type="button"
                            aria-label={`Remove ${product.name} from wishlist`}
                            onClick={() =>
                              handleRemoveFromWishlist(product.id, product.name)
                            }
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <X size={16} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>

              {wishlistProducts.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <motion.button
                    type="button"
                    onClick={() => {
                      wishlistProducts.forEach((product) =>
                        handleAddToCart(product)
                      );
                      toast.success(
                        `Added ${wishlistProducts.length} items to cart!`
                      );
                      close();
                    }}
                    className="w-full bg-[#E3002C] hover:bg-[#C5001F] text-white py-4 font-bold tracking-wide transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    ADD ALL TO CART
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={handleClearWishlist}
                    className="w-full border-2 border-black text-black hover:bg-black hover:text-white py-3 font-bold tracking-wide transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    CLEAR WISHLIST
                  </motion.button>
                  <div className="text-center text-sm text-gray-500 space-y-1">
                    <p>✓ Save items for later</p>
                    <p>✓ Get notified of price drops</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
