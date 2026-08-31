import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF Compressor Online - Reduce PDF File Size Privately',
  description:
    'Compress PDF documents online in seconds. Extreme, balanced, and custom quality compression presets. 100% private in-browser processing without file size limits.',
  keywords: [
    'compress pdf online',
    'reduce pdf file size',
    'free pdf compressor',
    'shrink pdf without losing quality',
    'private pdf compressor in-browser',
    'compress pdf 100kb 200kb 500kb',
  ],
  alternates: {
    canonical: '/tools/pdf-compressor/',
  },
  openGraph: {
    title: 'Free PDF Compressor Online - Reduce PDF Size Privately | Luta Tech',
    description:
      'Compress PDF files directly in your browser. Choose presets, preserve text clarity, and download instantly.',
    url: `${SITE_URL}/tools/pdf-compressor/`,
    type: 'website',
  },
};

export default function PdfCompressorLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'How much can I reduce my PDF file size?',
      answer:
        'Depending on the document and the selected preset (Extreme, Recommended, or Low), you can typically reduce PDF sizes by 40% to 90% while preserving text and image legibility.',
    },
    {
      question: 'Are my PDF documents uploaded to a remote server?',
      answer:
        'No, all PDF compression runs locally inside your browser using client-side WebAssembly and PDF rendering engines. No documents leave your device.',
    },
    {
      question: 'Is there a page count or file size limit?',
      answer:
        'There are no artificial limits. You can compress multi-page documents of any size for free.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF Compressor"
        description="Fast and secure client-side PDF compressor that reduces file sizes while maintaining document formatting and sharpness."
        url="/tools/pdf-compressor/"
        applicationCategory="UtilitiesApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF Compressor', url: '/tools/pdf-compressor/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
