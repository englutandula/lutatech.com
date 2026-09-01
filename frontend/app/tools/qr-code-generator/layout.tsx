import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free QR Code Generator - Custom Links, WiFi, vCard & SVG',
  description:
    'Generate high-resolution custom QR codes for websites, WiFi networks, business contact vCards, emails, and phone numbers. Export as PNG or vector SVG without watermarks.',
  keywords: [
    'qr code generator',
    'free qr code generator',
    'create qr code online',
    'wifi qr code',
    'vcard qr code generator',
    'svg qr code',
    'high res qr code',
    'custom qr code generator',
  ],
  alternates: {
    canonical: '/tools/qr-code-generator/',
  },
  openGraph: {
    title: 'Free QR Code Generator | Luta Tech',
    description:
      'Generate high-resolution custom QR codes for URLs, WiFi, contact cards, and text. Download high-res PNG or vector SVG files instantly.',
    url: `${SITE_URL}/tools/qr-code-generator/`,
    type: 'website',
  },
};

export default function QrCodeGeneratorLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'Do the generated QR codes ever expire?',
      answer:
        'No. All QR codes generated are static, standard QR codes that store the data directly in the pattern. They will never expire and require no external redirection.',
    },
    {
      question: 'Can I create a WiFi QR code for guests?',
      answer:
        'Yes. Choose the "WiFi" type, enter your network name (SSID) and password. When guests scan it with their camera, their device will connect automatically.',
    },
    {
      question: 'What formats can I download the QR code in?',
      answer:
        'You can download high-resolution raster PNG images (up to 2048x2048 for print) and crisp scalable vector SVG graphics.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="LutaTech QR Code Generator"
        description="Generate professional, custom QR codes for URLs, WiFi credentials, vCards, emails, and SMS with PNG and vector SVG export."
        url="/tools/qr-code-generator/"
        applicationCategory="UtilityApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'QR Code Generator', url: '/tools/qr-code-generator/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
