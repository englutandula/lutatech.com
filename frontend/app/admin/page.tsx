'use client';

import { useEffect } from 'react';

export default function AdminRedirectPage() {
  useEffect(() => {
    window.location.replace('/api/admin/login');
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-500 border-r-transparent"></div>
        <p className="text-sm text-slate-400">Redirecting to Luta Tech Admin Panel...</p>
      </div>
    </div>
  );
}
