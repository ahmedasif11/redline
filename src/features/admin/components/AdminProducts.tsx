'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { AdminProductRow } from '@/features/admin';
import type { ProductCategory, ProductGender } from '@/features/catalog';

const CATEGORIES: ProductCategory[] = [
  'classic-high',
  'retro',
  'lifestyle',
  'new-releases',
];
const GENDERS: ProductGender[] = ['men', 'women', 'unisex'];
const DEFAULT_SIZES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12];

type FormState = {
  id?: string;
  name: string;
  slug: string;
  price: string;
  originalPrice: string;
  images: string;
  category: ProductCategory;
  gender: ProductGender;
  colors: string;
  sizes: string;
  description: string;
  isNew: boolean;
  onSale: boolean;
};

const emptyForm = (): FormState => ({
  name: '',
  slug: '',
  price: '180',
  originalPrice: '',
  images: '',
  category: 'classic-high',
  gender: 'unisex',
  colors: 'Black',
  sizes: DEFAULT_SIZES.join(', '),
  description: '',
  isNew: false,
  onSale: false,
});

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseSizes(value: string): number[] {
  return parseList(value)
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
}

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [savingForm, setSavingForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/products');
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Failed to load products');
        return;
      }
      setProducts(payload.data.products);
    } catch {
      toast.error('Unable to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveStock = async (
    productId: string,
    size: number,
    quantity: number
  ) => {
    const key = `${productId}:${size}`;
    setSavingKey(key);
    try {
      const res = await fetch('/api/v1/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, size, quantity }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Update failed');
        return;
      }
      setProducts((prev) =>
        prev.map((row) =>
          row.product.id === productId ? payload.data.product : row
        )
      );
      toast.success('Stock updated');
    } catch {
      toast.error('Unable to update stock');
    } finally {
      setSavingKey(null);
    }
  };

  const openCreate = () => {
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = (row: AdminProductRow) => {
    const p = row.product;
    setForm({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      originalPrice: p.originalPrice != null ? String(p.originalPrice) : '',
      images: p.images.join(', '),
      category: p.category,
      gender: p.gender,
      colors: p.colors.join(', '),
      sizes: p.sizes.join(', '),
      description: p.description,
      isNew: Boolean(p.isNew),
      onSale: Boolean(p.onSale),
    });
    setFormOpen(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const images = parseList(form.images);
    const colors = parseList(form.colors);
    const sizes = parseSizes(form.sizes);
    const price = Number(form.price);
    const originalPrice = form.originalPrice
      ? Number(form.originalPrice)
      : undefined;

    if (!form.name.trim() || !images.length || !colors.length || !sizes.length) {
      toast.error('Name, images, colors, and sizes are required');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Enter a valid price');
      return;
    }

    setSavingForm(true);
    try {
      const payload = {
        id: form.id,
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        price,
        originalPrice:
          originalPrice != null && Number.isFinite(originalPrice)
            ? originalPrice
            : undefined,
        images,
        category: form.category,
        gender: form.gender,
        colors,
        sizes,
        description: form.description.trim() || form.name.trim(),
        isNew: form.isNew,
        onSale: form.onSale,
        stockBySize: Object.fromEntries(
          sizes.map((size) => {
            const existing = form.id
              ? products.find((r) => r.product.id === form.id)?.stockBySize[
                  String(size)
                ]
              : undefined;
            return [String(size), existing ?? 12];
          })
        ),
      };

      const res = await fetch(
        form.id ? `/api/v1/admin/products/${form.id}` : '/api/v1/admin/products',
        {
          method: form.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json();
      if (!res.ok) {
        toast.error(body?.error?.message ?? 'Save failed');
        return;
      }

      const saved = body.data.product as AdminProductRow;
      setProducts((prev) => {
        const idx = prev.findIndex((r) => r.product.id === saved.product.id);
        if (idx === -1) return [saved, ...prev];
        const next = [...prev];
        next[idx] = saved;
        return next;
      });
      toast.success(form.id ? 'Product updated' : 'Product created');
      setFormOpen(false);
      setForm(emptyForm());
    } catch {
      toast.error('Unable to save product');
    } finally {
      setSavingForm(false);
    }
  };

  const removeProduct = async (id: string, name: string) => {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/admin/products/${id}`, {
        method: 'DELETE',
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error?.message ?? 'Delete failed');
        return;
      }
      setProducts((prev) => prev.filter((row) => row.product.id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Unable to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" label="Loading catalog" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-bold tracking-wider text-[#E3002C] mb-1">
            CATALOG
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Products & stock</h1>
          <p className="text-gray-600 mt-2">
            Create and edit products, then adjust live inventory by size.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-6 py-3 font-bold tracking-wide transition-colors"
        >
          ADD PRODUCT
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={submitForm}
          className="bg-white border border-gray-200 p-4 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold tracking-tight text-lg">
              {form.id ? 'Edit product' : 'New product'}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-sm font-bold tracking-wide text-gray-500 hover:text-black"
            >
              CANCEL
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block text-xs font-bold tracking-wide text-gray-500">
              NAME
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
              />
            </label>
            <label className="block text-xs font-bold tracking-wide text-gray-500">
              SLUG
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="auto from name"
                className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
              />
            </label>
            <label className="block text-xs font-bold tracking-wide text-gray-500">
              PRICE
              <input
                required
                type="number"
                min={1}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
              />
            </label>
            <label className="block text-xs font-bold tracking-wide text-gray-500">
              COMPARE-AT PRICE
              <input
                type="number"
                min={1}
                step="0.01"
                value={form.originalPrice}
                onChange={(e) =>
                  setForm((f) => ({ ...f, originalPrice: e.target.value }))
                }
                className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
              />
            </label>
            <label className="block text-xs font-bold tracking-wide text-gray-500">
              CATEGORY
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category: e.target.value as ProductCategory,
                  }))
                }
                className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold tracking-wide text-gray-500">
              GENDER
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    gender: e.target.value as ProductGender,
                  }))
                }
                className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none bg-white"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-xs font-bold tracking-wide text-gray-500">
            IMAGE URLS (comma-separated)
            <input
              required
              value={form.images}
              onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
              className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
            />
          </label>
          <label className="block text-xs font-bold tracking-wide text-gray-500">
            COLORS (comma-separated)
            <input
              required
              value={form.colors}
              onChange={(e) => setForm((f) => ({ ...f, colors: e.target.value }))}
              className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
            />
          </label>
          <label className="block text-xs font-bold tracking-wide text-gray-500">
            SIZES (comma-separated)
            <input
              required
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
              className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
            />
          </label>
          <label className="block text-xs font-bold tracking-wide text-gray-500">
            DESCRIPTION
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className="mt-1 w-full border-2 border-gray-200 px-3 py-2 focus:border-[#E3002C] focus:outline-none"
            />
          </label>

          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2 text-sm font-bold tracking-wide">
              <input
                type="checkbox"
                checked={form.isNew}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isNew: e.target.checked }))
                }
              />
              NEW
            </label>
            <label className="inline-flex items-center gap-2 text-sm font-bold tracking-wide">
              <input
                type="checkbox"
                checked={form.onSale}
                onChange={(e) =>
                  setForm((f) => ({ ...f, onSale: e.target.checked }))
                }
              />
              SALE
            </label>
          </div>

          <button
            type="submit"
            disabled={savingForm}
            className="bg-black hover:bg-gray-900 text-white px-8 py-3 font-bold tracking-wide transition-colors disabled:opacity-60"
          >
            {savingForm ? 'SAVING…' : form.id ? 'SAVE CHANGES' : 'CREATE PRODUCT'}
          </button>
        </form>
      )}

      <div className="space-y-6">
        {products.map((row) => (
          <article
            key={row.product.id}
            className="bg-white border border-gray-200 p-4 sm:p-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="relative w-full sm:w-28 h-36 sm:h-28 bg-gray-100 shrink-0 overflow-hidden">
                <Image
                  src={row.product.image}
                  alt={row.product.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <div>
                    <h2 className="font-bold tracking-tight text-lg">
                      {row.product.name}
                    </h2>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {row.product.slug} · ${row.product.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold">
                      TOTAL{' '}
                      <span className="text-[#E3002C]">{row.totalStock}</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => openEdit(row)}
                      className="text-xs font-bold tracking-wide border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === row.product.id}
                      onClick={() =>
                        void removeProduct(row.product.id, row.product.name)
                      }
                      className="text-xs font-bold tracking-wide border-2 border-[#E3002C] text-[#E3002C] px-3 py-1.5 hover:bg-[#E3002C] hover:text-white transition-colors disabled:opacity-50"
                    >
                      {deletingId === row.product.id ? '…' : 'DELETE'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                  {row.product.sizes.map((size) => {
                    const key = `${row.product.id}:${size}`;
                    const qty = row.stockBySize[String(size)] ?? 0;
                    return (
                      <label key={size} className="block text-xs">
                        <span className="font-bold tracking-wide text-gray-500">
                          SIZE {size}
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={9999}
                          defaultValue={qty}
                          key={`${key}-${qty}`}
                          disabled={savingKey === key}
                          onBlur={(e) => {
                            const next = Number(e.target.value);
                            if (!Number.isFinite(next) || next === qty) return;
                            void saveStock(row.product.id, size, next);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          className="mt-1 w-full border-2 border-gray-200 px-2 py-2 focus:border-[#E3002C] focus:outline-none disabled:bg-gray-50"
                        />
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
