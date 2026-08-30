'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'
import Spinner from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

const variants = {
  primary:
    'bg-[rgb(var(--lt-primary))] hover:opacity-95 active:scale-[0.99] text-white font-bold shadow-md shadow-[rgb(var(--lt-primary)/0.25)] disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer',
  secondary:
    'border lt-border-color bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] font-semibold disabled:opacity-40 cursor-pointer',
  outline:
    'border border-[rgb(var(--lt-primary))] text-[rgb(var(--lt-primary))] hover:bg-[rgb(var(--lt-primary)/0.08)] font-semibold disabled:opacity-40 cursor-pointer',
  ghost:
    'hover:bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] font-medium cursor-pointer',
}

const sizes = {
  sm: 'px-3.5 py-2 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl font-bold',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--lt-primary)/0.3)] disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
