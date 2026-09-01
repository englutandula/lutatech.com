import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const PhotoTool = dynamic(() => import('@/components/PhotoTool'));

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free AI Passport & Visa Photo Maker Online - 15+ Countries',
  description:
    'Create 100% compliant official passport, visa, and ID photos in seconds. Automatic face positioning, background removal, custom mm/inch dimensions, and 300 DPI 4x6 print layouts.',
  keywords: [
    'passport photo maker',
    'free passport photo online',
    'visa photo generator',
    'us passport photo 2x2',
    'uk passport photo 35x45',
    'tanzania passport photo',
    'kenya passport photo',
    'printable passport photo 4x6',
    'ai passport background remover',
  ],
  alternates: {
    canonical: '/tools/passport/',
  },
  openGraph: {
    title: 'Free AI Passport & Visa Photo Maker Online | Luta Tech',
    description:
      'Create compliant official passport and visa photos online. Auto-crop for US, UK, Schengen, Tanzania, Kenya & 15+ countries.',
    url: `${SITE_URL}/tools/passport/`,
    type: 'website',
  },
};

export default function PassportPhotoMakerPage() {
  const tool = getTool('passport')!;

  const faqItems = [
    {
      question: 'Are photos generated with Luta Tech accepted for official passport applications?',
      answer:
        'Yes. Luta Tech crops, positions, and aligns photos according to official government dimensions (e.g. 2x2 inches for US, 35x45 mm for EU/UK/Tanzania/Kenya) at crisp 300 DPI resolution.',
    },
    {
      question: 'Is my photo uploaded or saved on a server?',
      answer:
        'No. Photos are processed locally directly in your browser. No images are saved or stored on our servers, ensuring 100% data privacy.',
    },
    {
      question: 'Can I print multiple passport photos on a 4x6 inch paper?',
      answer:
        'Yes. Luta Tech generates multi-photo print sheets (4x6", 5x7", A4, US Letter) ready for home printing or instant photo lab kiosks at standard 300 DPI.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="Luta Tech AI Passport Photo Maker"
        description="Create compliant passport and visa photos for 15+ countries with AI auto-cropping, background color change, and multi-photo 4x6 print sheets."
        url="/tools/passport/"
        applicationCategory="DesignApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Passport Photo Maker', url: '/tools/passport/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      <ToolPageShell tool={tool}>
        <PhotoTool />
      </ToolPageShell>
    </>
  );
}
