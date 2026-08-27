import Link from 'next/link'

export const metadata = {
  title: 'Dashboard | Luta Studio AI',
}

const tools = [
  {
    name: 'Passport Photo Maker',
    description: 'Create compliant passport and ID photos instantly with AI auto-cropping and face detection.',
    href: '/tools/passport',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-blue-500 to-indigo-500',
    bgColor: 'bg-blue-500/10',
    badge: 'Popular'
  },
  {
    name: 'Background Remover',
    description: 'Instantly remove backgrounds from any image with high-precision AI models.',
    href: '/tools/remove-bg',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    badge: 'New'
  }
]

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Tools Suite</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Select a tool below to get started with your tasks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link href={tool.href} key={tool.name} className="group block h-full">
            <div className="relative h-full bg-white dark:bg-[#0F172A] rounded-2xl border border-gray-200 dark:border-slate-800 p-6 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300 overflow-hidden">
              
              {/* Top accent line */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tool.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl ${tool.bgColor} flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-300`}>
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${tool.color} text-white shadow-sm`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                {tool.name}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>

              <div className="mt-6 flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform">
                Open Tool
                <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
