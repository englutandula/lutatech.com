'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  step?: number
}

export default function Card({ children, className = '', title, step }: CardProps) {
  return (
    <div className={`rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] shadow-xs ${className}`}>
      {title && (
        <div className="border-b lt-border-color px-4 sm:px-5 py-3.5 flex items-center gap-2.5">
          {step !== undefined && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgb(var(--lt-primary))] text-[11px] font-extrabold text-white shadow-xs">
              {step}
            </span>
          )}
          <h3 className="font-bold text-[rgb(var(--lt-text))] text-sm tracking-tight">{title}</h3>
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}
