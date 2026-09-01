import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free Online JSON Formatter, Validator & Minifier',
  description:
    'Format, validate, prettify, sort keys, and minify JSON data with instant syntax error detection and line numbers. 100% client-side execution.',
  keywords: [
    'json formatter',
    'json validator',
    'json prettifier',
    'json minify',
    'format json online',
    'validate json online',
    'json syntax error checker',
    'sort json keys',
    'json beautifier',
  ],
  alternates: {
    canonical: '/tools/json-formatter/',
  },
  openGraph: {
    title: 'Free Online JSON Formatter & Validator | Luta Tech',
    description:
      'Beautify messy JSON, sort object keys, minify payloads, escape/unescape strings, and pinpoint syntax errors with line-number precision.',
    url: `${SITE_URL}/tools/json-formatter/`,
    type: 'website',
  },
};

export default function JsonFormatterLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'Is my JSON payload safe and private?',
      answer:
        'Yes. All parsing, validation, formatting, and minification happen entirely inside your web browser using client-side JavaScript. No data is ever sent to our servers.',
    },
    {
      question: 'Can this tool sort JSON keys alphabetically?',
      answer:
        'Yes. The "Sort Keys" feature recursively traverses all nested objects and reorders their keys in alphabetical order, making diffing and review effortless.',
    },
    {
      question: 'Can I format escaped JSON strings?',
      answer:
        'Yes. Use the "Unescape" button to parse stringified or escaped JSON payloads back into structured, readable JSON format.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="LutaTech JSON Formatter & Validator"
        description="A powerful in-browser JSON formatter, validator, and minifier. Beautify messy JSON, sort object keys, and pinpoint syntax errors instantly."
        url="/tools/json-formatter/"
        applicationCategory="DeveloperApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'JSON Formatter', url: '/tools/json-formatter/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
