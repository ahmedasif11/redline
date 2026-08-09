import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://redline.example';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/checkout', '/checkout/success', '/account', '/login', '/register'],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
