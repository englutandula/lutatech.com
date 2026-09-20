/**
 * Master Favicon & App Icon Builder
 * Updates all favicon and app-icon instances across frontend/app, frontend/public,
 * and brand directories with the flat-top icon and Adobe Red #EB1000.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('../frontend/node_modules/sharp');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_APP_DIR = path.join(ROOT_DIR, 'frontend', 'app');
const FRONTEND_PUBLIC_DIR = path.join(ROOT_DIR, 'frontend', 'public');
const BRAND_FAVICON_DIR = path.join(ROOT_DIR, 'brand', 'favicon');
const BRAND_ASSETS_FAVICON_DIR = path.join(ROOT_DIR, 'brand-assets', '02-favicon');

// Mathematical master flat-top geometry (1000x1000 space)
const ICON_CHEVRON = 'M 344 0 L 656 0 L 1000 1000 L 728 1000 L 586 297 L 414 297 L 272 1000 L 0 1000 Z';
const ICON_TRIANGLE = 'M 500 676 L 672 1000 L 328 1000 Z';
const BRAND_RED = '#EB1000';
const DARK_BG = '#090B10';

// Favicon SVG - crisp scaling (84% fill, centered)
const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <g transform="translate(80, 80) scale(0.84)" fill="${BRAND_RED}">
    <path d="${ICON_CHEVRON}" />
    <path d="${ICON_TRIANGLE}" />
  </g>
</svg>`;

// Apple Touch & Squircle badge SVG
const badgeSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="100%" height="100%">
  <rect width="1000" height="1000" rx="220" fill="${DARK_BG}" />
  <g transform="translate(200, 200) scale(0.60)" fill="${BRAND_RED}">
    <path d="${ICON_CHEVRON}" />
    <path d="${ICON_TRIANGLE}" />
  </g>
</svg>`;

// Standard ICO file generator from PNG buffers
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + (count * dirEntrySize);
  
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // ICO type 1
  header.writeUInt16LE(count, 4); // count
  
  const entries = [];
  for (const img of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(img.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += img.buffer.length;
  }
  
  return Buffer.concat([header, ...entries, ...pngBuffers.map(img => img.buffer)]);
}

async function main() {
  console.log('🚀 Generating brand new flat-top favicons and app icons...');

  // Ensure directories exist
  [FRONTEND_APP_DIR, FRONTEND_PUBLIC_DIR, BRAND_FAVICON_DIR, BRAND_ASSETS_FAVICON_DIR].forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });

  const svgBuffer = Buffer.from(faviconSvg);
  const badgeBuffer = Buffer.from(badgeSvg);

  // 1. Generate individual PNG resolutions
  const p16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const p32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const p48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();
  const p64 = await sharp(svgBuffer).resize(64, 64).png().toBuffer();
  const p128 = await sharp(svgBuffer).resize(128, 128).png().toBuffer();
  const p192 = await sharp(svgBuffer).resize(192, 192).png().toBuffer();
  const p512 = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
  const apple180 = await sharp(badgeBuffer).resize(180, 180).png().toBuffer();
  const badge192 = await sharp(badgeBuffer).resize(192, 192).png().toBuffer();
  const badge512 = await sharp(badgeBuffer).resize(512, 512).png().toBuffer();

  // 2. Generate multi-resolution ICO file (16, 32, 48)
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: p16 },
    { width: 32, height: 32, buffer: p32 },
    { width: 48, height: 48, buffer: p48 }
  ]);

  console.log('📝 Writing to frontend/app/...');
  fs.writeFileSync(path.join(FRONTEND_APP_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(FRONTEND_APP_DIR, 'icon.png'), p192);
  fs.writeFileSync(path.join(FRONTEND_APP_DIR, 'apple-icon.png'), apple180);

  console.log('📝 Writing to frontend/public/...');
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'favicon.svg'), faviconSvg, 'utf8');
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'favicon-16x16.png'), p16);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'favicon-32x32.png'), p32);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'favicon-48x48.png'), p48);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'apple-touch-icon.png'), apple180);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'android-chrome-192x192.png'), badge192);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'android-chrome-512x512.png'), badge512);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'icon-192.png'), badge192);
  fs.writeFileSync(path.join(FRONTEND_PUBLIC_DIR, 'icon-512.png'), badge512);

  console.log('📝 Writing to brand/favicon/ and brand-assets/02-favicon/...');
  [BRAND_FAVICON_DIR, BRAND_ASSETS_FAVICON_DIR].forEach(dir => {
    fs.writeFileSync(path.join(dir, 'favicon.ico'), icoBuffer);
    fs.writeFileSync(path.join(dir, 'favicon.svg'), faviconSvg, 'utf8');
    fs.writeFileSync(path.join(dir, 'favicon-16x16.png'), p16);
    fs.writeFileSync(path.join(dir, 'favicon-32x32.png'), p32);
    fs.writeFileSync(path.join(dir, 'favicon-48x48.png'), p48);
    fs.writeFileSync(path.join(dir, 'favicon-64x64.png'), p64);
    fs.writeFileSync(path.join(dir, 'favicon-128x128.png'), p128);
    fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), apple180);
  });

  console.log('✅ Favicon build successful!');
}

main().catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
