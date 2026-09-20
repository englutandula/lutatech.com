/**
 * LutaTech Universal Brand Asset Package Generator
 * Generates the complete brand asset system according to the Universal Website & App Brand Asset Specification.
 *
 * STRICT BRAND RULES:
 * 1. Whenever the icon and text appear together, they MUST share the EXACT SAME COLOR.
 *    - In light theme (light backgrounds): Icon and text are BOTH brand coral red (#FF5758).
 *    - In dark theme (dark backgrounds): Icon and text are BOTH pure white (#FFFFFF).
 *    - On monochrome versions: Icon and text are BOTH pure black (#000000) or pure white (#FFFFFF).
 * 2. Icon height is strictly UNIFORM with text cap-height and shares the baseline.
 * 3. All non-uniform, mismatched legacy assets are purged.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('../frontend/node_modules/sharp');

const ROOT_DIR = path.resolve(__dirname, '..');
const BRAND_DIR = path.join(ROOT_DIR, 'brand-assets');
const FRONTEND_PUBLIC_DIR = path.join(ROOT_DIR, 'frontend', 'public');

// --- BRAND DESIGN TOKENS ---
const BRAND = {
  name: 'LutaTech',
  legalName: 'LutaTech Digital Tools',
  tagline: 'Fast, Private, Modern Digital Tools Platform',
  colors: {
    primary: '#EB1000',       // Vibrant brand red matching Adobe reference
    primaryDark: '#C80C00',   // Deep red for gradients & active states
    primaryLight: '#FF4B3C',  // Light red tint
    primaryGlow: 'rgba(235, 16, 0, 0.25)',
    darkBg: '#090B10',        // Deep obsidian background
    darkSurface: '#121620',   // Card & elevated surface
    darkSurface2: '#1B2130',  // Muted dark surface
    darkBorder: '#232B3E',    // Dark border line
    darkText: '#FFFFFF',      // Pure white text & icon on dark surfaces
    darkMuted: '#94A3B8',     // Slate-400 muted text
    lightBg: '#FFFFFF',       // Pure white background
    lightSurface: '#F8FAFC',  // Subtle light surface
    lightSurface2: '#F1F5F9', // Muted light surface
    lightBorder: '#E2E8F0',   // Light border line
    lightText: '#EB1000',     // FULLY Brand Red #EB1000 on light backgrounds
    lightMuted: '#FF4B3C',    // Red tint muted text
    monoBlack: '#000000',
    monoWhite: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EB1000',
    info: '#3B82F6'
  }
};

// --- MATHEMATICAL MASTER GEOMETRY OF THE ICON ---
// Flat-top geometric chevron without sharp anchor corner:
// Normalized in 1000 x 1000 coordinate space with equilateral symmetry:
const ICON_PATH_CHEVRON = 'M 344 0 L 656 0 L 1000 1000 L 728 1000 L 586 297 L 414 297 L 272 1000 L 0 1000 Z';
const ICON_PATH_TRIANGLE = 'M 500 676 L 672 1000 L 328 1000 Z';

// Pure Poppins 900 vector path for 'LutaTech' (baseline y=86, cap-height 55.61px)
const WORDMARK_PATH_HORIZONTAL = 'M139.36 30.39L139.36 72.81L156.17 72.81L156.17 86L121.93 86L121.93 30.39L139.36 30.39M188.77 41.70L206.20 41.70L206.20 86L188.77 86L188.77 79.25Q186.72 82.39 183.31 84.35Q179.89 86.31 175.18 86.31Q167.56 86.31 163.28 81.21Q159 76.10 159 67.39L159 41.70L176.36 41.70L176.36 65.19Q176.36 68.33 178.04 70.17Q179.73 72.02 182.56 72.02Q185.47 72.02 187.12 70.17Q188.77 68.33 188.77 65.19L188.77 41.70M235.11 71.16L239.27 71.16L239.27 86L232.67 86Q214.45 86 214.45 67.86L214.45 56.23L208.95 56.23L208.95 41.70L214.45 41.70L214.45 31.02L231.88 31.02L231.88 41.70L239.11 41.70L239.11 56.23L231.88 56.23L231.88 68.17Q231.88 69.74 232.63 70.45Q233.38 71.16 235.11 71.16M241.23 63.85Q241.23 56.86 243.63 51.72Q246.02 46.57 250.19 43.86Q254.35 41.15 259.53 41.15Q263.85 41.15 266.99 42.92Q270.13 44.69 271.78 47.75L271.78 41.70L289.14 41.70L289.14 86L271.78 86L271.78 79.95Q270.13 83.02 266.99 84.78Q263.85 86.55 259.53 86.55Q250.35 86.55 250.19 83.84Q246.02 81.13 243.63 75.99Q241.23 70.84 241.23 63.85M271.78 63.85Q271.78 60.32 269.98 58.35Q268.17 56.39 265.34 56.39Q262.52 56.39 260.71 58.35Q258.90 60.32 258.90 63.85Q258.90 67.39 260.71 69.35Q262.52 71.31 265.34 71.31Q268.17 71.31 269.98 69.35Q271.78 67.39 271.78 63.85M291.50 30.39L338.31 30.39L338.31 44.22L323.54 44.22L323.54 86L306.11 86L306.11 44.22L291.50 44.22L291.50 30.39M383.55 63.46Q383.55 65.27 383.31 66.91L355.27 66.91Q355.67 72.65 360.06 72.65Q362.89 72.65 364.15 70.06L382.61 70.06Q381.66 74.77 378.64 78.50Q375.62 82.23 371.02 84.39Q366.43 86.55 360.93 86.55Q354.33 86.55 349.19 83.80Q344.04 81.05 341.18 75.91Q338.31 70.76 338.31 63.85Q338.31 56.94 341.18 51.80Q344.04 46.65 349.19 43.90Q354.33 41.15 360.93 41.15Q367.53 41.15 372.67 43.86Q377.81 46.57 380.68 51.60Q383.55 56.63 383.55 63.46M355.51 59.30L365.88 59.30Q365.88 57.10 364.46 55.96Q363.05 54.82 360.93 54.82Q356.29 54.82 355.51 59.30M384.33 63.85Q384.33 56.94 387.20 51.80Q390.07 46.65 395.21 43.90Q400.36 41.15 406.95 41.15Q415.59 41.15 421.52 46.02Q427.45 50.89 429.02 59.53L410.57 59.53Q409.55 56.08 406.56 56.08Q404.44 56.08 403.22 58.04Q402.01 60 402.01 63.85Q402.01 67.70 403.22 69.66Q404.44 71.63 406.56 71.63Q409.55 71.63 410.57 68.17L429.02 68.17Q427.45 76.81 421.52 81.68Q415.59 86.55 406.95 86.55Q400.36 86.55 395.21 83.80Q390.07 81.05 387.20 75.91Q384.33 70.76 384.33 63.85M463.19 41.39Q470.81 41.39 475.09 46.49Q479.37 51.60 479.37 60.32L479.37 86L462.01 86L462.01 62.52Q462.01 59.37 460.32 57.53Q458.63 55.68 455.81 55.68Q452.90 55.68 451.25 57.53Q449.60 59.37 449.60 62.52L449.60 86L432.17 86L432.17 27.88L449.60 27.88L449.60 48.46Q451.64 45.32 455.06 43.35Q458.48 41.39 463.19 41.39';

// Wordmark centered for 800x800 stacked logo (baseline y=540)
const WORDMARK_PATH_STACKED = 'M201.18 484.39L201.18 526.81L217.99 526.81L217.99 540L183.75 540L183.75 484.39L201.18 484.39M250.59 495.70L268.02 495.70L268.02 540L250.59 540L250.59 533.25Q248.54 536.39 245.13 538.35Q241.71 540.31 237.00 540.31Q229.38 540.31 225.10 535.21Q220.82 530.10 220.82 521.39L220.82 495.70L238.18 495.70L238.18 519.19Q238.18 522.33 239.86 524.17Q241.55 526.02 244.38 526.02Q247.29 526.02 248.94 524.17Q250.59 522.33 250.59 519.19L250.59 495.70M296.93 525.16L301.09 525.16L301.09 540L294.49 540Q276.27 540 276.27 521.86L276.27 510.23L270.77 510.23L270.77 495.70L276.27 495.70L276.27 485.02L293.70 485.02L293.70 495.70L300.93 495.70L300.93 510.23L293.70 510.23L293.70 522.17Q293.70 523.74 294.45 524.45Q295.20 525.16 296.93 525.16M303.05 517.85Q303.05 510.86 305.45 505.72Q307.84 500.57 312.01 497.86Q316.17 495.15 321.35 495.15Q325.67 495.15 328.81 496.92Q331.95 498.69 333.60 501.75L333.60 495.70L350.96 495.70L350.96 540L333.60 540L333.60 533.95Q331.95 537.02 328.81 538.78Q325.67 540.55 321.35 540.55Q316.17 540.55 312.01 537.84Q307.84 535.13 305.45 529.99Q303.05 524.84 303.05 517.85M333.60 517.85Q333.60 514.32 331.80 512.35Q329.99 510.39 327.16 510.39Q324.34 510.39 322.53 512.35Q320.72 514.32 320.72 517.85Q320.72 521.39 322.53 523.35Q324.34 525.31 327.16 525.31Q329.99 525.31 331.80 523.35Q333.60 521.39 333.60 517.85M353.32 484.39L400.13 484.39L400.13 498.22L385.36 498.22L385.36 540L367.93 540L367.93 498.22L353.32 498.22L353.32 484.39M445.37 517.46Q445.37 519.27 445.13 520.91L417.09 520.91Q417.49 526.65 421.88 526.65Q424.71 526.65 425.97 524.06L444.43 524.06Q443.48 528.77 440.46 532.50Q437.44 536.23 432.84 538.39Q428.25 540.55 422.75 540.55Q416.15 540.55 411.01 537.80Q405.86 535.05 403.00 529.91Q400.13 524.76 400.13 517.85Q400.13 510.94 403.00 505.80Q405.86 500.65 411.01 497.90Q416.15 495.15 422.75 495.15Q429.35 495.15 434.49 497.86Q439.63 500.57 442.50 505.60Q445.37 510.63 445.37 517.46M417.33 513.30L427.70 513.30Q427.70 511.10 426.28 509.96Q424.87 508.82 422.75 508.82Q418.11 508.82 417.33 513.30M446.15 517.85Q446.15 510.94 449.02 505.80Q451.89 500.65 457.03 497.90Q462.18 495.15 468.77 495.15Q477.41 495.15 483.34 500.02Q489.27 504.89 490.84 513.53L472.39 513.53Q471.37 510.08 468.38 510.08Q466.26 510.08 465.04 512.04Q463.83 514.00 463.83 517.85Q463.83 521.70 465.04 523.66Q466.26 525.63 468.38 525.63Q471.37 525.63 472.39 522.17L490.84 522.17Q489.27 530.81 483.34 535.68Q477.41 540.55 468.77 540.55Q462.18 540.55 457.03 537.80Q451.89 535.05 449.02 529.91Q446.15 524.76 446.15 517.85M525.01 495.39Q532.63 495.39 536.91 500.49Q541.19 505.60 541.19 514.32L541.19 540L523.83 540L523.83 516.52Q523.83 513.37 522.14 511.53Q520.45 509.68 517.63 509.68Q514.72 509.68 513.07 511.53Q511.42 513.37 511.42 516.52L511.42 540L493.99 540L493.99 481.88L511.42 481.88L511.42 502.46Q513.46 499.32 516.88 497.35Q520.30 495.39 525.01 495.39';

function renderIconSvgGroup(fillColor) {
  return `
  <g class="lutatech-icon-mark">
    <path d="${ICON_PATH_CHEVRON}" fill="${fillColor}" />
    <path d="${ICON_PATH_TRIANGLE}" fill="${fillColor}" />
  </g>`;
}

// 1. Standalone Icon SVG
function getIconSvg(options = {}) {
  const {
    fill = BRAND.colors.primary,
    bg = null,
    rx = 0
  } = options;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  ${bg ? `<rect width="1000" height="1000" rx="${rx}" fill="${bg}" />` : ''}
  <g transform="translate(160, 160) scale(0.68)">
    ${renderIconSvgGroup(fill)}
  </g>
</svg>`;
}

// 2. Horizontal Logo SVG: [ICON] LutaTech
// STRICT RULE: Icon and text share the exact same \`color\`.
// Height of icon = height of text cap-height (55.61px) with aligned baseline y=86.
function getHorizontalLogoSvg(options = {}) {
  const {
    color = BRAND.colors.primary, // ONE UNIFIED COLOR FOR BOTH ICON AND TEXT
    bg = null,
    width = 510,
    height = 120
  } = options;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bg ? `<rect width="${width}" height="${height}" fill="${bg}" />` : ''}
  <g fill="${color}">
    {/* Flat-Top Geometric Chevron Mark */}
    <path d="M 50 30.39 L 70 30.39 L 92 86 L 74.57 86 L 65.5 46.89 L 54.5 46.89 L 45.43 86 L 28 86 Z" />
    <path d="M 60 68 L 71 86 L 49 86 Z" />
    {/* Poppins 900 Ultra-Bold Vector Wordmark */}
    <path d="${WORDMARK_PATH_HORIZONTAL}" />
  </g>
</svg>`;
}

// 3. Stacked Logo SVG: [ICON] over LutaTech
// STRICT RULE: Icon and text share the exact same \`color\`.
function getStackedLogoSvg(options = {}) {
  const {
    color = BRAND.colors.primary, // ONE UNIFIED COLOR FOR BOTH ICON AND TEXT
    mutedColor = null,
    bg = null,
    tagline = true,
    size = 800
  } = options;

  const subColor = mutedColor || color;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${bg ? `<rect width="${size}" height="${size}" fill="${bg}" />` : ''}
  <g transform="translate(260, 140) scale(0.28)">
    <path d="${ICON_PATH_CHEVRON}" fill="${color}" />
    <path d="${ICON_PATH_TRIANGLE}" fill="${color}" />
  </g>
  <path d="${WORDMARK_PATH_STACKED}" fill="${color}" />
  ${tagline ? `<text x="400" y="590" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="5px" fill="${subColor}" opacity="0.85">DIGITAL TOOLS PLATFORM</text>` : ''}
</svg>`;
}

// 4. Social Sharing Images (OG Image: 1200x630, Twitter Card: 1200x628)
// 4. Social Sharing Images (OG Image: 1200x630, Twitter Card: 1200x628)
// STRICT RULE: Logo mark and text are BOTH pure white (#FFFFFF)
function getSocialCardSvg(width, height) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07090E" />
      <stop offset="100%" stop-color="#111622" />
    </linearGradient>
    <linearGradient id="redGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EB1000" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#EB1000" stop-opacity="0" />
    </linearGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#232B3E" stroke-width="0.75" stroke-opacity="0.4" />
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <rect width="100%" height="100%" fill="url(#grid)" />
  <circle cx="1050" cy="150" r="350" fill="url(#redGlow)" filter="blur(60px)" />
  <circle cx="150" cy="550" r="250" fill="url(#redGlow)" filter="blur(70px)" />

  <!-- Outer Card Glass Border -->
  <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="24" fill="#121620" fill-opacity="0.65" stroke="#2D3748" stroke-width="1.5" />

  <!-- Logo Mark & Unified Text (BOTH WHITE) -->
  <g transform="translate(80, 80) scale(1.1)" fill="#FFFFFF">
    <path d="M 50 30.39 L 70 30.39 L 92 86 L 74.57 86 L 65.5 46.89 L 54.5 46.89 L 45.43 86 L 28 86 Z" />
    <path d="M 60 68 L 71 86 L 49 86 Z" />
    <path d="${WORDMARK_PATH_HORIZONTAL}" />
  </g>

  <!-- Headline & Subtitle -->
  <text x="100" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#F8FAFC" letter-spacing="-1px">
    Fast, Private, Modern Digital Tools
  </text>
  <text x="100" y="405" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="400" fill="#94A3B8">
    Passport photo maker, AI background remover, PDF &amp; image utilities in your browser.
  </text>

  <!-- Badges -->
  <g transform="translate(100, 470)">
    <rect x="0" y="0" width="180" height="46" rx="23" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="24" cy="23" r="6" fill="#10B981" />
    <text x="42" y="29" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#F1F5F9">100% Private</text>

    <rect x="200" y="0" width="190" height="46" rx="23" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="224" cy="23" r="6" fill="#EB1000" />
    <text x="242" y="29" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#F1F5F9">Zero Install</text>

    <rect x="410" y="0" width="210" height="46" rx="23" fill="#1E293B" stroke="#334155" stroke-width="1" />
    <circle cx="434" cy="23" r="6" fill="#3B82F6" />
    <text x="452" y="29" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#F1F5F9">AI-Powered</text>
  </g>

  <!-- Domain URL tag -->
  <text x="${width - 120}" y="500" text-anchor="end" font-family="system-ui, sans-serif" font-size="26" font-weight="700" fill="#EB1000">
    lutatech.com
  </text>
</svg>`;
}

// 5. Social Covers (Twitter 1500x500, LinkedIn 1584x396, FB 820x312, YouTube 2560x1440)
// STRICT RULE: Logo mark and text are BOTH pure white (#FFFFFF)
function getCoverSvg(width, height) {
  const scale = (height * 0.28) / 120;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07090E" />
      <stop offset="50%" stop-color="#0E121B" />
      <stop offset="100%" stop-color="#161C2B" />
    </linearGradient>
    <radialGradient id="coverGlow" cx="80%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#EB1000" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#EB1000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#coverGrad)" />
  <rect width="100%" height="100%" fill="url(#coverGlow)" />
  
  <g transform="translate(${Math.round(width * 0.08)}, ${Math.round(height * 0.28)})">
    <g transform="scale(${scale})" fill="#FFFFFF">
      <path d="M 50 30.39 L 70 30.39 L 92 86 L 74.57 86 L 65.5 46.89 L 54.5 46.89 L 45.43 86 L 28 86 Z" />
      <path d="M 60 68 L 71 86 L 49 86 Z" />
      <path d="${WORDMARK_PATH_HORIZONTAL}" />
    </g>
    <text x="0" y="${Math.round(height * 0.38)}" font-family="system-ui, sans-serif" font-size="${Math.round(height * 0.07)}" font-weight="500" fill="#94A3B8">
      Private, Instant Digital Utilities &amp; AI Tools • lutatech.com
    </text>
  </g>
</svg>`;
}

// 6. Brand Patterns
function getGeometricPatternSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <pattern id="brandPattern" width="100" height="100" patternUnits="userSpaceOnUse">
      <g transform="translate(10, 15) scale(0.09)">
        ${renderIconSvgGroup('#FF5758')}
      </g>
      <g transform="translate(60, 65) scale(0.05)" opacity="0.4">
        ${renderIconSvgGroup('#94A3B8')}
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#090B10" />
  <rect width="100%" height="100%" fill="url(#brandPattern)" />
</svg>`;
}

// 7. Reusable Backgrounds
function getBackgroundGradientSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <radialGradient id="bgGlowCenter" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#FF5758" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#FF5758" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="bgBase" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#07090E" />
      <stop offset="100%" stop-color="#0B0E14" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgBase)" />
  <rect width="100%" height="100%" fill="url(#bgGlowCenter)" />
</svg>`;
}

// 8. Core UI Icon Pack (SVG)
const UI_ICONS = {
  'home': '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1V9.5z"/>',
  'search': '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  'shield-security': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  'tools': '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  'image': '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  'copy': '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  'refresh': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  'sun': '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  'moon': '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  'logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'
};

function getUiIconSvg(iconName, strokeColor = '#FF5758') {
  const content = UI_ICONS[iconName] || UI_ICONS['tools'];
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  ${content}
</svg>`;
}

// 9. Modern Brand Illustrations
function getError404IllustrationSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <defs>
    <radialGradient id="illGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FF5758" stop-opacity="0.2" />
      <stop offset="100%" stop-color="#FF5758" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#090B10" rx="16" />
  <circle cx="300" cy="200" r="180" fill="url(#illGlow)" />
  <g transform="translate(230, 80) scale(0.18)" opacity="0.85">
    ${renderIconSvgGroup('#FF5758')}
  </g>
  <text x="300" y="270" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="72" font-weight="900" fill="#F8FAFC" letter-spacing="-2px">
    404
  </text>
  <text x="300" y="315" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#94A3B8">
    Page Not Found
  </text>
  <text x="300" y="345" text-anchor="middle" font-family="Inter, -apple-system, sans-serif" font-size="14" font-weight="400" fill="#64748B">
    The digital tool or page you are looking for does not exist or has moved.
  </text>
</svg>`;
}

function getEmptyStateIllustrationSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="500" height="350">
  <rect width="100%" height="100%" fill="#090B10" rx="16" />
  <circle cx="250" cy="140" r="80" fill="#121620" stroke="#232B3E" stroke-width="2" />
  <g transform="translate(195, 85) scale(0.125)">
    ${renderIconSvgGroup('#EB1000')}
  </g>
  <text x="250" y="250" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#F8FAFC">
    No Files Processed Yet
  </text>
  <text x="250" y="280" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="400" fill="#94A3B8">
    Upload an image or document to get started with LutaTech tools.
  </text>
</svg>`;
}

// 10. Print Templates (Business Card, Letterhead)
function getBusinessCardFrontSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 600" width="1050" height="600">
  <rect width="100%" height="100%" fill="#090B10" />
  <g transform="translate(100, 180) scale(1.4)" fill="#FFFFFF">
    <path d="M 50 30.39 L 70 30.39 L 92 86 L 74.57 86 L 65.5 46.89 L 54.5 46.89 L 45.43 86 L 28 86 Z" />
    <path d="M 60 68 L 71 86 L 49 86 Z" />
    <path d="${WORDMARK_PATH_HORIZONTAL}" />
  </g>
  <text x="100" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="#94A3B8" letter-spacing="4px">
    DIGITAL TOOLS PLATFORM
  </text>
  <line x1="100" y1="490" x2="950" y2="490" stroke="#232B3E" stroke-width="1.5" />
  <text x="100" y="535" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#EB1000">
    lutatech.com
  </text>
</svg>`;
}

// --- HELPER WRITERS ---
async function writeSvgAndPng(svgString, basePathWithoutExt, sizes = [1024]) {
  const svgPath = `${basePathWithoutExt}.svg`;
  fs.writeFileSync(svgPath, svgString, 'utf8');

  for (const size of sizes) {
    const pngPath = sizes.length === 1 && typeof size === 'number'
      ? `${basePathWithoutExt}.png`
      : `${basePathWithoutExt}-${size}.png`;
    
    const svgBuffer = Buffer.from(svgString);
    if (typeof size === 'number') {
      await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(pngPath);
    } else if (typeof size === 'object' && size.w && size.h) {
      const targetPath = size.suffix ? `${basePathWithoutExt}-${size.suffix}.png` : `${basePathWithoutExt}-${size.w}x${size.h}.png`;
      await sharp(svgBuffer)
        .resize(size.w, size.h, { fit: 'cover' })
        .png({ compressionLevel: 9 })
        .toFile(targetPath);
    }
  }
}

async function main() {
  console.log('🚀 Generating LutaTech Universal Brand Assets (Single Shared Color & Uniform Height)...');

  // 1. Create directory structure
  const dirs = [
    '01-logo/primary',
    '01-logo/horizontal',
    '01-logo/stacked',
    '01-logo/icon',
    '01-logo/light',
    '01-logo/dark',
    '01-logo/monochrome',
    '02-favicon',
    '03-app-icons/android/mipmap-mdpi',
    '03-app-icons/android/mipmap-hdpi',
    '03-app-icons/android/mipmap-xhdpi',
    '03-app-icons/android/mipmap-xxhdpi',
    '03-app-icons/android/mipmap-xxxhdpi',
    '03-app-icons/ios',
    '04-social/profile',
    '04-social/covers',
    '04-social/sharing',
    '05-patterns',
    '06-backgrounds',
    '07-icons',
    '08-illustrations',
    '09-images',
    '10-colors',
    '11-typography',
    '12-screenshots',
    '13-print',
    '14-presentations',
    '15-brand-guidelines'
  ];

  for (const d of dirs) {
    fs.mkdirSync(path.join(BRAND_DIR, d), { recursive: true });
  }

  // --- 01-LOGO ---
  console.log('📦 1. Generating Logos (Icon and Text share the exact same color)...');
  
  // 1.1 Dark Theme Logo: BOTH Icon & Text are PURE WHITE (#FFFFFF)
  const primaryLightSvg = getHorizontalLogoSvg({ color: '#FFFFFF', bg: null });
  await writeSvgAndPng(primaryLightSvg, path.join(BRAND_DIR, '01-logo/primary/logo-primary-light'), [1024, 2048]);
  await writeSvgAndPng(primaryLightSvg, path.join(BRAND_DIR, '01-logo/light/logo-light'), [1024, 2048]);
  await writeSvgAndPng(primaryLightSvg, path.join(BRAND_DIR, '01-logo/monochrome/logo-mono-white'), [1024, 2048]);
  await writeSvgAndPng(primaryLightSvg, path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-light'), [1024, 2048]);
  await writeSvgAndPng(primaryLightSvg, path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-mono-white'), [1024, 2048]);

  // 1.2 Light Theme Logo: BOTH Icon & Text are BRAND RED (#EB1000)
  const primaryRedSvg = getHorizontalLogoSvg({ color: '#EB1000', bg: null });
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/primary/logo-primary'), [512, 1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/primary/logo-primary-dark'), [1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/primary/logo-primary-coral'), [1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/primary/logo-primary-red'), [1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/dark/logo-dark'), [1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal'), [1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-dark'), [1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-coral'), [1024, 2048]);
  await writeSvgAndPng(primaryRedSvg, path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-red'), [1024, 2048]);

  // 1.3 Pure Black Monochrome: BOTH Icon & Text are PURE BLACK (#000000)
  const monoBlackSvg = getHorizontalLogoSvg({ color: '#000000', bg: null });
  await writeSvgAndPng(monoBlackSvg, path.join(BRAND_DIR, '01-logo/monochrome/logo-mono-black'), [1024, 2048]);
  await writeSvgAndPng(monoBlackSvg, path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-mono-black'), [1024, 2048]);

  // 1.4 Stacked Logos
  // Dark theme stacked (BOTH White)
  const stackedLightSvg = getStackedLogoSvg({ color: '#FFFFFF', mutedColor: '#94A3B8', bg: null });
  await writeSvgAndPng(stackedLightSvg, path.join(BRAND_DIR, '01-logo/stacked/logo-stacked-light'), [1024, 2048]);
  // Light theme stacked (BOTH Red #EB1000)
  const stackedRedSvg = getStackedLogoSvg({ color: '#EB1000', mutedColor: '#EB1000', bg: null });
  await writeSvgAndPng(stackedRedSvg, path.join(BRAND_DIR, '01-logo/stacked/logo-stacked'), [1024, 2048]);
  await writeSvgAndPng(stackedRedSvg, path.join(BRAND_DIR, '01-logo/stacked/logo-stacked-dark'), [1024, 2048]);
  await writeSvgAndPng(stackedRedSvg, path.join(BRAND_DIR, '01-logo/stacked/logo-stacked-coral'), [1024, 2048]);
  await writeSvgAndPng(stackedRedSvg, path.join(BRAND_DIR, '01-logo/stacked/logo-stacked-red'), [1024, 2048]);
  // Monochrome black stacked
  const stackedBlackSvg = getStackedLogoSvg({ color: '#000000', mutedColor: '#64748B', bg: null });
  await writeSvgAndPng(stackedBlackSvg, path.join(BRAND_DIR, '01-logo/stacked/logo-stacked-mono-black'), [1024, 2048]);

  // 1.5 Icon Only folder
  const iconRedSvg = getIconSvg({ fill: BRAND.colors.primary });
  await writeSvgAndPng(iconRedSvg, path.join(BRAND_DIR, '01-logo/icon/logo-icon'), [128, 256, 512, 1024, 2048]);
  await writeSvgAndPng(iconRedSvg, path.join(BRAND_DIR, '01-logo/icon/logo-icon-coral'), [512, 1024, 2048]);
  await writeSvgAndPng(iconRedSvg, path.join(BRAND_DIR, '01-logo/icon/logo-icon-red'), [512, 1024, 2048]);
  const iconWhiteSvg = getIconSvg({ fill: '#FFFFFF' });
  await writeSvgAndPng(iconWhiteSvg, path.join(BRAND_DIR, '01-logo/icon/logo-icon-white'), [512, 1024, 2048]);
  const iconDarkSvg = getIconSvg({ fill: '#EB1000' });
  await writeSvgAndPng(iconDarkSvg, path.join(BRAND_DIR, '01-logo/icon/logo-icon-dark'), [512, 1024, 2048]);

  // --- 02-FAVICON ---
  console.log('📦 2. Generating Favicons & Web Icons...');
  const faviconSvg = getIconSvg({ fill: BRAND.colors.primary });
  fs.writeFileSync(path.join(BRAND_DIR, '02-favicon/favicon.svg'), faviconSvg, 'utf8');

  for (const size of [16, 32, 48, 64]) {
    await sharp(Buffer.from(faviconSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(BRAND_DIR, `02-favicon/favicon-${size}x${size}.png`));
  }

  const appleTouchSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg, rx: 220 });
  await sharp(Buffer.from(appleTouchSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(BRAND_DIR, '02-favicon/apple-touch-icon.png'));

  // --- 03-APP-ICONS ---
  console.log('📦 3. Generating Mobile App Icons (Android & iOS)...');
  const androidSizes = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 }
  ];

  const appIconSquareSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg, rx: 180 });

  for (const a of androidSizes) {
    await sharp(Buffer.from(appIconSquareSvg))
      .resize(a.size, a.size)
      .png()
      .toFile(path.join(BRAND_DIR, `03-app-icons/android/${a.dir}/ic_launcher.png`));
  }
  await sharp(Buffer.from(appIconSquareSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(BRAND_DIR, '03-app-icons/android/ic_launcher-512.png'));

  const adaptiveFgSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <g transform="translate(116, 126) scale(0.23)">
    ${renderIconSvgGroup('#FF5758')}
  </g>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, '03-app-icons/android/adaptive-foreground.svg'), adaptiveFgSvg, 'utf8');
  await sharp(Buffer.from(adaptiveFgSvg)).resize(432, 432).png().toFile(path.join(BRAND_DIR, '03-app-icons/android/adaptive-foreground.png'));

  const adaptiveBgSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <rect width="432" height="432" fill="#090B10" />
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, '03-app-icons/android/adaptive-background.svg'), adaptiveBgSvg, 'utf8');
  await sharp(Buffer.from(adaptiveBgSvg)).resize(432, 432).png().toFile(path.join(BRAND_DIR, '03-app-icons/android/adaptive-background.png'));

  const notifSvg = getIconSvg({ fill: '#FFFFFF' });
  fs.writeFileSync(path.join(BRAND_DIR, '03-app-icons/android/notification-icon.svg'), notifSvg, 'utf8');
  await sharp(Buffer.from(notifSvg)).resize(96, 96).png().toFile(path.join(BRAND_DIR, '03-app-icons/android/notification-icon-96.png'));

  const iosSizes = [1024, 180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];
  const iosMasterSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg });
  for (const s of iosSizes) {
    await sharp(Buffer.from(iosMasterSvg))
      .resize(s, s)
      .png()
      .toFile(path.join(BRAND_DIR, `03-app-icons/ios/AppIcon-${s}x${s}.png`));
  }

  // --- 04-SOCIAL ---
  console.log('📦 4. Generating Social Media Assets...');
  const profileAvatarSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg, rx: 0 });
  fs.writeFileSync(path.join(BRAND_DIR, '04-social/profile/profile-avatar.svg'), profileAvatarSvg, 'utf8');
  const profileSizes = [
    { name: 'profile-master-2048x2048', size: 2048 },
    { name: 'profile-square-1024x1024', size: 1024 },
    { name: 'profile-youtube-800x800', size: 800 },
    { name: 'profile-twitter-400x400', size: 400 },
    { name: 'profile-linkedin-400x400', size: 400 },
    { name: 'profile-instagram-320x320', size: 320 },
    { name: 'profile-facebook-170x170', size: 170 }
  ];
  for (const p of profileSizes) {
    await sharp(Buffer.from(profileAvatarSvg)).resize(p.size, p.size).png().toFile(path.join(BRAND_DIR, `04-social/profile/${p.name}.png`));
  }

  const covers = [
    { name: 'facebook-cover-820x312', w: 820, h: 312 },
    { name: 'linkedin-cover-1584x396', w: 1584, h: 396 },
    { name: 'twitter-header-1500x500', w: 1500, h: 500 },
    { name: 'youtube-banner-2560x1440', w: 2560, h: 1440 }
  ];
  for (const c of covers) {
    const coverSvg = getCoverSvg(c.w, c.h);
    await sharp(Buffer.from(coverSvg)).resize(c.w, c.h).png().toFile(path.join(BRAND_DIR, `04-social/covers/${c.name}.png`));
  }

  const ogSvg = getSocialCardSvg(1200, 630);
  fs.writeFileSync(path.join(BRAND_DIR, '04-social/sharing/og-image.svg'), ogSvg, 'utf8');
  await sharp(Buffer.from(ogSvg)).resize(1200, 630).png().toFile(path.join(BRAND_DIR, '04-social/sharing/og-image-1200x630.png'));

  const twCardSvg = getSocialCardSvg(1200, 628);
  fs.writeFileSync(path.join(BRAND_DIR, '04-social/sharing/twitter-card.svg'), twCardSvg, 'utf8');
  await sharp(Buffer.from(twCardSvg)).resize(1200, 628).png().toFile(path.join(BRAND_DIR, '04-social/sharing/twitter-card-1200x628.png'));

  // --- 05-PATTERNS ---
  fs.writeFileSync(path.join(BRAND_DIR, '05-patterns/pattern-geometric.svg'), getGeometricPatternSvg(), 'utf8');
  fs.writeFileSync(path.join(BRAND_DIR, '05-patterns/pattern-subtle.svg'), getGeometricPatternSvg(), 'utf8');

  // --- 06-BACKGROUNDS ---
  fs.writeFileSync(path.join(BRAND_DIR, '06-backgrounds/background-gradient.svg'), getBackgroundGradientSvg(), 'utf8');
  await sharp(Buffer.from(getBackgroundGradientSvg())).resize(1920, 1080).png().toFile(path.join(BRAND_DIR, '06-backgrounds/background-gradient.png'));

  // --- 07-ICONS ---
  for (const [name, pathData] of Object.entries(UI_ICONS)) {
    fs.writeFileSync(path.join(BRAND_DIR, `07-icons/icon-${name}.svg`), getUiIconSvg(name), 'utf8');
  }

  // --- 08-ILLUSTRATIONS ---
  fs.writeFileSync(path.join(BRAND_DIR, '08-illustrations/error-404.svg'), getError404IllustrationSvg(), 'utf8');
  await sharp(Buffer.from(getError404IllustrationSvg())).resize(600, 400).png().toFile(path.join(BRAND_DIR, '08-illustrations/error-404.png'));
  fs.writeFileSync(path.join(BRAND_DIR, '08-illustrations/empty-state.svg'), getEmptyStateIllustrationSvg(), 'utf8');
  await sharp(Buffer.from(getEmptyStateIllustrationSvg())).resize(500, 350).png().toFile(path.join(BRAND_DIR, '08-illustrations/empty-state.png'));

  // --- 09-IMAGES & PROMO GRAPHICS ---
  const playStoreFeatureSvg = getCoverSvg(1024, 500);
  fs.writeFileSync(path.join(BRAND_DIR, '09-images/google-play-feature.svg'), playStoreFeatureSvg, 'utf8');
  await sharp(Buffer.from(playStoreFeatureSvg)).resize(1024, 500).png().toFile(path.join(BRAND_DIR, '09-images/google-play-feature-1024x500.png'));

  // --- 13-PRINT ---
  fs.writeFileSync(path.join(BRAND_DIR, '13-print/business-card-front.svg'), getBusinessCardFrontSvg(), 'utf8');

  // --- 14. SYNCHRONIZE PUBLIC WEBSITE ASSETS ---
  console.log('🔄 Updating Live Frontend Assets in frontend/public/...');
  // Copy over the updated assets directly into frontend/public
  // logo-dark.svg: displayed in light theme (FULL Coral #FF5758 text & icon)
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-coral.svg'), path.join(FRONTEND_PUBLIC_DIR, 'logo/logo-dark.svg'));
  // logo.svg & logo-coral.svg: default brand marks (Coral #FF5758)
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-coral.svg'), path.join(FRONTEND_PUBLIC_DIR, 'logo/logo.svg'));
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-coral.svg'), path.join(FRONTEND_PUBLIC_DIR, 'logo/logo-coral.svg'));
  // logo-light.svg: displayed in dark theme (White text & White icon)
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/horizontal/logo-horizontal-light.svg'), path.join(FRONTEND_PUBLIC_DIR, 'logo/logo-light.svg'));
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/icon/logo-icon.svg'), path.join(FRONTEND_PUBLIC_DIR, 'logo/logo-icon.svg'));
  fs.copyFileSync(path.join(BRAND_DIR, '02-favicon/favicon.svg'), path.join(FRONTEND_PUBLIC_DIR, 'favicon.svg'));

  // Copy high-res PNG replacements
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/primary/logo-primary-coral-1024.png'), path.join(FRONTEND_PUBLIC_DIR, 'logo/logo-dark.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/primary/logo-primary-light-1024.png'), path.join(FRONTEND_PUBLIC_DIR, 'logo/logo-light.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/primary/logo-primary-coral-1024.png'), path.join(FRONTEND_PUBLIC_DIR, 'logo.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '01-logo/primary/logo-primary-light-1024.png'), path.join(FRONTEND_PUBLIC_DIR, 'logo-white.png'));

  // Favicons & App Icons
  fs.copyFileSync(path.join(BRAND_DIR, '02-favicon/favicon-16x16.png'), path.join(FRONTEND_PUBLIC_DIR, 'favicon-16x16.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '02-favicon/favicon-32x32.png'), path.join(FRONTEND_PUBLIC_DIR, 'favicon-32x32.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '02-favicon/favicon-48x48.png'), path.join(FRONTEND_PUBLIC_DIR, 'favicon-48x48.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '02-favicon/apple-touch-icon.png'), path.join(FRONTEND_PUBLIC_DIR, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '03-app-icons/android/mipmap-xxxhdpi/ic_launcher.png'), path.join(FRONTEND_PUBLIC_DIR, 'android-chrome-192x192.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '03-app-icons/android/ic_launcher-512.png'), path.join(FRONTEND_PUBLIC_DIR, 'android-chrome-512x512.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '03-app-icons/android/mipmap-xxxhdpi/ic_launcher.png'), path.join(FRONTEND_PUBLIC_DIR, 'icon-192.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '03-app-icons/android/ic_launcher-512.png'), path.join(FRONTEND_PUBLIC_DIR, 'icon-512.png'));
  fs.copyFileSync(path.join(BRAND_DIR, '04-social/sharing/og-image-1200x630.png'), path.join(FRONTEND_PUBLIC_DIR, 'og-image.png'));

  console.log('✅ Generation completed successfully!');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
