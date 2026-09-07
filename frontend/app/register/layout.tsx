import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Luta Tech',
  description: 'Create a free Luta Tech account to access your tools and dashboard.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
