'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import {
  useApp,
  getCartTotal,
  getCartItemCount,
} from '@/components/context/AppContext';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { useEscapeKey, useFocusTrap } from '@/hooks/useFocusTrap';
import { BRAND } from '@/lib/brand';
import { springSidebar } from '@/lib/motion';
import { toast } from 'sonner';

export default function CartSidebar() {
  const { state, dispatch } = useApp();
  const { cart, isCartOpen } = state;
  const close = useCallback(
    () => dispatch({ type: 'SET_CART_OPEN', payload: false }),
    [dispatch]
  );
  const panelRef = useFocusTrap(isCartOpen);
  useEscapeKey(isCartOpen, close);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    dispatch({
      type: 'UPDATE_CART_QUANTITY',
      payload: { id, quantity: newQuantity },
    });
    if (newQuantity === 0) {
      toast.success('Item removed from cart');
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    toast.success('Item removed from cart');
  };

  const handleCheckout = () => {
    close();
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
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
        {isCartOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-40 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={springSidebar}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={24} className="text-[#E3002C]" aria-hidden />
                  <h2 className="text-xl font-bold text-black">
                    Cart ({getCartItemCount(cart)})
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Close cart"
                  onClick={close}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-6 space-y-4">
                <AnimatePresence>
                  {cart.length === 0 ? (
                    <motion.div
                      className="flex flex-col items-center justify-center h-full text-center space-y-4"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ShoppingBag size={64} className="text-gray-300" aria-hidden />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Your cart is empty
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
                    cart.map((item) => {
                      const itemId = `${item.id}-${item.selectedSize}-${item.selectedColor}`;
                      return (
                        <motion.div
                          key={itemId}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 100 }}
                          layout
                        >
                          <div className="w-20 h-20 bg-white rounded-lg overflow-hidden">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-black text-sm truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Size: {item.selectedSize} | {item.selectedColor}
                            </p>
                            <p className="font-bold text-[#E3002C] mt-1">
                              ${item.price}
                            </p>

                            <div className="flex items-center gap-3 mt-3">
                              <motion.button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() =>
                                  handleUpdateQuantity(itemId, item.quantity - 1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:border-[#E3002C] transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Minus size={12} />
                              </motion.button>
                              <span className="font-medium text-sm w-6 text-center">
                                {item.quantity}
                              </span>
                              <motion.button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() =>
                                  handleUpdateQuantity(itemId, item.quantity + 1)
                                }
                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:border-[#E3002C] transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Plus size={12} />
                              </motion.button>
                            </div>
                          </div>

                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => handleRemoveItem(itemId)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>

              {cart.length > 0 && (
                <div className="border-t border-gray-200 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-black">Total:</span>
                    <span className="text-2xl font-bold text-[#E3002C]">
                      ${getCartTotal(cart).toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <Link
                      href="/checkout"
                      onClick={handleCheckout}
                      className="block w-full text-center bg-[#E3002C] hover:bg-[#C5001F] text-white py-4 font-bold tracking-wide transition-colors"
                    >
                      CHECKOUT
                    </Link>

                    <motion.button
                      type="button"
                      onClick={close}
                      className="w-full border-2 border-black text-black hover:bg-black hover:text-white py-3 font-bold tracking-wide transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      CONTINUE SHOPPING
                    </motion.button>
                  </div>

                  <div className="text-center text-sm text-gray-500 space-y-1">
                    <p>
                      ✓ Free shipping on orders over $
                      {BRAND.freeShippingThreshold}
                    </p>
                    <p>✓ 30-day returns</p>
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
