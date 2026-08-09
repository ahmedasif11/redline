'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Check } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      toast.success('Successfully subscribed to REDLINE newsletter! 📧');
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }, 1500);
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl font-bold text-black tracking-tight">
              STAY IN THE GAME
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get exclusive access to new releases, special offers, and REDLINE
              stories delivered straight to your inbox.
            </p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              {!isSubscribed && !isLoading ? (
                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex-1 relative">
                    <Mail
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 focus:border-[#E3002C] focus:outline-none text-lg transition-colors"
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="bg-[#E3002C] hover:bg-[#C5001F] text-white px-8 py-4 font-bold tracking-wide transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    SUBSCRIBE
                  </motion.button>
                </motion.div>
              ) : isLoading ? (
                <motion.div
                  className="flex justify-center py-2"
                  key="loading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <LoadingSpinner size="sm" label="Subscribing" />
                </motion.div>
              ) : (
                <motion.div
                  className="flex items-center justify-center gap-3 py-4"
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={18} className="text-white" />
                  </div>
                  <span className="text-lg font-medium text-green-600">
                    Thanks for subscribing!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          <motion.div
            className="flex flex-wrap justify-center gap-6 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span>✓ Exclusive Releases</span>
            <span>✓ Member Discounts</span>
            <span>✓ Style Tips</span>
            <span>✓ Unsubscribe Anytime</span>
          </motion.div>

          {/* Jordan Brand Benefits */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-[#E3002C]">FREE</div>
              <div className="font-medium text-black">SHIPPING</div>
              <div className="text-sm text-gray-600">On orders over $50</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-[#E3002C]">30</div>
              <div className="font-medium text-black">DAY RETURNS</div>
              <div className="text-sm text-gray-600">Hassle-free exchanges</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-[#E3002C]">24/7</div>
              <div className="font-medium text-black">SUPPORT</div>
              <div className="text-sm text-gray-600">
                Expert customer service
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
