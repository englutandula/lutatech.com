'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Globe,
  FileText,
  Wifi,
  Mail,
  Phone,
  MessageSquare,
  User,
  Sparkles,
  Sliders,
  Eye,
  RefreshCw,
} from 'lucide-react';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';
import { recordToolUsage } from '@/lib/toolRanking';

type QRType = 'url' | 'text' | 'wifi' | 'email' | 'phone' | 'sms' | 'vcard';

export default function QrCodeGeneratorPage() {
  const tool = getTool('qr-code-generator') || {
    slug: 'qr-code-generator',
    name: 'QR Code Generator',
    shortName: 'QR Code',
    category: 'Utility' as const,
    icon: 'QrCode',
    accent: 'violet',
    status: 'live' as const,
    description: 'Create custom QR codes for links, text, or contact info.',
    longDescription:
      'Generate professional, custom QR codes for URLs, WiFi credentials, contact vCards, emails, and SMS. Customize colors, error correction, and download high-resolution PNG or vector SVG files instantly.',
  };

  const [activeType, setActiveType] = useState<QRType>('url');

  // Input states
  const [url, setUrl] = useState('https://lutatech.com');
  const [text, setText] = useState('Hello from LutaTech!');

  // WiFi state
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);

  // Email state
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone / SMS state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // vCard state
  const [vcardFirst, setVcardFirst] = useState('');
  const [vcardLast, setVcardLast] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardTitle, setVcardTitle] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardUrl, setVcardUrl] = useState('');

  // Customization
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [ecLevel, setEcLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [margin, setMargin] = useState(2);
  const [size, setSize] = useState(512);

  // Output
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    recordToolUsage('qr-code-generator');
  }, []);

  // Compute raw payload string based on type
  const payload = React.useMemo(() => {
    switch (activeType) {
      case 'url':
        return url.trim();
      case 'text':
        return text;
      case 'wifi': {
        const enc = wifiEncryption === 'nopass' ? '' : wifiEncryption;
        return `WIFI:S:${wifiSsid};T:${enc};P:${wifiPassword};H:${wifiHidden ? 'true' : 'false'};;`;
      }
      case 'email': {
        const params = new URLSearchParams();
        if (emailSubject) params.set('subject', emailSubject);
        if (emailBody) params.set('body', emailBody);
        const query = params.toString() ? `?${params.toString()}` : '';
        return `mailto:${emailTo}${query}`;
      }
      case 'phone':
        return `tel:${phoneNumber.replace(/\s+/g, '')}`;
      case 'sms': {
        return `sms:${phoneNumber.replace(/\s+/g, '')}?body=${encodeURIComponent(smsMessage)}`;
      }
      case 'vcard': {
        return `BEGIN:VCARD
VERSION:3.0
N:${vcardLast};${vcardFirst};;;
FN:${vcardFirst} ${vcardLast}
ORG:${vcardOrg}
TITLE:${vcardTitle}
TEL:${vcardPhone}
EMAIL:${vcardEmail}
URL:${vcardUrl}
END:VCARD`;
      }
      default:
        return url;
    }
  }, [
    activeType,
    url,
    text,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    emailTo,
    emailSubject,
    emailBody,
    phoneNumber,
    smsMessage,
    vcardFirst,
    vcardLast,
    vcardOrg,
    vcardTitle,
    vcardPhone,
    vcardEmail,
    vcardUrl,
  ]);

  // Generate QR code whenever payload or options change
  useEffect(() => {
    if (!payload.trim()) {
      setQrDataUrl('');
      setQrSvg('');
      return;
    }

    const options: QRCode.QRCodeToDataURLOptions = {
      errorCorrectionLevel: ecLevel,
      margin: margin,
      width: size,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    };

    QRCode.toDataURL(payload, options)
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.error('QR generation error:', err);
      });

    QRCode.toString(payload, { ...options, type: 'svg' })
      .then((svg) => {
        setQrSvg(svg);
      })
      .catch((err) => {
        console.error('QR SVG generation error:', err);
      });
  }, [payload, fgColor, bgColor, ecLevel, margin, size]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qrcode-${activeType}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${activeType}-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      // Fallback: copy payload text
      navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const typeTabs = [
    { id: 'url', label: 'URL', icon: Globe },
    { id: 'text', label: 'Text', icon: FileText },
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'phone', label: 'Phone', icon: Phone },
    { id: 'sms', label: 'SMS', icon: MessageSquare },
    { id: 'vcard', label: 'vCard', icon: User },
  ];

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lt-fade-up">
        {/* Left Column: Form & Settings */}
        <div className="lg:col-span-7 space-y-6">
          {/* QR Type Selection */}
          <div className="lt-card rounded-3xl p-5 sm:p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] mb-3">
              1. Select QR Code Type
            </h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {typeTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveType(tab.id as QRType)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      isActive
                        ? 'border-[rgb(var(--lt-primary))] bg-[rgb(var(--lt-primary)/0.08)] text-[rgb(var(--lt-primary))] shadow-xs'
                        : 'border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] text-[rgb(var(--lt-text-muted))] hover:text-[rgb(var(--lt-text))] hover:bg-[rgb(var(--lt-surface-3))]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Inputs Based on Type */}
            <div className="mt-5 space-y-4 pt-5 border-t border-[rgb(var(--lt-border))]">
              {activeType === 'url' && (
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="lt-input"
                  />
                </div>
              )}

              {activeType === 'text' && (
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">
                    Plain Text Message
                  </label>
                  <textarea
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter any text here..."
                    className="lt-input"
                  />
                </div>
              )}

              {activeType === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWiFi"
                      className="lt-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Password</label>
                    <input
                      type="text"
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      placeholder="WiFiPassword123"
                      className="lt-input"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Security</label>
                      <select
                        value={wifiEncryption}
                        onChange={(e) => setWifiEncryption(e.target.value as any)}
                        className="lt-input cursor-pointer"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None (Open)</option>
                      </select>
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="inline-flex items-center gap-2 text-xs font-semibold text-[rgb(var(--lt-text))] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wifiHidden}
                          onChange={(e) => setWifiHidden(e.target.checked)}
                          className="rounded border-[rgb(var(--lt-border))] text-[rgb(var(--lt-primary))] focus:ring-0"
                        />
                        Hidden Network
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeType === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="hello@example.com"
                      className="lt-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Inquiry from QR Code"
                      className="lt-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Body</label>
                    <textarea
                      rows={3}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Write your email body..."
                      className="lt-input"
                    />
                  </div>
                </div>
              )}

              {activeType === 'phone' && (
                <div>
                  <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="lt-input"
                  />
                </div>
              )}

              {activeType === 'sms' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="lt-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">Message</label>
                    <textarea
                      rows={3}
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      placeholder="Pre-filled SMS text..."
                      className="lt-input"
                    />
                  </div>
                </div>
              )}

              {activeType === 'vcard' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1">First Name</label>
                      <input
                        type="text"
                        value={vcardFirst}
                        onChange={(e) => setVcardFirst(e.target.value)}
                        placeholder="Jane"
                        className="lt-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1">Last Name</label>
                      <input
                        type="text"
                        value={vcardLast}
                        onChange={(e) => setVcardLast(e.target.value)}
                        placeholder="Doe"
                        className="lt-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1">Organization</label>
                      <input
                        type="text"
                        value={vcardOrg}
                        onChange={(e) => setVcardOrg(e.target.value)}
                        placeholder="Company Ltd"
                        className="lt-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1">Job Title</label>
                      <input
                        type="text"
                        value={vcardTitle}
                        onChange={(e) => setVcardTitle(e.target.value)}
                        placeholder="Lead Engineer"
                        className="lt-input"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1">Phone</label>
                      <input
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        placeholder="+1 555 123 4567"
                        className="lt-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1">Email</label>
                      <input
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="lt-input"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customization Options */}
          <div className="lt-card rounded-3xl p-5 sm:p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[rgb(var(--lt-text-muted))] mb-4 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
              2. Design & Styling
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foreground Color */}
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">
                  Foreground Color (QR Modules)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-12 rounded-xl border border-[rgb(var(--lt-border))] cursor-pointer p-1 bg-transparent"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="lt-input font-mono uppercase text-xs"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-12 rounded-xl border border-[rgb(var(--lt-border))] cursor-pointer p-1 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="lt-input font-mono uppercase text-xs"
                  />
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">
                  Error Correction Level
                </label>
                <select
                  value={ecLevel}
                  onChange={(e) => setEcLevel(e.target.value as any)}
                  className="lt-input text-xs cursor-pointer"
                >
                  <option value="L">Low (~7% recovery)</option>
                  <option value="M">Medium (~15% recovery)</option>
                  <option value="Q">Quartile (~25% recovery)</option>
                  <option value="H">High (~30% recovery)</option>
                </select>
              </div>

              {/* Export Size */}
              <div>
                <label className="block text-xs font-semibold text-[rgb(var(--lt-text))] mb-1.5">
                  Export Resolution
                </label>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="lt-input text-xs cursor-pointer"
                >
                  <option value={256}>256 × 256 px (Web)</option>
                  <option value={512}>512 × 512 px (Standard HD)</option>
                  <option value={1024}>1024 × 1024 px (High Quality)</option>
                  <option value={2048}>2048 × 2048 px (Print 300 DPI)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="lt-card rounded-3xl p-6 border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface))] shadow-lg shadow-black/[0.02] text-center sticky top-24">
            <h2 className="text-base font-bold text-[rgb(var(--lt-text))] mb-4 flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4 text-[rgb(var(--lt-primary))]" />
              Live QR Preview
            </h2>

            {/* QR Code Container */}
            <div className="mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-3xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] p-4 flex items-center justify-center shadow-inner relative overflow-hidden">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Generated QR Code"
                  className="w-full h-full object-contain rounded-xl shadow-xs"
                />
              ) : (
                <div className="text-xs text-[rgb(var(--lt-text-muted))]">Enter content to generate QR code</div>
              )}
            </div>

            {/* Download Buttons */}
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!qrDataUrl}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[rgb(var(--lt-primary))] to-[rgb(var(--lt-primary-dark))] hover:opacity-95 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 active:scale-[0.99]"
              >
                <Download className="h-4 w-4" /> Download High-Res PNG
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  disabled={!qrSvg}
                  className="py-2 px-3 rounded-xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-[0.99]"
                >
                  <Download className="h-3.5 w-3.5" /> Vector SVG
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!qrDataUrl}
                  className="py-2 px-3 rounded-xl border border-[rgb(var(--lt-border))] bg-[rgb(var(--lt-surface-2))] hover:bg-[rgb(var(--lt-surface-3))] text-[rgb(var(--lt-text))] text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 active:scale-[0.99]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied!' : 'Copy Image'}
                </button>
              </div>
            </div>

            <p className="mt-4 text-[11px] text-[rgb(var(--lt-text-muted))] leading-relaxed">
              Scan with any mobile camera or QR reader. 100% private, processed client-side.
            </p>
          </div>
        </div>
      </div>
    </ToolPageShell>
  );
}
