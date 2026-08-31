import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free AI Background Remover Online - Instant Transparent PNG Cutouts',
  description:
    'Remove background from image automatically in 1 click with AI. 100% free, high precision cutout, transparent PNG or custom color backgrounds. Processed privately in your browser.',
  keywords: [
    'background remover',
    'remove bg online free',
    'ai background removal',
    'transparent png creator',
    'white background photo generator',
    'remove image background no watermark',
    'private background remover',
  ],
  alternates: {
    canonical: '/tools/remove-bg/',
  },
  openGraph: {
    title: 'Free AI Background Remover Online | Luta Tech',
    description:
      'Remove image backgrounds in 1 click with AI. Transparent PNG export and custom backdrops. 100% free and private.',
    url: `${SITE_URL}/tools/remove-bg/`,
    type: 'website',
  },
};

export default function RemoveBgLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'Is this AI Background Remover free to use?',
      answer:
        'Yes, Luta Tech AI Background Remover is 100% free with unlimited image processing, no sign-up required, and no watermarks.',
    },
    {
      question: 'What image formats are supported?',
      answer:
        'You can upload JPG, PNG, WEBP, and HEIC image files. The result can be exported as a transparent PNG or with solid color backgrounds.',
    },
    {
      question: 'Are my images secure and private?',
      answer:
        'Yes, all processing is private and performed directly for you without permanently storing your personal files on any servers.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech AI Background Remover"
        description="High-precision AI background removal tool for instant transparent PNG cutouts and custom backdrop colors."
        url="/tools/remove-bg/"
        applicationCategory="DesignApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Background Remover', url: '/tools/remove-bg/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
