'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getHistory } from '@/lib/api'
import { auth } from '@/lib/firebase'
import { signOut } from 'firebase/auth'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [history, setHistory] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      getHistory()
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoadingHistory(false))
    }
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.push('/')
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="text-center pt-8 pb-4">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white">
            Hi {user.displayName || user.email?.split('@')[0] || 'there'}, let's get started
          </h1>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-8">
          
          <Link href="/tools/passport" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group flex flex-col items-start cursor-pointer">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Passport Photo Maker</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">Create perfect passport photos with automatic background removal and proper sizing.</p>
          </Link>

          <Link href="/tools/remove-bg" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group flex flex-col items-start cursor-pointer">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Background Remover</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">Instantly remove the background from any image with AI-powered precision.</p>
          </Link>

          <Link href="/tools" className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow group flex flex-col items-center justify-center cursor-pointer border-dashed border-2">
            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">Explore All Tools</h3>
          </Link>
          
        </div>

        {/* History Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Conversions History</h2>
          
          {loadingHistory ? (
            <div className="text-gray-500 dark:text-gray-400">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 border-dashed rounded-2xl p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">You haven't processed any images yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {history.map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
                    {job.result_url ? (
                      // Display the base64 image (assuming it's a raw base64 string, we need to prefix it, but the backend remove-background returns it without prefix)
                      <img 
                        src={`data:image/png;base64,${job.result_url}`} 
                        alt="Processed result"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 text-sm">No preview</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{job.tool_type.replace('-', ' ')}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  )
}
