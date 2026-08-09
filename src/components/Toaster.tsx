'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      duration={2000}
      toastOptions={{
        style: {
          background: '#000',
          color: '#fff',
          border: '1px solid #E3002C',
        },
        className: 'class',
      }}
    />
  );
}
