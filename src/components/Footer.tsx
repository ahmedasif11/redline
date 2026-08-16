'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import {
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaYoutube,
  FaInstagram,
} from 'react-icons/fa';
import { BRAND } from '@/lib/brand';
import BrandMark from '@/components/BrandMark';

export default function Footer() {
  const shopLinks = [
    { label: 'Men', href: '/shop?gender=men' },
    { label: 'Women', href: '/shop?gender=women' },
    { label: 'New Releases', href: '/shop?category=new-releases' },
    { label: 'Sale', href: '/shop?sale=1' },
    { label: 'Collections', href: '/#collections' },
  ];

  const aboutLinks = [
    { label: 'Our Story', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
    { label: 'Sustainability', href: '#' },
  ];

  const supportLinks = [
    { label: 'Size Guide', href: '/size-guide' },
    { label: 'Contact Us', href: '#' },
    { label: 'Order Status', href: '/account/orders' },
    { label: 'Shipping Info', href: '/shipping' },
    { label: 'Returns', href: '/returns' },
  ];

  const socialLinks = [
    {
      icon: FaInstagram,
      label: 'Instagram',
      href: 'https://www.instagram.com/ahmed_asif_11_/',
    },
    { icon: FaTwitter, label: 'Twitter', href: '#' },
    { icon: FaYoutube, label: 'YouTube', href: '#' },
    {
      icon: FaLinkedin,
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/ahmedasif11/',
    },
    { icon: FaGithub, label: 'GitHub', href: 'https://github.com/ahmedasif11' },
  ];

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <motion.div
            className="space-y-4 sm:space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-2">
              <BrandMark className="h-8 w-8 sm:h-10 sm:w-10" />
              <span className="text-xl sm:text-2xl font-bold tracking-wider">
                {BRAND.name}
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm sm:text-base">
              Premium performance footwear with court-to-street energy. Built to
              move. Made to last.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 hover:bg-[#E3002C] rounded-full flex items-center justify-center transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon size={16} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 tracking-wide">
              SHOP
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 tracking-wide">
              ABOUT {BRAND.name}
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {aboutLinks.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                    whileHover={{ x: 5 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 tracking-wide">
              HELP & SUPPORT
            </h3>
            <ul className="space-y-2 sm:space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <motion.div whileHover={{ x: 5 }}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div
                className="text-xs sm:text-sm text-gray-400"
                suppressHydrationWarning
              >
                &copy; {new Date().getFullYear()} {BRAND.name}. All rights
                reserved.
              </div>
              <div className="flex flex-wrap justify-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Accessibility
                </a>
              </div>
            </div>

            <div className="flex justify-center items-center space-x-4 text-xs sm:text-sm text-gray-400">
              <span>United States</span>
              <span>|</span>
              <span>$ USD</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="bg-[#E3002C] py-3 sm:py-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white font-medium tracking-wide text-sm sm:text-base">
            OWN THE LINE
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
