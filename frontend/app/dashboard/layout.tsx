import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Luta Tech',
  description: 'Manage your tools, history, and account settings.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
