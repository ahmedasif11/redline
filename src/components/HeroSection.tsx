'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { useApp } from '@/components/context/AppContext';

interface ParticleProps {
  x: string;
  y: string;
  size: number;
  delay: number;
  key?: number;
}

const Particle = ({ x, y, size, delay }: ParticleProps) => (
  <motion.div
    className="absolute rounded-full bg-white/5 pointer-events-none"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      y: [0, -100],
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatDelay: Math.random() * 3,
    }}
  />
);

export default function HeroSection() {
  const { state, dispatch } = useApp();
  const closeSidebars = () => {
    dispatch({ type: 'SET_CART_OPEN', payload: false });
    dispatch({ type: 'SET_WISHLIST_OPEN', payload: false });
  };
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  // Generate particles
  const particles = Array.from({ length: 15 }, () => ({
    x: Math.random() * 100 + '%',
    y: Math.random() * 100 + '%',
    size: Math.random() * 6 + 3,
    delay: Math.random() * 2,
  }));

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const parallaxX = (mousePosition.x - 0.5) * 30;
  const parallaxY = (mousePosition.y - 0.5) * 20;

  const handleShopNow = () => {
    const element = document.getElementById('featured');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExploreCollections = () => {
    const element = document.getElementById('collections');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden flex items-center"
    >
      {/* Background particles */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => {
          const { x, y, size, delay } = particle;
          return <Particle key={i} x={x} y={y} size={size} delay={delay} />;
        })}
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#E3002C]/20 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Mobile Layout: Image first, then buttons, then stats */}
        <div className="block lg:hidden space-y-8">
          {/* Mobile: Featured shoe first */}
          <motion.div
            className="m-3 relative flex items-center justify-center h-80 sm:h-96"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            <motion.div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => {
                if (state.isCartOpen) {
                  dispatch({ type: 'TOGGLE_CART' });
                }
                closeSidebars();
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#E3002C]/30 to-white/10 blur-2xl rounded-full"
                animate={{
                  scale: isHovered ? 1.3 : 1,
                  opacity: isHovered ? 0.8 : 0.4,
                }}
                transition={{ duration: 0.3 }}
              />

              <motion.div
                className="relative z-10"
                animate={{
                  rotateY: isHovered ? 15 : 0,
                  rotateX: isHovered ? -5 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1602231379910-61381b308c2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXIlMjBqb3JkYW4lMjBzbmVha2VyJTIwcHJvZmlsZXxlbnwxfHx8fDE3NTY0NjIzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Featured REDLINE sneaker"
                  className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 object-contain mx-auto"
                />
              </motion.div>

              <motion.div
                className="absolute top-0 right-0 text-white/20 text-6xl sm:text-8xl font-bold"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                23
              </motion.div>

              <motion.div
                className="absolute bottom-0 left-0 text-[#E3002C]/30 text-4xl sm:text-6xl font-bold"
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -3, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
              >
                AIR
              </motion.div>

              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 sm:w-64 h-8 sm:h-12 bg-black/40 blur-xl rounded-full"
                animate={{
                  scale: isHovered ? 1.2 : 1,
                  opacity: isHovered ? 0.6 : 0.3,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>

          {/* Mobile: Hero content with title and description */}
          <motion.div
            className="text-white text-center space-y-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-none"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              FLY WITH
              <span className="block text-[#E3002C]">REDLINE</span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl text-gray-300 max-w-lg mx-auto leading-relaxed px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Experience the legendary performance and iconic style that changed
              the game forever.
            </motion.p>
          </motion.div>

          {/* Mobile: Buttons */}
          <motion.div
            className="flex flex-col gap-4 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <motion.button
              onClick={handleShopNow}
              className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-4 font-bold tracking-wide transition-colors w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              SHOP NOW
            </motion.button>
            <motion.button
              onClick={handleExploreCollections}
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 font-bold tracking-wide transition-all w-full"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              EXPLORE COLLECTIONS
            </motion.button>
          </motion.div>

          {/* Mobile: Stats */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#E3002C]">
                30+
              </div>
              <div className="text-xs sm:text-sm text-gray-400 tracking-wide">
                YEARS OF FLIGHT
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#E3002C]">
                100M+
              </div>
              <div className="text-xs sm:text-sm text-gray-400 tracking-wide">
                PAIRS SOLD
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#E3002C]">
                #1
              </div>
              <div className="text-xs sm:text-sm text-gray-400 tracking-wide">
                BASKETBALL BRAND
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop Layout: Original side-by-side */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Hero content */}
          <motion.div
            className="text-white space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              transform: `translate(${parallaxX * 0.2}px, ${
                parallaxY * 0.2
              }px)`,
            }}
          >
            <div className="space-y-6">
              <motion.h1
                className="text-7xl xl:text-8xl font-bold tracking-tight leading-none"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                FLY WITH
                <span className="block text-[#E3002C]">REDLINE</span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-300 max-w-lg leading-relaxed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Experience the legendary performance and iconic style that
                changed the game forever.
              </motion.p>
            </div>

            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <motion.button
                onClick={handleShopNow}
                className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-4 font-bold tracking-wide transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                SHOP NOW
              </motion.button>
              <motion.button
                onClick={handleExploreCollections}
                className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 font-bold tracking-wide transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                EXPLORE COLLECTIONS
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 pt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-[#E3002C]">30+</div>
                <div className="text-sm text-gray-400 tracking-wide">
                  YEARS OF FLIGHT
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#E3002C]">100M+</div>
                <div className="text-sm text-gray-400 tracking-wide">
                  PAIRS SOLD
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#E3002C]">#1</div>
                <div className="text-sm text-gray-400 tracking-wide">
                  BASKETBALL BRAND
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Featured shoe */}
          <motion.div
            className="relative flex items-center justify-center h-full"
            style={{
              transform: `translate(${parallaxX * 0.4}px, ${
                parallaxY * 0.4
              }px)`,
            }}
          >
            <motion.div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => {
                // Close any open sidebars when clicking on the hero image
                if (state.isCartOpen) {
                  dispatch({ type: 'TOGGLE_CART' });
                }
                // Call the callback to close wishlist if provided
                closeSidebars();
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#E3002C]/30 to-white/10 blur-2xl rounded-full"
                animate={{
                  scale: isHovered ? 1.3 : 1,
                  opacity: isHovered ? 0.8 : 0.4,
                }}
                transition={{ duration: 0.3 }}
              />

              {/* Main shoe image */}
              <motion.div
                className="relative z-10"
                animate={{
                  rotateY: isHovered ? 15 : 0,
                  rotateX: isHovered ? -5 : 0,
                  scale: isHovered ? 1.1 : 1,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{
                  transformStyle: 'preserve-3d',
                }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1602231379910-61381b308c2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXIlMjBqb3JkYW4lMjBzbmVha2VyJTIwcHJvZmlsZXxlbnwxfHx8fDE3NTY0NjIzNDV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Featured REDLINE sneaker"
                  className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] object-contain"
                />
              </motion.div>

              {/* Floating elements */}
              <motion.div
                className="absolute top-0 right-0 text-white/20 text-8xl font-bold"
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                23
              </motion.div>

              <motion.div
                className="absolute bottom-0 left-0 text-[#E3002C]/30 text-6xl font-bold"
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -3, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2,
                }}
              >
                AIR
              </motion.div>

              {/* Shadow */}
              <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-12 bg-black/40 blur-xl rounded-full"
                animate={{
                  scale: isHovered ? 1.2 : 1,
                  opacity: isHovered ? 0.6 : 0.3,
                }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <motion.div
            className="w-1 h-3 bg-white/60 rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
