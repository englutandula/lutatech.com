'use client'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'h-4 w-4 border-2', md: 'h-8 w-8 border-3', lg: 'h-10 w-10 border-3' }

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-[rgb(var(--lt-primary)/0.25)] border-t-[rgb(var(--lt-primary))] ${sizes[size]} ${className}`}
    />
  )
}
