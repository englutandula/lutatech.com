import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free Color Picker & Palette Studio - HEX, RGB, HSL, CMYK',
  description:
    'Interactive 2D visual color picker, 5-color harmonic palette studio, image color extractor, gradient generator, and WCAG contrast checker. 100% free and private in-browser.',
  keywords: [
    'color picker',
    'online color picker',
    'hex color picker',
    'rgb to hex',
    'hsl color picker',
    'palette generator',
    'extract colors from image',
    'color scheme designer',
    'wcag contrast checker',
    'tailwind color scale',
  ],
  alternates: {
    canonical: '/tools/color-picker/',
  },
  openGraph: {
    title: 'Free Color Picker & Palette Studio | Luta Tech',
    description:
      'Professional in-browser color picker with 2D saturation/value canvas, harmonic palettes, eyedropper, and color blindness vision testing.',
    url: `${SITE_URL}/tools/color-picker/`,
    type: 'website',
  },
};

export default function ColorPickerLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'Which color formats are supported in the Color Picker?',
      answer:
        'The Color Picker supports HEX, RGB, RGBA with opacity, HSL, CMYK, CSS custom property variables, and Tailwind CSS config objects with 1-click copy.',
    },
    {
      question: 'Can I pick a color from an image or photo?',
      answer:
        'Yes, you can use the "Extract from Photo" tab to upload any image and automatically extract its dominant color palette completely client-side in your browser.',
    },
    {
      question: 'Does the Color Picker test for accessibility and contrast?',
      answer:
        'Yes, it includes real-time WCAG 2.1 contrast ratio calculations against pure white and black backgrounds with AA and AAA pass/fail compliance ratings.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="LutaTech Color Picker & Palette Studio"
        description="Interactive in-browser 2D color picker, 5-color harmonic palette generator, image palette extractor, gradient maker, and WCAG contrast checker."
        url="/tools/color-picker/"
        applicationCategory="DesignApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Color Picker', url: '/tools/color-picker/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
