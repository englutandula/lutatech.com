import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free Image Resizer Online - Resize Photos by Pixels or Percentage',
  description:
    'Resize images online to exact pixel width/height or percentage scale. Maintain aspect ratios, select social media presets (Instagram, YouTube, Twitter), and convert formats.',
  keywords: [
    'image resizer',
    'resize photo online free',
    'change image dimensions',
    'resize image for instagram',
    'resize picture in pixels',
    'batch image resizer',
  ],
  alternates: {
    canonical: '/tools/image-resizer/',
  },
  openGraph: {
    title: 'Free Image Resizer Online - Resize Photos by Pixels or Percentage | Luta Tech',
    description:
      'Resize images to exact dimensions or percentage scale with aspect ratio lock and social media presets. Fast, free & private.',
    url: `${SITE_URL}/tools/image-resizer/`,
    type: 'website',
  },
};

export default function ImageResizerLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'How do I maintain my image aspect ratio when resizing?',
      answer:
        'Keep the "Lock Aspect Ratio" toggle enabled. When you type a new width or height, the other dimension calculates automatically to prevent distortion.',
    },
    {
      question: 'Can I resize photos for social media?',
      answer:
        'Yes, built-in presets allow one-click resizing for Instagram Posts, Stories, YouTube Covers, and Twitter banners.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech Image Resizer"
        description="Browser-based photo resizer with custom dimensions, aspect ratio lock, format conversion, and social media presets."
        url="/tools/image-resizer/"
        applicationCategory="DesignApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Image Resizer', url: '/tools/image-resizer/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
