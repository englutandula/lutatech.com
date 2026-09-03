import React from 'react';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

interface WebSiteJsonLdProps {
  siteUrl?: string;
  name?: string;
  description?: string;
}

export function WebSiteJsonLd({
  siteUrl = SITE_URL,
  name = 'Luta Tech',
  description = 'High-performance digital tools for images, PDFs, converters, and AI — fast, private, running in your browser.',
}: WebSiteJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url: siteUrl,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/tools/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Luta Tech',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon-512.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface SoftwareAppJsonLdProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  screenshot?: string;
}

export function SoftwareAppJsonLd({
  name,
  description,
  url,
  applicationCategory = 'MultimediaApplication',
  operatingSystem = 'All',
  screenshot,
}: SoftwareAppJsonLdProps) {
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url: fullUrl,
    applicationCategory,
    operatingSystem,
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    creator: {
      '@type': 'Organization',
      name: 'Luta Tech',
      url: SITE_URL,
    },
    ...(screenshot ? { screenshot: screenshot.startsWith('http') ? screenshot : `${SITE_URL}${screenshot}` } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url.startsWith('/') ? '' : '/'}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SiteNavigationJsonLd({ siteUrl = SITE_URL }: { siteUrl?: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'SiteNavigationElement',
        position: 1,
        name: 'Tools Directory',
        description: 'Explore free, browser-based tools for images, PDFs, converters, and developers.',
        url: `${siteUrl}/tools/`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 2,
        name: 'Passport Photo Maker',
        description: 'Create compliant official passport and visa photos online in seconds.',
        url: `${siteUrl}/tools/passport/`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 3,
        name: 'Background Remover',
        description: 'Remove photo backgrounds automatically with AI in one click.',
        url: `${siteUrl}/tools/remove-bg/`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 4,
        name: 'PDF Compressor',
        description: 'Compress PDF documents to smaller sizes privately in your browser.',
        url: `${siteUrl}/tools/pdf-compressor/`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 5,
        name: 'Image Compressor',
        description: 'Reduce JPG, PNG, and WebP image sizes without losing visible quality.',
        url: `${siteUrl}/tools/image-compressor/`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 6,
        name: 'Tool Categories',
        description: 'Browse tools organized by Image, PDF, Utility, and Developer categories.',
        url: `${siteUrl}/categories/`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 7,
        name: 'Pricing & Plans',
        description: 'Transparent pricing with free access to digital tools.',
        url: `${siteUrl}/pricing/`,
      },
      {
        '@type': 'SiteNavigationElement',
        position: 8,
        name: 'About Us',
        description: 'Learn about Luta Tech mission, privacy-first tools, and technology.',
        url: `${siteUrl}/about/`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

