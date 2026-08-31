# 🚀 Modern Web SEO & Production Deployment Blueprint

A comprehensive, reusable SEO and pre-deployment blueprint for **Next.js (App Router)** and modern web applications. You can copy or download this file to reuse for any future website.

---

## 📋 1. Core SEO Architecture Overview

```
project-root/
├── app/
│   ├── layout.tsx             # Global metadata, metadataBase, canonical URL, OG tags, WebSite Schema
│   ├── sitemap.ts             # Dynamic XML Sitemap generator (Google, Bing)
│   ├── robots.ts              # Search engine crawler permissions & sitemap link
│   ├── manifest.ts            # PWA manifest (Installable, theme colors, icons)
│   ├── not-found.tsx          # Branded 404 page with navigation (robots: noindex)
│   └── tools/
│       └── [tool-slug]/
│           ├── layout.tsx     # Tool-specific metadata, OpenGraph, Breadcrumb & SoftwareApp JSON-LD
│           └── page.tsx       # Semantic HTML layout (single h1, h2 hierarchy, schema tags)
├── public/
│   ├── og-image.png           # 1200x630px high-resolution social preview image
│   ├── favicon.ico            # Multi-size ICO
│   ├── icon-192.png           # PWA icon 192x192
│   ├── icon-512.png           # PWA icon 512x512
│   └── apple-touch-icon.png   # iOS home screen icon (180x180)
└── src/components/seo/
    └── JsonLd.tsx             # Reusable JSON-LD schema components
```

---

## 🌐 2. Root Layout Metadata Template (`app/layout.tsx`)

```tsx
import type { Metadata } from 'next';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Brand Name - Primary Keyword Phrase & Value Proposition',
    template: '%s | Brand Name',
  },
  description: 'Concise 150-160 character description rich in primary keywords.',
  applicationName: 'Brand Name',
  authors: [{ name: 'Your Team', url: SITE_URL }],
  keywords: ['keyword 1', 'keyword 2', 'keyword 3', 'keyword 4'],
  referrer: 'origin-when-cross-origin',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Brand Name - Primary Keyword Phrase',
    description: 'Crisp description for social sharing cards on WhatsApp, Facebook, LinkedIn, Twitter.',
    url: SITE_URL,
    siteName: 'Brand Name',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Brand Name Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Brand Name',
    description: 'Twitter preview description.',
    images: ['/og-image.png'],
    creator: '@yourhandle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <WebSiteJsonLd />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🗺️ 3. Dynamic Sitemap Generator (`app/sitemap.ts`)

```tsx
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Static routes
  const staticRoutes = ['', '/about/', '/pricing/', '/tools/'].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Dynamic dynamic items / tools / articles
  const dynamicItems = [
    { slug: 'tool-one', priority: 0.9 },
    { slug: 'tool-two', priority: 0.9 },
  ].map((item) => ({
    url: `${SITE_URL}/tools/${item.slug}/`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: item.priority,
  }));

  return [...staticRoutes, ...dynamicItems];
}
```

---

## 🤖 4. Robots Directives (`app/robots.ts`)

```tsx
import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/auth/', '/admin/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

---

## 📱 5. Web App Manifest (`app/manifest.ts`)

```tsx
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Your App Full Name',
    short_name: 'App Name',
    description: 'Installable Progressive Web App description.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#ef4444',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

---

## 📊 6. JSON-LD Structured Data Components (`src/components/seo/JsonLd.tsx`)

### Schema 1: WebSite with SearchAction

```tsx
export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Your Brand',
    url: 'https://yourdomain.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://yourdomain.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
```

### Schema 2: SoftwareApplication / WebApplication (For Online Tools)

```tsx
export function SoftwareAppJsonLd({ name, description, url }: { name: string; description: string; url: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    description,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'All',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
```

### Schema 3: BreadcrumbList (For Search Breadcrumb Trails)

```tsx
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}
```

---

## ⚡ 7. Core Web Vitals & Performance Rules

| Metric                                    | Target      | How to achieve in Next.js                                                                                     |
| :---------------------------------------- | :---------- | :------------------------------------------------------------------------------------------------------------ |
| **LCP** (Largest Contentful Paint)  | `< 2.5s`  | Use next/font `display: swap`, preload hero image/OG, optimize image weights.                               |
| **INP** (Interaction to Next Paint) | `< 200ms` | Split heavy libraries (`pdf-lib`, `tesseract`, `cv2`) with dynamic `import()`, keep main thread free. |
| **CLS** (Cumulative Layout Shift)   | `< 0.1`   | Set explicit `width` & `height` on images and canvas containers, reserve slot sizes.                      |

---

## 🚦 8. Pre-Deployment Step-by-Step Checklist

- [ ] **Domain & Base URL**: Set `NEXT_PUBLIC_SITE_URL="https://yourdomain.com"` in `.env.production`.
- [ ] **OpenGraph Image**: Verify `1200x630` px `og-image.png` exists in `/public`.
- [ ] **Favicons & App Icons**: Verify `favicon.ico`, `apple-touch-icon.png`, and `icon-192/512.png`.
- [ ] **Static Build**: Run `npm run build` with zero errors.
- [ ] **Sitemap Verification**: Open `/sitemap.xml` after build to confirm all routes have priority & HTTPS URLs.
- [ ] **Robots Verification**: Open `/robots.txt` and confirm `Sitemap:` points to production HTTPS domain.
- [ ] **404 Page**: Test broken URL (`/random-non-existent-page`) to ensure custom branded 404 renders.
- [ ] **Google Search Console**:
  1. Add domain property on [Google Search Console](https://search.google.com/search-console).
  2. Submit sitemap URL: `https://yourdomain.com/sitemap.xml`.
  3. Request initial indexing for homepage.
- [ ] **Bing Webmaster Tools**: Import directly from Google Search Console or submit `sitemap.xml`.
