import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/lib/auth-context';

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
  keywords: [
    'passport photo maker',
    'free passport photo',
    'background remover',
    'image tools',
    'pdf tools',
    'online utilities',
    'free online tools',
    'ai tools',
  ],
  openGraph: {
    title: 'Luta Tech - Fast, Private, Modern Digital Tools Platform',
    description:
      'Luta Tech brings together high-performance digital tools for images, documents, utilities, and AI — private by design, running in your browser.',
    url: SITE_URL,
    siteName: 'Luta Tech',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Luta Tech - Modern Digital Tools Platform',
    description:
      'High-performance digital tools for images, documents, and utilities — private by design, running in your browser.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
  metadataBase: new URL(SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
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
