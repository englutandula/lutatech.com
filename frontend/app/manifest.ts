import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Luta Tech - Free Digital Tools & AI Studio',
    short_name: 'Luta Tech',
    description: 'High-performance digital tools for images, PDFs, developer utilities, and AI. Fast, secure, and private.',
    start_url: '/',
    display: 'standalone',
    background_color: '#090B10',
    theme_color: '#EB1000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
