import Link from 'next/link'
import FeatureSlider from '../src/components/home/FeatureSlider'

export const metadata = {
  title: 'Luta Tech - Tools that get things done',
}



const categories = [
  { 
    icon: '🛂', 
    title: 'Passport Photo Maker', 
    desc: 'Auto-crop and remove backgrounds for official ID and passport photos. Supports 9+ countries.', 
    href: '/tools/passport',
    color: 'text-blue-600', 
    bg: 'bg-blue-100' 
  },
  { 
    icon: '✨', 
    title: 'AI Background Remover', 
    desc: 'Instantly remove backgrounds from any image with high precision using our AI model.', 
    href: '/tools/remove-bg',
    color: 'text-purple-600', 
    bg: 'bg-purple-100' 
  }
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-gray-950 transition-colors">
      {/* Background gradients */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-100/80 dark:from-blue-900/20 via-purple-50/40 dark:via-purple-900/10 to-transparent rounded-full blur-3xl -z-10 transform translate-x-1/3 -translate-y-1/4 transition-colors"></div>
      
      {/* Curved decorative lines (SVG background) */}
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-10 pointer-events-none transition-opacity">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <path d="M 500 200 C 700 100, 900 300, 1100 200" stroke="#CBD5E1" strokeWidth="1" fill="none" strokeDasharray="5,5" />
          <path d="M 600 400 C 800 600, 1000 300, 1200 500" stroke="#CBD5E1" strokeWidth="1" fill="none" strokeDasharray="5,5" />
          <circle cx="700" cy="150" r="4" fill="#94A3B8" />
          <circle cx="1000" cy="250" r="3" fill="#94A3B8" />
          <circle cx="850" cy="450" r="5" fill="#94A3B8" />
        </svg>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* ── Hero Section ── */}
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
          
          {/* Left Column (Content) */}
          <div className="flex-1 max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wide mb-8 transition-colors">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              SIMPLE. POWERFUL. FAST.
            </div>

            {/* Headline */}
            <h1 className="text-6xl sm:text-7xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.1] mb-6 transition-colors">
              Tools that <br /> get things done<span className="text-blue-600 dark:text-blue-500">.</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg transition-colors">
              All the tools you need for everyday work.<br />
              Simple, powerful tools. Powerful results.
            </p>


          </div>

          {/* Right Column (Video Banner) */}
          <div className="flex-1 w-full hidden lg:flex justify-center items-center relative">
            <div className="relative z-10 w-full max-w-[280px] transform hover:scale-[1.02] transition-transform duration-300">
              <video 
                src="/banner.mp4" 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-auto object-cover mix-blend-multiply dark:mix-blend-normal"
              />
            </div>
          </div>
        </div>


        {/* ── Feature Slider Section ── */}
        <div className="mb-24 w-full">
          <FeatureSlider />
        </div>

        {/* ── Categories Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {categories.map((cat, idx) => (
            <Link key={idx} href={cat.href} className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-blue-100 dark:hover:border-blue-900/50 transition-all group flex flex-col h-full">
              <div className={`w-14 h-14 rounded-2xl ${cat.bg} dark:bg-opacity-20 ${cat.color} flex items-center justify-center text-2xl mb-6`}>
                {cat.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{cat.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex-1 leading-relaxed">{cat.desc}</p>
              
              <div className="flex items-center justify-end text-sm font-bold text-blue-600 dark:text-blue-400 transition-colors mt-auto pt-4">
                <span className="flex items-center gap-2 group-hover:gap-3 transition-all">
                  Open Tool
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
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
