import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

const PdfToImageTool = dynamic(() => import('@/components/PdfToImageTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free PDF to WebP Converter Online - Smallest File Size with High Quality',
  description:
    'Convert PDF pages to lightweight, high-performance WebP images. Optimized for web publishing and fast loading. 100% private in-browser tool.',
  keywords: [
    'pdf to webp',
    'convert pdf to webp online',
    'pdf to webp converter free',
    'modern web image from pdf',
  ],
  alternates: {
    canonical: '/tools/pdf-to-webp/',
  },
  openGraph: {
    title: 'Free PDF to WebP Converter Online | Luta Tech',
    description:
      'Transform PDF pages into next-generation WebP images for optimal web performance.',
    url: `${SITE_URL}/tools/pdf-to-webp/`,
    type: 'website',
  },
};

import ToolContentSection from '@/components/seo/ToolContentSection';

export default function PdfToWebpPage() {
  const tool = getTool('pdf-to-webp')!;
  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech PDF to WebP Converter"
        description="Transform PDF pages into next-generation WebP images for optimal web performance."
        url="/tools/pdf-to-webp/"
        applicationCategory="ConverterApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'PDF to WebP', url: '/tools/pdf-to-webp/' },
        ]}
      />
      <ToolPageShell tool={tool}>
        <PdfToImageTool format="webp" />
        <ToolContentSection
          toolName="PDF to WebP Converter"
          category="Converter"
          tagline="Transform PDF document pages into modern, ultra-lightweight WebP images optimized for fast website performance."
          steps={[
            {
              title: 'Upload Your PDF Document',
              description:
                'Select or drop any PDF document into the in-browser converter workspace.',
            },
            {
              title: 'Preview Generated WebP Pages',
              description:
                'Inspect instant WebP previews encoded directly in your browser with high-efficiency compression.',
            },
            {
              title: 'Download Single Images or ZIP',
              description:
                'Download individual pages or save every page bundled in an organized ZIP file instantly.',
            },
          ]}
          features={[
            {
              title: 'Next-Gen Web Performance',
              description:
                'WebP reduces file sizes by 30% or more compared to JPEG while preserving clean text and vibrant graphics.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Your documents are rendered and compressed client-side. Zero pages or files are ever sent over the network.',
            },
            {
              title: 'Perfect for Web Publishing',
              description:
                'Optimized for fast-loading websites, CMS platforms, blog embeds, and digital presentations.',
            },
            {
              title: 'Instant Bulk ZIP Packaging',
              description:
                'Export all converted pages with one click into a neat, compressed ZIP folder ready to unzip.',
            },
          ]}
          specs={[
            { label: 'Output Format', value: 'Google WebP (.webp)' },
            { label: 'Compression Savings', value: '30% - 50% vs JPEG' },
            { label: 'Rendering Engine', value: 'PDF.js High-DPI' },
            { label: 'Data Security', value: '100% In-Browser Execution' },
          ]}
          faqs={[
            {
              question: 'Why should I convert PDF pages to WebP instead of JPG or PNG?',
              answer:
                'WebP is a modern image format developed by Google that delivers superior compression. It achieves significantly smaller file sizes than JPEG while offering crisp detail, making it the gold standard for web publishing and SEO performance.',
            },
            {
              question: 'Do all modern browsers support WebP?',
              answer:
                'Yes. WebP is supported across Chrome, Safari, Edge, Firefox, iOS Safari, and Android browsers, covering over 97% of worldwide web traffic.',
            },
            {
              question: 'Are my private documents sent to your servers?',
              answer:
                'No. Conversion takes place directly within your local browser session. Your documents never leave your computer.',
            },
            {
              question: 'Can I download all converted pages in one batch?',
              answer:
                'Yes. Click the Download All (ZIP) button to bundle every page image into an organized archive for instant download.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
