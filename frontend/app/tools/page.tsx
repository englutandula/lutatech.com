import React from 'react'
import Link from 'next/link'

export const metadata = {
  title: 'All Tools | Luta Tech',
  description: 'Browse all available AI tools from Luta Tech. Free, fast, and simple.',
}

export default function AllToolsPage() {
  const allTools = [
    {
      id: 'passport',
      title: 'Passport Photo Maker',
      desc: 'Create compliant passport and visa photos with auto-crop & AI background removal.',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      href: '/tools/passport',
      category: 'Images'
    },
    {
      id: 'bg-remover',
      title: 'Background Remover',
      desc: 'Instantly remove and replace the background of any image using AI.',
      icon: (
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      ),
      href: '/tools/remove-bg',
      category: 'Images'
    },
  ]

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8FAFC] dark:bg-gray-950 transition-colors py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">
            All Tools
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 transition-colors max-w-2xl">
            Browse our complete collection of free AI-powered utilities for images, PDFs, and documents.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button className="px-5 py-2 rounded-full bg-blue-600 text-white text-sm font-medium">All</button>
          {['Images', 'PDF', 'Documents', 'AI', 'Utilities'].map(filter => (
            <button key={filter} className="px-5 py-2 rounded-full bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
              {filter}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allTools.map((tool) => (
            <Link 
              href={tool.href}
              key={tool.id} 
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                {tool.icon}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{tool.title}</h3>
                  <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">{tool.category}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">{tool.desc}</p>
              
              <div className="flex items-center justify-end text-sm font-bold text-blue-600 dark:text-blue-400 transition-colors pt-2">
                <span className="flex items-center gap-2 group-hover:gap-3 transition-all">
                  Open Tool
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
