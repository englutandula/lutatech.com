import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activate Account | Luta Tech',
  description: 'Activate your Luta Tech account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ActivateAccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
