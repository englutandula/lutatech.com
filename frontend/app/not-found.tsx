import React from 'react';
import Link from 'next/link';
import { Home, ArrowRight, Search, FileQuestion, Sparkles } from 'lucide-react';

export const metadata = {
  title: '404 - Page Not Found | Luta Tech',
  description: 'The requested tool or page could not be found.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  const popularTools = [
    { name: 'Passport Photo Maker', href: '/tools/passport/' },
    { name: 'AI Background Remover', href: '/tools/remove-bg/' },
    { name: 'PDF Compressor', href: '/tools/pdf-compressor/' },
    { name: 'Image Compressor', href: '/tools/image-compressor/' },
    { name: 'Image Resizer', href: '/tools/image-resizer/' },
    { name: 'PDF Merger', href: '/tools/pdf-merger/' },
  ];

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-[rgb(var(--lt-primary)/0.1)] border border-[rgb(var(--lt-primary)/0.2)] flex items-center justify-center text-[rgb(var(--lt-primary))] shadow-lg">
            <FileQuestion className="w-12 h-12" />
          </div>
          <span className="absolute -top-2 -right-2 px-2.5 py-0.5 rounded-full bg-[rgb(var(--lt-primary))] text-white text-xs font-black shadow-sm">
            404
          </span>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold sm:text-4xl text-[rgb(var(--lt-text))]">
            Page or Tool Not Found
          </h1>
          <p className="text-sm sm:text-base lt-text-muted max-w-md mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Quick jump to popular tools */}
        <div className="p-6 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] text-left space-y-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[rgb(var(--lt-text))] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-[rgb(var(--lt-primary))]" />
            Popular Tools You Might Need
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {popularTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="flex items-center justify-between p-2.5 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] text-xs font-semibold text-[rgb(var(--lt-text))] hover:border-[rgb(var(--lt-primary)/0.4)] hover:text-[rgb(var(--lt-primary))] transition-all"
              >
                <span>{tool.name}</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-60" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/" className="lt-btn-primary w-full sm:w-auto">
            <Home className="h-4 w-4" /> Return to Homepage
          </Link>
          <Link href="/tools/" className="lt-btn-secondary w-full sm:w-auto">
            <Search className="h-4 w-4" /> Browse All Tools
          </Link>
        </div>
      </div>
    </div>
  );
}
