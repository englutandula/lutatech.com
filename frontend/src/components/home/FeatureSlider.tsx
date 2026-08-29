'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const slides = [
  '/slide-1.png',
  '/slide-2.png',
  '/slide-3.png'
]

export default function FeatureSlider() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden aspect-video group">
      {/* Images */}
      <div 
        className="flex transition-transform duration-700 ease-in-out h-full"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((src, idx) => (
          <div key={idx} className="w-full h-full flex-shrink-0 relative bg-gray-50 dark:bg-gray-900/50">
            <img 
              src={src} 
              alt={`App Feature ${idx + 1}`} 
              className="w-full h-full object-contain p-4 sm:p-8"
            />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === current ? 'bg-blue-600 w-8' : 'bg-gray-300 dark:bg-gray-600 w-2.5 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
      
      <button 
        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-105 hover:bg-white dark:hover:bg-gray-700"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <button 
        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 hover:scale-105 hover:bg-white dark:hover:bg-gray-700"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  )
}
