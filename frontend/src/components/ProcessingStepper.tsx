'use client'

import React, { useEffect, useState, useRef } from 'react'

export interface StepItem {
  id: string
  title: string
}

const STEPS: StepItem[] = [
  { id: 'face', title: 'Detect Face' },
  { id: 'bg', title: 'Remove BG' },
  { id: 'crop', title: 'Auto Crop' },
  { id: 'enhance', title: 'Enhance' },
]

interface ProcessingStepperProps {
  isProcessing: boolean
}

export default function ProcessingStepper({ isProcessing }: ProcessingStepperProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [lineProgress, setLineProgress] = useState<number[]>([0, 0, 0])
  const timerRefs = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    // Clear any active timers on change
    timerRefs.current.forEach(clearTimeout)
    timerRefs.current = []

    if (!isProcessing) {
      // Fast forward all steps and lines when processing finishes
      setCompletedSteps([0, 1, 2, 3])
      setLineProgress([100, 100, 100])
      setCurrentStepIndex(4)
      return
    }

    // Reset state for new photo processing session
    setCurrentStepIndex(0)
    setCompletedSteps([])
    setLineProgress([0, 0, 0])

    // Stage 1: Detect Face (0ms -> 700ms)
    const t1 = setTimeout(() => {
      // Step 0 completes & ticks
      setCompletedSteps([0])
      // Line 0->1 starts filling
      setLineProgress([100, 0, 0])
    }, 700)

    // Stage 2: Line reaches Step 1 -> Remove BG starts loading (1050ms)
    const t2 = setTimeout(() => {
      setCurrentStepIndex(1)
    }, 1050)

    // Remove BG completes & ticks (2200ms)
    const t3 = setTimeout(() => {
      setCompletedSteps([0, 1])
      // Line 1->2 starts filling
      setLineProgress([100, 100, 0])
    }, 2200)

    // Stage 3: Line reaches Step 2 -> Auto Crop starts loading (2550ms)
    const t4 = setTimeout(() => {
      setCurrentStepIndex(2)
    }, 2550)

    // Auto Crop completes & ticks (3200ms)
    const t5 = setTimeout(() => {
      setCompletedSteps([0, 1, 2])
      // Line 2->3 starts filling
      setLineProgress([100, 100, 100])
    }, 3200)

    // Stage 4: Line reaches Step 3 -> Enhance starts loading (3550ms)
    const t6 = setTimeout(() => {
      setCurrentStepIndex(3)
    }, 3550)

    timerRefs.current = [t1, t2, t3, t4, t5, t6]

    return () => {
      timerRefs.current.forEach(clearTimeout)
    }
  }, [isProcessing])

  return (
    <div className="w-full max-w-lg mx-auto rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] backdrop-blur-sm p-6 sm:p-8 shadow-xs animate-fade-in">
      {/* Header */}
      <div className="text-center mb-7">
        <h3 className="text-base sm:text-lg font-bold text-[rgb(var(--lt-text))] tracking-tight">
          Processing your photo...
        </h3>
        <p className="text-xs lt-text-muted mt-1 font-medium">
          This usually takes only 2–4 seconds
        </p>
      </div>

      {/* Horizontal Stepper Flow */}
      <div className="flex items-start justify-between w-full relative px-1 sm:px-3">
        {STEPS.map((step, index) => {
          const isDone = completedSteps.includes(index)
          const isActive = currentStepIndex === index && !isDone
          const isPending = !isDone && !isActive

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <div className="flex flex-col items-center z-10 w-16 sm:w-20 text-center flex-shrink-0">
                {/* Circle Icon */}
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isDone
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 scale-100 ring-4 ring-emerald-50 dark:ring-emerald-950/40'
                      : isActive
                      ? 'bg-[rgb(var(--lt-primary))] text-white shadow-md shadow-[rgb(var(--lt-primary)/0.35)] scale-105 ring-4 ring-[rgb(var(--lt-primary)/0.2)]'
                      : 'border-2 lt-border-color bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))]'
                  }`}
                >
                  {isDone ? (
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-fade-in"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isActive ? (
                    <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-90"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step Title */}
                <span
                  className={`text-[11px] sm:text-xs mt-2 transition-colors duration-200 leading-tight font-medium ${
                    isDone
                      ? 'text-[rgb(var(--lt-text))] font-semibold'
                      : isActive
                      ? 'text-[rgb(var(--lt-primary))] font-bold'
                      : 'lt-text-muted'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {/* Connecting Horizontal Moving Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mt-4 sm:mt-5 mx-1 sm:mx-2 h-1 bg-[rgb(var(--lt-surface-3))] rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-[rgb(var(--lt-primary))] rounded-full transition-all duration-350 ease-out"
                    style={{ width: `${lineProgress[index]}%` }}
                  />
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
