import React from 'react';
import ImagesToPdfTool from '@/components/ImagesToPdfTool';
import ToolPageShell from '@/components/ToolPageShell';
import { getTool } from '@/lib/tools';

export const metadata = {
  title: 'Images to PDF | Luta Tech',
  description: 'Convert JPG, PNG, and WebP images into a single PDF. 100% private, free, and in-browser.',
};

export default function ImagesToPdfPage() {
  const tool = getTool('images-to-pdf')!;
  return (
    <ToolPageShell tool={tool}>
      <ImagesToPdfTool
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        formatLabel="JPG / PNG / WebP"
      />
    </ToolPageShell>
  );
}
