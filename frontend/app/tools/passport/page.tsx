import dynamic from 'next/dynamic';
import type { Metadata } from 'next';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { SoftwareAppJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import ToolContentSection from '@/components/seo/ToolContentSection';

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
      <ToolPageShell tool={tool}>
        <PhotoTool />
        <ToolContentSection
          toolName="Passport & Visa Photo Maker"
          category="Image"
          tagline="Generate 100% compliant official biometric passport, visa, and ID photos for 15+ countries with automatic 300 DPI print-ready layouts."
          steps={[
            {
              title: 'Upload or Capture Your Portrait',
              description:
                'Upload an existing casual headshot or snap one using your smartphone or webcam. Ensure natural lighting and look directly into the camera with a neutral expression.',
            },
            {
              title: 'Select Target Country Standard',
              description:
                'Choose from official government standards including US (2x2"), UK/EU/Schengen (35x45mm), Canada, India, Tanzania, Kenya, Australia, or enter custom mm/inch dimensions.',
            },
            {
              title: 'Download & Export 300 DPI Print Sheet',
              description:
                'Fine-tune eye position and chin margins with biometric guide overlays, select compliant solid white or light blue backdrops, and download single cuts or 4x6" printable sheets.',
            },
          ]}
          features={[
            {
              title: 'Official Biometric Standards',
              description:
                'Guarantees crown-to-chin height and eye-line ratios that meet strict ICAO, US State Department, and international embassy guidelines.',
            },
            {
              title: 'Solid Backdrop Replacement',
              description:
                'Replaces cluttered home walls with pure studio white, off-white, or consulate-specified light blue backgrounds in seconds.',
            },
            {
              title: 'Multi-Photo 4x6" Print Layouts',
              description:
                'Automatically tiles multiple photos onto standard 4x6", 5x7", or A4 layouts ready to print at CVS, Walgreens, Boots, or home printers for pennies.',
            },
            {
              title: '100% In-Browser Privacy',
              description:
                'Biometric face images are processed locally on your device. Zero facial scans or photographs are ever uploaded or saved on external servers.',
            },
          ]}
          specs={[
            { label: 'Print Resolution', value: '300 DPI High-Res' },
            { label: 'Supported Standards', value: '15+ Countries + Custom' },
            { label: 'Sheet Formats', value: 'Single, 4x6", 5x7", A4' },
            { label: 'Data Security', value: '100% In-Browser' },
          ]}
          faqs={[
            {
              question: 'Are photos created on Luta Tech accepted for official passport applications?',
              answer:
                'Yes. Luta Tech precisely formats photo dimensions, eye height, and head margins to match official government requirements (e.g., 2x2 inches for the US, 35x45 mm for the UK, Schengen, Tanzania, Kenya, and Canada) rendered at high-resolution 300 DPI.',
            },
            {
              question: 'How do I print my passport photos on 4x6 inch photo paper?',
              answer:
                'Select the 4x6" Print Sheet option after cropping. The tool generates a standard 4x6 inch layout containing multiple passport photos. Save the image and order a standard 4x6 photo print at any local pharmacy, photo kiosk, or home photo printer for pennies instead of paying $15–$20 for in-store passport photography.',
            },
            {
              question: 'What are the rules for glasses, jewelry, and headwear?',
              answer:
                'Most passport agencies (including the US State Department) require prescription eyeglasses and sunglasses to be removed to eliminate flash glare. Everyday headwear is not permitted, but religious or medical head coverings are accepted provided the full oval of the face from chin to forehead remains visible.',
            },
            {
              question: 'What background color should I choose?',
              answer:
                'The US, UK, and European Schengen countries mandate a plain white or light off-white background. Certain countries or visa types require light blue or light gray. Our tool lets you select the exact background color demanded by your destination.',
            },
            {
              question: 'Is my photo or biometric facial data stored on a server?',
              answer:
                'No. We adhere to a strict client-side privacy architecture. Your photos are cropped and processed directly in your browser memory. We never store, transmit, or monetize your images.',
            },
          ]}
        />
      </ToolPageShell>
    </>
  );
}
