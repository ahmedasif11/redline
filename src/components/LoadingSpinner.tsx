'use client';

import { motion, useReducedMotion } from 'motion/react';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/cn';
import BrandMark from '@/components/BrandMark';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  /** Full-bleed dark brand gate (auth / admin redirects) */
  fullscreen?: boolean;
  label?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  fullscreen = false,
  label,
  className,
}: LoadingSpinnerProps) {
  const reduceMotion = useReducedMotion();

  const mark =
    size === 'sm' ? 'w-9 h-9' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11';
  const word =
    size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-lg';
  const bar = size === 'sm' ? 'w-20' : size === 'lg' ? 'w-40' : 'w-28';

  const tone = fullscreen ? 'dark' : 'light';
  const ink = tone === 'dark' ? 'text-white' : 'text-black';
  const muted = tone === 'dark' ? 'text-white/50' : 'text-gray-500';
  const track = tone === 'dark' ? 'bg-white/15' : 'bg-black/10';

  const core = (
    <div
      className={cn(
        'relative flex flex-col items-center',
        size === 'sm' ? 'gap-4' : 'gap-5',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label ?? `${BRAND.name} loading`}
    >
      {/* Brand mark */}
      <div className="relative flex items-center justify-center">
        <motion.div
          className={cn('flex items-center justify-center', mark)}
          animate={
            reduceMotion ? undefined : { scale: [1, 1.04, 1] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }
          }
        >
          <BrandMark className={mark} />
        </motion.div>
      </div>

      {/* Solid wordmark — no per-letter bounce */}
      <motion.p
        className={cn(
          'font-bold tracking-[0.35em] uppercase',
          word,
          ink
        )}
        animate={
          reduceMotion
            ? { opacity: 1 }
            : { opacity: [0.55, 1, 0.55] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {BRAND.name}
      </motion.p>

      {/* Progress sweep */}
      <div className={cn('relative h-px overflow-hidden', track, bar)} aria-hidden>
        <motion.div
          className="absolute inset-y-0 w-2/5 bg-[#E3002C]"
          animate={
            reduceMotion ? { left: '30%' } : { left: ['-40%', '100%'] }
          }
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.25, repeat: Infinity, ease: 'easeInOut' }
          }
        />
      </div>

      {label ? (
        <p className={cn('text-[10px] font-bold tracking-[0.28em] uppercase', muted)}>
          {label}
        </p>
      ) : null}

      <span className="sr-only">{label ?? 'Loading'}</span>
    </div>
  );

  if (!fullscreen) {
    // Center in the available viewport (admin main / content panels)
    return (
      <div className="flex min-h-[min(28rem,calc(100vh-12rem))] w-full items-center justify-center">
        {core}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      {/* Hero-style dark plane */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#E3002C]/20 via-transparent to-transparent"
        aria-hidden
      />

      {/* Low-opacity floating brand type (hero language) */}
      <motion.span
        className="pointer-events-none absolute left-[8%] top-[18%] select-none text-[12vw] font-black leading-none text-white/[0.04]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { y: [0, -18, 0], rotate: [0, 2, 0] }
        }
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        RL
      </motion.span>
      <motion.span
        className="pointer-events-none absolute bottom-[14%] right-[6%] select-none text-[10vw] font-black leading-none text-[#E3002C]/[0.08]"
        aria-hidden
        animate={
          reduceMotion
            ? undefined
            : { y: [0, 14, 0], rotate: [0, -3, 0] }
        }
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        23
      </motion.span>

      <div className="relative z-10 px-6">{core}</div>
    </div>
  );
}
