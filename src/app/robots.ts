import type { MetadataRoute } from 'next';

const siteUrl = 'https://billi-boba-nails.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin/',
        '/account',
        '/account/',
        '/cart',
        '/checkout',
        '/login',
        '/order-confirmed',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}