import React from 'react';

export function Logo({ className = 'h-[1.05em] w-auto aspect-[862/712]' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/icon-1024-transparent.png"
        alt="Luta Tech Logo"
        className="w-full h-full object-contain align-middle block dark:hidden"
      />
      <img
        src="/icon-white-1024.png"
        alt="Luta Tech Logo"
        className="w-full h-full object-contain align-middle hidden dark:block"
      />
    </div>
  );
}

export default Logo;
