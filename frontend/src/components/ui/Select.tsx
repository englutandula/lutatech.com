'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (e: { target: { value: string } }) => void
  label?: string
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function Select({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Find currently selected option object
  const selectedOption = options.find((opt) => opt.value === value)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard events (Escape to close)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange({ target: { value: val } })
    }
    setIsOpen(false)
  }

  return (
    <div className={`relative space-y-1.5 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-[rgb(var(--lt-text-muted))]">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[rgb(var(--lt-text))] shadow-2xs transition-colors duration-150 cursor-pointer text-left ${
          isOpen
            ? 'border-[rgb(var(--lt-primary))] ring-2 ring-[rgb(var(--lt-primary)/0.25)]'
            : 'hover:border-[rgb(var(--lt-primary)/0.5)] hover:bg-[rgb(var(--lt-surface-2))]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="truncate pr-2">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[rgb(var(--lt-text-muted))] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[rgb(var(--lt-primary))]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-1.5 shadow-xl backdrop-blur-xl lt-fade-in">
          <ul role="listbox" className="space-y-0.5">
            {options.map((opt) => {
              const isSelected = opt.value === value
              return (
                <li
                  key={opt.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] font-bold'
                      : 'text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-[rgb(var(--lt-primary))] ml-2" />
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
