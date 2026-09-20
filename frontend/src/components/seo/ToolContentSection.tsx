'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { FaqJsonLd } from './JsonLd';

export interface StepItem {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FeatureItem {
  title: string;
  description: string;
}

export interface ToolContentSectionProps {
  toolName: string;
  category: string;
  tagline: string;
  steps: StepItem[];
  features: FeatureItem[];
  faqs: FaqItem[];
  specs?: Array<{ label: string; value: string }>;
}

export function ToolContentSection({
  toolName,
  category,
  tagline,
  steps,
  features,
  faqs,
  specs,
}: ToolContentSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="mt-16 space-y-16 border-t lt-border-color pt-14">
      {/* FAQ Schema.org Structured Data */}
      {faqs.length > 0 && <FaqJsonLd items={faqs} />}

      {/* ── 1. How It Works (Step-by-Step Guide) ── */}
      <section aria-labelledby="how-it-works-heading">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-primary))]">
            Step-by-Step Guide
          </span>
          <h2
            id="how-it-works-heading"
            className="mt-2 text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))] tracking-tight"
          >
            How to use {toolName}
          </h2>
          <p className="mt-2 text-sm lt-text-muted">{tagline}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.title}
              className="lt-card p-6 rounded-2xl relative border lt-border-color flex flex-col justify-between group hover:border-[rgb(var(--lt-primary)/0.4)] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] font-extrabold text-base">
                    0{idx + 1}
                  </div>
                  <span className="text-xs font-semibold text-[rgb(var(--lt-text-muted))]">
                    Step {idx + 1}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[rgb(var(--lt-text))] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs lt-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. Key Features & Privacy Guarantees ── */}
      <section aria-labelledby="features-heading">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-primary))]">
            Built for Speed &amp; Privacy
          </span>
          <h2
            id="features-heading"
            className="mt-2 text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))] tracking-tight"
          >
            Why choose LutaTech {toolName}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Privacy Guarantee Card */}
          <div className="lt-card p-6 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1.5">
              100% In-Browser Privacy
            </h3>
            <p className="text-xs lt-text-muted leading-relaxed">
              Your files and data are processed directly inside your browser. No file uploads to external servers, ensuring zero risk of leaks.
            </p>
          </div>

          {/* Speed Card */}
          <div className="lt-card p-6 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1.5">
              Instant Processing
            </h3>
            <p className="text-xs lt-text-muted leading-relaxed">
              Eliminate upload and download latency. Optimized algorithms deliver instant results without waiting in queues.
            </p>
          </div>

          {/* Dynamic Features */}
          {features.map((feat) => (
            <div
              key={feat.title}
              className="lt-card p-6 rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))] mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1.5">
                {feat.title}
              </h3>
              <p className="text-xs lt-text-muted leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Technical Specifications (Optional Table) ── */}
      {specs && specs.length > 0 && (
        <section aria-labelledby="specs-heading">
          <div className="lt-card p-6 sm:p-8 rounded-2xl border lt-border-color">
            <h3
              id="specs-heading"
              className="text-lg font-bold text-[rgb(var(--lt-text))] mb-4 flex items-center gap-2"
            >
              <FileCheck className="h-5 w-5 text-[rgb(var(--lt-primary))]" /> Technical Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {specs.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-3.5 bg-[rgb(var(--lt-surface-2))] border lt-border-color"
                >
                  <span className="text-[11px] font-semibold text-[rgb(var(--lt-text-muted))] uppercase block">
                    {item.label}
                  </span>
                  <span className="mt-1 text-sm font-bold text-[rgb(var(--lt-text))] block">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. Frequently Asked Questions (Accordion) ── */}
      {faqs.length > 0 && (
        <section aria-labelledby="faq-heading">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-primary))]">
              Got Questions?
            </span>
            <h2
              id="faq-heading"
              className="mt-2 text-2xl sm:text-3xl font-extrabold text-[rgb(var(--lt-text))] tracking-tight"
            >
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm lt-text-muted">
              Everything you need to know about {toolName} on LutaTech.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.question}
                  className="lt-card rounded-2xl border lt-border-color overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-[rgb(var(--lt-text))] hover:text-[rgb(var(--lt-primary))] transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[rgb(var(--lt-text-muted))] transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[rgb(var(--lt-primary))]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs lt-text-muted leading-relaxed border-t lt-border-color">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

export default ToolContentSection;
