import type { Metadata } from 'next';
import { SoftwareAppJsonLd, BreadcrumbJsonLd, FaqJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: 'Free Online Word Counter - Words, Characters & Reading Time',
  description:
    'Count words, characters, sentences, paragraphs, and reading & speaking time in real time. Analyze keyword density and transform text cases with zero lag.',
  keywords: [
    'word counter',
    'free word counter',
    'character counter',
    'word count online',
    'reading time calculator',
    'text analyzer',
    'keyword density checker',
    'title case converter',
    'flesch reading score',
  ],
  alternates: {
    canonical: '/tools/word-counter/',
  },
  openGraph: {
    title: 'Free Online Word Counter | Luta Tech',
    description:
      'Real-time writing assistant and text statistics analyzer. Track word count, character density, estimated reading time, and keyword frequency.',
    url: `${SITE_URL}/tools/word-counter/`,
    type: 'website',
  },
};

export default function WordCounterLayout({ children }: { children: React.ReactNode }) {
  const faqItems = [
    {
      question: 'How is the estimated reading time calculated?',
      answer:
        'Reading time is based on the industry standard average reading speed of 200 words per minute (WPM), while speaking time is calculated at 130 WPM.',
    },
    {
      question: 'Is my pasted text saved on your servers?',
      answer:
        'No. The word counter operates 100% locally in your browser. None of your text is ever uploaded or transmitted across the network.',
    },
    {
      question: 'What is keyword density?',
      answer:
        'Keyword density shows the percentage of times a word appears compared to the total number of words in your text, helping optimize content for SEO without keyword stuffing.',
    },
  ];

  return (
    <>
      <SoftwareAppJsonLd
        name="LutaTech Word Counter"
        description="A real-time writing assistant and text statistics analyzer tracking word count, characters, estimated reading time, and keyword frequency."
        url="/tools/word-counter/"
        applicationCategory="ProductivityApplication"
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: '/' },
          { name: 'Tools', url: '/tools/' },
          { name: 'Word Counter', url: '/tools/word-counter/' },
        ]}
      />
      <FaqJsonLd items={faqItems} />
      {children}
    </>
  );
}
