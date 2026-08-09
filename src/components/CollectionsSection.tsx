'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildShopHref } from '@/features/catalog';

type Collection = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  color: string;
  category?: string;
  gender?: string;
  slug: string;
};

const collections: Collection[] = [
  {
    id: 1,
    title: 'COURT ONE',
    subtitle: 'WHERE IT ALL BEGAN',
    description: 'The original that started the legend',
    image: 'https://images.unsplash.com/photo-1617813255567-ae6945acf5e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb3JkYW4lMjAxJTIwc25lYWtlciUyMHByb2R1Y3R8ZW58MXx8fHwxNzU2NDYzNzczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-[#E3002C] to-[#B8001A]',
    category: 'classic-high',
    slug: 'court-one',
  },
  {
    id: 2,
    title: 'RETRO',
    subtitle: 'CLASSIC REIMAGINED',
    description: 'Timeless designs with modern comfort',
    image: 'https://images.unsplash.com/photo-1693400652052-884f8dd3dfd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqb3JkYW4lMjByZXRybyUyMGJhc2tldGJhbGwlMjBzaG9lc3xlbnwxfHx8fDE3NTY0NjM3NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-black to-gray-800',
    category: 'retro',
    slug: 'retro',
  },
  {
    id: 3,
    title: 'LIFESTYLE',
    subtitle: 'BEYOND THE COURT',
    description: 'Street-ready style for everyday wear',
    image: 'https://images.unsplash.com/photo-1618718315344-7cbffaa60b6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuaWtlJTIwYWlyJTIwam9yZGFuJTIwbGlmZXN0eWxlfGVufDF8fHx8MTc1NjQ2Mzc3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-gray-700 to-gray-900',
    category: 'lifestyle',
    slug: 'lifestyle',
  },
  {
    id: 4,
    title: "MEN'S",
    subtitle: 'PERFORMANCE & STYLE',
    description: 'Premium sneakers for the modern athlete',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZW4lMjBzbmVha2VyfGVufDF8fHx8MTc1NjQ2Mzc3Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-blue-700 to-blue-900',
    gender: 'men',
    slug: 'men',
  },
  {
    id: 5,
    title: "WOMEN'S",
    subtitle: 'FEMININE POWER',
    description: 'Stylish designs for women who lead',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21lbiUyMGpvcmRhbiUyMHNuZWFrZXJ8ZW58MXx8fHwxNzU2NDYzNzcyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-pink-600 to-purple-700',
    gender: 'women',
    slug: 'women',
  },
  {
    id: 6,
    title: 'NEW RELEASES',
    subtitle: 'LATEST DROPS',
    description: 'Get the newest releases before they sell out',
    image: 'https://images.unsplash.com/photo-1696992402197-04eca5422f10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwc2hvZXMlMjBkaXNwbGF5fGVufDF8fHx8MTc1NjQ0Nzc4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-green-600 to-emerald-800',
    category: 'new-releases',
    slug: 'new-releases',
  },
];

export default function CollectionsSection() {
  const router = useRouter();

  const handleExploreCollection = (collection: Collection) => {
    router.push(`/collections/${collection.slug}`);
  };
  return (
    <section id="collections" className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4 tracking-tight">
            EXPLORE COLLECTIONS
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From court to street, discover the perfect pair for your style
          </p>
        </motion.div>

        {/* Collections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              className="group relative h-96 overflow-hidden rounded-lg cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onClick={() => handleExploreCollection(collection)}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={collection.image}
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${collection.color} opacity-70 group-hover:opacity-80 transition-opacity`} />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <motion.div
                  className="space-y-4"
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div>
                    <p className="text-white/80 text-sm font-medium tracking-widest mb-2">
                      {collection.subtitle}
                    </p>
                    <h3 className="text-white text-3xl font-bold tracking-tight mb-3">
                      {collection.title}
                    </h3>
                    <p className="text-white/90 text-lg">
                      {collection.description}
                    </p>
                  </div>

                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExploreCollection(collection);
                    }}
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 font-bold tracking-wide group-hover:bg-[#E3002C] group-hover:text-white transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    EXPLORE
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Floating number */}
              <div className="absolute top-6 right-6 text-white/30 text-6xl font-bold group-hover:text-white/50 transition-colors">
                {collection.id}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16 bg-black rounded-lg p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-white text-3xl font-bold tracking-tight">
              CAN&apos;T DECIDE?
            </h3>
            <p className="text-gray-300 text-lg">
              Take our style quiz and find the perfect pair for your lifestyle
            </p>
            <motion.button
              type="button"
              onClick={() => router.push(buildShopHref())}
              className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-4 font-bold tracking-wide transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              BROWSE ALL
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}