'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Monitor,
  Apple,
  Terminal,
  ShieldCheck,
  Cpu,
  Zap,
  Check,
  Copy,
  Sparkles,
  ExternalLink,
  Layers,
  Lock,
  ArrowRight,
  X,
  FileCheck2,
  HelpCircle,
} from 'lucide-react';

interface DownloadOption {
  os: 'windows' | 'macos' | 'linux';
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  primaryFile: {
    id: string;
    name: string;
    label: string;
    type: string;
  };
  altFiles: {
    id: string;
    label: string;
    name: string;
    ext: string;
  }[];
  features: string[];
  installSteps: string[];
}

const DOWNLOADS: DownloadOption[] = [
  {
    os: 'windows',
    title: 'Windows',
    badge: 'Windows 10 / 11 (64-bit)',
    subtitle: 'Installer & Portable Edition',
    description: 'Native high-performance desktop application with shell integration, dark mode, and zero external dependencies.',
    primaryFile: {
      id: 'windows-msi',
      name: 'LutaPDF-windows-x64.msi',
      label: 'Download Windows Installer (.msi)',
      type: 'MSI Package',
    },
    altFiles: [
      {
        id: 'windows-zip',
        label: 'Portable ZIP (No installation needed)',
        name: 'LutaPDF-windows-x64-portable.zip',
        ext: '.zip',
      },
    ],
    features: ['Instant startup with WGPU graphics acceleration', 'Offline document processing & digital signatures', 'Full WiX MSI installer with Start Menu integration'],
    installSteps: [
      'Locate the downloaded LutaPDF-windows-x64.msi file in your Downloads folder.',
      'Double-click the installer and follow the quick setup wizard.',
      'If Windows SmartScreen appears, click "More info" and then "Run anyway".',
      'Launch LutaPDF from your Start Menu or Desktop shortcut.',
    ],
  },
  {
    os: 'macos',
    title: 'macOS',
    badge: 'Universal Binary (Apple Silicon & Intel)',
    subtitle: 'macOS 11 Big Sur or newer',
    description: 'Built natively for Apple Silicon (M1/M2/M3/M4) and Intel Macs with hardware-accelerated rendering and smooth typography.',
    primaryFile: {
      id: 'macos-dmg',
      name: 'LutaPDF-macos-universal.dmg',
      label: 'Download Disk Image (.dmg)',
      type: 'Universal DMG',
    },
    altFiles: [
      {
        id: 'macos-cli',
        label: 'Headless CLI Tool for Mac',
        name: 'LutaPDF-cli-macos-universal.zip',
        ext: '.zip',
      },
    ],
    features: ['Universal ARM64 & x86_64 single binary', 'Sandboxed & offline-first privacy guarantee', 'Drag-and-drop to Applications folder'],
    installSteps: [
      'Locate the downloaded LutaPDF-macos-universal.dmg in your Downloads.',
      'Double-click to mount the disk image.',
      'Drag the LutaPDF icon into your Applications folder.',
      'On first launch, right-click LutaPDF in Applications and choose "Open" to approve Gatekeeper.',
    ],
  },
  {
    os: 'linux',
    title: 'Linux',
    badge: 'Ubuntu, Debian, Fedora, Arch & Generic',
    subtitle: 'glibc 2.31+ (x86_64)',
    description: 'Lightweight, dependency-free binary with native desktop entries, Wayland & X11 support, and headless CLI capabilities.',
    primaryFile: {
      id: 'linux-deb',
      name: 'LutaPDF-linux-x86_64.deb',
      label: 'Download Debian / Ubuntu (.deb)',
      type: 'Debian Package',
    },
    altFiles: [
      {
        id: 'linux-rpm',
        label: 'Fedora / openSUSE / RHEL (.rpm)',
        name: 'LutaPDF-linux-x86_64.rpm',
        ext: '.rpm',
      },
      {
        id: 'linux-tar',
        label: 'Standalone Tarball (All distros)',
        name: 'LutaPDF-linux-x86_64.tar.gz',
        ext: '.tar.gz',
      },
      {
        id: 'linux-cli',
        label: 'CLI-only Archive (Servers / CI / Headless)',
        name: 'LutaPDF-cli-linux-x86_64.tar.gz',
        ext: '.tar.gz',
      },
    ],
    features: ['Desktop entry and MIME associations included', 'Pure Rust engine — zero external C library bloat', 'Full Wayland and X11 native windowing'],
    installSteps: [
      'For Ubuntu/Debian: run sudo apt install ./LutaPDF-linux-x86_64.deb',
      'For Fedora/RHEL: run sudo dnf install ./LutaPDF-linux-x86_64.rpm',
      'For Tarball: extract and run ./bin/lutapdf directly.',
    ],
  },
];

export default function DownloadPage() {
  const [detectedOs, setDetectedOs] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [copiedVerify, setCopiedVerify] = useState(false);
  const [downloadModal, setDownloadModal] = useState<{
    open: boolean;
    fileName: string;
    fileId: string;
    os: 'windows' | 'macos' | 'linux';
    steps: string[];
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('mac') || ua.includes('darwin')) {
        setDetectedOs('macos');
      } else if (ua.includes('win')) {
        setDetectedOs('windows');
      } else if (ua.includes('linux')) {
        setDetectedOs('linux');
      }
    }
  }, []);

  const triggerDownload = (fileId: string, fileName: string, os: 'windows' | 'macos' | 'linux', steps: string[]) => {
    // 1. Trigger direct browser download without opening any new tab or leaving the website
    const downloadApiUrl = `/api/download?file=${encodeURIComponent(fileId)}`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadApiUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 30000);

    // 2. Open on-page polite success dialog with instructions
    setDownloadModal({
      open: true,
      fileName,
      fileId,
      os,
      steps,
    });
  };

  const handleCopyVerify = () => {
    navigator.clipboard.writeText('curl -sSL https://github.com/englutandula/LutaPDF/releases/latest/download/SHA256SUMS.txt | sha256sum -c --ignore-missing');
    setCopiedVerify(true);
    setTimeout(() => setCopiedVerify(false), 2500);
  };

  const primaryDownload = DOWNLOADS.find((d) => d.os === detectedOs) || DOWNLOADS[0];

  return (
    <div className="min-h-screen bg-[rgb(var(--lt-bg))] py-12 md:py-16">
      <div className="lt-container">

        {/* ── HERO BANNER ── */}
        <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border lt-border-color bg-[rgb(var(--lt-surface))] px-4 py-1.5 text-xs font-semibold text-[rgb(var(--lt-primary))] shadow-sm mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Official Desktop Release · LutaPDF v0.7.0 · Developed by Eng.Luta</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[rgb(var(--lt-text))] mb-4">
            Download <span className="text-[rgb(var(--lt-primary))]">LutaPDF</span>
          </h1>

          <p className="text-sm sm:text-base font-semibold text-[rgb(var(--lt-text))] mb-4">
            Architected &amp; Built by <span className="text-[rgb(var(--lt-primary))]">Eng.Luta</span>
          </p>

          <p className="text-base sm:text-lg md:text-xl text-[rgb(var(--lt-text-muted))] leading-relaxed max-w-2xl mx-auto mb-8">
            The ultra-fast, native desktop PDF editor engineered in Rust. 100% offline, zero server tracking, and uncompromising privacy.
          </p>

          {/* Quick Detected OS Download CTA */}
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 p-2 rounded-2xl bg-[rgb(var(--lt-surface))] border lt-border-color shadow-md max-w-xl mx-auto">
            <button
              onClick={() =>
                triggerDownload(
                  primaryDownload.primaryFile.id,
                  primaryDownload.primaryFile.name,
                  primaryDownload.os,
                  primaryDownload.installSteps
                )
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-[rgb(var(--lt-primary))] px-7 py-4 text-base font-bold text-white shadow-lg transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Download className="h-5 w-5" />
              <span>Download for {primaryDownload.title}</span>
            </button>
            <span className="text-xs text-[rgb(var(--lt-text-muted))] px-3 py-1 font-medium">
              Auto-detected: {primaryDownload.badge}
            </span>
          </div>
        </div>

        {/* ── THREE PLATFORM CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {DOWNLOADS.map((item) => {
            const isDetected = item.os === detectedOs;
            return (
              <div
                key={item.os}
                className={`flex flex-col justify-between rounded-2xl border bg-[rgb(var(--lt-surface))] p-7 shadow-sm transition-all hover:shadow-md ${
                  isDetected
                    ? 'border-[rgb(var(--lt-primary))] ring-2 ring-[rgb(var(--lt-primary)/0.2)]'
                    : 'lt-border-color'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(var(--lt-primary)/0.1)] text-[rgb(var(--lt-primary))]">
                      {item.os === 'windows' && <Monitor className="h-6 w-6" />}
                      {item.os === 'macos' && <Apple className="h-6 w-6" />}
                      {item.os === 'linux' && <Terminal className="h-6 w-6" />}
                    </div>
                    {isDetected && (
                      <span className="rounded-full bg-[rgb(var(--lt-primary)/0.1)] px-2.5 py-0.5 text-[11px] font-bold text-[rgb(var(--lt-primary))]">
                        Your OS
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-[rgb(var(--lt-text))] mb-1">{item.title}</h2>
                  <p className="text-xs font-semibold text-[rgb(var(--lt-primary))] mb-3">{item.badge}</p>
                  <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed mb-6">{item.description}</p>

                  <ul className="space-y-2 mb-6">
                    {item.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[rgb(var(--lt-text))]">
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t lt-border-color space-y-3">
                  <button
                    onClick={() =>
                      triggerDownload(item.primaryFile.id, item.primaryFile.name, item.os, item.installSteps)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[rgb(var(--lt-primary))] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>{item.primaryFile.label}</span>
                  </button>

                  {item.altFiles.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-semibold text-[rgb(var(--lt-text-muted))]">Additional formats:</p>
                      {item.altFiles.map((alt, idx) => (
                        <button
                          key={idx}
                          onClick={() => triggerDownload(alt.id, alt.name, item.os, item.installSteps)}
                          className="flex w-full items-center justify-between rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] px-3 py-2 text-xs text-[rgb(var(--lt-text))] transition-colors hover:border-[rgb(var(--lt-primary))] hover:text-[rgb(var(--lt-primary))] cursor-pointer text-left"
                        >
                          <span className="truncate">{alt.label}</span>
                          <span className="shrink-0 font-mono text-[10px] font-semibold opacity-75">{alt.ext}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── SECURITY & INTEGRITY SECTION ── */}
        <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-8 md:p-10 mb-16 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[rgb(var(--lt-text))]">Verified Package Integrity</h3>
                <p className="text-xs text-[rgb(var(--lt-text-muted))]">Every binary is verified with SHA-256 cryptographic hashes.</p>
              </div>
            </div>

            <a
              href="/api/download?file=sha256"
              className="inline-flex items-center gap-2 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] px-4 py-2.5 text-xs font-semibold text-[rgb(var(--lt-text))] transition-colors hover:border-[rgb(var(--lt-primary))]"
            >
              <span>Download SHA256SUMS.txt</span>
              <Download className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-bg))] p-4 font-mono text-xs text-[rgb(var(--lt-text))] flex items-center justify-between gap-4 overflow-x-auto">
            <code className="text-xs text-[rgb(var(--lt-text))]">
              curl -sSL https://github.com/englutandula/LutaPDF/releases/latest/download/SHA256SUMS.txt | sha256sum -c --ignore-missing
            </code>
            <button
              onClick={handleCopyVerify}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border lt-border-color bg-[rgb(var(--lt-surface))] px-3 py-1.5 text-xs font-medium text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-2))] cursor-pointer transition-colors"
            >
              {copiedVerify ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── PRIVACY & ARCHITECTURE HIGHLIGHTS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6">
            <Lock className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">100% Offline</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              No telemetry, no tracking, and no external network calls during PDF editing.
            </p>
          </div>

          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6">
            <Zap className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">Rust Performance</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              Sub-millisecond page rendering and minimal RAM consumption even with 1,000+ page documents.
            </p>
          </div>

          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6">
            <Cpu className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">Native GPU Engine</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              Hardware accelerated zooming and fluid canvas scrolling powered by WGPU.
            </p>
          </div>

          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6">
            <Layers className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">Open Source</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              Licensed under MIT and Apache-2.0. Transparent, clean-room PDF architecture.
            </p>
          </div>
        </div>

      </div>

      {/* ── ON-PAGE DOWNLOAD SUCCESS & INSTALLATION MODAL ── */}
      {downloadModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setDownloadModal(null)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-[rgb(var(--lt-text-muted))] hover:bg-[rgb(var(--lt-surface-2))] hover:text-[rgb(var(--lt-text))] cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[rgb(var(--lt-text))]">Your download has started!</h3>
                <p className="text-xs text-[rgb(var(--lt-text-muted))] font-mono">{downloadModal.fileName}</p>
              </div>
            </div>

            <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] p-4 mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-primary))] mb-3">
                Installation Instructions
              </h4>
              <ol className="space-y-2.5 text-xs text-[rgb(var(--lt-text))]">
                {downloadModal.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--lt-primary)/0.15)] text-[10px] font-bold text-[rgb(var(--lt-primary))]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[rgb(var(--lt-text-muted))]">
              <p>
                Didn&apos;t start?{' '}
                <a
                  href={`/api/download?file=${encodeURIComponent(downloadModal.fileId)}`}
                  className="font-semibold text-[rgb(var(--lt-primary))] hover:underline"
                >
                  Click here to retry
                </a>
              </p>
              <button
                onClick={() => setDownloadModal(null)}
                className="w-full sm:w-auto rounded-xl bg-[rgb(var(--lt-surface-2))] px-5 py-2.5 text-xs font-semibold text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-border))] cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
