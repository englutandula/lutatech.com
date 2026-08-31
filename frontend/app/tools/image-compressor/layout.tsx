import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free Online Image Compressor - Compress JPG, PNG, WEBP',
  description:
    'Compress JPG, PNG, and WebP images online with customizable quality settings and live preview. Batch compression with instant ZIP download. 100% private in-browser.',
  keywords: [
    'image compressor',
    'compress jpeg online',
    'compress png free',
    'shrink image file size',
    'bulk image compressor',
    'webp image compression',
    'private photo compressor',
  ],
  alternates: {
    canonical: '/tools/image-compressor/',
  },
  openGraph: {
    title: 'Free Online Image Compressor - Compress JPG, PNG, WEBP | Luta Tech',
    description:
      'Reduce JPG, PNG, and WebP file sizes in your browser with live before/after comparison and batch ZIP downloads.',
    url: `${SITE_URL}/tools/image-compressor/`,
    type: 'website',
  },
};

export default function ImageCompressorLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'Which image formats are supported for compression?',
      answer:
        'You can compress JPEG/JPG, PNG, and WebP images individually or in batch.',
    },
    {
      question: 'Does compressing my images lower the image resolution?',
      answer:
        'By default, our image compressor optimizes compression ratios and removes redundant metadata without resizing dimensions, ensuring sharp details.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech Image Compressor"
        description="High-speed client-side image compression tool with custom quality levels, side-by-side comparison, and batch downloads."
        url="/tools/image-compressor/"
        applicationCategory="DesignApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Image Compressor', url: '/tools/image-compressor/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
