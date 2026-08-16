'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ShoppingCart, Heart, Eye, Star, Filter, X } from 'lucide-react';
import { useApp } from '@/components/context/AppContext';
import ProductModal from '@/components/ProductModal';
import { toast } from 'sonner';
import {
  CATEGORY_OPTIONS,
  DEFAULT_FILTERS,
  GENDER_OPTIONS,
  SORT_OPTIONS,
  buildShopHref,
  filterAndSortProducts,
  filtersFromContext,
  getCatalogCopy,
  hasActiveFilters,
  type CatalogFilters,
  type Product,
  type ProductSort,
} from '@/features/catalog';

type FeaturedProductsProps = {
  /** When true, filters sync to `/shop` URL query params */
  urlSynced?: boolean;
  initialFilters?: CatalogFilters;
  showHeader?: boolean;
};

export default function FeaturedProducts({
  urlSynced = false,
  initialFilters,
  showHeader = true,
}: FeaturedProductsProps) {
  const { state, dispatch } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<CatalogFilters>(
    initialFilters ?? DEFAULT_FILTERS
  );

  useEffect(() => {
    if (urlSynced && initialFilters) {
      setLocalFilters(initialFilters);
    }
  }, [urlSynced, initialFilters]);

  const filters: CatalogFilters = useMemo(() => {
    if (urlSynced) return localFilters;
    return {
      ...filtersFromContext(state),
      sort: localFilters.sort,
    };
  }, [urlSynced, localFilters, state]);

  const applyFilters = useCallback(
    (next: CatalogFilters, options?: { toastClear?: boolean }) => {
      if (urlSynced) {
        setLocalFilters(next);
        router.replace(buildShopHref(next), { scroll: false });
      } else {
        dispatch({
          type: 'SET_SEARCH_QUERY',
          payload: next.sale ? 'sale' : next.q,
        });
        dispatch({ type: 'SET_CATEGORY', payload: next.category });
        dispatch({ type: 'SET_GENDER', payload: next.gender });
        dispatch({
          type: 'SET_PRICE_RANGE',
          payload: [next.minPrice, next.maxPrice],
        });
        setLocalFilters((prev) => ({ ...prev, sort: next.sort }));
      }

      if (options?.toastClear) {
        toast.success('Filters cleared');
      }
    },
    [dispatch, router, urlSynced]
  );

  const patchFilters = useCallback(
    (patch: Partial<CatalogFilters>) => {
      applyFilters({ ...filters, ...patch });
    },
    [applyFilters, filters]
  );

  const clearFilters = useCallback(() => {
    applyFilters({ ...DEFAULT_FILTERS, sort: filters.sort }, { toastClear: true });
  }, [applyFilters, filters.sort]);

  const filteredProducts = useMemo(
    () => filterAndSortProducts(state.products, filters),
    [state.products, filters]
  );

  const { title, subtitle } = getCatalogCopy(filters);
  const active = hasActiveFilters(filters);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultSize = product.sizes[Math.floor(product.sizes.length / 2)];
    const defaultColor = product.colors[0];
    if (defaultSize == null || !defaultColor) {
      toast.error('This product is missing size or color options');
      return;
    }

    dispatch({
      type: 'ADD_TO_CART',
      payload: { product, size: defaultSize, color: defaultColor },
    });

    toast.success('Added to cart!');
    dispatch({ type: 'TOGGLE_CART' });
  };

  const handleToggleWishlist = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isInWishlist = state.wishlist.includes(productId);

    if (isInWishlist) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
      toast.success('Removed from wishlist');
    } else {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: productId });
      toast.success('Added to wishlist!');
    }
  };

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        className={
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }
      />
    ));

  return (
    <section id="featured" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showHeader && (
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4 tracking-tight">
              {title}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
          </motion.div>
        )}

        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-start">
            <motion.button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Filter size={16} />
              FILTERS
            </motion.button>

            {active && (
              <motion.button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-[#E3002C] text-white rounded-lg hover:bg-[#C5001F] transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <X size={16} />
                CLEAR FILTERS
              </motion.button>
            )}

            <p className="text-gray-600">
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700" htmlFor="sort-by">
              Sort by:
            </label>
            <select
              id="sort-by"
              value={filters.sort}
              onChange={(e) =>
                patchFilters({ sort: e.target.value as ProductSort })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-[#E3002C] focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mb-8 p-6 bg-gray-50 rounded-lg overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-black">Filters</h3>
                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-3">
                    Gender
                  </p>
                  <div className="space-y-2">
                    {GENDER_OPTIONS.map((gender) => (
                      <button
                        key={gender.value}
                        type="button"
                        onClick={() => patchFilters({ gender: gender.value })}
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          filters.gender === gender.value
                            ? 'bg-[#E3002C] text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {gender.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </p>
                  <div className="space-y-2">
                    {CATEGORY_OPTIONS.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() =>
                          patchFilters({ category: category.value })
                        }
                        className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          filters.category === category.value
                            ? 'bg-[#E3002C] text-white'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    className="block text-sm font-medium text-gray-700 mb-3"
                    htmlFor="price-range"
                  >
                    Price Range: ${filters.minPrice} - ${filters.maxPrice}
                  </label>
                  <div className="space-y-4">
                    <input
                      id="price-range"
                      type="range"
                      min="0"
                      max="300"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        patchFilters({ maxPrice: Number(e.target.value) })
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>$0</span>
                      <span>$300</span>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={filters.sale}
                        onChange={(e) =>
                          patchFilters({ sale: e.target.checked, q: '' })
                        }
                        className="accent-[#E3002C]"
                      />
                      On sale only
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {filteredProducts.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                Try adjusting your filters or search terms
              </p>
              <motion.button
                type="button"
                onClick={clearFilters}
                className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-6 py-3 font-bold tracking-wide transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                CLEAR FILTERS
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => {
                const isInWishlist =
                  state.hasHydrated && state.wishlist.includes(product.id);

                return (
                  <motion.div
                    key={product.id}
                    className="group bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                  >
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
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

                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                        <motion.button
                          type="button"
                          onClick={(e) => handleToggleWishlist(product.id, e)}
                          className={`p-2 rounded-full transition-all ${
                            isInWishlist
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-white/90 text-gray-600 hover:text-red-500 hover:bg-white'
                          } opacity-100 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-sm`}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={
                            isInWishlist
                              ? 'Remove from wishlist'
                              : 'Add to wishlist'
                          }
                        >
                          <Heart
                            size={16}
                            className={isInWishlist ? 'fill-current' : ''}
                          />
                        </motion.button>

                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleQuickView(product);
                          }}
                          className="p-2 bg-white/90 text-gray-600 hover:text-[#E3002C] hover:bg-white rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all backdrop-blur-sm"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Quick view"
                        >
                          <Eye size={16} />
                        </motion.button>
                      </div>

                      <Link href={`/product/${product.slug}`} className="block h-full">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </Link>

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <motion.button
                          type="button"
                          onClick={(e) => handleAddToCart(product, e)}
                          className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-6 py-3 font-bold tracking-wide flex items-center gap-2 shadow-lg pointer-events-auto"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <ShoppingCart size={18} />
                          QUICK ADD
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-6">
                      <Link href={`/product/${product.slug}`}>
                        <h3 className="text-lg font-bold text-black mb-2 group-hover:text-[#E3002C] transition-colors">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(product.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.reviewCount})
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4">
                        {product.colors?.length ?? 0} colors available
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl font-bold text-black">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-lg text-gray-400 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>

                      <motion.button
                        type="button"
                        onClick={(e) => handleAddToCart(product, e)}
                        className="w-full bg-black hover:bg-[#E3002C] text-white py-3 font-bold tracking-wide transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        QUICK ADD
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>

        {filteredProducts.length > 0 && pathname === '/' && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link href="/#collections">
              <motion.span
                className="inline-block bg-black hover:bg-[#E3002C] text-white px-12 py-4 font-bold tracking-wide transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                EXPLORE COLLECTIONS
              </motion.span>
            </Link>
          </motion.div>
        )}

        <ProductModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </section>
  );
}
