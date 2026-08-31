import React from 'react';

export default function ToolLoading() {
  return (
    <div className="lt-container py-8 sm:py-10 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-12 rounded-md bg-[rgb(var(--lt-surface-2))]" />
        <div className="h-3 w-3 rounded-md bg-[rgb(var(--lt-surface-2))]" />
        <div className="h-3 w-12 rounded-md bg-[rgb(var(--lt-surface-2))]" />
        <div className="h-3 w-3 rounded-md bg-[rgb(var(--lt-surface-2))]" />
        <div className="h-3 w-28 rounded-md bg-[rgb(var(--lt-surface-2))]" />
      </div>

      {/* Tool Header Shell Skeleton */}
      <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-[rgb(var(--lt-surface-2))]" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded-lg bg-[rgb(var(--lt-surface-2))]" />
            <div className="h-4 w-72 rounded-lg bg-[rgb(var(--lt-surface-2))]" />
          </div>
        </div>
      </div>

      {/* Main Tool Content Skeleton */}
      <div className="mt-8 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-12 flex flex-col items-center justify-center space-y-4 min-h-[360px]">
        <div className="h-12 w-12 rounded-full border-2 border-[rgb(var(--lt-primary)/0.2)] border-t-[rgb(var(--lt-primary))] lt-spin" />
        <div className="h-4 w-36 rounded-md bg-[rgb(var(--lt-surface-2))]" />
      </div>
    </div>
  );
}
