import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'All Digital Tools Catalog - Free Online Image, PDF & AI Tools',
  description:
    'Explore our complete catalog of 20+ free, private digital tools for images, PDFs, converters, developer utilities, and AI. High-speed in-browser processing with zero downloads.',
  keywords: [
    'online tools catalog',
    'free image tools',
    'free pdf tools',
    'browser utilities',
    'passport photo maker',
    'background remover',
    'pdf compressor',
    'pdf merger',
    'image resizer',
    'luta tech tools',
  ],
  alternates: {
    canonical: '/tools/',
  },
  openGraph: {
    title: 'All Digital Tools Catalog - Free Online Image, PDF & AI Tools | Luta Tech',
    description:
      'Explore our full suite of fast, private online tools for images, documents, converters, and AI. 100% free and in-browser.',
    url: `${SITE_URL}/tools/`,
    type: 'website',
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools Catalog', url: '/tools/' },
        ]}
      />
      {children}
    </>
  );
}
