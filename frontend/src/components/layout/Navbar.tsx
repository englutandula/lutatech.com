'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setCategoriesOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setCategoriesOpen(false)
  }, [pathname])

  const navLinks = [
    { name: 'Home', href: '/', hasDropdown: false },
    { name: 'All Tools', href: '/tools', hasDropdown: false },
    { name: 'Categories', hasDropdown: true },
    { name: 'About', href: '/about', hasDropdown: false },
  ]

  const categoriesList = [
    { name: 'Photography & Images', items: ['Passport Photo Maker', 'Background Remover', 'Image Compressor', 'Image Upscaler'] },
    { name: 'Documents & PDF', items: ['PDF to Word', 'Word to PDF', 'Merge PDF', 'Compress PDF'] },
    { name: 'AI Generation', items: ['Text to Image', 'AI Copywriter', 'Logo Generator', 'Avatar Creator'] },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Left: Logo & Links */}
          <div className="flex items-center gap-12" ref={navRef}>
            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex flex-shrink-0 items-center justify-center">
                <img src="/logo.png" alt="Luta Tech Logo" className="w-full h-full object-contain dark:hidden" />
                <img src="/logo-white.png" alt="Luta Tech Logo" className="w-full h-full object-contain hidden dark:block" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Luta Tech
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8 relative">
              {navLinks.map((link) => (
                <div key={link.name} className="relative group">
                  <button
                    onClick={() => link.hasDropdown ? setCategoriesOpen(!categoriesOpen) : null}
                    className={`flex items-center gap-1.5 text-[15px] font-medium transition-colors py-2 ${pathname === link.href ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
                  >
                    {link.hasDropdown ? (
                      link.name
                    ) : (
                      <Link href={link.href!}>{link.name}</Link>
                    )}
                    {link.hasDropdown && (
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Mega Menu for Categories */}
                  {link.hasDropdown && categoriesOpen && (
                    <div className="absolute top-[3.5rem] left-1/2 -translate-x-1/2 w-[700px] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 grid grid-cols-3 gap-8">
                      {categoriesList.map((col) => (
                        <div key={col.name}>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">{col.name}</h4>
                          <ul className="space-y-3">
                            {col.items.map((item) => (
                              <li key={item}>
                                <Link href="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="hidden lg:flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            >
              {mounted && theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>


          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
          <nav className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <button key={link.name} className="w-full flex items-center justify-between px-3 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg">
                {link.name}
                {link.hasDropdown && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))}
            <div className="pt-4 px-3 space-y-3">
              <Link href="/dashboard" className="w-full flex justify-center px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                Dashboard
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
