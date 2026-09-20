'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    src: '/slide-1.png',
    alt: 'Manual Crop and Face Alignment Guide',
    title: 'Biometric Face Alignment Guide',
  },
  {
    src: '/slide-2.png',
    alt: 'Before and After AI Background Removal',
    title: 'Instant Background Removal',
  },
  {
    src: '/slide-3.png',
    alt: 'Multi-Photo 4x6 Print Sheet Generator',
    title: '4×6 Multi-Photo Print Sheet',
  },
];

export function ShowcaseSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <div className="relative w-full overflow-hidden group">
      {/* Slide Container without border, bg, or shadow */}
      <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl flex items-center justify-center">
        {SLIDES.map((slide, idx) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center justify-center ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
        ))}

        {/* Navigation Buttons */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:scale-105 cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:bg-black/80 hover:scale-105 cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Dots & Caption */}
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-xs font-medium text-[rgb(var(--lt-text-muted))]">
          {SLIDES[currentIndex].title}
        </span>
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex
                  ? 'w-6 bg-[rgb(var(--lt-primary))]'
                  : 'w-2 bg-[rgb(var(--lt-border-strong))] hover:bg-[rgb(var(--lt-text-muted))]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ShowcaseSlider;
