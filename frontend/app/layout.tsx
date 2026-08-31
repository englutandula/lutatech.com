import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/lib/auth-context';
import { WebSiteJsonLd } from '@/components/seo/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lutatech.com';

export const metadata: Metadata = {
  title: {
    default: 'Luta Tech - Fast, Private, Modern Digital Tools Platform',
    template: '%s | Luta Tech',
  },
  description:
    'Luta Tech brings together high-performance digital tools for images, documents, utilities, and AI — private by design, running in your browser.',
  applicationName: 'Luta Tech',
  authors: [{ name: 'Luta Tech Team', url: SITE_URL }],
  generator: 'Next.js',
  keywords: [
    'passport photo maker',
    'free passport photo online',
    'background remover',
    'ai background remover',
    'compress pdf online',
    'image compressor',
    'image resizer',
    'pdf merge online',
    'pdf split',
    'online utilities',
    'free online tools',
    'private image tools',
    'luta tech',
  ],
  referrer: 'origin-when-cross-origin',
  creator: 'Luta Tech',
  publisher: 'Luta Tech',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: 'nlS3X7Gv7B4seJoBBt-7zIbRJV',
  },
  openGraph: {
    title: 'Luta Tech - Fast, Private, Modern Digital Tools Platform',
    description:
      'High-performance digital tools for images, documents, utilities, and AI — private by design, running in your browser with zero setup.',
    url: SITE_URL,
    siteName: 'Luta Tech',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Luta Tech - Digital Tools & AI Studio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luta Tech - Modern Digital Tools Platform',
    description:
      'High-performance digital tools for images, documents, and utilities — private by design, running in your browser.',
    images: ['/og-image.png'],
    creator: '@lutatech',
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
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <WebSiteJsonLd />
      </head>
      <body className="min-h-screen bg-[rgb(var(--lt-bg))] text-[rgb(var(--lt-text))] font-sans antialiased transition-colors">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}

