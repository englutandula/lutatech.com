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
  primary: 'bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white shadow-sm disabled:bg-gray-200 dark:disabled:bg-slate-700/60 disabled:text-gray-400 dark:disabled:text-slate-400 disabled:border disabled:border-transparent dark:disabled:border-slate-600/40 disabled:shadow-none',
  secondary: 'bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-slate-100 disabled:bg-gray-50 dark:disabled:bg-slate-800 disabled:text-gray-400 dark:disabled:text-slate-500',
  outline: 'border border-gray-200 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-gray-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-300 disabled:text-gray-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent',
  ghost: 'hover:bg-gray-100 dark:hover:bg-slate-700/70 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
