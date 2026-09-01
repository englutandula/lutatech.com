import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free Base64 Converter - Text & Image Encode/Decode',
  description:
    'Convert text and files to Base64 and decode Base64 strings back to text or files. Full UTF-8 Unicode emoji safety, URL-safe Base64 mode, and Data URL image preview.',
  keywords: [
    'base64 converter',
    'base64 encoder',
    'base64 decoder',
    'text to base64',
    'image to base64',
    'base64 to image',
    'url safe base64',
    'data url generator',
    'base64 string decoder',
  ],
  alternates: {
    canonical: '/tools/base64-converter/',
  },
  openGraph: {
    title: 'Free Base64 Converter & Decoder | Luta Tech',
    description:
      'Fast, client-side Base64 encoder and decoder with UTF-8 support, URL-safe mode, and drag-and-drop file/image Data URL generation.',
    url: `${SITE_URL}/tools/base64-converter/`,
    type: 'website',
  },
};

export default function Base64ConverterLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'Does this Base64 tool support special characters and emojis?',
      answer:
        'Yes. It uses standard TextEncoder and TextDecoder to handle all UTF-8 Unicode characters, accents, and emojis safely without character corruption.',
    },
    {
      question: 'What is URL-Safe Base64?',
      answer:
        'URL-Safe Base64 (RFC 4648 §5) replaces "+" with "-" and "/" with "_", allowing Base64 strings to be placed directly into URLs and filenames without percent-encoding.',
    },
    {
      question: 'Can I convert an image or PDF to a Base64 Data URL?',
      answer:
        'Yes. Switch to the "File / Image to Base64" tab and drag any file into the uploader to generate ready-to-use Data URLs for HTML and CSS.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="LutaTech Base64 Converter"
        description="Convert text and binary files to Base64 strings and decode Base64 back into text or downloadable files with UTF-8 and URL-safe support."
        url="/tools/base64-converter/"
        applicationCategory="DeveloperApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Base64 Converter', url: '/tools/base64-converter/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
