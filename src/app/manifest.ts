import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BILLi&BoBA NAILS',
    short_name: 'B&B Nails',
    description: 'Handmade press-on nail sets fitted using guided hand photos.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fff8fc',
    theme_color: '#f4eaff',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  };
}