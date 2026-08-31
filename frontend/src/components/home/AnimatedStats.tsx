'use client';

import React, { useEffect, useState, useRef } from 'react';
import { tools, categories } from '@/lib/tools';
import { Wrench, Globe, Layers } from 'lucide-react';

interface StatItemProps {
  endValue: number;
  suffix?: string;
  prefix?: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  duration?: number;
}

function StatItem({
  endValue,
  suffix = '',
  prefix = '',
  label,
  sub,
  icon,
  duration = 1600,
}: StatItemProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Smooth cubic-out easing
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(endValue * easeProgress);

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStarted, endValue, duration]);

  return (
    <div
      ref={elementRef}
      className="lt-card p-4 sm:p-5 text-center transition-all duration-300 hover:border-[rgb(var(--lt-primary)/0.4)] hover:shadow-md group relative overflow-hidden"
    >
      <div className="absolute top-2.5 right-2.5 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all text-[rgb(var(--lt-primary))] pointer-events-none">
        {icon}
      </div>

      <div className="lt-stat-value text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-primary))] tracking-tight tabular-nums">
        {prefix}
        {count}
        {suffix}
      </div>

      <div className="mt-1 text-sm font-semibold text-[rgb(var(--lt-text))] transition-colors group-hover:text-[rgb(var(--lt-primary))]">
        {label}
      </div>

      <div className="mt-0.5 text-xs lt-text-muted">
        {sub}
      </div>
    </div>
  );
}

export function AnimatedStats() {
  // Dynamically pull tool and category counts from registered dataset
  const totalTools = tools.length;
  const totalCategories = categories.length;

  return (
    <div className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 lg:gap-6 max-w-4xl mx-auto lt-fade-up">
      {/* 1. Dynamic Digital Tools count */}
      <StatItem
        endValue={totalTools}
        suffix="+"
        label="Digital Tools"
        sub="Growing weekly"
        icon={<Wrench className="h-6 w-6" />}
      />

      {/* 2. 100% Browser Based */}
      <StatItem
        endValue={100}
        suffix="%"
        label="Browser-Based"
        sub="Client-side processing"
        icon={<Globe className="h-6 w-6" />}
      />

      {/* 3. Dynamic Categories count */}
      <StatItem
        endValue={totalCategories}
        label="Categories"
        sub="Image, PDF, AI, Dev"
        icon={<Layers className="h-6 w-6" />}
      />
    </div>
  );
}
