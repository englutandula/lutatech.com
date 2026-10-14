import { NextRequest, NextResponse } from 'next/server';

const FILE_MAP: Record<string, string> = {
  'windows-msi': 'LutaPDF-windows-x64.msi',
  'windows-zip': 'LutaPDF-windows-x64-portable.zip',
  'macos-dmg': 'LutaPDF-macos-universal.dmg',
  'macos-cli': 'LutaPDF-cli-macos-universal.zip',
  'linux-deb': 'LutaPDF-linux-x86_64.deb',
  'linux-rpm': 'LutaPDF-linux-x86_64.rpm',
  'linux-tar': 'LutaPDF-linux-x86_64.tar.gz',
  'linux-cli': 'LutaPDF-cli-linux-x86_64.tar.gz',
  'sha256': 'SHA256SUMS.txt',
};

const OS_DEFAULT: Record<string, string> = {
  windows: 'LutaPDF-windows-x64.msi',
  macos: 'LutaPDF-macos-universal.dmg',
  linux: 'LutaPDF-linux-x86_64.deb',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const os = searchParams.get('os')?.toLowerCase();
  const fileKey = searchParams.get('file')?.toLowerCase();

  let targetFileName = 'LutaPDF-macos-universal.dmg';

  if (fileKey && FILE_MAP[fileKey]) {
    targetFileName = FILE_MAP[fileKey];
  } else if (os && OS_DEFAULT[os]) {
    targetFileName = OS_DEFAULT[os];
  } else if (fileKey) {
    targetFileName = fileKey;
  }

  const downloadUrl = `https://github.com/englutandula/LutaPDF-releases/releases/latest/download/${targetFileName}`;

  return NextResponse.redirect(downloadUrl, {
    status: 307,
    headers: {
      'Content-Disposition': `attachment; filename="${targetFileName}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
