'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function ActivateAccountRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    router.replace(`/verify-email${params ? `?${params}` : ''}`);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--lt-primary))]" />
    </div>
  );
}

export default function ActivateAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--lt-primary))]" />
        </div>
      }
    >
      <ActivateAccountRedirect />
    </Suspense>
  );
}
