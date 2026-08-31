'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SuccessPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/register')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-4">
           <div className="relative w-16 h-16 flex items-center justify-center bg-green-100 rounded-full">
             <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
             </svg>
           </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          You have been successfully registered
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Welcome to Luta Tech, {user.name || user.email?.split('@')[0]}!
        </p>

        <div className="pt-4">
          <Link
            href="/dashboard"
            className="inline-block bg-[#E53935] hover:bg-[#D32F2F] text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-md"
          >
            Start using Luta Tech
          </Link>
        </div>
      </div>
    </div>
  )
}
