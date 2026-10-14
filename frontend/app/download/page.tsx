'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  ShieldCheck,
  Cpu,
  Zap,
  Check,
  Copy,
  ExternalLink,
  Layers,
  Lock,
  ArrowRight,
  X,
  FileCheck2,
  ChevronDown,
  Info,
  Clock,
  Sparkles,
  Search,
  Package,
  CheckCircle2,
} from 'lucide-react';

/* ── AUTHENTIC VECTOR BRAND LOGOS ── */

function WindowsLogo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Microsoft Windows">
      <path fill="#0078D4" d="M0 0h41.25v41.25H0zM46.75 0H88v41.25H46.75zM0 46.75h41.25V88H0zM46.75 46.75H88V88H46.75z" />
    </svg>
  );
}

function AppleLogo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 170 170" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Apple macOS">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.69-7.85-12-14.42-6-9.16-10.84-19.64-14.54-31.45-3.7-11.82-5.56-23.01-5.56-33.59 0-14.35 3.7-26.24 11.1-35.68 7.4-9.44 16.53-14.24 27.39-14.42 5.01 0 10.55 1.34 16.63 4.02 6.08 2.68 10.15 4.07 12.21 4.17 2.28 0 6.64-1.47 13.08-4.42 6.44-2.95 12.16-4.32 17.16-4.12 12.74.87 23.08 5.76 31.02 14.67-11.1 6.74-16.53 16.08-16.31 28.02.22 9.44 3.86 17.38 10.92 23.8 4.24 3.91 9.07 6.73 14.5 8.47-2.61 7.72-5.87 15.42-9.78 23.11zm-32.06-118.82c0 6.84-2.45 13.41-7.34 19.7-5.76 7.28-12.93 11.45-21.52 12.5-1.09-1.95-1.63-4.24-1.63-6.85 0-6.63 2.72-13.26 8.15-19.89 2.82-3.48 6.3-6.3 10.43-8.48 4.13-2.17 7.93-3.37 11.41-3.59.33 2.18.5 4.38.5 6.61z" />
    </svg>
  );
}

function LinuxLogo({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Linux">
      <ellipse cx="36" cy="88" rx="14" ry="7" fill="#FFA500" />
      <ellipse cx="64" cy="88" rx="14" ry="7" fill="#FFA500" />
      <path d="M50 12 C32 12 30 32 30 50 C26 56 22 66 22 76 C22 84 32 86 50 86 C68 86 78 84 78 76 C78 66 74 56 70 50 C70 32 68 12 50 12 Z" fill="#1E232A" />
      <path d="M50 42 C38 42 34 56 34 70 C34 82 40 84 50 84 C60 84 66 82 66 70 C66 56 62 42 50 42 Z" fill="#FFFFFF" />
      <path d="M28 50 C20 54 18 68 22 74 C26 70 28 62 30 54 Z" fill="#1E232A" />
      <path d="M72 50 C80 54 82 68 78 74 C74 70 72 62 70 54 Z" fill="#1E232A" />
      <ellipse cx="44" cy="27" rx="3.5" ry="5.5" fill="#FFFFFF" />
      <ellipse cx="56" cy="27" rx="3.5" ry="5.5" fill="#FFFFFF" />
      <circle cx="45" cy="27" r="2" fill="#1E232A" />
      <circle cx="55" cy="27" r="2" fill="#1E232A" />
      <path d="M42 33 C42 31 58 31 58 33 C58 40 54 44 50 44 C46 44 42 40 42 33 Z" fill="#FFA500" />
    </svg>
  );
}

/* ── MODULAR SOFTWARE DATA SCHEMA ── */

export interface DownloadFile {
  id: string;
  name: string;
  label: string;
  type: string;
  ext: string;
}

export interface PlatformOption {
  os: 'windows' | 'macos' | 'linux';
  title: string;
  badge: string;
  requirements: string;
  description: string;
  primaryFile: DownloadFile;
  altFiles: DownloadFile[];
  features: string[];
  installSteps: string[];
}

export interface SoftwareApp {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  version: string;
  releaseDate: string;
  author: string;
  iconSrc: string;
  status: 'active' | 'coming_soon';
  githubRepo?: string;
  platforms: PlatformOption[];
  systemSpecs: {
    os: string;
    ram: string;
    storage: string;
    graphics: string;
  };
  highlights: {
    iconName: 'lock' | 'zap' | 'cpu' | 'layers';
    title: string;
    desc: string;
  }[];
  shaCommand?: string;
  shaFileUrl?: string;
}

/* ── EXTENSIBLE APPLICATION CATALOG ── */

const SOFTWARE_CATALOG: SoftwareApp[] = [
  {
    id: 'lutapdf',
    name: 'LutaPDF',
    category: 'Document & Engineering',
    tagline: 'High-Performance Native PDF Workbench',
    description:
      'The ultra-fast, native desktop PDF editor engineered in Rust. 100% offline document processing, zero telemetry, and hardware-accelerated rendering.',
    version: '0.7.1',
    releaseDate: 'October 2026',
    author: 'Eng.Luta',
    iconSrc: '/brand/lutapdf-icon.png',
    status: 'active',
    githubRepo: 'https://github.com/englutandula/LutaPDF',
    shaCommand: 'curl -sSL https://github.com/englutandula/LutaPDF/releases/latest/download/SHA256SUMS.txt | sha256sum -c --ignore-missing',
    shaFileUrl: 'https://github.com/englutandula/LutaPDF/releases/latest/download/SHA256SUMS.txt',
    systemSpecs: {
      os: 'Windows 10/11 (64-bit), macOS 11+, or Linux glibc 2.31+',
      ram: '512 MB minimum (2 GB recommended)',
      storage: '120 MB free space',
      graphics: 'DirectX 12, Metal, or Vulkan hardware graphics',
    },
    highlights: [
      {
        iconName: 'lock',
        title: '100% Offline & Private',
        desc: 'Zero telemetry, no cloud dependencies, and uncompromising local privacy.',
      },
      {
        iconName: 'zap',
        title: 'Pure Rust Speed',
        desc: 'Sub-millisecond page rendering and low memory footprint powered by safe Rust.',
      },
      {
        iconName: 'cpu',
        title: 'WGPU GPU Engine',
        desc: 'Hardware accelerated zooming, canvas panning, and fluid vector typography.',
      },
      {
        iconName: 'layers',
        title: 'Full PDF Toolkit',
        desc: 'Read, annotate, merge, split, redact, reorder, sign, and export documents.',
      },
    ],
    platforms: [
      {
        os: 'windows',
        title: 'Windows',
        badge: 'Windows 10 / 11 (64-bit)',
        requirements: 'x86_64 architecture',
        description: 'Native high-performance desktop application with shell integration, dark mode, and zero external runtime dependencies.',
        primaryFile: {
          id: 'windows-msi',
          name: 'LutaPDF-windows-x64.msi',
          label: 'Download Windows Installer',
          type: 'MSI Package',
          ext: '.msi',
        },
        altFiles: [
          {
            id: 'windows-zip',
            name: 'LutaPDF-windows-x64-portable.zip',
            label: 'Portable ZIP (Standalone)',
            type: 'ZIP Archive',
            ext: '.zip',
          },
        ],
        features: [
          'Instant startup with WGPU graphics acceleration',
          'Offline document processing & digital signatures',
          'Full WiX MSI installer with Start Menu integration',
        ],
        installSteps: [
          'Locate the downloaded LutaPDF-windows-x64.msi in your Downloads folder.',
          'Double-click the installer and follow the standard setup wizard.',
          'If Windows SmartScreen prompts, click "More info" then "Run anyway".',
          'Launch LutaPDF from your Start Menu or Desktop shortcut.',
        ],
      },
      {
        os: 'macos',
        title: 'macOS',
        badge: 'Universal (Apple Silicon & Intel)',
        requirements: 'macOS 11 Big Sur or newer',
        description: 'Built natively for Apple Silicon (M1/M2/M3/M4) and Intel Macs with hardware-accelerated rendering and smooth typography.',
        primaryFile: {
          id: 'macos-dmg',
          name: 'LutaPDF-macos-universal.dmg',
          label: 'Download Apple Disk Image',
          type: 'Universal DMG',
          ext: '.dmg',
        },
        altFiles: [
          {
            id: 'macos-cli',
            name: 'LutaPDF-cli-macos-universal.zip',
            label: 'Headless CLI Tool for Mac',
            type: 'CLI Binary',
            ext: '.zip',
          },
        ],
        features: [
          'Universal ARM64 & x86_64 single binary',
          'Sandboxed & offline-first privacy guarantee',
          'Drag-and-drop to Applications folder installation',
        ],
        installSteps: [
          'Open the downloaded LutaPDF-macos-universal.dmg disk image.',
          'Drag the LutaPDF icon into your Applications folder.',
          'On first launch, right-click LutaPDF in Applications and select "Open" to approve Gatekeeper.',
          'Enjoy ultra-fast offline PDF editing.',
        ],
      },
      {
        os: 'linux',
        title: 'Linux',
        badge: 'Debian, Ubuntu, Fedora, Arch & Generic',
        requirements: 'glibc 2.31+ (x86_64)',
        description: 'Lightweight, dependency-free binary with native desktop entries, Wayland & X11 support, and headless CLI capabilities.',
        primaryFile: {
          id: 'linux-deb',
          name: 'LutaPDF-linux-x86_64.deb',
          label: 'Download Debian / Ubuntu',
          type: 'DEB Package',
          ext: '.deb',
        },
        altFiles: [
          {
            id: 'linux-rpm',
            name: 'LutaPDF-linux-x86_64.rpm',
            label: 'Fedora / openSUSE / RHEL',
            type: 'RPM Package',
            ext: '.rpm',
          },
          {
            id: 'linux-tar',
            name: 'LutaPDF-linux-x86_64.tar.gz',
            label: 'Standalone Tarball (All Distros)',
            type: 'Tarball',
            ext: '.tar.gz',
          },
          {
            id: 'linux-cli',
            name: 'LutaPDF-cli-linux-x86_64.tar.gz',
            label: 'CLI-only Archive (Server / Headless)',
            type: 'CLI Archive',
            ext: '.tar.gz',
          },
        ],
        features: [
          'Desktop entry and system MIME associations included',
          'Pure Rust engine — zero external C library bloat',
          'Native Wayland and X11 windowing support',
        ],
        installSteps: [
          'For Ubuntu/Debian: run sudo apt install ./LutaPDF-linux-x86_64.deb',
          'For Fedora/RHEL: run sudo dnf install ./LutaPDF-linux-x86_64.rpm',
          'For Tarball: extract and execute ./bin/lutapdf directly.',
        ],
      },
    ],
  },
  {
    id: 'lutastudio',
    name: 'LutaStudio',
    category: 'Intelligence & Dev',
    tagline: 'Autonomous AI Orchestration & Development Workspace',
    description: 'Next-generation AI agents, multi-model execution environment, and intelligent developer automation workbench.',
    version: '0.1.0-preview',
    releaseDate: 'Coming Q4 2026',
    author: 'Eng.Luta',
    iconSrc: '/icon-512.png',
    status: 'coming_soon',
    systemSpecs: {
      os: 'Cross-platform Windows, macOS, Linux',
      ram: '4 GB minimum',
      storage: '500 MB',
      graphics: 'Hardware accelerated UI',
    },
    highlights: [],
    platforms: [],
  },
  {
    id: 'lutareplay',
    name: 'LutaReplay',
    category: 'FinTech & Simulation',
    tagline: 'High-Precision Tick-by-Tick Financial Market Replay',
    description: 'Sub-millisecond historical chart bar simulation engine with order-book depth and automated strategy backtesting.',
    version: '0.2.0-beta',
    releaseDate: 'Coming Q4 2026',
    author: 'Eng.Luta',
    iconSrc: '/android-chrome-512x512.png',
    status: 'coming_soon',
    systemSpecs: {
      os: 'macOS, Windows 10/11, Linux',
      ram: '8 GB recommended',
      storage: '2 GB for tick cache',
      graphics: 'DirectX 12 / Metal graphics',
    },
    highlights: [],
    platforms: [],
  },
];

export default function DownloadPage() {
  const [selectedAppId, setSelectedAppId] = useState<string>('lutapdf');
  const [detectedOs, setDetectedOs] = useState<'windows' | 'macos' | 'linux'>('windows');
  const [copiedVerify, setCopiedVerify] = useState(false);
  const [activeTab, setActiveTab] = useState<'download' | 'specs'>('download');
  const [downloadModal, setDownloadModal] = useState<{
    open: boolean;
    fileName: string;
    fileId: string;
    appName: string;
    os: 'windows' | 'macos' | 'linux';
    steps: string[];
  } | null>(null);

  const currentApp = SOFTWARE_CATALOG.find((app) => app.id === selectedAppId) || SOFTWARE_CATALOG[0];

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

  const triggerDownload = (
    fileName: string,
    fileId: string,
    os: 'windows' | 'macos' | 'linux',
    steps: string[],
    appName: string
  ) => {
    const downloadUrl = `https://github.com/englutandula/LutaPDF/releases/latest/download/${encodeURIComponent(fileName)}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
      } catch {}
    }, 1000);

    setDownloadModal({
      open: true,
      fileName,
      fileId,
      appName,
      os,
      steps,
    });
  };

  const handleCopyVerify = (command: string) => {
    navigator.clipboard.writeText(command);
    setCopiedVerify(true);
    setTimeout(() => setCopiedVerify(false), 2500);
  };

  const detectedPlatform =
    currentApp.platforms.find((p) => p.os === detectedOs) || currentApp.platforms[0] || null;

  return (
    <div className="min-h-screen bg-[rgb(var(--lt-bg))] text-[rgb(var(--lt-text))] py-10 md:py-16 transition-colors duration-200">
      <div className="lt-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 1. MODULAR APPLICATION SWITCHER BAR ── */}
        <div className="flex items-center justify-between border-b lt-border-color pb-5 mb-10 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] mr-2">
              Software Hub
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color">
              {SOFTWARE_CATALOG.map((app) => {
                const isActive = app.id === selectedAppId;
                return (
                  <button
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[rgb(var(--lt-surface))] text-[rgb(var(--lt-text))] shadow-sm border lt-border-color'
                        : 'text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))]'
                    }`}
                  >
                    <span>{app.name}</span>
                    {app.status === 'active' ? (
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ) : (
                      <span className="text-[10px] opacity-60">Soon</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[rgb(var(--lt-text-muted))]">
            <span>Architected &amp; Built by <strong className="text-[rgb(var(--lt-text))]">{currentApp.author}</strong></span>
            {currentApp.githubRepo && (
              <a
                href={currentApp.githubRepo}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[rgb(var(--lt-primary))] hover:underline font-medium"
              >
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        {/* ── 2. ACTIVE APPLICATION HERO BANNER ── */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[rgb(var(--lt-primary)/0.2)] to-[rgb(var(--lt-primary)/0.4)] blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
              <img
                src={currentApp.iconSrc}
                alt={`${currentApp.name} icon`}
                className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl shadow-xl object-contain border lt-border-color bg-[#090B10]"
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2.5 mb-3 flex-wrap">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[rgb(var(--lt-text))]">
              Download {currentApp.name}
            </h1>
            <span className="rounded-full bg-[rgb(var(--lt-surface-2))] border lt-border-color px-3 py-1 text-xs font-semibold text-[rgb(var(--lt-text-muted))]">
              v{currentApp.version}
            </span>
          </div>

          <p className="text-sm sm:text-base font-medium text-[rgb(var(--lt-primary))] mb-3">
            {currentApp.tagline}
          </p>

          <p className="text-sm sm:text-base text-[rgb(var(--lt-text-muted))] leading-relaxed max-w-2xl mx-auto mb-8">
            {currentApp.description}
          </p>

          {/* Quick Detected OS Download Button */}
          {currentApp.status === 'active' && detectedPlatform && (
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 p-2 rounded-2xl bg-[rgb(var(--lt-surface))] border lt-border-color shadow-md max-w-xl mx-auto">
              <button
                onClick={() =>
                  triggerDownload(
                    detectedPlatform.primaryFile.name,
                    detectedPlatform.primaryFile.id,
                    detectedPlatform.os,
                    detectedPlatform.installSteps,
                    currentApp.name
                  )
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-[rgb(var(--lt-primary))] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Download className="h-5 w-5" />
                <span>Download for {detectedPlatform.title}</span>
              </button>
              <div className="text-left px-3 py-1">
                <span className="block text-xs font-bold text-[rgb(var(--lt-text))]">
                  Auto-detected {detectedPlatform.title}
                </span>
                <span className="block text-[11px] text-[rgb(var(--lt-text-muted))]">
                  {detectedPlatform.badge}
                </span>
              </div>
            </div>
          )}

          {currentApp.status === 'coming_soon' && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color px-6 py-3 text-sm font-semibold text-[rgb(var(--lt-text-muted))]">
              <Clock className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
              <span>{currentApp.name} is currently in development. Public release arriving soon.</span>
            </div>
          )}
        </div>

        {/* ── 3. THREE PLATFORM CARDS WITH AUTHENTIC LOGOS ── */}
        {currentApp.status === 'active' && currentApp.platforms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            {currentApp.platforms.map((platform) => {
              const isDetected = platform.os === detectedOs;
              return (
                <div
                  key={platform.os}
                  className={`flex flex-col justify-between rounded-2xl border bg-[rgb(var(--lt-surface))] p-7 shadow-sm transition-all hover:shadow-lg relative overflow-hidden ${
                    isDetected
                      ? 'border-[rgb(var(--lt-primary))] ring-2 ring-[rgb(var(--lt-primary)/0.2)]'
                      : 'lt-border-color'
                  }`}
                >
                  {isDetected && (
                    <div className="absolute top-0 right-0 bg-[rgb(var(--lt-primary))] text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                      Current OS
                    </div>
                  )}

                  <div>
                    {/* Authentic Vector Logo Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--lt-surface-2))] border lt-border-color shadow-inner p-3">
                        {platform.os === 'windows' && <WindowsLogo className="h-8 w-8" />}
                        {platform.os === 'macos' && <AppleLogo className="h-8 w-8 text-[rgb(var(--lt-text))]" />}
                        {platform.os === 'linux' && <LinuxLogo className="h-9 w-9" />}
                      </div>
                      <div>
                        <h2 className="text-2xl font-extrabold text-[rgb(var(--lt-text))] leading-none mb-1">
                          {platform.title}
                        </h2>
                        <span className="text-xs font-semibold text-[rgb(var(--lt-primary))]">
                          {platform.badge}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed mb-6">
                      {platform.description}
                    </p>

                    {/* Features list */}
                    <ul className="space-y-2.5 mb-6">
                      {platform.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-[rgb(var(--lt-text))]">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Area */}
                  <div className="pt-5 border-t lt-border-color space-y-3">
                    <button
                      onClick={() =>
                        triggerDownload(
                          platform.primaryFile.name,
                          platform.primaryFile.id,
                          platform.os,
                          platform.installSteps,
                          currentApp.name
                        )
                      }
                      className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[rgb(var(--lt-primary))] px-4 py-3.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-all hover:opacity-95 hover:shadow cursor-pointer"
                    >
                      <Download className="h-4 w-4" />
                      <span>{platform.primaryFile.label}</span>
                    </button>

                    {/* Additional package formats */}
                    {platform.altFiles.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="block text-[11px] font-bold text-[rgb(var(--lt-text-muted))] uppercase tracking-wider">
                          Other Packages &amp; Formats
                        </span>
                        {platform.altFiles.map((alt) => (
                          <button
                            key={alt.id}
                            onClick={() =>
                              triggerDownload(
                                alt.name,
                                alt.id,
                                platform.os,
                                platform.installSteps,
                                currentApp.name
                              )
                            }
                            className="flex w-full items-center justify-between rounded-lg border lt-border-color bg-[rgb(var(--lt-surface-2))] px-3 py-2 text-xs text-[rgb(var(--lt-text))] transition-colors hover:border-[rgb(var(--lt-primary))] hover:text-[rgb(var(--lt-primary))] cursor-pointer text-left"
                          >
                            <span className="truncate font-medium">{alt.label}</span>
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
        )}

        {/* ── 4. TECHNICAL SPECIFICATIONS & CRYPTOGRAPHIC INTEGRITY ── */}
        {currentApp.status === 'active' && (
          <div className="rounded-2xl border lt-border-color bg-[rgb(var(--lt-surface))] p-8 md:p-10 mb-16 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b lt-border-color">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[rgb(var(--lt-text))]">Verified Package Integrity</h3>
                  <p className="text-xs text-[rgb(var(--lt-text-muted))]">
                    Every executable is cryptographically verified with SHA-256 signatures before release.
                  </p>
                </div>
              </div>

              {currentApp.shaFileUrl && (
                <a
                  href={currentApp.shaFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border lt-border-color bg-[rgb(var(--lt-surface-2))] px-4 py-2.5 text-xs font-semibold text-[rgb(var(--lt-text))] transition-colors hover:border-[rgb(var(--lt-primary))]"
                >
                  <span>Download SHA256SUMS.txt</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {currentApp.shaCommand && (
              <div className="pt-6">
                <label className="block text-xs font-bold text-[rgb(var(--lt-text-muted))] uppercase tracking-wider mb-2">
                  Verify Release Hash in Terminal
                </label>
                <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-bg))] p-4 font-mono text-xs text-[rgb(var(--lt-text))] flex items-center justify-between gap-4 overflow-x-auto">
                  <code className="text-xs text-[rgb(var(--lt-text))] select-all">
                    {currentApp.shaCommand}
                  </code>
                  <button
                    onClick={() => handleCopyVerify(currentApp.shaCommand!)}
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
            )}

            {/* System Requirements Table */}
            <div className="mt-8 pt-6 border-t lt-border-color">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] mb-4">
                Recommended System Specifications
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color">
                  <span className="block text-[11px] font-medium text-[rgb(var(--lt-text-muted))]">Supported OS</span>
                  <span className="font-semibold text-[rgb(var(--lt-text))] mt-0.5 block">{currentApp.systemSpecs.os}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color">
                  <span className="block text-[11px] font-medium text-[rgb(var(--lt-text-muted))]">System Memory</span>
                  <span className="font-semibold text-[rgb(var(--lt-text))] mt-0.5 block">{currentApp.systemSpecs.ram}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color">
                  <span className="block text-[11px] font-medium text-[rgb(var(--lt-text-muted))]">Disk Space</span>
                  <span className="font-semibold text-[rgb(var(--lt-text))] mt-0.5 block">{currentApp.systemSpecs.storage}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[rgb(var(--lt-surface-2))] border lt-border-color">
                  <span className="block text-[11px] font-medium text-[rgb(var(--lt-text-muted))]">GPU Acceleration</span>
                  <span className="font-semibold text-[rgb(var(--lt-text))] mt-0.5 block">{currentApp.systemSpecs.graphics}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. ALL APPLICATIONS IN LUTATECH SUITE (EXTENSIBILITY SHOWCASE) ── */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <div>
              <h3 className="text-xl font-extrabold text-[rgb(var(--lt-text))]">
                LutaTech Software Ecosystem
              </h3>
              <p className="text-xs text-[rgb(var(--lt-text-muted))]">
                Explore native applications and intelligent tools engineered by Eng.Luta.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOFTWARE_CATALOG.map((app) => {
              const isCurrent = app.id === selectedAppId;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`flex flex-col justify-between p-6 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-[rgb(var(--lt-surface))] border-[rgb(var(--lt-primary))] ring-1 ring-[rgb(var(--lt-primary)/0.3)] shadow-md'
                      : 'bg-[rgb(var(--lt-surface))] lt-border-color hover:border-[rgb(var(--lt-border-strong))] hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={app.iconSrc}
                      alt={app.name}
                      className="h-12 w-12 rounded-xl object-contain border lt-border-color bg-[#090B10] p-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-[rgb(var(--lt-text))]">{app.name}</h4>
                        {app.status === 'active' ? (
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                            v{app.version}
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                            Soon
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-[rgb(var(--lt-primary))] block">
                        {app.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed mb-4 line-clamp-2">
                    {app.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-semibold text-[rgb(var(--lt-primary))] pt-3 border-t lt-border-color">
                    <span>{isCurrent ? 'Viewing Downloads' : 'Select Application'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 6. ARCHITECTURAL PILLARS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 shadow-sm">
            <Lock className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">100% Offline</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              No telemetry, no analytics tracking, and no external network calls during document editing.
            </p>
          </div>

          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 shadow-sm">
            <Zap className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">Rust Performance</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              Sub-millisecond page rendering and ultra-low RAM consumption even with large 1,000+ page documents.
            </p>
          </div>

          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 shadow-sm">
            <Cpu className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">Native GPU Engine</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              Hardware accelerated zooming and fluid canvas scrolling powered directly by WGPU shaders.
            </p>
          </div>

          <div className="rounded-xl border lt-border-color bg-[rgb(var(--lt-surface))] p-6 shadow-sm">
            <Layers className="h-6 w-6 text-[rgb(var(--lt-primary))] mb-3" />
            <h4 className="text-base font-bold text-[rgb(var(--lt-text))] mb-1">Open Source</h4>
            <p className="text-xs text-[rgb(var(--lt-text-muted))] leading-relaxed">
              Dual-licensed under MIT and Apache-2.0. Clean-room, specification-grounded architecture.
            </p>
          </div>
        </div>

      </div>

      {/* ── 7. INTERACTIVE DOWNLOAD SUCCESS & INSTALLATION MODAL ── */}
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
                {downloadModal.os.toUpperCase()} Installation Instructions
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
                  href={`https://github.com/englutandula/LutaPDF/releases/latest/download/${encodeURIComponent(downloadModal.fileName)}`}
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
