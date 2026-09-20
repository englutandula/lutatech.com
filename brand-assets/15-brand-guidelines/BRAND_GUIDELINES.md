# LutaTech Brand Identity & Design System
**Version 2.0 • Universal Specification**

---

## 1. Brand Essence
- **Brand Name**: LutaTech (or Luta Tech)
- **Primary Domain**: [lutatech.com](https://lutatech.com)
- **Tagline**: Fast, Private, Modern Digital Tools Platform
- **Core Value Proposition**: Powerful, browser-native tools for images, documents, utilities, and AI with absolute privacy.

---

## 2. Logo Mark Anatomy & Geometry
The LutaTech icon is constructed on mathematical equilateral 60.25° chevron geometry:
- **Upper Chevron**: An upward-pointing arrow/roof representing ascension, speed, and technical excellence.
- **Lower Central Triangle**: A stable base representing reliability, security, and foundation.
- **Negative White Groove**: Constant uniform negative space providing crisp visual rhythm and distinction at all resolutions.

```
                 ▲ Top Apex
                / \
               /   \  <- Outer Chevron
              / / \ \
             / /   \ \
            / / ▲   \ \
           /_/ /_\   \_\  <- Baseline
```

---

## 3. Logo Color Arrangements & Strict Rules
1. **Single Unified Color Rule**: Whenever the icon and text appear together, they MUST share the exact same color.
2. **Light Theme Logo (Light Backgrounds)**: Both icon and text are **FULLY Brand Coral Red (`#FF5758`)**.
3. **Dark Theme Logo (Dark Backgrounds)**: Both icon and text are **Pure White (`#FFFFFF`)**.
4. **Monochrome Black**: Both icon and text are pure black (`#000000`) for single-color print / monochrome documents.
5. **Monochrome White**: Both icon and text are pure white (`#FFFFFF`).
6. **Height Uniformity**: The icon mark height is strictly uniform with the text cap-height (`56px`) with aligned baselines.

---

## 4. Minimum Clear Space & Sizing
- **Minimum Clear Space**: Equal to half the width of the icon mark on all four sides.
- **Minimum Digital Size**:
  - Horizontal Logo: 80px width
  - Icon Only: 16px width
- **Minimum Print Size**:
  - Horizontal Logo: 20mm
  - Icon: 6mm

---

## 5. Color Palette
| Token | Name | HEX | RGB | Use Case |
|---|---|---|---|---|
| **Primary** | Luta Coral Red | `#FF5758` | 255, 87, 88 | Main brand accent, icon, primary buttons |
| **Primary Dark** | Coral Deep | `#E03E3F` | 224, 62, 63 | Hover, active buttons, dark gradients |
| **Dark BG** | Obsidian Deep | `#090B10` | 9, 11, 16 | Dark mode canvas background |
| **Dark Surface** | Slate Night | `#121620` | 18, 22, 32 | Cards, modals, sidebars |
| **Light BG** | Clean White | `#FFFFFF` | 255, 255, 255 | Light mode background |
| **Light Text** | Slate Midnight | `#0F172A` | 15, 23, 42 | High contrast text on light bg |

---

## 6. Directory Structure
All generated master assets follow the standardized specification:
```
brand-assets/
├── 01-logo/
│   ├── primary/ (SVG, PNG 512, 1024, 2048)
│   ├── horizontal/ (SVG, PNG)
│   ├── stacked/ (SVG, PNG)
│   ├── icon/ (SVG, PNG 128 to 2048)
│   ├── light/
│   ├── dark/
│   └── monochrome/
├── 02-favicon/ (favicon.svg, PNGs, apple-touch-icon)
├── 03-app-icons/
│   ├── android/ (mipmaps, adaptive foreground/background, notification)
│   └── ios/ (AppIcon all sizes up to 1024)
├── 04-social/ (profiles, headers, OG image, Twitter card)
├── 05-patterns/
├── 06-backgrounds/
├── 07-icons/ (UI vector suite)
├── 08-illustrations/
├── 09-images/ (Store graphics, banners)
├── 10-colors/ (palette.json, colors.css)
├── 11-typography/ (typography.json, typography.css)
├── 12-screenshots/
├── 13-print/
├── 14-presentations/
└── 15-brand-guidelines/
```
