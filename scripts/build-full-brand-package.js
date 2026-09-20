/**
 * LutaTech Master Brand Package Builder
 * Generates the complete, production-grade universal brand package according to the
 * Universal Website & App Brand Asset Specification.
 *
 * Folder Structure:
 * brand/
 * ├── logo/
 * ├── icon/
 * ├── favicon/
 * ├── app-icon/
 * ├── social/
 * ├── patterns/
 * ├── colors/
 * ├── typography/
 * ├── illustrations/
 * ├── backgrounds/
 * ├── screenshots/
 * ├── print/
 * ├── presentations/
 * └── brand-guidelines/
 */

const fs = require('fs');
const path = require('path');
const sharp = require('../frontend/node_modules/sharp');

const ROOT_DIR = path.resolve(__dirname, '..');
const BRAND_DIR = path.join(ROOT_DIR, 'brand');
const BRAND_ASSETS_DIR = path.join(ROOT_DIR, 'brand-assets');
const FRONTEND_PUBLIC_DIR = path.join(ROOT_DIR, 'frontend', 'public');

// --- DESIGN TOKENS ---
const BRAND = {
  name: 'LutaTech',
  legalName: 'LutaTech Digital Tools',
  tagline: 'Fast, Private, Modern Digital Tools Platform',
  url: 'https://lutatech.com',
  colors: {
    primary: '#EB1000',       // Vibrant Brand Red (Adobe Style)
    primaryDark: '#C80C00',
    primaryLight: '#FF4B3C',
    primaryGlow: 'rgba(235, 16, 0, 0.25)',
    darkBg: '#090B10',
    darkSurface: '#121620',
    darkBorder: '#232B3E',
    darkText: '#FFFFFF',
    darkMuted: '#94A3B8',
    lightBg: '#FFFFFF',
    lightSurface: '#F8FAFC',
    lightBorder: '#E2E8F0',
    lightText: '#EB1000',
    lightMuted: '#64748B',
    monoBlack: '#000000',
    monoWhite: '#FFFFFF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EB1000',
    info: '#3B82F6'
  }
};

// --- MATHEMATICAL MASTER ICON GEOMETRY ---
// Flat-top equilateral chevron (no anchor corner) in 1000x1000 space:
const ICON_CHEVRON_1000 = 'M 344 0 L 656 0 L 1000 1000 L 728 1000 L 586 297 L 414 297 L 272 1000 L 0 1000 Z';
const ICON_TRIANGLE_1000 = 'M 500 676 L 672 1000 L 328 1000 Z';

// In 510x120 viewBox (aligned with baseline y=86, cap-height 55.61px):
const ICON_CHEVRON_H120 = 'M 50 30.39 L 70 30.39 L 92 86 L 74.57 86 L 65.5 46.89 L 54.5 46.89 L 45.43 86 L 28 86 Z';
const ICON_TRIANGLE_H120 = 'M 60 68 L 71 86 L 49 86 Z';

// Poppins 900 Ultra-Bold wordmark vector path in 510x120 viewBox
const WORDMARK_H120 = 'M139.36 30.39L139.36 72.81L156.17 72.81L156.17 86L121.93 86L121.93 30.39L139.36 30.39M188.77 41.70L206.20 41.70L206.20 86L188.77 86L188.77 79.25Q186.72 82.39 183.31 84.35Q179.89 86.31 175.18 86.31Q167.56 86.31 163.28 81.21Q159 76.10 159 67.39L159 41.70L176.36 41.70L176.36 65.19Q176.36 68.33 178.04 70.17Q179.73 72.02 182.56 72.02Q185.47 72.02 187.12 70.17Q188.77 68.33 188.77 65.19L188.77 41.70M235.11 71.16L239.27 71.16L239.27 86L232.67 86Q214.45 86 214.45 67.86L214.45 56.23L208.95 56.23L208.95 41.70L214.45 41.70L214.45 31.02L231.88 31.02L231.88 41.70L239.11 41.70L239.11 56.23L231.88 56.23L231.88 68.17Q231.88 69.74 232.63 70.45Q233.38 71.16 235.11 71.16M241.23 63.85Q241.23 56.86 243.63 51.72Q246.02 46.57 250.19 43.86Q254.35 41.15 259.53 41.15Q263.85 41.15 266.99 42.92Q270.13 44.69 271.78 47.75L271.78 41.70L289.14 41.70L289.14 86L271.78 86L271.78 79.95Q270.13 83.02 266.99 84.78Q263.85 86.55 259.53 86.55Q250.35 86.55 250.19 83.84Q246.02 81.13 243.63 75.99Q241.23 70.84 241.23 63.85M271.78 63.85Q271.78 60.32 269.98 58.35Q268.17 56.39 265.34 56.39Q262.52 56.39 260.71 58.35Q258.90 60.32 258.90 63.85Q258.90 67.39 260.71 69.35Q262.52 71.31 265.34 71.31Q268.17 71.31 269.98 69.35Q271.78 67.39 271.78 63.85M291.50 30.39L338.31 30.39L338.31 44.22L323.54 44.22L323.54 86L306.11 86L306.11 44.22L291.50 44.22L291.50 30.39M383.55 63.46Q383.55 65.27 383.31 66.91L355.27 66.91Q355.67 72.65 360.06 72.65Q362.89 72.65 364.15 70.06L382.61 70.06Q381.66 74.77 378.64 78.50Q375.62 82.23 371.02 84.39Q366.43 86.55 360.93 86.55Q354.33 86.55 349.19 83.80Q344.04 81.05 341.18 75.91Q338.31 70.76 338.31 63.85Q338.31 56.94 341.18 51.80Q344.04 46.65 349.19 43.90Q354.33 41.15 360.93 41.15Q367.53 41.15 372.67 43.86Q377.81 46.57 380.68 51.60Q383.55 56.63 383.55 63.46M355.51 59.30L365.88 59.30Q365.88 57.10 364.46 55.96Q363.05 54.82 360.93 54.82Q356.29 54.82 355.51 59.30M384.33 63.85Q384.33 56.94 387.20 51.80Q390.07 46.65 395.21 43.90Q400.36 41.15 406.95 41.15Q415.59 41.15 421.52 46.02Q427.45 50.89 429.02 59.53L410.57 59.53Q409.55 56.08 406.56 56.08Q404.44 56.08 403.22 58.04Q402.01 60 402.01 63.85Q402.01 67.70 403.22 69.66Q404.44 71.63 406.56 71.63Q409.55 71.63 410.57 68.17L429.02 68.17Q427.45 76.81 421.52 81.68Q415.59 86.55 406.95 86.55Q400.36 86.55 395.21 83.80Q390.07 81.05 387.20 75.91Q384.33 70.76 384.33 63.85M463.19 41.39Q470.81 41.39 475.09 46.49Q479.37 51.60 479.37 60.32L479.37 86L462.01 86L462.01 62.52Q462.01 59.37 460.32 57.53Q458.63 55.68 455.81 55.68Q452.90 55.68 451.25 57.53Q449.60 59.37 449.60 62.52L449.60 86L432.17 86L432.17 27.88L449.60 27.88L449.60 48.46Q451.64 45.32 455.06 43.35Q458.48 41.39 463.19 41.39';

// Centered Poppins 900 wordmark for 800x800 stacked logo
const WORDMARK_STACKED = 'M201.18 484.39L201.18 526.81L217.99 526.81L217.99 540L183.75 540L183.75 484.39L201.18 484.39M250.59 495.70L268.02 495.70L268.02 540L250.59 540L250.59 533.25Q248.54 536.39 245.13 538.35Q241.71 540.31 237.00 540.31Q229.38 540.31 225.10 535.21Q220.82 530.10 220.82 521.39L220.82 495.70L238.18 495.70L238.18 519.19Q238.18 522.33 239.86 524.17Q241.55 526.02 244.38 526.02Q247.29 526.02 248.94 524.17Q250.59 522.33 250.59 519.19L250.59 495.70M296.93 525.16L301.09 525.16L301.09 540L294.49 540Q276.27 540 276.27 521.86L276.27 510.23L270.77 510.23L270.77 495.70L276.27 495.70L276.27 485.02L293.70 485.02L293.70 495.70L300.93 495.70L300.93 510.23L293.70 510.23L293.70 522.17Q293.70 523.74 294.45 524.45Q295.20 525.16 296.93 525.16M303.05 517.85Q303.05 510.86 305.45 505.72Q307.84 500.57 312.01 497.86Q316.17 495.15 321.35 495.15Q325.67 495.15 328.81 496.92Q331.95 498.69 333.60 501.75L333.60 495.70L350.96 495.70L350.96 540L333.60 540L333.60 533.95Q331.95 537.02 328.81 538.78Q325.67 540.55 321.35 540.55Q316.17 540.55 312.01 537.84Q307.84 535.13 305.45 529.99Q303.05 524.84 303.05 517.85M333.60 517.85Q333.60 514.32 331.80 512.35Q329.99 510.39 327.16 510.39Q324.34 510.39 322.53 512.35Q320.72 514.32 320.72 517.85Q320.72 521.39 322.53 523.35Q324.34 525.31 327.16 525.31Q329.99 525.31 331.80 523.35Q333.60 521.39 333.60 517.85M353.32 484.39L400.13 484.39L400.13 498.22L385.36 498.22L385.36 540L367.93 540L367.93 498.22L353.32 498.22L353.32 484.39M445.37 517.46Q445.37 519.27 445.13 520.91L417.09 520.91Q417.49 526.65 421.88 526.65Q424.71 526.65 425.97 524.06L444.43 524.06Q443.48 528.77 440.46 532.50Q437.44 536.23 432.84 538.39Q428.25 540.55 422.75 540.55Q416.15 540.55 411.01 537.80Q405.86 535.05 403.00 529.91Q400.13 524.76 400.13 517.85Q400.13 510.94 403.00 505.80Q405.86 500.65 411.01 497.90Q416.15 495.15 422.75 495.15Q429.35 495.15 434.49 497.86Q439.63 500.57 442.50 505.60Q445.37 510.63 445.37 517.46M417.33 513.30L427.70 513.30Q427.70 511.10 426.28 509.96Q424.87 508.82 422.75 508.82Q418.11 508.82 417.33 513.30M446.15 517.85Q446.15 510.94 449.02 505.80Q451.89 500.65 457.03 497.90Q462.18 495.15 468.77 495.15Q477.41 495.15 483.34 500.02Q489.27 504.89 490.84 513.53L472.39 513.53Q471.37 510.08 468.38 510.08Q466.26 510.08 465.04 512.04Q463.83 514.00 463.83 517.85Q463.83 521.70 465.04 523.66Q466.26 525.63 468.38 525.63Q471.37 525.63 472.39 522.17L490.84 522.17Q489.27 530.81 483.34 535.68Q477.41 540.55 468.77 540.55Q462.18 540.55 457.03 537.80Q451.89 535.05 449.02 529.91Q446.15 524.76 446.15 517.85M525.01 495.39Q532.63 495.39 536.91 500.49Q541.19 505.60 541.19 514.32L541.19 540L523.83 540L523.83 516.52Q523.83 513.37 522.14 511.53Q520.45 509.68 517.63 509.68Q514.72 509.68 513.07 511.53Q511.42 513.37 511.42 516.52L511.42 540L493.99 540L493.99 481.88L511.42 481.88L511.42 502.46Q513.46 499.32 516.88 497.35Q520.30 495.39 525.01 495.39';

// --- SVG GENERATION HELPERS ---
function getIconSvg({ fill = BRAND.colors.primary, bg = null, rx = 0 } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  ${bg ? `<rect width="1000" height="1000" rx="${rx}" fill="${bg}" />` : ''}
  <g transform="translate(160, 160) scale(0.68)" fill="${fill}">
    <path d="${ICON_CHEVRON_1000}" />
    <path d="${ICON_TRIANGLE_1000}" />
  </g>
</svg>`;
}

function getHorizontalLogoSvg({ color = BRAND.colors.primary, bg = null, width = 510, height = 120 } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bg ? `<rect width="${width}" height="${height}" fill="${bg}" />` : ''}
  <g fill="${color}">
    <path d="${ICON_CHEVRON_H120}" />
    <path d="${ICON_TRIANGLE_H120}" />
    <path d="${WORDMARK_H120}" />
  </g>
</svg>`;
}

function getStackedLogoSvg({ color = BRAND.colors.primary, mutedColor = null, bg = null, tagline = true, size = 800 } = {}) {
  const subColor = mutedColor || color;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${bg ? `<rect width="${size}" height="${size}" fill="${bg}" />` : ''}
  <g transform="translate(260, 140) scale(0.28)" fill="${color}">
    <path d="${ICON_CHEVRON_1000}" />
    <path d="${ICON_TRIANGLE_1000}" />
  </g>
  <path d="${WORDMARK_STACKED}" fill="${color}" />
  ${tagline ? `<text x="400" y="590" text-anchor="middle" font-family="system-ui, sans-serif" font-size="18" font-weight="700" letter-spacing="5px" fill="${subColor}" opacity="0.85">DIGITAL TOOLS PLATFORM</text>` : ''}
</svg>`;
}

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
  console.log('🌟 Building Universal LutaTech Brand Asset Package (Adobe-style Red & Pure White)...');

  // Directories matching Universal Specification
  const dirs = [
    'logo/primary',
    'logo/horizontal',
    'logo/stacked',
    'logo/monochrome',
    'icon',
    'favicon',
    'app-icon/android/mipmap-mdpi',
    'app-icon/android/mipmap-hdpi',
    'app-icon/android/mipmap-xhdpi',
    'app-icon/android/mipmap-xxhdpi',
    'app-icon/android/mipmap-xxxhdpi',
    'app-icon/ios',
    'app-icon/web',
    'social/profile',
    'social/covers',
    'social/sharing',
    'patterns',
    'backgrounds',
    'illustrations',
    'colors',
    'typography',
    'screenshots',
    'print',
    'presentations',
    'brand-guidelines'
  ];

  for (const d of dirs) {
    fs.mkdirSync(path.join(BRAND_DIR, d), { recursive: true });
  }

  // 1. LOGOS
  console.log('1️⃣ Building Logos...');
  // Red Logo (Light theme)
  const logoRedSvg = getHorizontalLogoSvg({ color: BRAND.colors.primary });
  await writeSvgAndPng(logoRedSvg, path.join(BRAND_DIR, 'logo/primary/lutatech-logo-red'), [512, 1024, 2048]);
  await writeSvgAndPng(logoRedSvg, path.join(BRAND_DIR, 'logo/horizontal/lutatech-logo-horizontal-red'), [512, 1024, 2048]);
  fs.copyFileSync(path.join(BRAND_DIR, 'logo/horizontal/lutatech-logo-horizontal-red.svg'), path.join(BRAND_DIR, 'logo/horizontal/lutatech-logo-horizontal.svg'));

  // White Logo (Dark theme)
  const logoWhiteSvg = getHorizontalLogoSvg({ color: BRAND.colors.monoWhite });
  await writeSvgAndPng(logoWhiteSvg, path.join(BRAND_DIR, 'logo/primary/lutatech-logo-white'), [512, 1024, 2048]);
  await writeSvgAndPng(logoWhiteSvg, path.join(BRAND_DIR, 'logo/horizontal/lutatech-logo-horizontal-white'), [512, 1024, 2048]);
  await writeSvgAndPng(logoWhiteSvg, path.join(BRAND_DIR, 'logo/monochrome/lutatech-logo-white'), [512, 1024, 2048]);

  // Black Logo (Mono)
  const logoBlackSvg = getHorizontalLogoSvg({ color: BRAND.colors.monoBlack });
  await writeSvgAndPng(logoBlackSvg, path.join(BRAND_DIR, 'logo/monochrome/lutatech-logo-black'), [512, 1024, 2048]);
  await writeSvgAndPng(logoBlackSvg, path.join(BRAND_DIR, 'logo/horizontal/lutatech-logo-horizontal-black'), [512, 1024, 2048]);

  // Stacked Logos
  const stackedRedSvg = getStackedLogoSvg({ color: BRAND.colors.primary, mutedColor: BRAND.colors.primary });
  await writeSvgAndPng(stackedRedSvg, path.join(BRAND_DIR, 'logo/stacked/lutatech-logo-stacked-red'), [512, 1024, 2048]);
  fs.copyFileSync(path.join(BRAND_DIR, 'logo/stacked/lutatech-logo-stacked-red.svg'), path.join(BRAND_DIR, 'logo/stacked/lutatech-logo-stacked.svg'));

  const stackedWhiteSvg = getStackedLogoSvg({ color: BRAND.colors.monoWhite, mutedColor: BRAND.colors.darkMuted });
  await writeSvgAndPng(stackedWhiteSvg, path.join(BRAND_DIR, 'logo/stacked/lutatech-logo-stacked-white'), [512, 1024, 2048]);

  const stackedBlackSvg = getStackedLogoSvg({ color: BRAND.colors.monoBlack, mutedColor: BRAND.colors.lightMuted });
  await writeSvgAndPng(stackedBlackSvg, path.join(BRAND_DIR, 'logo/stacked/lutatech-logo-stacked-black'), [512, 1024, 2048]);

  // 2. ICONS
  console.log('2️⃣ Building Icons (Standalone & Badges)...');
  const iconSizes = [16, 24, 32, 48, 64, 128, 192, 256, 512, 1024, 2048];
  const iconRedSvg = getIconSvg({ fill: BRAND.colors.primary });
  await writeSvgAndPng(iconRedSvg, path.join(BRAND_DIR, 'icon/lutatech-icon-red'), iconSizes);
  fs.copyFileSync(path.join(BRAND_DIR, 'icon/lutatech-icon-red.svg'), path.join(BRAND_DIR, 'icon/lutatech-icon.svg'));

  const iconWhiteSvg = getIconSvg({ fill: BRAND.colors.monoWhite });
  await writeSvgAndPng(iconWhiteSvg, path.join(BRAND_DIR, 'icon/lutatech-icon-white'), [128, 256, 512, 1024, 2048]);

  const iconBlackSvg = getIconSvg({ fill: BRAND.colors.monoBlack });
  await writeSvgAndPng(iconBlackSvg, path.join(BRAND_DIR, 'icon/lutatech-icon-black'), [128, 256, 512, 1024, 2048]);

  // Circle & Square Badges
  const iconCircleRedSvg = getIconSvg({ fill: BRAND.colors.monoWhite, bg: BRAND.colors.primary, rx: 500 });
  await writeSvgAndPng(iconCircleRedSvg, path.join(BRAND_DIR, 'icon/lutatech-icon-circle-red'), [512, 1024]);

  const iconCircleDarkSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg, rx: 500 });
  await writeSvgAndPng(iconCircleDarkSvg, path.join(BRAND_DIR, 'icon/lutatech-icon-circle-dark'), [512, 1024]);

  const iconSquareDarkSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg, rx: 180 });
  await writeSvgAndPng(iconSquareDarkSvg, path.join(BRAND_DIR, 'icon/lutatech-icon-square-dark'), [512, 1024]);

  // 3. FAVICONS
  console.log('3️⃣ Building Favicons...');
  const faviconSvg = getIconSvg({ fill: BRAND.colors.primary });
  fs.writeFileSync(path.join(BRAND_DIR, 'favicon/favicon.svg'), faviconSvg, 'utf8');
  for (const s of [16, 32, 48, 64, 128]) {
    await sharp(Buffer.from(faviconSvg)).resize(s, s).png().toFile(path.join(BRAND_DIR, `favicon/favicon-${s}x${s}.png`));
  }
  const appleTouchSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg, rx: 220 });
  await sharp(Buffer.from(appleTouchSvg)).resize(180, 180).png().toFile(path.join(BRAND_DIR, 'favicon/apple-touch-icon.png'));

  // 4. APP ICONS (Android & iOS)
  console.log('4️⃣ Building Mobile & Web App Icons...');
  const androidMipmaps = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 }
  ];
  for (const m of androidMipmaps) {
    await sharp(Buffer.from(iconSquareDarkSvg)).resize(m.size, m.size).png().toFile(path.join(BRAND_DIR, `app-icon/android/${m.dir}/ic_launcher.png`));
  }
  await sharp(Buffer.from(iconSquareDarkSvg)).resize(512, 512).png().toFile(path.join(BRAND_DIR, 'app-icon/android/play-store-512.png'));

  const adaptiveFgSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <g transform="translate(108, 108) scale(0.216)" fill="${BRAND.colors.primary}">
    <path d="${ICON_CHEVRON_1000}" />
    <path d="${ICON_TRIANGLE_1000}" />
  </g>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'app-icon/android/adaptive-foreground.svg'), adaptiveFgSvg, 'utf8');
  await sharp(Buffer.from(adaptiveFgSvg)).resize(432, 432).png().toFile(path.join(BRAND_DIR, 'app-icon/android/adaptive-foreground.png'));

  const adaptiveBgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432"><rect width="432" height="432" fill="${BRAND.colors.darkBg}" /></svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'app-icon/android/adaptive-background.svg'), adaptiveBgSvg, 'utf8');
  await sharp(Buffer.from(adaptiveBgSvg)).resize(432, 432).png().toFile(path.join(BRAND_DIR, 'app-icon/android/adaptive-background.png'));

  const notifSvg = getIconSvg({ fill: BRAND.colors.monoWhite });
  fs.writeFileSync(path.join(BRAND_DIR, 'app-icon/android/notification-icon.svg'), notifSvg, 'utf8');
  await sharp(Buffer.from(notifSvg)).resize(96, 96).png().toFile(path.join(BRAND_DIR, 'app-icon/android/notification-icon-96.png'));

  // iOS App Icons
  const iosSizes = [1024, 180, 167, 152, 120, 87, 80, 76, 60, 58, 40, 29, 20];
  const iosMasterSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg });
  for (const s of iosSizes) {
    await sharp(Buffer.from(iosMasterSvg)).resize(s, s).png().toFile(path.join(BRAND_DIR, `app-icon/ios/AppIcon-${s}x${s}.png`));
  }

  // Web Manifest Icons
  await sharp(Buffer.from(iconSquareDarkSvg)).resize(192, 192).png().toFile(path.join(BRAND_DIR, 'app-icon/web/icon-192.png'));
  await sharp(Buffer.from(iconSquareDarkSvg)).resize(512, 512).png().toFile(path.join(BRAND_DIR, 'app-icon/web/icon-512.png'));

  const manifestJson = {
    name: "LutaTech",
    short_name: "LutaTech",
    description: "Fast, Private, Modern Digital Tools Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#090B10",
    theme_color: "#EB1000",
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  };
  fs.writeFileSync(path.join(BRAND_DIR, 'app-icon/web/manifest.webmanifest'), JSON.stringify(manifestJson, null, 2), 'utf8');

  // 5. SOCIAL MEDIA (Avatars, Covers, Sharing Cards)
  console.log('5️⃣ Building Social Media Assets...');
  const avatarSvg = getIconSvg({ fill: BRAND.colors.primary, bg: BRAND.colors.darkBg, rx: 0 });
  const avatarSizes = [
    { name: 'avatar-master-2048x2048', s: 2048 },
    { name: 'avatar-square-1024x1024', s: 1024 },
    { name: 'avatar-youtube-800x800', s: 800 },
    { name: 'avatar-twitter-400x400', s: 400 },
    { name: 'avatar-linkedin-400x400', s: 400 },
    { name: 'avatar-instagram-320x320', s: 320 },
    { name: 'avatar-facebook-170x170', s: 170 }
  ];
  for (const a of avatarSizes) {
    await sharp(Buffer.from(avatarSvg)).resize(a.s, a.s).png().toFile(path.join(BRAND_DIR, `social/profile/${a.name}.png`));
  }

  // Social Covers
  const covers = [
    { name: 'twitter-header-1500x500', w: 1500, h: 500 },
    { name: 'linkedin-cover-1584x396', w: 1584, h: 396 },
    { name: 'facebook-cover-820x312', w: 820, h: 312 },
    { name: 'youtube-banner-2560x1440', w: 2560, h: 1440 }
  ];
  for (const c of covers) {
    const scale = (c.h * 0.28) / 120;
    const coverSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" width="${c.w}" height="${c.h}">
  <defs>
    <linearGradient id="cGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07090E" />
      <stop offset="50%" stop-color="#0E121B" />
      <stop offset="100%" stop-color="#161C2B" />
    </linearGradient>
    <radialGradient id="cGlow" cx="80%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#EB1000" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#EB1000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#cGrad)" />
  <rect width="100%" height="100%" fill="url(#cGlow)" />
  <g transform="translate(${Math.round(c.w * 0.08)}, ${Math.round(c.h * 0.28)})">
    <g transform="scale(${scale})" fill="#FFFFFF">
      <path d="${ICON_CHEVRON_H120}" />
      <path d="${ICON_TRIANGLE_H120}" />
      <path d="${WORDMARK_H120}" />
    </g>
    <text x="0" y="${Math.round(c.h * 0.38)}" font-family="system-ui, sans-serif" font-size="${Math.round(c.h * 0.07)}" font-weight="500" fill="#94A3B8">
      Private, Instant Digital Utilities &amp; AI Tools • lutatech.com
    </text>
  </g>
</svg>`;
    await sharp(Buffer.from(coverSvg)).resize(c.w, c.h).png().toFile(path.join(BRAND_DIR, `social/covers/${c.name}.png`));
  }

  // Sharing Cards (OG 1200x630 & Twitter Card 1200x628)
  const ogCardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#07090E" />
      <stop offset="100%" stop-color="#111622" />
    </linearGradient>
    <linearGradient id="ogGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#EB1000" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#EB1000" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#ogGrad)" />
  <circle cx="1050" cy="150" r="350" fill="url(#ogGlow)" filter="blur(60px)" />
  <rect x="40" y="40" width="1120" height="550" rx="24" fill="#121620" fill-opacity="0.65" stroke="#2D3748" stroke-width="1.5" />
  <g transform="translate(80, 80) scale(1.1)" fill="#FFFFFF">
    <path d="${ICON_CHEVRON_H120}" />
    <path d="${ICON_TRIANGLE_H120}" />
    <path d="${WORDMARK_H120}" />
  </g>
  <text x="100" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="800" fill="#F8FAFC" letter-spacing="-1px">
    Fast, Private, Modern Digital Tools
  </text>
  <text x="100" y="405" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="400" fill="#94A3B8">
    Passport photo maker, AI background remover, PDF &amp; image utilities in your browser.
  </text>
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
  <text x="1080" y="500" text-anchor="end" font-family="system-ui, sans-serif" font-size="26" font-weight="700" fill="#EB1000">
    lutatech.com
  </text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'social/sharing/og-image.svg'), ogCardSvg, 'utf8');
  await sharp(Buffer.from(ogCardSvg)).resize(1200, 630).png().toFile(path.join(BRAND_DIR, 'social/sharing/og-image-1200x630.png'));
  await sharp(Buffer.from(ogCardSvg)).resize(1200, 628).png().toFile(path.join(BRAND_DIR, 'social/sharing/twitter-card-1200x628.png'));

  // 6. PATTERNS & BACKGROUNDS
  console.log('6️⃣ Building Patterns & Backgrounds...');
  const patternSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <pattern id="brandPattern" width="100" height="100" patternUnits="userSpaceOnUse">
      <g transform="translate(15, 15) scale(0.07)" fill="#EB1000">
        <path d="${ICON_CHEVRON_1000}" />
        <path d="${ICON_TRIANGLE_1000}" />
      </g>
      <g transform="translate(65, 65) scale(0.04)" fill="#94A3B8" opacity="0.3">
        <path d="${ICON_CHEVRON_1000}" />
        <path d="${ICON_TRIANGLE_1000}" />
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="#090B10" />
  <rect width="100%" height="100%" fill="url(#brandPattern)" />
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'patterns/pattern-geometric.svg'), patternSvg, 'utf8');
  await sharp(Buffer.from(patternSvg)).resize(1000, 1000).png().toFile(path.join(BRAND_DIR, 'patterns/pattern-geometric.png'));

  const bgGradientSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <radialGradient id="bgGlowCenter" cx="50%" cy="35%" r="60%">
      <stop offset="0%" stop-color="#EB1000" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#EB1000" stop-opacity="0.05" />
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
  fs.writeFileSync(path.join(BRAND_DIR, 'backgrounds/background-gradient-1080p.svg'), bgGradientSvg, 'utf8');
  await sharp(Buffer.from(bgGradientSvg)).resize(1920, 1080).png().toFile(path.join(BRAND_DIR, 'backgrounds/background-gradient-1080p.png'));

  // 7. ILLUSTRATIONS
  console.log('7️⃣ Building Status Illustrations...');
  const error404Svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400">
  <rect width="100%" height="100%" fill="#090B10" rx="16" />
  <circle cx="300" cy="180" r="140" fill="#121620" stroke="#232B3E" stroke-width="2" />
  <g transform="translate(260, 110) scale(0.08)" fill="#EB1000">
    <path d="${ICON_CHEVRON_1000}" />
    <path d="${ICON_TRIANGLE_1000}" />
  </g>
  <text x="300" y="270" text-anchor="middle" font-family="system-ui, sans-serif" font-size="72" font-weight="900" fill="#F8FAFC">
    404
  </text>
  <text x="300" y="315" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="600" fill="#94A3B8">
    Page Not Found
  </text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'illustrations/error-404.svg'), error404Svg, 'utf8');
  await sharp(Buffer.from(error404Svg)).resize(600, 400).png().toFile(path.join(BRAND_DIR, 'illustrations/error-404.png'));

  // 8. DESIGN TOKENS (Colors & Typography)
  console.log('8️⃣ Exporting Design Tokens (Colors & Typography)...');
  fs.writeFileSync(path.join(BRAND_DIR, 'colors/palette.json'), JSON.stringify(BRAND.colors, null, 2), 'utf8');
  const colorsCss = `:root {
  --brand-primary: ${BRAND.colors.primary};
  --brand-primary-dark: ${BRAND.colors.primaryDark};
  --brand-primary-light: ${BRAND.colors.primaryLight};
  --brand-dark-bg: ${BRAND.colors.darkBg};
  --brand-dark-surface: ${BRAND.colors.darkSurface};
  --brand-dark-border: ${BRAND.colors.darkBorder};
  --brand-dark-text: ${BRAND.colors.darkText};
  --brand-light-bg: ${BRAND.colors.lightBg};
  --brand-light-text: ${BRAND.colors.lightText};
}`;
  fs.writeFileSync(path.join(BRAND_DIR, 'colors/colors.css'), colorsCss, 'utf8');

  const typographyJson = {
    fontFamilyBrand: "'Poppins', system-ui, sans-serif",
    fontFamilySans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900
    },
    logoTracking: "-0.03em"
  };
  fs.writeFileSync(path.join(BRAND_DIR, 'typography/typography.json'), JSON.stringify(typographyJson, null, 2), 'utf8');

  // 9. PRINT & PRESENTATION ASSETS
  console.log('9️⃣ Building Print & Presentation Assets...');
  const cardFrontSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1050 600" width="1050" height="600">
  <rect width="100%" height="100%" fill="#090B10" />
  <g transform="translate(100, 180) scale(1.4)" fill="#FFFFFF">
    <path d="${ICON_CHEVRON_H120}" />
    <path d="${ICON_TRIANGLE_H120}" />
    <path d="${WORDMARK_H120}" />
  </g>
  <text x="100" y="440" font-family="system-ui, sans-serif" font-size="22" font-weight="600" fill="#94A3B8" letter-spacing="4px">
    DIGITAL TOOLS PLATFORM
  </text>
  <line x1="100" y1="490" x2="950" y2="490" stroke="#232B3E" stroke-width="1.5" />
  <text x="100" y="535" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#EB1000">
    lutatech.com
  </text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'print/business-card-front.svg'), cardFrontSvg, 'utf8');
  await sharp(Buffer.from(cardFrontSvg)).resize(1050, 600).png().toFile(path.join(BRAND_DIR, 'print/business-card-front.png'));

  // 9b. PRESENTATION SLIDES
  console.log('9️⃣b Building Presentation Slide Templates...');
  const titleSlideSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <radialGradient id="slideGlow" cx="85%" cy="25%" r="55%">
      <stop offset="0%" stop-color="#EB1000" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#EB1000" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#090B10" />
  <rect width="100%" height="100%" fill="url(#slideGlow)" />
  <g transform="translate(160, 240) scale(1.6)" fill="#FFFFFF">
    <path d="${ICON_CHEVRON_H120}" />
    <path d="${ICON_TRIANGLE_H120}" />
    <path d="${WORDMARK_H120}" />
  </g>
  <text x="160" y="560" font-family="system-ui, sans-serif" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="-1px">
    Product Architecture &amp; Brand System
  </text>
  <text x="160" y="640" font-family="system-ui, sans-serif" font-size="32" font-weight="400" fill="#94A3B8">
    High-Performance, Private Browser Utilities &amp; AI Platform
  </text>
  <line x1="160" y1="920" x2="1760" y2="920" stroke="#232B3E" stroke-width="2" />
  <text x="160" y="970" font-family="system-ui, sans-serif" font-size="24" font-weight="700" fill="#EB1000">
    lutatech.com
  </text>
  <text x="1760" y="970" text-anchor="end" font-family="system-ui, sans-serif" font-size="20" font-weight="500" fill="#64748B">
    Confidential • LutaTech Platform
  </text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'presentations/slide-title-1920x1080.svg'), titleSlideSvg, 'utf8');
  await sharp(Buffer.from(titleSlideSvg)).resize(1920, 1080).png().toFile(path.join(BRAND_DIR, 'presentations/slide-title-1920x1080.png'));

  const contentSlideSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <rect width="100%" height="100%" fill="#090B10" />
  <g transform="translate(120, 80) scale(0.65)" fill="#FFFFFF">
    <path d="${ICON_CHEVRON_H120}" />
    <path d="${ICON_TRIANGLE_H120}" />
    <path d="${WORDMARK_H120}" />
  </g>
  <line x1="120" y1="180" x2="1800" y2="180" stroke="#232B3E" stroke-width="2" />
  <text x="120" y="270" font-family="system-ui, sans-serif" font-size="48" font-weight="800" fill="#FFFFFF">
    Key Platform Capabilities
  </text>
  <rect x="120" y="340" width="500" height="520" rx="16" fill="#121620" stroke="#232B3E" stroke-width="1.5" />
  <rect x="160" y="380" width="60" height="60" rx="12" fill="#EB1000" fill-opacity="0.15" />
  <g transform="translate(170, 390) scale(0.04)" fill="#EB1000">
    <path d="${ICON_CHEVRON_1000}" />
    <path d="${ICON_TRIANGLE_1000}" />
  </g>
  <text x="160" y="490" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">100% Client-Side</text>
  <text x="160" y="535" font-family="system-ui, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Zero file uploads to third party servers. Complete privacy guaranteed.</text>

  <rect x="660" y="340" width="500" height="520" rx="16" fill="#121620" stroke="#232B3E" stroke-width="1.5" />
  <rect x="700" y="380" width="60" height="60" rx="12" fill="#3B82F6" fill-opacity="0.15" />
  <text x="700" y="490" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">WASM &amp; AI Models</text>
  <text x="700" y="535" font-family="system-ui, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">High-speed WebAssembly processing with instant neural network inference.</text>

  <rect x="1200" y="340" width="500" height="520" rx="16" fill="#121620" stroke="#232B3E" stroke-width="1.5" />
  <rect x="1240" y="380" width="60" height="60" rx="12" fill="#10B981" fill-opacity="0.15" />
  <text x="1240" y="490" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">Instant Utilities</text>
  <text x="1240" y="535" font-family="system-ui, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">Converters, passport photo cropper, SVG optimizers, and PDF tools.</text>

  <line x1="120" y1="960" x2="1800" y2="960" stroke="#232B3E" stroke-width="1" />
  <text x="120" y="1000" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#EB1000">lutatech.com</text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'presentations/slide-content-1920x1080.svg'), contentSlideSvg, 'utf8');
  await sharp(Buffer.from(contentSlideSvg)).resize(1920, 1080).png().toFile(path.join(BRAND_DIR, 'presentations/slide-content-1920x1080.png'));

  // 9c. SCREENSHOTS & MOCKUP PREVIEWS
  console.log('9️⃣c Building Screenshots & Mockups...');
  const desktopMockupSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="1" y2="1">
      <stop offset="0%" stop-color="#07090E" />
      <stop offset="100%" stop-color="#141926" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bgGrad)" />
  <rect x="160" y="80" width="1600" height="920" rx="20" fill="#090B10" stroke="#232B3E" stroke-width="3" />
  <rect x="160" y="80" width="1600" height="70" rx="20" fill="#121620" />
  <circle cx="210" cy="115" r="8" fill="#EF4444" />
  <circle cx="235" cy="115" r="8" fill="#F59E0B" />
  <circle cx="260" cy="115" r="8" fill="#10B981" />
  <rect x="560" y="98" width="800" height="34" rx="8" fill="#1E293B" />
  <text x="960" y="121" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#94A3B8">https://lutatech.com</text>
  <g transform="translate(240, 200) scale(0.8)" fill="#FFFFFF">
    <path d="${ICON_CHEVRON_H120}" />
    <path d="${ICON_TRIANGLE_H120}" />
    <path d="${WORDMARK_H120}" />
  </g>
  <text x="240" y="370" font-family="system-ui, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF">Universal Digital Utilities Platform</text>
  <text x="240" y="420" font-family="system-ui, sans-serif" font-size="22" fill="#94A3B8">Fast, private, in-browser utilities powered by client-side intelligence.</text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'screenshots/platform-desktop-mockup-1920x1080.svg'), desktopMockupSvg, 'utf8');
  await sharp(Buffer.from(desktopMockupSvg)).resize(1920, 1080).png().toFile(path.join(BRAND_DIR, 'screenshots/platform-desktop-mockup-1920x1080.png'));

  // 9d. PRINT LETTERHEAD & STICKER
  console.log('9️⃣d Building Print Assets (Letterhead & Stickers)...');
  const letterheadSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1754" width="1240" height="1754">
  <rect width="100%" height="100%" fill="#FFFFFF" />
  <g transform="translate(120, 120) scale(1.0)" fill="#EB1000">
    <path d="${ICON_CHEVRON_H120}" />
    <path d="${ICON_TRIANGLE_H120}" />
    <path d="${WORDMARK_H120}" />
  </g>
  <line x1="120" y1="260" x2="1120" y2="260" stroke="#E2E8F0" stroke-width="2" />
  <line x1="120" y1="1600" x2="1120" y2="1600" stroke="#E2E8F0" stroke-width="2" />
  <text x="120" y="1650" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#64748B">
    LutaTech Digital Tools Platform • contact@lutatech.com • https://lutatech.com
  </text>
</svg>`;
  fs.writeFileSync(path.join(BRAND_DIR, 'print/letterhead-a4.svg'), letterheadSvg, 'utf8');
  await sharp(Buffer.from(letterheadSvg)).resize(1240, 1754).png().toFile(path.join(BRAND_DIR, 'print/letterhead-a4.png'));

  const stickerSvg = getIconSvg({ fill: BRAND.colors.monoWhite, bg: BRAND.colors.primary, rx: 500 });
  fs.writeFileSync(path.join(BRAND_DIR, 'print/brand-sticker-round.svg'), stickerSvg, 'utf8');
  await sharp(Buffer.from(stickerSvg)).resize(1024, 1024).png().toFile(path.join(BRAND_DIR, 'print/brand-sticker-round.png'));

  // Copy favicon.ico if exists in frontend/public
  const publicFavicon = path.join(FRONTEND_PUBLIC_DIR, 'favicon.ico');
  if (fs.existsSync(publicFavicon)) {
    fs.copyFileSync(publicFavicon, path.join(BRAND_DIR, 'favicon/favicon.ico'));
  }

  // 10. BRAND GUIDELINES & MANIFEST
  console.log('🔟 Writing Brand Guidelines & Manifest...');
  const guidelinesMd = `# LutaTech Universal Brand Identity Specification

## Overview
LutaTech delivers high-speed, private, browser-based digital utilities (image converters, AI background removers, passport photo makers, PDF utilities). The visual identity conveys precision, high performance, authority, and modern minimalism.

---

## 1. Master Brand Typography
- **Wordmark Typeface**: **Poppins 900** (Black / Ultra-Bold Geometric Sans-serif).
- **Geometry**:
  - Pure circular bowls for \`a\`, \`e\`, and \`c\`.
  - Exact stem thickness: \`17.43px\` matching the \`L\` and \`T\` vertical bars.
  - Baseline: Aligned at \`y = 86\`.
  - Cap-Height: \`55.61px\` (from \`y = 30.39\` to \`y = 86\`).
- **Heading Typeface**: Inter / Poppins Bold.
- **Body & UI Typeface**: Inter (400, 500, 600).

---

## 2. Master Icon Geometry (The Flat-Top Chevron)
- **Top Bar**: Flat horizontal bar (\`x = 50\` to \`x = 70\` at \`y = 30.39\`). **Zero sharp anchor corner**.
- **Footprint**: \`64px\` width (from \`x = 28\` to \`x = 92\`).
- **Height**: Strictly uniform with the cap-height of the wordmark (\`55.61px\`).
- **Thickness**: \`17.43px\`, matching the wordmark stems exactly.
- **Center Element**: Grounded geometric triangle (\`M 60 68 L 71 86 L 49 86 Z\`).

---

## 3. Brand Color System
| Token | Hex | Role |
| :--- | :--- | :--- |
| **Primary Brand Red** | \`#EB1000\` | Light theme logo, active states, key accents (Adobe-style Red) |
| **Pure White** | \`#FFFFFF\` | Dark theme logo, text, high-contrast dark surfaces |
| **Obsidian Black** | \`#090B10\` | Primary dark theme background |
| **Dark Surface** | \`#121620\` | Card backgrounds, navigation bars |
| **Dark Border** | \`#232B3E\` | Subtle borders and dividers |
| **Text Muted** | \`#94A3B8\` | Secondary descriptions, captions |

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
\`\`\`
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
\`\`\`
`;
  fs.writeFileSync(path.join(BRAND_DIR, 'brand-guidelines/BRAND_GUIDELINES.md'), guidelinesMd, 'utf8');
  fs.writeFileSync(path.join(BRAND_DIR, 'README.md'), guidelinesMd, 'utf8');

  // Copy everything into brand-assets/ as well for total compatibility
  console.log('🔁 Mirroring to brand-assets/ ...');
  function copyRecursive(src, dest) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
      if (item === 'lutatech-brand-package.zip') continue;
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      if (fs.statSync(srcPath).isDirectory()) {
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
  copyRecursive(BRAND_DIR, BRAND_ASSETS_DIR);

  // Synchronize master logos and favicons to frontend/public/
  console.log('🌐 Syncing live web assets to frontend/public/...');
  fs.copyFileSync(path.join(BRAND_DIR, 'favicon/favicon.svg'), path.join(FRONTEND_PUBLIC_DIR, 'favicon.svg'));
  fs.copyFileSync(path.join(BRAND_DIR, 'favicon/apple-touch-icon.png'), path.join(FRONTEND_PUBLIC_DIR, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(BRAND_DIR, 'app-icon/web/icon-192.png'), path.join(FRONTEND_PUBLIC_DIR, 'android-chrome-192x192.png'));
  fs.copyFileSync(path.join(BRAND_DIR, 'app-icon/web/icon-512.png'), path.join(FRONTEND_PUBLIC_DIR, 'android-chrome-512x512.png'));
  fs.copyFileSync(path.join(BRAND_DIR, 'social/sharing/og-image-1200x630.png'), path.join(FRONTEND_PUBLIC_DIR, 'og-image.png'));
  fs.copyFileSync(path.join(BRAND_DIR, 'logo/horizontal/lutatech-logo-horizontal-red.svg'), path.join(FRONTEND_PUBLIC_DIR, 'logo-light.svg'));
  fs.copyFileSync(path.join(BRAND_DIR, 'logo/horizontal/lutatech-logo-horizontal-white.svg'), path.join(FRONTEND_PUBLIC_DIR, 'logo-dark.svg'));

  console.log('✨ Master brand generation complete!');
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
