import type { MetadataRoute } from 'next';

const siteUrl = 'https://billi-boba-nails.vercel.app';

const routes = [
  '',
  '/shop',
  '/sets',
  '/how-to-order',
  '/photo-guide',
  '/policies',
  '/contact',
  '/track-order',
  '/about',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/shop' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/shop' ? 0.9 : 0.7,
  }));
}