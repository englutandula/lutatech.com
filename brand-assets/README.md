# LutaTech Universal Brand Identity Specification

## Overview
LutaTech delivers high-speed, private, browser-based digital utilities (image converters, AI background removers, passport photo makers, PDF utilities). The visual identity conveys precision, high performance, authority, and modern minimalism.

---

## 1. Master Brand Typography
- **Wordmark Typeface**: **Poppins 900** (Black / Ultra-Bold Geometric Sans-serif).
- **Geometry**:
  - Pure circular bowls for `a`, `e`, and `c`.
  - Exact stem thickness: `17.43px` matching the `L` and `T` vertical bars.
  - Baseline: Aligned at `y = 86`.
  - Cap-Height: `55.61px` (from `y = 30.39` to `y = 86`).
- **Heading Typeface**: Inter / Poppins Bold.
- **Body & UI Typeface**: Inter (400, 500, 600).

---

## 2. Master Icon Geometry (The Flat-Top Chevron)
- **Top Bar**: Flat horizontal bar (`x = 50` to `x = 70` at `y = 30.39`). **Zero sharp anchor corner**.
- **Footprint**: `64px` width (from `x = 28` to `x = 92`).
- **Height**: Strictly uniform with the cap-height of the wordmark (`55.61px`).
- **Thickness**: `17.43px`, matching the wordmark stems exactly.
- **Center Element**: Grounded geometric triangle (`M 60 68 L 71 86 L 49 86 Z`).

---

## 3. Brand Color System
| Token | Hex | Role |
| :--- | :--- | :--- |
| **Primary Brand Red** | `#EB1000` | Light theme logo, active states, key accents (Adobe-style Red) |
| **Pure White** | `#FFFFFF` | Dark theme logo, text, high-contrast dark surfaces |
| **Obsidian Black** | `#090B10` | Primary dark theme background |
| **Dark Surface** | `#121620` | Card backgrounds, navigation bars |
| **Dark Border** | `#232B3E` | Subtle borders and dividers |
| **Text Muted** | `#94A3B8` | Secondary descriptions, captions |

---

## 4. Uniformity Golden Rules
1. **Single Unified Color**:
   - In **Light Theme**: The icon and text MUST both be rendered in **#EB1000**.
   - In **Dark Theme**: The icon and text MUST both be rendered in **#FFFFFF**.
   - Icon and text must never be split into two conflicting colors when appearing side-by-side.
2. **Cap-Height Uniformity**: The icon height strictly equals the cap-height of the capital letters (55.61px) with shared baseline alignment.
3. **Flat Top Bar**: The chevron mark features a clean horizontal flat top without sharp anchor corners.

---

## 5. Directory Structure
```
brand/
├── logo/
│   ├── primary/         (Full color & white logos at 512, 1024, 2048px + SVG)
│   ├── horizontal/      (Horizontal layouts for headers & navbars)
│   ├── stacked/         (Centered layouts for badges & splash screens)
│   └── monochrome/     (Pure black and pure white variants)
├── icon/               (Standalone app icon marks from 16px to 2048px)
├── favicon/            (Browser favicons, favicon.ico, apple-touch-icon)
├── app-icon/
│   ├── android/        (Mipmaps mdpi through xxxhdpi, adaptive fg/bg, play store)
│   ├── ios/            (AppStore 1024px down to 20px spotlight/settings)
│   └── web/            (PWA icons 192x192, 512x512 + manifest.webmanifest)
├── social/
│   ├── profile/        (Avatars for Twitter, LinkedIn, YouTube, Instagram)
│   ├── covers/         (Twitter header 1500x500, LinkedIn 1584x396, YouTube 2560x1440)
│   └── sharing/        (OpenGraph 1200x630 & Twitter Card 1200x628)
├── patterns/           (Brand geometric patterns in SVG & PNG)
├── backgrounds/        (High-res 1080p branded desktop wallpapers)
├── illustrations/      (Branded 404, empty states)
├── colors/             (palette.json & colors.css variables)
├── typography/         (typography.json specification)
├── presentations/      (16:9 slide templates: Title slide & Content slide)
├── print/              (Business card, A4 letterhead, round stickers)
├── screenshots/        (Desktop and mobile platform previews)
└── brand-guidelines/   (BRAND_GUIDELINES.md)
```
