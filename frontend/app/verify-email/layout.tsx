import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verify Email | Luta Tech',
  description: 'Verify your Luta Tech account email address.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
