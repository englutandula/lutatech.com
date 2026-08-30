import React from 'react';

export function Logo({ className = 'h-[1.05em] w-auto' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/logo/logo-light.png"
        alt="Luta Tech Logo"
        className="w-full h-full object-contain align-middle block dark:hidden"
      />
      <img
        src="/logo/logo-dark.png"
        alt="Luta Tech Logo"
        className="w-full h-full object-contain align-middle hidden dark:block"
      />
    </div>
  );
}

export default Logo;
