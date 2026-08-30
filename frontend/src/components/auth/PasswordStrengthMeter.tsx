'use client';

import React from 'react';

interface PasswordStrengthMeterProps {
  password?: string;
}

export function calculatePasswordStrength(password: string): {
  score: number;
  label: string;
  colorClass: string;
  barColor: string;
} {
  if (!password) {
    return { score: 0, label: '', colorClass: '', barColor: 'bg-gray-200 dark:bg-slate-700' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || /[A-Z]/.test(password)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', colorClass: 'text-red-500', barColor: 'bg-red-500' };
    case 2:
      return { score: 2, label: 'Fair', colorClass: 'text-amber-500', barColor: 'bg-amber-500' };
    case 3:
      return { score: 3, label: 'Good', colorClass: 'text-blue-500', barColor: 'bg-blue-500' };
    case 4:
      return { score: 4, label: 'Strong', colorClass: 'text-emerald-500', barColor: 'bg-emerald-500' };
    default:
      return { score: 0, label: 'Too short', colorClass: 'text-red-500', barColor: 'bg-red-500' };
  }
}

export default function PasswordStrengthMeter({ password = '' }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label, colorClass, barColor } = calculatePasswordStrength(password);

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[rgb(var(--lt-text-muted))]">Password strength</span>
        <span className={`font-semibold ${colorClass}`}>{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`rounded-full transition-all duration-300 ${
              score >= step ? barColor : 'bg-gray-200 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
