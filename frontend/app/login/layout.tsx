import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Luta Tech',
  description: 'Sign in to your Luta Tech account to access your dashboard and tools.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
