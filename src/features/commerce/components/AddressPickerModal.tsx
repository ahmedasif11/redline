'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEscapeKey, useFocusTrap } from '@/hooks/useFocusTrap';
import type { Address } from '@/features/auth';

const inputClass =
  'w-full border-2 border-gray-200 px-4 py-3 focus:border-[#E3002C] focus:outline-none transition-colors';

function matchesQuery(address: Address, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    address.label,
    address.fullName,
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
  ].some((value) => value?.toLowerCase().includes(q));
}

interface AddressPickerModalProps {
  isOpen: boolean;
  addresses: Address[];
  selectedId: string;
  onSelect: (address: Address) => void;
  onClose: () => void;
}

export default function AddressPickerModal({
  isOpen,
  addresses,
  selectedId,
  onSelect,
  onClose,
}: AddressPickerModalProps) {
  const [query, setQuery] = useState('');
  const panelRef = useFocusTrap(isOpen);
  useEscapeKey(isOpen, onClose);

  const showSearch = addresses.length > 6;
  const sorted = useMemo(
    () =>
      [...addresses].sort(
        (a, b) => Number(b.isDefault) - Number(a.isDefault)
      ),
    [addresses]
  );
  const filtered = useMemo(
    () => sorted.filter((address) => matchesQuery(address, query)),
    [sorted, query]
  );

  return (
    <AnimatePresence>
      {isOpen ? (
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
            aria-labelledby="address-picker-title"
            className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-gray-100">
              <h2
                id="address-picker-title"
                className="text-lg font-bold tracking-wide"
              >
                SHIPPING ADDRESSES
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-500 hover:text-black"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {showSearch ? (
              <div className="px-5 pt-4">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by label, name, or street"
                  className={inputClass}
                  autoComplete="off"
                />
              </div>
            ) : null}

            <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-2 max-h-[60vh]">
              {filtered.length === 0 ? (
                <li className="text-sm text-gray-500 py-6 text-center">
                  No addresses match that search.
                </li>
              ) : (
                filtered.map((address) => {
                  const selected = selectedId === address.id;
                  return (
                    <li key={address.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(address)}
                        className={`w-full text-left px-4 py-3 border-2 transition-colors ${
                          selected
                            ? 'border-[#E3002C] bg-red-50/40'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <p className="font-bold text-sm">
                          {address.label}
                          {address.isDefault ? (
                            <span className="ml-2 text-[10px] tracking-wide text-[#E3002C]">
                              DEFAULT
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 truncate">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                      </button>
                    </li>
                  );
                })
              )}
            </ul>

            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t-2 border-gray-100">
              <Link
                href="/account/addresses"
                className="text-sm font-bold tracking-wide text-[#E3002C] hover:underline"
              >
                MANAGE ADDRESSES
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="border-2 border-black px-5 py-2 text-sm font-bold tracking-wide hover:bg-black hover:text-white transition-all"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
